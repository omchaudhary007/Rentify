import multer from 'multer';

// Storing in buffer memory for temporary storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 } // Max size 1MB per file
});

// maximum files upload at once is 1000
const allowedMaxFiles=100;

// Middleware to handle file uploads (single or multiple)
const handleUpload = (fieldName, maxFiles) => (req, res, next) => {
    // maximum file limit check
    if(maxFiles &&maxFiles>allowedMaxFiles){
        return res.status(413).send({
            success: false,
            message: `Cannot upload more than ${allowedMaxFiles} files once.`
        });
    }

    // identify single upload or mulitple upload
    const uploadMiddleware = maxFiles ? upload.array(fieldName, maxFiles) : upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).send({
                    success: false,
                    message: 'File size must not exceed 1MB.'
                });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).send({
                    success: false,
                    message: maxFiles ? `Too many files uploaded. Maximum is ${maxFiles} files with name ${fieldName}.` : `Only one file is allowed with name ${fieldName}.`
                });
            }
            return res.status(500).send({
                success: false,
                message: 'Internal server error.'
            });
        }
        
        // Validate file types
        validateFileType(req, res, next);
    });
};

// Middleware to validate file types
const validateFileType = (req, res, next) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const files = req.files || [req.file]; // Handle both single and multiple files
    // if file is not provided then move next
    if(files.includes(undefined)){
        req.files=undefined;
        next();
    } 
    else{
       for (const file of files) {
           if (!allowedMimeTypes.includes(file.mimetype)) {
               return res.status(400).send({
                   success: false,
                   message: 'Invalid file type. Only PNG, JPG, Webp and JPEG formats are allowed.'
               });
           }
       }
       next();
   }
};

// Export the middleware
export { handleUpload, validateFileType };
