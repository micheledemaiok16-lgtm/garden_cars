# PROGETTO: Sito web "Garden Cars" — concessionaria auto (Giffoni Valle Piana, SA)

## Plugin/Skill da usare
Usa attivamente questi skill durante TUTTO il lavoro:
- frontend-design (estetica distintiva, motion ad alto impatto)
- ui-ux-pro-max-skill (design intelligence, gerarchia, layout)
Se hai Context7 MCP, consultalo per la documentazione aggiornata di GSAP,
Framer Motion, Lenis e Next.js prima di scrivere il codice delle animazioni.

## Brief
Garden Cars è una concessionaria di Giffoni Valle Piana (provincia di Salerno)
specializzata in:
1. Vendita auto NUOVE
2. Vendita auto USATE
3. Servizio di TRATTAMENTO PELLI E SEDILI (pulizia, rigenerazione, protezione)

Obiettivo: un sito vetrina ad altissimo impatto visivo, completamente animato,
ispirato a spacex.com (scroll cinematico, sezioni a tutto schermo, reveal
progressivi, parallax, transizioni fluide). Sensazione: "motorsport premium",
elegante e tecnologico, non un sito da concessionaria generico.

## Identità visiva (dal logo allegato)
- Verde corsa (racing green) ~ #1B5E2B come colore primario
- Nero profondo #0A0A0A per superfici scure / hero
- Bianco #FFFFFF / off-white per respiro
- Accenti tricolore italiano: verde #008C45, bianco, rosso #CD212A
  (usali con parsimonia, come dettaglio di linea, non come fondali)
- Mood: scuro/cinematico nelle sezioni hero e immersive, chiaro nelle sezioni
  di contenuto. Tanto spazio negativo, tipografia decisa.
- Tipografia: un sans-serif geometrico forte per i titoli (es. tipo
  Clash Display, Space Grotesk o Sora) + un sans leggibile per il testo.
  Evita Inter di default e i gradienti viola "da AI".
- Integra il logo (te lo fornisco come asset) con un reveal animato in apertura.

## Stack tecnico
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion per le micro-interazioni e i reveal
- GSAP + ScrollTrigger per le animazioni scroll-driven (pin, scrub, parallax)
- Lenis per lo smooth scroll
- (Opzionale ma gradito) React Three Fiber / Three.js per un modello 3D o un
  effetto particellare leggero nella hero — solo se non penalizza le performance
- Immagini ottimizzate con next/image, lazy-loading, formati moderni

## Struttura del sito (sezioni, in ordine di scroll)
1. HERO a tutto schermo: reveal animato del logo, headline forte
   ("Garden Cars — Passione su quattro ruote"),
   sottotitolo, CTA. Fondale scuro animato (video loop muto o effetto
   particellare/luce in racing green). Indicatore di scroll animato.
2. INTRO / CHI SIAMO: testo che entra in scrub mentre si scrolla, immagine
   con parallax.
3. AUTO NUOVE: sezione immersiva con card auto che si rivelano in sequenza,
   hover cinematico, possibilità di filtri (marca, prezzo, alimentazione).
4. AUTO USATE: griglia/listing con animazioni di entrata staggered e filtri.
   Prevedi struttura dati riutilizzabile (array di oggetti auto) così è facile
   collegarci poi un CMS o un gestionale.
5. SERVIZIO TRATTAMENTO PELLI E SEDILI: sezione "prima/dopo" interattiva
   (slider o reveal su scroll), spiegazione del processo in step animati.
6. PERCHÉ SCEGLIERCI: 3-4 punti di forza con icone animate / contatori.
7. GALLERIA / SHOWROOM: griglia con effetto parallax e lightbox.
8. CONTATTI: form (nome, email, telefono, messaggio), mappa di Giffoni Valle
   Piana, orari, telefono, social, indirizzo. Striscia tricolore come accento.
9. FOOTER: logo, link rapidi, P.IVA placeholder, social.

## Requisiti di animazione (stile SpaceX)
- Smooth scroll su tutto il sito (Lenis).
- Sezioni che si "pinnano" e rivelano contenuto mentre si scrolla (ScrollTrigger scrub).
- Parallax multi-layer su immagini e testo.
- Reveal progressivi (fade + translate + clip) all'ingresso di ogni blocco.
- Transizioni di pagina fluide tra le route.
- Cursore custom o hover states cinematici sulle card auto (opzionale).
- Navbar che cambia stato/colore in base alla sezione e si nasconde/mostra
  in base alla direzione di scroll.
- Tutte le animazioni devono rispettare prefers-reduced-motion.

## Requisiti tecnici
- Mobile-first e perfettamente responsive (le animazioni vanno
  semplificate/disattivate dove appesantiscono il mobile).
- Performance: punta a Lighthouse 90+, evita layout shift, lazy-load pesi.
- Accessibilità: contrasti AA, focus visibili, alt text, semantica corretta.
- SEO base: metadati, Open Graph, dati strutturati LocalBusiness/AutoDealer
  con indirizzo Giffoni Valle Piana, title/description per sezione.
- Codice pulito, componenti riutilizzabili, dati delle auto separati dalla UI.
- Niente testo "lorem ipsum" definitivo: usa contenuti placeholder credibili
  in italiano, segnalando con [DA COMPLETARE] ciò che serve dal cliente
  (foto reali, listino, recapiti).

## Asset
Userò il logo che ti fornisco (file immagine). Inseriscilo nella hero,
nella navbar (versione compatta) e nel footer. Crea anche una favicon a partire
dal logo.

## Modalità di lavoro
1. Prima propnimi la direzione di design (palette finale, font scelti, mood
   board testuale, lista sezioni) e attendi conferma.
2. Poi imposta progetto e struttura cartelle.
3. Costruisci sezione per sezione, mostrandomi il progresso.
4. Al termine fai un audit di UX e performance e correggi i problemi.
Lavora in italiano per tutti i contenuti visibili.