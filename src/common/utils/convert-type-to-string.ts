export type ConvertToStrings<T> = {
  [K in keyof T]: string;
};
