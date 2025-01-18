# 3. 布局与视图控制

本章节将介绍如何在 Cytoscape.js 中控制图形布局和视图，包括各种布局算法的使用、视图操作和动画效果。每个功能都将提供传统方式和 React 方式两种实现。

## 核心概念

### 布局（Layout）

- 自动排列节点位置的算法
- 包括网格、圆形、力导向等多种布局
- 可配置动画和其他参数

### 视图控制（View Control）

- 缩放（Zoom）操作
- 平移（Pan）操作
- 居中和适配（Center & Fit）

## 布局算法

Cytoscape.js 提供了多种内置布局算法：

- `grid`: 网格布局
- `circle`: 圆形布局
- `concentric`: 同心圆布局
- `breadthfirst`: 层次布局（广度优先）
- `random`: 随机布局

### 传统方式实现

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js - 布局与视图控制</title>
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
      button {
        margin: 5px;
        padding: 5px 10px;
      }
    </style>
  </head>
  <body>
    <div class="controls">
      <h1>布局与视图控制示例</h1>
      <div>
        <h3>布局控制</h3>
        <button onclick="changeLayout('grid')">网格布局</button>
        <button onclick="changeLayout('circle')">圆形布局</button>
        <button onclick="changeLayout('concentric')">同心圆布局</button>
        <button onclick="changeLayout('breadthfirst')">层次布局</button>
      </div>
      <div>
        <h3>视图控制</h3>
        <button onclick="zoomIn()">放大</button>
        <button onclick="zoomOut()">缩小</button>
        <button onclick="fitView()">适配视图</button>
        <button onclick="centerView()">居中视图</button>
      </div>
    </div>
    <div id="cy"></div>
    <script>
      const cy = cytoscape({
        container: document.getElementById("cy"),
        elements: [
          // 节点
          { data: { id: "a", label: "节点 A" } },
          { data: { id: "b", label: "节点 B" } },
          { data: { id: "c", label: "节点 C" } },
          { data: { id: "d", label: "节点 D" } },
          { data: { id: "e", label: "节点 E" } },
          // 边
          { data: { id: "ab", source: "a", target: "b" } },
          { data: { id: "bc", source: "b", target: "c" } },
          { data: { id: "cd", source: "c", target: "d" } },
          { data: { id: "de", source: "d", target: "e" } },
          { data: { id: "ea", source: "e", target: "a" } },
        ],
        style: [
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
              "curve-style": "bezier",
              "target-arrow-shape": "triangle",
            },
          },
        ],
        layout: { name: "grid" },
      });

      // 布局控制
      function changeLayout(name) {
        const layout = cy.layout({
          name,
          animate: true,
          animationDuration: 500,
          padding: 30,
          // 同心圆布局特定配置
          concentric: function (node) {
            return node.degree();
          },
          levelWidth: function () {
            return 2;
          },
          // 层次布局特定配置
          directed: true,
        });
        layout.run();
      }

      // 视图控制
      function zoomIn() {
        cy.animate({
          zoom: cy.zoom() * 1.2,
          duration: 500,
        });
      }

      function zoomOut() {
        cy.animate({
          zoom: cy.zoom() * 0.8,
          duration: 500,
        });
      }

      function fitView() {
        cy.animate({
          fit: {
            eles: cy.elements(),
            padding: 50,
          },
          duration: 500,
        });
      }

      function centerView() {
        cy.animate({
          center: {
            eles: cy.elements(),
          },
          duration: 500,
        });
      }
    </script>
  </body>
</html>
```

### React 方式实现

1. 扩展布局组件 (`src/components/CytoscapeGraph.tsx`):

```typescript
"use client";

import { useEffect, useRef, useCallback } from "react";
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

  // 初始化
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

  // 布局控制
  const runLayout = useCallback((layoutOptions: cytoscape.LayoutOptions) => {
    if (!cyRef.current) return;
    cyRef.current.layout(layoutOptions).run();
  }, []);

  // 视图控制
  const zoomIn = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.animate({
      zoom: cyRef.current.zoom() * 1.2,
      duration: 500,
    });
  }, []);

  const zoomOut = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.animate({
      zoom: cyRef.current.zoom() * 0.8,
      duration: 500,
    });
  }, []);

  const fitView = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.animate({
      fit: {
        eles: cyRef.current.elements(),
        padding: 50,
      },
      duration: 500,
    });
  }, []);

  const centerView = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.animate({
      center: {
        eles: cyRef.current.elements(),
      },
      duration: 500,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-[600px] border border-gray-200 rounded-lg ${className}`}
    />
  );
}
```

2. 使用组件 (`src/app/page.tsx`):

```typescript
"use client";

import { useState } from "react";
import { CytoscapeGraph } from "@/components/CytoscapeGraph";
import type { ElementDefinition, LayoutOptions } from "cytoscape";

export default function Home() {
  const [elements] = useState<ElementDefinition[]>([
    // 节点
    { data: { id: "a", label: "节点 A" } },
    { data: { id: "b", label: "节点 B" } },
    { data: { id: "c", label: "节点 C" } },
    { data: { id: "d", label: "节点 D" } },
    { data: { id: "e", label: "节点 E" } },
    // 边
    { data: { id: "ab", source: "a", target: "b" } },
    { data: { id: "bc", source: "b", target: "c" } },
    { data: { id: "cd", source: "c", target: "d" } },
    { data: { id: "de", source: "d", target: "e" } },
    { data: { id: "ea", source: "e", target: "a" } },
  ]);

  const [layout, setLayout] = useState<LayoutOptions>({ name: "grid" });

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
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
      },
    },
  ];

  // 布局配置
  const layouts = {
    grid: { name: "grid", animate: true, padding: 30 },
    circle: { name: "circle", animate: true, padding: 30 },
    concentric: {
      name: "concentric",
      animate: true,
      padding: 30,
      concentric: (node: any) => node.degree(),
      levelWidth: () => 2,
    },
    breadthfirst: {
      name: "breadthfirst",
      animate: true,
      padding: 30,
      directed: true,
    },
  };

  let cyRef: cytoscape.Core | null = null;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">布局与视图控制示例</h1>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">布局控制</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setLayout(layouts.grid)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            网格布局
          </button>
          <button
            onClick={() => setLayout(layouts.circle)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            圆形布局
          </button>
          <button
            onClick={() => setLayout(layouts.concentric)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            同心圆布局
          </button>
          <button
            onClick={() => setLayout(layouts.breadthfirst)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            层次布局
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">视图控制</h3>
        <div className="flex gap-2">
          <button
            onClick={() => cyRef?.animate({ zoom: cyRef.zoom() * 1.2 })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            放大
          </button>
          <button
            onClick={() => cyRef?.animate({ zoom: cyRef.zoom() * 0.8 })}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            缩小
          </button>
          <button
            onClick={() => cyRef?.animate({ fit: { padding: 50 } })}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            适配视图
          </button>
          <button
            onClick={() => cyRef?.animate({ center: true })}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            居中视图
          </button>
        </div>
      </div>

      <CytoscapeGraph
        elements={elements}
        style={style}
        layout={layout}
        onReady={(cy) => {
          cyRef = cy;
        }}
      />
    </main>
  );
}
```

## 布局配置说明

### 通用配置选项

所有布局都支持以下基本配置：

```javascript
const layoutOptions = {
  name: "grid", // 布局算法名称
  animate: true, // 是否使用动画
  animationDuration: 500, // 动画持续时间
  padding: 30, // 布局边距
  fit: true, // 是否适配视图
  spacingFactor: 1.5, // 间距因子
  ready: function () {}, // 布局准备就绪的回调
  stop: function () {}, // 布局完成的回调
};
```

### 特定布局配置

#### 网格布局 (grid)

```javascript
{
  name: 'grid',
  rows: undefined,    // 自动计算行数
  cols: undefined     // 自动计算列数
}
```

#### 圆形布局 (circle)

```javascript
{
  name: 'circle',
  radius: undefined   // 自动计算半径
}
```

#### 同心圆布局 (concentric)

```javascript
{
  name: 'concentric',
  concentric: function(node) {
    // 根据节点的度来决定同心圆的层级
    return node.degree();
  },
  levelWidth: function(nodes) {
    // 每层节点的间距
    return 2;
  }
}
```

#### 层次布局 (breadthfirst)

```javascript
{
  name: 'breadthfirst',
  directed: true,     // 是否考虑边的方向
  roots: undefined    // 自动选择根节点
}
```

## 视图操作

### 缩放操作

```javascript
// 传统方式
cy.zoom(2.0); // 设置缩放级别
cy.zoom() * 1.2; // 放大
cy.zoom() * 0.8; // 缩小

// React 方式
cyRef.current?.zoom(2.0);
cyRef.current?.animate({ zoom: cyRef.current.zoom() * 1.2 });
```

### 平移操作

```javascript
// 传统方式
cy.pan({ x: 100, y: 100 }); // 设置平移位置
cy.panBy({ x: 10, y: 10 }); // 相对平移

// React 方式
cyRef.current?.pan({ x: 100, y: 100 });
cyRef.current?.animate({ pan: { x: 100, y: 100 } });
```

### 视图适配

```javascript
// 传统方式
cy.fit(); // 适配所有元素
cy.fit(cy.$(":selected")); // 适配选中元素

// React 方式
cyRef.current?.animate({ fit: { padding: 50 } });
cyRef.current?.animate({ fit: { eles: cyRef.current.$(":selected") } });
```

## 最佳实践

1. **布局选择**

   - 根据数据结构选择合适的布局
   - 考虑性能和可读性的平衡
   - 为不同场景提供布局切换

2. **动画效果**

   - 使用适当的动画持续时间
   - 避免频繁的布局变化
   - 提供流畅的过渡效果

3. **视图控制**

   - 提供直观的缩放和平移控制
   - 实现自适应视图
   - 保持视图状态的连续性

4. **性能优化**

   - 大型图形考虑关闭动画
   - 使用节流控制视图操作
   - 避免不必要的布局计算

5. **React 特定建议**
   - 使用 useCallback 优化事件处理
   - 合理控制重渲染
   - 维护视图状态的一致性
