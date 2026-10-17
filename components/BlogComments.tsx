import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../src/lib/firebase';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Sparkles, 
  ShieldAlert,
  Clock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Stoic BJJ tags for comments
const STOIC_TAGS = [
  { id: 'amor_fati', label: 'Amor Fati', desc: 'Aceitar e abraçar o combate como ele vier', color: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20' },
  { id: 'memento_mori', label: 'Memento Mori', desc: 'Lembrança da impermanência para focar no presente', color: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20' },
  { id: 'iron_mind', label: 'Mente Inabalável', desc: 'Controle emocional supremo perante a pressão do tatame', color: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'absolute_discipline', label: 'Disciplina Absoluta', desc: 'Soberania da razão e rotina sobre impulsos de desistência', color: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20' },
  { id: 'pure_technique', label: 'Técnica Pura', desc: 'Uso da máxima eficiência racional com menor esforço físico', color: 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border-cyan-500/20' },
  { id: 'resilience', label: 'Resiliência', desc: 'A capacidade de sustentar a tempestade de golpes e reagir', color: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20' },
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface BlogCommentsProps {
  postId: string;
}

interface CommentData {
  id: string;
  userName: string;
  commentText: string;
  createdAt: Timestamp | null;
  userId: string;
  userAvatar?: string;
  stoicTag?: string;
}

export const BlogComments: React.FC<BlogCommentsProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Edit logic
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingTag, setEditingTag] = useState('');

  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Sync / Real-time comments loading
  useEffect(() => {
    if (!currentUser) {
      setComments([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    const commentsPath = `blog_posts/${postId}/comments`;
    
    const q = query(
      collection(db, commentsPath),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const loadedComments: CommentData[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loadedComments.push({
            id: docSnap.id,
            userName: data.userName || 'Guerreiro Anônimo',
            commentText: data.commentText || '',
            createdAt: data.createdAt as Timestamp || null,
            userId: data.userId || '',
            userAvatar: data.userAvatar || '',
            stoicTag: data.stoicTag || '',
          });
        });
        setComments(loadedComments);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        try {
          handleFirestoreError(error, OperationType.GET, commentsPath);
        } catch (wrappedError: any) {
          setErrorMessage("Erro ao ler os comentários do Firestore. Verifique as regras de segurança.");
        }
      }
    );

    return () => unsubscribe();
  }, [postId, currentUser]);

  // Submit new comment to Firestore
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMessage("Você precisa estar autenticado para enviar um comentário.");
      return;
    }
    if (!newCommentText.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    const commentsPath = `blog_posts/${postId}/comments`;

    const commentPayload = {
      userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Guerreiro',
      commentText: newCommentText.trim(),
      createdAt: serverTimestamp(),
      userId: currentUser.uid,
      userAvatar: currentUser.photoURL || '',
      ...(selectedTag ? { stoicTag: selectedTag } : {})
    };

    try {
      await addDoc(collection(db, commentsPath), commentPayload);
      setNewCommentText('');
      setSelectedTag('');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, commentsPath);
      } catch (wrappedError: any) {
        setErrorMessage("Falha de autorização: sua conta não tem permissão para postar no banco de dados.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit / Update comment
  const handleStartEditing = (comment: CommentData) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.commentText);
    setEditingTag(comment.stoicTag || '');
  };

  const handleCancelEditing = () => {
    setEditingCommentId(null);
    setEditingText('');
    setEditingTag('');
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingText.trim()) return;
    setErrorMessage(null);
    const commentRefPath = `blog_posts/${postId}/comments/${commentId}`;

    try {
      const commentDocRef = doc(db, 'blog_posts', postId, 'comments', commentId);
      await updateDoc(commentDocRef, {
        commentText: editingText.trim(),
        stoicTag: editingTag || null,
      });
      handleCancelEditing();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, commentRefPath);
      } catch (wrappedError: any) {
        setErrorMessage("Erro de permissão: você não é dono ou não pode modificar este comentário.");
      }
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Deseja apagar esta discussão técnica?")) return;
    setErrorMessage(null);
    const commentRefPath = `blog_posts/${postId}/comments/${commentId}`;

    try {
      const commentDocRef = doc(db, 'blog_posts', postId, 'comments', commentId);
      await deleteDoc(commentDocRef);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, commentRefPath);
      } catch (wrappedError: any) {
        setErrorMessage("Erro ao deletar: permissão negada.");
      }
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="text-green-600 animate-pulse shrink-0" size={18} />
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white">
          🥋 DIRETRIZES E DEBATE ESTÓICO DE COMBATE
        </h3>
        <span className="text-[9px] font-mono font-black text-green-600 bg-green-500/10 px-2 py-0.5 uppercase tracking-widest leading-none rounded">
          {comments.length} {comments.length === 1 ? 'Discussão' : 'Discussões'}
        </span>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/10 border-l-2 border-red-500 rounded-none text-xs font-mono uppercase text-red-600 dark:text-red-400 flex items-center gap-2">
          <ShieldAlert size={14} className="shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-auto text-[9px] underline uppercase font-black">Limpar</button>
        </div>
      )}

      {/* Write Comment Box */}
      {currentUser ? (
        <form onSubmit={handleSubmitComment} className="mb-8 p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-none bg-zinc-800 text-white flex items-center justify-center text-[10px] font-bold font-mono uppercase">
              {currentUser.displayName ? currentUser.displayName[0] : currentUser.email?.[0] || 'G'}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Postando como: <span className="text-green-600 font-mono">{currentUser.displayName || currentUser.email}</span>
            </span>
          </div>

          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Qual é a sua análise técnica sobre este artigo? Compartilhe um insight prático dos treinos ou das teorias estóicas de resiliência..."
            rows={3}
            className="w-full p-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-none text-xs focus:ring-1 focus:ring-green-500 focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-600 font-sans leading-relaxed text-black dark:text-white resize-y"
            maxLength={4000}
            required
          />

          {/* Stoic Theory Filter / Selector */}
          <div className="mt-4">
            <p className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Sparkles size={11} className="text-green-600" /> VINCULAR PRINCÍPIO ESTÓICO PARA DISCUSSÃO (OPCIONAL):
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {STOIC_TAGS.map((tag) => {
                const isSelected = selectedTag === tag.label;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedTag(isSelected ? '' : tag.label)}
                    title={tag.desc}
                    className={`px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded border transition-all flex items-center gap-1 shrink-0 ${
                      isSelected 
                        ? 'bg-green-600 text-white border-green-600 shadow-[0_2px_8px_rgba(34,197,94,0.3)]' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-750 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newCommentText.trim()}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-2.5 px-6 font-black uppercase tracking-widest text-[10px] rounded-none transition-all flex items-center gap-2"
            >
              {isSubmitting ? 'ENVIANDO...' : (
                <>
                  <Send size={11} /> ENVIAR INSIGHT
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-zinc-100/50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 text-center rounded-none py-6">
          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            🔐 LOGIN REQUERIDO PARA ENTRAR NA DISCUSSÃO
          </p>
          <p className="text-[9px] text-zinc-400 mt-1 uppercase font-semibold">
            AUTENTIQUE-SE NA BARRA LATERAL PARA ENVIAR ANALISES TÉCNICAS E ESTÓICAS DE LUTA.
          </p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="h-10 bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
          <div className="h-10 bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-100 dark:border-zinc-850">
          <MessageSquare className="mx-auto text-zinc-300 dark:text-zinc-700 mb-2" size={24} />
          <span className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-widest block">O TATAMI ESTÁ SILENCIOSO</span>
          <span className="text-[9px] text-zinc-400 mt-1 block uppercase">SEJA O PRIMEIRO ATLETA A TRAZER SEU PANORAMA FILOSÓFICO OU INSIGHT TÉCNICO.</span>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {comments.map((comment) => {
              const isEditing = editingCommentId === comment.id;
              const isOwner = currentUser?.uid === comment.userId;
              const formattedDate = comment.createdAt 
                ? comment.createdAt.toDate().toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  }) 
                : 'Recente';

              // Find tag styling if any
              const matchedTag = STOIC_TAGS.find(t => t.label === comment.stoicTag);

              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-none hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors"
                >
                  {/* Top line with author name & timestamp */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-50 dark:border-zinc-900 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-[9px] font-mono font-black border border-zinc-200 dark:border-zinc-800">
                        {comment.userAvatar ? (
                          <img src={comment.userAvatar} referrerPolicy="no-referrer" className="w-full h-full object-cover rounded" alt="" />
                        ) : (
                          <User size={10} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white">
                          {comment.userName}
                        </span>
                      </div>
                      
                      {/* Active tag badge */}
                      {comment.stoicTag && (
                        <span 
                          title={matchedTag?.desc}
                          className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border rounded-none shrink-0 ${
                            matchedTag?.color || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          🥋 {comment.stoicTag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[8px] font-mono text-zinc-400 uppercase flex items-center gap-1">
                        <Clock size={8} /> {formattedDate}
                      </span>

                      {/* Author control buttons */}
                      {isOwner && !isEditing && (
                        <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5 rounded">
                          <button
                            onClick={() => handleStartEditing(comment)}
                            title="Editar comentário"
                            className="p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                          >
                            <Edit2 size={10} />
                          </button>
                          <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800 self-center" />
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            title="Apagar discussão"
                            className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Body */}
                  {isEditing ? (
                    <div className="space-y-3 pt-1">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-none text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
                        rows={2}
                        maxLength={4000}
                        required
                      />
                      
                      {/* Edit Stoic theory selector */}
                      <div>
                        <p className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">MUTAR PRINCÍPIO ESTÓICO:</p>
                        <div className="flex flex-wrap gap-1">
                          {STOIC_TAGS.map((tag) => {
                            const isSelected = editingTag === tag.label;
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => setEditingTag(isSelected ? '' : tag.label)}
                                className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border transition-all ${
                                  isSelected 
                                    ? 'bg-green-600 text-white border-green-600 shadow-[0_2px_8px_rgba(34,197,94,0.3)]' 
                                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100'
                                }`}
                              >
                                {tag.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 shrink-0">
                        <button
                          onClick={handleCancelEditing}
                          className="bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 py-1.5 px-3 border border-zinc-200 dark:border-zinc-800 font-bold uppercase tracking-widest text-[9px] rounded-none transition-all flex items-center gap-1"
                        >
                          <X size={10} /> CANCELAR
                        </button>
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={!editingText.trim()}
                          className="bg-green-600 hover:bg-green-500 text-white py-1.5 px-3 font-black uppercase tracking-widest text-[9px] rounded-none transition-all flex items-center gap-1"
                        >
                          <Check size={10} /> SALVAR ATUALIZAÇÃO
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-normal leading-relaxed whitespace-pre-wrap select-text font-sans">
                      {comment.commentText}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
