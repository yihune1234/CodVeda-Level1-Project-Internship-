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
