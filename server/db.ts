import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'farmer' | 'urban_planner';
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface ActivityRecord {
  id: number;
  user_id: number;
  activity_type: string;
  title: string;
  content: string | any;
  created_at: string | Date;
}

export interface PlantRecord {
  id: number;
  user_id: number;
  name: string;
  species: string;
  location_type: string;
  sunlight: string;
  watering_frequency: string;
  health_status: string;
  health_score: number;
  notes?: string;
  created_at: string | Date;
  updated_at?: string | Date;
}

export interface PlantCareTaskRecord {
  id: number;
  user_id: number;
  plant_id: number | null;
  task_type: string;
  title: string;
  description?: string;
  due_date: string;
  completed: boolean;
  created_at: string | Date;
  updated_at?: string | Date;
}

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const DB_NAME = process.env.DB_NAME || 'plantpulse_ai';
const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  return secret;
})();

let pool: mysql.Pool | null = null;
let isConnectedToMySQL = false;
let dbStatusMessage = 'Initializing database connection...';

// Local persistent file fallback for offline / preview container resilience
const FALLBACK_DATA_DIR = path.resolve(process.cwd(), '.data');
const FALLBACK_DATA_FILE = path.join(FALLBACK_DATA_DIR, 'fallback_db.json');

interface FallbackStore {
  users: UserRecord[];
  activities: ActivityRecord[];
  plants: PlantRecord[];
  tasks: PlantCareTaskRecord[];
  nextUserId: number;
  nextActivityId: number;
  nextPlantId: number;
  nextTaskId: number;
}

function loadFallbackStore(): FallbackStore {
  try {
    if (!fs.existsSync(FALLBACK_DATA_DIR)) {
      fs.mkdirSync(FALLBACK_DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(FALLBACK_DATA_FILE)) {
      const raw = fs.readFileSync(FALLBACK_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        users: parsed.users || [],
        activities: parsed.activities || [],
        plants: parsed.plants || [],
        tasks: parsed.tasks || [],
        nextUserId: parsed.nextUserId || 1,
        nextActivityId: parsed.nextActivityId || 1,
        nextPlantId: parsed.nextPlantId || 1,
        nextTaskId: parsed.nextTaskId || 1,
      };
    }
  } catch (err) {
    console.warn('[DB Fallback] Could not read fallback cache:', err);
  }
  return {
    users: [],
    activities: [],
    plants: [],
    tasks: [],
    nextUserId: 1,
    nextActivityId: 1,
    nextPlantId: 1,
    nextTaskId: 1,
  };
}

function saveFallbackStore(store: FallbackStore) {
  try {
    if (!fs.existsSync(FALLBACK_DATA_DIR)) {
      fs.mkdirSync(FALLBACK_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DB Fallback] Could not persist fallback cache:', err);
  }
}

let fallbackStore: FallbackStore = loadFallbackStore();

/**
 * Initialize MySQL Connection & Schema
 */
export async function initDatabase(): Promise<boolean> {
  console.log(`[MySQL] Connecting to MySQL at ${DB_HOST}:${DB_PORT} as user "${DB_USER}"...`);

  try {
    // 1. First connect without database to ensure DB exists
    const rootConn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      connectTimeout: 4000,
    });

    await rootConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await rootConn.end();

    // 2. Create connection pool for the database
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000,
    });

    // 3. Ensure tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('farmer', 'urban_planner') NOT NULL DEFAULT 'farmer',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_users_email\` (\`email\`),
        INDEX \`idx_users_role\` (\`role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`activity_history\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`activity_type\` VARCHAR(50) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`content\` LONGTEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_history_user_created\` (\`user_id\`, \`created_at\`),
        INDEX \`idx_history_type\` (\`activity_type\`),
        CONSTRAINT \`fk_activity_user\`
          FOREIGN KEY (\`user_id\`)
          REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Phase 3: Plants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`plants\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`species\` VARCHAR(255) NOT NULL,
        \`location_type\` VARCHAR(100) NOT NULL DEFAULT 'balcony',
        \`sunlight\` VARCHAR(100) NOT NULL DEFAULT 'full_sun',
        \`watering_frequency\` VARCHAR(100) NOT NULL DEFAULT 'daily',
        \`health_status\` VARCHAR(50) NOT NULL DEFAULT 'Healthy',
        \`health_score\` INT NOT NULL DEFAULT 85,
        \`notes\` TEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_plants_user\` (\`user_id\`),
        CONSTRAINT \`fk_plants_user\`
          FOREIGN KEY (\`user_id\`)
          REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Phase 3: Plant Care Tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`plant_care_tasks\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`plant_id\` INT NULL,
        \`task_type\` VARCHAR(50) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`due_date\` VARCHAR(50) NOT NULL DEFAULT 'Today',
        \`completed\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_tasks_user_completed\` (\`user_id\`, \`completed\`),
        CONSTRAINT \`fk_tasks_user\`
          FOREIGN KEY (\`user_id\`)
          REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT \`fk_tasks_plant\`
          FOREIGN KEY (\`plant_id\`)
          REFERENCES \`plants\` (\`id\`)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    isConnectedToMySQL = true;
    dbStatusMessage = `Connected to MySQL database "${DB_NAME}" via ${DB_HOST}:${DB_PORT} (XAMPP)`;
    console.log(`[MySQL] SUCCESS: ${dbStatusMessage}`);
    return true;
  } catch (err: any) {
    isConnectedToMySQL = false;
    dbStatusMessage = `MySQL server offline or unreachable (${err.message || err.code}). Active in graceful fallback mode. Start XAMPP MySQL to store data in phpMyAdmin.`;
    console.warn(`[MySQL] WARNING: ${dbStatusMessage}`);
    return false;
  }
}

/**
 * Return current database connection status
 */
export function getDbStatus() {
  return {
    connected: isConnectedToMySQL,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    statusMessage: dbStatusMessage,
    type: isConnectedToMySQL ? 'mysql' : 'fallback_store',
  };
}

/**
 * Password Hashing
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * JWT Authentication Tokens
 */
export function generateToken(user: { id: number; name: string; email: string; role: string }): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  if (!email || typeof email !== 'string') return null;
  const normalizedEmail = email.trim().toLowerCase();

  // Always refresh fallback store from disk cache to ensure latest registration is loaded
  fallbackStore = loadFallbackStore();

  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1',
        [normalizedEmail]
      );
      if (rows && rows.length > 0) {
        const dbUser = rows[0] as UserRecord;
        // Keep fallbackStore in sync
        const idx = fallbackStore.users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
        if (idx === -1) {
          fallbackStore.users.push(dbUser);
          saveFallbackStore(fallbackStore);
        }
        return dbUser;
      }
    } catch (err) {
      console.error('[MySQL] Query error in findUserByEmail:', err);
    }
  }

  // Fallback lookup: Check fallback store
  const user = fallbackStore.users.find(
    (u) => (u.email || '').trim().toLowerCase() === normalizedEmail
  );
  if (user) {
    // If user was registered in fallback store but MySQL is now online, sync user to MySQL
    if (isConnectedToMySQL && pool) {
      try {
        await pool.query(
          'INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [user.name, user.email, user.password_hash, user.role]
        );
      } catch (syncErr) {
        console.warn('[MySQL] Could not auto-sync fallback user to MySQL:', syncErr);
      }
    }
    return user;
  }
  return null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: number): Promise<UserRecord | null> {
  fallbackStore = loadFallbackStore();

  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
        [id]
      );
      if (rows && rows.length > 0) {
        return rows[0] as UserRecord;
      }
    } catch (err) {
      console.error('[MySQL] Query error in findUserById:', err);
    }
  }

  const user = fallbackStore.users.find((u) => u.id === Number(id));
  return user || null;
}

/**
 * Create a new user
 */
export async function createUser(data: {
  name: string;
  email: string;
  password_hash: string;
  role: 'farmer' | 'urban_planner';
}): Promise<UserRecord> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedName = data.name.trim();

  // Always refresh fallback store from disk
  fallbackStore = loadFallbackStore();

  let newUserId: number | null = null;

  if (isConnectedToMySQL && pool) {
    try {
      const [result]: any = await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [normalizedName, normalizedEmail, data.password_hash, data.role]
      );
      newUserId = result.insertId;
    } catch (err) {
      console.error('[MySQL] Insert error in createUser:', err);
    }
  }

  // Always persist to fallbackStore as well to ensure dual-resilience
  const assignedId = newUserId || fallbackStore.nextUserId++;
  const newUser: UserRecord = {
    id: assignedId,
    name: normalizedName,
    email: normalizedEmail,
    password_hash: data.password_hash,
    role: data.role,
    created_at: new Date().toISOString(),
  };

  const existingIndex = fallbackStore.users.findIndex(
    (u) => (u.email || '').trim().toLowerCase() === normalizedEmail
  );
  if (existingIndex >= 0) {
    fallbackStore.users[existingIndex] = newUser;
  } else {
    fallbackStore.users.push(newUser);
  }
  saveFallbackStore(fallbackStore);

  return newUser;
}

/**
 * Record an activity in history
 */
export async function recordActivity(data: {
  user_id: number;
  activity_type: string;
  title: string;
  content: any;
}): Promise<ActivityRecord> {
  const contentString =
    typeof data.content === 'string'
      ? data.content
      : JSON.stringify(data.content);

  if (isConnectedToMySQL && pool) {
    try {
      const [result]: any = await pool.query(
        'INSERT INTO activity_history (user_id, activity_type, title, content) VALUES (?, ?, ?, ?)',
        [data.user_id, data.activity_type, data.title, contentString]
      );
      return {
        id: result.insertId,
        user_id: data.user_id,
        activity_type: data.activity_type,
        title: data.title,
        content: data.content,
        created_at: new Date(),
      };
    } catch (err) {
      console.error('[MySQL] Insert error in recordActivity:', err);
    }
  }

  // Fallback
  const newActivityId = fallbackStore.nextActivityId++;
  const newRecord: ActivityRecord = {
    id: newActivityId,
    user_id: data.user_id,
    activity_type: data.activity_type,
    title: data.title,
    content: data.content,
    created_at: new Date().toISOString(),
  };
  fallbackStore.activities.unshift(newRecord);
  saveFallbackStore(fallbackStore);
  return newRecord;
}

/**
 * Get user activities
 */
export async function getUserActivities(
  user_id: number,
  limit = 50
): Promise<ActivityRecord[]> {
  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT id, user_id, activity_type, title, content, created_at FROM activity_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [user_id, limit]
      );
      return (rows || []).map((row) => {
        let parsedContent = row.content;
        try {
          if (typeof row.content === 'string' && (row.content.startsWith('{') || row.content.startsWith('['))) {
            parsedContent = JSON.parse(row.content);
          }
        } catch {}
        return {
          id: row.id,
          user_id: row.user_id,
          activity_type: row.activity_type,
          title: row.title,
          content: parsedContent,
          created_at: row.created_at,
        };
      });
    } catch (err) {
      console.error('[MySQL] Query error in getUserActivities:', err);
    }
  }

  // Fallback
  return fallbackStore.activities
    .filter((a) => a.user_id === Number(user_id))
    .slice(0, limit);
}

/**
 * ====================================================================
 * PHASE 3: PLANTS CRUD
 * ====================================================================
 */
export async function getUserPlants(user_id: number): Promise<PlantRecord[]> {
  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT id, user_id, name, species, location_type, sunlight, watering_frequency, health_status, health_score, notes, created_at, updated_at FROM plants WHERE user_id = ? ORDER BY id DESC',
        [user_id]
      );
      return rows as PlantRecord[];
    } catch (err) {
      console.error('[MySQL] Query error in getUserPlants:', err);
    }
  }

  return fallbackStore.plants.filter((p) => p.user_id === Number(user_id));
}

export async function createPlant(data: {
  user_id: number;
  name: string;
  species: string;
  location_type: string;
  sunlight?: string;
  watering_frequency?: string;
  health_status?: string;
  health_score?: number;
  notes?: string;
}): Promise<PlantRecord> {
  const sunlight = data.sunlight || 'full_sun';
  const watering_frequency = data.watering_frequency || 'daily';
  const health_status = data.health_status || 'Healthy';
  const health_score = data.health_score !== undefined ? data.health_score : 88;
  const notes = data.notes || '';

  if (isConnectedToMySQL && pool) {
    try {
      const [result]: any = await pool.query(
        'INSERT INTO plants (user_id, name, species, location_type, sunlight, watering_frequency, health_status, health_score, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          data.user_id,
          data.name,
          data.species,
          data.location_type,
          sunlight,
          watering_frequency,
          health_status,
          health_score,
          notes,
        ]
      );
      return {
        id: result.insertId,
        user_id: data.user_id,
        name: data.name,
        species: data.species,
        location_type: data.location_type,
        sunlight,
        watering_frequency,
        health_status,
        health_score,
        notes,
        created_at: new Date(),
      };
    } catch (err) {
      console.error('[MySQL] Insert error in createPlant:', err);
    }
  }

  const newPlantId = fallbackStore.nextPlantId++;
  const newPlant: PlantRecord = {
    id: newPlantId,
    user_id: data.user_id,
    name: data.name,
    species: data.species,
    location_type: data.location_type,
    sunlight,
    watering_frequency,
    health_status,
    health_score,
    notes,
    created_at: new Date().toISOString(),
  };
  fallbackStore.plants.unshift(newPlant);
  saveFallbackStore(fallbackStore);
  return newPlant;
}

export async function deletePlant(user_id: number, plant_id: number): Promise<boolean> {
  if (isConnectedToMySQL && pool) {
    try {
      const [res]: any = await pool.query(
        'DELETE FROM plants WHERE id = ? AND user_id = ?',
        [plant_id, user_id]
      );
      return res.affectedRows > 0;
    } catch (err) {
      console.error('[MySQL] Delete error in deletePlant:', err);
    }
  }

  const beforeLen = fallbackStore.plants.length;
  fallbackStore.plants = fallbackStore.plants.filter(
    (p) => !(p.id === Number(plant_id) && p.user_id === Number(user_id))
  );
  saveFallbackStore(fallbackStore);
  return fallbackStore.plants.length < beforeLen;
}

/**
 * ====================================================================
 * PHASE 3: PLANT CARE TASKS CRUD
 * ====================================================================
 */
export async function getUserTasks(user_id: number): Promise<PlantCareTaskRecord[]> {
  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT id, user_id, plant_id, task_type, title, description, due_date, completed, created_at, updated_at FROM plant_care_tasks WHERE user_id = ? ORDER BY completed ASC, id ASC',
        [user_id]
      );
      return (rows || []).map((r) => ({
        ...r,
        completed: Boolean(r.completed),
      }));
    } catch (err) {
      console.error('[MySQL] Query error in getUserTasks:', err);
    }
  }

  return fallbackStore.tasks
    .filter((t) => t.user_id === Number(user_id))
    .sort((a, b) => Number(a.completed) - Number(b.completed));
}

export async function createTask(data: {
  user_id: number;
  plant_id?: number | null;
  task_type: string;
  title: string;
  description?: string;
  due_date?: string;
}): Promise<PlantCareTaskRecord> {
  const plant_id = data.plant_id !== undefined ? data.plant_id : null;
  const description = data.description || '';
  const due_date = data.due_date || 'Today';

  if (isConnectedToMySQL && pool) {
    try {
      const [result]: any = await pool.query(
        'INSERT INTO plant_care_tasks (user_id, plant_id, task_type, title, description, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [data.user_id, plant_id, data.task_type, data.title, description, due_date, false]
      );
      return {
        id: result.insertId,
        user_id: data.user_id,
        plant_id,
        task_type: data.task_type,
        title: data.title,
        description,
        due_date,
        completed: false,
        created_at: new Date(),
      };
    } catch (err) {
      console.error('[MySQL] Insert error in createTask:', err);
    }
  }

  const newTaskId = fallbackStore.nextTaskId++;
  const newTask: PlantCareTaskRecord = {
    id: newTaskId,
    user_id: data.user_id,
    plant_id,
    task_type: data.task_type,
    title: data.title,
    description,
    due_date,
    completed: false,
    created_at: new Date().toISOString(),
  };
  fallbackStore.tasks.push(newTask);
  saveFallbackStore(fallbackStore);
  return newTask;
}

export async function toggleTask(
  user_id: number,
  task_id: number,
  completedStatus?: boolean
): Promise<PlantCareTaskRecord | null> {
  if (isConnectedToMySQL && pool) {
    try {
      let nextStatus = completedStatus;
      if (nextStatus === undefined) {
        const [curr]: any = await pool.query(
          'SELECT completed FROM plant_care_tasks WHERE id = ? AND user_id = ?',
          [task_id, user_id]
        );
        if (curr.length > 0) {
          nextStatus = !Boolean(curr[0].completed);
        } else {
          return null;
        }
      }

      await pool.query(
        'UPDATE plant_care_tasks SET completed = ? WHERE id = ? AND user_id = ?',
        [nextStatus, task_id, user_id]
      );

      const [updated]: any = await pool.query(
        'SELECT id, user_id, plant_id, task_type, title, description, due_date, completed, created_at, updated_at FROM plant_care_tasks WHERE id = ?',
        [task_id]
      );
      if (updated.length > 0) {
        return {
          ...updated[0],
          completed: Boolean(updated[0].completed),
        };
      }
    } catch (err) {
      console.error('[MySQL] Update error in toggleTask:', err);
    }
  }

  const task = fallbackStore.tasks.find(
    (t) => t.id === Number(task_id) && t.user_id === Number(user_id)
  );
  if (task) {
    task.completed = completedStatus !== undefined ? completedStatus : !task.completed;
    task.updated_at = new Date().toISOString();
    saveFallbackStore(fallbackStore);
    return task;
  }
  return null;
}

export async function deleteTask(user_id: number, task_id: number): Promise<boolean> {
  if (isConnectedToMySQL && pool) {
    try {
      const [res]: any = await pool.query(
        'DELETE FROM plant_care_tasks WHERE id = ? AND user_id = ?',
        [task_id, user_id]
      );
      return res.affectedRows > 0;
    } catch (err) {
      console.error('[MySQL] Delete error in deleteTask:', err);
    }
  }

  const beforeLen = fallbackStore.tasks.length;
  fallbackStore.tasks = fallbackStore.tasks.filter(
    (t) => !(t.id === Number(task_id) && t.user_id === Number(user_id))
  );
  saveFallbackStore(fallbackStore);
  return fallbackStore.tasks.length < beforeLen;
}

/**
 * Seed initial sample plants and tasks for newly registered or empty users
 */
export async function seedDefaultPlantsAndTasks(
  user_id: number,
  role: 'farmer' | 'urban_planner'
): Promise<{ plants: PlantRecord[]; tasks: PlantCareTaskRecord[] }> {
  const existingPlants = await getUserPlants(user_id);
  if (existingPlants.length > 0) {
    const existingTasks = await getUserTasks(user_id);
    return { plants: existingPlants, tasks: existingTasks };
  }

  const initialPlants =
    role === 'farmer'
      ? [
          {
            name: 'Tomato (Main Acreage Plot 4B)',
            species: 'Solanum lycopersicum',
            location_type: 'field',
            sunlight: 'full_sun',
            watering_frequency: 'every_2_days',
            health_status: 'Healthy',
            health_score: 91,
            notes: 'High vigor vegetative stage. Calibrated for Saurashtra soil conditions.',
          },
          {
            name: 'Cotton (Block A Hybrid)',
            species: 'Gossypium hirsutum',
            location_type: 'field',
            sunlight: 'full_sun',
            watering_frequency: 'twice_weekly',
            health_status: 'Healthy',
            health_score: 94,
            notes: 'Flowering initiated. Pest surveillance nominal.',
          },
          {
            name: 'Chilli (East Plot Ridge)',
            species: 'Capsicum annuum',
            location_type: 'field',
            sunlight: 'full_sun',
            watering_frequency: 'every_2_days',
            health_status: 'Moderate',
            health_score: 82,
            notes: 'Monitored for early leaf curl prevention.',
          },
        ]
      : [
          {
            name: 'Cherry Tomato (Terrace Pot 1)',
            species: 'Solanum lycopersicum var. cerasiforme',
            location_type: 'terrace',
            sunlight: 'full_sun',
            watering_frequency: 'daily',
            health_status: 'Healthy',
            health_score: 92,
            notes: 'Growing in 12-inch terracotta container with organic cocopeat-vermicompost.',
          },
          {
            name: 'Spearmint (Kitchen Balcony Box)',
            species: 'Mentha spicata',
            location_type: 'balcony',
            sunlight: 'partial_shade',
            watering_frequency: 'daily',
            health_status: 'Healthy',
            health_score: 89,
            notes: 'Aromatic herb container; moisture retention high.',
          },
          {
            name: 'Holy Basil / Tulsi (East Balcony)',
            species: 'Ocimum sanctum',
            location_type: 'balcony',
            sunlight: 'full_sun',
            watering_frequency: 'daily',
            health_status: 'Healthy',
            health_score: 95,
            notes: 'Sacred botanical in self-draining clay planter.',
          },
        ];

  const createdPlants: PlantRecord[] = [];
  for (const p of initialPlants) {
    const pl = await createPlant({
      user_id,
      name: p.name,
      species: p.species,
      location_type: p.location_type,
      sunlight: p.sunlight,
      watering_frequency: p.watering_frequency,
      health_status: p.health_status,
      health_score: p.health_score,
      notes: p.notes,
    });
    createdPlants.push(pl);
  }

  const initialTasks =
    role === 'farmer'
      ? [
          {
            plant_id: createdPlants[0]?.id || null,
            task_type: 'watering',
            title: 'Early Morning Drip Irrigation: Tomato Plot 4B',
            description: 'Provide 35mm calculated soil moisture calibrated to current humidity.',
            due_date: 'Today',
          },
          {
            plant_id: createdPlants[2]?.id || null,
            task_type: 'inspection',
            title: 'Check Chilli Underside Foliage for Aphids / Thrips',
            description: 'Inspect 10 random leaf undersides for curling symptoms.',
            due_date: 'Today',
          },
          {
            plant_id: createdPlants[1]?.id || null,
            task_type: 'fertilizing',
            title: 'Apply Organic Potassium Humate to Cotton Block A',
            description: 'Support boll development and root vigor.',
            due_date: 'Tomorrow',
          },
        ]
      : [
          {
            plant_id: createdPlants[0]?.id || null,
            task_type: 'watering',
            title: 'Water Balcony Cherry Tomatoes at Root Zone',
            description: 'Check top 1 inch of potting soil; avoid wetting leaves.',
            due_date: 'Today',
          },
          {
            plant_id: createdPlants[1]?.id || null,
            task_type: 'pruning',
            title: 'Pinch Top Shoots of Spearmint',
            description: 'Stimulate lateral bushy growth and prevent early flowering.',
            due_date: 'Today',
          },
          {
            plant_id: createdPlants[2]?.id || null,
            task_type: 'fertilizing',
            title: 'Feed Tulsi with 2 Tbsp Vermicompost Top-Dress',
            description: 'Gentle slow-release nitrogen for lush leaf pigmentation.',
            due_date: 'Tomorrow',
          },
        ];

  const createdTasks: PlantCareTaskRecord[] = [];
  for (const t of initialTasks) {
    const tk = await createTask({
      user_id,
      plant_id: t.plant_id,
      task_type: t.task_type,
      title: t.title,
      description: t.description,
      due_date: t.due_date,
    });
    createdTasks.push(tk);
  }

  return { plants: createdPlants, tasks: createdTasks };
}
