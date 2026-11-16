//notificacaoController.js

const NotificacaoModel = require('../Model/notificacaoModel');

// "?desde=" vem do localStorage do navegador. Sem ele (ou inválido), tudo conta como não lida.
function lerDesde(valor) {
    const data = new Date(valor);
    return valor && !Number.isNaN(data.getTime()) ? data : new Date(0);
}

const NotificacaoController = {
    // GET /api/notificacoes?desde=<data do último evento visto>
    // -> entradas/saídas dos carros do usuário logado (o administrador recebe as de todos)
    getNotificacoes: async (req, res) => {
        try {
            const verTodos = req.usuario.cargo === 'administrador';
            const desde = lerDesde(req.query.desde);
            const [eventos, unreadCount] = await Promise.all([
                NotificacaoModel.buscarEventos(req.usuario.id, verTodos, desde),
                NotificacaoModel.contarNaoLidas(req.usuario.id, verTodos, desde)
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
    }
};

module.exports = NotificacaoController;
