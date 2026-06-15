'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug,
  Plus,
  Trash2,
  Power,
  PowerOff,
  ChevronDown,
  ChevronUp,
  Eye,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockMCPServers } from '@/data/view-data';
import type { MCPServer, MCPTool } from '@/types';

interface MCPServerState extends MCPServer {
  connected: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export function MCPManagerView() {
  const [servers, setServers] = useState<MCPServerState[]>(
    mockMCPServers.map((s) => ({ ...s, connected: false })),
  );
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newName, setNewName] = useState('');
  const [newCommand, setNewCommand] = useState('');
  const [newArgs, setNewArgs] = useState('');
  const [newEnv, setNewEnv] = useState('');

  const toggleConnection = (id: string) => {
    setServers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, connected: !s.connected } : s,
      ),
    );
  };

  const addServer = () => {
    if (!newName.trim() || !newCommand.trim()) return;
    const newServer: MCPServerState = {
      id: `mcp-${Date.now()}`,
      slug: newName.toLowerCase().replace(/\s+/g, '-'),
      name: newName.trim(),
      description: '',
      command: newCommand.trim(),
      args: newArgs
        .split(' ')
        .map((a) => a.trim())
        .filter(Boolean),
      env: newEnv
        .split('\n')
        .reduce<Record<string, string>>((acc, line) => {
          const [key, ...val] = line.split('=');
          if (key?.trim()) acc[key.trim()] = val.join('=').trim();
          return acc;
        }, {}),
      tools: [],
      mode: 'educational',
      connected: false,
    };
    setServers((prev) => [...prev, newServer]);
    setNewName('');
    setNewCommand('');
    setNewArgs('');
    setNewEnv('');
    setShowAddForm(false);
  };

  const removeServer = (id: string) => {
    setServers((prev) => prev.filter((s) => s.id !== id));
    if (selectedServer === id) {
      setSelectedServer(null);
      setSelectedTool(null);
    }
  };

  const activeServer = servers.find((s) => s.id === selectedServer);

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
              <Plug className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MCP-серверы</h1>
              <p className="text-sm text-muted-foreground">
                Управление Model Context Protocol серверами и инструментами
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="size-3.5" />
            Добавить сервер
          </Button>
        </motion.div>

        {/* Add Server Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="size-4" />
                    Новый MCP-сервер
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-sm">Название</Label>
                    <Input
                      placeholder="My MCP Server"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Команда</Label>
                    <Input
                      placeholder="npx -y @mcp/server"
                      value={newCommand}
                      onChange={(e) => setNewCommand(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Аргументы (через пробел)</Label>
                    <Input
                      placeholder="arg1 arg2 arg3"
                      value={newArgs}
                      onChange={(e) => setNewArgs(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Переменные окружения (KEY=VALUE)</Label>
                    <Textarea
                      placeholder="API_KEY=xxx&#10;DEBUG=true"
                      value={newEnv}
                      onChange={(e) => setNewEnv(e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      onClick={addServer}
                      disabled={!newName.trim() || !newCommand.trim()}
                      className="gap-1.5"
                    >
                      <Plus className="size-3.5" />
                      Добавить сервер
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 lg:grid-cols-[1fr_1fr]"
        >
          {/* Server List */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Серверы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {servers.map((server) => (
                    <div
                      key={server.id}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        selectedServer === server.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedServer(server.id);
                        setSelectedTool(null);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">{server.name}</h3>
                            <Badge
                              variant={server.connected ? 'default' : 'outline'}
                              className={
                                server.connected
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : ''
                              }
                            >
                              {server.connected ? 'Подключён' : 'Отключён'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {server.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {server.command}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {server.tools.length} инструментов
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`size-8 ${
                              server.connected
                                ? 'text-emerald-500 hover:text-emerald-600'
                                : 'text-muted-foreground hover:text-emerald-500'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleConnection(server.id);
                            }}
                            title={server.connected ? 'Отключить' : 'Подключить'}
                          >
                            {server.connected ? (
                              <Power className="size-4" />
                            ) : (
                              <PowerOff className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-rose-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeServer(server.id);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tool Inspector */}
          <motion.div variants={sectionVariants}>
            <Card className="min-h-[300px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="size-4" />
                  Инспектор инструментов
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeServer ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-sm font-semibold">{activeServer.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {activeServer.description || 'Без описания'}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <Label className="mb-2 block text-sm">Доступные инструменты</Label>
                      {activeServer.tools.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {activeServer.tools.map((tool) => (
                            <button
                              key={tool.name}
                              onClick={() => setSelectedTool(tool)}
                              className={`rounded-lg border p-3 text-left transition-colors ${
                                selectedTool?.name === tool.name
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="text-sm font-medium">{tool.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {tool.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-center text-xs text-muted-foreground">
                          Нет доступных инструментов. Подключите сервер для загрузки.
                        </p>
                      )}
                    </div>

                    {/* Tool Schema */}
                    <AnimatePresence>
                      {selectedTool && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Separator className="mb-4" />
                          <div>
                            <Label className="mb-2 block text-sm">Схема ввода</Label>
                            <div className="rounded-lg bg-muted p-3">
                              <pre className="overflow-x-auto text-xs">
                                {JSON.stringify(selectedTool.inputSchema, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center">
                    <div className="text-center">
                      <Plug className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        Выберите сервер для просмотра инструментов
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </ScrollArea>
  );
}
