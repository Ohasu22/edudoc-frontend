export function getFileIcon(type) {
  const lower = type.toLowerCase();
  if (lower.includes('pdf')) return 'fas fa-file-pdf text-danger file-icon';
  if (lower.includes('word') || lower.includes('doc')) return 'fas fa-file-word text-primary file-icon';
  if (lower.includes('excel') || lower.includes('spreadsheet')) return 'fas fa-file-excel text-success file-icon';
  if (lower.includes('powerpoint') || lower.includes('presentation')) return 'fas fa-file-powerpoint text-warning file-icon';
  if (lower.includes('image') || lower.includes('png') || lower.includes('jpg')) return 'fas fa-file-image text-info file-icon';
  if (lower.includes('video')) return 'fas fa-file-video text-purple file-icon';
  if (lower.includes('audio')) return 'fas fa-file-audio text-dark file-icon';
  if (lower.includes('zip') || lower.includes('rar')) return 'fas fa-file-archive text-secondary file-icon';
  if (lower.includes('text') || lower.includes('txt')) return 'fas fa-file-alt text-muted file-icon';
  return 'fas fa-file text-muted file-icon';
}
