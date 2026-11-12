import importlib.util, json, pathlib, tempfile, threading, time

_p = pathlib.Path(__file__).resolve().parent.parent / "api.py"
_sp = importlib.util.spec_from_file_location("voice_hud_api_job", _p)
api = importlib.util.module_from_spec(_sp)
_sp.loader.exec_module(api)  # fresh copy: other tests replace api._run


def ctx():
    return {"state_dir": tempfile.mkdtemp(), "workspace": "/tmp"}


class FakeProc:
    def __init__(self, out="", block=None):
        self.out, self.block, self.killed = out, block, False

    def communicate(self, timeout=None):
        if self.block:
            self.block.wait(5)
        return self.out, ""

    def poll(self):
        return -9 if self.killed else None

    def kill(self):
        self.killed = True
        if self.block:
            self.block.set()


def ask(c, monkeypatch, proc):
    api.JOBS.clear(); api.PROCS.clear(); api.LAST[0] = 0
    monkeypatch.setattr(api.subprocess, "Popen", lambda *a, **k: proc)
    r = api.handle(c, "POST", "ask", {}, {"text": "salut"})
    return r["job"]


def wait(c, job, status_not="running"):
    for _ in range(100):
        r = api.handle(c, "GET", f"job/{job}", {}, None)
        if r["status"] != status_not:
            return r
        time.sleep(0.02)
    return r


def test_confirm_marker_stripped(monkeypatch):
    c = ctx()
    out = json.dumps({"result": "Je supprime le fichier ? [[CONFIRM]]", "session_id": "s1"})
    job = ask(c, monkeypatch, FakeProc(out))
    r = wait(c, job)
    assert r == {"status": "done", "reply": "Je supprime le fichier ?", "confirm": True}
    h = api.handle(c, "GET", "history", {}, None)["history"]
    assert h[-1]["text"] == "Je supprime le fichier ?" and h[-1]["confirm"] is True and "CONFIRM" not in json.dumps(h)


def test_no_marker(monkeypatch):
    c = ctx()
    job = ask(c, monkeypatch, FakeProc(json.dumps({"result": "Quel fichier ?"})))
    assert wait(c, job)["confirm"] is False


def test_running_has_started(monkeypatch):
    c = ctx(); ev = threading.Event()
    job = ask(c, monkeypatch, FakeProc("{}", ev))
    r = api.handle(c, "GET", f"job/{job}", {}, None)
    assert r["status"] == "running" and isinstance(r["started"], int)
    api.handle(c, "POST", f"job/{job}/cancel", {}, None)


def test_cancel(monkeypatch):
    c = ctx(); ev = threading.Event()
    proc = FakeProc(json.dumps({"result": "tard"}), ev)
    job = ask(c, monkeypatch, proc)
    time.sleep(0.1)
    assert api.handle(c, "POST", f"job/{job}/cancel", {}, None) == {"ok": True}
    assert proc.killed
    time.sleep(0.2)
    assert api.handle(c, "GET", f"job/{job}", {}, None) == {"status": "cancelled"}
    assert [x for x in api.handle(c, "GET", "history", {}, None)["history"] if x["role"] == "assistant"] == []
    api.LAST[0] = 0
    monkeypatch.setattr(api.subprocess, "Popen", lambda *a, **k: FakeProc("{}"))
    assert "job" in api.handle(c, "POST", "ask", {}, {"text": "encore"})  # not busy


def test_cancel_unknown_and_finished(monkeypatch):
    c = ctx()
    assert api.handle(c, "POST", "job/nope/cancel", {}, None)[0] == 404
    job = ask(c, monkeypatch, FakeProc(json.dumps({"result": "ok"})))
    wait(c, job)
    assert api.handle(c, "POST", f"job/{job}/cancel", {}, None) == {"ok": True}
    assert api.handle(c, "GET", f"job/{job}", {}, None)["status"] == "done"


def test_new_settings_bounds_and_reset():
    assert api._clean({"silence_ms": 10})["silence_ms"] == 800
    assert api._clean({"silence_ms": 99999})["silence_ms"] == 5000
    assert api._clean({"silence_ms": "2500"})["silence_ms"] == 2500
    assert "silence_ms" not in api._clean({"silence_ms": "x"})
    assert api._clean({"review": "on"})["review"] is True
    c = ctx()
    api.handle(c, "POST", "settings", {}, {"review": True, "silence_ms": 3000})
    d = api.handle(c, "DELETE", "settings", {}, None)["settings"]
    assert d["review"] is False and d["silence_ms"] == 1800
    assert api.handle(c, "GET", "settings", {}, None)["settings"]["silence_ms"] == 1800


def test_prompt_mentions_marker():
    assert "[[CONFIRM]]" in api._system_prompt(api.DEFAULTS)
