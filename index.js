// Upload single file to Hugging Face
import * as hub from '@huggingface/hub';
import fs from 'fs';
import { Blob } from 'buffer';
import path from 'path';

// Access token Hugging Face
const accessToken = "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";

// Repo dataset
const repo = {
  type: "dataset",
  name: "datalocalapi/data1",
};

// Đường dẫn file local
const localFilePath = "C:/Users/dun/Videos/2025-03-22 15-06-07.mkv";

// Đường dẫn trong repo
const uploadPath = "2025-03-22 15-06-07.mkv";

async function uploadFile() {
  try {
    // Tạo repo nếu chưa có
    try {
      await hub.createRepo({
        repo,
        accessToken,
        license: "mit",
      });
      console.log("Repo created.");
    } catch (e) {
      if (e.statusCode === 409) {
        console.log("Repo đã tồn tại, bỏ qua tạo mới.");
      } else {
        console.error("Lỗi tạo repo:", e);
        throw e;
      }
    }

    // Upload file với Blob
    await hub.uploadFiles({
      repo,
      accessToken,
      files: [
        {
          path: uploadPath,
          content: new Blob([fs.readFileSync(localFilePath)]),
        },
      ],
    });

    const fileUrl = `https://huggingface.co/datasets/${repo.name}/resolve/main/${uploadPath}`;
    console.log("Upload thành công!");
    console.log("URL:", fileUrl);
    
  } catch (error) {
    console.error("Lỗi upload:", error);
  }
}

uploadFile();
