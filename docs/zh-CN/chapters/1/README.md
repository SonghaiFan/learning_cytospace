# 1. 环境搭建与初始化

> [示例在线预览](https://raw.githack.com/SonghaiFan/learning_cytospace/main/cytoscape_learning_code/1-环境搭建与初始化/index.html)

本章节将介绍如何使用纯 JavaScript（Vanilla JS）构建最基础的 Cytoscape.js 图可视化应用。

## 基础环境配置

### CDN 引入

通过 CDN 引入 Cytoscape.js：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
```

### NPM 安装

如果你使用 Node.js，也可以通过 NPM 安装：

```bash
npm install cytoscape
```

然后在代码中导入：

```javascript
import cytoscape from "cytoscape";
```

## 页面结构

创建一个基本的 HTML 结构，包含一个用于显示图的容器：

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cytoscape.js 基础示例</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
    <style>
      #cy {
        width: 600px;
        height: 400px;
        border: 1px solid #ccc;
        margin: 20px auto;
        /* 重要：容器必须有固定的高度 */
        position: relative;
      }
    </style>
  </head>
  <body>
    <div id="cy"></div>
  </body>
</html>
```

## 初始化图实例

在 HTML 文件底部添加以下 JavaScript 代码：

```javascript
const cy = cytoscape({
  // 容器元素
  container: document.getElementById("cy"),

  // 图中的元素（节点和边）
  elements: [
    // 示例数据
    { data: { id: "a" } }, // 节点 a
    { data: { id: "b" } }, // 节点 b
    { data: { id: "ab", source: "a", target: "b" } }, // 从 a 到 b 的边
  ],

  // 样式定义
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(id)",
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#999",
        "curve-style": "bezier", // 重要：设置边的曲线样式
      },
    },
  ],

  // 布局配置
  layout: {
    name: "grid", // 网格布局
    rows: 2, // 可选：指定行数
    cols: 2, // 可选：指定列数
  },

  // 性能相关配置
  minZoom: 0.1, // 最小缩放级别
  maxZoom: 10, // 最大缩放级别
  wheelSensitivity: 0.2, // 鼠标滚轮灵敏度
  pixelRatio: "auto", // 像素比例，可以是数字或 'auto'
});
```

## 核心配置说明

### 基础配置参数

1. `container`: 指定图将渲染在哪个 DOM 元素中

   - 必须是一个 DOM 元素
   - 容器必须有固定的高度
   - 建议设置 `position: relative`

2. `elements`: 定义图中的节点和边

   - 节点必须有唯一的 `id`
   - 边必须有 `source` 和 `target`
   - 可以包含自定义数据

3. `style`: 定义元素的视觉样式

   - 使用选择器指定目标元素
   - 支持多种视觉属性
   - 可以引用元素数据

4. `layout`: 指定图的布局算法
   - 内置多种布局算法
   - 每种布局都有特定的参数
   - 可以动态切换布局

### 性能优化配置

1. **渲染优化**

   - `textureOnViewport`: 在视口上使用纹理（适用于大型图）
   - `pixelRatio`: 控制渲染分辨率
   - `hideEdgesOnViewport`: 平移时隐藏边

2. **交互优化**

   - `minZoom` 和 `maxZoom`: 限制缩放范围
   - `wheelSensitivity`: 控制滚轮灵敏度
   - `autoungrabify`: 禁止节点拖动
   - `autounselectify`: 禁止元素选择

3. **内存优化**
   - 使用 `cy.destroy()` 清理不再使用的实例
   - 大型图建议使用 `headless: true` 进行后台计算

### 调试与开发

1. **开发工具**

   ```javascript
   // 在控制台访问实例
   window.cy = cy;
   ```

2. **事件监听**

   ```javascript
   cy.on("ready", () => {
     console.log("图已完成初始化");
   });
   ```

3. **错误处理**
   ```javascript
   try {
     const cy = cytoscape(options);
   } catch (error) {
     console.error("初始化失败:", error);
   }
   ```

## 最佳实践

1. **容器设置**

   - 确保容器有明确的尺寸
   - 使用 `position: relative`
   - 考虑响应式设计

2. **初始化时机**

   - 在 DOM 加载完成后初始化
   - 使用 `DOMContentLoaded` 事件
   - 确保依赖资源已加载

3. **性能考虑**

   - 适当设置 `minZoom` 和 `maxZoom`
   - 大型图考虑使用性能优化选项
   - 注意内存管理和清理

4. **开发建议**
   - 使用浏览器开发工具调试
   - 保持代码模块化
   - 做好错误处理
