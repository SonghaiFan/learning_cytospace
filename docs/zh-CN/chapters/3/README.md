# 3. 布局与视图控制

> [查看示例代码](../examples/3-布局与视图控制/index.html) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/3-布局与视图控制/index.html)

本章节将介绍如何控制图的布局和视图，包括不同类型的布局算法、子图布局以及视图的缩放和平移操作。

## 布局类型

Cytoscape.js 提供了多种布局算法，可以分为三大类：

### 1. 离散布局 (Discrete)

快速且确定性的几何布局，节点位置一次性确定：

```javascript
const discreteLayouts = {
  // 网格布局
  grid: {
    name: "grid",
    animate: true,
    animationDuration: 500,
    padding: 30,
    rows: undefined, // 自动计算行数
    cols: undefined, // 自动计算列数
    position: (node) => {}, // 自定义节点位置函数
    spacingFactor: 1.5, // 节点间距因子
  },
  // 圆形布局
  circle: {
    name: "circle",
    animate: true,
    animationDuration: 500,
    padding: 30,
    radius: undefined, // 自动计算半径
    startAngle: (3 / 2) * Math.PI, // 起始角度
    sweep: undefined, // 布局扫过的角度
    clockwise: true, // 顺时针排列
  },
  // 同心圆布局
  concentric: {
    name: "concentric",
    animate: true,
    animationDuration: 500,
    padding: 30,
    minNodeSpacing: 50,
    concentric: (node) => node.degree(), // 根据度数决定层级
    levelWidth: () => 1,
    startAngle: (3 / 2) * Math.PI,
    sweep: undefined,
    clockwise: true,
    equidistant: false, // 是否等距分布
  },
  // 广度优先布局
  breadthfirst: {
    name: "breadthfirst",
    animate: true,
    animationDuration: 500,
    padding: 30,
    directed: true, // 是否考虑边的方向
    spacingFactor: 1.5,
    roots: undefined, // 指定根节点
    maximal: false, // 是否使用最大生成树
  },
};
```

### 2. 力导向布局 (Force-directed)

通过物理模拟迭代计算节点位置，适合展示复杂关系：

```javascript
const forceLayouts = {
  // F-CoSE 布局（推荐用于大型图）
  fcose: {
    name: "fcose",
    quality: "proof",
    animate: true,
    animationDuration: 500,
    randomize: true,
    padding: 30,
    nodeSeparation: 75,
    idealEdgeLength: (edge) => 50, // 可以基于边属性设置理想长度
    nodeRepulsion: (node) => 4500, // 可以基于节点属性设置斥力
  },
  // Cola 布局
  cola: {
    name: "cola",
    animate: true,
    animationDuration: 500,
    padding: 30,
    maxSimulationTime: 3000,
    nodeSpacing: 30,
    edgeLength: 100,
    alignment: undefined, // 对齐约束
    flowDirection: undefined, // 流向约束
    groupCompression: 0.8, // 组压缩系数
  },
  // CoSE 布局
  cose: {
    name: "cose",
    animate: "end",
    animationDuration: 500,
    padding: 30,
    nodeRepulsion: 400000,
    idealEdgeLength: 100,
    numIter: 1000, // 迭代次数
    initialTemp: 1000, // 初始温度
    coolingFactor: 0.99, // 冷却因子
    minTemp: 1.0, // 最小温度
  },
};
```

### 3. 层次布局 (Hierarchical)

专门用于展示具有层次结构的有向图：

```javascript
const hierarchicalLayouts = {
  // Dagre 布局
  dagre: {
    name: "dagre",
    animate: true,
    animationDuration: 500,
    padding: 30,
    rankDir: "TB", // 'TB', 'LR', 'BT', 'RL'
    align: "UL", // 'UL', 'UR', 'DL', 'DR'
    nodeSep: 50, // 同层节点间距
    rankSep: 50, // 层间距
    ranker: "network-simplex", // 层级算法
  },
  // ELK 布局
  elk: {
    name: "elk",
    animate: true,
    animationDuration: 500,
    padding: 30,
    algorithm: "layered", // 'stress', 'mrtree', 'radial'
    elk: {
      "elk.direction": "DOWN", // 'RIGHT', 'LEFT', 'UP'
      "elk.spacing.nodeNode": 50,
      "elk.layered.spacing.baseValue": 50,
    },
  },
};
```

## 布局控制

### 布局生命周期

```javascript
function runLayoutWithEvents(name) {
  const layout = cy.layout(layoutConfigs[name]);

  // 布局开始事件
  layout.on("layoutstart", function () {
    console.log("Layout started");
  });

  // 布局准备就绪事件
  layout.on("layoutready", function () {
    console.log("Layout ready");
  });

  // 布局结束事件
  layout.on("layoutstop", function () {
    console.log("Layout stopped");
  });

  // 运行布局
  layout.run();
}
```

### 子图布局

对选中的节点及其邻居应用特定布局：

```javascript
function applyLayoutToSelected(name) {
  const selectedNodes = cy.nodes(":selected");
  if (selectedNodes.length === 0) return;

  // 获取选中节点的中心点
  const bb = selectedNodes.boundingBox();
  const center = {
    x: (bb.x1 + bb.x2) / 2,
    y: (bb.y1 + bb.y2) / 2,
  };

  // 获取选中节点及其邻居
  const neighborhood = selectedNodes.neighborhood().add(selectedNodes);

  // 创建布局配置
  const layoutConfig = {
    ...layoutConfigs[name],
    fit: false, // 不自动适配视图
    animate: true,
    animationDuration: 500,
    // 指定布局边界
    boundingBox: {
      x1: center.x - 100,
      y1: center.y - 100,
      x2: center.x + 100,
      y2: center.y + 100,
    },
    // 可以添加布局约束
    constraints: [
      {
        type: "alignment",
        axis: "y",
        offsets: (nodes) => ({
          node: nodes[0],
          offset: 0,
        }),
      },
    ],
  };

  // 记录其他节点位置
  const otherNodes = cy.nodes().not(neighborhood);
  const positions = {};
  otherNodes.forEach((node) => {
    positions[node.id()] = { ...node.position() };
  });

  // 运行布局
  const layout = neighborhood.layout(layoutConfig);

  // 布局完成后恢复其他节点位置
  layout.on("layoutstop", () => {
    otherNodes.forEach((node) => {
      node.position(positions[node.id()]);
    });
  });

  layout.run();
}
```

## 视图控制

### 基础视图操作

```javascript
// 放大
function zoomIn() {
  cy.animate({
    zoom: {
      level: cy.zoom() * 1.2,
      position: {
        // 以鼠标位置为中心
        x: cy.mousePosition().x,
        y: cy.mousePosition().y,
      },
    },
    duration: 500,
    easing: "ease-in-out-cubic",
  });
}

// 缩小
function zoomOut() {
  cy.animate({
    zoom: {
      level: cy.zoom() * 0.8,
      position: cy.center(), // 以视图中心为中心
    },
    duration: 500,
  });
}

// 适配视图
function fitView() {
  cy.animate({
    fit: {
      eles: cy.elements(),
      padding: 50,
    },
    duration: 500,
    easing: "ease-out-cubic",
  });
}

// 居中视图
function centerView() {
  cy.animate({
    center: {
      eles: cy.elements(),
    },
    duration: 500,
  });
}
```

### 高级视图控制

```javascript
// 视图平移
function pan() {
  cy.animate({
    pan: { x: 100, y: 100 },
    duration: 500,
  });
}

// 视图旋转
function rotate() {
  cy.animate({
    rotation: 180,
    duration: 1000,
  });
}

// 复杂动画序列
function complexAnimation() {
  cy.animation({
    fit: {
      eles: cy.nodes(),
      padding: 20,
    },
    duration: 500,
  })
    .play() // 开始第一个动画
    .promise("completed") // 等待完成
    .then(() => {
      return cy
        .animation({
          // 链式动画
          zoom: 2,
          center: { eles: cy.$("#target") },
          duration: 500,
        })
        .play()
        .promise("completed");
    });
}

// 自定义视图转换
function customViewTransform() {
  cy.viewport({
    zoom: 2,
    pan: { x: 100, y: 100 },
    rotation: 45,
  });
}
```

## 关键概念说明

1. **布局类型**

   - 离散布局：适合简单图形，布局快速且稳定
   - 力导向布局：适合复杂关系网络，能自动找到较好的布局
   - 层次布局：适合展示具有明确层级关系的图

2. **布局参数**

   - `animate`: 是否使用动画
   - `animationDuration`: 动画持续时间
   - `padding`: 布局边距
   - `fit`: 是否自动适配视图
   - `boundingBox`: 布局边界框
   - `randomize`: 是否随机初始位置
   - `infinite`: 是否持续运行

3. **视图操作**

   - `zoom`: 缩放级别控制
   - `pan`: 平移控制
   - `fit`: 适配元素
   - `center`: 居中显示
   - `rotation`: 旋转控制
   - `viewport`: 视口变换

4. **布局事件**

   - `layoutstart`: 布局开始时触发
   - `layoutready`: 布局准备就绪时触发
   - `layoutstop`: 布局完成时触发

5. **性能优化**

   - 使用 `headless: true` 进行后台计算
   - 合理设置迭代次数和收敛条件
   - 对大型图使用增量布局
   - 避免频繁切换布局

6. **布局约束**
   - 对齐约束：控制节点对齐
   - 相对位置约束：保持节点相对位置
   - 边长约束：控制边的理想长度
   - 区域约束：限制节点在特定区域

## 布局扩展安装

### CDN 方式

```html
<!-- 基础依赖 -->
<script src="https://unpkg.com/layout-base/layout-base.js"></script>
<script src="https://unpkg.com/cose-base/cose-base.js"></script>

<!-- 布局扩展 -->
<script src="https://unpkg.com/cytoscape-fcose/cytoscape-fcose.js"></script>
<script src="https://unpkg.com/cytoscape-cola/cytoscape-cola.js"></script>
<script src="https://unpkg.com/cytoscape-dagre/cytoscape-dagre.js"></script>
<script src="https://unpkg.com/cytoscape-elk/cytoscape-elk.js"></script>
```

### NPM 方式

```bash
npm install cytoscape-fcose cytoscape-cola cytoscape-dagre cytoscape-elk
```

```javascript
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import cola from "cytoscape-cola";
import dagre from "cytoscape-dagre";
import elk from "cytoscape-elk";

// 注册布局
cytoscape.use(fcose);
cytoscape.use(cola);
cytoscape.use(dagre);
cytoscape.use(elk);
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
