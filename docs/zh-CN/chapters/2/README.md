# 2. 节点与边的基础操作

> [示例在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/zh-CN/2-节点与边的基础操作/index.html)

本章节将介绍如何在 Cytoscape.js 中进行基础的节点和边的操作，包括添加、删除、更新元素以及元素的遍历和集合操作。

## 初始化图实例

首先，我们创建一个包含初始节点和边的图实例：

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [
    // 初始节点
    { data: { id: "a", label: "节点 A", weight: 75 } },
    { data: { id: "b", label: "节点 B", weight: 65 } },
    // 初始边
    {
      data: {
        id: "ab",
        source: "a",
        target: "b",
        label: "边 AB",
        weight: 1.5,
      },
    },
  ],
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(label)",
        width: "data(weight)", // 使用数据属性控制样式
        height: "data(weight)",
      },
    },
    {
      selector: "edge",
      style: {
        width: "data(weight)", // 使用数据属性控制样式
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
        "source-arrow-color": "#900",
      },
    },
  ],
  layout: { name: "grid" },
});
```

## 元素操作

### 添加元素

#### 添加单个节点

```javascript
function addNode() {
  const id = "node-" + Date.now();
  cy.add({
    group: "nodes",
    data: {
      id,
      label: `节点 ${id}`,
      weight: Math.random() * 50 + 50, // 随机权重
    },
    position: {
      // 可以指定位置
      x: Math.random() * 300 + 150,
      y: Math.random() * 200 + 100,
    },
    selected: true, // 可以设置初始状态
    classes: ["new-node"], // 可以添加类
  });
}
```

#### 批量添加元素

```javascript
function addMultipleElements() {
  cy.add([
    { group: "nodes", data: { id: "n1" } },
    { group: "nodes", data: { id: "n2" } },
    { group: "edges", data: { id: "e1", source: "n1", target: "n2" } },
  ]);
}
```

### 删除元素

#### 删除选中元素

```javascript
function removeSelected() {
  cy.$(":selected").remove();
}
```

#### 条件删除

```javascript
function removeByCondition() {
  // 删除所有孤立节点
  cy.$("node[[degree = 0]]").remove();

  // 删除特定类型的边
  cy.$("edge[weight < 1]").remove();
}
```

### 更新元素

#### 更新数据

```javascript
function updateElementData() {
  // 更新单个属性
  cy.$("node:selected").forEach((node) => {
    const newLabel = prompt("输入新标签:", node.data("label"));
    if (newLabel) {
      node.data("label", newLabel);
    }
  });

  // 批量更新多个属性
  cy.$("node:selected").data({
    weight: 100,
    type: "updated",
    timestamp: Date.now(),
  });
}
```

#### 更新位置

```javascript
function updatePosition() {
  cy.$("node:selected").position({
    x: 100,
    y: 100,
  });
}
```

## 元素遍历与集合

### 基础选择器

```javascript
// 选择所有节点
const allNodes = cy.nodes();

// 选择所有边
const allEdges = cy.edges();

// 选择特定ID的元素
const nodeA = cy.$("#a");

// 选择特定类的元素
const newNodes = cy.$(".new-node");

// 选择带有特定数据属性的元素
const heavyNodes = cy.$("node[weight >= 75]");
```

### 遍历操作

```javascript
// 遍历所有相邻节点
function traverseNeighbors(nodeId) {
  const node = cy.$(`#${nodeId}`);
  node.neighborhood().forEach((ele) => {
    console.log(ele.data());
  });
}

// 遍历所有连接的边
function traverseConnectedEdges(nodeId) {
  const node = cy.$(`#${nodeId}`);
  node.connectedEdges().forEach((edge) => {
    console.log(edge.data());
  });
}

// 获取路径
function getPath(sourceId, targetId) {
  const path = cy.$(`#${sourceId}`).shortestPath(cy.$(`#${targetId}`));
  return path;
}
```

### 集合操作

```javascript
// 合并集合
const collection1 = cy.$(".type1");
const collection2 = cy.$(".type2");
const combined = collection1.union(collection2);

// 交集
const intersection = collection1.intersection(collection2);

// 差集
const difference = collection1.difference(collection2);
```

## 数据管理

### 数据存储

```javascript
// 在元素上存储数据
cy.$("#a").data({
  weight: 75,
  type: "user",
  metadata: {
    created: Date.now(),
    status: "active",
  },
});

// 获取数据
const weight = cy.$("#a").data("weight");
const metadata = cy.$("#a").data("metadata");
```

### 批量数据操作

```javascript
// 批量更新数据
cy.batch(() => {
  cy.nodes().forEach((node) => {
    node.data("visited", true);
    node.data("timestamp", Date.now());
  });
});
```

## 关键概念说明

1. **元素选择器**

   - `cy.$()`: 使用选择器查找元素
   - `:selected`: 选中状态的元素
   - `node:selected`: 选中状态的节点
   - `[属性名]`: 属性选择器
   - `.类名`: 类选择器
   - `#id`: ID 选择器

2. **元素数据**

   - `data`: 存储元素的数据（如 id、label 等）
   - `position`: 节点的位置信息（仅适用于节点）
   - `scratch`: 临时数据存储（不会被序列化）

3. **元素操作**

   - `cy.add()`: 添加新元素
   - `remove()`: 删除元素
   - `data()`: 获取或设置元素数据
   - `position()`: 获取或设置节点位置
   - `move()`: 移动节点位置

4. **集合操作**

   - `union()`: 合并集合
   - `intersection()`: 获取交集
   - `difference()`: 获取差集
   - `filter()`: 过滤元素
   - `not()`: 排除元素

5. **遍历方法**

   - `neighborhood()`: 获取邻居元素
   - `connectedEdges()`: 获取连接的边
   - `predecessors()`: 获取前驱节点
   - `successors()`: 获取后继节点
   - `components()`: 获取连通分量

6. **性能优化**

   - 使用 `cy.batch()` 批量操作
   - 缓存频繁使用的选择器结果
   - 使用 `eles.forEach()` 替代 `for` 循环
   - 合理使用事件委托
