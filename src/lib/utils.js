export function formatearID(id) {
  if (!id) return '';
  // Simple ticket-like formatting: prefix with # and show first 8 characters
  return `#${id.slice(0, 8)}`;
}
