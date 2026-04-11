"use client";

import { useState, useEffect } from "react";
import { getProfileStatus, updateAvatar, updateUsername } from "@/lib/profileApi";

const AVATARS = [
  { id: 1, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" },
  { id: 2, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" },
  { id: 3, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sheba" },
  { id: 4, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Coco" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  /** balance actual del HUD para mostrarlo en el panel */
  balance: number | null;
}

export default function ProfilePanel({ open, onClose, onLogout, balance }: Props) {
  // ── datos del perfil ──────────────────────────────────────────
  const [avatarUrl, setAvatarUrl]   = useState("");
  const [username, setUsername]     = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  // ── modo ──────────────────────────────────────────────────────
  const [editing, setEditing]       = useState(false);
  const [draftAvatar, setDraftAvatar] = useState("");
  const [draftUsername, setDraftUsername] = useState("");

  // ── feedback ─────────────────────────────────────────────────
  const [saving, setSaving]         = useState(false);
  const [message, setMessage]       = useState("");
  const [msgType, setMsgType]       = useState<"success" | "error">("success");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Cargar perfil cuando el panel se abre
  useEffect(() => {
    if (!open) return;
    setEditing(false);
    setMessage("");
    setSuggestions([]);
    setLoadingProfile(true);
    getProfileStatus()
      .then((data) => {
        setAvatarUrl(data.avatarUrl  ?? "");
        setUsername(data.username    ?? "");
      })
      .catch(() => {/* silencioso — el HUD ya tiene identidad */})
      .finally(() => setLoadingProfile(false));
  }, [open]);

  // Inicializar drafts al entrar en modo edición
  function enterEdit() {
    setDraftAvatar(avatarUrl);
    setDraftUsername(username);
    setMessage("");
    setSuggestions([]);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setMessage("");
    setSuggestions([]);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setSuggestions([]);
    try {
      await updateAvatar(draftAvatar);
      const { status, data } = await updateUsername(draftUsername);

      if (status === 409) {
        setMessage("⚠️ " + data.message);
        setMsgType("error");
        setSuggestions(data.suggestions ?? []);
        setSaving(false);
        return;
      }
      if (status === 403) {
        setMessage(`⛔ Debes esperar ${data.daysUntilNextChange} días para cambiar el username`);
        setMsgType("error");
        setSaving(false);
        return;
      }

      // éxito
      setAvatarUrl(draftAvatar);
      setUsername(draftUsername);
      setMessage("✅ Perfil actualizado");
      setMsgType("success");
      setEditing(false);
    } catch {
      setMessage("❌ Error al guardar, intenta de nuevo");
      setMsgType("error");
    }
    setSaving(false);
  }

  return (
    <>
      <style>{`
        /* ── Overlay ── */
        .pp-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(3px);
          z-index: 200;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .pp-overlay.open {
          opacity: 1;
          pointer-events: all;
        }

        /* ── Drawer ── */
        .pp-drawer {
          position: fixed;
          top: 0;
          right: 0;
          height: 100%;
          width: 360px;
          max-width: 95vw;
          background: rgba(15, 20, 30, 0.92);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255,255,255,0.1);
          z-index: 201;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'DM Sans', sans-serif;
        }
        .pp-drawer.open {
          transform: translateX(0);
        }

        /* ── Header ── */
        .pp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        .pp-title {
          font-size: 0.78rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          font-weight: 400;
        }
        .pp-close {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
        }
        .pp-close:hover { background: rgba(255,255,255,0.15); color: #fff; }

        /* ── Body ── */
        .pp-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* ── Vista de perfil ── */
        .pp-identity {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0 0.5rem;
        }
        .pp-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          object-fit: cover;
        }
        .pp-avatar-fallback {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: rgba(255,255,255,0.7);
        }
        .pp-username {
          font-size: 1.15rem;
          font-weight: 600;
          color: #fff;
        }
        .pp-balance {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .pp-balance-val {
          color: #4ade80;
          font-weight: 500;
        }

        /* ── Acciones ── */
        .pp-actions {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .pp-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: none;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .pp-btn:active { transform: scale(0.98); }
        .pp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .pp-btn-edit {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .pp-btn-edit:hover { background: rgba(255,255,255,0.16); }

        .pp-btn-save {
          background: #166534;
          color: #fff;
        }
        .pp-btn-save:hover:not(:disabled) { background: #15803d; }

        .pp-btn-cancel {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .pp-btn-cancel:hover { background: rgba(255,255,255,0.1); }

        .pp-btn-logout {
          background: rgba(239, 68, 68, 0.12);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.2);
          margin-top: 0.4rem;
        }
        .pp-btn-logout:hover { background: rgba(239, 68, 68, 0.2); }

        /* ── Divider ── */
        .pp-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          flex-shrink: 0;
        }

        /* ── Modo edición ── */
        .pp-edit-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .pp-edit-label {
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 0.5rem;
        }

        /* Avatar grid compacto */
        .pp-avatar-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }
        .pp-avatar-option {
          aspect-ratio: 1;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.15s;
          background: rgba(255,255,255,0.06);
        }
        .pp-avatar-option:hover { transform: scale(1.06); }
        .pp-avatar-option.selected { border-color: #4ade80; }
        .pp-avatar-option img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Input username */
        .pp-input-wrap {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 0.6rem 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pp-input-wrap:focus-within {
          border-color: rgba(255,255,255,0.28);
        }
        .pp-input {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 0.88rem;
          font-family: 'DM Sans', sans-serif;
          width: 100%;
        }
        .pp-input::placeholder { color: rgba(255,255,255,0.3); }

        /* Mensaje feedback */
        .pp-msg {
          font-size: 0.78rem;
          text-align: center;
          padding: 0.4rem 0;
        }
        .pp-msg.success { color: #4ade80; }
        .pp-msg.error   { color: #f87171; }

        /* Sugerencias */
        .pp-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          justify-content: center;
        }
        .pp-suggestion-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          color: rgba(255,255,255,0.7);
          font-size: 0.75rem;
          padding: 0.25rem 0.7rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .pp-suggestion-btn:hover { background: rgba(255,255,255,0.15); }

        /* Skeleton */
        .pp-skeleton {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          padding: 1rem 0;
        }
        .pp-sk {
          border-radius: 100px;
          background: linear-gradient(90deg,
            rgba(255,255,255,0.05) 25%,
            rgba(255,255,255,0.1) 50%,
            rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: ppShimmer 1.3s infinite;
        }
        @keyframes ppShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Overlay */}
      <div
        className={`pp-overlay${open ? " open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`pp-drawer${open ? " open" : ""}`}
        role="dialog"
        aria-label="Panel de perfil"
        aria-modal="true"
      >
        {/* Header */}
        <div className="pp-header">
          <span className="pp-title">Mi perfil</span>
          <button className="pp-close" onClick={onClose} aria-label="Cerrar panel">✕</button>
        </div>

        {/* Body */}
        <div className="pp-body">

          {loadingProfile ? (
            <div className="pp-skeleton">
              <div className="pp-sk" style={{ width: 80, height: 80, borderRadius: "50%" }} />
              <div className="pp-sk" style={{ width: 120, height: 12 }} />
              <div className="pp-sk" style={{ width: 80, height: 10 }} />
            </div>
          ) : (
            <>
              {/* ── Vista de identidad ── */}
              <div className="pp-identity">
                {avatarUrl?.startsWith("http") ? (
                  <img src={avatarUrl} alt={username} className="pp-avatar" />
                ) : (
                  <div className="pp-avatar-fallback">
                    {username ? username.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                <span className="pp-username">{username || "Sin username"}</span>
                <span className="pp-balance">
                  🪙&nbsp;
                  <span className="pp-balance-val">
                    {balance !== null ? balance.toLocaleString("es-CO") : "—"}
                  </span>
                  &nbsp;fichas
                </span>
              </div>

              <div className="pp-divider" />

              {/* ── Modo visualización ── */}
              {!editing && (
                <div className="pp-actions">
                  {message && (
                    <p className={`pp-msg ${msgType}`}>{message}</p>
                  )}
                  <button className="pp-btn pp-btn-edit" onClick={enterEdit}>
                    ✏️ Editar perfil
                  </button>
                  <button className="pp-btn pp-btn-logout" onClick={onLogout}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}

              {/* ── Modo edición ── */}
              {editing && (
                <div className="pp-edit-section">
                  {/* Avatar grid */}
                  <div>
                    <p className="pp-edit-label">Avatar</p>
                    <div className="pp-avatar-grid">
                      {AVATARS.map((av) => (
                        <div
                          key={av.id}
                          className={`pp-avatar-option${draftAvatar === av.url ? " selected" : ""}`}
                          onClick={() => setDraftAvatar(av.url)}
                          role="button"
                          aria-label={`Avatar ${av.id}`}
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && setDraftAvatar(av.url)}
                        >
                          <img src={av.url} alt={`Avatar ${av.id}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <p className="pp-edit-label">Username</p>
                    <div className="pp-input-wrap">
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>@</span>
                      <input
                        className="pp-input"
                        type="text"
                        placeholder="Tu username"
                        value={draftUsername}
                        onChange={(e) => setDraftUsername(e.target.value)}
                        maxLength={20}
                      />
                    </div>
                  </div>

                  {/* Feedback */}
                  {message && (
                    <p className={`pp-msg ${msgType}`}>{message}</p>
                  )}

                  {/* Sugerencias */}
                  {suggestions.length > 0 && (
                    <div className="pp-suggestions">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          className="pp-suggestion-btn"
                          onClick={() => setDraftUsername(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Botones edición */}
                  <div className="pp-actions">
                    <button
                      className="pp-btn pp-btn-save"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Guardando..." : "💾 Guardar cambios"}
                    </button>
                    <button
                      className="pp-btn pp-btn-cancel"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}