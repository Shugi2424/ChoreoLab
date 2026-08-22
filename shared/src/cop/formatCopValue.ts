/** Format a CoP difficulty value as one decimal place (e.g. 0.4, 0.6). */
export function formatCopValue(value: number): string {
  return value.toFixed(1);
}
