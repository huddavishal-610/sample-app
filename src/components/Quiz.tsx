
import React, { useState } from 'react'
import { useStore } from '../hooks/useStore'
import { setAppState } from '../hooks/useStore'
import { Quiz } from '../state/store'

const Q = [
  { k: 'level', q: 'Experience level', opts: ['Beginner','Intermediate','Advanced'] },
  { k: 'timeOfDay', q: 'Best time to exercise', opts: ['Morning','Afternoon','Evening'] },
  { k: 'goal', q: 'Primary goal', opts: ['Bladder control','Postpartum or recovery','Performance & wellness'] },
  { k: 'ageRange', q: 'Age range', opts: ['18–29','30–49','50+'] },
  { k: 'dailyTime', q: 'Daily time available (min)', opts: ['3–5','6–10','10+'] },
] as const

export default function QuizCard(){
  const quiz = useStore(s=> s.user.quiz)
  const [answers, setAnswers] = useState<Quiz>(quiz ?? {
    level:'Beginner', timeOfDay:'Morning', goal:'Bladder control', ageRange:'18–29', dailyTime:'3–5'
  })

  function pick(k:any, v:any){ setAnswers({ ...answers, [k]: v }) }

  function save(){
    setAppState(s=>{
      const next = { ...s };
      next.user.quiz = answers;
      // auto-assign program
      const pid = answers.level==='Beginner' ? 'p-begin' : answers.level==='Intermediate' ? 'p-core' : 'p-endurance';
      next.activeProgramId = pid;
      return next;
    })
  }

  return (
    <div className="card">
      <div className="h2" style={{marginBottom:8}}>Personalize your plan</div>
      {Q.map(row=>(
        <div className="col" key={row.k as string} style={{marginBottom:8}}>
          <div className="muted">{row.q}</div>
          <div className="row" role="radiogroup" aria-label={row.q}>
            {row.opts.map(o=>(
              <label key={o} className="toggle" style={{marginRight:8}}>
                <input type="radio" name={row.k as string} checked={(answers as any)[row.k]===o} onChange={()=>pick(row.k, o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="row" style={{justifyContent:'space-between', marginTop:12}}>
        <div className="safe muted">Not medical advice. Stop if pain; consult a clinician if symptoms persist.</div>
        <button className="btn" onClick={save}>Save</button>
      </div>
    </div>
  )
}
