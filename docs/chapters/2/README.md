# 2. Basic Operations with Nodes and Edges

> [Online Preview](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/2-basic-node-and-edge-operations/index.html)

This chapter will introduce how to perform basic operations on nodes and edges in Cytoscape.js, including adding, deleting, updating elements, as well as element traversal and collection operations.

## Initialize Graph Instance

First, let's create a graph instance with initial nodes and edges:

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [
    // Initial nodes
    { data: { id: "a", label: "Node A", weight: 75 } },
    { data: { id: "b", label: "Node B", weight: 65 } },
    // Initial edges
    {
      data: {
        id: "ab",
        source: "a",
        target: "b",
        label: "Edge AB",
        weight: 1.5,
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
        width: "data(weight)", // Use data property to control style
        height: "data(weight)",
      },
    },
    {
      selector: "edge",
      style: {
        width: "data(weight)", // Use data property to control style
        "line-color": "#999",
        label: "data(label)",
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
      },
    },
    {
      selector: ":selected",
      style: {
        "background-color": "#900",
        "line-color": "#900",
        "target-arrow-color": "#900",
        "source-arrow-color": "#900",
      },
    },
  ],
  layout: { name: "grid" },
});
```

## Element Operations

### Adding Elements

#### Add Single Node

```javascript
function addNode() {
  const id = "node-" + Date.now();
  cy.add({
    group: "nodes",
    data: {
      id,
      label: `Node ${id}`,
      weight: Math.random() * 50 + 50, // Random weight
    },
    position: {
      // Can specify position
      x: Math.random() * 300 + 150,
      y: Math.random() * 200 + 100,
    },
    selected: true, // Can set initial state
    classes: ["new-node"], // Can add classes
  });
}
```

#### Batch Add Elements

```javascript
function addMultipleElements() {
  cy.add([
    { group: "nodes", data: { id: "n1" } },
    { group: "nodes", data: { id: "n2" } },
    { group: "edges", data: { id: "e1", source: "n1", target: "n2" } },
  ]);
}
```

### Deleting Elements

#### Delete Selected Elements

```javascript
function removeSelected() {
  cy.$(":selected").remove();
}
```

#### Conditional Deletion

```javascript
function removeByCondition() {
  // Delete all isolated nodes
  cy.$("node[[degree = 0]]").remove();

  // Delete specific types of edges
  cy.$("edge[weight < 1]").remove();
}
```

### Updating Elements

#### Update Data

```javascript
function updateElementData() {
  // Update single property
  cy.$("node:selected").forEach((node) => {
    const newLabel = prompt("Enter new label:", node.data("label"));
    if (newLabel) {
      node.data("label", newLabel);
    }
  });

  // Batch update multiple properties
  cy.$("node:selected").data({
    weight: 100,
    type: "updated",
    timestamp: Date.now(),
  });
}
```

#### Update Position

```javascript
function updatePosition() {
  cy.$("node:selected").position({
    x: 100,
    y: 100,
  });
}
```

## Element Traversal and Collections

### Basic Selectors

```javascript
// Select all nodes
const allNodes = cy.nodes();

// Select all edges
const allEdges = cy.edges();

// Select element by specific ID
const nodeA = cy.$("#a");

// Select elements by class
const newNodes = cy.$(".new-node");

// Select elements with specific data attributes
const heavyNodes = cy.$("node[weight >= 75]");
```

### Traversal Operations

```javascript
// Traverse all neighboring nodes
function traverseNeighbors(nodeId) {
  const node = cy.$(`#${nodeId}`);
  node.neighborhood().forEach((ele) => {
    console.log(ele.data());
  });
}

// Traverse all connected edges
function traverseConnectedEdges(nodeId) {
  const node = cy.$(`#${nodeId}`);
  node.connectedEdges().forEach((edge) => {
    console.log(edge.data());
  });
}

// Get path
function getPath(sourceId, targetId) {
  const path = cy.$(`#${sourceId}`).shortestPath(cy.$(`#${targetId}`));
  return path;
}
```

### Collection Operations

```javascript
// Union collections
const collection1 = cy.$(".type1");
const collection2 = cy.$(".type2");
const combined = collection1.union(collection2);

// Intersection
const intersection = collection1.intersection(collection2);

// Difference
const difference = collection1.difference(collection2);
```

## Data Management

### Data Storage

```javascript
// Store data on elements
cy.$("#a").data({
  weight: 75,
  type: "user",
  metadata: {
    created: Date.now(),
    status: "active",
  },
});

// Get data
const weight = cy.$("#a").data("weight");
const metadata = cy.$("#a").data("metadata");
```

### Batch Data Operations

```javascript
// Batch update data
cy.batch(() => {
  cy.nodes().forEach((node) => {
    node.data("visited", true);
    node.data("timestamp", Date.now());
  });
});
```

## Key Concepts Explanation

1. **Element Selectors**

   - `cy.$()`: Use selectors to find elements
   - `:selected`: Selected state elements
   - `node:selected`: Selected state nodes
   - `[attributeName]`: Attribute selectors
   - `.className`: Class selectors
   - `#id`: ID selectors

2. **Element Data**

   - `data`: Store element data (e.g., id, label, etc.)
   - `position`: Node position information (nodes only)
   - `scratch`: Temporary data storage (not serialized)

3. **Element Operations**

   - `cy.add()`: Add new elements
   - `remove()`: Delete elements
   - `data()`: Get or set element data
   - `position()`: Get or set node position
   - `move()`: Move node position

4. **Collection Operations**

   - `union()`: Merge collections
   - `intersection()`: Get intersection
   - `difference()`: Get difference
   - `filter()`: Filter elements
   - `not()`: Exclude elements

5. **Traversal Methods**

   - `neighborhood()`: Get neighboring elements
   - `connectedEdges()`: Get connected edges
   - `predecessors()`: Get predecessor nodes
   - `successors()`: Get successor nodes
   - `components()`: Get connected components

6. **Performance Optimization**

   - Use `cy.batch()` for batch operations
   - Cache frequently used selector results
   - Use `eles.forEach()` instead of `for` loops
   - Use event delegation appropriately
