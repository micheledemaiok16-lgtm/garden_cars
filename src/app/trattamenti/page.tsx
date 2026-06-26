import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TreatmentsHero } from "@/components/sections/treatments/TreatmentsHero";
import { ServiceRow } from "@/components/sections/treatments/ServiceRow";
import { treatments } from "@/lib/treatments";

export const metadata: Metadata = {
  title: "Trattamenti",
  description:
    "Cura auto professionale da Garden's Cars a Giffoni Valle Piana: lucidatura a specchio, restauro pelle, car detailing, pellicole PPF e rimappatura centraline. Richiedi un preventivo.",
  alternates: { canonical: "/trattamenti" },
};

export default function TreatmentsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero pagina trattamenti: video di sfondo + titolo in Fade-in Up */}
        <TreatmentsHero />

        {treatments.map((t, i) => (
          <ServiceRow key={t.id} treatment={t} index={i} />
        ))}
      </main>
      <Footer />
    </>
  );
}
