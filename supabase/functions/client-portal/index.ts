import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? Deno.env.get("BOT_TOKEN") ?? "";
const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET, OPTIONS"};
const encoder = new TextEncoder();
function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}})}
async function sha256Hex(value:string){const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("")}
async function hmac(key:Uint8Array,value:string){const cryptoKey=await crypto.subtle.importKey("raw",key,{name:"HMAC",hash:"SHA-256"},false,["sign"]);return new Uint8Array(await crypto.subtle.sign("HMAC",cryptoKey,encoder.encode(value)))}
function hex(bytes:Uint8Array){return Array.from(bytes).map(b=>b.toString(16).padStart(2,"0")).join("")}
async function telegramUser(initData:string){
 if(!BOT_TOKEN)throw new Error("bot_token_not_configured");
 const params=new URLSearchParams(initData),received=params.get("hash")??"",authDate=Number(params.get("auth_date")??0);
 if(!received||!authDate)throw new Error("telegram_auth_required");
 if(Math.abs(Math.floor(Date.now()/1000)-authDate)>86400)throw new Error("telegram_initdata_expired");
 const rows:string[]=[];params.forEach((value,key)=>{if(key!=="hash"&&key!=="signature")rows.push(`${key}=${value}`)});rows.sort();
 const secret=await hmac(encoder.encode("WebAppData"),BOT_TOKEN),calculated=hex(await hmac(secret,rows.join("\n")));
 if(calculated!==received.toLowerCase())throw new Error("telegram_signature_invalid");
 const user=JSON.parse(params.get("user")??"{}");if(!user?.id||user.is_bot)throw new Error("telegram_user_missing");return user;
}
async function rest(table:string,params:Record<string,string>){const qs=new URLSearchParams(params);const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`,{headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`}});if(!r.ok)throw new Error(`${table}: ${r.status} ${await r.text()}`);return await r.json()}
async function patch(table:string,params:Record<string,string>,body:unknown){const qs=new URLSearchParams(params);const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`,{method:"PATCH",headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(body)});if(!r.ok)throw new Error(`${table} patch: ${r.status} ${await r.text()}`)}
async function insert(table:string,body:unknown,params:Record<string,string>={}){const qs=new URLSearchParams(params);const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`,{method:"POST",headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(body)});if(!r.ok)throw new Error(`${table} insert: ${r.status} ${await r.text()}`);return await r.json()}
function tgEsc(value:unknown){return String(value??"").replace(/[&<>]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[ch]??ch))}
async function notifyOwnerAccessRequest(user:any){if(!BOT_TOKEN)return;try{const admins=await rest("platform_admins",{select:"telegram_user_id",is_active:"eq.true"});const name=[user.first_name,user.last_name].filter(Boolean).join(" ")||"Без имени",username=user.telegram_username?`@${user.telegram_username}`:"без username",phone=user.phone||"без телефона";const text=`🔐 <b>Запрос доступа к кабинету</b>\n\nКлиент: <b>${tgEsc(name)}</b>\nTelegram: ${tgEsc(username)}\nТелефон: ${tgEsc(phone)}\n\nОткройте Mini App → «Доступ», чтобы подтвердить или отклонить.`;await Promise.allSettled(admins.map((a:any)=>fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:a.telegram_user_id,text,parse_mode:"HTML"})})))}catch(error){console.error("owner access notification",error)}}
function safePath(path:string){return path.split("/").filter(Boolean).map(encodeURIComponent).join("/")}
async function signedUrl(bucket:string,path:string|null,expiresIn=3600){if(!path)return null;const r=await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${bucket}/${safePath(path)}`,{method:"POST",headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({expiresIn})});if(!r.ok)return null;const data=await r.json();const p=data.signedURL??data.signedUrl??null;if(!p)return null;return p.startsWith("http")?p:`${SUPABASE_URL}/storage/v1${p}`}

Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="GET")return json({error:"method_not_allowed"},405);
 try{
  if(!SUPABASE_URL||!SERVICE_KEY)return json({error:"server_not_configured"},500);
  const url=new URL(req.url),token=(url.searchParams.get("token")??"").trim(),initData=(url.searchParams.get("initData")??"").trim(),now=new Date().toISOString();
  let accessToken:any;
  if(token.length>=32){
   const hash=await sha256Hex(token);
   const tokenRows=await rest("client_portal_tokens",{select:"id,user_id,organization_id,expires_at",token_hash:`eq.${hash}`,revoked_at:"is.null",expires_at:`gt.${now}`,limit:"1"});
   if(!tokenRows.length)return json({error:"expired_or_invalid_token"},401);
   accessToken=tokenRows[0];await patch("client_portal_tokens",{id:`eq.${accessToken.id}`},{last_used_at:now});
  }else{
   const tg=await telegramUser(initData);
   const organizations=await rest("organizations",{select:"id",slug:"eq.timchenko-pro",limit:"1"});if(!organizations.length)throw new Error("organization_not_found");
   let users=await rest("app_users",{select:"id,first_name,last_name,phone,phone_normalized,phone_verified,city,email,avatar_url,telegram_user_id,telegram_username,created_at",telegram_user_id:`eq.${Number(tg.id)}`,limit:"1"});
   if(!users.length)users=await insert("app_users",{telegram_user_id:Number(tg.id),telegram_username:tg.username??null,first_name:tg.first_name??null,last_name:tg.last_name??null,role:"client",status:"active",onboarding_complete:false,phone_verified:false,last_seen_at:now});
   else await patch("app_users",{id:`eq.${users[0].id}`},{telegram_username:tg.username??users[0].telegram_username,first_name:tg.first_name??users[0].first_name,last_name:tg.last_name??users[0].last_name,last_seen_at:now});
   accessToken={id:null,user_id:users[0].id,organization_id:organizations[0].id,expires_at:null};
  }
  const userRows=await rest("app_users",{select:"id,first_name,last_name,phone,phone_normalized,phone_verified,city,email,avatar_url,telegram_user_id,telegram_username,created_at",id:`eq.${accessToken.user_id}`,limit:"1"});
  if(!userRows.length)return json({error:"user_not_found"},404);const user=userRows[0];

  const settingsRows=await rest("bot_settings",{select:"config",organization_id:`eq.${accessToken.organization_id}`,limit:"1"});
  const accessMode=settingsRows[0]?.config?.miniapp_access_mode??"approval";
  if(accessMode==="approval"){
    const ownerRows=user.telegram_user_id?await rest("platform_admins",{select:"id",telegram_user_id:`eq.${user.telegram_user_id}`,is_active:"eq.true",limit:"1"}):[];
    if(!ownerRows.length){
      const approvalRows=await rest("miniapp_access_requests",{select:"id,status,requested_at,reviewed_at",organization_id:`eq.${accessToken.organization_id}`,user_id:`eq.${user.id}`,limit:"1"});
      let approval=approvalRows[0]??null;
      if(!approval){
        const created=await insert("miniapp_access_requests",{organization_id:accessToken.organization_id,user_id:user.id,telegram_user_id:user.telegram_user_id,telegram_username:user.telegram_username??null,first_name:user.first_name??null,last_name:user.last_name??null,phone:user.phone??null,status:"pending"});
        approval=created[0]??{status:"pending",requested_at:now};
        await notifyOwnerAccessRequest(user);
      }
      if(approval.status!=="approved"){
        const code=approval.status==="rejected"?"access_rejected":approval.status==="revoked"?"access_revoked":"access_pending";
        return json({error:code,access:{status:approval.status,requested_at:approval.requested_at,reviewed_at:approval.reviewed_at}},403);
      }
    }
  }

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
    const [stages,estimates]=await Promise.all([
      permissions.can_view_progress?rest("project_stages",{select:"id,name,system,description,sort_order,status,progress_percent,planned_start,planned_finish,actual_start,actual_finish,budget_amount,visibility",project_id:`eq.${p.id}`,visibility:"in.(client,all)",order:"sort_order.asc"}):Promise.resolve([]),
      rest("estimates",{select:"id,title,status,labor_total,mat_total,equipment_total,discount_total,version,pdf_document_id,stage_id,visibility,updated_at",project_id:`eq.${p.id}`,visibility:"in.(client,all)",order:"updated_at.desc",limit:"20"})
    ]);
    let payments:any[]=[];if(permissions.can_view_payments)payments=await rest("payments",{select:"id,stage_id,amount,payment_type,status,due_date,paid_at,note,created_at",project_id:`eq.${p.id}`,order:"created_at.desc",limit:"50"});
    let documents:any[]=[];if(permissions.can_view_documents){const docs=await rest("documents",{select:"id,stage_id,document_type,title,storage_path,external_url,status,version,visibility,created_at,updated_at",project_id:`eq.${p.id}`,visibility:"in.(client,all)",order:"updated_at.desc",limit:"100"});documents=await Promise.all(docs.map(async(d:any)=>({...d,url:d.external_url||await signedUrl("project-documents",d.storage_path),storage_path:undefined})))}
    let media:any[]=[];if(permissions.can_view_media){const rows=await rest("project_media",{select:"id,stage_id,media_type,storage_path,file_name,mime_type,stage,caption,visibility,created_at",project_id:`eq.${p.id}`,visibility:"in.(client,all)",order:"created_at.desc",limit:"120"});media=await Promise.all(rows.map(async(x:any)=>({...x,url:await signedUrl("project-media",x.storage_path),storage_path:undefined})))}
    const clean={...p};delete clean.client_user_id;delete clean.client_phone_normalized;return{...clean,permissions,stages,estimates,payments,documents,media};
  }));
  const quizzes=await rest("quiz_submissions",{select:"id,quiz_type,answers,status,project_id,created_at",organization_id:`eq.${accessToken.organization_id}`,user_id:`eq.${user.id}`,order:"created_at.desc",limit:"20"});
  const profileRows=await rest("documents",{select:"id,document_type,title,storage_path,external_url,status,version,visibility,created_at,updated_at,metadata",organization_id:`eq.${accessToken.organization_id}`,owner_user_id:`eq.${user.id}`,project_id:"is.null",visibility:"in.(client,all)",order:"updated_at.desc",limit:"50"});
  const profile_documents=await Promise.all(profileRows.map(async(d:any)=>({...d,url:d.external_url||await signedUrl("project-documents",d.storage_path),storage_path:undefined})));
  return json({ok:true,generated_at:now,token_expires_at:accessToken.expires_at,identity:{project_lookup:user.phone_verified&&user.phone_normalized?"verified_phone":"user_id",phone_verified:!!user.phone_verified},profile:user,projects,quizzes,profile_documents});
 }catch(error){const code=error instanceof Error?error.message:"internal_error";console.error(error);const status=code.startsWith("telegram_")?401:500;return json({error:code},status)}
});
