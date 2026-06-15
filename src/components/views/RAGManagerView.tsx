'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  Trash2,
  Loader2,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { mockKnowledgeBases, mockRAGResults } from '@/data/view-data';
import type { KnowledgeBase, DocumentInfo } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export function RAGManagerView() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(mockKnowledgeBases);
  const [selectedKB, setSelectedKB] = useState<string | null>(mockKnowledgeBases[0]?.slug ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof mockRAGResults | null>(null);
  const [showAddKB, setShowAddKB] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);

  // Add KB form
  const [newKBName, setNewKBName] = useState('');
  const [newKBDesc, setNewKBDesc] = useState('');
  const [newKBChunkSize, setNewKBChunkSize] = useState([512]);
  const [newKBOverlap, setNewKBOverlap] = useState([64]);

  // Add document form
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  const activeKB = knowledgeBases.find((kb) => kb.slug === selectedKB);

  const addKnowledgeBase = () => {
    if (!newKBName.trim()) return;
    const newKB: KnowledgeBase = {
      id: `kb-${Date.now()}`,
      slug: newKBName.toLowerCase().replace(/\s+/g, '-'),
      name: newKBName.trim(),
      description: newKBDesc.trim(),
      documents: [],
      chunkSize: newKBChunkSize[0],
      overlap: newKBOverlap[0],
      embedding: 'local',
    };
    setKnowledgeBases((prev) => [...prev, newKB]);
    setNewKBName('');
    setNewKBDesc('');
    setShowAddKB(false);
  };

  const addDocument = () => {
    if (!newDocTitle.trim() || !activeKB) return;
    const newDoc: DocumentInfo = {
      id: `d-${Date.now()}`,
      title: newDocTitle.trim(),
      source: `${newDocTitle.trim().replace(/\s+/g, '-')}.md`,
      chunkCount: Math.ceil(newDocContent.length / activeKB.chunkSize) || 1,
      createdAt: new Date(),
    };
    setKnowledgeBases((prev) =>
      prev.map((kb) =>
        kb.slug === selectedKB
          ? { ...kb, documents: [...kb.documents, newDoc] }
          : kb,
      ),
    );
    setNewDocTitle('');
    setNewDocContent('');
    setShowAddDoc(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    // Simulate search
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSearchResults(mockRAGResults);
    setIsSearching(false);
  };

  const removeDocument = (docId: string) => {
    setKnowledgeBases((prev) =>
      prev.map((kb) =>
        kb.slug === selectedKB
          ? { ...kb, documents: kb.documents.filter((d) => d.id !== docId) }
          : kb,
      ),
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">RAG — Базы знаний</h1>
              <p className="text-sm text-muted-foreground">
                Управление базами знаний и поиск информации
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowAddKB(!showAddKB)}
          >
            <Plus className="size-3.5" />
            Новая база
          </Button>
        </motion.div>

        {/* Add KB Form */}
        <AnimatePresence>
          {showAddKB && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Новая база знаний</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-sm">Название</Label>
                    <Input
                      placeholder="Моя база знаний"
                      value={newKBName}
                      onChange={(e) => setNewKBName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Описание</Label>
                    <Input
                      placeholder="Описание базы знаний"
                      value={newKBDesc}
                      onChange={(e) => setNewKBDesc(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">
                      Размер чанка: {newKBChunkSize[0]}
                    </Label>
                    <Slider
                      value={newKBChunkSize}
                      onValueChange={setNewKBChunkSize}
                      min={128}
                      max={2048}
                      step={64}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">
                      Перекрытие: {newKBOverlap[0]}
                    </Label>
                    <Slider
                      value={newKBOverlap}
                      onValueChange={setNewKBOverlap}
                      min={0}
                      max={256}
                      step={16}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      onClick={addKnowledgeBase}
                      disabled={!newKBName.trim()}
                      className="gap-1.5"
                    >
                      <Plus className="size-3.5" />
                      Создать базу знаний
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
          className="grid gap-6 lg:grid-cols-[320px_1fr]"
        >
          {/* KB List */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Базы знаний</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {knowledgeBases.map((kb) => (
                    <button
                      key={kb.id}
                      onClick={() => {
                        setSelectedKB(kb.slug);
                        setSearchResults(null);
                      }}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        selectedKB === kb.slug
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{kb.name}</h3>
                        <Badge variant="outline" className="text-[10px]">
                          {kb.documents.length} док.
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {kb.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          chunk: {kb.chunkSize}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          overlap: {kb.overlap}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Documents + Search */}
          <motion.div variants={sectionVariants} className="flex flex-col gap-6">
            {/* Document List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Документы</CardTitle>
                  {activeKB && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setShowAddDoc(!showAddDoc)}
                    >
                      <Upload className="size-3.5" />
                      Добавить документ
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {activeKB ? (
                  <>
                    <AnimatePresence>
                      {showAddDoc && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-4 overflow-hidden"
                        >
                          <div className="flex flex-col gap-3 rounded-lg border p-4">
                            <div>
                              <Label className="mb-1 block text-sm">Название документа</Label>
                              <Input
                                placeholder="Название файла"
                                value={newDocTitle}
                                onChange={(e) => setNewDocTitle(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="mb-1 block text-sm">Содержимое</Label>
                              <Textarea
                                placeholder="Вставьте текст документа..."
                                value={newDocContent}
                                onChange={(e) => setNewDocContent(e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>
                            <Button
                              size="sm"
                              onClick={addDocument}
                              disabled={!newDocTitle.trim()}
                              className="gap-1.5 self-start"
                            >
                              <Plus className="size-3.5" />
                              Добавить
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {activeKB.documents.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {activeKB.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="size-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium">{doc.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {doc.chunkCount} чанков · {doc.source}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-rose-500"
                              onClick={() => removeDocument(doc.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        Нет документов в этой базе знаний
                      </p>
                    )}
                  </>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Выберите базу знаний для просмотра документов
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Search Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Search className="size-4" />
                  Поиск в базе знаний
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Введите запрос для поиска..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim() || !activeKB}
                    className="gap-1.5"
                  >
                    {isSearching ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Search className="size-4" />
                    )}
                    Найти
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {isSearching ? (
                    <motion.div
                      key="searching"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center py-8"
                    >
                      <Loader2 className="mr-2 size-5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Поиск релевантных фрагментов...
                      </span>
                    </motion.div>
                  ) : searchResults ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-4"
                    >
                      {/* Retrieved chunks */}
                      <div>
                        <Label className="mb-2 block text-sm font-medium">
                          Найденные фрагменты
                        </Label>
                        <div className="flex flex-col gap-2">
                          {searchResults.chunks.map((chunk, i) => (
                            <div
                              key={i}
                              className="rounded-lg border p-3"
                            >
                              <div className="mb-1 flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">
                                  Релевантность: {(chunk.score * 100).toFixed(0)}%
                                </Badge>
                                <Badge variant="secondary" className="text-[10px]">
                                  {chunk.source}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{chunk.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Generated Answer */}
                      <div>
                        <Label className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                          <Sparkles className="size-3.5 text-primary" />
                          Сгенерированный ответ
                        </Label>
                        <div className="rounded-lg bg-primary/5 p-4">
                          <p className="text-sm">{searchResults.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </ScrollArea>
  );
}
