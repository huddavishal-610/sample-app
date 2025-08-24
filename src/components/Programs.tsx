
import React from 'react'
import { useStore } from '../hooks/useStore'
import { setAppState } from '../hooks/useStore'
import { Program } from '../state/store'

export default function Programs(){
  const progs = useStore(s=>s.programs)
  const activeId = useStore(s=>s.activeProgramId)
  function start(p:Program){
    setAppState({ activeProgramId: p.id, nav: 'train' })
  }
  return (
    <div className="container">
      <div className="h1" style={{marginBottom:12}}>Programs</div>
      <div className="grid">
        {progs.map(p=>(
          <div className="card" key={p.id}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <div className="h2">{p.name}</div>
              {activeId===p.id && <span className="badge">Selected</span>}
            </div>
            <div className="muted">{p.description}</div>
            <div className="muted" style={{marginTop:8}}>{p.level} · ~{p.durationMin} min</div>
            <button className="btn" style={{marginTop:12}} onClick={()=>start(p)}>Start</button>
          </div>
        ))}
      </div>
    </div>
  )
}
