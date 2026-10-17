import React, { useState } from 'react';
import { Button } from "./ui/button"; // Assuming these exist based on App.tsx usage
import { Input } from "./ui/input";   // Assuming these exist based on App.tsx usage
import { Loader2, ImageIcon, Wand2, Download } from 'lucide-react';

interface ImageGeneratorProps {
  onImageGenerated: (url: string) => void;
  defaultPrompt?: string;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onImageGenerated, defaultPrompt = '' }) => {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    // CRITICAL: Force BJJ context and technical details
    const hardenedPrompt = `${prompt}, Professional Brazilian Jiu-Jitsu match, athletes wearing technical GI kimono with belts showing, on official BJJ competition mats (blue/yellow tatame), strictly NO boxing gloves, NO karate stances, NO yoga mats, NO generic fitness gym equipment, strictly NO food, NO hotdogs, NO burgers, NO pizzas. Cinematic documentary photography, high contrast, technical documentary style, extreme detail on GI fabric and sweat. 8k resolution.`;

    try {
      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: hardenedPrompt, aspectRatio: "16:9" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro do servidor: ${response.status}`);
      }

      const data = await response.json();
      if (data.url) {
        setGeneratedImage(data.url);
        onImageGenerated(data.url);
      } else {
        throw new Error("O servidor não retornou uma URL de imagem.");
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      if (err.message?.includes("404") || err.message?.includes("not found")) {
         setError("Modelo de IA não encontrado ou indisponível no momento.");
      } else if (err.message?.includes("429") || err.message?.includes("quota")) {
         setError("Limite de uso da IA atingido. Tente novamente em alguns instantes.");
      } else {
         setError("Não foi possível gerar a imagem no momento. " + (err.message || "Tente novamente."));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon size={16} className="text-zinc-400" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">IA Image Generator</h4>
      </div>
      
      <div className="flex gap-2">
        <Input 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Descreva a imagem (ex: Atleta de jiu-jitsu em um tatame futurista)"
          className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black h-10 text-xs"
        />
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[9px] tracking-widest h-10 px-4 rounded-none shrink-0"
        >
          {isGenerating ? <Loader2 className="animate-spin mr-2" size={14} /> : <Wand2 className="mr-2" size={14} />}
          Gerar
        </Button>
      </div>

      {error && <p className="text-[10px] text-red-500 font-bold uppercase">{error}</p>}

      {generatedImage && (
        <div className="relative group aspect-video bg-black/5 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <img 
            src={generatedImage} 
            alt="Generated" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
             <Button 
               size="sm" 
               variant="outline" 
               className="bg-white/90 text-black border-none font-black uppercase text-[8px] rounded-none h-8"
               onClick={() => window.open(generatedImage, '_blank')}
             >
               <Download size={12} className="mr-1" /> Download
             </Button>
          </div>
        </div>
      )}
      
      {!generatedImage && !isGenerating && (
        <div className="aspect-video bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400">
           <ImageIcon size={32} className="opacity-20 mb-2" />
           <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Preview da Imagem</p>
        </div>
      )}
    </div>
  );
};
