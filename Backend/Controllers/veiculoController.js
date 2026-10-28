// Exemplo de como ficará sua query de veículos:
const usuarioId = req.usuarioLogado.uid; // ID que veio do Firebase (que é o ID do MySQL)

// Se quiser checar o cargo, pode buscar no banco novamente ou injetar no token claims
const [veiculos] = await db.query('SELECT * FROM tbl_carro WHERE id_usuario = ?', [usuarioId]);
res.json(veiculos);