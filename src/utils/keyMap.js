const KEY_MAP = new Map([
  [32, 'space'],
  [37, 'left'],
  [38, 'up'],
  [39, 'right'],
  [40, 'down'],
  [68, 'debug'],
  [72, 'help'],
  [76, 'reload'],
  [80, 'p'],
  [82, 'r'],
  [83, 'save'],
]);

export const getKeySymbol = keyValue => KEY_MAP.get(keyValue) ?? null;
