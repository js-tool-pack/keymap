import { Keymap } from '../src';
import { defaultKeyAliasMap, isMac } from '../src/utils';

describe('keymap', function () {
  test('base', () => {
    const fn = jest.fn();
    const km = new Keymap([{ keys: ['Control+a', 'Control+b'], handler: fn }]);
    expect(fn.mock.calls.length).toBe(0);

    km.trigger('Control+a');
    expect(fn.mock.calls.length).toBe(1);

    km.trigger('control+b');
    km.trigger('Ctrl+a');
    km.trigger('Ctrl+c');
    expect(fn.mock.calls.length).toBe(3);
  });
  test('base recordAll', () => {
    const fn = jest.fn();
    const km = new Keymap({ strategy: 'recordAll' }, [{ keys: 'Control+a', handler: fn }]);
    expect(fn.mock.calls.length).toBe(0);

    km.trigger('Control+a');
    expect(fn.mock.calls.length).toBe(1);

    km.trigger('control+a');
    km.trigger('Ctrl+a');
    expect(fn.mock.calls.length).toBe(3);
  });
  test('destroy', () => {
    const fn = jest.fn();
    const km = new Keymap([{ keys: 'Control+a', handler: fn }]);
    expect(fn.mock.calls.length).toBe(0);

    km.trigger('Control+a');
    expect(fn.mock.calls.length).toBe(1);

    km.destroy();

    km.trigger('Control+a');
    km.trigger('Control+a');
    expect(fn.mock.calls.length).toBe(1);

    expect(() => {
      km.add({ keys: 'Control+o', handler: fn });
    }).toThrow();
  });
  test('has', () => {
    const fn = jest.fn();
    const km = new Keymap([{ keys: 'Control+a', handler: fn }]);
    expect(km.has('Control+a')).toBeTruthy();
    expect(km.has('control+a')).toBeTruthy();
    expect(km.has('ctrl+a')).toBeTruthy();
    expect(km.has('ctrl+b')).toBeFalsy();
  });
  test('add', () => {
    const fn = jest.fn();
    const km = new Keymap([{ keys: 'Control+a', handler: fn }]);

    km.add({ keys: 'ctrl+b', handler: fn });
    expect(km.has('ctrl+b')).toBeTruthy();

    expect(fn.mock.calls.length).toBe(0);
    km.trigger('Control+b');
    expect(fn.mock.calls.length).toBe(1);

    let _this: any;
    const options = {
      desc: 'test',
      keys: 'ctrl+s',
      handler() {
        _this = this;
      },
    };
    expect(km.add(options)).toBeTruthy();
    expect(_this).toBeUndefined();
    km.trigger('Control+s');
    expect(_this).toEqual({
      ...options,
      keyList: ['control', 's'],
      keys: 'ctrl+s',
      rawKeys: 'ctrl+s',
    });

    expect(km.add(options)).toBeFalsy();
  });
  test('remove', () => {
    const fn = jest.fn();
    const fn2 = jest.fn();
    const km = new Keymap([
      { keys: 'Control+a', handler: fn },
      { keys: 'Control+b', handler: fn2 },
    ]);

    expect(fn.mock.calls.length).toBe(0);
    km.trigger('ctrl+a');
    km.trigger('ctrl+b');
    expect(fn.mock.calls.length).toBe(1);
    expect(fn2.mock.calls.length).toBe(1);

    km.remove('ctrl+c');
    km.trigger('ctrl+a');
    km.trigger('ctrl+b');
    expect(fn.mock.calls.length).toBe(2);
    expect(fn2.mock.calls.length).toBe(2);

    km.remove('Control+a');
    km.remove('Ctrl+b');
    km.trigger('ctrl+a');
    km.trigger('ctrl+b');
    expect(fn.mock.calls.length).toBe(2);
    expect(fn2.mock.calls.length).toBe(2);
  });
  test('maps', () => {
    isMac.userAgent = 'mac';
    const fn = jest.fn();
    const km = new Keymap([
      { desc: 'test', keys: ['Control+a', 'Ctrl+b'], handler: fn },
      { desc: 'test2', keys: 'ControlOrMeta+a', handler: fn },
    ]);
    expect(km.maps).toEqual([
      {
        desc: 'test',
        keyList: ['control', 'a'],
        keys: 'control+a',
        rawKeys: ['Control+a', 'Ctrl+b'],
      },
      {
        desc: 'test',
        keyList: ['control', 'b'],
        keys: 'ctrl+b',
        rawKeys: ['Control+a', 'Ctrl+b'],
      },
      {
        desc: 'test2',
        keyList: ['meta', 'a'],
        keys: 'controlormeta+a',
        rawKeys: 'ControlOrMeta+a',
      },
    ]);
    isMac.userAgent = navigator.userAgent;
  });
  test('keyAliasMap', () => {
    const fn = jest.fn();
    const km = new Keymap([{ desc: 'test', keys: ['Control + a', 'Meta + a'], handler: fn }]);

    expect(km.maps).toEqual([
      {
        desc: 'test',
        keyList: ['control', 'a'],
        keys: 'control + a',
        rawKeys: ['Control + a', 'Meta + a'],
      },
      {
        desc: 'test',
        keyList: ['meta', 'a'],
        keys: 'meta + a',
        rawKeys: ['Control + a', 'Meta + a'],
      },
    ]);

    expect(km.has('ctrl+a')).toBeTruthy();
    expect(km.keyAliasMap).toEqual(defaultKeyAliasMap);

    // 使用 Object.assign(km.keyAliasMap, { ctrl: '' }) 不起作用
    Object.assign(km.keyAliasMap, { ctrl: '' });
    expect(km.has('ctrl+a')).toBeTruthy();

    // 清理所有别名
    km.keyAliasMap = {};
    // ctrl不再是Control的别名，所以 ctrl+a 不存在
    expect(km.has('ctrl+a')).toBeFalsy();

    // 让control成为alt的别名
    expect(km.has('alt+a')).toBeFalsy();
    km.keyAliasMap = { control: 'alt' };
    expect(km.has('alt+a')).toBeTruthy();

    expect(km.maps).toEqual([
      {
        desc: 'test',
        keyList: ['alt', 'a'],
        keys: 'control + a',
        rawKeys: ['Control + a', 'Meta + a'],
      },
      {
        desc: 'test',
        keyList: ['meta', 'a'],
        keys: 'meta + a',
        rawKeys: ['Control + a', 'Meta + a'],
      },
    ]);
  });
});
