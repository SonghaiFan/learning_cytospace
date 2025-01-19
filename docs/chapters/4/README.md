# 4. 样式与动画

> [示例代码](https://github.com/SonghaiFan/learning_cytospace/tree/main/cytoscape_learning_code/4-样式与动画) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/4-样式与动画/index.html)

本章节将介绍如何在 Cytoscape.js 中设置图形样式和创建动画效果。每个功能都将提供传统方式和 React 方式两种实现。

## 核心概念

### 样式系统

- 选择器（Selector）：类似 CSS 选择器
- 样式属性（Style Properties）：控制外观
- 样式优先级（Specificity）：决定样式应用顺序

### 动画系统

- 属性动画：位置、大小、颜色等
- 布局动画：自动布局过渡
- 视图动画：缩放、平移等

## 样式设置

### 传统方式实现

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js - 样式与动画</title>
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
      <h1>样式与动画示例</h1>
      <div>
        <h3>节点样式</h3>
        <button onclick="changeNodeShape('ellipse')">圆形节点</button>
        <button onclick="changeNodeShape('rectangle')">方形节点</button>
        <button onclick="changeNodeShape('triangle')">三角形节点</button>
        <button onclick="changeNodeColor()">随机颜色</button>
      </div>
      <div>
        <h3>边样式</h3>
        <button onclick="changeEdgeStyle('solid')">实线</button>
        <button onclick="changeEdgeStyle('dotted')">点线</button>
        <button onclick="changeEdgeStyle('dashed')">虚线</button>
        <button onclick="toggleArrow()">切换箭头</button>
      </div>
      <div>
        <h3>动画效果</h3>
        <button onclick="pulseAnimation()">节点脉冲</button>
        <button onclick="flashEdges()">边闪烁</button>
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
              width: 60,
              height: 60,
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
              "text-rotation": "autorotate",
            },
          },
        ],
        layout: { name: "circle" },
      });

      // 节点样式函数
      function changeNodeShape(shape) {
        cy.nodes().style({
          shape: shape,
        });
      }

      function changeNodeColor() {
        cy.nodes().forEach((node) => {
          const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
          node.style({
            "background-color": color,
          });
        });
      }

      // 边样式函数
      function changeEdgeStyle(style) {
        cy.edges().style({
          "line-style": style,
        });
      }

      function toggleArrow() {
        const currentShape = cy.edges().style("target-arrow-shape");
        cy.edges().style({
          "target-arrow-shape": currentShape === "none" ? "triangle" : "none",
        });
      }

      // 动画函数
      function pulseAnimation() {
        cy.nodes().forEach((node) => {
          node
            .animation({
              style: {
                "background-color": "#ff0000",
                width: 80,
                height: 80,
              },
              duration: 500,
            })
            .play()
            .promise("completed")
            .then(() => {
              node
                .animation({
                  style: {
                    "background-color": "#666",
                    width: 60,
                    height: 60,
                  },
                  duration: 500,
                })
                .play();
            });
        });
      }

      function flashEdges() {
        cy.edges().forEach((edge) => {
          edge
            .animation({
              style: {
                "line-color": "#ff0000",
                width: 5,
              },
              duration: 200,
            })
            .play()
            .promise("completed")
            .then(() => {
              edge
                .animation({
                  style: {
                    "line-color": "#999",
                    width: 3,
                  },
                  duration: 200,
                })
                .play();
            });
        });
      }
    </script>
  </body>
</html>
```

### React 方式实现

1. 扩展样式组件 (`src/components/CytoscapeGraph.tsx`):

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
  layout = { name: "circle" },
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

  // 样式控制
  const changeNodeShape = useCallback((shape: string) => {
    if (!cyRef.current) return;
    cyRef.current.nodes().style({
      shape: shape,
    });
  }, []);

  const changeNodeColor = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.nodes().forEach((node) => {
      const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
      node.style({
        "background-color": color,
      });
    });
  }, []);

  const changeEdgeStyle = useCallback((style: string) => {
    if (!cyRef.current) return;
    cyRef.current.edges().style({
      "line-style": style,
    });
  }, []);

  const toggleArrow = useCallback(() => {
    if (!cyRef.current) return;
    const currentShape = cyRef.current.edges().style("target-arrow-shape");
    cyRef.current.edges().style({
      "target-arrow-shape": currentShape === "none" ? "triangle" : "none",
    });
  }, []);

  // 动画控制
  const pulseAnimation = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.nodes().forEach((node) => {
      node
        .animation({
          style: {
            "background-color": "#ff0000",
            width: 80,
            height: 80,
          },
          duration: 500,
        })
        .play()
        .promise("completed")
        .then(() => {
          node
            .animation({
              style: {
                "background-color": "#666",
                width: 60,
                height: 60,
              },
              duration: 500,
            })
            .play();
        });
    });
  }, []);

  const spinAnimation = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.nodes().forEach((node) => {
      node
        .animation({
          style: { "background-blacken": -0.5 },
          position: {
            x: node.position("x") + 20,
            y: node.position("y") + 20,
          },
          duration: 500,
        })
        .play()
        .promise("completed")
        .then(() => {
          node
            .animation({
              style: { "background-blacken": 0 },
              position: {
                x: node.position("x") - 20,
                y: node.position("y") - 20,
              },
              duration: 500,
            })
            .play();
        });
    });
  }, []);

  const bounceAnimation = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.nodes().forEach((node) => {
      const originalY = node.position("y");
      node
        .animation({
          position: { y: originalY - 50 },
          duration: 500,
        })
        .play()
        .promise("completed")
        .then(() => {
          node
            .animation({
              position: { y: originalY },
              duration: 500,
              easing: "ease-out-bounce",
            })
            .play();
        });
    });
  }, []);

  const flashEdges = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.edges().forEach((edge) => {
      edge
        .animation({
          style: {
            "line-color": "#ff0000",
            width: 5,
          },
          duration: 200,
        })
        .play()
        .promise("completed")
        .then(() => {
          edge
            .animation({
              style: {
                "line-color": "#999",
                width: 3,
              },
              duration: 200,
            })
            .play();
        });
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

  const style = [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        width: 60,
        height: 60,
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
        "text-rotation": "autorotate",
      },
    },
  ];

  let cyRef: cytoscape.Core | null = null;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">样式与动画示例</h1>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">节点样式</h3>
        <div className="flex gap-2">
          <button
            onClick={() => cyRef?.nodes().style({ shape: "ellipse" })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            圆形节点
          </button>
          <button
            onClick={() => cyRef?.nodes().style({ shape: "rectangle" })}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            方形节点
          </button>
          <button
            onClick={() => cyRef?.nodes().style({ shape: "triangle" })}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            三角形节点
          </button>
          <button
            onClick={() => {
              cyRef?.nodes().forEach((node) => {
                const color =
                  "#" + Math.floor(Math.random() * 16777215).toString(16);
                node.style({ "background-color": color });
              });
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            随机颜色
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">边样式</h3>
        <div className="flex gap-2">
          <button
            onClick={() => cyRef?.edges().style({ "line-style": "solid" })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            实线
          </button>
          <button
            onClick={() => cyRef?.edges().style({ "line-style": "dotted" })}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            点线
          </button>
          <button
            onClick={() => cyRef?.edges().style({ "line-style": "dashed" })}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            虚线
          </button>
          <button
            onClick={() => {
              const currentShape = cyRef?.edges().style("target-arrow-shape");
              cyRef?.edges().style({
                "target-arrow-shape":
                  currentShape === "none" ? "triangle" : "none",
              });
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            切换箭头
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">动画效果</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              cyRef?.nodes().forEach((node) => {
                node
                  .animation({
                    style: {
                      "background-color": "#ff0000",
                      width: 80,
                      height: 80,
                    },
                    duration: 500,
                  })
                  .play()
                  .promise("completed")
                  .then(() => {
                    node
                      .animation({
                        style: {
                          "background-color": "#666",
                          width: 60,
                          height: 60,
                        },
                        duration: 500,
                      })
                      .play();
                  });
              });
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            节点脉冲
          </button>
          <button
            onClick={() => {
              cyRef?.nodes().forEach((node) => {
                node
                  .animation({
                    style: { "background-blacken": -0.5 },
                    position: {
                      x: node.position("x") + 20,
                      y: node.position("y") + 20,
                    },
                    duration: 500,
                  })
                  .play()
                  .promise("completed")
                  .then(() => {
                    node
                      .animation({
                        style: { "background-blacken": 0 },
                        position: {
                          x: node.position("x") - 20,
                          y: node.position("y") - 20,
                        },
                        duration: 500,
                      })
                      .play();
                  });
              });
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            节点旋转
          </button>
          <button
            onClick={() => {
              cyRef?.nodes().forEach((node) => {
                const originalY = node.position("y");
                node
                  .animation({
                    position: { y: originalY - 50 },
                    duration: 500,
                  })
                  .play()
                  .promise("completed")
                  .then(() => {
                    node
                      .animation({
                        position: { y: originalY },
                        duration: 500,
                        easing: "ease-out-bounce",
                      })
                      .play();
                  });
              });
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            弹跳动画
          </button>
          <button
            onClick={() => {
              cyRef?.edges().forEach((edge) => {
                edge
                  .animation({
                    style: {
                      "line-color": "#ff0000",
                      width: 5,
                    },
                    duration: 200,
                  })
                  .play()
                  .promise("completed")
                  .then(() => {
                    edge
                      .animation({
                        style: {
                          "line-color": "#999",
                          width: 3,
                        },
                        duration: 200,
                      })
                      .play();
                  });
              });
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            边闪烁
          </button>
        </div>
      </div>

      <CytoscapeGraph
        elements={elements}
        style={style}
        onReady={(cy) => {
          cyRef = cy;
        }}
      />
    </main>
  );
}
```

## 样式属性说明

### 节点样式属性

```javascript
{
  // 基础样式
  "background-color": "#666",    // 背景色
  "border-width": 2,            // 边框宽度
  "border-color": "#000",       // 边框颜色
  "border-style": "solid",      // 边框样式

  // 形状相关
  "shape": "ellipse",           // 形状：ellipse, rectangle, triangle 等
  "width": 60,                  // 宽度
  "height": 60,                 // 高度

  // 标签相关
  "label": "data(label)",       // 标签文本
  "color": "#000",              // 文字颜色
  "text-valign": "center",      // 垂直对齐
  "text-halign": "center",      // 水平对齐
  "font-size": 12,              // 字体大小
  "font-weight": "normal",      // 字体粗细
}
```

### 边样式属性

```javascript
{
  // 基础样式
  "width": 3,                   // 线宽
  "line-color": "#999",         // 线条颜色
  "line-style": "solid",        // 线条样式：solid, dotted, dashed

  // 曲线相关
  "curve-style": "bezier",      // 曲线样式
  "control-point-step-size": 40,// 控制点步长

  // 箭头相关
  "target-arrow-shape": "triangle", // 目标箭头形状
  "source-arrow-shape": "none",     // 源箭头形状
  "arrow-scale": 1,                 // 箭头大小

  // 标签相关
  "label": "data(label)",       // 标签文本
  "text-rotation": "autorotate",// 文字旋转
  "text-margin-y": -10         // 文字边距
}
```

## 动画系统

### 动画配置选项

```javascript
{
  style: {                  // 样式动画
    "background-color": "#ff0000",
    width: 80,
    height: 80
  },
  position: {               // 位置动画
    x: 100,
    y: 100
  },
  duration: 1000,          // 持续时间
  easing: "ease-in-out",   // 缓动函数
  queue: true,             // 是否排队
  complete: function() {}, // 完成回调
}
```

### 动画链式调用

```javascript
element
  .animation({...})     // 第一个动画
  .play()              // 播放
  .promise("completed") // 等待完成
  .then(() => {
    return element.animation({...}).play(); // 第二个动画
  });
```

## 最佳实践

1. **样式管理**

   - 使用类选择器组织样式
   - 避免内联样式
   - 保持样式一致性
   - 使用主题变量

2. **动画效果**

   - 适度使用动画
   - 保持动画流畅
   - 提供动画控制
   - 考虑性能影响

3. **性能优化**

   - 批量更新样式
   - 使用 CSS 硬件加速
   - 控制动画数量
   - 避免不必要的重绘

4. **交互设计**

   - 提供视觉反馈
   - 保持一致性
   - 考虑可访问性
   - 支持触摸设备

5. **React 特定建议**
   - 使用状态管理样式
   - 组件化动画逻辑
   - 优化重渲染
   - 处理清理工作
