const repositories = require("../Repositories/usuarioRepository");

async function listarInfUsuCar(req, res) {
    try{
            const informacoes = await repositories.buscarInfUsuarioCarro();
            
            const lista = informacoes.map(item => ({
                placa: item.placa,
                nome: item['nome/usuario'],
                cargo: item.cargo,
                email: item.email
            }));

            res.status(200).json({
                informações: lista,
            });
    }catch(erro){
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao carregar informações"
        });
    }
};

async function updateUser(req, res){
    try{
        const {id} = req.params;
        const { nome_usuario, email, cargo, ativo} = req.body;
        const info = await repositories.updateUsuario(id, nome_usuario, email, cargo, ativo);

        res.status(200).json({
            informações:{
                Mensagem: "Usuário atualizado com sucesso!",
                affectedRows: info.affectedRows
            }
        });
    }catch(erro){
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao carregar informações de usuário."
        });
    }
};

async function deleteUser(req, res){
    try{
        const { id } = req.params;
        const info = await repositories.deleteUser(id);

        if (info.affectedRows === 0){
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }
        res.status(200).json({
            mensagem: "Usuário excluído com sucesso!",
            id
        });
    }catch(erro){
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao excluir usuário."
        });
    }
}

module.exports = {
    listarInfUsuCar,
    updateUser,
    deleteUser
};