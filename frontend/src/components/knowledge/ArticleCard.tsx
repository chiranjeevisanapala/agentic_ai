import React from 'react';
import { BookOpen, Shield, Zap, Tag } from 'lucide-react';
import { KnowledgeArticle } from '../../types/knowledge';
import { CategoryBadge } from '../common/CategoryBadge';

interface ArticleCardProps {
  article: KnowledgeArticle;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-md space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400">
              {article.article_code}
            </span>
            <CategoryBadge category={article.category} />
          </div>
          <h3 className="text-sm font-bold text-white">{article.title}</h3>
        </div>

        {article.policy_reference && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
            {article.policy_reference}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed font-sans">
        {article.summary || article.content.slice(0, 200)}
      </p>

      {/* Permitted Automated Actions */}
      {article.action_permissions && article.action_permissions.length > 0 && (
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2 flex-wrap text-[11px]">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" /> Authorized Tools:
          </span>
          {article.action_permissions.map((act, idx) => (
            <span
              key={idx}
              className="font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px]"
            >
              {act}
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {article.tags.map((t, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
