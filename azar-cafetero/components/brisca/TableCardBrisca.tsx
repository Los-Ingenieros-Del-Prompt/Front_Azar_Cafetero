"use client";

import React from "react";
import MiniBriscaTable from "./MiniBriscaTable";
import { SuitIcon } from "./SuitIcon";
import { TableDTO } from "@/hooks/useGameWebSocket";

const SEAT_COLORS = {
  rojo: "#CE1126",
  azul: "#003893",
};

interface TableCardBriscaProps {
  table: TableDTO;
  palette: any;
  onEnter: (tableId: string) => void;
  isNew?: boolean;
}

export default function TableCardBrisca({ table, palette, onEnter, isNew }: TableCardBriscaProps) {
  const occupied = table.playerCount;
  const maxPlayers = table.maxPlayers || 4;
  const full = occupied >= maxPlayers;
  // Note: status is not in TableDTO yet, defaulting to 'esperando'
  const status: string = 'esperando'; 
  const friendly = table.requiredBet === 0;
  const cream = '#F6E9C3';
  const sk = palette.cafe;
  const format = maxPlayers === 2 ? '1 vs 1' : '2 vs 2';

  // Fake triunfo for the lobby preview since it's not in TableDTO
  const triunfo = ['oros', 'copas', 'espadas', 'bastos'][table.tableName.length % 4];

  const statusChip = (() => {
    if (status === 'jugando') return { bg: palette.rojo, text: '#fff', label: '● En juego' };
    if (full) return { bg: sk, text: cream, label: 'Llena' };
    return { bg: palette.verde, text: palette.deep, label: '● Esperando' };
  })();

  // Map TableDTO playerCount to seats for MiniBriscaTable
  const seats = Array.from({ length: maxPlayers }).map((_, i) => ({
    occupant: i < occupied ? "Jugador" : undefined,
    host: i === 0 && occupied > 0,
  }));

  return (
    <div style={{
      position: 'relative',
      borderRadius: 18,
      padding: '18px 18px 16px',
      background: cream,
      backgroundImage: `radial-gradient(ellipse at 50% 0%, #FAF1D6 0%, #EFDDAB 60%, #E2CC91 100%)`,
      boxShadow: `0 14px 28px rgba(0,0,0,.35), 0 2px 6px rgba(0,0,0,.18), inset 0 0 0 1.5px ${sk}cc, inset 0 0 0 2.5px ${cream}`,
      transition: 'transform .2s cubic-bezier(.2,.7,.3,1), box-shadow .2s',
      cursor: full || status === 'jugando' ? 'default' : 'pointer',
    }}
      onMouseEnter={(e) => {
        if (full || status === 'jugando') return;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 22px 40px rgba(0,0,0,.45), 0 4px 10px rgba(0,0,0,.22), 0 0 0 1px ${palette.amarillo}66, inset 0 0 0 1.5px ${sk}, inset 0 0 0 2.5px ${cream}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = `0 14px 28px rgba(0,0,0,.35), 0 2px 6px rgba(0,0,0,.18), inset 0 0 0 1.5px ${sk}cc, inset 0 0 0 2.5px ${cream}`;
      }}
      onClick={() => !full && status !== 'jugando' && onEnter(table.tableId)}
    >
      {/* paper grain */}
      <svg aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 18, opacity: 0.35, pointerEvents: 'none' }}>
        <defs>
          <pattern id={`tcb-grain-${table.tableId}`} width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.4" fill={sk} opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#tcb-grain-${table.tableId})`} />
      </svg>

      {/* Top: status + bet */}
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 4,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: statusChip.bg, color: statusChip.text,
          fontSize: 10, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
        }}>{statusChip.label}</span>
        {friendly ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: sk, opacity: 0.75, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Amistosa
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: sk, fontWeight: 700, fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 16 16">
              <ellipse cx="8" cy="8" rx="4.5" ry="6.5" fill={palette.amarillo} transform="rotate(-20 8 8)" />
              <path d="M 8 1.5 Q 5 8 8 14.5" stroke="rgba(0,0,0,.45)" strokeWidth="1" fill="none" transform="rotate(-20 8 8)" />
            </svg>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16 }}>{table.requiredBet}</span>
          </span>
        )}
      </div>

      {/* Main */}
      <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ flexShrink: 0 }}>
          <MiniBriscaTable seats={seats} triunfo={triunfo} palette={palette} size={130} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: 0, fontFamily: 'DM Serif Display, serif',
            fontSize: 22, lineHeight: 1.05, color: palette.deep, letterSpacing: '-.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }} title={table.tableName}>{table.tableName}</h3>

          <div style={{ fontSize: 11, color: sk, opacity: 0.7, fontWeight: 600, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 14, height: 14, borderRadius: 999,
              background: `linear-gradient(135deg, ${palette.amarillo}, ${palette.rojo})`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 800, color: '#fff',
            }}>{table.tableName.charAt(0).toUpperCase()}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>Sala de Brisca</span>
          </div>

          {/* Format + triunfo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{
              padding: '3px 8px', borderRadius: 999,
              background: palette.deep, color: cream,
              fontSize: 10, fontWeight: 800, letterSpacing: '.08em',
            }}>{format}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: sk }}>
              <svg width="14" height="14" viewBox="-7 -7 14 14"><SuitIcon suit={triunfo} palette={palette} scale={1.1} /></svg>
              <span style={{ textTransform: 'capitalize' }}>{triunfo}</span>
            </span>
          </div>

          {/* seat dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            {seats.map((s, i) => {
              const teamColor = seats.length === 2
                ? (i === 0 ? palette.rojo : palette.azul)
                : (i % 2 === 0 ? palette.rojo : palette.azul);
              return (
                <span key={i} style={{
                  width: 14, height: 14, borderRadius: 999,
                  background: s.occupant ? teamColor : 'transparent',
                  border: `1.5px ${s.occupant ? 'solid' : 'dashed'} ${s.occupant ? teamColor : sk + '66'}`,
                  transition: 'background .25s, border-color .25s',
                }} />
              );
            })}
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: sk }}>
              {occupied}/{maxPlayers}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); if (!full && status !== 'jugando') onEnter(table.tableId); }}
        disabled={full || status === 'jugando'}
        style={{
          all: 'unset',
          marginTop: 14, width: '100%', boxSizing: 'border-box',
          padding: '11px 14px',
          textAlign: 'center', borderRadius: 12,
          background: status === 'jugando' ? `${sk}22` : full ? `${sk}22` : palette.deep,
          color: status === 'jugando' || full ? sk : palette.cream,
          fontWeight: 700, fontSize: 13,
          cursor: full || status === 'jugando' ? 'not-allowed' : 'pointer',
          opacity: full || status === 'jugando' ? 0.7 : 1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
        {status === 'jugando' ? 'Mirar partida' : full ? 'Mesa llena' : 'Sentarse a jugar'}
        {!full && status !== 'jugando' && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 5 7 7-7 7" /><path d="M5 12h14" />
          </svg>
        )}
      </button>

      {isNew && (
        <span style={{
          position: 'absolute', top: -8, right: 16,
          background: palette.amarillo, color: palette.deep,
          fontSize: 10, fontWeight: 800, letterSpacing: '.1em',
          padding: '3px 8px', borderRadius: 999,
          textTransform: 'uppercase',
          boxShadow: `0 4px 12px ${palette.amarillo}66`,
        }}>Nueva</span>
      )}
    </div>
  );
}
