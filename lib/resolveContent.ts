// lib/resolveContent.ts
type ImageItem = {
  id: string;
  url: string;
};

export function resolveContentWithImages(
  content: string | null | undefined,
  images: unknown
): string {
  if (!content) return "";

  const imageArray: ImageItem[] = Array.isArray(images)
    ? (images as any[])
    : [];

  const imageMap = new Map<string, string>();
  for (const img of imageArray) {
    if (img && typeof img.id === "string" && typeof img.url === "string") {
      imageMap.set(img.id, img.url);
    }
  }

  // {img1} hoặc {{img1}}
  const placeholderRegex = /\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}|\{\s*([a-zA-Z0-9_-]+)\s*\}/g;

  let html = content.replace(
    placeholderRegex,
    (match, p1, p2) => {
      const key = p1 || p2; // img1
      const url = imageMap.get(key);
      if (!url) return ""; // không có ảnh thì bỏ placeholder
      return `
<figure class="my-8">
  <img src="${url}" alt="" class="w-full rounded-2xl" />
</figure>`;
    }
  );

  return html;
}
