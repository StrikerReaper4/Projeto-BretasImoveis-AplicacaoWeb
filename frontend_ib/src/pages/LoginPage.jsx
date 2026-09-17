import { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";
import { api, auth } from "../services/api";

function LoginPage(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");
        try {
            const res = await api.login(email, senha);
            if (res.role !== "ADMIN") {
                setErro("Acesso restrito a administradores.");
                return;
            }
            auth.save(res);
            navigate("/admin/logged");
        } catch {
            setErro("E-mail ou senha inválidos.");
        }
    };

    return(
        <>
            <main className="w-screen h-screen flex justify-center items-center bg-gray-100">
                <form onSubmit={handleSubmit} className="w-96 p-6 bg-white rounded-xl shadow-md" aria-labelledby="titulo-login">
                   <img src="/logo-nobg.png" alt="Logo Bretas Imóveis" className="h-25 mx-auto" />
                   <h1 id="titulo-login" className="sr-only">Login do administrador</h1>
                   <Input type="email" label="E-mail" placeholder="admin@bretas.com" className="mt-2" value={email} setValue={setEmail} required/>
                   <Input type="password" label="Senha" placeholder="Digite sua senha" className="mt-2" value={senha} setValue={setSenha} required/>
                   {erro && <p role="alert" className="text-red-700 mt-2">{erro}</p>}
                   <Button label="Entrar" wid="full" className="p-2 mt-3"/>
                </form>
            </main>
        </>
    )
}

export default LoginPage;
