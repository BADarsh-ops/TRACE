import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/errors.js';
export const authenticate=asyncHandler(async(req,res,next)=>{const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
    if(!token)throw new AppError(401,'Sign in to continue.');let payload;try{payload=jwt.verify(token,process.env.JWT_SECRET);}
    catch{throw new AppError(401,'Session is invalid or expired.');}const user=await User.findById(payload.sub);
if(!user||!user.active)throw new AppError(401,'Account is unavailable.');req.user=user;next();});
export const allowRoles=(...roles)=>(req,res,next)=>roles.includes(req.user?.role)?next():next(new AppError(403,'You do not have permission to perform this action.'));
