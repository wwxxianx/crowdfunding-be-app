export function generateArrayQueryParameter(param: string[]) {
  return Array.isArray(param) ? param : param ? [param] : [];
}
