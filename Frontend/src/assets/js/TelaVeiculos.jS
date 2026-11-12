const btnTema = document.getElementById('btnTema');
const sidebar = document.getElementById('sidebar');
const botoesMenu = [
    document.getElementById('sidebarToggleBtn'),
    document.getElementById('topHeaderToggleBtn')
].filter(Boolean);

if (localStorage.getItem('tema') === 'light') {
    document.body.classList.add('light-theme');
}

btnTema?.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    localStorage.setItem(
        'tema',
        document.body.classList.contains('light-theme') ? 'light' : 'dark'
    );
});

botoesMenu.forEach((botao) => {
    botao.addEventListener('click', () => {
        sidebar?.classList.toggle('collapsed');
    });
});

document.querySelectorAll('.sidebar-nav .nav-item a').forEach((link) => {
    const caminho = window.location.pathname.toLowerCase();
    const destino = (link.getAttribute('href') || '').toLowerCase();
    if (destino && caminho.endsWith(destino)) {
        link.closest('.nav-item')?.classList.add('active');
    }
});

function atualizarDataHora() {
    const agora = new Date();
    const hora = document.getElementById('hora-atual');
    const data = document.getElementById('data-atual');
    if (hora) hora.textContent = agora.toLocaleTimeString('pt-BR');
    if (data) data.textContent = agora.toLocaleDateString('pt-BR');
}

atualizarDataHora();
setInterval(atualizarDataHora, 1000);