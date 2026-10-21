import React, { useState } from 'react';
import { BookOpen, X, Search, Terminal, Lightbulb } from 'lucide-react';
import { GLOSSARY } from '../data/glossary';
import type { GlossaryItem } from '../data/glossary';
import { soundEngine } from '../services/soundEngine';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Workloads', 'Networking', 'Configuration', 'Troubleshooting', 'Cluster Architecture'];

  const filteredItems = GLOSSARY.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Kubernetes Field Manual &amp; Glossary
              </h2>
              <p className="text-xs text-slate-400">
                Core concepts, real-world analogies, and command cheatsheet
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category filter */}
        <div className="pt-3 pb-2 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search concepts (e.g. Pod, CrashLoopBackOff, Ingress)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedCategory(cat);
                }}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white shadow-sm glow-cyan'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Concepts */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredItems.map((item, idx) => (
            <GlossaryCard key={idx} item={item} />
          ))}
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching Kubernetes concepts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GlossaryCard: React.FC<{ item: GlossaryItem }> = ({ item }) => {
  return (
    <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-cyan-300 font-mono">{item.term}</h3>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {item.category}
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>

      {/* Analogy */}
      <div className="flex items-start gap-2 bg-amber-950/20 border border-amber-900/30 p-2 rounded-lg text-[11px] text-amber-200/90">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-400">Real-World Analogy: </span>
          <span>{item.analogy}</span>
        </div>
      </div>

      {/* Kubectl Command */}
      <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 text-[11px] font-mono text-sky-300">
        <div className="flex items-center gap-1.5 truncate">
          <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{item.keyCommand}</span>
        </div>
      </div>
    </div>
  );
};
