import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  initDatabase,
  findUserByEmail,
  createUser,
  findUserById,
  recordActivity,
  getUserActivities,
  getDbStatus,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  getUserPlants,
  createPlant,
  deletePlant,
  getUserTasks,
  createTask,
  toggleTask,
  deleteTask,
  seedDefaultPlantsAndTasks,
} from './server/db.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const SUPPORTED_LANGUAGES = new Set(['en', 'gu', 'hi']);
const isSupportedLanguage = (value: unknown): value is 'en' | 'gu' | 'hi' =>
  typeof value === 'string' && SUPPORTED_LANGUAGES.has(value);

// Initialize Google GenAI client server-side
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PLANT_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isPlantImage: {
      type: Type.BOOLEAN,
      description: 'True if image contains a plant, leaf, crop, flower, fruit, seedling or botanical specimen. False if not a plant (e.g. human face, pet, vehicle, furniture, food dish, text screenshot, phone, watch, cup, laptop).',
    },
    plantName: {
      type: Type.STRING,
      description: 'Identified botanical plant or crop common name in the requested language (e.g. Tomato / ટામેટા / टमाटर). If not a plant, set to "None".',
    },
    scientificName: {
      type: Type.STRING,
      description: 'Botanical scientific binomial nomenclature if identifiable (e.g. Solanum lycopersicum). If not identifiable or not a plant, set to "Unknown".',
    },
    condition: {
      type: Type.STRING,
      description: 'Detected issue or health status in requested language (e.g. "Possible Early Blight", "Healthy Plant", or "No plant detected").',
    },
    conditionType: {
      type: Type.STRING,
      description: 'Must be one of: disease, pest, nutrient_deficiency, environmental_stress, healthy, uncertain',
    },
    confidence: {
      type: Type.INTEGER,
      description: 'Integer 0-100 reflecting genuine visual confidence. If ambiguous or not a plant, 0.',
    },
    severity: {
      type: Type.STRING,
      description: 'Must be one of: low, moderate, high, unknown',
    },
    symptoms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Observable visible symptoms in requested language. Empty if none or not a plant.',
    },
    possibleCauses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Probable biological or environmental root causes in requested language.',
    },
    treatment: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Practical, safe, non-toxic cultural treatment steps in requested language.',
    },
    whatToAvoid: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Crucial mistakes and warnings to avoid in requested language.',
    },
    wateringAdvice: {
      type: Type.STRING,
      description: 'Soil and foliage watering advice in requested language (based on plant/soil, not live weather).',
    },
    prevention: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Long-term preventive cultural practices in requested language.',
    },
    nextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Actionable next steps in requested language.',
    },
    monitoringPlan: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '48-72 hour monitoring guidance in requested language.',
    },
    needsMoreInformation: {
      type: Type.BOOLEAN,
      description: 'True if visual symptoms alone cannot confirm diagnosis or if image is unclear/non-plant.',
    },
    followUpQuestion: {
      type: Type.STRING,
      description: 'Diagnostic question or prompt for user in requested language.',
    },
    analysisNote: {
      type: Type.STRING,
      description: 'Honest summary explanation of diagnosis, confidence rationale, or uncertainty message.',
    },
    plantType: {
      type: Type.STRING,
      description: 'Category of specimen (e.g., Solanaceous Crop, Leafy Green / Herb, Fruit Tree, Legume, Ornamental). Set to "None" if non-plant.',
    },
    overallHealth: {
      type: Type.STRING,
      description: 'Overall vitality classification (e.g., Optimal, Mild Stress, Moderate Disease, Critical Alert).',
    },
    diseaseConfidence: {
      type: Type.INTEGER,
      description: 'Pathological confidence integer 0-100 regarding identified disease or problem. 0 if no disease or not a plant.',
    },
    sunlightRequirement: {
      type: Type.STRING,
      description: 'Specific sunlight requirement (e.g., Full Sun (6-8 hours daily), Partial Shade, etc.).',
    },
    soilRecommendation: {
      type: Type.STRING,
      description: 'Optimal soil or substrate recommendation (pH range, texture, organic matter) in requested language.',
    },
    fertilizerRecommendation: {
      type: Type.STRING,
      description: 'Recommended organic or balanced fertilizer advice in requested language.',
    },
    immediateActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Urgent immediate actions required today.',
    },
    careTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Additional long-term agronomic care tips.',
    },
  },
  required: [
    'isPlantImage',
    'plantName',
    'scientificName',
    'condition',
    'conditionType',
    'confidence',
    'severity',
    'symptoms',
    'possibleCauses',
    'treatment',
    'whatToAvoid',
    'wateringAdvice',
    'prevention',
    'nextSteps',
    'monitoringPlan',
    'needsMoreInformation',
    'followUpQuestion',
    'analysisNote',
    'plantType',
    'overallHealth',
    'diseaseConfidence',
    'sunlightRequirement',
    'soilRecommendation',
    'fertilizerRecommendation',
    'immediateActions',
    'careTips',
  ],
};

const MAX_PLANT_IMAGE_BYTES = 16 * 1024 * 1024;
const SUPPORTED_PLANT_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DIAGNOSIS_CONDITION_TYPES = new Set([
  'disease',
  'pest',
  'nutrient_deficiency',
  'environmental_stress',
  'healthy',
  'uncertain',
]);
const DIAGNOSIS_SEVERITIES = new Set(['low', 'moderate', 'high', 'unknown']);
const DIAGNOSIS_STRING_FIELDS = [
  'plantName',
  'scientificName',
  'condition',
  'wateringAdvice',
  'followUpQuestion',
  'analysisNote',
  'plantType',
  'overallHealth',
  'sunlightRequirement',
  'soilRecommendation',
  'fertilizerRecommendation',
] as const;
const DIAGNOSIS_STRING_ARRAY_FIELDS = [
  'symptoms',
  'possibleCauses',
  'treatment',
  'whatToAvoid',
  'prevention',
  'nextSteps',
  'monitoringPlan',
  'immediateActions',
  'careTips',
] as const;

class PlantScanRequestError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(message);
    this.name = 'PlantScanRequestError';
  }
}

const PNG_CRC_TABLE = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function hasValidPngStructure(imageBytes: Buffer): boolean {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (imageBytes.length < 57 || !imageBytes.subarray(0, 8).equals(signature)) return false;

  let offset = 8;
  let hasHeader = false;
  let hasImageData = false;
  while (offset + 12 <= imageBytes.length) {
    const chunkLength = imageBytes.readUInt32BE(offset);
    const chunkEnd = offset + chunkLength + 12;
    if (chunkEnd > imageBytes.length) return false;

    const chunkType = imageBytes.toString('ascii', offset + 4, offset + 8);
    if (!hasHeader && chunkType !== 'IHDR') return false;
    if (chunkType === 'IHDR') {
      if (hasHeader || chunkLength !== 13) return false;
      const width = imageBytes.readUInt32BE(offset + 8);
      const height = imageBytes.readUInt32BE(offset + 12);
      if (!width || !height) return false;
      hasHeader = true;
    }
    if (chunkType === 'IDAT') hasImageData = true;

    let crc = 0xffffffff;
    for (let index = offset + 4; index < offset + 8 + chunkLength; index += 1) {
      crc = PNG_CRC_TABLE[(crc ^ imageBytes[index]) & 0xff] ^ (crc >>> 8);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    if (crc !== imageBytes.readUInt32BE(offset + 8 + chunkLength)) return false;

    if (chunkType === 'IEND') {
      return chunkLength === 0 && hasHeader && hasImageData && chunkEnd === imageBytes.length;
    }
    offset = chunkEnd;
  }
  return false;
}

function hasValidJpegStructure(imageBytes: Buffer): boolean {
  if (
    imageBytes.length < 8 ||
    imageBytes[0] !== 0xff ||
    imageBytes[1] !== 0xd8 ||
    imageBytes[imageBytes.length - 2] !== 0xff ||
    imageBytes[imageBytes.length - 1] !== 0xd9
  ) {
    return false;
  }

  const frameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;
  let hasFrame = false;
  while (offset < imageBytes.length - 2) {
    if (imageBytes[offset] !== 0xff) return false;
    while (imageBytes[offset] === 0xff) offset += 1;
    const marker = imageBytes[offset];
    offset += 1;

    if (marker === 0xd9) return hasFrame;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > imageBytes.length - 2) return false;

    const segmentLength = imageBytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > imageBytes.length - 2) return false;
    const segmentEnd = offset + segmentLength;
    if (frameMarkers.has(marker)) {
      if (segmentLength < 8 || !imageBytes.readUInt16BE(offset + 3) || !imageBytes.readUInt16BE(offset + 5)) {
        return false;
      }
      hasFrame = true;
    }
    if (marker === 0xda) {
      return hasFrame && segmentEnd < imageBytes.length - 2;
    }
    offset = segmentEnd;
  }
  return false;
}

function hasValidWebpStructure(imageBytes: Buffer): boolean {
  if (
    imageBytes.length < 20 ||
    imageBytes.toString('ascii', 0, 4) !== 'RIFF' ||
    imageBytes.toString('ascii', 8, 12) !== 'WEBP' ||
    imageBytes.readUInt32LE(4) !== imageBytes.length - 8
  ) {
    return false;
  }

  let offset = 12;
  let hasImageData = false;
  while (offset + 8 <= imageBytes.length) {
    const chunkType = imageBytes.toString('ascii', offset, offset + 4);
    const chunkLength = imageBytes.readUInt32LE(offset + 4);
    const chunkEnd = offset + 8 + chunkLength + (chunkLength % 2);
    if (chunkEnd > imageBytes.length) return false;
    if (chunkType === 'VP8 ' || chunkType === 'VP8L' || chunkType === 'ANMF') {
      hasImageData = true;
    }
    offset = chunkEnd;
  }
  return hasImageData && offset === imageBytes.length;
}

function decodePlantImage(image: unknown): { mimeType: string; data: string } {
  if (!image || typeof image !== 'object') {
    throw new PlantScanRequestError('Image data is required.', 400, 'IMAGE_MISSING');
  }

  const payload = image as { base64?: unknown; mimeType?: unknown };
  if (typeof payload.base64 !== 'string' || payload.base64.length === 0) {
    throw new PlantScanRequestError('Image data is required.', 400, 'IMAGE_MISSING');
  }

  let encodedData = payload.base64;
  let dataUrlMimeType: string | undefined;
  if (encodedData.startsWith('data:')) {
    const dataUrlMatch = encodedData.match(/^data:([^;,]+);base64,([A-Za-z0-9+/]*={0,2})$/i);
    if (!dataUrlMatch) {
      throw new PlantScanRequestError('The image data URL is invalid.', 400, 'INVALID_IMAGE_DATA');
    }
    dataUrlMimeType = dataUrlMatch[1].toLowerCase();
    encodedData = dataUrlMatch[2];
  }

  const declaredMimeType =
    typeof payload.mimeType === 'string' ? payload.mimeType.toLowerCase().trim() : undefined;
  if (declaredMimeType && dataUrlMimeType && declaredMimeType !== dataUrlMimeType) {
    throw new PlantScanRequestError('Image type does not match its data.', 400, 'INVALID_IMAGE_TYPE');
  }

  const mimeType = dataUrlMimeType || declaredMimeType;
  if (!mimeType || !SUPPORTED_PLANT_IMAGE_TYPES.has(mimeType)) {
    throw new PlantScanRequestError('Use a JPEG, PNG, or WebP image.', 415, 'UNSUPPORTED_IMAGE_TYPE');
  }

  if (
    encodedData.length === 0 ||
    encodedData.length % 4 === 1 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(encodedData)
  ) {
    throw new PlantScanRequestError('The image data is malformed.', 400, 'INVALID_IMAGE_DATA');
  }

  const paddingLength = encodedData.endsWith('==') ? 2 : encodedData.endsWith('=') ? 1 : 0;
  const estimatedBytes = Math.floor((encodedData.length * 3) / 4) - paddingLength;
  if (estimatedBytes > MAX_PLANT_IMAGE_BYTES) {
    throw new PlantScanRequestError('The image exceeds the 16 MB limit.', 413, 'IMAGE_TOO_LARGE');
  }

  const imageBytes = Buffer.from(encodedData, 'base64');
  if (
    imageBytes.length === 0 ||
    imageBytes.toString('base64').replace(/=+$/, '') !== encodedData.replace(/=+$/, '')
  ) {
    throw new PlantScanRequestError('The image data is malformed.', 400, 'INVALID_IMAGE_DATA');
  }

  const isJpeg = hasValidJpegStructure(imageBytes);
  const isPng = hasValidPngStructure(imageBytes);
  const isWebp = hasValidWebpStructure(imageBytes);
  const signatureMatches =
    (mimeType === 'image/jpeg' && isJpeg) ||
    (mimeType === 'image/png' && isPng) ||
    (mimeType === 'image/webp' && isWebp);

  if (!signatureMatches) {
    throw new PlantScanRequestError(
      'The image content does not match its JPEG, PNG, or WebP type.',
      400,
      'INVALID_IMAGE_DATA',
    );
  }

  return { mimeType, data: imageBytes.toString('base64') };
}

function parsePlantDiagnosis(responseText: string): Record<string, any> {
  const trimmedResponse = responseText.trim();
  const fencedJsonMatch = trimmedResponse.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  let parsed: unknown;
  try {
    parsed = JSON.parse(fencedJsonMatch ? fencedJsonMatch[1] : trimmedResponse);
  } catch {
    throw new PlantScanRequestError(
      'The AI service returned an unreadable result.',
      502,
      'INVALID_MODEL_RESPONSE',
    );
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new PlantScanRequestError(
      'The AI service returned an invalid result.',
      502,
      'INVALID_MODEL_RESPONSE',
    );
  }

  const diagnosis = parsed as Record<string, any>;
  const hasValidStrings = DIAGNOSIS_STRING_FIELDS.every(
    (field) => typeof diagnosis[field] === 'string',
  );
  const hasValidStringArrays = DIAGNOSIS_STRING_ARRAY_FIELDS.every(
    (field) =>
      Array.isArray(diagnosis[field]) &&
      diagnosis[field].every((value: unknown) => typeof value === 'string'),
  );
  const hasValidConfidence =
    Number.isInteger(diagnosis.confidence) &&
    diagnosis.confidence >= 0 &&
    diagnosis.confidence <= 100;
  const hasValidDiseaseConfidence =
    Number.isInteger(diagnosis.diseaseConfidence) &&
    diagnosis.diseaseConfidence >= 0 &&
    diagnosis.diseaseConfidence <= 100;
  const hasValidDiagnosis =
    typeof diagnosis.isPlantImage === 'boolean' &&
    hasValidStrings &&
    hasValidStringArrays &&
    typeof diagnosis.needsMoreInformation === 'boolean' &&
    DIAGNOSIS_CONDITION_TYPES.has(diagnosis.conditionType) &&
    DIAGNOSIS_SEVERITIES.has(diagnosis.severity) &&
    hasValidConfidence &&
    hasValidDiseaseConfidence;

  if (!hasValidDiagnosis) {
    throw new PlantScanRequestError(
      'The AI service returned an incomplete or invalid result.',
      502,
      'INVALID_MODEL_RESPONSE',
    );
  }

  return diagnosis;
}

function parseDoctorResponse(responseText: string): {
  replyText: string;
  suggestedOptions: string[];
  diagnosticInsight?: { diagnosis?: string; action?: string; confidence?: string };
} {
  const trimmedResponse = responseText.trim();
  const fencedJsonMatch = trimmedResponse.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  let parsed: unknown;
  try {
    parsed = JSON.parse(fencedJsonMatch ? fencedJsonMatch[1] : trimmedResponse);
  } catch {
    throw new Error('INVALID_DOCTOR_RESPONSE');
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    typeof (parsed as { replyText?: unknown }).replyText !== 'string' ||
    !(parsed as { replyText: string }).replyText.trim()
  ) {
    throw new Error('INVALID_DOCTOR_RESPONSE');
  }

  const result = parsed as {
    replyText: string;
    suggestedOptions?: unknown;
    diagnosticInsight?: {
      diagnosis?: unknown;
      action?: unknown;
      confidence?: unknown;
    };
  };
  if (
    result.suggestedOptions !== undefined &&
    (!Array.isArray(result.suggestedOptions) ||
      !result.suggestedOptions.every((option) => typeof option === 'string'))
  ) {
    throw new Error('INVALID_DOCTOR_RESPONSE');
  }
  if (
    result.diagnosticInsight !== undefined &&
    (typeof result.diagnosticInsight !== 'object' ||
      result.diagnosticInsight === null ||
      Array.isArray(result.diagnosticInsight) ||
      Object.values(result.diagnosticInsight).some(
        (value) => value !== undefined && typeof value !== 'string',
      ))
  ) {
    throw new Error('INVALID_DOCTOR_RESPONSE');
  }

  return {
    replyText: result.replyText.trim(),
    suggestedOptions: Array.isArray(result.suggestedOptions)
      ? result.suggestedOptions.filter((option): option is string => typeof option === 'string')
      : [],
    diagnosticInsight: result.diagnosticInsight as
      | { diagnosis?: string; action?: string; confidence?: string }
      | undefined,
  };
}

async function startServer() {
  const app = express();

  // Initialize MySQL Database connection and schema
  try {
    await initDatabase();
  } catch (dbErr) {
    console.warn('[DB] Initial connection attempt completed with notice:', dbErr);
  }

  // Accept large image payloads up to 25MB
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use((error: any, req: any, res: any, next: any) => {
    if (!req.path.startsWith('/api/')) {
      return next(error);
    }
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({
        error: 'The request exceeds the allowed size.',
        code: 'IMAGE_TOO_LARGE',
      });
    }
    if (error?.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: 'The request body is invalid.',
        code: 'INVALID_REQUEST',
      });
    }
    return next(error);
  });

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
    });
  });

  // Database status endpoint (XAMPP / MySQL)
  app.get('/api/db-status', (req, res) => {
    res.json({
      success: true,
      ...getDbStatus(),
    });
  });

  // Authentication Middlewares
  const authenticateUser = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Session expired or invalid token. Please sign in again.' });
    }
    req.user = decoded;
    next();
  };

  const optionalAuthenticateUser = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        req.user = decoded;
      }
    }
    next();
  };

  // 1. REGISTRATION ENDPOINT
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Full name is required.' });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ error: 'Valid email address is required.' });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      // Normalize role: support 'farmer' and 'urban_planner'
      const normalizedRole: 'farmer' | 'urban_planner' =
        role === 'urban' || role === 'urban_planner' ? 'urban_planner' : 'farmer';

      const normalizedEmail = String(email).trim().toLowerCase();

      // Check whether user already exists
      const existingUser = await findUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      // Hash password securely with bcrypt
      const password_hash = await hashPassword(password);

      // Save user to MySQL
      const newUser = await createUser({
        name: name.trim(),
        email: normalizedEmail,
        password_hash,
        role: normalizedRole,
      });

      // Issue JWT session token
      const token = generateToken(newUser);

      // Record welcome activity in MySQL
      try {
        await recordActivity({
          user_id: newUser.id,
          activity_type: 'account_created',
          title: `Account Created: ${normalizedRole === 'farmer' ? 'Kisan Pro Member' : 'Urban Planner'}`,
          content: {
            role: normalizedRole,
            name: newUser.name,
            registered_at: new Date().toISOString(),
          },
        });
      } catch (actErr) {
        console.warn('[DB] Could not record registration activity:', actErr);
      }

      return res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      return res.status(500).json({
        error: 'Failed to create account. Please verify database connection and try again.',
        details: error?.message,
      });
    }
  });

  // 2. SIGN IN / LOGIN ENDPOINT
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const normalizedEmail = String(email).trim().toLowerCase();

      // Lookup user in MySQL / fallback store
      const user = await findUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Verify bcrypt password hash
      let isMatch = await verifyPassword(String(password), user.password_hash);
      if (!isMatch && typeof password === 'string' && password.trim() !== password) {
        isMatch = await verifyPassword(password.trim(), user.password_hash);
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Issue JWT session token
      const token = generateToken(user);

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({
        error: 'Failed to sign in. Please try again.',
        details: error?.message,
      });
    }
  });

  // 3. GET CURRENT AUTHENTICATED USER
  app.get('/api/auth/me', authenticateUser, async (req: any, res) => {
    try {
      const user = await findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }
      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to retrieve profile.' });
    }
  });

  // 4. LOGOUT ENDPOINT
  app.post('/api/auth/logout', (req, res) => {
    return res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  });

  // 5. USER ACTIVITY HISTORY (SCOPED STRICTLY TO AUTHENTICATED USER ID)
  app.get('/api/history', authenticateUser, async (req: any, res) => {
    try {
      const activities = await getUserActivities(req.user.id, 50);
      return res.json({
        success: true,
        activities,
      });
    } catch (error: any) {
      console.error('Fetch history error:', error);
      return res.status(500).json({ error: 'Failed to retrieve user activity history.' });
    }
  });

  // 6. RECORD USER ACTIVITY MANUALLY
  app.post('/api/history', authenticateUser, async (req: any, res) => {
    try {
      const { activity_type, title, content } = req.body;
      if (!activity_type || !title) {
        return res.status(400).json({ error: 'activity_type and title are required.' });
      }

      const record = await recordActivity({
        user_id: req.user.id,
        activity_type,
        title,
        content,
      });

      return res.status(201).json({
        success: true,
        activity: record,
      });
    } catch (error: any) {
      console.error('Record activity error:', error);
      return res.status(500).json({ error: 'Failed to record user activity.' });
    }
  });

  // ====================================================================
  // PHASE 3.6 — PLANT CARE TASKS & REMINDERS API
  // ====================================================================
  app.get('/api/tasks', optionalAuthenticateUser, async (req: any, res) => {
    try {
      if (req.user && req.user.id) {
        let tasks = await getUserTasks(req.user.id);
        if (tasks.length === 0) {
          await seedDefaultPlantsAndTasks(req.user.id, req.user.role || 'farmer');
          tasks = await getUserTasks(req.user.id);
        }
        return res.json({ success: true, tasks });
      }

      // Guest default tasks
      return res.json({
        success: true,
        tasks: [
          {
            id: 101,
            user_id: 0,
            plant_id: null,
            task_type: 'watering',
            title: 'Morning Root Irrigation (Skip if Rain > 60%)',
            description: 'Check 2-inch topsoil moisture before applying water.',
            due_date: 'Today',
            completed: false,
          },
          {
            id: 102,
            user_id: 0,
            plant_id: null,
            task_type: 'inspection',
            title: 'Foliar Inspection for Blight & Aphid Spots',
            description: 'Inspect leaf undersides of specimen plants.',
            due_date: 'Today',
            completed: false,
          },
          {
            id: 103,
            user_id: 0,
            plant_id: null,
            task_type: 'fertilizing',
            title: 'Apply Organic Neem Cake or Vermicompost',
            description: 'Top-dress soil substrate around root perimeter.',
            due_date: 'Tomorrow',
            completed: false,
          },
        ],
      });
    } catch (error: any) {
      console.error('Get tasks error:', error);
      return res.status(500).json({ error: 'Failed to retrieve care tasks.' });
    }
  });

  app.post('/api/tasks', authenticateUser, async (req: any, res) => {
    try {
      const { title, task_type, plant_id, description, due_date } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Task title is required.' });
      }

      const task = await createTask({
        user_id: req.user.id,
        plant_id: plant_id || null,
        task_type: task_type || 'watering',
        title: title.trim(),
        description: description || '',
        due_date: due_date || 'Today',
      });

      return res.status(201).json({ success: true, task });
    } catch (error: any) {
      console.error('Create task error:', error);
      return res.status(500).json({ error: 'Failed to create task.' });
    }
  });

  app.patch('/api/tasks/:id/toggle', authenticateUser, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id, 10);
      const updated = await toggleTask(req.user.id, taskId, req.body.completed);
      if (!updated) {
        return res.status(404).json({ error: 'Task not found or unauthorized.' });
      }

      // Record activity if completed
      if (updated.completed) {
        try {
          await recordActivity({
            user_id: req.user.id,
            activity_type: 'care_reminder',
            title: `Care Task Completed: ${updated.title}`,
            content: {
              task_id: updated.id,
              task_type: updated.task_type,
              completed_at: new Date().toISOString(),
            },
          });
        } catch (actErr) {}
      }

      return res.json({ success: true, task: updated });
    } catch (error: any) {
      console.error('Toggle task error:', error);
      return res.status(500).json({ error: 'Failed to update task status.' });
    }
  });

  app.delete('/api/tasks/:id', authenticateUser, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id, 10);
      const deleted = await deleteTask(req.user.id, taskId);
      return res.json({ success: true, deleted });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to delete task.' });
    }
  });

  // ====================================================================
  // PHASE 3 — USER MONITORED PLANTS LEDGER API
  // ====================================================================
  app.get('/api/plants', optionalAuthenticateUser, async (req: any, res) => {
    try {
      if (req.user && req.user.id) {
        let plants = await getUserPlants(req.user.id);
        if (plants.length === 0) {
          await seedDefaultPlantsAndTasks(req.user.id, req.user.role || 'farmer');
          plants = await getUserPlants(req.user.id);
        }
        return res.json({ success: true, plants });
      }

      return res.json({
        success: true,
        plants: [
          {
            id: 1,
            user_id: 0,
            name: 'Tomato (Main Acreage Plot)',
            species: 'Solanum lycopersicum',
            location_type: 'field',
            sunlight: 'full_sun',
            watering_frequency: 'every_2_days',
            health_status: 'Healthy',
            health_score: 87,
            notes: 'High vigor vegetative stage.',
          },
          {
            id: 2,
            user_id: 0,
            name: 'Cotton Block A',
            species: 'Gossypium hirsutum',
            location_type: 'field',
            sunlight: 'full_sun',
            watering_frequency: 'twice_weekly',
            health_status: 'Healthy',
            health_score: 91,
            notes: 'Active boll maturation.',
          },
        ],
      });
    } catch (error: any) {
      console.error('Get plants error:', error);
      return res.status(500).json({ error: 'Failed to retrieve plants.' });
    }
  });

  app.post('/api/plants', authenticateUser, async (req: any, res) => {
    try {
      const { name, species, location_type, sunlight, watering_frequency, health_status, health_score, notes } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Plant name is required.' });
      }

      const plant = await createPlant({
        user_id: req.user.id,
        name: name.trim(),
        species: species || 'Botanical specimen',
        location_type: location_type || 'balcony',
        sunlight: sunlight || 'full_sun',
        watering_frequency: watering_frequency || 'daily',
        health_status: health_status || 'Healthy',
        health_score: health_score !== undefined ? parseInt(health_score, 10) : 88,
        notes: notes || '',
      });

      try {
        await recordActivity({
          user_id: req.user.id,
          activity_type: 'plant_saved',
          title: `Monitored Plant Added: ${plant.name}`,
          content: {
            plant_id: plant.id,
            species: plant.species,
            health_score: plant.health_score,
          },
        });
      } catch (actErr) {}

      return res.status(201).json({ success: true, plant });
    } catch (error: any) {
      console.error('Create plant error:', error);
      return res.status(500).json({ error: 'Failed to create plant.' });
    }
  });

  app.delete('/api/plants/:id', authenticateUser, async (req: any, res) => {
    try {
      const plantId = parseInt(req.params.id, 10);
      const deleted = await deletePlant(req.user.id, plantId);
      return res.json({ success: true, deleted });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to delete plant.' });
    }
  });

  // ====================================================================
  // PHASE 3.3 — URBAN FARMING INTELLIGENCE API (REAL AI)
  // ====================================================================
  app.post('/api/urban-farming-intelligence', optionalAuthenticateUser, async (req: any, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'Gemini API key is not configured.' });
      }

      const {
        spaceType = 'balcony',
        containerType = 'terracotta_pots',
        sunHours = 5,
        plantTypes = ['Tomato', 'Basil', 'Mint'],
        location = 'Rajkot / Ahmedabad, Gujarat',
        lang = 'en',
      } = req.body;

      if (!isSupportedLanguage(lang)) {
        return res.status(400).json({ error: 'Unsupported language. Use en, gu, or hi.' });
      }

      const languageInstruction =
        lang === 'gu'
          ? 'Respond entirely in Gujarati (ગુજરાતી).'
          : lang === 'hi'
          ? 'Respond entirely in Hindi (हिन्दी).'
          : 'Respond in clear English.';

      const URBAN_SCHEMA = {
        type: Type.OBJECT,
        properties: {
          spaceSuitabilityScore: {
            type: Type.INTEGER,
            description: 'Score 0-100 indicating urban spatial viability.',
          },
          microclimateAnalysis: {
            type: Type.STRING,
            description: 'Analysis of heat reflection, wind drafts, and light exposure in requested language.',
          },
          pottingSubstrateFormula: {
            type: Type.STRING,
            description: 'Ideal urban potting mix proportions (e.g. 40% cocopeat, 30% vermicompost, 20% soil, 10% perlite) in requested language.',
          },
          companionPlantingAdvice: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Beneficial companion planting combinations for urban container health.',
          },
          verticalOptimizationTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Strategies to maximize yield vertically in restricted square footage.',
          },
          estimatedMonthlyYield: {
            type: Type.STRING,
            description: 'Realistic monthly edible yield projection (e.g. 2-4 kg fresh cherry tomatoes & fresh herb clippings).',
          },
          waterSavingStrategy: {
            type: Type.STRING,
            description: 'Urban container water conservation & self-watering techniques in requested language.',
          },
          immediateRecommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Actionable steps for this week.',
          },
        },
        required: [
          'spaceSuitabilityScore',
          'microclimateAnalysis',
          'pottingSubstrateFormula',
          'companionPlantingAdvice',
          'verticalOptimizationTips',
          'estimatedMonthlyYield',
          'waterSavingStrategy',
          'immediateRecommendations',
        ],
      };

      const prompt = `
You are the PlantPulse AI Urban Agronomy & Spatial Horticulture Engine.
Analyze the following urban grower profile:
- Space Type: ${spaceType} (e.g. Balcony, Rooftop Terrace, Window sill, Hydroponic tower, Kitchen garden)
- Container Type: ${containerType}
- Daily Direct Sunlight: ${sunHours} hours
- Selected Crops/Plants: ${Array.isArray(plantTypes) ? plantTypes.join(', ') : plantTypes}
- Regional Urban Environment: ${location} (Gujarat semi-arid urban climate, high thermal radiation from concrete walls).

Provide scientific, highly practical urban farming intelligence.
${languageInstruction}
`;

      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let urbanResponse: any = null;

      for (const modelCandidate of candidateModels) {
        try {
          urbanResponse = await ai.models.generateContent({
            model: modelCandidate,
            contents: prompt,
            config: {
              systemInstruction: 'You are PlantPulse AI, an expert in urban agriculture, vertical farming, container horticulture, and microclimates.',
              responseMimeType: 'application/json',
              responseSchema: URBAN_SCHEMA,
              temperature: 0.3,
            },
          });
          if (urbanResponse && urbanResponse.text) break;
        } catch (err: any) {
          console.warn(`[Urban Intelligence] Model ${modelCandidate} failed:`, err?.message);
        }
      }

      if (!urbanResponse || !urbanResponse.text) {
        throw new Error('Could not generate urban farming intelligence');
      }

      const parsed = JSON.parse(urbanResponse.text.trim());

      if (req.user && req.user.id) {
        try {
          await recordActivity({
            user_id: req.user.id,
            activity_type: 'urban_intelligence',
            title: `Urban Farming Analysis: ${spaceType} (${parsed.spaceSuitabilityScore}/100)`,
            content: parsed,
          });
        } catch (actErr) {}
      }

      return res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error('Urban intelligence error:', error);
      return res.status(500).json({ error: 'Failed to generate urban intelligence.', details: error?.message });
    }
  });

  // ====================================================================
  // PHASE 3.4 — PERSONALIZED RECOMMENDATIONS API (REAL AI)
  // ====================================================================
  app.post('/api/personalized-recommendations', optionalAuthenticateUser, async (req: any, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'Gemini API key is not configured.' });
      }

      const {
        userType = 'farmer',
        cropName = 'Tomato',
        districtId = 'rajkot',
        weatherData,
        lang = 'en',
      } = req.body;

      if (!isSupportedLanguage(lang)) {
        return res.status(400).json({ error: 'Unsupported language. Use en, gu, or hi.' });
      }

      const languageInstruction =
        lang === 'gu'
          ? 'Respond entirely in Gujarati (ગુજરાતી).'
          : lang === 'hi'
          ? 'Respond entirely in Hindi (हिन्दी).'
          : 'Respond in clear English.';

      const REC_SCHEMA = {
        type: Type.OBJECT,
        properties: {
          primaryRecommendation: {
            type: Type.STRING,
            description: 'Main urgent agronomic directive for today in requested language.',
          },
          irrigationGuidance: {
            type: Type.STRING,
            description: 'Calibrated irrigation instruction taking current humidity and rain into account in requested language.',
          },
          fertilizerTiming: {
            type: Type.STRING,
            description: 'Specific nutrient or fertilizer guidance tailored to current phenological stage in requested language.',
          },
          pestRiskLevel: {
            type: Type.STRING,
            description: 'Must be one of: low, moderate, high',
          },
          pestWatchlist: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Pests or fungal pathogens currently primed by ambient temperature/humidity.',
          },
          actionChecklist: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 concrete actions the grower should complete in the next 48 hours.',
          },
          seasonalTip: {
            type: Type.STRING,
            description: 'Regional agricultural wisdom for the current Gujarat season in requested language.',
          },
        },
        required: [
          'primaryRecommendation',
          'irrigationGuidance',
          'fertilizerTiming',
          'pestRiskLevel',
          'pestWatchlist',
          'actionChecklist',
          'seasonalTip',
        ],
      };

      const prompt = `
You are the PlantPulse AI Personalized Agronomic Engine.
Generate personalized, scientific crop and plant care recommendations for:
- Persona: ${userType === 'farmer' ? 'Commercial Farmer (Acreage plot)' : 'Urban Home & Balcony Gardener (Container plot)'}
- Crop/Plant: ${cropName}
- Location: Gujarat, District: ${districtId.toUpperCase()}
- Current Conditions: Temp ${weatherData?.temperature || '31°C'}, Humidity ${weatherData?.humidity || 68}%, Rain Probability ${weatherData?.rainProbability || 80}%, Soil Moisture ${weatherData?.soilMoistureEst || '42%'}.

Provide actionable, non-toxic, safe recommendations.
${languageInstruction}
`;

      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let recResponse: any = null;

      for (const modelCandidate of candidateModels) {
        try {
          recResponse = await ai.models.generateContent({
            model: modelCandidate,
            contents: prompt,
            config: {
              systemInstruction: 'You are PlantPulse AI, generating personalized agricultural recommendations tailored to Indian weather and soil systems.',
              responseMimeType: 'application/json',
              responseSchema: REC_SCHEMA,
              temperature: 0.3,
            },
          });
          if (recResponse && recResponse.text) break;
        } catch (err: any) {
          console.warn(`[Personalized Rec] Model ${modelCandidate} failed:`, err?.message);
        }
      }

      if (!recResponse || !recResponse.text) {
        throw new Error('Could not generate personalized recommendations');
      }

      const parsed = JSON.parse(recResponse.text.trim());

      if (req.user && req.user.id) {
        try {
          await recordActivity({
            user_id: req.user.id,
            activity_type: 'personalized_advice',
            title: `Smart Recommendation: ${cropName} (${districtId.toUpperCase()})`,
            content: parsed,
          });
        } catch (actErr) {}
      }

      return res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error('Personalized recommendations error:', error);
      return res.status(500).json({ error: 'Failed to generate recommendations.', details: error?.message });
    }
  });

  // REAL AI PLANT & DISEASE ANALYSIS ENDPOINT
  app.post('/api/analyze-plant', optionalAuthenticateUser, async (req: any, res) => {
    try {
      const { image, userContext, lang = 'en' } = req.body;

      if (!isSupportedLanguage(lang)) {
        return res.status(400).json({ error: 'Unsupported language. Use en, gu, or hi.' });
      }

      const { data: cleanBase64, mimeType } = decodePlantImage(image);

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'AI image analysis is not configured on the server.',
          code: 'API_KEY_MISSING',
        });
      }

      const languageInstruction =
        lang === 'gu'
          ? 'Respond entirely in Gujarati (ગુજરાતી). All disease names, symptoms, treatments, what to avoid, and advice must be written in natural, fluent Gujarati script. Keep product name "PlantPulse AI" intact.'
          : lang === 'hi'
          ? 'Respond entirely in Hindi (हिन्दी). All disease names, symptoms, treatments, what to avoid, and advice must be written in natural, fluent Devanagari Hindi script. Keep product name "PlantPulse AI" intact.'
          : 'Respond in clear, professional English.';

      const contextDescription = `
User Context:
- User Type: ${userContext?.userType || 'Farmer'} (${userContext?.userType === 'farmer' ? 'Commercial Acreage Farmer' : 'Home/Balcony Urban Gardener'})
- Selected Plant/Crop: ${userContext?.cropName || 'Tomato'}
- Location: Gujarat, District: ${userContext?.districtName || 'Rajkot'}, Village/City: ${userContext?.villageOrCity || 'Local Area'}
- Growing Space: ${userContext?.growingLocation || (userContext?.userType === 'farmer' ? 'Farm Field Plot' : 'Balcony/Terrace Pots')}
- Environmental note: Gujarat regional climate (semi-arid, black cotton/loam soil, monsoonal moisture patterns).
`;

      const promptText = `
You are the PlantPulse AI Agricultural & Botanical Vision Diagnostic Engine.
Carefully inspect the provided image specimen.

CRITICAL INSTRUCTIONS:
1. PLANT IMAGE VALIDATION (NON-PLANT DETECTION):
   - First determine whether this image actually contains a plant, leaf, crop, flower, fruit, seedling or botanical specimen.
   - If it is NOT a plant (e.g. human face, selfie, animal, car, electronics, phone, laptop, watch, cup, bottle, furniture, food dish, text screenshot):
     * "isPlantImage": false
     * "plantName": "None"
     * "scientificName": "Unknown"
     * "condition": "No plant detected"
     * "conditionType": "uncertain"
     * "confidence": 0
     * "severity": "unknown"
     * "symptoms": []
     * "possibleCauses": []
     * "treatment": []
     * "whatToAvoid": []
     * "wateringAdvice": "Please upload a plant or crop photo to receive watering advice."
     * "prevention": []
     * "nextSteps": ["Upload a clear photo of a plant, leaf, stem, flower, fruit, or crop."]
     * "monitoringPlan": []
     * "needsMoreInformation": true
     * "followUpQuestion": "Please upload a clear plant or leaf image."
     * "analysisNote": "The uploaded photo does not appear to contain a plant or crop specimen."
     (Ensure text strings are translated to the requested language ${languageInstruction}).

2. IMAGE QUALITY VALIDATION:
   - If the image is extremely blurry, dark, overexposed, or unreadable:
     * "isPlantImage": true
     * "condition": "Image unclear"
     * "conditionType": "uncertain"
     * "confidence": 20
     * "severity": "unknown"
     * "needsMoreInformation": true
     * "followUpQuestion": "Please upload a sharper, in-focus photo taken in good lighting."
     * "analysisNote": "The image is not clear enough to reliably identify the plant condition. Please provide a clearer photo."

3. ACCURATE BOTANICAL PATHOLOGY (DO NOT FABRICATE):
   - Inspect the foliage, leaf margins, veination, spots, wilting, curling, powdery coatings, necrosis, chlorosis, or pest evidence.
   - If the plant appears healthy and vigorous, set "condition": "Healthy Plant", "conditionType": "healthy", "severity": "low".
   - If symptoms point to a disease (e.g. Early Blight, Late Blight, Powdery Mildew, Leaf Curl, Rust, nutrient deficiency, pest infestation), diagnose it accurately.
   - Prefix uncertain findings with "Possible" or "Symptoms consistent with" (e.g., "Possible Early Blight"). Do not claim laboratory certainty from a single photo.
   - Reflect realistic visual confidence (e.g. 60-95% depending on clarity of symptoms).
   - "severity" must be one of: "low", "moderate", "high", "unknown".

4. SAFE, PRACTICAL CARE & CULTURAL GUIDANCE:
   - "treatment": Provide safe, practical cultural and organic steps (e.g. remove severely affected leaves, improve airflow, avoid overhead night watering, follow product label for organic neem sprays). Do not provide dangerous chemical pesticide dosages.
   - "whatToAvoid": Specific crucial mistakes that worsen the situation.
   - "wateringAdvice": Based on plant, soil moisture, and grower setup (${userContext?.growingLocation || 'Field/Balcony'}). Do NOT claim live weather API integration.
   - "monitoringPlan": 1 to 3 concrete checkpoints for the next 48 to 72 hours.
   - "prevention": Long-term preventive cultural practices.
   - "nextSteps": Practical immediate next actions for the grower.

5. LANGUAGE:
   ${languageInstruction}

${contextDescription}
`;

      const imagePart = {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      };

      const generateConfig = {
        systemInstruction:
          'You are PlantPulse AI, a world-class plant pathology and agronomy expert specializing in crop disease diagnostics, urban botanical health, and Indian agricultural ecosystems.',
        responseMimeType: 'application/json',
        responseSchema: PLANT_ANALYSIS_SCHEMA,
        temperature: 0.2, // Low temperature for consistent diagnostic precision
      };

      let response: any;
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let lastModelError: any = null;

      for (const modelCandidate of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: modelCandidate,
            contents: {
              parts: [imagePart, { text: promptText }],
            },
            config: generateConfig,
          });
          if (response && response.text) {
            break;
          }
        } catch (modelErr: any) {
          lastModelError = modelErr;
          console.warn(`[PlantPulse AI] Vision model ${modelCandidate} request failed; trying the next configured candidate.`);
        }
      }

      if (!response || !response.text) {
        throw lastModelError || new Error('Empty response received from Gemini model');
      }

      const parsedData = parsePlantDiagnosis(response.text);

      // Auto-record scan activity in MySQL if user is authenticated
      if (req.user && req.user.id) {
        try {
          await recordActivity({
            user_id: req.user.id,
            activity_type: 'plant_scan',
            title: `Plant Scan: ${parsedData.plantName || 'Specimen'} (${parsedData.condition || 'Analysis'})`,
            content: {
              plantName: parsedData.plantName,
              scientificName: parsedData.scientificName,
              plantType: parsedData.plantType,
              overallHealth: parsedData.overallHealth,
              condition: parsedData.condition,
              conditionType: parsedData.conditionType,
              confidence: parsedData.confidence,
              diseaseConfidence: parsedData.diseaseConfidence,
              severity: parsedData.severity,
              sunlightRequirement: parsedData.sunlightRequirement,
              soilRecommendation: parsedData.soilRecommendation,
              fertilizerRecommendation: parsedData.fertilizerRecommendation,
              wateringAdvice: parsedData.wateringAdvice,
              symptoms: parsedData.symptoms?.slice(0, 4) || [],
              treatmentSummary:
                typeof parsedData.treatment?.[0] === 'string'
                  ? parsedData.treatment[0]
                  : parsedData.treatment?.[0]?.action || 'Prescribed care protocol',
              treatment: parsedData.treatment || [],
              prevention: parsedData.prevention || [],
              immediateActions: parsedData.immediateActions || [],
              careTips: parsedData.careTips || [],
              timestamp: new Date().toISOString(),
            },
          });
        } catch (histErr) {
          console.warn('[DB] Could not auto-record scan activity:', histErr);
        }
      }

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (error: any) {
      if (error instanceof PlantScanRequestError) {
        if (error.code === 'INVALID_MODEL_RESPONSE') {
          console.error('[PlantPulse AI] Vision model returned an invalid diagnosis structure.');
        }
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      }

      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');
      console.error(
        `[PlantPulse AI] Image analysis request failed (${isRateLimit ? 'RATE_LIMIT' : 'PROVIDER_ERROR'}).`,
      );

      return res.status(isRateLimit ? 429 : 502).json({
        error: isRateLimit
          ? 'AI image analysis is temporarily rate limited. Please wait and try again.'
          : 'AI image analysis could not be completed. Please try again.',
        code: isRateLimit ? 'RATE_LIMIT' : 'ANALYSIS_ERROR',
      });
    }
  });

  app.post('/api/plant-doctor/speech', optionalAuthenticateUser, async (req: any, res) => {
    const { text, lang } = req.body || {};
    if (!isSupportedLanguage(lang)) {
      return res.status(400).json({ error: 'Unsupported language. Use en, gu, or hi.', code: 'INVALID_LANGUAGE' });
    }
    if (typeof text !== 'string' || !text.trim() || text.length > 5000) {
      return res.status(400).json({ error: 'Speech text must contain 1 to 5000 characters.', code: 'INVALID_TEXT' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Speech generation is not configured on the server.',
        code: 'TTS_NOT_CONFIGURED',
      });
    }

    const targetLanguage =
      lang === 'gu' ? 'natural Gujarati in the Gujarati script' :
      lang === 'hi' ? 'natural Hindi in the Devanagari script' :
      'natural English';
    const timeout = new AbortController();
    const timeoutId = setTimeout(() => timeout.abort(), 60_000);
    try {
      const ttsModels = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'];
      let providerResponse: Response | null = null;
      let rateLimitedResponse: Response | null = null;
      for (const model of ttsModels) {
        const candidateResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            model,
            input: [
              {
                type: 'user_input',
                content: [
                  {
                    type: 'text',
                    text: text.trim(),
                    annotations: [
                      {
                        type: 'speech_metadata',
                        style: `Clear, calm, natural speech in ${targetLanguage}. Preserve the transcript verbatim; do not translate or paraphrase.`,
                      },
                    ],
                  },
                ],
              },
            ],
            response_format: { type: 'audio' },
            generation_config: { speech_config: [{ voice: 'Kore' }] },
          }),
          signal: timeout.signal,
        });
        if (candidateResponse.ok) {
          providerResponse = candidateResponse;
          break;
        }
        console.warn(
          `[PlantPulse AI] TTS model ${model} failed (HTTP ${candidateResponse.status}).`,
        );
        if (candidateResponse.status === 429) {
          rateLimitedResponse = candidateResponse;
          continue;
        }
        if (rateLimitedResponse) {
          providerResponse = rateLimitedResponse;
          break;
        }
        if (candidateResponse.status !== 429) {
          providerResponse = candidateResponse;
          break;
        }
      }

      if (!providerResponse && rateLimitedResponse) {
        providerResponse = rateLimitedResponse;
      }

      if (!providerResponse) {
        console.error('[PlantPulse AI] Speech generation failed without a provider response.');
        return res.status(502).json({
          error: 'Speech generation could not be completed.',
          code: 'TTS_PROVIDER_ERROR',
        });
      }
      if (!providerResponse.ok) {
        const status = providerResponse.status;
        const code = status === 429 ? 'TTS_RATE_LIMIT' : 'TTS_PROVIDER_ERROR';
        if (status === 429) {
          const retryAfter = providerResponse.headers.get('retry-after');
          if (retryAfter && /^\d{1,4}$/.test(retryAfter)) {
            res.setHeader('Retry-After', retryAfter);
          }
        }
        const upstreamError = await providerResponse.json().catch(() => null);
        const providerStatus =
          typeof upstreamError?.error?.status === 'string'
            ? upstreamError.error.status
            : undefined;
        console.error(
          `[PlantPulse AI] Speech generation failed (HTTP ${status}${providerStatus ? `, ${providerStatus}` : ''}).`,
        );
        return res.status(status === 429 ? 429 : 502).json({
          error: status === 429
            ? 'Speech generation is temporarily rate limited or the TTS quota is exhausted.'
            : 'Speech generation could not be completed.',
          code,
        });
      }

      const result = await providerResponse.json();
      let audioData = typeof result?.output_audio?.data === 'string' ? result.output_audio.data : '';
      if (!audioData && Array.isArray(result?.steps)) {
        for (const step of [...result.steps].reverse()) {
          if (step?.type !== 'model_output' || !Array.isArray(step.content)) continue;
          const audioContent = [...step.content].reverse().find(
            (content: any) => content?.type === 'audio' && typeof content.data === 'string',
          );
          if (audioContent) {
            audioData = audioContent.data;
            break;
          }
        }
      }

      if (!audioData || audioData.length > 24_000_000) {
        console.error('[PlantPulse AI] Speech generation returned no usable audio.');
        return res.status(502).json({
          error: 'Speech generation returned an invalid audio response.',
          code: 'TTS_INVALID_RESPONSE',
        });
      }
      const audioBuffer = Buffer.from(audioData, 'base64');
      if (audioBuffer.length < 44 || audioBuffer.toString('ascii', 0, 4) !== 'RIFF') {
        console.error('[PlantPulse AI] Speech generation returned an unsupported audio format.');
        return res.status(502).json({
          error: 'Speech generation returned an unsupported audio format.',
          code: 'TTS_INVALID_RESPONSE',
        });
      }

      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'no-store');
      return res.send(audioBuffer);
    } catch (error: any) {
      const timedOut = timeout.signal.aborted;
      console.error(`[PlantPulse AI] Speech generation request failed (${timedOut ? 'TIMEOUT' : 'NETWORK_ERROR'}).`);
      return res.status(timedOut ? 504 : 502).json({
        error: timedOut
          ? 'Speech generation timed out. Please try again.'
          : 'Speech generation is temporarily unavailable.',
        code: timedOut ? 'TTS_TIMEOUT' : 'TTS_NETWORK_ERROR',
      });
    } finally {
      clearTimeout(timeoutId);
    }
  });

  // REAL AI PLANT DOCTOR CONVERSATIONAL ENDPOINT
  app.post('/api/chat-plant-doctor', optionalAuthenticateUser, async (req: any, res) => {
    try {
      const {
        messages = [],
        userMessage,
        attachedImage,
        latestScanContext,
        userContext,
        lang = 'en',
      } = req.body;

      if (!isSupportedLanguage(lang)) {
        return res.status(400).json({ error: 'Unsupported language. Use en, gu, or hi.' });
      }

      if (!userMessage && !attachedImage) {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'Gemini API key is not configured in the server environment.',
          code: 'API_KEY_MISSING',
        });
      }

      const targetLanguageFullName = lang === 'gu' ? 'Gujarati' : lang === 'hi' ? 'Hindi' : 'English';
      const targetLanguageNativeName = lang === 'gu' ? 'ગુજરાતી' : lang === 'hi' ? 'हिन्दी' : 'English';

      const languageInstruction =
        lang === 'gu'
          ? `Respond 100% strictly in natural Gujarati (ગુજરાતી script).
Every single sentence, diagnosis, action, reason, question, and suggested option MUST be in Gujarati.
DO NOT mix English sentences or half-English phrases into the response.
Do NOT use phrases like "Please check the leaves" or "Watering issue" in English. Use proper Gujarati phrases.
Technical botanical names (e.g. Alternaria solani) may remain in Latin if necessary, but all explanations around them must be in Gujarati.`
          : lang === 'hi'
          ? `Respond 100% strictly in natural Hindi (हिन्दी / Devanagari script).
Every single sentence, diagnosis, action, reason, question, and suggested option MUST be in Hindi.
DO NOT mix English sentences or half-English phrases into the response.
Do NOT use English words or sentences like "Please check the leaves". Use proper Hindi phrases.
Technical botanical names (e.g. Alternaria solani) may remain in Latin if necessary, but all explanations around them must be in Hindi.`
          : `Respond 100% strictly in clear, helpful, natural English. Do not mix languages.`;

      const safeHistory = Array.isArray(messages)
        ? messages
            .filter(
              (message: any) =>
                message &&
                (message.sender === 'user' || message.sender === 'doctor') &&
                typeof message.text === 'string' &&
                message.text.trim(),
            )
            .slice(-6)
            .map((message: any) => ({
              sender: message.sender === 'doctor' ? 'assistant' : 'user',
              text: message.text.slice(0, 4000),
            }))
        : [];
      const safeUserContext = {
        persona: typeof userContext?.userType === 'string' ? userContext.userType : 'gardener',
        crop: typeof userContext?.cropName === 'string' ? userContext.cropName : '',
        district: typeof userContext?.districtName === 'string' ? userContext.districtName : '',
        growingLocation:
          typeof userContext?.growingLocation === 'string' ? userContext.growingLocation : '',
      };
      const safeScanContext =
        latestScanContext && typeof latestScanContext === 'object'
          ? {
              plantName:
                typeof latestScanContext.plantName === 'string' ? latestScanContext.plantName : '',
              condition:
                typeof latestScanContext.condition === 'string' ? latestScanContext.condition : '',
              conditionType:
                typeof latestScanContext.conditionType === 'string'
                  ? latestScanContext.conditionType
                  : '',
              confidence:
                typeof latestScanContext.confidence === 'number'
                  ? latestScanContext.confidence
                  : null,
              severity:
                typeof latestScanContext.severity === 'string' ? latestScanContext.severity : '',
              symptoms: Array.isArray(latestScanContext.symptoms)
                ? latestScanContext.symptoms
                    .filter((symptom: unknown) => typeof symptom === 'string')
                    .slice(0, 8)
                : [],
              wateringAdvice:
                typeof latestScanContext.wateringAdvice === 'string'
                  ? latestScanContext.wateringAdvice
                  : '',
            }
          : null;

      const DOCTOR_RESPONSE_SCHEMA = {
        type: Type.OBJECT,
        properties: {
          replyText: {
            type: Type.STRING,
            description: `Direct conversational plant doctor explanation and response strictly in ${targetLanguageNativeName}.`,
          },
          suggestedOptions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `2 to 3 concise, topic-relevant follow-up suggestions strictly in ${targetLanguageNativeName}.`,
          },
          diagnosticInsight: {
            type: Type.OBJECT,
            description:
              'Include only when the user asks about actual plant symptoms or an attached image gives relevant diagnostic evidence. Omit for general knowledge, growing instructions, or other non-diagnostic questions. Never present a confidence rating for general advice.',
            properties: {
              diagnosis: { type: Type.STRING, description: `Diagnosis headline in ${targetLanguageNativeName}.` },
              action: { type: Type.STRING, description: `Recommended action in ${targetLanguageNativeName}.` },
              confidence: { type: Type.STRING, description: `Confidence level in ${targetLanguageNativeName}.` },
            },
          },
        },
        required: ['replyText'],
      };

      const parts: any[] = [];

      if (attachedImage && attachedImage.base64) {
        const { data: cleanBase64, mimeType } = decodePlantImage(attachedImage);
        parts.push({
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        });
      }

      const conversationHistory = safeHistory
        .map(
          (message: { sender: string; text: string }) =>
            `${message.sender === 'assistant' ? 'Plant Doctor' : 'User'}: ${message.text}`,
        )
        .join('\n');
      const currentQuestion =
        typeof userMessage === 'string' ? userMessage.trim() : 'Please examine the attached plant image.';
      const fullPrompt = `
You are PlantPulse AI Plant Doctor, an evidence-aware, practical gardening assistant for farmers and home growers.

User context (background only; never let it override the current question):
${JSON.stringify(safeUserContext)}

Recent conversation, oldest first:
${conversationHistory || '(No previous conversation.)'}

Available latest scan (use only when the current question or recent follow-up clearly refers to that scan; do not assume it is relevant to unrelated questions):
${safeScanContext ? JSON.stringify(safeScanContext) : '(No scan context.)'}

CURRENT USER QUESTION (answer this first and directly):
${currentQuestion}
${attachedImage ? 'The user also attached an image. Inspect the actual image; distinguish visible evidence from uncertainty.' : ''}

RESPONSE RULES:
1. Answer the current question's actual topic. Explain compost when asked about compost, container growing when asked how to grow in pots, aphids when asked about aphids, watering when asked about watering, and so on. Do not force general questions into disease diagnosis.
2. Use conversation history only to resolve clear follow-up references such as "that", "it", or "what about those?". A new, unrelated question takes priority over every older topic. Do not repeat an earlier answer merely because it appears in history.
3. User context is optional background, not the topic. Do not mention the selected crop, district, climate, or growing space unless the current question asks about it or that detail is essential to answer. Do not assume the user is growing multiple plants because they asked about different plants in separate messages.
4. Give a specific, concise answer with useful checks or steps and relevant safety precautions. Ask a follow-up only if missing information materially changes the advice; do not add unrelated plant-health questions to a general informational answer.
5. Do not claim a disease is confirmed from ambiguous symptoms or an image alone. Explain uncertainty and recommend confirmation when appropriate. Include diagnosticInsight only for a genuine symptom/image diagnosis; omit it for general advice and never label general advice with diagnostic confidence.
6. This application has no live weather data source. If asked for current/today's weather, clearly say live weather is unavailable; never infer current conditions from location, date, or dashboard estimates.
7. If referring to image or scan evidence, use only what is actually visible or supplied in the scan context. Do not invent findings.
8. Add 2-3 optional, topic-relevant follow-up suggestions. They must not replace or dilute the direct answer.
9. ${languageInstruction}
`;

      parts.push({ text: fullPrompt });

      const doctorConfig = {
        systemInstruction: `        You are PlantPulse AI — Your Plant Doctor. You are a warm, knowledgeable gardening assistant who answers the user's actual question directly.
CRITICAL LANGUAGE REQUIREMENT: You MUST speak and generate all content 100% in ${targetLanguageFullName} (${targetLanguageNativeName}).
Every single field in the JSON response (replyText, all items in suggestedOptions, diagnosticInsight.diagnosis, diagnosticInsight.action, diagnosticInsight.confidence) MUST be completely written in ${targetLanguageNativeName}.
Never mix English sentences or half-English phrases into Gujarati or Hindi responses. Only standard Latin binomial botanical specimen names may be kept in Latin, but everything else must be fully in ${targetLanguageNativeName}.`,
        responseMimeType: 'application/json',
        responseSchema: DOCTOR_RESPONSE_SCHEMA,
                temperature: 0.55,
      };

      let response: any;
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let lastDoctorError: any = null;

      for (const modelCandidate of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: modelCandidate,
            contents: { parts },
            config: doctorConfig,
          });
          if (response && response.text) {
            break;
          }
        } catch (dErr: any) {
          lastDoctorError = dErr;
          console.warn(`[PlantPulse Doctor] Model ${modelCandidate} request failed; trying the next configured candidate.`);
        }
      }

      if (!response || !response.text) {
        throw lastDoctorError || new Error('Empty response from Gemini');
      }

      const parsed = parseDoctorResponse(response.text);

      // Auto-record doctor chat in MySQL if user is authenticated
      if (req.user && req.user.id) {
        try {
          const previewQuery = (userMessage || 'Plant Specimen Analysis').trim();
          await recordActivity({
            user_id: req.user.id,
            activity_type: 'doctor_chat',
            title: `Doctor Consultation: ${previewQuery.length > 50 ? previewQuery.slice(0, 47) + '...' : previewQuery}`,
            content: {
              query: previewQuery,
              reply: parsed.replyText || 'Advice provided',
              recommendedAction: parsed.diagnosticInsight?.action || '',
              quickReplies: parsed.suggestedOptions,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (chatHistErr) {
          console.warn('[DB] Could not auto-record chat activity:', chatHistErr);
        }
      }

      return res.json({
        success: true,
        data: parsed,
        reply: parsed.replyText,
        suggestedActions: parsed.suggestedOptions || [],
      });
    } catch (error: any) {
      const isInvalidResponse = error?.message === 'INVALID_DOCTOR_RESPONSE';
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');
      console.error(
        `[PlantPulse Doctor] Consultation failed (${isInvalidResponse ? 'INVALID_RESPONSE' : isRateLimit ? 'RATE_LIMIT' : 'PROVIDER_ERROR'}).`,
      );
      return res.status(isInvalidResponse ? 502 : isRateLimit ? 429 : 502).json({
        error: isInvalidResponse
          ? 'Plant Doctor received an unreadable AI response.'
          : isRateLimit
          ? 'Plant Doctor is temporarily rate limited. Please try again shortly.'
          : 'Plant Doctor is temporarily unavailable. Please try again.',
        code: isInvalidResponse
          ? 'INVALID_DOCTOR_RESPONSE'
          : isRateLimit
          ? 'RATE_LIMIT'
          : 'DOCTOR_UNAVAILABLE',
      });
    }
  });

  // Alias /api/plant-doctor for universal compatibility
  app.post('/api/plant-doctor', optionalAuthenticateUser, async (req: any, res) => {
    // Normalise fields if called with alternate parameter naming
    if (req.body.message && !req.body.userMessage) {
      req.body.userMessage = req.body.message;
    }
    if (req.body.cropContext && !req.body.userContext) {
      req.body.userContext = {
        cropName: req.body.cropContext,
        districtName: req.body.locationContext || 'Rajkot',
        userType: req.body.userType || 'farmer',
      };
    }
    // Delegate to chat-plant-doctor handler
    return (app as any)._router.handle(
      { ...req, url: '/api/chat-plant-doctor', method: 'POST' },
      res,
      () => res.status(404).json({ error: 'Endpoint not found' })
    );
  });

  // REAL AI PLANT DOCTOR CONVERSATION DYNAMIC LOCALIZATION
  app.post('/api/localize-doctor-messages', optionalAuthenticateUser, async (req: any, res) => {
    try {
      const { messages = [], targetLang = 'en' } = req.body;
      if (!isSupportedLanguage(targetLang)) {
        return res.status(400).json({ error: 'Unsupported language. Use en, gu, or hi.' });
      }
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.json({ success: true, messages: [] });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'Gemini API key is not configured.' });
      }

      const targetLanguageFullName = targetLang === 'gu' ? 'Gujarati' : targetLang === 'hi' ? 'Hindi' : 'English';
      const targetLanguageNativeName = targetLang === 'gu' ? 'ગુજરાતી' : targetLang === 'hi' ? 'हिन्दी' : 'English';

      const LOCALIZATION_SCHEMA = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING, description: `Localized message content in ${targetLanguageNativeName}.` },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `Localized suggested options in ${targetLanguageNativeName}.`,
            },
            recommendation: {
              type: Type.OBJECT,
              properties: {
                diagnosis: { type: Type.STRING, description: `Localized diagnosis in ${targetLanguageNativeName}.` },
                action: { type: Type.STRING, description: `Localized action in ${targetLanguageNativeName}.` },
                confidence: { type: Type.STRING, description: `Confidence level in ${targetLanguageNativeName}.` },
              },
            },
          },
          required: ['id', 'text'],
        },
      };

      const prompt = `
You are the PlantPulse AI Agricultural Localization & Translation Engine.
Translate and localize the following conversation messages from an AI Plant Doctor consultation into ${targetLanguageFullName} (${targetLanguageNativeName}).

MESSAGES TO LOCALIZE:
${JSON.stringify(
  messages.map((m: any) => ({
    id: m.id,
    sender: m.sender,
    text: m.text,
    options: m.options,
    recommendation: m.recommendation,
  })),
  null,
  2
)}

STRICT RULES:
1. Translate all text into natural, fluent, culturally accurate ${targetLanguageNativeName}.
2. For doctor responses, sound warm, professional and attentive.
3. For user questions, translate them naturally as an Indian grower or gardener would phrase them in ${targetLanguageNativeName}.
4. Translate every single item in options arrays.
5. Translate recommendation diagnosis and action.
6. Return a JSON array of objects matching each input id.
7. DO NOT mix languages. The entire text must be in ${targetLanguageNativeName}. Keep Latin scientific plant names intact if needed.
`;

      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let transResponse: any = null;

      for (const modelCandidate of candidateModels) {
        try {
          transResponse = await ai.models.generateContent({
            model: modelCandidate,
            contents: prompt,
            config: {
              systemInstruction: `You are an expert bilingual agricultural translator. You translate plant care advice into ${targetLanguageFullName} (${targetLanguageNativeName}) with absolute fluency, zero language mixing, and high precision.`,
              responseMimeType: 'application/json',
              responseSchema: LOCALIZATION_SCHEMA,
              temperature: 0.2,
            },
          });
          if (transResponse && transResponse.text) break;
        } catch (tErr: any) {
          console.warn(`[Localize Messages] Model ${modelCandidate} failed:`, tErr?.message);
        }
      }

      if (!transResponse || !transResponse.text) {
        return res.status(500).json({ error: 'Could not localize messages' });
      }

      const localizedList = JSON.parse(transResponse.text.trim());
      const idMap = new Map(localizedList.map((item: any) => [item.id, item]));

      const result = messages.map((m: any) => {
        const loc: any = idMap.get(m.id);
        if (loc) {
          return {
            ...m,
            text: loc.text || m.text,
            options: loc.options || m.options,
            recommendation: loc.recommendation || m.recommendation,
          };
        }
        return m;
      });

      return res.json({ success: true, messages: result });
    } catch (error: any) {
      console.error('Localize doctor messages error:', error);
      return res.status(500).json({ error: 'Localization failed', details: error?.message });
    }
  });

  // Serve Frontend
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PlantPulse AI] Full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
