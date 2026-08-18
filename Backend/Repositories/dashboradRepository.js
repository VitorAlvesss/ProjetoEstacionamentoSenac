const db = require('../Connection/db');

async function buscarDashboard(){
    const [resultado] = await db.query(`
        SELECT
            COUNT(*) AS total,
            SUM(ocupada = FALSE) AS livres,
            SUM(ocupada = TRUE) AS ocupadas
        FROM tbl_vaga
        `);
    return resultado[0];

}

async function registro_ocupacao(){
    const [resultado] = await db.query(`
        SELECT 
            r.id,
            r.id_vaga,
            c.placa,

            r.data_entrada,
            r.data_saida,
            r.tempo_uso
        FROM tbl_registro_ocupacao r 
        INNER JOIN tbl_carro c 
            ON r.id_carro = c.id
        `);
    return resultado;
}

async function entradasHoje(){
    const [resultado] = await db.query(`
        SELECT COUNT(*) AS total
        FROM tbl_registro_ocupacao
        WHERE DATE(data_entrada) = CURDATE()
        `);

        return resultado[0].total;
}

async function saidasHoje(){
    const [resultado] = await db.query(`
        SELECT COUNT(*) AS total
        FROM tbl_registro_ocupacao
        WHERE DATE(data_saida) = CURDATE()        
        `);
        return resultado[0].total;
}

async function permanecem() {
    const [resultado] = await db.query(`
        SELECT COUNT(*) AS total
        FROM tbl_registro_ocupacao
        WHERE data_saida IS NULL        
        `);
        return resultado[0].total;
}

module.exports = {
    buscarDashboard, 
    registro_ocupacao,
    entradasHoje,
    saidasHoje,
    permanecem};