import Constants from 'expo-constants';
import { MedicationFormData, MealTiming, ScheduleType } from '../types';
import { OpenAIKeyService } from './openaiKey.service';

export type PrescriptionMedicationDraft = MedicationFormData & {
  // Optional helper to represent sequential protocols.
  dependsOnMedicationName?: string | null;
};

async function getOpenAIApiKey(): Promise<string> {
  // 1) Preferred: user-provided key (stored locally)
  const stored = await OpenAIKeyService.get();
  if (stored) return stored;

  // 2) Fallback: app config extra (EAS/ENV)
  const key = (Constants.expoConfig as any)?.extra?.openaiApiKey as string | undefined;
  if (key) return key;

  throw new Error(
    'Missing OpenAI API key. Add it in Settings → OpenAI API Key (recommended), or configure expo.extra.openaiApiKey for builds.'
  );
}

const DEFAULT_TIMES = {
  morning: '08:00',
  afternoon: '13:00',
  evening: '18:00',
  night: '22:00',
} as const;

export const PrescriptionVisionService = {
  /**
   * Extract medications from a prescription image.
   *
   * IMPORTANT: This is a temporary direct-to-OpenAI call. We'll replace with a backend proxy.
   */
  async extractFromImageBase64(params: {
    base64: string;
    mimeType?: string;
    localeHint?: string;
    startDateISO?: string; // default: today
  }): Promise<PrescriptionMedicationDraft[]> {
    const apiKey = await getOpenAIApiKey();
    const { base64, mimeType = 'image/jpeg', localeHint = 'bn-BD', startDateISO } = params;

    const todayISO = startDateISO ?? new Date().toISOString().slice(0, 10);

    const schema = {
      name: 'prescription_extract',
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          medications: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string' },
                dosage: { type: 'string' },
                dosageUnit: { type: 'string' },
                instructions: { type: 'string' },
                mealTiming: { type: 'string', enum: ['before', 'after', 'with', 'anytime'] },
                scheduleType: { type: 'string', enum: ['daily', 'weekly', 'interval', 'as-needed'] },
                // Must be explicit HH:MM times.
                scheduleTimes: {
                  type: 'array',
                  items: { type: 'string' },
                },
                scheduleWeekdays: {
                  type: 'array',
                  items: { type: 'integer' },
                },
                scheduleIntervalHours: { type: 'number' },
                startDateISO: { type: 'string' },
                endDateISO: { anyOf: [{ type: 'string' }, { type: 'null' }] },
                hasEndDate: { type: 'boolean' },
                dependsOnMedicationName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
                dependsOnOffsetDays: { type: 'number' },
              },
              required: [
                'name',
                'dosage',
                'dosageUnit',
                'instructions',
                'mealTiming',
                'scheduleType',
                'scheduleTimes',
                'scheduleWeekdays',
                'scheduleIntervalHours',
                'startDateISO',
                'endDateISO',
                'hasEndDate',
                'dependsOnMedicationName',
                'dependsOnOffsetDays',
              ],
            },
          },
        },
        required: ['medications'],
      },
      strict: true,
    };

    const prompt = `You are extracting structured medication instructions from a prescription image.

Return JSON ONLY that matches the provided JSON schema.

Rules:
- Extract each listed medicine as one item.
- If the prescription uses patterns like "1+0+1" or "0+1+0", map them to explicit times using:
  morning=${DEFAULT_TIMES.morning}, afternoon=${DEFAULT_TIMES.afternoon}, evening=${DEFAULT_TIMES.evening}, night=${DEFAULT_TIMES.night}.
  Example: 1+0+1 => [morning, evening]. 0+1+0 => [afternoon]. 0+0+1 => [evening]. 1+1+1 => [morning, afternoon, evening].
  If the pattern clearly indicates 4 times/day, use [morning, afternoon, evening, night].
- If a medication is "now" or "stat" only, set scheduleType='as-needed' and scheduleTimes=[].
- mealTiming:
  - If text says BEFORE MEAL => 'before'
  - AFTER MEAL => 'after'
  - WITH MEAL => 'with'
  - otherwise 'anytime'
- instructions should include important notes (e.g., "START AFTER COMPLETING ...", kit names, "IF CONSTIPATION", etc.)
- startDateISO should be ${todayISO} unless clearly stated otherwise.
- If duration is stated (e.g., 2 weeks, 8 weeks, 3 months), compute endDateISO based on startDateISO and set hasEndDate=true.
- If it says "Continue" or no duration, endDateISO=null and hasEndDate=false.
- If it says "start after completing X", set dependsOnMedicationName to X (best guess) and dependsOnOffsetDays=0.
- If you can't infer scheduleTimes confidently, return [] and scheduleType='as-needed'.
- Preserve brand names in instructions when present, but name field should be the generic/main medication name.

Locale hint: ${localeHint}.`;

    const body = {
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: prompt }],
        },
        {
          role: 'user',
          content: [
            { type: 'input_text', text: 'Extract medications from this prescription image.' },
            {
              type: 'input_image',
              image_url: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          json_schema: schema,
        },
      },
    };

    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI request failed (${res.status}): ${text}`);
    }

    const json = await res.json();
    const outputText: string | undefined = json?.output?.[0]?.content?.find((c: any) => c?.type === 'output_text')
      ?.text;

    if (!outputText) {
      // Fallback: try other shapes
      const alt = json?.output_text;
      if (typeof alt === 'string') {
        return mapToDrafts(JSON.parse(alt).medications);
      }
      throw new Error('OpenAI response missing output text');
    }

    const parsed = JSON.parse(outputText);
    return mapToDrafts(parsed.medications);
  },
};

function mapToDrafts(items: any[]): PrescriptionMedicationDraft[] {
  const today = new Date();
  return items.map((m) => {
    const start = m.startDateISO ? new Date(m.startDateISO) : today;
    const end = m.endDateISO ? new Date(m.endDateISO) : null;

    const draft: PrescriptionMedicationDraft = {
      name: String(m.name ?? '').trim(),
      dosage: String(m.dosage ?? '').trim(),
      dosageUnit: String(m.dosageUnit ?? 'tablet').trim() || 'tablet',
      instructions: String(m.instructions ?? '').trim(),
      mealTiming: (m.mealTiming as MealTiming) ?? 'anytime',
      scheduleType: (m.scheduleType as ScheduleType) ?? 'daily',
      scheduleTimes: Array.isArray(m.scheduleTimes) ? m.scheduleTimes : [],
      scheduleWeekdays: Array.isArray(m.scheduleWeekdays) ? m.scheduleWeekdays : [],
      scheduleIntervalHours: Number.isFinite(m.scheduleIntervalHours) ? Number(m.scheduleIntervalHours) : 6,
      startDate: start,
      endDate: end,
      hasEndDate: Boolean(m.hasEndDate) && !!end,
      dependsOnMedicationId: null,
      dependsOnOffsetDays: Number.isFinite(m.dependsOnOffsetDays) ? Number(m.dependsOnOffsetDays) : 0,
      color: '#4CAF50',
      dependsOnMedicationName:
        m.dependsOnMedicationName === null || m.dependsOnMedicationName === undefined
          ? null
          : String(m.dependsOnMedicationName),
    };

    return draft;
  });
}
