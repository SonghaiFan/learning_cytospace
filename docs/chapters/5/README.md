# 5. Interaction and Event Handling

> [Online Preview](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/5-interactions-and-event-handling/index.html)

This chapter will introduce how to implement interaction control and event handling in Cytoscape.

## Basic Configuration

Initialize a graph instance with interaction options:

```javascript
const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [
    // Nodes
    { data: { id: "a", label: "Node A", weight: 75 } },
    { data: { id: "b", label: "Node B", weight: 65 } },
    { data: { id: "c", label: "Node C", weight: 85 } },
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
      selector: ":selected",
      style: {
        "background-color": "#900",
        "line-color": "#900",
        "target-arrow-color": "#900",
        "source-arrow-color": "#900",
        "text-outline-color": "#900",
        "text-outline-width": 3,
      },
    },
    {
      selector: ":active",
      style: {
        "overlay-color": "#000",
        "overlay-padding": 10,
        "overlay-opacity": 0.25,
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
  // Interaction settings
  minZoom: 0.1,
  maxZoom: 10,
  zoomingEnabled: true,
  userZoomingEnabled: true,
  panningEnabled: true,
  userPanningEnabled: true,
  boxSelectionEnabled: true,
  selectionType: "single",
  touchTapThreshold: 8,
  desktopTapThreshold: 4,
  autolock: false,
  autoungrabify: false,
  autounselectify: false,
  // Gesture settings
  wheelSensitivity: 0.1,
  pixelRatio: "auto",
});
```

## Interaction Control

### Basic Interactions

```javascript
// Zoom control
function zoomControl() {
  // Enable/disable zooming
  cy.zoomingEnabled(true);
  cy.userZoomingEnabled(true);

  // Set zoom range
  cy.minZoom(0.1);
  cy.maxZoom(10);

  // Set zoom level
  cy.zoom(2.0);

  // Get current zoom level
  const currentZoom = cy.zoom();
}

// Pan control
function panControl() {
  // Enable/disable panning
  cy.panningEnabled(true);
  cy.userPanningEnabled(true);

  // Set pan position
  cy.pan({ x: 100, y: 100 });

  // Get current pan position
  const currentPan = cy.pan();

  // Relative panning
  cy.panBy({ x: 50, y: 50 });
}

// Auto lock
function lockControl() {
  // Lock all interactions
  cy.autolock(true);

  // Lock node dragging
  cy.autoungrabify(true);

  // Lock selection
  cy.autounselectify(true);
}
```

### Selection Control

```javascript
// Selection mode
function selectionControl() {
  // Set selection type
  cy.selectionType("single"); // or "additive"

  // Enable/disable box selection
  cy.boxSelectionEnabled(true);

  // Selection operations
  cy.elements().select();
  cy.elements().unselect();

  // Get selected elements
  const selected = cy.$(":selected");

  // Select specific elements
  cy.$("#nodeId").select();

  // Selection filter
  cy.$("node[weight > 70]").select();
}

// Drag control
function dragControl() {
  // Set draggable
  cy.nodes().grabifiable(true);

  // Set selectable
  cy.nodes().selectifiable(true);

  // Lock position
  cy.nodes().locked(true);

  // Custom drag behavior
  cy.nodes().on("drag", function (evt) {
    const node = evt.target;
    const pos = node.position();
    // Limit drag range
    if (pos.x < 0) node.position({ x: 0, y: pos.y });
    if (pos.y < 0) node.position({ x: pos.x, y: 0 });
  });
}
```

## Event System

### Event Types

```javascript
// Element events
function elementEvents() {
  // Click event
  cy.on("tap", "node", function (evt) {
    const node = evt.target;
    const position = evt.position; // Relative to viewport
    const renderedPosition = evt.renderedPosition; // Relative to screen
    console.log("Click node:", node.id(), position, renderedPosition);
  });

  // Double click event
  cy.on("dbltap", "node", function (evt) {
    console.log("Double click node:", evt.target.id());
  });

  // Right click event
  cy.on("cxttap", "node", function (evt) {
    console.log("Right click:", evt.target.id());
  });

  // Mouse events
  cy.on("mouseover", "node", function (evt) {
    evt.target.addClass("highlighted");
  });

  cy.on("mouseout", "node", function (evt) {
    evt.target.removeClass("highlighted");
  });

  // Drag events
  cy.on("dragstart", "node", function (evt) {
    console.log("Start dragging:", evt.target.id());
  });

  cy.on("drag", "node", function (evt) {
    console.log("Dragging:", evt.target.position());
  });

  cy.on("dragfree", "node", function (evt) {
    console.log("End dragging:", evt.target.position());
  });
}

// View events
function viewEvents() {
  // Zoom event
  cy.on("zoom", function (evt) {
    console.log("Zoom level:", cy.zoom());
  });

  // Pan event
  cy.on("pan", function (evt) {
    console.log("Pan position:", cy.pan());
  });

  // Viewport adjustment
  cy.on("viewport", function (evt) {
    console.log("Viewport change:", {
      zoom: cy.zoom(),
      pan: cy.pan(),
    });
  });
}

// Layout events
function layoutEvents() {
  cy.on("layoutstart", function (evt) {
    console.log("Layout start");
  });

  cy.on("layoutready", function (evt) {
    console.log("Layout ready");
  });

  cy.on("layoutstop", function (evt) {
    console.log("Layout complete");
  });
}
```

### Event Handling

```javascript
// Event delegation
function eventDelegation() {
  // Use selector delegation
  cy.on("tap", "node[weight > 70]", function (evt) {
    console.log("Click large node:", evt.target.id());
  });

  // Namespace
  cy.on("tap.namespace", "node", function (evt) {
    console.log("Namespace event");
  });

  // Remove specific namespace events
  cy.off("tap.namespace");
}

// Event data
function eventData() {
  // Pass data
  cy.on("tap", "node", { customData: "value" }, function (evt) {
    console.log("Custom data:", evt.data.customData);
  });

  // Event object properties
  cy.on("tap", "node", function (evt) {
    console.log({
      type: evt.type,
      target: evt.target,
      timeStamp: evt.timeStamp,
      position: evt.position,
      renderedPosition: evt.renderedPosition,
      originalEvent: evt.originalEvent,
    });
  });
}
```

### Gesture Recognition

```javascript
// Custom gestures
function gestureRecognition() {
  let startPosition;
  let gestureTimeout;

  // Start gesture
  cy.on("tapstart", "node", function (evt) {
    startPosition = evt.position;
    gestureTimeout = setTimeout(() => {
      if (startPosition) {
        console.log("Long press gesture");
      }
    }, 1000);
  });

  // Move gesture
  cy.on("tapdrag", "node", function (evt) {
    if (startPosition) {
      const currentPosition = evt.position;
      const dx = currentPosition.x - startPosition.x;
      const dy = currentPosition.y - startPosition.y;

      // Determine gesture direction
      if (Math.abs(dx) > Math.abs(dy)) {
        console.log("Horizontal swipe");
      } else {
        console.log("Vertical swipe");
      }
    }
  });

  // End gesture
  cy.on("tapend", "node", function () {
    clearTimeout(gestureTimeout);
    startPosition = null;
  });
}
```

## Key Concepts Explanation

1. **Interaction Configuration**

   - **Zoom Settings**

     - `minZoom`, `maxZoom`: Zoom range
     - `zoomingEnabled`: Whether to allow zooming
     - `wheelSensitivity`: Wheel sensitivity

   - **Pan Settings**

     - `panningEnabled`: Whether to allow panning
     - `userPanningEnabled`: Whether to allow user panning
     - `boxSelectionEnabled`: Whether to allow box selection

   - **Selection Settings**
     - `selectionType`: Selection mode
     - `autoungrabify`: Disable dragging
     - `autounselectify`: Disable selection

2. **Event System**

   - **Event Types**

     - Element events: tap, dbltap, mouseover, mouseout
     - View events: zoom, pan, viewport
     - Layout events: layoutstart, layoutready, layoutstop

   - **Event Properties**

     - `type`: Event type
     - `target`: Target element
     - `position`: Event position
     - `timeStamp`: Timestamp

   - **Event Handling**
     - Event delegation
     - Namespace
     - Event data passing

3. **Gesture System**

   - **Basic Gestures**

     - Tap (tap)
     - Double tap (dbltap)
     - Long press (taphold)
     - Swipe (swipe)

   - **Compound Gestures**

     - Pinch zoom
     - Rotate
     - Multi-touch

   - **Gesture Configuration**
     - `touchTapThreshold`
     - `desktopTapThreshold`
     - `tapHoldDuration`

4. **Performance Optimization**

   - Use event delegation
   - Set reasonable event handlers
   - Avoid frequent event handling
   - Use throttling and debouncing
   - Optimize gesture recognition

## Example: Implementing Custom Interactions

```javascript
// Double click node to expand/collapse
cy.on("dblclick", "node", function (evt) {
  const node = evt.target;
  const neighborhood = node.neighborhood();

  if (node.data("expanded")) {
    neighborhood.style("display", "none");
    node.data("expanded", false);
  } else {
    neighborhood.style("display", "element");
    node.data("expanded", true);
  }
});
```
