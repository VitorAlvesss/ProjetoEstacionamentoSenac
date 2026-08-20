//usando as ferramentas em que baixei
require('dotenv').config();
const express = require ("express");// biblioteca que esta criando o servidor web
const app = express(); // esta iniciando o servidor e guarda na variavel.
const db = require('../Connection/db');
const dashboardroutes = require("../Routes/testeDash");
const routes = express.Router();
const dashboardController = require("../Controllers/dashboardController");
const router = require('../Routes/testeDash');

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
//isso vai ficar aqui temporariamente
router.get("/dashboard", dashboardController.buscarDash)
module.exports = router;

app.use("/", dashboardroutes)
app.use(express.json());
 
// qualquer requisiçao /api pra rotas
 
//app.use('/api', rotasDeUsuarios);
 
const PORTA = 19696;
app.listen(PORTA, () => {
    console.log (`Servidor rodando  e escutando na porta ${PORTA}`);
});
