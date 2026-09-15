//javascript
/*
 * FRUTARIA - Frontend
 *
 * O backend NÃO é alterado por este arquivo.
 * Altere somente API_BASE se a porta da API mudar.
 */

// Backend HTTP
const API_BASE = "http://localhost:5217/api";

const listaFrutas = document.getElementById("listaFrutas");
const statusApi = document.getElementById("statusApi");
const btnAtualizar = document.getElementById("btnAtualizar");
const pesquisaFruta = document.getElementById("pesquisaFruta");
const btnLimparPesquisa = document.getElementById("btnLimparPesquisa");

let frutas = [];
let frutaSelecionada = null;
let termoPesquisa = "";


/* =========================
   EMOJIS DAS FRUTAS
========================= */

const emojiFrutas = {
    banana: "🍌",
    maca: "🍎",
    maçã: "🍎",
    laranja: "🍊",
    pera: "🍐",
    uva: "🍇",
    melancia: "🍉",
    mamao: "🥭",
    mamão: "🥭",
    manga: "🥭",
    abacaxi: "🍍",
    morango: "🍓",
    limao: "🍋",
    limão: "🍋",
    coco: "🥥",
    kiwi: "🥝",
    pessego: "🍑",
    pêssego: "🍑",
    cereja: "🍒"
};


/* =========================
   FUNÇÕES AUXILIARES
========================= */

function normalizar(texto = "") {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function emojiDaFruta(nome) {
    return emojiFrutas[normalizar(nome)] || "🍏";
}

function dinheiro(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function escaparHtml(valor) {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   REQUISIÇÃO PARA A API
========================= */

async function requisicao(endpoint, opcoes = {}) {

    const url = `${API_BASE}${endpoint}`;

    console.log("⏳ Requisição:", url);

    const resposta = await fetch(url, {
        ...opcoes,
        headers: {
            "Content-Type": "application/json",
            ...(opcoes.headers || {})
        }
    });

    console.log("✅ Resposta da API:", resposta.status);

    if (!resposta.ok) {

        let mensagem = `Erro ${resposta.status}`;

        try {

            const erro = await resposta.json();

            mensagem = typeof erro === "string"
                ? erro
                : (erro.message || mensagem);

        } catch {

            const texto = await resposta.text();

            if (texto) {
                mensagem = texto;
            }
        }

        throw new Error(mensagem);
    }

    if (resposta.status === 204) {
        return null;
    }

    // Aguarda a resposta JSON
    const dados = await resposta.json();

    console.log("📦 Dados recebidos:", dados);

    return dados;
}


/* =========================
   CARREGAR FRUTAS
========================= */

async function carregarFrutas() {

    statusApi.className = "status";
    statusApi.textContent = "⏳ Carregando frutas...";

    listaFrutas.innerHTML = `
        <div class="status">
            ⏳ Aguardando resposta da API...
        </div>
    `;

    // Evita clicar várias vezes enquanto carrega
    btnAtualizar.disabled = true;

    try {

        /*
         * Aguarda a resposta da API.
         * Nada abaixo será executado antes da resposta.
         */
        frutas = await requisicao("/frutas");

        // Garante que frutas seja uma lista
        if (!Array.isArray(frutas)) {
            frutas = [];
        }

        renderizarFrutas(frutas);

        statusApi.textContent =
            `${frutas.length} produto(s) encontrado(s) na API.`;

    } catch (erro) {

        statusApi.className = "status erro";

        statusApi.textContent =
            `Não foi possível conectar à API: ${erro.message}`;

        listaFrutas.innerHTML = `
            <div class="status erro">
                ❌ Não foi possível carregar as frutas.
                <br>
                Verifique se o backend está executando.
            </div>
        `;

        console.error("❌ Erro na API:", erro);

    } finally {

        // Libera o botão novamente
        btnAtualizar.disabled = false;
    }
}


/* =========================
   RENDERIZAR FRUTAS
========================= */

function renderizarFrutas(lista) {

    const termo = normalizar(termoPesquisa.trim());

    const filtradas = termo
        ? lista.filter(fruta => {

            const nome = normalizar(fruta.nome);

            const categoria =
                normalizar(fruta.categoria?.nome || "");

            return nome.includes(termo) ||
                   categoria.includes(termo);
        })
        : lista;


    if (!filtradas.length) {

        listaFrutas.innerHTML = `
            <div class="status">
                Nenhuma fruta encontrada para
                "${escaparHtml(termoPesquisa)}".
            </div>
        `;

        return;
    }


    listaFrutas.innerHTML = filtradas.map(fruta => {

        const semEstoque =
            Number(fruta.estoque) <= 0;

        const categoria =
            fruta.categoria?.nome || "Fruta";


        return `
            <article class="card-fruta">

                <div class="fruta-icone">
                    ${emojiDaFruta(fruta.nome)}
                </div>

                <h3>
                    ${escaparHtml(fruta.nome)}
                </h3>

                <span class="categoria">
                    ${escaparHtml(categoria)}
                </span>

                <span class="preco">
                    ${dinheiro(fruta.preco)}
                </span>

                <span class="estoque">
                    Estoque: ${fruta.estoque}
                </span>

                <button
                    class="btn-principal"
                    type="button"
                    data-comprar="${fruta.id}"
                    ${semEstoque ? "disabled" : ""}
                >
                    ${semEstoque ? "Sem estoque" : "Comprar"}
                </button>

            </article>
        `;

    }).join("");


    document.querySelectorAll("[data-comprar]")
        .forEach(botao => {

            botao.addEventListener("click", () => {

                abrirCompra(
                    Number(botao.dataset.comprar)
                );

            });

        });
}


/* =========================
   MODAIS
========================= */

function abrirModal(id) {

    const modal = document.getElementById(id);

    modal.classList.add("aberto");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}

function fecharModal(id) {

    const modal = document.getElementById(id);

    modal.classList.remove("aberto");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


document.getElementById("btnSobre")
    .addEventListener("click", () => {
        abrirModal("modalSobre");
    });


document.getElementById("btnContato")
    .addEventListener("click", () => {
        abrirModal("modalContato");
    });


document.querySelectorAll("[data-fechar]")
    .forEach(botao => {

        botao.addEventListener("click", () => {

            fecharModal(
                botao.dataset.fechar
            );

        });

    });


document.querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener("click", evento => {

            if (evento.target === modal) {
                fecharModal(modal.id);
            }

        });

    });


document.addEventListener("keydown", evento => {

    if (evento.key === "Escape") {

        document
            .querySelectorAll(".modal.aberto")
            .forEach(modal => {

                fecharModal(modal.id);

            });

    }

});


/* =========================
   ABRIR COMPRA
========================= */

async function abrirCompra(id) {

    frutaSelecionada =
        frutas.find(fruta => fruta.id === id);

    if (!frutaSelecionada) {
        return;
    }


    document.getElementById("resumoCompra").textContent =
        `${frutaSelecionada.nome} — ` +
        `${dinheiro(frutaSelecionada.preco)} por unidade. ` +
        `Estoque disponível: ${frutaSelecionada.estoque}.`;


    const quantidade =
        document.getElementById("quantidadeVenda");

    quantidade.max =
        frutaSelecionada.estoque;

    quantidade.value = 1;


    document.getElementById("resultadoVenda")
        .textContent = "";


    // Aguarda os clientes serem carregados
    await carregarClientes();


    abrirModal("modalCompra");
}


/* =========================
   CARREGAR CLIENTES
========================= */

async function carregarClientes() {

    const select =
        document.getElementById("clienteVenda");


    select.innerHTML =
        `<option value="">
            ⏳ Carregando clientes...
        </option>`;


    try {

        // Aguarda a API responder
        const clientes =
            await requisicao("/clientes");


        if (!clientes.length) {

            select.innerHTML =
                `<option value="">
                    Nenhum cliente cadastrado
                </option>`;

            return;
        }


        select.innerHTML =
            `<option value="">
                Selecione o cliente
            </option>` +

            clientes.map(cliente =>

                `<option value="${cliente.id}">
                    ${escaparHtml(cliente.nome)}
                </option>`

            ).join("");


    } catch (erro) {

        select.innerHTML =
            `<option value="">
                Erro ao carregar clientes
            </option>`;

        console.error(
            "Erro ao carregar clientes:",
            erro
        );
    }
}


/* =========================
   REGISTRAR VENDA
========================= */

document.getElementById("formVenda")
    .addEventListener("submit", async evento => {

        evento.preventDefault();


        const clienteId =
            Number(
                document.getElementById("clienteVenda").value
            );


        const quantidade =
            Number(
                document.getElementById("quantidadeVenda").value
            );


        const resultado =
            document.getElementById("resultadoVenda");


        if (
            !clienteId ||
            !frutaSelecionada ||
            quantidade < 1
        ) {

            resultado.className =
                "resultado erro";

            resultado.textContent =
                "Preencha os dados do pedido.";

            return;
        }


        if (
            quantidade >
            Number(frutaSelecionada.estoque)
        ) {

            resultado.className =
                "resultado erro";

            resultado.textContent =
                "A quantidade é maior que o estoque disponível.";

            return;
        }


        resultado.className =
            "resultado";

        resultado.textContent =
            "⏳ Registrando pedido...";


        try {

            const pedido =
                await requisicao("/vendas", {

                    method: "POST",

                    body: JSON.stringify({

                        clienteId,

                        itens: [
                            {
                                frutaId:
                                    frutaSelecionada.id,

                                quantidade
                            }
                        ]
                    })
                });


            resultado.className =
                "resultado sucesso";


            resultado.textContent =
                `Pedido #${pedido.id} registrado! ` +
                `Total: ${dinheiro(pedido.valorFinal)}.`;


            /*
             * Aguarda novamente a API para atualizar
             * o estoque mostrado na tela.
             */
            await carregarFrutas();


        } catch (erro) {

            resultado.className =
                "resultado erro";

            resultado.textContent =
                `Não foi possível registrar: ${erro.message}`;

        }

    });


/* =========================
   ATUALIZAR
========================= */

btnAtualizar.addEventListener(
    "click",
    carregarFrutas
);


/* =========================
   PESQUISA
========================= */

pesquisaFruta.addEventListener(
    "input",
    () => {

        termoPesquisa =
            pesquisaFruta.value;


        /*
         * A pesquisa NÃO chama a API novamente.
         * Ela filtra os dados que já foram carregados.
         */
        renderizarFrutas(frutas);


        const termo =
            termoPesquisa.trim();


        if (termo) {

            const quantidade =
                document.querySelectorAll(
                    ".card-fruta"
                ).length;


            statusApi.textContent =
                `${quantidade} produto(s) encontrado(s) ` +
                `para "${termo}".`;

        } else {

            statusApi.textContent =
                `${frutas.length} produto(s) ` +
                `encontrado(s) na API.`;
        }

    }
);


/* =========================
   LIMPAR PESQUISA
========================= */

btnLimparPesquisa.addEventListener(
    "click",
    () => {

        pesquisaFruta.value = "";

        termoPesquisa = "";

        renderizarFrutas(frutas);

        statusApi.textContent =
            `${frutas.length} produto(s) ` +
            `encontrado(s) na API.`;

        pesquisaFruta.focus();

    }
);


/* =========================
   INICIAR SISTEMA
========================= */

carregarFrutas();

