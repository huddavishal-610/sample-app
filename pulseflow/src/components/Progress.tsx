
import React from 'react'
import { useStore } from '../hooks/useStore'

export default function Progress(){
  const sessions = useStore(s=>s.user.sessions)
  const badges = useStore(s=>s.user.badges)
  const dayKey = (t:number)=> new Date(t).toISOString().slice(0,10)
  const map = new Map<string, number>()
  sessions.forEach(s=>{
    const k = dayKey(s.completedAt ?? s.startedAt);
    map.set(k, (map.get(k)||0) + Math.round((s.totalHoldSec+s.totalRelaxSec)/60))
  })
  const days:number[] = []
  for(let i=29;i>=0;i--){ days.push(Date.now()-i*86400000) }
  return (
    <div className="container">
      <div className="h1" style={{marginBottom:12}}>Progress</div>
      <div className="card">
        <div className="h2">Last 30 days</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(15, 1fr)', gap:6, marginTop:8}}>
          {days.map((d, i)=>{
            const k = dayKey(d)
            const v = map.get(k)||0
            const alpha = Math.min(1, v/10)
            return <div key={i} title={`${k} · ${v} min`} style={{height:14, borderRadius:4, background:`rgba(108,92,231,${alpha})`}}></div>
          })}
        </div>
      </div>
      <div className="card" style={{marginTop:12}}>
        <div className="h2">Badges</div>
        <div className="row" style={{flexWrap:'wrap', gap:8}}>
          {badges.length===0 && <div className="muted">No badges yet</div>}
          {badges.map(b=> <span key={b.id} className="badge">{b.name}</span>)}
        </div>
      </div>
    </div>
  )
}
