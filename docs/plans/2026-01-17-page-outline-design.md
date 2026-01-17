# Page Outline 设计文档

> 使用 Defuddle + WXT + React + shadcn/ui 的现代技术栈重构 Quick Nav

**日期**: 2026-01-17
**状态**: 设计阶段
**版本**: 1.0

---

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术栈](#2-技术栈)
- [3. 架构设计](#3-架构设计)
- [4. 核心功能模块](#4-核心功能模块)
- [5. 目录结构](#5-目录结构)
- [6. 实现计划](#6-实现计划)

---

## 1. 项目概述

### 1.1 项目定位

**Page Outline** 是一个 Chrome 浏览器扩展（Manifest V3），主要功能是：
- 自动为网页内容生成目录（TOC）
- 用户可以通过点击目录项快速跳转到对应章节
- 支持拖拽、缩放、主题切换等交互功能

### 1.2 技术选型理由

| 技术 | 选型理由 |
|------|----------|
| **Defuddle** | 成熟的内容提取库，自动识别并清理网页主要内容 |
| **WXT** | 现代化的 Chrome 扩展开发框架，支持热更新和类型检查 |
| **React** | 生态丰富，开发体验好，社区活跃 |
| **shadcn/ui** | 精美的无障碍组件库，基于 Radix UI 和 Tailwind CSS |
| **Zustand** | 轻量级状态管理，API 简洁，支持持久化 |
| **TypeScript** | 类型安全，提升代码质量和可维护性 |

### 1.3 与原 Quick Nav 的对比

| 特性 | Quick Nav (原版) | Page Outline (新版) |
|------|-----------------|-------------------|
| UI 框架 | Lit (Web Components) | React + shadcn/ui |
| 内容提取 | 自定义权重算法 | Defuddle |
| 状态管理 | 无 | Zustand |
| 样式方案 | 自定义 CSS | Tailwind CSS + CSS Variables |
| 类型系统 | TypeScript | TypeScript (更严格) |

---

## 2. 技术栈

### 2.1 核心依赖

```json
{
  "defuddle": "^0.6.6",           // 内容提取
  "react": "^18.3.1",             // UI 框架
  "react-dom": "^18.3.1",
  "zustand": "^5.0.0",            // 状态管理
  "@radix-ui/react-*": "latest",  // shadcn/ui 依赖
  "tailwindcss": "^3.4.0",        // 样式
  "lucide-react": "^0.400.0"      // 图标库
}
```

### 2.2 开发依赖

```json
{
  "wxt": "^0.20.0",               // Chrome 扩展框架
  "typescript": "^5.6.0",         // 类型系统
  "@types/chrome": "^0.0.269"     // Chrome API 类型
}
```

---

## 3. 架构设计

### 3.1 四层架构

```
┌─────────────────────────────────────────┐
│      第四层：UI 展示层               │
│   (React Components + shadcn/ui)        │
├─────────────────────────────────────────┤
│      第三层：状态管理层              │
│        (Zustand Store)                  │
├─────────────────────────────────────────┤
│      第二层：业务逻辑层               │
│   (内容提取、树构建、滚动追踪)          │
├─────────────────────────────────────────┤
│      第一层：基础设施层               │
│  (浏览器 API、工具函数、Defuddle)       │
└─────────────────────────────────────────┘
```

### 3.2 层次依赖规则

- **上层可以调用下层，下层不能依赖上层**
- **第一层完全独立，可以单独测试**
- **第四层只负责展示，业务逻辑在下层**

### 3.3 数据流设计

**初始化流程**:
```
用户点击扩展图标
  → Background 发送消息
  → Content Script 懒加载
  → 调用 extractContent()
  → Defuddle 解析
  → TreeBuilder 构建标题树
  → 更新 Zustand Store
  → React 组件自动渲染
```

**滚动追踪流程**:
```
IntersectionObserver 检测标题可见性
  → ScrollTracker 计算激活节点
  → 更新 scrollStore.activeNodeId
  → React 组件自动重渲染
  → 高亮当前标题
```

**用户交互流程**:
```
用户点击标题
  → 调用 element.scrollIntoView()
  → 平滑滚动到对应位置
  → IntersectionObserver 触发
  → 更新激活状态
```

---

## 4. 核心功能模块

### 4.1 功能一：内容提取与标题树构建

#### 第一层：基础设施层

**模块：`lib/defuddle/client`**
- 封装 Defuddle API
- 接收 document 对象，返回清理后的 HTML 和元数据

**模块：`lib/browser/dom`**
- DOM 操作工具函数
- `getScrollElement()` 获取滚动容器
- `getElementDepth()` 计算元素深度

#### 第二层：业务逻辑层

**模块：`core/tree/builder`**
- `TreeBuilder` 类
- `build()` 方法：构建标题树
- 使用栈算法将扁平标题列表转换为树形结构

#### 第三层：状态管理层

**模块：`store/content-store`**
- Zustand Store 管理内容状态
- 状态：`tree`, `rawTree`, `title`
- 操作：`extract()`, `refresh()`, `setTree()`
- 支持持久化到 Chrome Storage

#### 第四层：UI 展示层

**组件：`components/outline/outline-panel.tsx`**
- 面板根组件
- 初始化时调用 `extract()`

**组件：`components/outline/outline-tree.tsx`**
- 递归树形组件
- 渲染标题层级结构

---

### 4.2 功能二：实时滚动追踪

#### 第一层：基础设施层

**模块：`lib/browser/observer`**
- 封装 IntersectionObserver API
- `createIntersectionObserver()` 工厂函数
- `observeElements()` 批量观察元素

#### 第二层：业务逻辑层

**模块：`core/scroll/tracker`**
- `ScrollTracker` 类
- `start()` 方法：启动追踪
- `findActiveNode()` 方法：计算当前激活的标题
- `stop()` 方法：停止追踪

#### 第三层：状态管理层

**模块：`store/scroll-store`**
- Zustand Store 管理滚动状态
- 状态：`activeNodeId`, `tracker`
- 操作：`setActiveNode()`, `startTracking()`, `stopTracking()`

#### 第四层：UI 展示层

**组件：`components/outline/tree-node.tsx`**
- 根据 `activeNodeId` 高亮当前节点
- 使用 `cn()` 工具函数动态添加类名

---

### 4.3 功能三：可拖拽面板（含浏览器缩放适配）

#### 第一层：基础设施层

**模块：`lib/browser/viewport`**
- `getViewportSize()` 获取视口大小
- `subscribeViewportChange()` 监听视口变化（包括缩放）
- `clampToViewport()` 边界检查

**模块：`lib/browser/storage`**
- Chrome Storage API 封装
- `getPanelPosition()`, `setPanelPosition()`
- `getPanelSize()`, `setPanelSize()`

#### 第二层：业务逻辑层

**模块：`core/panel/drag-controller`**
- `DragController` 类
- `startDrag()` 方法：开始拖拽
- 实时计算新位置并调用边界检查

**模块：`core/panel/viewport-adapter`**
- `ViewportAdapter` 类
- 监听浏览器缩放和窗口大小变化
- `reclampPosition()` 方法：重新计算面板位置

#### 第三层：状态管理层

**模块：`store/panel-store`**
- Zustand Store 管理面板状态
- 状态：`position`, `size`, `isOpen`, `dragController`, `viewportAdapter`
- 操作：`setPosition()`, `setSize()`, `startDrag()`, `open()`, `close()`
- `init()` 方法：初始化，加载保存的位置并检查边界

#### 第四层：UI 展示层

**组件：`components/panel/draggable-panel.tsx`**
- 可拖拽面板容器
- `useEffect` 初始化和清理
- `onMouseDown` 处理拖拽开始

**组件：`components/panel/panel-header.tsx`**
- 面板头部（拖拽区域）
- 使用 `GripVertical` 图标表示可拖拽

---

### 4.4 功能四：层级过滤（Zoom）

#### 第一层：基础设施层

**模块：`lib/tree/filter`**
- `filterTreeByLevel()` 函数：根据层级过滤树
- `cloneTree()` 函数：深拷贝树结构

#### 第二层：业务逻辑层

**模块：`core/tree/zoom-controller`**
- `ZoomController` 类
- `filter()` 方法：调用过滤函数

#### 第三层：状态管理层

**模块：`store/content-store`** (集成)
- 状态：`zoomLevel` (1-6)
- 操作：`setZoomLevel()` - 过滤树并更新状态
- 持久化到 Chrome Storage

#### 第四层：UI 展示层

**组件：`components/header/zoom-controls.tsx`**
- `+` / `-` 按钮
- 显示当前层级（H1-H6）
- 边界检查（最小 1，最大 6）

---

### 4.5 功能五：展开/收起

#### 第一层：基础设施层

**模块：`lib/tree/traverse`**
- `findNodeById()` 函数：根据 ID 查找节点
- `getAllNodeIds()` 函数：获取所有节点 ID

#### 第二层：业务逻辑层

（此功能较简单，逻辑主要集中在状态管理）

#### 第三层：状态管理层

**模块：`store/expand-store`**
- Zustand Store 管理展开状态
- 状态：`expandedNodes` (Set<string>)
- 操作：`toggleNode()`, `expandAll()`, `collapseAll()`
- 持久化时需要将 Set 转换为数组

#### 第四层：UI 展示层

**组件：`components/header/expand-toggle.tsx`**
- 全部展开/收起按钮
- 图标切换：`UnfoldAll` / `FoldAll`

**组件：`components/outline/tree-node.tsx`**
- 根据 `expandedNodes` 控制子节点显示
- `ChevronRight` 图标旋转动画

---

### 4.6 功能六：主题切换

#### 第一层：基础设施层

**模块：`lib/browser/theme`**
- `applyTheme()` 函数：应用主题到 document
- `subscribeSystemThemeChange()` 监听系统主题变化

#### 第二层：业务逻辑层

（此功能较简单，逻辑主要集中在状态管理）

#### 第三层：状态管理层

**模块：`store/theme-store`**
- Zustand Store 管理主题状态
- 状态：`theme` ('light' | 'dark' | 'system')
- 操作：`setTheme()` - 应用主题并更新状态
- 持久化到 Chrome Storage

#### 第四层：UI 展示层

**组件：`components/header/theme-toggle.tsx`**
- 下拉菜单：亮色 / 暗色 / 跟随系统
- 图标：`Sun` / `Moon` / `Monitor`

---

## 5. 目录结构

```
src/
├── lib/                          # 第一层：基础设施层
│   ├── browser/
│   │   ├── dom.ts               # DOM 操作工具
│   │   ├── observer.ts          # IntersectionObserver 封装
│   │   ├── viewport.ts          # 视口工具（含缩放适配）
│   │   ├── storage.ts           # Chrome Storage 封装
│   │   └── theme.ts             # 主题工具
│   ├── defuddle/
│   │   └── client.ts            # Defuddle 客户端
│   └── tree/
│       ├── filter.ts            # 树过滤
│       └── traverse.ts          # 树遍历
│
├── core/                         # 第二层：业务逻辑层
│   ├── tree/
│   │   └── builder.ts           # 标题树构建器
│   ├── scroll/
│   │   └── tracker.ts           # 滚动追踪器
│   └── panel/
│       ├── drag-controller.ts   # 拖拽控制器
│       └── viewport-adapter.ts  # 视口适配器（处理缩放）
│
├── store/                        # 第三层：状态管理层
│   ├── content-store.ts         # 内容状态（含 zoom）
│   ├── scroll-store.ts          # 滚动状态
│   ├── panel-store.ts           # 面板状态
│   ├── expand-store.ts          # 展开状态
│   └── theme-store.ts           # 主题状态
│
├── components/                   # 第四层：UI 展示层
│   ├── panel/
│   │   ├── draggable-panel.tsx  # 可拖拽面板
│   │   └── panel-header.tsx     # 面板头部
│   ├── outline/
│   │   ├── outline-panel.tsx    # 大纲面板
│   │   ├── outline-tree.tsx     # 树形组件
│   │   └── tree-node.tsx        # 节点组件
│   ├── header/
│   │   ├── zoom-controls.tsx    # 缩放控制
│   │   ├── expand-toggle.tsx    # 展开/收起
│   │   ├── theme-toggle.tsx     # 主题切换
│   │   ├── refresh-button.tsx   # 刷新按钮
│   │   └── close-button.tsx     # 关闭按钮
│   └── ui/                       # shadcn/ui 组件
│       ├── button.tsx
│       ├── scroll-area.tsx
│       ├── dropdown-menu.tsx
│       ├── tooltip.tsx
│       └── ...
│
├── entrypoints/
│   ├── content.ts               # Content Script 入口
│   ├── background.ts            # Background Script
│   └── popup/                   # 扩展弹窗
│       ├── main.tsx
│       └── App.tsx
│
├── utils/
│   └── cn.ts                    # classNames 工具
│
├── styles/
│   └── globals.css              # 全局样式（Tailwind）
│
└── types/
    └── index.ts                 # 全局类型定义
```

---

## 6. 实现计划

### 6.1 阶段一：基础设施搭建

**目标**: 搭建项目框架，完成基础设施层

**任务**:
1. 初始化 WXT 项目
2. 安装依赖（Defuddle、React、Zustand、shadcn/ui）
3. 配置 TypeScript
4. 配置 Tailwind CSS
5. 初始化 shadcn/ui
6. 创建目录结构
7. 实现基础设施层模块
   - `lib/browser/dom`
   - `lib/browser/observer`
   - `lib/browser/viewport`
   - `lib/browser/storage`
   - `lib/browser/theme`
   - `lib/defuddle/client`
   - `lib/tree/filter`
   - `lib/tree/traverse`

**验收标准**:
- 所有工具函数可以独立测试
- TypeScript 编译通过
- shadcn/ui 组件可以正常使用

### 6.2 阶段二：内容提取与标题树构建

**目标**: 实现核心内容提取和树构建功能

**任务**:
1. 实现 `core/tree/builder.ts`
2. 实现 `store/content-store.ts`
3. 实现基础 UI 组件
   - `components/outline/outline-panel.tsx`
   - `components/outline/outline-tree.tsx`
   - `components/outline/tree-node.tsx`
4. 实现 Content Script 入口
5. 测试内容提取功能

**验收标准**:
- 可以正确提取页面主要内容
- 可以正确构建标题树
- UI 可以显示标题层级结构
- 点击标题可以跳转到对应位置

### 6.3 阶段三：滚动追踪

**目标**: 实现实时滚动追踪功能

**任务**:
1. 实现 `core/scroll/tracker.ts`
2. 实现 `store/scroll-store.ts`
3. 更新 `tree-node.tsx` 组件，添加激活状态
4. 测试滚动追踪功能

**验收标准**:
- 滚动页面时，当前标题高亮
- 高亮状态准确无误
- 性能良好，无卡顿

### 6.4 阶段四：可拖拽面板

**目标**: 实现可拖拽、可调整大小的面板

**任务**:
1. 实现 `core/panel/drag-controller.ts`
2. 实现 `core/panel/viewport-adapter.ts`
3. 实现 `store/panel-store.ts`
4. 实现 UI 组件
   - `components/panel/draggable-panel.tsx`
   - `components/panel/panel-header.tsx`
5. 测试拖拽和缩放适配

**验收标准**:
- 面板可以自由拖拽
- 拖拽时不超出视口边界
- 浏览器缩放时，面板位置自动调整
- 位置和尺寸可以持久化

### 6.5 阶段五：高级功能

**目标**: 实现层级过滤、展开/收起、主题切换

**任务**:
1. 实现层级过滤
   - 集成到 `content-store.ts`
   - 实现 `components/header/zoom-controls.tsx`
2. 实现展开/收起
   - 实现 `store/expand-store.ts`
   - 实现 `components/header/expand-toggle.tsx`
   - 更新 `tree-node.tsx` 支持展开/收起
3. 实现主题切换
   - 实现 `store/theme-store.ts`
   - 实现 `components/header/theme-toggle.tsx`
   - 配置 Tailwind CSS 主题变量
4. 实现其他按钮
   - `components/header/refresh-button.tsx`
   - `components/header/close-button.tsx`

**验收标准**:
- 层级过滤正常工作
- 展开/收起动画流畅
- 主题切换正常
- 所有按钮都有清晰的视觉反馈

### 6.6 阶段六：优化与测试

**目标**: 性能优化、兼容性测试、bug 修复

**任务**:
1. 性能优化
   - 虚拟滚动（如果标题数量很多）
   - 防抖/节流优化
   - 内存泄漏检查
2. 兼容性测试
   - 测试不同类型的网站
   - 测试浏览器缩放
   - 测试暗色/亮色主题
3. 用户体验优化
   - 加载状态
   - 错误提示
   - 快捷键支持
4. 打包和发布准备

**验收标准**:
- 性能良好，无卡顿
- 兼容主流网站
- 用户体验流畅
- 可以成功打包为 Chrome 扩展

---

## 附录

### A. 关键技术细节

#### A.1 浏览器缩放适配

浏览器缩放时，`window.innerWidth/innerHeight` 会变小，导致面板可能超出视口。

**解决方案**:
1. 监听 `window.resize` 事件（包括缩放）
2. 每次视口变化时，重新计算面板位置
3. 使用 `clampToViewport()` 确保面板不超出边界

```typescript
// 在 panel-store.init() 中
const adapter = new ViewportAdapter((size) => {
  const { position, size: panelSize } = get();
  const reclamped = adapter.reclampPosition(position, panelSize);
  set({ position: reclamped });
});
```

#### A.2 Set 持久化

Zustand 的 persist 中间件不能直接序列化 Set，需要转换。

```typescript
persist(
  (set) => ({
    expandedNodes: new Set<string>(),
    // ...
  }),
  {
    name: 'page-outline-expand',
    partialize: (state) => ({
      expandedNodes: Array.from(state.expandedNodes),
    }),
    merge: (persistedState: any, currentState) => ({
      ...currentState,
      expandedNodes: new Set(persistedState.expandedNodes || []),
    }),
  }
)
```

#### A.3 Defuddle 标题处理

Defuddle 会将 H1 转换为 H2，需要特殊处理。

```typescript
const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
```

查询时包含 H1，因为 Defuddle 可能没有完全转换。

### B. 参考资源

- [Defuddle GitHub](https://github.com/kepano/defuddle)
- [WXT Documentation](https://wxt.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)

---

**文档结束**
