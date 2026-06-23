// Renders a live recharts <svg> to a PNG data URL, entirely in the renderer.
// CSS custom properties (var(--x)) used inside the SVG are resolved against
// :root first, because a detached/serialized SVG has no access to them.
export async function chartSvgToPngDataUrl(
  svg: SVGSVGElement,
  options: { scale?: number; background?: string } = {}
): Promise<string> {
  const scale = options.scale ?? 2;
  const root = getComputedStyle(document.documentElement);
  const background =
    options.background ?? (root.getPropertyValue('--bg-card').trim() || '#1c2128');

  const rect = svg.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  let markup = new XMLSerializer().serializeToString(clone);
  markup = markup.replace(/var\(\s*(--[\w-]+)\s*\)/g, (_, name: string) => {
    return root.getPropertyValue(name).trim() || '#000';
  });

  const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
  const img = new Image();
  img.width = width;
  img.height = height;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to render chart SVG'));
    img.src = svgUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/png');
}
