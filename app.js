let data = JSON.parse(localStorage.getItem("diveV3")||'{"trips":[]}');
let selected=null;
let viewerIndex=0;

const tree = document.getElementById("tree");
const diveView = document.getElementById("diveView");
const empty = document.getElementById("empty");

const photosEl = document.getElementById("photos");
const statsEl = document.getElementById("stats");

function save(){
  localStorage.setItem("diveV3",JSON.stringify(data));
}

function uid(){return Math.random().toString(36).slice(2);}

function renderTree(){
  tree.innerHTML="";
  data.trips.forEach(trip=>{
    let div=document.createElement("div");
    div.className="tree-item";
    div.innerHTML=`<b>${trip.name}</b> (${countDives(trip)} dives)
    <button onclick="addDate('${trip.id}')">+Date</button>`;
    
    trip.dates.forEach(date=>{
      let d=document.createElement("div");
      d.style.marginLeft="10px";
      d.innerHTML=`${date.name}
      <button onclick="addDive('${trip.id}','${date.id}')">+Dive</button>`;
      
      date.dives.forEach(dive=>{
        let dv=document.createElement("div");
        dv.style.marginLeft="20px";
        dv.innerHTML=`<span onclick="selectDive('${trip.id}','${date.id}','${dive.id}')">${dive.name} (${dive.photos.length})</span>`;
        d.appendChild(dv);
      });
      
      div.appendChild(d);
    });

    tree.appendChild(div);
  });
}

function countDives(trip){
  return trip.dates.reduce((a,d)=>a+d.dives.length,0);
}

function addTrip(){
  let name=prompt("Trip?");
  if(!name)return;
  data.trips.push({id:uid(),name,dates:[]});
  save(); renderTree();
}

function addDate(tid){
  let trip=data.trips.find(t=>t.id==tid);
  let name=prompt("Date?");
  trip.dates.push({id:uid(),name,dives:[]});
  save(); renderTree();
}

function addDive(tid,did){
  let trip=data.trips.find(t=>t.id==tid);
  let date=trip.dates.find(d=>d.id==did);
  let name=prompt("Dive?");
  date.dives.push({id:uid(),name,site:"",notes:"",photos:[]});
  save(); renderTree();
}

function selectDive(tid,did,vid){
  let trip=data.trips.find(t=>t.id==tid);
  let date=trip.dates.find(d=>d.id==did);
  let dive=date.dives.find(d=>d.id==vid);
  selected={trip,date,dive};
  renderDive();
}

function renderDive(){
  if(!selected){empty.classList.remove("hidden");return;}
  empty.classList.add("hidden");
  diveView.classList.remove("hidden");

  let d=selected.dive;

  document.getElementById("diveTitle").innerText=d.name;
  document.getElementById("divePath").innerText=selected.trip.name+" / "+selected.date.name;

  siteInput.value=d.site;
  notesInput.value=d.notes;

  siteInput.oninput=()=>{d.site=siteInput.value;save();}
  notesInput.oninput=()=>{d.notes=notesInput.value;save();}

  statsEl.innerText=`Photos: ${d.photos.length}`;

  photosEl.innerHTML="";
  d.photos.forEach((p,i)=>{
    let img=document.createElement("img");
    img.src=p;
    img.className="photo";
    img.onclick=()=>openViewer(i);
    photosEl.appendChild(img);
  });
}

fileInput.onchange=e=>{
  let files=[...e.target.files];
  files.forEach(f=>{
    let r=new FileReader();
    r.onload=()=>{
      selected.dive.photos.push(r.result);
      save(); renderDive();
    };
    r.readAsDataURL(f);
  });
};

dropZone.ondragover=e=>{e.preventDefault();}
dropZone.ondrop=e=>{
  e.preventDefault();
  let files=[...e.dataTransfer.files];
  files.forEach(f=>{
    let r=new FileReader();
    r.onload=()=>{
      selected.dive.photos.push(r.result);
      save(); renderDive();
    };
    r.readAsDataURL(f);
  });
};

function openViewer(i){
  viewerIndex=i;
  document.getElementById("viewer").classList.remove("hidden");
  showViewer();
}

function showViewer(){
  let img=selected.dive.photos[viewerIndex];
  document.getElementById("viewerImg").src=img;
}

viewer.onclick=()=>viewer.classList.add("hidden");

let startX=0;
viewer.addEventListener("touchstart",e=>{
  startX=e.touches[0].clientX;
});

viewer.addEventListener("touchend",e=>{
  let dx=e.changedTouches[0].clientX-startX;
  if(dx>50) viewerIndex=Math.max(0,viewerIndex-1);
  if(dx<-50) viewerIndex=Math.min(selected.dive.photos.length-1,viewerIndex+1);
  showViewer();
});

searchInput.oninput=()=>{
  let q=searchInput.value.toLowerCase();
  tree.innerHTML="";
  data.trips.forEach(t=>{
    t.dates.forEach(d=>{
      d.dives.forEach(v=>{
        if(v.name.toLowerCase().includes(q) || v.site.toLowerCase().includes(q)){
          let el=document.createElement("div");
          el.innerText=v.name;
          el.onclick=()=>selectDive(t.id,d.id,v.id);
          tree.appendChild(el);
        }
      });
    });
  });
};

addTripBtn.onclick=addTrip;

renderTree();
