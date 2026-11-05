export interface SizeRowData {
  size: string;
  minHeight: number; // in cm
  maxHeight: number; // in cm
  minWeight: number; // in kg
  maxWeight: number; // in kg
  wingspan: number;  // in cm (manga a manga)
  jacketLength: number; // in cm (comprimento da jaqueta)
  pantsLength: number;  // in cm (comprimento da calça)
  chestWidth?: number;  // in cm (largura do tórax)
  notes?: string;
}

export interface BrandSizeChart {
  id: string;
  name: string;
  aliasPatterns: string[];
  logoIcon?: string;
  originCountry: string;
  cutStyle: string;
  cutDescription: string;
  shrinkageRate: string;
  shrinkagePercentage: number; // average %
  defaultWeave: string;
  pantsWeave: string;
  ibjjfApproved: boolean;
  brandFittingAdvice: string;
  tables: {
    masculino: SizeRowData[];
    feminino: SizeRowData[];
    infantil?: SizeRowData[];
  };
}

export const BRAND_SIZE_CHARTS: Record<string, BrandSizeChart> = {
  jiujiteiro: {
    id: 'jiujiteiro',
    name: 'Jiujiteiro',
    aliasPatterns: ['jiujiteiro', 'thejiujiteiro', 'the jiujiteiro', 'h1x'],
    originCountry: 'EUA / Califórnia (Algodão Japonês)',
    cutStyle: 'Atlético Flagship Slim (Competição & Performance)',
    cutDescription: 'Modelagem moderna afunilada nas axilas e mangas com abertura justa regulamentar para dificultar pegadas. Traz grades especiais Long (L) para biotipo longilíneo.',
    shrinkageRate: '1% a 2% (Tecido pré-encolhido a vapor em processo industrial)',
    shrinkagePercentage: 1.5,
    defaultWeave: 'Pearl Weave 450 GSM Japonês',
    pantsWeave: 'Ripstop Militar Híbrido 10oz com costuras de 5 fileiras',
    ibjjfApproved: true,
    brandFittingAdvice: 'Se você possui braços ou pernas longas para seu peso, prefira os tamanhos Long (ex: A1L ou A2L). O kimono quase não encolhe se lavado a frio.',
    tables: {
      masculino: [
        { size: 'A0', minHeight: 154, maxHeight: 164, minWeight: 50, maxWeight: 63, wingspan: 154, jacketLength: 72, pantsLength: 90, chestWidth: 104, notes: 'Ideal para peso Galo/Pluma compacto' },
        { size: 'A1', minHeight: 162, maxHeight: 172, minWeight: 60, maxWeight: 73, wingspan: 160, jacketLength: 75, pantsLength: 94, chestWidth: 110, notes: 'Tamanho mais comum para Pluma e Pena' },
        { size: 'A1L', minHeight: 170, maxHeight: 179, minWeight: 60, maxWeight: 74, wingspan: 167, jacketLength: 78, pantsLength: 98, chestWidth: 110, notes: 'Versão Longa do A1 para atletas esguios' },
        { size: 'A2', minHeight: 170, maxHeight: 182, minWeight: 72, maxWeight: 86, wingspan: 168, jacketLength: 79, pantsLength: 98, chestWidth: 118, notes: 'Padrão ouro para Leve e Médio' },
        { size: 'A2L', minHeight: 179, maxHeight: 189, minWeight: 72, maxWeight: 87, wingspan: 175, jacketLength: 82, pantsLength: 103, chestWidth: 118, notes: 'Para atletas altos com cintura atlética' },
        { size: 'A2H', minHeight: 168, maxHeight: 178, minWeight: 85, maxWeight: 98, wingspan: 169, jacketLength: 80, pantsLength: 99, chestWidth: 126, notes: 'Corte Heavy com tórax e ombros mais amplos' },
        { size: 'A3', minHeight: 180, maxHeight: 191, minWeight: 85, maxWeight: 100, wingspan: 178, jacketLength: 84, pantsLength: 104, chestWidth: 124, notes: 'Meio-Pesado e Pesado' },
        { size: 'A3L', minHeight: 188, maxHeight: 197, minWeight: 86, maxWeight: 102, wingspan: 185, jacketLength: 87, pantsLength: 108, chestWidth: 124, notes: 'Long para Meio-Pesado alto' },
        { size: 'A4', minHeight: 188, maxHeight: 202, minWeight: 98, maxWeight: 118, wingspan: 186, jacketLength: 88, pantsLength: 108, chestWidth: 132, notes: 'Super-Pesado e Pesadíssimo' },
      ],
      feminino: [
        { size: 'F1', minHeight: 145, maxHeight: 156, minWeight: 40, maxWeight: 52, wingspan: 144, jacketLength: 68, pantsLength: 87, chestWidth: 94 },
        { size: 'F2', minHeight: 154, maxHeight: 165, minWeight: 50, maxWeight: 62, wingspan: 152, jacketLength: 71, pantsLength: 91, chestWidth: 99 },
        { size: 'F3', minHeight: 162, maxHeight: 173, minWeight: 60, maxWeight: 73, wingspan: 159, jacketLength: 75, pantsLength: 95, chestWidth: 105 },
        { size: 'F4', minHeight: 170, maxHeight: 181, minWeight: 71, maxWeight: 85, wingspan: 166, jacketLength: 78, pantsLength: 99, chestWidth: 112 },
      ],
      infantil: [
        { size: 'M0', minHeight: 110, maxHeight: 120, minWeight: 20, maxWeight: 26, wingspan: 108, jacketLength: 52, pantsLength: 68, notes: 'Aproximadamente 5 a 6 anos' },
        { size: 'M1', minHeight: 120, maxHeight: 130, minWeight: 26, maxWeight: 33, wingspan: 118, jacketLength: 57, pantsLength: 74, notes: 'Aproximadamente 7 a 8 anos' },
        { size: 'M2', minHeight: 130, maxHeight: 140, minWeight: 32, maxWeight: 40, wingspan: 128, jacketLength: 62, pantsLength: 80, notes: 'Aproximadamente 9 a 10 anos' },
        { size: 'M3', minHeight: 140, maxHeight: 150, minWeight: 38, maxWeight: 48, wingspan: 138, jacketLength: 67, pantsLength: 85, notes: 'Aproximadamente 11 a 12 anos' },
        { size: 'M4', minHeight: 148, maxHeight: 158, minWeight: 45, maxWeight: 56, wingspan: 146, jacketLength: 70, pantsLength: 89, notes: 'Aproximadamente 13 a 14 anos' },
      ]
    }
  },

  atama: {
    id: 'atama',
    name: 'Atama',
    aliasPatterns: ['atama', 'mundial', 'atama kimonos'],
    originCountry: 'Brasil / Rio de Janeiro (Pioneira desde 1989)',
    cutStyle: 'Tradicional Brasileiro Heritage (Mundial Cut)',
    cutDescription: 'Corte tradicional autêntico das raízes do Jiu-Jitsu. Saia com comprimento clássico que não sai da faixa facilmente, ombros confortáveis e calça de sarja encorpada.',
    shrinkageRate: '3% a 5% (100% Algodão Natural Carioca na 1ª lavagem)',
    shrinkagePercentage: 4.0,
    defaultWeave: 'Trançado Clássico Carioca 460 GSM',
    pantsWeave: 'Sarja 100% Algodão Pesado 320 GSM',
    ibjjfApproved: true,
    brandFittingAdvice: 'A Atama preserva o corte clássico. Como encolhe cerca de 3% a 5% na primeira lavagem, se estiver no limite superior de um tamanho, escolha o tamanho maior para um ajuste perfeito.',
    tables: {
      masculino: [
        { size: 'A1', minHeight: 160, maxHeight: 172, minWeight: 55, maxWeight: 72, wingspan: 159, jacketLength: 76, pantsLength: 93, chestWidth: 112, notes: 'Corte tradicional folgado nos ombros' },
        { size: 'A2', minHeight: 170, maxHeight: 183, minWeight: 70, maxWeight: 87, wingspan: 167, jacketLength: 80, pantsLength: 97, chestWidth: 120, notes: 'O mais vendido da Atama' },
        { size: 'A3', minHeight: 180, maxHeight: 192, minWeight: 84, maxWeight: 100, wingspan: 176, jacketLength: 85, pantsLength: 102, chestWidth: 126, notes: 'Robusto para pesados' },
        { size: 'A4', minHeight: 188, maxHeight: 202, minWeight: 98, maxWeight: 118, wingspan: 185, jacketLength: 89, pantsLength: 107, chestWidth: 134, notes: 'Super Pesado' },
        { size: 'A5', minHeight: 195, maxHeight: 210, minWeight: 115, maxWeight: 135, wingspan: 192, jacketLength: 93, pantsLength: 112, chestWidth: 142, notes: 'Ultra Pesadíssimo' },
      ],
      feminino: [
        { size: 'F1', minHeight: 146, maxHeight: 156, minWeight: 42, maxWeight: 52, wingspan: 145, jacketLength: 69, pantsLength: 88, chestWidth: 96 },
        { size: 'F2', minHeight: 155, maxHeight: 165, minWeight: 50, maxWeight: 62, wingspan: 153, jacketLength: 72, pantsLength: 92, chestWidth: 101 },
        { size: 'F3', minHeight: 163, maxHeight: 174, minWeight: 60, maxWeight: 74, wingspan: 160, jacketLength: 76, pantsLength: 96, chestWidth: 107 },
        { size: 'F4', minHeight: 171, maxHeight: 182, minWeight: 72, maxWeight: 86, wingspan: 167, jacketLength: 79, pantsLength: 100, chestWidth: 114 },
      ]
    }
  },

  venum: {
    id: 'venum',
    name: 'Venum',
    aliasPatterns: ['venum', 'elite', 'contender', 'kiku', 'challenger'],
    originCountry: 'França / Brasil (Design Europeu & Alma BJJ)',
    cutStyle: 'Slim-Fit Anatômico Europeu',
    cutDescription: 'A Venum projeta seus kimonos com silhueta afunilada esportiva. Possui tamanhos fracionados (.5) como A1.5 e A2.5 para atletas que ficam entre tamanhos tradicionais.',
    shrinkageRate: '2% a 3% (Pré-encolhido com acabamento térmico)',
    shrinkagePercentage: 2.2,
    defaultWeave: 'Pearl Weave 450 GSM / Gold Weave 500 GSM',
    pantsWeave: 'Ripstop 280 GSM ou Sarja 100% Algodão',
    ibjjfApproved: true,
    brandFittingAdvice: 'Se você busca corte bem justo ao corpo que previna pegadas dos oponentes, o tamanho padrão Venum veste rente. Para quem prefere folga, suba meio tamanho (ex: de A1 para A1.5 ou A2).',
    tables: {
      masculino: [
        { size: 'A0', minHeight: 155, maxHeight: 164, minWeight: 48, maxWeight: 60, wingspan: 152, jacketLength: 71, pantsLength: 89, chestWidth: 102 },
        { size: 'A1', minHeight: 160, maxHeight: 170, minWeight: 58, maxWeight: 70, wingspan: 159, jacketLength: 74, pantsLength: 93, chestWidth: 108 },
        { size: 'A1.5', minHeight: 167, maxHeight: 175, minWeight: 65, maxWeight: 76, wingspan: 164, jacketLength: 77, pantsLength: 96, chestWidth: 112, notes: 'Intermediário entre A1 e A2' },
        { size: 'A2', minHeight: 170, maxHeight: 180, minWeight: 70, maxWeight: 85, wingspan: 167, jacketLength: 79, pantsLength: 98, chestWidth: 116 },
        { size: 'A2.5', minHeight: 176, maxHeight: 185, minWeight: 80, maxWeight: 92, wingspan: 172, jacketLength: 82, pantsLength: 101, chestWidth: 120, notes: 'Intermediário entre A2 e A3' },
        { size: 'A3', minHeight: 180, maxHeight: 192, minWeight: 85, maxWeight: 100, wingspan: 176, jacketLength: 84, pantsLength: 103, chestWidth: 124 },
        { size: 'A4', minHeight: 190, maxHeight: 204, minWeight: 98, maxWeight: 120, wingspan: 185, jacketLength: 88, pantsLength: 107, chestWidth: 132 },
      ],
      feminino: [
        { size: 'F1', minHeight: 145, maxHeight: 155, minWeight: 40, maxWeight: 50, wingspan: 143, jacketLength: 67, pantsLength: 86, chestWidth: 93 },
        { size: 'F2', minHeight: 153, maxHeight: 164, minWeight: 49, maxWeight: 60, wingspan: 151, jacketLength: 70, pantsLength: 90, chestWidth: 98 },
        { size: 'F3', minHeight: 161, maxHeight: 172, minWeight: 59, maxWeight: 71, wingspan: 158, jacketLength: 74, pantsLength: 94, chestWidth: 104 },
        { size: 'F4', minHeight: 169, maxHeight: 180, minWeight: 70, maxWeight: 84, wingspan: 165, jacketLength: 77, pantsLength: 98, chestWidth: 110 },
      ]
    }
  },

  koral: {
    id: 'koral',
    name: 'Koral Fight Co.',
    aliasPatterns: ['koral', 'koral fight', 'mkm', 'koral mkm', 'koral light'],
    originCountry: 'Brasil / São Paulo (Lenda do BJJ desde 1997)',
    cutStyle: 'MKM Competition Cut (Axilas anatômicas e saia curta)',
    cutDescription: 'Desenvolvido por campeões mundiais com o histórico modelo MKM. Destaca-se por saia mais curta que obedece com precisão as normas da CBJJ/IBJJF sem sobrar tecido.',
    shrinkageRate: '3% a 4% (Algodão brasileiro trançado pesado)',
    shrinkagePercentage: 3.5,
    defaultWeave: 'Trançado Pesado Koral 500 GSM',
    pantsWeave: 'Algodão reforçado nos joelhos 290 GSM',
    ibjjfApproved: true,
    brandFittingAdvice: 'A Koral veste de forma impecável no comprimento. Para treinos diários e longevidade, seque sempre à sombra.',
    tables: {
      masculino: [
        { size: 'A0', minHeight: 155, maxHeight: 165, minWeight: 50, maxWeight: 62, wingspan: 153, jacketLength: 71, pantsLength: 89, chestWidth: 103 },
        { size: 'A1', minHeight: 162, maxHeight: 172, minWeight: 60, maxWeight: 74, wingspan: 161, jacketLength: 75, pantsLength: 93, chestWidth: 111 },
        { size: 'A2', minHeight: 171, maxHeight: 182, minWeight: 73, maxWeight: 87, wingspan: 168, jacketLength: 79, pantsLength: 97, chestWidth: 119 },
        { size: 'A3', minHeight: 181, maxHeight: 191, minWeight: 85, maxWeight: 100, wingspan: 177, jacketLength: 84, pantsLength: 103, chestWidth: 125 },
        { size: 'A4', minHeight: 189, maxHeight: 202, minWeight: 98, maxWeight: 118, wingspan: 186, jacketLength: 88, pantsLength: 108, chestWidth: 133 },
      ],
      feminino: [
        { size: 'F1', minHeight: 147, maxHeight: 157, minWeight: 42, maxWeight: 52, wingspan: 145, jacketLength: 68, pantsLength: 87, chestWidth: 95 },
        { size: 'F2', minHeight: 155, maxHeight: 166, minWeight: 51, maxWeight: 62, wingspan: 153, jacketLength: 71, pantsLength: 91, chestWidth: 100 },
        { size: 'F3', minHeight: 163, maxHeight: 174, minWeight: 61, maxWeight: 73, wingspan: 160, jacketLength: 75, pantsLength: 95, chestWidth: 106 },
        { size: 'F4', minHeight: 171, maxHeight: 182, minWeight: 72, maxWeight: 85, wingspan: 166, jacketLength: 78, pantsLength: 99, chestWidth: 112 },
      ]
    }
  },

  shoyoroll: {
    id: 'shoyoroll',
    name: 'Shoyoroll (SYR)',
    aliasPatterns: ['shoyoroll', 'syr', 'albino & preto', 'a&p'],
    originCountry: 'EUA / Califórnia (Cultura e Alta Costura do Jiu-Jitsu)',
    cutStyle: 'Fitted Couture (F, L, H Specialized Sizing)',
    cutDescription: 'A Shoyoroll revolucionou o caimento moderno oferecendo variações Fitted (F - corte mais justo), Long (L - mangas e pernas compridas) e Heavy (H - tronco largo).',
    shrinkageRate: '1.5% a 2.5% (Encolhimento mínimo controlado)',
    shrinkagePercentage: 2.0,
    defaultWeave: 'Pearl Weave 450 GSM com lapela em EVA reforçado',
    pantsWeave: 'Sarja Twill 10oz ou Ripstop Ultralight',
    ibjjfApproved: true,
    brandFittingAdvice: 'Se você tem pernas longas, os tamanhos L (A1L, A2L) são famosos pelo ajuste sob medida. Atletas compactos se beneficiam dos modelos F (Fitted).',
    tables: {
      masculino: [
        { size: 'A00', minHeight: 148, maxHeight: 158, minWeight: 45, maxWeight: 56, wingspan: 148, jacketLength: 69, pantsLength: 86, chestWidth: 98, notes: 'Ultraleve juvenil / adulto pequeno' },
        { size: 'A0', minHeight: 155, maxHeight: 165, minWeight: 52, maxWeight: 64, wingspan: 155, jacketLength: 72, pantsLength: 90, chestWidth: 105 },
        { size: 'A1', minHeight: 163, maxHeight: 173, minWeight: 61, maxWeight: 74, wingspan: 161, jacketLength: 76, pantsLength: 94, chestWidth: 111 },
        { size: 'A1F', minHeight: 163, maxHeight: 173, minWeight: 58, maxWeight: 69, wingspan: 161, jacketLength: 75, pantsLength: 94, chestWidth: 106, notes: 'Fitted (Torso mais justo)' },
        { size: 'A1L', minHeight: 172, maxHeight: 180, minWeight: 62, maxWeight: 75, wingspan: 168, jacketLength: 79, pantsLength: 99, chestWidth: 111, notes: 'Long (Mangas e pernas longas)' },
        { size: 'A2', minHeight: 171, maxHeight: 183, minWeight: 73, maxWeight: 87, wingspan: 169, jacketLength: 80, pantsLength: 98, chestWidth: 119 },
        { size: 'A2L', minHeight: 180, maxHeight: 190, minWeight: 74, maxWeight: 88, wingspan: 177, jacketLength: 83, pantsLength: 104, chestWidth: 119, notes: 'Long para atletas altos' },
        { size: 'A2H', minHeight: 170, maxHeight: 180, minWeight: 86, maxWeight: 100, wingspan: 170, jacketLength: 81, pantsLength: 100, chestWidth: 127, notes: 'Heavy para tronco forte' },
        { size: 'A3', minHeight: 181, maxHeight: 192, minWeight: 86, maxWeight: 102, wingspan: 179, jacketLength: 85, pantsLength: 105, chestWidth: 126 },
        { size: 'A3L', minHeight: 189, maxHeight: 198, minWeight: 87, maxWeight: 104, wingspan: 187, jacketLength: 88, pantsLength: 109, chestWidth: 126 },
        { size: 'A4', minHeight: 189, maxHeight: 203, minWeight: 100, maxWeight: 122, wingspan: 188, jacketLength: 89, pantsLength: 109, chestWidth: 135 },
      ],
      feminino: [
        { size: 'F1', minHeight: 146, maxHeight: 156, minWeight: 42, maxWeight: 52, wingspan: 144, jacketLength: 68, pantsLength: 87, chestWidth: 95 },
        { size: 'F2', minHeight: 154, maxHeight: 165, minWeight: 50, maxWeight: 62, wingspan: 152, jacketLength: 71, pantsLength: 91, chestWidth: 100 },
        { size: 'F3', minHeight: 162, maxHeight: 173, minWeight: 60, maxWeight: 73, wingspan: 159, jacketLength: 75, pantsLength: 95, chestWidth: 106 },
        { size: 'F4', minHeight: 170, maxHeight: 181, minWeight: 71, maxWeight: 85, wingspan: 166, jacketLength: 78, pantsLength: 99, chestWidth: 112 },
      ]
    }
  },

  kingz: {
    id: 'kingz',
    name: 'Kingz Kimonos',
    aliasPatterns: ['kingz', 'the one', 'comp 450', 'balistico', 'nanomite'],
    originCountry: 'EUA / Califórnia (Utilizado por campeões do ADCC e Mundiais)',
    cutStyle: 'Modern Competition (Corte Preciso com Variantes L e H)',
    cutDescription: 'A Kingz oferece tecidos Pearl Weave de densidade balanceada e calças de algodão militar com costuras anti-rasgo. Muito popular entre atletas de alta intensidade.',
    shrinkageRate: '2% a 3% (Pré-encolhido)',
    shrinkagePercentage: 2.5,
    defaultWeave: 'High-Tech Pearl Weave 400 a 450 GSM',
    pantsWeave: 'Ripstop 10oz ou Algodão Puro 10oz',
    ibjjfApproved: true,
    brandFittingAdvice: 'Kimono com caimento atlético de fábrica. Para quem tem estatura no topo da faixa e ombros largos, o corte Kingz H dá mobilidade extra.',
    tables: {
      masculino: [
        { size: 'A0', minHeight: 155, maxHeight: 165, minWeight: 50, maxWeight: 63, wingspan: 154, jacketLength: 72, pantsLength: 90, chestWidth: 104 },
        { size: 'A1', minHeight: 163, maxHeight: 173, minWeight: 61, maxWeight: 73, wingspan: 160, jacketLength: 75, pantsLength: 94, chestWidth: 110 },
        { size: 'A1L', minHeight: 171, maxHeight: 180, minWeight: 61, maxWeight: 75, wingspan: 167, jacketLength: 78, pantsLength: 98, chestWidth: 110, notes: 'Long' },
        { size: 'A2', minHeight: 171, maxHeight: 183, minWeight: 73, maxWeight: 86, wingspan: 168, jacketLength: 79, pantsLength: 98, chestWidth: 118 },
        { size: 'A2L', minHeight: 180, maxHeight: 189, minWeight: 73, maxWeight: 88, wingspan: 175, jacketLength: 82, pantsLength: 103, chestWidth: 118, notes: 'Long' },
        { size: 'A2H', minHeight: 170, maxHeight: 180, minWeight: 86, maxWeight: 98, wingspan: 169, jacketLength: 80, pantsLength: 100, chestWidth: 126, notes: 'Heavy' },
        { size: 'A3', minHeight: 181, maxHeight: 192, minWeight: 86, maxWeight: 100, wingspan: 178, jacketLength: 84, pantsLength: 104, chestWidth: 124 },
        { size: 'A4', minHeight: 189, maxHeight: 203, minWeight: 99, maxWeight: 120, wingspan: 186, jacketLength: 88, pantsLength: 108, chestWidth: 132 },
      ],
      feminino: [
        { size: 'F1', minHeight: 146, maxHeight: 156, minWeight: 41, maxWeight: 52, wingspan: 144, jacketLength: 68, pantsLength: 87, chestWidth: 94 },
        { size: 'F2', minHeight: 154, maxHeight: 165, minWeight: 50, maxWeight: 62, wingspan: 152, jacketLength: 71, pantsLength: 91, chestWidth: 99 },
        { size: 'F3', minHeight: 162, maxHeight: 173, minWeight: 60, maxWeight: 73, wingspan: 159, jacketLength: 75, pantsLength: 95, chestWidth: 105 },
        { size: 'F4', minHeight: 170, maxHeight: 181, minWeight: 71, maxWeight: 85, wingspan: 166, jacketLength: 78, pantsLength: 99, chestWidth: 112 },
      ]
    }
  },

  kvra: {
    id: 'kvra',
    name: 'KVRA',
    aliasPatterns: ['kvra', 'bjj kvra', 'caveira'],
    originCountry: 'Brasil / São Paulo (Autêntica Cultura Urbana de Tatame)',
    cutStyle: 'Ajustado Contemporâneo (Corte Justo & Reforçado)',
    cutDescription: 'A KVRA desenha kimonos com caimento justo nas costelas e peito, valorizando o condicionamento físico do atleta e dificultando a pegada do adversário na gola.',
    shrinkageRate: '2% a 3% (Algodão tratado)',
    shrinkagePercentage: 2.5,
    defaultWeave: 'Trançado Médio 440 GSM',
    pantsWeave: 'Ripstop Leve ou Sarja 100% Algodão',
    ibjjfApproved: true,
    brandFittingAdvice: 'O kimono KVRA tem modelagem um pouco mais justa no tórax que a média tradicional. Se você tiver ombros largos ou peitoral desenvolvido, considere um tamanho acima.',
    tables: {
      masculino: [
        { size: 'A0', minHeight: 155, maxHeight: 165, minWeight: 50, maxWeight: 62, wingspan: 153, jacketLength: 71, pantsLength: 90, chestWidth: 103 },
        { size: 'A1', minHeight: 162, maxHeight: 172, minWeight: 60, maxWeight: 73, wingspan: 159, jacketLength: 74, pantsLength: 93, chestWidth: 109 },
        { size: 'A2', minHeight: 170, maxHeight: 182, minWeight: 72, maxWeight: 86, wingspan: 167, jacketLength: 78, pantsLength: 97, chestWidth: 117 },
        { size: 'A3', minHeight: 180, maxHeight: 191, minWeight: 85, maxWeight: 99, wingspan: 176, jacketLength: 83, pantsLength: 103, chestWidth: 123 },
        { size: 'A4', minHeight: 188, maxHeight: 202, minWeight: 98, maxWeight: 118, wingspan: 185, jacketLength: 87, pantsLength: 107, chestWidth: 131 },
      ],
      feminino: [
        { size: 'F1', minHeight: 146, maxHeight: 156, minWeight: 42, maxWeight: 52, wingspan: 144, jacketLength: 68, pantsLength: 87, chestWidth: 95 },
        { size: 'F2', minHeight: 155, maxHeight: 165, minWeight: 50, maxWeight: 62, wingspan: 152, jacketLength: 71, pantsLength: 91, chestWidth: 100 },
        { size: 'F3', minHeight: 163, maxHeight: 174, minWeight: 60, maxWeight: 73, wingspan: 159, jacketLength: 75, pantsLength: 95, chestWidth: 106 },
        { size: 'F4', minHeight: 171, maxHeight: 182, minWeight: 71, maxWeight: 85, wingspan: 166, jacketLength: 78, pantsLength: 99, chestWidth: 112 },
      ]
    }
  },

  tatami: {
    id: 'tatami',
    name: 'Tatami Fightwear',
    aliasPatterns: ['tatami', 'tatami fightwear', 'estilo', 'nova'],
    originCountry: 'Reino Unido / País de Gales (Uma das maiores marcas globais)',
    cutStyle: 'Corte Britânico Esportivo (Estilo Series)',
    cutDescription: 'A Tatami é referência em kimonos de entrada e competição (Estilo e Nova). Apresenta caimento consistente com medidas métricas e imperiais balanceadas para competições europeias e mundiais.',
    shrinkageRate: '2% a 3% (Pré-encolhido)',
    shrinkagePercentage: 2.5,
    defaultWeave: 'Pearl Weave 475 GSM (Estilo) / 375 GSM (Nova)',
    pantsWeave: 'Sarja 12oz ou Algodão 10oz',
    ibjjfApproved: true,
    brandFittingAdvice: 'Modelagem padrão internacional bastante fiel à tabela de medidas. Possui versões L (Long) nos modelos Estilo.',
    tables: {
      masculino: [
        { size: 'A0', minHeight: 155, maxHeight: 165, minWeight: 50, maxWeight: 63, wingspan: 154, jacketLength: 72, pantsLength: 90, chestWidth: 104 },
        { size: 'A1', minHeight: 163, maxHeight: 173, minWeight: 61, maxWeight: 74, wingspan: 160, jacketLength: 75, pantsLength: 94, chestWidth: 110 },
        { size: 'A1L', minHeight: 171, maxHeight: 180, minWeight: 61, maxWeight: 75, wingspan: 167, jacketLength: 78, pantsLength: 98, chestWidth: 110 },
        { size: 'A2', minHeight: 171, maxHeight: 183, minWeight: 73, maxWeight: 86, wingspan: 168, jacketLength: 79, pantsLength: 98, chestWidth: 118 },
        { size: 'A2L', minHeight: 180, maxHeight: 189, minWeight: 73, maxWeight: 88, wingspan: 175, jacketLength: 82, pantsLength: 103, chestWidth: 118 },
        { size: 'A3', minHeight: 181, maxHeight: 192, minWeight: 86, maxWeight: 100, wingspan: 178, jacketLength: 84, pantsLength: 104, chestWidth: 124 },
        { size: 'A4', minHeight: 189, maxHeight: 203, minWeight: 99, maxWeight: 120, wingspan: 186, jacketLength: 88, pantsLength: 108, chestWidth: 132 },
      ],
      feminino: [
        { size: 'F1', minHeight: 146, maxHeight: 156, minWeight: 41, maxWeight: 52, wingspan: 144, jacketLength: 68, pantsLength: 87, chestWidth: 94 },
        { size: 'F2', minHeight: 154, maxHeight: 165, minWeight: 50, maxWeight: 62, wingspan: 152, jacketLength: 71, pantsLength: 91, chestWidth: 99 },
        { size: 'F3', minHeight: 162, maxHeight: 173, minWeight: 60, maxWeight: 73, wingspan: 159, jacketLength: 75, pantsLength: 95, chestWidth: 105 },
        { size: 'F4', minHeight: 170, maxHeight: 181, minWeight: 71, maxWeight: 85, wingspan: 166, jacketLength: 78, pantsLength: 99, chestWidth: 112 },
      ]
    }
  },

  keiko: {
    id: 'keiko',
    name: 'Keiko Raca',
    aliasPatterns: ['keiko', 'keiko raca', 'keiko raça', 'gold weave'],
    originCountry: 'Brasil / São Paulo (Desde 1988 - O Blindado Original)',
    cutStyle: 'Tradicional Blindado (Gold Weave Pesado)',
    cutDescription: 'A Keiko é reverenciada pelos praticantes old-school pelo tecido trançado duplo e Gold Weave denso, proporcionando uma armadura difícil de agarrar.',
    shrinkageRate: '4% a 5% (Algodão puro sem elastano)',
    shrinkagePercentage: 4.5,
    defaultWeave: 'Gold Weave 550 GSM ou Double Weave 650 GSM',
    pantsWeave: 'Sarja Grossa 100% Algodão 320 GSM',
    ibjjfApproved: true,
    brandFittingAdvice: 'Kimono resistente que encolhe naturalmente nas primeiras lavagens com água morna. Lave com sabão neutro e água fria para preservar as medidas originais.',
    tables: {
      masculino: [
        { size: 'A1', minHeight: 160, maxHeight: 172, minWeight: 55, maxWeight: 72, wingspan: 160, jacketLength: 76, pantsLength: 94, chestWidth: 112 },
        { size: 'A2', minHeight: 170, maxHeight: 183, minWeight: 71, maxWeight: 87, wingspan: 168, jacketLength: 80, pantsLength: 98, chestWidth: 120 },
        { size: 'A3', minHeight: 180, maxHeight: 192, minWeight: 85, maxWeight: 100, wingspan: 177, jacketLength: 85, pantsLength: 103, chestWidth: 126 },
        { size: 'A4', minHeight: 189, maxHeight: 202, minWeight: 98, maxWeight: 118, wingspan: 185, jacketLength: 89, pantsLength: 107, chestWidth: 134 },
      ],
      feminino: [
        { size: 'F1', minHeight: 147, maxHeight: 157, minWeight: 42, maxWeight: 52, wingspan: 145, jacketLength: 69, pantsLength: 88, chestWidth: 96 },
        { size: 'F2', minHeight: 155, maxHeight: 166, minWeight: 51, maxWeight: 62, wingspan: 153, jacketLength: 72, pantsLength: 92, chestWidth: 101 },
        { size: 'F3', minHeight: 163, maxHeight: 174, minWeight: 61, maxWeight: 74, wingspan: 160, jacketLength: 76, pantsLength: 96, chestWidth: 107 },
        { size: 'F4', minHeight: 171, maxHeight: 182, minWeight: 72, maxWeight: 86, wingspan: 167, jacketLength: 79, pantsLength: 100, chestWidth: 114 },
      ]
    }
  },

  vulkan: {
    id: 'vulkan',
    name: 'Vulkan Fight Co.',
    aliasPatterns: ['vulkan', 'pro light', 'ultra light'],
    originCountry: 'Brasil / EUA (Pioneira em Kimonos Ultra Leves)',
    cutStyle: 'Ultra Light Series (Zero Encolhimento)',
    cutDescription: 'Kimonos desenvolvidos para atletas que precisam bater o peso no dia do campeonato sem abrir mão da homologação da IBJJF. Tecido pré-encolhido cirúrgico com secagem ultra-rápida.',
    shrinkageRate: 'Menos de 1.5% (Pré-encolhido cirurgicamente a vapor)',
    shrinkagePercentage: 1.2,
    defaultWeave: 'Pearl Weave Light 380 GSM',
    pantsWeave: 'Ripstop Militar Anti-Rasgo 8oz',
    ibjjfApproved: true,
    brandFittingAdvice: 'O encolhimento é praticamente nulo. O tamanho que vestir na prova permanecerá o mesmo após dezenas de lavagens a frio.',
    tables: {
      masculino: [
        { size: 'A0', minHeight: 155, maxHeight: 165, minWeight: 50, maxWeight: 62, wingspan: 153, jacketLength: 71, pantsLength: 89, chestWidth: 103 },
        { size: 'A1', minHeight: 162, maxHeight: 172, minWeight: 60, maxWeight: 73, wingspan: 159, jacketLength: 74, pantsLength: 93, chestWidth: 109 },
        { size: 'A2', minHeight: 170, maxHeight: 182, minWeight: 72, maxWeight: 86, wingspan: 167, jacketLength: 78, pantsLength: 97, chestWidth: 117 },
        { size: 'A3', minHeight: 180, maxHeight: 191, minWeight: 85, maxWeight: 99, wingspan: 176, jacketLength: 83, pantsLength: 103, chestWidth: 123 },
        { size: 'A4', minHeight: 188, maxHeight: 202, minWeight: 98, maxWeight: 118, wingspan: 185, jacketLength: 87, pantsLength: 107, chestWidth: 131 },
      ],
      feminino: [
        { size: 'F1', minHeight: 146, maxHeight: 156, minWeight: 42, maxWeight: 52, wingspan: 144, jacketLength: 68, pantsLength: 87, chestWidth: 95 },
        { size: 'F2', minHeight: 155, maxHeight: 165, minWeight: 50, maxWeight: 62, wingspan: 152, jacketLength: 71, pantsLength: 91, chestWidth: 100 },
        { size: 'F3', minHeight: 163, maxHeight: 174, minWeight: 60, maxWeight: 73, wingspan: 159, jacketLength: 75, pantsLength: 95, chestWidth: 106 },
        { size: 'F4', minHeight: 171, maxHeight: 182, minWeight: 71, maxWeight: 85, wingspan: 166, jacketLength: 78, pantsLength: 99, chestWidth: 112 },
      ]
    }
  },

  default: {
    id: 'default',
    name: 'Padrão Oficial BJJ (IBJJF / CBJJ)',
    aliasPatterns: ['oss', 'default', 'universal', 'padrao'],
    originCountry: 'Homologação Internacional IBJJF',
    cutStyle: 'Oficial Regulamentar de Competição',
    cutDescription: 'Grade técnica baseada nos parâmetros oficiais de checagem da International Brazilian Jiu-Jitsu Federation (margem de manga mínima de 7cm, lapela de EVA vulcanizado até 5cm de largura).',
    shrinkageRate: '2% a 4% estimado conforme lavagem',
    shrinkagePercentage: 3.0,
    defaultWeave: 'Pearl Weave 450 GSM',
    pantsWeave: 'Ripstop 10oz ou Sarja 100% Algodão',
    ibjjfApproved: true,
    brandFittingAdvice: 'Tabela universal de calibração para uniformes de combate. Se estiver em dúvida entre duas numerações, opte pela maior para garantir a passagem no medidor da checagem.',
    tables: {
      masculino: [
        { size: 'A0', minHeight: 155, maxHeight: 165, minWeight: 50, maxWeight: 65, wingspan: 155, jacketLength: 72, pantsLength: 90, chestWidth: 104, notes: 'Galo e Pluma' },
        { size: 'A1', minHeight: 162, maxHeight: 172, minWeight: 60, maxWeight: 75, wingspan: 161, jacketLength: 75, pantsLength: 94, chestWidth: 110, notes: 'Pluma e Pena' },
        { size: 'A2', minHeight: 170, maxHeight: 182, minWeight: 72, maxWeight: 88, wingspan: 168, jacketLength: 79, pantsLength: 98, chestWidth: 118, notes: 'Leve e Médio' },
        { size: 'A3', minHeight: 180, maxHeight: 191, minWeight: 85, maxWeight: 100, wingspan: 177, jacketLength: 84, pantsLength: 103, chestWidth: 124, notes: 'Meio-Pesado e Pesado' },
        { size: 'A4', minHeight: 189, maxHeight: 202, minWeight: 98, maxWeight: 115, wingspan: 186, jacketLength: 88, pantsLength: 107, chestWidth: 132, notes: 'Super-Pesado' },
        { size: 'A5', minHeight: 198, maxHeight: 210, minWeight: 112, maxWeight: 130, wingspan: 194, jacketLength: 92, pantsLength: 111, chestWidth: 140, notes: 'Pesadíssimo' },
      ],
      feminino: [
        { size: 'F1', minHeight: 145, maxHeight: 155, minWeight: 40, maxWeight: 50, wingspan: 144, jacketLength: 68, pantsLength: 87, chestWidth: 94 },
        { size: 'F2', minHeight: 152, maxHeight: 165, minWeight: 48, maxWeight: 60, wingspan: 152, jacketLength: 71, pantsLength: 91, chestWidth: 99 },
        { size: 'F3', minHeight: 160, maxHeight: 172, minWeight: 58, maxWeight: 72, wingspan: 159, jacketLength: 75, pantsLength: 95, chestWidth: 105 },
        { size: 'F4', minHeight: 168, maxHeight: 180, minWeight: 70, maxWeight: 85, wingspan: 166, jacketLength: 78, pantsLength: 99, chestWidth: 112 },
      ],
      infantil: [
        { size: 'M0', minHeight: 110, maxHeight: 120, minWeight: 20, maxWeight: 26, wingspan: 108, jacketLength: 52, pantsLength: 68 },
        { size: 'M1', minHeight: 120, maxHeight: 130, minWeight: 26, maxWeight: 33, wingspan: 118, jacketLength: 57, pantsLength: 74 },
        { size: 'M2', minHeight: 130, maxHeight: 140, minWeight: 32, maxWeight: 40, wingspan: 128, jacketLength: 62, pantsLength: 80 },
        { size: 'M3', minHeight: 140, maxHeight: 150, minWeight: 38, maxWeight: 48, wingspan: 138, jacketLength: 67, pantsLength: 85 },
        { size: 'M4', minHeight: 148, maxHeight: 158, minWeight: 45, maxWeight: 56, wingspan: 146, jacketLength: 70, pantsLength: 89 },
      ]
    }
  }
};

/**
 * Helper to retrieve size chart specifically for a kimono brand.
 * Normalizes strings, handles partial matches, fallbacks gracefully.
 */
export function getBrandSizeChart(brandName?: string): BrandSizeChart {
  if (!brandName) return BRAND_SIZE_CHARTS.default;

  const normalized = brandName.toLowerCase().trim();

  // 1. Direct key match
  if (BRAND_SIZE_CHARTS[normalized]) {
    return BRAND_SIZE_CHARTS[normalized];
  }

  // 2. Pattern matching in alias list
  for (const chart of Object.values(BRAND_SIZE_CHARTS)) {
    if (chart.aliasPatterns.some(pattern => normalized.includes(pattern) || pattern.includes(normalized))) {
      return chart;
    }
  }

  // 3. Fallback to default
  return BRAND_SIZE_CHARTS.default;
}

/**
 * List all available brands that have dedicated size charts
 */
export const AVAILABLE_BRAND_CHARTS = Object.values(BRAND_SIZE_CHARTS);
