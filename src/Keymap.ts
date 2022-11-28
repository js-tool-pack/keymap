import type { HandledKeyOptions, KeyOptions, StrategyType } from './types';
import { keymapStrategy } from './strategy';
import { handleKeys, castArray, defaultKeyAliasMap } from './utils';

/**
 * Keymap配置项
 */
export interface KeymapConfig {
  /**
   * 按键监听事件绑定对象
   */
  el?: HTMLElement | Window;
  /**
   * 快捷键策略
   */
  strategy?: StrategyType;
  /**
   * 配置别名
   *
   * @see defaultKeyAliasMap
   */
  keyAliasMap?: Record<string, string>;
}
/**
 * 主类
 */
export class Keymap {
  /**
   * 按键别名映射map
   *
   * @see defaultKeyAliasMap
   */
  private _keyAliasMap: Record<string, string>;

  /**
   * 已注册的所有组合键
   */
  private readonly registeredMaps!: HandledKeyOptions[];

  /**
   * 取消所有注册，并移除事件监听
   */
  private readonly canceler: Function;

  /**
   * 使用默认配置
   *
   * @example
   * ```ts
   * new Keymap([{ desc:'select all', keys: 'Control+a', handler() {\/* do something *\/} }]);
   * new Keymap([{ desc:'select all', keys: ['Control+a','Control+b'], handler() {\/* do something *\/} }]);
   * ```
   * @param maps 事件绑定选项数组
   */
  constructor(maps: KeyOptions[]);
  /**
   * 使用自定义配置
   *
   * @example
   * ```ts
   * new Keymap({el:window, strategy:'recordCompose'},[{ desc:'select all', keys: 'Control+a', handler() {\/* do something *\/} }]);
   * ```
   * @param config
   * @param [config.el=window] 绑定的dom对象，默认为window
   * @param [config.strategy='recordCompose'] 绑定策略，分为记录全部(recordAll)和只记录组合键(recordCompose)，默认为只记录组合键
   * @param maps 事件绑定选项数组
   */
  constructor(config: KeymapConfig, maps?: KeyOptions[]);
  constructor(...args: any[]) {
    const config: Required<KeymapConfig> = {
      el: window,
      strategy: 'recordCompose',
      keyAliasMap: defaultKeyAliasMap,
    };
    let maps: KeyOptions[];
    if (args.length === 2) {
      Object.assign(config, args[0]);
      maps = args[1];
    } else maps = args[0];
    this._keyAliasMap = config.keyAliasMap;
    // 处理keys
    this.registeredMaps = this.handleMaps(maps);
    this.canceler = keymapStrategy[config.strategy](config.el, this.registeredMaps);
  }

  /**
   * 获取按键别名配置
   *
   * 注意⚠️：由于复制了一份obj，所以使用Object(keyAliasMap,{})不会起效
   */
  get keyAliasMap(): Record<string, string> {
    return { ...this._keyAliasMap };
  }

  /**
   * 设置按键别名
   *
   * @example
   * ```ts
   *
   * const km = new Keymap([{ desc: 'test', keys: ['Control + a', 'Meta + a'], handler: () => {} }]);
   *
   * // [
   * //   {
   * //     desc: 'test',
   * //     keyList: ['control', 'a'],
   * //     keys: 'control + a',
   * //     rawKeys: ['Control + a', 'Meta + a'],
   * //   },
   * //   {
   * //     desc: 'test',
   * //     keyList: ['meta', 'a'],
   * //     keys: 'meta + a',
   * //     rawKeys: ['Control + a', 'Meta + a'],
   * //   },
   * // ]
   * console.log(km.maps);
   *
   * console.log(km.has('ctrl+a')); // true
   *
   * // 使用 Object.assign(km.keyAliasMap, { ctrl: '' }) 不起作用
   * Object.assign(km.keyAliasMap, { ctrl: '' });
   * console.log(km.has('ctrl+a')); // true
   *
   * // 清理所有别名
   * km.keyAliasMap = {};
   * // ctrl不再是Control的别名，所以 ctrl+a 不存在
   * console.log(km.has('ctrl+a')); // false
   *
   * // 让control成为alt的别名
   * console.log(km.has('alt+a')); // false
   * km.keyAliasMap = { control: 'alt' };
   * console.log(km.has('alt+a')); // true
   *
   * // [
   * //   {
   * //     desc: 'test',
   * //     keyList: ['alt', 'a'],
   * //     keys: 'control + a',
   * //     rawKeys: ['Control + a', 'Meta + a'],
   * //   },
   * //   {
   * //     desc: 'test',
   * //     keyList: ['meta', 'a'],
   * //     keys: 'meta + a',
   * //     rawKeys: ['Control + a', 'Meta + a'],
   * //   },
   * // ]
   * console.log(km.maps);
   * ```
   */
  set keyAliasMap(alias: Record<string, string>) {
    this._keyAliasMap = alias;
    const originMaps: KeyOptions[] = [];
    this.registeredMaps.forEach((m) => {
      if (originMaps.find((o) => o.keys === m.rawKeys)) return;
      const keyOptions: KeyOptions = { keys: m.rawKeys, handler: m.handler };
      if (m.desc) keyOptions.desc = m.desc;
      originMaps.push(keyOptions);
    });
    const registeredMaps = this.handleMaps(originMaps);
    this.registeredMaps.length = 0;
    this.registeredMaps.push(...registeredMaps);
  }

  /**
   * 处理组合键数组
   */
  private handleMaps(maps: KeyOptions[]) {
    return maps.reduce((res, item) => {
      const keysList = castArray(item.keys);
      res.push(
        ...keysList.map<HandledKeyOptions>((k) => {
          const [keys, keyList] = handleKeys(k, this._keyAliasMap);
          return { ...item, rawKeys: item.keys, keys, keyList };
        }),
      );
      return res;
    }, [] as HandledKeyOptions[]);
  }

  /**
   * 根据keys查找所在index
   */
  private findIndex(keys: string): number {
    const handledKeys = handleKeys(keys, this._keyAliasMap);
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
    const exist = castArray(map.keys).every((keys) => this.has(keys));
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
