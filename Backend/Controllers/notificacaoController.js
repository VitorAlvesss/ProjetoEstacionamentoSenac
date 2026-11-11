//notificacaoController.js

const NotificacaoModel = require('../Model/notificacaoModel');

const NotificacaoController = {
    // GET /api/notificacoes -> entradas/saídas dos carros do usuário logado
    // (o administrador recebe as de todos os carros)
    getNotificacoes: async (req, res) => {
        try {
            const verTodos = req.usuario.cargo === 'administrador';
            const [eventos, unreadCount] = await Promise.all([
                NotificacaoModel.buscarEventos(req.usuario.id, verTodos),
                NotificacaoModel.contarNaoLidas(req.usuario.id, verTodos)
            ]);

            const notificacoesFormatadas = eventos.map(evento => ({
                id_notificacao: `${evento.tipo_evento}-${evento.id}`,
                id_registro: evento.id,
                tipo: evento.tipo_evento,
                placa: evento.placa,
                mensagem: evento.tipo_evento === 'ENTRADA'
                    ? `${evento.modelo} (${evento.placa}) ENTROU no estacionamento - vaga ${evento.codigo_vaga}.`
                    : `${evento.modelo} (${evento.placa}) SAIU do estacionamento - vaga ${evento.codigo_vaga}.`,
                data_evento: evento.data_evento,
                naoLida: Boolean(evento.nao_lida)
            }));

            res.json({
                success: true,
                unreadCount: unreadCount,
                data: notificacoesFormatadas
            });

        } catch (error) {
            console.error("Erro no NotificacaoController (getNotificacoes):", error);
            res.status(500).json({ success: false, message: "Erro ao buscar notificações." });
        }
    },

    // POST /api/notificacoes/marcar-lidas -> zera a bolinha vermelha deste usuário
    marcarComoLidas: async (req, res) => {
        try {
            await NotificacaoModel.marcarComoLidas(req.usuario.id);

            res.json({
                success: true,
                message: "Notificações marcadas como lidas. A bolinha vermelha foi zerada."
            });
        } catch (error) {
            console.error("Erro no NotificacaoController (marcarComoLidas):", error);
            res.status(500).json({ success: false, message: "Erro ao atualizar visualização." });
        }
    }
};

module.exports = NotificacaoController;
