const totalVagas = document.getElementById("totalVaga");
const vagasLivres = document.getElementById("vagasLivres");
const vagasOcupadas = document.getElementById("vagasOcupadas");
const taxaOcupacao = document.getElementById("taxaOcupacao");
const taxaOcupacaoComplementar = document.getElementById("taxaOcupacaoComplementar");


document.addEventListener("DOMContentLoaded", () =>{
    fetch("http://localhost:3000/vagas/total")
    .then(
        response => response.json()
    )
    .then(dados => {
        totalVagas.innerText = dados[0].total;
        vagasLivres.innerText = dados[0].livres;
        vagasOcupadas.innerText = dados[0].ocupadas;
        var total = parseInt(dados[0].total);
        var livres = parseInt(dados[0].livres);
        var calculo = parseFloat(Math.round((100) -100 * livres / total).toFixed(2))
        taxaOcupacao.innerText = calculo + "%";  
        taxaOcupacaoComplementar.innerText = dados[0].ocupadas + " de " + total + " vagas"
    })
});