
let ctx: AudioContext | null = null;
function ensure(){
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx!;
}
export function beep(freq=660, ms=120){
  try{
    const c = ensure();
    const o = c.createOscillator(); const g = c.createGain();
    o.type='sine'; o.frequency.value=freq; o.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + ms/1000);
    o.start(); o.stop(c.currentTime + ms/1000 + 0.01);
  }catch{ /* ignore */ }
}
export function speak(text:string){
  try{
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1; u.volume = 1;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch{}
}
export function haptic(pattern: number | number[] = [30]){
  try{ navigator.vibrate?.(pattern as any) }catch{}
}
