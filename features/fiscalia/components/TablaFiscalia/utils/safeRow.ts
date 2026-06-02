const NO_DATA = "NO_DATA";

export const safeRowMapper = (value: any) => {
  if (value === null || value === undefined || value === "") {
    return NO_DATA;
  }
  return value;
};
