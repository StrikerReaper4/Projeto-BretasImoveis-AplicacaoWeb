import { useState } from "react";
import Input from "./Input";
import Button from "./Button";

const FILTRO_VAZIO = {
    id: "", situacao: "", tipo: "", estado: "", cidade: "", bairro: "",
    valorMin: "", valorMax: "", quartos: "", banheiros: "", vagas: "",
};

function FilterCard({ admin = false, onFilter }) {
    const [f, setF] = useState(FILTRO_VAZIO);
    const campo = (nome) => ({ value: f[nome], setValue: (v) => setF({ ...f, [nome]: v }) });

    const handleSubmit = (e) => {
        e.preventDefault();
        const num = (v) => (v === "" ? null : Number(v));
        onFilter?.({
            id: num(f.id),
            situacao: f.situacao, tipo: f.tipo, estado: f.estado, cidade: f.cidade, bairro: f.bairro,
            valorMin: num(f.valorMin), valorMax: num(f.valorMax),
            quartos: num(f.quartos), banheiros: num(f.banheiros), vagas: num(f.vagas),
        });
    };

    return(
        <>
        <section aria-labelledby="titulo-filtro" className="bg-white w-[100%]  rounded-lg p-4 shadow-md text-center">
            <h2 id="titulo-filtro" className="title text-3xl mb-4 ">Filtragem</h2>
            <form onSubmit={handleSubmit}>
                <div className={`${admin ? "" : "hidden"} flex items-left space-y-4 space-x-4 flex-cols-2 md:flex-cols-1`}>
                    <Input type="number" label="Pesquisa por ID" wid="full" placeholder="Ex: 7344" {...campo("id")}/>
                </div>
                <hr className={`${admin ? "" : "hidden"} my-2 text-gray-300`}/>
                <div className="flex items-left space-y-4 space-x-4 flex-cols-2 md:flex-cols-1">
                    <Input type="text" label="Tipo de Operação" wid="150" select="true" selectOptions={["Compra", "Aluguel"]} {...campo("situacao")} />
                    <Input type="text" label="Tipo de Imóvel" wid="150" select="true" selectOptions={["Casa", "Apartamento", "Terreno"]} {...campo("tipo")} />
                </div>
                <hr className="my-2 text-gray-300"/>
                <h3 className="text-2xl font-semibold text-left mb-2 mt-2">Endereço</h3>
                <div className="flex items-left space-y-4 space-x-4 flex-cols-2 md:flex-cols-1">
                    <Input type="text" label="Estado" wid="150" select="true" selectOptions={["MS", "SP", "RJ", "MG"]} {...campo("estado")} />
                    <Input type="text" label="Cidade" wid="150" placeholder="Ex: Campo Grande" {...campo("cidade")} />
                    <Input type="text" label="Bairro" wid="150" placeholder="Ex: Centro" {...campo("bairro")} />
                </div>
                <hr className="my-2 text-gray-300"/>
                <h3 className="text-2xl font-semibold text-left mb-2 mt-2">Preço</h3>
                <div className="flex items-left space-y-4 space-x-4 flex-cols-2 md:flex-cols-1">
                    <Input type="number" label="Valor Mínimo" placeholder="R$ 1" wid="150" {...campo("valorMin")} />
                    <Input type="number" label="Valor Máximo" placeholder="R$ 1,000,000" wid="150" {...campo("valorMax")} />
                </div>
                <hr className="my-2 text-gray-300"/>
                <h3 className="text-2xl font-semibold text-left mb-2 mt-2">Cômodos (mínimo)</h3>
                <div className="flex items-left space-y-4 space-x-4 flex-cols-2 md:flex-cols-1">
                    <Input type="number" label="Quartos" wid="150" select="true" selectOptions={["1", "2", "3", "4", "5"]} {...campo("quartos")} />
                    <Input type="number" label="Banheiros" wid="150" select="true" selectOptions={["1", "2", "3", "4", "5"]} {...campo("banheiros")} />
                    <Input type="number" label="Vagas" wid="150" select="true" selectOptions={["1", "2", "3", "4", "5"]} {...campo("vagas")} />
                </div>
                <Button label="Aplicar Filtros" wid="full" className={"px-4 py-2 mt-2"} />
                <button type="button" onClick={() => { setF(FILTRO_VAZIO); onFilter?.(null); }}
                    className="mt-2 text-[#0f3e58] underline cursor-pointer">
                    Limpar filtros
                </button>
            </form>
        </section>
        </>
    )
}

export default FilterCard
