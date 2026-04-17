export interface PhenologicalStage {
  id: string;
  name: string;
  sprayNo: string;
  emoji: string;
  months: number[];
  monthLabel: string;
  beeFriendly: boolean;
  accent: string;
  fertilizer: string[];
  practices: string[];
  insecticide: string[];
  fungicide: string[];
  durationDays: number;
}

// ... KASHMIR_APPLE_STAGES with durationDays added ...

// Petal Fall started April 14, 2026
const ANCHOR_DATE_MS = new Date("2026-04-14T00:00:00").getTime();
const ANCHOR_STAGE_ID = "petalFall";

export function getYearlySchedule() {
  const schedule = [];
  const anchorIndex = KASHMIR_APPLE_STAGES.findIndex(s => s.id === ANCHOR_STAGE_ID);
  
  let currentMs = ANCHOR_DATE_MS;
  for (let i = anchorIndex; i < KASHMIR_APPLE_STAGES.length; i++) {
    const stage = KASHMIR_APPLE_STAGES[i];
    schedule[i] = { ...stage, startDate: new Date(currentMs) };
    currentMs += stage.durationDays * 24 * 60 * 60 * 1000;
  }
  
  currentMs = ANCHOR_DATE_MS;
  for (let i = anchorIndex - 1; i >= 0; i--) {
    const stage = KASHMIR_APPLE_STAGES[i];
    currentMs -= stage.durationDays * 24 * 60 * 60 * 1000;
    schedule[i] = { ...stage, startDate: new Date(currentMs) };
  }
  return schedule;
}

export function getAppleStagesStatus() {
  const schedule = getYearlySchedule();
  const now = Date.now();
  let active = schedule[0];
  let next = schedule[1];
  
  for (let i = 0; i < schedule.length; i++) {
    const start = schedule[i].startDate.getTime();
    const end = start + (schedule[i].durationDays * 24 * 60 * 60 * 1000);
    if (now >= start && now < end) {
      active = schedule[i];
      next = i < schedule.length - 1 ? schedule[i+1] : schedule[0];
      break;
    }
  }
  // Progress pct based on full year? Let's just use current month as a rough estimate
  const currentMonth = new Date().getMonth();
  const pct = Math.round(((currentMonth + 1) / 12) * 100);
  
  return { activeStages: [active], nextStage: next, progressPct: pct };
}
