import { Keymap } from '../src';

describe('keymap', function () {
  test('base', () => {
    const fn = jest.fn();
    const km = new Keymap([{ keys: 'Control+a', handler: fn }]);
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
    const fn = jest.fn();
    const km = new Keymap([
      { desc: 'test', keys: 'Control+a', handler: fn },
      { desc: 'test2', keys: 'ControlOrMeta+a', handler: fn },
    ]);
    expect(km.maps).toEqual([
      {
        desc: 'test',
        keyList: ['control', 'a'],
        keys: 'control+a',
        rawKeys: 'Control+a',
      },
      {
        desc: 'test2',
        keyList: ['meta', 'a'],
        keys: 'controlormeta+a',
        rawKeys: 'ControlOrMeta+a',
      },
    ]);
  });
});
