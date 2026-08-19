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