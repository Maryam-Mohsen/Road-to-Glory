const user = requireAuth();
const grid = document.getElementById('events-grid');
const msg = document.getElementById('msg');

function showMsg(el, text, type) {
  el.innerHTML = `<div class="msg ${type}">${text}</div>`;
  setTimeout(() => (el.innerHTML = ''), 4000);
}


if (user.role === 'organizer') {
  document.getElementById('create-event-card').classList.remove('hidden');
}

async function loadEvents() {
  try {
    const { events } = await api(user.role === 'admin' ? '/events?status=all' : '/events');
    grid.innerHTML = events
      .map((ev) => {
        const full = ev.availableSeats <= 0;
        return `
        <div class="event-card" id="card-${ev._id}">
          <span class="cat">${ev.category}</span>
          <span class="pill" style="float:right;">${ev.status}</span>
          <h3>${ev.title}</h3>
          <div class="meta">📍 ${ev.location}</div>
          <div class="meta">🗓 ${new Date(ev.date).toLocaleString()}</div>
          <p>${ev.description}</p>
          <div class="seats"><b>${ev.availableSeats}</b> / ${ev.capacity} seats available</div>
          ${
              user.role === 'attendee'
                ? `<button ${full ? 'disabled' : ''} onclick="book('${ev._id}')">${full ? 'Fully Booked' : 'Reserve Ticket'}</button>`
                : `<span class="pill">Organized by ${ev.organizer?.name || 'N/A'}</span>`
            }
          ${
  user.role === 'admin'
    ? `<div style="margin-top:12px;">
        <button onclick="window.location.href='edit-event.html?id=${ev._id}'">Edit</button>
        ${
  ev.status === 'pending'
    ? `
        <button onclick="reviewEvent('${ev._id}','approved')">Approve</button>
        <button onclick="reviewEvent('${ev._id}','rejected')">Reject</button>
      `
    : ev.status === 'approved'
    ? `
        <button onclick="reviewEvent('${ev._id}','rejected')">Reject</button>
      `
    : `
        <button onclick="reviewEvent('${ev._id}','approved')">Approve</button>
      `
}
        <button onclick="deleteEvent('${ev._id}')">Delete Event</button>
        </div>`
    : ''
}
          <div style="margin-top:14px; border-top:1px solid var(--line); padding-top:10px;">
            <span class="pill" style="cursor:pointer;" onclick="toggleFeedback('${ev._id}')">💬 View Feedback</span>
            <div id="feedback-${ev._id}" class="hidden" style="margin-top:10px;"></div>
          </div>
        </div>`;
      })
      .join('');
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}


async function deleteEvent(eventId) {
  if (!confirm('Delete this event permanently? This cannot be undone.')) return;
  try {
    await api(`/events/${eventId}`, { method: 'DELETE' });
    showMsg(msg, 'Event deleted.', 'success');
    loadEvents();
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}

async function reviewEvent(eventId, decision) {
  try {
    await api(`/events/${eventId}/review`, {
      method: 'PATCH',
      body: { decision },
    });

    showMsg(msg, `Event ${decision} successfully.`, 'success');
    loadEvents();
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}

async function toggleFeedback(eventId) {
  const box = document.getElementById(`feedback-${eventId}`);
  box.classList.toggle('hidden');
  if (box.classList.contains('hidden') || box.dataset.loaded) return;

  try {
    const { feedback } = await api(`/feedback/event/${eventId}`);
    box.dataset.loaded = '1';
    box.innerHTML = feedback.length
      ? feedback
          .map(
            (f) => `
        <div class="ticket" style="border-style:solid;">
          <div>${'⭐'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</div>
          <div class="pill">${f.user?.name || 'Attendee'}</div>
          <p style="margin:8px 0 0;">${f.comment || ''}</p>
        </div>`
          )
          .join('')
      : '<p style="color:var(--muted);">No feedback yet.</p>';
  } catch (err) {
    box.innerHTML = `<div class="msg error">${err.message}</div>`;
  }
}

async function book(eventId) {
  try {
    await api('/reservations', { method: 'POST', body: { eventId } });
    showMsg(msg, 'Ticket reserved! Check your dashboard for your digital ticket.', 'success');
    loadEvents();
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}

const createForm = document.getElementById('create-form');
if (createForm) {
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const createMsg = document.getElementById('create-msg');
    try {
      await api('/events', {
        method: 'POST',
        body: {
          title: document.getElementById('ev-title').value,
          category: document.getElementById('ev-category').value,
          description: document.getElementById('ev-description').value,
          location: document.getElementById('ev-location').value,
          date: document.getElementById('ev-date').value,
          capacity: Number(document.getElementById('ev-capacity').value),
        },
      });
      showMsg(createMsg, 'Event request submitted. Waiting for admin approval.', 'success');      createForm.reset();
      loadEvents();
    } catch (err) {
      showMsg(createMsg, err.message, 'error');
    }
  });
}

loadEvents();