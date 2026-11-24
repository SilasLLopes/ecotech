"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ESTADO_INICIAL } from "../data/seed";
import { parseEstado, reduzir } from "./coleta";
import type { Acao, Estado } from "./types";

const CHAVE = "ecotech-mvp-v1";

// Último texto bruto lido/gravado e o estado correspondente. Enquanto o texto
// for o mesmo, getSnapshot devolve o mesmo objeto (React exige referência
// estável, senão entra em laço).
let brutoAtual: string | null = null;
let estadoAtual: Estado = ESTADO_INICIAL;
// Cópia em memória quando localStorage não está disponível (modo privado).
let reserva: string | null = null;
let storageIndisponivel = false;
const assinantes = new Set<() => void>();

function lerBruto(): string | null {
  if (typeof window === "undefined") return null;
  if (!storageIndisponivel) {
    try {
      return window.localStorage.getItem(CHAVE);
    } catch {
      storageIndisponivel = true;
    }
  }
  return reserva;
}

function gravarBruto(bruto: string | null): void {
  reserva = bruto;
  if (typeof window === "undefined" || storageIndisponivel) return;
  try {
    if (bruto === null) window.localStorage.removeItem(CHAVE);
    else window.localStorage.setItem(CHAVE, bruto);
  } catch {
    storageIndisponivel = true;
  }
}

function lerEstado(): Estado {
  const bruto = lerBruto();
  if (bruto !== brutoAtual) {
    brutoAtual = bruto;
    estadoAtual = parseEstado(bruto) ?? ESTADO_INICIAL;
  }
  return estadoAtual;
}

function notificar(): void {
  for (const assinante of [...assinantes]) assinante();
}

function subscribe(callback: () => void): () => void {
  assinantes.add(callback);
  const aoMudarStorage = (e: StorageEvent) => {
    // key === null: localStorage.clear() em outra aba.
    if (e.key === CHAVE || e.key === null) callback();
  };
  window.addEventListener("storage", aoMudarStorage);
  return () => {
    assinantes.delete(callback);
    window.removeEventListener("storage", aoMudarStorage);
  };
}

function getSnapshot(): Estado {
  return lerEstado();
}

function getServerSnapshot(): Estado {
  return ESTADO_INICIAL;
}

function despachar(acao: Acao): void {
  const atual = lerEstado();
  const proximo = reduzir(atual, acao);
  if (proximo === atual) return;
  const bruto = JSON.stringify(proximo);
  gravarBruto(bruto);
  brutoAtual = bruto;
  estadoAtual = proximo;
  notificar();
}

export function useEstado(): Estado {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useDispatch(): (acao: Acao) => void {
  return useCallback((acao: Acao) => despachar(acao), []);
}

// Volta ao seed e apaga o que foi gravado.
export function reiniciar(): void {
  gravarBruto(null);
  brutoAtual = null;
  estadoAtual = ESTADO_INICIAL;
  notificar();
}

// Só chamar em handlers de evento (nunca durante a renderização).
export function novoId(prefixo: string): string {
  return `${prefixo}-${crypto.randomUUID().slice(0, 8)}`;
}
