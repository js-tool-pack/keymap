/**
 * 需要注册的快捷键绑定参数对象
 */
export interface KeyOptions {
  /**
   * 单个组合快捷键或多个组合快捷键
   * @example
   * 'MetaOrControl+a'
   * 'MetaOrCtrl+a'
   * 'CmdOrCtrl+a'
   * 'CommandOrCtrl+a'
   * 'Ctrl+a'
   * 'Meta+a'
   */
  keys: string[] | string;
  /**
   * 快捷键触发时调用的函数
   */
  handler: (this: HandledKeyOptions, e?: KeyboardEvent) => any;
  /**
   * 描述
   */
  desc?: string;
}

/**
 * 处理后的快捷键参数对象
 */
export type HandledKeyOptions = Omit<KeyOptions, 'keys'> & {
  keys: string;
  rawKeys: string[] | string;
  keyList: string[];
};

/**
 * 按键绑定策略类型
 *
 * recordAll 记忆全部按下的按键
 *
 * recordCompose 只记组合键,如果是复合普通键的话是无效的，可以使用recordAll
 *
 * 为什么要分两种策略，因为recordAll是通过keyup去移除已经按下的按键，在mac里面按下meta键后普通键keyup无效，所以分为了两种策略
 *
 * 默认使用recordCompose不会漏键，如果没有meta键的系统可以使用recordAll，组合更加随意
 */
export type StrategyType = 'recordAll' | 'recordCompose';

/**
 * 策略声明类型
 */
export type Strategy = <T extends HTMLElement | Window>(
  el: T,
  maps: HandledKeyOptions[],
) => () => void;
