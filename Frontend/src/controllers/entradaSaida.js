const NUM_ESTACIONADOS = document.getElementById('num-estacionados');
const NUM_SAIDAS = document.getElementById('num-saidas');
const NUM_TOTAL_ENTRADAS = document.getElementById('num-total-entradas');

const modal = document.getElementById('modalEntrada');
const btnAbrirModal = document.getElementById('btnNovaEntrada');
const btnFecharModal = document.getElementById('btnFecharModal');
const btnCancelar = document.getElementById('btnCancelar');

//const BTN_SAIDA = document.querySelectorAll('.btn-saida-acao'); //arrumar onde isso deve ficar
const TABELA = document.querySelector('#listaMovimentacao');
const FORM_REGISTRO = document.querySelector('#formNovaEntrada');

// Abrir/fechar modal
const fecharModal = () => {
  modal.classList.remove('visivel');
  FORM_REGISTRO.reset();
};

btnAbrirModal.addEventListener('click', () => modal.classList.add('visivel'));
btnFecharModal.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);

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
				<td>${d.data_entrada}</td>
				<td>${d.data_saida === null ? `---` : d.data_saida}</td>
				<td>---</td>
				<td>${d.total_pago}</td>
				<td>
					${d.data_saida === null ? `<button class="btn-saida-acao" onclick="darSaida(${d.id})"><i class="fa-solid fa-right-from-bracket"></i> Dar Saída</button>` : `<i class="fa-solid fa-check-double" style="color:#00e676;"></i> Concluído`}
				</td>
			</tr>
			`).join('');
			} else {
				TABELA.innerHTML = 'ERRO AO CARREGAR TABELA';
				}
		
		} catch (err) {
			alert('Algo deu muito errado!');
			}
	}

async function darSaida(id) {
	try {

		const RES = await fetch(SERVIDOR_URL, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({id})
		});
		//const RESULTADO = await RES.json();

		if (RES.status == 200) {
			alert('Saída registrada com sucesso!');
			await carregarTabela();
		} else {
			alert('ERRO!');
		}

	} catch (err) {
		alert('Algo deu errado!');
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
} // programa isso e testa

FORM_REGISTRO.addEventListener('submit', async function(e) {
		e.preventDefault();
		const placa = document.getElementById('placa').value;
		const id_vaga = document.getElementById('id_vaga').value;
		
		try {
			const RES = await fetch(SERVIDOR_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
					},
				body: JSON.stringify({placa, id_vaga})
				});
				
			//const RESULTADO = await RES.json();
			
			if (RES.status == 200) {
				alert('Registro realizado com sucesso!');
				fecharModal();
				await carregarTabela();
				await listarQuantos();
				} else {
					alert('Ocorreu algum problema com o registro!');
					}
			} catch(err) {
				alert('Algo deu errado!');
				}
		FORM_REGISTRO.reset();
		});

// aqui, a coisa já fica diferente
window.onload = async (e) => { // aqui salva os dados no banco de dados já
	await carregarTabela();
	console.log("carregou, pelo menos");
	}





