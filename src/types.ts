export interface KeyMap {
  keys: string;
  handler: (e?: KeyboardEvent) => any;
  desc?: string;
}

export type HandledKeyMap = KeyMap & { rawKeys: string; keyList: string[] };

export type KeymapStrategy = 'recordAll' | 'recordCompose';
export type Handler = <T extends HTMLElement | Window>(el: T, maps: HandledKeyMap[]) => () => void;
