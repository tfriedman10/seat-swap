/**
 * Ticket layout detection.
 *
 * Every function in this module is pure: it takes pixel data (or an
 * Image) and returns plain objects.  No DOM reads or writes happen
 * here, which means the logic can later run in a Web Worker or be
 * unit-tested in Node with a canvas polyfill.
 */

// ── Card bounds ────────────────────────────────────────────────────

/**
 * Scan the image vertically at x = 50 % to locate the red ticket
 * card.  Returns `{ top, bottom, height, bg }` where `bg` is the
 * sampled [R, G, B] background colour, or `null` if no card found.
 */
export function findCard(pixelData, W, H) {
  const mx = Math.floor(W * 0.5);
  let top = -1;
  let bottom = -1;

  for (let y = Math.floor(H * 0.1); y < Math.floor(H * 0.7); y++) {
    const i = (y * W + mx) * 4;
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];
    if (r > 130 && g < 70 && b < 70) {
      if (top < 0) top = y;
      bottom = y;
    }
  }

  if (top < 0) return null;

  // Sample background colour from a clean strip in the middle of the
  // card, below the value row.
  const sampleY = Math.floor(top + (bottom - top) * 0.65);
  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  let n = 0;
  for (let dx = -20; dx <= 20; dx++) {
    const sx = mx + dx;
    const i = (sampleY * W + sx) * 4;
    bgR += pixelData[i];
    bgG += pixelData[i + 1];
    bgB += pixelData[i + 2];
    n++;
  }

  return {
    top,
    bottom,
    height: bottom - top,
    bg: [Math.round(bgR / n), Math.round(bgG / n), Math.round(bgB / n)],
  };
}

// ── Layout classification ──────────────────────────────────────────

/**
 * Returns `true` when the screenshot looks like an Apple Wallet
 * ticket (dark surroundings, red card interior).
 */
export function isWalletLayout(pixelData, W, H, card) {
  if (!card) return false;

  // Black area above the card?
  const aboveY = Math.max(0, card.top - 30);
  const i = (aboveY * W + Math.floor(W * 0.5)) * 4;
  const blackAbove = pixelData[i] < 40 && pixelData[i + 1] < 40 && pixelData[i + 2] < 40;

  // Red interior at midpoint?
  const midY = Math.floor(card.top + card.height * 0.5);
  const j = (midY * W + Math.floor(W * 0.5)) * 4;
  const redMid = pixelData[j] > 130 && pixelData[j + 1] < 70;

  return blackAbove && redMid;
}

/**
 * High-level layout detection.  Returns a layout descriptor object:
 *
 *   { name, key, card, hasLevel, hasDistrict }
 */
export function detectLayout(image) {
  const c = document.createElement('canvas');
  c.width = image.width;
  c.height = image.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(image, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const W = image.width;
  const H = image.height;

  const card = findCard(d, W, H);

  if (isWalletLayout(d, W, H, card) && card) {
    return { name: 'Apple Wallet', key: 'wallet', card, hasLevel: true, hasDistrict: true };
  }

  // Old ballpark app heuristic
  const redIdx = (Math.floor(H * 0.5) * W + Math.floor(W * 0.5)) * 4;
  const photoIdx = (Math.floor(H * 0.32) * W + Math.floor(W * 0.5)) * 4;
  const isRed = d[redIdx] > 140 && d[redIdx + 1] < 40;
  const notPhoto = !(d[photoIdx] > 140 && d[photoIdx + 1] < 40);

  if (isRed && notPhoto && card) {
    return { name: 'Old Ballpark App', key: 'old', card, hasLevel: true, hasDistrict: false };
  }

  // Ballpark app with white QR area
  const qrIdx = (Math.floor(H * 0.45) * W + Math.floor(W * 0.5)) * 4;
  if (d[qrIdx] > 200 && d[qrIdx + 1] > 200 && card) {
    return { name: 'MLB Ballpark App', key: 'ballpark', card, hasLevel: true, hasDistrict: false };
  }

  // Fallback
  if (card) {
    return { name: 'Apple Wallet', key: 'wallet', card, hasLevel: true, hasDistrict: true };
  }

  return {
    name: 'Unknown',
    key: 'wallet',
    card: { top: 0, bottom: H, height: H, bg: [168, 31, 33] },
    hasLevel: true,
    hasDistrict: true,
  };
}
