"use client";

import { useState, useCallback, useRef } from "react";
import { CytoscapeGraph } from "@/components/CytoscapeGraph";
import { ExampleLayout } from "@/components/ExampleLayout";
import { ExampleSection } from "@/components/ExampleSection";
import { ElementDefinition, Stylesheet, Core } from "cytoscape";

/**
 * 样式与动画示例
 *
 * 这个示例展示了 Cytoscape.js 的样式和动画功能：
 * 1. 节点样式：不同形状、颜色、大小
 * 2. 边样式：实线、虚线、点线
 * 3. 交互样式：悬停、选中效果
 * 4. 动画效果：大小、颜色变化
 */
export default function StyleExample() {
  // Cytoscape 实例引用
  const cyRef = useRef<Core | null>(null);

  // 示例数据
  const elements: ElementDefinition[] = [
    // 节点
    { data: { id: "a", label: "Node A", type: "circle" } },
    { data: { id: "b", label: "Node B", type: "rectangle" } },
    { data: { id: "c", label: "Node C", type: "diamond" } },
    { data: { id: "d", label: "Node D", type: "circle" } },
    { data: { id: "e", label: "Node E", type: "rectangle" } },
    // 边
    { data: { id: "ab", source: "a", target: "b", type: "solid" } },
    { data: { id: "bc", source: "b", target: "c", type: "dashed" } },
    { data: { id: "cd", source: "c", target: "d", type: "dotted" } },
    { data: { id: "de", source: "d", target: "e", type: "solid" } },
    { data: { id: "ea", source: "e", target: "a", type: "dashed" } },
  ];

  // 基础样式
  const baseStyles: Stylesheet[] = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        textValign: "center",
        textHalign: "center",
        width: 50,
        height: 50,
        fontSize: "12px",
        fontFamily: "Arial",
        textOutlineWidth: 2,
        textOutlineColor: "#fff",
      } as any,
    },
    {
      selector: "edge",
      style: {
        width: 2,
        targetArrowShape: "triangle",
        curveStyle: "bezier",
        label: "data(type)",
        fontSize: "10px",
        textBackgroundColor: "#fff",
        textBackgroundOpacity: 1,
        textBackgroundPadding: "2px",
      } as any,
    },
  ];

  // 节点形状样式
  const nodeShapeStyles: Stylesheet[] = [
    {
      selector: 'node[type="circle"]',
      style: {
        shape: "ellipse",
        backgroundColor: "#4CAF50",
        textOutlineColor: "#E8F5E9",
      } as any,
    },
    {
      selector: 'node[type="rectangle"]',
      style: {
        shape: "rectangle",
        backgroundColor: "#2196F3",
        textOutlineColor: "#E3F2FD",
      } as any,
    },
    {
      selector: 'node[type="diamond"]',
      style: {
        shape: "diamond",
        backgroundColor: "#FFC107",
        textOutlineColor: "#FFF8E1",
      } as any,
    },
  ];

  // 边样式
  const edgeStyles: Stylesheet[] = [
    {
      selector: 'edge[type="solid"]',
      style: {
        lineStyle: "solid",
        lineColor: "#666",
        targetArrowColor: "#666",
      } as any,
    },
    {
      selector: 'edge[type="dashed"]',
      style: {
        lineStyle: "dashed",
        lineColor: "#999",
        targetArrowColor: "#999",
        lineDashPattern: [6, 3],
      } as any,
    },
    {
      selector: 'edge[type="dotted"]',
      style: {
        lineStyle: "dotted",
        lineColor: "#BBB",
        targetArrowColor: "#BBB",
      } as any,
    },
  ];

  // 悬停样式
  const hoverStyles: Stylesheet[] = [
    {
      selector: "node:hover",
      style: {
        backgroundColor: "#E91E63",
        width: 60,
        height: 60,
        fontSize: "14px",
        textOutlineColor: "#FCE4EC",
        borderWidth: 2,
        borderColor: "#E91E63",
        borderOpacity: 0.5,
        transition: "all 0.3s",
      } as any,
    },
    {
      selector: "edge:hover",
      style: {
        width: 4,
        lineColor: "#E91E63",
        targetArrowColor: "#E91E63",
        fontSize: "12px",
        transition: "all 0.3s",
      } as any,
    },
    {
      selector: "node:hover > node",
      style: {
        backgroundColor: "#EC407A",
        transition: "all 0.3s",
      } as any,
    },
  ];

  // 选中样式
  const selectedStyles: Stylesheet[] = [
    {
      selector: ":selected",
      style: {
        backgroundColor: "#9C27B0",
        lineColor: "#9C27B0",
        targetArrowColor: "#9C27B0",
        width: 70,
        height: 70,
        fontSize: "16px",
        textOutlineColor: "#F3E5F5",
        borderWidth: 3,
        borderColor: "#9C27B0",
        borderOpacity: 0.8,
        boxShadow: "0 0 15px rgba(156, 39, 176, 0.5)",
        transition: "all 0.3s",
      } as any,
    },
  ];

  // 合并所有样式
  const [style, setStyle] = useState<Stylesheet[]>([
    ...baseStyles,
    ...nodeShapeStyles,
    ...edgeStyles,
    ...hoverStyles,
    ...selectedStyles,
  ]);

  // 动画效果
  const animate = useCallback(() => {
    if (!cyRef.current) return;

    // 节点动画
    cyRef.current.nodes().forEach((node) => {
      // 第一阶段：放大并改变颜色
      node
        .animate({
          style: {
            width: 100,
            height: 100,
            backgroundColor: "#FF5722",
            borderWidth: 4,
            borderColor: "#FF5722",
            borderOpacity: 0.5,
          },
          duration: 1000,
          easing: "ease-in-out",
        })
        .animate({
          // 第二阶段：恢复原始状态
          style: {
            width: 50,
            height: 50,
            backgroundColor:
              node.data("type") === "circle"
                ? "#4CAF50"
                : node.data("type") === "rectangle"
                ? "#2196F3"
                : "#FFC107",
            borderWidth: 0,
          },
          duration: 1000,
          easing: "ease-in-out",
        });
    });

    // 边动画
    cyRef.current.edges().forEach((edge) => {
      // 第一阶段：加粗并改变颜色
      edge
        .animate({
          style: {
            width: 6,
            lineColor: "#FF5722",
            targetArrowColor: "#FF5722",
          },
          duration: 1000,
          easing: "ease-in-out",
        })
        .animate({
          // 第二阶段：恢复原始状态
          style: {
            width: 2,
            lineColor:
              edge.data("type") === "solid"
                ? "#666"
                : edge.data("type") === "dashed"
                ? "#999"
                : "#BBB",
            targetArrowColor:
              edge.data("type") === "solid"
                ? "#666"
                : edge.data("type") === "dashed"
                ? "#999"
                : "#BBB",
          },
          duration: 1000,
          easing: "ease-in-out",
        });
    });
  }, []);

  // 初始化事件处理
  const handleCytoscapeInit = useCallback((cy: Core) => {
    cyRef.current = cy;

    // 添加节点点击事件
    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      console.log("Clicked node:", node.id(), node.data());
    });

    // 添加边点击事件
    cy.on("tap", "edge", (evt) => {
      const edge = evt.target;
      console.log("Clicked edge:", edge.id(), edge.data());
    });

    // 添加选择事件
    cy.on("select", (evt) => {
      const ele = evt.target;
      console.log("Selected element:", ele.id(), ele.data());
    });

    // 添加取消选择事件
    cy.on("unselect", (evt) => {
      const ele = evt.target;
      console.log("Unselected element:", ele.id());
    });

    // 启用节点拖拽功能
    cy.nodes().ungrabify(); // 先禁用以重置状态
    cy.nodes().grabify(); // 然后启用
  }, []);

  return (
    <ExampleLayout
      title="样式与动画"
      description="本章介绍 Cytoscape.js 的样式和动画功能，包括节点样式、边样式、交互效果和动画效果"
    >
      <ExampleSection title="样式演示">
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={animate}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              播放动画
            </button>
          </div>
        </div>

        <CytoscapeGraph
          elements={elements}
          cytoStyle={style}
          layout={{ name: "circle", padding: 50 }}
          divStyle={{ height: "500px", width: "100%" }}
          onCytoscapeInit={handleCytoscapeInit}
        />
      </ExampleSection>

      <ExampleSection title="功能说明">
        <div className="prose max-w-none">
          <h3 className="text-lg font-medium mb-2">节点样式</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>圆形节点（绿色）：基础形状，带有文本轮廓</li>
            <li>矩形节点（蓝色）：方形边界，带有文本轮廓</li>
            <li>菱形节点（黄色）：多边形形状，带有文本轮廓</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">边样式</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>实线（深灰色）：标准连接，带有箭头</li>
            <li>虚线（中灰色）：次要连接，自定义虚线模式</li>
            <li>点线（浅灰色）：弱连接，带有标签背景</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">交互效果</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>悬停效果：元素放大、颜色变化、文本增大，带有平滑过渡</li>
            <li>选中效果：元素进一步放大、颜色加深、添加阴影，带有平滑过渡</li>
            <li>动画效果：点击按钮触发整体动画，包括大小和颜色的变化</li>
            <li>所有样式变化都带有平滑过渡效果</li>
            <li>支持节点拖拽，边会自动跟随调整</li>
          </ul>
        </div>
      </ExampleSection>
    </ExampleLayout>
  );
}
