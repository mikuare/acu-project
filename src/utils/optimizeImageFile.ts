const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const readImageBitmap = async (file: File) => {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Unable to read image: ${file.name}`));
      img.src = objectUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const optimizeImageFile = async (
  file: File,
  {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
  }: OptimizeImageOptions = {}
): Promise<File> => {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  const image = await readImageBitmap(file);
  const width = "width" in image ? image.width : 0;
  const height = "height" in image ? image.height : 0;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);

  if (scale === 1 && file.size <= 600 * 1024) {
    if ("close" in image && typeof image.close === "function") {
      image.close();
    }
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    if ("close" in image && typeof image.close === "function") {
      image.close();
    }
    return file;
  }

  if (file.type !== "image/png") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image as CanvasImageSource, 0, 0, canvas.width, canvas.height);

  if ("close" in image && typeof image.close === "function") {
    image.close();
  }

  const outputType = SUPPORTED_IMAGE_TYPES.has(file.type) ? file.type : "image/jpeg";
  const optimizedBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, outputType === "image/png" ? undefined : quality);
  });

  if (!optimizedBlob || optimizedBlob.size >= file.size) {
    return file;
  }

  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const baseName = file.name.replace(/\.[^.]+$/, "");
  const optimizedName = `${baseName}.${extensionByType[outputType] ?? "jpg"}`;

  return new File([optimizedBlob], optimizedName, {
    type: outputType,
    lastModified: file.lastModified,
  });
};
