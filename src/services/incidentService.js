import { supabase } from '../lib/supabase';

// Helper to convert base64 data URL to Blob
function base64ToBlob(base64, mime) {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
}

export async function fetchIncidentes() {
  const { data, error } = await supabase
    .from('incidentes')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('Error fetching incidentes from Supabase:', error);
    throw error;
  }

  // Load grouping metadata from localStorage
  const localGroups = JSON.parse(localStorage.getItem('incidentes_grupos')) || {};

  return data.map((item) => {
    const lat = item.latitud;
    const lng = item.longitud;
    const coordinates = (lat !== null && lng !== null) ? `${lat}, ${lng}` : 'No adjuntas';

    // Build timeline/historial dynamically based on state
    const historial = [
      {
        estado: 'Reportado',
        fecha: item.fecha_creacion,
        actor: 'Estudiante'
      }
    ];

    if (item.estado === 'En proceso' || item.estado === 'Resuelto') {
      historial.push({
        estado: 'En proceso',
        fecha: item.fecha_creacion,
        actor: 'Administrador'
      });
    }

    if (item.estado === 'Resuelto') {
      historial.push({
        estado: 'Resuelto',
        fecha: item.fecha_creacion,
        actor: 'Administrador'
      });
    }

    // Format date in Spanish locale (DD/MM/YYYY)
    let formattedDate = 'Hoy';
    if (item.fecha_creacion) {
      try {
        const d = new Date(item.fecha_creacion);
        formattedDate = d.toLocaleDateString('es-ES');
      } catch (e) {
        console.error(e);
      }
    }

    const title = item.descripcion ? item.descripcion.split('. ')[0].substring(0, 50) : 'Nuevo incidente';

    return {
      id: item.id,
      title: title || 'Nuevo incidente',
      category: item.tipo || 'Infraestructura',
      categoryIcon: item.tipo === 'Electricidad' ? 'bolt' : item.tipo === 'Plomería' ? 'water_drop' : 'construction',
      status: item.estado || 'Reportado',
      estado: item.estado || 'Reportado',
      date: formattedDate,
      fecha: formattedDate,
      location: item.ubicacion || 'Ubicación no especificada',
      coordinates: coordinates,
      description: item.descripcion || '',
      image: item.imagen_url || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=600&auto=format&fit=crop',
      historial: historial,
      groupId: localGroups[item.id]?.groupId || null,
      grupoId: localGroups[item.id]?.groupId || null,
      groupName: localGroups[item.id]?.groupName || null,
      grupoNombre: localGroups[item.id]?.groupName || null,
      usuario_id: item.usuario_id
    };
  });
}

export async function uploadEvidencia(fileOrBase64, fileName) {
  if (!fileOrBase64) return null;

  let fileToUpload = fileOrBase64;
  let contentType = 'image/jpeg';

  if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
    const mimeMatch = fileOrBase64.match(/data:([^;]+);/);
    if (mimeMatch) contentType = mimeMatch[1];
    fileToUpload = base64ToBlob(fileOrBase64, contentType);
  }

  const fileExt = fileName ? (fileName.split('.').pop() || 'jpg') : 'jpg';
  const path = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('evidencias')
    .upload(path, fileToUpload, {
      contentType,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image to Supabase Storage:', error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('evidencias')
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}

export async function crearIncidente(datos) {
  let latitud = null;
  let longitud = null;
  if (datos.coordinates && datos.coordinates !== 'No adjuntas') {
    const parts = datos.coordinates.split(',');
    if (parts.length === 2) {
      latitud = parseFloat(parts[0].trim()) || null;
      longitud = parseFloat(parts[1].trim()) || null;
    }
  }

  const { data, error } = await supabase
    .from('incidentes')
    .insert({
      usuario_id: datos.usuario_id || 'estudiante_anonimo',
      tipo: datos.category || 'Infraestructura',
      descripcion: datos.description || '',
      imagen_url: datos.image || null,
      ubicacion: datos.location || 'Ubicación no especificada',
      latitud: latitud,
      longitud: longitud,
      estado: 'Reportado'
    })
    .select();

  if (error) {
    console.error('Error inserting incident into Supabase:', error);
    throw error;
  }

  return data[0];
}

export async function actualizarEstado(id, nuevoEstado) {
  const { data, error } = await supabase
    .from('incidentes')
    .update({ estado: nuevoEstado })
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating incident state for ${id}:`, error);
    throw error;
  }

  return data[0];
}

export async function eliminarIncidente(id) {
  const { data, error } = await supabase
    .from('incidentes')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error deleting incident ${id} from Supabase:`, error);
    throw error;
  }

  // Limpiar metadatos de grupos en localStorage si existen
  try {
    const localGroups = JSON.parse(localStorage.getItem('incidentes_grupos')) || {};
    if (localGroups[id]) {
      delete localGroups[id];
      localStorage.setItem('incidentes_grupos', JSON.stringify(localGroups));
    }
  } catch (e) {
    console.error('Error cleaning up local groups on delete:', e);
  }

  return data ? data[0] : null;
}

export async function obtenerNotificaciones(rol, usuario_id) {
  let query = supabase.from('incidentes').select('*');

  if (rol === 'admin') {
    query = query
      .eq('estado', 'Reportado')
      .order('fecha_creacion', { ascending: false })
      .limit(5);
  } else {
    query = query
      .eq('usuario_id', usuario_id || '')
      .neq('estado', 'Reportado')
      .order('fecha_creacion', { ascending: false })
      .limit(5);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications from Supabase:', error);
    throw error;
  }

  return (data || []).map((item) => {
    if (rol === 'admin') {
      return {
        id: item.id,
        titulo: 'Nuevo Incidente',
        title: 'Nuevo Incidente',
        mensaje: 'Se ha reportado un problema de ' + (item.tipo || 'Infraestructura'),
        message: 'Se ha reportado un problema de ' + (item.tipo || 'Infraestructura'),
        fecha: item.fecha_creacion,
        leido: false,
        leida: false
      };
    } else {
      return {
        id: item.id,
        titulo: 'Actualización de Estado',
        title: 'Actualización de Estado',
        mensaje: 'Tu reporte de ' + (item.tipo || 'Infraestructura') + ' ahora está ' + (item.estado || 'Reportado'),
        message: 'Tu reporte de ' + (item.tipo || 'Infraestructura') + ' ahora está ' + (item.estado || 'Reportado'),
        fecha: item.fecha_creacion,
        leido: false,
        leida: false
      };
    }
  });
}

