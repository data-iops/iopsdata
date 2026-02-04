"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Edge,
  type Node,
} from "reactflow";

import "reactflow/dist/style.css";

import { LineageNode, type LineageNodeData } from "@/components/lineage/LineageNode";
import { LineagePanel, type LineagePanelDetails } from "@/components/lineage/LineagePanel";
import { LineageControls } from "@/components/lineage/LineageControls";

export type LineageScope = "session" | "connection" | "impact";

const nodeTypes = {
  lineage: LineageNode,
};

const initialNodes: Node<LineageNodeData>[] = [
  {
    id: "table-orders",
    type: "lineage",
    position: { x: 0, y: 0 },
    data: { label: "public.orders", type: "table", meta: "Row count: 18k" },
  },
  {
    id: "query-1",
    type: "lineage",
    position: { x: 260, y: 120 },
    data: { label: "Revenue by region", type: "query", meta: "SELECT region, SUM..." },
  },
  {
    id: "output-1",
    type: "lineage",
    position: { x: 520, y: 0 },
    data: { label: "regional_revenue", type: "output", meta: "Result set" },
  },
  {
    id: "table-customers",
    type: "lineage",
    position: { x: 0, y: 220 },
    data: { label: "public.customers", type: "table", meta: "Row count: 6k" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "table-orders", target: "query-1", animated: true },
  { id: "e2", source: "table-customers", target: "query-1", animated: true },
  { id: "e3", source: "query-1", target: "output-1", animated: true },
];

const detailsMap: Record<string, LineagePanelDetails> = {
  "table-orders": {
    type: "table",
    name: "public.orders",
    rowCount: 18423,
    columns: ["order_id", "customer_id", "region", "total", "created_at"],
  },
  "table-customers": {
    type: "table",
    name: "public.customers",
    rowCount: 6201,
    columns: ["customer_id", "name", "plan", "joined_at"],
  },
  "query-1": {
    type: "query",
    name: "Revenue by region",
    sql: "SELECT region, SUM(total) AS revenue FROM public.orders GROUP BY region;",
    durationMs: 1240,
  },
  "output-1": {
    type: "output",
    name: "regional_revenue",
    rowCount: 8,
    columns: 3,
  },
};

const scopeNodes: Record<LineageScope, string[]> = {
  session: ["table-orders", "query-1", "output-1"],
  connection: ["table-orders", "table-customers", "query-1", "output-1"],
  impact: ["table-orders", "query-1", "output-1"],
};

function LineageGraphInner({ scope }: { scope: LineageScope }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [miniMapEnabled, setMiniMapEnabled] = useState(true);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const filteredNodes = useMemo(() => {
    const allowed = new Set(scopeNodes[scope]);
    return nodes.map((node) => ({
      ...node,
      hidden: !allowed.has(node.id),
      data: {
        ...node.data,
        onExpand: () => setSelectedNodeId(node.id),
      },
    }));
  }, [nodes, scope]);

  const filteredEdges = useMemo(() => {
    const allowed = new Set(scopeNodes[scope]);
    return edges.map((edge) => ({
      ...edge,
      hidden: !(allowed.has(edge.source) && allowed.has(edge.target)),
    }));
  }, [edges, scope]);

  const selectedDetails = selectedNodeId ? detailsMap[selectedNodeId] : null;

  const handleExport = useCallback(() => {
    alert("Export coming soon");
  }, []);

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[2.5fr_1fr]">
      <div className="relative h-[600px] rounded-2xl border border-border/60 bg-card/80">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background gap={20} size={1} />
          <Controls showInteractive={false} />
          {miniMapEnabled ? <MiniMap pannable zoomable /> : null}
        </ReactFlow>
        <div className="absolute left-4 top-4">
          <LineageControls
            onZoomIn={() => zoomIn()}
            onZoomOut={() => zoomOut()}
            onFitView={() => fitView({ padding: 0.2 })}
            onToggleMiniMap={() => setMiniMapEnabled((prev) => !prev)}
            onExport={handleExport}
            minimapEnabled={miniMapEnabled}
          />
        </div>
      </div>
      <LineagePanel details={selectedDetails} onClose={() => setSelectedNodeId(null)} />
    </div>
  );
}

export function LineageGraph({ scope }: { scope: LineageScope }) {
  return (
    <ReactFlowProvider>
      <LineageGraphInner scope={scope} />
    </ReactFlowProvider>
  );
}
