import { useCallback, useEffect, useState } from "react";
import { api, auth } from "../services/api";

/**
 * Favoritos do usuário comum logado.
 * - ativo: true só para ROLE_USER (visitante e admin não favoritam)
 * - ids: Set com os ids dos imóveis favoritados
 * - alternar(id): favorita ou desfavorita no back-end e atualiza a tela
 */
export function useFavoritos() {
  const ativo = auth.isUser();
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    if (!ativo) return;
    api.listarFavoritos()
      .then((lista) => setIds(new Set(lista.map((p) => p.id))))
      .catch(() => setIds(new Set()));
  }, [ativo]);

  const alternar = useCallback(async (id) => {
    const eraFavorito = ids.has(id);
    try {
      if (eraFavorito) await api.desfavoritar(id);
      else await api.favoritar(id);
      setIds((atual) => {
        const novo = new Set(atual);
        if (eraFavorito) novo.delete(id);
        else novo.add(id);
        return novo;
      });
      return !eraFavorito;
    } catch (e) {
      alert(e.status === 401 ? "Sua sessão expirou. Entre novamente." : `Erro: ${e.message}`);
      return eraFavorito;
    }
  }, [ids]);

  return { ativo, ids, alternar };
}
