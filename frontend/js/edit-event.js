const user = requireAuth();

const form = document.getElementById('edit-form');
const msg = document.getElementById('msg');

const params = new URLSearchParams(window.location.search);
const eventId = params.get('id');
// alert(eventId);
function showMsg(text, type) {
  msg.innerHTML = `<div class="msg ${type}">${text}</div>`;
}

async function loadEvent() {
  try {
    const { event } = await api(`/events/${eventId}`);

    document.getElementById('title').value = event.title;
    document.getElementById('description').value = event.description;
    document.getElementById('category').value = event.category;
    document.getElementById('location').value = event.location;

    const date = new Date(event.date);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    document.getElementById('date').value = date.toISOString().slice(0, 16);

    document.getElementById('capacity').value = event.capacity;

  } catch (err) {
    showMsg(err.message, 'error');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    await api(`/events/${eventId}`, {
      method: 'PUT',
      body: {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        location: document.getElementById('location').value,
        date: document.getElementById('date').value,
        capacity: Number(document.getElementById('capacity').value),
      },
    });

    showMsg('Event updated and sent for admin review.', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);

  } catch (err) {
    showMsg(err.message, 'error');
  }
});

loadEvent();