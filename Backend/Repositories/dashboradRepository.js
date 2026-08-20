const db = require('../Connection/db');
const firebase = require('../Connection/fireDb');
const {collection, getDocs} = require("firebase/firestore")

async function buscarDispositivoIOT(){
    const referencia = collection(firebase, "estacionamento");
    const resultado = await getDocs(referencia);

    const dispositivos = [];

    resultado.docs.forEach((docs) => {
        dispositivos.push({
            id: docs.id,
            ...docs.data()
        });
    });
    return dispositivos;
}

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

async function registro_vagasOcupadas() {

    const [resultado] = await db.query(`
        SELECT
            v.id AS id_vaga,
            v.codigo_vaga,
            v.vaga_especial,
            v.ocupada,
            c.placa,
            r.data_entrada
        FROM tbl_vaga v

        LEFT JOIN tbl_registro_ocupacao r
            ON r.id_vaga = v.id
            AND r.data_saida IS NULL

        LEFT JOIN tbl_carro c
            ON c.id = r.id_carro

        ORDER BY v.codigo_vaga
    `);

    return resultado;
}

async function registro_ocupacao(){
    const [resultado] = await db.query(`
        SELECT 
            r.id,
            r.id_vaga,
            c.placa,

            r.data_entrada,
            r.data_saida,
            r.tempo_uso,
            r.tempo_pago,
            r.pago
        FROM tbl_registro_ocupacao r 
        INNER JOIN tbl_carro c 
            ON r.id_carro = c.id
        ORDER BY r.data_entrada DESC
        LIMIT 10
        `);
    return resultado;
}

async function entradasHoje(){
    const [resultado] = await db.query(`
        SELECT COUNT(*) AS total
        FROM tbl_registro_ocupacao
        WHERE DATE(data_entrada) = CURDATE()
        `);

        return resultado.total;
}

async function saidasHoje(){
    const [resultado] = await db.query(`
        SELECT COUNT(*) AS total
        FROM tbl_registro_ocupacao
        WHERE DATE(data_saida) = CURDATE()        
        `);
        return resultado.total;
}

async function permanecem() {
    const [resultado] = await db.query(`
        SELECT COUNT(*) AS total
        FROM tbl_registro_ocupacao
        WHERE data_saida IS NULL        
        `);
        return resultado.total;
}

async function financeiroHoje() {
    const [resultado] = await db.query(`
        SELECT
            COALESCE(SUM(total_pago), 0) AS faturamento,
            COUNT(*) AS veiculos,
            COALESCE(AVG(total_pago), 0) AS ticket_medio
        FROM tbl_registro_ocupacao
        WHERE DATE(data_saida) = CURDATE()
          AND data_saida IS NOT NULL
    `);

    return resultado[0];
}

module.exports = {
    buscarDashboard, 
    registro_ocupacao,
    entradasHoje,
    saidasHoje,
    permanecem,
    buscarDispositivoIOT,
    registro_vagasOcupadas,
    financeiroHoje
};