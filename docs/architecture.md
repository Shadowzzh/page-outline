# Page Outline 架构文档

## 项目概述

Page Outline 是一个 Chrome 扩展，用于为任意网页生成目录大纲。基于 WXT 框架开发，使用 React 19 + Zustand + Tailwind CSS 4 + shadcn/ui 技术栈。

## 技术栈

| 技术 | 用途 |
|------|------|
| WXT | Chrome 扩展框架 |
| React 19 | UI 框架 |
| Zustand | 状态管理 |
| Tailwind CSS 4 | 样式 |
| shadcn/ui | UI 组件库 |
| Defuddle | 内容提取 |
| Lucide React | 图标 |

## 文件结构

```
page-outline/
├── components/                 # React 组件
│   ├── outline/               # 大纲相关组件
│   │   ├── outline-panel.tsx  # 大纲面板容器
│   │   ├── outline-tree.tsx   # 大纲树组件
│   │   └── tree-node.tsx      # 树节点组件
│   ├── panel/                 # 面板相关组件
│   │   ├── draggable-panel.tsx # 可拖拽面板
│   │   └── panel-header.tsx   # 面板头部（控制按钮）
│   └── ui/                    # shadcn/ui 组件
│       └── button.tsx
│
├── core/                      # 核心业务逻辑
│   ├── panel/
│   │   ├── drag-controller.ts # 拖拽控制器
│   │   └── viewport-adapter.ts # 视口适配器
│   ├── scroll/
│   │   └── tracker.ts         # 滚动追踪器
│   └── tree/
│       └── builder.ts         # 树结构构建器
│
├── entrypoints/               # WXT 入口文件
│   ├── background.ts          # Service Worker
│   └── content/               # Content Script
│       ├── index.tsx          # 入口（Shadow DOM）
│       ├── App.tsx            # 根组件
│       └── styles/
│           └── globals.css    # Tailwind 全局样式
│
├── lib/                       # 基础设施层
│   ├── browser/               # 浏览器 API 封装
│   │   ├── dom.ts             # DOM 操作
│   │   ├── observer.ts        # MutationObserver
│   │   ├── storage.ts         # Chrome Storage
│   │   └── viewport.ts        # 视口计算
│   ├── defuddle/
│   │   └── client.ts          # Defuddle 客户端
│   ├── tree/
│   │   ├── filter.ts          # 树过滤（按层级）
│   │   └── traverse.ts        # 树遍历
│   └── utils.ts               # 工具函数（cn）
│
├── store/                     # Zustand 状态管理
│   ├── content-store.ts       # 内容/大纲状态
│   ├── expand-store.ts        # 展开/折叠状态
│   ├── panel-store.ts         # 面板状态
│   ├── scroll-store.ts        # 滚动追踪状态
│   └── theme-store.ts         # 主题状态
│
├── types/
│   └── index.ts               # TypeScript 类型定义
│
├── wxt.config.ts              # WXT 配置
├── web-ext.config.ts          # 开发浏览器配置
├── components.json            # shadcn/ui 配置
└── package.json
```

## 架构分层

```
┌─────────────────────────────────────────┐
│              UI 层 (components/)         │
│   outline-panel, tree-node, button      │
├─────────────────────────────────────────┤
│           状态管理层 (store/)            │
│  content-store, panel-store, theme...   │
├─────────────────────────────────────────┤
│           业务逻辑层 (core/)             │
│  TreeBuilder, ScrollTracker, Drag...    │
├─────────────────────────────────────────┤
│           基础设施层 (lib/)              │
│    dom, storage, viewport, defuddle     │
└─────────────────────────────────────────┘
```

## 数据流

```
用户点击扩展图标
        │
        ▼
┌───────────────────┐
│   background.ts   │  监听 action.onClicked
│  (Service Worker) │  发送 toggle-panel 消息
└─────────┬─────────┘
          │ browser.tabs.sendMessage
          ▼
┌───────────────────┐
│ content/index.tsx │  监听消息
│  (Content Script) │  调用 panelStore.toggle()
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   panel-store.ts  │  更新 isOpen 状态
│                   │  触发 UI 重新渲染
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ draggable-panel   │  面板显示/隐藏
│                   │  首次打开时提取内容
└─────────┬─────────┘
          │ contentStore.extract()
          ▼
┌───────────────────┐
│  content-store.ts │  1. 使用 Defuddle 提取内容
│                   │  2. 使用 TreeBuilder 构建树
│                   │  3. 存储 tree 和 rawTree
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   outline-tree    │  渲染大纲树
│    tree-node      │  处理点击/展开
└───────────────────┘
```

## 核心流程

### 1. 内容提取

```typescript
// content-store.ts
extract: async () => {
  // 1. 使用 Defuddle 提取主要内容区域
  const content = await extractContent()

  // 2. 查找所有标题元素
  const headings = findHeadings(content)

  // 3. 构建层级树结构
  const tree = new TreeBuilder().build(headings)

  // 4. 存储原始树和过滤后的树
  set({ rawTree: tree, tree: cloneTree(tree) })
}
```

### 2. 滚动追踪

```typescript
// scroll-store.ts
startTracking: (tree) => {
  // 使用 IntersectionObserver 监听标题可见性
  tracker.observe(tree, (activeId) => {
    set({ activeId })
  })
}
```

### 3. 面板拖拽

```typescript
// drag-controller.ts
class DragController {
  start(e) { /* 记录初始位置 */ }
  move(e)  { /* 计算新位置，约束在视口内 */ }
  end()    { /* 保存位置到 storage */ }
}
```

## 状态管理

| Store | 职责 | 持久化 |
|-------|------|--------|
| content-store | 大纲内容、层级过滤 | 否 |
| panel-store | 面板位置、大小、开关 | Chrome Storage |
| scroll-store | 当前激活的标题 | 否 |
| expand-store | 节点展开状态 | Chrome Storage |
| theme-store | 主题设置 | Chrome Storage |

## Shadow DOM 隔离

Content Script 使用 Shadow DOM 隔离样式，避免与宿主页面冲突：

```typescript
// content/index.tsx
const ui = await createShadowRootUi(ctx, {
  name: "page-outline",
  onMount: (container, shadow) => {
    // 注入样式到 Shadow DOM
    const styleEl = document.createElement("style")
    styleEl.textContent = styles // Tailwind CSS inline
    shadow.appendChild(styleEl)

    // 渲染 React 应用
    const root = ReactDOM.createRoot(container)
    root.render(<App host={host} />)
  }
})
```

## 开发命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm typecheck    # TypeScript 类型检查
pnpm lint:fix     # Biome lint 修复
pnpm all          # format + typecheck + lint
```

## 添加 shadcn 组件

```bash
pnpm dlx shadcn@latest add <component-name>
```
