"use client";

import React from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";
import { saveToken } from "@/lib/auth";

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://azar-cafetero.duckdns.org";

const PALETTE = {
  deep: "#0E1610",
  deepSoft: "#1A241C",
  cream: "#F7EFD9",
  creamSoft: "#E5D8B5",
  amarillo: "#FCD116",
  azul: "#003893",
  rojo: "#CE1126",
  verde: "#27A86A",
  verdeLeaf: "#1B7A4C",
  cafe: "#6B4423",
};

interface GoogleGProps {
  // no props needed
}

function GoogleG() {
  return (
    <span
      style={{
        width: 24,
        height: 24,
        borderRadius: 999,
        background: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.83Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
        />
      </svg>
    </span>
  );
}

interface LoginCardProps {
  onError: (msg: string) => void;
  onLoadingChange: (loading: boolean) => void;
  isLoading?: boolean;
}

export default function LoginCard({ onError, onLoadingChange, isLoading }: LoginCardProps) {
  const router = useRouter();
  const { login } = useUserContext();
  const sk = PALETTE.cafe;

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      onError("No se recibió credencial de Google.");
      return;
    }

    onLoadingChange(true);
    onError("");

    try {
      const res = await fetch(`${GATEWAY}/auth/google`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error(`Error de autenticación: ${res.status}`);

      const data = await res.json();
      
      login({ name: data.name, avatarUrl: data.avatarUrl, userId: data.userId });
      saveToken(data.token);

      router.replace("/lobby");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al autenticar";
      onError(message);
      onLoadingChange(false);
    }
  };

  const handleLoginError = () => {
    onError("Autorización cancelada o denegada por Google.");
    onLoadingChange(false);
  };

  return (
    <div
      style={{
        position: "relative",
        width: 460,
        animation: "card-enter .9s .15s cubic-bezier(.2,.7,.3,1) backwards",
      }}
    >
      {/* card surface */}
      <div
        style={{
          position: "relative",
          background: "#F6E9C3",
          backgroundImage: `
          radial-gradient(ellipse at 50% 0%, #FAF1D6 0%, #F0DEA5 60%, #E5D094 100%)
        `,
          borderRadius: 18,
          padding: "36px 44px 32px",
          boxShadow: "0 30px 60px rgba(0,0,0,.5), 0 8px 16px rgba(0,0,0,.25)",
        }}
      >
        {/* paper grain overlay */}
        <svg
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            borderRadius: 18,
            opacity: 0.35,
            pointerEvents: "none",
          }}
        >
          <defs>
            <pattern
              id="login-grain"
              width="3"
              height="3"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1.5" cy="1.5" r=".4" fill={sk} opacity=".4" />
              <circle cx=".5" cy="2.5" r=".3" fill={sk} opacity=".2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grain)" />
        </svg>

        {/* ornate frame */}
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: 12,
            border: `2px solid ${sk}`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 15,
            borderRadius: 8,
            border: `1px solid ${sk}`,
            opacity: 0.55,
            pointerEvents: "none",
          }}
        />

        {/* corner flourishes */}
        <svg
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {/* top-left */}
          <g transform="translate(20, 20)" stroke={sk} fill="none" strokeWidth="1.2">
            <path d="M 0 0 Q 18 0 22 10 Q 26 20 36 22" />
            <path d="M 5 5 Q 16 5 20 14" opacity=".6" />
            <circle cx="36" cy="22" r="2" fill={sk} />
            <circle cx="2" cy="2" r="1.6" fill={sk} />
          </g>
          {/* top-right */}
          <g transform="translate(440, 20) scale(-1, 1)" stroke={sk} fill="none" strokeWidth="1.2">
            <path d="M 0 0 Q 18 0 22 10 Q 26 20 36 22" />
            <path d="M 5 5 Q 16 5 20 14" opacity=".6" />
            <circle cx="36" cy="22" r="2" fill={sk} />
            <circle cx="2" cy="2" r="1.6" fill={sk} />
          </g>
          {/* bottom-left */}
          <g style={{ transform: 'translate(20px, calc(100% - 20px)) scale(1, -1)' }} stroke={sk} fill="none" strokeWidth="1.2">
            <path d="M 0 0 Q 18 0 22 10 Q 26 20 36 22" />
            <path d="M 5 5 Q 16 5 20 14" opacity=".6" />
            <circle cx="36" cy="22" r="2" fill={sk} />
            <circle cx="2" cy="2" r="1.6" fill={sk} />
          </g>
          {/* bottom-right */}
          <g style={{ transform: 'translate(440px, calc(100% - 20px)) scale(-1, -1)' }} stroke={sk} fill="none" strokeWidth="1.2">
            <path d="M 0 0 Q 18 0 22 10 Q 26 20 36 22" />
            <path d="M 5 5 Q 16 5 20 14" opacity=".6" />
            <circle cx="36" cy="22" r="2" fill={sk} />
            <circle cx="2" cy="2" r="1.6" fill={sk} />
          </g>
        </svg>

        {/* Tricolor seal at the top center */}
        <div
          style={{
            position: "absolute",
            top: -16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 0,
            padding: 0,
            borderRadius: 999,
            overflow: "hidden",
            border: `2px solid ${sk}`,
            background: sk,
          }}
        >
          <span style={{ width: 22, height: 6, background: PALETTE.amarillo }} />
          <span style={{ width: 22, height: 6, background: PALETTE.azul }} />
          <span style={{ width: 22, height: 6, background: PALETTE.rojo }} />
        </div>

        {/* Content */}
        <div style={{ position: "relative", textAlign: "center", paddingTop: 14 }}>
          {/* Logo */}
          <div
            style={{
              margin: "0 auto 18px",
              width: 110,
              height: 92,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/images/logo.png"
              alt="Azar Cafetero"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 6px 8px rgba(61,40,23,.25))",
              }}
            />
          </div>

          {/* Wordmark */}
          <div style={{ marginBottom: 4 }}>
            <div
              style={{
                fontFamily: "DM Serif Display, serif",
                fontSize: 34,
                lineHeight: 1,
                color: PALETTE.deep,
                letterSpacing: "-.01em",
              }}
            >
              Azar <em style={{ fontStyle: "italic", color: sk }}>Cafetero</em>
            </div>
          </div>

          {/* Eyebrow */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: sk,
              opacity: 0.7,
              marginTop: 12,
              marginBottom: 22,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ width: 18, height: 1, background: sk, opacity: 0.5 }} />
            Bienvenido a la mesa
            <span style={{ width: 18, height: 1, background: sk, opacity: 0.5 }} />
          </div>

          {/* Greeting */}
          <h1
            style={{
              margin: 0,
              fontFamily: "DM Serif Display, serif",
              fontSize: 26,
              lineHeight: 1.15,
              color: PALETTE.deep,
              letterSpacing: "-.01em",
            }}
          >
            ¡Qué chimba tenerte por acá!
          </h1>
          <p
            style={{
              margin: "10px auto 26px",
              maxWidth: 320,
              fontSize: 14,
              lineHeight: 1.5,
              color: sk,
              fontWeight: 500,
            }}
          >
            ¿Listo pa&apos; que la suerte te guiñe un ojo?
          </p>

          {/* Google login component */}
          <div style={{ 
            width: "100%", 
            display: "flex", 
            justifyContent: "center",
            opacity: isLoading ? 0.6 : 1,
            pointerEvents: isLoading ? "none" : "auto",
            marginTop: 8
          }}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleLoginError}
              text="continue_with"
              shape="rectangular"
              theme="outline"
              size="large"
              width="320"
            />
          </div>

          {/* Terms */}
          <p
            style={{
              margin: "22px auto 0",
              fontSize: 12,
              lineHeight: 1.5,
              color: sk,
              opacity: 0.85,
            }}
          >
            Al continuar aceptas nuestros
            <br />
            <a
              style={{
                color: PALETTE.verdeLeaf,
                fontWeight: 700,
                textDecoration: "none",
                borderBottom: `1px solid ${PALETTE.verdeLeaf}55`,
                paddingBottom: 1,
                cursor: "pointer",
              }}
            >
              términos y condiciones
            </a>
          </p>
        </div>
      </div>

      {/* Whisper hint below card */}
      <div
        style={{
          textAlign: "center",
          marginTop: 18,
          fontSize: 11,
          color: PALETTE.creamSoft,
          opacity: 0.55,
          letterSpacing: ".1em",
          textTransform: "uppercase",
        }}
      >
        Solo cafeteros invitados · Más opciones de ingreso pronto
      </div>
    </div>
  );
}
