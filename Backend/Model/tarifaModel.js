class TarifaModel {
    constructor({
        id = null,
        valor_primeira_hora,
        valor_hora_adicional,
        tolerancia_minutos = 0,
        ativo = true,
    } = {}) {
        this.id = id;
        this.valor_primeira_hora = TarifaModel.validarValor(valor_primeira_hora, 'valor_primeira_hora');
        this.valor_hora_adicional = TarifaModel.validarValor(valor_hora_adicional, 'valor_hora_adicional');
        this.tolerancia_minutos = TarifaModel.validarTolerancia(tolerancia_minutos);
        this.ativo = Boolean(Number(ativo)); 
    }

    static validarValor(valor, campo) {
        const numero = Number(valor); 
        if (valor == null || valor === '' || !Number.isFinite(numero) || numero < 0) {
            throw new Error(`${campo} deve ser um número maior ou igual a 0`);
        }
        return Math.round(numero * 100) / 100;
    }

    static validarTolerancia(minutos) {
        const numero = Number(minutos);
        if (!Number.isInteger(numero) || numero < 0) {
            throw new Error('tolerancia_minutos deve ser um inteiro maior ou igual a 0');
        }
        return numero;
    }
}

module.exports = TarifaModel;