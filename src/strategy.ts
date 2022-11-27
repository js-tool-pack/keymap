import type { Strategy, StrategyType } from './types';

export const keymapStrategy: Record<StrategyType, Strategy> = {
  // 记忆全部按下的按键
  recordAll(el, maps) {
    const dom = el as HTMLElement;
    const keySet = new Set<string>();

    const keydownHandler = (e: KeyboardEvent) => {
      // if (!(e instanceof KeyboardEvent)) return;
      const key = e.key.toLowerCase();
      keySet.add(key);

      const find = maps.find((item) => {
        if (item.keyList.length !== keySet.size) return;
        if (!item.keyList.every((k) => keySet.has(k))) return;
        return true;
      });

      console.log('keymap', keySet);

      return find?.handler.call(find, e);
    };

    const keyupHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      console.log('keymap', 'keyup', key);
      keySet.delete(key);
      // 在mac中按下meta组合键后释放其他按键会漏掉事件
      if (key === 'meta') keySet.clear();
    };

    const blurHandler = () => {
      keySet.clear();
    };

    dom.addEventListener('keydown', keydownHandler);
    dom.addEventListener('keyup', keyupHandler);
    window.addEventListener('blur', blurHandler);
    return function () {
      dom.removeEventListener('keydown', keydownHandler);
      dom.removeEventListener('keyup', keyupHandler);
      window.removeEventListener('blur', blurHandler);
    };
  },
  // 只记组合键,如果是复合普通键的话是无效的，可以使用memoryAll
  recordCompose: (function () {
    enum ComposeKey {
      meta = 'meta',
      shift = 'shift',
      control = 'control',
      alt = 'alt',
    }

    const composeKeySet = new Set([
      ComposeKey.alt,
      ComposeKey.shift,
      ComposeKey.control,
      ComposeKey.meta,
    ]);

    function isComposeKey(key: any): key is ComposeKey {
      return composeKeySet.has(key);
    }

    /**
     * 给键分类
     */
    function classifyKey(keyList: string[]): { key: string; composeKeys: ComposeKey[] } {
      return keyList.reduce(
        (res, key) => {
          key = key.toLowerCase();

          if (isComposeKey(key)) res.composeKeys.push(key);
          else res.key = key;

          return res;
        },
        { key: '', composeKeys: [] as ComposeKey[] },
      );
    }

    return function keymap(el, maps) {
      const dom = el as HTMLElement;
      // 记录按下的组合键，普通键不记录，因为meta键和非组合键同时按的时候，非组合键释放不会触发事件
      // 这样实际是比原来的记录所有按下的键适用性更窄，只是刚好可以解决这个问题，如果系统升级后解决了这个问题可以还原回去
      const pressComposeKeySet = new Set<ComposeKey>();

      const keydownHandler = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();

        if (isComposeKey(key)) {
          pressComposeKeySet.add(key);
          return;
        }

        const find = maps.find((item) => {
          const ck = classifyKey(item.keyList);
          if (ck.key !== key) return;

          if (
            ck.composeKeys.length !== pressComposeKeySet.size ||
            ck.composeKeys.some((key) => !pressComposeKeySet.has(key))
          )
            return;

          return true;
        });

        console.log('keymap', pressComposeKeySet, key);

        find?.handler.call(find, e);
      };

      const keyupHandler = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        console.log('keymap', 'keyup', key);
        // 在mac中按下meta组合键后释放其他按键会漏掉事件
        if (isComposeKey(key)) pressComposeKeySet.delete(key);
      };

      const blurHandler = () => pressComposeKeySet.clear();

      dom.addEventListener('keydown', keydownHandler);
      dom.addEventListener('keyup', keyupHandler);
      window.addEventListener('blur', blurHandler);
      return function () {
        dom.removeEventListener('keydown', keydownHandler);
        dom.removeEventListener('keyup', keyupHandler);
        window.removeEventListener('blur', blurHandler);
      };
    };
  })(),
};
