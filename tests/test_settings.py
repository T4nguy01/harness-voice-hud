import sys, tempfile, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
import api


def ctx():
    return {"state_dir": tempfile.mkdtemp(), "workspace": "/tmp"}


def test_clean_bad_values():
    o = api._clean({"name": "  ", "rate": "abc", "daily_max": "12.7", "autonomy": "x", "model": "a b;rm", "lang": "de", "evil": 1})
    assert o == {"name": "Assistant", "daily_max": 12, "autonomy": "balanced", "model": "", "lang": "fr-FR"}


def test_clamp():
    assert api._clean({"rate": 9})["rate"] == 2.0 and api._clean({"daily_max": 9999})["daily_max"] == 500
    assert api._clean({"volume": 0})["volume"] == 0.1 and api._clean({"retention_days": -4})["retention_days"] == 0


def test_roundtrip_and_reset():
    c = ctx()
    assert api.handle(c, "POST", "settings", {}, {"autonomy": "auto", "speak": False})["settings"]["autonomy"] == "auto"
    assert api.handle(c, "GET", "settings", {}, None)["settings"]["speak"] is False
    assert api.handle(c, "DELETE", "settings", {}, None)["settings"] == api.DEFAULTS


def test_prompt_levels_and_lang():
    for lvl in api.AUTONOMY:
        assert api.ALWAYS_CONFIRM in api._system_prompt({**api.DEFAULTS, "autonomy": lvl})
    assert "anglais" in api._system_prompt({**api.DEFAULTS, "lang": "en-US"})


def test_cap_and_rate(monkeypatch=None):
    c = ctx(); api.JOBS.clear(); api.LAST[0] = 0
    real, api._run = api._run, lambda *a: None
    api.handle(c, "POST", "settings", {}, {"daily_max": 1})
    assert "job" in api.handle(c, "POST", "ask", {}, {"text": "a"})
    api.JOBS.clear(); api.LAST[0] = 0
    assert api.handle(c, "POST", "ask", {}, {"text": "b"})[0] == 429
    api._run = real


def test_cmd_guard():
    d = {**api.DEFAULTS, "autonomy": "prudent"}
    c = api.build_cmd("hi", d, None)
    assert "Bash" not in c[c.index("--allowedTools") + 1] and "--permission-mode" not in c
    c = api.build_cmd("hi", {**d, "autonomy": "auto", "model": "m"}, "0123abcd-4567")
    assert "Bash(rm *)" in c[c.index("--disallowedTools") + 1] and "--resume" in c and "--model" in c


def test_retention():
    c = ctx(); api.handle(c, "POST", "settings", {}, {"retention_days": 0})
    api._add_history(c, "user", "x")
    assert api.handle(c, "GET", "history", {}, None)["history"] == []
    api.handle(c, "POST", "settings", {}, {"retention_days": 7})
    api._add_history(c, "user", "y")
    assert len(api.handle(c, "GET", "history", {}, None)["history"]) == 1


def test_hardening():
    assert api._clean({"name": "Ass<ist>\n«x»; rm"})["name"] == "Assist x rm"
    c = api.build_cmd("--dangerous", {**api.DEFAULTS}, "not a sid; rm")
    assert "--dangerous" not in c and "--resume" not in c
    assert "SÉCURITÉ" in api._system_prompt(api.DEFAULTS)
    assert api._clean([1, 2]) == {} and api.handle(ctx(), "POST", "settings", {}, [1])["settings"]["name"] == "Assistant"
    import os
    os.environ["SECRET_VAULT_KEY"] = "x"; os.environ["LC_ALL"] = "C"
    e = api._clean_env()
    assert "SECRET_VAULT_KEY" not in e and "PATH" in e and "LC_ALL" in e
    c = ctx(); api.handle(c, "POST", "settings", {}, {"daily_max": 5})
    assert oct(os.stat(pathlib.Path(c["state_dir"]) / "settings.json").st_mode)[-3:] == "600"
    assert api.handle(c, "POST", "job/../x/cancel", {}, {})[0] == 404


def test_run_flow_with_fake_claude():
    import os, stat, time
    d = tempfile.mkdtemp(); f = pathlib.Path(d) / "claude"
    f.write_text("#!/bin/sh\ncat >/dev/null\necho '{\"result\": \"Bien reçu [[CONFIRM]]\", \"session_id\": \"abcd1234-ef\"}'\n")
    f.chmod(f.stat().st_mode | stat.S_IEXEC)
    old = os.environ["PATH"]; os.environ["PATH"] = d + ":" + old
    try:
        c = ctx(); api.JOBS.clear(); api.LAST[0] = 0
        jid = api.handle(c, "POST", "ask", {}, {"text": "salut"})["job"]
        for _ in range(50):
            r = api.handle(c, "GET", f"job/{jid}", {}, None)
            if r["status"] != "running":
                break
            time.sleep(0.1)
        assert r == {"status": "done", "reply": "Bien reçu", "confirm": True}, r
        assert api._read(pathlib.Path(c["state_dir"]) / "session.json", {})["id"] == "abcd1234-ef"
        api.JOBS[jid] = {"status": "running", "started": 0}
        api.handle(c, "GET", "history", {}, None)
        assert api.JOBS[jid]["status"] == "error"
    finally:
        os.environ["PATH"] = old


if __name__ == "__main__":
    for n, f in list(globals().items()):
        if n.startswith("test_"):
            f(); print("ok", n)
