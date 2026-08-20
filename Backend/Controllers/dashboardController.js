const dashboardRepository = require("../Repositories/dashboradRepository");



async function buscarDash(req, res){
    
    const vagas = await dashboardRepository.buscarDashboard();
    const registro = await dashboardRepository.registro_ocupacao();
    const entradasHoje = await dashboardRepository.entradasHoje();
    const saidasHoje = await dashboardRepository.saidasHoje();
    const permanecem = await dashboardRepository.permanecem();
    const dispositivos = await dashboardRepository.buscarDispositivoIOT();

    try{
        
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

