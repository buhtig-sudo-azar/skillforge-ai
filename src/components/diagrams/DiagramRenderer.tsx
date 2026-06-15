'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { DiagramType, DiagramData, FlowDiagramData, TreeDiagramData, GraphDiagramData, CauseEffectData, AttackTreeData, KnowledgeMapData } from '@/types';

// ============================================================
// Color mapping for node types
// ============================================================

const nodeColors: Record<string, { fill: string; stroke: string; text: string }> = {
  start: { fill: '#dcfce7', stroke: '#22c55e', text: '#166534' },
  process: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' },
  decision: { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e' },
  end: { fill: '#fee2e2', stroke: '#ef4444', text: '#991b14' },
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
// Diagram Tooltip — кастомный тултип поверх SVG
// Работает при наведении (десктоп) и при тапе (мобилки)
// ============================================================

interface TooltipState {
  text: string;
  x: number;
  y: number;
  visible: boolean;
}

function DiagramTooltip({ tooltip }: { tooltip: TooltipState }) {
  if (!tooltip.visible) return null;

  return (
    <div
      className="fixed z-[100] max-w-[280px] px-3 py-2 text-xs font-medium rounded-lg shadow-lg border border-border bg-popover text-popover-foreground pointer-events-none animate-in fade-in-0 zoom-in-95 duration-100"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: 'translate(-50%, -110%)',
      }}
    >
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rotate-45 border-r border-b border-border bg-popover" />
      {tooltip.text}
    </div>
  );
}

// Хук для управления тултипом
function useDiagramTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>({ text: '', x: 0, y: 0, visible: false });
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = useCallback((e: React.MouseEvent | React.TouchEvent, fullText: string) => {
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);

    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0]?.clientX ?? 0;
      clientY = e.touches[0]?.clientY ?? 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setTooltip({ text: fullText, x: clientX, y: clientY - 8, visible: true });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const handleTap = useCallback((e: React.TouchEvent, fullText: string) => {
    e.preventDefault();
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);

    let clientX = e.touches[0]?.clientX ?? 0;
    let clientY = e.touches[0]?.clientY ?? 0;

    setTooltip(prev => {
      // Если уже показан — скрываем
      if (prev.visible && prev.text === fullText) {
        return { text: '', x: 0, y: 0, visible: false };
      }
      return { text: fullText, x: clientX, y: clientY - 8, visible: true };
    });

    // Автоскрытие через 3 секунды
    tapTimeoutRef.current = setTimeout(() => {
      setTooltip(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  return { tooltip, showTooltip, hideTooltip, handleTap };
}

// Утилита: обрезать текст для SVG
function truncateText(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen - 2) + '…' : text;
}

// ============================================================
// Flow Diagram Renderer
// ============================================================

function FlowDiagram({ data, onShowTooltip, onHideTooltip, onTapNode }: {
  data: FlowDiagramData;
  onShowTooltip: (e: React.MouseEvent | React.TouchEvent, text: string) => void;
  onHideTooltip: () => void;
  onTapNode: (e: React.TouchEvent, text: string) => void;
}) {
  const nodeW = 220; // увеличено с 180
  const nodeH = 44;  // увеличено с 40
  const gapY = 60;
  const startX = 280 - nodeW / 2; // центр шире
  const startY = 25;

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
    <svg viewBox={`0 0 560 ${Math.max(svgH, 300)}`} className="w-full" style={{ maxHeight: '400px' }}>
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

        return (
          <g key={`edge-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6b7280" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
            {edge.label && (
              <text x={x1 + 10} y={midY} fontSize="11" fill="#6b7280" textAnchor="start" dominantBaseline="middle">
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
        const displayLabel = truncateText(node.label, 30);
        const isTruncated = node.label.length > 30;

        return (
          <g
            key={node.id}
            onMouseEnter={isTruncated ? (e) => onShowTooltip(e, node.label) : undefined}
            onMouseLeave={isTruncated ? onHideTooltip : undefined}
            onTouchStart={isTruncated ? (e) => onTapNode(e, node.label) : undefined}
            className={isTruncated ? 'cursor-pointer' : ''}
          >
            <title>{node.label}</title>
            {isDecision ? (
              <>
                <rect
                  x={pos.x + 15} y={pos.y}
                  width={nodeW - 30} height={nodeH}
                  rx={4} fill={style.fill} stroke={style.stroke} strokeWidth="1.5"
                />
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
              {displayLabel}
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
  return {
    id: node.id,
    label: node.label,
    children: childPositions,
    x,
    y: depth * ySpacing + 30,
  };
}

function renderTreeNode(
  node: TreeNodeWithPos,
  onShowTooltip: (e: React.MouseEvent | React.TouchEvent, text: string) => void,
  onHideTooltip: () => void,
  onTapNode: (e: React.TouchEvent, text: string) => void,
): React.ReactNode {
  const nodeW = 170; // увеличено с 140
  const nodeH = 36;  // увеличено с 32
  const displayLabel = truncateText(node.label, 22);
  const isTruncated = node.label.length > 22;

  return (
    <g
      key={node.id}
      onMouseEnter={isTruncated ? (e) => onShowTooltip(e, node.label) : undefined}
      onMouseLeave={isTruncated ? onHideTooltip : undefined}
      onTouchStart={isTruncated ? (e) => onTapNode(e, node.label) : undefined}
      className={isTruncated ? 'cursor-pointer' : ''}
    >
      <title>{node.label}</title>
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
        {displayLabel}
      </text>
      {/* Recurse children */}
      {node.children?.map((child) => renderTreeNode(child, onShowTooltip, onHideTooltip, onTapNode))}
    </g>
  );
}

function TreeDiagram({ data, onShowTooltip, onHideTooltip, onTapNode }: {
  data: TreeDiagramData;
  onShowTooltip: (e: React.MouseEvent | React.TouchEvent, text: string) => void;
  onHideTooltip: () => void;
  onTapNode: (e: React.TouchEvent, text: string) => void;
}) {
  const xOffset = { value: 90 };
  const xSpacing = 180; // увеличено с 160
  const ySpacing = 60;
  const layout = layoutTree(data.root, 0, xOffset, xSpacing, ySpacing);

  let maxX = 0;
  let maxY = 0;
  function findBounds(node: TreeNodeWithPos) {
    maxX = Math.max(maxX, node.x + 90);
    maxY = Math.max(maxY, node.y + 20);
    node.children?.forEach(findBounds);
  }
  findBounds(layout);

  return (
    <svg viewBox={`0 0 ${Math.max(maxX, 500)} ${Math.max(maxY + 30, 300)}`} className="w-full" style={{ maxHeight: '400px' }}>
      {renderTreeNode(layout, onShowTooltip, onHideTooltip, onTapNode)}
    </svg>
  );
}

// ============================================================
// Graph Diagram Renderer
// ============================================================

function GraphDiagram({ data, onShowTooltip, onHideTooltip, onTapNode }: {
  data: GraphDiagramData;
  onShowTooltip: (e: React.MouseEvent | React.TouchEvent, text: string) => void;
  onHideTooltip: () => void;
  onTapNode: (e: React.TouchEvent, text: string) => void;
}) {
  const cx = 280;
  const cy = 160;
  const radius = 120;

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
    <svg viewBox="0 0 560 320" className="w-full" style={{ maxHeight: '400px' }}>
      <ArrowMarker />

      {/* Edges */}
      {data.edges.map((edge, i) => {
        const from = positions[edge.from];
        const to = positions[edge.to];
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
        const displayLabel = truncateText(pos.label, 12);
        const isTruncated = pos.label.length > 12;
        return (
          <g
            key={node.id}
            onMouseEnter={isTruncated ? (e) => onShowTooltip(e, pos.label) : undefined}
            onMouseLeave={isTruncated ? onHideTooltip : undefined}
            onTouchStart={isTruncated ? (e) => onTapNode(e, pos.label) : undefined}
            className={isTruncated ? 'cursor-pointer' : ''}
          >
            <title>{pos.label}</title>
            <circle cx={pos.x} cy={pos.y} r={30} fill={style.fill} stroke={style.stroke} strokeWidth="1.5" />
            <text x={pos.x} y={pos.y} fontSize="10" fill={style.text} textAnchor="middle" dominantBaseline="middle" fontWeight="500">
              {displayLabel}
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

function CauseEffectDiagram({ data, onShowTooltip, onHideTooltip, onTapNode }: {
  data: CauseEffectData;
  onShowTooltip: (e: React.MouseEvent | React.TouchEvent, text: string) => void;
  onHideTooltip: () => void;
  onTapNode: (e: React.TouchEvent, text: string) => void;
}) {
  const causeX = 40;
  const effectX = 370;
  const startY = 30;
  const spacing = 48;
  const nodeW = 130;  // увеличено с 100
  const nodeH = 36;   // увеличено с 30

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
    <svg viewBox={`0 0 540 ${Math.max(svgH, 200)}`} className="w-full" style={{ maxHeight: '400px' }}>
      <ArrowMarker />

      {/* Section headers */}
      <text x={causeX + nodeW / 2} y={18} fontSize="12" fill="#9d174d" textAnchor="middle" fontWeight="700">Причины</text>
      <text x={effectX + nodeW / 2} y={18} fontSize="12" fill="#3730a3" textAnchor="middle" fontWeight="700">Следствия</text>

      {/* Causes */}
      {data.causes.map((cause) => {
        const y = causePositions[cause.id];
        const displayLabel = truncateText(cause.label, 18);
        const isTruncated = cause.label.length > 18;
        return (
          <g
            key={cause.id}
            onMouseEnter={isTruncated ? (e) => onShowTooltip(e, cause.label) : undefined}
            onMouseLeave={isTruncated ? onHideTooltip : undefined}
            onTouchStart={isTruncated ? (e) => onTapNode(e, cause.label) : undefined}
            className={isTruncated ? 'cursor-pointer' : ''}
          >
            <title>{cause.label}</title>
            <rect x={causeX} y={y} width={nodeW} height={nodeH} rx={6} fill={nodeColors.cause.fill} stroke={nodeColors.cause.stroke} strokeWidth="1.5" />
            <text x={causeX + nodeW / 2} y={y + nodeH / 2} fontSize="10" fill={nodeColors.cause.text} textAnchor="middle" dominantBaseline="middle">
              {displayLabel}
            </text>
          </g>
        );
      })}

      {/* Effects */}
      {data.effects.map((effect) => {
        const y = effectPositions[effect.id];
        const displayLabel = truncateText(effect.label, 18);
        const isTruncated = effect.label.length > 18;
        return (
          <g
            key={effect.id}
            onMouseEnter={isTruncated ? (e) => onShowTooltip(e, effect.label) : undefined}
            onMouseLeave={isTruncated ? onHideTooltip : undefined}
            onTouchStart={isTruncated ? (e) => onTapNode(e, effect.label) : undefined}
            className={isTruncated ? 'cursor-pointer' : ''}
          >
            <title>{effect.label}</title>
            <rect x={effectX} y={y} width={nodeW} height={nodeH} rx={6} fill={nodeColors.effect.fill} stroke={nodeColors.effect.stroke} strokeWidth="1.5" />
            <text x={effectX + nodeW / 2} y={y + nodeH / 2} fontSize="10" fill={nodeColors.effect.text} textAnchor="middle" dominantBaseline="middle">
              {displayLabel}
            </text>
          </g>
        );
      })}

      {/* Connections */}
      {data.connections.map((conn, i) => {
        const y1 = (causePositions[conn.cause] ?? 0) + nodeH / 2;
        const y2 = (effectPositions[conn.effect] ?? 0) + nodeH / 2;
        const x1 = causeX + nodeW;
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

function renderAttackTreeNode(
  node: AttackTreeNodeWithPos,
  onShowTooltip: (e: React.MouseEvent | React.TouchEvent, text: string) => void,
  onHideTooltip: () => void,
  onTapNode: (e: React.TouchEvent, text: string) => void,
): React.ReactNode {
  const nodeW = 160; // увеличено с 130
  const nodeH = 44;  // увеличено с 40
  const style = node.type === 'AND' ? nodeColors.and : nodeColors.or;
  const displayLabel = truncateText(node.label, 20);
  const isTruncated = node.label.length > 20;

  return (
    <g
      key={node.id}
      onMouseEnter={isTruncated ? (e) => onShowTooltip(e, node.label) : undefined}
      onMouseLeave={isTruncated ? onHideTooltip : undefined}
      onTouchStart={isTruncated ? (e) => onTapNode(e, node.label) : undefined}
      className={isTruncated ? 'cursor-pointer' : ''}
    >
      <title>{node.label}</title>
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
        {displayLabel}
      </text>

      {/* Recurse children */}
      {node.children?.map((child) => renderAttackTreeNode(child, onShowTooltip, onHideTooltip, onTapNode))}
    </g>
  );
}

function AttackTreeDiagram({ data, onShowTooltip, onHideTooltip, onTapNode }: {
  data: AttackTreeData;
  onShowTooltip: (e: React.MouseEvent | React.TouchEvent, text: string) => void;
  onHideTooltip: () => void;
  onTapNode: (e: React.TouchEvent, text: string) => void;
}) {
  const xOffset = { value: 90 };
  const xSpacing = 170; // увеличено с 150
  const ySpacing = 70;

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
      {renderAttackTreeNode(layout, onShowTooltip, onHideTooltip, onTapNode)}
    </svg>
  );
}

// ============================================================
// Knowledge Map Diagram Renderer
// ============================================================

function KnowledgeMapDiagram({ data, onShowTooltip, onHideTooltip, onTapNode }: {
  data: KnowledgeMapData;
  onShowTooltip: (e: React.MouseEvent | React.TouchEvent, text: string) => void;
  onHideTooltip: () => void;
  onTapNode: (e: React.TouchEvent, text: string) => void;
}) {
  const cx = 280;
  const cy = 160;
  const radius = 130;

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
    <svg viewBox="0 0 560 320" className="w-full" style={{ maxHeight: '400px' }}>
      <ArrowMarker />

      {/* Relations */}
      {data.relations.map((rel, i) => {
        const from = positions[rel.from];
        const to = positions[rel.to];
        if (!from || !to) return null;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const r = 38;
        const x1 = from.x + (dx / len) * r;
        const y1 = from.y + (dy / len) * r;
        const x2 = to.x - (dx / len) * r;
        const y2 = to.y - (dy / len) * r;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - 6;

        const displayRelLabel = truncateText(rel.label, 18);
        const isRelTruncated = rel.label.length > 18;

        return (
          <g
            key={`rel-${i}`}
            onMouseEnter={isRelTruncated ? (e) => onShowTooltip(e, rel.label) : undefined}
            onMouseLeave={isRelTruncated ? onHideTooltip : undefined}
            onTouchStart={isRelTruncated ? (e) => onTapNode(e, rel.label) : undefined}
            className={isRelTruncated ? 'cursor-pointer' : ''}
          >
            <title>{rel.label}</title>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrowhead-blue)" />
            <text x={midX} y={midY} fontSize="8" fill="#6b7280" textAnchor="middle" dominantBaseline="middle">
              {displayRelLabel}
            </text>
          </g>
        );
      })}

      {/* Concepts */}
      {data.concepts.map((concept) => {
        const pos = positions[concept.id];
        if (!pos) return null;
        const style = nodeColors.concept;
        const displayLabel = truncateText(pos.label, 14);
        const isTruncated = pos.label.length > 14;
        return (
          <g
            key={concept.id}
            onMouseEnter={isTruncated ? (e) => onShowTooltip(e, `${pos.label}\n${pos.description}`) : undefined}
            onMouseLeave={isTruncated ? onHideTooltip : undefined}
            onTouchStart={isTruncated ? (e) => onTapNode(e, `${pos.label}\n${pos.description}`) : undefined}
            className={isTruncated ? 'cursor-pointer' : ''}
          >
            <title>{pos.label} — {pos.description}</title>
            <ellipse cx={pos.x} cy={pos.y} rx={40} ry={26} fill={style.fill} stroke={style.stroke} strokeWidth="1.5" />
            <text x={pos.x} y={pos.y} fontSize="10" fill={style.text} textAnchor="middle" dominantBaseline="middle" fontWeight="600">
              {displayLabel}
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
  const { tooltip, showTooltip, hideTooltip, handleTap } = useDiagramTooltip();

  const commonProps = {
    onShowTooltip: showTooltip,
    onHideTooltip: hideTooltip,
    onTapNode: handleTap,
  };

  return (
    <div className="relative">
      {/* Type-narrowing render */}
      {(() => {
        switch (diagramData.type) {
          case 'flow':
            return <FlowDiagram data={diagramData} {...commonProps} />;
          case 'tree':
            return <TreeDiagram data={diagramData} {...commonProps} />;
          case 'graph':
            return <GraphDiagram data={diagramData} {...commonProps} />;
          case 'cause-effect':
            return <CauseEffectDiagram data={diagramData} {...commonProps} />;
          case 'attack-tree':
            return <AttackTreeDiagram data={diagramData} {...commonProps} />;
          case 'knowledge-map':
            return <KnowledgeMapDiagram data={diagramData} {...commonProps} />;
          default:
            return (
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Неподдерживаемый тип диаграммы: {diagramType}
              </div>
            );
        }
      })()}

      {/* Кастомный тултип */}
      <DiagramTooltip tooltip={tooltip} />
    </div>
  );
}
