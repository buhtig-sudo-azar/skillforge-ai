'use client';

import type { DiagramType, DiagramData, FlowDiagramData, TreeDiagramData, GraphDiagramData, CauseEffectData, AttackTreeData, KnowledgeMapData } from '@/types';

// ============================================================
// Color mapping for node types
// ============================================================

const nodeColors: Record<string, { fill: string; stroke: string; text: string }> = {
  start: { fill: '#dcfce7', stroke: '#22c55e', text: '#166534' },
  process: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' },
  decision: { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e' },
  end: { fill: '#fee2e2', stroke: '#ef4444', text: '#991b1b' },
  default: { fill: '#f3f4f6', stroke: '#9ca3af', text: '#374151' },
  cause: { fill: '#fce7f3', stroke: '#ec4899', text: '#9d174d' },
  effect: { fill: '#e0e7ff', stroke: '#6366f1', text: '#3730a3' },
  and: { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e' },
  or: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' },
  concept: { fill: '#ede9fe', stroke: '#8b5cf6', text: '#5b21b6' },
};

function getNodeStyle(type?: string) {
  return nodeColors[type ?? 'default'] ?? nodeColors.default;
}

// ============================================================
// SVG Arrow marker definition
// ============================================================

function ArrowMarker() {
  return (
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
      </marker>
      <marker id="arrowhead-green" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
      </marker>
      <marker id="arrowhead-blue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
      </marker>
      <marker id="arrowhead-pink" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#ec4899" />
      </marker>
    </defs>
  );
}

// ============================================================
// Flow Diagram Renderer
// ============================================================

function FlowDiagram({ data }: { data: FlowDiagramData }) {
  const nodeW = 180;
  const nodeH = 40;
  const gapY = 60;
  const startX = 250 - nodeW / 2;
  const startY = 25;

  // Position nodes vertically
  const positions: Record<string, { x: number; y: number; type?: string }> = {};
  data.nodes.forEach((node, i) => {
    positions[node.id] = {
      x: startX,
      y: startY + i * (nodeH + gapY),
      type: node.type,
    };
  });

  const svgH = startY + data.nodes.length * (nodeH + gapY) + 10;

  return (
    <svg viewBox={`0 0 500 ${Math.max(svgH, 300)}`} className="w-full" style={{ maxHeight: '400px' }}>
      <ArrowMarker />

      {/* Edges */}
      {data.edges.map((edge, i) => {
        const from = positions[edge.from];
        const to = positions[edge.to];
        if (!from || !to) return null;

        const x1 = from.x + nodeW / 2;
        const y1 = from.y + nodeH;
        const x2 = to.x + nodeW / 2;
        const y2 = to.y;

        const midY = (y1 + y2) / 2;
        const labelX = x1 + (edge.label ? 10 : 0);
        const labelY = midY;

        return (
          <g key={`edge-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6b7280" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
            {edge.label && (
              <text x={labelX} y={labelY} fontSize="11" fill="#6b7280" textAnchor="start" dominantBaseline="middle">
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {data.nodes.map((node) => {
        const pos = positions[node.id];
        if (!pos) return null;
        const style = getNodeStyle(pos.type);
        const isDecision = pos.type === 'decision';

        return (
          <g key={node.id}>
            {isDecision ? (
              <>
                <rect
                  x={pos.x + 15} y={pos.y}
                  width={nodeW - 30} height={nodeH}
                  rx={4} fill={style.fill} stroke={style.stroke} strokeWidth="1.5"
                  transform={`rotate(0, ${pos.x + nodeW / 2}, ${pos.y + nodeH / 2})`}
                />
                {/* Diamond shape hint via a small diamond indicator */}
                <polygon
                  points={`${pos.x + nodeW / 2},${pos.y - 4} ${pos.x + nodeW / 2 + 6},${pos.y} ${pos.x + nodeW / 2},${pos.y + 4} ${pos.x + nodeW / 2 - 6},${pos.y}`}
                  fill={style.stroke}
                />
              </>
            ) : (
              <rect
                x={pos.x} y={pos.y}
                width={nodeW} height={nodeH}
                rx={8} fill={style.fill} stroke={style.stroke} strokeWidth="1.5"
              />
            )}
            <text
              x={pos.x + nodeW / 2}
              y={pos.y + nodeH / 2}
              fontSize="12"
              fill={style.text}
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight="500"
            >
              {node.label.length > 24 ? node.label.slice(0, 22) + '…' : node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// Tree Diagram Renderer
// ============================================================

interface TreeNodeWithPos {
  id: string;
  label: string;
  children?: TreeNodeWithPos[];
  x: number;
  y: number;
}

function layoutTree(
  node: { id: string; label: string; children?: any[] },
  depth: number,
  xOffset: { value: number },
  xSpacing: number,
  ySpacing: number,
): TreeNodeWithPos {
  if (!node.children || node.children.length === 0) {
    const pos: TreeNodeWithPos = { id: node.id, label: node.label, x: xOffset.value, y: depth * ySpacing + 30 };
    xOffset.value += xSpacing;
    return pos;
  }

  const childPositions: TreeNodeWithPos[] = [];
  for (const child of node.children) {
    childPositions.push(layoutTree(child, depth + 1, xOffset, xSpacing, ySpacing));
  }

  const x = (childPositions[0].x + childPositions[childPositions.length - 1].x) / 2;
  const result: TreeNodeWithPos = {
    id: node.id,
    label: node.label,
    children: childPositions,
    x,
    y: depth * ySpacing + 30,
  };

  return result;
}

function renderTreeNode(node: TreeNodeWithPos): React.ReactNode {
  const nodeW = 140;
  const nodeH = 32;

  return (
    <g key={node.id}>
      {/* Lines to children */}
      {node.children?.map((child) => (
        <line
          key={`${node.id}-${child.id}`}
          x1={node.x}
          y1={node.y + nodeH / 2}
          x2={child.x}
          y2={child.y - nodeH / 2}
          stroke="#9ca3af"
          strokeWidth="1.5"
        />
      ))}
      {/* Node */}
      <rect
        x={node.x - nodeW / 2}
        y={node.y - nodeH / 2}
        width={nodeW}
        height={nodeH}
        rx={6}
        fill={node.children && node.children.length > 0 ? '#f0fdf4' : '#f3f4f6'}
        stroke={node.children && node.children.length > 0 ? '#22c55e' : '#9ca3af'}
        strokeWidth="1.5"
      />
      <text
        x={node.x}
        y={node.y}
        fontSize="11"
        fill="#374151"
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight="500"
      >
        {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
      </text>
      {/* Recurse children */}
      {node.children?.map((child) => renderTreeNode(child))}
    </g>
  );
}

function TreeDiagram({ data }: { data: TreeDiagramData }) {
  const xOffset = { value: 80 };
  const xSpacing = 160;
  const ySpacing = 60;
  const layout = layoutTree(data.root, 0, xOffset, xSpacing, ySpacing);

  // Find bounds
  let maxX = 0;
  let maxY = 0;
  function findBounds(node: TreeNodeWithPos) {
    maxX = Math.max(maxX, node.x + 80);
    maxY = Math.max(maxY, node.y + 20);
    node.children?.forEach(findBounds);
  }
  findBounds(layout);

  return (
    <svg viewBox={`0 0 ${Math.max(maxX, 500)} ${Math.max(maxY + 30, 300)}`} className="w-full" style={{ maxHeight: '400px' }}>
      {renderTreeNode(layout)}
    </svg>
  );
}

// ============================================================
// Graph Diagram Renderer
// ============================================================

function GraphDiagram({ data }: { data: GraphDiagramData }) {
  const cx = 250;
  const cy = 150;
  const radius = 100;

  // Position nodes in a circle
  const positions: Record<string, { x: number; y: number; label: string; group?: string }> = {};
  data.nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / data.nodes.length - Math.PI / 2;
    positions[node.id] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      label: node.label,
      group: node.group,
    };
  });

  return (
    <svg viewBox="0 0 500 300" className="w-full" style={{ maxHeight: '400px' }}>
      <ArrowMarker />

      {/* Edges */}
      {data.edges.map((edge, i) => {
        const from = positions[edge.from];
        const to = positions[edge.to];
        if (!from || !to) return null;

        // Shorten line to not overlap with circles
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const r = 24;
        const x1 = from.x + (dx / len) * r;
        const y1 = from.y + (dy / len) * r;
        const x2 = to.x - (dx / len) * r;
        const y2 = to.y - (dy / len) * r;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - 6;

        return (
          <g key={`edge-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
            {edge.label && (
              <text x={midX} y={midY} fontSize="9" fill="#6b7280" textAnchor="middle" dominantBaseline="middle">
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {data.nodes.map((node) => {
        const pos = positions[node.id];
        if (!pos) return null;
        const style = getNodeStyle(pos.group);
        return (
          <g key={node.id}>
            <circle cx={pos.x} cy={pos.y} r={24} fill={style.fill} stroke={style.stroke} strokeWidth="1.5" />
            <text x={pos.x} y={pos.y} fontSize="10" fill={style.text} textAnchor="middle" dominantBaseline="middle" fontWeight="500">
              {pos.label.length > 8 ? pos.label.slice(0, 6) + '…' : pos.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// Cause-Effect Diagram Renderer
// ============================================================

function CauseEffectDiagram({ data }: { data: CauseEffectData }) {
  const causeX = 60;
  const effectX = 380;
  const startY = 30;
  const spacing = 44;

  const causePositions: Record<string, number> = {};
  data.causes.forEach((c, i) => {
    causePositions[c.id] = startY + i * spacing;
  });

  const effectPositions: Record<string, number> = {};
  data.effects.forEach((e, i) => {
    effectPositions[e.id] = startY + i * spacing;
  });

  const svgH = Math.max(data.causes.length, data.effects.length) * spacing + 40;

  return (
    <svg viewBox={`0 0 500 ${Math.max(svgH, 200)}`} className="w-full" style={{ maxHeight: '400px' }}>
      <ArrowMarker />

      {/* Section headers */}
      <text x={causeX + 50} y={18} fontSize="12" fill="#9d174d" textAnchor="middle" fontWeight="700">Причины</text>
      <text x={effectX + 50} y={18} fontSize="12" fill="#3730a3" textAnchor="middle" fontWeight="700">Следствия</text>

      {/* Causes */}
      {data.causes.map((cause) => {
        const y = causePositions[cause.id];
        return (
          <g key={cause.id}>
            <rect x={causeX} y={y} width={100} height={30} rx={6} fill={nodeColors.cause.fill} stroke={nodeColors.cause.stroke} strokeWidth="1.5" />
            <text x={causeX + 50} y={y + 15} fontSize="10" fill={nodeColors.cause.text} textAnchor="middle" dominantBaseline="middle">
              {cause.label.length > 14 ? cause.label.slice(0, 12) + '…' : cause.label}
            </text>
          </g>
        );
      })}

      {/* Effects */}
      {data.effects.map((effect) => {
        const y = effectPositions[effect.id];
        return (
          <g key={effect.id}>
            <rect x={effectX} y={y} width={100} height={30} rx={6} fill={nodeColors.effect.fill} stroke={nodeColors.effect.stroke} strokeWidth="1.5" />
            <text x={effectX + 50} y={y + 15} fontSize="10" fill={nodeColors.effect.text} textAnchor="middle" dominantBaseline="middle">
              {effect.label.length > 14 ? effect.label.slice(0, 12) + '…' : effect.label}
            </text>
          </g>
        );
      })}

      {/* Connections */}
      {data.connections.map((conn, i) => {
        const y1 = (causePositions[conn.cause] ?? 0) + 15;
        const y2 = (effectPositions[conn.effect] ?? 0) + 15;
        const x1 = causeX + 100;
        const x2 = effectX;

        return (
          <line
            key={`conn-${i}`}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke="#ec4899"
            strokeWidth="1.2"
            strokeDasharray="4 2"
            markerEnd="url(#arrowhead-pink)"
          />
        );
      })}
    </svg>
  );
}

// ============================================================
// Attack Tree Diagram Renderer
// ============================================================

interface AttackTreeNodeWithPos {
  id: string;
  label: string;
  type: 'AND' | 'OR';
  children?: AttackTreeNodeWithPos[];
  x: number;
  y: number;
}

function layoutAttackTree(
  node: { id: string; label: string; type: 'AND' | 'OR'; children?: any[] },
  depth: number,
  xOffset: { value: number },
  xSpacing: number,
  ySpacing: number,
): AttackTreeNodeWithPos {
  if (!node.children || node.children.length === 0) {
    const pos: AttackTreeNodeWithPos = { id: node.id, label: node.label, type: node.type, x: xOffset.value, y: depth * ySpacing + 40 };
    xOffset.value += xSpacing;
    return pos;
  }

  const childPositions: AttackTreeNodeWithPos[] = [];
  for (const child of node.children) {
    childPositions.push(layoutAttackTree(child, depth + 1, xOffset, xSpacing, ySpacing));
  }

  const x = (childPositions[0].x + childPositions[childPositions.length - 1].x) / 2;
  return {
    id: node.id,
    label: node.label,
    type: node.type,
    children: childPositions,
    x,
    y: depth * ySpacing + 40,
  };
}

function renderAttackTreeNode(node: AttackTreeNodeWithPos): React.ReactNode {
  const nodeW = 130;
  const nodeH = 40;
  const style = node.type === 'AND' ? nodeColors.and : nodeColors.or;

  return (
    <g key={node.id}>
      {/* Lines to children */}
      {node.children?.map((child) => (
        <line
          key={`${node.id}-${child.id}`}
          x1={node.x}
          y1={node.y + nodeH / 2}
          x2={child.x}
          y2={child.y - nodeH / 2}
          stroke="#9ca3af"
          strokeWidth="1.5"
        />
      ))}

      {/* Node with AND/OR badge */}
      <rect
        x={node.x - nodeW / 2}
        y={node.y - nodeH / 2}
        width={nodeW}
        height={nodeH}
        rx={6}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth="1.5"
      />
      {/* AND/OR badge */}
      <rect
        x={node.x - 14}
        y={node.y - nodeH / 2 - 8}
        width={28}
        height={16}
        rx={4}
        fill={style.stroke}
      />
      <text
        x={node.x}
        y={node.y - nodeH / 2}
        fontSize="9"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight="700"
      >
        {node.type}
      </text>
      {/* Label */}
      <text
        x={node.x}
        y={node.y + 4}
        fontSize="10"
        fill={style.text}
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight="500"
      >
        {node.label.length > 16 ? node.label.slice(0, 14) + '…' : node.label}
      </text>

      {/* Recurse children */}
      {node.children?.map((child) => renderAttackTreeNode(child))}
    </g>
  );
}

function AttackTreeDiagram({ data }: { data: AttackTreeData }) {
  const xOffset = { value: 80 };
  const xSpacing = 150;
  const ySpacing = 70;

  // Build a virtual root from the goal
  const virtualRoot = {
    id: 'goal',
    label: data.goal,
    type: 'OR' as const,
    children: data.children,
  };

  const layout = layoutAttackTree(virtualRoot, 0, xOffset, xSpacing, ySpacing);

  let maxX = 0;
  let maxY = 0;
  function findBounds(node: AttackTreeNodeWithPos) {
    maxX = Math.max(maxX, node.x + 80);
    maxY = Math.max(maxY, node.y + 30);
    node.children?.forEach(findBounds);
  }
  findBounds(layout);

  return (
    <svg viewBox={`0 0 ${Math.max(maxX, 500)} ${Math.max(maxY + 30, 300)}`} className="w-full" style={{ maxHeight: '400px' }}>
      {renderAttackTreeNode(layout)}
    </svg>
  );
}

// ============================================================
// Knowledge Map Diagram Renderer
// ============================================================

function KnowledgeMapDiagram({ data }: { data: KnowledgeMapData }) {
  const cx = 250;
  const cy = 150;
  const radius = 110;

  // Position concepts in a circle
  const positions: Record<string, { x: number; y: number; label: string; description: string }> = {};
  data.concepts.forEach((concept, i) => {
    const angle = (2 * Math.PI * i) / data.concepts.length - Math.PI / 2;
    positions[concept.id] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      label: concept.label,
      description: concept.description,
    };
  });

  return (
    <svg viewBox="0 0 500 300" className="w-full" style={{ maxHeight: '400px' }}>
      <ArrowMarker />

      {/* Relations */}
      {data.relations.map((rel, i) => {
        const from = positions[rel.from];
        const to = positions[rel.to];
        if (!from || !to) return null;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const r = 30;
        const x1 = from.x + (dx / len) * r;
        const y1 = from.y + (dy / len) * r;
        const x2 = to.x - (dx / len) * r;
        const y2 = to.y - (dy / len) * r;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - 6;

        return (
          <g key={`rel-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrowhead-blue)" />
            <text x={midX} y={midY} fontSize="8" fill="#6b7280" textAnchor="middle" dominantBaseline="middle">
              {rel.label.length > 16 ? rel.label.slice(0, 14) + '…' : rel.label}
            </text>
          </g>
        );
      })}

      {/* Concepts */}
      {data.concepts.map((concept) => {
        const pos = positions[concept.id];
        if (!pos) return null;
        const style = nodeColors.concept;
        return (
          <g key={concept.id}>
            <ellipse cx={pos.x} cy={pos.y} rx={34} ry={22} fill={style.fill} stroke={style.stroke} strokeWidth="1.5" />
            <text x={pos.x} y={pos.y} fontSize="10" fill={style.text} textAnchor="middle" dominantBaseline="middle" fontWeight="600">
              {pos.label.length > 10 ? pos.label.slice(0, 8) + '…' : pos.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// Main DiagramRenderer Component
// ============================================================

interface DiagramRendererProps {
  diagramType: DiagramType;
  diagramData: DiagramData;
}

export function DiagramRenderer({ diagramType, diagramData }: DiagramRendererProps) {
  // Type-narrowing render
  switch (diagramData.type) {
    case 'flow':
      return <FlowDiagram data={diagramData} />;
    case 'tree':
      return <TreeDiagram data={diagramData} />;
    case 'graph':
      return <GraphDiagram data={diagramData} />;
    case 'cause-effect':
      return <CauseEffectDiagram data={diagramData} />;
    case 'attack-tree':
      return <AttackTreeDiagram data={diagramData} />;
    case 'knowledge-map':
      return <KnowledgeMapDiagram data={diagramData} />;
    default:
      return (
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Неподдерживаемый тип диаграммы: {diagramType}
        </div>
      );
  }
}
