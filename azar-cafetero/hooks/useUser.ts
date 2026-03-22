import { useUserContext } from "../context/UserContext";

/**
 * Hook conveniente que re-exporta el contexto de usuario.
 * Equivale a useUserContext() pero con nombre más corto.
 */
export function useUser() {
  return useUserContext();
}
