export const isImageSymbol = (s: string | undefined | null): boolean =>
  typeof s === "string" && s.startsWith("data:image");

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("read error"));
    r.readAsDataURL(file);
  });
}

/** Resize a data-URL image to <= maxSize px on its longest edge to keep things light. */
export async function resizeDataUrl(src: string, maxSize = 256): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      if (Math.max(w, h) <= maxSize) { resolve(src); return; }
      const scale = maxSize / Math.max(w, h);
      const nw = Math.round(w * scale), nh = Math.round(h * scale);
      const c = document.createElement("canvas");
      c.width = nw; c.height = nh;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, nw, nh);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

/** Render an emoji into a circular colored badge (PNG data URL). */
export async function emojiToBadgePng(emoji: string, color: string, size = 64): Promise<string> {
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = Math.max(2, size * 0.05);
  ctx.stroke();
  ctx.font = `${Math.round(size * 0.5)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui,sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji || "📌", size / 2, size / 2 + size * 0.04);
  return c.toDataURL("image/png");
}

/** Render an arbitrary image into a circular colored badge (PNG data URL). */
export async function imageToBadgePng(imgDataUrl: string, color: string, size = 64): Promise<string> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("img load"));
    im.src = imgDataUrl;
  });
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = Math.max(2, size * 0.05);
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
  ctx.clip();
  const inner = size * 0.78;
  ctx.drawImage(img, (size - inner) / 2, (size - inner) / 2, inner, inner);
  ctx.restore();
  return c.toDataURL("image/png");
}

/** Pick the right badge generator based on whether the symbol is an image or emoji. */
export async function symbolToBadgePng(symbol: string, color: string, size = 64): Promise<string> {
  if (isImageSymbol(symbol)) return imageToBadgePng(symbol, color, size);
  return emojiToBadgePng(symbol, color, size);
}
