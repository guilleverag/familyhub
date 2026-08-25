export function getDarkerColor(hex: string, percent: number = 18): { bg: string; text: string } {
  if (!hex || !hex.startsWith('#')) {
    return { bg: '#cbd5e1', text: '#0f172a' };
  }

  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }

  const num = parseInt(c, 16);
  if (isNaN(num)) return { bg: '#cbd5e1', text: '#0f172a' };

  let r = (num >> 16);
  let g = ((num >> 8) & 0x00FF);
  let b = (num & 0x0000FF);

  // Shift RGB values by ~18% for a rich, vibrant, saturated tone
  const factor = (100 - percent) / 100;
  r = Math.max(20, Math.floor(r * factor));
  g = Math.max(20, Math.floor(g * factor));
  b = Math.max(20, Math.floor(b * factor));

  const darkHex = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return { bg: darkHex, text: '#0f172a' };
}

export function getSaturatedPendingColor(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '#f1f5f9';

  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }

  const num = parseInt(c, 16);
  if (isNaN(num)) return '#f1f5f9';

  let r = (num >> 16) / 255;
  let g = ((num >> 8) & 0x00FF) / 255;
  let b = (num & 0x0000FF) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // High saturation (90%) + High lightness (88%) for light, bright, vivid pastel
  s = Math.min(1.0, Math.max(s, 0.90));
  l = 0.88;

  // Convert HSL back to RGB
  let r1: number, g1: number, b1: number;
  if (s === 0) {
    r1 = g1 = b1 = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r1 = hue2rgb(p, q, h + 1/3);
    g1 = hue2rgb(p, q, h);
    b1 = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}
