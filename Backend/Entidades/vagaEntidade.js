class Vaga {
    #codigoVaga;
    #vagaEspecial;
    #ocupada;
    constructor(codigoVaga, vagaEspecial, ocupada ){
        this.#codigoVaga = codigoVaga;
        this.#vagaEspecial = vagaEspecial;
        this.#ocupada = ocupada;
    }

    getCodigoVaga(){
        return this.#codigoVaga;
    }

    getVagaEspecial(){
        return this.#vagaEspecial;
    }

    getOcupada(){
        return this.#ocupada;
    }

    setCodigoVaga(codigo){
        this.#codigoVaga = codigo;
    }

    setvagaEspecial(valor){
        this.#vagaEspecial = valor;
    }

    setOcupado(boolean){
        this.#ocupada = boolean;
    }

}

const vaga = new Vaga("A01", "não", false);

console.log(vaga.getCodigoVaga(), vaga.getVagaEspecial(), vaga.getOcupada());

vaga.setCodigoVaga("A02");
vaga.setvagaEspecial("Idosos");
vaga.setOcupado(true);
console.log(vaga.getCodigoVaga(), vaga.getVagaEspecial(), vaga.getOcupada());

