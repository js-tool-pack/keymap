isMac.userAgent = globalThis.navigator.userAgent;
export function isMac(): boolean {
  return /mac|darwin/i.test(isMac.userAgent);
}

const MetaAlias = ['Meta', 'Command', 'CMD'].map((item) => item.toLowerCase());
const CtrlAlias = ['Control', 'Ctrl'].map((item) => item.toLowerCase());
const MetaOrControlList = MetaAlias.reduce((res, meta) => {
  CtrlAlias.forEach((ctrl) => {
    res.push(meta + 'or' + ctrl);
    res.push(ctrl + 'or' + meta);
  });
  return res;
}, [] as string[]);

/**
 * 把'meta+x' 'ctrl+x'这种按键组合转成小写和分割成数组
 */
export function handleKeys(keys: string): [string, string[]] {
  keys = keys.toLowerCase();
  const moc = isMac() ? 'meta' : 'control';

  function replace(key: string): string {
    if (MetaOrControlList.includes(key)) return moc;
    if (MetaAlias.includes(key)) return 'meta';
    if (CtrlAlias.includes(key)) return 'control';
    return key;
  }
  const keyList = keys
    .replace(/\+(\+)?/g, ' $1')
    .split(' ')
    .map((key) => replace(key));
  // const keyList = keys.split(/(?<!\+)\+/).map((key) => replace(key));
  return [keys, keyList];
}

/**
 * @example
 * castArray([1]); // [1]
 * @example
 * castArray(1); // [1]
 * @param value
 */
export function castArray<T>(value: T): T extends Array<any> ? T : Array<T> {
  return (Array.isArray(value) ? value : [value]) as any;
}
