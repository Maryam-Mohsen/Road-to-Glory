const user = requireAuth();

document.getElementById('username').textContent = user.name;

const msg = document.getElementById('msg');
document.getElementById('welcome').textContent = `Welcome, ${user.name}`;

function showMsg(el, text, type) {
  el.innerHTML = `<div class="msg ${type}">${text}</div>`;
  setTimeout(() => (el.innerHTML = ''), 4000);
}

if (user.role === 'attendee') initAttendee();
if (user.role === 'organizer') initOrganizer();
if (user.role === 'admin') initAdmin();

// ---------- ATTENDEE ----------
async function initAttendee() {
  document.getElementById('attendee-section').classList.remove('hidden');
  try {
        const { notifications } = await api('/notifications');

    document.getElementById('notifications-list').innerHTML = notifications.length ? notifications.map(n => `
            <div class="event-card" style="margin-bottom:10px;">
              <h4>${n.title}</h4>
              <p>${n.message}</p>
              <small>${new Date(n.createdAt).toLocaleString()}</small>
            </div>
          `).join('')
        : '<p>No notifications.</p>';
    const { reservations } = await api('/reservations/my');
    document.getElementById('tickets-list').innerHTML = reservations
      .map(
        (r) => `
      <div class="ticket">
        <span class="status ${r.status}">${r.status}</span>
        <div class="code">${r.ticketCode}</div>
        <div>${r.event?.title || 'Event removed'}</div>
        <div class="pill">${r.event ? new Date(r.event.date).toLocaleString() : ''}</div>
        ${
          r.status === 'confirmed'
            ? `<div style="margin-top:12px;">
                 <button class="btn-outline" onclick="cancelReservation('${r._id}')">Cancel</button>
                 <button class="btn-gold" onclick="leaveFeedback('${r.event?._id}')">Leave Feedback</button>
               </div>`
            : ''
        }
      </div>`
      )
      .join('') || '<p>No reservations yet. Browse events to get your first ticket.</p>';
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}

async function cancelReservation(id) {
  try {
    await api(`/reservations/${id}`, { method: 'DELETE' });
    showMsg(msg, 'Reservation cancelled.', 'success');
    initAttendee();
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}

async function leaveFeedback(eventId) {
  const rating = prompt('Rate your experience from 1 to 5:');
  if (!rating) return;
  const comment = prompt('Any comments? (optional)') || '';
  try {
    await api('/feedback', { method: 'POST', body: { eventId, rating: Number(rating), comment } });
    showMsg(msg, 'Thanks for your feedback!', 'success');
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}

// ---------- ORGANIZER ----------
async function initOrganizer() {
  document.getElementById('organizer-section').classList.remove('hidden');
  try {
    const { events: mine } = await api('/events/my-events');
    const rows = await Promise.all(
      mine.map(async (ev) => {
        const report = await api(`/reports/event/${ev._id}`).catch(() => null);
        return `
        <div class="event-card" style="margin-bottom:14px;">
          <span class="cat">${ev.category}</span>
          <span class="pill">${ev.status}</span>
          <h3>${ev.title}</h3>
          <div class="meta">📍 ${ev.location} · 🗓 ${new Date(ev.date).toLocaleString()}</div>
          <div class="seats"><b>${ev.reservedCount}</b> / ${ev.capacity} reserved</div>
          <div style="margin-top:12px;">
            <button onclick="window.location.href='edit-event.html?id=${ev._id}'">Edit</button>  
            <button class="btn-outline" onclick="deleteEvent('${ev._id}')">Delete</button>
          </div>
          ${
            report
              ? `<div class="stat-row" style="margin-top:10px;">
                  <div class="stat"><div class="num">${report.attendanceCount}</div><div class="label">Checked In</div></div>
                  <div class="stat"><div class="num">${report.attendanceRate}%</div><div class="label">Attendance Rate</div></div>
                  <div class="stat"><div class="num">${report.averageRating ?? '—'}</div><div class="label">Avg Rating</div></div>
                </div>`
              : ''
          }
        </div>`;
      })
    );
    document.getElementById('organizer-events').innerHTML =
      rows.join('') || '<p>You have not published any events yet.</p>';
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}

async function editEvent(id) {
  const title = prompt('Event title:');
  if (!title) return;

  const description = prompt('Description:');
  const category = prompt('Category:');
  const location = prompt('Location:');
  const date = prompt('Date (YYYY-MM-DD):');
  const capacity = prompt('Capacity:');

  try {
    await api(`/events/${id}`, {
      method: 'PUT',
      body: {
        title,
        description,
        category,
        location,
        date,
        capacity: Number(capacity),
      },
    });

    showMsg(msg, 'Event updated and sent for admin review.', 'success');
    initOrganizer();
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}

async function deleteEvent(id) {
  if (!confirm('Are you sure you want to delete this event?')) return;

  try {
    await api(`/events/${id}`, {
      method: 'DELETE',
    });

    showMsg(msg, 'Event deleted successfully.', 'success');
    initOrganizer();
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}


// ---------- ADMIN ----------
async function initAdmin() {
  document.getElementById('admin-section').classList.remove('hidden');
  try {
    const overview = await api('/reports/overview');
    document.getElementById('overview-stats').innerHTML = `
      <div class="stat"><div class="num">${overview.totalUsers}</div><div class="label">Users</div></div>
      <div class="stat"><div class="num">${overview.totalEvents}</div><div class="label">Events</div></div>
      <div class="stat"><div class="num">${overview.totalReservations}</div><div class="label">Reservations</div></div>
      <div class="stat"><div class="num">${overview.totalAttendance}</div><div class="label">Check-ins</div></div>
    `;

  

    await loadAllUsers();
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}


async function loadAllUsers() {
  const { users } = await api('/users');
  const tbody = document.querySelector('#users-table tbody');
  tbody.innerHTML = users
    .map(
      (u) => `
    <tr>
      <td>${u.name}</td>
      <td>${u.username ? '@' + u.username : u.email}</td>
      <td><span class="pill">${u.role}</span></td>
      <td>${u.isActive ? 'Active' : 'Deactivated'}</td>
      <td>
        ${
          u.role === 'admin'
            ? '—'
            : u.isActive
            ? `<button class="btn-outline" onclick="setUserActive('${u._id}', false)">Deactivate</button>`
            : `<button onclick="setUserActive('${u._id}', true)">Activate</button>`
        }
        ${
          u.role === 'organizer'
            ? `<button onclick="deleteOrganizer('${u._id}')">Delete</button>`
            : ''
        }
      </td>
    </tr>`
    )
    .join('');
}

async function setUserActive(id, isActive) {
  try {
    await api(`/users/${id}/status`, { method: 'PUT', body: { isActive } });
    showMsg(msg, `Account ${isActive ? 'activated' : 'deactivated'}.`, 'success');
    loadAllUsers();
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}

async function deleteOrganizer(id) {
  if (!confirm('Delete this organizer account? Their events will be removed too. This cannot be undone.')) return;
  try {
    await api(`/users/${id}`, { method: 'DELETE' });
    showMsg(msg, 'Organizer account deleted.', 'success');
    loadAllUsers();
  } catch (err) {
    showMsg(msg, err.message, 'error');
  }
}
