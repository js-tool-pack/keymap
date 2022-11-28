# @tool-pack/keymap

> 🛠 keymap,键盘快捷键绑定工具。
>
> keymap 是一个用于浏览器的库。它允许开发人员轻松设置快捷键绑定，使用按键组合设置复杂的绑定。keymap 还提供了绑定不同的 dom，可以使用不同的 dom 绑定不同的事件，允许你将绑定范围化到应用程序的各个部分。

此工具来源于 [mditor-useKeymap](https://github.com/mditor-dev/mditor/blob/af73e66/src/utils/useKeymap.ts) 函数，在此优化并抽取成独立库。

- [document](https://js-tool-pack.github.io/keymap/)
- [demo](https://stackblitz.com/edit/typescript-b6dzrc?file=index.ts)

## 快速使用

### 安装

#### npm module

```shell
npm install @tool-pack/keymap --save
```

keymap 支持 esm 与 commonjs 两种模块导入方式

```typescript
import { Keymap } from '@tool-pack/keymap';

new Keymap([
  {
    keys: 'MetaOrCtrl+a',
    desc: 'test',
    handler() {
      /* to something */
    },
  },
]);
```

#### cdn

```html
<script src="https://cdn.jsdelivr.net/npm/@tool-pack/keymap/dist/keymap.global.prod.js"></script>
<script>
  new Keymap.Keymap([
    {
      keys: 'MetaOrCtrl+a',
      desc: 'test',
      handler() {
        /* to something */
      },
    },
  ]);
</script>
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
    desc: 'open file，打开文件（在safari中可能会被浏览器默认快捷键覆盖）',
    handler(e) {
      alert(this.desc);
      return preventDefault(e);
    },
  },
  {
    keys: 'CtrlOrMeta+k',
    desc: 'windows edge 会在alert关闭后打开地址栏输入框',
    handler() {
      alert(this.desc);
    },
  },
]);

// 后追加，触发后移除
km.add({
  keys: ['shift+a', 'shift+b'],
  desc: 'once event，一次性快捷键，各自可触发一次事件',
  handler() {
    alert(this.desc);
    km.remove(this.keys);
  },
});

km.add({
  keys: ['shift+c', 'shift+d'],
  desc: 'once event，次数共享',
  handler() {
    alert(this.desc);

    const keysList = Array.isArray(this.rawKeys) ? this.rawKeys : [this.rawKeys];
    keysList.forEach((keys) => km.remove(keys));
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

注意 ⚠️：

浏览器有自己的快捷方式，例如，在大多数浏览器中， ctrl+o 的意思是“打开文件”。
虽然在通常情况下，你可以随时调用 e.preventDefault()，
但 ctrl+o 毕竟是浏览器快捷键的一部分，具体实现并不通用，
例如在 safari 上 js 无法拦截默认事件，也不会触发自定义快捷键。

#### 任意组合键

由于 macos 的 bug：按下 meta 键后，普通的按键 keyup 会漏掉，
所以默认了一种不会漏 keyup 的策略，但是这也导致了不能使用任意组合键，
只能用特殊键搭配普通键

```typescript
import { Keymap } from '@tool-pack/keymap';

const km = new Keymap({ el: window, strategy: 'recordAll' }, [
  {
    keys: 'a+b',
    desc: 'a+b',
    handler(e) {
      alert(this.desc);
      return preventDefault(e);
    },
  },
]);
```
