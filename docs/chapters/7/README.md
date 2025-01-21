# 7. Data Import and Export

> [Online Preview](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/7-data-import-export/index.html)

This chapter will introduce how to implement data import and export functionality in Cytoscape.js.

## Basic Configuration

Initialize a graph instance with sample nodes and edges:

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [
    // Nodes
    { data: { id: "a", label: "Node A", weight: 75 } },
    { data: { id: "b", label: "Node B", weight: 65 } },
    { data: { id: "c", label: "Node C", weight: 85 } },
    // Compound node
    {
      data: { id: "compound", label: "Compound", weight: 80 },
      children: ["a", "b"],
    },
    // Edges
    {
      data: {
        id: "ab",
        source: "a",
        target: "b",
        label: "Edge AB",
        weight: 1,
      },
    },
    {
      data: {
        id: "bc",
        source: "b",
        target: "c",
        label: "Edge BC",
        weight: 2,
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
        label: "data(label)",
      },
    },
    {
      selector: ":parent",
      style: {
        "background-opacity": 0.333,
        "background-color": "#666",
        "border-color": "#666",
        "border-width": 3,
        "border-opacity": 0.5,
      },
    },
  ],
  layout: { name: "circle" },
});
```

## Data Export

### JSON Export

```javascript
// Export graph data as JSON
function exportJSON(type = "elements") {
  let data;

  // Export different types of data
  switch (type) {
    case "elements":
      // Export elements only
      data = cy.elements().jsons();
      break;
    case "style":
      // Export style only
      data = cy.style().json();
      break;
    case "layout":
      // Export layout only
      data = cy.layout().options;
      break;
    case "full":
      // Export full graph data
      data = {
        elements: cy.elements().jsons(),
        style: cy.style().json(),
        layout: cy.layout().options,
        zoom: cy.zoom(),
        pan: cy.pan(),
      };
      break;
    default:
      throw new Error("Invalid export type");
  }

  // Convert to JSON string with formatting
  const jsonString = JSON.stringify(data, null, 2);

  // Create download link
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cytoscape-export-${type}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return data;
}
```

### CSV Export

```javascript
// Export graph data as CSV
function exportCSV(type = "nodes") {
  let csvContent = "";
  let data = [];

  // Export different types of data
  switch (type) {
    case "nodes":
      // Get node data
      data = cy.nodes().map((node) => ({
        id: node.id(),
        label: node.data("label"),
        weight: node.data("weight"),
        parent: node.data("parent") || "",
        degree: node.degree(),
        position: `${node.position("x")},${node.position("y")}`,
      }));
      break;
    case "edges":
      // Get edge data
      data = cy.edges().map((edge) => ({
        id: edge.id(),
        source: edge.data("source"),
        target: edge.data("target"),
        label: edge.data("label"),
        weight: edge.data("weight"),
      }));
      break;
    default:
      throw new Error("Invalid export type");
  }

  if (data.length > 0) {
    // Add headers
    const headers = Object.keys(data[0]);
    csvContent += headers.join(",") + "\n";

    // Add data rows
    data.forEach((item) => {
      const row = headers
        .map((header) => {
          const value = item[header];
          // Escape commas and quotes
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        })
        .join(",");
      csvContent += row + "\n";
    });
  }

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cytoscape-export-${type}-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return data;
}
```

### Image Export

```javascript
// Export graph as image
function exportImage(options = {}) {
  const defaults = {
    type: "png", // 'png', 'jpg', or 'svg'
    quality: 1.0, // Image quality (0.0 to 1.0)
    scale: 1.0, // Image scale
    full: false, // Export full graph or visible area
    bg: "#ffffff", // Background color
  };

  const settings = { ...defaults, ...options };

  // Get image data URL
  const imageData = cy.png({
    output: settings.type,
    quality: settings.quality,
    scale: settings.scale,
    full: settings.full,
    bg: settings.bg,
  });

  // Create download link
  const link = document.createElement("a");
  link.href = imageData;
  link.download = `cytoscape-export-${Date.now()}.${settings.type}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

## Data Import

### JSON Import

```javascript
// Import graph data from JSON
async function importJSON(file, type = "elements") {
  try {
    // Read file content
    const content = await readFile(file);
    const data = JSON.parse(content);

    // Import different types of data
    switch (type) {
      case "elements":
        // Import elements only
        cy.elements().remove();
        cy.add(data);
        break;
      case "style":
        // Import style only
        cy.style(data);
        break;
      case "layout":
        // Import and run layout
        cy.layout(data).run();
        break;
      case "full":
        // Import full graph data
        cy.elements().remove();
        cy.add(data.elements);
        cy.style(data.style);
        cy.layout(data.layout).run();
        cy.zoom(data.zoom);
        cy.pan(data.pan);
        break;
      default:
        throw new Error("Invalid import type");
    }

    return true;
  } catch (error) {
    console.error("Error importing JSON:", error);
    return false;
  }
}

// Helper function to read file
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}
```

### CSV Import

```javascript
// Import graph data from CSV
async function importCSV(nodesFile, edgesFile) {
  try {
    // Read files content
    const [nodesContent, edgesContent] = await Promise.all([
      readFile(nodesFile),
      readFile(edgesFile),
    ]);

    // Parse CSV data
    const nodes = parseCSV(nodesContent);
    const edges = parseCSV(edgesContent);

    // Convert to Cytoscape.js format
    const elements = {
      nodes: nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          weight: parseFloat(node.weight),
          parent: node.parent || undefined,
        },
        position: node.position
          ? {
              x: parseFloat(node.position.split(",")[0]),
              y: parseFloat(node.position.split(",")[1]),
            }
          : undefined,
      })),
      edges: edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          weight: parseFloat(edge.weight),
        },
      })),
    };

    // Update graph
    cy.elements().remove();
    cy.add(elements);

    return true;
  } catch (error) {
    console.error("Error importing CSV:", error);
    return false;
  }
}

// Helper function to parse CSV
function parseCSV(content) {
  const lines = content.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const values = line.split(",").map((v) => v.trim());
      const item = {};
      headers.forEach((header, index) => {
        // Remove quotes if present
        let value = values[index].replace(/^"(.*)"$/, "$1");
        item[header] = value;
      });
      data.push(item);
    }
  }

  return data;
}
```

## Key Concepts Explanation

1. **Data Formats**

   - **JSON Format**

     - Elements (nodes and edges)
     - Style definitions
     - Layout options
     - Graph state (zoom, pan)

   - **CSV Format**

     - Node attributes
     - Edge attributes
     - Data validation

   - **Image Format**
     - PNG/JPG/SVG support
     - Quality and scale options
     - Background settings

2. **Export Features**

   - **JSON Export**

     - Selective data export
     - Formatted output
     - Download handling

   - **CSV Export**

     - Headers generation
     - Data formatting
     - Special character handling

   - **Image Export**
     - Multiple formats
     - Quality control
     - View options

3. **Import Features**

   - **JSON Import**

     - Data validation
     - Graph state restoration
     - Error handling

   - **CSV Import**
     - File parsing
     - Data conversion
     - Type handling

4. **Performance Optimization**

   - Batch processing for large datasets
   - Memory management
   - Asynchronous operations
   - Error recovery

5. **Best Practices**

   - Data validation
   - Error handling
   - Progress feedback
   - Memory cleanup

## Example: Complete Import/Export Interface

```javascript
// Create import/export interface
function createDataInterface() {
  // Export buttons
  const exportButtons = {
    json: {
      label: "Export JSON",
      handler: () => exportJSON("full"),
    },
    nodes: {
      label: "Export Nodes CSV",
      handler: () => exportCSV("nodes"),
    },
    edges: {
      label: "Export Edges CSV",
      handler: () => exportCSV("edges"),
    },
    png: {
      label: "Export PNG",
      handler: () => exportImage({ type: "png", full: true }),
    },
  };

  // Import handlers
  const importHandlers = {
    json: async (file) => {
      const success = await importJSON(file, "full");
      console.log(success ? "JSON import successful" : "JSON import failed");
    },
    csv: async (nodesFile, edgesFile) => {
      const success = await importCSV(nodesFile, edgesFile);
      console.log(success ? "CSV import successful" : "CSV import failed");
    },
  };

  // Create UI elements
  Object.entries(exportButtons).forEach(([key, { label, handler }]) => {
    const button = document.createElement("button");
    button.textContent = label;
    button.onclick = handler;
    document.body.appendChild(button);
  });

  // File input handlers
  const jsonInput = document.createElement("input");
  jsonInput.type = "file";
  jsonInput.accept = ".json";
  jsonInput.onchange = (e) => importHandlers.json(e.target.files[0]);

  const csvInput = document.createElement("input");
  csvInput.type = "file";
  csvInput.accept = ".csv";
  csvInput.multiple = true;
  csvInput.onchange = (e) =>
    importHandlers.csv(e.target.files[0], e.target.files[1]);

  document.body.appendChild(jsonInput);
  document.body.appendChild(csvInput);
}
```
