export interface KnowledgeArticle {
  id: string;
  article_code: string;
  title: string;
  category: string;
  content: string;
  summary?: string;
  tags: string[];
  policy_reference?: string;
  action_permissions: string[];
  created_at?: string;
  updated_at?: string;
}

export interface KnowledgeSearchResult {
  id: string;
  article_code: string;
  title: string;
  category: string;
  snippet: string;
  score: number;
  policy_reference?: string;
  action_permissions: string[];
}
