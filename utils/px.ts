/**
 * Convert a Figma px value to a vw string based on a 1728px baseline
 * e.g. px(378) → "21.875vw"
 */
export const px = (n: number) => `${((n / 1728) * 100).toFixed(4)}vw`;
