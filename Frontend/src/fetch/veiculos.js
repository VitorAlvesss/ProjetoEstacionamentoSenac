import { alerta } from '../assets/js/sweetAlert.js';
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';

const API_URL = 'http://localhost:3000';
const FORM_REGISTRO = document.getElementById('registerForm');
const INPUT_NOME = document.getElementById('formName');
const INPUT_PLACA = document.getElementById('formPlate');
const INPUT_CONTATO = document.getElementById('formPhone');
const INPUT_EMAIL = document.getElementById('formEmail');

const TABELA = document.getElementById('tableBody');

/*FORM_REGISTRO.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = INPUT_NOME.value.trim();
    const placa = INPUT_PLACA.value.trim().toUpperCase();
    const contato = INPUT_CONTATO.value.trim();
    const email = INPUT_EMAIL.value.trim();

    try {
        const res = await fetch(`${API_URL}/veiculo/salvar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, placa, contato, email })
        });

        if (res.ok) {
            FORM_REGISTRO.reset();
            await carregarVeiculos();

            alerta(
                'success',
                'Cadastro realizado!',
                'O veículo foi cadastrado com sucesso.'
            );

        } else {
            const dados = await res.json();

            alerta(
                'error',
                'Erro no cadastro',
                dados.erro || 'Não foi possível cadastrar o veículo.'
            );
        }

    } catch (erro) {
        alerta(
            'error',
            'Erro de conexão',
            'Não foi possível conectar ao servidor.'
        );
    }
});
*/


function desenharTabela(veiculos) {
    TABELA.innerHTML = '';

    veiculos.forEach(v => {
        const linha = document.createElement('tr');

        [v.placa, v.nome, v.contato, v.email].forEach(valor => {
            const coluna = document.createElement('td');
            coluna.textContent = valor ?? '';
            linha.appendChild(coluna);
        });

        TABELA.appendChild(linha);
    });
}

async function carregarVeiculos(){
  try{
  const res = await fetch(`${API_URL}/veiculo`);
  if(!res.ok){
    throw new Error('Erro ao buscar veículos')
    };
    const veiculos = await res.json();
    desenharTabela(veiculos);
  }catch(erro){
    alerta('error', 'Erro', 'Erro ao carregar veículos', erro.message)
  };
}

//Função para o botão de editar veiculo
/*async function editarVeiculo(){
  const res = await fetch(`${API_URL}/veiculo/update`, {
    method: 'PUT'
  });
  if (res.ok){
    alerta('sucess', 'Atualizado com sucesso', 'Veiculo atualizado com sucesso!')
  }else{
    alerta('error', 'Erro', 'Não foi possivel atualizar veiculo.')
  }
}
*/
//Função de deletar veiculo
async function deletarVeiculo(id) {

    const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Esse veículo será excluído permanentemente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    });

    if (!confirmacao.isConfirmed) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/veiculo/delete?id=${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            await Swal.fire({
                icon: 'success',
                title: 'Excluído!',
                text: 'Veículo removido com sucesso.'
            });

            await carregarVeiculos();

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro ao excluir',
                text: 'Não foi possível excluir o veículo.'
            });
        }

    } catch (erro) {
        Swal.fire({
            icon: 'error',
            title: 'Erro de conexão',
            text: erro.message
        });
    }
}

carregarVeiculos();
