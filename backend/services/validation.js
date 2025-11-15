const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export function validateFile(file) {
  const errors = []

  // Check file type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push({
      field: 'file',
      message: 'Invalid file type. Only PDF, JPEG, and PNG files are allowed.',
      code: 'INVALID_FILE_TYPE'
    })
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push({
      field: 'file',
      message: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      code: 'FILE_TOO_LARGE'
    })
  }

  return {
    valid: errors.length === 0,
    message: errors.length > 0 ? errors[0].message : 'File is valid',
    errors
  }
}

export function createDocumentRecord(documentId, file) {
  return {
    id: documentId,
    filename: file.originalname,
    filepath: file.path,
    fileSize: file.size,
    fileType: file.mimetype,
    uploadedAt: new Date().toISOString(),
    status: 'queued'
  }
}
