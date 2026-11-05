import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources: any = {
  en: {
    translation: {
      "quick_access": "Quick Access",
      "categories": {
        "All": "All",
        "Vestuário": "Apparel",
        "Equipamentos de Proteção": "Protective Gear",
        "Suplementos": "Supplements",
        "Acessórios": "Accessories",
        "Kimonos": "Kimonos",
        "Rash Guards": "Rash Guards",
        "Rashguards": "Licras (Rashguards)",
        "Nogi": "Nogi",
        "Shorts": "Bermudas (Shorts)",
        "Protections": "Protections",
        "Supplements": "Supplements",
        "Accessories": "Accessories",
        "Faixas": "Belts",
        "Casual": "Casual",
        "Mochilas": "Backpacks",
        "Lifestyle": "Lifestyle",
        "Recovery": "Recovery",
        "Equipamentos": "Equipment",
        "Academias": "Academies",
        "Filosofia": "Philosophy",
        "beginners": "Beginners",
        "competition": "Competition",
        "training_accessories": "Training Gear",
        "nutrition": "Sports Nutrition",
        "instructionals": "Books & Techniques",
        "mat_armor": "Mat Armor"
      },
      "nav": {
        "home": "Home",
        "shop": "Shop",
        "blog": "Blog",
        "settings": "Athlete Portal",
        "podcast": "Podcast",
        "contact": "Contact",
        "about": "About Us",
        "wishlist": "Favorites",
        "profile": "My Portal",
        "categories": "Categories",
        "transparency": "Transparency 10%",
        "comparator": "Price Comparator",
        "comparator_short": "Comparator"
      },
      "common": {
        "loading": "Loading...",
        "error": "Error",
        "success": "Success",
        "cancel": "Cancel",
        "remove": "Remove",
        "back": "Back",
        "next": "Next",
        "close": "Close",
        "admin": "Admin [Master]",
        "login": "SIGN IN",
        "logout": "Sign Out",
        "online": "ONLINE",
        "offline": "OFFLINE",
        "theme_visual": "Theme",
        "light": "Light",
        "dark": "Dark",
        "auto": "Auto",
        "select_language": "Select Language"
      },
      "header": {
        "search_placeholder": "Search gear, techniques, posts...",
        "recent_searches": "Recent Searches",
        "clear": "Clear",
        "popular_suggestions": "Popular Terms & Suggestions"
      },
      "hero": {
        "scene1_tag": "SCENE 01 // SUPREME ARMOR",
        "scene1_headline": "THE SCIENCE OF PRESSURE.",
        "scene1_highlight": "THE ART OF OVERCOMING.",
        "scene1_subtitle": "450g/m² to 550g/m² pearl weave gis with triple reinforced stitching and vulcanized EVA collar to resist any grip.",
        "scene1_cta": "Explore Elite Gis",
        "scene2_tag": "SCENE 02 // THERMAL SECOND SKIN",
        "scene2_headline": "ZERO FRICTION ON THE MAT.",
        "scene2_highlight": "MAXIMUM NO-GI SPEED.",
        "scene2_subtitle": "Anatomical high-density 4-Way Stretch compression that regulates muscle temperature and shields your skin.",
        "scene2_cta": "View Rashguards",
        "scene3_tag": "SCENE 03 // THE CODE OF RANK",
        "scene3_headline": "EVERY FIBER TELLS A STORY.",
        "scene3_highlight": "YOUR BELT, YOUR LEGACY.",
        "scene3_subtitle": "100% premium cotton belts with rank sleeve and reinforced 8 to 12-row stitching.",
        "scene3_cta": "Explore Belts",
        "featured_badge": "SCENE HIGHLIGHT"
      },
      "deal": {
        "super_offer": "DEAL OF THE DAY",
        "savings": "Save",
        "historical_low": "Lowest Price"
      },
      "catalog": {
        "results_header": "Catalog Results",
        "items_count": "{{count}} product",
        "items_count_plural": "{{count}} products",
        "pagination": "Page {{page}} of {{total}}",
        "filtering": "Filtering catalog...",
        "no_products_found": "No gear found",
        "no_products_desc": "No products match the selected filters. Try adjusting price range, brands, or categories."
      },
      "notification": {
        "price_alert_title": "Price Drop Alerts",
        "price_alert_desc": "Get instant notifications when your saved products go on sale.",
        "enable_btn": "Enable Alerts"
      },
      "footer": {
        "navigation": "Navigation",
        "social": "Social",
        "status_active": "OFFICIAL PORTAL • BJJ LIFESTYLE",
        "rights": "© 2026 OSS.OS DIARY [APPLIED TECHNICAL INTELLIGENCE]",
        "tagline": "\"Jiu-Jitsu is not just fighting. It's about the essence, the gentle way and respect for the bones that support us. Oss.os Diary is the ultimate curation for the mat lifestyle.\""
      },
      "search_placeholder": "Search gear, techniques, posts...",
      "voice": {
        "listening": "Listening... Speak what you want to search.",
        "listening_short": "LISTENING",
        "speak_now": "Speak now...",
        "speak_hint": "Speak clearly: product name, technique, brand, or category...",
        "searching_for": "Searching for: \"{{query}}\"",
        "not_supported": "Your browser does not support voice search.",
        "error": "Voice search error. Try again.",
        "start": "Voice Search (Microphone)",
        "stop": "Stop voice search",
        "amplitude": "Voice Amplitude",
        "search_action": "Search Now",
        "stop_action": "Stop Mic",
        "cancel": "Cancel"
      },
      "reset_confirm": "This will clear all generated news and reset the cache to ensure only Jiu-Jitsu images appear. Continue?",
      "theme": {
        "light": "Switch to light mode",
        "dark": "Switch to dark mode"
      },
      "navigation_status": "Navigation Status",
      "empty_wishlist": "Your wishlist is empty",
      "start_exploring": "Start Exploring",
      "no_results": "Zero Mat (No Results)",
      "consent": {
        "title": "Terms and Responsibility",
        "text1": "OSS.OS is an equipment portal. We do not sell products directly. Responsibility for delivery, quality and warranty belongs to partner stores (Amazon, Shopee, etc.).",
        "text2": "By continuing, you agree to our terms of use and understand that the selection is made by real Jiu-Jitsu practitioners.",
        "button": "Aware and Agree"
      },
      "blog": {
        "related": "Related News",
        "recommended_gear": "Recommended Gear",
        "view_all": "More news soon...",
        "exit": "Exit Report",
        "close": "Close News",
        "copy_link": "Copy Link",
        "copied": "Copied!",
        "see_also": "See also on the portal",
        "our_shop": "Our Curated Shop",
        "episodes": "Podcast Episodes",
        "explore": "Explore the Digital Mat",
        "written_by": "Written by"
      },
      "wishlist_confirm": {
        "title": "Remove from Wishlist",
        "text": "Are you sure you want to remove this item?"
      },
      "filter": {
        "title": "Advanced Filters",
        "active_filters": "Active Filters",
        "clear_all": "Clear All",
        "price_range": "Price Range",
        "brands": "Brands",
        "sizes": "Sizes",
        "gender": "Gender",
        "belt_color": "Graduation / Belt",
        "rating": "Min. Rating",
        "platforms": "Platforms",
        "product_type": "Product Type",
        "view_results": "View {{count}} Items"
      },
      "product": {
        "best_price": "Best Price",
        "best_seller": "Best Seller",
        "view_details": "View Details",
        "buy_now": "Buy Now",
        "reviews": "Feedback",
        "price_history": "Price History",
        "comparative": "Price Comparative"
      },
      "checkout": {
        "title": "Mat Checkout",
        "terms": "I read and accept the Terms and Conditions.",
        "finish": "Finish and Go to Store"
      },
      "landing": {
        "hero_title_part1": "OSS.OS",
        "hero_title_part2": "DIARY",
        "filtered_by": "FILTERED BY THE MAT • EST. 2024",
        "portal_subtitle": "EQUIPMENT PORTAL AND JIU-JITSU CULTURE",
        "portal_description": "Technical curation inspired by Diário dos Oss.os. Best prices and social impact.",
        "enter_shop": "ENTER SHOP",
        "selected_offers": "SELECTED OFFERS",
        "hero_captions": {
          "0": "Discipline is the only way. There are no shortcuts on the mat of life.",
          "1": "Work in silence. Let your success make the noise. The wolf doesn't care about the sheep's opinion.",
          "2": "Jiu-Jitsu is not about weight, but about how much your mind resists.",
          "3": "Oss. 'Oshi Shinobu'. Persevere under pressure. Discipline is our structural foundation."
        },
        "collection": "COLLECTION 2026",
        "search_btn": "SEARCH",
        "compare_prices": "COMPARE PRICES",
        "our_manifesto": "OUR MANIFESTO",
        "technique_never_lies": "TECHNIQUE NEVER LIES.",
        "promise_quote": "\"The market is saturated with promises. We deliver what survives the first roll.\"",
        "read_full_manifesto": "READ FULL MANIFESTO",
        "hide_details": "HIDE DETAILS",
        "manifesto_text": "We were born out of the frustration of buying equipment that cannot handle the standard mat routine. OSS.OS is not just a shop, it is a filter. Every gi, belt, and supplement passes through our technical curation before arriving on your radar.",
        "validated_mat": "VALIDATED ON THE MAT",
        "essence_focus": "FOCUS ON THE ESSENCE",
        "foundations_path": "THE FOUNDATIONS OF THE PATH",
        "fighter_structure": "GEAR UP LIKE A WARRIOR",
        "honor": "HONOR",
        "honor_desc": "Your word is worth more than any contract.",
        "discipline": "DISCIPLINE",
        "discipline_desc": "The mat does not forgive lack of consistency.",
        "silence": "SILENCE",
        "silence_desc": "Work hard, but let results do the talking.",
        "legacy": "LEGACY",
        "legacy_desc": "Every technique passed down is a gift to the future.",
        "the_filter": "THE OSS.OS FILTER",
        "ultimate_curation": "THE ULTIMATE CURATION",
        "phase_01": "Phase 01",
        "phase_02": "Phase 02",
        "phase_03": "Phase 03",
        "tech_validation": "TECHNICAL VALIDATION",
        "best_price_card": "BEST PRICE",
        "secure_purchase": "SECURE PURCHASE",
        "validation_desc": "We select only what survives the mat test.",
        "best_price_desc": "We monitor outlets to deliver the cheapest link.",
        "secure_purchase_desc": "Direct links to official stores with delivery guarantee."
      },
      "ai_refinement": {
        "title": "Smart Refinement",
        "input_label": "Technical Search (Natural Language)",
        "input_placeholder": "Ex: Light Gi for competitor...",
        "style_label": "Fighting Style",
        "material_label": "Material Preference",
        "rigor_label": "AI Rigor",
        "footer": "* OSS.OS algorithm calibrated for the 2026 mat.",
        "styles": {
          "Guardeiro": "Guard Player",
          "Passador": "Passer",
          "Wrestler": "Wrestler",
          "Finalizador": "Submitter"
        },
        "materials": {
          "Leve": "Light",
          "Blindado": "Armored",
          "Elástico": "Stretch",
          "Respirável": "Breathable"
        }
      },
      "about": {
        "title": "ABOUT US",
        "section_essence": "The Discipline",
        "essence_p1": "At Diário dos Oss.os, we believe that Jiu-Jitsu is not just a sport — it is a discipline that shapes more than just the body; it sharpens the mind. Every time you step on the mat, you show up not just to compete, but to perfect, grow and embrace the challenge.",
        "essence_p2": "We are driven by the pursuit of excellence in craft: fabrics engineered to endure, designs refined by detail, and gear that works seamlessly with you — never against you. It’s in the stitch, the weave, the cut — every line and seam made with purpose.",
        "section_mindset": "The Mindset",
        "mindset_p1": "But technique alone doesn’t define us. It’s the mindset: relentless, grounded, faithful to the art. We respect tradition, honor lineage, yet forge ahead with innovation. We train through the grind, celebrate the small wins, learn from the losses, and carry forward stronger.",
        "mindset_p2": "We exist for those who won’t settle, who see that mastery comes through consistency and integrity. For the jiujiteiros who roll early, push past fatigue, stay sharp when no one’s watching. For you — who demand gear worthy of the fight, who believe every roll is an opportunity.",
        "commitment_title": "OSS.OS COMMITMENT",
        "commitment_text": "OSS.OS is more than apparel. It’s commitment. It’s the gear, the mindset, and the community — united by the love of the art and the never-ending pursuit of better. Join us, roll with us, evolve with us.",
        "cta_button": "JOIN THE MAT",
        "concept_oss": {
          "title": "THE OSS CONCEPT",
          "origin": "From 'Oshi Shinobu' — to persevere under pressure. It is the tactical silence that precedes the perfect move.",
          "bones": "Like the bones (OSS.OS) that support us, technical discipline is our structural foundation. Immutable. Essential.",
          "slogan": "Pressure builds diamonds. Discipline builds the legend."
        }
      },
      "seo": {
        "home_title": "OSS.OS Diary | BJJ Equipment & Culture",
        "home_desc": "Equipment portal and Jiu-Jitsu culture. Technical curation inspired by OSS.OS Diary. Best prices and social impact.",
        "shop_title": "Curated BJJ Shop | OSS.OS Diary",
        "shop_desc": "Explore our technical selection of Gis, Rash Guards, and BJJ gear selected by specialists.",
        "blog_title": "The Mat Report | BJJ News & Mindset",
        "blog_desc": "Stay updated with the latest Jiu-Jitsu news, tournament results, and philosophical insights.",
        "podcast_title": "Oss.os Podcast | Technical Audio Intelligence",
        "podcast_desc": "Listen to deep discussions about BJJ technique, competition, and the warrior lifestyle.",
        "about_title": "Our Essence | About OSS.OS Diary",
        "about_desc": "Learn about the mission, mindset, and commitment behind the OSS.OS project.",
        "wishlist_title": "My Wishlist | OSS.OS Diary",
        "wishlist_desc": "Your curated selection of BJJ equipment ready for the next upgrade.",
        "contact_title": "Contact | OSS.OS Diary",
        "contact_desc": "Get in touch with the OSS.OS team. Ooss!",
        "settings_title": "Settings | OSS.OS Diary",
        "settings_desc": "Configure your BJJ portal experience."
      },
      "shop": {
        "recommendations": {
          "title": "Recommended for You",
          "desc": "Based on your mat history and technical behavior."
        }
      },
      "newsletter": {
        "title": "Join us.",
        "subtitle": "Receive technical news and exclusive offers on your mat.",
        "placeholder": "your@email.com",
        "button": "SUBSCRIBE"
      },
      "legends": {
        "beyond_mats": "Beyond The Mats // The Peak of Olympic Jiu-Jitsu",
        "title": "THE WORLD BJJ OLYMPUS",
        "description": "The absolute elite of competitive Jiu-Jitsu. Meet the Black Belt legends who achieved eternal glory on the mats with the highest number of gold medals at the IBJJF World Championship.",
        "tactical_curation": "OSS.OS TACTICAL CURATION",
        "integrated_hall": "INTEGRATED GALLERY OF HONOR",
        "metric_updated": "UPDATED METRIC: WORLD 2026",
        "elite_legends": "The Legendary Elite",
        "select_to_detail": "Select to view details",
        "top_tier": "TOP TIER // 9x TO 13x CHAMPIONS",
        "heavyweight_legends": "HEAVYWEIGHT LEGENDS // 7x TO 8x CHAMPIONS",
        "immortal_black_belt": "IMMORTAL BLACK BELT",
        "gold_titles": "Gold Titles",
        "champion": "Champion",
        "main_category": "Main Category",
        "technical_signature": "TECHNICAL SIGNATURE",
        "impact_details": "IMPACT DETAILS",
        "warrior_message": "MESSAGE TO THE WARRIOR",
        "technical_details_tab": "TECHNICAL DETAILS",
        "spar_simulator_tab": "SPAR SIMULATOR",
        "gold_titles_all": "WORLD TITLES",
        "style_category": "STYLE / CATEGORY",
        "technical_signature_secret": "TECHNICAL SIGNATURE // SECRET WEAPON",
        "impact_details_label": "CULTURAL IMPACT DETAILS",
        "tactical_diagram": "TACTICAL DIAGRAM (BJJ STATS)",
        "total_fighter_eval": "TOTAL FIGHTER EVAL:",
        "stat_attack": "Attack // Submission",
        "stat_defense": "Defense // Escapes",
        "stat_pressure": "Pressure // Half-Guard",
        "stat_speed": "Speed // Agility",
        "stat_guard": "Guard // Sweeps",
        "competitor_a": "COMPETITOR A",
        "competitor_b": "COMPETITOR B (OPPONENT)",
        "sim_sync": "SPAR_SIM SYNC // REAL-TIME MAT",
        "processing_log": "PROCESSING TACTICAL SEQUENCE",
        "arena_idle_msg": "TACTICAL SIMULATION ARENA IDLE",
        "simulate_clash_btn": "SIMULATE LEGENDARY CLASH",
        "position_label": "POSITION:",
        "phase_started": "STANDING FIGHT // COLLAR TIES",
        "phase_mid": "DEEP HALF-GUARD // TOREANDO ENTRANCES",
        "phase_submission": "NEAR SUBMISSION // BACK ATTACK",
        "phase_ended": "COMBAT ENDED // RESPECT",
        "phase_transition": "TRANSITIONING...",
        "arena_details_live": "WORLD IBJJF LIVE // ARENA STADIUM",
        "fight_reconstitution": "FIGHT RECONSTITUTION:",
        "clear_arena_btn": "[ CLEAR ARENA & PARTNER ]",
        "items": {
          "0": {
            "category": "Ultra Heavy / Absolute",
            "specialty": "Dynamic Half-Guard & Unreal Pressure",
            "quote": "Consistency trains the body, resilience forging the ultimate champion.",
            "highlights": [
              "Greatest holder of male black belt world gold medals in history",
              "Famous for his middleweight agility and speed in a super-heavyweight body",
              "Fighter with the most consecutive wins in absolute championship matches"
            ]
          },
          "1": {
            "category": "Super Heavy / Absolute",
            "specialty": "Mount Choke & Clinical Alignment",
            "quote": "If you master the fundamentals perfectly, you do not need to invent complexities.",
            "highlights": [
              "Considered the greatest pure competitor of all time (GOAT)",
              "Submitted all 10 opponents in the historic 2009 World Championship",
              "Known for never having been submitted at black belt in elite competitions"
            ]
          },
          "2": {
            "category": "Roosterweight",
            "specialty": "Explosive Passing & Hook Sweeps",
            "quote": "The stature of a champion is measured by the technical integrity of their spirit.",
            "highlights": [
              "Absolute male record holder of his division with 10 world titles",
              "Blends atomic speed with matchless weight distribution",
              "Dominated the roosterweight category uninterruptedly and unbeatably for 12 years"
            ]
          },
          "3": {
            "category": "Super Heavy / Female Absolute",
            "specialty": "Offensive Lasso Guard & Absolute Pressure",
            "quote": "Medals are forged in the silent perseverance of Cidade de Deus mats.",
            "highlights": [
              "Current phenomenon of female Jiu-Jitsu, holder of multiple consecutive Grand Slams",
              "Dominates absolute and weight classes with flawless tactical consistency",
              "Unbeatable legend who established unprecedented physical and technical dominance"
            ]
          },
          "4": {
            "category": "Lightweight / Female Absolute",
            "specialty": "Flying Armbar & Back Attacks",
            "quote": "Determination on the mat transforms insurmountable barriers into solid ground.",
            "highlights": [
              "9 official and widely recognized world titles in the black belt elite",
              "One of the most complete and finishing guards in world championships",
              "Unquestionable highlight and crowned as a living legend of world jiu-jitsu"
            ]
          },
          "5": {
            "category": "Featherweight / Female Absolute",
            "specialty": "De la Riva Guard & Savage Toe Hold",
            "quote": "Flexibility without technical aggressiveness is just contortionism.",
            "highlights": [
              "Revolutionized modern spider guard with constant triangle and armbar attacks",
              "History of aggressive displays always seeking to submit her rivals",
              "Had elite transitions to no-gi tournaments and the professional MMA circuit"
            ]
          },
          "6": {
            "category": "Female Light Featherweight",
            "specialty": "Omoplata Attacks & Lapel Control",
            "quote": "Teaching the art and giving blood for the students is living Jiu-Jitsu entirely.",
            "highlights": [
              "Leader of one of the greatest female teams in martial arts history",
              "Multiple world champion in two different decades, keeping physical dominance",
              "Mentored by renowned masters and founder of the female Gracie Humaitá alliance"
            ]
          },
          "7": {
            "category": "Light to Medium-Heavy / Absolute",
            "specialty": "Dynamic Torando Passing & Active X-Guard",
            "quote": "The mat is my sanctuary, and my greatest virtue is fighting with love and joy.",
            "highlights": [
              "Won world championships in 5 different weight categories at black belt",
              "The most vibrant heart of the sport, famous for miraculous comebacks in finals",
              "His explosive standing passing style revolutionized the sport in the 2010s"
            ]
          },
          "8": {
            "category": "Medium-Heavy / Female Absolute",
            "specialty": "Judo Throws & Knee-Cut Pressure",
            "quote": "Glory lies in honoring the traditional gi with pure and clean technique.",
            "highlights": [
              "Formidable combination of standing technique (throws) and compact ground game",
              "Seven-time IBJJF world champion with flawless technical performances",
              "Strong advocate and promoter of classic jiu-jitsu for self-defense and competition"
            ]
          },
          "9": {
            "category": "Heavyweight / Absolute",
            "specialty": "Impenetrable Closed Guard & Real Levers",
            "quote": "If your base is well set and your posture is correct, no one passes your guard.",
            "highlights": [
              "Famous for having the least passed guard in the history of modern sport",
              "Won epic absolute finals against much heavier opponents",
              "Co-founder of the celebrated Ribeiro Jiu-Jitsu, authoring exquisite technical manuals"
            ]
          }
        }
      },
      "transparency_page": {
        "title_tab": "OSS.OS | Transparency and Social Impact",
        "description_tab": "Transparency report: understand how your purchases help strengthen the Jiu-Jitsu community.",
        "breadcrumb_title": "Transparency",
        "back_navigation": "OSS.OS DIARY",
        "commitment_badge": "Social Commitment",
        "main_title_part1": "Transparency",
        "main_title_part2": "Report",
        "intro_quote": "\"We were born with the mission to circulate resources. 10% of all our fundraising returns to those who keep the flame alive at the grass roots.\"",
        "what_we_sold_title": "What We Sold This Year",
        "gi": "Gis",
        "belts": "Belts",
        "rashguards": "Rash Guards",
        "accessories": "Accessories",
        "lifestyle": "LifeStyle",
        "gear": "Gear",
        "destination_title": "The 10% Destination",
        "destination_subtitle": "Strengthening Social Jiu-Jitsu Projects in Communities.",
        "destination_desc": "We are not just a shopping portal. We are an incentive engine. The 10% of our marginal profit is destined entirely to buy Gis and cover registration fees for low-income athletes linked to partner social projects.",
        "next_steps_title": "Next Steps",
        "step1_title": "Expand Partner Network",
        "step1_desc": "We are registering 5 new social projects in the second half of 2026.",
        "step2_title": "Charity Event",
        "step2_desc": "Holding the first 'Open OSS' with 100% of registrations reversed in basic donation baskets.",
        "metrics_title": "Impact Metrics",
        "funds_raised_label": "Funds Raised",
        "gis_donated_label": "Gis Donated",
        "direct_impact_label": "Direct Impact",
        "gis_units": "UNITS",
        "youth_served": "120+ Youth Served",
        "consolidated_data": "* Data consolidated until May 2026. Next update in December 2026.",
        "suggest_project": "Suggest a Project",
        "history_title": "Be part of this story",
        "history_desc": "Every cent invested in your gear with us contributes directly to democratizing access to our sport and lifestyle.",
        "go_to_shop_btn": "Go to Shop",
        "back_to_portal_btn": "Back to Public Portal"
      }
    }
  },
  pt: {
    translation: {
      "quick_access": "Acesso Rápido",
      "categories": {
        "All": "Tudo",
        "Vestuário": "Vestuário",
        "Equipamentos de Proteção": "Equipamentos de Proteção",
        "Suplementos": "Suplementos",
        "Acessórios": "Acessórios",
        "Kimonos": "Kimonos",
        "Rash Guards": "Rash Guards",
        "Rashguards": "Licras (Rashguards)",
        "Nogi": "Nogi",
        "Shorts": "Bermudas (Shorts)",
        "Proteções": "Proteções",
        "Supplements": "Suplementos (Supplements)",
        "Accessories": "Acessórios (Accessories)",
        "Faixas": "Faixas",
        "Casual": "Casual",
        "Mochilas": "Mochilas",
        "Lifestyle": "Lifestyle",
        "Recovery": "Recuperação",
        "Equipamentos": "Equipamentos",
        "Academias": "Academias",
        "Filosofia": "Filosofia",
        "beginners": "Iniciantes",
        "competition": "Competição",
        "training_accessories": "Acessórios de Treino",
        "nutrition": "Nutrição Esportiva",
        "instructionals": "Livros & Técnicas",
        "mat_armor": "Armaduras para o Tatame"
      },
      "nav": {
        "home": "Início",
        "shop": "Loja",
        "blog": "Notícias",
        "settings": "Portal do Atleta",
        "podcast": "Podcast",
        "contact": "Contato",
        "about": "Quem Somos",
        "wishlist": "Favoritos",
        "profile": "Meu Painel",
        "categories": "Categorias",
        "transparency": "Transparência 10%",
        "comparator": "Comparador de Preços",
        "comparator_short": "Comparador"
      },
      "common": {
        "loading": "Carregando...",
        "error": "Erro",
        "success": "Sucesso",
        "cancel": "Cancelar",
        "remove": "Remover",
        "back": "Voltar",
        "next": "Próximo",
        "close": "Fechar",
        "admin": "ADMIN [Mestre]",
        "login": "ENTRAR",
        "logout": "Sair",
        "online": "ONLINE",
        "offline": "OFFLINE",
        "theme_visual": "Tema Visual",
        "light": "Claro",
        "dark": "Escuro",
        "auto": "Automático",
        "select_language": "Selecionar Idioma"
      },
      "header": {
        "search_placeholder": "Pesquisar portal...",
        "recent_searches": "Buscas Recentes",
        "clear": "Limpar",
        "popular_suggestions": "Termos Populares & Sugestões"
      },
      "hero": {
        "scene1_tag": "CENA 01 // A ARMADURA SUPREMA",
        "scene1_headline": "A CIÊNCIA DA PRESSÃO.",
        "scene1_highlight": "A ARTE DA SUPERAÇÃO.",
        "scene1_subtitle": "Kimonos trançados de 450g/m² a 550g/m² com costuras triplas reforçadas e gola antibacteriana vulcanizada em EVA para resistir a qualquer pegada.",
        "scene1_cta": "Explorar Kimonos de Elite",
        "scene2_tag": "CENA 02 // SEGUNDA PELE TÉRMICA",
        "scene2_headline": "ZERO ATRITO NO TATAME.",
        "scene2_highlight": "MÁXIMA VELOCIDADE NO-GI.",
        "scene2_subtitle": "Compressão anatômica 4-Way Stretch de alta densidade que regula a temperatura muscular e blinda sua pele contra queimaduras de lona e bactérias.",
        "scene2_cta": "Ver Rashguards",
        "scene3_tag": "CENA 03 // O CÓDIGO DA GRADUAÇÃO",
        "scene3_headline": "CADA FIBRA CONTA UMA HISTÓRIA.",
        "scene3_highlight": "SUA FAIXA, SEU LEGADO.",
        "scene3_subtitle": "Faixas 100% algodão premium com ponteira preta para graus e costura reforçada de 8 a 12 pespontos para máxima durabilidade.",
        "scene3_cta": "Conhecer Faixas",
        "featured_badge": "DESTAQUE DA CENA"
      },
      "deal": {
        "super_offer": "SUPER OFERTA DO DIA",
        "savings": "Economia de",
        "historical_low": "Menor Preço"
      },
      "catalog": {
        "results_header": "Resultados do Acervo",
        "items_count": "{{count}} produto",
        "items_count_plural": "{{count}} produtos",
        "pagination": "Página {{page}} de {{total}}",
        "filtering": "Filtrando catálogo...",
        "no_products_found": "Nenhum equipamento encontrado",
        "no_products_desc": "Não encontramos produtos que correspondam a todos os filtros selecionados. Tente ajustar a faixa de preço, marcas ou categoria."
      },
      "notification": {
        "price_alert_title": "Alertas de Queda de Preço",
        "price_alert_desc": "Receba avisos instantâneos quando seus produtos favoritados entrarem em promoção.",
        "enable_btn": "Ativar Alertas"
      },
      "footer": {
        "navigation": "Navegação",
        "social": "Social",
        "status_active": "PORTAL OFICIAL • ESTILO DE VIDA DO TATAME",
        "rights": "© 2026 DIÁRIO DOS OSS.OS [INTELIGÊNCIA TÉCNICA APLICADA]",
        "tagline": "\"O Jiu-Jitsu não é apenas lutar. É sobre a essência, o caminho suave e o respeito aos ossos que nos sustentam. Diário dos Oss.os é a curadoria definitiva para o estilo de vida do tatame.\""
      },
      "search_placeholder": "Buscar equipamentos, técnicas, posts...",
      "voice": {
        "listening": "Ouvindo... Fale o que deseja buscar.",
        "listening_short": "OUVINDO",
        "speak_now": "Fale agora...",
        "speak_hint": "Fale com clareza: produto, técnica, marca ou categoria...",
        "searching_for": "Buscando por: \"{{query}}\"",
        "not_supported": "Seu navegador não suporta busca por voz.",
        "error": "Erro na busca por voz. Tente novamente.",
        "start": "Pesquisar por voz (Microfone)",
        "stop": "Parar gravação de voz",
        "amplitude": "Amplitude da Voz",
        "search_action": "Buscar Agora",
        "stop_action": "Parar Microfone",
        "cancel": "Cancelar"
      },
      "reset_confirm": "Isso irá apagar todas as notícias geradas e resetar o cache para garantir que apenas imagens de Jiu-Jitsu apareçam. Continuar?",
      "theme": {
        "light": "Mudar para modo claro",
        "dark": "Mudar para modo escuro"
      },
      "navigation_status": "Status da Navegação",
      "empty_wishlist": "Sua lista está vazia",
      "start_exploring": "Começar a Explorar",
      "no_results": "Zerar Tatame (Nenhum Resultado)",
      "consent": {
        "title": "Termos e Responsabilidade",
        "text1": "O OSS.OS é um portal de equipamentos. Não vendemos produtos diretamente. A responsabilidade pela entrega, qualidade e garantia é das lojas parceiras (Amazon, Shopee, etc).",
        "text2": "Ao continuar, você concorda com nossos termos de uso e entende que a seleção é feita por praticantes reais de Jiu-Jitsu.",
        "button": "Ciente e Concordo"
      },
      "blog": {
        "related": "Notícias Relacionadas",
        "recommended_gear": "Gear Recomendado",
        "view_all": "Mais novidades em breve...",
        "exit": "Sair do Report",
        "close": "Fechar Notícia",
        "copy_link": "Copiar Link",
        "copied": "Copiado!",
        "see_also": "Veja também no portal",
        "our_shop": "Nossa Loja Curada",
        "episodes": "Episódios de Podcast",
        "explore": "Explore o Tatame Digital",
        "written_by": "Escrito por"
      },
      "wishlist_confirm": {
        "title": "Remover da Wishlist",
        "text": "Tem certeza que deseja remover este item?"
      },
      "filter": {
        "title": "Filtros Avançados",
        "active_filters": "Filtros Ativos",
        "clear_all": "Zerar Filtros",
        "price_range": "Faixa de Preço",
        "brands": "Marcas",
        "sizes": "Tamanhos",
        "gender": "Gênero",
        "belt_color": "Graduação / Faixa",
        "rating": "Nota Mínima",
        "platforms": "Plataformas",
        "product_type": "Tipo de Produto",
        "view_results": "Visualizar {{count}} Itens"
      },
      "product": {
        "best_price": "Melhor Preço",
        "best_seller": "Mais Pedido",
        "view_details": "Ver Detalhes",
        "buy_now": "Comprar Agora",
        "reviews": "Feedback",
        "price_history": "Histórico de Preços",
        "comparative": "Comparativo de Preços"
      },
      "checkout": {
        "title": "Checkout do Tatame",
        "terms": "Eu li e aceito os Termos e Condições.",
        "finish": "Finalizar e Ir para Loja"
      },
      "landing": {
        "hero_title_part1": "DIÁRIO DOS",
        "hero_title_part2": "OSS.OS",
        "filtered_by": "FILTRADO PELO TATAME • EST. 2024",
        "portal_subtitle": "PORTAL DE EQUIPAMENTOS E CULTURA JIU-JITSU",
        "portal_description": "Curadoria técnica inspirada no Diário dos Oss.os. Melhores preços e impacto social.",
        "enter_shop": "ENTRAR NO SHOP",
        "selected_offers": "OFERTAS SELECIONADAS",
        "hero_captions": {
          "0": "A disciplina é o único caminho. Não há atalhos no tatame da vida.",
          "1": "Trabalhe em silêncio. Deixe que o seu sucesso faça barulho. O lobo não liga para a opinião das ovelhas.",
          "2": "Jiu-Jitsu não é sobre peso, mas sobre o quanto sua mente resiste.",
          "3": "Oss. 'Oshi Shinobu'. Perseverar sob pressão. A disciplina técnica é nossa estrutura."
        },
        "collection": "COLEÇÃO 2026",
        "search_btn": "BUSCAR",
        "compare_prices": "COMPARAR PREÇOS",
        "our_manifesto": "NOSSO MANIFESTO",
        "technique_never_lies": "A TÉCNICA NUNCA MENTE.",
        "promise_quote": "\"O mercado está saturado de promessas. Nós entregamos o que sobrevive ao primeiro rola.\"",
        "read_full_manifesto": "LER MANIFESTO COMPLETO",
        "hide_details": "OCULTAR DETALHES",
        "manifesto_text": "Nascemos da frustração de comprar equipamentos que não aguentam a rotina do tatame. O OSS.OS não é apenas uma loja, é um filtro. Cada kimono, cada faixa e cada suplemento passa pela nossa curadoria técnica antes de chegar ao seu radar.",
        "validated_mat": "VALIDADO NO TATAME",
        "essence_focus": "FOCO NA ESSÊNCIA",
        "foundations_path": "OS FUNDAMENTOS DO CAMINHO",
        "fighter_structure": "ESTRUTURA DE UM GUERREIRO",
        "honor": "HONRA",
        "honor_desc": "Sua palavra vale mais que qualquer contrato.",
        "discipline": "DISCIPLINA",
        "discipline_desc": "O tatame não perdoa a falta de consistência.",
        "silence": "SILÊNCIO",
        "silence_desc": "Trabalhe duro, mas deixe o resultado falar.",
        "legacy": "LEGADO",
        "legacy_desc": "Toda técnica deixada é um presente para o futuro.",
        "the_filter": "O Filtro OSS.OS",
        "ultimate_curation": "A CURADORIA DEFINITIVA",
        "phase_01": "Fase 01",
        "phase_02": "Fase 02",
        "phase_03": "Fase 03",
        "tech_validation": "VALIDAÇÃO TÉCNICA",
        "best_price_card": "MELHOR PREÇO",
        "secure_purchase": "COMPRA SEGURA",
        "validation_desc": "Selecionamos apenas o que sobrevive ao teste do tatame.",
        "best_price_desc": "Monitoramos Amazon e Mercado Livre para entregar o link mais barato.",
        "secure_purchase_desc": "Links diretos para lojas oficiais com garantia de entrega."
      },
      "ai_refinement": {
        "title": "Refinamento Inteligente",
        "input_label": "Busca Técnica (Linguagem Natural)",
        "input_placeholder": "Ex: Kimono leve para competidor...",
        "style_label": "Estilo de Luta",
        "material_label": "Preferência de Material",
        "rigor_label": "Rigor da IA",
        "footer": "* Algoritmo OSS.OS calibrado para o tatame 2026.",
        "styles": {
          "Guardeiro": "Guardeiro",
          "Passador": "Passador",
          "Wrestler": "Wrestler",
          "Finalizador": "Finalizador"
        },
        "materials": {
          "Leve": "Leve",
          "Blindado": "Blindado",
          "Elástico": "Elástico",
          "Respirável": "Respirável"
        }
      },
      "about": {
        "title": "QUEM SOMOS",
        "section_essence": "A Disciplina",
        "essence_p1": "Para nós, o Jiu-Jitsu transcende o esporte. É um regime que forja o caráter, muito além da estética física; é a lapidação da nossa força de vontade. Cada entrada no tatame é uma declaração: estamos aqui para a perfeição técnica, para a expansão pessoal e para dominar cada obstáculo.",
        "essence_p2": "Nossa obsessão é a excelência tátil. Selecionamos materiais que suportam a guerra, estéticas elevadas pelo detalhamento minucioso e ferramentas que potencializam seu movimento. Da costura reforçada à geometria do corte, nada é por acaso; tudo tem uma função táctica.",
        "section_mindset": "O Mindset",
        "mindset_p1": "Mas a técnica sozinha não nos define. É a mentalidade: implacável, fundamentada, fiel à arte. Respeitamos a tradição, honramos a linhagem, mas avançamos com inovação. Treinamos no limite, celebramos as pequenas vitórias, aprendemos com as derrotas e seguimos em frente mais fortes.",
        "mindset_p2": "Nossa missão é servir aos que não aceitam o medíocre. Aqueles que buscam a maestria no silêncio e na repetição exaustiva. Para o jiujiteiro que desperta antes do sol e estende seus limites além da dor. Você, que exige um arsenal à altura do seu combate.",
        "commitment_title": "PACTO OSS.OS",
        "commitment_text": "OSS.OS é compromisso. É a fusão entre armadura, pensamento e clã. Somos uma legião movida pela paixão técnica e pela evolução perpétua. O tatame te espera. Ocupe seu espaço. Junte-se a nós, role conosco, evolua conosco.",
        "cta_button": "ENTRAR PARA O TATAME",
        "concept_oss": {
          "title": "O CONCEITO OSS",
          "origin": "De 'Oshi Shinobu' — perseverar sob pressão. É o silêncio táctico que precede a finalização perfeita.",
          "bones": "Como os ossos (OSS.OS) que nos sustentam, a disciplina técnica é nossa estrutura imutável. Essencial. Inabalável.",
          "slogan": "A pressão forma diamantes. A disciplina forma a lenda."
        }
      },
      "seo": {
        "home_title": "Diário dos Oss.os | Equipamentos e Cultura Jiu-Jitsu",
        "home_desc": "Portal de equipamentos e cultura Jiu-Jitsu. Curadoria técnica inspirada no Diário dos Oss.os. Melhores preços e impacto social.",
        "shop_title": "Loja Curada BJJ | Diário dos Oss.os",
        "shop_desc": "Explore nossa seleção técnica de Kimonos, Rash Guards e equipamentos de BJJ selecionados por especialistas.",
        "blog_title": "Report do Tatame | Notícias e Mindset BJJ",
        "blog_desc": "Fique atualizado com as últimas notícias de Jiu-Jitsu, resultados de campeonatos e insights filosóficos.",
        "podcast_title": "Oss.os Podcast | Inteligência Técnica em Áudio",
        "podcast_desc": "Ouça discussões profundas sobre técnica de BJJ, competição e o estilo de vida guerreiro.",
        "about_title": "Nossa Esencia | Sobre o Diário dos Oss.os",
        "about_desc": "Conheça a missão, a mentalidade e o compromisso por trás do projeto OSS.OS.",
        "wishlist_title": "Minha Lista | Diário dos Oss.os",
        "wishlist_desc": "Sua seleção curada de equipamentos de BJJ pronta para o próximo upgrade.",
        "contact_title": "Contato | Diário dos Oss.os",
        "contact_desc": "Entre em contato com o time OSS.OS. Ooss!",
        "settings_title": "Ajustes | Diário dos Oss.os",
        "settings_desc": "Configure sua experiência no portal BJJ."
      },
      "shop": {
        "recommendations": {
          "title": "Recomendados para Você",
          "desc": "Com base no seu histórico de tatame e comportamento técnico."
        }
      },
      "newsletter": {
        "title": "Junte-se a nós.",
        "subtitle": "Receba notícias técnicas e ofertas exclusivas no seu tatame.",
        "placeholder": "seu@email.com",
        "button": "INSCREVER"
      },
      "legends": {
        "beyond_mats": "Beyond The Mats // O Ápice do Jiu-Jitsu Olímpico",
        "title": "O OLÍMPO DO MUNDIAL DE BJJ",
        "description": "A elite absoluta do Jiu-Jitsu esportivo. Conheça as lendas da Faixa Preta que conquistaram a glória eterna nos tatames com o maior número de medalhas de ouro no Campeonato Mundial da IBJJF.",
        "tactical_curation": "CURA TÁTICA OSS.OS",
        "integrated_hall": "GALERIA DE HONRA INTEGRADA",
        "metric_updated": "MÉTRICA ATUALIZADA: MUNDIAL 2026",
        "elite_legends": "Os Lendários da Elite",
        "select_to_detail": "Selecione para detalhar",
        "top_tier": "MÁXIMO ESCALÃO // 9x A 13x CAMPEÕES",
        "heavyweight_legends": "LENDAS DE PESO // 7x A 8x CAMPEÕES",
        "immortal_black_belt": "FAIXA PRETA IMORTAL",
        "gold_titles": "Títulos de Ouro",
        "champion": "Campeão",
        "main_category": "Categoria Principal",
        "technical_signature": "ASSINATURA TÉCNICA",
        "impact_details": "DETALHES DO IMPACTO",
        "warrior_message": "MENSAGEM AO GUERREIRO",
        "technical_details_tab": "FICHA TÉCNICA",
        "spar_simulator_tab": "SIMULADOR SPAR_SIM",
        "gold_titles_all": "TÍTULOS MUNDIAIS",
        "style_category": "ESTILO / CATEGORIA",
        "technical_signature_secret": "ASSINATURA TÉCNICA // ARMA SECRETA",
        "impact_details_label": "DETALHES DO IMPACTO NO ESPORTE",
        "tactical_diagram": "DIAGRAMA TÁTICO DO ATLETA (BJJ STATS)",
        "total_fighter_eval": "EVAL TOTAL DO LUTADOR:",
        "stat_attack": "Ataque // Finalização",
        "stat_defense": "Defesa // Escapes",
        "stat_pressure": "Pressão // Meia-Guarda",
        "stat_speed": "Velocidade // Agilidade",
        "stat_guard": "Guarda // Raspagens",
        "competitor_a": "COMPETIDOR A",
        "competitor_b": "COMPETIDOR B (OPONENTE)",
        "sim_sync": "SINCRONIZAÇÃO SPAR_SIM // TATAME TEMPO REAL",
        "processing_log": "PROCESSANDO SEQUÊNCIA TÁTICA",
        "arena_idle_msg": "ARENA DE SIMULAÇÃO TÁTICA EM ESPERA",
        "simulate_clash_btn": "SIMULAR CONFRONTO LENDÁRIO",
        "position_label": "POSIÇÃO:",
        "phase_started": "LUTA EM PÉ // COLLAR TIES",
        "phase_mid": "MEIA-GUARDA PROFUNDA // TOREANO ENTRANCES",
        "phase_submission": "QUASE FINALIZADO // ATAQUE DE COSTAS",
        "phase_ended": "FIM DO COMBATE // CUMPRIMENTOS",
        "phase_transition": "TRANSICIONANDO...",
        "arena_details_live": "MUNDIAL IBJJF LIVE // ESTÁDIO DO COMBATE",
        "fight_reconstitution": "RECONSTITUIÇÃO DA LUTA:",
        "clear_arena_btn": "[ LIMPAR ARENA & PARCEIRO ]",
        "items": {
          "0": {
            "category": "Pesadíssimo / Absoluto",
            "specialty": "Meia-Guarda Dinâmica & Pressão Surreais",
            "quote": "A consistência treina o corpo, a resiliência forja o campeão definitivo.",
            "highlights": [
              "Maior detentor de medalhas de ouro pretas mundiais masculinas da história",
              "Famoso por sua agilidade e velocidade de peso médio em corpo de super-pesado",
              "Lutador com mais vitórias consecutivas em lutas de campeonato do absoluto"
            ]
          },
          "1": {
            "category": "Super Pesado / Absoluto",
            "specialty": "Estrangulamento da Montada & Alinhamento Clínico",
            "quote": "Se você dominar os fundamentos perfeitamente, não precisa inventar complexidades.",
            "highlights": [
              "Considerado o maior competidor puro de todos os tempos (Goat)",
              "Finalizou todos os 10 oponentes no histórico campeonato mundial de 2009",
              "Conhecido por nunca ter sido finalizado na faixa preta em competidores da elite"
            ]
          },
          "2": {
            "category": "Peso Galo (Roosterweight)",
            "specialty": "Passagens Explosivas & Raspagem de Gancho",
            "quote": "A estatura de um campeão se mede pela integridade técnica de seu espírito.",
            "highlights": [
              "Detentor do recorde masculino absoluto de sua divisão com 10 títulos mundiais",
              "Mistura velocidade atômica com distribuição de peso insuperável",
              "Dominou a categoria peso galo de forma ininterrompida e imbatível por 12 anos"
            ]
          },
          "3": {
            "category": "Super Pesado / Absoluto FEM",
            "specialty": "Guarda-Laçada Ofensiva & Pressão Absoluta",
            "quote": "As medalhas são forjadas na perseverança silenciosa dos tatames da Cidade de Deus.",
            "highlights": [
              "Fenômeno atual do Jiu-Jitsu feminino, detentora de múltiplos Grand Slams seguidos",
              "Domina o absoluto e categorias de peso com consistência tática irretocável",
              "Lenda imbatível que estabeleceu um padrão inédito de dominância física e técnica"
            ]
          },
          "4": {
            "category": "Peso Leve / Absoluto FEM",
            "specialty": "Chave de Braço Voadora & Ataques de Costas",
            "quote": "A determinação no tatame transforma barreiras intransponíveis em solo firme.",
            "highlights": [
              "9 títulos mundiais oficiais e amplamente reconhecidos na elite da faixa preta",
              "Umas das guardas mais completas e finalizadoras em campeonatos mundiais",
              "Destaque inquestionável e coroada como lenda viva do jiu-jitsu mundial"
            ]
          },
          "5": {
            "category": "Peso Pena / Absoluto FEM",
            "specialty": "Guarda de Calcanhar & Chave de Pé Brutal",
            "quote": "Flexibilidade sem agressividade técnica é apenas contorcionismo.",
            "highlights": [
              "Revolucionou a guarda-aranha moderna com ataques constantes de triângulo e chave de braço",
              "Histórico de exibições agressivas sempre buscando submeter suas rivais",
              "Teve transições de elite para campeonatos sem pano e circuito profissional de MMA"
            ]
          },
          "6": {
            "category": "Peso Pluma (Light Feather) FEM",
            "specialty": "Ataques de Omoplata & Controle de lapela",
            "quote": "Ensinar a arte e dar o sangue pelas alunas é viver o Jiu-Jitsu por inteiro.",
            "highlights": [
              "Líder de uma das maiores equipes femininas da história das artes marciais",
              "Multicampeã mundial em duas décadas diferentes, mantendo soberania física",
              "Mentorada por mestres consagrados e fundadora da aliança Gracie Humaitá feminina"
            ]
          },
          "7": {
            "category": "Leve ao Meio-Pesado / Absoluto",
            "specialty": "Passagem Toreando Dinâmica & Guarda X Ativa",
            "quote": "O tatame é meu santuário, e minha maior virtude é lutar com amor e alegria.",
            "highlights": [
              "Venceu campeonatos mundiais em 5 categorias de peso distintas na faixa preta",
              "O coração mais vibrante do esporte, famoso por reviravoltas miraculosas em finais",
              "Seu estilo explosivo de passar em pé revolucionou o esporte nos anos 2010"
            ]
          },
          "8": {
            "category": "Medio-Pesado / Absoluto FEM",
            "specialty": "Quedas de Judô & Pressão de Cruzada de Joelho",
            "quote": "A glória reside em honrar o kimono tradicional com técnica pura e limpa.",
            "highlights": [
              "Combinação formidável de técnica em pé (quedas) e jogo de solo compacto",
              "Sete vezes campeã mundial da IBJJF com apresentações técnicas irretocáveis",
              "Forte defensora e difusora do jiu-jitsu clássico de defesa pessoal e competição"
            ]
          },
          "9": {
            "category": "Peso Pesado / Absoluto",
            "specialty": "Guarda Fechada Intransponível & Alavancas Reais",
            "quote": "Se sua base está bem assentada e sua postura correta, ninguém passa sua guarda.",
            "highlights": [
              "Famoso por ter tido a guarda menos passada da história do esporte moderno",
              "Venceu finais de absoluto épicas contra os adversários mais pesados",
              "Co-fundador da célebre Ribeiro Jiu-Jitsu, sendo autor de manuais técnicos primorosos"
            ]
          }
        }
      },
      "transparency_page": {
        "title_tab": "OSS.OS | Transparência e Impacto Social",
        "description_tab": "Relatório de transparência: entenda como suas compras ajudam a fortalecer a comunidade do Jiu-Jitsu.",
        "breadcrumb_title": "Transparência",
        "back_navigation": "DIÁRIO DOS OSS.OS",
        "commitment_badge": "Compromisso Social",
        "main_title_part1": "Relatório de",
        "main_title_part2": "Transparência",
        "intro_quote": "\"Nascemos com a missão de circular recursos. 10% de toda nossa arrecadação retorna para quem mantém a chama acesa na base.\"",
        "what_we_sold_title": "O que vendemos este ano",
        "gi": "Kimonos",
        "belts": "Faixas",
        "rashguards": "Rash Guards",
        "accessories": "Acessórios",
        "lifestyle": "LifeStyle",
        "gear": "Equipamentos",
        "destination_title": "A Destinação dos 10%",
        "destination_subtitle": "Fortalecimento de Projetos Sociais de Jiu-Jitsu em Comunidades.",
        "destination_desc": "Não somos apenas um portal de compras. Somos um motor de incentivo. Os 10% da nossa margem são destinados integralmente para a compra de kimonos e custeio de inscrições para atletas de baixa renda vinculados a projetos sociais parceiros.",
        "next_steps_title": "Próximos Passos",
        "step1_title": "Expandir Rede de Parceiros",
        "step1_desc": "Estamos cadastrando 5 novos projetos sociais no segundo semestre de 2026.",
        "step2_title": "Evento Beneficente",
        "step2_desc": "Realização do primeiro 'Open OSS' com inscrições 100% revertidas em cestas básicas.",
        "metrics_title": "Métricas de Impacto",
        "funds_raised_label": "Fundos Arrecadados",
        "gis_donated_label": "Kimonos Doados",
        "direct_impact_label": "Impacto Direto",
        "gis_units": "UNIDADES",
        "youth_served": "120+ Jovens Atendidos",
        "consolidated_data": "* Dados consolidados até Maio de 2026. Próxima atualização em Dezembro/2026.",
        "suggest_project": "Sugerir um Projeto",
        "history_title": "Faça parte desta história",
        "history_desc": "Cada centavo investido em seu equipamento conosco contribui diretamente para democratizar o acesso ao nosso esporte e estilo de vida.",
        "go_to_shop_btn": "Ir para a Loja",
        "back_to_portal_btn": "Voltar ao Portal Público"
      }
    }
  },
  es: {
    translation: {
      "quick_access": "Acceso Rápido",
      "categories": {
        "All": "Todo",
        "Vestuário": "Indumentaria",
        "Equipamentos": "Equipos",
        "Equipamentos de Proteção": "Equipo de Protección",
        "Suplementos": "Suplementos",
        "Acessórios": "Accesorios",
        "Proteções": "Protecciones",
        "Kimonos": "Kimonos",
        "Rash Guards": "Rash Guards",
        "Rashguards": "Licras (Rashguards)",
        "Nogi": "Nogi",
        "Shorts": "Bermudas (Shorts)",
        "Protections": "Protecciones",
        "Supplements": "Suplementos",
        "Accessories": "Accesorios",
        "Faixas": "Cinturones",
        "Casual": "Casual",
        "Mochilas": "Mochilas",
        "Lifestyle": "Estilo de Vida",
        "Recovery": "Recuperación",
        "Academias": "Academias",
        "Filosofia": "Filosofía",
        "beginners": "Principiantes",
        "competition": "Competición",
        "training_accessories": "Accesorios de Entrenamiento",
        "nutrition": "Nutrición Deportiva",
        "instructionals": "Libros & Técnicas",
        "mat_armor": "Armaduras para el Tatami"
      },
      "nav": {
        "home": "Inicio",
        "shop": "Tienda",
        "blog": "Noticias",
        "settings": "Portal del Atleta",
        "podcast": "Podcast",
        "contact": "Contacto",
        "about": "Quiénes Somos",
        "wishlist": "Favoritos",
        "profile": "Mi Panel",
        "categories": "Categorías",
        "transparency": "Transparencia 10%",
        "comparator": "Comparador de Precios",
        "comparator_short": "Comparador"
      },
      "common": {
        "loading": "Cargando...",
        "error": "Error",
        "success": "Éxito",
        "cancel": "Cancelar",
        "remove": "Eliminar",
        "back": "Volver",
        "next": "Siguiente",
        "close": "Cerrar",
        "admin": "ADMIN [Maestro]",
        "login": "INGRESAR",
        "logout": "Cerrar sesión",
        "online": "EN LÍNEA",
        "offline": "DESCONECTADO",
        "theme_visual": "Tema Visual",
        "light": "Claro",
        "dark": "Oscuro",
        "auto": "Automático",
        "select_language": "Seleccionar Idioma"
      },
      "header": {
        "search_placeholder": "Buscar en el portal...",
        "recent_searches": "Búsquedas Recientes",
        "clear": "Limpiar",
        "popular_suggestions": "Términos Populares & Sugerencias"
      },
      "hero": {
        "scene1_tag": "ESCENA 01 // LA ARMADURA SUPREMA",
        "scene1_headline": "LA CIENCIA DE LA PRESIÓN.",
        "scene1_highlight": "EL ARTE DE SUPERARSE.",
        "scene1_subtitle": "Kimonos trenzados de 450g/m² a 550g/m² con costuras triples reforzadas y cuello vulcanizado en EVA para resistir cualquier agarre.",
        "scene1_cta": "Explorar Kimonos de Élite",
        "scene2_tag": "ESCENA 02 // SEGUNDA PIEL TÉRMICA",
        "scene2_headline": "CERO FRICCIÓN EN EL TATAMI.",
        "scene2_highlight": "MÁXIMA VELOCIDAD NO-GI.",
        "scene2_subtitle": "Compresión anatómica 4-Way Stretch de alta densidad que regula la temperatura muscular y protege tu piel contra quemaduras de lona.",
        "scene2_cta": "Ver Rashguards",
        "scene3_tag": "ESCENA 03 // EL CÓDIGO DE GRADUACIÓN",
        "scene3_headline": "CADA FIBRA CUENTA UNA HISTORIA.",
        "scene3_highlight": "TU CINTURÓN, TU LEGADO.",
        "scene3_subtitle": "Cinturones 100% algodón premium con costura reforzada de 8 a 12 pespuntes para máxima durabilidad.",
        "scene3_cta": "Conocer Cinturones",
        "featured_badge": "DESTACADO DE LA ESCENA"
      },
      "deal": {
        "super_offer": "SÚPER OFERTA DEL DÍA",
        "savings": "Ahorro de",
        "historical_low": "Menor Precio"
      },
      "catalog": {
        "results_header": "Resultados del Catálogo",
        "items_count": "{{count}} producto",
        "items_count_plural": "{{count}} productos",
        "pagination": "Página {{page}} de {{total}}",
        "filtering": "Filtrando catálogo...",
        "no_products_found": "Ningún equipo encontrado",
        "no_products_desc": "No encontramos productos que coincidan con todos los filtros seleccionados. Intenta ajustar el rango de precios o categoría."
      },
      "notification": {
        "price_alert_title": "Alertas de Bajada de Precio",
        "price_alert_desc": "Recibe avisos instantáneos cuando tus productos favoritos bajen de precio.",
        "enable_btn": "Activar Alertas"
      },
      "footer": {
        "navigation": "Navegación",
        "social": "Social",
        "status_active": "PORTAL OFICIAL • ESTILO DE VIDA DEL TATAME",
        "rights": "© 2026 DIARIO DE LOS OSS.OS [INTELIGENCIA TÉCNICA APLICADA]",
        "tagline": "\"El Jiu-Jitsu no es sólo luchar. Se trata de la esencia, el camino suave y el respeto a los huesos que nos sostienen. Diario de los Oss.os es la curaduría definitiva para el estilo de vida del tatame.\""
      },
      "search_placeholder": "Buscar equipos, técnicas, posts...",
      "voice": {
        "listening": "Escuchando... Di lo que quieres buscar.",
        "listening_short": "ESCUCHANDO",
        "speak_now": "Hable ahora...",
        "speak_hint": "Hable con claridad: producto, técnica, marca o categoría...",
        "searching_for": "Buscando: \"{{query}}\"",
        "not_supported": "Tu navegador no admite la búsqueda por voz.",
        "error": "Error en la búsqueda por voz. Inténtalo de nuevo.",
        "start": "Búsqueda por voz (Micrófono)",
        "stop": "Detener grabación de voz",
        "amplitude": "Amplitud de Voz",
        "search_action": "Buscar Ahora",
        "stop_action": "Detener Micrófono",
        "cancel": "Cancelar"
      },
      "reset_confirm": "¿Esto borrará todas las noticias generadas y restablecerá el caché para garantizar que solo aparezcan imágenes de Jiu-Jitsu. ¿Continuar?",
      "theme": {
        "light": "Cambiar a modo claro",
        "dark": "Cambiar a modo oscuro"
      },
      "navigation_status": "Estado de la Navegación",
      "empty_wishlist": "Tu lista está vacía",
      "start_exploring": "Empezar a Explorar",
      "no_results": "Tatame a Cero (Sin Resultados)",
      "consent": {
        "title": "Términos y Responsabilidad",
        "text1": "OSS.OS es un portal de equipos. No vendemos productos directamente. La responsabilidad por la entrega, calidad y garantía pertenece a las tiendas asociadas (Amazon, Shopee, etc.).",
        "text2": "Al continuar, aceptas nuestros términos de uso y entiendes que la selección es realizada por practicantes reales de Jiu-Jitsu.",
        "button": "Consciente y De Acuerdo"
      },
      "blog": {
        "related": "Noticias Relacionadas",
        "recommended_gear": "Equipo Recomendado",
        "view_all": "Más novedades pronto...",
        "exit": "Salir del Reporte",
        "close": "Cerrar Noticia",
        "copy_link": "Copiar Enlace",
        "copied": "¡Copiado!",
        "see_also": "Ver también en el portal",
        "our_shop": "Nuestra Tienda Curada",
        "episodes": "Episodios de Podcast",
        "explore": "Explora el Tatame Digital",
        "written_by": "Escrito por"
      },
      "wishlist_confirm": {
        "title": "Eliminar de la Lista de Deseos",
        "text": "¿Estás seguro de que quieres eliminar este artículo?"
      },
      "filter": {
        "title": "Filtros Avanzados",
        "active_filters": "Filtros Activos",
        "clear_all": "Limpiar Filtros",
        "price_range": "Rango de Precio",
        "brands": "Marcas",
        "sizes": "Tallas",
        "gender": "Género",
        "belt_color": "Graduación / Cinturón",
        "rating": "Calificación Mín.",
        "platforms": "Plataformas",
        "product_type": "Tipo de Producto",
        "view_results": "Ver {{count}} Artículos"
      },
      "product": {
        "best_price": "Mejor Precio",
        "best_seller": "Más Vendido",
        "view_details": "Ver Detalles",
        "buy_now": "Comprar Ahora",
        "reviews": "Feedback",
        "price_history": "Historial de Precios",
        "comparative": "Comparativo de Precios"
      },
      "checkout": {
        "title": "Pago del Tatame",
        "terms": "He leído y acepto los Términos y Condiciones.",
        "finish": "Finalizar e Ir a la Tienda"
      },
      "landing": {
        "hero_title_part1": "DIARIO DE LOS",
        "hero_title_part2": "OSS.OS",
        "filtered_by": "FILTRADO POR EL TATAME • EST. 2024",
        "portal_subtitle": "PORTAL DE EQUIPOS Y CULTURA JIU-JITSU",
        "portal_description": "Curaduría técnica inspirada en el Diário dos Oss.os. Mejores precios e impacto social.",
        "enter_shop": "ENTRAR EN LA TIENDA",
        "selected_offers": "OFERTAS SELECIONADAS",
        "hero_captions": {
          "0": "La disciplina es el único camino. No hay atajos en el tatame de la vida.",
          "1": "El silencio del guerreiro es su mayor arma. Deja que tu técnica hable.",
          "2": "El Jiu-Jitsu no se trata de peso, sino de cuánto resiste tu mente.",
          "3": "Ooss. El respeto es el fundamento. La técnica es la liberación."
        },
        "collection": "COLECCIÓN 2026",
        "search_btn": "BUSCAR",
        "compare_prices": "COMPARAR PRECIOS",
        "our_manifesto": "NUESTRO MANIFIESTO",
        "technique_never_lies": "LA TÉCNICA NUNCA MIENTE.",
        "promise_quote": "\"El mercado está lleno de promesas. Entregamos lo que sobrevive al primer rola.\"",
        "read_full_manifesto": "LEER MANIFIESTO COMPLETO",
        "hide_details": "OCULTAR DETALHES",
        "manifesto_text": "Nacimos de la frustración de comprar equipos que no aguentan la rutina del tatame. OSS.OS no es solo una tienda, es un filtro. Cada kimono, cada cinturón y cada suplemento pasa por nuestra curaduría técnica antes de llegar a tu radar.",
        "validated_mat": "VALIDADO EN EL TATAME",
        "essence_focus": "ENFOQUE EN LA ESENCIA",
        "foundations_path": "LOS FUNDAMENTOS DEL CAMINO",
        "fighter_structure": "ESTRUCTURA DE UM GUERRERO",
        "honor": "HONOR",
        "honor_desc": "Tu palabra vale más que cualquier contrato.",
        "discipline": "DISCIPLINA",
        "discipline_desc": "El tatame no perdona la falta de consistencia.",
        "silence": "SILENCIO",
        "silence_desc": "Trabaja duro, pero deja que el resultado hable.",
        "legacy": "LEGADO",
        "legacy_desc": "Cada técnica transmitida es un regalo para el futuro.",
        "the_filter": "El Filtro OSS.OS",
        "ultimate_curation": "LA CURADURÍA DEFINITIVA",
        "phase_01": "Fase 01",
        "phase_02": "Fase 02",
        "phase_03": "Fase 03",
        "tech_validation": "VALIDACIÓN TÉCNICA",
        "best_price_card": "MEJOR PRECIO",
        "secure_purchase": "COMPRA SEGURA",
        "validation_desc": "Seleccionamos solo lo que sobrevive a la prueba del tatame.",
        "best_price_desc": "Monitoreamos Amazon y Mercado Libre para ofrecer el enlace más barato.",
        "secure_purchase_desc": "Enlaces directos a tiendas oficiales con garantía de entrega."
      },
      "ai_refinement": {
        "title": "Refinamiento Inteligente",
        "input_label": "Búsqueda Técnica (Lenguaje Natural)",
        "input_placeholder": "Ej: Kimono ligero para competidor...",
        "style_label": "Estilo de Lucha",
        "material_label": "Preferencia de Material",
        "rigor_label": "Rigor de la IA",
        "footer": "* Algoritmo OSS.OS calibrado para el tatame 2026.",
        "styles": {
          "Guardeiro": "Guardián",
          "Passador": "Pasador",
          "Wrestler": "Wrestler",
          "Finalizador": "Finalizador"
        },
        "materials": {
          "Leve": "Ligero",
          "Blindado": "Blindado",
          "Elástico": "Elástico",
          "Respirável": "Respirable"
        }
      },
      "about": {
        "title": "SOBRE NOSOTROS",
        "section_essence": "La Disciplina",
        "essence_p1": "En Diário dos Oss.os, creemos que el Jiu-Jitsu no es sólo un deporte — es una disciplina que moldea más que sólo el cuerpo; afila la mente. Cada vez que pisas el tatame, te presentas no sólo para competir, sino para perfeccionar, crecer y aceptar el desafío.",
        "essence_p2": "Nos mueve la búsqueda de la excelencia en el oficio: curaduría técnica, análisis precisos y la búsqueda constante de la evolución. Está en la técnica, en el detalle, en la esencia — cada movimiento hecho con propósito.",
        "section_mindset": "La Mentalidad",
        "mindset_p1": "Pero la técnica por sí sola no nos define. Es la mentalidad: implacable, fundamentada, fiel al arte. Respetamos la tradición, honramos el linaje, pero avanzamos con innovación. Entrenamos duro, celebramos pequeñas victorias, aprendemos de las pérdidas y seguimos adelante más fuertes.",
        "mindset_p2": "Existimos para aquellos que no se conforman, que ven que la maestría viene a través de la consistencia y la integridad. Para los jiujiteiros que ruedan temprano, superan la fatiga, se mantienen afilados cuando nadie está mirando. Para ti — que exiges equipos dignos de la lucha, que crees que cada rola es una oportunidad.",
        "commitment_title": "Compromiso OSS.OS",
        "commitment_text": "\"El Diário dos Oss.os es más que ropa o información. Es un compromiso. Es el equipo, la mentalidad y la comunidad — unidos por el amor al arte y la búsqueda interminable de evolución. Únete a nosotros, rueda con nosotros, evoluciona con nosotros.\"",
        "cta_button": "ENTRAR AL TATAME",
        "concept_oss": {
          "title": "EL CONCEPTO OSS",
          "origin": "De 'Oshi Shinobu' — perseverar bajo presión. Es el silencio táctico que precede a la sumisión perfecta.",
          "bones": "Como los huesos (OSS.OS) que nos sostienen, la disciplina técnica es nuestra estructura inmutable. Esencial. Inquebrantable.",
          "slogan": "La presión forma diamantes. La disciplina forma la leyenda."
        }
      },
      "seo": {
        "home_title": "Diario de los Oss.os | Equipos y Cultura Jiu-Jitsu",
        "home_desc": "Portal de equipos y cultura Jiu-Jitsu. Curaduría técnica inspirada en el Diario de los Oss.os. Mejores precios e impacto social.",
        "shop_title": "Tienda Curada BJJ | Diario de los Oss.os",
        "shop_desc": "Explora nuestra selección técnica de Kimonos, Rash Guards y equipos de BJJ seleccionados por especialistas.",
        "blog_title": "Reporte del Tatame | Noticias y Mentalidad BJJ",
        "blog_desc": "Mantente actualizado con las últimas noticias de Jiu-Jitsu, resultados de campeonatos e ideas filosóficas.",
        "podcast_title": "Oss.os Podcast | Inteligencia Técnica en Audio",
        "podcast_desc": "Escucha discusiones profundas sobre técnica de BJJ, competición y el estilo de vida del guerrero.",
        "about_title": "Nuestra Esencia | Sobre el Diario de los Oss.os",
        "about_desc": "Conoce la misión, la mentalidad y el compromiso detrás del proyecto OSS.OS.",
        "wishlist_title": "Mi Lista | Diario de los Oss.os",
        "wishlist_desc": "Tu selección curada de equipos de BJJ lista para la próxima actualización.",
        "contact_title": "Contacto | Diario de los Oss.os",
        "contact_desc": "Ponte en contacto con el equipo OSS.OS. ¡Ooss!",
        "settings_title": "Ajustes | Diario de los Oss.os",
        "settings_desc": "Configura tu experiencia en el portal BJJ."
      },
      "shop": {
        "recommendations": {
          "title": "Recomendados para Ti",
          "desc": "Basado en tu historial de tatame y comportamiento técnico."
        }
      },
      "newsletter": {
        "title": "Únete a nosotros.",
        "subtitle": "Recibe noticias técnicas y ofertas exclusivas en tu tatame.",
        "placeholder": "tu@email.com",
        "button": "SUSCRIBIRSE"
      },
      "legends": {
        "beyond_mats": "Beyond The Mats // El Ápice del Jiu-Jitsu Olímpico",
        "title": "EL OLÍMPO DEL MUNDIAL DE BJJ",
        "description": "La élite absoluta del Jiu-Jitsu deportivo. Conoce a las leyendas del Cinturón Negro que conquistaron la gloria eterna en los tatames con el mayor número de medallas de oro en el Campeonato Mundial de la IBJJF.",
        "tactical_curation": "CURADURÍA TÁCTICA OSS.OS",
        "integrated_hall": "GALERÍA DE HONOR INTEGRANTE",
        "metric_updated": "MÉTRICA ACTUALIZADA: MUNDIAL 2026",
        "elite_legends": "Los Legendarios de la Élite",
        "select_to_detail": "Selecciona para detallar",
        "top_tier": "MÁXIMO ESCALÓN // 9x A 13x CAMPEONES",
        "heavyweight_legends": "LEYENDAS DE PESO // 7x A 8x CAMPEONES",
        "immortal_black_belt": "CINTURÓN NEGRO INMORTAL",
        "gold_titles": "Títulos de Oro",
        "champion": "Campeón",
        "main_category": "Categoría Principal",
        "technical_signature": "FIRMA TÉCNICA",
        "impact_details": "DETALLES DEL IMPACTO",
        "warrior_message": "MENSAJE AL GUERRERO",
        "technical_details_tab": "FICHA TÉCNICA",
        "spar_simulator_tab": "SIMULADOR SPAR_SIM",
        "gold_titles_all": "TÍTULOS MUNDIALES",
        "style_category": "ESTILO / CATEGORÍA",
        "technical_signature_secret": "FIRMA TÉCNICA // ARMA SECRETA",
        "impact_details_label": "DETALLES DEL IMPACTO EN EL DEPORTE",
        "tactical_diagram": "DIAGRAMA TÁTICO DEL ATLETA (BJJ STATS)",
        "total_fighter_eval": "EVALUACIÓN TOTAL DEL LUCHADOR:",
        "stat_attack": "Ataque // Sumisión",
        "stat_defense": "Defensa // Escapes",
        "stat_pressure": "Presión // Media-Guardia",
        "stat_speed": "Velocidad // Agilidad",
        "stat_guard": "Guardia // Raspados",
        "competitor_a": "COMPETIDOR A",
        "competitor_b": "COMPETIDOR B (OPONENTE)",
        "sim_sync": "SINCRONIZACIÓN SPAR_SIM // TATAME EN TIEMPO REAL",
        "processing_log": "PROCESANDO SECUENCIA TÁCTICA",
        "arena_idle_msg": "ARENA DE SIMULACIÓN TÁCTICA EN ESPERA",
        "simulate_clash_btn": "SIMULAR CONFRONTACIÓN LEGENDARIA",
        "position_label": "POSICIÓN:",
        "phase_started": "LUCHA DE PIE // COLLAR TIES",
        "phase_mid": "MEDIA-GUARDIA PROFUNDA // TOREANO ENTRANCES",
        "phase_submission": "CASI FINALIZADO // ATAQUE DE ESPALDA",
        "phase_ended": "FIN DEL COMBATE // SALUDOS",
        "phase_transition": "TRANSICIONANDO...",
        "arena_details_live": "MUNDIAL IBJJF EN VIVO // ESTADIO DE COMBATE",
        "fight_reconstitution": "RECONSTITUCIÓN DE LA LUCHA:",
        "clear_arena_btn": "[ LIMPIAR ARENA & COMPAÑERO ]",
        "items": {
          "0": {
            "category": "Pesadísimo / Absoluto",
            "specialty": "Media-Guardia Dinámica & Presión Surreal",
            "quote": "La consistencia entrena el cuerpo, la resiliencia forja al campeón definitivo.",
            "highlights": [
              "Mayor poseedor de medallas de oro mundiales masculinas de cinturón negro en la historia",
              "Famoso por su agilidad y velocidad de peso mediano en un cuerpo superpesado",
              "Luchador con más victorias consecutivas en combates de campeonatos absolutos"
            ]
          },
          "1": {
            "category": "Superpesado / Absoluto",
            "specialty": "Estrangulador de Montada & Alineación Clínica",
            "quote": "Si dominas los fundamentos a la perfección, no necesitas inventar complejidades.",
            "highlights": [
              "Considerado el mejor competidor puro de todos los tiempos (GOAT)",
              "Sometió a los 10 oponentes en el histórico Campeonato Mundial de 2009",
              "Conocido por no haber sido sumiso nunca en cinturón negro en competiciones de élite"
            ]
          },
          "2": {
            "category": "Peso Gallo (Roosterweight)",
            "specialty": "Pases Explosivos & Raspado de Gancho",
            "quote": "La estatura de un campeón se mide por la integridad técnica de su espíritu.",
            "highlights": [
              "Poseedor del récord masculino absoluto de su división con 10 títulos mundiales",
              "Combina una velocidad atómica con una distribución de peso inmejorable",
              "Dominó de forma ininterrumpida e imbatible la categoría de peso gallo durante 12 años"
            ]
          },
          "3": {
            "category": "Superpesado / Absoluto FEM",
            "specialty": "Guardia de Lazo Ofensiva & Presión Absoluta",
            "quote": "Las medallas se forjan en la perseverancia silenciosa de los tatames de Cidade de Deus.",
            "highlights": [
              "Fenómeno actual del Jiu-Jitsu femenino, poseedora de múltiples Grand Slams consecutivos",
              "Domina la clase absoluta y de peso con impecable consistencia táctica",
              "Leyenda imbatible que estableció un dominio físico y técnico sin precedentes"
            ]
          },
          "4": {
            "category": "Peso Ligero / Absoluto FEM",
            "specialty": "Palanca de Brazo Voladora & Ataques de Espalda",
            "quote": "La determinación en el tatame transforma barreras insuperables en tierra firme.",
            "highlights": [
              "9 títulos mundiales oficiales y ampliamente reconocidos en la élite de cinturón negro",
              "Una de las guardias más completas y finalizadoras en campeonatos mundiales",
              "Destacamento incuestionable y condecorado como leyenda viva del jiu-jitsu mundial"
            ]
          },
          "5": {
            "category": "Peso Pluma / Absoluto FEM",
            "specialty": "Guardia de Talón & Palanca de Pie Brutal",
            "quote": "La flexibilidad sin agresividad técnica es sólo contorsionismo.",
            "highlights": [
              "Revolucionó la guardia de araña moderna con constantes ataques de triángulo y palanca de brazo",
              "Historial de exhibiciones agresivas buscando siempre someter a sus rivales",
              "Tuvo transiciones de élite a campeonatos sin kimono y circuito profesional de MMA"
            ]
          },
          "6": {
            "category": "Peso Pluma Ligera FEM",
            "specialty": "Ataques de Omoplata & Control de Solapa",
            "quote": "Enseñar el arte y dar la sangre por las alumnas es vivir el Jiu-Jitsu por completo.",
            "highlights": [
              "Líder de uno de los mejores equipos femeninos en la historia de las artes marciales",
              "Múltiple campeona mundial en dos décadas distintas, manteniendo el dominio físico",
              "Mentoreada por reconocidos maestros y fundadora de la alianza femenina Gracie Humaitá"
            ]
          },
          "7": {
            "category": "Ligero a Medio-Pesado / Absoluto",
            "specialty": "Pase de Toreando Dinámico & Guardia X Activa",
            "quote": "El tatame es mi santuario, y mi mayor virtud es luchar con amor y alegría.",
            "highlights": [
              "Ganó campeonatos mundiales en 5 categorías de peso diferentes en cinturón negro",
              "El corazón más carismático del deporte, famoso por remontadas milagrosas en finales",
              "Su explosivo estilo de pase de pie revolucionó el deporte en los años 2010"
            ]
          },
          "8": {
            "category": "Medio-Pesado / Absoluto FEM",
            "specialty": "Derribos de Judo & Presión de Cruzada de Rodilla",
            "quote": "La gloria reside en honrar el kimono tradicional con técnica pura y limpia.",
            "highlights": [
              "Formidable combinación de técnica de pie (derribos) y un juego de suelo compacto",
              "Siete veces campeona mundial de la IBJJF con impecables actuaciones técnicas",
              "Sólida defensora y difusora del jiu-jitsu clásico de defensa personal y competición"
            ]
          },
          "9": {
            "category": "Peso Pesado / Absoluto",
            "specialty": "Guardia Cerrada Impenetrable & Palancas Reales",
            "quote": "Si tu base está bien asentada y tu postura es correcta, nadie pasa tu guardia.",
            "highlights": [
              "Famoso por tener la guardia menos pasada del juego moderno",
              "Ganó finales absolutas épicas contra oponentes mucho más pesados",
              "Cofundador del célebre Ribeiro Jiu-Jitsu, autor de exquisitos manuales técnicos"
            ]
          }
        }
      },
      "transparency_page": {
        "title_tab": "OSS.OS | Transparencia e Impacto Social",
        "description_tab": "Reporte de transparencia: comprende cómo tus compras ayudan a fortalecer la comunidad del Jiu-Jitsu.",
        "breadcrumb_title": "Transparencia",
        "back_navigation": "DIARIO DE LOS OSS.OS",
        "commitment_badge": "Compromiso Social",
        "main_title_part1": "Reporte de",
        "main_title_part2": "Transparencia",
        "intro_quote": "\"Nacimos con la misión de circular recursos. El 10% de toda nuestra recaudación regresa a quienes mantienen la llama encendida en las bases.\"",
        "what_we_sold_title": "Lo que vendemos este ano",
        "gi": "Kimonos",
        "belts": "Cinturones",
        "rashguards": "Licras",
        "accessories": "Accesorios",
        "lifestyle": "LifeStyle",
        "gear": "Equipamiento",
        "destination_title": "El Destino del 10%",
        "destination_subtitle": "Fortalecimiento de Proyectos Sociales de Jiu-Jitsu en Comunidades.",
        "destination_desc": "No somos solo un portal de compras. Somos un motor de incentivo. El 10% de nuestro margen se destina íntegramente a la compra de kimonos y al pago de inscripciones para atletas de bajos ingresos vinculados a proyectos sociales asociados.",
        "next_steps_title": "Próximos Pasos",
        "step1_title": "Expandir Red de Socios",
        "step1_desc": "Estamos registrando 5 nuevos proyectos sociales en la segunda mitad de 2026.",
        "step2_title": "Evento Benéfico",
        "step2_desc": "Realización del primer 'Open OSS' con inscripciones 100% revertidas en canastas de donaciones básicas.",
        "metrics_title": "Métricas de Impacto",
        "funds_raised_label": "Fondos Recaudados",
        "gis_donated_label": "Kimonos Donados",
        "direct_impact_label": "Impacto Directo",
        "gis_units": "UNIDADES",
        "youth_served": "120+ Jóvenes Atendidos",
        "consolidated_data": "* Datos consolidados hasta Mayo de 2026. Próxima actualización en Diciembre/2026.",
        "suggest_project": "Sugerir un Proyecto",
        "history_title": "Sé parte de esta historia",
        "history_desc": "Cada centavo invertido en tu equipo con nosotros contribuye directamente a democratizar el acceso a nuestro deporte y estilo de vida.",
        "go_to_shop_btn": "Ir a la Tienda",
        "back_to_portal_btn": "Volver al Portal Público"
      }
    }
  }
};

const mergeWithFallback = (base: any, override: any): any => {
  const result = { ...base };
  for (const key in override) {
    if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
      result[key] = mergeWithFallback(base[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
};

const zhTranslation = {
  "quick_access": "快速访问",
  "categories": {
    "All": "全部",
    "Vestuário": "服装",
    "Equipamentos de Proteção": "防护装备",
    "Suplementos": "营养补剂",
    "Acessórios": "配件",
    "Kimonos": "柔术道服 (Kimonos)",
    "Rash Guards": "紧身防磨衣 (Rash Guards)",
    "Rashguards": "防磨衣 (Rashguards)",
    "Nogi": "无道服 (No-Gi)",
    "Shorts": "格斗短裤 (Shorts)",
    "Protections": "护具",
    "Supplements": "营养补剂",
    "Accessories": "配件",
    "Faixas": "柔术腰带 (Belts)",
    "Casual": "休闲服饰",
    "Mochilas": "背包",
    "Lifestyle": "生活方式",
    "Recovery": "恢复与理疗",
    "Equipamentos": "训练装备",
    "Academias": "道馆",
    "Filosofia": "柔术哲学"
  },
  "nav": {
    "home": "首页",
    "shop": "精选商城",
    "blog": "道馆新闻",
    "settings": "选手门户",
    "podcast": "播客",
    "contact": "联系我们",
    "about": "关于我们",
    "wishlist": "收藏夹",
    "profile": "我的控制台",
    "categories": "分类",
    "transparency": "10% 社会透明度",
    "comparator": "价格对比",
    "comparator_short": "比价"
  },
  "common": {
    "loading": "加载中...",
    "error": "错误",
    "success": "成功",
    "cancel": "取消",
    "remove": "移除",
    "back": "返回",
    "next": "下一步",
    "close": "关闭",
    "admin": "管理员 [大师]",
    "login": "登录",
    "logout": "退出登录",
    "online": "在线",
    "offline": "离线",
    "theme_visual": "界面主题",
    "light": "浅色",
    "dark": "深色",
    "auto": "跟随系统",
    "select_language": "选择语言"
  },
  "header": {
    "search_placeholder": "搜索装备、技术、文章...",
    "recent_searches": "最近搜索",
    "clear": "清除",
    "popular_suggestions": "热门推荐与搜索建议"
  },
  "hero": {
    "scene1_tag": "场景 01 // 顶级道服护甲",
    "scene1_headline": "施压的科学。",
    "scene1_highlight": "超越的艺术。",
    "scene1_subtitle": "450g/m² 至 550g/m² 珍珠编织道服，三道加强缝线与 EVA 硫化防菌衣领，抵御一切强力抓把。",
    "scene1_cta": "探索精选道服",
    "scene2_tag": "场景 02 // 热感第二层肌肤",
    "scene2_headline": "垫上零阻力。",
    "scene2_highlight": "极致无道服速度。",
    "scene2_subtitle": "高密度四向拉伸解剖学贴身压缩面料，调节肌肉温度并保护皮肤免受摩擦损伤。",
    "scene2_cta": "查看防磨衣",
    "scene3_tag": "场景 03 // 段位密码",
    "scene3_headline": "每一根纤维皆是历程。",
    "scene3_highlight": "你的腰带，你的传承。",
    "scene3_subtitle": "100% 顶级纯棉腰带，附带黑阶段位套，8至12道加固缝线。",
    "scene3_cta": "选购柔术腰带",
    "featured_badge": "焦点精选"
  },
  "deal": {
    "super_offer": "今日特惠",
    "savings": "立省",
    "historical_low": "历史最低价"
  },
  "catalog": {
    "results_header": "商城装备目录",
    "items_count": "{{count}} 件商品",
    "items_count_plural": "{{count}} 件商品",
    "pagination": "第 {{page}} 页，共 {{total}} 页",
    "filtering": "正在筛选商品...",
    "no_products_found": "未找到相关装备",
    "no_products_desc": "没有匹配当前筛选条件的装备。请尝试调整价格、品牌或分类。"
  },
  "footer": {
    "navigation": "导航",
    "social": "社交媒体",
    "status_active": "官方网站 • 柔术生活方式",
    "rights": "© 2026 OSS.OS DIARY [应用技术智能]",
    "tagline": "“柔术不仅是战斗，更是关于生命本质、温柔之道以及支撑我们骨骼的尊重。Oss.os Diary 是垫上生活方式的终极馆藏。”"
  },
  "search_placeholder": "搜索装备、技术、文章...",
  "theme": {
    "light": "切换到日间模式",
    "dark": "切换到暗黑模式"
  },
  "landing": {
    "hero_title_part1": "OSS.OS",
    "hero_title_part2": "日记",
    "filtered_by": "经受垫上实战检验 • 创立于 2024",
    "portal_subtitle": "柔术装备与垫上文化门户网站",
    "portal_description": "源自《Diário dos Oss.os》的专业技术策展。最佳价格与社会回馈。",
    "enter_shop": "进入商城",
    "selected_offers": "精选特惠",
    "compare_prices": "价格对比",
    "our_manifesto": "我们的宣言",
    "technique_never_lies": "技术永不说谎。",
    "read_full_manifesto": "阅读完整宣言",
    "hide_details": "隐藏详情",
    "manifesto_text": "我们因对市面上无法承受日常实战训练的劣质装备感到沮丧而诞生。OSS.OS 不仅仅是一家商店，它是一道过滤器。每一件道服、腰带和补剂在进入您的视野之前，都必须通过我们的技术筛选。",
    "validated_mat": "垫上实战验证",
    "essence_focus": "专注本质",
    "foundations_path": "柔术之路的基石",
    "fighter_structure": "像战士一样装备"
  },
  "product": {
    "best_price": "最优价格",
    "best_seller": "最畅销款",
    "view_details": "查看详情",
    "buy_now": "立即购买",
    "reviews": "反馈",
    "price_history": "价格历史",
    "comparative": "价格对比"
  },
  "checkout": {
    "title": "收银台",
    "terms": "我已阅读并接受条款与条件。",
    "finish": "完成并前往商店"
  },
  "filter": {
    "title": "高级筛选",
    "active_filters": "已启用筛选",
    "clear_all": "清除全部",
    "price_range": "价格范围",
    "brands": "品牌",
    "sizes": "尺码",
    "gender": "性别",
    "belt_color": "段位 / 腰带",
    "rating": "最低评分",
    "platforms": "平台",
    "product_type": "产品类型",
    "view_results": "查看 {{count}} 件商品"
  }
};

const deTranslation = {
  "quick_access": "Schnellzugriff",
  "categories": {
    "All": "Alle",
    "Vestuário": "Bekleidung",
    "Equipamentos de Proteção": "Schutzausrüstung",
    "Suplementos": "Nahrungsergänzung",
    "Acessórios": "Zubehör",
    "Kimonos": "Kimonos (Gis)",
    "Rash Guards": "Rashguards",
    "Rashguards": "Rashguards",
    "Nogi": "No-Gi",
    "Shorts": "Shorts",
    "Protections": "Schützer",
    "Supplements": "Nahrungsergänzung",
    "Accessories": "Zubehör",
    "Faixas": "Gürtel",
    "Casual": "Freizeitkleidung",
    "Mochilas": "Rucksäcke",
    "Lifestyle": "Lifestyle",
    "Recovery": "Erholung",
    "Equipamentos": "Ausrüstung",
    "Academias": "Akademien",
    "Filosofia": "Philosophie"
  },
  "nav": {
    "home": "Startseite",
    "shop": "Shop",
    "blog": "News",
    "settings": "Athleten-Portal",
    "podcast": "Podcast",
    "contact": "Kontakt",
    "about": "Über Uns",
    "wishlist": "Favoriten",
    "profile": "Mein Dashboard",
    "categories": "Kategorien",
    "transparency": "10% Transparenz",
    "comparator": "Preisvergleich",
    "comparator_short": "Vergleich"
  },
  "common": {
    "loading": "Laden...",
    "error": "Fehler",
    "success": "Erfolg",
    "cancel": "Abbrechen",
    "remove": "Entfernen",
    "back": "Zurück",
    "next": "Weiter",
    "close": "Schließen",
    "admin": "Admin [Meister]",
    "login": "ANMELDEN",
    "logout": "Abmelden",
    "online": "ONLINE",
    "offline": "OFFLINE",
    "theme_visual": "Design",
    "light": "Hell",
    "dark": "Dunkel",
    "auto": "Automatisch",
    "select_language": "Sprache wählen"
  },
  "header": {
    "search_placeholder": "Ausrüstung, Techniken, Artikel suchen...",
    "recent_searches": "Letzte Suchanfragen",
    "clear": "Löschen",
    "popular_suggestions": "Beliebte Suchbegriffe"
  },
  "hero": {
    "scene1_tag": "SZENE 01 // DIE ULTIMATIVE RÜSTUNG",
    "scene1_headline": "DIE WISSENSCHAFT DES DRUCKS.",
    "scene1_highlight": "DIE KUNST DES SIEGES.",
    "scene1_subtitle": "450g/m² bis 550g/m² Pearl-Weave Gis mit dreifach verstärkten Nähten und vulkanisiertem EVA-Kragen.",
    "scene1_cta": "Elite-Gis entdecken",
    "scene2_tag": "SZENE 02 // THERMISCHE ZWEITE HAUT",
    "scene2_headline": "NULL REIBUNG AUF DER MATTE.",
    "scene2_highlight": "MAXIMALE NO-GI GESCHWINDIGKEIT.",
    "scene2_subtitle": "Anatomische 4-Way-Stretch-Kompression, die die Muskeltemperatur reguliert und deine Haut schützt.",
    "scene2_cta": "Rashguards ansehen",
    "scene3_tag": "SZENE 03 // DER GRADUIERUNGSKODEX",
    "scene3_headline": "JEDE FASER ERZÄHLT EINE GESCHICHTE.",
    "scene3_highlight": "DEIN GÜRTEL, DEIN VERMÄCHTNIS.",
    "scene3_subtitle": "100% Premium-Baumwollgürtel mit Rangstreifen und 8- bis 12-facher Nahtverstärkung.",
    "scene3_cta": "Gürtel entdecken",
    "featured_badge": "SZENEN-HIGHLIGHT"
  },
  "deal": {
    "super_offer": "ANGEBOT DES TAGES",
    "savings": "Ersparnis",
    "historical_low": "Tiefstpreis"
  },
  "catalog": {
    "results_header": "Katalogergebnisse",
    "items_count": "{{count}} Produkt",
    "items_count_plural": "{{count}} Produkte",
    "pagination": "Seite {{page}} von {{total}}",
    "filtering": "Katalog wird gefiltert...",
    "no_products_found": "Keine Ausrüstung gefunden",
    "no_products_desc": "Keine Produkte entsprechen den gewählten Filtern."
  },
  "footer": {
    "navigation": "Navigation",
    "social": "Social Media",
    "status_active": "OFFIZIELLES PORTAL • BJJ LIFESTYLE",
    "rights": "© 2026 OSS.OS DIARY [APPLIED TECHNICAL INTELLIGENCE]",
    "tagline": "„Jiu-Jitsu ist nicht nur Kampf. Es geht um die Essenz, den sanften Weg und den Respekt vor den Knochen, die uns tragen. Oss.os Diary ist die ultimative Kuratierung für den Matten-Lifestyle.“"
  },
  "search_placeholder": "Ausrüstung, Techniken, Beiträge suchen...",
  "theme": {
    "light": "In den hellen Modus wechseln",
    "dark": "In den dunklen Modus wechseln"
  },
  "landing": {
    "hero_title_part1": "OSS.OS",
    "hero_title_part2": "DIARY",
    "filtered_by": "AUF DER MATTE GEPRÜFT • SEIT 2024",
    "portal_subtitle": "AUSRÜSTUNGSPORTAL UND JIU-JITSU KULTUR",
    "portal_description": "Technische Kuration, inspiriert vom Diário dos Oss.os. Beste Preise und soziale Wirkung.",
    "enter_shop": "ZUM SHOP",
    "selected_offers": "AUSGEWÄHLTE ANGEBOTE",
    "compare_prices": "PREISE VERGLEICHEN",
    "our_manifesto": "UNSER MANIFEST",
    "technique_never_lies": "DIE TECHNIQUE LÜGT NIE.",
    "read_full_manifesto": "MANIFEST LESEN",
    "hide_details": "DETAILS AUSBLENDEN",
    "manifesto_text": "Wir wurden aus der Frustration heraus geboren, Ausrüstung zu kaufen, die dem normalen Mattenalltag nicht standhält. OSS.OS ist nicht nur ein Shop, es ist ein Filter. Jeder Gi, Gürtel und jedes Supplement durchläuft unsere technische Kuration, bevor es auf Ihrem Radar erscheint.",
    "validated_mat": "AUF DER MATTE VALIDIERT",
    "essence_focus": "FOKUS AUF DIE ESSENZ",
    "foundations_path": "DIE FUNDAMENTE DES WEGES",
    "fighter_structure": "RÜSTE DICH WIE EIN KRIEGER AUS"
  },
  "product": {
    "best_price": "Bestpreis",
    "best_seller": "Bestseller",
    "view_details": "Details anzeigen",
    "buy_now": "Jetzt kaufen",
    "reviews": "Feedback",
    "price_history": "Preishistorie",
    "comparative": "Preisvergleich"
  },
  "checkout": {
    "title": "Kasse",
    "terms": "Ich habe die Allgemeinen Geschäftsbedingungen gelesen und akzeptiere sie.",
    "finish": "Beenden und zum Shop gehen"
  },
  "filter": {
    "title": "Erweiterte Filter",
    "active_filters": "Aktive Filter",
    "clear_all": "Alle löschen",
    "price_range": "Preisspanne",
    "brands": "Marken",
    "sizes": "Größen",
    "gender": "Geschlecht",
    "belt_color": "Graduierung / Gürtel",
    "rating": "Mindestbewertung",
    "platforms": "Plattformen",
    "product_type": "Produkttyp",
    "view_results": "{{count}} Ergebnisse anzeigen"
  }
};

const jaTranslation = {
  "quick_access": "クイックアクセス",
  "categories": {
    "All": "すべて",
    "Vestuário": "アパレル",
    "Equipamentos de Proteção": "プロテクター",
    "Suplementos": "サプリメント",
    "Acessórios": "アクセサリー",
    "Kimonos": "柔術着 (Gi)",
    "Rash Guards": "ラッシュガード",
    "Rashguards": "ラッシュガード",
    "Nogi": "ノーギ",
    "Shorts": "ショーツ",
    "Protections": "サポーター",
    "Supplements": "サプリメント",
    "Accessories": "アクセサリー",
    "Faixas": "帯 (Belts)",
    "Casual": "カジュアル",
    "Mochilas": "バックパック",
    "Lifestyle": "ライフスタイル",
    "Recovery": "リカバリー",
    "Equipamentos": "装備",
    "Academias": "道場",
    "Filosofia": "柔術哲学"
  },
  "nav": {
    "home": "ホーム",
    "shop": "ショップ",
    "blog": "ブログ",
    "settings": "選手ポータル",
    "podcast": "ポッドキャスト",
    "contact": "お問い合わせ",
    "about": "私たちの理念",
    "wishlist": "お気に入り",
    "profile": "ダッシュボード",
    "categories": "カテゴリー",
    "transparency": "10% 社会的透明性",
    "comparator": "価格比較",
    "comparator_short": "比較"
  },
  "common": {
    "loading": "読み込み中...",
    "error": "エラー",
    "success": "成功",
    "cancel": "キャンセル",
    "remove": "削除",
    "back": "戻る",
    "next": "次へ",
    "close": "閉じる",
    "admin": "管理者 [師範]",
    "login": "ログイン",
    "logout": "ログアウト",
    "online": "オンライン",
    "offline": "オフライン",
    "theme_visual": "テーマ",
    "light": "ライト",
    "dark": "ダーク",
    "auto": "自動",
    "select_language": "言語を選択"
  },
  "header": {
    "search_placeholder": "道着、技術、記事を検索...",
    "recent_searches": "最近の検索",
    "clear": "クリア",
    "popular_suggestions": "人気キーワード"
  },
  "hero": {
    "scene1_tag": "シーン 01 // 至高の鎧",
    "scene1_headline": "プレッシャーの科学。",
    "scene1_highlight": "限界を超える技術。",
    "scene1_subtitle": "450g/m²〜550g/m² パールウィーブ織り。三重強化ステッチと抗菌EVA襟で強固なグリップに対応。",
    "scene1_cta": "最高峰の道着を見る",
    "scene2_tag": "シーン 02 // 第二の皮膚",
    "scene2_headline": "畳の上の摩擦ゼロ。",
    "scene2_highlight": "ノーギの超高速展開。",
    "scene2_subtitle": "高密度4方向ストレッチ圧縮素材が筋肉の温度を調節し、肌を摩擦傷から保護。",
    "scene2_cta": "ラッシュガードを見る",
    "scene3_tag": "シーン 03 // 帯の誇り",
    "scene3_headline": "一筋の繊維が語る歴史。",
    "scene3_highlight": "あなたの帯、あなたの誇り。",
    "scene3_subtitle": "100%最高級コットン帯。8〜12本ステッチの高耐久仕様。",
    "scene3_cta": "柔術帯を見る",
    "featured_badge": "注目ハイライト"
  },
  "deal": {
    "super_offer": "本日の特選セール",
    "savings": "割引額",
    "historical_low": "最安値"
  },
  "catalog": {
    "results_header": "カタログ商品一覧",
    "items_count": "{{count}} 件",
    "items_count_plural": "{{count}} 件",
    "pagination": "{{page}} / {{total}} ページ",
    "filtering": "カタログを絞り込み中...",
    "no_products_found": "商品が見つかりません",
    "no_products_desc": "条件に一致する商品がありません。フィルターを調整してください。"
  },
  "footer": {
    "navigation": "ナビゲーション",
    "social": "ソーシャル",
    "status_active": "公式ポータル • 柔術ライフスタイル",
    "rights": "© 2026 OSS.OS DIARY [応用技術インテリジェンス]",
    "tagline": "「柔術は単なる闘いではない。それは生命の性質、柔の道、そして私たちを支える骨への敬意である。Oss.os Diaryは、マットのライフスタイルのための究極のキュレーションです。」"
  },
  "search_placeholder": "ギア、テクニック、記事を検索...",
  "theme": {
    "light": "ライトモードへ切り替え",
    "dark": "ダークモードへ切り替え"
  },
  "landing": {
    "hero_title_part1": "OSS.OS",
    "hero_title_part2": "DIARY",
    "filtered_by": "マット上で検証済み • EST. 2024",
    "portal_subtitle": "柔術ギアとマットカルチャーの総合ポータル",
    "portal_description": "『Diário dos Oss.os』にインスパイアされた技術的キュレーション。最良の価格と社会的影響。",
    "enter_shop": "ショップに入る",
    "selected_offers": "厳選オファー",
    "compare_prices": "価格を比較する",
    "our_manifesto": "私たちのマニフェスト",
    "technique_never_lies": "技術は決して嘘をつかない。",
    "read_full_manifesto": "マニフェストを読む",
    "hide_details": "詳細を非表示",
    "manifesto_text": "私たちは、通常のマットでの激しい練習に耐えられないギアを買うフラストレーションから生まれました。OSS.OSは単なるショップではなく、フィルターです。すべての道着、帯、サプリメントは、あなたのレーダーに届く前に厳しい審査を通過します。",
    "validated_mat": "マット上での実戦検証",
    "essence_focus": "本質への集中",
    "foundations_path": "道の基礎",
    "fighter_structure": "戦士の如く装備せよ"
  },
  "product": {
    "best_price": "最安値",
    "best_seller": "ベストセラー",
    "view_details": "詳細を見る",
    "buy_now": "今すぐ購入",
    "reviews": "評価",
    "price_history": "価格履歴",
    "comparative": "価格比較"
  },
  "checkout": {
    "title": "お支払い",
    "terms": "利用規約を読み、同意します。",
    "finish": "完了してストアに移動"
  },
  "filter": {
    "title": "詳細フィルター",
    "active_filters": "適用中のフィルター",
    "clear_all": "すべてクリア",
    "price_range": "価格帯",
    "brands": "ブランド",
    "sizes": "サイズ",
    "gender": "性別",
    "belt_color": "帯の段位 / 卒業",
    "rating": "最低評価",
    "platforms": "プラットフォーム",
    "product_type": "商品タイプ",
    "view_results": "{{count}}件の結果を表示"
  }
};

const frTranslation = {
  "quick_access": "Accès Rapide",
  "categories": {
    "All": "Tout",
    "Vestuário": "Vêtements",
    "Equipamentos de Proteção": "Protections",
    "Suplementos": "Suppléments",
    "Acessórios": "Accessoires",
    "Kimonos": "Kimonos (Gis)",
    "Rash Guards": "Rashguards",
    "Rashguards": "Rashguards",
    "Nogi": "No-Gi",
    "Shorts": "Shorts",
    "Protections": "Protections",
    "Supplements": "Suppléments",
    "Accessories": "Accessoires",
    "Faixas": "Ceintures",
    "Casual": "Casual",
    "Mochilas": "Sacs à dos",
    "Lifestyle": "Lifestyle",
    "Recovery": "Récupération",
    "Equipamentos": "Équipements",
    "Academias": "Académies",
    "Filosofia": "Philosophie"
  },
  "nav": {
    "home": "Accueil",
    "shop": "Boutique",
    "blog": "Actualités",
    "settings": "Portail Athlète",
    "podcast": "Podcast",
    "contact": "Contact",
    "about": "À Propos",
    "wishlist": "Favoris",
    "profile": "Mon Tableau",
    "categories": "Catégories",
    "transparency": "Transparence 10%",
    "comparator": "Comparateur",
    "comparator_short": "Comparateur"
  },
  "common": {
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succès",
    "cancel": "Annuler",
    "remove": "Supprimer",
    "back": "Retour",
    "next": "Suivant",
    "close": "Fermer",
    "admin": "Admin [Maître]",
    "login": "CONNEXION",
    "logout": "Déconnexion",
    "online": "EN LIGNE",
    "offline": "HORS LIGNE",
    "theme_visual": "Thème Visuel",
    "light": "Clair",
    "dark": "Sombre",
    "auto": "Automatique",
    "select_language": "Choisir la Langue"
  },
  "header": {
    "search_placeholder": "Rechercher kimonos, techniques, articles...",
    "recent_searches": "Recherches Récentes",
    "clear": "Effacer",
    "popular_suggestions": "Termes Populaires"
  },
  "hero": {
    "scene1_tag": "SCÈNE 01 // L'ARMURE SUPRÊME",
    "scene1_headline": "LA SCIENCE DE LA PRESSION.",
    "scene1_highlight": "L'ART DU DÉPASSEMENT.",
    "scene1_subtitle": "Kimonos Pearl Weave de 450g/m² à 550g/m² avec coutures triples renforcées et col EVA vulcanisé antibactérien.",
    "scene1_cta": "Découvrir les Kimonos d'Élite",
    "scene2_tag": "SCÈNE 02 // SECONDE PEAU THERMIQUE",
    "scene2_headline": "ZÉRO FRICTION SUR LE TATAMI.",
    "scene2_highlight": "VITESSE NO-GI MAXIMALE.",
    "scene2_subtitle": "Compression anatomique 4-Way Stretch haute densité régulant la température musculaire et protégeant la peau.",
    "scene2_cta": "Voir les Rashguards",
    "scene3_tag": "SCÈNE 03 // LE CODE DES GRADES",
    "scene3_headline": "CHAQUE FIBRE RACONTE UNE HISTOIRE.",
    "scene3_highlight": "VOTRE CEINTURE, VOTRE HÉRITAGE.",
    "scene3_subtitle": "Ceintures 100% coton premium avec bande de grade et 8 à 12 rangées de coutures renforcées.",
    "scene3_cta": "Explorer les Ceintures",
    "featured_badge": "CULTURE TATAMI"
  },
  "deal": {
    "super_offer": "OFFRE DU JOUR",
    "savings": "Économie",
    "historical_low": "Prix le Plus Bas"
  },
  "catalog": {
    "results_header": "Résultats du Catalogue",
    "items_count": "{{count}} produit",
    "items_count_plural": "{{count}} produits",
    "pagination": "Page {{page}} sur {{total}}",
    "filtering": "Filtrage du catalogue...",
    "no_products_found": "Aucun équipement trouvé",
    "no_products_desc": "Aucun produit ne correspond aux filtres sélectionnés."
  },
  "footer": {
    "navigation": "Navigation",
    "social": "Réseaux Sociaux",
    "status_active": "PORTAIL OFFICIEL • STYLE DE VIE DU TATAMI",
    "rights": "© 2026 OSS.OS DIARY [INTELLIGENCE TECHNIQUE APPLIQUÉE]",
    "tagline": "« Le Jiu-Jitsu n'est pas qu'un combat. C'est l'essence, la voie douce et le respect des os qui nous soutiennent. Oss.os Diary est la curation ultime du style de vie sur le tatami. »"
  },
  "search_placeholder": "Rechercher équipement, techniques, articles...",
  "theme": {
    "light": "Mode clair",
    "dark": "Mode sombre"
  },
  "landing": {
    "hero_title_part1": "OSS.OS",
    "hero_title_part2": "DIARY",
    "filtered_by": "VALIDÉ SUR LE TATAMI • DEPUIS 2024",
    "portal_subtitle": "PORTAIL D'ÉQUIPEMENT ET CULTURE DU JIU-JITSU",
    "portal_description": "Curation technique inspirée par le Diário dos Oss.os. Meilleurs prix et impact social.",
    "enter_shop": "ENTRER DANS LA BOUTIQUE",
    "selected_offers": "OFFRES SÉLECTIONNÉES",
    "compare_prices": "COMPARER LES PRIX",
    "our_manifesto": "NOTRE MANIFESTE",
    "technique_never_lies": "LA TECHNIQUE NE MENT JAMAIS.",
    "read_full_manifesto": "LIRE LE MANIFESTE",
    "hide_details": "MASQUER LES DÉTAILS",
    "manifesto_text": "Nous sommes nés de la frustration d'acheter du matériel qui ne tient pas le choc lors de la routine quotidienne sur le tatami. OSS.OS n'est pas seulement un magasin, c'est un filtre. Chaque kimono, ceinture et supplément passe par notre curation technique avant d'arriver sur votre radar.",
    "validated_mat": "VALIDÉ SUR LE TATAMI",
    "essence_focus": "FOCUS SUR L'ESSENCE",
    "foundations_path": "LES FONDATIONS DE LA VOIE",
    "fighter_structure": "ÉQUIPE-TOI COMME UN GUERRIER"
  },
  "product": {
    "best_price": "Meilleur prix",
    "best_seller": "Meilleure vente",
    "view_details": "Voir détails",
    "buy_now": "Acheter maintenant",
    "reviews": "Avis",
    "price_history": "Historique de prix",
    "comparative": "Comparatif"
  },
  "checkout": {
    "title": "Paiement",
    "terms": "J'ai lu et j'accepte les Conditions Générales.",
    "finish": "Terminer et aller au magasin"
  },
  "filter": {
    "title": "Filtres avancés",
    "active_filters": "Filtres actifs",
    "clear_all": "Effacer tout",
    "price_range": "Gamme de prix",
    "brands": "Marques",
    "sizes": "Tailles",
    "gender": "Genre",
    "belt_color": "Graduation / Ceinture",
    "rating": "Note minimale",
    "platforms": "Plateformes",
    "product_type": "Type de produit",
    "view_results": "Afficher {{count}} résultats"
  }
};

const itTranslation = {
  "quick_access": "Accesso Rapido",
  "categories": {
    "All": "Tutto",
    "Vestuário": "Abbigliamento",
    "Equipamentos de Proteção": "Protezioni",
    "Suplementos": "Integratori",
    "Acessórios": "Accessori",
    "Kimonos": "Kimonos (Gis)",
    "Rash Guards": "Rashguards",
    "Rashguards": "Rashguards",
    "Nogi": "No-Gi",
    "Shorts": "Bermudas (Shorts)",
    "Protections": "Protezioni",
    "Supplements": "Integratori",
    "Accessories": "Accessori",
    "Faixas": "Cinture",
    "Casual": "Casual",
    "Mochilas": "Zaini",
    "Lifestyle": "Stile di Vita",
    "Recovery": "Recupero",
    "Equipamentos": "Attrezzatura",
    "Academias": "Accademie",
    "Filosofia": "Filosofia"
  },
  "nav": {
    "home": "Home",
    "shop": "Negozio",
    "blog": "Notizie",
    "settings": "Portale Atleta",
    "podcast": "Podcast",
    "contact": "Contatti",
    "about": "Chi Siamo",
    "wishlist": "Preferiti",
    "profile": "Mio Pannello",
    "categories": "Categorie",
    "transparency": "Trasparenza 10%",
    "comparator": "Comparatore Prezzi",
    "comparator_short": "Comparatore"
  },
  "common": {
    "loading": "Caricamento...",
    "error": "Errore",
    "success": "Successo",
    "cancel": "Annulla",
    "remove": "Rimuovi",
    "back": "Indietro",
    "next": "Avanti",
    "close": "Chiudi",
    "admin": "Admin [Maestro]",
    "login": "ACCEDI",
    "logout": "Esci",
    "online": "ONLINE",
    "offline": "OFFLINE",
    "theme_visual": "Tema",
    "light": "Chiaro",
    "dark": "Scuro",
    "auto": "Automatico",
    "select_language": "Seleziona Lingua"
  },
  "header": {
    "search_placeholder": "Cerca kimono, tecniche, articoli...",
    "recent_searches": "Ricerche Recenti",
    "clear": "Cancella",
    "popular_suggestions": "Termini Popolari"
  },
  "hero": {
    "scene1_tag": "SCENA 01 // L'ARMATURA SUPREMA",
    "scene1_headline": "LA SCIENZA DELLA PRESSIONE.",
    "scene1_highlight": "L'ARTE DI SUPERARSI.",
    "scene1_subtitle": "Kimono pearl weave da 450g/m² a 550g/m² con cuciture triple rinforzate e bavero vulcanizzato in EVA.",
    "scene1_cta": "Esplora i Kimono d'Élite",
    "scene2_tag": "SCENA 02 // SECONDA PELLE TERMICA",
    "scene2_headline": "ZERO ATTRITO SUL TATAMI.",
    "scene2_highlight": "MASSIMA VELOCITÀ NO-GI.",
    "scene2_subtitle": "Compressione anatomica 4-Way Stretch ad alta densità che regola la temperatura muscolare e protegge la pelle.",
    "scene2_cta": "Vedi Rashguard",
    "scene3_tag": "SCENA 03 // IL CODICE DEL GRADO",
    "scene3_headline": "OGNI FIBRA RACCONTA UNA STORIA.",
    "scene3_highlight": "LA TUA CINTURA, LA TUA EREDITÀ.",
    "scene3_subtitle": "Cinture in 100% cotone premium con barretta dei gradi e cuciture rinforzate da 8 a 12 linee.",
    "scene3_cta": "Scopri le Cinture",
    "featured_badge": "IN EVIDENZA"
  },
  "deal": {
    "super_offer": "OFFERTA DEL GIORNO",
    "savings": "Risparmio",
    "historical_low": "Prezzo Più Basso"
  },
  "catalog": {
    "results_header": "Risultati del Catalogo",
    "items_count": "{{count}} prodotto",
    "items_count_plural": "{{count}} prodotti",
    "pagination": "Pagina {{page}} di {{total}}",
    "filtering": "Filtraggio catalogo...",
    "no_products_found": "Nessun prodotto trovato",
    "no_products_desc": "Nessun prodotto corrisponde ai filtri selezionati."
  },
  "footer": {
    "navigation": "Navigazione",
    "social": "Social",
    "status_active": "PORTALE UFFICIALE • BJJ LIFESTYLE",
    "rights": "© 2026 OSS.OS DIARY [INTELLIGENZA TECNICA APPLICATA]",
    "tagline": "« Il Jiu-Jitsu non è solo combattere. È l'essenza, la via della cedevolezza e il rispetto per le ossa che ci sostengono. Oss.os Diary è la selezione definitiva per lo stile di vita sul tatami. »"
  },
  "search_placeholder": "Cerca attrezzatura, tecniche, articoli...",
  "theme": {
    "light": "Attiva modalità chiara",
    "dark": "Attiva modalità scura"
  },
  "landing": {
    "hero_title_part1": "OSS.OS",
    "hero_title_part2": "DIARY",
    "filtered_by": "VALIDATO SUL TATAMI • EST. 2024",
    "portal_subtitle": "PORTALE DI ATTREZZATURA E CULTURA DEL JIU-JITSU",
    "portal_description": "Selezione tecnica ispirata al Diário dos Oss.os. Migliori prezzi e impatto sociale.",
    "enter_shop": "ENTRA NEL NEGOZIO",
    "selected_offers": "OFFERTE SELEZIONATE",
    "compare_prices": "CONFRONTA I PREZZI",
    "our_manifesto": "IL NOSTRO MANIFESTO",
    "technique_never_lies": "LA TECNICA NON MENTE MAI.",
    "read_full_manifesto": "LEGGI IL MANIFESTO",
    "hide_details": "NASCONDI DETTAGLI",
    "manifesto_text": "Siamo nati dalla frustrazione di acquistare attrezzatura che non regge l'uso quotidiano sul tatami. OSS.OS não é solo un negozio, è un filtro. Ogni gi, cintura e integratore passa attraverso la nostra selezione tecnica prima di arrivare sotto i tuoi occhi.",
    "validated_mat": "VALIDATO SUL TATAMI",
    "essence_focus": "FOCUS SULL'ESSENZA",
    "foundations_path": "I FONDAMENTI DELLA VIA",
    "fighter_structure": "EQUIPAGGIATI COME UN GUERRIERO"
  },
  "product": {
    "best_price": "Miglior prezzo",
    "best_seller": "Più venduto",
    "view_details": "Vedi dettagli",
    "buy_now": "Compra ora",
    "reviews": "Feedback",
    "price_history": "Cronologia prezzi",
    "comparative": "Comparativa"
  },
  "checkout": {
    "title": "Cassa",
    "terms": "Ho letto e accetto i Termini e le Condizioni.",
    "finish": "Termina e vai al negozio"
  },
  "filter": {
    "title": "Filtri avanzati",
    "active_filters": "Filtri attivi",
    "clear_all": "Svuota filtri",
    "price_range": "Fascia di prezzo",
    "brands": "Marche",
    "sizes": "Taglie",
    "gender": "Genere",
    "belt_color": "Graduazione / Cintura",
    "rating": "Voto minimo",
    "platforms": "Piattaforme",
    "product_type": "Tipo di prodotto",
    "view_results": "Visualizza {{count}} risultati"
  }
};

const ruTranslation = {
  "quick_access": "Быстрый Доступ",
  "categories": {
    "All": "Все",
    "Vestuário": "Одежда",
    "Equipamentos de Proteção": "Защитное Снаряжение",
    "Suplementos": "Добавки",
    "Acessórios": "Аксессуары",
    "Kimonos": "Кимоно (Ги)",
    "Rash Guards": "Рашгарды",
    "Rashguards": "Рашгарды",
    "Nogi": "Но-Ги (NoGi)",
    "Shorts": "Шорты",
    "Protections": "Защита",
    "Supplements": "Добавки",
    "Accessories": "Аксессуары",
    "Faixas": "Пояса",
    "Casual": "Повседневная одежда",
    "Mochilas": "Рюкзаки",
    "Lifestyle": "Стиль жизни",
    "Recovery": "Восстановление",
    "Equipamentos": "Снаряжение",
    "Academias": "Академии",
    "Filosofia": "Философия"
  },
  "nav": {
    "home": "Главная",
    "shop": "Магазин",
    "blog": "Блог",
    "settings": "Портал Атлета",
    "podcast": "Подкаст",
    "contact": "Контакты",
    "about": "О Нас",
    "wishlist": "Избранное",
    "profile": "Мой Кабинет",
    "categories": "Категории",
    "transparency": "10% Прозрачность",
    "comparator": "Сравнение цен",
    "comparator_short": "Сравнить"
  },
  "common": {
    "loading": "Загрузка...",
    "error": "Ошибка",
    "success": "Успешно",
    "cancel": "Отмена",
    "remove": "Удалить",
    "back": "Назад",
    "next": "Далее",
    "close": "Закрыть",
    "admin": "Админ [Мастер]",
    "login": "ВОЙТИ",
    "logout": "Выйти",
    "online": "ОНЛАЙН",
    "offline": "ОФЛАЙН",
    "theme_visual": "Тема",
    "light": "Светлая",
    "dark": "Тёмная",
    "auto": "Авто",
    "select_language": "Выбрать Язык"
  },
  "header": {
    "search_placeholder": "Поиск кимоно, техник, статей...",
    "recent_searches": "Недавние поиски",
    "clear": "Очистить",
    "popular_suggestions": "Популярные запросы"
  },
  "hero": {
    "scene1_tag": "СЦЕНА 01 // ВЫСШАЯ БРОНЯ",
    "scene1_headline": "НАУКА ДАВЛЕНИЯ.",
    "scene1_highlight": "ИСКУССТВО ПОБЕДЫ.",
    "scene1_subtitle": "Кимоно плотностью от 450 до 550 г/м² с тройными усиленными швами и воротником из вулканизированной EVA.",
    "scene1_cta": "Выбрать Элитные Кимоно",
    "scene2_tag": "СЦЕНА 02 // ВТОРАЯ ТЕРМОКОЖА",
    "scene2_headline": "НУЛЕВОЕ ТРЕНИЕ НА ТАТАМИ.",
    "scene2_highlight": "МАКСИМАЛЬНАЯ СКОРОСТЬ NO-GI.",
    "scene2_subtitle": "Анатомическая 4-way stretch компрессия высокой плотности для терморегуляции и защиты кожи.",
    "scene2_cta": "Смотреть Рашгарды",
    "scene3_tag": "СЦЕНА 03 // КОДЕКС ПОЯСА",
    "scene3_headline": "КАЖДОЕ ВОЛОКНО — ЭТО ИСТОРИЯ.",
    "scene3_highlight": "ТВОЙ ПОЯС, ТВОЁ НАСЛЕДИЕ.",
    "scene3_subtitle": "Пояса из 100% премиум-хлопка с планкой для нашивок и усиленной строчкой.",
    "scene3_cta": "Выбрать Пояса",
    "featured_badge": "ХИТ СЦЕНЫ"
  },
  "deal": {
    "super_offer": "ПРЕДЛОЖЕНИЕ ДНЯ",
    "savings": "Экономия",
    "historical_low": "Лучшая Цена"
  },
  "catalog": {
    "results_header": "Результаты Каталога",
    "items_count": "{{count}} товар",
    "items_count_plural": "{{count}} товаров",
    "pagination": "Страница {{page}} из {{total}}",
    "filtering": "Фильтрация каталога...",
    "no_products_found": "Экипировка не найдена",
    "no_products_desc": "По выбранным фильтрам ничего не найдено."
  },
  "footer": {
    "navigation": "Навигация",
    "social": "Социальные сети",
    "status_active": "ОФИЦИАЛЬНЫЙ ПОРТАЛ • СТИЛЬ ЖИЗНИ ТАТАМИ",
    "rights": "© 2026 OSS.OS DIARY [ПРИКЛАДНОЙ ТЕХНИЧЕСКИЙ ИНТЕЛЛЕКТ]",
    "tagline": "«Джиу-джитсу — это не просто борьба. Это суть, мягкий путь и уважение к костям, которые нас поддерживают. Oss.os Diary — это ультимативный выбор для жизни на татами.»"
  },
  "search_placeholder": "Искать снаряжение, техники, посты...",
  "theme": {
    "light": "Светлая тема",
    "dark": "Темная тема"
  },
  "landing": {
    "hero_title_part1": "OSS.OS",
    "hero_title_part2": "DIARY",
    "filtered_by": "ПРОВЕРЕНО НА ТАТАМИ • ОСН. В 2024",
    "portal_subtitle": "ПОРТАЛ ЭКИПИРОВКИ И КУЛЬТУРЫ ДЖИУ-ДЖИТСУ",
    "portal_description": "Технический отбор, вдохновленный Diário dos Oss.os. Лучшие цены и социальный вклад.",
    "enter_shop": "ВОЙТИ В МАГАЗИН",
    "selected_offers": "ИЗБРАННЫЕ ПРЕДЛОЖЕНИЯ",
    "compare_prices": "СРАВНИТЬ ЦЕНЫ",
    "our_manifesto": "НАШ МАНИФЕСТ",
    "technique_never_lies": "ТЕХНИКА НИКОГДА НЕ ВРЕТ.",
    "read_full_manifesto": "ЧИТАТЬ МАНИФЕСТ",
    "hide_details": "СКРЫТЬ ДЕТАЛИ",
    "manifesto_text": "Мы родились из разочарования от покупки экипировки, которая не выдерживает повседневных нагрузок на татами. OSS.OS — это не просто магазин, это фильтр. Каждое ги, пояс и добавка проходят через наш технический контроль, прежде чем попасть к вам.",
    "validated_mat": "ПРОВЕРЕНО НА ТАТАМИ",
    "essence_focus": "ФОКУС НА ГЛАВНОМ",
    "foundations_path": "ОСНОВЫ ПУТИ",
    "fighter_structure": "ЭКИПИРУЙСЯ КАК ВОИН"
  },
  "product": {
    "best_price": "Лучшая цена",
    "best_seller": "Хит продаж",
    "view_details": "Подробнее",
    "buy_now": "Купить сейчас",
    "reviews": "Отзывы",
    "price_history": "История цен",
    "comparative": "Сравнить цены"
  },
  "checkout": {
    "title": "Оформление",
    "terms": "Я прочитал и принимаю Условия использования.",
    "finish": "Завершить и перейти в магазин"
  },
  "filter": {
    "title": "Расширенные фильтры",
    "active_filters": "Активные фильтры",
    "clear_all": "Сбросить все",
    "price_range": "Диапазон цен",
    "brands": "Бренды",
    "sizes": "Размеры",
    "gender": "Пол",
    "belt_color": "Ранг / Пояс",
    "rating": "Минимальный рейтинг",
    "platforms": "Платформы",
    "product_type": "Тип товара",
    "view_results": "Показать {{count}} результатов"
  }
};

const hiTranslation = {
  "quick_access": "त्वरित पहुंच",
  "categories": {
    "All": "सभी",
    "Vestuário": "कपड़े",
    "Equipamentos de Proteção": "सुरक्षात्मक गियर",
    "Suplementos": "सप्लीमेंट्स",
    "Acessórios": "सामान",
    "Kimonos": "किमोनो (गी)",
    "Rash Guards": "रैश गार्ड्स",
    "Rashguards": "रैश गार्ड्स",
    "Nogi": "नो-गी",
    "Shorts": "शॉर्ट्स",
    "Protections": "सुरक्षा",
    "Supplements": "सप्लीमेंट्स",
    "Accessories": "सामान",
    "Faixas": "बेल्ट्स (पटका)",
    "Casual": "कैज़ुअल",
    "Mochilas": "बैग",
    "Lifestyle": "लाइफस्टाइल",
    "Recovery": "रिकवरी",
    "Equipamentos": "उपकरण",
    "Academias": "अकादमी",
    "Filosofia": "दर्शनशास्त्र"
  },
  "nav": {
    "home": "होम",
    "shop": "शॉप",
    "blog": "समाचार",
    "settings": "एथलीट पोर्टल",
    "podcast": "पॉडकास्ट",
    "contact": "संपर्क",
    "about": "हमारे बारे में",
    "wishlist": "पसंदीदा",
    "profile": "मेरा पोर्टल",
    "categories": "श्रेणियां",
    "transparency": "10% पारदर्शिता",
    "comparator": "मूल्य तुलना",
    "comparator_short": "तुलना"
  },
  "common": {
    "loading": "लोड हो रहा है...",
    "error": "त्रुटि",
    "success": "सफलता",
    "cancel": "रद्द करें",
    "remove": "हटाएं",
    "back": "वापस",
    "next": "आगे",
    "close": "बंद करें",
    "admin": "एडमिन [मास्टर]",
    "login": "साइन इन",
    "logout": "लॉग आउट",
    "online": "ऑनलाइन",
    "offline": "ऑफ़लाइन",
    "theme_visual": "थीम",
    "light": "लाइट",
    "dark": "डार्क",
    "auto": "ऑटो",
    "select_language": "भाषा चुनें"
  },
  "header": {
    "search_placeholder": "गियर, तकनीक, लेख खोजें...",
    "recent_searches": "हाल की खोजें",
    "clear": "हटाएं",
    "popular_suggestions": "लोकप्रिय सुझाव"
  },
  "hero": {
    "scene1_tag": "दृश्य 01 // सर्वोच्च कवच",
    "scene1_headline": "दबाव का विज्ञान।",
    "scene1_highlight": "विजय की कला।",
    "scene1_subtitle": "450g/m² से 550g/m² पर्ल वीव किमोनो, ट्रिपल प्रबलित सिलाई और ईवीए कॉलर के साथ।",
    "scene1_cta": "कुलीन किमोनो देखें",
    "scene2_tag": "दृश्य 02 // थर्मल दूसरी त्वचा",
    "scene2_headline": "चटाई पर शून्य घर्षण।",
    "scene2_highlight": "अधिकतम नो-गी गति।",
    "scene2_subtitle": "उच्च घनत्व वाला 4-वे स्ट्रेच संपीड़न जो मांसपेशियों के तापमान को नियंत्रित करता है।",
    "scene2_cta": "रैशगार्ड देखें",
    "scene3_tag": "दृश्य 03 // बेल्ट की विरासत",
    "scene3_headline": "हर धागा एक कहानी कहता है।",
    "scene3_highlight": "आपकी बेल्ट, आपकी विरासत।",
    "scene3_subtitle": "रैंक स्लीव और 8 से 12-पंक्ति सिलाई के साथ 100% प्रीमियम सूती बेल्ट।",
    "scene3_cta": "बेल्ट देखें",
    "featured_badge": "विशेष हाइलाइट"
  },
  "deal": {
    "super_offer": "आज की सुपर डील",
    "savings": "बचत",
    "historical_low": "न्यूनतम मूल्य"
  },
  "catalog": {
    "results_header": "कैटलॉग परिणाम",
    "items_count": "{{count}} उत्पाद",
    "items_count_plural": "{{count}} उत्पाद",
    "pagination": "पृष्ठ {{page}} / {{total}}",
    "filtering": "कैटलॉग फ़िल्टर हो रहा है...",
    "no_products_found": "कोई गियर नहीं मिला",
    "no_products_desc": "चुने गए फ़िल्टर से कोई उत्पाद मेल नहीं खाता।"
  },
  "footer": {
    "navigation": "नेविगेशन",
    "social": "सोशल",
    "status_active": "आधिकारिक पोर्टल • बीजेजे लाइफस्टाइल",
    "rights": "© 2026 OSS.OS DIARY [अनुप्रयुक्त तकनीकी बुद्धिमत्ता]",
    "tagline": "“जू-जित्सु केवल लड़ना नहीं है...”"
  },
  "search_placeholder": "गियर, तकनीक, पोस्ट खोजें...",
  "theme": {
    "light": "लाइट मोड",
    "dark": "डार्क मोड"
  },
  "landing": {
    "hero_title_part1": "OSS.OS",
    "hero_title_part2": "DIARY",
    "filtered_by": "मैट पर सत्यापित • स्था. 2024",
    "portal_subtitle": "उपकरण पोर्टल और जू-जित्सु संस्कृति",
    "portal_description": "Diário dos Oss.os से प्रेरित तकनीकी क्यूरेशन। सर्वोत्तम मूल्य और सामाजिक प्रभाव।",
    "enter_shop": "दुकान में प्रवेश करें",
    "selected_offers": "चयनित ऑफर",
    "compare_prices": "मूल्यों की तुलना करें",
    "our_manifesto": "हमारा घोषणापत्र",
    "technique_never_lies": "तकनीक कभी झूठ नहीं बोलती।",
    "read_full_manifesto": "पूरा घोषणापत्र पढ़ें",
    "hide_details": "विवरण छुपाएं",
    "manifesto_text": "हम ऐसे उपकरण खरीदने की हताशा से पैदा हुए हैं जो सामान्य मैट रूटीन को संभाल नहीं सकते। OSS.OS सिर्फ एक दुकान नहीं है, यह एक फ़िल्टर है। प्रत्येक गी, बेल्ट और सप्लीमेंट आपके रडार पर आने से पहले हमारे तकनीकी क्यूरेशन से गुजरता है।",
    "validated_mat": "मैट पर सत्यापित",
    "essence_focus": "सार पर ध्यान दें",
    "foundations_path": "मार्ग की नींव",
    "fighter_structure": "योद्धा की तरह गियर अप करें"
  },
  "product": {
    "best_price": "सर्वोत्तम मूल्य",
    "best_seller": "बेस्ट सेलर",
    "view_details": "विवरण देखें",
    "buy_now": "अभी खरीदें",
    "reviews": "फीडबैक",
    "price_history": "मूल्य इतिहास",
    "comparative": "तुलनात्मक मूल्य"
  },
  "checkout": {
    "title": "चेकआउट",
    "terms": "मैंने नियम और शर्तें पढ़ ली हैं और स्वीकार करता हूं।",
    "finish": "पूरा करें और स्टोर पर जाएं"
  },
  "filter": {
    "title": "उन्नत फ़िल्टर",
    "active_filters": "सक्रिय फ़िल्टर",
    "clear_all": "सभी साफ़ करें",
    "price_range": "मूल्य सीमा",
    "brands": "ब्रांड",
    "sizes": "आकार",
    "gender": "लिंग",
    "belt_color": "ग्रेड / बेल्ट",
    "rating": "न्यूनतम रेटिंग",
    "platforms": "प्लेटफ़ॉर्म",
    "product_type": "उत्पाद प्रकार",
    "view_results": "{{count}} परिणाम देखें"
  }
};

const koTranslation = {
  "quick_access": "빠른 접속",
  "categories": {
    "All": "전체",
    "Vestuário": "의류",
    "Equipamentos de Proteção": "보호 장비",
    "Suplementos": "보충제",
    "Acessórios": "액세서리",
    "Kimonos": "도복 (Gi)",
    "Rash Guards": "래쉬가드",
    "Rashguards": "래쉬가드",
    "Nogi": "노기",
    "Shorts": "파이트 쇼츠",
    "Protections": "보호장구",
    "Supplements": "보충제",
    "Accessories": "액세서리",
    "Faixas": "벨트 (띠)",
    "Casual": "캐주얼",
    "Mochilas": "백팩",
    "Lifestyle": "라이프스타일",
    "Recovery": "리커버리",
    "Equipamentos": "장비",
    "Academias": "체육관",
    "Filosofia": "주짓수 철학"
  },
  "nav": {
    "home": "홈",
    "shop": "스토어",
    "blog": "소식",
    "settings": "선수 포털",
    "podcast": "팟캐스트",
    "contact": "문의",
    "about": "소개",
    "wishlist": "위시리스트",
    "profile": "내 포털",
    "categories": "카테고리",
    "transparency": "10% 투명성",
    "comparator": "가격 비교",
    "comparator_short": "비교"
  },
  "common": {
    "loading": "로딩 중...",
    "error": "오류",
    "success": "성공",
    "cancel": "취소",
    "remove": "삭제",
    "back": "뒤로",
    "next": "다음",
    "close": "닫기",
    "admin": "관리자 [마스터]",
    "login": "로그인",
    "logout": "로그아웃",
    "online": "온라인",
    "offline": "오프라인",
    "theme_visual": "화면 테마",
    "light": "라이트",
    "dark": "다크",
    "auto": "자동",
    "select_language": "언어 선택"
  },
  "header": {
    "search_placeholder": "도복, 기술, 게시물 검색...",
    "recent_searches": "최근 검색어",
    "clear": "지우기",
    "popular_suggestions": "인기 추천 검색어"
  },
  "hero": {
    "scene1_tag": "SCENE 01 // 궁극의 도복 갑옷",
    "scene1_headline": "압박의 과학.",
    "scene1_highlight": "승리의 예술.",
    "scene1_subtitle": "450g/m² ~ 550g/m² 펄위브 원단, 삼중 보강 스티치와 고강도 EVA 깃으로 완성된 최상급 도복.",
    "scene1_cta": "엘리트 도복 보기",
    "scene2_tag": "SCENE 02 // 서멀 세컨드 스킨",
    "scene2_headline": "매트 위 마찰 제로.",
    "scene2_highlight": "노기 최고의 속도.",
    "scene2_subtitle": "근육 온도를 조절하고 찰과상으로부터 피부를 보호하는 고밀도 4방향 스트레치 래시가드.",
    "scene2_cta": "래시가드 보기",
    "scene3_tag": "SCENE 03 // 벨트의 증명",
    "scene3_headline": "모든 올마다 담긴 땀과 역사.",
    "scene3_highlight": "당신의 벨트, 당신의 유산.",
    "scene3_subtitle": "그라데이션 슬리브와 8~12줄 보강 박음질의 100% 프리미엄 코튼 벨트.",
    "scene3_cta": "주짓수 벨트 보기",
    "featured_badge": "매트 하이라이트"
  },
  "deal": {
    "super_offer": "오늘의 특가",
    "savings": "할인액",
    "historical_low": "역대 최저가"
  },
  "catalog": {
    "results_header": "카탈로그 검색 결과",
    "items_count": "{{count}}개 상품",
    "items_count_plural": "{{count}}개 상품",
    "pagination": "{{page}} / {{total}} 페이지",
    "filtering": "카탈로그 필터링 중...",
    "no_products_found": "상품을 찾을 수 없습니다",
    "no_products_desc": "선택한 조건과 일치하는 상품이 없습니다. 필터를 조정해 보세요."
  },
  "footer": {
    "navigation": "네비게이션",
    "social": "소셜",
    "status_active": "공식 포털 • 주짓수 라이프스타일",
    "rights": "© 2026 OSS.OS DIARY [응용 기술 지능]",
    "tagline": "“주짓수는 단순한 싸움이 아닙니다...”"
  },
  "search_placeholder": "장비, 기술, 소식 검색...",
  "theme": {
    "light": "라이트 모드",
    "dark": "다크 모드"
  },
  "landing": {
    "hero_title_part1": "OSS.OS",
    "hero_title_part2": "DIARY",
    "filtered_by": "매트 위 실전 검증됨 • 설립 2024",
    "portal_subtitle": "주짓수 장비 및 매트 문화 포털",
    "portal_description": "『Diário dos Oss.os』에서 영감을 받은 기술적 큐레이션. 최상의 가격과 사회적 환원.",
    "enter_shop": "스토어 입장",
    "selected_offers": "엄선된 혜택",
    "compare_prices": "가격 비교하기",
    "our_manifesto": "우리의 선언문",
    "technique_never_lies": "기술은 결코 거짓말하지 않는다.",
    "read_full_manifesto": "선언문 전문 읽기",
    "hide_details": "상세 비활성화",
    "manifesto_text": "우리는 일반적인 매트 훈련 일과를 감당하지 못하는 장비를 구매하는 번거로움에 지쳐서 시작되었습니다. OSS.OS는 단순한 스토어가 아니라 필터입니다. 모든 도복, 벨트, 보충제는 매트 위 실전 테스트를 거친 후 여러분께 제공됩니다.",
    "validated_mat": "매트 위 실전 검증됨",
    "essence_focus": "본질에 집중",
    "foundations_path": "수련의 기초",
    "fighter_structure": "전사처럼 장비하라"
  },
  "product": {
    "best_price": "최저가",
    "best_seller": "베스트셀러",
    "view_details": "상세 보기",
    "buy_now": "지금 구매",
    "reviews": "리뷰",
    "price_history": "가격 변동",
    "comparative": "가격 비교"
  },
  "checkout": {
    "title": "체크아웃",
    "terms": "이용약관을 읽었으며 이에 동의합니다.",
    "finish": "구매 완료 및 상점으로 이동"
  },
  "filter": {
    "title": "상세 필터",
    "active_filters": "적용된 필터",
    "clear_all": "필터 초기화",
    "price_range": "가격대",
    "brands": "브랜드",
    "sizes": "사이즈",
    "gender": "성별",
    "belt_color": "벨트 등급",
    "rating": "최소 평점",
    "platforms": "플랫폼",
    "product_type": "제품 유형",
    "view_results": "{{count}}개 결과 보기"
  }
};

resources.zh = { translation: mergeWithFallback(resources.en.translation, zhTranslation) };
resources.de = { translation: mergeWithFallback(resources.en.translation, deTranslation) };
resources.ja = { translation: mergeWithFallback(resources.en.translation, jaTranslation) };
resources.fr = { translation: mergeWithFallback(resources.en.translation, frTranslation) };
resources.it = { translation: mergeWithFallback(resources.en.translation, itTranslation) };
resources.ru = { translation: mergeWithFallback(resources.en.translation, ruTranslation) };
resources.hi = { translation: mergeWithFallback(resources.en.translation, hiTranslation) };
resources.ko = { translation: mergeWithFallback(resources.en.translation, koTranslation) };

export const SUPPORTED_LANGUAGES = ['pt', 'en', 'es', 'zh', 'de', 'ja', 'fr', 'it', 'ru', 'hi', 'ko'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    const rootLang = lng ? lng.split('-')[0] : 'pt';
    document.documentElement.lang = rootLang;
    try {
      localStorage.setItem('i18nextLng', rootLang);
      localStorage.setItem('oss_preferred_language', rootLang);
    } catch {
      // ignore
    }
  }
});

export default i18n;
