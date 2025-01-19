# 5. 交互与事件处理

> [查看示例代码](https://github.com/SonghaiFan/learning_cytospace/tree/main/cytoscape_learning_code/5-交互与事件处理) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/5-交互与事件处理/index.html)

本章节介绍 Cytoscape.js 中的交互功能和事件处理系统，包括用户交互控制、事件监听和处理等功能。

## 交互控制

### 基础配置

在初始化图实例时，可以设置交互相关的选项：

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  // 交互设置
  userZoomingEnabled: true, // 允许缩放
  userPanningEnabled: true, // 允许平移
  boxSelectionEnabled: true, // 允许框选
  selectionType: "single", // 选择模式
});
```

### 交互功能切换

```javascript
// 缩放控制
function toggleZoom() {
  const enabled = cy.userZoomingEnabled();
  cy.userZoomingEnabled(!enabled);
}

// 平移控制
function togglePan() {
  const enabled = cy.userPanningEnabled();
  cy.userPanningEnabled(!enabled);
}

// 框选控制
function toggleBoxSelection() {
  const enabled = cy.boxSelectionEnabled();
  cy.boxSelectionEnabled(!enabled);
}

// 拖拽控制
function toggleGrab() {
  const enabled = !cy.nodes().grabifiable();
  cy.nodes().grabifiable(enabled);
}
```

### 选择操作

```javascript
// 全选
function selectAll() {
  cy.elements().select();
}

// 取消选择
function unselectAll() {
  cy.elements().unselect();
}

// 反选
function invertSelection() {
  cy.elements().forEach((ele) => {
    if (ele.selected()) {
      ele.unselect();
    } else {
      ele.select();
    }
  });
}
```

## 事件系统

### 元素事件

```javascript
// 点击事件
cy.on("tap", "node", function (evt) {
  const node = evt.target;
  console.log(`点击节点: ${node.data("label")}`);
});

cy.on("tap", "edge", function (evt) {
  const edge = evt.target;
  console.log(`点击边: ${edge.data("label")}`);
});

// 选择事件
cy.on("select", "node, edge", function (evt) {
  const ele = evt.target;
  console.log(`选择元素: ${ele.data("label")}`);
});

cy.on("unselect", "node, edge", function (evt) {
  const ele = evt.target;
  console.log(`取消选择: ${ele.data("label")}`);
});

// 鼠标悬停
cy.on("mouseover", "node, edge", function (evt) {
  const ele = evt.target;
  console.log(`鼠标悬停: ${ele.data("label")}`);
});

// 拖拽事件
cy.on("dragfree", "node", function (evt) {
  const node = evt.target;
  const pos = node.position();
  console.log(
    `节点拖拽结束: ${node.data("label")} (${Math.round(pos.x)}, ${Math.round(
      pos.y
    )})`
  );
});
```

### 视图事件

```javascript
// 缩放事件
cy.on("zoom", function (evt) {
  console.log(`缩放级别: ${Math.round(cy.zoom() * 100) / 100}`);
});

// 平移事件
cy.on("pan", function (evt) {
  const pan = cy.pan();
  console.log(`画布平移: (${Math.round(pan.x)}, ${Math.round(pan.y)})`);
});
```

## 样式反馈

为不同状态的元素设置样式，提供视觉反馈：

```javascript
const style = [
  // 选中状态
  {
    selector: ":selected",
    style: {
      "background-color": "#900",
      "line-color": "#900",
      "target-arrow-color": "#900",
      "source-arrow-color": "#900",
    },
  },
  // 激活状态
  {
    selector: ":active",
    style: {
      "overlay-color": "#000",
      "overlay-padding": 10,
      "overlay-opacity": 0.25,
    },
  },
];
```

## 事件记录

实现事件日志系统，记录用户交互：

```javascript
function logEvent(event) {
  const log = document.createElement("div");
  log.textContent = `${new Date().toLocaleTimeString()} - ${event}`;
  eventLog.insertBefore(log, eventLog.firstChild);
  // 限制日志数量
  if (eventLog.children.length > 50) {
    eventLog.removeChild(eventLog.lastChild);
  }
}
```

## 事件类型

### 鼠标事件

- `tap`: 点击
- `mouseover`: 鼠标进入
- `mouseout`: 鼠标离开
- `mousemove`: 鼠标移动
- `mousedown`: 鼠标按下
- `mouseup`: 鼠标释放

### 手势事件

- `tapstart`: 触摸开始
- `tapdrag`: 触摸拖动
- `tapend`: 触摸结束
- `pinchstart`: 捏合开始
- `pinchend`: 捏合结束

### 状态事件

- `select`: 选择
- `unselect`: 取消选择
- `lock`: 锁定
- `unlock`: 解锁
- `grab`: 抓取
- `free`: 释放

### 视图事件

- `zoom`: 缩放
- `pan`: 平移
- `viewport`: 视口变化

## 最佳实践

1. 交互控制

   - 根据场景启用/禁用适当的交互功能
   - 提供清晰的交互反馈
   - 实现撤销/重做机制

2. 事件处理

   - 使用事件委托优化性能
   - 避免事件处理器中的重操作
   - 实现适当的事件节流/防抖

3. 用户体验

   - 提供直观的交互提示
   - 保持交互的一致性
   - 支持键盘快捷键

4. 性能优化
   - 合理使用事件绑定
   - 及时移除不需要的事件监听
   - 优化事件处理逻辑

## 示例：实现自定义交互

```javascript
// 双击节点展开/收起
cy.on("dblclick", "node", function (evt) {
  const node = evt.target;
  const neighborhood = node.neighborhood();

  if (node.data("expanded")) {
    neighborhood.style("display", "none");
    node.data("expanded", false);
  } else {
    neighborhood.style("display", "element");
    node.data("expanded", true);
  }
});

// 悬停高亮邻居
cy.on("mouseover", "node", function (evt) {
  const node = evt.target;
  const neighborhood = node.neighborhood();

  neighborhood.addClass("highlighted");
  node.addClass("highlighted");
});

cy.on("mouseout", "node", function (evt) {
  const node = evt.target;
  const neighborhood = node.neighborhood();

  neighborhood.removeClass("highlighted");
  node.removeClass("highlighted");
});
```
