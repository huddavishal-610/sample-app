
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../hooks/useStore'
import { setAppState } from '../hooks/useStore'
import { Program, Session } from '../state/store'
import { beep, haptic, speak } from '../lib/audio'

type Phase = 'idle'|'countdown'|'hold'|'relax'|'rest'|'done'|'paused'

export default function Timer(){
  const program = useStore(s=> s.programs.find(p=>p.id===s.activeProgramId) ?? s.programs[0])
  const settings = useStore(s=> s.user.settings)
  const [phase, setPhase] = useState<Phase>('idle')
  const [rep, setRep] = useState(1)
  const [setNo, setSetNo] = useState(1)
  const [remain, setRemain] = useState(0)
  const [progress, setProgress] = useState(0)
  const totalTicks = useMemo(()=>{
    const p = program.pattern; const repLen = p.holdSec + p.relaxSec;
    const perSet = repLen * p.reps + p.restBetweenSetsSec;
    return perSet * p.sets;
  },[program])
  const timerRef = useRef<number|undefined>(undefined)
  const sessRef = useRef<Session|null>(null)

  function reset(){
    setPhase('idle'); setRep(1); setSetNo(1); setRemain(0); setProgress(0);
    sessRef.current = null
  }

  function tick(){
    setRemain(x=>x-1)
  }

  function startPhase(next: Phase, seconds: number){
    setPhase(next); setRemain(seconds);
    window.clearInterval(timerRef.current); timerRef.current = window.setInterval(tick, 1000);
    if (settings.audioCues) beep(next==='hold'?720:next==='relax'?520:440, 120);
    if (settings.haptics) haptic([20]);
    if (settings.voiceCoach){
      if (next==='hold') speak('Hold');
      else if (next==='relax') speak('Relax');
      else if (next==='rest') speak('Rest');
    }
  }

  useEffect(()=>{
    if (phase==='idle' && remain===0){
      // nothing
    } else if (remain<=0){
      // transition logic
      const p = program.pattern;
      const repLen = p.holdSec + p.relaxSec;
      const elapsed = (setNo-1)*(p.reps*repLen + p.restBetweenSetsSec) + (rep-1)*repLen + (phase==='rest'? p.restBetweenSetsSec : 0);
      setProgress(Math.min(1, elapsed / totalTicks));
      if (phase==='countdown'){
        startPhase('hold', p.holdSec); return;
      }
      if (phase==='hold'){
        if (settings.voiceCoach) speak('Relax');
        startPhase('relax', p.relaxSec); return;
      }
      if (phase==='relax'){
        if (rep < p.reps){
          setRep(rep+1);
          startPhase('hold', p.holdSec); return;
        } else {
          if (setNo < p.sets){
            setRep(1); setSetNo(setNo+1);
            if (p.restBetweenSetsSec>0) startPhase('rest', p.restBetweenSetsSec);
            else startPhase('hold', p.holdSec);
            return;
          } else {
            window.clearInterval(timerRef.current);
            setPhase('done'); setProgress(1);
            completeSession();
            return;
          }
        }
      }
      if (phase==='rest'){
        startPhase('hold', p.holdSec); return;
      }
    } else {
      // per-second actions
      if (phase==='hold' && remain<=3 && remain>0 && settings.voiceCoach){
        speak(`${remain}`);
      }
    }
  },[remain, phase, rep, setNo])

  function start(){
    if (!sessRef.current){
      sessRef.current = {
        id: crypto.randomUUID(),
        programId: program.id,
        startedAt: Date.now(),
        repsCompleted: 0, setsCompleted: 0,
        totalHoldSec: 0, totalRelaxSec: 0
      }
    }
    startPhase('countdown', 3);
    if (settings.voiceCoach) speak('Get ready');
  }

  function pause(){
    if (phase==='paused') return;
    window.clearInterval(timerRef.current);
    setPhase('paused');
  }
  function resume(){
    if (phase!=='paused') return;
    window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(tick, 1000);
    setPhase('hold'); // resume in same phase visually
  }
  function abort(){
    if (!sessRef.current) return reset();
    const s = sessRef.current;
    s.aborted = true; s.completedAt = Date.now();
    saveSession(s);
    reset();
  }
  function skipRest(){
    if (phase==='rest'){
      const p = program.pattern;
      startPhase('hold', p.holdSec);
    }
  }

  function completeSession(){
    const s = sessRef.current!;
    s.completedAt = Date.now();
    saveSession(s, true);
  }

  function saveSession(s: Session, award=false){
    setAppState((st)=>{
      const next = {...st};
      next.user.sessions = [...st.user.sessions, s];
      // metrics
      const reps = program.pattern.reps * program.pattern.sets;
      if (award && reps>=50) next.user.badges = [...st.user.badges, { id: 'b-50', name:'50 reps in a day', earnedAt: Date.now() }];
      // streak
      const today = new Date().toISOString().slice(0,10);
      if (st.user.lastSessionDay!==today){
        const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
        next.user.streak = (st.user.lastSessionDay===yesterday? st.user.streak+1 : 1);
        next.user.lastSessionDay = today;
      }
      return next;
    })
  }

  useEffect(()=>()=>window.clearInterval(timerRef.current),[])

  const p = program.pattern;
  const repLabel = `Set ${setNo} of ${p.sets} · Rep ${rep} / ${p.reps}`;
  const phaseLabel = phase==='hold' ? 'HOLD' : phase==='relax' ? 'RELAX' : phase==='rest' ? 'REST' : phase==='countdown' ? 'READY' : phase==='done' ? 'DONE' : 'IDLE';
  const progressStyle = { ['--p' as any]: String(progress) }

  return (
    <div className="container" aria-live="polite">
      <div className="row" style={{justifyContent:'space-between', marginBottom:12}}>
        <div className="h2">{program.name}</div>
        <div className="badge">{repLabel}</div>
      </div>
      <div className="card" style={{textAlign:'center'}}>
        <div className="phase muted" aria-live="assertive">{phaseLabel}</div>
        <div className="circle" role="img" aria-label={`Timer ${phaseLabel}`}>
          <div className="digits">{remain > 0 ? remain : 0}</div>
        </div>
        <div className="row" style={{justifyContent:'center', gap:12, marginTop:12}}>
          {phase!=='hold' && phase!=='relax' && phase!=='paused' && phase!=='rest' && <button className="btn" onClick={start}>Start</button>}
          {(phase==='hold'||phase==='relax') && <button className="btn secondary" onClick={pause}>Pause</button>}
          {phase==='paused' && <button className="btn" onClick={resume}>Resume</button>}
          {(phase==='rest') && <button className="btn secondary" onClick={skipRest}>Skip Rest</button>}
          <button className="btn secondary" onClick={reset}>Restart</button>
        </div>
        <div className="row" style={{justifyContent:'center', gap:16, marginTop:12}}>
          <label className="toggle"><input type="checkbox" defaultChecked={settings.voiceCoach} onChange={e=>setAppState(s=>({user:{...s.user, settings:{...s.user.settings, voiceCoach:e.target.checked}}}))}/><span>Voice coach</span></label>
          <label className="toggle"><input type="checkbox" defaultChecked={settings.audioCues} onChange={e=>setAppState(s=>({user:{...s.user, settings:{...s.user.settings, audioCues:e.target.checked}}}))}/><span>Audio</span></label>
          <label className="toggle"><input type="checkbox" defaultChecked={settings.haptics} onChange={e=>setAppState(s=>({user:{...s.user, settings:{...s.user.settings, haptics:e.target.checked}}}))}/><span>Haptics</span></label>
        </div>
      </div>
      <div className="progress-bar" style={progressStyle as any} aria-hidden="true"></div>
    </div>
  )
}
