# 3. 布局与视图控制

> [查看示例代码](https://github.com/SonghaiFan/learning_cytospace/tree/main/cytoscape_learning_code/3-布局与视图控制) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/3-布局与视图控制/index.html)

本章节将介绍 Cytoscape.js 中的布局系统和视图控制功能。每个功能都将提供传统方式和 React 方式两种实现。

## 布局系统概述

布局是图可视化中的核心功能之一。一个好的布局可以帮助用户更好地理解数据之间的关系。Cytoscape.js 提供了丰富的布局选项。

### 布局的分类

1. 离散布局 (Discrete Layouts)

   - 一次性设置所有节点位置
   - 通常基于几何模式组织节点
   - 执行速度快，计算成本低
   - 示例：grid, circle, concentric

2. 连续布局 (Continuous Layouts)
   - 通过多次迭代设置节点位置
   - 通常基于力导向算法
   - 可以产生更自然的布局效果
   - 示例：cose, cola, fcose

### 布局的同步性

1. 同步布局

   - 离散布局默认是同步的
   - 布局完成后可以立即访问节点位置
   - 适合需要立即获取结果的场景

2. 异步布局
   - 连续布局默认是异步的
   - 需要使用事件或 Promise 来处理布局完成
   - 适合复杂布局和动画效果

## 内置布局实现

### 传统方式实现

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <title>Cytoscape.js 布局示例</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
    <style>
      #cy {
        width: 600px;
        height: 400px;
        border: 1px solid #ccc;
      }
      .controls {
        margin: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="controls">
      <button onclick="changeLayout('grid')">网格布局</button>
      <button onclick="changeLayout('circle')">圆形布局</button>
      <button onclick="changeLayout('concentric')">同心圆布局</button>
      <button onclick="changeLayout('cose')">力导向布局</button>
    </div>
    <div id="cy"></div>
    <script>
      // 初始化图实例
      const cy = cytoscape({
        container: document.getElementById("cy"),
        elements: [
          // 节点
          { data: { id: "a" } },
          { data: { id: "b" } },
          { data: { id: "c" } },
          { data: { id: "d" } },
          // 边
          { data: { id: "ab", source: "a", target: "b" } },
          { data: { id: "bc", source: "b", target: "c" } },
          { data: { id: "cd", source: "c", target: "d" } },
          { data: { id: "da", source: "d", target: "a" } },
        ],
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
              "curve-style": "bezier",
            },
          },
        ],
      });

      // 布局配置
      const layoutConfigs = {
        grid: {
          name: "grid",
          rows: 2,
          animate: true,
        },
        circle: {
          name: "circle",
          animate: true,
        },
        concentric: {
          name: "concentric",
          minNodeSpacing: 50,
          animate: true,
        },
        cose: {
          name: "cose",
          animate: "end",
          randomize: false,
          componentSpacing: 40,
          nodeOverlap: 20,
          refresh: 20,
          fit: true,
          padding: 30,
          infinite: false,
        },
      };

      // 切换布局函数
      function changeLayout(name) {
        const layout = cy.layout(layoutConfigs[name]);
        layout.run();
      }

      // 初始布局
      changeLayout("grid");
    </script>
  </body>
</html>
```

### React 方式实现

1. 更新 `CytoscapeGraph` 组件以支持布局切换：

```typescript
// src/components/CytoscapeGraph.tsx
"use client";

import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

interface CytoscapeGraphProps {
  elements?: cytoscape.ElementDefinition[];
  style?: cytoscape.Stylesheet[];
  layout?: cytoscape.LayoutOptions;
  className?: string;
  onReady?: (cy: cytoscape.Core) => void;
}

export function CytoscapeGraph({
  elements = [],
  style = [],
  layout = { name: "grid" },
  className = "",
  onReady,
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

    if (onReady) {
      onReady(cyRef.current);
    }

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

2. 创建布局演示页面：

```typescript
// src/app/layouts/page.tsx
"use client";

import { useState } from "react";
import { CytoscapeGraph } from "@/components/CytoscapeGraph";
import type { LayoutOptions } from "cytoscape";

export default function LayoutsDemo() {
  const [currentLayout, setCurrentLayout] = useState<LayoutOptions>({
    name: "grid",
  });

  const elements = [
    // 节点
    { data: { id: "a" } },
    { data: { id: "b" } },
    { data: { id: "c" } },
    { data: { id: "d" } },
    // 边
    { data: { id: "ab", source: "a", target: "b" } },
    { data: { id: "bc", source: "b", target: "c" } },
    { data: { id: "cd", source: "c", target: "d" } },
    { data: { id: "da", source: "d", target: "a" } },
  ];

  const style = [
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
        "curve-style": "bezier",
      },
    },
  ];

  const layouts = {
    grid: {
      name: "grid",
      rows: 2,
      animate: true,
    },
    circle: {
      name: "circle",
      animate: true,
    },
    concentric: {
      name: "concentric",
      minNodeSpacing: 50,
      animate: true,
    },
    cose: {
      name: "cose",
      animate: "end",
      randomize: false,
      componentSpacing: 40,
      nodeOverlap: 20,
      refresh: 20,
      fit: true,
      padding: 30,
      infinite: false,
    },
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cytoscape.js 布局示例</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setCurrentLayout(layouts.grid)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          网格布局
        </button>
        <button
          onClick={() => setCurrentLayout(layouts.circle)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          圆形布局
        </button>
        <button
          onClick={() => setCurrentLayout(layouts.concentric)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          同心圆布局
        </button>
        <button
          onClick={() => setCurrentLayout(layouts.cose)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          力导向布局
        </button>
      </div>

      <CytoscapeGraph
        elements={elements}
        style={style}
        layout={currentLayout}
      />
    </main>
  );
}
```

## 布局配置详解

### 通用配置选项

所有布局都支持以下基本配置：

```typescript
interface BaseLayoutOptions {
  // 是否动画过渡
  animate?: boolean | "end";
  // 动画时长(ms)
  animationDuration?: number;
  // 是否自适应容器
  fit?: boolean;
  // 容器边距
  padding?: number;
  // 是否无限运行
  infinite?: boolean;
}
```

### 常用布局配置

1. 网格布局 (Grid)

```typescript
{
  name: "grid",
  rows?: number,     // 行数
  cols?: number,     // 列数
  position?: Function // 自定义位置函数
}
```

2. 圆形布局 (Circle)

```typescript
{
  name: "circle",
  radius?: number,    // 半径
  startAngle?: number // 起始角度
}
```

3. 同心圆布局 (Concentric)

```typescript
{
  name: "concentric",
  minNodeSpacing?: number,     // 最小节点间距
  concentric?: Function,       // 计算同心值的函数
  levelWidth?: Function,       // 计算每层宽度的函数
  sweep?: number,             // 扫描角度
  clockwise?: boolean         // 是否顺时针
}
```

4. 力导向布局 (COSE)

```typescript
{
  name: "cose",
  // 物理模拟参数
  nodeRepulsion?: number,     // 节点斥力
  nodeOverlap?: number,       // 节点重叠
  idealEdgeLength?: number,   // 理想边长
  edgeElasticity?: number,    // 边弹性
  nestingFactor?: number,     // 嵌套因子
  gravity?: number,           // 重力
  // 迭代参数
  numIter?: number,          // 迭代次数
  initialTemp?: number,      // 初始温度
  coolingFactor?: number,    // 冷却因子
  minTemp?: number          // 最小温度
}
```

## 视图控制

### 常用视图操作

1. 缩放控制

```typescript
// 放大/缩小
cy.zoom({
  level: 2.0, // 缩放级别
  position: { x: 100, y: 100 }, // 缩放中心
});

// 自适应内容
cy.fit();

// 获取当前缩放级别
const currentZoom = cy.zoom();
```

2. 平移控制

```typescript
// 平移到指定位置
cy.pan({
  x: 100,
  y: 100,
});

// 获取当前平移位置
const currentPan = cy.pan();
```

3. 居中操作

```typescript
// 居中显示所有元素
cy.center();

// 居中显示特定元素
cy.center(cy.$("#someNode"));
```

### 视图事件处理

```typescript
// 监听缩放事件
cy.on("zoom", function (evt) {
  console.log("当前缩放级别:", evt.target.zoom());
});

// 监听平移事件
cy.on("pan", function (evt) {
  console.log("当前平移位置:", evt.target.pan());
});
```

## 最佳实践

1. 布局选择

   - 小型图（<100 个节点）：使用 grid 或 circle 布局
   - 中型图（100-1000 个节点）：使用 cose 布局
   - 大型图（>1000 个节点）：使用 fcose 布局或分层显示

2. 性能优化

   - 使用异步布局避免阻塞 UI
   - 大型图谱考虑分批布局
   - 适当使用 infinite: false 避免持续计算

3. 用户体验

   - 添加布局过渡动画
   - 提供布局切换控制
   - 保持视图操作的流畅性

4. 代码组织
   - 将布局配置抽离为配置文件
   - 使用 TypeScript 类型定义
   - 实现布局状态管理

## 扩展布局

除了内置布局外，Cytoscape.js 还提供了多个扩展布局：

1. `cytoscape-cola`: 约束布局
2. `cytoscape-dagre`: 层次化布局
3. `cytoscape-klay`: 复杂图布局
4. `cytoscape-euler`: 快速力导向布局

安装和使用扩展布局：

```typescript
import cola from "cytoscape-cola";
cytoscape.use(cola);

// 使用 cola 布局
cy.layout({
  name: "cola",
  maxSimulationTime: 3000,
}).run();
```
