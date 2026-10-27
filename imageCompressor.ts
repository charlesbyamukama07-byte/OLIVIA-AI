/**
 * Downscale image if larger than maxDimension, keeping aspect ratio.
 * Converts to JPEG at 0.88 quality to ensure fast transfer while maintaining crisp SMC candle details.
 */
export async function optimizeChartImage(dataUrl: string, maxDimension = 1600): Promise<string> {
  if (typeof window === 'undefined' || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  // If already SVG or tiny, no need to touch
  if (dataUrl.startsWith('data:image/svg+xml') || dataUrl.length < 150000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width <= maxDimension && height <= maxDimension && dataUrl.length < 800000) {
        resolve(dataUrl);
        return;
      }

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const optimizedUrl = canvas.toDataURL('image/jpeg', 0.88);
      resolve(optimizedUrl);
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
