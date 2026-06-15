'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  Plus,
  Trash2,
  ArrowRight,
  Save,
  Play,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { workflowNodeTypes, mockWorkflowNodes, mockWorkflowEdges } from '@/data/view-data';
import type { WorkflowNode, WorkflowEdge } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export function WorkflowBuilderView() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(mockWorkflowNodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(mockWorkflowEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [newEdgeFrom, setNewEdgeFrom] = useState('');
  const [newEdgeTo, setNewEdgeTo] = useState('');
  const [newEdgeLabel, setNewEdgeLabel] = useState('');

  const addNode = (type: WorkflowNode['type']) => {
    const nodeType = workflowNodeTypes.find((n) => n.type === type);
    const id = `n${Date.now()}`;
    const newNode: WorkflowNode = {
      id,
      type,
      label: nodeType?.label ?? 'Узел',
      config: {},
      position: {
        x: 50 + (nodes.length % 4) * 200,
        y: 50 + Math.floor(nodes.length / 4) * 120,
      },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    if (selectedNode === id) setSelectedNode(null);
  };

  const addEdge = () => {
    if (!newEdgeFrom || !newEdgeTo) return;
    const newEdge: WorkflowEdge = {
      id: `e${Date.now()}`,
      from: newEdgeFrom,
      to: newEdgeTo,
      label: newEdgeLabel || undefined,
    };
    setEdges((prev) => [...prev, newEdge]);
    setNewEdgeFrom('');
    setNewEdgeTo('');
    setNewEdgeLabel('');
  };

  const removeEdge = (id: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white">
              <Workflow className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Конструктор воркфлоу</h1>
              <p className="text-sm text-muted-foreground">
                Визуальное проектирование AI-процессов
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 lg:grid-cols-[280px_1fr]"
        >
          {/* Sidebar: Node Types */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Типы узлов</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {workflowNodeTypes.map((nt) => (
                  <button
                    key={nt.type}
                    onClick={() => addNode(nt.type)}
                    className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className={`flex size-8 items-center justify-center rounded ${nt.color}`}>
                      <span className="text-sm">{nt.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{nt.label}</div>
                      <div className="text-xs text-muted-foreground">
                        Нажмите, чтобы добавить
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Edge Configuration */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Связи</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div>
                  <Label className="mb-1 block text-xs">От узла</Label>
                  <Select value={newEdgeFrom} onValueChange={setNewEdgeFrom}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1 block text-xs">К узлу</Label>
                  <Select value={newEdgeTo} onValueChange={setNewEdgeTo}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1 block text-xs">Метка (опционально)</Label>
                  <Input
                    placeholder="Да / Нет"
                    value={newEdgeLabel}
                    onChange={(e) => setNewEdgeLabel(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addEdge}
                  disabled={!newEdgeFrom || !newEdgeTo}
                  className="w-full gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Добавить связь
                </Button>

                <Separator className="my-1" />

                <ScrollArea className="max-h-32">
                  <div className="flex flex-col gap-1.5">
                    {edges.map((edge) => {
                      const fromNode = nodes.find((n) => n.id === edge.from);
                      const toNode = nodes.find((n) => n.id === edge.to);
                      return (
                        <div
                          key={edge.id}
                          className="flex items-center justify-between rounded border px-2 py-1.5 text-xs"
                        >
                          <div className="flex items-center gap-1">
                            <span>{fromNode?.label ?? edge.from}</span>
                            <ArrowRight className="size-3 text-muted-foreground" />
                            <span>{toNode?.label ?? edge.to}</span>
                            {edge.label && (
                              <Badge variant="outline" className="ml-1 text-[10px]">
                                {edge.label}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-5 text-muted-foreground hover:text-rose-500"
                            onClick={() => removeEdge(edge.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Canvas Area */}
          <motion.div variants={sectionVariants}>
            <Card className="min-h-[400px]">
              <CardHeader>
                <CardTitle className="text-base">Воркфлоу</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Visual representation of nodes and edges */}
                <div className="relative min-h-[350px] rounded-lg border bg-muted/30 p-4">
                  {/* Render edges as SVG lines */}
                  <svg className="pointer-events-none absolute inset-0 size-full">
                    {edges.map((edge) => {
                      const fromNode = nodes.find((n) => n.id === edge.from);
                      const toNode = nodes.find((n) => n.id === edge.to);
                      if (!fromNode || !toNode) return null;
                      return (
                        <g key={edge.id}>
                          <line
                            x1={fromNode.position.x + 80}
                            y1={fromNode.position.y + 25}
                            x2={toNode.position.x}
                            y2={toNode.position.y + 25}
                            stroke="currentColor"
                            className="text-muted-foreground/50"
                            strokeWidth="2"
                            strokeDasharray="6 3"
                          />
                          {edge.label && (
                            <text
                              x={(fromNode.position.x + 80 + toNode.position.x) / 2}
                              y={(fromNode.position.y + 25 + toNode.position.y + 25) / 2 - 8}
                              className="fill-muted-foreground text-[10px]"
                              textAnchor="middle"
                            >
                              {edge.label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Render nodes as cards */}
                  <div className="relative">
                    {nodes.map((node) => {
                      const nodeType = workflowNodeTypes.find(
                        (nt) => nt.type === node.type,
                      );
                      const isSelected = selectedNode === node.id;
                      return (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            x: node.position.x,
                            y: node.position.y,
                          }}
                          className={`absolute flex items-center gap-2 rounded-lg border-2 px-4 py-2 ${
                            nodeType?.color ?? 'bg-muted'
                          } ${isSelected ? 'border-primary shadow-lg' : 'border-transparent'}`}
                          onClick={() => setSelectedNode(node.id)}
                        >
                          <span className="text-sm">{nodeType?.icon}</span>
                          <span className="whitespace-nowrap text-sm font-medium">
                            {node.label}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-5 -mr-2 text-muted-foreground hover:text-rose-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNode(node.id);
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {nodes.length === 0 && (
                    <div className="flex h-[300px] items-center justify-center">
                      <div className="text-center">
                        <Workflow className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                          Добавьте узлы из боковой панели
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Node List */}
                <div className="mt-4">
                  <Label className="mb-2 block text-sm font-medium">Список узлов</Label>
                  <div className="flex flex-col gap-1.5">
                    {nodes.map((node) => {
                      const nodeType = workflowNodeTypes.find(
                        (nt) => nt.type === node.type,
                      );
                      return (
                        <div
                          key={node.id}
                          className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span>{nodeType?.icon}</span>
                            <span className="font-medium">{node.label}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {node.type}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-rose-500"
                            onClick={() => removeNode(node.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex gap-3 pb-8"
        >
          <Button className="gap-2">
            <Play className="size-4" />
            Запустить воркфлоу
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="size-4" />
            Сохранить
          </Button>
        </motion.div>
      </div>
    </ScrollArea>
  );
}
