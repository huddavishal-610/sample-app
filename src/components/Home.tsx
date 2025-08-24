
import React from 'react'
import { useStore } from '../hooks/useStore'
import { setAppState } from '../hooks/useStore'

export default function Home(){
  const user = useStore(s=>s.user)
  const active = useStore(s=> s.programs.find(p=>p.id===s.activeProgramId) ?? s.programs[0])
  const last = user.sessions[user.sessions.length-1]
  const nextPlan = active?.name ?? 'Quick Boost (3 min)'
  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between', marginBottom:12}}>
        <div className="h1">Let’s build consistency</div>
        <span className="badge">Streak {user.streak}🔥</span>
      </div>
      <div className="card row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div className="col">
          <div className="h2">Today’s plan</div>
          <div className="muted">{nextPlan}</div>
        </div>
        <button className="btn" onClick={()=>setAppState({ nav:'train' })}>Start</button>
      </div>
      <div className="grid" style={{marginTop:12}}>
        <div className="card">
          <div className="h2">Last session</div>
          <div className="muted">{last? new Date(last.completedAt??last.startedAt).toLocaleString() : 'Not yet'}</div>
        </div>
        <div className="card">
          <div className="h2">Minutes this week</div>
          <div className="muted">{Math.round(user.sessions.slice(-7).reduce((t,s)=>t+((s.totalHoldSec+s.totalRelaxSec)/60),0))} min</div>
        </div>
      </div>
      <div className="card" style={{marginTop:12}}>
        <div className="h2">Tips</div>
        <ul>
          <li>Breathe gently; avoid bracing your abs or glutes.</li>
          <li>Fully relax between holds.</li>
          <li>Short sessions beat skipped sessions.</li>
        </ul>
      </div>
    </div>
  )
}
