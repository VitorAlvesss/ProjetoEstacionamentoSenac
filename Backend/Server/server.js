//usando as ferramentas em que baixei
const express = require ("express");// biblioteca que esta criando o servidor web
const app = express(); // esta iniciando o servidor e guarda na variavel.
 
//traz o caminho que criei
const rotasDeUsuarios = require ('../Routes/usuarioRoutes');
 
// transformando oq vier do front  em dados json fazendo com o node js entenda
 
app.use(express.json());
 
// qualquer requisiçao /api pra rotas
 
app.use('/api', rotasDeUsuarios);
 
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log (`Servidor rodando  e escutando na porta ${PORTA}`);
})
 
/*
const express = require("express");
const app = express();

// const rotasDeUsuarios = require('../Routes/usuariosRoutes');

app.use(express.json());

// app.use('/api', rotasDeUsuarios);

app.get('/', (req, res) => {
  res.send('Servidor funcionando!');
});

const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando e escutando na porta ${PORTA}`);
});
*/