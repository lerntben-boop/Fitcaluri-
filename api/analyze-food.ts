type Item={name:string;grams:number;kcal:number;protein:number;carbs:number;fat:number}
export default async function handler(req:any,res:any){
 if(req.method!=='POST') return res.status(405).json({error:'METHOD_NOT_ALLOWED'})
 try{
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body
  if(!body?.image)return res.status(400).json({error:'IMAGE_REQUIRED'})
  const key=process.env.OPENAI_API_KEY
  if(!key)return res.status(503).json({error:'AI_VISION_NOT_CONFIGURED',message:'KI-Foto-Tracking ist noch nicht mit einem Vision-Dienst verbunden. Die App funktioniert trotzdem ohne KI.'})
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify({model:'gpt-4.1-mini',input:[{role:'user',content:[{type:'input_text',text:'Analysiere dieses Essensfoto für eine Kalorien-App. Erkenne sichtbare Lebensmittel/Gerichte. Schätze essbare Menge in Gramm und Nährwerte. Sei konservativ und kennzeichne Unsicherheit in note. Antworte ausschließlich als JSON: {"items":[{"name":"string","grams":number,"kcal":number,"protein":number,"carbs":number,"fat":number}],"note":"string"}. Versteckte Zutaten und exakte Portionsgrößen sind nicht sicher erkennbar.'},{type:'input_image',image_url:body.image}]} }],max_output_tokens:900})})
  if(!r.ok)return res.status(502).json({error:'VISION_REQUEST_FAILED'})
  const data=await r.json(); const raw=String(data.output_text||'').replace(/\`\`\`json|\`\`\`/g,'').trim(); const parsed=JSON.parse(raw)
  if(!Array.isArray(parsed.items))throw new Error('INVALID_RESPONSE')
  const items:Item[]=parsed.items.map((x:any)=>({name:String(x.name||'Unbekannt'),grams:Math.max(1,Number(x.grams)||100),kcal:Math.max(0,Number(x.kcal)||0),protein:Math.max(0,Number(x.protein)||0),carbs:Math.max(0,Number(x.carbs)||0),fat:Math.max(0,Number(x.fat)||0)}))
  return res.status(200).json({items,note:String(parsed.note||'Richtwerte – bitte Portionen prüfen.')})
 }catch(e){return res.status(500).json({error:'ANALYSIS_FAILED',message:'Das Foto konnte nicht zuverlässig analysiert werden.'})}
}
