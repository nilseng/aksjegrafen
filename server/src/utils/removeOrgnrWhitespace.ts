export const removeOrgnrWhitespace = (str: string) => {
  return str.replace(/(\d)\s+(\d)/g, "$1$2");
};
