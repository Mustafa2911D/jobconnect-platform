import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== DIRECTORY SETUP =====
// Only create directories in development
// In production, we'll use cloud storage
const uploadsDir = path.join(__dirname, '../uploads');
const profileImagesDir = path.join(uploadsDir, 'profile-images');

if (process.env.NODE_ENV === 'development') {
  if (!fs.existsSync(profileImagesDir)) {
    fs.mkdirSync(profileImagesDir, { recursive: true });
  }
}

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
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // In production, consider using memory storage for cloud uploads
    if (process.env.NODE_ENV === 'production') {
      cb(null, '/tmp/uploads/profile-images');
    } else {
      cb(null, profileImagesDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `profile-${req.user?.id || 'anonymous'}-${uniqueSuffix}${fileExtension}`);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // In production, use tmp directory
    if (process.env.NODE_ENV === 'production') {
      cb(null, '/tmp/uploads');
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    if (file.fieldname === 'resume') {
      cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    } else if (file.fieldname === 'avatar') {
      cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    } else {
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }
});

// ===== MULTER INSTANCES =====
const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export default upload;
export { uploadProfileImage };