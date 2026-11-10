const express = require("express");
const cors = require("cors");
const vagasRoute = require("../Routes/vagaRoutes");
const dashboardRoute = require("../Routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/vagas", vagasRoute);
app.use("/dashboard", dashboardRoute);

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});