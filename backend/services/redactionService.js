export function maskValue(type, value) {
  const v=String(value??'');
  if(type==='PHONE'){const d=v.replace(/\D/g,''); return d.length>=10 ? `+91XXXXXX${d.slice(-4)}` : v;}
  if(type==='EMAIL'||type==='UPI_ID'){const [name,domain]=v.split('@'); return name&&domain ? `${name[0]}****@${domain}` : v;}
  if(type==='ACCOUNT_NUMBER'){const d=v.replace(/\D/g,''); return d.length>4 ? `${'X'.repeat(d.length-4)}${d.slice(-4)}` : v;}
  if(type==='ADDRESS') return '[REDACTED ADDRESS]';
  if(type==='GOVERNMENT_ID') return `${'X'.repeat(Math.max(0,v.length-4))}${v.slice(-4)}`;
  if(type==='PERSON') return '[REDACTED NAME]';
  return v;
}
export function redactText(text, settings={PHONE:true,EMAIL:true,ACCOUNT_NUMBER:true,UPI_ID:true,ADDRESS:true,GOVERNMENT_ID:true,PERSON:false}) {
  let result=String(text??'');
  const rules=[['EMAIL',/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi],['PHONE / UPI',/\+?91[\s-]?\d{10}|\b\w+@(?:oksbi|ybl|paytm)\b/gi],['ACCOUNT_NUMBER',/\b\d{9,16}\b/g]];
  // Category-specific replacements are handled on extracted entities; source text masking is conservative.
  if(settings.EMAIL) result=result.replace(rules[0][1],m=>maskValue('EMAIL',m));
  if(settings.PHONE) result=result.replace(/\+?91[\s-]?\d{10}/g,m=>maskValue('PHONE',m));
  if(settings.UPI_ID) result=result.replace(/\b\w+@(?:oksbi|ybl|paytm)\b/gi,m=>maskValue('UPI_ID',m));
  if(settings.ACCOUNT_NUMBER) result=result.replace(rules[2][1],m=>maskValue('ACCOUNT_NUMBER',m));
  if(settings.ADDRESS) result=result.replace(/\bAddress:\s*[^\n,;]+(?:,\s*[^\n;]+)?/gi,'Address: [REDACTED ADDRESS]');
  if(settings.GOVERNMENT_ID) result=result.replace(/\b[A-Z]{5}\d{4}[A-Z]\b/gi,m=>maskValue('GOVERNMENT_ID',m));
  return result;
}
export function maskedEntity(entity,settings={}) { return settings[entity.type]===false ? entity.value : maskValue(entity.type,entity.value); }
