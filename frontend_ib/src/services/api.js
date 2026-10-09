const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const FOTOS_PADRAO = ["/placeholder_house.jpg", "/placeholder_house_2.jpg", "/placeholder_house_3.png"];

export const auth = {
  get token() { return localStorage.getItem("token"); },
  get role() { return localStorage.getItem("role"); },
  get nome() { return localStorage.getItem("nome"); },
  isAdmin() { return Boolean(this.token) && this.role === "ADMIN"; },
  /** Usuário comum logado: pode favoritar. */
  isUser() { return Boolean(this.token) && this.role === "USER"; },
  save({ token, role, nome }) {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("nome", nome);
  },
  logout() { ["token", "role", "nome"].forEach((k) => localStorage.removeItem(k)); },
};

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: body && JSON.stringify(body) });
  if (!res.ok) {
    // Token expirado ou inválido: encerra a sessão local para o usuário logar de novo.
    if (res.status === 401 && auth.token && !path.startsWith("/auth")) auth.logout();
    const erro = await res.json().catch(() => ({}));
    const falha = new Error(erro.message || erro.erro || `Erro ${res.status}`);
    falha.status = res.status;
    throw falha;
  }
  return res.status === 204 ? null : res.json();
}

/** Converte o JSON do backend (português) para o formato que os componentes já usavam. */
export function toFront(i) {
  return {
    id: i.id,
    type: i.tipo,
    operation: i.situacao,
    img: i.imagens?.length ? i.imagens : FOTOS_PADRAO,
    address: i.numero ? `${i.rua}, ${i.numero}` : i.rua,
    neighborhood: i.bairro,
    city: i.cidade,
    state: i.estado,
    area: i.area,
    items: { quartos: i.quartos, banheiros: i.banheiros, vagas: i.vagas },
    price: i.valor,
    description: i.descricao,
  };
}

/** Caminho inverso: formulário do admin -> entidade Imovel. */
export function toBack(p) {
  const [rua, numero] = (p.address || "").split(/,\s*(?=[^,]*$)/);
  const imagens = Array.isArray(p.img) ? p.img : String(p.img || "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    tipo: p.type,
    situacao: p.operation,
    rua,
    numero: numero || null,
    bairro: p.neighborhood,
    cidade: p.city,
    estado: p.state,
    area: Number(p.area),
    quartos: Number(p.items.quartos) || 0,
    banheiros: Number(p.items.banheiros) || 0,
    vagas: Number(p.items.vagas) || 0,
    valor: Number(p.price),
    descricao: p.description,
    imagens,
  };
}

export const api = {
  login: (email, senha) => request("/auth/login", { method: "POST", body: { email, senha } }),
  registrar: (nome, email, senha) => request("/auth/register", { method: "POST", body: { nome, email, senha } }),
  listarImoveis: () => request("/imoveis").then((l) => l.map(toFront)),
  buscarImovel: (id) => request(`/imoveis/${id}`).then(toFront),
  filtrarImoveis: (filtro) => request("/imoveis/filtro", { method: "POST", body: filtro }).then((l) => l.map(toFront)),
  criarImovel: (p) => request("/imoveis", { method: "POST", body: toBack(p) }),
  atualizarImovel: (id, p) => request(`/imoveis/${id}`, { method: "PUT", body: toBack(p) }),
  deletarImovel: (id) => request(`/imoveis/${id}`, { method: "DELETE" }),
  listarFavoritos: () => request("/favoritos").then((l) => l.map(toFront)),
  favoritar: (id) => request(`/favoritos/${id}`, { method: "POST" }),
  desfavoritar: (id) => request(`/favoritos/${id}`, { method: "DELETE" }),
};
