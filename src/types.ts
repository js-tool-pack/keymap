/**
 * 未处理的快捷键绑定参数对象
 */
export interface KeyMap {
  /**
   * 快捷键
   * @example
   * 'MetaOrControl+a'
   */
  keys: string;
  /**
   * 快捷键触发时调用的函数
   */
  handler: (this: HandledKeyMap, e?: KeyboardEvent) => any;
  /**
   * 描述
   */
  desc?: string;
}

/**
 * 处理后的快捷键参数对象
 */
export type HandledKeyMap = KeyMap & { rawKeys: string; keyList: string[] };

/**
 * 按键绑定策略
 *
 * recordAll 记忆全部按下的按键
 *
 * recordCompose 只记组合键,如果是复合普通键的话是无效的，可以使用recordAll
 *
 * 为什么要分两种策略，因为recordAll是通过keyup去移除已经按下的按键，在mac里面按下meta键后普通键keyup无效，所以分为了两种策略
 *
 * 默认使用recordCompose不会漏键，如果没有meta键的系统可以使用recordAll，组合更加随意
 */
export type KeymapStrategy = 'recordAll' | 'recordCompose';

/**
 * 策略声明类型
 */
export type Strategy = <T extends HTMLElement | Window>(el: T, maps: HandledKeyMap[]) => () => void;
