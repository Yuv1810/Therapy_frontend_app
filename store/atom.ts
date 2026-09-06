// src/store/atoms.ts
import { atom } from 'jotai';

export interface User {
  id: string;
  token: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // YYYY-MM-DD
  slot: string;  // e.g., "09:00 - 10:00"
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export interface Query {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  message: string;
  status: 'open' | 'answered';
  answer?: string;
}

// Jotai atoms do not need keys; they are identified by reference
export const authAtom = atom<User | null>(null);

export const appointmentsAtom = atom<Appointment[]>([
  { id: '1', clientId: 'c1', clientName: 'John Doe', date: '2026-05-18', slot: '10:00 - 11:00', status: 'pending' },
  { id: '2', clientId: 'c2', clientName: 'Jane Smith', date: '2026-05-18', slot: '11:00 - 12:00', status: 'approved' },
]);

export const queriesAtom = atom<Query[]>([
  { id: 'q1', clientId: 'c1', clientName: 'John Doe', subject: 'Anxiety Management', message: 'How do I handle sudden panic attacks between sessions?', status: 'open' }
]);