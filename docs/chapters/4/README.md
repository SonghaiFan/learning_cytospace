# 4. 样式与动画

> [查看示例代码](https://github.com/SonghaiFan/learning_cytospace/tree/main/cytoscape_learning_code/4-样式与动画) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/4-样式与动画/index.html)

本章节介绍 Cytoscape.js 中的样式系统和动画功能，包括节点样式、边样式的设置以及动画效果的实现。

## 样式系统

Cytoscape.js 使用类似 CSS 的样式系统，通过选择器和样式属性来定义图形外观。

### 基础样式设置

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        width: 60,
        height: 60,
      },
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#999",
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
        label: "data(label)",
        "text-rotation": "autorotate",
      },
    },
  ],
});
```

### 节点样式

#### 形状设置

```javascript
function changeNodeShape(shape) {
  cy.nodes().style({
    shape: shape, // 'ellipse', 'rectangle', 'triangle' 等
  });
}
```

支持的节点形状：

- `ellipse`: 椭圆形（默认）
- `rectangle`: 矩形
- `triangle`: 三角形
- `round-rectangle`: 圆角矩形
- `barrel`: 桶形
- `rhomboid`: 菱形
- `diamond`: 钻石形
- `pentagon`: 五边形
- `hexagon`: 六边形
- `star`: 星形

#### 颜色和大小

```javascript
// 设置节点颜色
node.style({
  "background-color": "#ff0000",
  "border-color": "#000000",
  "border-width": 2,
});

// 设置节点大小
node.style({
  width: 60,
  height: 60,
});
```

### 边样式

#### 线型设置

```javascript
function changeEdgeStyle(style) {
  cy.edges().style({
    "line-style": style, // 'solid', 'dotted', 'dashed'
  });
}
```

#### 箭头设置

```javascript
function toggleArrow() {
  const currentShape = cy.edges().style("target-arrow-shape");
  cy.edges().style({
    "target-arrow-shape": currentShape === "none" ? "triangle" : "none",
  });
}
```

支持的箭头形状：

- `triangle`: 三角形
- `tee`: T 形
- `square`: 方形
- `circle`: 圆形
- `diamond`: 菱形
- `none`: 无箭头

### 标签样式

```javascript
// 节点标签
node.style({
  label: "data(label)",
  "text-valign": "center",
  "text-halign": "center",
  "font-size": 12,
  "font-weight": "bold",
});

// 边标签
edge.style({
  label: "data(label)",
  "text-rotation": "autorotate",
  "font-size": 10,
});
```

## 动画系统

Cytoscape.js 提供了强大的动画系统，可以实现各种视觉效果。

### 基础动画

```javascript
// 简单动画
element.animate({
  style: {
    "background-color": "#ff0000",
    width: 100,
  },
  duration: 1000,
});

// 链式动画
element
  .animate({
    style: { opacity: 0 },
    duration: 500,
  })
  .animate({
    style: { opacity: 1 },
    duration: 500,
  });
```

### 节点动画示例

```javascript
function pulseAnimation() {
  cy.nodes().forEach((node) => {
    node
      .animation({
        style: {
          "background-color": "#ff0000",
          width: 80,
          height: 80,
        },
        duration: 500,
      })
      .play()
      .promise("completed")
      .then(() => {
        node
          .animation({
            style: {
              "background-color": "#666",
              width: 60,
              height: 60,
            },
            duration: 500,
          })
          .play();
      });
  });
}
```

### 边动画示例

```javascript
function flashEdges() {
  cy.edges().forEach((edge) => {
    edge
      .animation({
        style: {
          "line-color": "#ff0000",
          width: 5,
        },
        duration: 200,
      })
      .play()
      .promise("completed")
      .then(() => {
        edge
          .animation({
            style: {
              "line-color": "#999",
              width: 3,
            },
            duration: 200,
          })
          .play();
      });
  });
}
```

### 动画控制

```javascript
// 创建动画
const animation = element.animation({
  style: {
    /* ... */
  },
  duration: 1000,
});

// 播放控制
animation.play(); // 开始播放
animation.pause(); // 暂停
animation.stop(); // 停止
animation.rewind(); // 重置到开始
animation.reverse(); // 反向播放

// 动画事件
animation.promise("completed").then(() => {
  console.log("动画完成");
});
```

## 样式优化

### 性能建议

1. 批量更新样式

```javascript
cy.batch(() => {
  elements.forEach((ele) => {
    ele.style({
      /* ... */
    });
  });
});
```

2. 使用类选择器

```javascript
// 定义样式类
cy.style()
  .selector(".highlighted")
  .style({
    "background-color": "#ff0",
    "line-color": "#ff0",
  })
  .update();

// 应用类
element.addClass("highlighted");
```

3. 避免频繁样式更新

```javascript
// 不好的做法
elements.forEach((ele) => {
  ele.style({
    /* ... */
  }); // 每次都触发重绘
});

// 好的做法
const style = {
  /* ... */
};
elements.forEach((ele) => {
  ele.data("tmpStyle", style); // 先存储样式
});
cy.style()
  .selector("[?tmpStyle]")
  .style(function (ele) {
    return ele.data("tmpStyle");
  })
  .update();
```

### 动画优化

1. 使用 CSS 转换

```javascript
cy.style().selector("node").style({
  "transition-property": "background-color",
  "transition-duration": "0.2s",
});
```

2. 限制同时运行的动画数量

```javascript
const MAX_CONCURRENT = 5;
const animations = elements.slice(0, MAX_CONCURRENT).map((ele) =>
  ele.animation({
    /* ... */
  })
);
```

3. 使用 requestAnimationFrame

```javascript
function smoothAnimation(element, properties, duration) {
  const start = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    element.style(/* 计算当前样式 */);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}
```

## 最佳实践

1. 样式管理

   - 将样式定义集中管理
   - 使用有意义的类名
   - 避免内联样式

2. 动画使用

   - 适度使用动画
   - 注意性能影响
   - 提供动画禁用选项

3. 响应式设计
   - 根据容器大小调整样式
   - 使用相对单位
   - 实现缩放自适应
