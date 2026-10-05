import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import {
  Activity, BarChart3, Barcode, Camera, Check, ChevronRight, Dumbbell,
  Flame, Heart, Home, Plus, ScanLine, Search, Settings, Trash2, Trophy,
  UserRound, Utensils, X, Droplets
} from 'lucide-react'
import { foods, foodCount, Food } from './data/foods'

type Meal = { id:number; food:Food; grams:number; mealType:string; createdAt:string }
type ScanItem = { name:string; grams:number; kcal:number; protein:number; carbs:number; fat:number }
type Workout = { id:number; name:string; duration:number; category:string; done:boolean }

const mealTypes = ['Frühstück','Mittagessen','Abendessen','Snack']
const defaultWorkouts: Workout[] = [
  {id:1,name:'20 Min Home Workout',duration:20,category:'Ganzkörper',done:false},
  {id:2,name:'Fußball Technik',duration:35,category:'Fußball',done:false},
  {id:3,name:'Core & Stabilität',duration:15,category:'Core',done:false},
  {id:4,name:'Ausdauer Lauf',duration:30,category:'Ausdauer',done:false},
]

const calc = (f:Food,g:number) => {
  const x=g/100
  return {kcal:Math.round(f.kcal*x),protein:+(f.protein*x).toFixed(1),carbs:+(f.carbs*x).toFixed(1),fat:+(f.fat*x).toFixed(1)}
}
const todayKey = () => new Date().toISOString().slice(0,10)

export default function App(){
  const [tab,setTab]=useState('home')
  const [q,setQ]=useState('')
  const [meals,setMeals]=useState<Meal[]>(()=>JSON.parse(localStorage.getItem('df-meals')||'[]'))
  const [favs,setFavs]=useState<string[]>(()=>JSON.parse(localStorage.getItem('df-favs')||'[]'))
  const [water,setWater]=useState<number>(()=>Number(localStorage.getItem('df-water')||0))
  const [workouts,setWorkouts]=useState<Workout[]>(()=>JSON.parse(localStorage.getItem('df-workouts')||JSON.stringify(defaultWorkouts)))
  const [food,setFood]=useState<Food|null>(null)
  const [grams,setGrams]=useState(100)
  const [mealType,setMealType]=useState('Frühstück')
  const [scan,setScan]=useState<ScanItem[]>([])
  const [scanNote,setScanNote]=useState('')
  const [photo,setPhoto]=useState<string|null>(null)
  const [scanning,setScanning]=useState(false)
  const [scanError,setScanError]=useState('')
  const [barcode,setBarcode]=useState('')
  const [product,setProduct]=useState<any>(null)
  const [showSettings,setShowSettings]=useState(false)

  useEffect(()=>localStorage.setItem('df-meals',JSON.stringify(meals)),[meals])
  useEffect(()=>localStorage.setItem('df-favs',JSON.stringify(favs)),[favs])
  useEffect(()=>localStorage.setItem('df-water',String(water)),[water])
  useEffect(()=>localStorage.setItem('df-workouts',JSON.stringify(workouts)),[workouts])

  const todayMeals=useMemo(()=>meals.filter(m=>m.createdAt===todayKey()),[meals])
  const totals=useMemo(()=>todayMeals.reduce((a,m)=>{const c=calc(m.food,m.grams);return {...a,kcal:a.kcal+c.kcal,protein:a.protein+c.protein,carbs:a.carbs+c.carbs,fat:a.fat+c.fat}},{kcal:0,protein:0,carbs:0,fat:0}),[todayMeals])
  const filtered=useMemo(()=>foods.filter(f=>f.name.toLowerCase().includes(q.toLowerCase())||f.category.toLowerCase().includes(q.toLowerCase())).slice(0,60),[q])
  const progress=Math.min(100,Math.round(totals.kcal/2200*100))
  const doneWorkouts=workouts.filter(w=>w.done).length

  const addMeal=()=>{
    if(!food)return
    setMeals(v=>[{id:Date.now(),food,grams,mealType,createdAt:todayKey()},...v])
    setFood(null);setGrams(100)
  }
  const addScan=()=>{
    setMeals(v=>[...v,...scan.map((x,i)=>{const found=foods.find(f=>f.name.toLowerCase().includes(x.name.toLowerCase())||x.name.toLowerCase().includes(f.name.toLowerCase()));const f=found||{id:'scan-'+Date.now()+i,name:x.name,category:'Foto-Scan',kcal:x.kcal*100/Math.max(x.grams,1),protein:x.protein*100/Math.max(x.grams,1),carbs:x.carbs*100/Math.max(x.grams,1),fat:x.fat*100/Math.max(x.grams,1)};return {id:Date.now()+i,food:f,grams:x.grams,mealType:'Mahlzeit',createdAt:todayKey()}})])
    setScan([]);setPhoto(null)
  }
  const fileToData=(file:File)=>new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file)})
  const scanPhoto=async(e:ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file)return
    setPhoto(URL.createObjectURL(file));setScanning(true);setScanError('');setScan([])
    try{
      const image=await fileToData(file)
      const r=await fetch('/api/analyze-food',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image})})
      const d=await r.json()
      if(!r.ok)throw new Error(d.message||d.error||'Analyse fehlgeschlagen')
      setScan(Array.isArray(d.items)?d.items:[]);setScanNote(d.note||'')
    }catch(err:any){setScanError(err.message||'Foto konnte nicht analysiert werden.')}
    finally{setScanning(false)}
  }
  const lookupBarcode=async()=>{
    if(!barcode.trim())return
    try{
      const r=await fetch('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(barcode)+'?fields=product_name,brands,nutriments')
      const d=await r.json(); if(d.status!==1)throw new Error()
      const n=d.product.nutriments||{}
      setProduct({name:d.product.product_name||'Unbekanntes Produkt',brand:d.product.brands||'Marke unbekannt',kcal:Math.round(n['energy-kcal_100g']||0),protein:+(n.proteins_100g||0).toFixed(1),carbs:+(n.carbohydrates_100g||0).toFixed(1),fat:+(n.fat_100g||0).toFixed(1)})
    }catch{setProduct({error:'Produkt nicht gefunden'})}
  }
  const toggleFav=(id:string)=>setFavs(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])
  const removeMeal=(id:number)=>setMeals(v=>v.filter(m=>m.id!==id))
  const toggleWorkout=(id:number)=>setWorkouts(v=>v.map(w=>w.id===id?{...w,done:!w.done}:w))

  return <div className="app">
    <header className="topbar">
      <div className="brand"><div className="brandMark">🐉</div><div><b>Dragon<span>Fuel</span></b><small>Fitness & Ernährung</small></div></div>
      <button className="iconBtn" onClick={()=>setShowSettings(true)}><Settings size={20}/></button>
    </header>

    <main>
      {tab==='home'&&<section className="page">
        <div className="heroCard">
          <div className="eyebrow">HEUTE · {new Date().toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit'})}</div>
          <h1>Dein Tag. Dein <span>Fuel.</span></h1>
          <div className="kcalBig">{totals.kcal}<small> kcal erfasst</small></div>
          <div className="progress"><i style={{width:progress+'%'}}/></div>
          <div className="heroMeta"><span>{progress}% vom Tagesfortschritt</span><span>Richtwert · keine Diätvorgabe</span></div>
        </div>
        <div className="quickGrid">
          <button className="quick pink" onClick={()=>document.getElementById('photoInput')?.click()}><Camera/><b>KI-Foto</b><small>Essen erkennen</small></button>
          <button className="quick" onClick={()=>setTab('foods')}><Utensils/><b>Essen</b><small>1.000+ Einträge</small></button>
          <button className="quick" onClick={()=>setTab('training')}><Dumbbell/><b>Training</b><small>{doneWorkouts} erledigt</small></button>
          <button className="quick" onClick={()=>setWater(w=>Math.min(5000,w+250))}><Droplets/><b>Wasser</b><small>{water} / 2000 ml</small></button>
        </div>
        <div className="sectionTitle"><h2>Makros</h2><span>heute</span></div>
        <div className="macroGrid">{[['Protein',totals.protein,'g'],['Kohlenhydrate',totals.carbs,'g'],['Fett',totals.fat,'g']].map(([n,v,u])=><div className="macro" key={String(n)}><small>{n}</small><b>{v}{u}</b><div className="miniBar"><i style={{width:Math.min(100,Number(v)*2)+'%'}}/></div></div>)}</div>
        <div className="sectionTitle"><h2>Heute gegessen</h2><span>{todayMeals.length} Mahlzeiten</span></div>
        {todayMeals.length===0?<div className="empty"><Utensils/><b>Noch nichts erfasst</b><span>Füge dein Essen manuell oder per Foto hinzu.</span><button onClick={()=>setTab('foods')}>Essen hinzufügen <ChevronRight size={16}/></button></div>:
        <div className="mealList">{todayMeals.map(m=>{const c=calc(m.food,m.grams);return <div className="mealRow" key={m.id}><div className="foodIcon">🍽️</div><div className="grow"><b>{m.food.name}</b><small>{m.mealType} · {m.grams} g</small></div><strong>{c.kcal} kcal</strong><button className="trash" onClick={()=>removeMeal(m.id)}><Trash2 size={17}/></button></div>})}</div>}
        <label className="hiddenInput" id="photoInputWrap"><input id="photoInput" type="file" accept="image/*" capture="environment" onChange={scanPhoto}/></label>
        {(photo||scanning||scanError||scan.length>0)&&<div className="scanPanel">
          <div className="sectionTitle"><h2><ScanLine size={19}/> KI-Foto-Tracking</h2>{photo&&<button className="iconBtn" onClick={()=>{setPhoto(null);setScan([])}}><X size={17}/></button>}</div>
          {photo&&<img className="scanPhoto" src={photo}/>}
          {scanning&&<div className="loading"><span className="spinner"/>Foto wird analysiert …</div>}
          {scanError&&<div className="error">{scanError}<small>Die Schätzung ist immer nur ein Richtwert.</small></div>}
          {scan.length>0&&<><div className="scanItems">{scan.map((x,i)=><div className="scanItem" key={i}><div><b>{x.name}</b><small>{x.kcal} kcal · {x.protein} g Protein</small></div><input type="number" min="1" value={x.grams} onChange={e=>setScan(v=>v.map((a,j)=>j===i?{...a,grams:Number(e.target.value)}:a))}/><span>g</span></div>)}</div>{scanNote&&<p className="note">{scanNote}</p>}<button className="primary" onClick={addScan}><Check size={18}/> Alle als Mahlzeit speichern</button></>}
        </div>}
      </section>}

      {tab==='foods'&&<section className="page"><div className="pageHead"><div><small>DATABASE</small><h1>Lebensmittel</h1></div><span className="count">{foodCount}+</span></div>
        <div className="searchBox"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Lebensmittel suchen …"/></div>
        <div className="chipRow"><button onClick={()=>setQ('')} className={!q?'active':''}>Alle</button><button onClick={()=>setQ('Obst')}>Obst</button><button onClick={()=>setQ('Fleisch')}>Fleisch</button><button onClick={()=>setQ('Milch')}>Milchprodukte</button><button onClick={()=>setQ('Snack')}>Snacks</button></div>
        <div className="foodList">{filtered.map(f=><button className="foodRow" key={f.id} onClick={()=>{setFood(f);setGrams(100)}}><div className="foodEmoji">{f.category==='Obst'?'🍎':f.category==='Gemüse'?'🥦':f.category==='Fleisch'?'🍗':'🥗'}</div><div className="grow"><b>{f.name}</b><small>{f.category} · {f.kcal} kcal / 100 g</small></div><button className="heart" onClick={e=>{e.stopPropagation();toggleFav(f.id)}}><Heart size={18} fill={favs.includes(f.id)?'currentColor':'none'}/></button><ChevronRight size={17}/></button>)}</div>
        <div className="barcodeCard"><div className="barcodeTitle"><Barcode/><div><b>Barcode-Scanner</b><small>Produkte direkt suchen</small></div></div><div className="inlineInput"><input value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="EAN / Barcode"/><button onClick={lookupBarcode}>Suchen</button></div>{product&&<div className="productResult">{product.error?<b>{product.error}</b>:<><b>{product.name}</b><small>{product.brand}</small><span>{product.kcal} kcal · P {product.protein} g · KH {product.carbs} g · F {product.fat} g / 100 g</span></>}</div>}</div>
      </section>}

      {tab==='training'&&<section className="page"><div className="pageHead"><div><small>MOVE</small><h1>Training</h1></div><div className="streak"><Flame size={17}/> {doneWorkouts} geschafft</div></div>
        <div className="trainingHero"><Activity size={25}/><div><b>Deine nächste Einheit</b><small>Wähle ein Training, das heute zu dir passt.</small></div></div>
        <div className="workoutList">{workouts.map(w=><div className={'workout '+(w.done?'done':'')} key={w.id}><div className="workIcon"><Dumbbell/></div><div className="grow"><b>{w.name}</b><small>{w.category} · {w.duration} Min.</small></div><button onClick={()=>toggleWorkout(w.id)} className={w.done?'check doneCheck':'check'}>{w.done?<Check/>:<Plus/>}</button></div>)}</div>
        <div className="infoCard"><Trophy/><div><b>Konstanz schlägt Perfektion</b><span>Regelmäßige Bewegung ist wichtiger als jeden Tag maximal zu trainieren.</span></div></div>
      </section>}

      {tab==='stats'&&<section className="page"><div className="pageHead"><div><small>INSIGHTS</small><h1>Statistiken</h1></div><BarChart3/></div>
        <div className="statGrid"><div><Flame/><b>{totals.kcal}</b><small>kcal heute</small></div><div><Utensils/><b>{todayMeals.length}</b><small>Mahlzeiten</small></div><div><Droplets/><b>{water}</b><small>ml Wasser</small></div><div><Heart/><b>{favs.length}</b><small>Favoriten</small></div></div>
        <div className="chartCard"><div className="sectionTitle"><h2>Wöchentlicher Überblick</h2><span>Erfassung</span></div><div className="fakeChart">{['Mo','Di','Mi','Do','Fr','Sa','So'].map((d,i)=><div key={d}><i style={{height:(25+(i===6?Math.min(100,progress):20+i*10))+'%'}}/><small>{d}</small></div>)}</div></div>
        <div className="noteCard"><b>Deine Daten bleiben lokal</b><span>DragonFuel speichert deine erfassten Mahlzeiten und Favoriten auf diesem Gerät. KI-Fotoanalysen werden nur zur Analyse an den konfigurierten Dienst gesendet.</span></div>
      </section>}

      {tab==='profile'&&<section className="page"><div className="profileHero"><div className="avatar">🐉</div><div><small>DEIN PROFIL</small><h1>DragonFuel</h1><span>Kostenlose Basisversion</span></div></div>
        <div className="settingsList"><button><UserRound/><div><b>Profil & Ziele</b><small>Persönliche Einstellungen</small></div><ChevronRight/></button><button onClick={()=>setShowSettings(true)}><Settings/><div><b>Einstellungen</b><small>App & Datenschutz</small></div><ChevronRight/></button><button onClick={()=>setWater(0)}><Droplets/><div><b>Wasser zurücksetzen</b><small>Heute auf 0 ml setzen</small></div><ChevronRight/></button></div>
      </section>}
    </main>

    <nav className="bottomNav">{[['home',Home,'Start'],['foods',Utensils,'Essen'],['training',Dumbbell,'Training'],['stats',BarChart3,'Stats'],['profile',UserRound,'Profil']].map(([id,I,label])=><button key={String(id)} className={tab===id?'active':''} onClick={()=>setTab(String(id))}><I/><span>{label}</span></button>)}</nav>

    {food&&<div className="modal"><div className="modalBox"><button className="close" onClick={()=>setFood(null)}><X/></button><small>{food.category}</small><h2>{food.name}</h2><span>{food.kcal} kcal / 100 g</span><label>Menge <input type="number" min="1" value={grams} onChange={e=>setGrams(Math.max(1,Number(e.target.value)))}/><b>g</b></label><select value={mealType} onChange={e=>setMealType(e.target.value)}>{mealTypes.map(x=><option key={x}>{x}</option>)}</select><div className="nutritionPreview">{Object.entries(calc(food,grams)).map(([k,v])=><span key={k}><small>{k}</small><b>{v}</b></span>)}</div><button className="primary" onClick={addMeal}><Plus/> Mahlzeit hinzufügen</button></div></div>}
    {showSettings&&<div className="modal"><div className="modalBox"><button className="close" onClick={()=>setShowSettings(false)}><X/></button><Settings/><h2>Einstellungen</h2><p>DragonFuel ist als mobile PWA aufgebaut. Deine lokalen Daten werden nicht automatisch mit anderen Geräten synchronisiert.</p><div className="noteCard"><b>KI-Foto-Tracking</b><span>Die Erkennung liefert Schätzwerte. Für genaue Angaben solltest du Portionsgrößen und Zutaten prüfen.</span></div><button className="secondary" onClick={()=>{localStorage.clear();location.reload()}}>Lokale App-Daten löschen</button></div></div>}
  </div>
}
