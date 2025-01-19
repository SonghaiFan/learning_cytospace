import React, { useEffect, useRef } from "react";
import cytoscape, {
  Core,
  Stylesheet,
  LayoutOptions,
  ElementDefinition,
} from "cytoscape";

/**
 * CytoscapeGraph 组件的属性接口
 */
interface CytoscapeGraphProps {
  /** 图的节点和边数据 */
  elements?: ElementDefinition[];
  /** 图的样式定义 */
  cytoStyle?: Stylesheet[];
  /** 布局配置 */
  layout?: LayoutOptions;
  /** 容器样式 */
  divStyle?: React.CSSProperties;
  /** Cytoscape 实例初始化完成的回调函数 */
  onCytoscapeInit?: (cy: Core) => void;
}

/**
 * Cytoscape 图形组件
 *
 * 用法示例:
 * ```tsx
 * <CytoscapeGraph
 *   elements={[
 *     { data: { id: 'a', label: 'Node A' } },
 *     { data: { id: 'b', label: 'Node B' } },
 *     { data: { id: 'ab', source: 'a', target: 'b' } }
 *   ]}
 *   cytoStyle={[
 *     {
 *       selector: 'node',
 *       style: {
 *         'background-color': '#666',
 *         'label': 'data(label)'
 *       }
 *     }
 *   ]}
 *   layout={{ name: 'grid' }}
 *   divStyle={{ height: '400px' }}
 *   onCytoscapeInit={(cy) => {
 *     // 可以在这里添加事件监听等操作
 *     cy.on('tap', 'node', (evt) => console.log('Clicked:', evt.target.id()));
 *   }}
 * />
 * ```
 */
export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  elements = [],
  cytoStyle = [],
  layout = { name: "grid" },
  divStyle = { height: "400px", width: "100%" },
  onCytoscapeInit,
}) => {
  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  // Cytoscape 实例引用
  const cyRef = useRef<Core | null>(null);

  // 初始化 Cytoscape 实例
  useEffect(() => {
    // 如果容器不存在或实例已创建，则返回
    if (!containerRef.current || cyRef.current) return;

    // 创建 Cytoscape 实例
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: cytoStyle,
      layout,
    });

    // 保存实例引用
    cyRef.current = cy;
    // 调用初始化回调
    if (onCytoscapeInit) onCytoscapeInit(cy);

    // 清理函数：组件卸载时销毁实例
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  // 处理元素更新
  useEffect(() => {
    if (!cyRef.current) return;
    // 使用 json() 方法更新元素，保持已有元素的状态
    cyRef.current.json({ elements });
  }, [elements]);

  // 处理样式更新
  useEffect(() => {
    if (!cyRef.current) return;
    // 更新样式定义
    cyRef.current.style(cytoStyle);
  }, [cytoStyle]);

  // 处理布局更新
  useEffect(() => {
    if (!cyRef.current) return;
    // 创建并运行新布局
    const layoutInstance = cyRef.current.layout(layout);
    layoutInstance.run();
  }, [layout]);

  // 渲染容器
  return <div ref={containerRef} style={divStyle} />;
};
