/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Draft persistence for registration form.
 * Saves partial form progress to localStorage per division.
 * Restores automatically when user re-opens the modal for the same division.
 */

export interface RegistrationDraft {
  wizardStep: number;
  selectedDivision: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderWhatsapp: string;
  leaderInstitution: string;
  leaderIdCardName: string;
  leaderIdCardUrl: string;
  leaderTwibbonName: string;
  leaderTwibbonUrl: string;
  leaderAddress: string;
  leaderCongenitalDisease: string;
  members: { id: string; name: string; whatsapp: string; congenitalDisease: string; idCardName: string; idCardUrl: string; twibbonName: string; twibbonUrl: string }[];
  subCategory: string;
  level: string;
  lecturerName: string;
  lecturerEmail: string;
  lecturerWhatsapp: string;
  lecturerIdCardName: string;
  lecturerIdCardUrl: string;
  lecturerTwibbonName: string;
  lecturerTwibbonUrl: string;
  lecturerCongenitalDisease: string;
  paymentMethod: string;
  selectedBank: string;
  paymentProofName: string;
  paymentProofUrl: string;
}

function getDraftKey(divisionId: string): string {
  return `eric_reg_draft_${divisionId}`;
}

export function saveDraft(divisionId: string, data: Partial<RegistrationDraft>): void {
  try {
    const key = getDraftKey(divisionId);
    const existing = loadDraftRaw(divisionId) || {};
    const merged = { ...existing, ...data, _updatedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(merged));
  } catch {
    console.warn('Failed to save draft (quota or storage error).');
  }
}

function loadDraftRaw(divisionId: string): Record<string, any> | null {
  try {
    const key = getDraftKey(divisionId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Expire draft after 24 hours
    if (parsed._updatedAt && Date.now() - parsed._updatedAt > 24 * 60 * 60 * 1000) {
      clearDraft(divisionId);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function loadDraft(divisionId: string): RegistrationDraft | null {
  const raw = loadDraftRaw(divisionId);
  if (!raw) return null;
  const { _updatedAt, ...draft } = raw;
  return draft as RegistrationDraft;
}

export function clearDraft(divisionId: string): void {
  try {
    localStorage.removeItem(getDraftKey(divisionId));
  } catch {
    // ignore
  }
}
