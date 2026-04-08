/**
 * Layout detection constants for MLB ticket screenshots.
 *
 * These are expressed as fractions of either the card height or the
 * full image width so they stay stable across different device
 * resolutions (verified on 1179×2556 and 1206×2622 captures).
 */

export const FONT_FAMILY =
  'SFPro, -apple-system, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif';

/** Card-relative Y fractions (center of each text row). */
export const CARD_Y = {
  valCy: 0.611,   // section / row / seat values
  levelCy: 0.738, // "Enter Gate – Level X" line
};

/** Image-width X fractions (left edge of each value). */
export const X = {
  secLx: 0.09,
  rowLx: 0.496,
  seatLx: 0.85,
  levelLx: 0.093,
};

/** Font size as fraction of card height. */
export const FONT = {
  valFs: 0.052,
  levelFs: 0.042,
};

/** Cover-rectangle dimensions (fractions of card height / image width). */
export const COVER = {
  valH: 0.072,
  valTop: 0.574,
  secW: 0.2,
  rowW: 0.14,
  seatW: 0.1,
  levelTop: 0.704,
  levelH: 0.072,
  levelW: 0.46,
  distLx: 0.41,
  distW: 0.52,
};
