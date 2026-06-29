import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import Inventory from "@/components/sections/Inventory";
import CraftBand from "@/components/sections/CraftBand";
import LeatherService from "@/components/sections/LeatherService";
import CarExplorer from "@/components/sections/CarExplorer";
import OtherTreatments from "@/components/sections/OtherTreatments";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Intro />
        <Inventory />
        <CraftBand />
        <LeatherService />
        <CarExplorer />
        <OtherTreatments />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
