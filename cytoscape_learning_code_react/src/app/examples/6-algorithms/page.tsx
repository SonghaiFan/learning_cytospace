"use client";

import { useState, useCallback, useRef } from "react";
import { CytoscapeGraph } from "@/components/CytoscapeGraph";
import { ElementDefinition, Stylesheet, Core } from "cytoscape";
import { ExampleLayout } from "@/components/ExampleLayout";
import { ExampleSection } from "@/components/ExampleSection";

export default function AlgorithmsExample() {
  // Cytoscape 实例引用
  const cyRef = useRef<Core | null>(null);

  // 分析结果状态
  const [analysisResult, setAnalysisResult] = useState<{
    title: string;
    content: string;
    complexity?: string;
  }>({ title: "", content: "", complexity: "" });

  // 示例数据：一个包含多个路径和社区的图
  const elements: ElementDefinition[] = [
    // 第一个社区
    { data: { id: "a1", label: "A1", community: "1" } },
    { data: { id: "a2", label: "A2", community: "1" } },
    { data: { id: "a3", label: "A3", community: "1" } },
    // 第二个社区
    { data: { id: "b1", label: "B1", community: "2" } },
    { data: { id: "b2", label: "B2", community: "2" } },
    { data: { id: "b3", label: "B3", community: "2" } },
    // 第三个社区
    { data: { id: "c1", label: "C1", community: "3" } },
    { data: { id: "c2", label: "C2", community: "3" } },
    { data: { id: "c3", label: "C3", community: "3" } },

    // 第一个社区的内部连接
    { data: { id: "a1a2", source: "a1", target: "a2", weight: 1 } },
    { data: { id: "a2a3", source: "a2", target: "a3", weight: 1 } },
    { data: { id: "a3a1", source: "a3", target: "a1", weight: 1 } },

    // 第二个社区的内部连接
    { data: { id: "b1b2", source: "b1", target: "b2", weight: 1 } },
    { data: { id: "b2b3", source: "b2", target: "b3", weight: 1 } },
    { data: { id: "b3b1", source: "b3", target: "b1", weight: 1 } },

    // 第三个社区的内部连接
    { data: { id: "c1c2", source: "c1", target: "c2", weight: 1 } },
    { data: { id: "c2c3", source: "c2", target: "c3", weight: 1 } },
    { data: { id: "c3c1", source: "c3", target: "c1", weight: 1 } },

    // 桥接边（连接不同社区的关键边）
    { data: { id: "a2b1", source: "a2", target: "b1", weight: 2 } },
    { data: { id: "b2c1", source: "b2", target: "c1", weight: 2 } },
  ];

  // 样式定义
  const style: Stylesheet[] = [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        "border-width": 2,
        "border-color": "#333",
        width: 30,
        height: 30,
        label: "data(label)",
        color: "#fff",
        "font-size": "12px",
        "text-valign": "center",
        "text-halign": "center",
        "text-outline-width": 2,
        "text-outline-color": "#666",
      } as any,
    },
    {
      selector: "edge",
      style: {
        width: "data(weight)",
        "line-color": "#999",
        "curve-style": "bezier",
        label: "data(weight)",
        "font-size": "10px",
      } as any,
    },
    {
      selector: ".highlighted",
      style: {
        "background-color": "#e74c3c",
        "line-color": "#e74c3c",
        "border-color": "#c0392b",
        width: 60,
        height: 60,
      } as any,
    },
    {
      selector: ".bridge",
      style: {
        "line-color": "#3498db",
        "line-style": "dashed",
        width: 4,
      } as any,
    },
    {
      selector: ".articulation-point",
      style: {
        "background-color": "#2ecc71",
        "border-width": 3,
        "border-color": "#27ae60",
        width: 35,
        height: 35,
      } as any,
    },
    {
      selector: ".cluster-0",
      style: {
        "background-color": "#e74c3c",
      } as any,
    },
    {
      selector: ".cluster-1",
      style: {
        "background-color": "#3498db",
      } as any,
    },
    {
      selector: ".cluster-2",
      style: {
        "background-color": "#2ecc71",
      } as any,
    },
  ];

  // 清除高亮
  const clearHighlight = useCallback(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    // 停止所有正在进行的动画
    cy.elements().stop();

    // 移除所有样式类
    cy.elements().removeClass("highlighted bridge articulation-point");

    // 重置节点大小
    cy.nodes().forEach((node) => {
      node.style({
        width: 30,
        height: 30,
      });
    });

    // 重置边的样式
    cy.edges().forEach((edge) => {
      edge.style({
        width: edge.data("weight"),
      });
    });

    // 清除聚类样式
    ["cluster-0", "cluster-1", "cluster-2"].forEach((cls) => {
      cy.elements().removeClass(cls);
    });

    setAnalysisResult({ title: "", content: "", complexity: "" });
  }, []);

  // PageRank 分析
  const runPageRank = useCallback(() => {
    if (!cyRef.current) return;
    clearHighlight();

    const cy = cyRef.current;
    const ranks = cy.elements().pageRank({
      dampingFactor: 0.85,
      precision: 0.000001,
      iterations: 200,
    });

    let content =
      "PageRank算法通过分析节点间的连接关系来评估节点的重要性。\n\n";

    cy.nodes().forEach((node) => {
      const rank = ranks.rank(node);
      content += `节点 ${node.data("label")}: ${rank.toFixed(3)}\n`;
      node.style({
        width: 20 + rank * 200,
        height: 20 + rank * 200,
      });
    });

    setAnalysisResult({
      title: "PageRank 分析结果",
      content,
      complexity: "O(E·k) 其中 k 为迭代次数",
    });
  }, [clearHighlight]);

  // 度中心性分析
  const runDegreeCentrality = useCallback(() => {
    if (!cyRef.current) return;
    clearHighlight();

    const cy = cyRef.current;
    let content = "度中心性反映了节点的直接连接数量。\n\n";

    cy.nodes().forEach((node) => {
      const degree = node.degree(true);
      content += `节点 ${node.data("label")}: ${degree}\n`;
      if (degree > 3) {
        node.addClass("highlighted");
      }
    });

    setAnalysisResult({
      title: "度中心性分析结果",
      content,
      complexity: "O(V)",
    });
  }, [clearHighlight]);

  // 中介中心性分析
  const findBetweenness = useCallback(() => {
    if (!cyRef.current) return;
    clearHighlight();

    const cy = cyRef.current;
    const bc = cy.elements().betweennessCentrality({
      directed: false,
      weight: (edge) => edge.data("weight"),
    });
    let content = "中介中心性反映了节点作为网络中转站的重要程度。\n\n";

    cy.nodes().forEach((node) => {
      const centrality = bc.betweenness(node);
      content += `节点 ${node.data("label")}: ${centrality.toFixed(3)}\n`;
      if (centrality > 0.2) {
        node.addClass("highlighted");
      }
    });

    setAnalysisResult({
      title: "中介中心性分析结果",
      content,
      complexity: "O(V·E)",
    });
  }, [clearHighlight]);

  // 检测桥接边
  const detectBridges = useCallback((cy: Core) => {
    const bridges: cytoscape.EdgeSingular[] = [];
    const edges = cy.edges();

    edges.forEach((edge) => {
      const edgeData = edge.remove();
      const components = cy.elements().components();
      if (components.length > 1) {
        bridges.push(edge);
      }
      cy.add(edgeData);
    });

    return bridges;
  }, []);

  // 桥接边分析
  const findBridges = useCallback(() => {
    if (!cyRef.current) return;
    clearHighlight();

    const cy = cyRef.current;
    const bridges = detectBridges(cy);

    bridges.forEach((edge, index) => {
      setTimeout(() => {
        edge.addClass("bridge");
        edge.connectedNodes().addClass("highlighted");
      }, index * 500);
    });

    let content =
      "桥接边是删除后会导致图不连通的边。它们在网络中起着关键的连接作用。\n\n";

    if (bridges.length > 0) {
      content += "发现的桥接边:\n";
      bridges.forEach((edge) => {
        const source = edge.source().data("label");
        const target = edge.target().data("label");
        content += `▶ ${source} → ${target}: 连接了两个不同的社区\n`;
      });
      content += "\n影响分析:\n";
      content += "- 这些边的删除会导致网络分裂成不连通的部分\n";
      content += "- 它们是社区间信息流通的唯一通道\n";
      content += "- 需要特别关注这些连接的稳定性";
    } else {
      content += "未发现桥接边，网络具有较强的连通性。";
    }

    setAnalysisResult({
      title: "桥接边分析结果",
      content,
      complexity: "O(V+E)",
    });
  }, [clearHighlight, detectBridges]);

  // 检测关节点
  const detectArticulationPoints = useCallback((cy: Core) => {
    const articulationPoints: cytoscape.NodeSingular[] = [];
    const nodes = cy.nodes();

    nodes.forEach((node) => {
      const nodeData = node.remove();
      const components = cy.elements().components();
      if (components.length > 1) {
        articulationPoints.push(node);
      }
      cy.add(nodeData);
    });

    return articulationPoints;
  }, []);

  // 关节点分析
  const findArticulationPoints = useCallback(() => {
    if (!cyRef.current) return;
    clearHighlight();

    const cy = cyRef.current;
    const articulationPoints = detectArticulationPoints(cy);

    articulationPoints.forEach((node, index) => {
      setTimeout(() => {
        node.addClass("articulation-point");
        node.connectedEdges().addClass("highlighted");
      }, index * 500);
    });

    let content =
      "关节点是删除后会增加图的连通分量的节点。它们是网络中的关键节点。\n\n";

    if (articulationPoints.length > 0) {
      content += "发现的关节点:\n";
      articulationPoints.forEach((node) => {
        const label = node.data("label");
        const neighbors = node.neighborhood().length;
        const communities = new Set(
          node
            .neighborhood()
            .nodes()
            .map((n) => n.data("label")[0])
        ).size;

        content += `◆ ${label}: 连接了 ${neighbors} 个邻居节点, 跨越 ${communities} 个社区\n`;
      });
      content += "\n影响分析:\n";
      content += "- 这些节点的删除会导致网络分裂成多个部分\n";
      content += "- 它们是不同社区间的关键中转站\n";
      content += "- 建议为这些节点建立备份路径";
    } else {
      content += "未发现关节点，网络具有较强的连通性。";
    }

    setAnalysisResult({
      title: "关节点分析结果",
      content,
      complexity: "O(V+E)",
    });
  }, [clearHighlight, detectArticulationPoints]);

  // 查找最短路径
  const findShortestPath = useCallback(() => {
    if (!cyRef.current) return;
    clearHighlight();

    const startNode = "a1";
    const endNode = "b3";
    const dijkstra = cyRef.current.elements().dijkstra({
      root: `#${startNode}`,
      weight: (edge) => edge.data("weight"),
    });
    const path = dijkstra.pathTo(cyRef.current.$(`#${endNode}`));
    path.addClass("highlighted");

    const distance = dijkstra.distanceTo(cyRef.current.$(`#${endNode}`));
    setAnalysisResult({
      title: "最短路径分析结果",
      content: `从 ${startNode} 到 ${endNode} 的最短路径长度为: ${distance}`,
      complexity: "O(V+E)",
    });
  }, [clearHighlight]);

  // 处理组件就绪
  const handleReady = useCallback((cy: Core) => {
    cyRef.current = cy;
  }, []);

  return (
    <ExampleLayout title="图算法教学演示">
      <ExampleSection
        title="中心性度量"
        description="探索节点在网络中的重要性和影响力"
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={runPageRank}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
            title="计算节点的 PageRank 值"
          >
            PageRank分析
          </button>
          <button
            onClick={findBetweenness}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
            title="计算节点和边的中介中心性"
          >
            中介中心性
          </button>
          <button
            onClick={runDegreeCentrality}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
            title="计算节点的度中心性"
          >
            度中心性
          </button>
        </div>
      </ExampleSection>

      <ExampleSection
        title="网络结构分析"
        description="识别网络中的关键结构和组件"
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={findBridges}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
            title="查找图中的桥接边"
          >
            桥接边分析
          </button>
          <button
            onClick={findArticulationPoints}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
            title="查找图中的关节点"
          >
            关节点分析
          </button>
        </div>
      </ExampleSection>

      <ExampleSection
        title="路径分析"
        description="分析节点间的最短路径和连接性"
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={findShortestPath}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
            title="查找两个随机节点间的最短路径"
          >
            最短路径
          </button>
          <button
            onClick={clearHighlight}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            title="清除高亮效果"
          >
            重置视图
          </button>
        </div>
      </ExampleSection>

      <ExampleSection>
        <CytoscapeGraph
          elements={elements}
          cytoStyle={style}
          layout={{ name: "cose", padding: 50 }}
          divStyle={{ height: "600px" }}
          onCytoscapeInit={handleReady}
        />
      </ExampleSection>

      <ExampleSection title="分析结果">
        <div className="bg-gray-50 p-4 rounded">
          {analysisResult.title && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{analysisResult.title}</h3>
              <div className="whitespace-pre-wrap text-gray-700">
                {analysisResult.content}
              </div>
              {analysisResult.complexity && (
                <div className="mt-4 text-sm text-gray-500">
                  算法复杂度: {analysisResult.complexity}
                </div>
              )}
            </div>
          )}
        </div>
      </ExampleSection>
    </ExampleLayout>
  );
}
