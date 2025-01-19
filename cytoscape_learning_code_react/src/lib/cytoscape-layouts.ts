import cytoscape from "cytoscape";
import cola from "cytoscape-cola";
import dagre from "cytoscape-dagre";
import elk from "cytoscape-elk";
import fcose from "cytoscape-fcose";
import coseBilkent from "cytoscape-cose-bilkent";
import cise from "cytoscape-cise";

// 注册所有布局扩展
export function registerLayouts() {
  // 注册 Cola 布局
  if (!cytoscape.prototype.hasInitialDependencies) {
    cytoscape.use(cola);
  }

  // 注册 Dagre 布局
  if (!cytoscape.prototype.hasInitialDependencies) {
    cytoscape.use(dagre);
  }

  // 注册 ELK 布局
  if (!cytoscape.prototype.hasInitialDependencies) {
    cytoscape.use(elk);
  }

  // 注册 fCoSE 布局
  if (!cytoscape.prototype.hasInitialDependencies) {
    cytoscape.use(fcose);
  }

  // 注册 CoSE-Bilkent 布局
  if (!cytoscape.prototype.hasInitialDependencies) {
    cytoscape.use(coseBilkent);
  }

  // 注册 CiSE 布局
  if (!cytoscape.prototype.hasInitialDependencies) {
    cytoscape.use(cise);
  }
}
