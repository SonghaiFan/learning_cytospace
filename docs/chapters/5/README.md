# 5. 交互与事件处理

> [示例代码](https://github.com/SonghaiFan/learning_cytospace/tree/main/cytoscape_learning_code/5-交互与事件处理) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/5-交互与事件处理/index.html)

本章节将介绍如何在 Cytoscape.js 中处理用户交互和事件，包括点击、拖拽、悬停等操作。每个功能都将提供传统方式和 React 方式两种实现。

## 核心概念

### 事件系统

- 事件类型：点击、拖拽、悬停等
- 事件委托：事件冒泡和捕获
- 事件对象：包含事件相关信息

### 交互控制

- 手势操作：缩放、平移
- 选择操作：单选、多选
- 拖拽操作：节点拖拽、画布拖拽

## 事件处理

### 传统方式实现

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js - 交互与事件处理</title>
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
      .event-log {
        width: 600px;
        height: 150px;
        margin: 20px auto;
        padding: 10px;
        border: 1px solid #ccc;
        overflow-y: auto;
        font-family: monospace;
      }
      button {
        margin: 5px;
        padding: 5px 10px;
      }
    </style>
  </head>
  <body>
    <div class="controls">
      <h1>交互与事件处理示例</h1>
      <div>
        <h3>交互控制</h3>
        <button onclick="toggleZoom()">切换缩放</button>
        <button onclick="togglePan()">切换平移</button>
        <button onclick="toggleBoxSelection()">切换框选</button>
        <button onclick="toggleGrab()">切换拖拽</button>
      </div>
      <div>
        <h3>选择操作</h3>
        <button onclick="selectAll()">全选</button>
        <button onclick="unselectAll()">取消选择</button>
        <button onclick="invertSelection()">反选</button>
      </div>
    </div>
    <div id="cy"></div>
    <div class="event-log" id="eventLog"></div>
    <script>
      const cy = cytoscape({
        container: document.getElementById("cy"),
        elements: [
          // 节点
          { data: { id: "a", label: "节点 A" } },
          { data: { id: "b", label: "节点 B" } },
          { data: { id: "c", label: "节点 C" } },
          // 边
          { data: { id: "ab", source: "a", target: "b", label: "边 AB" } },
          { data: { id: "bc", source: "b", target: "c", label: "边 BC" } },
          { data: { id: "ca", source: "c", target: "a", label: "边 CA" } },
        ],
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#666",
              label: "data(label)",
              "text-valign": "center",
              "text-halign": "center",
            },
          },
          {
            selector: "edge",
            style: {
              width: 3,
              "line-color": "#999",
              "curve-style": "bezier",
              "target-arrow-shape": "triangle",
              label: "data(label)",
            },
          },
          {
            selector: ":selected",
            style: {
              "background-color": "#900",
              "line-color": "#900",
              "target-arrow-color": "#900",
              "source-arrow-color": "#900",
            },
          },
          {
            selector: ":active",
            style: {
              "overlay-color": "#000",
              "overlay-padding": 10,
              "overlay-opacity": 0.25,
            },
          },
        ],
        layout: { name: "circle" },
        // 交互设置
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: true,
        selectionType: "single",
      });

      // 事件日志
      const eventLog = document.getElementById("eventLog");
      function logEvent(event) {
        const log = document.createElement("div");
        log.textContent = `${new Date().toLocaleTimeString()} - ${event}`;
        eventLog.insertBefore(log, eventLog.firstChild);
        if (eventLog.children.length > 50) {
          eventLog.removeChild(eventLog.lastChild);
        }
      }

      // 交互控制函数
      function toggleZoom() {
        const enabled = cy.userZoomingEnabled();
        cy.userZoomingEnabled(!enabled);
        logEvent(`缩放功能已${!enabled ? "启用" : "禁用"}`);
      }

      function togglePan() {
        const enabled = cy.userPanningEnabled();
        cy.userPanningEnabled(!enabled);
        logEvent(`平移功能已${!enabled ? "启用" : "禁用"}`);
      }

      function toggleBoxSelection() {
        const enabled = cy.boxSelectionEnabled();
        cy.boxSelectionEnabled(!enabled);
        logEvent(`框选功能已${!enabled ? "启用" : "禁用"}`);
      }

      function toggleGrab() {
        const enabled = !cy.nodes().grabifiable();
        cy.nodes().grabifiable(enabled);
        logEvent(`节点拖拽功能已${enabled ? "启用" : "禁用"}`);
      }

      // 选择操作函数
      function selectAll() {
        cy.elements().select();
        logEvent("已选择所有元素");
      }

      function unselectAll() {
        cy.elements().unselect();
        logEvent("已取消所有选择");
      }

      function invertSelection() {
        cy.elements().forEach((ele) => {
          if (ele.selected()) {
            ele.unselect();
          } else {
            ele.select();
          }
        });
        logEvent("已反选所有元素");
      }

      // 事件监听
      cy.on("tap", "node", function (evt) {
        const node = evt.target;
        logEvent(`点击节点: ${node.data("label")}`);
      });

      cy.on("tap", "edge", function (evt) {
        const edge = evt.target;
        logEvent(`点击边: ${edge.data("label")}`);
      });

      cy.on("select", "node, edge", function (evt) {
        const ele = evt.target;
        logEvent(`选择元素: ${ele.data("label")}`);
      });

      cy.on("unselect", "node, edge", function (evt) {
        const ele = evt.target;
        logEvent(`取消选择: ${ele.data("label")}`);
      });

      cy.on("mouseover", "node, edge", function (evt) {
        const ele = evt.target;
        logEvent(`鼠标悬停: ${ele.data("label")}`);
      });

      cy.on("dragfree", "node", function (evt) {
        const node = evt.target;
        const pos = node.position();
        logEvent(
          `节点拖拽结束: ${node.data("label")} (${Math.round(
            pos.x
          )}, ${Math.round(pos.y)})`
        );
      });

      cy.on("zoom", function (evt) {
        logEvent(`缩放级别: ${Math.round(cy.zoom() * 100) / 100}`);
      });

      cy.on("pan", function (evt) {
        const pan = cy.pan();
        logEvent(`画布平移: (${Math.round(pan.x)}, ${Math.round(pan.y)})`);
      });
    </script>
  </body>
</html>
```

### React 方式实现

1. 扩展事件组件 (`src/components/CytoscapeGraph.tsx`):

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
  onNodeClick?: (node: cytoscape.NodeSingular) => void;
  onEdgeClick?: (edge: cytoscape.EdgeSingular) => void;
  onSelect?: (element: cytoscape.SingularElement) => void;
  onUnselect?: (element: cytoscape.SingularElement) => void;
  onMouseOver?: (element: cytoscape.SingularElement) => void;
  onDragFree?: (node: cytoscape.NodeSingular) => void;
  onZoom?: (zoom: number) => void;
  onPan?: (position: { x: number; y: number }) => void;
}

export function CytoscapeGraph({
  elements = [],
  style = [],
  layout = { name: "circle" },
  className = "",
  onReady,
  onNodeClick,
  onEdgeClick,
  onSelect,
  onUnselect,
  onMouseOver,
  onDragFree,
  onZoom,
  onPan,
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
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      selectionType: "single",
    });

    if (onReady) {
      onReady(cyRef.current);
    }

    // 事件监听
    if (onNodeClick) {
      cyRef.current.on("tap", "node", (evt) => onNodeClick(evt.target));
    }

    if (onEdgeClick) {
      cyRef.current.on("tap", "edge", (evt) => onEdgeClick(evt.target));
    }

    if (onSelect) {
      cyRef.current.on("select", "node, edge", (evt) => onSelect(evt.target));
    }

    if (onUnselect) {
      cyRef.current.on("unselect", "node, edge", (evt) =>
        onUnselect(evt.target)
      );
    }

    if (onMouseOver) {
      cyRef.current.on("mouseover", "node, edge", (evt) =>
        onMouseOver(evt.target)
      );
    }

    if (onDragFree) {
      cyRef.current.on("dragfree", "node", (evt) => onDragFree(evt.target));
    }

    if (onZoom) {
      cyRef.current.on("zoom", () => onZoom(cyRef.current!.zoom()));
    }

    if (onPan) {
      cyRef.current.on("pan", () => onPan(cyRef.current!.pan()));
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

  // 交互控制
  const toggleZoom = useCallback(() => {
    if (!cyRef.current) return;
    const enabled = cyRef.current.userZoomingEnabled();
    cyRef.current.userZoomingEnabled(!enabled);
    return !enabled;
  }, []);

  const togglePan = useCallback(() => {
    if (!cyRef.current) return;
    const enabled = cyRef.current.userPanningEnabled();
    cyRef.current.userPanningEnabled(!enabled);
    return !enabled;
  }, []);

  const toggleBoxSelection = useCallback(() => {
    if (!cyRef.current) return;
    const enabled = cyRef.current.boxSelectionEnabled();
    cyRef.current.boxSelectionEnabled(!enabled);
    return !enabled;
  }, []);

  const toggleGrab = useCallback(() => {
    if (!cyRef.current) return;
    const enabled = !cyRef.current.nodes().grabifiable();
    cyRef.current.nodes().grabifiable(enabled);
    return enabled;
  }, []);

  // 选择操作
  const selectAll = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.elements().select();
  }, []);

  const unselectAll = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.elements().unselect();
  }, []);

  const invertSelection = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.elements().forEach((ele) => {
      if (ele.selected()) {
        ele.unselect();
      } else {
        ele.select();
      }
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

import { useState, useCallback } from "react";
import { CytoscapeGraph } from "@/components/CytoscapeGraph";
import type { ElementDefinition } from "cytoscape";

export default function Home() {
  const [elements] = useState<ElementDefinition[]>([
    // 节点
    { data: { id: "a", label: "节点 A" } },
    { data: { id: "b", label: "节点 B" } },
    { data: { id: "c", label: "节点 C" } },
    // 边
    { data: { id: "ab", source: "a", target: "b", label: "边 AB" } },
    { data: { id: "bc", source: "b", target: "c", label: "边 BC" } },
    { data: { id: "ca", source: "c", target: "a", label: "边 CA" } },
  ]);

  const [logs, setLogs] = useState<string[]>([]);

  const logEvent = useCallback((event: string) => {
    setLogs((prev) => [
      `${new Date().toLocaleTimeString()} - ${event}`,
      ...prev.slice(0, 49),
    ]);
  }, []);

  const style = [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
      },
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#999",
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
        label: "data(label)",
      },
    },
    {
      selector: ":selected",
      style: {
        "background-color": "#900",
        "line-color": "#900",
        "target-arrow-color": "#900",
        "source-arrow-color": "#900",
      },
    },
    {
      selector: ":active",
      style: {
        "overlay-color": "#000",
        "overlay-padding": 10,
        "overlay-opacity": 0.25,
      },
    },
  ];

  let cyRef: cytoscape.Core | null = null;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">交互与事件处理示例</h1>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">交互控制</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const enabled = cyRef?.userZoomingEnabled();
              cyRef?.userZoomingEnabled(!enabled);
              logEvent(`缩放功能已${!enabled ? "启用" : "禁用"}`);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            切换缩放
          </button>
          <button
            onClick={() => {
              const enabled = cyRef?.userPanningEnabled();
              cyRef?.userPanningEnabled(!enabled);
              logEvent(`平移功能已${!enabled ? "启用" : "禁用"}`);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            切换平移
          </button>
          <button
            onClick={() => {
              const enabled = cyRef?.boxSelectionEnabled();
              cyRef?.boxSelectionEnabled(!enabled);
              logEvent(`框选功能已${!enabled ? "启用" : "禁用"}`);
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            切换框选
          </button>
          <button
            onClick={() => {
              const enabled = !cyRef?.nodes().grabifiable();
              cyRef?.nodes().grabifiable(enabled);
              logEvent(`节点拖拽功能已${enabled ? "启用" : "禁用"}`);
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            切换拖拽
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">选择操作</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              cyRef?.elements().select();
              logEvent("已选择所有元素");
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            全选
          </button>
          <button
            onClick={() => {
              cyRef?.elements().unselect();
              logEvent("已取消所有选择");
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            取消选择
          </button>
          <button
            onClick={() => {
              cyRef?.elements().forEach((ele) => {
                if (ele.selected()) {
                  ele.unselect();
                } else {
                  ele.select();
                }
              });
              logEvent("已反选所有元素");
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            反选
          </button>
        </div>
      </div>

      <CytoscapeGraph
        elements={elements}
        style={style}
        onReady={(cy) => {
          cyRef = cy;
        }}
        onNodeClick={(node) => logEvent(`点击节点: ${node.data("label")}`)}
        onEdgeClick={(edge) => logEvent(`点击边: ${edge.data("label")}`)}
        onSelect={(ele) => logEvent(`选择元素: ${ele.data("label")}`)}
        onUnselect={(ele) => logEvent(`取消选择: ${ele.data("label")}`)}
        onMouseOver={(ele) => logEvent(`鼠标悬停: ${ele.data("label")}`)}
        onDragFree={(node) => {
          const pos = node.position();
          logEvent(
            `节点拖拽结束: ${node.data("label")} (${Math.round(
              pos.x
            )}, ${Math.round(pos.y)})`
          );
        }}
        onZoom={(zoom) => logEvent(`缩放级别: ${Math.round(zoom * 100) / 100}`)}
        onPan={(position) =>
          logEvent(
            `画布平移: (${Math.round(position.x)}, ${Math.round(position.y)})`
          )
        }
      />

      <div className="mt-4 p-4 h-[150px] border border-gray-200 rounded-lg overflow-y-auto font-mono text-sm">
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
      </div>
    </main>
  );
}
```

## 事件类型说明

### 元素事件

```javascript
// 点击事件
cy.on("tap", "node", function (evt) {}); // 节点点击
cy.on("tap", "edge", function (evt) {}); // 边点击

// 选择事件
cy.on("select", "node, edge", function (evt) {}); // 选择元素
cy.on("unselect", "node, edge", function (evt) {}); // 取消选择

// 鼠标事件
cy.on("mouseover", "node, edge", function (evt) {}); // 鼠标进入
cy.on("mouseout", "node, edge", function (evt) {}); // 鼠标离开
cy.on("mousemove", "node, edge", function (evt) {}); // 鼠标移动

// 拖拽事件
cy.on("dragstart", "node", function (evt) {}); // 开始拖拽
cy.on("drag", "node", function (evt) {}); // 拖拽中
cy.on("dragfree", "node", function (evt) {}); // 拖拽结束
```

### 画布事件

```javascript
// 视图事件
cy.on("zoom", function (evt) {}); // 缩放
cy.on("pan", function (evt) {}); // 平移
cy.on("viewport", function (evt) {}); // 视图变化

// 框选事件
cy.on("boxstart", function (evt) {}); // 开始框选
cy.on("boxselect", function (evt) {}); // 框选中
cy.on("boxend", function (evt) {}); // 框选结束
```

## 交互控制

### 缩放控制

```javascript
// 启用/禁用缩放
cy.userZoomingEnabled(true);

// 设置缩放范围
cy.minZoom(0.5);
cy.maxZoom(2.0);

// 获取当前缩放级别
cy.zoom();

// 设置缩放级别
cy.zoom(1.5);
```

### 平移控制

```javascript
// 启用/禁用平移
cy.userPanningEnabled(true);

// 获取当前平移位置
cy.pan();

// 设置平移位置
cy.pan({ x: 100, y: 100 });

// 相对平移
cy.panBy({ x: 10, y: 10 });
```

### 选择控制

```javascript
// 启用/禁用框选
cy.boxSelectionEnabled(true);

// 设置选择类型
cy.selectionType("single"); // 或 "additive"

// 选择操作
cy.elements().select(); // 全选
cy.elements().unselect(); // 取消选择
```

## 最佳实践

1. **事件处理**

   - 使用事件委托
   - 避免频繁的事件绑定
   - 合理使用事件对象
   - 处理事件冒泡

2. **交互优化**

   - 提供适当的视觉反馈
   - 实现平滑的动画过渡
   - 控制交互频率
   - 处理边界情况

3. **性能优化**

   - 使用节流和防抖
   - 优化事件监听器
   - 避免不必要的状态更新
   - 合理使用事件解绑

4. **用户体验**

   - 提供清晰的交互提示
   - 实现直观的操作方式
   - 支持键盘快捷键
   - 考虑移动设备

5. **React 特定建议**
   - 使用 useCallback 优化事件处理
   - 合理管理事件监听
   - 处理组件卸载
   - 优化状态更新
