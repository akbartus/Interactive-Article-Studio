// server.js
import express from "express";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs/promises";
import { KokoroTTS } from "kokoro-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// ────────────────────────────────────────────────────────────────
// Path setup
// ────────────────────────────────────────────────────────────────
const dbDir = __dirname;
const uploadDir = path.join(__dirname, "public", "uploads");

// Ensure upload directory exists
await fs.mkdir(uploadDir, { recursive: true });

// ────────────────────────────────────────────────────────────────
// Audio directory setup
// ────────────────────────────────────────────────────────────────
const audioDir = path.join(__dirname, "public", "audio");
await fs.mkdir(audioDir, { recursive: true });

// ────────────────────────────────────────────────────────────────
// TTS Model setup
// ────────────────────────────────────────────────────────────────
let tts = null;
let currentDtype = null;
let currentDevice = null;

// Define local model path
const localModelPath = path.join(__dirname, "models", "kokoro");
console.log(`Model directory: ${localModelPath}`);

async function loadModel(dtype, device) {
  if (tts && currentDtype === dtype && currentDevice === device) {
    return tts;
  }
  console.log(`Loading Kokoro model from local path (dtype=${dtype}, device=${device}) ...`);
  console.log(`Model path: ${localModelPath}`);
  try {
    // Check if model directory exists
    try {
      await fs.access(localModelPath);
      console.log('Model directory found ✓');
    } catch (err) {
      console.error('Model directory not found!');
      throw new Error(`Model directory does not exist: ${localModelPath}`);
    }

    // Suppress console.table during library operations
    const originalTable = console.table;
    console.table = () => {};

    tts = await KokoroTTS.from_pretrained(
      localModelPath,
      {
        dtype,
        device,
        local_files_only: true,
      },
    );

    console.table = originalTable;

    currentDtype = dtype;
    currentDevice = device;
    console.log("Model loaded successfully from local files ✓");
    return tts;
  } catch (err) {
    console.error("Model loading failed:", err.message);
    console.error("Make sure the model files are in:", localModelPath);
    throw err;
  }
}

// ────────────────────────────────────────────────────────────────
// Multer setup – file uploads
// ────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max per file
  fileFilter: (req, file, cb) => {
    const allowed = [".gltf", ".glb", ".splat"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .gltf, .glb, .splat files are allowed"), false);
    }
  },
});

// ────────────────────────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded files from the correct directory
app.use("/uploads", express.static(uploadDir));
// Serve audio files
app.use("/audio", express.static(audioDir));

// ────────────────────────────────────────────────────────────────
// TTS Endpoints
// ────────────────────────────────────────────────────────────────
app.post("/api/generate-audio", async (req, res) => {
  try {
    let { text, voice, dtype, device } = req.body;

    text = (text || "").trim();
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    voice = voice || "af_heart";
    dtype = dtype || "q8";
    device = device || "cpu";

    const validDtypes = ["fp32", "fp16", "q8", "q4", "q4f16"];
    const validDevices = ["cpu"];

    if (!validDtypes.includes(dtype)) {
      return res
        .status(400)
        .json({ error: `Invalid dtype. Allowed: ${validDtypes.join(", ")}` });
    }
    if (!validDevices.includes(device)) {
      return res
        .status(400)
        .json({ error: `Invalid device. Allowed: ${validDevices.join(", ")}` });
    }

    await loadModel(dtype, device);
    const audio = await tts.generate(text, { voice });

    const timestamp = Date.now();
    const filename = `tts-${timestamp}.wav`;
    const filepath = path.join(audioDir, filename);

    await audio.save(filepath);

    res.json({
      success: true,
      audioUrl: `/audio/${filename}`,
      filename: filename,
      voice,
      dtype,
      device,
      text,
    });
  } catch (err) {
    console.error("TTS generation error:", err);
    res.status(500).json({
      error: "Failed to generate speech",
      details: err.message,
    });
  }
});

app.get("/api/voices", async (req, res) => {
  try {
    if (!tts) {
      await loadModel("q8", "cpu");
    }
    const voices = await tts.list_voices();

    // Ensure we return an array
    if (!voices || !Array.isArray(voices)) {
      return res.json([
        "af_heart",
        "af_bella",
        "af_sarah",
        "am_adam",
        "am_michael",
      ]); // fallback defaults
    }

    res.json(voices);
  } catch (err) {
    console.error("Voices endpoint error:", err);
    // Return default voices on error
    res.json(["af_heart", "af_bella", "af_sarah", "am_adam", "am_michael"]);
  }
});

// ────────────────────────────────────────────────────────────────
// Database setup with sqlite3
// ────────────────────────────────────────────────────────────────
const dbPath = path.join(dbDir, "database.db");

const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Failed to open database:", err.message);
    } else {
      console.log(`Connected to SQLite database at ${dbPath}`);
    }
  },
);

// Helper: promisify db.run
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper: promisify db.get
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper: promisify db.all
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize schema (runs once on startup)
(async () => {
  try {
    await runAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT 'Untitled Project',
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TRIGGER IF NOT EXISTS update_timestamp
      AFTER UPDATE ON projects
      FOR EACH ROW
      BEGIN
        UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `);

    console.log("Database schema initialized");
  } catch (err) {
    console.error("Failed to create tables/triggers:", err);
  }
})();

// ────────────────────────────────────────────────────────────────
// API Endpoints
// ────────────────────────────────────────────────────────────────

app.get("/api/projects", async (req, res) => {
  try {
    const rows = await allAsync(`
      SELECT id, name, created_at, updated_at
      FROM projects
      ORDER BY updated_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /projects error:", err.message);
    res.status(500).json({ error: "Failed to load projects" });
  }
});

app.get("/api/project/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const row = await getAsync(
      `
      SELECT id, name, data, created_at, updated_at
      FROM projects
      WHERE id = ?
    `,
      [Number(id)],
    );

    if (!row) {
      return res.status(404).json({ error: "Project not found" });
    }

    const parsedData = JSON.parse(row.data);
    res.json({
      ...row,
      data: parsedData,
    });
  } catch (err) {
    console.error("GET /project/:id error:", err.message);
    res.status(500).json({ error: "Failed to load project" });
  }
});

app.post("/api/project/save", async (req, res) => {
  const { name = "Untitled Project", data } = req.body;

  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Missing or invalid data object" });
  }

  const jsonString = JSON.stringify(data);

  try {
    const { lastID } = await runAsync(
      `
      INSERT INTO projects (name, data)
      VALUES (?, ?)
    `,
      [name, jsonString],
    );

    res.json({
      id: lastID,
      message: "Project saved successfully",
      name,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("POST /save error:", err.message);
    res.status(500).json({ error: "Failed to save project" });
  }
});

app.get("/api/project/latest", async (req, res) => {
  try {
    const row = await getAsync(`
      SELECT id, name, data, created_at, updated_at
      FROM projects
      ORDER BY updated_at DESC
      LIMIT 1
    `);

    if (!row) {
      return res.status(404).json({ message: "No saved project found yet" });
    }

    const parsedData = JSON.parse(row.data);
    res.json({
      ...row,
      data: parsedData,
    });
  } catch (err) {
    console.error("GET /latest error:", err.message);
    res.status(500).json({ error: "Failed to load latest project" });
  }
});

app.put("/api/project/:id", async (req, res) => {
  const { name, data } = req.body;
  const { id } = req.params;

  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Missing or invalid data" });
  }

  try {
    const { changes } = await runAsync(
      `
      UPDATE projects
      SET name = ?,
          data = ?
      WHERE id = ?
    `,
      [name || "Untitled Project", JSON.stringify(data), Number(id)],
    );

    if (changes === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project updated successfully" });
  } catch (err) {
    console.error("PUT /:id error:", err.message);
    res.status(500).json({ error: "Failed to update project" });
  }
});

app.delete("/api/project/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { changes } = await runAsync(
      `
      DELETE FROM projects WHERE id = ?
    `,
      [Number(id)],
    );

    if (changes === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("DELETE /:id error:", err.message);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// File upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "No file uploaded or invalid file type" });
  }

  const relativePath = `/uploads/${req.file.filename}`;
  const fullUrl = `${req.protocol}://${req.get("host")}${relativePath}`;

  res.json({
    success: true,
    url: relativePath,
    fullUrl: fullUrl,
    filename: req.file.originalname,
    size: req.file.size,
  });
});

// Serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Pre-load model on startup (optional - makes first request faster)
(async () => {
  try {
    console.log("Pre-loading TTS model...");
    await loadModel("q8", "cpu");
    console.log("TTS model ready");
  } catch (err) {
    console.error("Failed to pre-load model:", err.message);
    console.log("TTS model will load on first request");
  }
})();

// ────────────────────────────────────────────────────────────────
// Start server
// ────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Open in browser → http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    }
    process.exit(0);
  });
});