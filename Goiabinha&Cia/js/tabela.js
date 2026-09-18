/* ============================================================
   DATA
   ============================================================ */

const TIPOS = {
  "Professor": {
    tagClass: "tag-professor",
    color: "#7c3aed"
  },

  "Funcionário": {
    tagClass: "tag-funcionario",
    color: "#2f6fed"
  },

  "Aluno": {
    tagClass: "tag-aluno",
    color: "#16a866"
  },

  "Visitante": {
    tagClass: "tag-visitante",
    color: "#e0932a"
  }
};


const NOMES = [
  "Carlos Alberto",
  "Juliana Ferreira",
  "Lucas Martins",
  "Rafael Souza",
  "Patricia Lima",
  "Beatriz Oliveira",
  "Fernando Rocha",
  "Thiago Nascimento",
  "Ana Paula Silva",
  "Bruno Cardoso",
  "Camila Rezende",
  "Diego Santos",
  "Elaine Costa",
  "Felipe Araujo",
  "Gabriela Torres",
  "Henrique Mota",
  "Isabela Ramos",
  "Joao Pedro Alves",
  "Karina Duarte",
  "Leonardo Barros",
  "Mariana Vieira",
  "Nicolas Pires",
  "Otavio Freitas",
  "Paula Nogueira",
  "Renata Correia",
  "Sergio Andrade",
  "Tatiane Moreira",
  "Ursula Campos",
  "Vitor Hugo Lopes",
  "William Teixeira",
  "Yasmin Carvalho",
  "Zeca Fontoura",
  "Aline Batista",
  "Bento Cavalcante",
  "Clarice Monteiro",
  "Douglas Farias",
  "Eduarda Peixoto",
  "Gustavo Xavier",
  "Helena Bezerra",
  "Igor Salles"
];


function pad(n) {
  return n.toString().padStart(2, "0");
}


function randomPlate(i) {

  const letras =
    String.fromCharCode(65 + (i % 26)) +
    String.fromCharCode(65 + ((i * 3) % 26));

  const num = 1000 + (i * 37) % 9000;

  const meio =
    String.fromCharCode(
      48 + (i % 10) >= 58
        ? 65
        : 48 + (i % 10)
    );

  return `${letras}-${(i % 2 === 0) ? "" : ""}${num}`.slice(0, 3)
    + "-"
    + `${(i + i) % 10}${num.toString().slice(0, 2)}${num.toString().slice(2)}`.slice(0, 4);
}


function plateFor(i) {

  const l1 =
    String.fromCharCode(65 + (i % 26));

  const l2 =
    String.fromCharCode(65 + ((i * 5 + 3) % 26));

  const d1 =
    (i * 7) % 10;

  const l3 =
    String.fromCharCode(65 + ((i * 11) % 26));

  const d2 =
    (i * 3) % 10;

  const d3 =
    (i * 13) % 10;

  return `${l1}${l2}-${d1}${l3}${d2}${d3}`;
}


const tiposOrder = [
  "Professor",
  "Funcionário",
  "Aluno",
  "Visitante"
];


let data = [];


(function seedData() {

  let id = 1;

  for (let i = 0; i < 68; i++) {

    const nome =
      NOMES[i % NOMES.length];

    const tipo =
      tiposOrder[i % 4];

    const dia =
      pad(5 + (i % 24));

    const mes =
      pad(5 + Math.floor(i / 24));

    const emailUser =
      nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ".");

    const dominio =
      tipo === "Visitante"
        ? null
        : (
          tipo === "Aluno"
            ? "aluno.etec.br"
            : "etec.br"
        );

    const contato =
      dominio
        ? `${emailUser}@${dominio}`
        : `(11) ${90000 + i * 7}-${1000 + i * 13}`
            .replace("(11) 9", "(11) 9");

    const status =
      (i % 11 === 6)
        ? "Inativo"
        : "Ativo";

    data.push({

      id: id++,

      placa:
        plateFor(i),

      nome,

      tipo,

      contato:
        dominio
          ? `${emailUser}@${dominio}`
          : `(11) 9${(1000 + i * 37) % 9000 + 1000}-${(1000 + i * 91) % 9000 + 1000}`,

      dataCadastro:
        `${dia}/${mes}/2024`,

      status

    });

  }

})();


/* ============================================================
   ESTACIONAMENTO
   ============================================================ */

const estacionamento = [];


(function seedParking() {

  const horas = [
    12, 11, 12, 13, 13,
    9, 14, 10, 15, 16,
    13
  ];

  const mins = [
    40, 15, 10, 5, 20,
    50, 5, 30, 0, 10,
    45
  ];

  const picks = [
    0, 1, 2, 3, 4,
    7, 10, 12, 15, 18,
    21, 24, 27
  ];

  picks.forEach((idx, k) => {

    const rec =
      data[idx % data.length];

    if (rec.status !== "Ativo") {
      return;
    }

    estacionamento.push({

      placa: rec.placa,

      nome: rec.nome,

      tipo: rec.tipo,

      entrada:
        `${pad(horas[k % horas.length])}:${pad(mins[k % mins.length])}`

    });

  });

})();


/* ============================================================
   STATE
   ============================================================ */

let state = {

  search: "",

  tipo: "",

  status: "",

  page: 1,

  perPage: 10,

  showAllVehicles: false

};


/* ============================================================
   RENDER: TABLE
   ============================================================ */

function initials(name) {

  const parts =
    name.trim().split(" ");

  return (
    parts[0][0] +
    (parts[1] ? parts[1][0] : "")
  ).toUpperCase();

}


function filteredData() {

  return data.filter(r => {

    const s =
      state.search
        .trim()
        .toLowerCase();

    const matchesSearch =
      !s ||
      r.placa.toLowerCase().includes(s) ||
      r.nome.toLowerCase().includes(s) ||
      r.contato.toLowerCase().includes(s);

    const matchesTipo =
      !state.tipo ||
      r.tipo === state.tipo;

    const matchesStatus =
      !state.status ||
      r.status === state.status;

    return (
      matchesSearch &&
      matchesTipo &&
      matchesStatus
    );

  });

}


function renderTable() {

  const rows =
    filteredData();

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        rows.length / state.perPage
      )
    );

  if (state.page > totalPages) {
    state.page = totalPages;
  }

  const start =
    (state.page - 1) *
    state.perPage;

  const pageRows =
    rows.slice(
      start,
      start + state.perPage
    );


  const tbody =
    document.getElementById(
      "crudTableBody"
    );


  tbody.innerHTML =
    pageRows.map(r => {

      const t =
        TIPOS[r.tipo];

      return `
        <tr>

          <td class="placa-cell">
            ${r.placa}
          </td>

          <td>

            <div class="user-cell">

              <div
                class="avatar"
                style="background:${t.color}">

                ${initials(r.nome)}

              </div>

              <span class="user-name">
                ${r.nome}
              </span>

            </div>

          </td>

          <td>

            <span class="badge ${t.tagClass}">
              ${r.tipo}
            </span>

          </td>

          <td class="email-muted">
            ${r.contato}
          </td>

          <td>
            ${r.dataCadastro}
          </td>

          <td>

            <span
              class="badge ${
                r.status === "Ativo"
                  ? "badge-status-ativo"
                  : "badge-status-inativo"
              }">

              ${r.status}

            </span>

          </td>

          <td>

            <div class="acoes">

              <button
                class="icon-btn"
                title="Visualizar">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2">

                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>

                </svg>

              </button>


              <button
                class="icon-btn"
                title="Editar">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2">

                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>

                </svg>

              </button>


              <button
                class="icon-btn danger"
                title="Excluir"
                onclick="deleteRow(${r.id})">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2">

                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/>
                  <path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>

                </svg>

              </button>

            </div>

          </td>

        </tr>
      `;

    }).join("") ||

    `
      <tr>
        <td
          colspan="7"
          style="
            text-align:center;
            color:var(--text-muted);
            padding:24px;
          ">

          Nenhum registro encontrado.

        </td>
      </tr>
    `;


  document.getElementById(
    "crudInfo"
  ).textContent =

    rows.length === 0

      ? "Nenhum registro"

      : `Exibindo ${start + 1} a ${
          Math.min(
            start + state.perPage,
            rows.length
          )
        } de ${rows.length} registros`;


  renderPagination(totalPages);

}


function renderPagination(totalPages) {

  const el =
    document.getElementById(
      "crudPagination"
    );

  let html = `
    <button
      class="page-btn"
      ${
        state.page === 1
          ? "disabled"
          : ""
      }
      onclick="goPage(${state.page - 1})">

      &laquo;

    </button>
  `;


  const maxShown = 5;

  let startP =
    Math.max(
      1,
      state.page - 2
    );

  let endP =
    Math.min(
      totalPages,
      startP + maxShown - 1
    );

  startP =
    Math.max(
      1,
      endP - maxShown + 1
    );


  for (
    let p = startP;
    p <= endP;
    p++
  ) {

    html += `
      <button
        class="page-btn ${
          p === state.page
            ? "active"
            : ""
        }"
        onclick="goPage(${p})">

        ${p}

      </button>
    `;

  }


  html += `
    <button
      class="page-btn"
      ${
        state.page === totalPages
          ? "disabled"
          : ""
      }
      onclick="goPage(${state.page + 1})">

      &raquo;

    </button>
  `;


  el.innerHTML = html;

}


function goPage(p) {

  state.page = p;

  renderTable();

}


function deleteRow(id) {

  data =
    data.filter(
      r => r.id !== id
    );

  renderTable();

  renderDonut();

}


/* ============================================================
   RENDER: DONUT
   ============================================================ */

function renderDonut() {

  const counts = {};

  tiposOrder.forEach(
    t => counts[t] = 0
  );


  data.forEach(r => {

    if (
      counts[r.tipo] !== undefined
    ) {

      counts[r.tipo]++;

    }

  });


  const total =
    data.length;


  const R = 52;

  const C =
    2 * Math.PI * R;

  const STROKE = 18;


  let offset = 0;

  let circles = "";


  tiposOrder.forEach(t => {

    const val =
      counts[t];

    const frac =
      total
        ? val / total
        : 0;

    const len =
      frac * C;


    circles += `
      <circle
        cx="70"
        cy="70"
        r="${R}"
        fill="none"
        stroke="${TIPOS[t].color}"
        stroke-width="${STROKE}"
        stroke-dasharray="${len} ${C - len}"
        stroke-dashoffset="${-offset}"
        transform="rotate(-90 70 70)"
        stroke-linecap="butt"/>
    `;


    offset += len;

  });


  document.getElementById(
    "donutSvgWrap"
  ).innerHTML = `

    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140">

      ${circles}

      <text
        x="70"
        y="66"
        text-anchor="middle"
        font-size="24"
        font-weight="700"
        fill="#1f2330">

        ${total}

      </text>

      <text
        x="70"
        y="84"
        text-anchor="middle"
        font-size="11"
        fill="#8b8fa3">

        Total

      </text>

    </svg>
  `;


  document.getElementById(
    "donutLegend"
  ).innerHTML =

    tiposOrder.map(t => {

      const val =
        counts[t];

      const pct =
        total
          ? Math.round(
              (val / total) * 100
            )
          : 0;


      const label =
        t === "Professor"
          ? "Professores"
          : t === "Funcionário"
            ? "Funcionários"
            : t === "Aluno"
              ? "Alunos"
              : "Visitantes";


      return `
        <li>

          <span
            class="dot"
            style="background:${TIPOS[t].color}">
          </span>

          <span class="legend-label">
            ${label}
          </span>

          <span class="legend-pct">
            ${val} (${pct}%)
          </span>

        </li>
      `;

    }).join("");

}


/* ============================================================
   RENDER: ACTIVE VEHICLES
   ============================================================ */

function permanencia(entrada) {

  const [h, m] =
    entrada
      .split(":")
      .map(Number);


  const now =
    new Date();


  const entradaDate =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      h,
      m
    );


  let diffMin =
    Math.floor(
      (now - entradaDate) /
      60000
    );


  if (diffMin < 0) {
    diffMin += 24 * 60;
  }


  const hh =
    Math.floor(
      diffMin / 60
    );

  const mm =
    diffMin % 60;


  return `${pad(hh)}h${pad(mm)}min`;

}


function renderVehicles() {

  document.getElementById(
    "totalAtivosCount"
  ).textContent =
    estacionamento.length;


  const shown =
    state.showAllVehicles
      ? estacionamento
      : estacionamento.slice(0, 5);


  document.getElementById(
    "vehiclesRow"
  ).innerHTML =

    shown.map(v => {

      const t =
        TIPOS[v.tipo];


      return `

        <div class="vehicle-card">

          <div class="vehicle-top">

            <div
              class="avatar"
              style="
                background:${t.color};
                width:28px;
                height:28px;
                min-width:28px;
                font-size:11px;
              ">

              ${initials(v.nome)}

            </div>


            <div>

              <div class="vehicle-plate">
                ${v.placa}
              </div>

              <div class="vehicle-name">
                ${v.nome}
              </div>

            </div>

          </div>


          <span
            class="badge ${t.tagClass}"
            style="
              font-size:10.5px;
              padding:3px 9px;
            ">

            ${v.tipo}

          </span>


          <div class="vehicle-meta">

            <div>
              Entrada:
              <b>${v.entrada}</b>
            </div>

            <div>
              Permanência:
              <b
                class="perm-${v.placa.replace(/[^A-Z0-9]/g, '')}">

                ${permanencia(v.entrada)}

              </b>
            </div>

          </div>

        </div>

      `;

    }).join("");

}


setInterval(() => {

  estacionamento.forEach(v => {

    const el =
      document.querySelector(
        `.perm-${v.placa.replace(/[^A-Z0-9]/g, '')}`
      );

    if (el) {
      el.textContent =
        permanencia(v.entrada);
    }

  });

}, 30000);


/* ============================================================
   EVENTS
   ============================================================ */

document
  .getElementById("searchInput")
  .addEventListener("input", e => {

    state.search =
      e.target.value;

    state.page = 1;

    renderTable();

  });


document
  .getElementById("tipoFiltro")
  .addEventListener("change", e => {

    state.tipo =
      e.target.value;

    state.page = 1;

    renderTable();

  });


document
  .getElementById("statusFiltro")
  .addEventListener("change", e => {

    state.status =
      e.target.value;

    state.page = 1;

    renderTable();

  });


document
  .getElementById("porPagina")
  .addEventListener("change", e => {

    state.perPage =
      parseInt(
        e.target.value,
        10
      );

    state.page = 1;

    renderTable();

  });


document
  .getElementById("btnFiltros")
  .addEventListener("click", () => {

    document
      .getElementById("filtroExtra")
      .classList.toggle("open");

  });


document
  .getElementById("btnVerTodos")
  .addEventListener("click", e => {

    state.showAllVehicles =
      !state.showAllVehicles;


    e.target.firstChild.textContent =
      state.showAllVehicles
        ? "Ver menos ("
        : "Ver todos (";


    renderVehicles();

  });


function showToast(msg) {

  const toast =
    document.getElementById(
      "toast"
    );


  document.getElementById(
    "toastMsg"
  ).textContent = msg;


  toast.classList.add("show");


  setTimeout(
    () => toast.classList.remove("show"),
    2600
  );

}


document
  .getElementById("cadastroForm")
  .addEventListener("submit", e => {

    e.preventDefault();


    const tipo =
      document.getElementById(
        "fTipo"
      ).value;


    const nome =
      document.getElementById(
        "fNome"
      ).value.trim();


    const placa =
      document.getElementById(
        "fPlaca"
      ).value
        .trim()
        .toUpperCase();


    const contato =
      document.getElementById(
        "fContato"
      ).value.trim();


    if (
      !tipo ||
      !nome ||
      !placa ||
      !contato
    ) {
      return;
    }


    const now =
      new Date();


    const novo = {

      id: Date.now(),

      placa,

      nome,

      tipo,

      contato,

      dataCadastro:
        `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`,

      status: "Ativo"

    };


    data.unshift(novo);

    state.page = 1;

    renderTable();

    renderDonut();

    showToast(
      `${nome} cadastrado com sucesso!`
    );

    e.target.reset();

  });


document
  .getElementById("btnExportar")
  .addEventListener("click", () => {

    const rows =
      filteredData();


    const header =
      "Placa,Nome,Tipo,Contato,Data Cadastro,Status\n";


    const body =
      rows
        .map(r =>
          [
            r.placa,
            r.nome,
            r.tipo,
            r.contato,
            r.dataCadastro,
            r.status
          ].join(",")
        )
        .join("\n");


    const blob =
      new Blob(
        [header + body],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );


    const url =
      URL.createObjectURL(blob);


    const a =
      document.createElement("a");


    a.href = url;

    a.download =
      "veiculos_usuarios.csv";


    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  });


/* ============================================================
   INIT
   ============================================================ */

renderTable();

renderDonut();

renderVehicles();
