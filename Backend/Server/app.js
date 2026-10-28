//app.js
// Monta a API (middlewares + rotas). Quem "liga" o servidor na porta é o server.js.
// Separado assim para o teste automático (npm run testar) conseguir subir a API sozinho.
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env'), quiet: true });

const express = require('express');
const cors = require('cors');
const app = express();

const authRoutes = require('../Routes/authRoutes');
const usuarioRoutes = require('../Routes/usuarioRoutes');
const notificacaoRoutes = require('../Routes/notificacaoRoutes');

// Necessário para o limite de tentativas funcionar certo atrás de proxy (ex.: deploy)
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Só as origens do front configuradas no .env podem chamar a API pelo navegador
const origensPermitidas = (process.env.CORS_ORIGINS || 'http://127.0.0.1:5501,http://localhost:5501')
    .split(',')
    .map((origem) => origem.trim());
app.use(cors({ origin: origensPermitidas }));

app.use(express.json({ limit: '10kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/notificacoes', notificacaoRoutes);

module.exports = app;
