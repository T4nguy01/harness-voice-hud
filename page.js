export function mount(el, ctx) {
  const fr = ctx.lang === "fr";
  const T = (a, b) => (fr ? a : b);
  const flex = "display:flex;flex-wrap:wrap;gap:8px;align-items:center";
  el.innerHTML = `
    <div class="ui-page" style="max-width:860px">
      <div style="${flex}"><h1 class="ui-h1" style="margin:0">Voice HUD</h1><span style="flex:1"></span>
        <span class="ui-small ui-muted" data-count></span>
        <button class="ui-btn ui-sm ui-outline" name="cfg">${T("Réglages", "Settings")}</button>
        <button class="ui-btn ui-sm ui-ghost" name="reset">${T("Nouvelle conversation", "New conversation")}</button></div>
      <div class="ui-card" style="margin-top:12px;background:radial-gradient(circle at 50% 30%,#06202e,#02080d);border-color:#0e4a63;color:#bfefff">
        <canvas data-hud aria-hidden="true" style="width:100%;height:240px;display:block"></canvas>
        <div data-state role="status" aria-live="polite" style="text-align:center;letter-spacing:.25em;font-size:12px;color:#5fd8ff;padding-bottom:12px;text-transform:uppercase"></div>
      </div>
      <div class="ui-callout ui-error" data-err role="alert" hidden style="margin-top:12px"></div>
      <div class="ui-stack" data-log role="log" aria-live="off" aria-label="Conversation" style="gap:8px;margin-top:12px;max-height:max(180px,40vh);overflow:auto"></div>
      <form class="ui-row" style="margin-top:12px;gap:8px">
        <button type="button" class="ui-btn ui-outline ui-icon-only" name="mic" aria-pressed="false" aria-label="${T("Parler (Alt+M)", "Talk (Alt+M)")}" title="${T("Parler (Alt+M)", "Talk (Alt+M)")}"></button>
        <input class="ui-input" name="text" autocomplete="off" placeholder="${T("Parlez ou écrivez à l'assistant…", "Talk or write to the assistant…")}" style="flex:1">
        <button type="button" class="ui-btn ui-outline" name="stop" hidden>${T("Couper", "Stop")}</button>
        <button type="button" class="ui-btn ui-outline" name="cancel" hidden>${T("Annuler", "Cancel")}</button>
        <button class="ui-btn" name="send">${T("Envoyer", "Send")}</button>
      </form>
      <div class="ui-card" data-cfg hidden style="margin-top:16px"><div class="ui-stack" style="padding:16px;gap:10px">
        <div style="${flex}">
          <label class="ui-small">${T("Nom", "Name")} <input class="ui-input" name="c_name" style="width:120px"></label>
          <label class="ui-small">${T("Il m'appelle", "Calls me")} <input class="ui-input" name="c_call_user" style="width:120px"></label>
          <label class="ui-small">${T("Langue", "Language")} <select class="ui-select" name="c_lang" style="width:auto">
            <option value="fr-FR">Français</option><option value="en-US">English</option></select></label>
        </div>
        <label class="ui-small">${T("Micro", "Mic")} <select class="ui-select" name="c_stt" style="width:auto">
          <option value="auto">${T("Auto : navigateur, sinon serveur", "Auto: browser, else server")}</option>
          <option value="browser">${T("Navigateur (Google, Chrome/Edge)", "Browser (Google, Chrome/Edge)")}</option>
          <option value="server">${T("Serveur (Whisper de Harness, privé)", "Server (Harness Whisper, private)")}</option></select></label>
        <div class="ui-small ui-muted">${T("Navigateur : l'audio est envoyé au service de reconnaissance du navigateur (Google). Serveur : transcrit par le Whisper de Harness, il ne sort pas du serveur.", "Browser: audio goes to the browser's recognition service (Google). Server: transcribed by Harness Whisper, it stays on the server.")}</div>
        <label class="ui-small">${T("Autonomie", "Autonomy")} <select class="ui-select" name="c_autonomy" style="width:auto">
          <option value="prudent">${T("Prudent : lecture seule, ne modifie rien", "Careful: read-only, changes nothing")}</option>
          <option value="balanced">${T("Équilibré : agit seul sur le réversible", "Balanced: acts alone on reversible things")}</option>
          <option value="auto">${T("Autonome : agit sans demander", "Autonomous: acts without asking")}</option></select></label>
        <div class="ui-small ui-muted">${T("Suppression, redémarrage de service et publication demandent toujours confirmation.", "Deleting, restarting a service and publishing always ask first.")}</div>
        <div style="${flex}">
          <label class="ui-small">${T("Voix", "Voice")} <select class="ui-select" name="c_voice" style="width:auto;max-width:260px"></select></label>
          <label class="ui-small">${T("Vitesse", "Speed")} <input name="c_rate" type="range" min="0.5" max="2" step="0.1" style="width:110px"> <output data-o="rate"></output></label>
          <label class="ui-small">${T("Volume", "Volume")} <input name="c_volume" type="range" min="0.1" max="1" step="0.1" style="width:110px"> <output data-o="volume"></output></label>
          <label class="ui-check" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" name="c_speak"> ${T("Lire les réponses", "Read answers aloud")}</label>
          <label class="ui-small">${T("Plafond/jour", "Daily cap")} <input class="ui-input" name="c_daily_max" type="number" min="1" max="200" style="width:80px"></label>
        </div>
        <div style="${flex}">
          <label class="ui-check" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" name="c_review"> ${T("Valider la dictée avant envoi", "Review dictation before sending")}</label>
          <label class="ui-small">${T("Silence avant fin (ms)", "Silence before end (ms)")} <input class="ui-input" name="c_silence_ms" type="number" min="800" max="5000" step="100" style="width:90px"></label>
        </div>
        <label class="ui-small">${T("Modèle Claude (vide = défaut)", "Claude model (empty = default)")} <input class="ui-input" name="c_model" placeholder="claude-sonnet-5-5" style="width:200px"></label>
        <div class="ui-small ui-muted" data-voicehint>${T("Sur mobile la voix suit celle de l'appareil ; la synthèse ne démarre qu'après un premier clic.", "On mobile the voice follows the device; speech only starts after a first tap.")}</div>
        <div style="${flex}">
          <label class="ui-small">${T("Historique conservé", "History kept")} <select class="ui-select" name="c_retention_days" style="width:auto">
            <option value="0">${T("Aucun", "None")}</option><option value="1">${T("1 jour", "1 day")}</option><option value="7">${T("7 jours", "7 days")}</option>
            <option value="30">${T("30 jours", "30 days")}</option><option value="365">${T("1 an", "1 year")}</option></select></label>
          <label class="ui-check" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" name="c_fresh"> ${T("Sans mémoire entre les messages", "No memory between messages")}</label>
        </div>
        <div class="ui-callout ui-error" data-noclaude hidden>${T("La commande « claude » est introuvable sur le serveur : l'assistant ne pourra pas répondre.", "The 'claude' command was not found on the server: the assistant cannot answer.")}</div>
        <div style="${flex}"><button class="ui-btn ui-sm ui-outline" name="test">${T("Tester la voix", "Test voice")}</button>
          <button class="ui-btn ui-sm ui-ghost" name="export">${T("Exporter", "Export")}</button>
          <button class="ui-btn ui-sm ui-ghost" name="import">${T("Importer", "Import")}</button><input type="file" name="importfile" accept="application/json" hidden>
          <button class="ui-btn ui-sm ui-ghost" name="defaults">${T("Valeurs par défaut", "Restore defaults")}</button>
          <span class="ui-small ui-muted" data-saved role="status">${T("Enregistrement automatique", "Saved automatically")}</span></div>
      </div></div>
      <style>@media (forced-colors:active){[data-state]{color:CanvasText!important}}</style>
    </div>`;
  const q = (s) => el.querySelector(s);
  const form = q("form"), log = q("[data-log]"), err = q("[data-err]"), stateEl = q("[data-state]");
  const cfgBox = q("[data-cfg]"), mic = q("[name=mic]"), canvas = q("[data-hud]");
  mic.append(ctx.icon("mic"));
  let settings = {}, mode = "idle", dead = false, rec = null, pollTimer = null, voices = [], gen = 0, utter = null, micBusy = false;
  const sendBtn = q("[name=send]"), stopBtn = q("[name=stop]"), cancelBtn = q("[name=cancel]");
  let elapsedTimer = null, curJob = null;
  const setMode = (m) => {
    mode = m;
    sendBtn.disabled = m === "thinking";
    stopBtn.hidden = m !== "speaking";
    cancelBtn.hidden = m !== "thinking";
    mic.setAttribute("aria-pressed", String(m === "listening"));
    stateEl.textContent = { idle: T("En veille", "Standby"), listening: T("Je vous écoute", "Listening"), thinking: T("Analyse en cours", "Thinking"), speaking: T("Je vous réponds", "Speaking") }[m];
  };
  const showErr = (m) => { err.hidden = !m; err.textContent = m || ""; };
  const micErr = (c) => ({
    "not-allowed": T("accès au micro refusé (autorisez-le dans le navigateur)", "microphone access denied (allow it in the browser)"),
    "service-not-allowed": T("reconnaissance vocale non autorisée", "speech recognition not allowed"),
    "audio-capture": T("aucun micro détecté", "no microphone found"),
    "language-not-supported": T("langue non prise en charge", "language not supported"),
  })[c] || c;
  const clamp = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
  const bubble = (role, text, opts = {}) => {
    const d = document.createElement("div");
    d.className = "ui-text";
    d.style.cssText = `padding:8px 12px;border-radius:10px;max-width:85%;${role === "user" ? "align-self:flex-end;background:var(--muted)" : "align-self:flex-start;border:1px solid var(--border)"}`;
    d.textContent = text;
    // question de confirmation : boutons Oui / Non (plus fiable qu'un "oui" dicté)
    if (opts.confirm) {
      const row = document.createElement("div");
      row.style.cssText = "display:flex;gap:6px;margin-top:8px";
      for (const lab of [T("Oui", "Yes"), T("Non", "No")]) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "ui-btn ui-sm ui-outline"; b.textContent = lab;
        b.addEventListener("click", () => { row.remove(); form.text.focus(); ask(lab); });
        row.append(b);
      }
      d.append(row);
    }
    log.append(d);
    log.scrollTop = log.scrollHeight;
  };
  const refreshCount = (n, max) => { q("[data-count]").textContent = `${n}/${max} ${T("aujourd'hui", "today")}`; };

  // --- voice out
  const synth = window.speechSynthesis;
  const vkey = (v) => v.voiceURI || v.name;
  const loadVoices = () => {
    voices = synth ? synth.getVoices() : [];
    const sel = q("[name=c_voice]");
    const lang = (settings.lang || "fr-FR").slice(0, 2);
    sel.replaceChildren(new Option(T("Automatique", "Automatic"), ""),
      ...voices.filter((v) => v.lang.toLowerCase().startsWith(lang)).map((v) => new Option(`${v.name} (${v.lang})`, vkey(v))));
    sel.value = settings.voice || "";
    if (settings.voice && sel.value !== settings.voice && voices.length) sel.title = T("Voix enregistrée introuvable sur cet appareil : voix automatique utilisée", "Saved voice not found on this device: automatic voice used");
  };
  if (synth) { synth.onvoiceschanged = loadVoices; loadVoices(); [1500, 4000].forEach((ms) => setTimeout(() => { if (!dead && !voices.length) loadVoices(); }, ms)); }
  const speak = (text, force, over = {}) => {
    if (!synth || (!settings.speak && !force)) { setMode("idle"); return; }
    synth.cancel();
    const token = (utter = {});
    const parts = [];
    for (const sent of text.match(/[^.!?\n]+[.!?]*\s*/g) || [text]) {
      let cur = "";
      for (const w of sent.trim().split(/\s+/)) {
        if (cur && (cur + " " + w).length > 220) { parts.push(cur); cur = w; } else cur = cur ? cur + " " + w : w;
      }
      if (cur) parts.push(cur);
    }
    const voice = voices.find((x) => vkey(x) === (over.voice ?? settings.voice));
    let i = 0;
    const next = () => {
      if (dead || utter !== token) return;
      if (i >= parts.length) { setMode("idle"); return; }
      const chunk = parts[i++];
      const u = new SpeechSynthesisUtterance(chunk);
      let done = false;
      const step = () => { if (done) return; done = true; clearTimeout(wd); next(); };
      // Chrome peut ne jamais déclencher onend (voix réseau > ~15 s) : garde-fou
      const wd = setTimeout(() => { if (utter === token) { synth.cancel(); step(); } }, 4000 + chunk.length * 110 / clamp(over.rate ?? settings.rate, 0.5, 2, 1));
      u.lang = settings.lang || "fr-FR";
      u.rate = clamp(over.rate ?? settings.rate, 0.5, 2, 1);
      u.volume = clamp(over.volume ?? settings.volume, 0.1, 1, 1);
      u.pitch = 1;
      if (voice) u.voice = voice;
      u.onstart = () => { if (utter === token && mode !== "thinking") setMode("speaking"); };
      u.onend = step;
      u.onerror = () => { clearTimeout(wd); if (utter === token && !dead && !done) { done = true; setMode("idle"); } };
      synth.speak(u);
    };
    next();
  };
  const stopSpeech = () => { utter = null; if (synth) synth.cancel(); };

  // --- ask
  const POLL_MAX = 330000; // le serveur abandonne à 300 s
  const ask = async (text) => {
    text = text.trim();
    if (!text || mode === "thinking" || dead) return;
    showErr("");
    stopSpeech();
    bubble("user", text);
    setMode("thinking");
    const my = ++gen, t0 = Date.now();
    let fails = 0;
    clearInterval(elapsedTimer);
    elapsedTimer = setInterval(() => {
      if (mode !== "thinking") { clearInterval(elapsedTimer); return; }
      const sec = Math.round((Date.now() - t0) / 1000);
      stateEl.textContent = T("Analyse en cours", "Thinking") + (sec >= 5 ? ` · ${sec} s` : "");
    }, 1000);
    const alive = () => !dead && my === gen;
    try {
      const { job } = await ctx.api("ask", { method: "POST", body: { text } });
      curJob = job;
      const poll = async () => {
        if (!alive()) return;
        if (Date.now() - t0 > POLL_MAX) { showErr(T("Pas de réponse (délai dépassé).", "No answer (timed out).")); setMode("idle"); return; }
        try {
          const j = await ctx.api(`job/${job}`);
          fails = 0;
          if (!alive()) return;
          if (j.status === "running") { pollTimer = setTimeout(poll, 1500); return; }
          if (j.status === "done") { bubble("assistant", j.reply, { confirm: !!j.confirm }); speak(j.reply); }
          else if (j.status === "cancelled") setMode("idle");
          else { showErr(j.error || T("Échec", "Failed")); setMode("idle"); }
          ctx.api("history").then((h) => alive() && refreshCount(h.today, h.max)).catch(() => {});
        } catch (e) {
          if (!alive()) return;
          if (++fails < 4) { pollTimer = setTimeout(poll, 2000); return; }
          showErr(String(e.message || e)); setMode("idle");
        }
      };
      poll();
    } catch (e) { if (alive()) { showErr(String(e.message || e)); setMode("idle"); } }
  };

  cancelBtn.addEventListener("click", async () => {
    const job = curJob; gen++; clearTimeout(pollTimer); setMode("idle");
    if (job) { try { await ctx.api(`job/${job}/cancel`, { method: "POST", body: {} }); } catch (e) { showErr(String(e.message || e)); } }
    form.text.focus();
  });
  stopBtn.addEventListener("click", () => { stopSpeech(); setMode("idle"); });
  const onEsc = (e) => { if (e.key === "Escape" && mode === "speaking") { stopSpeech(); setMode("idle"); } };
  document.addEventListener("keydown", onEsc);
  // dictée : envoi direct, ou relecture dans le champ si "valider avant envoi"
  const deliver = (t) => {
    if (settings.review) { form.text.value = t; form.text.focus(); setMode("idle"); } else ask(t);
  };

  // --- voice in: browser recognition (Google) or recording sent to the server's Whisper (Settings -> Voice)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canRecord = !!(navigator.mediaDevices && window.MediaRecorder);
  let forceServer = false, recorder = null;
  if (!SR && !canRecord) { mic.disabled = true; mic.title = T("Micro indisponible (HTTPS requis)", "Mic unavailable (HTTPS required)"); }
  const useServer = () => canRecord && (settings.stt === "server" || forceServer || (!SR && settings.stt !== "browser"));
  const serverMic = async () => {
    if (recorder) { recorder.stop(); return; }
    if (micBusy) return;
    micBusy = true;
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { micBusy = false; showErr(T("Micro refusé ou indisponible (HTTPS requis) : ", "Mic denied or unavailable (HTTPS required): ") + e.name); return; }
    micBusy = false;
    if (dead) { stream.getTracks().forEach((t) => t.stop()); return; }
    const chunks = [];
    try { recorder = new MediaRecorder(stream); }
    catch (e) { stream.getTracks().forEach((t) => t.stop()); showErr(T("Enregistrement impossible : ", "Cannot record: ") + e.name); return; }
    const recorder0 = recorder;
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstart = () => setMode("listening");
    // auto-stop: 1.8 s of silence after speech, or 45 s at most
    let ac = null, tick = null;
    try {
      ac = new AudioContext();
      if (ac.state === "suspended") ac.resume().catch(() => {});
      const an = ac.createAnalyser(); an.fftSize = 1024;
      ac.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize);
      let spoke = false, quiet = performance.now(), noise = 0;
      const t0 = quiet, silence = clamp(settings.silence_ms, 800, 5000, 1800);
      tick = setInterval(() => {
        an.getByteTimeDomainData(buf);
        let lvl = 0;
        for (let i = 0; i < buf.length; i++) { const d = Math.abs(buf[i] - 128); if (d > lvl) lvl = d; }
        const now = performance.now();
        if (now - t0 < 500) noise = Math.max(noise, lvl); // calibrage du bruit de fond
        const thr = Math.max(12, noise * 2 + 4);
        if (lvl > thr) { spoke = true; quiet = now; }
        if ((spoke && now - quiet > silence) || now - t0 > 45000) recorder && recorder.state === "recording" && recorder.stop();
      }, 150);
    } catch (e) { /* manual stop only */ }
    recorder.onstop = async () => {
      clearInterval(tick); if (ac) ac.close();
      stream.getTracks().forEach((t) => t.stop());
      recorder = null;
      if (dead) return;
      setMode("thinking");
      try {
        const fd = new FormData();
        const mime = chunks[0]?.type || recorder0.mimeType || "audio/webm";
        const ext = /mp4|aac/.test(mime) ? "m4a" : /ogg/.test(mime) ? "ogg" : /wav/.test(mime) ? "wav" : "webm";
        fd.append("audio", new Blob(chunks, { type: mime }), `voice.${ext}`);
        fd.append("language", (settings.lang || "fr-FR").slice(0, 2));
        const r = await fetch("/api/voice/transcribe", { method: "POST", body: fd, headers: { "X-Maxxing": "1" }, credentials: "same-origin" });
        const j = await r.json().catch(() => ({}));
        if (dead) return;
        if (!r.ok) throw new Error(j.message || j.error || r.status);
        if (j.text && j.text.trim()) { setMode("idle"); deliver(j.text.trim()); }
        else { showErr(T("Je n'ai rien entendu (parlez plus près du micro, puis attendez la fin).", "Heard nothing (speak closer to the mic, then wait).")); setMode("idle"); }
      } catch (e) { if (dead) return; showErr(T("Transcription : ", "Transcription: ") + (e.message || e) + T(" (Settings -> Voix doit être activé)", " (enable Settings -> Voice)")); setMode("idle"); }
    };
    recorder.start();
  };
  const browserMic = () => {
    if (rec) { rec.stop(); return; }
    stopSpeech();
    rec = new SR();
    rec.lang = settings.lang || "fr-FR";
    rec.interimResults = true;
    let finalText = "", failed = false;
    rec.onstart = () => setMode("listening");
    rec.onresult = (e) => {
      let t = "";
      for (const r of e.results) { t += r[0].transcript; if (r.isFinal) finalText = t; }
      form.text.value = t;
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      failed = true;
      if (["network", "service-not-allowed", "language-not-supported"].includes(e.error) && canRecord && settings.stt !== "browser") {
        forceServer = true;
        showErr(T("Reconnaissance Google injoignable : bascule sur le micro du serveur, recliquez sur le micro.", "Google recognition unreachable: switched to the server mic, click the mic again."));
      } else showErr(T("Micro : ", "Mic: ") + micErr(e.error));
    };
    rec.onend = () => {
      rec = null;
      if (dead) return;
      const t = (finalText || form.text.value).trim();
      if (t && !failed) { form.text.value = ""; deliver(t); } else setMode("idle");
    };
    try { rec.start(); } catch (e) { rec = null; setMode("idle"); showErr(T("Micro : ", "Mic: ") + (e.message || e)); }
  };
  const toggleMic = () => { showErr(""); stopSpeech(); return useServer() ? serverMic() : browserMic(); };
  mic.addEventListener("click", toggleMic);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (mode === "thinking" || !form.text.value.trim()) return; // la saisie est conservée
    const t = form.text.value; form.text.value = ""; ask(t);
  });
  const onKey = (e) => { if (e.altKey && e.key.toLowerCase() === "m" && !mic.disabled) { e.preventDefault(); toggleMic(); } };
  document.addEventListener("keydown", onKey);

  // --- settings: every change is saved by itself (debounced), the server's cleaned values come back
  const KEYS = ["name", "call_user", "lang", "autonomy", "stt", "rate", "volume", "daily_max", "model", "retention_days", "silence_ms"];
  const savedEl = q("[data-saved]");
  const fill = () => {
    for (const k of KEYS) { const f = q(`[name=c_${k}]`); if (f !== document.activeElement) f.value = settings[k] ?? ""; }
    q("[name=c_speak]").checked = !!settings.speak;
    q("[name=c_fresh]").checked = !!settings.fresh;
    q("[name=c_review]").checked = !!settings.review;
    for (const o of el.querySelectorAll("[data-o]")) o.textContent = settings[o.dataset.o];
    loadVoices();
  };
  const collect = () => {
    const body = { speak: q("[name=c_speak]").checked, fresh: q("[name=c_fresh]").checked, review: q("[name=c_review]").checked, voice: q("[name=c_voice]").value };
    for (const k of KEYS) body[k] = q(`[name=c_${k}]`).value;
    body.silence_ms = Math.round(clamp(body.silence_ms, 800, 5000, 1800));
    body.rate = clamp(body.rate, 0.5, 2, 1);
    body.daily_max = Math.round(clamp(body.daily_max, 1, 500, 40));
    return body;
  };
  const note = (t) => { savedEl.textContent = t; };
  let saveTimer = null;
  let seq = 0;
  const save = async () => {
    const mine = ++seq;
    try {
      const r = await ctx.api("settings", { method: "POST", body: collect() });
      if (mine !== seq) return; // a newer save is in flight
      settings = r.settings; fill(); refreshCount(r.today, settings.daily_max);
      note(T("Enregistré ✓", "Saved ✓"));
    } catch (e) { note(T("Échec : ", "Failed: ") + (e.message || e)); }
  };
  const later = () => { note("…"); clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveTimer = null; save(); }, 500); };
  q("[data-cfg]").addEventListener("input", later);
  q("[data-cfg]").addEventListener("change", later);
  // another tab may have changed the settings: re-read them when this one comes back
  const onVis = () => { if (!document.hidden && !saveTimer) ctx.api("settings").then((r) => { settings = r.settings; fill(); refreshCount(r.today, settings.daily_max); }).catch(() => {}); };
  document.addEventListener("visibilitychange", onVis);
  q("[name=cfg]").addEventListener("click", () => { cfgBox.hidden = !cfgBox.hidden; });
  q("[name=c_lang]").addEventListener("change", (e) => { settings.lang = e.target.value; settings.voice = ""; loadVoices(); });
  q("[name=test]").addEventListener("click", () => {
    speak(T("Tous les systèmes sont opérationnels.", "All systems operational."), true,
      { voice: q("[name=c_voice]").value, rate: q("[name=c_rate]").value, volume: q("[name=c_volume]").value });
  });
  for (const n of ["rate", "volume"]) q(`[name=c_${n}]`).addEventListener("input", (e) => { q(`[data-o=${n}]`).textContent = e.target.value; });
  q("[name=export]").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" }));
    a.download = "voice-hud-settings.json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  q("[name=import]").addEventListener("click", () => q("[name=importfile]").click());
  q("[name=importfile]").addEventListener("change", async (e) => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    try {
      const r = await ctx.api("settings", { method: "POST", body: JSON.parse(await f.text()) });
      settings = r.settings; fill(); note(T("Réglages importés ✓", "Settings imported ✓"));
    } catch (x) { note(T("Fichier invalide : ", "Invalid file: ") + (x.message || x)); }
  });
  // confirmation en deux clics (pas de confirm() natif)
  const twoClick = (btn, msg, fn) => {
    const label = btn.textContent; let armed = null;
    btn.addEventListener("click", () => {
      if (!armed) { btn.textContent = msg; armed = setTimeout(() => { armed = null; btn.textContent = label; }, 4000); return; }
      clearTimeout(armed); armed = null; btn.textContent = label; fn();
    });
  };
  twoClick(q("[name=defaults]"), T("Confirmer ?", "Confirm?"), async () => {
    clearTimeout(saveTimer); seq++;
    try {
      const r = await ctx.api("settings", { method: "DELETE" });
      settings = r.settings; fill(); note(T("Valeurs par défaut rétablies ✓", "Defaults restored ✓"));
    } catch (e) { note(T("Échec : ", "Failed: ") + (e.message || e)); }
  });
  twoClick(q("[name=reset]"), T("Effacer ?", "Clear?"), async () => {
    gen++; clearInterval(elapsedTimer); clearTimeout(pollTimer); stopSpeech();
    try { await ctx.api("reset", { method: "POST", body: {} }); }
    catch (e) { showErr(String(e.message || e)); return; }
    log.replaceChildren(); showErr(""); setMode("idle");
  });

  // --- HUD animation
  const g = canvas.getContext("2d");
  let raf = 0, lastTs = 0, W = 0, H = 0;
  const reduced = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const fit = () => {
    W = Math.round(canvas.clientWidth * devicePixelRatio); H = Math.round(canvas.clientHeight * devicePixelRatio);
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;
  };
  const ro = window.ResizeObserver ? new ResizeObserver(fit) : null;
  if (ro) ro.observe(canvas);
  fit();
  const draw = (ts) => {
    raf = requestAnimationFrame(draw);
    if (document.hidden || ts - lastTs < (mode === "idle" ? 66 : 16)) return; // ~15 fps en veille
    lastTs = ts;
    if (!ro) fit();
    const w = W, h = H;
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38, t = ts / 1000;
    const k = reduced ? 0.05 : { idle: 0.25, listening: 1, thinking: 1.6, speaking: 1.2 }[mode];
    g.clearRect(0, 0, w, h);
    const col = (a) => `rgba(95,216,255,${a})`;
    g.lineWidth = 2 * devicePixelRatio;
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      const r = R * (0.55 + i * 0.22), rot = t * k * (i % 2 ? -1 : 1) * (0.6 + i * 0.3);
      g.setLineDash([r * 0.5, r * 0.18]);
      g.lineDashOffset = rot * r;
      g.strokeStyle = col(0.9 - i * 0.2);
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
    }
    g.setLineDash([]);
    const pulse = 1 + Math.sin(t * 3 * k) * 0.12 * (mode === "idle" ? 0.4 : 1);
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5 * pulse);
    grad.addColorStop(0, "rgba(255,255,255,.95)"); grad.addColorStop(0.35, col(0.8)); grad.addColorStop(1, col(0));
    g.fillStyle = grad; g.beginPath(); g.arc(cx, cy, R * 0.5 * pulse, 0, Math.PI * 2); g.fill();
    if (mode === "speaking" || mode === "listening") {
      g.strokeStyle = col(0.8); g.beginPath();
      for (let x = 0; x <= 1; x += 0.01) {
        const px = cx - R * 1.9 + x * R * 3.8, env = Math.sin(x * Math.PI);
        const py = cy + Math.sin(x * 40 + t * 12) * Math.sin(t * 7 + x * 9) * R * 0.28 * env;
        x ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.stroke();
    }
  };

  setMode("idle");
  raf = requestAnimationFrame(draw);
  ctx.api("settings").then((r) => { settings = r.settings; fill(); q("[data-noclaude]").hidden = r.claude_ok !== false; }).catch((e) => showErr(String(e.message || e)));
  ctx.api("history").then((h) => { h.history.forEach((m) => bubble(m.role, m.text)); refreshCount(h.today, h.max); }).catch(() => {}).finally(() => log.setAttribute("aria-live", "polite"));

  return () => { dead = true; cancelAnimationFrame(raf); clearTimeout(pollTimer); clearInterval(elapsedTimer); document.removeEventListener("keydown", onEsc); if (saveTimer) { clearTimeout(saveTimer); save(); } document.removeEventListener("visibilitychange", onVis); document.removeEventListener("keydown", onKey); if (ro) ro.disconnect(); if (rec) rec.abort(); if (recorder && recorder.state !== "inactive") recorder.stop(); stopSpeech(); };
}
