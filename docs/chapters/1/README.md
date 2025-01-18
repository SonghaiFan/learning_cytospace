# 1. 环境搭建与初始化

本章节将介绍两种使用 Cytoscape.js 的方式：

1. 传统方式：使用纯 HTML 和 JavaScript
2. 现代方式：使用 React 和 NPM

## 实现方式对比

### 传统方式特点

- 优点：
  - 简单直接，无需构建工具
  - 适合快速原型开发
  - 容易集成到现有网页
- 缺点：
  - 缺乏类型检查
  - 不易维护和扩展
  - 难以复用代码

### React 方式特点

- 优点：
  - 类型安全（TypeScript）
  - 组件化和可复用
  - 响应式更新
  - 更好的代码组织
  - 完整的开发工具链
- 缺点：
  - 需要构建工具
  - 学习曲线较陡
  - 初始设置较复杂

## 环境搭建

### 传统方式

1. 创建项目目录
2. 使用 CDN 引入 Cytoscape.js：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
```

### React 方式

1. 创建 Next.js 项目：

```bash
npx create-next-app@latest my-cytoscape-app
cd my-cytoscape-app
```

2. 选择项目配置：

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: Yes

3. 安装依赖：

```bash
npm install cytoscape @types/cytoscape
```

## 基本实现

### 传统方式实现

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js - 传统方式实现</title>
    <!-- 从 CDN 加载 Cytoscape.js -->
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
      <h1>Cytoscape.js 传统实现示例</h1>
    </div>
    <div id="cy"></div>
    <script>
      const cy = cytoscape({
        container: document.getElementById("cy"),
        elements: [],
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
        layout: {
          name: "grid",
        },
      });
    </script>
  </body>
</html>
```

### React 方式实现

1. 创建可复用组件 (`src/components/CytoscapeGraph.tsx`)：

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

    // 初始化 Cytoscape 实例
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style,
      layout,
    });

    // 清理函数
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []); // 仅在组件挂载时初始化

  // 更新元素
  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.elements().remove();
    cyRef.current.add(elements);
    cyRef.current.layout(layout).run();
  }, [elements, layout]);

  // 更新样式
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

2. 使用组件 (`src/app/page.tsx`)：

```typescript
import { CytoscapeGraph } from "@/components/CytoscapeGraph";

export default function Home() {
  const elements = [
    // 节点
    { data: { id: "a", label: "节点 A" } },
    { data: { id: "b", label: "节点 B" } },
    // 边
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
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
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

## 配置参数说明

无论使用哪种方式，Cytoscape.js 的核心配置参数都是一致的：

### 必要配置

- `container`: 指定图形容器元素
- `elements`: 初始的节点和边集合
- `style`: 样式定义数组
- `layout`: 布局配置对象

### 容器样式要求

容器元素必须设置明确的宽度和高度：

```css
/* 传统方式 */
#cy {
  width: 600px;
  height: 400px;
  border: 1px solid #ccc;
}

/* React/Tailwind 方式 */
className="w-full h-[600px] border border-gray-200"
```

## 后续章节说明

从下一章开始，所有功能示例都将同时提供两种实现方式：

1. 传统方式：使用纯 HTML 和 JavaScript 的实现
2. React 方式：使用 TypeScript 和 React 组件的实现

这样可以帮助你：

- 理解不同实现方式的差异
- 选择适合自己项目的方案
- 掌握两种技术栈的最佳实践
