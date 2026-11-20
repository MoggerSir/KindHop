export type City = { id:string; name:string; center:[number,number]; zoom:number; availableModules:string[] };
export const cities: City[] = [
 {id:'cancun',name:'Cancún',center:[-86.85,21.16],zoom:11,availableModules:[]},
 {id:'cdmx',name:'Ciudad de México',center:[-99.13,19.43],zoom:11,availableModules:[]}
];
