// utils/dateRange.ts

export const getHoyYAyerRange = () => {
  const now = new Date();

  const hoyStart = new Date(now);
  hoyStart.setHours(0, 0, 0, 0);

  const hoyEnd = new Date(now);
  hoyEnd.setHours(23, 59, 59, 999);

  const ayerStart = new Date(now);
  ayerStart.setDate(now.getDate() - 1);
  ayerStart.setHours(0, 0, 0, 0);

  return {
    from: ayerStart.toISOString(),
    to: hoyEnd.toISOString(),
  };
};
