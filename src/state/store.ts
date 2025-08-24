
export type Level = 'Beginner'|'Intermediate'|'Advanced'|'All';

export type Program = {
  id: string; name: string; level: Level;
  durationMin: number; description: string;
  pattern: { holdSec: number; relaxSec: number; reps: number; sets: number; restBetweenSetsSec: number; };
};

export type Quiz = {
  level: 'Beginner'|'Intermediate'|'Advanced';
  timeOfDay: 'Morning'|'Afternoon'|'Evening';
  goal: 'Bladder control'|'Postpartum or recovery'|'Performance & wellness';
  ageRange: '18–29'|'30–49'|'50+';
  dailyTime: '3–5'|'6–10'|'10+';
};

export type Settings = {
  theme: 'system'|'light'|'dark';
  voiceCoach: boolean;
  haptics: boolean;
  audioCues: boolean;
  textScale: 'S'|'M'|'L'|'XL';
  notifications: boolean;
  cloudSync: boolean;
  locale: string;
};

export type Session = {
  id: string; programId: string; startedAt: number; completedAt?: number;
  repsCompleted: number; setsCompleted: number; notes?: string;
  totalHoldSec: number; totalRelaxSec: number; aborted?: boolean;
};

export type Badge = { id: string; name: string; earnedAt: number; };
export type Reminder = { id: string; timeOfDay: 'Morning'|'Afternoon'|'Evening'; hour: number; minute: number; enabled: boolean; };

export type User = {
  id: string;
  createdAt: number;
  quiz?: Quiz;
  settings: Settings;
  badges: Badge[];
  reminders: Reminder[];
  streak: number;
  lastSessionDay?: string;
  sessions: Session[];
};

export type AppState = {
  user: User;
  programs: Program[];
  nav: 'home'|'train'|'programs'|'progress'|'settings';
  activeProgramId?: string;
};

const defaultPrograms: Program[] = [
  {"id":"p-begin","name":"Beginner Basics","level":"Beginner","durationMin":6,
   "description":"Foundational holds and relaxed breathing.",
   "pattern":{"holdSec":5,"relaxSec":5,"reps":10,"sets":2,"restBetweenSetsSec":30}},
  {"id":"p-core","name":"Core Control","level":"Intermediate","durationMin":12,
   "description":"Build control and endurance.",
   "pattern":{"holdSec":7,"relaxSec":7,"reps":12,"sets":3,"restBetweenSetsSec":30}},
  {"id":"p-endurance","name":"Endurance","level":"Advanced","durationMin":20,
   "description":"Longer holds for advanced users.",
   "pattern":{"holdSec":10,"relaxSec":10,"reps":15,"sets":3,"restBetweenSetsSec":45}},
  {"id":"p-quick","name":"Quick Boost (3 min)","level":"Beginner","durationMin":3,
   "description":"Short session for busy days.",
   "pattern":{"holdSec":3,"relaxSec":3,"reps":10,"sets":1,"restBetweenSetsSec":0}},
  {"id":"p-relax","name":"Focus: Relaxation","level":"All","durationMin":5,
   "description":"Down-training & relaxation emphasis.",
   "pattern":{"holdSec":2,"relaxSec":6,"reps":10,"sets":2,"restBetweenSetsSec":15}}
];

const blankUser: User = {
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  settings: {
    theme: (localStorage.getItem('pf_theme') as Settings['theme']) || 'system',
    voiceCoach: false, haptics: true, audioCues: true, textScale: 'M',
    notifications: false, cloudSync: false, locale: navigator.language || 'en-US'
  },
  badges: [], reminders: [], streak: 0, sessions: []
};

function load(): AppState {
  const raw = localStorage.getItem('pf_state_v1');
  if (!raw) return { user: blankUser, programs: defaultPrograms, nav: 'home' };
  try {
    const parsed = JSON.parse(raw) as AppState;
    return { ...parsed, programs: parsed.programs?.length ? parsed.programs : defaultPrograms };
  } catch {
    return { user: blankUser, programs: defaultPrograms, nav: 'home' };
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

export function getState(){ return state }
export function setState(partial: Partial<AppState> | ((s:AppState)=>Partial<AppState>)){
  const next = typeof partial === 'function' ? { ...state, ...(partial as any)(state) } : { ...state, ...partial };
  state = next;
  localStorage.setItem('pf_state_v1', JSON.stringify(state));
  listeners.forEach(l=>l());
}
export function subscribe(fn: () => void){ listeners.add(fn); return ()=>listeners.delete(fn) }

export function todayKey(){ const d = new Date(); return d.toISOString().slice(0,10) }

export function awardBadge(id:string, name:string){
  if (state.user.badges.some(b=>b.id===id)) return;
  state.user.badges.push({ id, name, earnedAt: Date.now() });
}

export function updateStreakOnComplete(){
  const today = todayKey();
  const last = state.user.lastSessionDay;
  if (last === today) return;
  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
  state.user.streak = (last === yesterday ? state.user.streak + 1 : 1);
  state.user.lastSessionDay = today;
}

export function exportData(){
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'pulseflow-data.json'; a.click();
  URL.revokeObjectURL(url);
}

