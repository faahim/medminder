import { useState, useEffect, useCallback } from 'react';
import { MedicationService } from '../services/medication.service';
import { Medication } from '../types';
import { useDatabase } from '../contexts/DatabaseContext';

interface UseMedicationsReturn {
  medications: Medication[];
  archivedMedications: Medication[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useMedications(): UseMedicationsReturn {
  const { isReady } = useDatabase();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [archivedMedications, setArchivedMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMedications = useCallback(async () => {
    if (!isReady) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const active = await MedicationService.getAll();
      const archived = await MedicationService.getArchived();
      setMedications(active);
      setArchivedMedications(archived);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load medications'));
    } finally {
      setIsLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  return {
    medications,
    archivedMedications,
    isLoading,
    error,
    refresh: loadMedications,
  };
}
