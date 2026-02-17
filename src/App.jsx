import Header from "./Header/Header.jsx";
import Hero from "./Hero/Hero.jsx";
import CryptoSlider from "./CryptoSlider/CryptoSlider.jsx";
import Converter from "./Converter/Converter.jsx";
import FAQ from "./FAQ/FAQ.jsx";
import Footer from "./Footer/Footer.jsx";

export default function App() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <CryptoSlider />
        <Converter />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
