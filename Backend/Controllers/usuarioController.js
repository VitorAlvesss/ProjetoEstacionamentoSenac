//usuarioController.js
const usuarioRepository = require('../Repositories/usuarioRepository');

const usuarioController = {
    // GET /api/usuarios/perfil -> dados do usuário logado + carros dele
    getPerfil: async (req, res) => {
        try {
            const perfil = await usuarioRepository.buscarPerfil(req.usuario.id);
            if (!perfil) {
                return res.status(404).json({ success: false, erro: "Usuário não encontrado." });
            }

            return res.json({
                success: true,
                data: {
                    id: perfil.id,
                    nome: perfil.nome_usuario,
                    email: perfil.email,
                    telefone: perfil.numero_usuario,
                    cargo: perfil.cargo,
                    dataCadastro: perfil.data_cadastro,
                    carros: perfil.carros.map((carro) => ({
                        id: carro.id,
                        placa: carro.placa,
                        marca: carro.marca,
                        modelo: carro.modelo,
                        cor: carro.cor,
                        tipo: carro.tipo_veiculo,
                        ano: carro.ano,
                        estacionado: carro.vaga_atual
                            ? { vaga: carro.vaga_atual, desde: carro.estacionado_desde }
                            : null
                    }))
                }
            });
        } catch (error) {
            console.error("Erro no UsuarioController (getPerfil):", error);
            return res.status(500).json({ success: false, erro: "Erro ao carregar o perfil." });
        }
    },

    // PUT /api/usuarios/perfil  { nome, email, telefone }
    atualizarPerfil: async (req, res) => {
        const nome = String(req.body?.nome || '').trim();
        const email = String(req.body?.email || '').trim().toLowerCase();
        const telefone = String(req.body?.telefone || '').replace(/\D/g, '');

        if (nome.length < 2 || nome.length > 120) {
            return res.status(400).json({ success: false, erro: "Informe um nome válido." });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
            return res.status(400).json({ success: false, erro: "Informe um e-mail válido." });
        }
        if (telefone && (telefone.length < 10 || telefone.length > 11)) {
            return res.status(400).json({ success: false, erro: "Telefone deve ter DDD + número (10 ou 11 dígitos)." });
        }

        try {
            await usuarioRepository.atualizarPerfil(req.usuario.id, { nome, email, telefone });
            return res.json({
                success: true,
                mensagem: "Perfil atualizado com sucesso!",
                usuario: { id: req.usuario.id, nome, email, telefone, cargo: req.usuario.cargo }
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, erro: "Este e-mail ou telefone já está em uso por outra conta." });
            }
            console.error("Erro no UsuarioController (atualizarPerfil):", error);
            return res.status(500).json({ success: false, erro: "Erro ao atualizar o perfil." });
        }
    }
};

module.exports = usuarioController;
