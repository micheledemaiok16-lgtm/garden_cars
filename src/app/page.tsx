import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import NewCars from "@/components/sections/NewCars";
import UsedCars from "@/components/sections/UsedCars";
import CraftBand from "@/components/sections/CraftBand";
import LeatherService from "@/components/sections/LeatherService";
import Gallery from "@/components/sections/Gallery";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Intro />
        <NewCars />
        <UsedCars />
        <CraftBand />
        <LeatherService />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
