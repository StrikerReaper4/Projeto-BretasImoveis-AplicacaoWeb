import Header from "../components/Header";
import Footer from "../components/Footer";
import CardProperty from "../components/CardProperty";
import Button from "../components/Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, auth } from "../services/api";

/** Lista os imóveis favoritados pelo usuário comum logado (GET /api/favoritos). */
function FavoritesPage() {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!auth.isUser()) {
      navigate("/login");
      return;
    }
    api.listarFavoritos()
      .then((lista) => { setFavoritos(lista); setStatus("ok"); })
      .catch((e) => (e.status === 401 ? navigate("/login") : setStatus("erro")));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  // Nesta página todo card é favorito; desfavoritar tira o card da lista.
  const desfavoritar = async (id) => {
    try {
      await api.desfavoritar(id);
      setFavoritos((atual) => atual.filter((p) => p.id !== id));
    } catch (e) {
      alert(`Erro: ${e.message}`);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-[#F3F3F3] min-h-96 p-4 pb-28 text-center">
        <section aria-labelledby="titulo-favoritos" aria-live="polite">
          <h1 id="titulo-favoritos" className="text-3xl mb-4 title">Meus Favoritos</h1>
          {status === "loading" && <p>Carregando favoritos...</p>}
          {status === "erro" && <p role="alert">Não foi possível carregar seus favoritos.</p>}
          {status === "ok" && favoritos.length === 0 && (
            <div className="flex flex-col items-center gap-4">
              <p>Você ainda não favoritou nenhum imóvel. Toque no coração de um imóvel para salvá-lo aqui.</p>
              <Button label="Ver imóveis" wid="240" className="p-2" onClick={() => navigate("/")} />
            </div>
          )}
          <div className="flex flex-wrap gap-8 justify-center items-center">
            {favoritos.map((property) => (
              <CardProperty
                key={property.id}
                property={property}
                favorito={true}
                onToggleFavorito={desfavoritar}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default FavoritesPage;
