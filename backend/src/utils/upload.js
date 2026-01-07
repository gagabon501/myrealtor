import fs from "fs";
import path from "path";
import multer from "multer";

export const getUploadsRoot = () =>
  process.env.UPLOADS_ROOT || path.resolve(process.cwd(), "uploads");

export const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const makeUploadsSubdir = (subDir) => {
  const uploadsRoot = getUploadsRoot();
  const target = path.join(uploadsRoot, subDir);
  ensureDir(target);
  return target;
};

export const createDiskStorage = (subDir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = makeUploadsSubdir(subDir);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

export const coerceToArray = (value) => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

export const buildDocumentRecords = ({
  files,
  module,
  ownerType,
  ownerId,
  category,
  descriptions,
  labels,
  uploadedBy,
  subDir = "documents",
}) => {
  const fileList = coerceToArray(files);
  const descList = coerceToArray(descriptions);
  if (fileList.length !== descList.length) {
    throw new Error("Descriptions count must match uploaded files");
  }
  const labelList = coerceToArray(labels);

  return fileList.map((file, idx) => {
    const description = descList[idx];
    if (!description || typeof description !== "string" || !description.trim()) {
      throw new Error("Document description is required for each file");
    }
    const label = labelList[idx] || file.originalname;
    return {
      module,
      ownerType,
      ownerId,
      category,
      label,
      description: description.trim(),
      filePath: `/uploads/${subDir}/${file.filename}`,
      mimeType: file.mimetype,
      originalName: file.originalname,
      size: file.size,
      uploadedBy,
    };
  });
};

