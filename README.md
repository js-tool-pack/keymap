# @tool-pack/keymap

🛠 keymap,键盘快捷键绑定工具。

此工具来源于 [mditor-useKeymap](https://github.com/mditor-dev/mditor/blob/af73e66/src/utils/useKeymap.ts) 函数，在此抽取成独立库。

[**api 文档**](https://js-tool-pack.github.io/keymap/)

[**在线例子**](https://stackblitz.com/edit/typescript-njbsqn?file=package.json,index.ts)

## 使用方式

```shell
npm install @tool-pack/keymap --save
```

## 使用

```typescript
import { Keymap } from '@tool-pack/keymap';

// 初始添加2个快捷键
const km = new Keymap([
  {
    keys: 'CtrlOrMeta+l',
    desc: 'test1',
    handler() {
      alert(this.rawKeys);
    },
  },
  {
    keys: 'CtrlOrMeta+k',
    desc: 'test2',
    handler() {
      alert(this.rawKeys);
    },
  },
]);

// 后追加，触发后移除
km.add({
  keys: 'shift+a',
  handler() {
    alert(this.rawKeys);
    km.remove('shift+a');
  },
});

// destroy
km.add({
  keys: 'CtrlOrMeta+shift+d',
  handler() {
    km.destroy();
  },
});
```
