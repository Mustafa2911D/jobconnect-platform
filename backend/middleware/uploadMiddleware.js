import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== DIRECTORY SETUP =====
const ensureUploadDirs = () => {
  if (process.env.NODE_ENV === 'production') {
    // Create directories in /tmp for production
    const tmpUploadsDir = '/tmp/uploads';
    const tmpProfileImagesDir = '/tmp/uploads/profile-images';
    
    if (!fs.existsSync(tmpProfileImagesDir)) {
      fs.mkdirSync(tmpProfileImagesDir, { recursive: true });
      console.log('✅ Created production upload directories:', tmpProfileImagesDir);
    }
  } else {
    // Development directories
    const uploadsDir = path.join(__dirname, '../uploads');
    const profileImagesDir = path.join(uploadsDir, 'profile-images');
    
    if (!fs.existsSync(profileImagesDir)) {
      fs.mkdirSync(profileImagesDir, { recursive: true });
    }
  }
};

// Initialize directories
ensureUploadDirs();

// ===== FILE FILTERS =====
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed for resumes'), false);
    }
  } else if (file.fieldname === 'avatar' || file.fieldname === 'profileImage') {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars'), false);
    }
  } else {
    cb(null, true);
  }
};

// ===== STORAGE CONFIGURATIONS =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (process.env.NODE_ENV === 'production') {
      if (file.fieldname === 'resume') {
        cb(null, '/tmp/uploads/resumes');  
      } else {
        cb(null, '/tmp/uploads/profile-images');
      }
    } else {
      if (file.fieldname === 'resume') {
        cb(null, path.join(__dirname, '../uploads/resumes')); 
      } else {
        cb(null, path.join(__dirname, '../uploads/profile-images'));
      }
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    
    if (file.fieldname === 'resume') {
      cb(null, `resume-${uniqueSuffix}${fileExtension}`);
    } else if (file.fieldname === 'avatar' || file.fieldname === 'profileImage') {
      cb(null, `profile-${req.user?.id || 'anonymous'}-${uniqueSuffix}${fileExtension}`);
    } else {
      cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
    }
  }
});

// ===== MULTER INSTANCES =====
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const uploadProfileImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export default upload;
export { uploadProfileImage };