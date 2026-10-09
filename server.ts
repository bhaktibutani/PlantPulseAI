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

      if (!image || !image.base64) {
        return res.status(400).json({
          error: 'Image data is required',
          code: 'IMAGE_MISSING',
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'Gemini API key is not configured in the server environment.',
          code: 'API_KEY_MISSING',
          message:
            'Please ensure GEMINI_API_KEY is configured in your AI Studio project secrets.',
        });
      }

      // Clean base64 string
      let cleanBase64 = image.base64;
      let mimeType = image.mimeType || 'image/jpeg';

      if (cleanBase64.includes(';base64,')) {
        const parts = cleanBase64.split(';base64,');
        mimeType = parts[0].replace('data:', '') || mimeType;
        cleanBase64 = parts[1];
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
          console.warn(`[PlantPulse AI] Model ${modelCandidate} unavailable, trying next candidate...`, modelErr?.message || modelErr);
        }
      }

      if (!response || !response.text) {
        throw lastModelError || new Error('Empty response received from Gemini model');
      }

      const responseText = response.text;
      const parsedData = JSON.parse(responseText.trim());

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
      console.error('PlantPulse Analysis Error:', error);
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');

      return res.status(isRateLimit ? 429 : 500).json({
        error: isRateLimit
          ? 'Gemini API quota or rate limit exceeded. Please wait a moment and try again.'
          : 'Failed to analyze plant image. Please try again.',
        details: error?.message || 'Unknown analysis error',
        code: isRateLimit ? 'RATE_LIMIT' : 'ANALYSIS_ERROR',
      });
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

      let contextPrompt = `
You are "PlantPulse AI — Your Plant Doctor", a friendly, highly intelligent botanical consultant.
You assist both commercial farmers in Gujarat and urban home/balcony gardeners.

User Context:
- Persona: ${userContext?.userType || 'Farmer'}
- Primary Plant/Crop: ${userContext?.cropName || 'Tomato'}
- Location: ${userContext?.districtName || 'Rajkot'}, Gujarat
- Growing Location: ${userContext?.growingLocation || 'Field / Balcony'}
`;

      if (latestScanContext) {
        contextPrompt += `
LATEST OPTICAL SCAN ON RECORD:
- Plant: ${latestScanContext.plantName}
- Condition: ${latestScanContext.condition} (Type: ${latestScanContext.conditionType})
- Confidence: ${latestScanContext.confidence}%
- Severity: ${latestScanContext.severity}
- Observed Symptoms: ${Array.isArray(latestScanContext.symptoms) ? latestScanContext.symptoms.join(', ') : latestScanContext.symptoms}
- Watering Guidance: ${latestScanContext.wateringAdvice || 'Normal'}
`;
      }

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
            description: `3 to 5 quick multiple choice chips or follow-up question options strictly in ${targetLanguageNativeName}.`,
          },
          diagnosticInsight: {
            type: Type.OBJECT,
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
        let cleanBase64 = attachedImage.base64;
        let mimeType = attachedImage.mimeType || 'image/jpeg';
        if (cleanBase64.includes(';base64,')) {
          const split = cleanBase64.split(';base64,');
          mimeType = split[0].replace('data:', '') || mimeType;
          cleanBase64 = split[1];
        }
        parts.push({
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        });
      }

      // Prior message history summary
      const historySummary = messages
        .slice(-5)
        .map((m: any) => `${m.sender}: ${m.text}`)
        .join('\n');

      const fullPrompt = `
${contextPrompt}

Recent conversation history:
${historySummary}

User's current query:
"${userMessage || 'Examine this attached image.'}"

INSTRUCTIONS:
1. Respond like an attentive agricultural doctor who asks targeted diagnostic questions to narrow down root causes (e.g., watering frequency, soil drainage, sunlight exposure, leaf underside pests).
2. If latestScanContext is present and relevant to the user query (e.g. they ask "Why did this happen?" or "What should I spray?"), reference the scan details seamlessly!
3. Include 2-4 structured quick reply options for the user.
4. ${languageInstruction}
`;

      parts.push({ text: fullPrompt });

      const doctorConfig = {
        systemInstruction: `You are PlantPulse AI — Your Plant Doctor. You are a warm, highly knowledgeable agricultural and botanical physician.
CRITICAL LANGUAGE REQUIREMENT: You MUST speak and generate all content 100% in ${targetLanguageFullName} (${targetLanguageNativeName}).
Every single field in the JSON response (replyText, all items in suggestedOptions, diagnosticInsight.diagnosis, diagnosticInsight.action, diagnosticInsight.confidence) MUST be completely written in ${targetLanguageNativeName}.
Never mix English sentences or half-English phrases into Gujarati or Hindi responses. Only standard Latin binomial botanical specimen names may be kept in Latin, but everything else must be fully in ${targetLanguageNativeName}.`,
        responseMimeType: 'application/json',
        responseSchema: DOCTOR_RESPONSE_SCHEMA,
        temperature: 0.3,
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
          console.warn(`[PlantPulse Doctor] Model ${modelCandidate} unavailable, trying next...`, dErr?.message || dErr);
        }
      }

      if (!response || !response.text) {
        throw lastDoctorError || new Error('Empty response from Gemini');
      }

      const responseText = response.text;
      const parsed = JSON.parse(responseText.trim());

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
              recommendedAction: parsed.recommendedAction || '',
              quickReplies: parsed.quickReplies || [],
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
      console.error('PlantPulse Doctor Error:', error);
      return res.status(500).json({
        error: 'Unable to consult Plant Doctor right now.',
        details: error?.message,
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
