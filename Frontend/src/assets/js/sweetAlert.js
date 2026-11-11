import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';

export function alerta(tipo, titulo, mensagem) {
    return Swal.fire({
        icon: tipo,
        title: titulo,
        text: mensagem,
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#3085d6',
        background: '#1e1e2f',
        color: '#ffffff'
    });
}

