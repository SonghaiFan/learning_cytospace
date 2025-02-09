# 布局与视图控制

本章介绍 Cytoscape.js 中的布局算法和视图控制功能。通过完整的示例代码展示不同类型的布局算法及其应用场景。

## 在线预览

[点击查看在线示例](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/3-布局与视图控制/index.html)

## 项目结构

```
3-布局与视图控制/
├── index.html      # 主要示例代码
└── README.md       # 本文档
```

## 布局类型

本示例实现了三类布局算法：

### 1. 离散布局 (Discrete)

快速且确定性的几何布局，节点位置一次性确定。

- Grid：网格布局
- Circle：圆形布局
- Concentric：同心圆布局
- Breadthfirst：广度优先布局

### 2. 力导向布局 (Force-directed)

通过物理模拟迭代计算节点位置，适合展示复杂关系。

- fCoSE：快速复合弹簧嵌入布局
- CoSE-Bilkent：改进的复合弹簧嵌入布局
- Cola：约束布局
- CoSE：复合弹簧嵌入布局

### 3. 层次布局 (Hierarchical)

专门用于展示具有层次结构的有向图。

- Dagre：层次化布局
- ELK：Eclipse 布局内核
- CiSE：圆形-分段布局

## 示例数据结构

示例中的图数据包含三个不同类型的集群，用于展示不同布局算法的特点：

1. 环形结构（绿色）：最适合 CiSE 布局
2. 星形结构（蓝色）：最适合 CoSE 和 FCose 布局
3. 层次结构（黄色）：最适合 Dagre 和 ELK 布局

集群间通过虚线紫色边连接，用于展示布局算法处理大规模图的能力。

## 功能特性

1. 布局控制

   - 支持所有内置布局和主流扩展布局
   - 提供布局参数的细粒度控制
   - 实现布局动画和过渡效果

2. 子图布局

   - 支持对选中节点及其邻居应用特定布局
   - 保持其他节点位置不变
   - 提供平滑的动画过渡

3. 视图控制
   - 缩放控制
   - 视图居中
   - 自适应视图
   - 平滑动画效果

## 布局配置

每种布局都提供了详细的配置选项，包括：

- 动画持续时间
- 节点间距
- 布局特定参数（如力导向布局的斥力系数）
- 布局边界和填充

## 最佳实践

1. 布局选择

   - 小型图：优先使用离散布局
   - 复杂关系：使用力导向布局
   - 层次结构：使用专门的层次布局

2. 性能优化

   - 大型图谨慎使用力导向布局
   - 适当调整迭代次数和计算时间
   - 考虑使用异步布局

3. 用户体验
   - 提供布局动画
   - 保持用户视觉参考
   - 支持交互式布局调整
