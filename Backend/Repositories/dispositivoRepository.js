const firebase = require('../Connection/fireDb');

async function buscarDispositivoIOT(){
    const referencia = firebase.collection("estacionamento");
    const resultado = await referencia.get();

    const dispositivos = [];

    resultado.docs.forEach((doc) => {
        dispositivos.push({
            id: doc.id,
            ...doc.data()
        });
    });
    return dispositivos;
}

module.exports = { buscarDispositivoIOT };