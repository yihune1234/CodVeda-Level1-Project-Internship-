<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const fs = require('node:fs/promises');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Path to data file
const DATA_FILE = path.join(__dirname, 'data', 'events.json');
let latestWrite = Promise.resolve();

const ensureDataFile = async () => {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]');
  }
};

const enqueueWrite = (operation) => {
  latestWrite = latestWrite
    .then(operation)
    .catch((err) => {
      console.error('Write queue error:', err);
      throw err;
    });
  return latestWrite;
};

const readEvents = async () => {
  await latestWrite;
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
};

const writeEvents = async (events) => {
  await enqueueWrite(async () => {
    await fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2));
  });
};

const validateEventPayload = ({ title, date }) => {
  if (!title || !date) return 'Title and date are required';
  if (typeof title !== 'string' || title.trim().length < 3) return 'Title must be at least 3 characters';
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) return 'Date must use YYYY-MM-DD format';
  return null;
};

app.get('/api/events', async (req, res) => {
  try {
    const events = await readEvents();
    res.json(events);
  } catch (err) {
    console.error('GET /api/events failed:', err);
    res.status(500).json({ message: 'Unable to read events' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const validationError = validateEventPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { title, date, location, description } = req.body;
    const events = await readEvents();
    const newEvent = {
      id: uuidv4(),
      title: title.trim(),
      date,
      location: location ? location.trim() : 'TBA',
      description: description ? description.trim() : '',
      createdAt: new Date().toISOString(),
    };

    events.push(newEvent);
    await writeEvents(events);

    res.status(201).json(newEvent);
  } catch (err) {
    console.error('POST /api/events failed:', err);
    res.status(500).json({ message: 'Unable to create event' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const events = await readEvents();
    const filtered = events.filter((event) => event.id !== id);

    if (filtered.length === events.length) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await writeEvents(filtered);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/events/:id failed:', err);
    res.status(500).json({ message: 'Unable to delete event' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validationError = validateEventPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { title, date, location, description } = req.body;
    const events = await readEvents();
    const index = events.findIndex((event) => event.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }

    events[index] = {
      ...events[index],
      title: title.trim(),
      date,
      location: location ? location.trim() : 'TBA',
      description: description ? description.trim() : '',
    };

    await writeEvents(events);
    res.json({ message: 'Event updated successfully', event: events[index] });
  } catch (err) {
    console.error('PUT /api/events/:id failed:', err);
    res.status(500).json({ message: 'Unable to update event' });
  }
});

const startServer = async () => {
  try {
    await ensureDataFile();
    app.listen(PORT, () => {
      console.log(`API Running → http://localhost:${PORT}`);
      console.log(`Data file: ${DATA_FILE}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
=======
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Path to data file
const DATA_FILE = path.join(__dirname, 'data', 'events.json');

// Helper: Read events
const readEvents = () => {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
};

// Helper: Write events
const writeEvents = (events) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
};

// GET all events
app.get('/api/events', (req, res) => {
  try {
    const events = readEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error reading events" });
  }
});

// POST new event
app.post('/api/events', (req, res) => {
  try {
    const { title, date, location, description } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required" });
    }

    const events = readEvents();
    const newEvent = {
      id: uuidv4(),
      title,
      date,
      location: location || "TBA",
      description: description || "",
      createdAt: new Date().toISOString()
    };

    events.push(newEvent);
    writeEvents(events);

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ message: "Error creating event" });
  }
});

// DELETE event
app.delete('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    let events = readEvents();
    const filtered = events.filter(event => event.id !== id);

    if (filtered.length === events.length) {
      return res.status(404).json({ message: "Event not found" });
    }

    writeEvents(filtered);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting event" });
  }
});
// PUT - Update event
app.put('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, location, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required" });
    }

    let events = readEvents();
    const index = events.findIndex(event => event.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Event not found" });
    }

    events[index] = {
      ...events[index],
      title,
      date,
      location: location || "TBA",
      description: description || ""
    };

    writeEvents(events);
    res.json({ message: "Event updated successfully", event: events[index] });
  } catch (err) {
    res.status(500).json({ message: "Error updating event" });
  }
});
app.listen(PORT, () => {
  console.log(`API Running → http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
>>>>>>> dd66ad372427708d74da939c0562f66c08e8b4a8
