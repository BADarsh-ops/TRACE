import mongoose from 'mongoose';
const schema=new mongoose.Schema({incident:{type:mongoose.Schema.Types.ObjectId,ref:'Incident',index:true},evidence:{type:mongoose.Schema.Types.ObjectId,ref:'Evidence',required:true},eventId:String,eventTime:Date,eventTimeText:String,eventType:String,description:String,confidence:Number,sourceEvidenceId:String},{timestamps:true});
export default mongoose.model('TimelineEvent',schema);
