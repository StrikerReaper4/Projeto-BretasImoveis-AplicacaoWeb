import Header from "../components/Header";
import FilterCard from "../components/FilterCard";
import Footer from "../components/Footer";
import CardProperty from "../components/CardProperty";
import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import { api } from "../services/api";

function Home() {
  const [showExtra, setShowExtra] = useState(false);
  const [properties, setProperties] = useState([]);
  const [status, setStatus] = useState("loading");

  const carregar = (filtro) => {
    setStatus("loading");
    (filtro ? api.filtrarImoveis(filtro) : api.listarImoveis())
      .then((lista) => { setProperties(lista); setStatus("ok"); })
      .catch(() => setStatus("erro"));
  };

  useEffect(() => carregar(), []);

  // Exibe o botão "Voltar aos Filtros" após rolar 500px
  const handleScroll = () => {
    const position = window.scrollY;
    setShowExtra(position > 500);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({top:0,behavior:"smooth"});
  },[])

  // Função para rolar até o filtro
  const scrollToFilters = () => {
    setShowExtra(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Header />

      {showExtra && (
        <div className="max-[710px]:flex hidden justify-center fixed top-4 z-50 w-full">
          <button
            onClick={scrollToFilters}
            className="bg-[#80703c] text-white text-center py-2 px-6 rounded-full font-bold shadow-md align-middle"
          >
            <FaArrowUp className="inline-block mr-2" aria-hidden="true" />
            Voltar aos Filtros
          </button>
        </div>
      )}

      <main className="bg-[#F3F3F3] grid grid-cols-[400px_2fr] max-[710px]:grid-cols-1 p-4 pb-28">
        <aside className="sticky top-4 self-start max-[710px]:static max-[710px]:mb-8">
          <FilterCard onFilter={carregar} />
        </aside>

        <section className="space-y-1 items-center justify-center text-center" aria-live="polite">
          <h2 className="text-3xl mb-4 title">Destaques</h2>
          {status === "loading" && <p>Carregando imóveis...</p>}
          {status === "erro" && <p role="alert">Não foi possível conectar à API. Verifique se o backend está rodando.</p>}
          {status === "ok" && properties.length === 0 && <p>Nenhum imóvel encontrado.</p>}
          <div className="flex flex-wrap gap-8 justify-center items-center">
            {properties.map((property) => (
              <CardProperty key={property.id} property={property} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;
