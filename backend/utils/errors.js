export class AppError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || (err.name === 'MulterError' ? 400 : err.name === 'ValidationError' ? 400 : err.name === 'CastError' ? 404 : 500);
  if (status >= 500) console.error(err.message);
  const message=err.code==='LIMIT_FILE_SIZE'?'File exceeds the configured upload size limit.':err.code==='LIMIT_FILE_COUNT'?'Too many files were selected.':status>=500?'Request could not be completed.':err.message;
  res.status(status).json({ error: message });
}
