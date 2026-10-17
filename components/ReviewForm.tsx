import React, { useState, useEffect } from 'react';
import { Send, Star, MessageSquare, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Review } from '@/src/types';

interface ReviewFormProps {
  productId: string;
  isLoggedIn: boolean;
  onSignIn: () => void;
  currentUserDisplayName?: string;
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => Promise<any> | any;
  hasPurchased?: boolean;
  onAcquireProduct?: () => void;
}

const BELT_COLORS = [
  { level: 1, name: 'Faixa Branca (Iniciante)', colorClass: 'bg-zinc-100 text-zinc-850', sleeveClass: 'bg-black' },
  { level: 2, name: 'Faixa Azul (Intermediária)', colorClass: 'bg-blue-600 text-white', sleeveClass: 'bg-black' },
  { level: 3, name: 'Faixa Roxa (Avançada)', colorClass: 'bg-indigo-800 text-white', sleeveClass: 'bg-black' },
  { level: 4, name: 'Faixa Marrom (Avançada Superior)', colorClass: 'bg-yellow-900 text-white', sleeveClass: 'bg-black' },
  { level: 5, name: 'Faixa Preta (Padrão OSS)', colorClass: 'bg-zinc-950 text-white border-red-600', sleeveClass: 'bg-red-600 border-l border-white/45' },
];

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  isLoggedIn,
  onSignIn,
  currentUserDisplayName,
  onAddReview,
  hasPurchased = false,
  onAcquireProduct
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUserDisplayName && !userName) {
      setUserName(currentUserDisplayName);
    }
  }, [currentUserDisplayName]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setErrorMsg(null);
    }
  };

  const handleRatingChange = (newRating: number) => {
    if (isSubmitting) return;
    setRating(newRating);
    setErrorMsg(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting) return;
    setUserName(e.target.value);
    setErrorMsg(null);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSubmitting) return;
    setComment(e.target.value);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg(null);

    const trimmedName = userName.trim();
    const trimmedComment = comment.trim();

    if (rating < 1 || rating > 5 || isNaN(rating)) {
      setErrorMsg('⚠️ Avaliação inválida. Selecione entre 1 e 5 estrelas.');
      return;
    }

    if (!trimmedName) {
      setErrorMsg('⚠️ Por favor, insira seu Nome de Guerra ou Apelido.');
      return;
    }

    if (!trimmedComment) {
      setErrorMsg('⚠️ O Relatório Técnico não pode estar vazio.');
      return;
    }

    if (trimmedComment.length < 5) {
      setErrorMsg('⚠️ Relatório muito curto. Escreva pelo menos 5 caracteres sobre o produto.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Execute standard onAddReview prop (usually writes to Firestore)
      await onAddReview({
        userName: trimmedName,
        rating,
        comment: trimmedComment,
      });

      // Clear fields and selection ONLY upon success
      setComment('');
      setRating(5);
      setErrorMsg(null);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Erro ao submeter avaliação para o Firestore:", error);
      setErrorMsg('❌ Erro de conexão com o Dojo: Não foi possível gravar o Relatório Técnico no momento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBelt = BELT_COLORS.find(b => b.level === rating) || BELT_COLORS[0];

  return (
    <div>
      {!isLoggedIn ? (
        <Button
          onClick={onSignIn}
          variant="outline"
          className="w-full lg:w-auto rounded-none border-zinc-300 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest py-6 px-8 hover:bg-green-600 hover:text-white transition-all bg-green-50 dark:bg-green-950/20 font-mono"
        >
          🥋 Entrar para Avaliar
        </Button>
      ) : (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              className="w-full lg:w-auto rounded-none bg-zinc-950 dark:bg-white text-white dark:text-black border border-zinc-950 dark:border-white text-[10px] font-black uppercase tracking-widest py-6 px-8 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 dark:hover:text-white transition-all font-mono"
            >
              🥋 Escrever Relatório Técnico (OSS)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>🥋 Submeter Relatório de Combate</DialogTitle>
              <DialogDescription>
                Seu feedback ajuda a comunidade de jiu-jitsu a escolher a armadura perfeita.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Star Rating Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block font-mono">
                  1. Avaliação Técnica (1 a 5 Estrelas / Graduação)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className="transition-transform active:scale-95 focus:outline-none cursor-pointer"
                      >
                        <Star
                          size={24}
                          className={`transition-colors ${
                            star <= rating
                              ? 'fill-zinc-950 text-zinc-950 dark:fill-white dark:text-white'
                              : 'text-zinc-300 dark:text-zinc-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Physical belt indicator inside dialog */}
                  <div className="flex items-center gap-2">
                    <div className={`relative h-6 w-32 ${rating === 5 ? 'bg-zinc-950 border border-red-600' : `${selectedBelt.colorClass} border border-zinc-300 dark:border-zinc-800`} flex items-center shadow-sm overflow-hidden`}>
                      <div className={`absolute right-0 top-0 bottom-0 w-8 ${selectedBelt.sleeveClass} flex items-center justify-center gap-[1px] px-1`}>
                        <div className="w-[1px] h-3 bg-zinc-100" />
                        <div className="w-[1px] h-3 bg-zinc-100" />
                        <div className="w-[1px] h-3 bg-zinc-100" />
                      </div>
                      <span className="text-[6.5px] pl-2 font-black tracking-widest uppercase font-mono text-zinc-500 italic">
                        OSS
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-black uppercase text-zinc-500">
                      {selectedBelt.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Name field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block font-mono">
                  2. Nome de Guerra ou Apelido
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={handleNameChange}
                  disabled={isSubmitting}
                  placeholder="Ex: Rickson Gracie"
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-3 text-xs font-bold uppercase focus:ring-1 focus:ring-black dark:focus:ring-white outline-none rounded-none text-black dark:text-white disabled:opacity-50"
                />
              </div>

              {/* Comment area */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block font-mono">
                  3. Relatório Técnico (Explique o teste de treino)
                </label>
                <textarea
                  value={comment}
                  onChange={handleCommentChange}
                  disabled={isSubmitting}
                  placeholder="Instruções: O Kimono encolheu na lavagem? Ajuste das axilas e mangas? Tecido transpirante or reforçado? Costura do Tatami aguentou combates pesados?"
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-3 text-xs font-semibold focus:ring-1 focus:ring-black dark:focus:ring-white outline-none rounded-none min-h-[110px] text-zinc-800 dark:text-zinc-200 italic disabled:opacity-50"
                />
              </div>

              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/50 p-3 text-[10px] font-mono font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-zinc-950 text-white hover:text-white font-black uppercase tracking-widest py-6 rounded-none flex items-center justify-center gap-2 transition-all font-mono disabled:bg-zinc-350 dark:disabled:bg-zinc-800 disabled:text-zinc-500 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Processando... 🥋
                    </>
                  ) : (
                    <>Submeter ao Livro Oficial do Tatame <Send size={12} /></>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
