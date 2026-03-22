import type { BuildingLayout } from "./types";


// TO DELETE AND USE REAL CONNECTION

export const mockBuildingLayout: BuildingLayout = {
  floors: [
    {
      id: "floor-1",
      number: 1,
      name: "Parqués",
      route: "/parques",
      icon: "🎰",
      description: "Mesas de juego clásico colombiano Parqués",
      available: true,
      color: "#f472b6",
    },
    {
      id: "floor-2",
      number: 2,
      name: "Brisca",
      route: "/brisca",
      icon: "🎲",
      description: "Mesas de juego clásico colombiano de cartas Brisca",
      available: true,
      color: "#facc15",
    }
  ],
};
