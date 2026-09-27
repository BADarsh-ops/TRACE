import fs from 'node:fs/promises';
import path from 'node:path';
export class DemoOCRService {
  async extractText(evidence) {
    const ext=path.extname(evidence.originalName).toLowerCase();
    if(['.txt','.csv'].includes(ext)) return fs.readFile(evidence.filePath,'utf8');
    if(ext==='.pdf') return `PDF received: ${evidence.originalName}. Configure an OCR provider to extract its content.`;
    return `Image received: ${evidence.originalName}. Configure OCR_API_KEY and an OCR adapter to read screenshot text.`;
  }
}
export class OCRService {
  constructor({demoProvider=new DemoOCRService()}={}){this.demoProvider=demoProvider;}
  async extractText(evidence){
    if(process.env.OCR_API_KEY&&process.env.OCR_API_URL){
      const bytes=await fs.readFile(evidence.filePath);const form=new FormData();form.append('file',new Blob([bytes]),evidence.originalName);
      const response=await fetch(process.env.OCR_API_URL,{method:'POST',headers:{Authorization:`Bearer ${process.env.OCR_API_KEY}`},body:form});
      if(!response.ok)throw new Error(`OCR provider returned ${response.status}`);const result=await response.json();if(typeof result.text!=='string')throw new Error('OCR provider response must contain a text field.');return result.text;
    }
    return this.demoProvider.extractText(evidence);
  }
}
