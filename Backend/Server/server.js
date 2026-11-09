//usando as ferramentas em que baixei
//require('dotenv').config();
const express = require ("express");// biblioteca que esta criando o servidor web
const app = express(); // esta iniciando o servidor e guarda na variavel.
const db = require('../Connection/db');
const dashboardroutes = require("../Routes/dashboardRoutes");
const dispositivoRoutes = require("../Routes/dispositivoRoutes");
const veiculoRoutes = require("../Routes/veiculoRoutes");
const permissaoRoutes = require("../Routes/permissaoRoutes");
const registrosRoutes = require('../Routes/registroOcupacaoRoutes');
//traz o caminho que criei
//const rotasDeUsuarios = require ('../Routes/usuarioRoutes');
 
// transformando oq vier do front  em dados json fazendo com o node js entenda
app.use(express.json());

app.get('/teste-conexao', async (req, res)=>{

  try{
    const [rows] = await db.query('SELECT 1 + 1 AS resultado');
    res.status(200).json({conectado: true, resultado: rows[0].resultado});
  }catch(erro){
    res.status(500).json({conectado: false, erro: erro.message})
  }


});
app.use(express.json());
app.use("/", dashboardroutes);
app.use('/', dispositivoRoutes);
app.use("/", veiculoRoutes);
app.use('/', registrosRoutes);
app.use("/", permissaoRoutes);
app.use('/', registrosRoutes);



// qualquer requisiçao /api pra rotas
 
//app.use('/api', rotasDeUsuarios);
 
const PORTA = 3308; // valor de teste. Depois, muda para a porta que estiver online
app.listen(PORTA, () => {
    console.log(`Servidor rodando  e escutando na porta ${PORTA}`);
});
