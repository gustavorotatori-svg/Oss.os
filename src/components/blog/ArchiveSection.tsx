import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Download, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface ArchiveSectionProps {
  paginatedBlogPosts: BlogPost[];
  hasMoreBlogPosts: boolean;
  loadMoreBlogPosts: () => void;
  setSelectedBlogPost: (post: BlogPost) => void;
  BlogShareButton: React.FC<{ post: BlogPost, variant?: any }>;
  offlineSavedPostIds: string[];
  isDownloadingPostId: string | null;
  toggleSaveOffline: (post: BlogPost) => void;
}

const ArchiveSection: React.FC<ArchiveSectionProps> = ({
  paginatedBlogPosts,
  hasMoreBlogPosts,
  loadMoreBlogPosts,
  setSelectedBlogPost,
  BlogShareButton,
  offlineSavedPostIds,
  isDownloadingPostId,
  toggleSaveOffline
}) => {
  if (paginatedBlogPosts.length <= 5) return null;

  return (
    <div className="mt-24">
      <div className="flex items-center gap-4 mb-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-300">ARQUIVO TÉCNICO</h4>
        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-900" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {paginatedBlogPosts.slice(5).map((post, idx) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (idx % 3) * 0.1 }}
            className="group cursor-pointer"
            onClick={() => setSelectedBlogPost(post)}
          >
            <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-950 overflow-hidden mb-6 relative">
              <BJJImage src={post.imageUrl} alt={post.title} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveOffline(post);
                }}
                disabled={isDownloadingPostId === post.id}
                className={`absolute top-3 right-3 px-2 py-1.5 border backdrop-blur-md transition-all text-[8px] font-mono font-black uppercase flex items-center justify-center gap-1.5 rounded-none z-10 ${
                  offlineSavedPostIds.includes(post.id)
                    ? 'bg-green-600/95 text-white border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.35)]'
                    : 'bg-black/70 hover:bg-black text-zinc-400 hover:text-white border-zinc-805'
                }`}
                title={offlineSavedPostIds.includes(post.id) ? "Remover dos salvos offline" : "Salvar para ler offline de qualquer lugar"}
              >
                {isDownloadingPostId === post.id ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : offlineSavedPostIds.includes(post.id) ? (
                  <>
                    <Check size={8} className="stroke-[3]" />
                    <span>SALVO</span>
                  </>
                ) : (
                  <>
                    <Download size={8} />
                    <span>OFFLINE</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 text-[8px] font-mono font-black uppercase tracking-widest text-zinc-400 mb-2">
              <div className="flex items-center gap-2">
                <span>{formatBrazilianDate(post.date)}</span>
                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                <span>{post.category}</span>
              </div>
              <span>{post.readTime || '3 MIN'}</span>
            </div>
            {post.role && (
              <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500 mb-1 block opacity-70">
                {post.role}
              </span>
            )}
            <h5 className="text-xl font-black uppercase tracking-tighter leading-tight group-hover:text-red-500 transition-colors line-clamp-2 italic-serif -skew-x-2 mb-4">{post.title}</h5>
            <BlogShareButton post={post} />
          </motion.article>
        ))}
      </div>

      {hasMoreBlogPosts && (
        <div className="mt-20 text-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <Button 
              onClick={loadMoreBlogPosts}
              className="bg-transparent border-2 border-black dark:border-white text-black dark:text-white font-black uppercase tracking-[0.2em] px-12 py-8 rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-xl group"
            >
              <span className="mr-4">CARREGAR MAIS REPORTS</span>
              <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ArchiveSection;
