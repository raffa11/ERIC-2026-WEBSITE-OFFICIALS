import { RICSubmission } from '../types';
import { RIC_LS_KEY } from '../data';

function safeGet(): RICSubmission[] {
  try {
    const raw = localStorage.getItem(RIC_LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function safeSet(list: RICSubmission[]): void {
  try {
    localStorage.setItem(RIC_LS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('RIC localStorage quota exceeded.', err);
  }
}

export async function ricFetchLocal(email?: string): Promise<RICSubmission[]> {
  const all = safeGet();
  if (!email) return all;
  return all.filter(s => s.leaderEmail.toLowerCase() === email.toLowerCase());
}

export async function ricUpsertLocal(submission: RICSubmission): Promise<void> {
  const list = safeGet();
  const idx = list.findIndex(s => s.id === submission.id);
  if (idx >= 0) list[idx] = submission;
  else list.push(submission);
  safeSet(list);
}

export async function ricDeleteLocal(id: string): Promise<void> {
  safeSet(safeGet().filter(s => s.id !== id));
}

export async function ricFetchAllLocal(): Promise<RICSubmission[]> {
  return safeGet();
}
