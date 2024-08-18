// Mostrar spinner de carregamento
document.getElementById("spinner").style.display = "block";

// Função para obter o parâmetro de URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Função para exibir a lista de participantes
function displayParticipants() {
  const sweepstakeKey = getQueryParam("sweepstakeKey");
  const participantsList = document.getElementById("participants-list");

  // Buscar a chave do ganhador do localStorage
  const winnerKey = localStorage.getItem("winner_key");

  // Buscar os participantes no Realtime Database
  db.ref(`participants/${sweepstakeKey}`)
    .limitToFirst(10) // Limita a busca aos primeiros 10 participantes
    .once("value")
    .then((snapshot) => {
      let participantsHTML = "";
      let index = 1;

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
      });

      // Mensagem de mais participantes, exibida sempre ao lado
      participantsHTML += `
            <div class="more-participants">
                Existem mais participantes que não podem ser exibidos.
            </div>
        `;

      participantsList.innerHTML = participantsHTML;

      snapshot.forEach((childSnapshot) => {
        const participantContainer = document.getElementById(
          `participant-${childSnapshot.key}`
        );
        participantContainer.addEventListener("click", () => {
          console.log(childSnapshot.val().uid);
        });
      });

      document.getElementById("spinner").style.display = "none";
    })
    .catch((error) => {
      console.error("Erro ao buscar participantes: ", error);
    });
}

function goBack() {
  window.history.back();
}

// Chamar a função para exibir os participantes ao carregar a página
displayParticipants();
