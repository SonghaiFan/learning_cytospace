# 3. 布局与视图控制

> [查看示例代码](https://github.com/SonghaiFan/learning_cytospace/tree/main/cytoscape_learning_code/3-布局与视图控制) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/3-布局与视图控制/index.html)

本章节介绍 Cytoscape.js 中的布局算法和视图控制功能，包括各种布局算法的特点、使用场景以及视图操作方法。

## 布局类型

Cytoscape.js 提供了多种布局算法，可以分为三大类：

### 1. 离散布局 (Discrete)

特点：快速且确定性的几何布局，节点位置一次性确定

- `grid`: 网格布局
- `circle`: 圆形布局
- `concentric`: 同心圆布局
- `breadthfirst`: 层次化布局

```javascript
// 基础布局示例
const layout = cy.layout({
  name: "grid", // 或 'circle', 'concentric', 'breadthfirst'
  animate: true, // 启用动画
});
layout.run();
```

### 2. 力导向布局 (Force-directed)

特点：通过物理模拟迭代计算节点位置，适合展示复杂关系

- `fcose`: 快速复合弹簧嵌入布局
- `cose-bilkent`: 复合弹簧嵌入布局的改进版
- `cola`: 约束力导向布局
- `cose`: 基础复合弹簧嵌入布局

```javascript
// 力导向布局示例
const layout = cy.layout({
  name: "fcose",
  quality: "proof",
  animate: true,
  randomize: true,
  padding: 30,
});
layout.run();
```

### 3. 层次布局 (Hierarchical)

特点：专门用于展示具有层次结构的有向图

- `dagre`: 有向无环图布局
- `elk`: Eclipse 布局内核
- `cise`: 圆形-扇形布局

```javascript
// 层次布局示例
const layout = cy.layout({
  name: "dagre",
  rankDir: "TB", // 从上到下
  align: "UL", // 上左对齐
  animate: true,
});
layout.run();
```

## 布局扩展安装

### CDN 方式

```html
<!-- 基础依赖 -->
<script src="https://unpkg.com/layout-base/layout-base.js"></script>
<script src="https://unpkg.com/cose-base/cose-base.js"></script>

<!-- Cola 布局 -->
<script src="https://unpkg.com/webcola/WebCola/cola.min.js"></script>
<script src="https://unpkg.com/cytoscape-cola/cytoscape-cola.js"></script>

<!-- Dagre 布局 -->
<script src="https://unpkg.com/dagre/dist/dagre.min.js"></script>
<script src="https://unpkg.com/cytoscape-dagre/cytoscape-dagre.js"></script>

<!-- 其他布局 -->
<script src="https://unpkg.com/cytoscape-fcose/cytoscape-fcose.js"></script>
<script src="https://unpkg.com/cytoscape-cose-bilkent/cytoscape-cose-bilkent.js"></script>
```

### NPM 方式

```bash
npm install cytoscape-cola cytoscape-dagre cytoscape-elk cytoscape-fcose cytoscape-cose-bilkent cytoscape-cise
```

```javascript
// 注册布局扩展
import cytoscape from "cytoscape";
import cola from "cytoscape-cola";
import dagre from "cytoscape-dagre";
import elk from "cytoscape-elk";
import fcose from "cytoscape-fcose";
import coseBilkent from "cytoscape-cose-bilkent";
import cise from "cytoscape-cise";

cytoscape.use(cola);
cytoscape.use(dagre);
cytoscape.use(elk);
cytoscape.use(fcose);
cytoscape.use(coseBilkent);
cytoscape.use(cise);
```

## 子图布局

对选中的节点及其邻居应用特定布局，保持其他节点位置不变：

```javascript
function applyLayoutToSelected(layoutName) {
  const selected = cy.$("node:selected");
  const neighborhood = selected.neighborhood();
  const subgraph = selected.union(neighborhood);

  const layout = subgraph.layout({
    name: layoutName,
    animate: true,
    fit: false,
  });

  layout.run();
}
```

## 视图控制

### 缩放操作

```javascript
// 放大
function zoomIn() {
  cy.zoom({
    level: cy.zoom() * 1.2,
    renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
  });
}

// 缩小
function zoomOut() {
  cy.zoom({
    level: cy.zoom() / 1.2,
    renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
  });
}
```

### 视图适配

```javascript
// 适配所有元素
function fitView() {
  cy.fit();
}

// 适配选中元素
function fitSelected() {
  cy.fit(cy.$(":selected"));
}

// 居中视图
function centerView() {
  cy.center();
}
```

### 平移操作

```javascript
// 平移到指定位置
cy.pan({ x: 100, y: 100 });

// 相对平移
cy.panBy({ x: 50, y: 0 });

// 获取当前平移位置
const pan = cy.pan();
```

## 布局事件处理

```javascript
const layout = cy.layout({ name: "fcose" });

// 布局开始
layout.on("layoutstart", function () {
  console.log("布局开始");
});

// 布局结束
layout.on("layoutstop", function () {
  console.log("布局结束");
});

// 布局就绪
layout.on("layoutready", function () {
  console.log("布局就绪");
});
```

## 最佳实践

1. 根据数据特点选择合适的布局

   - 层次数据使用 `dagre` 或 `elk`
   - 复杂关系网络使用 `fcose` 或 `cola`
   - 简单几何布局使用 `grid` 或 `circle`

2. 优化布局性能

   - 大规模图使用 `fcose` 的 'draft' 质量模式
   - 考虑禁用动画提高性能
   - 使用 `fit: false` 避免不必要的视图调整

3. 增强用户体验

   - 为布局变化添加动画效果
   - 提供布局参数的实时调整
   - 实现布局状态的保存和恢复

4. 视图控制建议
   - 提供合适的缩放范围限制
   - 实现平滑的动画过渡
   - 保持用户操作的响应性
