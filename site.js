function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function toast(el, msg){
  el.textContent = msg;
  el.style.color = "#6b4a5b";
}

function scoreBadge(el, score, total){
  el.innerHTML = `Score: <strong>${score}</strong> / ${total} ✨`;
}

function setupTrueFalseGame(rootId, questions){
  const root = document.getElementById(rootId);
  if(!root) return;

  const out = root.querySelector(".gameOut");
  const result = root.querySelector(".result");
  let score = 0, done = 0;

  out.innerHTML = questions.map((q,i)=>`
    <div class="q" data-i="${i}">
      <strong>❄️ ${q.text}</strong>
      <div class="choices">
        <button class="btn secondary" data-a="true">True</button>
        <button class="btn secondary" data-a="false">False</button>
      </div>
    </div>
  `).join("");

  out.addEventListener("click", (e)=>{
    const btn = e.target.closest("button");
    if(!btn) return;
    const row = e.target.closest(".q");
    if(!row || row.dataset.done === "1") return;

    const i = Number(row.dataset.i);
    const ans = (btn.dataset.a === "true");
    row.dataset.done = "1";

    const correct = (ans === questions[i].correct);
    if(correct) score++;

    done++;
    row.style.outline = correct ? "2px solid rgba(0,0,0,.12)" : "2px solid rgba(255,79,163,.35)";
    row.querySelectorAll("button").forEach(b=>b.disabled=true);

    toast(result, correct ? "Slay! ✅ That’s correct." : `Not this time 💗 Correct answer: ${questions[i].correct ? "True" : "False"}.`);
    if(done === questions.length){
      scoreBadge(result, score, questions.length);
    }
  });
}

function setupTapQuiz(rootId, questions){
  const root = document.getElementById(rootId);
  if(!root) return;

  const out = root.querySelector(".gameOut");
  const result = root.querySelector(".result");
  let score = 0, done = 0;

  out.innerHTML = questions.map((q,i)=>`
    <div class="q" data-i="${i}">
      <strong>🚨 ${q.prompt}</strong>
      <div class="choices">
        ${q.choices.map((c,ci)=>`<button class="btn secondary" data-ci="${ci}">${c}</button>`).join("")}
      </div>
    </div>
  `).join("");

  out.addEventListener("click", (e)=>{
    const btn = e.target.closest("button");
    if(!btn) return;
    const row = e.target.closest(".q");
    if(row.dataset.done === "1") return;

    const i = Number(row.dataset.i);
    const ci = Number(btn.dataset.ci);
    row.dataset.done = "1";

    const correct = (ci === questions[i].correctIndex);
    if(correct) score++;
    done++;

    row.querySelectorAll("button").forEach(b=>b.disabled=true);
    toast(result, correct ? "Correct! ✨" : `Almost — answer: ${questions[i].choices[questions[i].correctIndex]} 💗`);

    if(done === questions.length){
      scoreBadge(result, score, questions.length);
    }
  });
}

function setupChecklistGame(rootId, items){
  const root = document.getElementById(rootId);
  if(!root) return;

  const out = root.querySelector(".gameOut");
  const result = root.querySelector(".result");

  out.innerHTML = items.map((it,i)=>`
    <label class="q" style="justify-content:flex-start; gap:10px;">
      <input type="checkbox" data-i="${i}" />
      <strong>${it}</strong>
    </label>
  `).join("");

  root.querySelector(".finishBtn").addEventListener("click", ()=>{
    const checked = $all("input[type=checkbox]", out).filter(c=>c.checked).length;
    scoreBadge(result, checked, items.length);
    toast(result, checked >= 4 ? "You’re a Hormone Hero! 🦸‍♀️💗" : "Nice start — try checking a few more habits! ✨");
  });
}
