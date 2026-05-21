import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "dev-data.json");
const raw = fs.readFileSync(dataPath, "utf8");
const store = JSON.parse(raw);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, now: new Date().toISOString() }));

app.get("/api/lawyers", (req, res) => {
  const docs = store.lawyers.map((l) => ({ ...l, user: store.users.find(u => u.id === l.userId) }));
  res.json(docs);
});

app.get("/api/appointments", (req, res) => {
  res.json(store.appointments);
});

app.post("/api/appointments", (req, res) => {
  const payload = req.body;
  const id = `appt_${Date.now()}`;
  const appt = { id, ...payload, createdAt: new Date().toISOString() };
  store.appointments.push(appt);
  res.status(201).json(appt);
});

app.post("/api/appointments/conflict-check", (req, res) => {
  const { lawyerId, preferredStart, preferredEnd } = req.body;
  const start = new Date(preferredStart);
  const end = new Date(preferredEnd);
  const appts = store.appointments.filter(a => a.lawyerId === lawyerId || !a.lawyerId);
  const conflict = appts.some(a => {
    const s = new Date(a.preferredStart || a.scheduledStart);
    const e = new Date(a.preferredEnd || a.scheduledEnd);
    return (start < e && end > s);
  });
  const availability = store.availability.filter(av => av.lawyerId === lawyerId).some(av => {
    const s = new Date(av.startsAt);
    const e = new Date(av.endsAt);
    return start >= s && end <= e;
  });
  res.json({ conflict, available: availability });
});

app.get("/api/notifications", (req, res) => {
  res.json(store.notifications);
});

const basePort = Number(process.env.PORT || 5000);
function listenWithRetry(app, port, attempts = 5) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Demo server listening on port ${port}`);
      resolve(server);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempts > 0) {
        console.warn(`Port ${port} in use, trying ${port + 1}`);
        setTimeout(() => {
          listenWithRetry(app, port + 1, attempts - 1).then(resolve).catch(reject);
        }, 200);
      } else {
        reject(err);
      }
    });
  });
}

listenWithRetry(app, basePort).catch(err => {
  console.error('Failed to start demo server:', err);
  process.exit(1);
});
