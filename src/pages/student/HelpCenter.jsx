import { useState } from 'react';

const FAQS = [
  {
    question: '¿Cómo reportar un nuevo incidente?',
    answer: 'Para reportar un nuevo incidente, dirígete al Dashboard (Panel de Incidentes) y haz clic en el botón "+ Nuevo Reporte" en la esquina superior derecha. Completa el formulario seleccionando la categoría, ingresando una descripción detallada, subiendo una fotografía del incidente e indicando la ubicación. Opcionalmente, puedes adjuntar las coordenadas GPS.'
  },
  {
    question: '¿Qué significan los estados de mis reportes?',
    answer: 'Tus reportes pueden tener tres estados: 1) "Reportado" cuando ha sido enviado y está en cola de revisión, 2) "En Proceso" cuando ha sido asignado al equipo técnico y se está trabajando en su solución, y 3) "Resuelto" una vez que el problema ha sido subsanado por completo.'
  },
  {
    question: '¿Cuánto tiempo toma solucionar un reporte?',
    answer: 'El tiempo de resolución depende de la complejidad de la falla y la categoría. Por ejemplo, fallas de conectividad de red y problemas eléctricos urgentes suelen priorizarse dentro de las primeras 24 horas, mientras que reparaciones de infraestructura mayores pueden tomar algunos días adicionales.'
  },
  {
    question: '¿Cómo puedo descargar el PDF de un reporte?',
    answer: 'Haz clic sobre el incidente del cual deseas obtener el reporte en el Dashboard. Se abrirá la ficha de detalles. En la esquina inferior derecha encontrarás el botón "Descargar PDF". Al hacer clic, se abrirá el diálogo de impresión optimizado para guardar el reporte como documento PDF.'
  },
  {
    question: '¿Quién puede ver mis reportes?',
    answer: 'Tus reportes son visibles para ti (el estudiante creador) y para el equipo de administración y mantenimiento de la universidad. Toda la información se maneja con confidencialidad y con el único fin de mejorar las instalaciones del campus.'
  }
];

export default function HelpCenter() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="px-4 md:px-8 lg:pr-20 pb-8 md:pb-20 mt-4 md:mt-8 max-w-container-max mx-auto">
      <div className="glass-panel rounded-xl p-6 md:p-8 shadow-glow space-y-8">
        <div>
          <h2 className="font-headline-md text-2xl text-on-surface mb-2 font-bold">Centro de Ayuda</h2>
          <p className="font-body-md text-sm text-on-surface-variant">Encuentra respuestas a las preguntas más frecuentes sobre el uso de la plataforma de reportes.</p>
        </div>

        {/* FAQs list */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="border border-outline-variant/30 rounded-xl bg-surface-container-lowest/50 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-5 text-left font-semibold text-on-surface hover:bg-surface-variant/20 transition-colors"
                >
                  <span className="font-medium text-sm md:text-base">{faq.question}</span>
                  <span className={`material-symbols-outlined transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-on-surface-variant'}`}>
                    expand_more
                  </span>
                </button>
                
                {isOpen && (
                  <div className="p-5 pt-0 text-on-surface-variant text-sm font-body-md border-t border-outline-variant/10 bg-surface-container-lowest/30 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact support fallback */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8">
          <div>
            <h4 className="font-semibold text-on-surface text-base">¿No encontraste lo que buscabas?</h4>
            <p className="text-sm text-on-surface-variant">Nuestro equipo de soporte técnico está disponible para ayudarte en cualquier momento.</p>
          </div>
          <a 
            href="mailto:soporte@uniamazonia.edu.co" 
            className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-fixed hover:text-on-primary-fixed transition-all duration-300 text-center shadow-md shrink-0 active:scale-95"
          >
            Contactar Soporte
          </a>
        </div>
      </div>
    </div>
  );
}
