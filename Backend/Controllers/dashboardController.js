const dashboardRepository = require("../Repositories/dashboradRepository");



async function buscarDash(req, res){
    
    try{
            const [vagas, registro, entradasHoje, saidasHoje, permanecem, dispositivos] = await Promise.all([
            dashboardRepository.buscarDashboard(),
            dashboardRepository.registro_ocupacao(),
            dashboardRepository.entradasHoje(),
            dashboardRepository.saidasHoje(),
            dashboardRepository.permanecem(),
            dashboardRepository.buscarDispositivoIOT(),
        ]);
        res.status(200).json({
            vagas: {
                total: vagas.total,
                livres: vagas.livres,
                ocupadas: vagas.ocupadas, 
            },
            movimentacao: {
                entradasHoje: entradasHoje,
                saidasHoje: saidasHoje,
                permanecem: permanecem,
                movimentacoes: registro,
            },
            dispositivos: dispositivos
        });
    }catch(erro){
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao carregar dashboard"
        });
    }
}

module.exports = {
    buscarDash
};

