/**
 * PlayerHUD + usePlayerHUD — integration tests
 *
 * Covers:
 *   1. Avatar and balance visible within 1 second of mount (PBI criterion)
 *   2. Balance updates in real time on visibilitychange (no page reload)
 *   3. Zero-balance CTA banner appears with correct button
 */

import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlayerHUD from "@/components/lobby/PlayerHUD";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

// Mock getToken so authHeaders() returns a header
jest.mock("@/lib/auth", () => ({
  getToken: () => "mock-jwt-token",
}));

// ─── Fetch helpers ────────────────────────────────────────────────────────────

function mockIdentityFetch(identity: { name: string; avatar: string; balance: number }) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => identity,
  } as Response);
}

function mockIdentityThenBalance(
  identity: { name: string; avatar: string; balance: number },
  refreshedBalance: number
) {
  let callCount = 0;
  global.fetch = jest.fn().mockImplementation(() => {
    callCount++;
    const balance = callCount === 1 ? identity.balance : refreshedBalance;
    return Promise.resolve({
      ok: true,
      json: async () => ({ ...identity, balance }),
    } as Response);
  });
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_LOBBY_URL = "http://localhost:8081/";
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_LOBBY_URL;
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PlayerHUD", () => {
  describe("Rendering — avatar y saldo visibles al entrar al lobby", () => {
    test("shows player name after loading", async () => {
      mockIdentityFetch({ name: "Ana Torres", avatar: "https://cdn.example.com/avatar.jpg", balance: 500 });

      render(<PlayerHUD />);

      await waitFor(() =>
        expect(screen.getByText("Ana Torres")).toBeInTheDocument()
      );
    });

    test("shows avatar image when avatar is a URL", async () => {
      const avatarUrl = "https://cdn.example.com/avatar.jpg";
      mockIdentityFetch({ name: "Ana Torres", avatar: avatarUrl, balance: 500 });

      render(<PlayerHUD />);

      await waitFor(() => {
        const img = screen.getByRole("img", { name: /Ana Torres/i });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", avatarUrl);
      });
    });

    test("shows balance amount after loading", async () => {
      mockIdentityFetch({ name: "Ana Torres", avatar: "https://cdn.example.com/avatar.jpg", balance: 750 });

      render(<PlayerHUD />);

      await waitFor(() =>
        expect(screen.getByText(/750/)).toBeInTheDocument()
      );
    });

    test("avatar and balance are visible within 1 second of mount (PBI criterion)", async () => {
      mockIdentityFetch({ name: "Carlos López", avatar: "https://cdn.example.com/avatar2.jpg", balance: 320 });

      const start = performance.now();
      render(<PlayerHUD />);

      await waitFor(() =>
        expect(screen.getByText("Carlos López")).toBeInTheDocument()
      );

      expect(performance.now() - start).toBeLessThan(1000);
    });
  });

  describe("Balance en tiempo real — actualización al regresar de partida", () => {
    test("balance updates when tab becomes visible again (visibilitychange)", async () => {
      mockIdentityThenBalance(
        { name: "Luis Peña", avatar: "https://cdn.example.com/av.jpg", balance: 500 },
        320 // balance after game
      );

      render(<PlayerHUD />);

      // Wait for initial load
      await waitFor(() => expect(screen.getByText(/500/)).toBeInTheDocument());

      // Simulate returning from a game tab
      await act(async () => {
        Object.defineProperty(document, "visibilityState", {
          value: "visible",
          writable: true,
          configurable: true,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });

      // Balance should update without page reload
      await waitFor(() => expect(screen.getByText(/320/)).toBeInTheDocument());
      expect(screen.queryByText(/500/)).not.toBeInTheDocument();
    });

    test("balance does NOT update when tab becomes hidden", async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ name: "Luis Peña", avatar: "https://x.com/a.jpg", balance: 500 }),
      } as Response);
      global.fetch = fetchMock;

      render(<PlayerHUD />);
      await waitFor(() => expect(screen.getByText(/500/)).toBeInTheDocument());

      const callsAfterInit = fetchMock.mock.calls.length;

      await act(async () => {
        Object.defineProperty(document, "visibilityState", {
          value: "hidden",
          writable: true,
          configurable: true,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });

      // No additional fetch should have been made
      expect(fetchMock.mock.calls.length).toBe(callsAfterInit);
    });
  });

  describe("Aviso de saldo en 0 — CTA aparece correctamente", () => {
    test("shows zero-balance warning banner when balance is 0", async () => {
      mockIdentityFetch({ name: "María Ruiz", avatar: "https://cdn.example.com/av.jpg", balance: 0 });

      render(<PlayerHUD />);

      await waitFor(() =>
        expect(screen.getByRole("alert")).toBeInTheDocument()
      );
    });

    test("zero-balance banner contains a claim CTA button", async () => {
      mockIdentityFetch({ name: "María Ruiz", avatar: "https://cdn.example.com/av.jpg", balance: 0 });

      render(<PlayerHUD />);

      await waitFor(() => {
        const cta = screen.getByRole("button", { name: /Reclamar/i });
        expect(cta).toBeInTheDocument();
      });
    });

    test("clicking the claim CTA calls onClaimDaily callback", async () => {
      mockIdentityFetch({ name: "María Ruiz", avatar: "https://cdn.example.com/av.jpg", balance: 0 });
      const onClaimDaily = jest.fn();
      const user = userEvent.setup();

      render(<PlayerHUD onClaimDaily={onClaimDaily} />);

      await waitFor(() => screen.getByRole("button", { name: /Reclamar/i }));
      await user.click(screen.getByRole("button", { name: /Reclamar/i }));

      expect(onClaimDaily).toHaveBeenCalledTimes(1);
    });

    test("does NOT show zero-balance banner when balance is positive", async () => {
      mockIdentityFetch({ name: "María Ruiz", avatar: "https://cdn.example.com/av.jpg", balance: 500 });

      render(<PlayerHUD />);

      await waitFor(() => expect(screen.getByText("María Ruiz")).toBeInTheDocument());
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
