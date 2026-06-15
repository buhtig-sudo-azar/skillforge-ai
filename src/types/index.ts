// AI Engineering Platform — Core Type Definitions
// ALL IS SKILL: every entity is a Skill or composition of Skills

// ============================================================
// NAVIGATION
// ============================================================

export type ViewType =
  | 'home'
  | 'category'
  | 'topic'
  | 'skill'
  | 'sandbox'
  | 'chat'
  | 'agent-builder'
  | 'workflow-builder'
  | 'mcp-manager'
  | 'rag-manager'
  | 'models'
  | 'security'
  | 'admin'
  | 'achievements';

export interface NavigationState {
  currentView: ViewType;
  currentCategory: string | null;
  currentSubtopic: string | null;
  currentSkill: string | null;
  currentSandbox: string | null;
  sidebarOpen: boolean;
}

// ============================================================
// SKILL ENGINE
// ============================================================

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: SkillCategory;
  level: SkillLevel;
  yamlFront?: string;
  body: string;
  tags: string[];
  version: number;
  isPublic: boolean;
  authorId?: string;
  templates: SkillTemplate[];
  examples: SkillExample[];
}

export type SkillCategory =
  | 'prompt'
  | 'agent'
  | 'tool'
  | 'mcp'
  | 'rag'
  | 'workflow'
  | 'architecture'
  | 'security';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SkillTemplate {
  id: string;
  name: string;
  content: string;
  language?: string;
  order: number;
}

export interface SkillExample {
  id: string;
  title: string;
  input: string;
  output: string;
  order: number;
}

export interface SkillResult {
  id: string;
  userId: string;
  skillId: string;
  passed: boolean;
  score: number;
  feedback?: string;
}

// ============================================================
// LESSON ENGINE
// ============================================================

export interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  gradient?: string;
  order: number;
  category: TopicCategory;
  isPublic: boolean;
  subtopics: Subtopic[];
}

export type TopicCategory =
  | 'skills'
  | 'agents'
  | 'chatbots'
  | 'sandboxes'
  | 'workflows'
  | 'mcp'
  | 'rag'
  | 'models'
  | 'security';

export interface Subtopic {
  id: string;
  topicId: string;
  slug: string;
  title: string;
  order: number;
  introduction: IntroductionData;
  theory: TheoryData;
  diagramType?: DiagramType;
  diagramData?: DiagramData;
  examples: ExampleData[];
  sandboxType?: SandboxType;
  sandboxConfig?: SandboxConfigData;
  commonMistakes: CommonMistake[];
}

export interface IntroductionData {
  what: string;
  why: string;
  where: string;
  problem: string;
}

export interface TheoryData {
  terms: Term[];
  principles: string[];
  architecture: string;
  connections: string[];
}

export interface Term {
  name: string;
  definition: string;
}

export interface ExampleData {
  title: string;
  code: string;
  language: string;
  explanation: string;
}

export interface CommonMistake {
  error: string;
  explanation: string;
  correct: string;
}

// ============================================================
// DIAGRAMS
// ============================================================

export type DiagramType =
  | 'flow'
  | 'tree'
  | 'graph'
  | 'cause-effect'
  | 'attack-tree'
  | 'knowledge-map';

export type DiagramData =
  | FlowDiagramData
  | TreeDiagramData
  | GraphDiagramData
  | CauseEffectData
  | AttackTreeData
  | KnowledgeMapData;

export interface FlowDiagramData {
  type: 'flow';
  nodes: { id: string; label: string; type?: 'start' | 'process' | 'decision' | 'end' }[];
  edges: { from: string; to: string; label?: string }[];
}

export interface TreeDiagramData {
  type: 'tree';
  root: TreeNode;
}

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export interface GraphDiagramData {
  type: 'graph';
  nodes: { id: string; label: string; group?: string }[];
  edges: { from: string; to: string; label?: string; weight?: number }[];
}

export interface CauseEffectData {
  type: 'cause-effect';
  causes: { id: string; label: string }[];
  effects: { id: string; label: string }[];
  connections: { cause: string; effect: string }[];
}

export interface AttackTreeData {
  type: 'attack-tree';
  goal: string;
  children: AttackTreeNode[];
}

export interface AttackTreeNode {
  id: string;
  label: string;
  type: 'AND' | 'OR';
  children?: AttackTreeNode[];
}

export interface KnowledgeMapData {
  type: 'knowledge-map';
  concepts: { id: string; label: string; description: string }[];
  relations: { from: string; to: string; label: string }[];
}

// ============================================================
// SANDBOX ENGINE
// ============================================================

export type SandboxType =
  | 'prompt'
  | 'agent'
  | 'tool'
  | 'mcp'
  | 'rag'
  | 'workflow'
  | 'architecture';

export interface SandboxConfigData {
  presets: SandboxPreset[];
  defaultSystemPrompt?: string;
  mode: 'educational' | 'advanced';
}

export interface SandboxPreset {
  name: string;
  description: string;
  payload: string;
  systemPrompt: string;
}

export interface SandboxRun {
  id: string;
  sandboxSlug: string;
  input: string;
  output?: string;
  systemPrompt?: string;
  model?: string;
  success?: boolean;
  feedback?: string;
}

// ============================================================
// CHATBOT ENGINE
// ============================================================

export interface AgentPersona {
  id: string;
  slug: string;
  name: string;
  role: string;
  avatar: string;
  gradient: string;
  greeting: string;
  systemPrompt: string;
  suggestions: string[];
  category: string;
  order: number;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  model: string;
  tokens?: number;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  agentSlug: string;
  model: string;
  messages: ChatMessage[];
  createdAt: Date;
}

// ============================================================
// AGENT ENGINE
// ============================================================

export interface AgentTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  skills: string[];
  systemPrompt: string;
  tools: ToolDefinition[];
  mode: 'educational' | 'advanced';
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
}

export interface ToolParameter {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
}

// ============================================================
// WORKFLOW ENGINE
// ============================================================

export interface WorkflowTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  mode: 'educational' | 'advanced';
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'skill' | 'agent' | 'tool' | 'condition' | 'output';
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

// ============================================================
// MCP ENGINE
// ============================================================

export interface MCPServer {
  id: string;
  slug: string;
  name: string;
  description: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  tools: MCPTool[];
  mode: 'educational' | 'advanced';
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

// ============================================================
// RAG ENGINE
// ============================================================

export interface KnowledgeBase {
  id: string;
  slug: string;
  name: string;
  description: string;
  documents: DocumentInfo[];
  chunkSize: number;
  overlap: number;
  embedding: 'local' | 'openai' | 'cohere';
}

export interface DocumentInfo {
  id: string;
  title: string;
  source?: string;
  chunkCount: number;
  createdAt: Date;
}

export interface RAGQuery {
  query: string;
  knowledgeBaseSlug: string;
  topK?: number;
}

export interface RAGResult {
  chunks: { text: string; score: number; source: string }[];
  answer: string;
}

// ============================================================
// MODEL SYSTEM
// ============================================================

export interface ModelConfig {
  id: string;
  slug: string;
  name: string;
  provider: 'openrouter' | 'openai' | 'anthropic' | 'local';
  modelId: string;
  isFree: boolean;
  contextWindow?: number;
  maxTokens?: number;
  enabled: boolean;
}

export interface ModelInfo {
  model: string;
  rateLimited: string[];
}

// ============================================================
// SECURITY ENGINE
// ============================================================

export interface SecurityRule {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: SecurityCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern?: string;
  action: 'block' | 'warn' | 'log' | 'sanitize';
  enabled: boolean;
}

export type SecurityCategory =
  | 'input-validation'
  | 'output-filter'
  | 'rate-limit'
  | 'auth'
  | 'data-protection';

// ============================================================
// GAMIFICATION
// ============================================================

export interface ProgressState {
  totalXP: number;
  level: number;
  streak: number;
  longestStreak: number;
  completedTopics: string[];
  completedSkills: string[];
  achievements: string[];
}

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  earned?: boolean;
  earnedAt?: Date;
}

// ============================================================
// ADMIN
// ============================================================

export interface AdminStats {
  totalUsers: number;
  totalSkills: number;
  totalTopics: number;
  totalSandboxRuns: number;
  totalChatSessions: number;
  activeUsersToday: number;
}
