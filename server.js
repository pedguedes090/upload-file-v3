// Server.js - Backend for Hugging Face Upload
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import * as hub from '@huggingface/hub';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files from current directory
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename with timestamp
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, `${timestamp}-${originalName}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Hugging Face configuration
const accessToken = process.env.HUGGINGFACE_TOKEN || "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";
const defaultRepo = {
  type: process.env.DEFAULT_REPO_TYPE || "dataset",
  name: process.env.DEFAULT_REPO_NAME || "datalocalapi/data1",
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// List user's models/datasets
app.get('/api/repos/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['models', 'datasets'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid repository type' });
    }
      const { name: username } = await hub.whoAmI({ credentials: { accessToken } });
    
    let repos = [];
    if (type === 'models') {
      for await (const model of hub.listModels({
        search: { owner: username },
        credentials: { accessToken }
      })) {
        repos.push(model);
      }
    } else if (type === 'datasets') {
      for await (const dataset of hub.listDatasets({
        search: { owner: username },
        credentials: { accessToken }
      })) {
        repos.push(dataset);
      }
    }
    
    console.log(`📋 Found ${repos.length} ${type} for user ${username}`);
    res.json({ success: true, repos });
  } catch (error) {
    console.error('Error listing repos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new repository
app.post('/api/repo/create', async (req, res) => {  try {
    const { repoName, repoType, license, private: isPrivate } = req.body;
    const { name: username } = await hub.whoAmI({ credentials: { accessToken } });
    
    const repo = {
      type: repoType,
      name: `${username}/${repoName}`,
    };

    await hub.createRepo({
      repo,
      credentials: { accessToken },
      license: license || "mit",
      private: isPrivate || false,
    });

    res.json({ success: true, repo });
  } catch (error) {
    console.error('Error creating repo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload files to Hugging Face
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    const { targetPath } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    console.log(`📤 Starting upload of ${files.length} file(s) to ${defaultRepo.name}`);

    const repo = {
      type: defaultRepo.type,
      name: defaultRepo.name,
    };    // Ensure repo exists
    try {
      await hub.createRepo({
        repo,
        credentials: { accessToken },
        license: "mit",
      });
      console.log(`✅ Repository ${repo.name} created/verified`);
    } catch (e) {
      if (e.statusCode !== 409) { // 409 = repo already exists
        throw e;
      }
      console.log(`ℹ️  Repository ${repo.name} already exists`);
    }

    const uploadResults = [];

    for (const file of files) {
      const fileExtension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, fileExtension);
      const randomString = generateRandomString();
      const newFileName = `${baseName}_${randomString}${fileExtension}`;
      const filePath = targetPath 
        ? `${targetPath}/${newFileName}` 
        : newFileName;

      try {
        console.log(`📁 Uploading ${file.originalname} as ${newFileName} (${formatFileSize(file.size)}) to ${filePath}`);
          await hub.uploadFiles({
          repo,
          credentials: { accessToken },
          files: [
            {
              path: filePath,
              content: new Blob([fs.readFileSync(file.path)]),
            },
          ],
        });

        const fileUrl = `https://royal-brook-5ce5.lab70018.workers.dev/${filePath}`;
        
        uploadResults.push({
          originalName: file.originalname,
          path: filePath,
          url: fileUrl,
          size: file.size
        });

        console.log(`✅ Successfully uploaded ${file.originalname}`);

        // Clean up temporary file
        fs.unlinkSync(file.path);
      } catch (uploadError) {
        console.error(`❌ Error uploading ${file.originalname}:`, uploadError);
        uploadResults.push({
          originalName: file.originalname,
          error: uploadError.message || 'Upload failed'
        });
        
        // Clean up temporary file even on error
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      }
    }

    const successCount = uploadResults.filter(r => !r.error).length;
    console.log(`🎉 Upload completed: ${successCount}/${files.length} files successful`);

    res.json({ 
      success: true, 
      files: uploadResults.map(file => ({
        url: file.url || null,
        error: file.error || null
      })).filter(file => file.url || file.error)
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to generate 6-digit random string
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8).padEnd(6, '0');
}

// List files in repository
app.get('/api/repo/:type/:name/files', async (req, res) => {
  try {
    const { type, name } = req.params;
    const repo = { type, name };

    const files = [];
    for await (const fileInfo of hub.listFiles({ repo })) {
      files.push(fileInfo);
    }

    res.json({ success: true, files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete file from repository
app.delete('/api/repo/:type/:name/files/*', async (req, res) => {
  try {
    const { type, name } = req.params;
    const filePath = req.params[0]; // Get the rest of the path

    const repo = { type, name };    await hub.deleteFile({
      repo,
      credentials: { accessToken },
      path: filePath
    });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Upload interface available at http://localhost:${PORT}`);
  console.log(`🔑 Using Hugging Face token: ${accessToken.substring(0, 10)}...`);
  console.log(`📦 Default repository: ${defaultRepo.name} (${defaultRepo.type})`);
}).on('error', (err) => {
  console.error('❌ Error starting server:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is already in use. Please try a different port.`);
  }
});
