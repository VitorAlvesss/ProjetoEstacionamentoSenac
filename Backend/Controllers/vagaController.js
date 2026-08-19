const model = require("../Model/vagaModel");

exports.salvar = (req, res) => {
    const vaga = req.body;
    model.inserirVaga(vaga, (resultado) => {
        if(resultado >1){
            res.status(201).json({
            mensagem: "Vaga cadastrada com sucesso."
        });
        }
        else{
            res.status(409).json({
                mensagem: "Erro ao criar vaga."
            });
        }
    });
};

exports.listarTodos = (req, res) => {
    model.listarVagas((resultado) => {
        res.json(resultado);
    });
};