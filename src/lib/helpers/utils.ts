export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 8, // 可視需求調整小數位數
  }).format(num);
