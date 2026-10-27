
const db = require('../Connection/db');

// aqui só tem funções de caráter read

async function encontrarCarroId(placa) {
	const [linhas] = await db.query('select id from tbl_carro where placa = ?', [placa]);
	return linhas;
	}

async function listarQuantos() {

    const SQL =  `
    select
        sum(case when data_saida is null then 1 else 0 end) as estacionados,
        sum(case when date(data_saida) = curdate() then 1 else 0 end) as saidas_hoje,
        sum(case when date(data_entrada) = curdate() then 1 else 0 end) as estacionados_hoje
    from tbl_registro_ocupacao;
    `

    const [linhas] = await db.query(SQL);
	return linhas;
	}

async function listarRegistros() {  // totalmente funcional... provavelmente, vai precisar de um inner join, caso o banco de dados passar a armazenar as placas dos veiculos
    //console.log('opa')
    
    const SQL = `
    select 
		vaga.id as vaga_id,
		r.id,
		carro.placa,
		r.data_entrada,
		r.data_saida,
		r.total_pago
    from tbl_registro_ocupacao as r
    inner join tbl_carro carro on r.id_carro = carro.id
    inner join tbl_vaga vaga on r.id_vaga = vaga_id
    where carro.placa = ? and vaga.id = ?
    order by r.data_entrada desc;
    `
    
    const [linhas] = await db.query('select * from tbl_registro_ocupacao');
    return linhas;
}

async function listarRegistrosOcupados() {
	const SQL = 'select * from tbl_registro_ocupacao where data_saida is null';
	const [LINHAS] = await db.query(SQL);
	return LINHAS;
}

// agora, é a vez do create

async function salvarRegistro(id_carro, id_vaga, valor_hora, data_entrada) { // vou precisar consultar um pouco das regras de negócio da tela que esta função irá interagir com
    const [resultado] = await db.execute('insert into tbl_registro_ocupacao (id_carro, id_vaga, valor_hora, data_entrada) values (?, ?, ?, ?);', [id_carro, id_vaga, valor_hora, data_entrada]);
    //console.log('feio');
    return resultado;
}


module.exports = {listarRegistros, listarRegistrosOcupados, salvarRegistro, listarQuantos, encontrarCarroId};
