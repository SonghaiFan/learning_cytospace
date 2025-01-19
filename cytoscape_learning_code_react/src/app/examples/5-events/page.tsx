"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CytoscapeGraph } from "@/components/CytoscapeGraph";
import { ExampleLayout } from "@/components/ExampleLayout";
import { ExampleSection } from "@/components/ExampleSection";
import { ElementDefinition, Stylesheet, Core } from "cytoscape";

/**
 * 交互与事件处理示例
 *
 * 这个示例展示了 Cytoscape.js 的各种交互功能和事件处理：
 * 1. 基础交互：点击、选择、拖拽
 * 2. 交互控制：启用/禁用缩放、平移、框选等
 * 3. 选择操作：全选、取消选择、反选
 * 4. 事件监听与日志记录
 */
export default function EventsExample() {
  // 事件日志状态
  const [eventLogs, setEventLogs] = useState<string[]>([]);

  // 使用 useRef 来存储 Cytoscape 实例，避免重复绑定事件
  const cyRef = useRef<Core | null>(null);
  const isInitialized = useRef(false);

  // 集中的日志处理逻辑
  const handleLog = useCallback((type: string, detail: string) => {
    const logMessages = {
      nodeClick: (d: string) => `点击节点: ${d}`,
      edgeClick: (d: string) => `点击边: ${d}`,
      select: (d: string) => `选择元素: ${d}`,
      unselect: (d: string) => `取消选择: ${d}`,
      hover: (d: string) => `鼠标悬停: ${d}`,
      drag: (d: string) => `节点拖拽结束: ${d}`,
      zoom: (d: string) => `缩放级别: ${d}`,
      pan: (d: string) => `画布平移: ${d}`,
      control: (d: string) => d,
    };

    const message =
      logMessages[type as keyof typeof logMessages]?.(detail) || detail;
    setEventLogs((prev) => [
      `${new Date().toLocaleTimeString()} - ${message}`,
      ...prev.slice(0, 49),
    ]);
  }, []);

  // 交互控制状态
  const [isZoomEnabled, setIsZoomEnabled] = useState(true);
  const [isPanEnabled, setIsPanEnabled] = useState(true);
  const [isBoxSelectionEnabled, setIsBoxSelectionEnabled] = useState(true);
  const [isGrabEnabled, setIsGrabEnabled] = useState(true);

  // 初始化 Cytoscape 事件处理
  const handleCytoscapeInit = useCallback(
    (cy: Core) => {
      if (isInitialized.current) return;
      cyRef.current = cy;
      isInitialized.current = true;

      // 点击事件
      const tapNodeHandler = (evt: any) => {
        const node = evt.target;
        handleLog("nodeClick", node.data("label"));
      };

      const tapEdgeHandler = (evt: any) => {
        const edge = evt.target;
        handleLog("edgeClick", edge.data("label"));
      };

      const selectHandler = (evt: any) => {
        const ele = evt.target;
        handleLog("select", ele.data("label"));
      };

      const unselectHandler = (evt: any) => {
        const ele = evt.target;
        handleLog("unselect", ele.data("label"));
      };

      const mouseoverHandler = (evt: any) => {
        const ele = evt.target;
        handleLog("hover", ele.data("label"));
        if (ele.isNode()) {
          ele.style({
            "border-width": 3,
            "border-color": "#d32f2f",
            "font-size": "14px",
            "z-index": 999,
          });
          ele.neighborhood().nodes().style({
            "border-width": 2,
            "border-color": "#d32f2f",
          });
          ele.connectedEdges().style({
            "line-color": "#d32f2f",
            "target-arrow-color": "#d32f2f",
            width: 3,
          });
        }
      };

      const mouseoutHandler = (evt: any) => {
        const ele = evt.target;
        ele.removeStyle("border-width border-color font-size z-index");
        ele.neighborhood().nodes().removeStyle("border-width border-color");
        ele.connectedEdges().removeStyle("line-color target-arrow-color width");
      };

      const dragfreeHandler = (evt: any) => {
        const node = evt.target;
        const pos = node.position();
        handleLog(
          "drag",
          `${node.data("label")} (${Math.round(pos.x)}, ${Math.round(pos.y)})`
        );
      };

      const zoomHandler = () => {
        handleLog("zoom", `${Math.round(cy.zoom() * 100) / 100}`);
      };

      const panHandler = () => {
        const pan = cy.pan();
        handleLog("pan", `(${Math.round(pan.x)}, ${Math.round(pan.y)})`);
      };

      // 绑定事件
      cy.on("tap", "node", tapNodeHandler);
      cy.on("tap", "edge", tapEdgeHandler);
      cy.on("select", "node, edge", selectHandler);
      cy.on("unselect", "node, edge", unselectHandler);
      cy.on("mouseover", "node, edge", mouseoverHandler);
      cy.on("mouseout", "node", mouseoutHandler);
      cy.on("dragfree", "node", dragfreeHandler);
      cy.on("zoom", zoomHandler);
      cy.on("pan", panHandler);

      // 启用节点拖拽功能
      cy.nodes().grabify();

      // 清理函数
      return () => {
        if (cy) {
          cy.off("tap", "node", tapNodeHandler);
          cy.off("tap", "edge", tapEdgeHandler);
          cy.off("select", "node, edge", selectHandler);
          cy.off("unselect", "node, edge", unselectHandler);
          cy.off("mouseover", "node, edge", mouseoverHandler);
          cy.off("mouseout", "node", mouseoutHandler);
          cy.off("dragfree", "node", dragfreeHandler);
          cy.off("zoom", zoomHandler);
          cy.off("pan", panHandler);
        }
      };
    },
    [handleLog]
  );

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      isInitialized.current = false;
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  // 交互控制函数
  const toggleZoom = useCallback(() => {
    if (cyRef.current) {
      const newState = !isZoomEnabled;
      cyRef.current.userZoomingEnabled(newState);
      setIsZoomEnabled(newState);
      handleLog("control", `缩放功能已${newState ? "启用" : "禁用"}`);
    }
  }, [isZoomEnabled, handleLog]);

  const togglePan = useCallback(() => {
    if (cyRef.current) {
      const newState = !isPanEnabled;
      cyRef.current.userPanningEnabled(newState);
      setIsPanEnabled(newState);
      handleLog("control", `平移功能已${newState ? "启用" : "禁用"}`);
    }
  }, [isPanEnabled, handleLog]);

  const toggleBoxSelection = useCallback(() => {
    if (cyRef.current) {
      const newState = !isBoxSelectionEnabled;
      cyRef.current.boxSelectionEnabled(newState);
      setIsBoxSelectionEnabled(newState);
      handleLog("control", `框选功能已${newState ? "启用" : "禁用"}`);
    }
  }, [isBoxSelectionEnabled, handleLog]);

  const toggleGrab = useCallback(() => {
    if (cyRef.current) {
      const newState = !isGrabEnabled;
      if (newState) {
        cyRef.current.nodes().grabify();
      } else {
        cyRef.current.nodes().ungrabify();
      }
      setIsGrabEnabled(newState);
      handleLog("control", `节点拖拽功能已${newState ? "启用" : "禁用"}`);
    }
  }, [isGrabEnabled, handleLog]);

  // 选择操作函数
  const selectAll = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.elements().select();
      handleLog("control", "已选择所有元素");
    }
  }, [handleLog]);

  const unselectAll = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.elements().unselect();
      handleLog("control", "已取消所有选择");
    }
  }, [handleLog]);

  const invertSelection = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.elements().forEach((ele) => {
        if (ele.selected()) {
          ele.unselect();
        } else {
          ele.select();
        }
      });
      handleLog("control", "已反选所有元素");
    }
  }, [handleLog]);

  // 示例数据
  const elements: ElementDefinition[] = [
    // 节点
    { data: { id: "a", label: "节点 A" } },
    { data: { id: "b", label: "节点 B" } },
    { data: { id: "c", label: "节点 C" } },
    { data: { id: "d", label: "节点 D" } },
    { data: { id: "e", label: "节点 E" } },
    // 边
    { data: { id: "ab", source: "a", target: "b", label: "边 AB" } },
    { data: { id: "bc", source: "b", target: "c", label: "边 BC" } },
    { data: { id: "cd", source: "c", target: "d", label: "边 CD" } },
    { data: { id: "de", source: "d", target: "e", label: "边 DE" } },
    { data: { id: "ea", source: "e", target: "a", label: "边 EA" } },
  ];

  // 样式定义
  const style: Stylesheet[] = [
    {
      selector: "node",
      style: {
        backgroundColor: "#666",
        label: "data(label)",
        fontSize: "12px",
        textValign: "center",
        textHalign: "center",
      } as any,
    },
    {
      selector: "edge",
      style: {
        width: 2,
        lineColor: "#999",
        targetArrowColor: "#999",
        targetArrowShape: "triangle",
        curveStyle: "bezier",
        label: "data(label)",
      } as any,
    },
    {
      selector: ":selected",
      style: {
        backgroundColor: "#d32f2f",
        lineColor: "#d32f2f",
        targetArrowColor: "#d32f2f",
      } as any,
    },
    {
      selector: ":active",
      style: {
        overlayColor: "#000",
        overlayPadding: 10,
        overlayOpacity: 0.25,
      } as any,
    },
  ];

  return (
    <ExampleLayout
      title="交互与事件处理"
      description="本章介绍 Cytoscape.js 的交互功能和事件处理，包括基础交互、交互控制、选择操作和事件监听"
    >
      <ExampleSection title="交互控制">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={toggleZoom}
          >
            {isZoomEnabled ? "禁用" : "启用"}缩放
          </button>
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={togglePan}
          >
            {isPanEnabled ? "禁用" : "启用"}平移
          </button>
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={toggleBoxSelection}
          >
            {isBoxSelectionEnabled ? "禁用" : "启用"}框选
          </button>
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={toggleGrab}
          >
            {isGrabEnabled ? "禁用" : "启用"}拖拽
          </button>
        </div>
      </ExampleSection>

      <ExampleSection title="选择操作">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={selectAll}
          >
            全选
          </button>
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={unselectAll}
          >
            取消选择
          </button>
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={invertSelection}
          >
            反选
          </button>
        </div>
      </ExampleSection>

      <ExampleSection>
        <CytoscapeGraph
          elements={elements}
          cytoStyle={style}
          layout={{ name: "circle", padding: 50 }}
          divStyle={{ height: "500px", width: "100%" }}
          onCytoscapeInit={handleCytoscapeInit}
        />
      </ExampleSection>

      <ExampleSection title="事件日志">
        <div className="h-[200px] w-full rounded-md border p-4 overflow-y-auto">
          {eventLogs.map((log, index) => (
            <div
              key={index}
              className="text-sm font-mono text-gray-600 hover:bg-gray-50 p-1"
            >
              {log}
            </div>
          ))}
        </div>
      </ExampleSection>
    </ExampleLayout>
  );
}
