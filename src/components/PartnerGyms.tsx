import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ExternalLink, ChevronDown, ChevronUp, Phone, Clock, Sparkles } from 'lucide-react';
import BJJImage from './BJJImage';

interface Gym {
  id: string;
  name: string;
  city: string;
  state: string;
  specialty: string;
  image: string;
  address: string;
  mapsUrl: string;
  phone: string;
  schedule: string;
  benefits: string[];
}

const PARTNER_GYMS: Gym[] = [
  {
    id: 'alliance-moema',
    name: 'Alliance Moema',
    city: 'São Paulo',
    state: 'SP',
    specialty: 'Técnica Pura & Defesa Pessoal',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=600&auto=format&fit=crop',
    address: 'Rua Inhambu, 229 - Moema, São Paulo - SP, 04520-010',
    mapsUrl: 'https://maps.google.com/?q=Alliance+BJJ+Moema+Rua+Inhambu+229+Sao+Paulo',
    phone: '+55 (11) 5051-2401',
    schedule: 'Segunda a Sexta: 06:00 às 22:00 | Sábado: 09:00 às 13:00',
    benefits: ['15% Cupom de Desconto em Kimonos', 'Treino de confraternização mensal gratuito', 'Acesso livre para alunos em trânsito']
  },
  {
    id: 'draculino-bh',
    name: 'Draculino Team Savassi',
    city: 'Belo Horizonte',
    state: 'MG',
    specialty: 'Old School & Competição',
    image: 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=600&auto=format&fit=crop',
    address: 'Av. do Contorno, 6423 - Savassi, Belo Horizonte - MG, 30110-043',
    mapsUrl: 'https://maps.google.com/?q=Gracie+Barra+Belo+Horizonte+Contorno+6423+Draculino',
    phone: '+55 (31) 3223-1002',
    schedule: 'Segunda a Sexta: 07:00 às 21:00 | Sábado: 10:00 às 12:00',
    benefits: ['Aulas exclusivas com campeões mundiais', 'Vouchers semestrais de vestuário', 'Treinos específicos de quedas e bochecha']
  },
  {
    id: 'cicero-costha-ipiranga',
    name: 'Cicero Costha Ipiranga',
    city: 'São Paulo',
    state: 'SP',
    specialty: 'Guarda Moderna & Projeto Social',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop',
    address: 'Rua Silva Bueno, 1612 - Ipiranga, São Paulo - SP, 04208-001',
    mapsUrl: 'https://maps.google.com/?q=Cicero+Costha+Rua+Silva+Bueno+1612+Ipiranga+Sao+Paulo',
    phone: '+55 (11) 2063-9988',
    schedule: 'Segunda a Sexta: 06:00 às 23:00 | Sábado: 09:00 às 12:00',
    benefits: ['Infraestrutura de ponta', 'Foco em raspagens e transições rápidas', 'Apoio direto a atletas locais de alto nível']
  },
  {
    id: 'gracie-humaita-rj',
    name: 'Gracie Humaitá Copacabana',
    city: 'Rio de Janeiro',
    state: 'RJ',
    specialty: 'Defesa Pessoal & Tradição',
    image: 'https://images.unsplash.com/photo-1505250469613-37aa25272a84?q=80&w=600&auto=format&fit=crop',
    address: 'Rua Humaitá, 52 - Humaitá, Rio de Janeiro - RJ, 22261-001',
    mapsUrl: 'https://maps.google.com/?q=Gracie+Humaita+Rua+Humaita+52+Rio+de+Janeiro',
    phone: '+55 (21) 2537-6655',
    schedule: 'Segunda a Sexta: 07:00 às 22:00 | Sábado: 10:00 às 13:00',
    benefits: ['Linhagem técnica direta do Grande Mestre Helio Gracie', 'Salas de musculação estruturadas', 'Workshops regulares de nutrição de combate']
  }
];

export const PartnerGyms: React.FC = () => {
  const [expandedGymId, setExpandedGymId] = useState<string | null>(null);

  const toggleExpand = (gymId: string) => {
    setExpandedGymId(prev => (prev === gymId ? null : gymId));
  };

  return (
    <div className="w-full">
      {/* Grid of Partner Academies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PARTNER_GYMS.map((gym) => {
          const isExpanded = expandedGymId === gym.id;

          return (
            <motion.div
              layout
              id={`gym-partner-card-${gym.id}`}
              key={gym.id}
              className={`bg-white dark:bg-black border-2 transition-all duration-300 overflow-hidden flex flex-col justify-between rounded-none ${
                isExpanded 
                  ? 'border-green-600 shadow-[4px_4px_0px_#22c55e]' 
                  : 'border-zinc-950 dark:border-zinc-850 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.06)] hover:border-black dark:hover:border-zinc-600 hover:shadow-[6px_6px_0px_#cc0000]'
              }`}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <div className="relative h-48 overflow-hidden group">
                <BJJImage 
                  src={gym.image} 
                  alt={gym.name} 
                  className="w-full h-full object-cover transition-all duration-700 ease-out grayscale opacity-75 group-hover:opacity-100 group-hover:scale-105"
                />
                
                {/* Location Badge */}
                <div className="absolute top-3 left-3 bg-black/80 dark:bg-zinc-900/90 text-white border border-zinc-700/50 px-2 py-1 flex items-center gap-1">
                  <MapPin size={10} className="text-green-500" />
                  <span className="text-[8px] font-mono tracking-widest uppercase font-semibold">
                    {gym.city} - {gym.state}
                  </span>
                </div>

                {/* Technical Overlay */}
                <div className="absolute inset-x-0 bottom-0 py-3 px-4 bg-gradient-to-t from-black to-transparent flex flex-col justify-end">
                  <span className="text-[8px] font-mono text-green-400 tracking-wider font-bold uppercase">
                    {gym.specialty}
                  </span>
                </div>
              </div>

              {/* Main Content Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-black dark:text-white uppercase italic -skew-x-3 mb-2">
                    {gym.name}
                  </h3>
                  
                  {/* Minified view benefits / overview */}
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    Academia consagrada, focando no desenvolvimento integral da técnica de jiu-jitsu com o selo de excelência Diário dos Oss.os.
                  </p>
                </div>

                {/* Expandable details wrapper */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={`gym-expandable-info-${gym.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-4 space-y-3"
                    >
                      {/* Full Address */}
                      <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                        <MapPin size={14} className="text-green-500 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          <span className="font-bold text-black dark:text-white block uppercase text-[10px] tracking-wider mb-0.5">Endereço Completo:</span>
                          {gym.address}
                        </div>
                      </div>

                      {/* Phone Contact */}
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                        <Phone size={14} className="text-green-500 shrink-0" />
                        <div className="text-[11px]">
                          <span className="font-bold text-black dark:text-white uppercase text-[10px] tracking-wider mr-1">Telefone:</span>
                          {gym.phone}
                        </div>
                      </div>

                      {/* Horários */}
                      <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                        <Clock size={14} className="text-green-500 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-tight">
                          <span className="font-bold text-black dark:text-white block uppercase text-[10px] tracking-wider mb-0.5">Grade Horária:</span>
                          {gym.schedule}
                        </div>
                      </div>

                      {/* Benefits & Vantages for Diário dos Oss.os members */}
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 border border-zinc-150 dark:border-zinc-800 space-y-1.5">
                        <span className="text-[9px] font-mono text-green-500 font-extrabold flex items-center gap-1 uppercase tracking-widest">
                          <Sparkles size={10} /> Benefícios Oss.os:
                        </span>
                        <ul className="list-disc list-inside text-[10px] text-zinc-500 dark:text-zinc-400 pl-1 space-y-1">
                          {gym.benefits.map((benefit, bIdx) => (
                            <li key={bIdx} className="leading-snug">{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons controls */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleExpand(gym.id)}
                    className="flex items-center gap-1.5 text-[9px] font-mono uppercase font-black text-zinc-500 hover:text-black dark:hover:text-white transition-all py-1.5 px-3 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        Menos Info <ChevronUp size={12} className="text-green-500" />
                      </>
                    ) : (
                      <>
                        Detalhes Dojo <ChevronDown size={12} className="text-green-500 animate-pulse" />
                      </>
                    )}
                  </button>

                  <a
                    href={gym.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[9px] font-mono uppercase font-black bg-green-600 text-black px-4 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black transition-all cursor-pointer shadow-sm"
                  >
                    Google Maps <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
