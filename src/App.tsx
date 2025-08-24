
import React from 'react'
import Home from './components/Home'
import Timer from './components/Timer'
import Programs from './components/Programs'
import Progress from './components/Progress'
import Settings from './components/Settings'
import { useStore } from './hooks/useStore'
import { setAppState } from './hooks/useStore'

const Tab = ({ id, label, icon }: { id: any, label: string, icon: string }) => {
  const nav = useStore(s=>s.nav)
  return <button aria-current={nav===id} onClick={()=>setAppState({ nav:id })}>
    <div style={{fontSize:18}}>{icon}</div>
    {label}
  </button>
}

export default function App(){
  const nav = useStore(s=>s.nav)
  const user = useStore(s=>s.user)
  const needsQuiz = !user.quiz
  return (
    <>
      {nav==='home' && <Home />}
      {nav==='train' && <Timer />}
      {nav==='programs' && <Programs />}
      {nav==='progress' && <Progress />}
      {nav==='settings' && <Settings />}

      <nav className="tabs" role="tablist" aria-label="Primary">
        <Tab id="home" label="Home" icon="🏠" />
        <Tab id="train" label="Train" icon="⏱️" />
        <Tab id="programs" label="Programs" icon="📚" />
        <Tab id="progress" label="Progress" icon="📈" />
        <Tab id="settings" label="Settings" icon="⚙️" />
      </nav>

      {needsQuiz && (
        <div role="dialog" aria-modal="true" aria-label="Onboarding" style={{position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'grid', placeItems:'center'}}>
          <div style={{maxWidth:560, width:'92%', background:'var(--bg)', borderRadius:16, padding:12}}>
            <div className="h2">Welcome to PulseFlow</div>
            <p className="muted">Answer a few quick questions to tailor your plan.</p>
            <div style={{maxHeight:'70vh', overflow:'auto'}}>
              {React.createElement(require('./components/Quiz').default)}
            </div>
            <div style={{textAlign:'right', marginTop:8}}>
              <button className="btn secondary" onClick={()=>setAppState(s=>({user:{...s.user, quiz: { level:'Beginner', timeOfDay:'Morning', goal:'Bladder control', ageRange:'18–29', dailyTime:'3–5' }}}))}>Skip</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
