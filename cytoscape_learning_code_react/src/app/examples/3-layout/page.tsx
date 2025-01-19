"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CytoscapeGraph } from "@/components/CytoscapeGraph";
import { ExampleLayout } from "@/components/ExampleLayout";
import { ExampleSection } from "@/components/ExampleSection";
import { ElementDefinition, Stylesheet, LayoutOptions, Core } from "cytoscape";
import { registerLayouts } from "@/lib/cytoscape-layouts";

/**
 * 布局与视图控制示例
 *
 * 这个示例展示了 Cytoscape.js 的各种布局算法和视图控制功能：
 * 1. 离散布局：网格、环形、同心圆、层次布局
 * 2. 力导向布局：CoSE、F-CoSE、Cola、CoSE-Bilkent
 * 3. 层次布局：Dagre、ELK、CiSE
 * 4. 子图布局：对选中节点应用特定布局
 * 5. 视图控制：缩放、平移、居中等
 */
export default function LayoutExample() {
  // 注册布局扩展
  useEffect(() => {
    registerLayouts();
  }, []);

  // Cytoscape 实例引用
  const cyRef = useRef<Core | null>(null);

  // 初始化 Cytoscape 事件处理
  const handleCytoscapeInit = useCallback((cy: Core) => {
    // 保存实例引用
    cyRef.current = cy;

    // 节点交互事件
    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      console.log("Clicked node:", node.id(), node.data());
    });

    cy.on("tap", "edge", (evt) => {
      const edge = evt.target;
      console.log("Clicked edge:", edge.id(), edge.data());
    });

    // 选择状态事件
    cy.on("select", (evt) => {
      const ele = evt.target;
      console.log("Selected element:", ele.id(), {
        group: ele.data("group"),
        position: ele.position(),
      });
    });

    cy.on("unselect", (evt) => {
      const ele = evt.target;
      console.log("Unselected element:", ele.id());
    });

    // 视觉反馈
    cy.on("mouseover", "node", (evt) => {
      const node = evt.target;
      // 添加悬停效果
      node.style({
        "border-width": 3,
        "border-color": "#d32f2f",
        "font-size": "14px",
        "z-index": 999,
      });
      // 高亮相连节点
      node.neighborhood().nodes().style({
        "border-width": 2,
        "border-color": "#d32f2f",
      });
      // 高亮相连边
      node.connectedEdges().style({
        "line-color": "#d32f2f",
        "target-arrow-color": "#d32f2f",
        width: 3,
      });
    });

    cy.on("mouseout", "node", (evt) => {
      const node = evt.target;
      // 移除节点悬停效果
      node.removeStyle("border-width border-color font-size z-index");
      // 移除相连节点高亮
      node.neighborhood().nodes().removeStyle("border-width border-color");
      // 移除相连边高亮
      node.connectedEdges().removeStyle("line-color target-arrow-color width");
    });

    // 拖拽事件
    cy.on("dragfree", "node", (evt) => {
      const node = evt.target;
      console.log(`Node ${node.id()} dragged to:`, node.position());
    });

    // 布局事件
    cy.on("layoutstart", (evt) => {
      console.log("Layout started:", evt.layout.options.name);
    });

    cy.on("layoutstop", (evt) => {
      console.log("Layout finished:", evt.layout.options.name);
    });

    // 视图事件
    cy.on("viewport", () => {
      console.log("Viewport changed:", {
        zoom: cy.zoom(),
        pan: cy.pan(),
      });
    });

    // 启用节点拖拽功能
    cy.nodes().ungrabify(); // 先禁用以重置状态
    cy.nodes().grabify(); // 然后启用
  }, []);

  // 示例数据：包含多个簇的图结构
  const elements: ElementDefinition[] = [
    // 集群1: 环形结构 (适合 CiSE 布局)
    { data: { id: "a1", label: "A1", group: "cluster1" } },
    { data: { id: "a2", label: "A2", group: "cluster1" } },
    { data: { id: "a3", label: "A3", group: "cluster1" } },
    { data: { id: "a4", label: "A4", group: "cluster1" } },
    { data: { id: "a5", label: "A5", group: "cluster1" } },
    { data: { id: "a1a2", source: "a1", target: "a2", group: "cluster1" } },
    { data: { id: "a2a3", source: "a2", target: "a3", group: "cluster1" } },
    { data: { id: "a3a4", source: "a3", target: "a4", group: "cluster1" } },
    { data: { id: "a4a5", source: "a4", target: "a5", group: "cluster1" } },
    { data: { id: "a5a1", source: "a5", target: "a1", group: "cluster1" } },

    // 集群2: 星形结构 (适合 CoSE 和 FCose 布局)
    { data: { id: "b1", label: "B1", group: "cluster2" } },
    { data: { id: "b2", label: "B2", group: "cluster2" } },
    { data: { id: "b3", label: "B3", group: "cluster2" } },
    { data: { id: "b4", label: "B4", group: "cluster2" } },
    { data: { id: "b5", label: "B5", group: "cluster2" } },
    { data: { id: "b6", label: "B6", group: "cluster2" } },
    { data: { id: "b1b2", source: "b1", target: "b2", group: "cluster2" } },
    { data: { id: "b1b3", source: "b1", target: "b3", group: "cluster2" } },
    { data: { id: "b1b4", source: "b1", target: "b4", group: "cluster2" } },
    { data: { id: "b1b5", source: "b1", target: "b5", group: "cluster2" } },
    { data: { id: "b1b6", source: "b1", target: "b6", group: "cluster2" } },

    // 集群3: 层次结构 (适合 Dagre 和 ELK 布局)
    { data: { id: "c1", label: "C1", group: "cluster3" } },
    { data: { id: "c2", label: "C2", group: "cluster3" } },
    { data: { id: "c3", label: "C3", group: "cluster3" } },
    { data: { id: "c4", label: "C4", group: "cluster3" } },
    { data: { id: "c5", label: "C5", group: "cluster3" } },
    { data: { id: "c6", label: "C6", group: "cluster3" } },
    { data: { id: "c7", label: "C7", group: "cluster3" } },
    { data: { id: "c1c2", source: "c1", target: "c2", group: "cluster3" } },
    { data: { id: "c1c3", source: "c1", target: "c3", group: "cluster3" } },
    { data: { id: "c2c4", source: "c2", target: "c4", group: "cluster3" } },
    { data: { id: "c2c5", source: "c2", target: "c5", group: "cluster3" } },
    { data: { id: "c3c6", source: "c3", target: "c6", group: "cluster3" } },
    { data: { id: "c3c7", source: "c3", target: "c7", group: "cluster3" } },

    // 集群间的连接
    { data: { id: "a1b1", source: "a1", target: "b1", group: "intercluster" } },
    { data: { id: "b1c1", source: "b1", target: "c1", group: "intercluster" } },
    { data: { id: "a3c3", source: "a3", target: "c3", group: "intercluster" } },
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
      } as any,
    },
    // 为不同集群设置不同颜色
    {
      selector: 'node[group="cluster1"]',
      style: {
        backgroundColor: "#4CAF50",
      } as any,
    },
    {
      selector: 'node[group="cluster2"]',
      style: {
        backgroundColor: "#2196F3",
      } as any,
    },
    {
      selector: 'node[group="cluster3"]',
      style: {
        backgroundColor: "#FFC107",
      } as any,
    },
    {
      selector: 'edge[group="cluster1"]',
      style: {
        lineColor: "#4CAF50",
        targetArrowColor: "#4CAF50",
      } as any,
    },
    {
      selector: 'edge[group="cluster2"]',
      style: {
        lineColor: "#2196F3",
        targetArrowColor: "#2196F3",
      } as any,
    },
    {
      selector: 'edge[group="cluster3"]',
      style: {
        lineColor: "#FFC107",
        targetArrowColor: "#FFC107",
      } as any,
    },
    {
      selector: 'edge[group="intercluster"]',
      style: {
        lineColor: "#9C27B0",
        targetArrowColor: "#9C27B0",
        lineStyle: "dashed",
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
  ];

  // 布局配置
  const layouts = {
    // 离散布局
    grid: {
      name: "grid",
      rows: undefined,
      animate: true,
      animationDuration: 500,
      padding: 30,
    },
    circle: {
      name: "circle",
      animate: true,
      animationDuration: 500,
      padding: 30,
      radius: undefined,
    },
    concentric: {
      name: "concentric",
      animate: true,
      animationDuration: 500,
      padding: 30,
      minNodeSpacing: 50,
      concentric: (node: any) => node.degree(),
      levelWidth: () => 1,
    },
    breadthfirst: {
      name: "breadthfirst",
      animate: true,
      animationDuration: 500,
      padding: 30,
      directed: true,
      spacingFactor: 1.5,
    },
    // 力导向布局
    cose: {
      name: "cose",
      animate: "end",
      animationDuration: 500,
      padding: 30,
      nodeOverlap: 20,
      componentSpacing: 40,
      nodeRepulsion: 400000,
      idealEdgeLength: 100,
      edgeElasticity: 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0,
    },
    cola: {
      name: "cola",
      animate: true,
      animationDuration: 500,
      padding: 30,
      maxSimulationTime: 3000,
      nodeSpacing: 30,
      edgeLength: 100,
      infinite: false,
    },
    fcose: {
      name: "fcose",
      quality: "proof",
      animate: true,
      animationDuration: 500,
      randomize: true,
      padding: 30,
      nodeSeparation: 75,
      idealEdgeLength: () => 50,
      nodeRepulsion: () => 4500,
    },
    "cose-bilkent": {
      name: "cose-bilkent",
      animate: true,
      animationDuration: 500,
      padding: 30,
      nodeDimensionsIncludeLabels: true,
      idealEdgeLength: 50,
      nodeRepulsion: 4500,
      gravity: 0.25,
      gravityRange: 3.8,
    },
    dagre: {
      name: "dagre",
      animate: true,
      animationDuration: 500,
      padding: 30,
      rankDir: "TB",
      nodeSep: 50,
      rankSep: 50,
      edgeSep: 10,
    },
    elk: {
      name: "elk",
      animate: true,
      animationDuration: 500,
      padding: 30,
      algorithm: "stress",
      nodeDimensionsIncludeLabels: true,
      randomize: true,
      "elk.spacing.nodeNode": 80,
      "elk.layered.spacing.nodeNodeBetweenLayers": 80,
    },
    cise: {
      name: "cise",
      animate: true,
      animationDuration: 500,
      padding: 30,
      clusters: [],
      allowNodesInsideCircle: true,
      maxRatioOfNodesInsideCircle: 0.1,
      springCoeff: 0.45,
      nodeRepulsion: 4500,
      gravity: 0.25,
      gravityRange: 3.8,
    },
  };

  // 当前布局配置
  const [layout, setLayout] = useState<LayoutOptions>({ name: "grid" });

  // 切换布局
  const changeLayout = useCallback((layoutName: keyof typeof layouts) => {
    setLayout(layouts[layoutName]);
  }, []);

  // 对选中节点应用布局
  const applyLayoutToSelected = useCallback((name: keyof typeof layouts) => {
    if (!cyRef.current) return;

    const selectedNodes = cyRef.current.nodes(":selected");
    if (selectedNodes.length === 0) {
      alert("请先选择节点");
      return;
    }

    // 获取选中节点的中心点作为参考
    const bb = selectedNodes.boundingBox();
    const center = {
      x: (bb.x1 + bb.x2) / 2,
      y: (bb.y1 + bb.y2) / 2,
    };

    // 获取选中节点及其邻居
    const neighborhood = selectedNodes.neighborhood().add(selectedNodes);

    // 创建布局配置，继承全局配置
    const layoutConfig = {
      ...layouts[name],
      fit: false, // 不自动适配视图
      animate: true,
      animationDuration: 500,
      boundingBox: {
        // 将布局限制在选中节点的区域内
        x1: center.x - 100,
        y1: center.y - 100,
        x2: center.x + 100,
        y2: center.y + 100,
      },
    };

    // 运行布局前记录其他节点的位置
    const otherNodes = cyRef.current.nodes().not(neighborhood);
    const positions: Record<string, { x: number; y: number }> = {};
    otherNodes.forEach((node) => {
      positions[node.id()] = { ...node.position() };
    });

    // 运行布局
    const layout = neighborhood.layout(layoutConfig);

    // 布局完成后恢复其他节点的位置
    layout.on("layoutstop", () => {
      otherNodes.forEach((node) => {
        node.animate({
          position: positions[node.id()],
          duration: 500,
        });
      });
    });

    layout.run();
  }, []);

  // 重置布局
  const resetLayout = useCallback(() => {
    changeLayout("grid");
  }, [changeLayout]);

  // 视图控制函数
  const fit = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.animate({
        fit: {
          eles: cyRef.current.elements(),
          padding: 50,
        },
        duration: 500,
      });
    }
  }, []);

  const center = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.animate({
        center: {
          eles: cyRef.current.elements(),
        },
        duration: 500,
      });
    }
  }, []);

  const zoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.animate({
        zoom: cyRef.current.zoom() * 1.2,
        duration: 500,
      });
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.animate({
        zoom: cyRef.current.zoom() * 0.8,
        duration: 500,
      });
    }
  }, []);

  const reset = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.animate({
        fit: {
          eles: cyRef.current.elements(),
          padding: 50,
        },
        center: {
          eles: cyRef.current.elements(),
        },
        zoom: 1,
        duration: 500,
      });
    }
  }, []);

  return (
    <ExampleLayout
      title="布局与视图控制"
      description="本章介绍 Cytoscape.js 的各种布局算法和视图控制功能"
    >
      <ExampleSection title="布局控制">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-2">离散布局 (Discrete)</h3>
            <div className="text-sm text-gray-600 mb-2">
              快速且确定性的几何布局，节点位置一次性确定
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => changeLayout("grid")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Grid
              </button>
              <button
                onClick={() => changeLayout("circle")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Circle
              </button>
              <button
                onClick={() => changeLayout("concentric")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Concentric
              </button>
              <button
                onClick={() => changeLayout("breadthfirst")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Breadthfirst
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">力导向布局 (Force-directed)</h3>
            <div className="text-sm text-gray-600 mb-2">
              通过物理模拟迭代计算节点位置，适合展示复杂关系
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => changeLayout("fcose")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                fCoSE
              </button>
              <button
                onClick={() => changeLayout("cose-bilkent")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                CoSE-Bilkent
              </button>
              <button
                onClick={() => changeLayout("cola")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cola
              </button>
              <button
                onClick={() => changeLayout("cose")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                CoSE
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">层次布局 (Hierarchical)</h3>
            <div className="text-sm text-gray-600 mb-2">
              专门用于展示具有层次结构的有向图
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => changeLayout("dagre")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Dagre
              </button>
              <button
                onClick={() => changeLayout("elk")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                ELK
              </button>
              <button
                onClick={() => changeLayout("cise")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                CiSE
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">子图布局</h3>
            <div className="text-sm text-gray-600 mb-2">
              对选中的节点及其邻居应用特定布局，保持其他节点位置不变
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyLayoutToSelected("concentric")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                同心圆布局
              </button>
              <button
                onClick={() => applyLayoutToSelected("cose")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                CoSE布局
              </button>
              <button
                onClick={() => applyLayoutToSelected("fcose")}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                F-CoSE布局
              </button>
              <button
                onClick={resetLayout}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                重置布局
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">视图控制</h3>
            <div className="text-sm text-gray-600 mb-2">
              缩放、平移和居中操作
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={zoomIn}
                className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
              >
                放大
              </button>
              <button
                onClick={zoomOut}
                className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
              >
                缩小
              </button>
              <button
                onClick={fit}
                className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
              >
                适配视图
              </button>
              <button
                onClick={center}
                className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
              >
                居中视图
              </button>
              <button
                onClick={reset}
                className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
              >
                重置视图
              </button>
            </div>
          </div>
        </div>
      </ExampleSection>

      <ExampleSection>
        <CytoscapeGraph
          elements={elements}
          cytoStyle={style}
          layout={layout}
          divStyle={{ height: "600px", width: "100%" }}
          onCytoscapeInit={handleCytoscapeInit}
        />
      </ExampleSection>

      <ExampleSection title="功能说明">
        <div className="prose max-w-none">
          <h3 className="text-lg font-medium mb-2">布局控制</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>
              <strong>离散布局：</strong>
              包括网格、环形、同心圆和层次布局，适用于展示图的整体结构
            </li>
            <li>
              <strong>力导向布局：</strong>
              通过物理模拟实现节点的自动分布，适用于复杂关系网络
            </li>
            <li>
              <strong>层次布局：</strong>
              专门用于展示具有层次结构的有向图，如组织架构、依赖关系等
            </li>
            <li>
              <strong>子图布局：</strong>
              可以对选中的节点及其邻居单独应用布局，而不影响其他节点
            </li>
            <li>
              示例图包含三个不同结构的簇：环形结构（绿色）、星形结构（蓝色）和层次结构（黄色）
            </li>
          </ul>

          <h3 className="text-lg font-medium mb-2">视图控制</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>适配视图：</strong>
              调整缩放和位置使所有元素都在视图中可见
            </li>
            <li>
              <strong>居中视图：</strong>
              将图形移动到视图中心
            </li>
            <li>
              <strong>放大/缩小：</strong>
              调整视图的缩放级别
            </li>
            <li>
              <strong>重置视图：</strong>
              恢复到默认的视图状态
            </li>
            <li>也可以使用鼠标滚轮进行缩放，按住鼠标左键拖动进行平移</li>
          </ul>
        </div>
      </ExampleSection>
    </ExampleLayout>
  );
}
