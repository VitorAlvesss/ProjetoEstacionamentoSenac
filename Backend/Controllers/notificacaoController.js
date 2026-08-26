const NotificacaoModel = require('../Model/notificacaoModel');

const NotificacaoController = {
    // Processa a requisição de buscar notificações
    getNotificacoes: async (req, res) => {
        try {
            const eventosBrutos = await NotificacaoModel.buscarEventos();
            const ultimaVezVisto = NotificacaoModel.getUltimaVisualizacao();
            
            let unreadCount = 0;

            const notificacoesFormatadas = eventosBrutos.map(evento => {
                const dataDoEvento = new Date(evento.data_evento);
                const isNova = dataDoEvento > ultimaVezVisto;
                
                // Se a notificação for mais nova que a última visualização, aumenta a bolinha vermelha
                if (isNova) unreadCount++;

                return {
                    id_notificacao: `${evento.tipo_evento}-${evento.id}`,
                    id_registro: evento.id,
                    tipo: evento.tipo_evento,
                    mensagem: evento.tipo_evento === 'ENTRADA' 
                        ? `Veículo (ID: ${evento.id_carro}) ENTROU no estacionamento.`
                        : `Veículo (ID: ${evento.id_carro}) SAIU do estacionamento.`,
                    data_evento: evento.data_evento,
                    naoLida: isNova
                };
            });

            res.json({
                success: true,
                unreadCount: unreadCount,
                data: notificacoesFormatadas
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Erro ao buscar notificações." });
        }
    },

    // Processa a requisição de zerar a bolinha
    marcarComoLidas: (req, res) => {
        try {
            NotificacaoModel.atualizarUltimaVisualizacao();
            
            res.json({
                success: true,
                message: "Notificações marcadas como lidas. A bolinha vermelha foi zerada."
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Erro ao atualizar visualização." });
        }
    }
};

module.exports = NotificacaoController;