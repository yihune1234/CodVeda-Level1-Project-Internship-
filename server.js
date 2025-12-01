// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to JSON file
const DATA_FILE = path.join(__dirname, 'data', 'events.json');

// Ensure data folder and file exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

// Helper functions
const readEvents = () => {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
};

const writeEvents = (events) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8');
};

// Validation
const validateEvent = ({ title, date }) => {
  if (!title || !date) return 'Title and date are required';
  if (title.trim().length < 3) return 'Title must be at least 3 characters';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Date must be in YYYY-MM-DD format';
  return null;
};

// Routes

// GET all events
app.get('/api/events', (req, res) => {
  try {
    const events = readEvents();
    res.json(events);
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ message: 'Failed to load events' });
  }
});

// POST - Create event
app.post('/api/events', (req, res) => {
  try {
    const error = validateEvent(req.body);
    if (error) return res.status(400).json({ message: error });

    const { title, date, location, description } = req.body;
    const events = readEvents();

    const newEvent = {
      id: uuidv4(),
      title: title.trim(),
      date,
      location: location?.trim() || 'TBA',
      description: description?.trim() || '',
      createdAt: new Date().toISOString()
    };

    events.push(newEvent);
    writeEvents(events);

    res.status(201).json(newEvent);
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// DELETE event
app.delete('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const events = readEvents();
    const filtered = events.filter(event => event.id !== id);

    if (filtered.length === events.length) {
      return res.status(404).json({ message: 'Event not found' });
    }

    writeEvents(filtered);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

// PUT - Update event
app.put('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const error = validateEvent(req.body);
    if (error) return res.status(400).json({ message: error });

    const { title, date, location, description } = req.body;
    const events = readEvents();
    const index = events.findIndex(event => event.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }

    events[index] = {
      ...events[index],
      title: title.trim(),
      date,
      location: location?.trim() || 'TBA',
      description: description?.trim() || ''
    };

    writeEvents(events);
    res.json({ message: 'Event updated successfully', event: events[index] });
  } catch (err) {
    console.error('PUT error:', err);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data saved at: ${DATA_FILE}`);
});