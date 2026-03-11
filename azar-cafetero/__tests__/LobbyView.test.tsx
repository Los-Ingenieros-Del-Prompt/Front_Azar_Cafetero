/**
 * LobbyView — integration tests
 *
 * Covers:
 *   1. Lobby renders the 2 floors returned by the API
 *   2. Clicking Piso 1 navigates to /parques
 *   3. Clicking Piso 2 navigates to /brisca
 *   4. Navigation occurs in < 2 seconds (PBI timing criterion)
 */

import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LobbyView from "@/components/lobby/LobbyView";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

jest.mock("@/context/UserContext", () => ({
  useUserContext: () => ({ logout: jest.fn() }),
}));

jest.mock("@/components/lobby/PlayerHUD", () => ({
  __esModule: true,
  default: () => <div data-testid="player-hud" />,
}));

// DTOs returned by the real Lobby API endpoint
const FLOOR_DTOS = [
  { name: "Piso 1 (Parques)", icon: "🎲", route: "/parques" },
  { name: "Piso 2 (Brisca)", icon: "🃏", route: "/brisca" },
];

function mockFetchSuccess() {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => FLOOR_DTOS,
  } as Response);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function renderAndWaitForFloors() {
  render(<LobbyView />);
  // Wait until at least one real floor card appears
  await waitFor(() =>
    expect(screen.getByText(/Piso 1 \(Parques\)/i)).toBeInTheDocument()
  );
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Ensure LobbyView uses fetch (not the mock import fallback)
  process.env.NEXT_PUBLIC_LOBBY_URL = "http://localhost:8081/";
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_LOBBY_URL;
});

// ─── Test Suites ──────────────────────────────────────────────────────────────

describe("LobbyView", () => {
  describe("Rendering — los 2 pisos aparecen correctamente en la vista", () => {
    test("shows Piso 1 (Parques) card", async () => {
      mockFetchSuccess();
      await renderAndWaitForFloors();

      expect(screen.getByText(/Piso 1 \(Parques\)/i)).toBeInTheDocument();
    });

    test("shows Piso 2 (Brisca) card", async () => {
      mockFetchSuccess();
      await renderAndWaitForFloors();

      expect(screen.getByText(/Piso 2 \(Brisca\)/i)).toBeInTheDocument();
    });

    test("shows exactly 2 floor cards", async () => {
      mockFetchSuccess();
      await renderAndWaitForFloors();

      // Each active/inactive card has a "Jugar …" aria-label on the outer div
      const cards = screen.getAllByRole("button", { name: /^Jugar/i });
      expect(cards).toHaveLength(2);
    });

    test("falls back to mock data when fetch fails", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
      render(<LobbyView />);

      // Mock layout always contains Parqués and Brisca
      await waitFor(() => {
        const allText = document.body.textContent ?? "";
        expect(allText).toMatch(/Parqu/i);
        expect(allText).toMatch(/Brisca/i);
      });
    });
  });

  describe("Navegación — clic en piso navega a la ruta correcta", () => {
    test("clicking Piso 1 CTA navigates to /parques", async () => {
      mockFetchSuccess();
      const user = userEvent.setup();
      await renderAndWaitForFloors();

      const btn = screen.getByRole("button", { name: /Entrar a Piso 1/i });
      await user.click(btn);

      expect(mockPush).toHaveBeenCalledWith("/parques");
    });

    test("clicking Piso 2 CTA navigates to /brisca", async () => {
      mockFetchSuccess();
      const user = userEvent.setup();
      await renderAndWaitForFloors();

      // Activate the second card via the dot navigator before clicking its CTA
      const dots = screen.getAllByRole("tab");
      await user.click(dots[1]);

      const btn = screen.getByRole("button", { name: /Entrar a Piso 2/i });
      await user.click(btn);

      expect(mockPush).toHaveBeenCalledWith("/brisca");
    });
  });

  describe("Performance — navegación desde lobby en < 2 segundos (PBI)", () => {
    test("floors are visible within 2 000 ms of component mount", async () => {
      mockFetchSuccess();
      const start = performance.now();

      render(<LobbyView />);
      await waitFor(() =>
        expect(screen.getByText(/Piso 1 \(Parques\)/i)).toBeInTheDocument()
      );

      expect(performance.now() - start).toBeLessThan(2000);
    });

    test("navigation is triggered within 2 000 ms of a floor click", async () => {
      mockFetchSuccess();
      const user = userEvent.setup();
      await renderAndWaitForFloors();

      const start = performance.now();
      await user.click(screen.getByRole("button", { name: /Entrar a Piso 1/i }));
      const elapsed = performance.now() - start;

      expect(mockPush).toHaveBeenCalledWith("/parques");
      expect(elapsed).toBeLessThan(2000);
    });
  });
});
