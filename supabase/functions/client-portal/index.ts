import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BOT_TOKENS = [...new Set([
  Deno.env.get("BOT_TOKEN"),
  Deno.env.get("TELEGRAM_BOT_TOKEN"),
  Deno.env.get("TELEGRAM_TOKEN"),
].filter((value): value is string => Boolean(value)))];
const BOT_TOKEN = BOT_TOKENS[0] ?? "";
const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET, POST, OPTIONS"};
const encoder = new TextEncoder();
function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}})}
async function sha256Hex(value:string){const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("")}
async function hmac(key:Uint8Array,value:string){const cryptoKey=await crypto.subtle.importKey("raw",key,{name:"HMAC",hash:"SHA-256"},false,["sign"]);return new Uint8Array(await crypto.subtle.sign("HMAC",cryptoKey,encoder.encode(value)))}
function hex(bytes:Uint8Array){return Array.from(bytes).map(b=>b.toString(16).padStart(2,"0")).join("")}
async function telegramUser(initData:string){
 if(!BOT_TOKENS.length)throw new Error("bot_token_not_configured");
 const params=new URLSearchParams(initData),received=params.get("hash")??"",authDate=Number(params.get("auth_date")??0);
 if(!received||!authDate)throw new Error("telegram_auth_required");
 if(Math.abs(Math.floor(Date.now()/1000)-authDate)>86400)throw new Error("telegram_initdata_expired");
 const rows:string[]=[];params.forEach((value,key)=>{if(key!=="hash")rows.push(`${key}=${value}`)});rows.sort();
 let valid=false;
 for(const token of BOT_TOKENS){const secret=await hmac(encoder.encode("WebAppData"),token),calculated=hex(await hmac(secret,rows.join("\n")));if(calculated===received.toLowerCase()){valid=true;break}}
 if(!valid)throw new Error("telegram_signature_invalid");
 const user=JSON.parse(params.get("user")??"{}");if(!user?.id||user.is_bot)throw new Error("telegram_user_missing");return user;
}
async function rest(table:string,params:Record<string,string>){const qs=new URLSearchParams(params);const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`,{headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`}});if(!r.ok)throw new Error(`${table}: ${r.status} ${await r.text()}`);return await r.json()}
async function patch(table:string,params:Record<string,string>,body:unknown){const qs=new URLSearchParams(params);const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`,{method:"PATCH",headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(body)});if(!r.ok)throw new Error(`${table} patch: ${r.status} ${await r.text()}`)}
async function insert(table:string,body:unknown,params:Record<string,string>={}){const qs=new URLSearchParams(params);const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`,{method:"POST",headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(body)});if(!r.ok)throw new Error(`${table} insert: ${r.status} ${await r.text()}`);return await r.json()}
async function remove(table:string,params:Record<string,string>){const qs=new URLSearchParams(params);const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`,{method:"DELETE",headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`,Prefer:"return=minimal"}});if(!r.ok)throw new Error(`${table} delete: ${r.status} ${await r.text()}`)}
function tgEsc(value:unknown){return String(value??"").replace(/[&<>]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[ch]??ch))}
async function notifyOwnerAccessRequest(user:any){if(!BOT_TOKEN)return;try{const admins=await rest("platform_admins",{select:"telegram_user_id",is_active:"eq.true"});const name=[user.first_name,user.last_name].filter(Boolean).join(" ")||"Без имени",username=user.telegram_username?`@${user.telegram_username}`:"без username",phone=user.phone||"без телефона";const text=`🔐 <b>Запрос доступа к кабинету</b>\n\nКлиент: <b>${tgEsc(name)}</b>\nTelegram: ${tgEsc(username)}\nТелефон: ${tgEsc(phone)}\n\nОткройте Mini App → «Доступ», чтобы подтвердить или отклонить.`;await Promise.allSettled(admins.map((a:any)=>fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:a.telegram_user_id,text,parse_mode:"HTML"})})))}catch(error){console.error("owner access notification",error)}}
function safePath(path:string){return path.split("/").filter(Boolean).map(encodeURIComponent).join("/")}
async function signedUrl(bucket:string,path:string|null,expiresIn=3600){if(!path)return null;const r=await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${bucket}/${safePath(path)}`,{method:"POST",headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({expiresIn})});if(!r.ok)return null;const data=await r.json();const p=data.signedURL??data.signedUrl??null;if(!p)return null;return p.startsWith("http")?p:`${SUPABASE_URL}/storage/v1${p}`}


async function loadQuizCatalog(organizationId:string){
 const definitions=await rest("quiz_definitions",{select:"id,slug,title,subtitle,sort_order",organization_id:`eq.${organizationId}`,is_active:"eq.true",order:"sort_order.asc"});
 if(!definitions.length)return [];
 const definitionIds=definitions.map((item:any)=>item.id);
 const questions=await rest("quiz_questions",{select:"id,quiz_id,key,prompt,input_type,required,sort_order,placeholder,help_text,min_value,max_value",quiz_id:`in.(${definitionIds.join(",")})`,is_active:"eq.true",order:"sort_order.asc"});
 const questionIds=questions.map((item:any)=>item.id);
 const options=questionIds.length?await rest("quiz_options",{select:"question_id,label,value,sort_order",question_id:`in.(${questionIds.join(",")})`,is_active:"eq.true",order:"sort_order.asc"}):[];
 const optionsByQuestion=new Map<string,any[]>();
 for(const option of options){const rows=optionsByQuestion.get(option.question_id)??[];rows.push({label:option.label,value:option.value});optionsByQuestion.set(option.question_id,rows)}
 return definitions.map((definition:any)=>({
   slug:definition.slug,title:definition.title,subtitle:definition.subtitle,
   questions:questions.filter((question:any)=>question.quiz_id===definition.id).map((question:any)=>({
     key:question.key,prompt:question.prompt,input_type:question.input_type,required:question.required,
     placeholder:question.placeholder,help_text:question.help_text,min_value:question.min_value,max_value:question.max_value,
     options:optionsByQuestion.get(question.id)??[]
   }))
 }));
}

async function notifyOwnerLead(user:any,lead:any,quizType:string,answers:Record<string,unknown>,now:string){
 if(!BOT_TOKEN||!lead?.id)return;
 const labels:Record<string,string>={water_node:'Узел ввода воды',engineering:'Инженерные системы дома',electric:'Электрика',engineering_nodes:'Узел ввода воды',home_engineering:'Инженерные системы дома',electrical:'Электрика',design:'Проектирование',manual_request:'Ручной запрос'};
 const answerLabels:Record<string,string>={systems:'Системы',object_type:'Тип объекта',object:'Объект',area:'Площадь',construction_stage:'Стадия',start_time:'Срок начала',timing:'Срок',location:'Город / адрес',scope:'Состав работ',project:'Проект',request:'Запрос',comment:'Комментарий'};
 const details=Object.entries(answers).filter(([key,value])=>!key.startsWith('_')&&value!==null&&value!==undefined&&String(value).trim()).slice(0,20).map(([key,value])=>`• <b>${tgEsc(answerLabels[key]||key)}:</b> ${tgEsc(Array.isArray(value)?value.join(', '):value)}`).join('\n');
 try{
  const admins=await rest('platform_admins',{select:'telegram_user_id',is_active:'eq.true'});
  const name=[user.first_name,user.last_name].filter(Boolean).join(' ')||'Клиент';
  const username=user.telegram_username?`@${user.telegram_username}`:'без username';
  const phone=user.phone||'без телефона';
  const text=`📥 <b>Новая заявка из кабинета</b>\n\nТип: <b>${tgEsc(labels[quizType]||quizType)}</b>\nКлиент: <b>${tgEsc(name)}</b>\nTelegram: ${tgEsc(username)}\nТелефон: ${tgEsc(phone)}\n\n${details||'Клиент отправил запрос без дополнительных деталей.'}\n\nЛид №${tgEsc(lead.id)} уже добавлен в CRM.`;
  await Promise.allSettled(admins.map((admin:any)=>fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:admin.telegram_user_id,text,parse_mode:'HTML'})})));
  await insert('lead_notifications',{lead_id:lead.id,status:'sent',notified_at:now});
 }catch(error){console.error('owner lead notification',error);try{await insert('lead_notifications',{lead_id:lead.id,status:'pending',last_error:String(error).slice(0,1000)})}catch{}}
}
async function submitCabinetQuiz(body:any,accessToken:any,user:any,now:string){
 const aliases:Record<string,string>={water_node:"engineering_nodes",engineering:"home_engineering",electric:"electrical"};
 const requestedType=String(body.quiz_type||""),quizType=aliases[requestedType]||requestedType;
 const allowed=["engineering_nodes","home_engineering","electrical","design","manual_request"];
 if(!allowed.includes(quizType))return json({error:"quiz_type_invalid"},400);
 const answers=body.answers&&typeof body.answers==="object"&&!Array.isArray(body.answers)?body.answers:{};
 if(JSON.stringify(answers).length>20000)return json({error:"quiz_answers_too_large"},400);
 if(quizType==="manual_request"&&!String(answers.request||"").trim())return json({error:"request_required"},400);
 const requestId=String(body.request_id||"").trim().slice(0,120);
 if(requestId){
   const existing=await rest("quiz_submissions",{select:"id,lead_id,quiz_type,status",organization_id:`eq.${accessToken.organization_id}`,user_id:`eq.${user.id}`,"answers->>_request_id":`eq.${requestId}`,limit:"1"});
   if(existing.length)return json({ok:true,quiz:existing[0],lead_id:existing[0].lead_id||null,access_unlocked:true,duplicate:false});
 }
 const projectId=String(body.project_id||"").trim();
 let project:any=null;
 if(projectId){
  const rows=await rest("projects",{select:"id,client_user_id,client_phone_normalized,city,title",id:`eq.${projectId}`,organization_id:`eq.${accessToken.organization_id}`,limit:"1"});
  if(!rows.length)return json({error:"project_not_found"},404);
  project=rows[0];
  let allowedProject=project.client_user_id===user.id||Boolean(user.phone_verified&&user.phone_normalized&&project.client_phone_normalized===user.phone_normalized);
  if(!allowedProject){const grants=await rest("client_project_access",{select:"project_id",project_id:`eq.${projectId}`,organization_id:`eq.${accessToken.organization_id}`,user_id:`eq.${user.id}`,revoked_at:"is.null",limit:"1"});allowedProject=grants.length>0}
  if(!allowedProject)return json({error:"project_access_denied"},403);
 }
 const contactName=[user.first_name,user.last_name].filter(Boolean).join(" ")||"Клиент";
 const source=quizType==="manual_request"?"mini_app_manual_request":quizType==="design"?"mini_app_design":"mini_app_quiz";
 const comment=String(quizType==="manual_request"?answers.request:answers.comment||"").slice(0,4000)||null;
 const city=String(answers.location||user.city||project?.city||"").slice(0,300)||null;
 const storedAnswers=requestId?{...answers,_request_id:requestId}:answers;
 let lead:any=null;
 let quiz:any=null;
 try{
   const leadRows=await insert("leads",{organization_id:accessToken.organization_id,source,name:contactName,phone:user.phone||null,comment,status:"new",telegram_user_id:user.telegram_user_id||null,app_user_id:user.id,city,quiz_type:quizType,payload:{answers,source:"client_cabinet",request_type:quizType,submitted_at:now},project_id:project?.id||null,pipeline_stage:"new"});
   lead=leadRows[0];
   const quizRows=await insert("quiz_submissions",{organization_id:accessToken.organization_id,user_id:user.id,project_id:project?.id||null,lead_id:lead?.id||null,telegram_user_id:user.telegram_user_id||null,quiz_type:quizType,source:"telegram_mini_app",answers:storedAnswers,contact_name:contactName,contact_phone:user.phone||null,city,preferred_channel:"telegram",status:project?"linked":"new"});
   quiz=quizRows[0];
 }catch(error){
   if(lead?.id){try{await remove("leads",{id:`eq.${lead.id}`,organization_id:`eq.${accessToken.organization_id}`})}catch(cleanupError){console.error("quiz cleanup",cleanupError)}}
   throw error;
 }
 await notifyOwnerLead(user,lead,quizType,answers,now);
 return json({ok:true,quiz,lead_id:lead?.id||null,access_unlocked:true});
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="GET"&&req.method!=="POST")return json({error:"method_not_allowed"},405);
 try{
  if(!SUPABASE_URL||!SERVICE_KEY)return json({error:"server_not_configured"},500);
  const body=req.method==="POST"?await req.json().catch(()=>({})):{};const url=new URL(req.url),token=String(url.searchParams.get("token")??body.token??"").trim(),initData=String(url.searchParams.get("initData")??body.initData??"").trim(),now=new Date().toISOString();
  let accessToken:any;
  if(token.length>=32){
   const hash=await sha256Hex(token);
   const tokenRows=await rest("client_portal_tokens",{select:"id,user_id,organization_id,expires_at",token_hash:`eq.${hash}`,revoked_at:"is.null",expires_at:`gt.${now}`,limit:"1"});
   if(!tokenRows.length)return json({error:"expired_or_invalid_token"},401);
   accessToken=tokenRows[0];await patch("client_portal_tokens",{id:`eq.${accessToken.id}`},{last_used_at:now});
  }else{
   const tg=await telegramUser(initData);
   const organizations=await rest("organizations",{select:"id",slug:"eq.timchenko-pro",limit:"1"});if(!organizations.length)throw new Error("organization_not_found");
   let users=await rest("app_users",{select:"id,first_name,last_name,phone,phone_normalized,phone_verified,role_verified,status,city,email,avatar_url,telegram_user_id,telegram_username,created_at",telegram_user_id:`eq.${Number(tg.id)}`,limit:"1"});
   if(!users.length)users=await insert("app_users",{telegram_user_id:Number(tg.id),telegram_username:tg.username??null,first_name:tg.first_name??null,last_name:tg.last_name??null,role:"client",status:"active",onboarding_complete:false,phone_verified:false,last_seen_at:now});
   else await patch("app_users",{id:`eq.${users[0].id}`},{telegram_username:tg.username??users[0].telegram_username,first_name:tg.first_name??users[0].first_name,last_name:tg.last_name??users[0].last_name,last_seen_at:now});
   accessToken={id:null,user_id:users[0].id,organization_id:organizations[0].id,expires_at:null};
  }
  const userRows=await rest("app_users",{select:"id,first_name,last_name,phone,phone_normalized,phone_verified,role_verified,status,city,email,avatar_url,telegram_user_id,telegram_username,created_at",id:`eq.${accessToken.user_id}`,limit:"1"});
  if(!userRows.length)return json({error:"user_not_found"},404);const user=userRows[0];
  const requestAction=String(body.action||"");

  const settingsRows=await rest("bot_settings",{select:"config",organization_id:`eq.${accessToken.organization_id}`,limit:"1"});
  const accessMode=settingsRows[0]?.config?.miniapp_access_mode??"approval";
  if(accessMode==="approval"){
    const ownerRows=user.telegram_user_id?await rest("platform_admins",{select:"id",telegram_user_id:`eq.${user.telegram_user_id}`,is_active:"eq.true",limit:"1"}):[];
    if(!ownerRows.length&&!user.role_verified){
      const accessParams:Record<string,string>={select:"id,status,requested_at,reviewed_at",organization_id:`eq.${accessToken.organization_id}`,order:"requested_at.desc",limit:"1"};
      if(user.telegram_user_id)accessParams.or=`(user_id.eq.${user.id},telegram_user_id.eq.${user.telegram_user_id})`;else accessParams.user_id=`eq.${user.id}`;
      const approvalRows=await rest("miniapp_access_requests",accessParams);
      let approval=approvalRows[0]??null;
      if(!approval||approval.status==="approved"||approval.status==="revoked"){
        const created=await insert("miniapp_access_requests",{organization_id:accessToken.organization_id,user_id:user.id,telegram_user_id:user.telegram_user_id,telegram_username:user.telegram_username??null,first_name:user.first_name??null,last_name:user.last_name??null,phone:user.phone??null,status:"pending",requested_at:now});
        approval=created[0]??{status:"pending",requested_at:now};
        await notifyOwnerAccessRequest(user);
      }
      const code=approval.status==="rejected"?"access_rejected":"access_pending";
      return json({error:code,access:{status:approval.status,requested_at:approval.requested_at,reviewed_at:approval.reviewed_at}},403);
    }
  }
  if(req.method==="POST"){if(requestAction==="quiz.submit")return await submitCabinetQuiz(body,accessToken,user,now);return json({error:"unknown_action"},400)}

  const projectSelect="id,title,address,city,area_m2,floors,bathrooms,status,current_stage,progress_percent,planned_start,planned_finish,budget_estimate,paid_amount,updated_at,client_user_id,client_phone_normalized";
  const projectParams:Record<string,string>={select:projectSelect,organization_id:`eq.${accessToken.organization_id}`,order:"updated_at.desc"};
  if(user.phone_verified&&user.phone_normalized)projectParams.or=`(client_user_id.eq.${user.id},client_phone_normalized.eq.${user.phone_normalized})`;else projectParams.client_user_id=`eq.${user.id}`;
  const directProjects=await rest("projects",projectParams);
  const accessRows=await rest("client_project_access",{select:"project_id,can_view_progress,can_view_media,can_view_documents,can_view_payments,can_approve,can_request_service",organization_id:`eq.${accessToken.organization_id}`,user_id:`eq.${user.id}`,revoked_at:"is.null"});
  const accessByProject=new Map<string,any>();for(const a of accessRows)accessByProject.set(a.project_id,a);
  const directIds=new Set(directProjects.map((p:any)=>p.id)),extraIds=accessRows.map((a:any)=>a.project_id).filter((id:string)=>!directIds.has(id));let extraProjects:any[]=[];
  if(extraIds.length)extraProjects=await rest("projects",{select:projectSelect,organization_id:`eq.${accessToken.organization_id}`,id:`in.(${extraIds.join(",")})`,order:"updated_at.desc"});
  const seen=new Set<string>(),baseProjects=[...directProjects,...extraProjects].filter((p:any)=>{if(seen.has(p.id))return false;seen.add(p.id);return true});
  const projects=await Promise.all(baseProjects.map(async(p:any)=>{
    const explicit=accessByProject.get(p.id),permissions=explicit??{can_view_progress:true,can_view_media:true,can_view_documents:true,can_view_payments:true,can_approve:false,can_request_service:true};
    const progressData=permissions.can_view_progress;
    const procurementData=permissions.can_view_payments;
    const [stages,estimates,zones,systems,nodes,works,project_materials,purchase_orders]=await Promise.all([
      progressData?rest("project_stages",{select:"id,name,system,description,sort_order,status,progress_percent,planned_start,planned_finish,actual_start,actual_finish,budget_amount,visibility",project_id:`eq.${p.id}`,visibility:"in.(client,all)",order:"sort_order.asc"}):Promise.resolve([]),
      rest("estimates",{select:"id,title,status,labor_total,mat_total,equipment_total,discount_total,version,pdf_document_id,stage_id,visibility,updated_at",project_id:`eq.${p.id}`,visibility:"in.(client,all)",order:"updated_at.desc",limit:"20"}),
      progressData?rest("zones",{select:"id,parent_zone_id,name,zone_type,code,sort_order",project_id:`eq.${p.id}`,order:"sort_order.asc",limit:"500"}):Promise.resolve([]),
      progressData?rest("systems",{select:"id,zone_id,parent_system_id,name,system_type,status,code,updated_at",project_id:`eq.${p.id}`,order:"created_at.asc",limit:"300"}):Promise.resolve([]),
      progressData?rest("nodes",{select:"id,system_id,zone_id,parent_node_id,name,node_type,status,code,manufacturer,model,installed_at,commissioned_at,updated_at",project_id:`eq.${p.id}`,order:"created_at.asc",limit:"1000"}):Promise.resolve([]),
      progressData?rest("works",{select:"id,zone_id,system_id,node_id,stage_id,parent_work_id,title,description,status,unit,planned_quantity,completed_quantity,planned_start,planned_finish,actual_start,actual_finish,sort_order,updated_at",project_id:`eq.${p.id}`,order:"sort_order.asc",limit:"1000"}):Promise.resolve([]),
      progressData?rest("project_materials",{select:"id,zone_id,system_id,node_id,work_id,catalog_item_id,name_snap,unit,required_quantity,reserved_quantity,ordered_quantity,delivered_quantity,installed_quantity,status,updated_at",project_id:`eq.${p.id}`,order:"created_at.asc",limit:"1000"}):Promise.resolve([]),
      procurementData?rest("purchase_orders",{select:"id,supplier_id,material_request_id,order_number,supplier_name,status,currency,subtotal,delivery_cost,total_amount,ordered_at,expected_at,delivered_at,updated_at",project_id:`eq.${p.id}`,order:"created_at.desc",limit:"300"}):Promise.resolve([])
    ]);
    let purchase_items:any[]=[];
    if(procurementData&&purchase_orders.length){
      const orderIds=purchase_orders.map((order:any)=>order.id);
      purchase_items=await rest("purchase_items",{select:"id,purchase_order_id,project_material_id,catalog_item_id,name_snap,unit,quantity,delivered_quantity,unit_price,total,created_at",purchase_order_id:`in.(${orderIds.join(",")})`,order:"created_at.asc",limit:"2000"});
    }
    let payments:any[]=[];if(permissions.can_view_payments)payments=await rest("payments",{select:"id,stage_id,amount,payment_type,status,due_date,paid_at,note,created_at",project_id:`eq.${p.id}`,order:"created_at.desc",limit:"50"});
    let documents:any[]=[];if(permissions.can_view_documents){const docs=await rest("documents",{select:"id,stage_id,document_type,title,storage_path,external_url,status,version,visibility,created_at,updated_at",project_id:`eq.${p.id}`,visibility:"in.(client,all)",order:"updated_at.desc",limit:"100"});documents=await Promise.all(docs.map(async(d:any)=>({...d,url:d.external_url||await signedUrl("project-documents",d.storage_path),storage_path:undefined})))}
    let media:any[]=[];if(permissions.can_view_media){const rows=await rest("project_media",{select:"id,stage_id,media_type,storage_path,file_name,mime_type,stage,caption,visibility,created_at",project_id:`eq.${p.id}`,visibility:"in.(client,all)",order:"created_at.desc",limit:"120"});media=await Promise.all(rows.map(async(x:any)=>({...x,url:await signedUrl("project-media",x.storage_path),storage_path:undefined})))}
    const clean={...p};delete clean.client_user_id;delete clean.client_phone_normalized;return{...clean,permissions,stages,estimates,payments,documents,media,zones,systems,nodes,works,project_materials,purchase_orders,purchase_items};
  }));
  const [quizzes,quiz_catalog]=await Promise.all([rest("quiz_submissions",{select:"id,quiz_type,answers,status,project_id,created_at",organization_id:`eq.${accessToken.organization_id}`,user_id:`eq.${user.id}`,order:"created_at.desc",limit:"20"}),loadQuizCatalog(accessToken.organization_id)]);
  const profileRows=await rest("documents",{select:"id,document_type,title,storage_path,external_url,status,version,visibility,created_at,updated_at,metadata",organization_id:`eq.${accessToken.organization_id}`,owner_user_id:`eq.${user.id}`,project_id:"is.null",visibility:"in.(client,all)",order:"updated_at.desc",limit:"50"});
  const profile_documents=await Promise.all(profileRows.map(async(d:any)=>({...d,url:d.external_url||await signedUrl("project-documents",d.storage_path),storage_path:undefined})));
  return json({ok:true,generated_at:now,token_expires_at:accessToken.expires_at,identity:{project_lookup:user.phone_verified&&user.phone_normalized?"verified_phone":"user_id",phone_verified:!!user.phone_verified},profile:user,projects,quizzes,quiz_catalog,profile_documents});
 }catch(error){const code=error instanceof Error?error.message:"internal_error";console.error(error);const status=code.startsWith("telegram_")?401:500;return json({error:code},status)}
});
