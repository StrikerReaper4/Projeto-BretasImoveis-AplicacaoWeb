import { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";
import { api, auth } from "../services/api";

/**
 * Tela única de acesso: login (usuário comum ou administrador), criação de conta e
 * entrada como visitante. O perfil NÃO é escolhido aqui: quem decide é o back-end,
 * pelo "role" que volta no token.
 */
function LoginPage(){
    const navigate = useNavigate();
    const [modo, setModo] = useState("login"); // "login" | "cadastro"
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    const cadastro = modo === "cadastro";

    const trocarModo = () => {
        setModo(cadastro ? "login" : "cadastro");
        setErro("");
    };

    const entrarComoVisitante = () => {
        auth.logout();
        navigate("/");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");
        setEnviando(true);
        try {
            const res = cadastro ? await api.registrar(nome, email, senha) : await api.login(email, senha);
            auth.save(res);
            navigate(res.role === "ADMIN" ? "/admin/logged" : "/");
        } catch (e) {
            if (!cadastro) setErro("E-mail ou senha inválidos.");
            else if (e.status === 409) setErro("Este e-mail já está cadastrado.");
            else if (e.status === 400) setErro("Verifique os dados: e-mail válido e senha com ao menos 6 caracteres.");
            else setErro("Não foi possível criar a conta. Tente novamente.");
        } finally {
            setEnviando(false);
        }
    };

    return(
        <>
            <main className="min-h-screen w-full flex justify-center items-center bg-gray-100 p-4">
                <form onSubmit={handleSubmit} className="w-96 max-w-full p-6 bg-white rounded-xl shadow-md" aria-labelledby="titulo-login">
                   <img src="/logo-nobg.png" alt="Logo Bretas Imóveis" className="h-25 mx-auto" />
                   <h1 id="titulo-login" className="text-2xl font-bold text-center text-[#0f3e58] mt-2">
                       {cadastro ? "Criar conta" : "Entrar"}
                   </h1>
                   <p className="text-center text-sm text-gray-700 mt-1">
                       {cadastro
                           ? "Crie sua conta para salvar imóveis favoritos."
                           : "Usuários e administradores entram com a mesma tela."}
                   </p>

                   {cadastro && (
                       <Input type="text" label="Nome" placeholder="Seu nome" className="mt-2" value={nome} setValue={setNome} required/>
                   )}
                   <Input type="email" label="E-mail" placeholder="voce@email.com" className="mt-2" value={email} setValue={setEmail} required/>
                   <Input type="password" label="Senha" placeholder={cadastro ? "Mínimo de 6 caracteres" : "Digite sua senha"} className="mt-2" value={senha} setValue={setSenha} required/>

                   {erro && <p role="alert" className="text-red-700 mt-2">{erro}</p>}

                   <Button label={enviando ? "Aguarde..." : cadastro ? "Criar conta" : "Entrar"} wid="full" className="p-2 mt-3" disabled={enviando}/>

                   <button type="button" onClick={trocarModo} className="w-full mt-3 text-[#0f3e58] underline cursor-pointer">
                       {cadastro ? "Já tenho conta: entrar" : "Não tem conta? Criar conta"}
                   </button>

                   <hr className="my-4 text-gray-300"/>

                   <button
                       type="button"
                       onClick={entrarComoVisitante}
                       className="w-full p-2 rounded-4xl border-2 border-[#0f3e58] text-[#0f3e58] text-lg font-semibold cursor-pointer hover:bg-[#0f3e58] hover:text-white transition"
                   >
                       Entrar como visitante
                   </button>
                </form>
            </main>
        </>
    )
}

export default LoginPage;
