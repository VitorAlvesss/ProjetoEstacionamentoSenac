// =========================================================
// CONTROLE DE INTERFACE (VIEW LOGIC) - SIDEBAR
// Login, perfil e notificações ficam no sessao.js
// =========================================================
if (localStorage.getItem('sidebar-collapsed') === 'true') {
    document.documentElement.classList.add('sidebar-is-collapsed');
}
