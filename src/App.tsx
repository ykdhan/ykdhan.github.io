import Background from "./components/Background";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Work from "./components/Work";
import Stack from "./components/Stack";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Background />
      <Nav />
      <main className="app">
        <Hero />
        <About />
        <Work />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
