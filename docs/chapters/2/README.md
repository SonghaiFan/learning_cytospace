# 2. 节点与边的基础操作

本章节将介绍如何在 Cytoscape.js 中进行节点和边的基本操作，包括添加、删除、修改和查询等功能。每个功能都将提供传统方式和 React 方式两种实现。

## 核心概念

### 节点（Nodes）

- 图中的基本元素
- 包含数据属性（data）和位置信息（position）
- 可以设置样式和行为

### 边（Edges）

- 连接节点的线条
- 必须有源节点（source）和目标节点（target）
- 可以是有向或无向

## 基础操作

### 添加元素

#### 传统方式实现

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js - 元素操作</title>
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
      <h1>元素操作示例</h1>
      <button onclick="addNode()">添加节点</button>
      <button onclick="addEdge()">添加边</button>
      <button onclick="removeSelected()">删除选中</button>
      <button onclick="updateSelected()">更新选中</button>
    </div>
    <div id="cy"></div>
    <script>
      const cy = cytoscape({
        container: document.getElementById("cy"),
        elements: [
          // 初始节点
          { data: { id: "a", label: "节点 A" } },
          { data: { id: "b", label: "节点 B" } },
          // 初始边
          { data: { id: "ab", source: "a", target: "b", label: "边 AB" } },
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
              label: "data(label)",
              "curve-style": "bezier",
              "target-arrow-shape": "triangle",
            },
          },
          {
            selector: ":selected",
            style: {
              "background-color": "#900",
              "line-color": "#900",
              "target-arrow-color": "#900",
            },
          },
        ],
        layout: { name: "grid" },
      });

      // 添加节点
      function addNode() {
        const id = "node-" + Date.now();
        cy.add({
          group: "nodes",
          data: { id, label: `节点 ${id}` },
          position: {
            x: Math.random() * 300 + 150,
            y: Math.random() * 200 + 100,
          },
        });
      }

      // 添加边
      function addEdge() {
        const selected = cy.$("node:selected");
        if (selected.length === 2) {
          const [source, target] = selected;
          const id = "edge-" + Date.now();
          cy.add({
            group: "edges",
            data: {
              id,
              source: source.id(),
              target: target.id(),
              label: `边 ${id}`,
            },
          });
        } else {
          alert("请先选择两个节点");
        }
      }

      // 删除选中元素
      function removeSelected() {
        cy.$(":selected").remove();
      }

      // 更新选中元素
      function updateSelected() {
        cy.$("node:selected").forEach((node) => {
          const newLabel = prompt("输入新标签:", node.data("label"));
          if (newLabel) {
            node.data("label", newLabel);
          }
        });
      }
    </script>
  </body>
</html>
```

#### React 方式实现

1. 扩展基础组件 (`src/components/CytoscapeGraph.tsx`):

```typescript
"use client";

import { useEffect, useRef, useCallback } from "react";
import cytoscape from "cytoscape";

interface CytoscapeGraphProps {
  elements?: cytoscape.ElementDefinition[];
  style?: cytoscape.Stylesheet[];
  layout?: cytoscape.LayoutOptions;
  className?: string;
  onSelect?: (elements: cytoscape.Collection) => void;
}

export function CytoscapeGraph({
  elements = [],
  style = [],
  layout = { name: "grid" },
  className = "",
  onSelect,
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

    // 选择事件处理
    if (onSelect) {
      cyRef.current.on("select", "node, edge", () => {
        onSelect(cyRef.current!.$(":selected"));
      });
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

  // 公开的操作方法
  const addNode = useCallback((node: cytoscape.ElementDefinition) => {
    cyRef.current?.add(node);
  }, []);

  const addEdge = useCallback((edge: cytoscape.ElementDefinition) => {
    cyRef.current?.add(edge);
  }, []);

  const removeElements = useCallback((eles: cytoscape.Collection) => {
    eles.remove();
  }, []);

  const updateElement = useCallback((ele: cytoscape.Collection, data: any) => {
    ele.data(data);
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
import type { ElementDefinition } from "cytoscape";

export default function Home() {
  const [elements, setElements] = useState<ElementDefinition[]>([
    // 初始节点
    { data: { id: "a", label: "节点 A" } },
    { data: { id: "b", label: "节点 B" } },
    // 初始边
    { data: { id: "ab", source: "a", target: "b", label: "边 AB" } },
  ]);

  const [selectedElements, setSelectedElements] = useState<string[]>([]);

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
    {
      selector: ":selected",
      style: {
        "background-color": "#900",
        "line-color": "#900",
        "target-arrow-color": "#900",
      },
    },
  ];

  // 添加节点
  const addNode = () => {
    const id = `node-${Date.now()}`;
    const newNode = {
      data: { id, label: `节点 ${id}` },
      position: {
        x: Math.random() * 300 + 150,
        y: Math.random() * 200 + 100,
      },
    };
    setElements([...elements, newNode]);
  };

  // 添加边
  const addEdge = () => {
    if (selectedElements.length === 2) {
      const [source, target] = selectedElements;
      const id = `edge-${Date.now()}`;
      const newEdge = {
        data: {
          id,
          source,
          target,
          label: `边 ${id}`,
        },
      };
      setElements([...elements, newEdge]);
    } else {
      alert("请先选择两个节点");
    }
  };

  // 删除选中元素
  const removeSelected = () => {
    setElements(
      elements.filter((ele) => !selectedElements.includes(ele.data.id))
    );
    setSelectedElements([]);
  };

  // 更新选中元素
  const updateSelected = () => {
    const newElements = elements.map((ele) => {
      if (selectedElements.includes(ele.data.id) && ele.data.label) {
        const newLabel = prompt("输入新标签:", ele.data.label);
        if (newLabel) {
          return {
            ...ele,
            data: { ...ele.data, label: newLabel },
          };
        }
      }
      return ele;
    });
    setElements(newElements);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">元素操作示例</h1>
      <div className="flex gap-2 mb-4">
        <button
          onClick={addNode}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          添加节点
        </button>
        <button
          onClick={addEdge}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          添加边
        </button>
        <button
          onClick={removeSelected}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          删除选中
        </button>
        <button
          onClick={updateSelected}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          更新选中
        </button>
      </div>
      <CytoscapeGraph
        elements={elements}
        style={style}
        onSelect={(selected) => {
          setSelectedElements(selected.map((ele) => ele.id()));
        }}
      />
    </main>
  );
}
```

## 元素选择器

Cytoscape.js 提供了强大的选择器系统，类似于 CSS 选择器：

```javascript
// 选择所有节点
cy.$("node");

// 选择所有边
cy.$("edge");

// 选择特定 ID 的元素
cy.$("#nodeId");

// 选择具有特定类的元素
cy.$(".className");

// 选择已选中的元素
cy.$(":selected");

// 组合选择器
cy.$("node.highlighted:selected");
```

## 数据操作

### 读取数据

```javascript
// 传统方式
const nodeData = node.data();
const nodeId = node.id();
const nodeLabel = node.data("label");

// React 方式
const nodeData = elements.find((ele) => ele.data.id === "nodeId")?.data;
```

### 修改数据

```javascript
// 传统方式
node.data("label", "新标签");
edge.data("weight", 2);

// React 方式
setElements(
  elements.map((ele) =>
    ele.data.id === "nodeId"
      ? { ...ele, data: { ...ele.data, label: "新标签" } }
      : ele
  )
);
```

## 位置操作

### 获取和设置位置

```javascript
// 传统方式
const position = node.position();
node.position({ x: 100, y: 100 });

// React 方式
const position = elements.find((ele) => ele.data.id === "nodeId")?.position;
setElements(
  elements.map((ele) =>
    ele.data.id === "nodeId" ? { ...ele, position: { x: 100, y: 100 } } : ele
  )
);
```

## 最佳实践

1. **数据管理**

   - 保持数据结构清晰
   - 使用唯一的 ID
   - 合理组织节点和边的关系

2. **性能优化**

   - 批量添加/删除元素
   - 使用合适的选择器
   - 避免频繁的状态更新

3. **用户交互**

   - 提供清晰的操作反馈
   - 实现撤销/重做功能
   - 添加适当的验证

4. **React 特定建议**
   - 使用 useState 管理元素状态
   - 实现受控组件模式
   - 合理使用 useCallback 和 useMemo
