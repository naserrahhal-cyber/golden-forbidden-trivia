// ================= RENDER =================
function render(){
  const app = document.getElementById('app');
  app.innerHTML = '';

  if(state.screen === 'setup') renderSetup(app);
  else if(state.screen === 'play') renderPlay(app);
  else if(state.screen === 'reveal') renderReveal(app);
  else if(state.screen === 'leaderboard') renderLeaderboard(app);
  else if(state.screen === 'final') renderFinal(app);
}

function el(tag, props={}, children=[]){
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k,v])=>{
    if(k === 'class') e.className = v;
    else if(k === 'text') e.textContent = v;
    else if(k.startsWith('on')) e.addEventListener(k.substring(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  });
  (Array.isArray(children)?children:[children]).forEach(c=>{
    if(c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return e;
}

// ----- Setup screen -----
function renderSetup(app){
  app.appendChild(el('div',{class:'title', text:'🏆 لعبة الإجابات الذهبية والمحظورة'}));
  app.appendChild(el('div',{class:'subtitle', text:'كل سؤال له إجابة ذهبية (بونص) وإجابة محظورة (عقاب) — سرية حتى الكشف!'}));

  const card = el('div',{class:'card'});
  card.appendChild(el('h2',{text:'👥 اللاعبون'}));

  const list = el('div',{class:'players-list'});
  state.playerNames.forEach((name, idx)=>{
    const row = el('div',{class:'player-row'},[
      el('div',{class:'num', text: String(idx+1)}),
      el('span',{class:'pname', text:name}),
      el('button',{class:'remove-btn', text:'✕', onclick: ()=>{
        state.playerNames.splice(idx,1);
        render();
      }})
    ]);
    list.appendChild(row);
  });
  card.appendChild(list);

  const inputRow = el('div',{class:'row'});
  const nameInput = el('input',{type:'text', placeholder:'اسم اللاعب الجديد...'});
  nameInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') addPlayer(); });
  const addBtn = el('button',{class:'btn-add', text:'إضافة'});
  addBtn.addEventListener('click', addPlayer);

  function addPlayer(){
    const val = nameInput.value.trim();
    if(!val){ return; }
    if(state.playerNames.includes(val)){
      state.error = 'هذا الاسم مستخدم بالفعل';
      render();
      return;
    }
    state.playerNames.push(val);
    state.error = '';
    render();
  }

  inputRow.appendChild(nameInput);
  inputRow.appendChild(addBtn);
  card.appendChild(inputRow);
  app.appendChild(card);

  // settings
  const settingsCard = el('div',{class:'card'});
  settingsCard.appendChild(el('h2',{text:'⚙️ إعدادات اللعبة'}));

  const roundsRow = el('div',{class:'setting-row'});
  roundsRow.appendChild(el('label',{text:'عدد الأسئلة (الجولات)'}));
  const select = el('select',{});
  for(let i=1;i<=QUESTIONS.length;i++){
    const opt = el('option',{value:i, text:String(i)});
    if(i === state.rounds) opt.setAttribute('selected','selected');
    select.appendChild(opt);
  }
  select.addEventListener('change', (e)=>{ state.rounds = parseInt(e.target.value); });
  roundsRow.appendChild(select);
  settingsCard.appendChild(roundsRow);
  app.appendChild(settingsCard);

  if(state.error){
    app.appendChild(el('div',{class:'error-text', text: state.error}));
  } else {
    app.appendChild(el('div',{class:'error-text', text: state.playerNames.length < 2 ? 'أضف لاعبين على الأقل (2)' : ''}));
  }

  const startBtn = el('button',{class:'btn-primary', text:'🚀 ابدأ اللعبة'});
  startBtn.disabled = state.playerNames.length < 2;
  startBtn.addEventListener('click', startGame);
  app.appendChild(startBtn);
}

// ----- Play screen (pass-and-play input) -----
function renderPlay(app){
  const qIndex = state.questionOrder[state.currentRound];
  const question = QUESTIONS[qIndex];
  const player = state.players[state.currentPlayerIndex];

  app.appendChild(el('div',{class:'title', text:`السؤال ${state.currentRound+1} من ${state.rounds}`}));
  app.appendChild(el('div',{class:'subtitle', text:'مرر الجهاز للاعب التالي عند طلبه 👇'}));

  const card = el('div',{class:'card'});
  card.appendChild(el('div',{class:'question-category', text:question.category}));
  card.appendChild(el('div',{class:'question-text', text:question.text}));

  const banner = el('div',{class:'turn-banner'},[
    el('div',{class:'who', text:`دور: ${player.name}`}),
    el('div',{class:'progress', text:`لاعب ${state.currentPlayerIndex+1} من ${state.players.length}`})
  ]);
  card.appendChild(banner);

  const input = el('input',{type:'text', class:'answer-input', placeholder:'اكتب إجابتك هنا...'});
  card.appendChild(input);
  app.appendChild(card);

  if(state.error){
    app.appendChild(el('div',{class:'error-text', text: state.error}));
  } else {
    app.appendChild(el('div',{class:'error-text', text:''}));
  }

  const isLast = state.currentPlayerIndex === state.players.length - 1;
  const submitBtn = el('button',{class:'btn-primary', text: isLast ? '✅ كشف النتائج' : '➡️ التالي'});

  function submit(){
    const val = input.value;
    if(!val.trim()){
      state.error = 'الرجاء كتابة إجابة';
      render();
      return;
    }
    state.error = '';
    state.currentAnswers.push({ playerIndex: state.currentPlayerIndex, text: val });

    if(isLast){
      // compute results
      state.lastResults = computeResults(question, state.currentAnswers);
      state.screen = 'reveal';
    } else {
      state.currentPlayerIndex += 1;
    }
    render();
  }

  input.addEventListener('keydown', (e)=>{ if(e.key==='Enter') submit(); });
  submitBtn.addEventListener('click', submit);
  app.appendChild(submitBtn);

  setTimeout(()=> input.focus(), 0);
}

// ----- Reveal screen -----
function renderReveal(app){
  const qIndex = state.questionOrder[state.currentRound];
  const question = QUESTIONS[qIndex];
  const results = state.lastResults;

  app.appendChild(el('div',{class:'title', text:'🎬 الكشف عن النتائج'}));
  app.appendChild(el('div',{class:'subtitle', text: question.text}));

  const card = el('div',{class:'card'});

  const secret = el('div',{class:'secret-reveal'},[
    document.createTextNode('الإجابة الذهبية: '),
    el('span',{class:'gold-word', text: question.golden}),
    document.createTextNode('   |   الإجابة المحظورة: '),
    el('span',{class:'forbidden-word', text: question.forbidden}),
  ]);
  card.appendChild(secret);

  const list = el('div',{class:'results-list'});
  results.forEach(r=>{
    const player = state.players[r.playerIndex];
    const badges = el('div',{class:'badges'});

    if(r.isEmpty){
      badges.appendChild(el('span',{class:'badge invalid', text:'بدون إجابة'}));
    } else {
      if(r.isForbidden) badges.appendChild(el('span',{class:'badge forbidden', text:'🚫 إجابة محظورة'}));
      if(r.isGolden) badges.appendChild(el('span',{class:'badge golden', text:'⭐ إجابة ذهبية'}));
      if(!r.isForbidden){
        badges.appendChild(el('span',{class: 'badge ' + (r.isValid ? 'valid' : 'invalid'), text: r.isValid ? 'صحيحة' : 'غير صحيحة'}));
      }
      if(r.isDup) badges.appendChild(el('span',{class:'badge dup', text:'مكررة'}));
    }

    const scoreClass = r.score > 0 ? 'score-pos' : (r.score < 0 ? 'score-neg' : 'score-zero');
    const scoreText = (r.score > 0 ? '+' : '') + r.score;

    const row = el('div',{class:'result-row'},[
      el('div',{class:'result-left'},[
        el('div',{class:'result-name', text: player.name}),
        el('div',{class:'result-answer', text: '«' + r.text + '»'}),
        badges
      ]),
      el('div',{class:'score-pill ' + scoreClass, text: scoreText})
    ]);
    list.appendChild(row);
  });
  card.appendChild(list);
  app.appendChild(card);

  const nextBtn = el('button',{class:'btn-primary', text: state.currentRound === state.rounds - 1 ? '🏁 عرض النتيجة النهائية' : '📊 عرض الترتيب الحالي'});
  nextBtn.addEventListener('click', ()=>{
    // apply scores
    results.forEach(r=>{
      const p = state.players[r.playerIndex];
      p.score += r.score;
      if(r.isGolden) p.goldenCount += 1;
      if(r.cancelled) p.cancelledCount += 1;
    });
    state.screen = (state.currentRound === state.rounds - 1) ? 'final' : 'leaderboard';
    render();
  });
  app.appendChild(nextBtn);
}

// ----- Leaderboard (between rounds) -----
function renderLeaderboard(app){
  app.appendChild(el('div',{class:'title', text:'📊 الترتيب الحالي'}));
  app.appendChild(el('div',{class:'subtitle', text: `بعد السؤال ${state.currentRound+1} من ${state.rounds}`}));

  const card = el('div',{class:'card'});
  const sorted = [...state.players].sort((a,b)=> b.score - a.score);
  sorted.forEach((p, idx)=>{
    const row = el('div',{class:'leaderboard-row'},[
      el('div',{class:'rank', text: String(idx+1)}),
      el('div',{class:'lb-name'},[
        el('div',{text: p.name}),
        el('div',{class:'lb-meta', text: `⭐ ${p.goldenCount}  •  ملغية ${p.cancelledCount}`})
      ]),
      el('div',{class:'lb-score', text: String(p.score)})
    ]);
    card.appendChild(row);
  });
  app.appendChild(card);

  const nextBtn = el('button',{class:'btn-primary', text:'➡️ السؤال التالي'});
  nextBtn.addEventListener('click', ()=>{
    state.currentRound += 1;
    state.currentPlayerIndex = 0;
    state.currentAnswers = [];
    state.lastResults = null;
    state.screen = 'play';
    render();
  });
  app.appendChild(nextBtn);
}

// ----- Final screen -----
function renderFinal(app){
  app.appendChild(el('div',{class:'title', text:'🏆 النتيجة النهائية'}));

  // determine winners with tie-break
  const maxScore = Math.max(...state.players.map(p=>p.score));
  let topPlayers = state.players.filter(p=>p.score === maxScore);

  if(topPlayers.length > 1){
    const maxGolden = Math.max(...topPlayers.map(p=>p.goldenCount));
    topPlayers = topPlayers.filter(p=>p.goldenCount === maxGolden);
  }
  if(topPlayers.length > 1){
    const minCancelled = Math.min(...topPlayers.map(p=>p.cancelledCount));
    topPlayers = topPlayers.filter(p=>p.cancelledCount === minCancelled);
  }

  app.appendChild(el('div',{class:'trophy', text:'🏆'}));
  if(topPlayers.length === 1){
    app.appendChild(el('div',{class:'winner-name', text: `الفائز: ${topPlayers[0].name}`}));
  } else {
    app.appendChild(el('div',{class:'winner-name', text: `تعادل بين: ${topPlayers.map(p=>p.name).join(' و ')}`}));
  }
  app.appendChild(el('div',{class:'winner-sub', text:'يتم حسم التعادل بعدد الإجابات الذهبية ثم بعدد الإجابات الملغية (الأقل أفضل)'}));

  const card = el('div',{class:'card'});
  const sorted = [...state.players].sort((a,b)=>{
    if(b.score !== a.score) return b.score - a.score;
    if(b.goldenCount !== a.goldenCount) return b.goldenCount - a.goldenCount;
    return a.cancelledCount - b.cancelledCount;
  });
  sorted.forEach((p, idx)=>{
    const isWinner = topPlayers.includes(p);
    const row = el('div',{class:'leaderboard-row' + (isWinner ? ' winner' : '')},[
      el('div',{class:'rank', text: String(idx+1)}),
      el('div',{class:'lb-name'},[
        el('div',{text: p.name + (isWinner ? ' 👑' : '')}),
        el('div',{class:'lb-meta', text: `⭐ ذهبية: ${p.goldenCount}  •  ملغية: ${p.cancelledCount}`})
      ]),
      el('div',{class:'lb-score', text: String(p.score)})
    ]);
    card.appendChild(row);
  });
  app.appendChild(card);

  const restartBtn = el('button',{class:'btn-primary', text:'🔄 لعبة جديدة'});
  restartBtn.addEventListener('click', ()=>{
    state = {
      screen: 'setup',
      playerNames: state.players.map(p=>p.name),
      rounds: state.rounds,
      players: [],
      questionOrder: [],
      currentRound: 0,
      currentPlayerIndex: 0,
      currentAnswers: [],
      lastResults: null,
      error: ''
    };
    render();
  });
  app.appendChild(restartBtn);
}
