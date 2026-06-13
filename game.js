// ================= STATE =================
let state = {
  screen: 'setup',
  playerNames: [],
  rounds: 5,
  players: [], // {name, score, goldenCount, cancelledCount}
  questionOrder: [],
  currentRound: 0,
  currentPlayerIndex: 0,
  currentAnswers: [],
  lastResults: null,
  error: ''
};

// ================= HELPERS =================
function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function normalize(str){
  return str.trim().toLowerCase().replace(/\s+/g,' ');
}

// ================= SCORING =================
function computeResults(question, answers){
  const norms = answers.map(a => normalize(a.text));
  const goldenNorm = normalize(question.golden);
  const forbiddenNorm = normalize(question.forbidden);
  const validSet = question.valid.map(normalize);

  const counts = {};
  norms.forEach(n => { if(n) counts[n] = (counts[n]||0)+1; });

  return answers.map((a,i) => {
    const norm = norms[i];
    const isEmpty = norm === '';
    const isValid = !isEmpty && validSet.includes(norm);
    const isDup = !isEmpty && counts[norm] > 1;
    const isGolden = !isEmpty && norm === goldenNorm;
    const isForbidden = !isEmpty && norm === forbiddenNorm;

    let score = 0;
    let cancelled = false;

    if(isForbidden){
      score = -1;
    } else if(isValid){
      if(isDup){
        if(isGolden){
          score = 1;
        } else {
          score = 0;
          cancelled = true;
        }
      } else {
        score = isGolden ? 2 : 1;
      }
    } else {
      // invalid answer
      score = isDup ? -1 : 0;
    }

    return {
      playerIndex: a.playerIndex,
      text: a.text,
      isValid, isDup, isGolden, isForbidden, isEmpty,
      score, cancelled
    };
  });
}

// ================= GAME FLOW =================
function startGame(){
  state.players = state.playerNames.map(name => ({
    name, score: 0, goldenCount: 0, cancelledCount: 0
  }));
  const order = shuffle([...Array(QUESTIONS.length).keys()]).slice(0, state.rounds);
  state.questionOrder = order;
  state.currentRound = 0;
  state.currentPlayerIndex = 0;
  state.currentAnswers = [];
  state.screen = 'play';
  render();
}
