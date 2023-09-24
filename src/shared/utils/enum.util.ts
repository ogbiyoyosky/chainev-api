/**
 * Joins enum values into a string separated by a comma
 * @param enumObject - an enum
 * @returns { string } a string of the values of an enum
 */
export const joinEnumValues = (enumObject: any): string => {
  return Object.values(enumObject).join(', ');
};

/**
 * Joins enum keys into a string separated by a comma
 * @param enumObject - an enum
 * @returns { string } a string of the keys of an enum
 */
export const joinEnumKeys = (enumObject: any): string => {
  return Object.keys(enumObject).join(', ');
};
