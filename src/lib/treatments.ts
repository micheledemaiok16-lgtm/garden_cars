/**
 * Servizi/trattamenti offerti dal salone.
 *
 * Sorgente unica per il menu a tendina "Trattamenti" (Navbar/Footer) e per le
 * righe Zig-Zag della pagina /trattamenti: l'`id` è anche l'ancora della sezione,
 * così ogni voce del menu (/trattamenti#<id>) porta esattamente al blocco giusto.
 */

/** Micro-interazione dedicata a ogni servizio. */
export type ServiceAnim =
  | "illuminate" // media scuro che si illumina all'hover (Lucidatura)
  | "mask" // reveal a maschera laterale in scroll (Restauro Pelle)
  | "bounce" // chip dei sotto-servizi che rimbalzano all'hover (Car Detailing)
  | "parallax" // media in parallasse rispetto al testo (Vetri/PPF)
  | "counter"; // contatore CV/Nm animato da zero (Centraline)

export interface ServiceMedia {
  type: "video" | "image";
  src: string;
  alt: string;
  /** Poster del video (primo frame statico). */
  poster?: string;
  /** Scala il media al 125% per tagliare la cornice esterna (come l'hero). */
  zoom?: boolean;
}

/** Statistica animata (es. potenza/coppia per le centraline). */
export interface CounterStat {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

export interface Treatment {
  /** Ancora della sezione + slug nell'URL (/trattamenti#<id>). */
  id: string;
  /** Etichetta breve usata nel menu. */
  label: string;
  /** Titolo della sezione nella pagina. */
  title: string;
  /**
   * Descrizione del servizio. `**parola**` (stile markdown) viene reso in
   * grassetto — usato per i nomi di prodotto/brand (es. "Defender").
   */
  intro: string;
  /** Sotto-servizi / cosa comprende, mostrati come chip. */
  features: string[];
  /** Media principale; `null` mostra un placeholder elegante (video in arrivo). */
  media: ServiceMedia | null;
  /** Collage di 3 o 4 immagini (ha precedenza su `media`). */
  gallery?: { src: string; alt: string; type?: "image" | "video"; caption?: string }[];
  /**
   * "stacked" (richiede `gallery` con 5 elementi: [...4 in griglia, ultima
   * a parte]): la griglia 2×2 delle prime 4 immagini sopra (occupa la parte
   * principale), l'ultima immagine in una fascia più bassa sotto — nessuna
   * sovrapposizione. Assente → griglia/collage generico in base al numero
   * di elementi.
   */
  galleryLayout?: "stacked";
  /** Micro-interazione dedicata. */
  anim: ServiceAnim;
  /** Statistiche animate (solo `counter`). */
  stats?: CounterStat[];
  /**
   * Messaggio precompilato del pulsante WhatsApp "Richiedi un preventivo",
   * specifico per il servizio (più naturale del titolo incollato in un
   * template generico, es. evita "il trattamento Antifurto").
   */
  whatsappMessage: string;
}

const L = "/trattamenti/lucidatura";
const RP = "/trattamenti/restauro-pelle";
const V = "/trattamenti/trattamento-vetri";
const C = "/trattamenti/centraline";
const CD = "/trattamenti/car-detailing";
const AF = "/trattamenti/antifurto";

export const treatments: readonly Treatment[] = [
  {
    id: "restauro-pelle",
    label: "Restauro pelle",
    title: "Restauro pelle",
    intro:
      "Volante consumato, sedili segnati, colori sbiaditi: riportiamo l'abitacolo all'aspetto e al profumo del primo giorno. Pulizia profonda, rigenerazione del colore e protezione duratura, per interni che valorizzano la tua auto a ogni viaggio.",
    features: [
      "Pulizia profonda",
      "Rigenerazione colore",
      "Volante e abitacolo",
      "Sedili in pelle",
      "Protezione UV",
    ],
    media: null,
    gallery: [
      {
        src: `${RP}/volante.png`,
        alt: "Volante in pelle restaurato, esposto in officina",
      },
      {
        src: `${RP}/pelli.png`,
        alt: "Campionario di pelli in diversi colori e grane",
      },
      {
        src: `${RP}/videospruzzo.mp4`,
        alt: "Restauro sedile auto con spruzzo",
        type: "video"
      },
    ],
    anim: "mask",
    whatsappMessage:
      "Ciao Garden's Cars, vorrei maggiori informazioni sul restauro della pelle.",
  },
  {
    id: "car-detailing",
    label: "Car detailing",
    title: "Car detailing",
    intro:
      "Molto più di un lavaggio: protezione nanotecnologica della carrozzeria, cura della tappezzeria e trattamenti nanoceramici. La tua auto respinge acqua e sporco e mantiene la brillantezza molto più a lungo.",
    features: [
      "Lavaggio nanotecnologico",
      "Pulizia tappezzeria",
      "Trattamento nanoceramico",
      "Effetto idrofobico",
    ],
    media: {
      type: "image",
      src: `${CD}/cardetailing.webp`,
      alt: "Operatore Garden's Cars che lucida la carrozzeria con la lucidatrice orbitale",
    },
    anim: "bounce",
    whatsappMessage:
      "Ciao Garden's Cars, vorrei maggiori informazioni sul car detailing.",
  },
  {
    id: "lucidatura",
    label: "Lucidatura",
    title: "Lucidatura",
    intro:
      "Graffi, swirl e aloni spariscono sotto una correzione professionale della vernice, fino alla brillantezza dell'effetto specchio. Rinnoviamo fari, montanti e plastiche lucide, poi sigilliamo tutto per un risultato che resiste nel tempo.",
    features: [
      "Correzione vernice",
      "Rimozione swirl e graffi",
      "Restauro fari",
      "Lucidatura montanti",
      "Sigillante protettivo",
    ],
    media: {
      type: "video",
      src: `${L}/loop.mp4`,
      alt: "Fascio di luce che scorre su una carrozzeria lucidata a specchio",
      poster: `${L}/risultato-1.jpg`,
      zoom: true,
    },
    anim: "illuminate",
    whatsappMessage:
      "Ciao Garden's Cars, vorrei maggiori informazioni sulla lucidatura auto.",
  },
  {
    id: "trattamento-vetri",
    label: "Vetri & PPF",
    title: "Vetri & PPF",
    intro:
      "Pellicole PPF antisasso, oscuramento di vetri e fari, wrapping personalizzato: proteggiamo ogni superficie con film invisibili ad alte prestazioni e diamo alla tua auto il look che desideri.",
    features: [
      "Pellicole protettive",
      "Oscuramento vetri",
      "Oscuramento fari",
      "Wrapping",
    ],
    media: null,
    gallery: [
      {
        src: `${V}/oscuramento-50-v3.webp`,
        alt: "Finestrino anteriore con oscuramento 50%",
        caption: "50%",
      },
      {
        src: `${V}/oscuramento-65-v3.webp`,
        alt: "Finestrino anteriore con oscuramento 65%",
        caption: "65%",
      },
      {
        src: `${V}/oscuramento-85-v3.webp`,
        alt: "Finestrino anteriore con oscuramento 85%",
        caption: "85%",
      },
      {
        src: `${V}/oscuramento-95-v3.webp`,
        alt: "Finestrino anteriore con oscuramento 95%",
        caption: "95%",
      },
      {
        src: `${V}/pellicola.webp`,
        alt: "Applicazione di pellicola PPF trasparente su un cofano rosso",
      },
    ],
    galleryLayout: "stacked",
    anim: "parallax",
    whatsappMessage:
      "Ciao Garden's Cars, vorrei maggiori informazioni su vetri e pellicole PPF.",
  },
  {
    id: "centraline",
    label: "Centraline",
    title: "Centraline",
    intro:
      "Rimappature personalizzate per liberare il vero potenziale del motore: più cavalli, più coppia e una risposta più pronta a ogni accelerata, sempre nel pieno rispetto dell'affidabilità.",
    features: [
      "Rimappatura su misura",
      "Aumento potenza",
      "Aumento coppia",
      "Ottimizzazione consumi",
    ],
    media: {
      type: "image",
      src: `${C}/centralina.png`,
      alt: "Tecnico che riprogramma una centralina motore con strumentazione KESS",
    },
    anim: "counter",
    stats: [
      { label: "Potenza", value: 30, prefix: "+", suffix: " CV" },
      { label: "Coppia", value: 60, prefix: "+", suffix: " Nm" },
    ],
    whatsappMessage:
      "Ciao Garden's Cars, vorrei maggiori informazioni sulla rimappatura delle centraline.",
  },
  {
    id: "antifurto",
    label: "Antifurto",
    title: "Antifurto",
    intro:
      "Montiamo **Defender**, il sistema antifurto di riferimento in concessionaria: blocco motore elettronico che impedisce l'avviamento senza il codice corretto, per una protezione invisibile ma efficace contro furto e scasso, mantenendo la piena affidabilità dell'auto.",
    features: [
      "Bloccasterzo meccanico",
      "Protezione ECU e OBD",
      "Antifurto satellitare",
      "Batterie ibride ed elettriche",
    ],
    media: {
      type: "image",
      src: `${AF}/antifurto-defender.png`,
      alt: "Schema del sistema antifurto Defender installato sull'auto",
    },
    // "illuminate" scurisce il media di base (pensato per un video/foto
    // chiari, es. Lucidatura): su quest'immagine, già scura di suo, la
    // rendeva illeggibile finché non in hover. "parallax" = nessuno
    // scurimento, solo un leggero movimento in scroll (come Vetri & PPF).
    anim: "parallax",
    whatsappMessage:
      "Ciao Garden's Cars, vorrei maggiori informazioni sull'installazione dell'antifurto Defender.",
  },
] as const;
