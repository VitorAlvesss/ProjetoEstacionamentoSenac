require('dotenv').config();

const express = require("express");
const cors = require('cors');
const APP = express();
const DB = require('../Connection/db');

const rotasDePagamento = require('../Routes/pagamentoRoutes'); // rotas de pagamento agora ativas

APP.use(cors());
APP.use(express.json());

APP.get('/teste-conexao', async (req, res) => {
  try {
    const [linhas_resultado] = await DB.query('SELECT 1 + 1 AS resultado');
    res.status(200).json({ conectado: true, resultado: linhas_resultado[0].resultado });
  } catch (erro) {
    res.status(500).json({ conectado: false, erro: erro.message });
  }
});

APP.use('/api', rotasDePagamento); // conecta as rotas de pagamento no /api

const PORTA = 3000;
APP.listen(PORTA, () => {
    console.log(`Servidor rodando e escutando na porta ${PORTA}`);
});