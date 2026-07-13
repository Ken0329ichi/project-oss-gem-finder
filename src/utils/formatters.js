// 世界標準UTC時刻へのフォーマットヘルパー
export const formatUTC = (isoString) => {
  if (!isoString) return 'Unknown';
  try {
    const date = new Date(isoString);
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
  } catch {
    return 'Unknown';
  }
};
