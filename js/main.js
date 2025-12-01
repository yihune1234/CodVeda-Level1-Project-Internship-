const API_URL = 'https://codveda-level1-project-internship-kq7f.onrender.com/api/events';

async function loadEvents() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch');
    const events = await res.json();

    const container = document.getElementById('events-list');
    container.innerHTML = ''; // Clear previous cards

    if (events.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:white; font-size:1.3rem;">No events yet. Create one!</p>';
      return;
    }

    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <div class="card-body">
          <h3>${event.title}</h3>
          
          <p><strong>Date:</strong> 
            ${new Date(event.date).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          
          <p><strong>Location:</strong> ${event.location || 'Not specified'}</p>
          
          <p>${event.description || '<em style="color:#888;">No description</em>'}</p>
          
          <div class="card-actions">
            <a href="edit-event.html?id=${event.id}" class="btn-edit">Edit</a>
            <button class="btn-delete" onclick="deleteEvent('${event.id}')">Delete</button>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    document.getElementById('events-list').innerHTML = `
      <p style="text-align:center; color:#ff6b6b; font-weight:600;">
        Failed to load events. Is the backend running?
      </p>
    `;
  }
}

async function deleteEvent(id) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      alert("Event deleted successfully!");
      loadEvents(); // Refresh list
    } else {
      alert("Failed to delete event");
    }
  } catch (err) {
    alert("Network error. Check console.");
  }
}

// Auto load events when page opens
document.addEventListener('DOMContentLoaded', loadEvents);