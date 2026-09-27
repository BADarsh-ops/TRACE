import mongoose from 'mongoose';
const schema=new mongoose.Schema({incident:{type:mongoose.Schema.Types.ObjectId,ref:'Incident',index:true},evidence:{type:mongoose.Schema.Types.ObjectId,ref:'Evidence',required:true,index:true},entityId:{type:String,required:true},type:String,value:String,normalizedValue:String,confidence:Number,sourceEvidenceId:String,sourceText:String,uncertain:{type:Boolean,default:false}},{timestamps:true});
export default mongoose.model('ExtractedEntity',schema);
