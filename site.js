/* =========================================================
   Hormone Adventure — Shared Games Script (site.js)
   Works with:
   - setupTrueFalseGame("gameId", [{q:"...", a:true/false}, ...])
   - setupMultipleChoiceGame("gameId", [{q:"...", options:[...], a:index}, ...])
   - setupChecklistGame("gameId", ["item 1", "item 2", ...])
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showResult(container, msg, mode) {
  const el = container.querySelector(".result");
  if (!el) return;

  el.textContent = msg;

  // Optional styling based on outcome
  el.classList.remove("ok", "bad", "info");
  if (mode) el.classList.add(mode);
}

function ensureGameContainer(containerId) {
  const root = $(containerId);
  if (!root) return null;

  const out = root.querySelector(".gameOut");
  if (!out) return null;

  return { root, out };
}

/* =========================
   TRUE / FALSE GAME
   ========================= */
function setupTrueFalseGame(containerId, questions) {
  const pack = ensureGameContainer(containerId);
  if (!pack) return;

  const { root, out } = pack;

  let score = 0;
  let answered = 0;

  out.innerHTML = "";

  const list = document.createElement("div");
  list.className = "qList";

  questions.forEach((item, idx) => {
    const qWrap = document.createElement("div");
    qWrap.className = "qCard";
    qWrap.dataset.answered = "false";

    qWrap.innerHTML = `
      <div class="qTitle"><strong>Q${idx + 1}.</strong> ${escapeHtml(item.q)}</div>
      <div class="qBtns" style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
        <button class="btn tfBtn" data-choice="true">True</button>
        <button class="btn tfBtn" data-choice="false">False</button>
      </div>
      <div class="small feedback" style="margin-top:10px;"></div>
    `;

    const feedback = qWrap.querySelector(".feedback");
    const btns = qWrap.querySelectorAll(".tfBtn");

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (qWrap.dataset.answered === "true") return;

        qWrap.dataset.answered = "true";
        answered++;

        const picked = btn.dataset.choice === "true";
        const correct = !!item.a;

        if (picked === correct) {
          score++;
          feedback.textContent = "✅ Correct!";
        } else {
          feedback.textContent = `❌ Not quite. The correct answer is ${correct ? "True" : "False"}.`;
        }

        // disable both
        btns.forEach(b => b.disabled = true);

        if (answered === questions.length) {
          showResult(root, `Score: ${score}/${questions.length} 💗`, "ok");
        } else {
          showResult(root, `Progress: ${answered}/${questions.length}`, "info");
        }
      });
    });

    list.appendChild(qWrap);
  });

  out.appendChild(list);
  showResult(root, "Click True/False to start 💗", "info");
}

/* =========================
   MULTIPLE CHOICE GAME
   =========================
   questions: [{ q:"...", options:["A","B","C"], a:2 }, ...]
   a = index of correct option
   ========================= */
function setupMultipleChoiceGame(containerId, questions) {
  const pack = ensureGameContainer(containerId);
  if (!pack) return;

  const { root, out } = pack;

  let score = 0;
  let answered = 0;

  out.innerHTML = "";

  const list = document.createElement("div");
  list.className = "qList";

  questions.forEach((item, idx) => {
    const qWrap = document.createElement("div");
    qWrap.className = "qCard";
    qWrap.dataset.answered = "false";

    const optionsHtml = item.options
      .map((opt, i) => {
        return `<button class="btn mcBtn" data-index="${i}" style="text-align:left;">${escapeHtml(opt)}</button>`;
      })
      .join("");

    qWrap.innerHTML = `
      <div class="qTitle"><strong>Q${idx + 1}.</strong> ${escapeHtml(item.q)}</div>
      <div class="qBtns" style="display:grid; gap:10px; margin-top:10px;">
        ${optionsHtml}
      </div>
      <div class="small feedback" style="margin-top:10px;"></div>
    `;

    const feedback = qWrap.querySelector(".feedback");
    const btns = qWrap.querySelectorAll(".mcBtn");

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (qWrap.dataset.answered === "true") return;

        qWrap.dataset.answered = "true";
        answered++;

        const picked = Number(btn.dataset.index);
        const correct = Number(item.a);

        if (picked === correct) {
          score++;
          feedback.textContent = "✅ Correct!";
        } else {
          const correctText = item.options?.[correct] ?? "the correct answer";
          feedback.textContent = `❌ Not quite. Correct answer: ${correctText}.`;
        }

        btns.forEach(b => b.disabled = true);

        if (answered === questions.length) {
          showResult(root, `Score: ${score}/${questions.length} 💗`, "ok");
        } else {
          showResult(root, `Progress: ${answered}/${questions.length}`, "info");
        }
      });
    });

    list.appendChild(qWrap);
  });

  out.appendChild(list);
  showResult(root, "Choose an answer to start 💗", "info");
}

/* =========================
   CHECKLIST GAME
   =========================
   items: ["thing 1", "thing 2", ...]
   We'll score "good" items vs "not a hero habit" items.
   Rule:
   - If the text contains "(not a hero habit)" => it's WRONG to check.
   - Otherwise it's RIGHT to check.
   ========================= */
function setupChecklistGame(containerId, items) {
  const pack = ensureGameContainer(containerId);
  if (!pack) return;

  const { root, out } = pack;

  out.innerHTML = "";

  const list = document.createElement("div");
  list.className = "checkList";
  list.style.display = "grid";
  list.style.gap = "10px";
  list.style.marginTop = "10px";

  const normalized = items.map((text) => {
    const isBad = text.toLowerCase().includes("(not a hero habit)");
    return { text, isBad };
  });

  normalized.forEach((it, idx) => {
    const row = document.createElement("label");
    row.className = "checkRow";
    row.style.display = "flex";
    row.style.gap = "10px";
    row.style.alignItems = "flex-start";
    row.style.padding = "10px";
    row.style.borderRadius = "14px";
    row.style.background = "rgba(255,255,255,.75)";
    row.style.border = "1px solid rgba(255,79,163,.18)";

    row.innerHTML = `
      <input type="checkbox" data-idx="${idx}" style="margin-top:3px;">
      <span class="small">${escapeHtml(it.text)}</span>
    `;

    list.appendChild(row);
  });

  out.appendChild(list);

  const finishBtn = root.querySelector(".finishBtn");
  if (!finishBtn) {
    // If there's no button, still show something helpful
    showResult(root, "Checklist loaded 💗", "info");
    return;
  }

  finishBtn.addEventListener("click", () => {
    const checks = Array.from(root.querySelectorAll('input[type="checkbox"]'));

    let correct = 0;
    let total = normalized.length;

    checks.forEach((cb) => {
      const i = Number(cb.dataset.idx);
      const item = normalized[i];

      const shouldCheck = !item.isBad;   // good habits should be checked
      const didCheck = cb.checked;

      if (didCheck === shouldCheck) correct++;
    });

    const percent = Math.round((correct / total) * 100);

    let msg = `Hero Score: ${correct}/${total} (${percent}%) 💗`;

    if (percent >= 90) msg += " — LEGENDARY HERO!";
    else if (percent >= 75) msg += " — Super strong hero!";
    else if (percent >= 60) msg += " — Nice! Keep going!";
    else msg += " — You’re learning! Try again ✨";

    showResult(root, msg, "ok");
  });

  showResult(root, "Check the habits, then click the button ✨", "info");
}

/* =========================
   OPTIONAL: Auto-safe start
   If you forget to add a game, the site still runs without errors.
   ========================= */
window.addEventListener("error", () => {
  // Intentionally quiet — prevents scary console errors for beginners.
});
