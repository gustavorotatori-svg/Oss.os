import React from 'react';
import { Search, Filter, Newspaper, ChevronDown, X, Layers, BookOpen, Trophy, Compass, Mic, Star, Dumbbell, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BlogSearchFiltersProps {
  blogSearchQuery: string;
  setBlogSearchQuery: (query: string) => void;
  selectedBlogCategory: string;
  setSelectedBlogCategory: (category: string) => void;
  blogDateFilter: string;
  setBlogDateFilter: (filter: any) => void;
  setBlogPage: (page: number) => void;
  isOfflineOnly: boolean;
  setIsOfflineOnly: (val: boolean) => void;
  offlineSavedCount: number;
}

const CATEGORY_CHIPS = [
  { id: 'Todas', label: 'Todas Categorias', icon: Layers },
  { id: 'Tutorial', label: 'Tutorials / Técnica', icon: BookOpen },
  { id: 'Results', label: 'Results / Resultados', icon: Trophy },
  { id: 'Philosophy', label: 'Philosophy / Sabedoria', icon: Compass },
  { id: 'Guia de Kimonos', label: 'Guia de Kimonos', icon: ShieldCheck },
  { id: 'Reviews de Marcas', label: 'Reviews de Marcas', icon: Star },
  { id: 'Dicas de Treino', label: 'Dicas de Treino', icon: Dumbbell },
  { id: 'Podcast', label: 'Podcast', icon: Mic },
  { id: 'News', label: 'Notícias', icon: Newspaper },
];

const BlogSearchFilters: React.FC<BlogSearchFiltersProps> = ({
  blogSearchQuery,
  setBlogSearchQuery,
  selectedBlogCategory,
  setSelectedBlogCategory,
  blogDateFilter,
  setBlogDateFilter,
  setBlogPage,
  isOfflineOnly,
  setIsOfflineOnly,
  offlineSavedCount
}) => {
  return (
    <div className="mb-16 p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
      {/* Category Quick Filter Pills / Chips */}
      <div className="mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Filter size={12} className="text-red-600" /> Filtrar por Categoria
          </span>
          {selectedBlogCategory !== 'Todas' && (
            <button
              onClick={() => {
                setSelectedBlogCategory('Todas');
                setBlogPage(1);
              }}
              className="text-[9px] font-mono font-bold uppercase text-red-600 hover:underline cursor-pointer"
            >
              Resetar Categoria
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 pt-1 -mx-2 px-2">
          {CATEGORY_CHIPS.map((chip) => {
            const Icon = chip.icon;
            const isSelected = 
              selectedBlogCategory === chip.id ||
              (chip.id === 'Tutorial' && (selectedBlogCategory === 'Tutorials' || selectedBlogCategory === 'Tutorial')) ||
              (chip.id === 'Results' && (selectedBlogCategory === 'Resultados' || selectedBlogCategory === 'Results')) ||
              (chip.id === 'Philosophy' && (selectedBlogCategory === 'Philosophy' || selectedBlogCategory === 'Sabedoria'));

            return (
              <button
                key={chip.id}
                onClick={() => {
                  setSelectedBlogCategory(chip.id);
                  setBlogPage(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-[10px] font-mono font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer border rounded-none ${
                  isSelected
                    ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600'
                }`}
                id={`btn-cat-chip-${chip.id.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon size={12} className={isSelected ? 'text-white' : 'text-zinc-400'} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Search Inputs & Select Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <Input 
            placeholder="BUSCAR NO SCOUT TÉCNICO..." 
            className="pl-12 py-6 rounded-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-mono text-xs uppercase tracking-widest focus:ring-red-600 w-full"
            value={blogSearchQuery}
            onChange={(e) => {
              setBlogSearchQuery(e.target.value);
              setBlogPage(1);
            }}
            id="input-blog-search"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] font-black uppercase tracking-widest appearance-none rounded-none outline-none focus:border-red-600 transition-colors"
            value={selectedBlogCategory}
            onChange={(e) => {
              setSelectedBlogCategory(e.target.value);
              setBlogPage(1);
            }}
            id="select-blog-category"
          >
            <option value="Todas">TODAS CATEGORIAS</option>
            <option value="Tutorial">TUTORIALS / TÉCNICA</option>
            <option value="Results">RESULTS / RESULTADOS</option>
            <option value="Philosophy">PHILOSOPHY / SABEDORIA</option>
            <option value="Guia de Kimonos">GUIA DE KIMONOS</option>
            <option value="Reviews de Marcas">REVIEWS DE MARCAS</option>
            <option value="Dicas de Treino">DICAS DE TREINO</option>
            <option value="Entrevistas">ENTREVISTAS</option>
            <option value="News">NOTÍCIAS</option>
            <option value="Mindset">MINDSET</option>
            <option value="Podcast">PODCAST</option>
            <option value="Lifestyle">ESTILO DE VIDA</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
        </div>

        <div className="relative">
          <Newspaper className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] font-black uppercase tracking-widest appearance-none rounded-none outline-none focus:border-red-600 transition-colors"
            value={blogDateFilter}
            onChange={(e) => {
              setBlogDateFilter(e.target.value as any);
              setBlogPage(1);
            }}
            id="select-blog-date"
          >
            <option value="all">TODO O TEMPO</option>
            <option value="week">ÚLTIMA SEMANA</option>
            <option value="month">ÚLTIMO MÊS</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Offline Mode Toggle Banner */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isOfflineOnly ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
          <div>
            <p className="text-[10px] font-mono font-black uppercase tracking-widest text-[#222] dark:text-zinc-400">
              Disponibilidade Sem Conexão ({offlineSavedCount} itens salvos)
            </p>
            <p className="text-[9px] text-zinc-500 dark:text-zinc-500 font-sans tracking-wide">
              Os artigos e podcasts marcados ficam armazenados no seu dispositivo para acesso a qualquer momento.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsOfflineOnly(!isOfflineOnly);
            setBlogPage(1);
          }}
          className={`px-5 py-2 text-[9px] font-mono font-black uppercase border transition-all rounded-none tracking-widest flex items-center justify-center gap-2 w-full sm:w-auto ${
            isOfflineOnly
              ? 'bg-red-600 border-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]'
              : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white'
          }`}
          id="btn-toggle-offline-blog"
        >
          {isOfflineOnly ? '🟢 FILTRANDO SALVOS (OFFLINE)' : '📥 MOSTRAR APENAS SALVOS'}
        </button>
      </div>
      
      {(blogSearchQuery || selectedBlogCategory !== 'Todas' || blogDateFilter !== 'all') && (
        <div className="mt-6 flex flex-wrap items-center gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] font-mono font-black uppercase text-zinc-400">Resultados para:</span>
          {blogSearchQuery && (
            <div className="inline-flex items-center rounded-none border border-red-600/30 text-red-600 font-mono text-[9px] uppercase tracking-widest bg-red-50 dark:bg-red-950/20 px-2.5 py-1 gap-2">
               Termo: {blogSearchQuery}
               <X size={10} className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => setBlogSearchQuery('')} />
            </div>
          )}
          {selectedBlogCategory !== 'Todas' && (
            <div className="inline-flex items-center rounded-none border border-red-600/30 text-red-600 font-mono text-[9px] uppercase tracking-widest bg-red-50 dark:bg-red-950/20 px-2.5 py-1 gap-2">
               Categoria: {selectedBlogCategory}
               <X size={10} className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => setSelectedBlogCategory('Todas')} />
            </div>
          )}
          {blogDateFilter !== 'all' && (
            <div className="inline-flex items-center rounded-none border border-red-600/30 text-red-600 font-mono text-[9px] uppercase tracking-widest bg-red-50 dark:bg-red-950/20 px-2.5 py-1 gap-2">
               Data: {blogDateFilter === 'week' ? 'Semana' : 'Mês'}
               <X size={10} className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => setBlogDateFilter('all')} />
            </div>
          )}
          <button 
            onClick={() => {
              setBlogSearchQuery('');
              setSelectedBlogCategory('Todas');
              setBlogDateFilter('all');
              setBlogPage(1);
            }}
            className="ml-auto text-[9px] font-mono font-black uppercase text-zinc-400 hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 cursor-pointer"
            id="btn-clear-blog-filters"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogSearchFilters;
