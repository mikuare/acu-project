import { supabase } from "@/integrations/supabase/client";
import { optimizeImageFile } from "@/utils/optimizeImageFile";

const getFileNameFromUrl = (url: string, fallbackBaseName: string) => {
  const rawName = decodeURIComponent(url.split("/").pop()?.split("?")[0] || fallbackBaseName);
  return rawName || fallbackBaseName;
};

const buildStoredFileName = (fileName: string) =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${fileName}`;

export const optimizeStoredImages = async (
  urls: string[],
  bucket: "project-images"
): Promise<{ urls: string[]; replacedCount: number }> => {
  const optimizedUrls: string[] = [];
  let replacedCount = 0;

  for (let index = 0; index < urls.length; index += 1) {
    const currentUrl = urls[index];
    const response = await fetch(currentUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image ${index + 1} for optimization.`);
    }

    const blob = await response.blob();
    const contentType = blob.type || response.headers.get("content-type") || "image/jpeg";
    const fileName = getFileNameFromUrl(currentUrl, `image-${index + 1}.jpg`);
    const sourceFile = new File([blob], fileName, { type: contentType });
    const optimizedFile = await optimizeImageFile(sourceFile);

    if (optimizedFile === sourceFile) {
      optimizedUrls.push(currentUrl);
      continue;
    }

    const storageFileName = buildStoredFileName(optimizedFile.name);
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storageFileName, optimizedFile);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(storageFileName);

    optimizedUrls.push(publicUrl);
    replacedCount += 1;
  }

  return { urls: optimizedUrls, replacedCount };
};
