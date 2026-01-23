import { createContext, useContext, useState, ReactNode } from 'react';
import { MedicationFormData, MealTiming, ScheduleType } from '../types';

interface MedicationFormContextType {
  formData: MedicationFormData;
  updateFormData: (data: Partial<MedicationFormData>) => void;
  resetForm: () => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}

const defaultFormData: MedicationFormData = {
  name: '',
  dosage: '',
  dosageUnit: 'tablet',
  instructions: '',
  mealTiming: 'anytime',
  scheduleType: 'daily',
  scheduleTimes: ['08:00'],
  scheduleWeekdays: [],
  scheduleIntervalHours: 6,
  startDate: new Date(),
  endDate: null,
  hasEndDate: false,
  dependsOnMedicationId: null,
  dependsOnOffsetDays: 0,
  color: '#4CAF50',
};

const MedicationFormContext = createContext<MedicationFormContextType | null>(null);

export function MedicationFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<MedicationFormData>(defaultFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateFormData = (data: Partial<MedicationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <MedicationFormContext.Provider
      value={{
        formData,
        updateFormData,
        resetForm,
        isEditing,
        setIsEditing,
        editingId,
        setEditingId,
      }}
    >
      {children}
    </MedicationFormContext.Provider>
  );
}

export function useMedicationForm() {
  const context = useContext(MedicationFormContext);
  if (!context) {
    throw new Error('useMedicationForm must be used within MedicationFormProvider');
  }
  return context;
}
