import {Router} from 'express';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import crypto from 'node:crypto';import Incident from '../models/Incident.js';import Evidence from '../models/Evidence.js';import {authenticate} from '../middleware/auth.js';import {asyncHandler} from '../utils/errors.js';import {IncidentProcessingService} from '../services/incidentProcessingService.js';
const router=Router();router.use(authenticate);
const uploadsDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../uploads');
const samples=[
 ['suspicious_message.txt','10:30 AM - Unknown sender: Your bank account will be blocked. Verify immediately. Platform: SMS.'],
 ['suspicious_url.txt','10:35 AM - Link shared: https://bank-example.test/verify Platform: SMS.'],
 ['bank_transaction.txt','10:45 AM - Transaction successful. Amount: INR 5,000. Txn ID: TXN00981. Recipient: rahul@oksbi.'],
 ['followup_message.txt','11:00 AM - Send another INR 5,000 for verification. Platform: WhatsApp.'],
 ['second_transaction.txt','10:40 AM - Transaction successful. Amount: INR 25,000. Txn ID: TXN00982. Reference: same verification payment requested in E004.'],
 ['contact_details.txt','Contact: Rahul Sharma, +91 9876543210, rahul@example.com, Account 123456789012, UPI rahul@oksbi.']
];
router.post('/',asyncHandler(async(req,res)=>{const n=await Incident.countDocuments({incidentCode:new RegExp(`^TRC-${new Date().getFullYear()}-`)});const incident=await Incident.create({incidentCode:`TRC-${new Date().getFullYear()}-${String(n+1).padStart(3,'0')}`,title:'Suspected Phishing / Payment Fraud',description:'Fictional demonstration data for evidence reconstruction. All names, contact details, accounts, transactions, and domains are synthetic.',owner:req.user._id,assignedUsers:[req.user._id]});await fs.mkdir(uploadsDir,{recursive:true});const docs=[];for(let i=0;i<samples.length;i++){const [name,text]=samples[i],storedName=`${crypto.randomUUID()}.txt`,filePath=path.join(uploadsDir,storedName);await fs.writeFile(filePath,text,'utf8');docs.push({incident:incident._id,evidenceCode:`E${String(i+1).padStart(3,'0')}`,originalName:name,storedName,mimeType:'text/plain',size:Buffer.byteLength(text),sha256:crypto.createHash('sha256').update(text).digest('hex'),uploadedBy:req.user._id,extractedText:text});}await Evidence.insertMany(docs);const processed=await new IncidentProcessingService().process(incident,req.user);res.status(201).json({incident:processed,message:'Fictional demo incident created and processed.'});}));
export default router;
