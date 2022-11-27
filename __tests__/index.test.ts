import * as testTarget from '../src';

describe('keymap', function () {
  test('base', () => {
    expect(testTarget.test()).toBe('test');
  });
});
