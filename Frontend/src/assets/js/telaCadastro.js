document.addEventListener("DOMContentLoaded", () => {
    const formCadastro = document.getElementById("form-cadastro");

    formCadastro.addEventListener("submit", async (event) => {
        event.preventDefault();

        const usuario = {
            nome_usuario: document.getElementById("nome").value,
            email: document.getElementById("email").value,
            numero_usuario: document.getElementById("celular").value,
            senha: document.getElementById("senha-cadastro").value
        };

        try {
            const resposta = await fetch("http://localhost:3000/usuarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(usuario)
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error("Erro ao criar usuário");
            }

            
            console.log("Usuário criado com sucesso:", dados);
            window.location.href = 'login.html';
        }
        catch (error) {
            console.error("Erro ao criar usuário:", error);
            alert("Erro ao criar usuário. Por favor, tente novamente.");
        }
    
    });

});
