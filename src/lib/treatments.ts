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
  /** Descrizione del servizio. */
  intro: string;
  /** Sotto-servizi / cosa comprende, mostrati come chip. */
  features: string[];
  /** Media principale; `null` mostra un placeholder elegante (video in arrivo). */
  media: ServiceMedia | null;
  /** Collage di 3 immagini (ha precedenza su `media`): tile alto + 2 impilate. */
  gallery?: { src: string; alt: string }[];
  /** Micro-interazione dedicata. */
  anim: ServiceAnim;
  /** Statistiche animate (solo `counter`). */
  stats?: CounterStat[];
}

const L = "/trattamenti/lucidatura";
const RP = "/trattamenti/restauro-pelle";
const V = "/trattamenti/trattamento-vetri";
const C = "/trattamenti/centraline";
const CD = "/trattamenti/car-detailing";

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
        src: `${RP}/pelle-sedile.webp`,
        alt: "Sedile in pelle cognac rigenerato con cuciture a contrasto",
      },
    ],
    anim: "mask",
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
    media: {
      type: "image",
      src: `${V}/pellicola-ppf.png`,
      alt: "Pellicola PPF trasparente che protegge il faro di un'auto sportiva",
    },
    anim: "parallax",
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
      alt: "Centralina elettronica per la rimappatura del motore",
    },
    anim: "counter",
    stats: [
      { label: "Potenza", value: 30, prefix: "+", suffix: " CV" },
      { label: "Coppia", value: 60, prefix: "+", suffix: " Nm" },
    ],
  },
] as const;
