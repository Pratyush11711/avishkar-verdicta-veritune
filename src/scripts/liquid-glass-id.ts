let seq = 0;

export function nextLiquidGlassId() {
  seq += 1;
  return `liquid-glass-${seq}`;
}
