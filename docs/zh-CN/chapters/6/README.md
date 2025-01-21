# 6. 图算法与分析

> [示例在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/zh-CN/6-图算法与分析/index.html)

本章节将介绍如何使用 Cytoscape.js 实现常见的图算法和网络分析功能。

## 基础配置

初始化一个包含多个社区结构的图实例：

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [
    // 节点
    // 第一个社区
    { data: { id: "a1", label: "A1", weight: 65 } },
    { data: { id: "a2", label: "A2", weight: 75 } },
    { data: { id: "a3", label: "A3", weight: 85 } },
    // 第二个社区
    { data: { id: "b1", label: "B1", weight: 70 } },
    { data: { id: "b2", label: "B2", weight: 80 } },
    { data: { id: "b3", label: "B3", weight: 90 } },
    // 第三个社区
    { data: { id: "c1", label: "C1", weight: 60 } },
    { data: { id: "c2", label: "C2", weight: 70 } },
    { data: { id: "c3", label: "C3", weight: 80 } },

    // 边
    // 社区内部连接
    { data: { id: "a1a2", source: "a1", target: "a2", weight: 1 } },
    { data: { id: "a2a3", source: "a2", target: "a3", weight: 1 } },
    { data: { id: "a3a1", source: "a3", target: "a1", weight: 1 } },
    // ... 其他社区内部连接
    // 桥接边
    { data: { id: "a2b1", source: "a2", target: "b1", weight: 2 } },
    { data: { id: "b2c1", source: "b2", target: "c1", weight: 2 } },
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
      },
    },
    {
      selector: ".highlighted",
      style: {
        "background-color": "#e74c3c",
        "line-color": "#e74c3c",
        "target-arrow-color": "#e74c3c",
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
  layout: {
    name: "cose",
    padding: 50,
    nodeRepulsion: 4500,
    idealEdgeLength: 80,
    animate: true,
  },
});
```

## 中心性度量

### PageRank 分析

```javascript
function runPageRank() {
  // 基础 PageRank
  const ranks = cy.elements().pageRank({
    dampingFactor: 0.85, // 阻尼系数
    precision: 0.001, // 收敛精度
    iterations: 200, // 最大迭代次数
    weight: (edge) => edge.data("weight"), // 考虑边权重
  });

  // 可视化结果
  cy.nodes().forEach((node) => {
    const rank = ranks.rank(node);
    node.style({
      width: 20 + rank * 200,
      height: 20 + rank * 200,
      "background-color": `rgb(${Math.round(rank * 255)}, 0, 0)`,
    });
  });

  // 获取排序后的节点
  const sortedNodes = cy.nodes().sort((a, b) => ranks.rank(b) - ranks.rank(a));
  return sortedNodes;
}
```

### 度中心性分析

```javascript
function runDegreeCentrality() {
  // 计算不同类型的度
  cy.nodes().forEach((node) => {
    const totalDegree = node.degree();
    const inDegree = node.indegree();
    const outDegree = node.outdegree();

    // 存储度信息
    node.data("centrality", {
      total: totalDegree,
      in: inDegree,
      out: outDegree,
      normalized: totalDegree / (cy.nodes().length - 1),
    });

    // 可视化
    if (totalDegree > 3) {
      node.addClass("highlighted");
    }

    // 设置节点大小
    node.style({
      width: 20 + totalDegree * 10,
      height: 20 + totalDegree * 10,
    });
  });

  // 返回度最大的节点
  return cy.nodes().max((node) => node.degree());
}
```

### 中介中心性分析

```javascript
function findBetweenness() {
  // 计算中介中心性
  const bc = cy.elements().betweennessCentrality({
    weight: (edge) => edge.data("weight"), // 考虑边权重
    directed: true, // 考虑边方向
    normalized: true, // 归一化结果
  });

  // 可视化结果
  cy.nodes().forEach((node) => {
    const centrality = bc.betweenness(node);
    node.data("betweenness", centrality);

    if (centrality > 0.2) {
      node.addClass("highlighted");

      // 设置节点大小
      node.style({
        width: 20 + centrality * 100,
        height: 20 + centrality * 100,
      });
    }
  });

  // 返回中介中心性最大的节点
  return cy.nodes().max((node) => bc.betweenness(node));
}
```

## 网络结构分析

### 连通性分析

```javascript
function analyzeConnectivity() {
  // 获取连通分量
  const components = cy.elements().components();
  console.log(`连通分量数量: ${components.length}`);

  // 分析每个连通分量
  components.forEach((component, i) => {
    // 为每个分量添加类
    component.addClass(`component-${i}`);

    // 计算分量大小
    console.log(`分量 ${i} 大小:`, {
      nodes: component.nodes().length,
      edges: component.edges().length,
    });
  });

  return components;
}
```

### 桥接边检测

```javascript
function detectBridges() {
  const bridges = [];
  const components = cy.elements().components();
  const initialComponents = components.length;

  cy.edges().forEach((edge) => {
    // 临时移除边
    const edgeData = edge.remove();

    // 检查连通性变化
    const newComponents = cy.elements().components();
    if (newComponents.length > initialComponents) {
      bridges.push(edge);

      // 计算影响
      const impact = {
        edge: edge.id(),
        originalComponents: initialComponents,
        newComponents: newComponents.length,
        affectedNodes: newComponents.reduce(
          (acc, comp) => acc + comp.nodes().length,
          0
        ),
      };
      edge.data("impact", impact);
    }

    // 恢复边
    cy.add(edgeData);
  });

  // 可视化桥接边
  bridges.forEach((edge) => {
    edge.addClass("bridge");
    edge.style({
      "line-color": "#e74c3c",
      width: 5,
      "line-style": "dashed",
    });
    edge.connectedNodes().addClass("highlighted");
  });

  return bridges;
}
```

### 关节点检测

```javascript
function detectArticulationPoints() {
  const articulationPoints = [];
  const components = cy.elements().components();
  const initialComponents = components.length;

  cy.nodes().forEach((node) => {
    // 临时移除节点
    const nodeData = node.remove();
    const connectedEdges = node.connectedEdges().remove();

    // 检查连通性变化
    const newComponents = cy.elements().components();
    if (newComponents.length > initialComponents) {
      articulationPoints.push(node);

      // 计算影响
      const impact = {
        node: node.id(),
        originalComponents: initialComponents,
        newComponents: newComponents.length,
        affectedNodes: newComponents.reduce(
          (acc, comp) => acc + comp.nodes().length,
          0
        ),
      };
      node.data("impact", impact);
    }

    // 恢复节点和边
    cy.add(nodeData);
    cy.add(connectedEdges);
  });

  // 可视化关节点
  articulationPoints.forEach((node) => {
    node.addClass("articulation-point");
    node.style({
      "background-color": "#e74c3c",
      "border-width": 3,
      "border-color": "#c0392b",
    });
    node.connectedEdges().addClass("highlighted");
  });

  return articulationPoints;
}
```

### 社区发现

```javascript
function findCommunities() {
  // 使用 Markov 聚类算法
  const clusters = cy.elements().markovClustering({
    attributes: [
      function (edge) {
        return edge.data("weight");
      },
    ],
    inflation: 2.0, // 膨胀参数
    maxIterations: 20, // 最大迭代次数
    threshold: 0.001, // 收敛阈值
  });

  // 可视化社区
  clusters.forEach((cluster, i) => {
    // 为每个社区添加类
    cluster.addClass(`cluster-${i}`);

    // 设置社区颜色
    const color = `hsl(${(360 * i) / clusters.length}, 75%, 50%)`;
    cluster.style({
      "background-color": color,
      "line-color": color,
    });

    // 计算社区指标
    const metrics = {
      size: cluster.nodes().length,
      density: calculateDensity(cluster),
      cohesion: calculateCohesion(cluster),
    };
    cluster.data("metrics", metrics);
  });

  return clusters;
}

// 计算社区密度
function calculateDensity(cluster) {
  const n = cluster.nodes().length;
  const e = cluster.edges().length;
  return (2 * e) / (n * (n - 1));
}

// 计算社区内聚度
function calculateCohesion(cluster) {
  const internalEdges = cluster.edges().length;
  const externalEdges = cluster.connectedEdges().length - internalEdges;
  return internalEdges / (internalEdges + externalEdges);
}
```

## 路径分析

### 最短路径

```javascript
function findShortestPath(source, target, options = {}) {
  // 配置选项
  const defaultOptions = {
    directed: false, // 是否考虑边方向
    weight: (edge) => edge.data("weight"), // 边权重函数
    root: source, // 起始节点
  };

  const finalOptions = { ...defaultOptions, ...options };

  // 使用 Dijkstra 算法
  const dijkstra = cy.elements().dijkstra(finalOptions);

  // 获取路径
  const path = dijkstra.pathTo(target);

  // 计算路径指标
  const metrics = {
    distance: dijkstra.distanceTo(target),
    hops: path.edges().length,
    averageWeight:
      path.edges().reduce((acc, edge) => acc + edge.data("weight"), 0) /
      path.edges().length,
  };

  // 可视化路径
  cy.elements().addClass("faded");
  path.removeClass("faded").addClass("highlighted");

  return {
    path,
    metrics,
  };
}
```

### 所有路径分析

```javascript
function analyzeAllPaths(source, target) {
  // 获取所有简单路径
  const paths = cy.elements().aStar({
    root: source,
    goal: target,
    weight: (edge) => edge.data("weight"),
    directed: true,
  }).allPaths;

  // 分析每条路径
  const pathAnalysis = paths.map((path) => ({
    path: path,
    length: path.edges().length,
    totalWeight: path
      .edges()
      .reduce((acc, edge) => acc + edge.data("weight"), 0),
    nodes: path.nodes().map((n) => n.id()),
  }));

  // 排序路径
  pathAnalysis.sort((a, b) => a.totalWeight - b.totalWeight);

  return pathAnalysis;
}
```

## 高级分析

### 网络鲁棒性分析

```javascript
function analyzeRobustness() {
  const metrics = {
    initial: {
      nodes: cy.nodes().length,
      edges: cy.edges().length,
      components: cy.elements().components().length,
    },
  };

  // 模拟节点删除
  const nodeRemovalImpact = [];
  const sortedNodes = cy.nodes().sort((a, b) => b.degree() - a.degree());

  sortedNodes.forEach((node, i) => {
    const copy = cy.json();
    const removed = cy.getElementById(node.id()).remove();

    nodeRemovalImpact.push({
      node: node.id(),
      components: cy.elements().components().length,
      largestComponent: cy.elements().components()[0].nodes().length,
      connectivity: calculateConnectivity(),
    });

    cy.json(copy);
  });

  return {
    metrics,
    nodeRemovalImpact,
  };
}

// 计算网络连通性
function calculateConnectivity() {
  const n = cy.nodes().length;
  const components = cy.elements().components();

  return components.reduce((acc, comp) => {
    const size = comp.nodes().length;
    return acc + (size * (size - 1)) / (n * (n - 1));
  }, 0);
}
```

### 层次结构分析

```javascript
function analyzeHierarchy() {
  // 计算每个节点的层级
  const levels = {};
  const roots = cy.nodes().roots(); // 入度为0的节点

  function assignLevel(node, level = 0) {
    levels[node.id()] = level;
    node
      .outgoers()
      .nodes()
      .forEach((child) => {
        assignLevel(child, level + 1);
      });
  }

  roots.forEach((root) => assignLevel(root));

  // 分析层次结构
  const hierarchy = {
    depth: Math.max(...Object.values(levels)),
    breadth: Math.max(
      ...Object.values(levels).map(
        (level) => Object.values(levels).filter((l) => l === level).length
      )
    ),
    levels: levels,
  };

  // 可视化层次
  cy.nodes().forEach((node) => {
    const level = levels[node.id()];
    node.style({
      "background-color": `hsl(${(360 * level) / hierarchy.depth}, 75%, 50%)`,
    });
  });

  return hierarchy;
}
```

## 关键概念说明

1. **中心性度量**

   - **PageRank**

     - 基于链接分析的节点重要性评估
     - 考虑入边权重和来源节点重要性
     - 应用：识别关键节点，排序重要性

   - **度中心性**

     - 节点的直接连接数量
     - 区分入度、出度和总度
     - 应用：识别局部中心节点

   - **中介中心性**
     - 节点作为最短路径中转站的频率
     - 考虑全局网络结构
     - 应用：识别控制信息流的节点

2. **网络结构**

   - **连通性**

     - 桥接边：删除后增加连通分量的边
     - 关节点：删除后增加连通分量的节点
     - 连通分量：最大相互可达的子图

   - **社区结构**

     - 内部连接密集的节点群组
     - 社区间连接相对稀疏
     - 多层次社区结构

   - **层次结构**
     - 基于有向关系的层级划分
     - 树形或 DAG 结构
     - 上下级关系分析

3. **算法复杂度**

   - **中心性算法**

     - PageRank: O(E·k), k 为迭代次数
     - 度中心性: O(1) 每个节点
     - 中介中心性: O(V·E)

   - **路径算法**

     - Dijkstra 最短路径: O((V+E)·log V)
     - 所有简单路径: O(V!)最坏情况
     - A\*算法: O(E·log V)平均情况

   - **结构分析**
     - 连通分量: O(V+E)
     - 社区检测: O(V·E)典型情况
     - 层次分析: O(V+E)

4. **性能优化**

- **算法选择**

  - 根据图规模选择合适算法
  - 权衡精确度和计算时间
  - 考虑增量计算可能性

  - **数据结构**

    - 使用高效的图数据结构
    - 缓存中间计算结果
    - 合理使用索引

  - **计算策略**
    - 批量处理而非逐个计算
    - 利用并行计算
    - 采用近似算法处理大规模图

5. **可视化反馈**

   - **视觉编码**

     - 使用大小表示重要性
     - 使用颜色区分类别
     - 使用透明度表示相关性

- **交互设计**

  - 提供实时分析反馈
  - 支持多层次探索
  - 允许参数调整

  - **布局优化**
    - 突出显示重要结构
    - 减少视觉混乱
    - 保持空间效率
