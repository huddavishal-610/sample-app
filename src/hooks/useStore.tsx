
import { useSyncExternalStore } from 'react'
import { getState, subscribe, setState, type AppState } from '../state/store'

export function useStore<T>(selector: (s:AppState)=>T){
  return useSyncExternalStore(subscribe, ()=>selector(getState()), ()=>selector(getState()))
}
export const setAppState = setState
