const COLUMNS = Object.create(null);
COLUMNS.data_entrada = "data_entrada";
COLUMNS.data_saida = "data_saida";
COLUMNS.pago = "pago";
COLUMNS.valor_hora = "valor_hora";
COLUMNS.valor_pago = "valor_pago";
COLUMNS.tempo_uso = "tempo_uso";
COLUMNS.id_carro = "id_carro";
COLUMNS.id_vaga = "id_vaga";

const db = require('../Connection/db');

/*
create table tbl_registro_ocupacao (
	id int primary key auto_increment,
	valor_hora decimal(4,2) not null,
	valor_pago decimal(6,2),
	pago boolean not null default false,
	data_entrada datetime not null,
	data_saida datetime,
	tempo_uso time	
);*/

// aqui só tem funções de caráter read

async function encontrarCarroId(placa) {
	const [linhas] = await db.query('select id from tbl_carro where placa ?', [placa]);
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
    `
    
    const [linhas] = await db.query('select * from tbl_registro_ocupacao');
    return linhas;
}

// agora, é a vez do create



async function salvarRegistro(id_carro, id_vaga, valor_hora, data_entrada) { // vou precisar consultar um pouco das regras de negócio da tela que esta função irá interagir com
    const [resultado] = await db.execute('insert into tbl_registro_ocupacao (id_carro, id_vaga, valor_hora, data_entrada) values (?, ?);', [id_carro, id_vaga, valor_hora, data_entrada]);
    //console.log('feio');
    return resultado;
}

// update
// essa função é muito apelona kkkk ela vai servir para tudo o que é update, ou seja, até para "dar saída" ela serve, porque é preciso apenas de um update
async function atualizarRegistro(id, colunas, valores) { // provavelmente, está funcionando 
    let sql = 'update tbl_registro_ocupacao set ';
    let temp = 'VITOR E AS 1200 LINHAS NO CSS EM 30 MINUTOS';

    for (let i = 0; i < colunas.length; i++) { //agora, é torcer que isso realmente pare um SQL Injection na prática...
        if (!Object.hasOwn(COLUMNS, colunas[i])) {
            return "SQL INJECTION AQUI NÃO!";
        }
    }
    
    if (colunas.length == 1) {
        temp = sql;
        sql = temp + `${colunas[0]} = ? where id = ?`;
    } else {
        for (let i = 0; i < colunas.length; i++) {
            if (i == colunas.length - 1) {
                temp = sql + `${colunas[i]} = ? where id = ?`;
                sql = temp;
            } else {
                temp = sql + `${colunas[i]} = ?, `;
                sql = temp;
            }
            
        }
    }

    const params = [...valores, id];

    const [resultado] = await db.execute(sql, params);
    return resultado;
}

// delete (que medo...)

async function deletarRegistro(id) { // não sei se isso vai ser usado, sinceramente, mas está funcional
    const [resultado] = await db.execute('delete from tbl_registro_ocupacao where id = ?', [id]);
    return resultado;
}

module.exports = {listarRegistros, salvarRegistro, atualizarRegistro, deletarRegistro, listarQuantos, encontrarCarroId};
