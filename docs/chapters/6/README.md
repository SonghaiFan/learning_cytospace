# 6. Graph Algorithms and Analysis

> [View Example Code](../examples/6-graph-algorithms-and-analysis/index.html) | [Online Preview](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/6-graph-algorithms-and-analysis/index.html)

This chapter will introduce how to use graph algorithms and analysis features in Cytoscape.js.

## Basic Configuration

Initialize a graph instance with multiple community structures:

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [
    // Community A
    { data: { id: "a1", label: "A1", weight: 65, community: "A" } },
    { data: { id: "a2", label: "A2", weight: 70, community: "A" } },
    { data: { id: "a3", label: "A3", weight: 75, community: "A" } },
    // Community B
    { data: { id: "b1", label: "B1", weight: 70, community: "B" } },
    { data: { id: "b2", label: "B2", weight: 75, community: "B" } },
    { data: { id: "b3", label: "B3", weight: 80, community: "B" } },
    // Community C
    { data: { id: "c1", label: "C1", weight: 75, community: "C" } },
    { data: { id: "c2", label: "C2", weight: 80, community: "C" } },
    { data: { id: "c3", label: "C3", weight: 85, community: "C" } },
    // Edges within communities
    { data: { id: "a1a2", source: "a1", target: "a2", weight: 1 } },
    { data: { id: "a2a3", source: "a2", target: "a3", weight: 1 } },
    { data: { id: "a3a1", source: "a3", target: "a1", weight: 1 } },
    { data: { id: "b1b2", source: "b1", target: "b2", weight: 1 } },
    { data: { id: "b2b3", source: "b2", target: "b3", weight: 1 } },
    { data: { id: "b3b1", source: "b3", target: "b1", weight: 1 } },
    { data: { id: "c1c2", source: "c1", target: "c2", weight: 1 } },
    { data: { id: "c2c3", source: "c2", target: "c3", weight: 1 } },
    { data: { id: "c3c1", source: "c3", target: "c1", weight: 1 } },
    // Edges between communities
    { data: { id: "a1b1", source: "a1", target: "b1", weight: 2 } },
    { data: { id: "b2c2", source: "b2", target: "c2", weight: 2 } },
    { data: { id: "c3a3", source: "c3", target: "a3", weight: 2 } },
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
});
```

## Centrality Analysis

### PageRank Analysis

```javascript
// Calculate PageRank
function calculatePageRank() {
  const pagerank = cy.elements().pageRank({
    dampingFactor: 0.85, // Damping factor (default: 0.85)
    precision: 0.000001, // Precision threshold (default: 0.000001)
    iterations: 200, // Maximum iterations (default: 200)
    weight: (edge) => edge.data("weight"), // Edge weight function
  });

  // Apply visual styles based on PageRank values
  cy.nodes().forEach((node) => {
    const rank = pagerank.rank(node);
    node.data("pageRank", rank);

    // Normalize size based on PageRank
    const size = 30 + rank * 50;
    node.style({
      width: size,
      height: size,
      "background-color": `rgb(${Math.round(rank * 255)}, 0, 0)`,
    });
  });

  return pagerank;
}
```

### Degree Centrality Analysis

```javascript
// Calculate degree centrality
function calculateDegreeCentrality() {
  cy.nodes().forEach((node) => {
    // Calculate different types of degree
    const totalDegree = node.degree();
    const inDegree = node.indegree();
    const outDegree = node.outdegree();

    // Store degree values
    node.data({
      totalDegree,
      inDegree,
      outDegree,
    });

    // Apply visual styles
    const size = 30 + totalDegree * 10;
    node.style({
      width: size,
      height: size,
      "background-color": `rgb(0, ${Math.round((totalDegree / 6) * 255)}, 0)`,
    });
  });
}
```

### Betweenness Centrality Analysis

```javascript
// Calculate betweenness centrality
function calculateBetweennessCentrality() {
  const bc = cy.elements().betweennessCentrality({
    directed: true, // Consider edge direction
    weight: (edge) => edge.data("weight"), // Edge weight function
  });

  // Apply visual styles based on betweenness values
  cy.nodes().forEach((node) => {
    const centrality = bc.betweenness(node);
    node.data("betweenness", centrality);

    // Normalize size based on betweenness
    const size = 30 + centrality * 20;
    node.style({
      width: size,
      height: size,
      "background-color": `rgb(0, 0, ${Math.round(centrality * 255)})`,
    });
  });

  return bc;
}
```

## Path Analysis

### Shortest Path Analysis

```javascript
// Find shortest path between two nodes
function findShortestPath(sourceId, targetId) {
  const dijkstra = cy.elements().dijkstra({
    root: `#${sourceId}`,
    weight: (edge) => edge.data("weight"),
    directed: true,
  });

  // Get path to target
  const pathToTarget = dijkstra.pathTo(cy.$(`#${targetId}`));

  // Highlight path
  cy.elements().removeClass("highlighted");
  pathToTarget.forEach((ele) => ele.addClass("highlighted"));

  // Calculate path statistics
  const distance = dijkstra.distanceTo(cy.$(`#${targetId}`));

  return {
    path: pathToTarget,
    distance: distance,
  };
}
```

### All Paths Analysis

```javascript
// Find all paths between two nodes
function findAllPaths(sourceId, targetId) {
  const paths = [];
  const visited = new Set();

  function dfs(currentId, targetId, currentPath) {
    if (currentId === targetId) {
      paths.push([...currentPath]);
      return;
    }

    visited.add(currentId);
    const node = cy.$(`#${currentId}`);

    node.outgoers("node").forEach((neighbor) => {
      const neighborId = neighbor.id();
      if (!visited.has(neighborId)) {
        currentPath.push(neighborId);
        dfs(neighborId, targetId, currentPath);
        currentPath.pop();
      }
    });

    visited.delete(currentId);
  }

  dfs(sourceId, targetId, [sourceId]);
  return paths;
}
```

## Community Analysis

### K-means Clustering

```javascript
// Perform k-means clustering
function kMeansClustering(k = 3) {
  // Get node positions
  const positions = cy.nodes().map((node) => ({
    id: node.id(),
    x: node.position("x"),
    y: node.position("y"),
  }));

  // Initialize centroids randomly
  let centroids = Array.from({ length: k }, () => ({
    x: Math.random() * cy.width(),
    y: Math.random() * cy.height(),
  }));

  // Maximum iterations
  const maxIterations = 100;
  let iteration = 0;
  let changed = true;

  while (changed && iteration < maxIterations) {
    changed = false;
    iteration++;

    // Assign nodes to nearest centroid
    const clusters = Array.from({ length: k }, () => []);
    positions.forEach((pos) => {
      let minDist = Infinity;
      let clusterIndex = 0;

      centroids.forEach((centroid, index) => {
        const dist = Math.sqrt(
          Math.pow(pos.x - centroid.x, 2) + Math.pow(pos.y - centroid.y, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = index;
        }
      });

      clusters[clusterIndex].push(pos);
    });

    // Update centroids
    const newCentroids = clusters.map((cluster) => {
      if (cluster.length === 0) return centroids[0];
      return {
        x: cluster.reduce((sum, pos) => sum + pos.x, 0) / cluster.length,
        y: cluster.reduce((sum, pos) => sum + pos.y, 0) / cluster.length,
      };
    });

    // Check if centroids changed
    centroids.forEach((centroid, i) => {
      if (
        Math.abs(centroid.x - newCentroids[i].x) > 0.1 ||
        Math.abs(centroid.y - newCentroids[i].y) > 0.1
      ) {
        changed = true;
      }
    });

    centroids = newCentroids;
  }

  // Apply visual styles based on clusters
  positions.forEach((pos) => {
    const node = cy.$(`#${pos.id}`);
    let minDist = Infinity;
    let clusterIndex = 0;

    centroids.forEach((centroid, index) => {
      const dist = Math.sqrt(
        Math.pow(pos.x - centroid.x, 2) + Math.pow(pos.y - centroid.y, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        clusterIndex = index;
      }
    });

    // Color nodes based on cluster
    const hue = (360 * clusterIndex) / k;
    node.style("background-color", `hsl(${hue}, 75%, 50%)`);
  });
}
```

## Network Structure Analysis

### Bridge Edge Detection

```javascript
// Find bridge edges
function findBridges() {
  const bridges = [];
  const visited = new Set();
  const disc = new Map();
  const low = new Map();
  let time = 0;

  function dfs(node, parent) {
    visited.add(node.id());
    disc.set(node.id(), time);
    low.set(node.id(), time);
    time++;

    node.neighborhood("node").forEach((neighbor) => {
      if (!visited.has(neighbor.id())) {
        const edge = node.edgesWith(neighbor);
        dfs(neighbor, node);

        low.set(
          node.id(),
          Math.min(low.get(node.id()), low.get(neighbor.id()))
        );

        if (low.get(neighbor.id()) > disc.get(node.id())) {
          bridges.push(edge);
        }
      } else if (neighbor.id() !== parent?.id()) {
        low.set(
          node.id(),
          Math.min(low.get(node.id()), disc.get(neighbor.id()))
        );
      }
    });
  }

  // Start DFS from each unvisited node
  cy.nodes().forEach((node) => {
    if (!visited.has(node.id())) {
      dfs(node);
    }
  });

  // Highlight bridge edges
  cy.edges().removeClass("highlighted");
  bridges.forEach((edge) => {
    edge.addClass("highlighted");
  });

  return bridges;
}
```

### Articulation Point Detection

```javascript
// Find articulation points
function findArticulationPoints() {
  const articulationPoints = new Set();
  const visited = new Set();
  const disc = new Map();
  const low = new Map();
  const parent = new Map();
  let time = 0;

  function dfs(node) {
    let children = 0;
    visited.add(node.id());
    disc.set(node.id(), time);
    low.set(node.id(), time);
    time++;

    node.neighborhood("node").forEach((neighbor) => {
      if (!visited.has(neighbor.id())) {
        children++;
        parent.set(neighbor.id(), node.id());
        dfs(neighbor);

        low.set(
          node.id(),
          Math.min(low.get(node.id()), low.get(neighbor.id()))
        );

        // Root with at least two children
        if (!parent.has(node.id()) && children > 1) {
          articulationPoints.add(node.id());
        }

        // Non-root node with low value of child >= discovery value
        if (
          parent.has(node.id()) &&
          low.get(neighbor.id()) >= disc.get(node.id())
        ) {
          articulationPoints.add(node.id());
        }
      } else if (neighbor.id() !== parent.get(node.id())) {
        low.set(
          node.id(),
          Math.min(low.get(node.id()), disc.get(neighbor.id()))
        );
      }
    });
  }

  // Start DFS from each unvisited node
  cy.nodes().forEach((node) => {
    if (!visited.has(node.id())) {
      dfs(node);
    }
  });

  // Highlight articulation points
  cy.nodes().removeClass("highlighted");
  articulationPoints.forEach((nodeId) => {
    cy.$(`#${nodeId}`).addClass("highlighted");
  });

  return Array.from(articulationPoints);
}
```

## Key Concepts Explanation

1. **Centrality Measures**

   - **PageRank**

     - Evaluates node importance based on connections
     - Complexity: O(E·k), where k is iterations
     - Applications: Node ranking, influence analysis

   - **Degree Centrality**

     - Reflects direct connection count
     - Complexity: O(V)
     - Applications: Hub detection, connectivity analysis

   - **Betweenness Centrality**
     - Measures node importance as intermediary
     - Complexity: O(V·E)
     - Applications: Network flow, bottleneck detection

2. **Path Analysis**

   - **Shortest Path**

     - Dijkstra's algorithm for weighted graphs
     - Complexity: O((V+E)·log V)
     - Applications: Route planning, distance analysis

   - **All Paths**
     - DFS-based path enumeration
     - Complexity: O(V!)
     - Applications: Route alternatives, redundancy analysis

3. **Community Analysis**

   - **K-means Clustering**
     - Position-based node grouping
     - Complexity: O(k·n·i), where i is iterations
     - Applications: Community detection, node classification

4. **Network Structure**

   - **Bridge Edges**

     - Critical connections between components
     - Complexity: O(V+E)
     - Applications: Network vulnerability, connection importance

   - **Articulation Points**
     - Critical nodes for connectivity
     - Complexity: O(V+E)
     - Applications: Network resilience, failure points

5. **Performance Optimization**

   - Use appropriate algorithms based on graph size
   - Cache computation results
   - Implement batch processing for large graphs
   - Consider memory usage for large datasets
   - Use efficient data structures

## Example: Network Analysis Dashboard

```javascript
// Create analysis dashboard
function createAnalysisDashboard() {
  // Calculate and display centrality measures
  const pagerank = calculatePageRank();
  const betweenness = calculateBetweennessCentrality();
  calculateDegreeCentrality();

  // Find critical network elements
  const bridges = findBridges();
  const articulationPoints = findArticulationPoints();

  // Perform community detection
  kMeansClustering(3);

  // Display analysis results
  console.log({
    centrality: {
      pagerank: pagerank.rank(cy.nodes()[0]),
      betweenness: betweenness.betweenness(cy.nodes()[0]),
      degree: cy.nodes()[0].data("totalDegree"),
    },
    structure: {
      bridges: bridges.length,
      articulationPoints: articulationPoints.length,
    },
  });
}
```
