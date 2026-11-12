const codigoVaga = document.getElementById("codigoVaga");
const tipoVaga = document.getElementById("tipoVaga");
const valorSelecionado = tipoVaga.value;
const btnSalvarVaga = document.getElementById("btnSalvarVaga")

btnSalvarVaga.addEventListener('click', () =>{
    const tipo = tipoVaga.value === "null" ? null : tipoVaga.value;
    fetch("http://localhost:3000/vagas", {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            "codigo_vaga": codigoVaga.value.trim(),
            "vaga_especial": tipo,
            "ocupada": false
        }),
    });
    codigoVaga.value = "";
    tipoVaga.value = "null";
});