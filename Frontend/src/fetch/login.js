const API_URL = import.meta.env.VITE_API_URL;

const FORM_LOGIN = document.querySelector('.login-form');
const email = document.getElementById('username');
const senha = document.getElementById('password');

FORM_LOGIN.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/usuario/login`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email,senha})})

    if(res.ok) window.location.href = '../index.html';

})