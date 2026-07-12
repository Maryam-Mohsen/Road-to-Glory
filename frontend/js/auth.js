
if (getToken()) window.location.href = 'events.html';

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const msg = document.getElementById('msg');

tabLogin.onclick = () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  msg.innerHTML = '';
};

tabRegister.onclick = () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  msg.innerHTML = '';
};

function showMsg(text, type) {
  msg.innerHTML = `<div class="msg ${type}">${text}</div>`;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
      },
    });
    setSession(data.token, data.user);
    window.location.href = 'events.html';
  } catch (err) {
    showMsg(err.message, 'error');
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value,
      },
    });
    setSession(data.token, data.user);
    showMsg('Account created! Redirecting...', 'success');
    setTimeout(() => (window.location.href = 'events.html'), 800);
  } catch (err) {
    showMsg(err.message, 'error');
  }
});
