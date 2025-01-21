# 7. 数据导入导出

> [示例在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/zh-CN/7-数据导入导出/index.html)

本章节将介绍如何在 Cytoscape.js 中实现数据的导入和导出功能，包括 JSON、CSV 和图片格式。

## 基础配置

首先初始化一个包含基本节点和边的图实例：

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [
    // 节点
    { data: { id: "a", label: "A", type: "user", weight: 75 } },
    { data: { id: "b", label: "B", type: "user", weight: 65 } },
    { data: { id: "c", label: "C", type: "group", parent: "compound" } },
    { data: { id: "d", label: "D", type: "user", parent: "compound" } },
    // 复合节点
    { data: { id: "compound", label: "Compound Node" } },
    // 边
    {
      data: {
        id: "ab",
        source: "a",
        target: "b",
        type: "friend",
        weight: 1,
      },
    },
    {
      data: {
        id: "bc",
        source: "b",
        target: "c",
        type: "member",
        weight: 2,
      },
    },
    {
      data: {
        id: "cd",
        source: "c",
        target: "d",
        type: "member",
        weight: 1,
      },
    },
  ],
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(label)",
        width: "data(weight)",
        height: "data(weight)",
      },
    },
    {
      selector: "node:parent",
      style: {
        "background-opacity": 0.333,
        "background-color": "#666",
        "border-width": 3,
        "border-color": "#666",
      },
    },
    {
      selector: "edge",
      style: {
        width: "data(weight)",
        "line-color": "#999",
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
      },
    },
  ],
  layout: { name: "grid" },
});
```

## 数据格式

### JSON 格式

```javascript
// 完整的图数据结构
const graphData = {
  elements: {
    nodes: [
      {
        data: { id: "a", label: "A", type: "user" },
        position: { x: 100, y: 100 },
        selected: true,
        classes: ["type1", "selected"],
      },
    ],
    edges: [
      {
        data: {
          id: "ab",
          source: "a",
          target: "b",
          weight: 1,
        },
        selected: false,
        classes: "highlighted",
      },
    ],
  },
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#666",
      },
    },
  ],
  layout: {
    name: "grid",
  },
  zoom: 1,
  pan: { x: 0, y: 0 },
};

// 简化的元素数据
const elementsOnly = {
  nodes: [{ data: { id: "a", label: "A" } }],
  edges: [{ data: { source: "a", target: "b" } }],
};
```

### CSV 格式

```csv
// nodes.csv
id,label,type,weight,parent
a,Node A,user,75,
b,Node B,user,65,
c,Node C,group,85,compound
d,Node D,user,60,compound
compound,Compound Node,compound,,

// edges.csv
id,source,target,type,weight
ab,a,b,friend,1
bc,b,c,member,2
cd,c,d,member,1
```

## 数据导出

### JSON 导出

```javascript
function exportJSON(options = {}) {
  // 配置选项
  const defaultOptions = {
    output: "elements", // 'full' 或 'elements'
    formatted: true, // 是否格式化 JSON
    elementFilter: (ele) => true, // 元素过滤器
    styleFilter: (style) => true, // 样式过滤器
  };
  const finalOptions = { ...defaultOptions, ...options };

  // 获取数据
  let data;
  if (finalOptions.output === "full") {
    data = cy.json();
  } else {
    data = {
      nodes: cy
        .nodes()
        .filter(finalOptions.elementFilter)
        .map((node) => ({
          data: node.data(),
          position: node.position(),
          selected: node.selected(),
          classes: node.classes().toArray(),
        })),
      edges: cy
        .edges()
        .filter(finalOptions.elementFilter)
        .map((edge) => ({
          data: edge.data(),
          selected: edge.selected(),
          classes: edge.classes().toArray(),
        })),
    };
  }

  // 创建文件
  const json = finalOptions.formatted
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);

  const blob = new Blob([json], {
    type: "application/json",
  });
  saveAs(blob, "graph.json");

  return data;
}
```

### CSV 导出

```javascript
function exportCSV(options = {}) {
  // 配置选项
  const defaultOptions = {
    delimiter: ",",
    includeHeaders: true,
    nodeAttributes: ["id", "label", "type", "weight", "parent"],
    edgeAttributes: ["id", "source", "target", "type", "weight"],
    elementFilter: (ele) => true,
    formatters: {
      // 自定义格式化器
      weight: (val) => Number(val).toFixed(2),
    },
  };
  const finalOptions = { ...defaultOptions, ...options };

  // 生成节点 CSV
  let nodesCSV = "";
  if (finalOptions.includeHeaders) {
    nodesCSV = finalOptions.nodeAttributes.join(finalOptions.delimiter) + "\n";
  }

  cy.nodes()
    .filter(finalOptions.elementFilter)
    .forEach((node) => {
      const data = node.data();
      const row = finalOptions.nodeAttributes.map((attr) => {
        const val = data[attr];
        return finalOptions.formatters[attr]
          ? finalOptions.formatters[attr](val)
          : val || "";
      });
      nodesCSV += row.join(finalOptions.delimiter) + "\n";
    });

  // 生成边 CSV
  let edgesCSV = "";
  if (finalOptions.includeHeaders) {
    edgesCSV = finalOptions.edgeAttributes.join(finalOptions.delimiter) + "\n";
  }

  cy.edges()
    .filter(finalOptions.elementFilter)
    .forEach((edge) => {
      const data = edge.data();
      const row = finalOptions.edgeAttributes.map((attr) => {
        const val = data[attr];
        return finalOptions.formatters[attr]
          ? finalOptions.formatters[attr](val)
          : val || "";
      });
      edgesCSV += row.join(finalOptions.delimiter) + "\n";
    });

  // 创建文件
  const blob = new Blob(["Nodes:\n", nodesCSV, "\nEdges:\n", edgesCSV], {
    type: "text/csv",
  });
  saveAs(blob, "graph.csv");

  return { nodesCSV, edgesCSV };
}
```

### 图片导出

```javascript
function exportImage(options = {}) {
  // 配置选项
  const defaultOptions = {
    type: "png", // 'png' 或 'jpg'
    quality: 1.0, // 图片质量 (0.0 - 1.0)
    scale: 1.0, // 缩放比例
    full: false, // 是否导出完整图形
    bg: "#ffffff", // 背景颜色
    maxWidth: undefined, // 最大宽度
    maxHeight: undefined, // 最大高度
  };
  const finalOptions = { ...defaultOptions, ...options };

  // 生成图片
  const image = finalOptions.full ? cy.png(finalOptions) : cy.jpg(finalOptions);

  // 创建下载链接
  const link = document.createElement("a");
  link.download = `graph.${finalOptions.type}`;
  link.href = image;
  link.click();

  return image;
}
```

## 数据导入

### JSON 导入

```javascript
function importJSON(content, options = {}) {
  // 配置选项
  const defaultOptions = {
    type: "merge", // 'replace' 或 'merge'
    elementFilter: (ele) => true,
    styleFilter: (style) => true,
    beforeImport: () => {}, // 导入前回调
    afterImport: () => {}, // 导入后回调
  };
  const finalOptions = { ...defaultOptions, ...options };

  try {
    // 解析数据
    const data = typeof content === "string" ? JSON.parse(content) : content;

    // 导入前处理
    finalOptions.beforeImport(data);

    // 清除或保留现有元素
    if (finalOptions.type === "replace") {
      cy.elements().remove();
    }

    // 导入元素
    if (data.elements) {
      // 完整格式
      const elements = [
        ...(data.elements.nodes || []),
        ...(data.elements.edges || []),
      ].filter(finalOptions.elementFilter);

      cy.add(elements);

      // 导入样式
      if (data.style) {
        const styles = data.style.filter(finalOptions.styleFilter);
        cy.style(styles);
      }

      // 导入视图状态
      if (data.zoom) cy.zoom(data.zoom);
      if (data.pan) cy.pan(data.pan);
    } else if (Array.isArray(data)) {
      // 简单数组格式
      const elements = data.filter(finalOptions.elementFilter);
      cy.add(elements);
    }

    // 运行布局
    cy.layout({ name: "grid" }).run();

    // 导入后处理
    finalOptions.afterImport(data);

    return true;
  } catch (error) {
    console.error("导入失败:", error);
    return false;
  }
}
```

### CSV 导入

```javascript
function importCSV(content, options = {}) {
  // 配置选项
  const defaultOptions = {
    delimiter: ",",
    nodeRequired: ["id"], // 必需的节点属性
    edgeRequired: ["source", "target"], // 必需的边属性
    typeConverters: {
      // 类型转换器
      weight: (val) => Number(val),
      selected: (val) => val === "true",
    },
    beforeImport: () => {},
    afterImport: () => {},
  };
  const finalOptions = { ...defaultOptions, ...options };

  try {
    // 解析数据
    const [nodesSection, edgesSection] = content.split("\nEdges:\n");
    const nodes = parseCSVSection(
      nodesSection.replace("Nodes:\n", ""),
      finalOptions
    );
    const edges = parseCSVSection(edgesSection, finalOptions);

    // 验证必需字段
    const valid = validateCSVData(nodes, edges, finalOptions);
    if (!valid) {
      throw new Error("数据验证失败");
    }

    // 导入前处理
    finalOptions.beforeImport({ nodes, edges });

    // 更新图形
    cy.elements().remove();

    // 添加节点
    nodes.forEach((node) => {
      cy.add({
        group: "nodes",
        data: convertTypes(node, finalOptions.typeConverters),
      });
    });

    // 添加边
    edges.forEach((edge) => {
      cy.add({
        group: "edges",
        data: convertTypes(edge, finalOptions.typeConverters),
      });
    });

    // 运行布局
    cy.layout({ name: "grid" }).run();

    // 导入后处理
    finalOptions.afterImport({ nodes, edges });

    return true;
  } catch (error) {
    console.error("导入失败:", error);
    return false;
  }
}

// 解析 CSV 部分
function parseCSVSection(csv, options) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(options.delimiter);

  return lines.slice(1).map((line) => {
    const values = line.split(options.delimiter);
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim() || "";
    });
    return obj;
  });
}

// 验证 CSV 数据
function validateCSVData(nodes, edges, options) {
  // 验证节点
  const validNodes = nodes.every((node) =>
    options.nodeRequired.every(
      (field) => node[field] !== undefined && node[field] !== ""
    )
  );

  // 验证边
  const validEdges = edges.every((edge) =>
    options.edgeRequired.every(
      (field) => edge[field] !== undefined && edge[field] !== ""
    )
  );

  // 验证边的源和目标节点存在
  const nodeIds = new Set(nodes.map((n) => n.id));
  const validConnections = edges.every(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  return validNodes && validEdges && validConnections;
}

// 转换数据类型
function convertTypes(obj, converters) {
  const result = { ...obj };
  Object.entries(converters).forEach(([key, converter]) => {
    if (result[key] !== undefined) {
      result[key] = converter(result[key]);
    }
  });
  return result;
}
```

## 关键概念说明

1. **数据格式**

   - **JSON 格式**

     - 完整格式：包含元素、样式、布局和视图状态
     - 简化格式：仅包含元素数据
     - 序列化选项：格式化、过滤、转换

   - **CSV 格式**

     - 节点表：基本属性和元数据
     - 边表：连接关系和权重
     - 分隔符和转义处理

   - **图片格式**
     - PNG：支持透明背景
     - JPG：较小文件大小
     - 分辨率和质量控制

2. **导出功能**

   - **数据选择**

     - 使用 `cy.json()` 获取完整图数据
     - 使用 `cy.nodes()` 和 `cy.edges()` 遍历元素
     - 支持数据过滤和转换

   - **格式控制**

     - JSON 格式化和压缩
     - CSV 分隔符和引号处理
     - 图片质量和大小控制

   - **批量导出**
     - 多文件导出
     - 进度反馈
     - 错误处理

3. **导入功能**

   - **数据解析**

     - JSON 解析和验证
     - CSV 解析和类型转换
     - 数据清理和标准化

   - **导入策略**

     - 替换：清除现有数据
     - 合并：保留现有数据
     - 增量：仅添加新数据

   - **错误处理**
     - 数据验证
     - 类型检查
     - 错误恢复

4. **性能优化**

   - **内存管理**

     - 大文件分块处理
     - 及时释放资源
     - 避免内存泄漏

   - **处理效率**

     - 批量操作
     - 异步处理
     - 缓存利用

   - **用户体验**
     - 进度指示
     - 取消操作
     - 错误反馈

5. **最佳实践**

   - **数据准备**

     - 验证数据完整性
     - 清理无效数据
     - 标准化格式

   - **错误处理**

     - 提供清晰错误信息
     - 支持错误恢复
     - 记录错误日志

   - **用户界面**
     - 直观的操作流程
     - 清晰的反馈信息
     - 灵活的配置选项

## 示例：完整的数据管理界面

```html
<div class="controls">
  <div class="export-controls">
    <h3>导出选项</h3>
    <div>
      <button onclick="exportJSON({output: 'full'})">导出完整 JSON</button>
      <button onclick="exportJSON({output: 'elements'})">导出元素 JSON</button>
      <button onclick="exportCSV()">导出 CSV</button>
      <div class="image-export">
        <button onclick="exportImage({type: 'png'})">导出 PNG</button>
        <button onclick="exportImage({type: 'jpg'})">导出 JPG</button>
        <label>
          <input type="checkbox" id="export-full" />
          导出完整图形
        </label>
        <label>
          质量:
          <input
            type="range"
            id="export-quality"
            min="0"
            max="1"
            step="0.1"
            value="1"
          />
        </label>
      </div>
    </div>
  </div>

  <div class="import-controls">
    <h3>导入选项</h3>
    <div>
      <input type="file" id="file-input" accept=".json,.csv" />
      <div class="import-options">
        <label>
          <input type="radio" name="import-type" value="replace" checked />
          替换现有数据
        </label>
        <label>
          <input type="radio" name="import-type" value="merge" />
          合并现有数据
        </label>
      </div>
      <button onclick="importData()">导入数据</button>
      <button onclick="resetGraph()">重置图形</button>
    </div>
  </div>
</div>

<div id="data-preview">
  <div class="preview-header">
    <strong>数据预览:</strong>
    <button onclick="clearPreview()">清除</button>
  </div>
  <div id="preview-content"></div>
</div>

<div id="status-bar">
  <span id="element-count">节点: 0 | 边: 0</span>
  <span id="operation-status"></span>
</div>
```
