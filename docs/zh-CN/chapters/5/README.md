# 5. 交互与事件处理

> [示例在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/zh-CN/5-交互与事件处理/index.html)

本章节将介绍如何在 Cytoscape.js 中实现交互控制和事件处理。

## 基础配置

初始化图实例时设置交互选项：

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [
    // 节点
    { data: { id: "a", label: "节点 A", weight: 75 } },
    { data: { id: "b", label: "节点 B", weight: 65 } },
    { data: { id: "c", label: "节点 C", weight: 85 } },
    // 边
    {
      data: {
        id: "ab",
        source: "a",
        target: "b",
        label: "边 AB",
        weight: 1,
      },
    },
    {
      data: {
        id: "bc",
        source: "b",
        target: "c",
        label: "边 BC",
        weight: 2,
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
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        width: "data(weight)",
        height: "data(weight)",
      },
    },
    {
      selector: "edge",
      style: {
        width: "data(weight)",
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
        "text-outline-color": "#900",
        "text-outline-width": 3,
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
    {
      selector: ".highlighted",
      style: {
        "background-color": "#61bffc",
        "line-color": "#61bffc",
        "target-arrow-color": "#61bffc",
        "transition-property":
          "background-color, line-color, target-arrow-color",
        "transition-duration": "0.5s",
      },
    },
    {
      selector: ".faded",
      style: {
        opacity: 0.25,
        "text-opacity": 0.25,
      },
    },
  ],
  layout: { name: "circle" },
  // 交互设置
  minZoom: 0.1,
  maxZoom: 10,
  zoomingEnabled: true,
  userZoomingEnabled: true,
  panningEnabled: true,
  userPanningEnabled: true,
  boxSelectionEnabled: true,
  selectionType: "single",
  touchTapThreshold: 8,
  desktopTapThreshold: 4,
  autolock: false,
  autoungrabify: false,
  autounselectify: false,
  // 手势设置
  wheelSensitivity: 0.1,
  pixelRatio: "auto",
});
```

## 交互控制

### 基础交互

```javascript
// 缩放控制
function zoomControl() {
  // 启用/禁用缩放
  cy.zoomingEnabled(true);
  cy.userZoomingEnabled(true);

  // 设置缩放范围
  cy.minZoom(0.1);
  cy.maxZoom(10);

  // 设置缩放级别
  cy.zoom(2.0);

  // 获取当前缩放级别
  const currentZoom = cy.zoom();
}

// 平移控制
function panControl() {
  // 启用/禁用平移
  cy.panningEnabled(true);
  cy.userPanningEnabled(true);

  // 设置平移位置
  cy.pan({ x: 100, y: 100 });

  // 获取当前平移位置
  const currentPan = cy.pan();

  // 相对平移
  cy.panBy({ x: 50, y: 50 });
}

// 自动锁定
function lockControl() {
  // 锁定所有交互
  cy.autolock(true);

  // 锁定节点拖动
  cy.autoungrabify(true);

  // 锁定选择
  cy.autounselectify(true);
}
```

### 选择控制

```javascript
// 选择模式
function selectionControl() {
  // 设置选择类型
  cy.selectionType("single"); // or "additive"

  // 启用/禁用框选
  cy.boxSelectionEnabled(true);

  // 选择操作
  cy.elements().select();
  cy.elements().unselect();

  // 获取选中元素
  const selected = cy.$(":selected");

  // 选择特定元素
  cy.$("#nodeId").select();

  // 选择过滤
  cy.$("node[weight > 70]").select();
}

// 拖拽控制
function dragControl() {
  // 设置可拖拽
  cy.nodes().grabifiable(true);

  // 设置可选择
  cy.nodes().selectifiable(true);

  // 锁定位置
  cy.nodes().locked(true);

  // 自定义拖拽行为
  cy.nodes().on("drag", function (evt) {
    const node = evt.target;
    const pos = node.position();
    // 限制拖拽范围
    if (pos.x < 0) node.position({ x: 0, y: pos.y });
    if (pos.y < 0) node.position({ x: pos.x, y: 0 });
  });
}
```

## 事件系统

### 事件类型

```javascript
// 元素事件
function elementEvents() {
  // 点击事件
  cy.on("tap", "node", function (evt) {
    const node = evt.target;
    const position = evt.position; // 相对于视口
    const renderedPosition = evt.renderedPosition; // 相对于屏幕
    console.log("点击节点:", node.id(), position, renderedPosition);
  });

  // 双击事件
  cy.on("dbltap", "node", function (evt) {
    console.log("双击节点:", evt.target.id());
  });

  // 右键事件
  cy.on("cxttap", "node", function (evt) {
    console.log("右键点击:", evt.target.id());
  });

  // 鼠标事件
  cy.on("mouseover", "node", function (evt) {
    evt.target.addClass("highlighted");
  });

  cy.on("mouseout", "node", function (evt) {
    evt.target.removeClass("highlighted");
  });

  // 拖拽事件
  cy.on("dragstart", "node", function (evt) {
    console.log("开始拖拽:", evt.target.id());
  });

  cy.on("drag", "node", function (evt) {
    console.log("拖拽中:", evt.target.position());
  });

  cy.on("dragfree", "node", function (evt) {
    console.log("拖拽结束:", evt.target.position());
  });
}

// 视图事件
function viewEvents() {
  // 缩放事件
  cy.on("zoom", function (evt) {
    console.log("缩放级别:", cy.zoom());
  });

  // 平移事件
  cy.on("pan", function (evt) {
    console.log("平移位置:", cy.pan());
  });

  // 视口调整
  cy.on("viewport", function (evt) {
    console.log("视口变化:", {
      zoom: cy.zoom(),
      pan: cy.pan(),
    });
  });
}

// 布局事件
function layoutEvents() {
  cy.on("layoutstart", function (evt) {
    console.log("布局开始");
  });

  cy.on("layoutready", function (evt) {
    console.log("布局就绪");
  });

  cy.on("layoutstop", function (evt) {
    console.log("布局完成");
  });
}
```

### 事件处理

```javascript
// 事件委托
function eventDelegation() {
  // 使用选择器委托
  cy.on("tap", "node[weight > 70]", function (evt) {
    console.log("点击大节点:", evt.target.id());
  });

  // 命名空间
  cy.on("tap.namespace", "node", function (evt) {
    console.log("命名空间事件");
  });

  // 移除特定命名空间的事件
  cy.off("tap.namespace");
}

// 事件数据
function eventData() {
  // 传递数据
  cy.on("tap", "node", { customData: "value" }, function (evt) {
    console.log("自定义数据:", evt.data.customData);
  });

  // 事件对象属性
  cy.on("tap", "node", function (evt) {
    console.log({
      type: evt.type,
      target: evt.target,
      timeStamp: evt.timeStamp,
      position: evt.position,
      renderedPosition: evt.renderedPosition,
      originalEvent: evt.originalEvent,
    });
  });
}
```

### 手势识别

```javascript
// 自定义手势
function gestureRecognition() {
  let startPosition;
  let gestureTimeout;

  // 开始手势
  cy.on("tapstart", "node", function (evt) {
    startPosition = evt.position;
    gestureTimeout = setTimeout(() => {
      if (startPosition) {
        console.log("长按手势");
      }
    }, 1000);
  });

  // 移动手势
  cy.on("tapdrag", "node", function (evt) {
    if (startPosition) {
      const currentPosition = evt.position;
      const dx = currentPosition.x - startPosition.x;
      const dy = currentPosition.y - startPosition.y;

      // 判断手势方向
      if (Math.abs(dx) > Math.abs(dy)) {
        console.log("水平滑动");
      } else {
        console.log("垂直滑动");
      }
    }
  });

  // 结束手势
  cy.on("tapend", "node", function () {
    clearTimeout(gestureTimeout);
    startPosition = null;
  });
}
```

## 关键概念说明

1. **交互配置**

   - **缩放设置**

     - `minZoom`, `maxZoom`: 缩放范围
     - `zoomingEnabled`: 是否允许缩放
     - `wheelSensitivity`: 滚轮灵敏度

   - **平移设置**

     - `panningEnabled`: 是否允许平移
     - `userPanningEnabled`: 是否允许用户平移
     - `boxSelectionEnabled`: 是否允许框选

   - **选择设置**
     - `selectionType`: 选择模式
     - `autoungrabify`: 禁止拖拽
     - `autounselectify`: 禁止选择

2. **事件系统**

   - **事件类型**

     - 元素事件: tap, dbltap, mouseover, mouseout
     - 视图事件: zoom, pan, viewport
     - 布局事件: layoutstart, layoutready, layoutstop

   - **事件属性**

     - `type`: 事件类型
     - `target`: 目标元素
     - `position`: 事件位置
     - `timeStamp`: 时间戳

   - **事件处理**
     - 事件委托
     - 命名空间
     - 事件数据传递

3. **手势系统**

   - **基础手势**

     - 点击 (tap)
     - 双击 (dbltap)
     - 长按 (taphold)
     - 滑动 (swipe)

   - **复合手势**

     - 捏合缩放
     - 旋转
     - 多点触控

   - **手势配置**
     - `touchTapThreshold`
     - `desktopTapThreshold`
     - `tapHoldDuration`

4. **性能优化**

   - 使用事件委托
   - 合理设置事件处理器
   - 避免频繁的事件处理
   - 使用节流和防抖
   - 优化手势识别

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
