import {useEffect,useRef} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
export default function CityMap({city}){
 const node=useRef(null);
 useEffect(()=>{
  if(!node.current)return;
  const map=new maplibregl.Map({container:node.current,center:city.center,zoom:city.zoom||11,style:{version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'base',type:'raster',source:'osm'}]}});
  map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
  return()=>map.remove();
 },[city.id,city.center,city.zoom]);
 return <div role="region" aria-label={`Mapa de ${city.name}`} className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm"><div ref={node} className="h-[62vh] min-h-[360px] w-full"/><div className="absolute bottom-2 left-2 right-2 pointer-events-none"><div className="inline-block bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-[11px] shadow">Vista cartográfica inicial · Sin rutas ni incidencias conectadas</div></div></div>;
}
