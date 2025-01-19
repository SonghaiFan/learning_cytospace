"use client";

import { useState, useCallback, useRef } from "react";
import { CytoscapeGraph } from "@/components/CytoscapeGraph";
import { ExampleLayout } from "@/components/ExampleLayout";
import { ExampleSection } from "@/components/ExampleSection";
import { ElementDefinition, Stylesheet, Core } from "cytoscape";

export default function ExportExample() {
  // Cytoscape 实例引用
  const cyRef = useRef<Core | null>(null);
  // 预览内容状态
  const [previewContent, setPreviewContent] = useState<string>("");

  // 示例数据
  const elements: ElementDefinition[] = [
    // 节点
    { data: { id: "a", label: "A", type: "user" } },
    { data: { id: "b", label: "B", type: "user" } },
    { data: { id: "c", label: "C", type: "group" } },
    { data: { id: "d", label: "D", type: "user" } },
    // 边
    { data: { id: "ab", source: "a", target: "b", type: "friend", weight: 1 } },
    { data: { id: "bc", source: "b", target: "c", type: "member", weight: 2 } },
    { data: { id: "cd", source: "c", target: "d", type: "member", weight: 1 } },
  ];

  // 样式定义
  const style: Stylesheet[] = [
    {
      selector: "node",
      style: {
        backgroundColor: "#666",
        label: "data(label)",
        textValign: "center",
        textHalign: "center",
        width: 50,
        height: 50,
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
      } as any,
    },
  ];

  // 导出为 JSON
  const exportJSON = useCallback(() => {
    if (!cyRef.current) return;
    const json = cyRef.current.json();
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.json";
    a.click();
    URL.revokeObjectURL(url);
    setPreviewContent(JSON.stringify(json, null, 2));
  }, []);

  // 导出为 CSV
  const exportCSV = useCallback(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    // 节点 CSV
    let nodesCSV = "id,label,type\n";
    cy.nodes().forEach((node) => {
      const data = node.data();
      nodesCSV += `${data.id},${data.label},${data.type}\n`;
    });

    // 边 CSV
    let edgesCSV = "id,source,target,type,weight\n";
    cy.edges().forEach((edge) => {
      const data = edge.data();
      edgesCSV += `${data.id},${data.source},${data.target},${data.type},${data.weight}\n`;
    });

    const csvContent = `Nodes:\n${nodesCSV}\nEdges:\n${edgesCSV}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.csv";
    a.click();
    URL.revokeObjectURL(url);
    setPreviewContent(csvContent);
  }, []);

  // 导出为 PNG 图片
  const exportPNG = useCallback(() => {
    if (!cyRef.current) return;
    const png = cyRef.current.png({
      output: "blob",
      bg: "white",
      full: true,
    });
    const url = URL.createObjectURL(png);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.png";
    a.click();
    URL.revokeObjectURL(url);
    setPreviewContent("图片已导出为 PNG 格式");
  }, []);

  // 解析 CSV
  const parseCSV = useCallback((csv: string) => {
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        obj[header] = values[i];
      });
      return obj;
    });
  }, []);

  // 导入数据
  const importData = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !cyRef.current) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (file.name.endsWith(".json")) {
            const json = JSON.parse(e.target?.result as string);
            cyRef.current?.elements().remove();
            cyRef.current?.add(json.elements);
            cyRef.current?.layout({ name: "grid" }).run();
            setPreviewContent(JSON.stringify(json, null, 2));
          } else if (file.name.endsWith(".csv")) {
            const content = e.target?.result as string;
            const [nodesSection, edgesSection] = content.split("\nEdges:\n");
            const nodes = parseCSV(nodesSection.replace("Nodes:\n", ""));
            const edges = parseCSV(edgesSection);

            cyRef.current?.elements().remove();
            nodes.forEach((node) => {
              cyRef.current?.add({
                group: "nodes",
                data: node,
              });
            });
            edges.forEach((edge) => {
              cyRef.current?.add({
                group: "edges",
                data: edge,
              });
            });
            cyRef.current?.layout({ name: "grid" }).run();
            setPreviewContent(content);
          }
        } catch (error) {
          console.error("导入失败:", error);
          alert("导入失败，请检查文件格式");
        }
      };
      reader.readAsText(file);
    },
    [parseCSV]
  );

  // 重置图形
  const resetGraph = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.elements().remove();
    cyRef.current.add(elements);
    cyRef.current.layout({ name: "grid" }).run();
    setPreviewContent("图形已重置为初始状态");
  }, [elements]);

  // 处理组件就绪
  const handleReady = useCallback((cy: Core) => {
    cyRef.current = cy;
  }, []);

  return (
    <ExampleLayout
      title="数据导出与导入"
      description="本章介绍如何在 Cytoscape.js 中导入导出图数据"
    >
      <ExampleSection title="图形演示">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={exportJSON}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
            title="导出为 JSON 格式"
          >
            导出 JSON
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
            title="导出为 CSV 格式"
          >
            导出 CSV
          </button>
          <button
            onClick={exportPNG}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
            title="导出为 PNG 图片"
          >
            导出 PNG
          </button>
          <label className="px-3 py-1 bg-green-100 rounded hover:bg-green-200 cursor-pointer">
            导入文件
            <input
              type="file"
              accept=".json,.csv"
              className="hidden"
              onChange={importData}
            />
          </label>
          <button
            onClick={resetGraph}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            title="重置图形到初始状态"
          >
            重置图形
          </button>
        </div>
        <CytoscapeGraph
          elements={elements}
          cytoStyle={style}
          layout={{ name: "grid", padding: 50 }}
          divStyle={{ height: "400px", width: "100%" }}
          onCytoscapeInit={handleReady}
        />
      </ExampleSection>

      <ExampleSection title="数据预览">
        <div className="h-[400px] bg-gray-50 p-4 rounded overflow-auto font-mono whitespace-pre text-sm">
          {previewContent || "暂无预览内容"}
        </div>
      </ExampleSection>

      <ExampleSection title="功能说明">
        <div className="prose max-w-none">
          <h3 className="text-lg font-medium mb-2">导出功能</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>JSON 导出：保存完整的图数据结构，包括节点、边和属性</li>
            <li>CSV 导出：分别导出节点和边的数据，便于在电子表格中编辑</li>
            <li>PNG 导出：保存当前图形的可视化效果</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">导入功能</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>支持导入 JSON 和 CSV 格式的数据文件</li>
            <li>JSON 文件需要符合 Cytoscape.js 的数据格式</li>
            <li>CSV 文件需要包含节点和边的数据部分</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">数据格式</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>节点数据：包含 id、label、type 等属性</li>
            <li>边数据：包含 id、source、target、type、weight 等属性</li>
            <li>导入后会自动应用布局算法重新排列节点</li>
          </ul>
        </div>
      </ExampleSection>
    </ExampleLayout>
  );
}
