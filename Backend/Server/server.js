require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env"), quiet: true });

const express = require("express");
const cors = require("cors");
const vagasRoute = require("../Routes/vagaRoutes");
const dashboardRoute = require("../Routes/dashboardRoutes");
const registrosRoutes = require('../Routes/registroOcupacaoRoutes');
// Login, perfil e notificações (ver docs/MODULO_LOGIN.md)
const authRoutes = require("../Routes/authRoutes");
const usuarioRoutes = require("../Routes/usuarioRoutes");
const notificacaoRoutes = require("../Routes/notificacaoRoutes");
const emailService = require("../Services/emailService");

const app = express();

// Necessário para o limite de tentativas do login funcionar certo atrás de proxy
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

app.use("/vagas", vagasRoute);
app.use("/dashboard", dashboardRoute);
app.use('/registros', registrosRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/notificacoes", notificacaoRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
    emailService.verificarConexao();
});
