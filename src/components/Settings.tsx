
import React from 'react'
import { useStore } from '../hooks/useStore'
import { setAppState } from '../hooks/useStore'
import QuizCard from './Quiz'

export default function Settings(){
  const s = useStore(s=>s.user.settings)
  function setTheme(v:'system'|'light'|'dark'){
    document.documentElement.setAttribute('data-theme', v==='system' ? '' : v);
    localStorage.setItem('pf_theme', v);
    setAppState(st=>({ user:{...st.user, settings:{...st.user.settings, theme:v}} }))
  }
  function setBool(k:keyof typeof s, v:boolean){
    setAppState(st=>({ user:{...st.user, settings:{...st.user.settings, [k]:v}} }))
  }
  function notify(){
    Notification.requestPermission().then(p=>{
      if (p==='granted'){
        new Notification('PulseFlow','Reminders are on. We will nudge you gently.');
        setBool('notifications', true)
      }
    })
  }
  return (
    <div className="container">
      <div className="h1" style={{marginBottom:12}}>Settings</div>
      <div className="card">
        <div className="h2">Appearance</div>
        <div className="row" style={{gap:8, marginTop:8}}>
          {['system','light','dark'].map(t=>(
            <button key={t} className="btn secondary" onClick={()=>setTheme(t as any)}>{t.title()}</button>
          ))}
        </div>
      </div>
      <div className="card" style={{marginTop:12}}>
        <div className="h2">Cues</div>
        <label className="toggle"><input type="checkbox" checked={s.voiceCoach} onChange={e=>setBool('voiceCoach', e.target.checked)} /><span>Voice coach</span></label>
        <br/>
        <label className="toggle"><input type="checkbox" checked={s.audioCues} onChange={e=>setBool('audioCues', e.target.checked)} /><span>Audio</span></label>
        <br/>
        <label className="toggle"><input type="checkbox" checked={s.haptics} onChange={e=>setBool('haptics', e.target.checked)} /><span>Haptics</span></label>
      </div>
      <div className="card" style={{marginTop:12}}>
        <div className="h2">Reminders</div>
        <div className="muted">Enable notifications to get gentle daily nudges.</div>
        <button className="btn" style={{marginTop:8}} onClick={notify}>Enable notifications</button>
      </div>
      <div className="card" style={{marginTop:12}}>
        <QuizCard />
      </div>
      <div className="card" style={{marginTop:12}}>
        <div className="h2">Data</div>
        <a className="link" href="#" onClick={()=>import('../state/store').then(m=>m.exportData())}>Export JSON</a>
        <div className="safe muted" style={{marginTop:8}}>Privacy first: stored locally by default. Clear site data to reset.</div>
      </div>
      <div className="card" style={{marginTop:12}}>
        <div className="h2">Legal</div>
        <div className="safe muted">PulseFlow provides general fitness guidance and is not medical advice. If you experience pain or have pelvic pain, prolapse, pregnancy, or recent surgery, consult a qualified clinician before continuing.</div>
      </div>
    </div>
  )
}
