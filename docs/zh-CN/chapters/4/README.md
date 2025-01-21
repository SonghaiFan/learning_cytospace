# 4. 样式与视觉效果

> [查看示例代码](../examples/4-样式与动画/index.html) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/4-样式与动画/index.html)

本章节将介绍如何在 Cytoscape.js 中设置元素样式和创建动画效果。

## 基础样式设置

初始化图实例时设置基础样式：

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [
    // 节点
    { data: { id: "a", label: "节点 A", type: "special" } },
    { data: { id: "b", label: "节点 B", weight: 75 } },
    { data: { id: "c", label: "节点 C", parent: "compound" } },
    // 复合节点
    { data: { id: "compound", label: "复合节点" } },
    // 边
    {
      data: {
        id: "ab",
        source: "a",
        target: "b",
        label: "边 AB",
        weight: 2,
      },
    },
    {
      data: {
        id: "bc",
        source: "b",
        target: "c",
        label: "边 BC",
        weight: 1,
      },
    },
    {
      data: {
        id: "ca",
        source: "c",
        target: "a",
        label: "边 CA",
        weight: 3,
      },
    },
  ],
  style: [
    // 基础节点样式
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        width: 60,
        height: 60,
        // 字体样式
        "font-size": 12,
        "font-weight": "normal",
        "font-family": "Helvetica",
        // 边框样式
        "border-width": 2,
        "border-color": "#000",
        "border-opacity": 0.5,
      },
    },
    // 特殊节点样式
    {
      selector: "node[type='special']",
      style: {
        "background-color": "#e74c3c",
        shape: "diamond",
      },
    },
    // 基于数据的节点样式
    {
      selector: "node[weight]",
      style: {
        width: "data(weight)",
        height: "data(weight)",
      },
    },
    // 复合节点样式
    {
      selector: "node:parent",
      style: {
        "background-opacity": 0.333,
        "background-color": "#ad1a66",
        "border-width": 3,
        "border-color": "#ad1a66",
      },
    },
    // 基础边样式
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#999",
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
        label: "data(label)",
        "text-rotation": "autorotate",
        // 边标签样式
        "text-margin-y": -10,
        "text-background-color": "#fff",
        "text-background-opacity": 1,
        "text-background-padding": 4,
        // 箭头样式
        "target-arrow-color": "#999",
        "source-arrow-color": "#999",
        "arrow-scale": 1.5,
      },
    },
    // 基于数据的边样式
    {
      selector: "edge[weight]",
      style: {
        width: "data(weight)",
        "line-style": "data(weight)",
      },
    },
    // 交互状态样式
    {
      selector: ":selected",
      style: {
        "background-color": "#ff0",
        "line-color": "#ff0",
        "target-arrow-color": "#ff0",
        "source-arrow-color": "#ff0",
      },
    },
    {
      selector: ":active",
      style: {
        "overlay-color": "#ff0",
        "overlay-padding": 10,
        "overlay-opacity": 0.25,
      },
    },
    {
      selector: ":grabbed",
      style: {
        "overlay-color": "#0f0",
      },
    },
  ],
  layout: { name: "circle" },
});
```

## 样式控制

### 节点样式

#### 基础形状

```javascript
function changeNodeShape(shape) {
  cy.nodes().style({
    shape: shape, // 可用值：
    // 基础形状：'ellipse', 'triangle', 'rectangle', 'diamond'
    // 多边形：'pentagon', 'hexagon', 'heptagon', 'octagon'
    // 特殊形状：'star', 'vee', 'rhomboid'
    // 自定义：'polygon' 配合 'shape-polygon-points'
  });
}

// 自定义多边形
function setCustomPolygon() {
  cy.nodes().style({
    shape: "polygon",
    "shape-polygon-points": [
      -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0, 0.8, -0.5, 0.5,
    ],
  });
}
```

#### 复合样式

```javascript
function setCompoundStyle() {
  // 父节点样式
  cy.nodes(":parent").style({
    "background-opacity": 0.333,
    "background-color": "#ad1a66",
    "border-width": 3,
    "border-color": "#ad1a66",
    shape: "roundrectangle",
    padding: 10,
  });

  // 子节点样式
  cy.nodes(":child").style({
    "background-color": "#f1f1f1",
    shape: "rectangle",
  });
}
```

#### 渐变效果

```javascript
function setGradient() {
  cy.nodes().style({
    "background-gradient-stop-colors": "#ff0000 #00ff00",
    "background-gradient-stop-positions": "0% 100%",
    "background-gradient-direction": "to-bottom-right",
  });
}
```

### 边样式

#### 线型与箭头

```javascript
function setEdgeStyle() {
  cy.edges().style({
    // 线型
    "curve-style": "bezier", // 'haystack', 'segments', 'straight', 'taxi'
    "line-style": "solid", // 'dotted', 'dashed'
    "line-dash-pattern": [6, 3], // 自定义虚线模式
    "line-dash-offset": 1,

    // 箭头
    "source-arrow-shape": "triangle",
    "mid-source-arrow-shape": "diamond",
    "target-arrow-shape": "triangle",
    "source-arrow-fill": "hollow", // 'filled'
    "target-arrow-fill": "filled",

    // 端点
    "source-endpoint": "outside-to-node",
    "target-endpoint": "outside-to-node",

    // 控制点
    "control-point-step-size": 40,
    "control-point-weights": [0.25, 0.75],
    "control-point-distances": [-50, 50],
  });
}
```

#### 复合边

```javascript
function setCompoundEdge() {
  // 节点到复合节点的边
  cy.edges('[source = "compound"]').style({
    "curve-style": "bezier",
    "source-endpoint": "inside-to-node",
  });

  // 复合节点内部的边
  cy.edges()
    .filter(
      (edge) => edge.source().parent().id() === edge.target().parent().id()
    )
    .style({
      "curve-style": "haystack",
    });
}
```

## 动画系统

### 基础动画

```javascript
function basicAnimation() {
  // 单个属性动画
  cy.nodes().animate({
    style: {
      backgroundColor: "#ff0000",
      width: 75,
      height: 75,
    },
    duration: 1000,
    easing: "ease-in-out-cubic",
  });

  // 位置动画
  cy.nodes().animate({
    position: { x: 100, y: 100 },
    duration: 1000,
  });

  // 样式和位置组合动画
  cy.nodes().animate({
    style: { backgroundColor: "#ff0000" },
    position: { x: 100, y: 100 },
    duration: 1000,
  });
}
```

### 复杂动画序列

```javascript
function complexAnimation() {
  // 创建动画
  const a1 = cy.nodes().animation({
    style: { backgroundColor: "#ff0000" },
    duration: 1000,
  });

  const a2 = cy.nodes().animation({
    style: { width: 75, height: 75 },
    duration: 1000,
  });

  // 并行动画
  Promise.all([a1.play().promise(), a2.play().promise()]).then(() => {
    // 动画完成后的操作
  });

  // 序列动画
  a1.play()
    .promise("complete")
    .then(() => a2.play());

  // 重复动画
  a1.play()
    .promise("complete")
    .then(() => {
      a1.reverse().play();
    });
}
```

### 动画队列

```javascript
function queueAnimation() {
  const queue = cy.nodes();

  // 添加到队列
  queue
    .animation({
      style: { backgroundColor: "#ff0000" },
      duration: 1000,
    })
    .play();

  queue
    .animation({
      style: { width: 75 },
      duration: 1000,
    })
    .play();

  // 清空队列
  queue.stop();
}
```

### 性能优化动画

```javascript
function performantAnimation() {
  // 批量处理
  cy.batch(() => {
    cy.nodes().forEach((node) => {
      node
        .animation({
          style: { backgroundColor: "#ff0000" },
          duration: 1000,
        })
        .play();
    });
  });

  // 使用 requestAnimationFrame
  let frame = 0;
  const animate = () => {
    const progress = frame / 60; // 60fps
    cy.nodes().style("width", 50 + Math.sin(progress) * 25);
    frame++;
    if (frame < 60) {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
}
```

## 关键概念说明

1. **样式选择器**

   - `node`, `edge`: 所有节点/边
   - `#id`: 特定 ID 的元素
   - `.className`: 特定类的元素
   - `[属性名]`: 带有特定属性的元素
   - `:selected`, `:active`, `:grabbed`: 状态选择器
   - `:parent`, `:child`: 复合节点选择器
   - `>`, `~`, `+`: 关系选择器

2. **节点样式属性**

   - **基础属性**
     - `shape`: 节点形状
     - `background-color`: 背景颜色
     - `width`, `height`: 尺寸
     - `label`: 标签文本
   - **边框与阴影**
     - `border-width`: 边框宽度
     - `border-style`: 边框样式
     - `border-color`: 边框颜色
     - `shadow-blur`: 阴影模糊
     - `shadow-color`: 阴影颜色
   - **文本样式**
     - `font-family`: 字体
     - `font-size`: 字号
     - `text-valign`: 垂直对齐
     - `text-halign`: 水平对齐
     - `text-wrap`: 文本换行
   - **渐变与透明度**
     - `background-opacity`: 背景透明度
     - `background-gradient-direction`: 渐变方向
     - `background-gradient-stop-colors`: 渐变颜色
     - `background-gradient-stop-positions`: 渐变位置

3. **边样式属性**

   - **线条属性**
     - `line-style`: 线型样式
     - `line-color`: 线条颜色
     - `width`: 线条宽度
     - `curve-style`: 曲线样式
   - **箭头属性**
     - `source-arrow-shape`: 起始箭头
     - `target-arrow-shape`: 目标箭头
     - `arrow-scale`: 箭头大小
     - `arrow-fill`: 箭头填充
   - **标签属性**
     - `text-rotation`: 文本旋转
     - `text-margin-x/y`: 文本边距
     - `text-background-color`: 文本背景色
     - `text-border-width`: 文本边框宽度

4. **动画系统**

   - **动画属性**
     - `duration`: 持续时间
     - `easing`: 缓动函数
     - `delay`: 延迟时间
     - `queue`: 是否队列化
   - **动画控制**
     - `play()`: 播放动画
     - `pause()`: 暂停动画
     - `stop()`: 停止动画
     - `rewind()`: 重置动画
     - `reverse()`: 反向播放
   - **动画事件**
     - `complete`: 完成事件
     - `step`: 步进事件
     - `frame`: 帧事件
   - **性能优化**
     - 使用 `batch()`
     - 避免频繁样式更新
     - 使用 `requestAnimationFrame`
     - 合理使用动画队列

5. **性能优化**

   - 使用类选择器代替属性选择器
   - 缓存频繁使用的选择器结果
   - 批量处理样式更新
   - 使用 `raf` 代替 `setInterval`
   - 避免不必要的动画
   - 合理设置动画帧率
