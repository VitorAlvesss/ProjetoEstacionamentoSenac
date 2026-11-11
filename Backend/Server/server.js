const express = require("express");
const cors = require("cors");
const vagasRoute = require("../Routes/vagaRoutes");
const dashboardRoute = require("../Routes/dashboardRoutes");
const registrosRoutes = require('../Routes/registroOcupacaoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use("/vagas", vagasRoute);
app.use("/dashboard", dashboardRoute);
app.use('/registros', registrosRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
