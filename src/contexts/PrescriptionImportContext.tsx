import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import type { PrescriptionMedicationDraft } from '../services/prescriptionVision.service';

interface PrescriptionImportState {
  imageUri: string | null;
  drafts: PrescriptionMedicationDraft[];
  setImageUri: (uri: string | null) => void;
  setDrafts: (drafts: PrescriptionMedicationDraft[]) => void;
  reset: () => void;
}

const PrescriptionImportContext = createContext<PrescriptionImportState | null>(null);

export function PrescriptionImportProvider({ children }: { children: ReactNode }) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<PrescriptionMedicationDraft[]>([]);

  const value = useMemo(
    () => ({
      imageUri,
      drafts,
      setImageUri,
      setDrafts,
      reset: () => {
        setImageUri(null);
        setDrafts([]);
      },
    }),
    [imageUri, drafts]
  );

  return (
    <PrescriptionImportContext.Provider value={value}>
      {children}
    </PrescriptionImportContext.Provider>
  );
}

export function usePrescriptionImport() {
  const ctx = useContext(PrescriptionImportContext);
  if (!ctx) throw new Error('usePrescriptionImport must be used within PrescriptionImportProvider');
  return ctx;
}
