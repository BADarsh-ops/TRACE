import {createContext,useContext,useEffect,useState} from 'react';import api from '../services/api';
const Context=createContext(null);export const useAuth=()=>useContext(Context);
export function AuthProvider({children})
{
    const [user,setUser]=useState(null),
    [ready,setReady]=useState(false);useEffect(()=>{if(localStorage.getItem('trace_token'))api.get('/auth/me').then(r=>setUser(r.data.user)).catch(()=>{localStorage.removeItem('trace_token');}).finally(()=>setReady(true));


else setReady(true);},[]);const accept=data=>{localStorage.setItem('trace_token',data.token);setUser(data.user);};
const logout=async()=>{try{await api.post('/auth/logout')}catch{}localStorage.removeItem('trace_token');
setUser(null);};return <Context.Provider value={{user,ready,accept,logout}}>{children}</Context.Provider>;
}
