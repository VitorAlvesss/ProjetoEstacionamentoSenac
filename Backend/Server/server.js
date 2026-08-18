const express = require('express');
const app = express();

app.use(express.json());

const rotas_pagamento = require('./routes/pagamentoRoutes');

app.use('/api', rotas_pagamento);

const PORTA_SERVIDOR = process.env.PORTA || 3000;

app.listen(PORTA_SERVIDOR, () => {
    console.log(`Servidor rodando na porta ${PORTA_SERVIDOR} 🚀`);
});