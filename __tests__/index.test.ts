import * as testTarget from '../src';

describe('keymap', function () {
  test('base', () => {
    const fn = jest.fn();
    const km = new testTarget.Keymap([{ keys: 'Control+a', handler: fn }]);
    expect(fn.mock.calls.length).toBe(0);

    km.trigger('Control+a');
    expect(fn.mock.calls.length).toBe(1);

    km.trigger('Control+a');
    km.trigger('Control+a');
    expect(fn.mock.calls.length).toBe(3);
  });
  test('clear', () => {
    const fn = jest.fn();
    const km = new testTarget.Keymap([{ keys: 'Control+a', handler: fn }]);
    expect(fn.mock.calls.length).toBe(0);

    km.trigger('Control+a');
    expect(fn.mock.calls.length).toBe(1);

    km.clear();

    km.trigger('Control+a');
    km.trigger('Control+a');
    expect(fn.mock.calls.length).toBe(1);
  });
});
