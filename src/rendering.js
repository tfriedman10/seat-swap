/**
 * Canvas rendering for edited tickets.
 *
 * `generateEditedTicket` is the only export.  It draws onto a
 * supplied canvas and has zero DOM side-effects beyond that.
 */

import { FONT_FAMILY, CARD_Y, X, FONT, COVER } from './constants.js';

// ── Internal helpers ───────────────────────────────────────────────

function paintOver(ctx, bg, x, y, w, h) {
  ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

function drawText(ctx, text, x, y, fontSize, weight = '500') {
  ctx.fillStyle = 'rgb(255,255,255)';
  ctx.font = `${weight} ${Math.round(fontSize)}px ${FONT_FAMILY}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(text, x, y);
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Draw the original image onto `canvas`, then overlay the new seat
 * values.
 *
 * @param {HTMLCanvasElement} canvas  – target canvas (resized internally)
 * @param {HTMLImageElement}  image   – original ticket screenshot
 * @param {object}            layout  – layout descriptor from detection
 * @param {{ section: string, row: string, seat: string }} seat
 */
export function generateEditedTicket(canvas, image, layout, seat, levelOverrides = {}) {
  const W = image.width;
  const H = image.height;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const { card } = layout;
  const bg = card.bg;
  const cT = card.top;
  const cH = card.height;

  // Computed positions
  const valCy = cT + cH * CARD_Y.valCy;
  const valFs = cH * FONT.valFs;
  const valCoverTop = cT + cH * COVER.valTop;
  const valCoverH = cH * COVER.valH;

  // Section / Row / Seat
  const values = [
    { text: seat.section, lx: X.secLx, coverW: COVER.secW },
    { text: seat.row, lx: X.rowLx, coverW: COVER.rowW },
    { text: seat.seat, lx: X.seatLx, coverW: COVER.seatW },
  ];

  for (const v of values) {
    const cx = v.lx * W;
    paintOver(ctx, bg, cx - W * 0.01, valCoverTop, v.coverW * W, valCoverH);
    drawText(ctx, v.text, cx, valCy, valFs);
  }

  // Level / gate text
  if (layout.hasLevel) {
    const levelCy = cT + cH * CARD_Y.levelCy;
    const levelFs = cH * FONT.levelFs;
    const levelCoverTop = cT + cH * COVER.levelTop;
    const levelCoverH = cH * COVER.levelH;

    const digitX = (levelOverrides.digitLx ?? X.levelDigitLx) * W;
    const scaledFs = levelFs * (levelOverrides.fontScale ?? 1);
    const coverRight = (X.levelLx + COVER.levelW) * W;

    paintOver(ctx, bg, digitX, levelCoverTop, coverRight - digitX, levelCoverH);

    if (layout.hasDistrict) {
      paintOver(ctx, bg, COVER.distLx * W, levelCoverTop, COVER.distW * W, levelCoverH);
    }

    const levelNum = seat.section.charAt(0) || '1';
    drawText(ctx, levelNum, digitX, levelCy, scaledFs, '400');
  }
}
