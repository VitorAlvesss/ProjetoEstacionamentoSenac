const authController = {
    testarLogin: (req, res) => {
        // Se o código chegou até aqui, é porque o Middleware (Guarda) deixou passar!
        return res.status(200).json({
            mensagem: "✅ Login validado com sucesso pelo Firebase!",
            dadosDoUsuario: {
                id: req.usuarioLogado.uid,
                email: req.usuarioLogado.email
            }
        });
    }
};

module.exports = authController;