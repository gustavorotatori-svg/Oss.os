/**
 * LGPD & Legal Terms Configuration for OSS.OS
 * Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
 * Atualizado para o lançamento oficial 2026.
 */

export interface LGPDConsentState {
  approvedCadastral: boolean;        // Dados cadastrais essenciais (Nome, e-mail, faixa, academia)
  approvedWishlistAlerts: boolean;   // Alertas de preço e drops de estoque
  approvedNavigation: boolean;       // Métricas de navegação / Usabilidade
  approvedSessionCookies: boolean;   // Cookies de sessão e segurança (Obrigatório)
  approvedMarketing: boolean;        // Comunicações de torneios e lançamentos parceiros
  consentDate?: string;
  consentVersion?: string;
  userAgent?: string;
}

export const CURRENT_LGPD_VERSION = 'v2.4-2026';

export const DPO_INFO = {
  name: 'Encarregado pelo Tratamento de Dados Pessoais (DPO)',
  email: 'dpo@oss.os',
  supportEmail: 'privacidade@oss.os',
  legalEntity: 'OSS.OS Tecnologia e Esportes Ltda.',
  address: 'São Paulo, SP - Brasil',
  responseDeadlineDays: 15, // Art. 19, II da LGPD
  authority: 'ANPD - Autoridade Nacional de Proteção de Dados'
};

export const LGPD_COMPLIANCE_PILLARS = [
  {
    id: 'finalidade',
    title: '1. Princípio da Finalidade (Art. 6º, I)',
    description: 'Tratamos apenas os dados estritamente necessários para permitir a comparação gratuita de equipamentos, sistema de treinos e rankings de Jiu-Jitsu.',
    status: 'CONFORME'
  },
  {
    id: 'adequacao',
    title: '2. Princípio da Adequação & Necessidade (Art. 6º, II e III)',
    description: 'Não coletamos dados sensíveis desnecessários. Informações de faixa, academia e peso são utilizadas exclusivamente para recomendações de tamanho de kimono.',
    status: 'CONFORME'
  },
  {
    id: 'livre_acesso',
    title: '3. Livre Acesso e Transparência (Art. 6º, IV e VI)',
    description: 'Disponibilizamos painel de autoatendimento para consulta, correção e exportação imediata de todos os dados armazenados em formato JSON estruturado.',
    status: 'CONFORME'
  },
  {
    id: 'seguranca',
    title: '4. Segurança e Criptografia (Art. 6º, VII e Art. 46)',
    description: 'Todos os dados trafegam sob HTTPS/TLS 1.3, com rate limiting contra abusos, Content Security Policy rígida e autenticação isolada via Firebase Auth.',
    status: 'CONFORME'
  },
  {
    id: 'nao_discriminacao',
    title: '5. Não Discriminação (Art. 6º, IX)',
    description: 'Nenhum dado é utilizado para fins discriminatórios, abusivos ou repasse não autorizado a terceiros.',
    status: 'CONFORME'
  },
  {
    id: 'portabilidade',
    title: '6. Portabilidade dos Dados (Art. 18, V)',
    description: 'Exportação imediata de todo o histórico de compras comparadas, treinos registrados, pontos acumulados e consentimentos.',
    status: 'CONFORME'
  },
  {
    id: 'direito_esquecimento',
    title: '7. Direito ao Esquecimento / Exclusão (Art. 18, VI)',
    description: 'Exclusão definitiva e irrevogável da conta e anonimização de registros históricos com apenas 1 clique com confirmação segura.',
    status: 'CONFORME'
  },
  {
    id: 'canal_dpo',
    title: '8. Canal do Encarregado / DPO Ativo (Art. 41)',
    description: 'Canal de atendimento direto com emissão de protocolo e prazo legal máximo de 15 dias para respostas a solicitações de titulares.',
    status: 'CONFORME'
  }
];

export const PRIVACY_POLICY_SECTIONS = [
  {
    id: 'introducao',
    title: '1. IDENTIFICAÇÃO DO CONTROLADOR E OBJETIVO',
    content: `O portal OSS.OS ("Nós", "Plataforma", "OSS.OS") é uma solução digital 100% gratuita desenvolvida para a comunidade de artes marciais, com foco em Jiu-Jitsu Brasileiro (BJJ). 
    Esta Política de Privacidade descreve de forma clara e acessível como coletamos, tratamos, armazenamos e protegemos os seus dados pessoais, em estrita conformidade com a Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD).
    
    A navegação e a utilização dos serviços da plataforma implicam no conhecimento desta política.`
  },
  {
    id: 'bases_legais',
    title: '2. BASES LEGAIS E DADOS COLETADOS (ARTS. 7º E 11º LGPD)',
    content: `Coletamos apenas os dados fundamentais para o funcionamento dos serviços oferecidos:
    
    a) Dados de Cadastro (Base: Consentimento - Art. 7º, I e Execução de Contrato - Art. 7º, V):
    - Nome de exibição, e-mail e foto de perfil;
    - Graduação (faixa de Jiu-Jitsu), academia/dojo e categoria de peso (opcionais, usados para recomendações de tamanho de kimono);
    
    b) Dados de Uso e Navegação (Base: Legítimo Interesse - Art. 7º, IX e Consentimento):
    - Itens salvos na lista de desejos (Wishlist);
    - Histórico de buscas e comparações de produtos (anonimizado);
    - Endereço IP anonimizado, tipo de navegador e registros de acesso para prevenção a fraudes e garantia da estabilidade técnica;
    
    c) Cookies e Armazenamento Local:
    - Tokens de autenticação segura para manter sua sessão conectada;
    - Preferências de tema visual (Dark/Light mode) e filtros salvos.`
  },
  {
    id: 'finalidade_tratamento',
    title: '3. FINALIDADE ESPECÍFICA DO TRATAMENTO',
    content: `Seus dados são tratados estritamente para:
    1. Prover o comparador inteligente de preços de kimonos, faixas e rashguards 100% gratuito;
    2. Calcular o tamanho recomendado de kimono com base no perfil físico informado;
    3. Notificar sobre quedas de preço e cupons reais de marcas parceiras (apenas mediante consentimento);
    4. Computar pontos no Programa de Fidelidade e no Diário do Tatame;
    5. Manter a segurança da infraestrutura contra ataques cibernéticos e acessos não autorizados.`
  },
  {
    id: 'compartilhamento',
    title: '4. COMPARTILHAMENTO DE DADOS E NÃO-COMERCIALIZAÇÃO',
    content: `O OSS.OS POSSUI O COMPROMISSO INEGOCIÁVEL DE NUNCA VENDER, ALUGAR OU COMERCIALIZAR SEUS DADOS PESSOAIS COM TERCEIROS.
    
    O compartilhamento de dados ocorre unicamente nas seguintes hipóteses estritas:
    - Com provedores de infraestrutura em nuvem segura (Google Cloud Platform / Firebase), que seguem padrões internacionais de segurança ISO 27001 e SOC 2;
    - Ao clicar em uma oferta de loja parceira (Mercado Livre, Shopee, Amazon, Lojas Oficiais), você é redirecionado diretamente para o ambiente da loja, aplicando-se os termos de privacidade da referida loja;
    - Mediante determinação legal ou ordem de autoridade judicial/ANPD competente.`
  },
  {
    id: 'direitos_titular',
    title: '5. DIREITOS DO TITULAR DOS DADOS (ART. 18 LGPD)',
    content: `Você, como titular dos dados, possui os seguintes direitos garantidos, os quais podem ser exercidos a qualquer momento através do nosso painel de privacidade:
    
    1. Confirmação da existência de tratamento;
    2. Acesso facilitado aos seus dados;
    3. Correção de dados incompletos, inexatos ou desatualizados;
    4. Anonimização, bloqueio ou eliminação de dados desnecessários;
    5. Portabilidade dos dados a outro fornecedor (download imediato em arquivo JSON);
    6. Eliminação completa dos dados pessoais tratados com consentimento (Direito ao Esquecimento);
    7. Informação das entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados;
    8. Informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa;
    9. Revogação do consentimento a qualquer momento.`
  },
  {
    id: 'seguranca_retencao',
    title: '6. MEDIDAS DE SEGURANÇA E RETENÇÃO',
    content: `Empregamos medidas técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração ou difusão:
    
    - Criptografia de ponta a ponta em trânsito (HTTPS / TLS 1.3);
    - Regras rígidas de segurança no banco de dados Firestore (Firestore Security Rules);
    - Rate limiting em todas as APIs públicas para evitar varreduras maliciosas;
    - Políticas de senhas seguras gerenciadas pelo Firebase Auth com suporte a OAuth do Google e Apple;
    - Os dados cadastrais são retidos enquanto a conta estiver ativa. Ao solicitar a exclusão, os dados são permanentemente expurgados em até 48 horas úteis.`
  },
  {
    id: 'dpo_contato',
    title: '7. ENCARREGADO DE DADOS (DPO) E ATENDIMENTO',
    content: `Para exercer qualquer um de seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato diretamente com o nosso Encarregado de Proteção de Dados (DPO):
    
    - Encarregado: Equipe de Governança de Dados OSS.OS
    - E-mail: dpo@oss.os
    - Prazo de resposta: Até 15 (quinze) dias corridos, conforme Art. 19 da LGPD
    - Protocolo eletrônico emitido automaticamente a cada solicitação.`
  }
];

export const TERMS_OF_SERVICE_SECTIONS = [
  {
    id: 'termos_aceite',
    title: '1. NATUREZA 100% GRATUITA DO SERVIÇO',
    content: `O OSS.OS é uma plataforma e comparador de preços 100% gratuito para atletas, praticantes e professores de Jiu-Jitsu. Não há mensalidades, cobranças ocultas ou taxas para comparar preços de kimonos, faixas, rashguards ou gerenciar dojos.`
  },
  {
    id: 'transparencia_precos',
    title: '2. TRANSPARÊNCIA DE PREÇOS E AFILIAÇÃO',
    content: `Nosso motor de busca e comparação monitora ofertas públicas de lojas oficiais e marketplaces. Para manter o serviço 100% gratuito sem cobrar nada dos atletas, o portal pode receber pequenas comissões de afiliados quando uma compra é concretizada através de nossos links parceiros, sem NENHUM custo adicional para você.`
  },
  {
    id: 'responsabilidade_compras',
    title: '3. RESPONSABILIDADE SOBRE COMPRAS NAS LOJAS PARCEIRAS',
    content: `O OSS.OS é um indexador e comparador independente. A transação comercial, pagamento, entrega, garantia e suporte pós-venda são de exclusiva responsabilidade da loja parceira onde a compra for finalizada (ex: Mercado Livre, Amazon, Shopee, Lojas de Kimono Oficiais).`
  },
  {
    id: 'conduta_tatame',
    title: '4. CÓDIGO DE CONDUTA NO TATAME DIGITAL',
    content: `Prezamos pela honra, respeito e disciplina das artes marciais. Usuários que utilizarem o sistema para disseminar ofensas, fraudes, scraping abusivo ou qualquer conduta que viole a lei terão suas contas suspensas imediatamente.`
  }
];
