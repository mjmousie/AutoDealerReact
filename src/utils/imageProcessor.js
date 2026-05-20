import imageCompression from "browser-image-compression";

const DEFAULT_OPTIONS = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
  fileType: "image/webp",
  initialQuality: 0.75,
};

export async function compressToWebP(file, options = {}) {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const compressed = await imageCompression(file, merged);
  const newName = file.name.replace(/\.[^.]+$/, ".webp");
  return new File([compressed], newName, { type: "image/webp" });
}

export async function compressMultiple(files, options = {}, onProgress) {
  let completed = 0;
  const results = await Promise.all(
    files.map(async (file) => {
      const result = await compressToWebP(file, options);
      completed++;
      onProgress?.(completed, files.length);
      return result;
    })
  );
  return results;
}

export function isValidImageFile(file) {
  return file && file.type.startsWith("image/");
}