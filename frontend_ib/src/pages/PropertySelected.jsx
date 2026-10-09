import Header from "../components/Header";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import { FaAngleLeft, FaAngleRight, FaBath, FaCarAlt, FaHeart, FaRegHeart } from "react-icons/fa";
import Button from "../components/Button";
import { useState, useEffect } from "react";
import { IoIosBed } from "react-icons/io";
import { api } from "../services/api";
import { useFavoritos } from "../hooks/useFavoritos";

function PropertySelected() {
  const [imageSelected, setImageSelected] = useState(0);
  const [property, setProperty] = useState(null);
  const [erro, setErro] = useState(false);
  const { id } = useParams();
  const favoritos = useFavoritos();
  const icons = [
    <IoIosBed size={55} className="inline-block ml-2" aria-hidden="true" />,
    <FaBath size={55} className="inline-block ml-2" aria-hidden="true" />,
    <FaCarAlt size={55} className="inline-block ml-2" aria-hidden="true" />,
  ];

  useEffect(() => {
    api.buscarImovel(id).then(setProperty).catch(() => setErro(true));
  }, [id]);

  useEffect(() => {
    if (!property) return;
    const intervalo = setInterval(() => {
      setImageSelected((atual) => (atual === property.img.length - 1 ? 0 : atual + 1));
    }, 5000);
    return () => clearInterval(intervalo);
  }, [property]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (erro || !property) {
    return (
      <>
        <Header />
        <main className="bg-[#F3F3F3] min-h-96 p-8 text-center">
          <p role={erro ? "alert" : undefined}>{erro ? "Imóvel não encontrado." : "Carregando..."}</p>
        </main>
        <Footer />
      </>
    );
  }

  const redirectToWhatsapp = () => {
    const phoneNumber = "5567992609967";
    const message = `Olá, gostaria de saber mais sobre o imóvel
    do endereço ${property.address} e do ID ${property.id}`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener noreferrer"
    );
  };
  const anterior = () => setImageSelected(imageSelected === 0 ? property.img.length - 1 : imageSelected - 1);
  const proxima = () => setImageSelected(imageSelected === property.img.length - 1 ? 0 : imageSelected + 1);

  return (
    <>
      <Header />
      <main className="bg-[#F3F3F3] w-full min-h-96 p-4 pb-28 flex flex-col items-center justify-center text-center">
        <article className="bg-white w-full max-w-[1300px] rounded-2xl p-6 sm:p-8 shadow-md grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* === Galeria de imagens === */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-1 flex-wrap">
              <button
                type="button"
                aria-label="Imagem anterior"
                className="bg-[#0f3e58] min-[400px]:hidden rounded-[100%] mb-2 lg:flex p-2 justify-center items-center h-[45px] w-[50px] cursor-pointer hover:bg-[#14506e] transition"
                onClick={anterior}
              >
                <FaAngleLeft className="text-white" size={26} aria-hidden="true" />
              </button>

              <img
                src={property.img[imageSelected]}
                className="w-full max-w-[500px] h-[250px] sm:h-[300px] md:h-[350px] rounded-lg object-cover"
                alt={`Foto ${imageSelected + 1} de ${property.img.length} do imóvel em ${property.address}`}
              />

              <button
                type="button"
                aria-label="Próxima imagem"
                className="bg-[#0f3e58] min-[400px]:hidden lg:flex lg:mt-2 rounded-[100%] justify-center p-2 items-center h-[45px] w-[50px] cursor-pointer hover:bg-[#14506e] transition"
                onClick={proxima}
              >
                <FaAngleRight className="text-white" size={26} aria-hidden="true" />
              </button>
            </div>

            {/* Indicadores de imagem */}
            <div className="mt-2 flex justify-center items-center gap-2">
              {property.img.map((item, index) => (
                <button
                  type="button"
                  key={index}
                  aria-label={`Ver imagem ${index + 1}`}
                  aria-current={index === imageSelected}
                  className={`rounded-full h-4 w-4 cursor-pointer transition ${
                    index === imageSelected ? "bg-[#0f3e58]" : "bg-[#0f3e586c]"
                  }`}
                  onClick={() => setImageSelected(index)}
                ></button>
              ))}
            </div>
          </div>

          {/* === Informações principais === */}
          <div className="bg-[#0f3e58] text-left text-white rounded-2xl p-6 sm:p-8 shadow-md mx-auto flex flex-col max-w-[500px] w-full">
            <span className="text-[#efd16e] font-bold text-md mt-2 block">
              {property.type} - {property.operation}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Endereço: {property.address}
            </h1>
            <p className="text-lg sm:text-xl mb-2">
              Bairro {property.neighborhood}, {property.city} - {property.state}
            </p>
            <p className="text-3xl sm:text-4xl text-[#efd16e] font-extrabold mb-2">
              {property.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            <p className="text-base sm:text-lg mt-2">
              <strong>Descrição:</strong>{" "}
              {property.description
                ? property.description
                : "Este imóvel não possui uma descrição detalhada no momento."}
            </p>
            <Button
              label="Entrar em Contato"
              wid="full"
              className="p-2 mt-6 bg-[#c5ac5c] hover:bg-[#978b62] transition"
              onClick={() => redirectToWhatsapp()}
            />
            {favoritos.ativo && (
              <button
                type="button"
                onClick={() => favoritos.alternar(property.id)}
                aria-pressed={favoritos.ids.has(property.id)}
                className="mt-3 w-full flex items-center justify-center gap-2 p-2 rounded-4xl border-2 border-white text-white text-xl font-semibold cursor-pointer hover:bg-white hover:text-[#0f3e58] transition"
              >
                {favoritos.ids.has(property.id) ? (
                  <><FaHeart className="text-red-500" aria-hidden="true" /> Remover dos favoritos</>
                ) : (
                  <><FaRegHeart aria-hidden="true" /> Adicionar aos favoritos</>
                )}
              </button>
            )}
          </div>

          {/* === Itens adicionais === */}
          <div className="flex flex-wrap justify-center items-center gap-4 mt-4 w-full col-span-1 lg:col-span-2">
            {Object.entries(property.items).map(([key, value], index) => (
              <div
                key={index}
                className="bg-[#0f3e58] text-center text-white rounded-md p-2 sm:p-3 shadow-md w-[45%] sm:w-[30%] md:w-[22%] max-w-[140px] min-h-[100px] mt-4"
              >
                <h2 className="text-lg sm:text-2xl font-bold">
                  {key[0].toUpperCase() + key.slice(1)}
                </h2>
                <div className="grid grid-cols-2 gap-1 justify-center items-center text-center">
                  {icons[index]}
                  <span className="font-bold text-3xl sm:text-5xl inline-block">
                    {value}
                  </span>
                </div>
              </div>
            ))}
            <div className="bg-[#0f3e58] text-center text-white rounded-md px-4 pt-2 pb-3 shadow-md w-[45%] sm:w-[30%] md:w-[22%] max-w-[180px] min-h-[100px] mt-4">
              <h2 className="text-lg sm:text-2xl font-bold">Área (m²)</h2>
              <span className="font-bold text-3xl sm:text-[40px]">
                {property.area}
              </span>
            </div>
          </div>

          {/* === Mapa === */}
          <div className="grid justify-center items-center w-full mt-6 col-span-1 lg:col-span-2 grid-cols-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 w-full text-center col-span-1 lg:col-span-2">
              Localização no Mapa
            </h2>
            <iframe
              title={`Mapa: ${property.address}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                `${property.address}, ${property.city} - ${property.state}`
              )}&z=17&output=embed`}
              className="w-full h-[250px] sm:h-[300px] md:h-[350px] rounded-lg shadow-md"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

export default PropertySelected;
