const NUM_ESTACIONADOS = document.getElementById('num-estacionados');
const NUM_SAIDAS = document.getElementById('num-saidas');
const NUM_TOTAL_ENTRADAS = document.getElementById('num-total-entradas');

const modal = document.getElementById('modalEntrada');
const btnAbrirModal = document.getElementById('btnNovaEntrada');
const btnFecharModal = document.getElementById('btnFecharModal');
const btnCancelar = document.getElementById('btnCancelar');

const BTN_SAIDA = document.querySelectorAll('.btn-saida-acao'); //arrumar onde isso deve ficar
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


// aqui, a coisa já fica diferente
window.onload = async (e) => { // aqui salva os dados no banco de dados já
	carregarTabela();
	console.log("carregou, pelo menos");
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
				
			const RESULTADO = await RES.json();
			
			if (RESULTADO.status == 200) {
				alert('Registro realizado com sucesso!');
				carregarTabela();
				} else {
					alert('Ocorreu algum problema com o registro!');
					}
			} catch(err) {
				alert('Algo deu errado!');
				}
		FORM_REGISTRO.reset();
		});
		
	async function carregarTabela() {
		try {
			const RES = await fetch(SERVIDOR_URL, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
					}
				});
			const RESULTADO = await RES.json();
			
			if (RESULTADO.status == 200) {
				TABELA.innerHTML = RESULTADO.map(d => `
				<tr data-id="${d.id}" data-id-vaga="${d.vaga_id}">
					<td>${d.placa}</td>
					<td>${d.data_entrada}</td>
					<td>${d.data_saida}</td>
					<td>${d.total_pago}</td>
				</tr>
				`).join('');
				} else {
					TABELA.innerHTML = 'ERRO AO CARREGAR TABELA';
					}
			
			} catch (err) {
				alert('Algo deu muito errado!');
				}
		}
	}



