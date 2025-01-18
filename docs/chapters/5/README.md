# 7.3 工具提示

本章节将介绍如何在 Cytoscape.js 中实现丰富的工具提示功能，包括基本提示、自定义提示和动态提示等。

## 工具提示概述

工具提示（Tooltip）是图形可视化中重要的交互元素，可以：

- 显示元素的详细信息
- 提供操作提示
- 展示相关数据
- 增强用户体验

## 基本工具提示

### 使用 title 属性

```javascript
cy.style().selector("node").style({
  title: "data(label)", // 使用节点的 label 数据作为提示文本
});
```

### 使用 CSS 伪类

```css
#cy node:hover {
  content: "data(info)";
  text-background-color: #000;
  text-background-opacity: 0.7;
  color: #fff;
}
```

## 使用 Popper.js

Popper.js 是一个强大的定位引擎，可以用来创建高度可定制的工具提示：

```javascript
// 安装依赖
// npm install @popperjs/core
// npm install cytoscape-popper

// 注册扩展
cytoscape.use(cytoscapePopper);

// 创建工具提示
cy.nodes().forEach((node) => {
  let ref = node.popperRef(); // 获取参考元素

  let tip = new Popper(ref, {
    content: () => {
      let div = document.createElement("div");
      div.classList.add("tooltip");
      div.innerHTML = `
        <h3>${node.data("label")}</h3>
        <p>${node.data("description")}</p>
      `;
      document.body.appendChild(div);
      return div;
    },
    placement: "top",
    ...popperOptions,
  });
});
```

## 自定义工具提示

### HTML 工具提示

```javascript
function createTooltip(target) {
  const data = target.data();
  const position = target.renderedPosition();

  const tooltip = document.createElement("div");
  tooltip.className = "custom-tooltip";
  tooltip.innerHTML = `
    <div class="tooltip-header">${data.label}</div>
    <div class="tooltip-content">
      <div>ID: ${data.id}</div>
      <div>类型: ${data.type}</div>
      <div>属性: ${data.properties}</div>
    </div>
  `;

  document.body.appendChild(tooltip);

  // 定位工具提示
  tooltip.style.left = `${position.x}px`;
  tooltip.style.top = `${position.y - tooltip.offsetHeight}px`;

  return tooltip;
}
```

### 交互式工具提示

```javascript
cy.on("mouseover", "node", function (evt) {
  const node = evt.target;
  const tooltip = createTooltip(node);

  // 添加交互按钮
  const actions = document.createElement("div");
  actions.className = "tooltip-actions";
  actions.innerHTML = `
    <button onclick="editNode('${node.id()}')">编辑</button>
    <button onclick="deleteNode('${node.id()}')">删除</button>
  `;

  tooltip.appendChild(actions);
});

cy.on("mouseout", "node", function () {
  const tooltip = document.querySelector(".custom-tooltip");
  if (tooltip) {
    tooltip.remove();
  }
});
```

## 完整示例

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js - 工具提示</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
    <script src="https://unpkg.com/@popperjs/core@2"></script>
    <script src="https://unpkg.com/cytoscape-popper"></script>
    <style>
      #cy {
        width: 600px;
        height: 400px;
        border: 1px solid #ccc;
        margin: 20px auto;
      }
      .custom-tooltip {
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        z-index: 1000;
      }
      .tooltip-header {
        font-weight: bold;
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid #eee;
      }
      .tooltip-content {
        font-size: 14px;
      }
      .tooltip-actions {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #eee;
      }
      .tooltip-actions button {
        margin: 0 4px;
        padding: 4px 8px;
        border: none;
        border-radius: 2px;
        background: #f0f0f0;
        cursor: pointer;
      }
      .tooltip-actions button:hover {
        background: #e0e0e0;
      }
    </style>
  </head>
  <body>
    <div id="cy"></div>
    <script>
      // 注册 popper 扩展
      cytoscape.use(cytoscapePopper);

      const cy = cytoscape({
        container: document.getElementById("cy"),
        elements: [
          {
            data: {
              id: "a",
              label: "节点 A",
              type: "类型1",
              description: "这是节点 A 的详细描述",
              properties: ["属性1", "属性2"],
            },
          },
          {
            data: {
              id: "b",
              label: "节点 B",
              type: "类型2",
              description: "这是节点 B 的详细描述",
              properties: ["属性3", "属性4"],
            },
          },
          {
            data: {
              id: "ab",
              source: "a",
              target: "b",
              label: "关系 AB",
              type: "关系类型1",
              description: "这是边 AB 的详细描述",
            },
          },
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
        ],
      });

      // 创建工具提示
      function createTooltip(target) {
        const data = target.data();
        const position = target.renderedPosition();

        const tooltip = document.createElement("div");
        tooltip.className = "custom-tooltip";

        // 根据元素类型显示不同内容
        if (target.isNode()) {
          tooltip.innerHTML = `
            <div class="tooltip-header">${data.label}</div>
            <div class="tooltip-content">
              <div>ID: ${data.id}</div>
              <div>类型: ${data.type}</div>
              <div>描述: ${data.description}</div>
              <div>属性: ${data.properties.join(", ")}</div>
            </div>
          `;
        } else {
          tooltip.innerHTML = `
            <div class="tooltip-header">${data.label}</div>
            <div class="tooltip-content">
              <div>从: ${data.source}</div>
              <div>到: ${data.target}</div>
              <div>类型: ${data.type}</div>
              <div>描述: ${data.description}</div>
            </div>
          `;
        }

        document.body.appendChild(tooltip);

        // 定位工具提示
        tooltip.style.left = `${position.x}px`;
        tooltip.style.top = `${position.y - tooltip.offsetHeight}px`;

        return tooltip;
      }

      // 添加鼠标事件处理
      cy.on("mouseover", "node, edge", function (evt) {
        const target = evt.target;
        const tooltip = createTooltip(target);

        // 为节点添加操作按钮
        if (target.isNode()) {
          const actions = document.createElement("div");
          actions.className = "tooltip-actions";
          actions.innerHTML = `
            <button onclick="editElement('${target.id()}')">编辑</button>
            <button onclick="deleteElement('${target.id()}')">删除</button>
          `;
          tooltip.appendChild(actions);
        }
      });

      cy.on("mouseout", "node, edge", function () {
        const tooltip = document.querySelector(".custom-tooltip");
        if (tooltip) {
          tooltip.remove();
        }
      });

      // 编辑和删除功能
      window.editElement = function (id) {
        const element = cy.$(`#${id}`);
        const newLabel = prompt("输入新标签:", element.data("label"));
        if (newLabel) {
          element.data("label", newLabel);
        }
      };

      window.deleteElement = function (id) {
        if (confirm("确定要删除这个元素吗？")) {
          cy.$(`#${id}`).remove();
        }
      };
    </script>
  </body>
</html>
```

## 工具提示最佳实践

1. **内容展示**

   - 保持信息简洁明了
   - 分层展示重要信息
   - 使用适当的格式化

2. **交互设计**

   - 添加适当的延迟显示
   - 避免提示闪烁
   - 处理边界情况

3. **性能优化**

   - 复用工具提示元素
   - 使用事件委托
   - 避免频繁的 DOM 操作

4. **样式设计**

   - 确保足够的对比度
   - 使用合适的字体大小
   - 添加适当的动画效果

5. **可访问性**

   - 支持键盘导航
   - 提供替代文本
   - 考虑屏幕阅读器

6. **响应式设计**
   - 适应不同屏幕尺寸
   - 处理溢出情况
   - 支持触摸设备
