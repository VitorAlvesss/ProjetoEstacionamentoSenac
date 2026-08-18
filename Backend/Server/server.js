<<<<<<< HEAD
const express = require('express');
const app = express();

app.use(express.json());

const rotas_pagamento = require('./routes/pagamentoRoutes');

app.use('/api', rotas_pagamento);

const PORTA_SERVIDOR = process.env.PORTA || 3000;

app.listen(PORTA_SERVIDOR, () => {
    console.log(`Servidor rodando na porta ${PORTA_SERVIDOR} 🚀`);
});
=======
//usando as ferramentas em que baixei
require('dotenv').config();
console.log('SENHA CARREGADA:', process.env.DB_PASSWORD);
const express = require ("express");// biblioteca que esta criando o servidor web
const app = express(); // esta iniciando o servidor e guarda na variavel.
const db = require('../Connection/db');
//traz o caminho que criei
//const rotasDeUsuarios = require ('../Routes/usuarioRoutes');
 
// transformando oq vier do front  em dados json fazendo com o node js entenda

app.get('/teste-conexao', async (req, res)=>{

  try{
    const [rows] = await db.query('SELECT 1 + 1 AS resultado');
    res.status(200).json({conectado: true, resultado: rows[0].resultado});
  }catch(erro){
    res.status(500).json({conectado: false, erro: erro.message})
  }


});

app.use(express.json());
 
// qualquer requisiçao /api pra rotas
 
//app.use('/api', rotasDeUsuarios);
 
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log (`Servidor rodando  e escutando na porta ${PORTA}`);
});
>>>>>>> 63d0226509d27661d6f39d5cf050c923aa8c9e03
