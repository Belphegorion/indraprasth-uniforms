/**
 * Cloudinary image transformation helper.
 * Applies automatic WebP/AVIF format selection (f_auto), perceptual quality compression (q_auto),
 * and responsive width scaling (w_{width}) to optimize Core Web Vitals and Lighthouse performance.
 */
export const getOptimizedImageUrl = (
  url?: string,
  options: { width?: number; quality?: string } = {}
): string => {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;

  const width = options.width || 600;

  // Don't duplicate if already transformed
  if (url.includes('/image/upload/f_auto')) {
    return url;
  }

  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`);
};
