import mongoose from 'mongoose';
const schema = new mongoose.Schema({ name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true}, passwordHash:{type:String,required:true,select:false}, role:{type:String,enum:['ADMIN','AUTHORIZED_USER'],default:'AUTHORIZED_USER'}, active:{type:Boolean,default:true}, createdAt:{type:Date,default:Date.now} });
export default mongoose.model('User', schema);
