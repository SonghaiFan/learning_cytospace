# 3. Layout and View Control

> [View Example Code](../examples/3-layout-and-view-control/index.html) | [Online Preview](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/3-layout-and-view-control/index.html)

This chapter will introduce how to control graph layouts and views in Cytoscape.js, including different types of layout algorithms, subgraph layouts, and view operations such as zooming and panning.

## Layout Types

Cytoscape.js provides various layout algorithms that can be categorized into three main types:

### 1. Discrete Layouts

Fast and deterministic geometric layouts where node positions are determined in a single pass:

```javascript
const discreteLayouts = {
  // Grid layout
  grid: {
    name: "grid",
    animate: true,
    animationDuration: 500,
    padding: 30,
    rows: undefined, // Auto-calculate number of rows
    cols: undefined, // Auto-calculate number of columns
    position: (node) => {}, // Custom node position function
    spacingFactor: 1.5, // Node spacing factor
  },
  // Circle layout
  circle: {
    name: "circle",
    animate: true,
    animationDuration: 500,
    padding: 30,
    radius: undefined, // Auto-calculate radius
    startAngle: (3 / 2) * Math.PI, // Starting angle
    sweep: undefined, // Layout sweep angle
    clockwise: true, // Clockwise arrangement
  },
  // Concentric layout
  concentric: {
    name: "concentric",
    animate: true,
    animationDuration: 500,
    padding: 30,
    minNodeSpacing: 50,
    concentric: (node) => node.degree(), // Determine level based on degree
    levelWidth: () => 1,
    startAngle: (3 / 2) * Math.PI,
    sweep: undefined,
    clockwise: true,
    equidistant: false, // Whether to distribute evenly
  },
  // Breadthfirst layout
  breadthfirst: {
    name: "breadthfirst",
    animate: true,
    animationDuration: 500,
    padding: 30,
    directed: true, // Consider edge direction
    spacingFactor: 1.5,
    roots: undefined, // Specify root nodes
    maximal: false, // Whether to use maximum spanning tree
  },
};
```

### 2. Force-Directed Layouts

Calculate node positions through physical simulation iterations, suitable for displaying complex relationships:

```javascript
const forceLayouts = {
  // F-CoSE layout (recommended for large graphs)
  fcose: {
    name: "fcose",
    quality: "proof",
    animate: true,
    animationDuration: 500,
    randomize: true,
    padding: 30,
    nodeSeparation: 75,
    idealEdgeLength: (edge) => 50, // Can set ideal length based on edge properties
    nodeRepulsion: (node) => 4500, // Can set repulsion based on node properties
  },
  // Cola layout
  cola: {
    name: "cola",
    animate: true,
    animationDuration: 500,
    padding: 30,
    maxSimulationTime: 3000,
    nodeSpacing: 30,
    edgeLength: 100,
    alignment: undefined, // Alignment constraints
    flowDirection: undefined, // Flow direction constraints
    groupCompression: 0.8, // Group compression coefficient
  },
  // CoSE layout
  cose: {
    name: "cose",
    animate: "end",
    animationDuration: 500,
    padding: 30,
    nodeRepulsion: 400000,
    idealEdgeLength: 100,
    numIter: 1000, // Number of iterations
    initialTemp: 1000, // Initial temperature
    coolingFactor: 0.99, // Cooling factor
    minTemp: 1.0, // Minimum temperature
  },
};
```

### 3. Hierarchical Layouts

Specifically designed for displaying directed graphs with hierarchical structure:

```javascript
const hierarchicalLayouts = {
  // Dagre layout
  dagre: {
    name: "dagre",
    animate: true,
    animationDuration: 500,
    padding: 30,
    rankDir: "TB", // 'TB', 'LR', 'BT', 'RL'
    align: "UL", // 'UL', 'UR', 'DL', 'DR'
    nodeSep: 50, // Node separation within same rank
    rankSep: 50, // Separation between ranks
    ranker: "network-simplex", // Ranking algorithm
  },
  // ELK layout
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

## Layout Control

### Layout Lifecycle

```javascript
function runLayoutWithEvents(name) {
  const layout = cy.layout(layoutConfigs[name]);

  // Layout start event
  layout.on("layoutstart", function () {
    console.log("Layout started");
  });

  // Layout ready event
  layout.on("layoutready", function () {
    console.log("Layout ready");
  });

  // Layout stop event
  layout.on("layoutstop", function () {
    console.log("Layout stopped");
  });

  // Run layout
  layout.run();
}
```

### Subgraph Layout

Apply specific layout to selected nodes and their neighbors:

```javascript
function applyLayoutToSelected(name) {
  const selectedNodes = cy.nodes(":selected");
  if (selectedNodes.length === 0) return;

  // Get center point of selected nodes
  const bb = selectedNodes.boundingBox();
  const center = {
    x: (bb.x1 + bb.x2) / 2,
    y: (bb.y1 + bb.y2) / 2,
  };

  // Get selected nodes and their neighbors
  const neighborhood = selectedNodes.neighborhood().add(selectedNodes);

  // Create layout configuration
  const layoutConfig = {
    ...layoutConfigs[name],
    fit: false, // Don't auto-fit view
    animate: true,
    animationDuration: 500,
    // Specify layout boundary
    boundingBox: {
      x1: center.x - 100,
      y1: center.y - 100,
      x2: center.x + 100,
      y2: center.y + 100,
    },
    // Can add layout constraints
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

  // Record positions of other nodes
  const otherNodes = cy.nodes().not(neighborhood);
  const positions = {};
  otherNodes.forEach((node) => {
    positions[node.id()] = { ...node.position() };
  });

  // Run layout
  const layout = neighborhood.layout(layoutConfig);

  // Restore other nodes' positions after layout
  layout.on("layoutstop", () => {
    otherNodes.forEach((node) => {
      node.position(positions[node.id()]);
    });
  });

  layout.run();
}
```

## View Control

### Basic View Operations

```javascript
// Zoom in
function zoomIn() {
  cy.animate({
    zoom: {
      level: cy.zoom() * 1.2,
      position: {
        // Center on mouse position
        x: cy.mousePosition().x,
        y: cy.mousePosition().y,
      },
    },
    duration: 500,
    easing: "ease-in-out-cubic",
  });
}

// Zoom out
function zoomOut() {
  cy.animate({
    zoom: {
      level: cy.zoom() * 0.8,
      position: cy.center(), // Center on view center
    },
    duration: 500,
  });
}

// Fit view
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

// Center view
function centerView() {
  cy.animate({
    center: {
      eles: cy.elements(),
    },
    duration: 500,
  });
}
```

### Advanced View Control

```javascript
// Pan view
function pan() {
  cy.animate({
    pan: { x: 100, y: 100 },
    duration: 500,
  });
}

// Rotate view
function rotate() {
  cy.animate({
    rotation: 180,
    duration: 1000,
  });
}

// Complex animation sequence
function complexAnimation() {
  cy.animation({
    fit: {
      eles: cy.nodes(),
      padding: 20,
    },
    duration: 500,
  })
    .play() // Start first animation
    .promise("completed") // Wait for completion
    .then(() => {
      return cy
        .animation({
          // Chain animation
          zoom: 2,
          center: { eles: cy.$("#target") },
          duration: 500,
        })
        .play()
        .promise("completed");
    });
}

// Custom view transform
function customViewTransform() {
  cy.viewport({
    zoom: 2,
    pan: { x: 100, y: 100 },
    rotation: 45,
  });
}
```

## Key Concepts Explanation

1. **Layout Types**

   - Discrete layouts: Suitable for simple graphs, fast and stable
   - Force-directed layouts: Suitable for complex relationship networks, automatically find good layouts
   - Hierarchical layouts: Suitable for displaying graphs with clear hierarchical relationships

2. **Layout Parameters**

   - `animate`: Whether to use animation
   - `animationDuration`: Animation duration
   - `padding`: Layout padding
   - `fit`: Whether to auto-fit view
   - `boundingBox`: Layout bounding box
   - `randomize`: Whether to randomize initial positions
   - `infinite`: Whether to run continuously

3. **View Operations**

   - `zoom`: Zoom level control
   - `pan`: Pan control
   - `fit`: Fit elements
   - `center`: Center display
   - `rotation`: Rotation control
   - `viewport`: Viewport transformation

4. **Layout Events**

   - `layoutstart`: Triggered when layout starts
   - `layoutready`: Triggered when layout is ready
   - `layoutstop`: Triggered when layout completes

5. **Performance Optimization**

   - Use `headless: true` for background calculation
   - Set reasonable iteration count and convergence conditions
   - Use incremental layout for large graphs
   - Avoid frequent layout switching

6. **Layout Constraints**
   - Alignment constraints: Control node alignment
   - Relative position constraints: Maintain relative positions
   - Edge length constraints: Control ideal edge lengths
   - Area constraints: Restrict nodes to specific areas

## Layout Extension Installation

### CDN Method

```html
<!-- Base dependencies -->
<script src="https://unpkg.com/layout-base/layout-base.js"></script>
<script src="https://unpkg.com/cose-base/cose-base.js"></script>

<!-- Layout extensions -->
<script src="https://unpkg.com/cytoscape-fcose/cytoscape-fcose.js"></script>
<script src="https://unpkg.com/cytoscape-cola/cytoscape-cola.js"></script>
<script src="https://unpkg.com/cytoscape-dagre/cytoscape-dagre.js"></script>
<script src="https://unpkg.com/cytoscape-elk/cytoscape-elk.js"></script>
```

### NPM Method

```bash
npm install cytoscape-fcose cytoscape-cola cytoscape-dagre cytoscape-elk
```

```javascript
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import cola from "cytoscape-cola";
import dagre from "cytoscape-dagre";
import elk from "cytoscape-elk";

// Register layouts
cytoscape.use(fcose);
cytoscape.use(cola);
cytoscape.use(dagre);
cytoscape.use(elk);
```

## Best Practices

1. Choose appropriate layout based on data characteristics

   - Use `dagre` or `elk` for hierarchical data
   - Use `fcose` or `cola` for complex relationship networks
   - Use `grid` or `circle` for simple geometric layouts

2. Optimize layout performance

   - Use 'draft' quality mode of `fcose` for large-scale graphs
   - Consider disabling animation for better performance
   - Use `fit: false` to avoid unnecessary view adjustments

3. Enhance user experience

   - Add animation effects for layout changes
   - Provide real-time adjustment of layout parameters
   - Implement layout state save and restore

4. View control recommendations
   - Provide appropriate zoom range limits
   - Implement smooth animation transitions
   - Maintain responsiveness to user operations
