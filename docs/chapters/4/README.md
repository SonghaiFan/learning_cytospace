# 4. Styles and Visual Effects

> [Online Preview](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/4-styles-and-animations/index.html)

This chapter will introduce how to set element styles and create animation effects in Cytoscape.js.

## Basic Style Setup

Initialize a graph instance with basic styles:

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [
    // Nodes
    { data: { id: "a", label: "Node A", type: "special" } },
    { data: { id: "b", label: "Node B", weight: 75 } },
    { data: { id: "c", label: "Node C", parent: "compound" } },
    // Compound node
    { data: { id: "compound", label: "Compound Node" } },
    // Edges
    {
      data: {
        id: "ab",
        source: "a",
        target: "b",
        label: "Edge AB",
        weight: 2,
      },
    },
    {
      data: {
        id: "bc",
        source: "b",
        target: "c",
        label: "Edge BC",
        weight: 1,
      },
    },
    {
      data: {
        id: "ca",
        source: "c",
        target: "a",
        label: "Edge CA",
        weight: 3,
      },
    },
  ],
  style: [
    // Basic node style
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        width: 60,
        height: 60,
        // Font style
        "font-size": 12,
        "font-weight": "normal",
        "font-family": "Helvetica",
        // Border style
        "border-width": 2,
        "border-color": "#000",
        "border-opacity": 0.5,
      },
    },
    // Special node style
    {
      selector: "node[type='special']",
      style: {
        "background-color": "#e74c3c",
        shape: "diamond",
      },
    },
    // Data-driven node style
    {
      selector: "node[weight]",
      style: {
        width: "data(weight)",
        height: "data(weight)",
      },
    },
    // Compound node style
    {
      selector: "node:parent",
      style: {
        "background-opacity": 0.333,
        "background-color": "#ad1a66",
        "border-width": 3,
        "border-color": "#ad1a66",
      },
    },
    // Basic edge style
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#999",
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
        label: "data(label)",
        "text-rotation": "autorotate",
        // Edge label style
        "text-margin-y": -10,
        "text-background-color": "#fff",
        "text-background-opacity": 1,
        "text-background-padding": 4,
        // Arrow style
        "target-arrow-color": "#999",
        "source-arrow-color": "#999",
        "arrow-scale": 1.5,
      },
    },
    // Data-driven edge style
    {
      selector: "edge[weight]",
      style: {
        width: "data(weight)",
        "line-style": "data(weight)",
      },
    },
    // Interaction state styles
    {
      selector: ":selected",
      style: {
        "background-color": "#ff0",
        "line-color": "#ff0",
        "target-arrow-color": "#ff0",
        "source-arrow-color": "#ff0",
      },
    },
    {
      selector: ":active",
      style: {
        "overlay-color": "#ff0",
        "overlay-padding": 10,
        "overlay-opacity": 0.25,
      },
    },
    {
      selector: ":grabbed",
      style: {
        "overlay-color": "#0f0",
      },
    },
  ],
  layout: { name: "circle" },
});
```

## Style Control

### Node Styles

#### Basic Shapes

```javascript
function changeNodeShape(shape) {
  cy.nodes().style({
    shape: shape, // Available values:
    // Basic shapes: 'ellipse', 'triangle', 'rectangle', 'diamond'
    // Polygons: 'pentagon', 'hexagon', 'heptagon', 'octagon'
    // Special shapes: 'star', 'vee', 'rhomboid'
    // Custom: 'polygon' with 'shape-polygon-points'
  });
}

// Custom polygon
function setCustomPolygon() {
  cy.nodes().style({
    shape: "polygon",
    "shape-polygon-points": [
      -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0, 0.8, -0.5, 0.5,
    ],
  });
}
```

#### Compound Styles

```javascript
function setCompoundStyle() {
  // Parent node style
  cy.nodes(":parent").style({
    "background-opacity": 0.333,
    "background-color": "#ad1a66",
    "border-width": 3,
    "border-color": "#ad1a66",
    shape: "roundrectangle",
    padding: 10,
  });

  // Child node style
  cy.nodes(":child").style({
    "background-color": "#f1f1f1",
    shape: "rectangle",
  });
}
```

#### Gradient Effects

```javascript
function setGradient() {
  cy.nodes().style({
    "background-gradient-stop-colors": "#ff0000 #00ff00",
    "background-gradient-stop-positions": "0% 100%",
    "background-gradient-direction": "to-bottom-right",
  });
}
```

### Edge Styles

#### Line Types and Arrows

```javascript
function setEdgeStyle() {
  cy.edges().style({
    // Line type
    "curve-style": "bezier", // 'haystack', 'segments', 'straight', 'taxi'
    "line-style": "solid", // 'dotted', 'dashed'
    "line-dash-pattern": [6, 3], // Custom dash pattern
    "line-dash-offset": 1,

    // Arrows
    "source-arrow-shape": "triangle",
    "mid-source-arrow-shape": "diamond",
    "target-arrow-shape": "triangle",
    "source-arrow-fill": "hollow", // 'filled'
    "target-arrow-fill": "filled",

    // Endpoints
    "source-endpoint": "outside-to-node",
    "target-endpoint": "outside-to-node",

    // Control points
    "control-point-step-size": 40,
    "control-point-weights": [0.25, 0.75],
    "control-point-distances": [-50, 50],
  });
}
```

#### Compound Edges

```javascript
function setCompoundEdge() {
  // Edges from node to compound node
  cy.edges('[source = "compound"]').style({
    "curve-style": "bezier",
    "source-endpoint": "inside-to-node",
  });

  // Edges within compound node
  cy.edges()
    .filter(
      (edge) => edge.source().parent().id() === edge.target().parent().id()
    )
    .style({
      "curve-style": "haystack",
    });
}
```

## Animation System

### Basic Animations

```javascript
function basicAnimation() {
  // Single property animation
  cy.nodes().animate({
    style: {
      backgroundColor: "#ff0000",
      width: 75,
      height: 75,
    },
    duration: 1000,
    easing: "ease-in-out-cubic",
  });

  // Position animation
  cy.nodes().animate({
    position: { x: 100, y: 100 },
    duration: 1000,
  });

  // Combined style and position animation
  cy.nodes().animate({
    style: { backgroundColor: "#ff0000" },
    position: { x: 100, y: 100 },
    duration: 1000,
  });
}
```

### Complex Animation Sequences

```javascript
function complexAnimation() {
  // Create animations
  const a1 = cy.nodes().animation({
    style: { backgroundColor: "#ff0000" },
    duration: 1000,
  });

  const a2 = cy.nodes().animation({
    style: { width: 75, height: 75 },
    duration: 1000,
  });

  // Parallel animations
  Promise.all([a1.play().promise(), a2.play().promise()]).then(() => {
    // Operations after animations complete
  });

  // Sequential animations
  a1.play()
    .promise("complete")
    .then(() => a2.play());

  // Repeat animation
  a1.play()
    .promise("complete")
    .then(() => {
      a1.reverse().play();
    });
}
```

### Animation Queue

```javascript
function queueAnimation() {
  const queue = cy.nodes();

  // Add to queue
  queue
    .animation({
      style: { backgroundColor: "#ff0000" },
      duration: 1000,
    })
    .play();

  queue
    .animation({
      style: { width: 75 },
      duration: 1000,
    })
    .play();

  // Clear queue
  queue.stop();
}
```

### Performance-Optimized Animations

```javascript
function performantAnimation() {
  // Batch processing
  cy.batch(() => {
    cy.nodes().forEach((node) => {
      node
        .animation({
          style: { backgroundColor: "#ff0000" },
          duration: 1000,
        })
        .play();
    });
  });

  // Use requestAnimationFrame
  let frame = 0;
  const animate = () => {
    const progress = frame / 60; // 60fps
    cy.nodes().style("width", 50 + Math.sin(progress) * 25);
    frame++;
    if (frame < 60) {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
}
```

## Key Concepts Explanation

1. **Style Selectors**

   - `node`, `edge`: All nodes/edges
   - `#id`: Elements with specific ID
   - `.className`: Elements with specific class
   - `[attributeName]`: Elements with specific attributes
   - `:selected`, `:active`, `:grabbed`: State selectors
   - `:parent`, `:child`: Compound node selectors
   - `>`, `~`, `+`: Relationship selectors

2. **Node Style Properties**

   - **Basic Properties**
     - `shape`: Node shape
     - `background-color`: Background color
     - `width`, `height`: Dimensions
     - `label`: Label text
   - **Border and Shadow**
     - `border-width`: Border width
     - `border-style`: Border style
     - `border-color`: Border color
     - `shadow-blur`: Shadow blur
     - `shadow-color`: Shadow color
   - **Text Style**
     - `font-family`: Font family
     - `font-size`: Font size
     - `text-valign`: Vertical alignment
     - `text-halign`: Horizontal alignment
     - `text-wrap`: Text wrapping
   - **Gradient and Opacity**
     - `background-opacity`: Background opacity
     - `background-gradient-direction`: Gradient direction
     - `background-gradient-stop-colors`: Gradient colors
     - `background-gradient-stop-positions`: Gradient positions

3. **Edge Style Properties**

   - **Line Properties**
     - `line-style`: Line style
     - `line-color`: Line color
     - `width`: Line width
     - `curve-style`: Curve style
   - **Arrow Properties**
     - `source-arrow-shape`: Source arrow
     - `target-arrow-shape`: Target arrow
     - `arrow-scale`: Arrow size
     - `arrow-fill`: Arrow fill
   - **Label Properties**
     - `text-rotation`: Text rotation
     - `text-margin-x/y`: Text margin
     - `text-background-color`: Text background color
     - `text-border-width`: Text border width

4. **Animation System**

   - **Animation Properties**
     - `duration`: Duration
     - `easing`: Easing function
     - `delay`: Delay time
     - `queue`: Whether to queue
   - **Animation Control**
     - `play()`: Play animation
     - `pause()`: Pause animation
     - `stop()`: Stop animation
     - `rewind()`: Reset animation
     - `reverse()`: Reverse playback
   - **Animation Events**
     - `complete`: Complete event
     - `step`: Step event
     - `frame`: Frame event
   - **Performance Optimization**
     - Use `batch()`
     - Avoid frequent style updates
     - Use `requestAnimationFrame`
     - Use animation queue appropriately

5. **Performance Optimization**

   - Use class selectors instead of attribute selectors
   - Cache frequently used selector results
   - Batch process style updates
   - Use `raf` instead of `setInterval`
   - Avoid unnecessary animations
   - Set reasonable animation frame rates
