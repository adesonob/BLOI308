// Mostrar spinner de carregamento
document.getElementById("spinner").style.display = "block";

// Função para obter o parâmetro de URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

let lastKey = null; // Armazena a chave do último participante carregado
let loading = false; // Evita múltiplos carregamentos simultâneos

// Função para exibir a lista de participantes
function displayParticipants(limit = 100, startKey = null) {
  const sweepstakeKey = getQueryParam("sweepstakeKey");
  const participantsList = document.getElementById("participants-list");

  // Buscar a chave do ganhador do localStorage
  const winnerKey = localStorage.getItem("winner_key");

  let query = db.ref(`participants/${sweepstakeKey}`).limitToFirst(limit);

  if (startKey) {
    query = query.startAt(null, startKey); // Começa a partir do último participante carregado
  }

  loading = true; // Marca como carregando

  // Buscar os participantes no Realtime Database
  query.once("value")
    .then((snapshot) => {
      let participantsHTML = startKey ? participantsList.innerHTML : "";
      let index = startKey ? participantsList.children.length + 1 : 1;

      snapshot.forEach((childSnapshot) => {
        const participant = childSnapshot.val();
        const isWinner = childSnapshot.key === winnerKey;
        const winnerClass = isWinner ? "winner" : "";
        const participantContainerId = `participant-${childSnapshot.key}`;

        participantsHTML += `
                <div id="${participantContainerId}" class="participant-card ${winnerClass}">
                    <div class="participant-number">${index}</div>
                    <img src="${participant.image}" alt="${participant.name}">
                    <div>${participant.name}</div>
                </div>
            `;
        index++;
        lastKey = childSnapshot.key; // Atualiza a última chave
      });

      participantsList.innerHTML = participantsHTML;

      // Adiciona event listeners para os participantes carregados
      snapshot.forEach((childSnapshot) => {
        const participantContainer = document.getElementById(
          `participant-${childSnapshot.key}`
        );
        participantContainer.addEventListener("click", () => {
          console.log(childSnapshot.val().uid);
        });
      });

      document.getElementById("spinner").style.display = "none";
      loading = false; // Libera para o próximo carregamento
    })
    .catch((error) => {
      console.error("Erro ao buscar participantes: ", error);
      loading = false;
    });
}

// Listener para carregar mais participantes ao rolar a página
window.addEventListener('scroll', () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !loading) {
    displayParticipants(100, lastKey);
  }
});

// Chamar a função para exibir os primeiros participantes ao carregar a página
displayParticipants();

function goBack() {
  window.history.back();
}
