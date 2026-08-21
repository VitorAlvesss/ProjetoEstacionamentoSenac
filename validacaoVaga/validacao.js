exports.validacaoInsertVaga = (req, res, next) => {
    const {codigo_vaga, vaga_especial, ocupada} = req.body;

    if(codigo_vaga == null || typeof codigo_vaga !== "string" || codigo_vaga.trim() == ""){
        return res.status(400).json({
            erro: "O cõdigo da vaga não pode estar vazio."
        })
    }

    if(codigo_vaga.length > 10){
        return res.status(400).json({
            erro: "O código da vaga não pode ser maior que dez caractéres."
        })
    }

    if(vaga_especial !==undefined && vaga_especial !== null){
        const valoresDefinidos = ["deficiente", "idoso"]
        if(!valoresDefinidos.includes(vaga_especial)){
            return res.status(400).json({
                erro: "Vaga especial deve ser deficiente, idoso ou não informado."
            })
        }
    }

    if(typeof ocupada !=="boolean"){
        return res.status(400).json({
            erro: "É apenas aceitos os valores true e false."
        })
    }

    next();
}