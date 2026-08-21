const model = require("../Model/vagaModel");

exports.salvar = async (req, res) => {
    try{
        const vaga = req.body; 
        const resultado = await model.inserirVaga(vaga);
        if(resultado){
            res.status(201).json({
            mensagem: "Vaga cadastrada com sucesso."
        });
        }
         res.status(409).json({        
            mensagem: "Erro ao criar vaga."
         });
        
    }catch(erro){
        console.log(erro)
        res.status(500).json({
            mensagem: "Erro interno na hora de inserir a vaga.",
            erro: erro.message
        })
    }
};
    
exports.listarTodos = async(req, res) =>{
    try{
        const resultado = await model.listarVagas()
        if(resultado !== null){
            return res.json(resultado)
        }
        return res.status(409).json({
            erro: "Erro ao listar vagas."
        })
    }catch(erro){
        console.log(erro)
        res.status(500).json({
            mensagem: "Erro interno na hora de listar as vagas.",
            erro: erro.message
        })
    }
};

exports.listasVagasLivres = async(req, res) => {
    try{
        const resultado = await model.listasVagasDisponveis();
        if(resultado !== null){
            return res.json(resultado);
        }
        res.status(409).json({
            message: "Nenhuma vaga disponível."
        })
    }catch(erro){
        console.log(erro)
        res.status(500).json({
            erro: "Erro interno ao buscar vagas disponíveis."
        })
    }
};

exports.mudarOcupacaoVaga = async (req, res) =>{
    try{
        const vaga = req.body;
        vaga.id = parseInt(req.params.id)
        const resultado = await model.mudarDisponibilidadeDaVaga(vaga)
        if(resultado){
            return res.status(200).json({
                mensagem: "Disponibilidade alterada com sucesso."
        })     
        }
        return res.status(409).json({
            message: "Erro ao atualizar disponibilidade da vaga."
        })
    }catch(erro){
        console.log(erro)
        return res.status(500).json({
            erro: "Erro interno ao atualizar disponibilidade da vaga."
        })
    }  
}


exports.listarQuantidade = async(req, res) =>{
    try{
        const resultado = await model.quantidadeVagas()
        if(resultado !== null){
            return res.json(resultado)
        }
        return res.status(409).json({
            erro: "Erro ao listar vagas."
        })
    }catch(erro){
        console.log(erro)
        res.status(500).json({
            mensagem: "Erro interno na hora de listar as vagas.",
            erro: erro.message
        })
    }
};

exports.buscarVagaId = async (req, res) =>{
    try{
        const id = parseInt(req.params.id)
        const resultado = await model.vagaPorId(id)
        if(resultado !== null){
            return res.status(200).json(resultado)     
        }
        return res.status(409).json({
            message: "Erro ao buscarvaga."
        })
    }catch(erro){
        console.log(erro)
        return res.status(500).json({
            erro: "Erro interno ao buscar vaga."
        })
    }  
}

exports.buscarRegistroOcupacao = async (req, res) =>{
    try{
        const id = parseInt(req.params.id)
        const resultado = await model.registroOcupacao(id)
        if(resultado !== null){
            return res.status(200).json(resultado)     
        }
        return res.status(409).json({
            message: "Erro ao buscar registro da vaga."
        })
    }catch(erro){
        console.log(erro)
        return res.status(500).json({
            erro: "Erro interno ao buscar registro da vaga."
        })
    }  
}