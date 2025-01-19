"use client";

import { useState, useCallback, useRef } from "react";
import { CytoscapeGraph } from "@/components/CytoscapeGraph";
import { ExampleLayout } from "@/components/ExampleLayout";
import { ExampleSection } from "@/components/ExampleSection";
import { ElementDefinition, Stylesheet, Core } from "cytoscape";

export default function ElementsExample() {
  // 初始元素
  const [elements, setElements] = useState<ElementDefinition[]>([
    // 节点
    { data: { id: "a", label: "Node A" } },
    { data: { id: "b", label: "Node B" } },
    { data: { id: "c", label: "Node C" } },
    // 边
    { data: { id: "ab", source: "a", target: "b", label: "Edge AB" } },
  ]);

  const cyRef = useRef<any>(null);

  // 样式定义
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
    {
      selector: ":selected",
      style: {
        "background-color": "#900",
        "line-color": "#900",
        "target-arrow-color": "#900",
      },
    },
  ];

  // 添加节点
  const addNode = () => {
    const newId = `n${elements.length}`;
    setElements([
      ...elements,
      { data: { id: newId, label: `Node ${newId.toUpperCase()}` } },
    ]);
  };

  // 添加边
  const addEdge = () => {
    if (!cyRef.current) return;

    // 获取选中的节点
    const selectedNodes = cyRef.current
      .nodes(":selected")
      .map((node: any) => node.data());

    if (selectedNodes.length !== 2) {
      console.log(selectedNodes);
      alert("请先选择两个节点");
      return;
    }

    const [source, target] = selectedNodes;
    const newEdgeId = `e${elements.filter((ele) => ele.data.source).length}`;

    const newEdge: ElementDefinition = {
      data: {
        id: newEdgeId,
        source: source.id,
        target: target.id,
        label: `Edge ${source.id}-${target.id}`,
      },
    };

    setElements((prev) => [...prev, newEdge]);
  };

  // 删除最后一个元素
  const removeLastElement = () => {
    setElements((prev) => prev.slice(0, -1));
  };

  return (
    <ExampleLayout
      title="节点与边的基础操作"
      description="本章介绍如何在 Cytoscape.js 中进行元素的增删改查操作"
    >
      <ExampleSection title="图形演示">
        <div className="flex gap-4 mb-4">
          <button
            onClick={addNode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            添加节点
          </button>
          <button
            onClick={addEdge}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            添加边
          </button>
          <button
            onClick={removeLastElement}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            删除最后元素
          </button>
        </div>

        <CytoscapeGraph
          elements={elements}
          cytoStyle={style}
          layout={{ name: "grid" }}
          divStyle={{ height: "400px", width: "100%" }}
          onCytoscapeInit={(cy) => {
            cyRef.current = cy;
          }}
        />
      </ExampleSection>

      <ExampleSection title="操作说明">
        <div className="prose max-w-none">
          <ul className="list-disc list-inside space-y-2">
            <li>点击"添加节点"按钮添加新节点</li>
            <li>点击"添加边"按钮在两个节点之间添加边</li>
            <li>点击"删除最后元素"按钮删除最近添加的元素</li>
          </ul>
        </div>
      </ExampleSection>
    </ExampleLayout>
  );
}
