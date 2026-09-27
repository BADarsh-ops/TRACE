import mongoose from 'mongoose';
const schema=new mongoose.Schema({incident:{type:mongoose.Schema.Types.ObjectId,ref:'Incident',index:true},kind:{type:String,enum:['MISSING','CONFLICT','RELATIONSHIP','PII']},type:String,severity:String,description:String,evidenceIds:[{type:mongoose.Schema.Types.ObjectId,ref:'Evidence'}],metadata:mongoose.Schema.Types.Mixed,relationshipType:String,sourceType:String,targetType:String,sourceId:String,targetId:String},{timestamps:true});
export default mongoose.model('Finding',schema);
