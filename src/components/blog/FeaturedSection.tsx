import React from 'react';
import { motion } from 'motion/react';
import { Mic, Award, Download, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import BJJImage from '@/src/components/BJJImage';
import { BlogPost } from '@/src/types';

const formatBrazilianDate = (dateStr: string): string => {
  if (!dateStr) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      if (year.length === 4 && month.length === 2 && day.length === 2) {
        return `${day}/${month}/${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {}
  return dateStr;
};

interface FeaturedSectionProps {
  filteredBlogPosts: BlogPost[];
  setSelectedBlogPost: (post: BlogPost) => void;
  BlogShareButton: React.FC<{ post: BlogPost, variant?: any }>;
  offlineSavedPostIds: string[];
  isDownloadingPostId: string | null;
  toggleSaveOffline: (post: BlogPost) => void;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  filteredBlogPosts,
  setSelectedBlogPost,
  BlogShareButton,
  offlineSavedPostIds,
  isDownloadingPostId,
  toggleSaveOffline
}) => {
  if (filteredBlogPosts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Main Featured Editorial */}
      <div className="lg:col-span-8">
        <motion.article
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
          className="group cursor-pointer"
          onClick={() => setSelectedBlogPost(filteredBlogPosts[0])}
        >
          <div className="aspect-[16/9] bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative mb-10">
            <BJJImage 
              src={filteredBlogPosts[0].imageUrl} 
              alt={filteredBlogPosts[0].title} 
              className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105" 
            />
            <div className="absolute top-8 left-8">
              <Badge className="bg-green-600 text-white border-none rounded-none font-black text-[10px] tracking-[0.4em] px-4 py-2 uppercase">ANALYSIS</Badge>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveOffline(filteredBlogPosts[0]);
              }}
              disabled={isDownloadingPostId === filteredBlogPosts[0].id}
              className={`absolute top-8 right-8 px-3 py-2 border backdrop-blur-md transition-all text-[9px] font-mono font-black uppercase flex items-center justify-center gap-2 rounded-none z-10 ${
                offlineSavedPostIds.includes(filteredBlogPosts[0].id)
                  ? 'bg-green-600/95 text-white border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                  : 'bg-black/70 hover:bg-black text-zinc-400 hover:text-white border-zinc-800'
              }`}
              title={offlineSavedPostIds.includes(filteredBlogPosts[0].id) ? "Remover dos salvos offline" : "Salvar artigo para ler/ouvir offline"}
            >
              {isDownloadingPostId === filteredBlogPosts[0].id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : offlineSavedPostIds.includes(filteredBlogPosts[0].id) ? (
                <>
                  <Check size={10} className="stroke-[3]" />
                  <span>SALVO OFFLINE</span>
                </>
              ) : (
                <>
                  <Download size={10} />
                  <span>BAIXAR OFFLINE</span>
                </>
              )}
            </button>
          </div>
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">
              <span>{formatBrazilianDate(filteredBlogPosts[0].date)}</span>
              <span className="w-2 h-2 rounded-full bg-green-600"></span>
              <span>{filteredBlogPosts[0].category}</span>
              <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
              <span>{filteredBlogPosts[0].readTime || '5 MIN READ'}</span>
              {filteredBlogPosts[0].hasAudio && (
                <>
                  <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
                  <div className="flex items-center gap-1 text-green-600 animate-pulse">
                    <Mic size={10} />
                    <span>AUDIO</span>
                  </div>
                </>
              )}
            </div>
            {filteredBlogPosts[0].role && (
              <div className="mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 px-3 py-1 border border-red-600/20 bg-red-600/5">
                  {filteredBlogPosts[0].role}
                </span>
              </div>
            )}
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-8 group-hover:text-green-600 transition-colors italic-serif -skew-x-3">{filteredBlogPosts[0].title}</h3>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-10 pl-8 border-l-4 border-red-600 italic">
              "{filteredBlogPosts[0].excerpt}"
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button className="bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs px-12 py-8 rounded-none shadow-2xl">INICIAR LEITURA TÉCNICA</Button>
              <BlogShareButton post={filteredBlogPosts[0]} />
            </div>
          </div>
        </motion.article>
      </div>

      {/* Vertical Editorial Strip */}
      <div className="lg:col-span-4 space-y-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-300 mb-8 border-b border-zinc-100 dark:border-zinc-900 pb-4">MAIS RECENTES</h4>
        <ScrollArea className="h-[1000px] pr-4">
          <div className="space-y-12">
            {filteredBlogPosts.slice(1, 5).map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer flex gap-6"
                onClick={() => setSelectedBlogPost(post)}
              >
                <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-950 shrink-0 overflow-hidden relative">
                  <BJJImage src={post.imageUrl} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveOffline(post);
                    }}
                    disabled={isDownloadingPostId === post.id}
                    className={`absolute bottom-1.5 right-1.5 p-1 border backdrop-blur-md transition-all rounded-none z-10 ${
                      offlineSavedPostIds.includes(post.id)
                        ? 'bg-green-600/90 text-white border-green-500 shadow-[0_0_6px_rgba(34,197,94,0.3)]'
                        : 'bg-black/80 hover:bg-black text-zinc-400 hover:text-white border-zinc-900/60'
                    }`}
                    title={offlineSavedPostIds.includes(post.id) ? "Remover dos salvos" : "Salvar offline"}
                  >
                    {isDownloadingPostId === post.id ? (
                      <Loader2 size={8} className="animate-spin" />
                    ) : offlineSavedPostIds.includes(post.id) ? (
                      <Check size={8} className="stroke-[3]" />
                    ) : (
                      <Download size={8} />
                    )}
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[8px] font-mono font-black uppercase tracking-widest text-red-600">{post.category}</span>
                    <span className="text-[8px] font-mono font-bold text-zinc-400">{post.readTime || '4min'}</span>
                  </div>
                  {post.role && (
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500 mb-1 block opacity-70">
                      {post.role}
                    </span>
                  )}
                  <h5 className="text-sm font-black uppercase tracking-tight leading-tight group-hover:text-red-500 transition-colors line-clamp-2 mb-2">{post.title}</h5>
                  <BlogShareButton post={post} variant="ghost" />
                </div>
              </motion.article>
            ))}
          </div>
        </ScrollArea>
        
        {/* Sponsored Advertisement Placeholder */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-4">ESPAÇO RESERVADO PARA MARCA</p>
          <div className="aspect-[4/5] bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-6 grayscale opacity-20">
            <Award size={48} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 italic">"Transforme sua técnica com equipamentos de elite."</p>
          <Button variant="outline" className="w-full border-black dark:border-white text-[9px] font-black px-4 py-3 rounded-none">CONHECER MARCA</Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedSection;
