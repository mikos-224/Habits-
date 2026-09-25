const KEY="nawyki_pwa_v1";
const EMOJIS=["🌱","📚","💪","💧","🧘","🏃","🎸","🎵","🧹","📝","🧠","😴","🥗","🚶","🎨","💻"];
let data=JSON.parse(localStorage.getItem(KEY)||"null")||{habits:[],checks:{},theme:"light"};
let editingId=null, selectedEmoji="🌱";

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function dateKey(d=new Date()){return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function prettyDate(){return new Intl.DateTimeFormat("pl-PL",{weekday:"long",day:"numeric",month:"long"}).format(new Date())}
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function checkKey(id,date=dateKey()){return `${id}|${date}`}
function isDone(id,date=dateKey()){return !!data.checks[checkKey(id,date)]}
function streak(id){
  let n=0,d=new Date();
  while(isDone(id,dateKey(d))){n++;d.setDate(d.getDate()-1)}
  return n;
}
function allDays(h){let n=0;for(const k of Object.keys(data.checks))if(k.startsWith(h.id+"|"))n++;return n}
function daysSince(id){return Object.keys(data.checks).filter(k=>k.startsWith(id+"|")).length}
function render(){
  $("#todayLabel").textContent=prettyDate();
  $("#habitCount").textContent=`${data.habits.length} ${data.habits.length===1?"nawyk":"nawyków"}`;
  const total=data.habits.length, done=data.habits.filter(h=>isDone(h.id)).length, pct=total?Math.round(done/total*100):0;
  $("#progressPct").textContent=pct+"%";$("#progressRing").style.setProperty("--p",pct+"%");
  $("#summaryTitle").textContent=total&&done===total?"Wszystko zrobione!":done?`Zrobione ${done} z ${total}`:"Zaczynamy!";
  $("#summaryText").textContent=total?(done===total?"Świetna robota. Dzisiejsza rutyna zamknięta.":"Małe kroki robią różnicę."):"Dodaj pierwszy nawyk i zacznij budować swoją rutynę.";
  $("#habitList").innerHTML=data.habits.map(h=>`
    <article class="habit card ${isDone(h.id)?"done":""}">
      <button class="habit-check" data-check="${h.id}" aria-label="Odhacz">${isDone(h.id)?"✓":h.emoji}</button>
      <div class="habit-info"><div class="habit-name">${esc(h.name)}</div><div class="habit-meta">🔥 ${streak(h.id)} dni serii · ${daysSince(h.id)} wykonań</div></div>
      <div class="habit-actions"><button class="mini" data-edit="${h.id}" aria-label="Edytuj">✎</button><button class="mini" data-delete="${h.id}" aria-label="Usuń">⋯</button></div>
    </article>`).join("");
  $("#emptyState").style.display=total?"none":"block";
  renderStats();
  save();
}
function renderStats(){
  const done=Object.keys(data.checks).length, possible=data.habits.length*allTrackedDays(), rate=possible?Math.round(done/possible*100):0;
  let best=0;data.habits.forEach(h=>{let max=0,cur=0;const dates=Object.keys(data.checks).filter(k=>k.startsWith(h.id+"|")).map(k=>k.split("|")[1]).sort();let prev=null;for(const x of dates){const d=new Date(x);if(prev){const diff=(d-new Date(prev))/86400000;cur=diff===1?cur+1:1}else cur=1;max=Math.max(max,cur);prev=x}best=Math.max(best,max)});
  $("#statDone").textContent=done;$("#statRate").textContent=rate+"%";$("#statBest").textContent=best;$("#statHabits").textContent=data.habits.length;
  const now=new Date(), labels=[];for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);labels.push(d)}
  $("#weekChart").innerHTML=labels.map(d=>{const k=dateKey(d), possible=data.habits.length, n=data.habits.filter(h=>isDone(h.id,k)).length, p=possible?n/possible:0;return `<div class="daybar"><div class="bar-wrap"><div class="bar ${k===dateKey()?"today":""}" style="height:${Math.max(4,p*100)}%"></div></div><span>${d.toLocaleDateString("pl-PL",{weekday:"short"}).slice(0,2)}</span></div>`}).join("");
  $("#habitStats").innerHTML=data.habits.length?data.habits.map(h=>{const n=daysSince(h.id), p=allTrackedDays()?Math.round(n/allTrackedDays()*100):0;return `<div class="hstat"><div class="hstat-icon">${h.emoji}</div><div><div class="hstat-name">${esc(h.name)}</div><div class="hstat-track"><div class="hstat-fill" style="width:${Math.min(100,p)}%"></div></div></div><div class="hstat-pct">${p}%</div></div>`}).join(""):"<p class='muted'>Dodaj nawyki, aby zobaczyć statystyki.</p>";
}
function allTrackedDays(){if(!data.habits.length)return 0;let earliest=new Date();Object.keys(data.checks).forEach(k=>{const d=new Date(k.split("|")[1]);if(d<earliest)earliest=d});return Math.max(1,Math.floor((new Date(dateKey())-new Date(dateKey(earliest)))/86400000)+1)}
function openModal(id=null){
  editingId=id;$("#modalTitle").textContent=id?"Edytuj nawyk":"Nowy nawyk";
  const h=id?data.habits.find(x=>x.id===id):null;$("#habitName").value=h?h.name:"";selectedEmoji=h?h.emoji:"🌱";
  $("#emojiRow").innerHTML=EMOJIS.map(e=>`<button class="emoji ${e===selectedEmoji?"selected":""}" data-emoji="${e}">${e}</button>`).join("");
  $("#modal").classList.remove("hidden");setTimeout(()=>$("#habitName").focus(),50);
}
function closeModal(){$("#modal").classList.add("hidden")}
$("#addBtn").onclick=()=>openModal();$("#emptyAddBtn").onclick=()=>openModal();$("#closeModal").onclick=closeModal;$("#cancelBtn").onclick=closeModal;
$("#saveBtn").onclick=()=>{const name=$("#habitName").value.trim();if(!name){$("#habitName").focus();return}if(editingId){const h=data.habits.find(x=>x.id===editingId);h.name=name;h.emoji=selectedEmoji}else data.habits.push({id:crypto.randomUUID(),name,emoji:selectedEmoji,created:dateKey()});closeModal();render()};
$("#emojiRow").onclick=e=>{const b=e.target.closest("[data-emoji]");if(!b)return;selectedEmoji=b.dataset.emoji;$$(".emoji").forEach(x=>x.classList.toggle("selected",x.dataset.emoji===selectedEmoji))};
$("#habitList").onclick=e=>{const c=e.target.closest("[data-check]"), ed=e.target.closest("[data-edit]"), del=e.target.closest("[data-delete]");if(c){const k=checkKey(c.dataset.check);data.checks[k]=!data.checks[k];if(!data.checks[k])delete data.checks[k];render()}else if(ed)openModal(ed.dataset.edit);else if(del){const h=data.habits.find(x=>x.id===del.dataset.delete);if(h&&confirm(`Usunąć nawyk „${h.name}”? Historia tego nawyku też zostanie usunięta.`)){data.habits=data.habits.filter(x=>x.id!==h.id);Object.keys(data.checks).forEach(k=>{if(k.startsWith(h.id+"|"))delete data.checks[k]});render()}}};
$$(".tab").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));$$(".tab-page").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#"+b.dataset.tab).classList.add("active")});
$("#themeBtn").onclick=()=>{data.theme=data.theme==="dark"?"light":"dark";document.body.classList.toggle("dark",data.theme==="dark");$("#themeBtn").textContent=data.theme==="dark"?"☀":"☾";save()};
if(data.theme==="dark"){$("body").classList.add("dark");$("#themeBtn").textContent="☀"}
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
