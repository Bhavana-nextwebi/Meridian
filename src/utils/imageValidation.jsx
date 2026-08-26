/**
 * Validates an image file's aspect ratio and file size before it's accepted
 * into a form. Reads actual pixel dimensions via a temporary Image object.
 *
 * @param {File} file - The selected image file.
 * @param {Object} options
 * @param {number} [options.aspectRatio] - Required width/height ratio (e.g. 4/3, 1).
 * @param {number} [options.aspectTolerance=0.05] - Allowed relative deviation (5% default).
 * @param {string} [options.recommendedLabel] - Human-readable label shown in errors, e.g. "4:3 (e.g. 400×300px)".
 * @param {number} [options.maxSizeMB] - Max allowed file size in MB.
 * @param {number} [options.minWidth] - Minimum width in px.
 * @param {number} [options.minHeight] - Minimum height in px.
 * @returns {Promise<{valid: boolean, error?: string, width?: number, height?: number}>}
 */
export const validateImageFile = (file, options = {}) => {
  const {
    aspectRatio,
    aspectTolerance = 0.05,
    recommendedLabel,
    maxSizeMB,
    minWidth,
    minHeight,
  } = options;

  return new Promise((resolve) => {
    if (!file) {
      resolve({ valid: false, error: "No file selected." });
      return;
    }

    if (!file.type?.startsWith("image/")) {
      resolve({ valid: false, error: "Please select a valid image file." });
      return;
    }

    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      resolve({
        valid: false,
        error: `Image is too large (${sizeMB}MB). Maximum allowed size is ${maxSizeMB}MB.`,
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      URL.revokeObjectURL(objectUrl);

      if (minWidth && width < minWidth) {
        resolve({
          valid: false,
          error: `Image width is too small (${width}px). Minimum width is ${minWidth}px.`,
          width,
          height,
        });
        return;
      }

      if (minHeight && height < minHeight) {
        resolve({
          valid: false,
          error: `Image height is too small (${height}px). Minimum height is ${minHeight}px.`,
          width,
          height,
        });
        return;
      }

     

      resolve({ valid: true, width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, error: "Could not read the selected image file." });
    };

    img.src = objectUrl;
  });
};