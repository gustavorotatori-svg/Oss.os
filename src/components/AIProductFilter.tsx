import React, { useState } from 'react';
import { Sparkles, Target, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from 'react-i18next';
import { performanceTelemetry } from '../lib/performanceTelemetry';
import { KimonoIcon } from './KimonoLoader';
import { motion } from 'motion/react';

interface AIProductFilterProps {
  onFilter: (criteria: any) => void;
  isLoading?: boolean;
}

export const AIProductFilter: React.FC<AIProductFilterProps> = ({ onFilter, isLoading }) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [relevance, setRelevance] = useState([70]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAISearch = async () => {
    if (!description.trim()) return;
    
    setIsProcessing(true);
    try {
      const prompt = `Analise a seguinte descrição de equipamento de Jiu-Jitsu: "${description}". 
      Extraia intenções de busca técnicas (material, estilo de luta como 'guardeiro' ou 'passador', durabilidade, peso).
      O objeto JSON deve ter filtros: { "category": "...", "tags": ["...", "..."], "keywords": ["..."] }.
      A relevância definida pelo usuário é ${relevance[0]}%.`;

      const criteria = await performanceTelemetry.trackAsync('gemini', 'productFilterAnalysis', async () => {
        const response = await fetch("/api/ai/generate-json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt })
        });

        if (!response.ok) throw new Error("Falha na análise da IA");
        return await response.json();
      }, `Filtro IA: ${description.substring(0, 30)}...`);

      onFilter({ ...criteria, aiRelevance: relevance[0] });
    } catch (error) {
      console.error("AI Filter Error:", error);
      // Fallback: simple search if AI fails
      onFilter({ keywords: [description], aiRelevance: relevance[0] });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 border-2 border-green-600/30 bg-green-500/5 space-y-6 rounded-none">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-green-500 animate-pulse" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">Refinamento por IA</h4>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[9px] font-bold uppercase text-zinc-500 mb-2 block tracking-wider">
            Descreva seu Estilo ou Necessidade
          </label>
          <Input 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Kimono leve para competições, durável para treinos diários de guardeiro"
            className="rounded-none border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-black text-[11px] h-10 italic"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">
              Relevância da IA
            </label>
            <span className="text-[9px] font-mono font-bold text-green-600">{relevance[0]}%</span>
          </div>
          <Slider 
            value={relevance}
            onValueChange={setRelevance}
            max={100}
            step={5}
            className="py-4"
          />
        </div>

        <Button 
          onClick={handleAISearch}
          disabled={isProcessing || !description.trim()}
          className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-12 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-green-600 dark:hover:bg-green-600 transition-all border-none flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="inline-flex"
              >
                <KimonoIcon size={16} />
              </motion.div>
              <span>Avaliando Tecido & Modelagem...</span>
            </>
          ) : (
            <>
              <Wand2 className="mr-2" size={14} />
              <span>Calibrar Filtros com IA</span>
            </>
          )}
        </Button>
      </div>

      <div className="flex items-start gap-2 p-3 bg-white/50 dark:bg-black/50 border-2 border-zinc-950 dark:border-zinc-850">
         <Target size={12} className="text-zinc-400 mt-0.5 shrink-0" />
         <p className="text-[9px] text-zinc-400 font-medium leading-relaxed">
           Nossa IA analisa descrições técnicas e materiais para encontrar o gear que combina com seu jogo.
         </p>
      </div>
    </div>
  );
};
