const corpoTabela = document.getElementById("corpoTabela");
const valorPlaca = document.getElementById("valorPlaca");
const tipoVaga = document.getElementById("tipoVaga");
const dataEntrada = document.getElementById("dataEntrada");
const horaEntrada = document.getElementById("horaEntrada");
const valorHora = document.getElementById("valorHora");

const vagaPega = document.getElementById("vagaPega");

const ocupadaOuNao = document.getElementById("ocupadaOuNao");
const bolinhaInformacoes = document.getElementById("bolinhaInformacoes");

document.addEventListener("DOMContentLoaded", () =>{
    fetch("http://localhost:3000/vagas")
    .then(
        response => response.json()
    )
    .then(dados => {
        console.log(dados);
        dados.forEach((e, i) => {
            if(i % 4 === 0){
                tr = document.createElement("tr");
                corpoTabela.appendChild(tr);
            }      

            var td = document.createElement("td");
            td.dataset.id = e.id;
            tr.appendChild(td);

            var divBolinha = document.createElement("div");
            divBolinha.classList.add(e.ocupada == 0 ? "bolinhaVerde" : "bolinhaVermelha");
            td.appendChild(divBolinha);

            var p = document.createElement("p");
            p.textContent = e.codigo_vaga;
            td.appendChild(p);

            divBolinha.addEventListener("click", () =>{
                if(e.ocupada == 1){
                    mostrarInformacoesVaga(e.id)
                }
                else{
                    bolinhaInformacoes.classList.remove("bolinhaVermelha")
                    bolinhaInformacoes.classList.add("bolinhaVerde")
                    valorPlaca.textContent = "Vazio" 
                    tipoVaga.textContent = 'SEM RESTRIÇÃO'
                    
                    valorHora.textContent = "0.00"
                    vagaPega.textContent = e.codigo_vaga
                    dataEntrada.textContent = "00/00/0000"
                    horaEntrada.textContent = "00:00:00"
                    ocupadaOuNao.textContent = "LIVRE"
                }
            });
        });      
    })
});

function mostrarInformacoesVaga(id) {
    fetch(`http://localhost:3000/vagas/registro/${id}`)
    .then(
        response => response.json()
    )
    .then(dados =>{
        bolinhaInformacoes.classList.remove("bolinhaVerde")
        bolinhaInformacoes.classList.add("bolinhaVermelha")
        console.log("DADOS"+ dados)
        valorPlaca.textContent = dados[0].placa
        if(dados[0].vaga_especial === null || dados[0].vaga_especial === ""){
            tipoVaga.textContent = 'SEM RESTRIÇÃO'
        }
        else{
            tipoVaga.textContent = dados[0].vaga_especial.toUpperCase()
        }
        
        console.log(dados[0].vaga_especial)
        const data = new Date(dados[0].data_entrada)
        dataEntrada.textContent = data.toLocaleDateString('pt-br');
        horaEntrada.textContent = data.toLocaleTimeString('pt-br')
        valorHora.textContent = dados[0].valor_hora
        vagaPega.textContent = dados[0].codigo_vaga
        ocupadaOuNao.textContent = "OCUPADA"
    })
}