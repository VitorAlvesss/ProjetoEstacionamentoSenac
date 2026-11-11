import { alerta } from '../assets/js/sweetAlert.js';

const API_URL = window.location.origin;

const linkEsqueciSenha = document.querySelector('.forgot-link');
const FORM_LOGIN = document.querySelector('.login-form');
const campoEmail = document.getElementById('username');
const campoSenha = document.getElementById('password');

linkEsqueciSenha.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '../esqueciSenha/index.html';
});

FORM_LOGIN.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    try {
        const res = await fetch(`${API_URL}/usuario/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (res.ok) {
            window.location.href = '../index.html';
            return;
        }

        await alerta(
            'error',
            'Não foi possível entrar',
            'Verifique suas credenciais e se a rota de login está configurada no servidor.'
        );
    } catch (erro) {
        console.error('Erro ao tentar fazer login:', erro);
        await alerta(
            'error',
            'Erro de conexão',
            'Não foi possível conectar ao servidor.'
        );
    }
});



