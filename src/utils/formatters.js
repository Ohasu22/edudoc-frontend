export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const diffInHours = Math.floor((now - d) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInHours < 48) return '1 day ago';
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
  return d.toLocaleDateString();
}

export function getFileIcon(type) {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('pdf')) return 'fas fa-file-pdf text-danger file-icon';
  if (lowerType.includes('word') || lowerType.includes('doc')) return 'fas fa-file-word text-primary file-icon';
  if (lowerType.includes('excel') || lowerType.includes('spreadsheet')) return 'fas fa-file-excel text-success file-icon';
  if (lowerType.includes('powerpoint') || lowerType.includes('presentation')) return 'fas fa-file-powerpoint text-warning file-icon';
  if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg')) return 'fas fa-file-image text-info file-icon';
  if (lowerType.includes('video')) return 'fas fa-file-video text-purple file-icon';
  if (lowerType.includes('audio')) return 'fas fa-file-audio text-dark file-icon';
  if (lowerType.includes('zip') || lowerType.includes('rar')) return 'fas fa-file-archive text-secondary file-icon';
  if (lowerType.includes('text') || lowerType.includes('txt')) return 'fas fa-file-alt text-muted file-icon';
  return 'fas fa-file text-muted file-icon';
}
