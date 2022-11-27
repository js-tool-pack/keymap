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
  private findIndex(keys: string): number {
    const handledKeys = handleKeys(keys);
    return this.handledMaps.findIndex((map) => {
      if (map.rawKeys === keys) return true;
      if (map.keys === handledKeys[0]) return true;

      return (
        handledKeys[1].length === map.keyList.length &&
        handledKeys[1].every((key) => map.keyList.includes(key))
      );
    });
  }

  destroy() {
    keymapStrategy[this.strategy](this.el, this.handledMaps);
    this.handledMaps.length = 0;
    (this.add as any) = () => {
      throw new Error('destroyed');
    };
  }
  trigger(keys: string) {
    const index = this.findIndex(keys);
    this.handledMaps[index]?.handler();
  }
  get maps(): Omit<HandledKeyMap, 'handler'>[] {
    return JSON.parse(JSON.stringify(this.handledMaps));
  }
  has(keys: string): boolean {
    return this.findIndex(keys) > -1;
  }
  add(map: KeyMap): boolean {
    const exist = this.has(map.keys);
    !exist && this.handledMaps.push(...this.handleMaps([map]));
    return !exist;
  }
  remove(keys: string): void {
    const index = this.findIndex(keys);
    if (index === -1) return;
    this.handledMaps.splice(index, 1);
  }
}
