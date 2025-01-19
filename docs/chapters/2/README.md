# 2. 节点与边的基础操作

> [查看示例代码](https://github.com/SonghaiFan/learning_cytospace/tree/main/cytoscape_learning_code/2-节点与边的基础操作) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/2-节点与边的基础操作/index.html)

本章节介绍 Cytoscape.js 中节点（Node）和边（Edge）的基本操作，包括添加、删除、修改和查询等功能。

## 基础概念

在 Cytoscape.js 中，节点和边统称为元素（Elements）。每个元素都包含以下属性：

- `group`: 元素类型，可以是 'nodes' 或 'edges'
- `data`: 元素的数据对象，包含 id、label 等属性
- `position`: 节点的位置信息（仅适用于节点）

## 元素操作示例

### 初始化图实例

```javascript
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
```

### 添加节点

```javascript
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
```

### 添加边

```javascript
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
```

### 删除元素

```javascript
function removeSelected() {
  cy.$(":selected").remove();
}
```

### 更新元素

```javascript
function updateSelected() {
  cy.$("node:selected").forEach((node) => {
    const newLabel = prompt("输入新标签:", node.data("label"));
    if (newLabel) {
      node.data("label", newLabel);
    }
  });
}
```

## 元素选择器

Cytoscape.js 提供了强大的选择器语法，类似于 CSS 选择器：

- `node`: 选择所有节点
- `edge`: 选择所有边
- `#id`: 通过 ID 选择元素
- `:selected`: 选择当前选中的元素
- `[attribute]`: 选择具有特定属性的元素
- `[attribute="value"]`: 选择属性值匹配的元素

示例：

```javascript
// 选择所有节点
cy.$("node");

// 选择特定 ID 的节点
cy.$("#node-1");

// 选择所有选中的元素
cy.$(":selected");

// 选择具有特定属性的元素
cy.$("[weight > 50]");
```

## 数据操作

### 获取数据

```javascript
// 获取元素数据
const label = node.data("label");
const source = edge.data("source");

// 获取元素 ID
const id = element.id();
```

### 修改数据

```javascript
// 修改单个属性
element.data("label", "新标签");

// 修改多个属性
element.data({
  label: "新标签",
  weight: 100,
});
```

## 位置操作

### 获取位置

```javascript
const position = node.position();
const x = position.x;
const y = position.y;
```

### 设置位置

```javascript
// 设置单个坐标
node.position("x", 100);

// 设置完整位置
node.position({
  x: 100,
  y: 200,
});
```

## 事件处理

Cytoscape.js 支持多种交互事件：

```javascript
// 点击事件
cy.on("tap", "node", function (evt) {
  const node = evt.target;
  console.log("点击了节点:", node.id());
});

// 选择事件
cy.on("select", "node", function (evt) {
  const node = evt.target;
  console.log("选择了节点:", node.id());
});

// 拖动事件
cy.on("dragfree", "node", function (evt) {
  const node = evt.target;
  console.log("拖动结束:", node.position());
});
```

## 最佳实践

1. 始终为元素指定唯一的 ID
2. 使用有意义的标签和数据属性
3. 合理组织数据结构
4. 使用选择器优化元素查询
5. 批量操作时使用事务以提高性能

```javascript
// 使用事务进行批量操作
cy.batch(() => {
  for (let i = 0; i < 100; i++) {
    addNode();
  }
});
```
