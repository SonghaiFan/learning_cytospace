# 1. 环境搭建与初始化

> [查看示例代码](https://github.com/SonghaiFan/learning_cytospace/tree/main/cytoscape_learning_code/1-环境搭建与初始化) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/1-环境搭建与初始化/index.html)

本章节将介绍如何使用 Cytoscape.js 构建图可视化应用。我们将通过两种实现方式来展示：

1. VanillaJS 方式：使用纯 HTML 和 JavaScript
2. React 方式：使用 TypeScript 和 Next.js

## VanillaJS 实现

### 基础环境配置

1. 创建一个新的 HTML 文件
2. 通过 CDN 引入 Cytoscape.js：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
```

### 基本页面结构

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js - VanillaJS实现</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
    <style>
      #cy {
        width: 600px;
        height: 400px;
        border: 1px solid #ccc;
        margin: 20px auto;
      }
      .controls {
        text-align: center;
        margin: 20px;
      }
    </style>
  </head>
  <body>
    <div class="controls">
      <h1>Cytoscape.js VanillaJS实现示例</h1>
    </div>
    <div id="cy"></div>
  </body>
</html>
```

### 初始化图实例

```javascript
const cy = cytoscape({
  // 容器元素
  container: document.getElementById("cy"),

  // 图中的元素（节点和边）
  elements: [],

  // 样式定义
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(id)",
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#999",
      },
    },
  ],

  // 布局配置
  layout: {
    name: "grid",
  },
});
```

## React 实现

### 项目初始化

1. 创建 Next.js 项目：

```bash
npx create-next-app@latest my-cytoscape-app --typescript
cd my-cytoscape-app
```

2. 安装依赖：

```bash
npm install cytoscape @types/cytoscape
```

### 创建 Cytoscape 组件

创建 `src/components/CytoscapeGraph.tsx`：

```typescript
"use client";

import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

interface CytoscapeGraphProps {
  elements?: cytoscape.ElementDefinition[];
  style?: cytoscape.Stylesheet[];
  layout?: cytoscape.LayoutOptions;
  className?: string;
}

export function CytoscapeGraph({
  elements = [],
  style = [],
  layout = { name: "grid" },
  className = "",
}: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style,
      layout,
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.elements().remove();
    cyRef.current.add(elements);
    cyRef.current.layout(layout).run();
  }, [elements, layout]);

  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.style(style);
  }, [style]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-[600px] border border-gray-200 rounded-lg ${className}`}
    />
  );
}
```

### 使用组件

在页面中使用 (`src/app/page.tsx`)：

```typescript
import { CytoscapeGraph } from "@/components/CytoscapeGraph";

export default function Home() {
  const elements = [
    { data: { id: "a", label: "节点 A" } },
    { data: { id: "b", label: "节点 B" } },
    { data: { id: "ab", source: "a", target: "b", label: "关系 AB" } },
  ];

  const style = [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(label)",
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#999",
        label: "data(label)",
      },
    },
  ];

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cytoscape React 示例</h1>
      <CytoscapeGraph
        elements={elements}
        style={style}
        layout={{ name: "grid" }}
      />
    </main>
  );
}
```

## 实现方式对比

### VanillaJS 方式

优点：

- 简单直接，无需构建工具
- 适合快速原型开发
- 容易集成到现有网页

缺点：

- 缺乏类型检查
- 不易维护和扩展
- 难以复用代码

### React 方式

优点：

- 类型安全（TypeScript）
- 组件化和可复用
- 响应式更新
- 更好的代码组织
- 完整的开发工具链

缺点：

- 需要构建工具
- 学习曲线较陡
- 初始设置较复杂

## 核心配置参数

无论使用哪种方式，Cytoscape.js 的核心配置参数都包括：

1. `container`: 图实例的容器元素
2. `elements`: 图中的节点和边定义
3. `style`: 图的样式规则
4. `layout`: 图的布局算法和参数

这些参数可以在初始化时设置，也可以在运行时动态修改。

## 后续章节说明

从下一章开始，所有功能示例都将同时提供两种实现方式：

1. 传统方式：使用纯 HTML 和 JavaScript 的实现
2. React 方式：使用 TypeScript 和 React 组件的实现

这样可以帮助你：

- 理解不同实现方式的差异
- 选择适合自己项目的方案
- 掌握两种技术栈的最佳实践
