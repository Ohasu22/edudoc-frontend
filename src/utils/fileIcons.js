/**
 * Returns an appropriate Font Awesome class string based on the MIME type or file extension.
 *
 * @param {string} type - The MIME type or file extension of the file.
 * @returns {string} Font Awesome class for the file icon.
 */
export function getFileIcon(type) {
  // Defensive: Handle undefined or null input safely
  const lower = (type || '').toLowerCase();

  if (lower.includes('pdf')) return 'fas fa-file-pdf text-danger file-icon';
  if (lower.includes('word') || lower.includes('doc') || lower.includes('.docx')) return 'fas fa-file-word text-primary file-icon';
  if (lower.includes('excel') || lower.includes('spreadsheet') || lower.includes('.xls')) return 'fas fa-file-excel text-success file-icon';
  if (lower.includes('powerpoint') || lower.includes('presentation') || lower.includes('.ppt')) return 'fas fa-file-powerpoint text-warning file-icon';
  if (lower.includes('image') || lower.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/)) return 'fas fa-file-image text-info file-icon';
  if (lower.includes('video') || lower.match(/\.(mp4|avi|mov|mkv)$/)) return 'fas fa-file-video text-purple file-icon';
  if (lower.includes('audio') || lower.match(/\.(mp3|wav|ogg)$/)) return 'fas fa-file-audio text-dark file-icon';
  if (lower.includes('zip') || lower.includes('rar') || lower.includes('.7z')) return 'fas fa-file-archive text-secondary file-icon';
  if (lower.includes('text') || lower.includes('txt')) return 'fas fa-file-alt text-muted file-icon';

  // Default icon
  return 'fas fa-file text-muted file-icon';
}
