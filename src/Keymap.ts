import type { HandledKeyOptions, KeyOptions, StrategyType } from './types';
import { keymapStrategy } from './strategy';
import { handleKeys } from './utils';

/**
 * 主类
 */
export class Keymap {
  /**
   * 已注册的所有组合键
   */
  private readonly registeredMaps!: HandledKeyOptions[];

  /**
   * 取消所有注册，并移除事件监听
   */
  private readonly canceler: Function;

  /**
   * @example
   * ```ts
   * new Keymap([{ desc:'select all', keys: 'Control+a', handler() {\/* do something *\/} }], window, 'recordCompose');
   * ```
   *
   * @param maps 事件绑定
   * @param el 绑定的dom对象，默认为window
   * @param strategy 绑定策略，分为记录全部(recordAll)和只记录组合键(recordCompose)，默认为只记录组合键
   */
  constructor(
    maps: KeyOptions[],
    el: HTMLElement | Window = window,
    strategy: StrategyType = 'recordCompose',
  ) {
    // 处理keys
    this.registeredMaps = this.handleMaps(maps);
    this.canceler = keymapStrategy[strategy](el, this.registeredMaps);
  }

  /**
   * 处理组合键数组
   */
  private handleMaps(maps: KeyOptions[]) {
    return maps.map<HandledKeyOptions>((item) => {
      const [keys, keyList] = handleKeys(item.keys);
      return { ...item, rawKeys: item.keys, keys, keyList };
    });
  }

  /**
   * 根据keys查找所在index
   */
  private findIndex(keys: string): number {
    const handledKeys = handleKeys(keys);
    return this.registeredMaps.findIndex((map) => {
      if (map.rawKeys === keys) return true;
      if (map.keys === handledKeys[0]) return true;

      return (
        handledKeys[1].length === map.keyList.length &&
        handledKeys[1].every((key) => map.keyList.includes(key))
      );
    });
  }

  /**
   * 手动触发快捷键
   *
   * @example
   *
   * ```ts
   * let count = 0;
   * const km = new Keymap([{ keys: 'Control+a', handler: ()=> count++ }]);
   *
   * km.trigger('Control+a');
   * console.log(count); // 1
   *
   * km.trigger('Ctrl+a');
   * console.log(count); // 2
   * ```
   */
  trigger(keys: string) {
    const index = this.findIndex(keys);
    this.registeredMaps[index]?.handler();
  }

  /**
   * 可用于显示所有的快捷键
   * @returns 所有已注册快捷键
   */
  get maps(): Omit<HandledKeyOptions, 'handler'>[] {
    return JSON.parse(JSON.stringify(this.registeredMaps));
  }

  /**
   * 判断快捷键是否已经被绑定
   *
   * @example
   * ```ts
   *  const km = new Keymap([{ keys: 'Control+a', handler: () => {} }]);
   *  console.log(km.has('Control+a')); // true
   *  console.log(km.has('control+a')); // true
   *  console.log(km.has('ctrl+a')); // true
   *  console.log(km.has('ctrl+b')); // false
   * ```
   */
  has(keys: string): boolean {
    return this.findIndex(keys) > -1;
  }

  /**
   * 添加快捷键
   *
   * @example
   * ```ts
   * let count = 0;
   * const km = new Keymap([{ keys: 'Control+a', handler: () => {} }]);
   *
   * km.add({ keys: 'ctrl+b', handler: () => count++ });
   * console.log(km.has('ctrl+b')); // true
   *
   * km.trigger('Control+b');
   * console.log(count) // 1;
   * ```
   *
   * @returns 是否添加成功
   */
  add(map: KeyOptions): boolean {
    const exist = this.has(map.keys);
    !exist && this.registeredMaps.push(...this.handleMaps([map]));
    return !exist;
  }

  /**
   * 移除快捷键键
   *
   * @example
   *```ts
   * let count = 0;
   * const km = new Keymap([
   *   { keys: 'Control+a', handler: () => {} },
   *   { keys: 'Control+b', handler: () => count++ },
   * ]);
   *
   * km.trigger('ctrl+a');
   * km.trigger('ctrl+b');
   *
   * console.log(count); // 1
   *
   * km.remove('ctrl+b');
   *
   * km.trigger('ctrl+a');
   * km.trigger('ctrl+b');
   *
   * console.log(count); // 1
   *
   * ```
   */
  remove(keys: string): void {
    const index = this.findIndex(keys);
    if (index === -1) return;
    this.registeredMaps.splice(index, 1);
  }

  /**
   * 销毁
   *
   * 之后再调用add会报错
   */
  destroy() {
    this.canceler();
    this.registeredMaps.length = 0;
    (this.add as any) = () => {
      throw new Error('destroyed');
    };
  }
}
