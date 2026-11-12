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
        totalVagas.innerText = dados.total;
        vagasLivres.innerText = dados.livres;
        vagasOcupadas.innerText = dados.ocupadas;
        var total = parseInt(dados.total);
        var livres = parseInt(dados.livres);
        var calculo = parseFloat(Math.round((100) -100 * livres / total).toFixed(2))
        taxaOcupacao.innerText = calculo + "%";  
        taxaOcupacaoComplementar.innerText = dados.ocupadas + " de " + total + " vagas"
    })
});