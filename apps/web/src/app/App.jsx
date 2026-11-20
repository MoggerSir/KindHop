import {useEffect, useState} from 'react';
import CityMap from '../features/map/CityMap.jsx';

export default function App(){
  const [cities,setCities]=useState([]);
  const [active,setActive]=useState('cancun');
  const [error,setError]=useState('');
  useEffect(()=>{fetch('/api/cities').then(r=>{if(!r.ok)throw Error('API unavailable');return r.json();}).then(data=>setCities(data.cities)).catch(()=>setError('No se pudo consultar el servidor.'))},[]);
  const city=cities.find(c=>c.id===active)||{id:active,name:active==='cancun'?'Cancún':'Ciudad de México',center:active==='cancun'?[-86.85,21.16]:[-99.13,19.43],zoom:11};
  return <div className="min-h-screen bg-[#eef3f3] text-[#12262a]">
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200"><div><h1 className="font-black tracking-tight text-xl">kindhop<span className="text-teal-600">.</span></h1><p className="text-[11px] text-slate-500">La ciudad, a tu manera</p></div><span className="text-xs rounded-full px-3 py-1 bg-amber-100 text-amber-800">Bootstrap · 20/11/26</span></header>
    <main className="max-w-5xl mx-auto p-3 md:p-6"><div className="flex items-end justify-between gap-3 mb-3 flex-wrap"><div><p className="text-xs uppercase tracking-[.18em] text-slate-500">Explora</p><h2 className="text-2xl font-semibold">{city.name}</h2></div><label className="text-sm">Ciudad <select aria-label="Seleccionar ciudad" value={active} onChange={e=>setActive(e.target.value)} className="ml-2 border rounded-lg p-2 bg-white"><option value="cancun">Cancún</option><option value="cdmx">Ciudad de México</option></select></label></div>
      {error&&<p role="alert" className="text-xs text-amber-700 mb-2">{error}</p>}
      <CityMap key={city.id} city={city}/>
      <section className="mt-4 rounded-xl bg-white p-4 shadow-sm"><h3 className="font-semibold mb-1">Motor multicidad, base inicial</h3><p className="text-sm text-slate-600">Este repositorio contiene únicamente el punto de partida. Aún no hay rutas, POI, eventos ni reportes conectados: cada dato debe añadirse con su fuente y estado verificable.</p></section>
    </main>
  </div>;
}
