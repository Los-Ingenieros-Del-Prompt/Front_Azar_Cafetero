import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlayerHUD from "@/components/lobby/PlayerHUD";

const mockPush = jest.fn();
const mockLogout = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

jest.mock("@/context/UserContext", () => ({
  useUserContext: () => ({ logout: mockLogout }),
}));

class MockEventSource {
  addEventListener = jest.fn();
  close = jest.fn();
  onerror: ((this: EventSource, ev: Event) => unknown) | null = null;
}

type Identity = { name: string; avatar: string };
type Balance = {
  userId: string;
  amount: number;
  canReceiveBonus: boolean;
  nextBonusAt: string | null;
};

function mockIdentityAndBalance(options: {
  identity: Identity;
  balances: Balance[];
  bonusAmount?: number;
}) {
  const { identity, balances, bonusAmount = 100 } = options;
  let balanceCall = 0;

  global.fetch = jest.fn().mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.endsWith("/api/player/identity")) {
      return {
        ok: true,
        json: async () => identity,
      } as Response;
    }

    if (url.endsWith("/player/balance")) {
      const current = balances[Math.min(balanceCall, balances.length - 1)];
      balanceCall++;
      return {
        ok: true,
        json: async () => current,
      } as Response;
    }

    if (url.endsWith("/player/bonus")) {
      return {
        ok: true,
        json: async () => ({ message: "ok", amount: bonusAmount, transactionId: "tx-1" }),
      } as Response;
    }

    return {
      ok: false,
      status: 404,
      json: async () => ({ error: "not-found" }),
    } as Response;
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_GATEWAY_URL = "http://localhost:8080";
  (global as typeof globalThis & { EventSource: typeof EventSource }).EventSource =
    MockEventSource as unknown as typeof EventSource;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_GATEWAY_URL;
});

describe("PlayerHUD", () => {
  test("shows player name, avatar and balance after loading", async () => {
    const avatarUrl = "https://cdn.example.com/avatar.jpg";
    mockIdentityAndBalance({
      identity: { name: "Ana Torres", avatar: avatarUrl },
      balances: [{ userId: "u1", amount: 750, canReceiveBonus: true, nextBonusAt: null }],
    });

    render(<PlayerHUD />);

    await waitFor(() => expect(screen.getByText("Ana Torres")).toBeInTheDocument());

    const hud = screen.getByRole("complementary", { name: /HUD del jugador/i });
    const img = screen.getByRole("img", { name: /Ana Torres/i });
    expect(img).toHaveAttribute("src", avatarUrl);
    expect(within(hud).getByText(/750/)).toBeInTheDocument();
  });

  test("renders zero balance with zero-balance style", async () => {
    mockIdentityAndBalance({
      identity: { name: "María Ruiz", avatar: "M" },
      balances: [{ userId: "u2", amount: 0, canReceiveBonus: true, nextBonusAt: null }],
    });

    render(<PlayerHUD />);

    const hud = await screen.findByRole("complementary", { name: /HUD del jugador/i });
    await waitFor(() => expect(within(hud).getByText("0")).toBeInTheDocument());
    const amount = within(hud).getByText("0");
    expect(amount).toHaveClass("hud-balance-amount", "is-zero");
  });

  test("shows claim CTA only when bonus is available", async () => {
    mockIdentityAndBalance({
      identity: { name: "Luis Peña", avatar: "L" },
      balances: [{ userId: "u3", amount: 500, canReceiveBonus: true, nextBonusAt: null }],
    });

    render(<PlayerHUD />);

    expect(await screen.findByRole("button", { name: /Reclamar bono diario/i })).toBeInTheDocument();
  });

  test("hides claim CTA and shows countdown when bonus is unavailable", async () => {
    mockIdentityAndBalance({
      identity: { name: "Luis Peña", avatar: "L" },
      balances: [
        {
          userId: "u3",
          amount: 500,
          canReceiveBonus: false,
          nextBonusAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        },
      ],
    });

    render(<PlayerHUD />);

    await waitFor(() => expect(screen.getByText("Luis Peña")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /Reclamar bono diario/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Próximo bono en/i)).toBeInTheDocument();
  });

  test("clicking claim bonus calls bonus endpoint and updates amount optimistically", async () => {
    const user = userEvent.setup();
    mockIdentityAndBalance({
      identity: { name: "María Ruiz", avatar: "M" },
      balances: [{ userId: "u2", amount: 0, canReceiveBonus: true, nextBonusAt: null }],
      bonusAmount: 100,
    });

    render(<PlayerHUD />);

    const cta = await screen.findByRole("button", { name: /Reclamar bono diario/i });
    await user.click(cta);

    await waitFor(() => {
      const hud = screen.getByRole("complementary", { name: /HUD del jugador/i });
      expect((global.fetch as jest.Mock).mock.calls.some((args) => String(args[0]).endsWith("/player/bonus"))).toBe(true);
      expect(within(hud).getByText(/100/)).toBeInTheDocument();
    });
  });
});
