"use client";

import React from "react";
import MiniBoard from "./MiniBoard";
import { TableDTO } from "@/hooks/useGameWebSocket";

const SEAT_COLORS = ['#EA4335', '#FBBC05', '#34A853', '#4285F4'];

interface TableCardProps {
  table: TableDTO;
  palette: any;
  onEnter: (tableId: string) => void;
  isNew?: boolean;
}

export default function TableCard({ table, palette, onEnter, isNew }: TableCardProps) {
  const occupied = table.playerCount;
  const maxPlayers = table.maxPlayers || 4;
  const full = occupied >= maxPlayers;
  const friendly = table.requiredBet === 0;
  const cream = '#F6E9C3';
  const sk = palette.cafe;

  // Map TableDTO to seats for MiniBoard
  const seats = Array.from({ length: maxPlayers }).map((_, i) => ({
    occupant: i < occupied ? `Player ${i + 1}` : undefined,
    color: SEAT_COLORS[i % SEAT_COLORS.length],
    host: i === 0 && occupied > 0,
  }));

  const statusChip = full 
    ? { bg: sk, text: cream, label: 'Llena' }
    : { bg: palette.verde, text: palette.deep, label: '● Esperando' };

  return (
    <div style={{
      position: 'relative',
      borderRadius: 18,
      padding: '18px 18px 16px',
      background: cream,
      backgroundImage: `
        radial-gradient(ellipse at 50% 0%, #FAF1D6 0%, #EFDDAB 60%, #E2CC91 100%)
      `,
      boxShadow: `
        0 14px 28px rgba(0,0,0,.35),
        0 2px 6px rgba(0,0,0,.18),
        inset 0 0 0 1.5px ${sk}cc,
        inset 0 0 0 2.5px ${cream}
      `,
      transition: 'transform .2s cubic-bezier(.2,.7,.3,1), box-shadow .2s',
      cursor: full ? 'default' : 'pointer',
    }}
      onMouseEnter={(e) => {
        if (full) return;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `
          0 22px 40px rgba(0,0,0,.45),
          0 4px 10px rgba(0,0,0,.22),
          0 0 0 1px ${palette.amarillo}66,
          inset 0 0 0 1.5px ${sk},
          inset 0 0 0 2.5px ${cream}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = `
          0 14px 28px rgba(0,0,0,.35),
          0 2px 6px rgba(0,0,0,.18),
          inset 0 0 0 1.5px ${sk}cc,
          inset 0 0 0 2.5px ${cream}`;
      }}
      onClick={() => !full && onEnter(table.tableId)}
    >
      {/* paper grain */}
      <svg aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 18, opacity: .35, pointerEvents: 'none' }}>
        <defs>
          <pattern id={`tc-grain-${table.tableId}`} width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r=".4" fill={sk} opacity=".4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#tc-grain-${table.tableId})`} />
      </svg>

      {/* Top row: status + bet */}
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
          <span style={{ fontSize: 10, fontWeight: 700, color: sk, opacity: .75, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Amistosa
          </span>
        ) : (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: sk, fontWeight: 700, fontSize: 13,
          }}>
            <CoffeeBean color={palette.amarillo} />
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16 }}>{table.requiredBet}</span>
          </span>
        )}
      </div>

      {/* Main: board + meta */}
      <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ flexShrink: 0 }}>
          <MiniBoard seats={seats} palette={palette} size={130} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: 0, fontFamily: 'DM Serif Display, serif',
            fontSize: 22, lineHeight: 1.05, color: palette.deep,
            letterSpacing: '-.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }} title={table.tableName}>{table.tableName}</h3>
          <div style={{ fontSize: 11, color: sk, opacity: .7, fontWeight: 600, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
             <span style={{
                width: 14, height: 14, borderRadius: 999,
                background: `linear-gradient(135deg, ${palette.amarillo}, ${palette.rojo})`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 800, color: '#fff',
              }}>{table.tableName.charAt(0).toUpperCase()}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>Sala de Parqués</span>
          </div>

          {/* seat dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
            {seats.map((s, i) => (
              <span key={i} style={{
                width: 14, height: 14, borderRadius: 999,
                background: s.occupant ? s.color : 'transparent',
                border: `1.5px ${s.occupant ? 'solid' : 'dashed'} ${s.occupant ? s.color : sk}66`,
                transition: 'background .25s, border-color .25s',
              }} />
            ))}
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: sk }}>
              {occupied}/{maxPlayers}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: action */}
      <button
        onClick={(e) => { e.stopPropagation(); if (!full) onEnter(table.tableId); }}
        disabled={full}
        style={{
          all: 'unset',
          marginTop: 14, width: '100%', boxSizing: 'border-box',
          padding: '11px 14px',
          textAlign: 'center', borderRadius: 12,
          background: full ? `${sk}22` : palette.deep,
          color: full ? sk : palette.cream,
          fontWeight: 700, fontSize: 13,
          cursor: full ? 'not-allowed' : 'pointer',
          opacity: full ? .7 : 1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          position: 'relative',
        }}>
        {full ? 'Mesa llena' : 'Entrar a la mesa'}
        {!full && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

function CoffeeBean({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16">
      <ellipse cx="8" cy="8" rx="4.5" ry="6.5" fill={color} transform="rotate(-20 8 8)" />
      <path d="M 8 1.5 Q 5 8 8 14.5" stroke="rgba(0,0,0,.45)" strokeWidth="1" fill="none" transform="rotate(-20 8 8)" />
    </svg>
  );
}

export function CreateTableTile({ palette, onClick }: { palette: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        all: 'unset', cursor: 'pointer',
        borderRadius: 18,
        padding: '24px 18px',
        background: `linear-gradient(180deg, ${palette.deepSoft}aa, ${palette.deep}cc)`,
        border: `1.5px dashed ${palette.amarillo}77`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 14, minHeight: 280, textAlign: 'center',
        transition: 'background .2s, border-color .2s, transform .2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = palette.amarillo;
        e.currentTarget.style.background = `linear-gradient(180deg, ${palette.deepSoft}cc, ${palette.deep}ee)`;
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = palette.amarillo + '77';
        e.currentTarget.style.background = `linear-gradient(180deg, ${palette.deepSoft}aa, ${palette.deep}cc)`;
        e.currentTarget.style.transform = '';
      }}
    >
      <div style={{
        width: 64, height: 64, borderRadius: 999,
        background: palette.amarillo,
        color: palette.deep,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'DM Serif Display, serif', fontSize: 40,
        boxShadow: `0 10px 24px ${palette.amarillo}55`,
      }}>+</div>
      <div>
        <div style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: 24, color: palette.cream, lineHeight: 1.05,
        }}>Armar mi mesa</div>
        <div style={{
          fontSize: 12, color: palette.creamSoft, opacity: .7,
          marginTop: 6, fontWeight: 500,
        }}>
          Vos ponés el nombre y la apuesta. Los panas llegan solos.
        </div>
      </div>
    </button>
  );
}
