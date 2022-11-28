import { isMac, handleKeys, castArray } from '../src/utils';

describe('utils', function () {
  let origin: string;
  beforeEach(() => {
    origin = isMac.userAgent;
  });
  afterEach(() => {
    isMac.userAgent = origin;
  });
  test('isMac', () => {
    isMac.userAgent = '1111';
    expect(isMac()).toBeFalsy();

    isMac.userAgent = 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/20.0.0';
    expect(isMac()).toBeTruthy();

    isMac.userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.56';
    expect(isMac()).toBeTruthy();
  });
  test('handleKeys', () => {
    isMac.userAgent = 'mac';
    expect(handleKeys('Control+a')).toEqual(['control+a', ['control', 'a']]);
    expect(handleKeys('ctrl+a')).toEqual(['ctrl+a', ['control', 'a']]);
    expect(handleKeys('ControlOrMeta+a')).toEqual(['controlormeta+a', ['meta', 'a']]);
    expect(handleKeys('CommandOrControl+a')).toEqual(['commandorcontrol+a', ['meta', 'a']]);
    expect(handleKeys('Command+a')).toEqual(['command+a', ['meta', 'a']]);
    expect(handleKeys('meta+a')).toEqual(['meta+a', ['meta', 'a']]);
    expect(handleKeys('cmd+a')).toEqual(['cmd+a', ['meta', 'a']]);
    expect(handleKeys('Mod+a')).toEqual(['mod+a', ['meta', 'a']]);
    isMac.userAgent = '';
    expect(handleKeys('ControlOrMeta+a')).toEqual(['controlormeta+a', ['control', 'a']]);
    expect(handleKeys('ControlOrMeta++')).toEqual(['controlormeta++', ['control', '+']]);
    expect(handleKeys('Option+a')).toEqual(['option+a', ['alt', 'a']]);
    expect(handleKeys('ESC+a')).toEqual(['esc+a', ['escape', 'a']]);
    expect(handleKeys('return+a')).toEqual(['return+a', ['enter', 'a']]);
    expect(handleKeys('plus+a')).toEqual(['plus+a', ['+', 'a']]);
    expect(handleKeys('space')).toEqual(['space', [' ']]);
    expect(handleKeys(' ')).toEqual([' ', [' ']]);
    expect(handleKeys('␣')).toEqual(['␣', [' ']]);
    expect(handleKeys('⏎')).toEqual(['⏎', ['enter']]);
  });
  test('castArray', () => {
    const fn = castArray;
    expect(fn(0)).toEqual([0]);
    expect(fn('')).toEqual(['']);
    expect(fn([1, 2, 3])).toEqual([1, 2, 3]);
  });
});
