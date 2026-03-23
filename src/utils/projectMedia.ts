export type VerificationSource = "implementation" | "project" | "none";

export interface VerificationMediaRecord {
  status?: string | null;
  image_url?: string | null;
  document_urls?: string | null;
  verification_images?: string | null;
  verification_documents?: string | null;
}

export const splitStoredUrls = (value?: string | null): string[] =>
  (value ?? "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

export const joinStoredUrls = (urls: string[]): string | null =>
  urls.length > 0 ? urls.join(",") : null;

export const getResolvedVerificationAssets = (record: VerificationMediaRecord) => {
  const implementationImages = splitStoredUrls(record.verification_images);
  const implementationDocuments = splitStoredUrls(record.verification_documents);

  if (implementationImages.length > 0 || implementationDocuments.length > 0) {
    return {
      images: implementationImages,
      documents: implementationDocuments,
      source: "implementation" as VerificationSource,
    };
  }

  if (record.status === "implemented") {
    const projectImages = splitStoredUrls(record.image_url);
    const projectDocuments = splitStoredUrls(record.document_urls);

    if (projectImages.length > 0 || projectDocuments.length > 0) {
      return {
        images: projectImages,
        documents: projectDocuments,
        source: "project" as VerificationSource,
      };
    }
  }

  return {
    images: [] as string[],
    documents: [] as string[],
    source: "none" as VerificationSource,
  };
};

export const hasVerificationAssets = (record: VerificationMediaRecord) => {
  const { images, documents } = getResolvedVerificationAssets(record);
  return images.length > 0 || documents.length > 0;
};
