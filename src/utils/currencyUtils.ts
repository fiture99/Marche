// src/utils/currencyUtils.ts
export const formatGMD = (value: number) => {
  return new Intl.NumberFormat('en-GM', { style: 'currency', currency: 'GMD' }).format(value);
};

// Fallback for browsers that do not support Intl.NumberFormat for GMD
export const formatGMDWithSymbol = (value: number) => {
  return `GMD ${value.toFixed(2)}`;
};
