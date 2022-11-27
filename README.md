# @tool-pack/keymap

🛠 keymap,键盘快捷键绑定工具。

此工具来源于 [mditor-useKeymap](https://github.com/mditor-dev/mditor/blob/af73e66/src/utils/useKeymap.ts) 函数，在此抽取成独立库。

- [document](https://js-tool-pack.github.io/keymap/)
- [demo](https://stackblitz.com/edit/typescript-b6dzrc?file=index.ts)

## 使用方式

```shell
npm install @tool-pack/keymap --save
```

## 使用

```typescript
import { Keymap } from '@tool-pack/keymap';

function preventDefault(e: KeyboardEvent) {
  e.preventDefault();
  e.stopPropagation();
  e.returnValue = false;
  return false;
}

// CtrlOrMeta在macos是meta键，在非macos是control键
// 初始添加多个快捷键
const km = new Keymap([
  {
    keys: 'Shift+*',
    desc: '*，不能单独用*，也不是shift + 8',
    handler(e) {
      alert(this.desc);

      return preventDefault(e);
    },
  },
  {
    keys: 'Ctrl+Shift+8',
    desc: '加了ctrl后*又不行了，要改为8',
    handler(e) {
      alert(this.rawKeys);

      return preventDefault(e);
    },
  },
  {
    keys: 'Shift+&',
    desc: '&',
    handler(e) {
      alert(this.desc);

      return preventDefault(e);
    },
  },
  {
    keys: 'CtrlOrMeta+s',
    desc: 'save，保存',
    handler(e) {
      alert(this.desc);

      return preventDefault(e);
    },
  },
  {
    keys: 'CtrlOrMeta+shift+s',
    desc: 'save as，另存为',
    handler(e) {
      alert(this.desc);

      return preventDefault(e);
    },
  },
  {
    keys: 'CtrlOrMeta+o',
    desc: 'open file，打开文件',
    handler(e) {
      alert(this.desc);

      return preventDefault(e);
    },
  },
  {
    keys: 'CtrlOrMeta+k',
    desc: 'test',
    handler() {
      alert(this.keyList.join(','));
    },
  },
]);

// 后追加，触发后移除
km.add({
  keys: 'shift+a',
  desc: 'once event，一次性快捷键，只在第一次有效',
  handler() {
    alert(this.desc);
    km.remove(this.rawKeys);
  },
});

// destroy
km.add({
  keys: 'CtrlOrMeta+shift+d',
  desc: 'destroy, 触发后会解除所有的快捷键绑定',
  handler(e) {
    km.destroy();
    alert('destray');

    return preventDefault(e);
  },
});
```
