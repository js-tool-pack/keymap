isMac.userAgent = globalThis.navigator.userAgent;
export function isMac(): boolean {
  return /mac|ipod|iphone|ipad|darwin/i.test(isMac.userAgent);
}

const MetaAlias = ['meta', 'command', 'cmd', 'super', '⌘'];
const CtrlAlias = ['control', 'ctrl', '⌃'];
const MetaOrControlMap = MetaAlias.reduce(
  (res, meta) => {
    CtrlAlias.forEach((ctrl) => {
      res[meta + 'or' + ctrl] = true;
      res[ctrl + 'or' + meta] = true;
    });
    return res;
  },
  { mod: true } as Record<string, boolean>,
);

const AliasMapList: Record<string, string[]> = {
  meta: MetaAlias,
  control: CtrlAlias,
  shift: ['⇧'],
  alt: ['option', '⌥'],
  escape: ['esc'],
  enter: ['return', '↩︎', '⏎'],
  '+': ['plus'],
  ' ': ['space', '␣'],
  backspace: ['⌫'],
  tab: ['⇥'],
  arrowleft: ['←'],
  arrowright: ['→'],
  arrowup: ['↑'],
  arrowdown: ['↓'],
};

export const defaultKeyAliasMap: Record<string, string> = Object.keys(AliasMapList).reduce(
  (res, key) => {
    AliasMapList[key]?.forEach((alias) => (res[alias] = key));
    return res;
  },
  {} as Record<string, string>,
);

/**
 * 把'meta+x' 'ctrl+x'这种按键组合转成小写和分割成数组
 */
export function handleKeys(
  keys: string,
  keyAliasMap: Record<string, string> = defaultKeyAliasMap,
): [string, string[]] {
  keys = keys.toLowerCase();
  const moc = isMac() ? 'meta' : 'control';

  function replace(key: string): string {
    if (MetaOrControlMap[key]) return moc;
    return keyAliasMap[key] || key;
  }
  const keyList = keys
    .replace(/\+(\+)?/g, '⌇$1')
    .split('⌇')
    .map((key) => replace(key === ' ' ? key : key.trim()));
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
