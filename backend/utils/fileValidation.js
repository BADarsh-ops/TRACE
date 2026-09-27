import path from 'node:path';
const allowed=new Set(['.png','.jpg','.jpeg','.pdf','.txt','.csv']);
export function allowedEvidenceExtension(name){
    return allowed.has(path.extname(String(name||'')).toLowerCase());}
export function validEvidenceContent(name,bytes)
{
    const ext=path.extname(String(name||'')).toLowerCase(),b=Buffer.from(bytes||[]);
    if(!allowed.has(ext)||!b.length)return false;
 if(ext==='.png')
    return b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
if(ext==='.jpg'||ext==='.jpeg')
    return b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255;
  if(ext==='.pdf')
    return b.subarray(0,5).toString()==='%PDF-';
if(ext==='.txt'||ext==='.csv')
    return !b.subarray(0,Math.min(b.length,8192)).includes(0);
return false;
}
