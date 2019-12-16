window.onload = () => {
    new JogoVelha();
};


class JogoVelha {
    constructor() {
        this.iniciaElementos();
        this.iniciaEstado();
    }

    iniciaEstado() {
        this.id    = Math.floor((Math.random() * 100) + 1);
        this.turno = true;
        this.fim = false;
        this.jogadas = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.vitoria = [448, 56, 7, 292, 146, 73, 273, 84];
    }

    iniciaElementos() {
        this.jogador = document.querySelector("#jogador");
        this.token = document.querySelector("#token");

        this.carregarLocal = document.querySelector("#carrega-local");
        this.carregarLocal.addEventListener("click", this.carregaLocal.bind(this));

        this.participar = document.querySelector("#participar");
        this.participar.addEventListener("click", this.participarPartida.bind(this));

        this.limparLocal = document.querySelector("#limpar");
        this.limparLocal.addEventListener("click", this.limpaLocal.bind(this));

        this.iniciarPartida = document.querySelector("#iniciar-partida");
        this.iniciarPartida.addEventListener("click", this.iniciaPartida.bind(this));

        this.navbarCollapse = document.querySelector("#navbarCollapse");

        this.tabuleiro = document.querySelector("#tabuleiro");
        this.tabuleiro.addEventListener("click", event => {
            this.realizaJogada(event);
            this.render();
        });
    }

    retornaKey() {
        return db.ref('partidas').push().key;
    }

    carregaLocal() {
        const docRef = db.ref(`partidas/${idPartida}`);
        docRef.on('value', item => {
            console.log(item.val())
            this.token = item.val().token;
            // this.jogadorO.value = item.val().jogadorO;
            this.jogador.value = item.val().jogadorX;
            this.jogadas = item.val().jogadas;
            this.turno = item.val().turno;
            this.fim = item.val().fim;
            this.render();
        })
    }

    limpaLocal() {
        this.jogador.value = "";
        this.iniciaEstado();

        this.render();
    }

    getLance() {
        const dados = {
            token: this.id,
            jogadorX: this.jogador.value,
            jogadorO: '',
            jogadas: this.jogadas,
            turno: this.turno,
            fim: this.fim,
        };
        return dados;
    }

    iniciaPartida() {
        idPartida = this.retornaKey();
        const dados = this.getLance();

        let gravar = {};
        gravar[`partidas/${idPartida}`] = dados;
        db.ref().update(gravar);

        this.navbarCollapse.classList.toggle("show");

        this.carregaLocal()
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
        this.turno  = !this.turno;
        const dados = this.getLance();
        let gravar  = {};
        gravar[`partidas/${idPartida}`] = dados;
        db.ref().update(gravar);
    }

    render() {
        const resultado = this.verificaVitoria();

        if (resultado == "X" || resultado == "O") {
            this.fim = true;
            // this.salvar.style.display = "block";

            this.modal(`Oba! ${resultado} venceu!`);
        } else {
            // this.salvar.style.display = "none";
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

    participarPartida() {
        const id = parseInt(this.token.value);
        const jogador = this.jogador.value;
        var docRef =  db.ref("/partidas").orderByChild("token").equalTo(id);
        docRef.on('child_added', (item) => {
            console.log(item.val())
            if (item.val()) {
                this.id = item.val().token;
                // this.jogadorO.value = item.val().jogadorO;
                this.jogador.value = item.val().jogadorX;
                this.jogadas = item.val().jogadas;
                this.turno = item.val().turno;
                this.fim = item.val().fim;
                this.render();
            }
        })       
    }
}