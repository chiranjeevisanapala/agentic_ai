import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Sparkles, Filter, Database, CheckCircle2 } from 'lucide-react';
import { KnowledgeArticle } from '../../types/knowledge';
import { MOCK_KNOWLEDGE_ARTICLES } from '../../services/mockData';
import { getKnowledgeArticlesApi } from '../../services/api';
import { ArticleCard } from './ArticleCard';

export const KnowledgeExplorer: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>(MOCK_KNOWLEDGE_ARTICLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const fetched = await getKnowledgeArticlesApi();
    if (fetched && fetched.length > 0) setArticles(fetched);
  };

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.article_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              <span>Vector Knowledge Base (RAG)</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              Vector Indexed
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Internal customer support policy documents, refund limits, SLA terms, and security runbooks retrieved by the Knowledge Agent.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Vector Index: 100% Synced</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Test vector similarity query (e.g. duplicate charge refund, 2FA reset, 429 rate limit)..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Billing & Payments">Billing & Payments</option>
            <option value="Subscription & Plans">Subscription & Plans</option>
            <option value="Account & Security">Account & Security</option>
            <option value="Technical Support">Technical Support</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};
