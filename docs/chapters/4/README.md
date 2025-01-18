# 7.2 高级交互

本章节将介绍 Cytoscape.js 的高级交互功能，包括手势操作、上下文菜单、拖放操作等。

## 交互功能概述

Cytoscape.js 提供了丰富的交互功能：

- 手势操作（缩放、平移）
- 上下文菜单
- 拖放操作
- 多选操作
- 悬停效果
- 自定义交互

## 手势操作

### 基本手势配置

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  // 手势相关配置
  userZoomingEnabled: true, // 允许缩放
  userPanningEnabled: true, // 允许平移
  boxSelectionEnabled: true, // 允许框选
  selectionType: "single", // 选择模式：single 或 additive
  touchTapThreshold: 8, // 触摸点击阈值
  desktopTapThreshold: 4, // 桌面点击阈值
  autoungrabify: false, // 是否禁止拖动节点
  autolock: false, // 是否锁定节点位置
});
```

### 手势控制 API

```javascript
// 启用/禁用缩放
cy.userZoomingEnabled(true);

// 启用/禁用平移
cy.userPanningEnabled(true);

// 启用/禁用框选
cy.boxSelectionEnabled(true);

// 设置缩放范围
cy.minZoom(0.1);
cy.maxZoom(10);
```

## 上下文菜单

使用 `cytoscape-context-menus` 扩展实现上下文菜单：

```javascript
// 注册扩展
cytoscape.use(contextMenus);

// 配置上下文菜单
const cy = cytoscape({
  container: document.getElementById("cy"),
  contextMenus: {
    menuItems: [
      {
        id: "remove",
        content: "删除节点",
        selector: "node",
        onClickFunction: function (event) {
          const target = event.target;
          target.remove();
        },
      },
      {
        id: "edit",
        content: "编辑标签",
        selector: "node, edge",
        onClickFunction: function (event) {
          const target = event.target;
          const label = prompt("输入新标签：", target.data("label"));
          if (label) {
            target.data("label", label);
          }
        },
      },
    ],
  },
});
```

## 拖放操作

### 节点拖放

```javascript
cy.on("dragfree", "node", function (evt) {
  const node = evt.target;
  const position = node.position();
  console.log(
    `节点 ${node.id()} 被拖放到位置: x=${position.x}, y=${position.y}`
  );
});

// 限制拖动范围
cy.on("drag", "node", function (evt) {
  const node = evt.target;
  const position = node.position();

  // 限制在容器范围内
  position.x = Math.max(0, Math.min(position.x, cy.width()));
  position.y = Math.max(0, Math.min(position.y, cy.height()));

  node.position(position);
});
```

### 外部元素拖放

```javascript
// 处理外部元素拖放
cy.on("dragover", function (evt) {
  evt.preventDefault();
});

cy.on("drop", function (evt) {
  const data = evt.dataTransfer.getData("text");
  const position = {
    x: evt.position.x,
    y: evt.position.y,
  };

  // 添加新节点
  cy.add({
    group: "nodes",
    data: { id: "node-" + Date.now(), label: data },
    position: position,
  });
});
```

## 完整示例

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js - 高级交互</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
    <script src="https://unpkg.com/cytoscape-context-menus/cytoscape-context-menus.js"></script>
    <link
      href="https://unpkg.com/cytoscape-context-menus/cytoscape-context-menus.css"
      rel="stylesheet"
      type="text/css"
    />
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
      .draggable {
        padding: 10px;
        margin: 5px;
        background: #eee;
        display: inline-block;
        cursor: move;
      }
    </style>
  </head>
  <body>
    <div class="controls">
      <h1>高级交互示例</h1>
      <div>
        <div class="draggable" draggable="true" data-type="circle">
          圆形节点
        </div>
        <div class="draggable" draggable="true" data-type="rectangle">
          矩形节点
        </div>
      </div>
    </div>
    <div id="cy"></div>
    <script>
      // 注册上下文菜单扩展
      cytoscape.use(contextMenus);

      const cy = cytoscape({
        container: document.getElementById("cy"),
        elements: [
          { data: { id: "a", label: "节点 A" } },
          { data: { id: "b", label: "节点 B" } },
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
            selector: ".highlighted",
            style: {
              "background-color": "#900",
              "line-color": "#900",
              "transition-property": "background-color, line-color",
              "transition-duration": "0.3s",
            },
          },
        ],
        // 交互配置
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: true,
        selectionType: "single",
        // 上下文菜单配置
        contextMenus: {
          menuItems: [
            {
              id: "remove",
              content: "删除",
              selector: "node, edge",
              onClickFunction: function (event) {
                event.target.remove();
              },
            },
            {
              id: "edit",
              content: "编辑标签",
              selector: "node, edge",
              onClickFunction: function (event) {
                const target = event.target;
                const label = prompt("输入新标签：", target.data("label"));
                if (label) {
                  target.data("label", label);
                }
              },
            },
          ],
        },
      });

      // 处理拖放
      document.querySelectorAll(".draggable").forEach((el) => {
        el.addEventListener("dragstart", function (e) {
          e.dataTransfer.setData("text/plain", this.dataset.type);
        });
      });

      cy.on("dragover", function (e) {
        e.preventDefault();
      });

      cy.on("drop", function (e) {
        const type = e.dataTransfer.getData("text/plain");
        const pos = e.position;

        cy.add({
          group: "nodes",
          data: {
            id: "n" + Date.now(),
            label: type + " 节点",
          },
          position: {
            x: pos.x,
            y: pos.y,
          },
          style: {
            shape: type === "circle" ? "ellipse" : "rectangle",
          },
        });
      });

      // 高亮相关节点
      cy.on("mouseover", "node", function (e) {
        const node = e.target;
        node.neighborhood().addClass("highlighted");
      });

      cy.on("mouseout", "node", function (e) {
        const node = e.target;
        node.neighborhood().removeClass("highlighted");
      });
    </script>
  </body>
</html>
```

## 交互功能最佳实践

1. **手势操作**

   - 根据设备类型调整交互阈值
   - 提供适当的视觉反馈
   - 考虑移动设备的触摸操作

2. **上下文菜单**

   - 根据元素类型提供相关操作
   - 使用直观的图标和文字
   - 添加快捷键支持

3. **拖放操作**

   - 提供拖放预览
   - 实现撤销/重做功能
   - 处理边界情况

4. **性能优化**

   - 使用事件委托
   - 避免频繁的 DOM 操作
   - 优化事件处理器

5. **用户体验**

   - 提供清晰的视觉反馈
   - 实现平滑的动画过渡
   - 添加适当的交互提示

6. **错误处理**
   - 验证用户输入
   - 处理异常情况
   - 提供错误提示
