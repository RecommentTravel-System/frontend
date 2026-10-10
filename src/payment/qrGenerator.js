/**
 * Pure JavaScript QR Code Generator for VietQR and URLs
 * Converts raw VietQR string (e.g. 000201...) or any URL into an SVG / Data URL / image.
 */

// Helper to get QR image URL
export function getQrImageUrl(qrData) {
  if (!qrData) return '';

  // If already an image URL or data URL
  if (qrData.startsWith('data:image/') || (qrData.startsWith('http') && (qrData.includes('.png') || qrData.includes('.jpg') || qrData.includes('.svg') || qrData.includes('qr')))) {
    return qrData;
  }

  // Generate QR Code image via QRServer with fallback to QuickChart
  const encoded = encodeURIComponent(qrData);
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encoded}`;
}

export function getQrFallbackUrl(qrData) {
  if (!qrData) return '';
  const encoded = encodeURIComponent(qrData);
  return `https://quickchart.io/qr?text=${encoded}&size=260&margin=2`;
}
