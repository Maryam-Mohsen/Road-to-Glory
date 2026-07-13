const userData = JSON.parse(localStorage.getItem('rtg_user'));

if (userData) {
  const username = document.getElementById('username');

  if (username) {
    username.textContent = userData.name;
  }
}