// Blind labelling tool (ADR 0015). Local only: binds to 127.0.0.1.
//   npm run label -- dev|golden|holdout|real      then open http://127.0.0.1:4317
// The browser never receives Gemini's intent, distractor or scope fields.
// Labels append to evals/data/labels/<split>.jsonl, or private/labels/ for holdout and real;
// the latest row per id wins, so relabelling is just labelling again.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { LABELS, RULES } from "../lib/rules";

const SPLITS = ["dev", "golden", "holdout", "real"] as const;
type Split = (typeof SPLITS)[number];
const split = process.argv[2] as Split;
if (!SPLITS.includes(split)) throw new Error(`usage: label <${SPLITS.join("|")}>`);

const priv = split === "holdout" || split === "real";
const itemsPath = priv
  ? join(process.cwd(), `../private/${split === "real" ? "real-slice" : "holdout"}.jsonl`)
  : join(process.cwd(), `evals/data/${split}.jsonl`);
const labelsPath = priv
  ? join(process.cwd(), `../private/labels/${split}.jsonl`)
  : join(process.cwd(), `evals/data/labels/${split}.jsonl`);

const readJsonl = (p: string) =>
  existsSync(p) ? readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];

// Only id and text leave the server.
const items = () => readJsonl(itemsPath).map((r: { id: string; text: string }) => ({ id: r.id, text: r.text }));
const latestLabels = () => Object.fromEntries(readJsonl(labelsPath).map((r: { id: string }) => [r.id, r]));

const guide = LABELS.map((l, i) => ({ key: i + 1, label: l, title: RULES[l].title, yes: RULES[l].criteria.true, no: RULES[l].criteria.false }));

const page = `<!doctype html><html><head><meta charset="utf-8"><title>Label ${split}</title>
<style>
body{font:15px/1.5 system-ui,sans-serif;margin:0;display:grid;grid-template-columns:1fr 420px;height:100vh;color:#1a1a1a;background:#fafafa}
#letter{padding:24px 32px;overflow:auto;white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:13.5px;background:#fff;border-right:1px solid #ddd}
#side{padding:20px;overflow:auto}
h1{font-size:15px;margin:0 0 4px}.muted{color:#666;font-size:13px}
label.opt{display:block;border:1px solid #ddd;border-radius:8px;padding:8px 10px;margin:8px 0;background:#fff;cursor:pointer}
label.opt.on{border-color:#2563eb;background:#eff6ff}
.opt b{font-size:13px}.opt small{display:block;color:#555;font-size:12px;margin-top:2px}
kbd{border:1px solid #bbb;border-bottom-width:2px;border-radius:4px;padding:0 5px;font-size:12px;background:#fff}
textarea{width:100%;box-sizing:border-box;height:60px}
button{font:inherit;padding:8px 14px;border-radius:8px;border:1px solid #2563eb;background:#2563eb;color:#fff;cursor:pointer}
button.sec{background:#fff;color:#2563eb}
.row{display:flex;gap:8px;align-items:center;margin-top:10px}
</style></head><body>
<div id="letter"></div>
<div id="side">
<h1>Blind labels: ${split}</h1>
<div class="muted" id="progress"></div>
<p class="muted">Tick every reason the plan gives for denying. Leave all unticked if none applies (a person should read it). Mentions that are not reasons don't count.</p>
<div id="opts"></div>
<div class="row"><label><input type="checkbox" id="unsure"> Unsure <kbd>u</kbd></label></div>
<textarea id="notes" placeholder="Notes (optional): ambiguity, why"></textarea>
<div class="row"><button class="sec" id="prev">&larr; Prev <kbd>[</kbd></button><button id="save">Save &amp; next <kbd>Enter</kbd></button><button class="sec" id="next">Skip <kbd>]</kbd></button></div>
<p class="muted">Keys: <kbd>1</kbd>-<kbd>6</kbd> toggle, <kbd>0</kbd> clear all.</p>
</div>
<script>
const GUIDE=${JSON.stringify(guide)};
let items=[],labels={},i=0;
const $=s=>document.querySelector(s);
async function load(){items=await (await fetch('/items')).json();labels=await (await fetch('/labels')).json();
 i=Math.max(0,items.findIndex(x=>!labels[x.id]));if(i<0)i=0;render()}
function render(){const it=items[i];if(!it){$('#letter').textContent='No items yet.';return}
 const l=labels[it.id]||{labels:[],unsure:false,notes:''};
 $('#letter').textContent=it.text;
 $('#opts').innerHTML=GUIDE.map(g=>'<label class="opt'+(l.labels.includes(g.label)?' on':'')+'"><input type="checkbox" data-l="'+g.label+'" '+(l.labels.includes(g.label)?'checked':'')+'> <kbd>'+g.key+'</kbd> <b>'+g.title+'</b><small>Yes: '+g.yes+'</small><small>No: '+g.no+'</small></label>').join('');
 document.querySelectorAll('#opts input').forEach(x=>x.onchange=()=>x.parentElement.classList.toggle('on',x.checked));
 $('#unsure').checked=!!l.unsure;$('#notes').value=l.notes||'';
 const done=items.filter(x=>labels[x.id]).length;
 $('#progress').textContent=it.id+' · '+(i+1)+' of '+items.length+' · '+done+' labelled'+(labels[it.id]?' · (already labelled)':'');
 $('#letter').scrollTop=0}
async function save(){const it=items[i];if(!it)return;
 const body={id:it.id,labels:[...document.querySelectorAll('#opts input:checked')].map(x=>x.dataset.l),unsure:$('#unsure').checked,notes:$('#notes').value.trim()};
 const r=await fetch('/labels',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!r.ok){alert('Save failed');return}labels[it.id]=body;i=Math.min(i+1,items.length-1);render()}
$('#save').onclick=save;$('#prev').onclick=()=>{i=Math.max(0,i-1);render()};$('#next').onclick=()=>{i=Math.min(items.length-1,i+1);render()};
document.addEventListener('keydown',e=>{if(e.target.tagName==='TEXTAREA')return;
 if(e.key>='1'&&e.key<='6'){const x=document.querySelectorAll('#opts input')[+e.key-1];x.checked=!x.checked;x.onchange()}
 else if(e.key==='0'){document.querySelectorAll('#opts input').forEach(x=>{x.checked=false;x.onchange()})}
 else if(e.key==='u')$('#unsure').checked=!$('#unsure').checked;
 else if(e.key==='Enter'){e.preventDefault();save()}
 else if(e.key==='[')$('#prev').click();else if(e.key===']')$('#next').click()});
load();
</script></body></html>`;

createServer((req, res) => {
  const send = (code: number, type: string, body: string) => {
    res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(body);
  };
  if (req.method === "GET" && req.url === "/") return send(200, "text/html; charset=utf-8", page);
  if (req.method === "GET" && req.url === "/items") return send(200, "application/json", JSON.stringify(items()));
  if (req.method === "GET" && req.url === "/labels") return send(200, "application/json", JSON.stringify(latestLabels()));
  if (req.method === "POST" && req.url === "/labels") {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        const b = JSON.parse(raw) as { id: string; labels: string[]; unsure: boolean; notes: string };
        const known = new Set(items().map((x) => x.id));
        if (!known.has(b.id) || !b.labels.every((l) => (LABELS as readonly string[]).includes(l))) return send(400, "text/plain", "bad label");
        mkdirSync(dirname(labelsPath), { recursive: true });
        appendFileSync(
          labelsPath,
          JSON.stringify({ id: b.id, labels: b.labels, unsure: !!b.unsure, notes: String(b.notes ?? "").slice(0, 2000), labeler: "author", labeled_at: new Date().toISOString() }) + "\n",
        );
        send(204, "text/plain", "");
      } catch {
        send(400, "text/plain", "bad json");
      }
    });
    return;
  }
  send(404, "text/plain", "not found");
}).listen(4317, "127.0.0.1", () => console.log(`Labelling ${split}: http://127.0.0.1:4317  (${items().length} items, labels -> ${priv ? "private/labels/" : labelsPath})`));
