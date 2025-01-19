# 7. 数据导入与导出

> [查看示例代码](https://github.com/SonghaiFan/learning_cytospace/tree/main/cytoscape_learning_code/7-数据导入导出) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/7-数据导入导出/index.html)

本章节介绍如何在 Cytoscape.js 中实现数据的导入和导出功能，包括多种格式的导出、数据导入、预览和状态管理等功能。

## 数据导出

### JSON 导出

使用 Cytoscape.js 的内置 JSON 序列化功能导出完整的图数据：

```javascript
function exportJSON() {
  const data = cy.json();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  saveAs(blob, "graph.json");
  showPreview(JSON.stringify(data, null, 2));
}
```

### CSV 导出

将节点和边的数据分别导出为 CSV 格式：

```javascript
function exportCSV() {
  // 节点 CSV
  let nodesCSV = "id,label,type\n";
  cy.nodes().forEach((node) => {
    const data = node.data();
    nodesCSV += `${data.id},${data.label},${data.type}\n`;
  });

  // 边 CSV
  let edgesCSV = "id,source,target,type,weight\n";
  cy.edges().forEach((edge) => {
    const data = edge.data();
    edgesCSV += `${data.id},${data.source},${data.target},${data.type},${data.weight}\n`;
  });

  const blob = new Blob(["Nodes:\n", nodesCSV, "\nEdges:\n", edgesCSV], {
    type: "text/csv",
  });
  saveAs(blob, "graph.csv");
}
```

### 图像导出

支持导出为 PNG 格式的图片：

```javascript
function exportImage() {
  const png64 = cy.png();
  const link = document.createElement("a");
  link.download = "graph.png";
  link.href = png64;
  link.click();
}
```

## 数据导入

### 文件导入

支持导入 JSON 和 CSV 格式的文件：

```javascript
function importData() {
  const file = document.getElementById("file-input").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      if (file.name.endsWith(".json")) {
        const data = JSON.parse(e.target.result);
        cy.json(data);
      } else if (file.name.endsWith(".csv")) {
        importCSV(e.target.result);
      }
    } catch (error) {
      console.error("导入失败:", error);
    }
  };
  reader.readAsText(file);
}

// CSV 格式解析
function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
}

// 导入 CSV 数据
function importCSV(content) {
  const [nodesSection, edgesSection] = content.split("\nEdges:\n");
  const nodes = parseCSV(nodesSection.replace("Nodes:\n", ""));
  const edges = parseCSV(edgesSection);

  // 更新图形
  cy.elements().remove();
  nodes.forEach((node) => {
    cy.add({ group: "nodes", data: node });
  });
  edges.forEach((edge) => {
    cy.add({ group: "edges", data: edge });
  });
  cy.layout({ name: "grid" }).run();
}
```

### 数据预览

实现数据导入导出的预览功能：

```javascript
function showPreview(content) {
  document.getElementById("preview-content").textContent = content;
}

// 监听文件选择
document.getElementById("file-input").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    showPreview(`已选择文件: ${file.name}`);
  }
});
```

## 图形重置

提供重置图形到初始状态的功能：

```javascript
function resetGraph() {
  cy.elements().remove();
  cy.add([
    // 初始节点
    { data: { id: "a", label: "A", type: "user" } },
    { data: { id: "b", label: "B", type: "user" } },
    // 初始边
    {
      data: {
        id: "ab",
        source: "a",
        target: "b",
        type: "friend",
        weight: 1,
      },
    },
  ]);
  cy.layout({ name: "grid" }).run();
}
```

## 最佳实践

1. 数据格式

   - 支持多种标准格式（JSON、CSV）
   - 保持数据结构的一致性
   - 包含必要的元数据（节点类型、边权重等）

2. 用户体验

   - 提供文件选择和拖放导入
   - 实现数据预览功能
   - 添加导入导出进度反馈
   - 支持图形状态重置

3. 错误处理

   - 验证导入数据的格式
   - 提供清晰的错误提示
   - 支持导入失败的回滚

4. 性能优化
   - 分批处理大型数据集
   - 优化数据解析过程
   - 实现异步导入导出

## 示例：完整的数据管理界面

```html
<div class="controls">
  <div>
    <button onclick="exportJSON()">导出 JSON</button>
    <button onclick="exportCSV()">导出 CSV</button>
    <button onclick="exportImage()">导出图片</button>
  </div>
  <div>
    <input type="file" id="file-input" accept=".json,.csv" />
    <button onclick="importData()">导入数据</button>
    <button onclick="resetGraph()">重置图形</button>
  </div>
</div>
<div id="data-preview">
  <strong>数据预览:</strong>
  <div id="preview-content"></div>
</div>
```
