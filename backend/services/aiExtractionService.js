import { aiResultSchema } from '../utils/validators.js';
const norm=(type,value)=>type==='PHONE'?value.replace(/\D/g,''):type==='AMOUNT'?value.replace(/[^\d.]/g,''):value.trim();
export class DemoAIExtractionService {
  async extractInformation(text,evidenceId){
    const entities=[]; const add=(type,value,confidence=.9)=>entities.push({entityId:`${evidenceId}-${entities.length+1}`,type,value,normalizedValue:norm(type,value),confidence,sourceEvidenceId:evidenceId,sourceText:text.slice(Math.max(0,text.indexOf(value)-40),text.indexOf(value)+value.length+40),uncertain:false});
    let m;
    for(const [type,regex,confidence] of [['EMAIL',/[\w.+-]+@[\w.-]+\.[A-Z]{2,}/i,.96],['URL',/https?:\/\/[^\s"')]+/i,.96],['PHONE',/\+?91[\s-]?\d{10}/,.96],['UPI_ID',/\b[\w.-]+@(?:oksbi|ybl|paytm)\b/i,.95],['GOVERNMENT_ID',/\b[A-Z]{5}\d{4}[A-Z]\b/i,.8],['ADDRESS',/\bAddress:\s*[^\n,;]+(?:,\s*[^\n;]+)?/i,.8],['TRANSACTION_ID',/\b(?:TXN|UTR)[- ]?[A-Z0-9]{5,}\b/i,.95]]){m=text.match(regex);if(m)add(type,m[0],confidence);}
    const labeledAccount=text.match(/\b(?:Account(?: Number)?|A\/C)\s*[:#-]?\s*(\d{9,16})\b/i);let account=labeledAccount?.[1];if(!account){const phones=[...text.matchAll(/\+?91[\s-]?(\d{10})/g)].map(x=>x[1]);account=(text.match(/\b\d{9,16}\b/g)||[]).find(x=>!phones.includes(x));}if(account)add('ACCOUNT_NUMBER',account,.86);
    const time=text.match(/\b\d{1,2}:\d{2}\s?(?:AM|PM)\b/i);if(time)add('TIME',time[0],.97);
    const platform=text.match(/\bPlatform:\s*([A-Z][\w-]*)/i);if(platform)add('PLATFORM',platform[1],.9);
    const date=text.match(/\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);if(date)add('DATE',date[0],.93);
    const amount=text.match(/(?:₹|INR\s*)\s?[\d,]+(?:\.\d{2})?/i);if(amount){add('AMOUNT',amount[0],.95);add('CURRENCY',/₹/.test(amount[0])?'INR':'INR',.9);}
    const person=text.match(/(?:Rahul Sharma|Aarav Kumar|(?:Sender|From|Name):\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/i);if(person)add('PERSON',person[0].replace(/^(?:Sender|From|Name):\s*/i,''),.85);
    const location=text.match(/\b(?:Location|City):\s*([^\n,;]+(?:,\s*[^\n;]+)?)/i);if(location)add('LOCATION',location[1],.82);
    let eventType='OTHER';
    if(/transaction successful|debited|credited/i.test(text))eventType='TRANSACTION';
    else if(/otp/i.test(text))eventType='OTP_REQUEST';
    else if(/send|pay|transfer/i.test(text))eventType='PAYMENT_REQUEST';
    else if(/https?:\/\//i.test(text))eventType='URL_IDENTIFIED';
    else if(/login|signed in/i.test(text))eventType='LOGIN_EVENT';
    else if(/blocked|verify|account/i.test(text))eventType='MESSAGE_RECEIVED';
    return aiResultSchema.parse({entities,eventType,eventDescription:null});
  }
}
export class LLMAIExtractionService {
  async extractInformation(text,evidenceId){
    const response=await fetch(`${(process.env.AI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{Authorization:`Bearer ${process.env.AI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.AI_MODEL||'gpt-4o-mini',response_format:{type:'json_object'},messages:[{role:'system',content:'Extract only explicit evidence facts. Do not infer absent values. Return JSON {entities:[{type,value,normalizedValue,confidence,uncertain}],eventType,eventDescription}. Allowed entity types: PERSON,PHONE,EMAIL,URL,DATE,TIME,AMOUNT,CURRENCY,TRANSACTION_ID,ACCOUNT_NUMBER,UPI_ID,LOCATION,PLATFORM,ADDRESS,GOVERNMENT_ID. Allowed eventType: MESSAGE_RECEIVED,PAYMENT_REQUEST,TRANSACTION,URL_IDENTIFIED,OTP_REQUEST,LOGIN_EVENT,ACCOUNT_CHANGE,FOLLOW_UP_MESSAGE,OTHER.'},{role:'user',content:text}]})});
    if(!response.ok)throw new Error(`AI provider returned ${response.status}`);
    const body=await response.json(); const raw=JSON.parse(body.choices?.[0]?.message?.content||'{}');
    const entities=(raw.entities||[]).map((e,i)=>({...e,entityId:`${evidenceId}-${i+1}`,sourceEvidenceId:evidenceId,sourceText:text.slice(Math.max(0,text.indexOf(e.value)-40),text.indexOf(e.value)+String(e.value).length+40),uncertain:Boolean(e.uncertain)}));
    return aiResultSchema.parse({...raw,entities});
  }
}
export class AIExtractionService {
  constructor(){this.provider=process.env.AI_API_KEY?new LLMAIExtractionService():new DemoAIExtractionService();}
  extractInformation(text,id){return this.provider.extractInformation(text,id);}
}
