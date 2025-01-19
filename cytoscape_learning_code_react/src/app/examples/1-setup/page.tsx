"use client";

import { CytoscapeGraph } from "@/components/CytoscapeGraph";
import { ExampleLayout } from "@/components/ExampleLayout";
import { ExampleSection } from "@/components/ExampleSection";
import { Stylesheet } from "cytoscape";

export default function SetupExample() {
  // 定义图的元素
  const elements = [
    // 节点
    { data: { id: "a", label: "Node A" } },
    { data: { id: "b", label: "Node B" } },
    { data: { id: "c", label: "Node C" } },
    // 边
    { data: { id: "ab", source: "a", target: "b", label: "Edge AB" } },
    { data: { id: "bc", source: "b", target: "c", label: "Edge BC" } },
  ];

  // 定义样式
  const style: Stylesheet[] = [
    {
      selector: "node",
      style: {
        backgroundColor: "#666",
        label: "data(label)",
        textValign: "center",
        textHalign: "center",
        width: 60,
        height: 60,
      } as any,
    },
    {
      selector: "edge",
      style: {
        width: 3,
        lineColor: "#ccc",
        targetArrowColor: "#ccc",
        targetArrowShape: "triangle",
        curveStyle: "bezier",
        label: "data(label)",
      } as any,
    },
  ];

  return (
    <ExampleLayout
      title="环境搭建与初始化"
      description="本章介绍如何在 React 项目中集成和初始化 Cytoscape.js"
    >
      <ExampleSection title="基本示例">
        <p className="text-gray-600 mb-4">
          这是一个简单的 Cytoscape.js 图实例，展示了基本的节点和边的创建。
        </p>
        <CytoscapeGraph
          elements={elements}
          cytoStyle={style}
          layout={{ name: "grid" }}
          divStyle={{ height: "500px", width: "100%" }}
        />
      </ExampleSection>
    </ExampleLayout>
  );
}
