# 1. Environment Setup and Initialization

> [View Example Code](../examples/1-environment-setup-and-initialization/index.html) | [Online Preview](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/1-environment-setup-and-initialization/index.html)

This chapter will introduce how to build a basic Cytoscape.js graph visualization application using pure JavaScript (Vanilla JS).

## Basic Environment Configuration

### CDN Integration

Include Cytoscape.js via CDN:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
```

### NPM Installation

If you're using Node.js, you can install via NPM:

```bash
npm install cytoscape
```

Then import in your code:

```javascript
import cytoscape from "cytoscape";
```

## Page Structure

Create a basic HTML structure with a container for the graph:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js Basic Example</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
    <style>
      #cy {
        width: 600px;
        height: 400px;
        border: 1px solid #ccc;
        margin: 20px auto;
        /* Important: container must have a fixed height */
        position: relative;
      }
    </style>
  </head>
  <body>
    <div id="cy"></div>
  </body>
</html>
```

## Initialize Graph Instance

Add the following JavaScript code at the bottom of the HTML file:

```javascript
const cy = cytoscape({
  // Container element
  container: document.getElementById("cy"),

  // Elements in the graph (nodes and edges)
  elements: [
    // Sample data
    { data: { id: "a" } }, // Node a
    { data: { id: "b" } }, // Node b
    { data: { id: "ab", source: "a", target: "b" } }, // Edge from a to b
  ],

  // Style definitions
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(id)",
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#999",
        "curve-style": "bezier", // Important: set edge curve style
      },
    },
  ],

  // Layout configuration
  layout: {
    name: "grid", // Grid layout
    rows: 2, // Optional: specify number of rows
    cols: 2, // Optional: specify number of columns
  },

  // Performance-related configuration
  minZoom: 0.1, // Minimum zoom level
  maxZoom: 10, // Maximum zoom level
  wheelSensitivity: 0.2, // Mouse wheel sensitivity
  pixelRatio: "auto", // Pixel ratio, can be a number or 'auto'
});
```

## Core Configuration Explanation

### Basic Configuration Parameters

1. `container`: Specifies which DOM element the graph will render in

   - Must be a DOM element
   - Container must have a fixed height
   - Recommended to set `position: relative`

2. `elements`: Defines nodes and edges in the graph

   - Nodes must have unique `id`s
   - Edges must have `source` and `target`
   - Can include custom data

3. `style`: Defines visual styles for elements

   - Uses selectors to target elements
   - Supports various visual properties
   - Can reference element data

4. `layout`: Specifies the graph layout algorithm
   - Multiple built-in layout algorithms
   - Each layout has specific parameters
   - Can switch layouts dynamically

### Performance Optimization Configuration

1. **Rendering Optimization**

   - `textureOnViewport`: Use textures on viewport (suitable for large graphs)
   - `pixelRatio`: Control rendering resolution
   - `hideEdgesOnViewport`: Hide edges during panning

2. **Interaction Optimization**

   - `minZoom` and `maxZoom`: Limit zoom range
   - `wheelSensitivity`: Control scroll wheel sensitivity
   - `autoungrabify`: Disable node dragging
   - `autounselectify`: Disable element selection

3. **Memory Optimization**
   - Use `cy.destroy()` to clean up unused instances
   - For large graphs, consider using `headless: true` for background calculations

### Debugging and Development

1. **Development Tools**

   ```javascript
   // Access instance in console
   window.cy = cy;
   ```

2. **Event Listening**

   ```javascript
   cy.on("ready", () => {
     console.log("Graph initialization complete");
   });
   ```

3. **Error Handling**
   ```javascript
   try {
     const cy = cytoscape(options);
   } catch (error) {
     console.error("Initialization failed:", error);
   }
   ```

## Best Practices

1. **Container Setup**

   - Ensure container has clear dimensions
   - Use `position: relative`
   - Consider responsive design

2. **Initialization Timing**

   - Initialize after DOM is loaded
   - Use `DOMContentLoaded` event
   - Ensure dependencies are loaded

3. **Performance Considerations**

   - Set appropriate `minZoom` and `maxZoom`
   - Consider performance options for large graphs
   - Mind memory management and cleanup

4. **Development Tips**
   - Use browser developer tools for debugging
   - Keep code modular
   - Implement proper error handling
