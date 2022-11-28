import { Keymap, StrategyType } from '../src';
import { isMac } from '../src/utils';

function useEvent(el: Window | HTMLElement, type: keyof HTMLElementEventMap) {
  // const e = document.createEvent('Events');
  // e.initEvent(type, true, true);
  // 使用new Event代替document.createEvent
  const initEvent = () => new Event(type, { bubbles: true, cancelable: true });
  return {
    trigger() {
      el.dispatchEvent(initEvent());
    },
    setKey(key: string) {
      const e = initEvent();
      (e as any).key = key;
      el.dispatchEvent(e);
    },
  };
}

const triggerKeydown = useEvent(window, 'keydown').setKey;
const triggerKeyup = useEvent(window, 'keyup').setKey;

describe('strategy', function () {
  function common(type: StrategyType) {
    const fn = jest.fn();
    const km = new Keymap({ strategy: type }, [{ keys: 'ctrl+r', handler: fn }]);

    triggerKeydown('control');
    triggerKeydown('r');

    expect(fn.mock.calls.length).toBe(1);

    triggerKeyup('r');
    expect(fn.mock.calls.length).toBe(1);

    triggerKeydown('r');
    expect(fn.mock.calls.length).toBe(2);

    useEvent(window, 'blur').trigger();
    // blur会清理所有按下的记录，所以不会触发
    triggerKeydown('r');
    expect(fn.mock.calls.length).toBe(2);

    triggerKeyup('control');

    km.destroy();
    expect(() => km.add({ keys: 'a', handler: fn })).toThrow();
  }
  test('record all', () => {
    common('recordAll');

    isMac.userAgent = 'mac';

    const fn = jest.fn();
    const km = new Keymap({ strategy: 'recordAll', el: window }, [
      { keys: 'ctrlOrMeta+r+c', handler: fn },
    ]);

    triggerKeydown('control');
    triggerKeydown('r');
    triggerKeydown('c');
    expect(fn.mock.calls.length).toBe(0);
    km.destroy();

    new Keymap({ strategy: 'recordAll' }, [{ keys: 'ctrlOrMeta+r+c', handler: fn }]);

    triggerKeydown('meta');
    triggerKeydown('r');
    triggerKeydown('c');
    expect(fn.mock.calls.length).toBe(1);

    triggerKeyup('meta');

    isMac.userAgent = navigator.userAgent;
  });
  test('record compose', () => {
    common('recordCompose');

    const fn = jest.fn();
    new Keymap([{ keys: 'ctrl+r+c', handler: fn }]);

    triggerKeydown('control');
    triggerKeydown('r');
    expect(fn.mock.calls.length).toBe(0);

    triggerKeydown('c');
    expect(fn.mock.calls.length).toBe(1);

    triggerKeyup('control');
    triggerKeyup('r');
    triggerKeyup('c');

    triggerKeydown('control');
    triggerKeydown('c');
    expect(fn.mock.calls.length).toBe(2);
  });
});
