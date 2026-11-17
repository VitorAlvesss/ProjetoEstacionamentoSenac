const NUM_ESTACIONADOS = document.getElementById('num-estacionados');
const NUM_SAIDAS = document.getElementById('num-saidas');
const NUM_TOTAL_ENTRADAS = document.getElementById('num-total-entradas');

const TABELA = document.querySelector('#listaMovimentacao');

function limparTabela() {
	TABELA.innerHTML = '';
}

async function carregarTabela() {
	try {
		const RES = await fetch(SERVIDOR_URL, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
				}
			});
		const RESULTADO = await RES.json();
		
		if (RES.status == 200) {
			limparTabela();
			TABELA.innerHTML = RESULTADO.map(d => `
			<tr data-id="${d.id}" data-id-vaga="${d.vaga_id}">
				<td>${d.placa}</td>
				<td>${d.vaga_codigo}</td>
				<td>${new Date(d.data_entrada).toLocaleString('pt-BR')}</td>
				<td>${d.data_saida === null ? '---' : new Date(d.data_saida).toLocaleString('pt-BR')}</td>
				<td>${d.status_pagamento}</td>
				<td>${d.total_pago === null ? '---' : `R$ ${Number(d.total_pago).toFixed(2)}`}</td>
			</tr>
			`).join('');
			} else {
				TABELA.innerHTML = 'ERRO AO CARREGAR TABELA';
				}
		
		} catch (err) {
			alert('Algo deu muito errado!');
                        console.log(err);
			}
	}

async function listarQuantos() {
	try {
		const RES = await fetch(`${SERVIDOR_URL}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const RESULTADO = RES.json();

		NUM_ESTACIONADOS.innerText = RESULTADO.estacionados;
		NUM_TOTAL_ENTRADAS.innerText = RESULTADO.estacionados_hoje;
		NUM_SAIDAS.innerText = RESULTADO.saidas_hoje;

	} catch {
		alert('Houve um problema no servidor!');
	}
}


window.onload = async (e) => {
	await carregarTabela();
	console.log("carregou, pelo menos");
	}
