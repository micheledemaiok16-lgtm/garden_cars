/**
 * Servizi/trattamenti offerti dal salone.
 *
 * Sorgente unica per il menu a tendina "Trattamenti" (Navbar/Footer) e per le
 * sezioni della pagina /trattamenti: l'`id` è anche l'ancora della sezione, così
 * ogni voce del menu (/trattamenti#<id>) porta esattamente al blocco giusto.
 *
 * I contenuti sono ancora segnaposto: verranno compilati man mano con i testi,
 * le immagini e le fasi reali di ogni servizio.
 */

export interface Treatment {
  /** Ancora della sezione + slug nell'URL (/trattamenti#<id>). */
  id: string;
  /** Etichetta breve usata nel menu. */
  label: string;
  /** Titolo della sezione nella pagina. */
  title: string;
  /** Frase introduttiva (segnaposto, da rifinire). */
  intro: string;
}

export const treatments: readonly Treatment[] = [
  {
    id: "lucidatura",
    label: "Lucidatura",
    title: "Lucidatura",
    intro: "Contenuto in arrivo: descrizione del servizio di lucidatura.",
  },
  {
    id: "trattamento-pelle",
    label: "Trattamento pelle",
    title: "Trattamento pelle",
    intro: "Contenuto in arrivo: descrizione del trattamento della pelle.",
  },
  {
    id: "car-detailing",
    label: "Car detailing",
    title: "Car detailing",
    intro: "Contenuto in arrivo: descrizione del servizio di car detailing.",
  },
  {
    id: "trattamento-vetri",
    label: "Trattamento vetri",
    title: "Trattamento vetri",
    intro: "Contenuto in arrivo: descrizione del trattamento dei vetri.",
  },
  {
    id: "centraline",
    label: "Centraline",
    title: "Centraline",
    intro: "Contenuto in arrivo: descrizione del servizio centraline.",
  },
] as const;
