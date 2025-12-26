// middlewares/upload.middleware.ts
import multer from "multer";

// memory storage
const storage = multer.memoryStorage();

export const upload = multer({ storage });
