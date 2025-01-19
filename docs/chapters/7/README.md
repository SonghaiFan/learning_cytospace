# 7. 数据导出与导入

> [示例代码](https://github.com/SonghaiFan/learning_cytospace/tree/main/cytoscape_learning_code/7-数据导入导出) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/7-数据导入导出/index.html)

本章节将介绍如何在 Cytoscape.js 中实现数据的导出和导入功能，包括图数据的序列化、反序列化，以及与其他格式的转换。每个功能都将提供传统方式和 React 方式两种实现。

## 核心概念

### 数据格式

- **JSON 格式**: 节点和边的数据结构
- **图形格式**: GraphML, GEXF 等标准格式
- **图片格式**: PNG, JPEG, SVG 等可视化输出

### 数据处理流程

1. **导出流程**

   - 数据收集与过滤
   - 格式转换
   - 文件生成

2. **导入流程**
   - 文件解析
   - 数据验证
   - 图形重建

## 传统方式实现

### 1. JSON 数据处理

```javascript
// 导出为 JSON
function exportToJson() {
  const elements = cy.elements().map((ele) => ({
    group: ele.isNode() ? "nodes" : "edges",
    data: ele.data(),
    position: ele.isNode() ? ele.position() : undefined,
    selected: ele.selected(),
    style: ele.style(),
  }));

  const graphData = {
    elements,
    style: cy.style().json(),
    layout: cy.layout().options,
  };

  return JSON.stringify(graphData, null, 2);
}

// 从 JSON 导入
function importFromJson(jsonString) {
  const graphData = JSON.parse(jsonString);

  cy.elements().remove(); // 清除现有元素
  cy.add(graphData.elements);
  cy.style(graphData.style);

  // 应用布局
  cy.layout(graphData.layout).run();

  // 恢复选中状态
  graphData.elements.forEach((ele) => {
    if (ele.selected) {
      cy.$id(ele.data.id).select();
    }
  });
}
```

### 2. 图片导出

```javascript
// PNG 导出
function exportToPng() {
  const pngBlob = cy.png({
    output: "blob",
    bg: "#ffffff",
    full: true,
    scale: 2,
    maxWidth: 4000,
    maxHeight: 4000,
  });

  return pngBlob;
}

// SVG 导出
function exportToSvg() {
  const svgStr = cy.svg({
    full: true,
    scale: 2,
    bg: "#ffffff",
  });

  return svgStr;
}
```

### 3. 图形格式转换

```javascript
// GraphML 导出
function exportToGraphML() {
  let graphml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  graphml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';

  // 添加数据属性定义
  graphml +=
    '<key id="label" for="node" attr.name="label" attr.type="string"/>\n';
  graphml +=
    '<key id="weight" for="edge" attr.name="weight" attr.type="double"/>\n';

  // 添加图形数据
  graphml += '<graph id="G" edgedefault="directed">\n';

  // 添加节点
  cy.nodes().forEach((node) => {
    graphml += `<node id="${node.id()}">\n`;
    graphml += `  <data key="label">${node.data("label")}</data>\n`;
    graphml += "</node>\n";
  });

  // 添加边
  cy.edges().forEach((edge) => {
    graphml += `<edge source="${edge.source().id()}" target="${edge
      .target()
      .id()}">\n`;
    graphml += `  <data key="weight">${edge.data("weight") || 1}</data>\n`;
    graphml += "</edge>\n";
  });

  graphml += "</graph>\n</graphml>";
  return graphml;
}
```

## React 方式实现

### 1. 数据导出组件

```typescript
interface ExportOptions {
  format: "json" | "png" | "svg" | "graphml";
  filename?: string;
}

export function ExportControls({ cy }: { cy: cytoscape.Core }) {
  const handleExport = useCallback(
    async (options: ExportOptions) => {
      try {
        let content: string | Blob;
        let mimeType: string;

        switch (options.format) {
          case "json":
            content = exportToJson();
            mimeType = "application/json";
            break;
          case "png":
            content = await cy.png({ output: "blob" });
            mimeType = "image/png";
            break;
          case "svg":
            content = cy.svg();
            mimeType = "image/svg+xml";
            break;
          case "graphml":
            content = exportToGraphML();
            mimeType = "application/xml";
            break;
        }

        // 创建下载链接
        const blob =
          content instanceof Blob
            ? content
            : new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = options.filename || `graph.${options.format}`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Export failed:", error);
      }
    },
    [cy]
  );

  return (
    <div className="export-controls">
      <button
        onClick={() => handleExport({ format: "json", filename: "graph.json" })}
      >
        导出 JSON
      </button>
      <button
        onClick={() => handleExport({ format: "png", filename: "graph.png" })}
      >
        导出 PNG
      </button>
      <button
        onClick={() => handleExport({ format: "svg", filename: "graph.svg" })}
      >
        导出 SVG
      </button>
      <button
        onClick={() =>
          handleExport({ format: "graphml", filename: "graph.graphml" })
        }
      >
        导出 GraphML
      </button>
    </div>
  );
}
```

### 2. 数据导入组件

```typescript
interface ImportOptions {
  format: "json" | "graphml";
}

export function ImportControls({
  cy,
  onImport,
}: {
  cy: cytoscape.Core;
  onImport?: () => void;
}) {
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const format = file.name
          .split(".")
          .pop()
          ?.toLowerCase() as ImportOptions["format"];

        switch (format) {
          case "json":
            importFromJson(text);
            break;
          case "graphml":
            // 实现 GraphML 导入逻辑
            break;
        }

        onImport?.();
      } catch (error) {
        console.error("Import failed:", error);
      }
    },
    [cy, onImport]
  );

  return (
    <div className="import-controls">
      <input
        type="file"
        accept=".json,.graphml"
        onChange={handleFileSelect}
        className="hidden"
        id="file-input"
      />
      <label htmlFor="file-input" className="button">
        导入文件
      </label>
    </div>
  );
}
```

### 3. 使用示例

```typescript
export default function GraphIO() {
  const [message, setMessage] = useState<string>("");

  return (
    <div className="graph-io">
      <CytoscapeGraph
        elements={graphData}
        style={graphStyle}
        onReady={(cy) => (
          <div className="io-controls">
            <ExportControls cy={cy} />
            <ImportControls cy={cy} onImport={() => setMessage("导入成功！")} />
            {message && <div className="message">{message}</div>}
          </div>
        )}
      />
    </div>
  );
}
```

## 最佳实践

### 1. 数据处理

- **数据验证**

  - 检查数据完整性
  - 验证数据格式
  - 处理异常情况

- **性能优化**
  - 分批处理大型数据
  - 使用流式处理
  - 优化内存使用

### 2. 用户体验

- **交互设计**

  - 提供进度反馈
  - 支持拖放操作
  - 预览导入结果

- **错误处理**
  - 友好的错误提示
  - 提供回滚机制
  - 数据恢复选项

### 3. 格式支持

- **标准格式**

  - 支持常用图形格式
  - 保持格式兼容性
  - 提供格式转换

- **自定义格式**
  - 定义清晰的格式规范
  - 提供格式验证工具
  - 支持扩展性

### 4. 安全性

- **数据安全**

  - 敏感数据处理
  - 文件大小限制
  - 格式检查

- **错误恢复**
  - 自动备份
  - 版本控制
  - 导入回滚
