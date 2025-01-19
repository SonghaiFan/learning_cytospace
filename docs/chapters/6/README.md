# 6. 图算法与分析

> [示例代码](https://github.com/SonghaiFan/learning_cytospace/tree/main/cytoscape_learning_code/6-图算法与分析) | [在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/6-图算法与分析/index.html)

本章节将介绍如何在 Cytoscape.js 中使用和实现各种图算法，包括路径查找、连通性分析、中心性计算等。每个功能都将提供传统方式和 React 方式两种实现。

## 核心概念

### 图算法类型

- **路径算法**: 最短路径、全源最短路径等
- **中心性算法**: PageRank、度中心性、介数中心性等
- **社区发现**: 聚类分析、模块度优化等
- **连通性分析**: 桥接边、关节点检测等

### 算法复杂度

| 算法类型   | 时间复杂度     | 空间复杂度 |
| ---------- | -------------- | ---------- |
| 最短路径   | O((V+E)·log V) | O(V)       |
| PageRank   | O(E·k)         | O(V)       |
| 中介中心性 | O(V·E)         | O(V)       |
| 度中心性   | O(V)           | O(1)       |
| 桥接边检测 | O(V+E)         | O(V)       |
| 社区发现   | O(V·k·i)       | O(V)       |

## 传统方式实现

### 1. 路径分析

```javascript
// 最短路径分析
function findShortestPath(source, target) {
  const dijkstra = cy.elements().dijkstra({
    root: source,
    directed: false,
    weight: (edge) => edge.data("weight"),
  });

  const path = dijkstra.pathTo(target);
  const distance = dijkstra.distanceTo(target);

  return {
    path,
    distance,
    nodes: path
      .nodes()
      .map((n) => n.data("label"))
      .join(" → "),
  };
}

// 使用示例
const result = findShortestPath(cy.$("#a1"), cy.$("#b2"));
console.log(`最短路径长度: ${result.distance}`);
console.log(`经过节点: ${result.nodes}`);
```

### 2. 中心性分析

```javascript
// PageRank 分析
function analyzePageRank() {
  const ranks = cy.elements().pageRank();
  const results = [];

  cy.nodes().forEach((node) => {
    const rank = ranks.rank(node);
    results.push({
      node: node.data("label"),
      rank: rank.toFixed(3),
    });

    // 可视化：节点大小反映重要性
    node.style({
      width: 20 + rank * 200,
      height: 20 + rank * 200,
    });
  });

  return results;
}

// 中介中心性分析
function analyzeBetweenness() {
  const bc = cy.elements().betweennessCentrality();
  const results = [];

  cy.nodes().forEach((node) => {
    const centrality = bc.betweenness(node);
    results.push({
      node: node.data("label"),
      centrality: centrality.toFixed(3),
    });
  });

  return results;
}
```

### 3. 连通性分析

```javascript
// 桥接边检测
function detectBridges() {
  const bridges = [];
  cy.edges().forEach((edge) => {
    const edgeData = edge.remove(); // 暂时移除边

    if (cy.elements().components().length > 1) {
      bridges.push(edge);
    }

    cy.add(edgeData); // 恢复边
  });

  return bridges;
}

// 关节点检测
function detectArticulationPoints() {
  const points = [];
  cy.nodes().forEach((node) => {
    const nodeData = node.remove(); // 暂时移除节点

    if (cy.elements().components().length > 1) {
      points.push(node);
    }

    cy.add(nodeData); // 恢复节点
  });

  return points;
}
```

### 4. 社区发现

```javascript
// k-means 聚类
function kMeansClustering(k = 3) {
  const positions = cy.nodes().map((node) => ({
    id: node.id(),
    x: node.position("x"),
    y: node.position("y"),
  }));

  // 初始化中心点
  let centers = positions.slice(0, k).map((p) => ({ x: p.x, y: p.y }));
  let clusters = {};

  // 迭代优化
  for (let i = 0; i < 10; i++) {
    clusters = assignToClusters(positions, centers);
    centers = updateCenters(clusters, positions);
  }

  return clusters;
}

// 可视化聚类结果
function visualizeClusters(clusters) {
  Object.entries(clusters).forEach(([clusterId, nodes]) => {
    nodes.forEach((nodeId) => {
      cy.$id(nodeId).addClass(`cluster-${clusterId}`);
    });
  });
}
```

## React 方式实现

### 1. 图算法组件

```typescript
interface GraphAlgorithmProps {
  cy: cytoscape.Core;
  onResult?: (result: any) => void;
}

// 最短路径组件
export function ShortestPath({ cy, onResult }: GraphAlgorithmProps) {
  const findPath = useCallback(
    (source: string, target: string) => {
      const path = cy.elements().dijkstra({
        root: `#${source}`,
        directed: false,
      });

      const result = {
        path: path.pathTo(`#${target}`),
        distance: path.distanceTo(`#${target}`),
      };

      onResult?.(result);
    },
    [cy, onResult]
  );

  return (
    <div className="algorithm-controls">
      <select onChange={(e) => setSource(e.target.value)}>
        {cy.nodes().map((node) => (
          <option key={node.id()} value={node.id()}>
            {node.data("label")}
          </option>
        ))}
      </select>
      {/* 其他控制UI */}
    </div>
  );
}

// 中心性分析组件
export function CentralityAnalysis({ cy, onResult }: GraphAlgorithmProps) {
  const analyzeCentrality = useCallback(
    (type: "pagerank" | "betweenness") => {
      const result =
        type === "pagerank"
          ? cy.elements().pageRank()
          : cy.elements().betweennessCentrality();

      onResult?.(result);
    },
    [cy, onResult]
  );

  return (
    <div className="algorithm-controls">
      <button onClick={() => analyzeCentrality("pagerank")}>
        PageRank 分析
      </button>
      <button onClick={() => analyzeCentrality("betweenness")}>
        中介中心性分析
      </button>
    </div>
  );
}
```

### 2. 使用示例

```typescript
export default function GraphAnalysis() {
  const [results, setResults] = useState<any>(null);

  return (
    <div className="graph-analysis">
      <CytoscapeGraph
        elements={graphData}
        style={graphStyle}
        onReady={(cy) => {
          // 算法组件
          return (
            <>
              <ShortestPath cy={cy} onResult={setResults} />
              <CentralityAnalysis cy={cy} onResult={setResults} />
              {/* 结果展示 */}
              {results && (
                <div className="results">{/* 格式化并展示结果 */}</div>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
```

## 最佳实践

### 1. 性能优化

- **算法选择**

  - 根据图的规模选择合适的算法
  - 考虑时间和空间复杂度的平衡
  - 对大规模图采用近似算法

- **计算优化**
  - 使用缓存避免重复计算
  - 采用增量计算方式
  - 利用 Web Worker 处理耗时操作

### 2. 可视化反馈

- **交互设计**

  - 提供算法执行进度反馈
  - 使用动画展示算法步骤
  - 支持暂停和继续操作

- **结果展示**
  - 高亮显示关键节点和路径
  - 使用合适的视觉编码
  - 提供详细的结果解释

### 3. 代码组织

- **模块化设计**

  - 算法逻辑与视图逻辑分离
  - 使用 TypeScript 类型保证代码安全
  - 实现通用的算法接口

- **错误处理**
  - 合理处理边界情况
  - 提供清晰的错误信息
  - 支持优雅降级

### 4. 扩展性考虑

- **算法扩展**

  - 支持自定义算法插件
  - 提供算法组合机制
  - 实现算法参数配置

- **数据处理**
  - 支持多种数据格式
  - 提供数据预处理接口
  - 实现结果导出功能
