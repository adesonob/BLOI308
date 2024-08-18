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
  // Adiciona o CSS da classe 'more-participants' dinamicamente ao documento
  const style = document.createElement("style");
  style.innerHTML = `
    .more-participants {
        background-color: #f0f0f0;
        color: #333;
        padding: 15px;
        margin-top: 20px;
        border-radius: 5px;
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        border: 1px solid #ccc;
    }
`;
  document.head.appendChild(style);

  db.ref(`participants/${sweepstakeKey}`)
    .once("value")
    .then((snapshot) => {
      let participantsHTML = ""; // Variável para armazenar o HTML dos participantes
      let index = 1; // Inicializa o índice dos participantes
      let totalParticipants = snapshot.numChildren(); // Obter o número total de participantes
      let limit = 10; // Definir o limite de participantes a serem mostrados
      let count = 0; // Contador para controlar quantos participantes já foram processados

      snapshot.forEach((childSnapshot) => {
        if (count < limit) {
          // Verificar se já atingiu o limite
          const participant = childSnapshot.val();
          const isWinner = childSnapshot.key === winnerKey; // Usar a chave do snapshot
          const winnerClass = isWinner ? "winner" : ""; // Adicionar a classe 'winner' se for o ganhador
          const participantContainerId = `participant-${childSnapshot.key}`; // Gerar um ID único para cada contêiner de participante

          participantsHTML += `
                    <div id="${participantContainerId}" class="participant-card ${winnerClass}">
                        <div class="participant-number">${index}</div>
                        <img src="${participant.image}" alt="${participant.name}">
                        <div>${participant.name}</div>
                    </div>
                `;
          index++; // Incrementa o índice para o próximo participante
          count++; // Incrementa o contador
        }
      });

      // Se houver mais participantes além do limite, adicionar uma mensagem indicativa
      if (totalParticipants > limit) {
        participantsHTML += `
                <div class="more-participants">
                    Existem mais participantes que não podem ser exibidos.
                </div>
            `;
      }

      // Atualizar o conteúdo da lista de participantes com o HTML construído
      participantsList.innerHTML = participantsHTML;

      // Adicionar event listeners para cada contêiner de participante
      snapshot.forEach((childSnapshot) => {
        if (count <= limit) {
          const participantContainer = document.getElementById(
            `participant-${childSnapshot.key}`
          );
          participantContainer.addEventListener("click", () => {
            console.log(childSnapshot.val().uid);
          });
        }
      });

      // Esconder spinner de carregamento
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
