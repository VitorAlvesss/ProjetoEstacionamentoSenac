// O Model é responsável pelos dados.
// Estamos usando dados falsos simulando a resposta do banco de dados (Mock).

let ultimaVisualizacaoSino = new Date(0); // Começa em 1970 (tudo será tratado como "não lido" de início)

const NotificacaoModel = {
    
    buscarEventos: async () => {
        return [
            { 
                id: 101, 
                id_carro: 'ABC-1234', 
                tipo_evento: 'ENTRADA', 
                data_evento: new Date(Date.now() - 5000) // 5 segundos atrás
            },
            { 
                id: 102, 
                id_carro: 'XYZ-9876', 
                tipo_evento: 'SAIDA', 
                data_evento: new Date(Date.now() - 15000) // 15 segundos atrás
            },
            { 
                id: 103, 
                id_carro: 'QWE-1111', 
                tipo_evento: 'ENTRADA', 
                data_evento: new Date(Date.now() - 60000) // 1 minuto atrás
            }
        ];
    },

    getUltimaVisualizacao: () => {
        return ultimaVisualizacaoSino;
    },

    atualizarUltimaVisualizacao: () => {
        ultimaVisualizacaoSino = new Date();
    }
};

module.exports = NotificacaoModel;