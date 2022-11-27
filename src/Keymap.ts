import type { HandledKeyMap, KeyMap, KeymapStrategy } from './types';
import { keymapStrategy } from './strategy';
import { handleKeys } from './utils';

export class Keymap {
  private readonly handledMaps!: HandledKeyMap[];

  constructor(
    maps: KeyMap[],
    private el: HTMLElement | Window = window,
    private strategy: KeymapStrategy = 'recordCompose',
  ) {
    // 处理keys
    this.handledMaps = this.handleMaps(maps);
  }

  private handleMaps(maps: KeyMap[]) {
    return maps.map<HandledKeyMap>((item) => {
      const [keys, keyList] = handleKeys(item.keys);
      return { ...item, rawKeys: item.keys, keys, keyList };
    });
  }

  cancel() {
    keymapStrategy[this.strategy](this.el, this.handledMaps);
  }
  trigger(keys: string) {
    const [handledKeys, keyList] = handleKeys(keys);

    const find = this.handledMaps.find((map) => {
      if (map.keys === handledKeys) return true;
      if (map.keyList.length !== keyList.length) return false;
      return map.keyList.every((key) => keyList.includes(key));
    });

    if (!find) return;

    find.handler();
  }
  log(): void {
    const info = this.handledMaps.map((item) => ({
      desc: item.desc,
      keys: item.rawKeys,
      realKeys: JSON.stringify(item.keyList),
    }));
    console.table(info);
  }
  has(keys: string): boolean {
    const handledKeys = handleKeys(keys);
    return this.handledMaps.some((map) => {
      if (map.rawKeys === keys) return true;
      if (map.keys === handledKeys[0]) return true;

      return (
        handledKeys[1].length === map.keyList.length &&
        handledKeys[1].every((key) => map.keyList.includes(key))
      );
    });
  }
  add(map: KeyMap): boolean {
    const exist = this.has(map.keys);
    !exist && this.handledMaps.push(...this.handleMaps([map]));
    return !exist;
  }
  remove(keys: string): void {
    const index = this.handledMaps.findIndex((item) => item.rawKeys === keys);
    if (index === -1) return;
    this.handledMaps.splice(index, 1);
  }
  clear(): void {
    this.cancel();
    this.handledMaps.length = 0;
  }
}
