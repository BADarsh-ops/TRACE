import Incident from '../models/Incident.js';
import { AppError, asyncHandler } from '../utils/errors.js';
export const getIncident=asyncHandler(async(req,res,next)=>{const incident=await Incident.findById(req.params.id);if(!incident)throw new AppError(404,'Incident not found.');
    if(req.user.role!=='ADMIN'&&!incident.owner.equals(req.user._id)&&!incident.assignedUsers.some(id=>id.equals(req.user._id)))throw new AppError(403,'You are not assigned to this incident.');
    req.incident=incident;next();}
);
