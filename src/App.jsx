import Header from "./Header/Header.jsx";
import Hero from "./Hero/Hero.jsx";
import CryptoSlider from "./CryptoSlider/CryptoSlider.jsx";
import Converter from "./Converter/Converter.jsx";
import Footer from "./Footer/Footer.jsx";

import "./App.css";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CryptoSlider />
        <Converter />
      </main>
      <Footer />
    </>
  );
}
