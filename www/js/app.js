window.onload = () => {
    new JogoVelha();
};

class JogoVelha {
    constructor() {
        this.iniciaElementos();
        this.iniciaEstado();
    }

    iniciaEstado() {
        this.turno = true;
        this.jogadas = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.fim = false;
        this.vitoria = [448, 56, 7, 292, 146, 73, 273, 84];
    }

    iniciaElementos() {
        this.jogadorX = document.querySelector("#jogador-x");
        this.jogadorO = document.querySelector("#jogador-o");

        this.salvarLocal = document.querySelector("#salva-local");
        this.salvarLocal.addEventListener("click", this.salvaLocal.bind(this));

        this.carregarLocal = document.querySelector("#carrega-local");
        this.carregarLocal.addEventListener("click", this.carregaLocal.bind(this));

        this.salvar = document.querySelector("#salvar");
        this.salvar.addEventListener("click", this.enviarServidor.bind(this));

        this.limparLocal = document.querySelector("#limpar");
        this.limparLocal.addEventListener("click", this.limpaLocal.bind(this));

        this.velha = document.querySelector("#velha");
        this.velha.addEventListener("click", event => {
            this.realizaJogada(event);
            this.render();
        });
    }

    salvaLocal() {
        const dados = {
            jogadorX: this.jogadorX.value,
            jogadorO: this.jogadorO.value,
            jogadas: this.jogadas
        };

        localStorage.setItem("jogo", JSON.stringify(dados));
    }

    carregaLocal() {
        const dados = JSON.parse(localStorage.getItem("jogo"));
        this.jogadorO.value = dados.jogadorO;
        this.jogadorX.value = dados.jogadorX;
        this.jogadas = dados.jogadas;

        this.render();
    }

    limpaLocal() {
        localStorage.removeItem("jogo");
        this.jogadorO.value = "";
        this.jogadorX.value = "";
        this.iniciaEstado();

        this.render();
    }

    realizaJogada(event) {
        const id = event.target.dataset.id;

        if (this.fim) {
            this.modal("Fim de jogo! Bora jogar mais!");
            return;
        }

        if (!event.target.dataset.id) {
            this.modal("Você precisa clicar.");
            return;
        }

        if (this.jogadas[id] != 0) {
            this.modal("Zoa não pô! Posição marcada já.");
            return;
        }

        this.jogadas[id] = this.turno ? "X" : "O";

        this.turno = !this.turno;
    }

    render() {
        const resultado = this.verificaVitoria();

        if (resultado == "X" || resultado == "O") {
            this.fim = true;
            this.salvar.style.display = "block";

            this.modal(`Oba! ${resultado} venceu!`);
        } else {
            this.salvar.style.display = "none";

        }

        const velhaElemento = document.querySelectorAll("[data-id]");
        for (let i = 0; i < 9; i++) {
            velhaElemento[i].innerHTML = this.jogadas[i] == 0 ? "" : this.jogadas[i];
        }
    }

    verificaVitoria() {
        //decimal da sequencia de quem jogou x
        const valorX = parseInt(
            this.jogadas.map(value => (value == "X" ? 1 : 0)).join(""),
            2
        );
        //decimal da sequencia de quem jogou y
        const valorO = parseInt(
            this.jogadas.map(value => (value == "O" ? 1 : 0)).join(""),
            2
        );

        //percorrer array vitoria perguntando
        for (const element of this.vitoria) {
            if ((element & valorX) == element) {
                return "X";
            }
            if ((element & valorO) == element) {
                return "O";
            }
        }

        return "";
    }

    modal(texto) {
        const alerta = document.querySelector("#alerta");
        const modal = document.createElement("div");
        modal.innerHTML = texto;
        modal.classList.add("modalClass");
        alerta.appendChild(modal);

        setTimeout(() => {
            modal.classList.add("remover");
            setTimeout(() => {
                alerta.removeChild(modal);
            }, 1000);
        }, 2000);
    }

    enviarServidor() {
        const jogadorX = this.jogadorX.value;
        const jogadorO = this.jogadorO.value;

        domtoimage.toPng(this.velha, { width: '400', height: '400' })
            .then((dataUrl) => {

                return axios.post('/save', {
                    jogadorX,
                    jogadorO,
                    jogadas: JSON.stringify(this.jogadas),
                    img: dataUrl
                })

            }).then((response) => {
                this.modal('Envio com sucesso')
            })
            .catch((error) => {
                this.modal('oops, something went wrong!', error);
            });

    }
}