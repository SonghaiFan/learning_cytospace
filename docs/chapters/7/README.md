# 7.7 数据导出

本章节将介绍如何在 Cytoscape.js 中实现数据导出功能，包括图形数据的导出、图像导出和状态保存等。

## 数据导出概述

Cytoscape.js 提供了多种数据导出方式：

- JSON 数据导出
- 图像导出（PNG/JPG）
- SVG 导出
- 状态快照

## 基础导出

### JSON 数据导出

```javascript
// 导出所有元素数据
let jsonData = cy.json();

// 导出选中元素数据
let selectedData = cy.$(":selected").json();

// 自定义数据导出
let customData = {
  nodes: cy.nodes().map((node) => ({
    id: node.id(),
    label: node.data("label"),
    position: node.position(),
  })),
  edges: cy.edges().map((edge) => ({
    source: edge.source().id(),
    target: edge.target().id(),
    label: edge.data("label"),
  })),
};
```

### 图像导出

```javascript
// PNG 导出
let png64 = cy.png({
  scale: 2, // 导出图像的缩放比例
  full: true, // 导出完整图形
  quality: 1, // 图像质量
});

// JPG 导出
let jpg64 = cy.jpg({
  bg: "#ffffff", // 背景颜色
  quality: 0.9, // 图像质量
});
```

## 高级导出

### SVG 导出

```javascript
// 导出为 SVG
function exportSVG() {
  let svgContent = cy.svg({
    scale: 1,
    full: true,
    bg: "#ffffff",
  });

  // 创建下载链接
  let blob = new Blob([svgContent], {
    type: "image/svg+xml;charset=utf-8",
  });
  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.href = url;
  link.download = "graph.svg";
  link.click();
}
```

### 状态快照

```javascript
// 保存当前状态
function saveState() {
  return {
    elements: cy.json().elements,
    layout: {
      name: cy.layout().options.name,
      options: cy.layout().options,
    },
    style: cy.style().json(),
    zoom: cy.zoom(),
    pan: cy.pan(),
  };
}

// 恢复状态
function restoreState(state) {
  cy.elements().remove(); // 清除当前元素
  cy.add(state.elements); // 添加保存的元素
  cy.style(state.style); // 应用样式
  cy.zoom(state.zoom); // 设置缩放
  cy.pan(state.pan); // 设置平移
  cy.layout(state.layout).run(); // 运行布局
}
```

## 完整示例

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js - 数据导出</title>
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
        margin: 10px;
      }
      button {
        margin: 5px;
        padding: 5px 10px;
      }
      #output {
        margin: 10px;
        padding: 10px;
        border: 1px solid #ccc;
        max-height: 200px;
        overflow: auto;
      }
    </style>
  </head>
  <body>
    <div class="controls">
      <button onclick="exportJSON()">导出 JSON</button>
      <button onclick="exportPNG()">导出 PNG</button>
      <button onclick="exportSVG()">导出 SVG</button>
      <button onclick="saveSnapshot()">保存快照</button>
      <button onclick="restoreSnapshot()">恢复快照</button>
    </div>
    <div id="cy"></div>
    <div id="output"></div>
    <script>
      let lastSnapshot = null;

      const cy = cytoscape({
        container: document.getElementById("cy"),
        elements: [
          // 节点
          { data: { id: "a", label: "节点 A" } },
          { data: { id: "b", label: "节点 B" } },
          { data: { id: "c", label: "节点 C" } },
          // 边
          {
            data: {
              id: "ab",
              source: "a",
              target: "b",
              label: "关系 AB",
            },
          },
          {
            data: {
              id: "bc",
              source: "b",
              target: "c",
              label: "关系 BC",
            },
          },
        ],
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#666",
              label: "data(label)",
              width: 30,
              height: 30,
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": "#999",
              "curve-style": "bezier",
              "target-arrow-shape": "triangle",
              label: "data(label)",
            },
          },
        ],
        layout: {
          name: "grid",
        },
      });

      // 导出 JSON
      function exportJSON() {
        const jsonData = cy.json();
        const jsonString = JSON.stringify(jsonData, null, 2);

        // 显示 JSON 数据
        document.getElementById("output").innerHTML = `
          <pre>${jsonString}</pre>
        `;

        // 创建下载链接
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "graph.json";
        link.click();
      }

      // 导出 PNG
      function exportPNG() {
        const png64 = cy.png({
          scale: 2,
          full: true,
          quality: 1,
        });

        // 创建下载链接
        const link = document.createElement("a");
        link.href = png64;
        link.download = "graph.png";
        link.click();
      }

      // 导出 SVG
      function exportSVG() {
        const svgContent = cy.svg({
          scale: 1,
          full: true,
          bg: "#ffffff",
        });

        // 创建下载链接
        const blob = new Blob([svgContent], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "graph.svg";
        link.click();
      }

      // 保存快照
      function saveSnapshot() {
        lastSnapshot = {
          elements: cy.json().elements,
          layout: {
            name: cy.layout().options.name,
            options: cy.layout().options,
          },
          style: cy.style().json(),
          zoom: cy.zoom(),
          pan: cy.pan(),
        };

        document.getElementById("output").innerHTML = "状态已保存";
      }

      // 恢复快照
      function restoreSnapshot() {
        if (!lastSnapshot) {
          document.getElementById("output").innerHTML = "没有可用的快照";
          return;
        }

        cy.elements().remove();
        cy.add(lastSnapshot.elements);
        cy.style(lastSnapshot.style);
        cy.zoom(lastSnapshot.zoom);
        cy.pan(lastSnapshot.pan);
        cy.layout(lastSnapshot.layout).run();

        document.getElementById("output").innerHTML = "状态已恢复";
      }
    </script>
  </body>
</html>
```

## 数据导出最佳实践

1. **数据格式**

   - 选择合适的导出格式
   - 保持数据结构清晰
   - 包含必要的元数据
   - 考虑兼容性

2. **图像导出**

   - 选择合适的分辨率
   - 处理高 DPI 显示
   - 优化文件大小
   - 保持图像质量

3. **状态管理**

   - 完整的状态保存
   - 可靠的恢复机制
   - 版本控制支持
   - 错误处理

4. **性能优化**

   - 异步处理大数据
   - 分批处理导出
   - 内存管理
   - 进度反馈

5. **用户体验**

   - 清晰的导出选项
   - 导出进度提示
   - 错误提示
   - 预览功能

6. **安全考虑**
   - 数据验证
   - 敏感信息处理
   - 文件大小限制
   - 格式检查
