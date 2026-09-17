import Header from "../components/Header";
import { FaPlus } from "react-icons/fa";
import FilterCard from "../components/FilterCard";
import CardProperty from "../components/CardProperty";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Button from "../components/Button";
import { api, auth } from "../services/api";

const IMOVEL_VAZIO = {
  state: "", city: "", neighborhood: "", address: "", operation: "", type: "",
  price: "", items: { quartos: 0, banheiros: 0, vagas: 0 }, area: "", description: "", img: [],
};

function AdminPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [erro, setErro] = useState("");

  const carregar = (filtro) => {
    let req;
    if (filtro?.id) req = api.buscarImovel(filtro.id).then((p) => [p]).catch(() => []);
    else if (filtro) req = api.filtrarImoveis(filtro);
    else req = api.listarImoveis();
    req.then(setProperties).catch(() => setErro("Não foi possível conectar à API."));
  };

  useEffect(() => {
    if (!auth.isAdmin()) {
      navigate("/admin");
      return;
    }
    carregar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const executar = async (acao) => {
    try {
      await acao();
      closeModal();
      carregar();
    } catch (e) {
      alert(`Erro: ${e.message}`);
    }
  };

  const openModal = useCallback((type, id) => {
    setSelectedProperty(type === "add" ? IMOVEL_VAZIO : properties.find((p) => p.id === id));
    setModalType(type);
  }, [properties]);
  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedProperty(null);
  }, []);

  return (
    <>
      <Header admin={true} />
      {(modalType === "edit" || modalType === "add") && (
        <Modal
          title={modalType === "edit" ? "Editar Imóvel" : "Adicionar Imóvel"}
          data={
            <PropertyForm
              property={selectedProperty}
              onChange={setSelectedProperty}
              onSave={() =>
                executar(() =>
                  modalType === "edit"
                    ? api.atualizarImovel(selectedProperty.id, selectedProperty)
                    : api.criarImovel(selectedProperty)
                )
              }
            />
          }
          onClose={closeModal}
        />
      )}
      {modalType === "delete" && (
        <Modal
          title="Tem certeza em deletar o imóvel?"
          data={
            <DeleteProperty
              propertyId={selectedProperty.id}
              onCancel={closeModal}
              onDelete={() => executar(() => api.deletarImovel(selectedProperty.id))}
            />
          }
          onClose={closeModal}
        />
      )}
      <main className="bg-[#F3F3F3] grid grid-cols-[400px_2fr] max-[710px]:grid-cols-1 p-4 pb-28">
        <aside className="sticky top-4 self-start max-[710px]:static max-[710px]:mb-8">
          <FilterCard admin={true} onFilter={carregar} />
        </aside>

        <section className="space-y-1 items-center justify-center text-center">
          <h1 className="text-3xl mb-4 title">Gerenciar Imóveis</h1>
          {erro && <p role="alert">{erro}</p>}
          <div className="flex flex-wrap gap-8 justify-center items-center">
            {properties.map((property) => (
              <CardProperty
                key={property.id}
                property={property}
                admin={true}
                handleOpen={openModal}
              />
            ))}
          </div>
        </section>
      </main>
      <button
        type="button"
        aria-label="Adicionar imóvel"
        title="Adicionar imóvel"
        className="fixed bottom-3 right-3 cursor-pointer bg-[#0f3e58] rounded-full w-16 h-16 flex items-center justify-center hover:bg-[#14506e] transition"
        onClick={() => openModal("add", null)}
      >
        <FaPlus size={40} className="text-white" aria-hidden="true" />
      </button>
    </>
  );
}

/** Formulário único para Cadastro e Edição. */
function PropertyForm({ property, onChange, onSave }) {
  const set = (campo) => (v) => onChange({ ...property, [campo]: v });
  const setItem = (campo) => (v) => onChange({ ...property, items: { ...property.items, [campo]: v } });
  const row = "flex items-left space-y-4 space-x-4 -mb-2 flex-cols-2 md:flex-cols-1 mt-2";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <div className={row}>
        <Input type="text" label="Estado" wid="150" select="true" selectOptions={["MS", "SP", "RJ", "MG"]} value={property.state} setValue={set("state")} required />
        <Input type="text" label="Cidade" wid="150" placeholder="Ex: Campo Grande" value={property.city} setValue={set("city")} required />
        <Input type="text" label="Bairro" wid="150" placeholder="Ex: Centro" value={property.neighborhood} setValue={set("neighborhood")} />
      </div>
      <Input type="text" label="Endereço" wid="full" placeholder="Ex: Rua das Palmeiras, 321" value={property.address} setValue={set("address")} required />
      <div className={row}>
        <Input type="text" label="Tipo de Operação" wid="150" select="true" selectOptions={["Compra", "Aluguel"]} value={property.operation} setValue={set("operation")} required />
        <Input type="text" label="Tipo de Imóvel" wid="150" select="true" selectOptions={["Casa", "Apartamento", "Terreno"]} value={property.type} setValue={set("type")} required />
        <Input type="number" label="Preço" wid="150" placeholder="Ex: 400000" value={property.price} setValue={set("price")} required />
      </div>
      <div className={row}>
        <Input type="number" label="Quartos" wid="150" value={property.items.quartos} setValue={setItem("quartos")} />
        <Input type="number" label="Banheiros" wid="150" value={property.items.banheiros} setValue={setItem("banheiros")} />
        <Input type="number" label="Vagas" wid="150" value={property.items.vagas} setValue={setItem("vagas")} />
        <Input type="number" label="Área (m²)" wid="150" placeholder="Ex: 120" value={property.area} setValue={set("area")} required />
      </div>
      <Input type="text" label="Descrição" wid="full" textarea="true" rows={3} placeholder="Ex: Uma casa espaçosa e confortável." value={property.description} setValue={set("description")} />
      <Input
        type="text"
        label="Imagens (URLs separadas por vírgula)"
        wid="full"
        placeholder="/placeholder_house.jpg, https://..."
        value={Array.isArray(property.img) ? property.img.join(", ") : property.img}
        setValue={set("img")}
      />
      <div className="flex items-center justify-center mt-4">
        <Button label="Salvar" wid="full" />
      </div>
    </form>
  );
}

function DeleteProperty({ propertyId, onCancel, onDelete }) {
  return (
    <div>
      <p className="text-left antialiased text-[#0f3e58] text-md mt-2">
        Esta ação é irreversível. Ao confirmar, todos os dados do imóvel de ID{" "}
        {propertyId} serão perdidos.
      </p>
      <div className="flex items-center justify-center mt-4 gap-4">
        <Button label="Cancelar" onClick={onCancel} wid="1/2" className={"bg-gray-600 hover:bg-gray-700"} />
        <Button label="Deletar" onClick={onDelete} wid="1/2" className={"bg-red-700 hover:bg-red-800"} />
      </div>
    </div>
  );
}

export default AdminPage;
