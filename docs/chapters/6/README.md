# 7.5 图算法

本章节将介绍如何在 Cytoscape.js 中使用和实现各种图算法，包括路径查找、连通性分析、中心性计算等。

## 图算法概述

Cytoscape.js 提供了丰富的图论算法支持，可用于：

- 最短路径查找
- 连通性分析
- 中心性计算
- 社区发现
- 图的遍历

## 基础算法

### 图的遍历

```javascript
// 广度优先搜索
let bfs = cy.elements().bfs({
  roots: "#a",
  visit: function (v, e, u, i, depth) {
    console.log("访问节点:", v.id());
  },
  directed: false,
});

// 深度优先搜索
let dfs = cy.elements().dfs({
  roots: "#a",
  visit: function (v, e, u, i, depth) {
    console.log("访问节点:", v.id());
  },
  directed: false,
});
```

### 最短路径

```javascript
// Dijkstra 算法
let dijkstra = cy.elements().dijkstra({
  root: "#a",
  directed: true,
  weight: function (edge) {
    return edge.data("weight");
  },
});

// 获取到特定节点的路径
let pathToB = dijkstra.pathTo(cy.$("#b"));
let distToB = dijkstra.distanceTo(cy.$("#b"));
```

### 连通性分析

```javascript
// 获取连通分量
let components = cy.elements().components();

// 检查两个节点是否连通
let connected = cy.elements().aStar({
  root: "#a",
  goal: "#b",
}).found;
```

## 高级算法

### 中心性计算

```javascript
// 度中心性
let dc = cy.elements().degreeCentrality({
  directed: true,
});

// 接近中心性
let cc = cy.elements().closenessCentrality({
  directed: true,
  weight: function (edge) {
    return edge.data("weight");
  },
});

// 介数中心性
let bc = cy.elements().betweennessCentrality({
  directed: true,
  weight: function (edge) {
    return edge.data("weight");
  },
});
```

### 社区发现

```javascript
// k-核分解
let kcore = cy.elements().kcore({
  k: 2,
  directed: false,
});

// 模块度优化
let clusters = cy.elements().modularity({
  resolution: 1.0,
});
```

## 完整示例

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js - 图算法</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
    <style>
      #cy {
        width: 600px;
        height: 400px;
        border: 1px solid #ccc;
        margin: 20px auto;
      }
      .controls {
        text-align: center;
        margin: 10px;
      }
      button {
        margin: 5px;
        padding: 5px 10px;
      }
      #info {
        margin: 10px;
        padding: 10px;
        border: 1px solid #ccc;
      }
    </style>
  </head>
  <body>
    <div class="controls">
      <button onclick="findShortestPath()">查找最短路径</button>
      <button onclick="analyzeCentrality()">中心性分析</button>
      <button onclick="findCommunities()">社区发现</button>
      <button onclick="resetGraph()">重置图形</button>
    </div>
    <div id="cy"></div>
    <div id="info"></div>
    <script>
      const cy = cytoscape({
        container: document.getElementById("cy"),
        elements: [
          // 节点
          { data: { id: "a", label: "A" } },
          { data: { id: "b", label: "B" } },
          { data: { id: "c", label: "C" } },
          { data: { id: "d", label: "D" } },
          { data: { id: "e", label: "E" } },
          // 边
          { data: { id: "ab", source: "a", target: "b", weight: 2 } },
          { data: { id: "bc", source: "b", target: "c", weight: 3 } },
          { data: { id: "cd", source: "c", target: "d", weight: 1 } },
          { data: { id: "de", source: "d", target: "e", weight: 4 } },
          { data: { id: "ae", source: "a", target: "e", weight: 5 } },
        ],
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#666",
              label: "data(label)",
              width: 30,
              height: 30,
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": "#999",
              "curve-style": "bezier",
              "target-arrow-shape": "triangle",
              label: "data(weight)",
            },
          },
          {
            selector: ".highlighted",
            style: {
              "background-color": "#ff0000",
              "line-color": "#ff0000",
              "transition-property": "background-color, line-color",
              "transition-duration": "0.3s",
            },
          },
        ],
        layout: {
          name: "circle",
        },
      });

      // 查找最短路径
      function findShortestPath() {
        resetGraph();
        const startNode = cy.$("#a");
        const endNode = cy.$("#e");

        const dijkstra = cy.elements().dijkstra({
          root: startNode,
          directed: true,
          weight: function (edge) {
            return edge.data("weight");
          },
        });

        const path = dijkstra.pathTo(endNode);
        const distance = dijkstra.distanceTo(endNode);

        path.addClass("highlighted");

        document.getElementById("info").innerHTML = `
          <h3>最短路径分析</h3>
          <p>从节点 ${startNode.data("label")} 到节点 ${endNode.data(
          "label"
        )}:</p>
          <p>距离: ${distance}</p>
          <p>路径: ${path
            .nodes()
            .map((n) => n.data("label"))
            .join(" → ")}</p>
        `;
      }

      // 中心性分析
      function analyzeCentrality() {
        resetGraph();

        const bc = cy.elements().betweennessCentrality({
          directed: true,
          weight: function (edge) {
            return edge.data("weight");
          },
        });

        // 根据中心性值设置节点大小
        cy.nodes().forEach((node) => {
          const score = bc.betweenness(node);
          node.style({
            width: 30 + score * 20,
            height: 30 + score * 20,
          });
        });

        document.getElementById("info").innerHTML = `
          <h3>中心性分析</h3>
          ${cy
            .nodes()
            .map(
              (node) => `
            <p>节点 ${node.data("label")}: ${bc
                .betweenness(node)
                .toFixed(2)}</p>
          `
            )
            .join("")}
        `;
      }

      // 社区发现
      function findCommunities() {
        resetGraph();

        const clusters = cy.elements().markovClustering({
          attributes: [
            function (edge) {
              return edge.data("weight");
            },
          ],
        });

        // 为不同社区设置不同颜色
        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];
        clusters.forEach((cluster, i) => {
          cluster.forEach((ele) => {
            ele.style("background-color", colors[i % colors.length]);
          });
        });

        document.getElementById("info").innerHTML = `
          <h3>社区发现</h3>
          <p>发现 ${clusters.length} 个社区</p>
          ${clusters
            .map(
              (cluster, i) => `
            <p>社区 ${i + 1}: ${cluster
                .nodes()
                .map((n) => n.data("label"))
                .join(", ")}</p>
          `
            )
            .join("")}
        `;
      }

      // 重置图形
      function resetGraph() {
        cy.elements().removeClass("highlighted");
        cy.nodes().style({
          width: 30,
          height: 30,
          "background-color": "#666",
        });
        cy.edges().style({
          width: 2,
          "line-color": "#999",
        });
        document.getElementById("info").innerHTML = "";
      }
    </script>
  </body>
</html>
```

## 算法应用最佳实践

1. **性能优化**

   - 选择合适的算法
   - 优化数据结构
   - 缓存计算结果
   - 处理大规模数据

2. **可视化反馈**

   - 清晰的结果展示
   - 交互式探索
   - 动态更新
   - 结果解释

3. **算法选择**

   - 考虑图的规模
   - 评估时间复杂度
   - 权衡精确度
   - 适应具体需求

4. **数据处理**

   - 数据预处理
   - 异常值处理
   - 结果验证
   - 数据更新

5. **交互设计**

   - 参数调整
   - 结果筛选
   - 实时反馈
   - 操作撤销

6. **扩展性考虑**
   - 算法组合
   - 自定义算法
   - 结果导出
   - 接口设计
