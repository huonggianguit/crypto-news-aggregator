// lib/contentUtils.ts

export function slugifyTitle(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type ImageItem = {
  id: string;
  url: string;
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Thêm class vào attrs của tag (hỗ trợ "..." và '...') */
function ensureClass(attrs: string, classToAdd: string): string {
  let newAttrs = attrs || "";

  // class="..."
  if (/class\s*=\s*"/i.test(newAttrs)) {
    newAttrs = newAttrs.replace(/class\s*=\s*"([^"]*)"/i, (_m, cls) => {
      const classes = cls.split(/\s+/).filter(Boolean);
      if (!classes.includes(classToAdd)) classes.push(classToAdd);
      return ` class="${classes.join(" ")}"`;
    });
    return newAttrs;
  }

  // class='...'
  if (/class\s*=\s*'/i.test(newAttrs)) {
    newAttrs = newAttrs.replace(/class\s*=\s*'([^']*)'/i, (_m, cls) => {
      const classes = cls.split(/\s+/).filter(Boolean);
      if (!classes.includes(classToAdd)) classes.push(classToAdd);
      return ` class='${classes.join(" ")}'`;
    });
    return newAttrs;
  }

  // chưa có class
  return `${newAttrs} class="${classToAdd}"`;
}

/**
 * Xử lý content:
 * - Thay {img1} / {{img1}} bằng <img src="...">
 * - Gắn id + scroll-mt-32 cho <h2> theo TOC để TOC click → scroll
 */
export function buildContentHtml(
  rawContent: string | null | undefined,
  images: unknown,
  toc: unknown
): string {
  if (!rawContent) return "";

  let html = rawContent;

  const imageArray: ImageItem[] = Array.isArray(images) ? (images as any[]) : [];

  // Thay placeholder ảnh: {img1} hoặc {{img1}}
  for (const img of imageArray) {
    if (!img || typeof img.id !== "string" || typeof img.url !== "string") continue;

    const pattern = new RegExp(`\\{\\{?\\s*${escapeRegExp(img.id)}\\s*\\}?\\}`, "g");

    html = html.replace(
      pattern,
      `
<figure class="my-8">
  <img src="${img.url}" alt="" class="w-full rounded-2xl shadow-md" />
</figure>`
    );
  }

  const tocArray: string[] = Array.isArray(toc)
    ? (toc as any[]).filter((t) => typeof t === "string")
    : [];

  // Gắn id cho tất cả <h2> theo thứ tự TOC
  let h2Index = 0;

  html = html.replace(/<h2([^>]*)>/gi, (match: string, attrs: string) => {
    const title = tocArray[h2Index] ? String(tocArray[h2Index]) : `section-${h2Index + 1}`;
    const id = slugifyTitle(title) || `section-${h2Index + 1}`;
    h2Index++;

    let newAttrs = attrs || "";

    // Nếu đã có id, giữ id cũ (nhưng vẫn thêm scroll-mt-32 để khỏi bị che header)
    const hasId = /id\s*=\s*["'][^"']*["']/i.test(newAttrs);

    // đảm bảo có scroll-mt-32
    newAttrs = ensureClass(newAttrs, "scroll-mt-32");

    // nếu chưa có id thì gắn id theo toc
    if (!hasId) {
      // đảm bảo newAttrs có khoảng trắng đầu (để ghép vào tag đẹp)
      if (newAttrs && !/^\s/.test(newAttrs)) newAttrs = " " + newAttrs;
      return `<h2 id="${id}"${newAttrs}>`;
    }

    // đã có id rồi -> chỉ return tag với attrs đã được thêm scroll-mt-32
    if (newAttrs && !/^\s/.test(newAttrs)) newAttrs = " " + newAttrs;
    return `<h2${newAttrs}>`;
  });

  return html;
}
