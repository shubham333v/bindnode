const {Dbs,LDbs}=require("./modules/database");
const express=require('express');
const app=express();
const CON_PORT=3005;
const {v4:uuidv4,v1:uuidv1,validate}=require("uuid");
const WebRes=require("./support/js/webres");
const cron=require('node-cron');
const {isString,areStrings,randomString,genSid,addZero,getCrTimDt,getCrDt,getDfDt,DtToInt,isEmail}=require("./modules/functions.js");
const fs=require('fs');

app.use(express.json({limit:'2mb'}));
app.use("/support",express.static(__dirname+"/support"));
app.use("/panels",express.static(__dirname+"/panels"));
app.use("/cont",express.static(__dirname+"/cont"));
app.use("/tpanels",express.static(__dirname+"/panels/custumer/"));
app.use("/module",express.static(__dirname+"/node_modules/"));

app.use(function(req,res,next){
  res.header('Access-Control-Allow-Origin',"*");
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
  res.header('reqid',req.headers.reqid);
  res.header('path',req.headers.path);
  let rpp=req._parsedUrl.pathname;let port=req.headers.port||"P";port=((port==""||port=="null")?"P":port);
  if(valAuth(port,rpp))return next();else failAuth(req,res,WebRes.CCD.NA,"public");
});
/////////////////////////////////////////////
/////////////////////////////////////////////
//            DATABASE init
/////////////////////////////////////////////
/////////////////////////////////////////////
global.DBNAME="kdgb";
global.ldbs=new LDbs();

global.dbs=new Dbs();
/////////////////////////////////////////////
/////////////////////////////////////////////
//            FUNCTIONS
/////////////////////////////////////////////
/////////////////////////////////////////////
function valAuth(rwm,url){if(rwm=="X")return true;
  let PAuth=["/","/favicon.ico","/lcredin","/jobs/list","/edu/list","/posts/list","/reg/usr","/my/info","/my/info/update","/my/prof/update","/my/prof","/my/posts/list","/my/posts/new/create","/my/posts/delete","/my/jobs/list"];
  if(rwm=="P"||(rwm>=0&&rwm<=2)){for(let i=0;i<PAuth.length;i++)if(PAuth[i]==url)return true; }//public
  return false;
}
function failAuth(req,res,rgn,typ){res.set("auth",false);res.set("authtype",typ);res.set("reasion",rgn);res.end(); }
function parseSend(a,b,c){return JSON.stringify({"res":a,data:b,extra:c}); }
//////////////////////////////////////////////////////////////////////
///////////// ARRAY END
/////////////////////////////////////////////////////////////////////
function chnSid(req,res,ax,bx,atp="login"){let sid=genSid();if(ax)return failAuth(req,res,ax,atp);if(bx.length<1)return failAuth(req,res,"session expired",atp);let cb=bx[0];let uid=cb.uid;global.dbs.mysql.query("UPDATE creds SET sid='"+sid+"' WHERE id='"+cb.id+"';",(a2,b2)=>{if(a2)return failAuth(req,res,a2,atp);res.set("sid",sid);res.set("auth",true);res.set("nme",cb.nme);res.set("uid",uid+"");res.set("port",cb.usr_port);res.set("authtype",atp);return res.end(JSON.stringify({"res":null,data:bx} )); }); }

app.post("/lcredin",(req,res)=>{let bdy=req.body;let uid=bdy.uid,sid=bdy.sid,pass=bdy.pass;if(typeof uid!="string")return failAuth(req,res,WebRes.CCD.INP,"login");
  if(typeof sid=="string"){global.dbs.mysql.query("SELECT id,uid,nme,usr_tag,sid,usr_port,usr_logo,usr_eml_val,usr_gen FROM creds WHERE uid='"+uid+"' AND sid='"+sid+"';",(a,b)=>chnSid(req,res,a,b,"session"),global.ldbs._GET);return; };
  if(typeof pass=="string"){global.dbs.mysql.query("SELECT id,uid,nme,usr_tag,sid,usr_port,usr_logo,usr_eml_val,usr_gen FROM creds WHERE uid='"+uid+"' AND pass='"+pass+"';",(a,b)=>{chnSid(req,res,a,b,"login"); });return; };return failAuth(req,res,WebRes.CCD.INP,"login"); });

app.post("/usr/password/update",(req,res)=>{let bdy=req.body;let uid=req.headers.uid,nPass=bdy.nPass,oPass=bdy.oPass;
  if(!areStrings([uid,nPass]))return res.end(parseSend(WebRes.CCD.INP,null));
  if(nPass.length<6)return res.end(WebRes.CCD.LCN);if(nPass.length>11)return res.end(WebRes.CCD.MCN);
global.ldbs.query("SELECT*FROM creds WHERE uid='"+uid+"' AND pass='"+oPass+"';",(a,b)=>{if(a)return res.end(parseSend(WebRes.CCD.DE));if(!b)return res.end(parseSend(WebRes.CCD.UNF));global.ldbs.query("UPDATE creds SET pass='"+nPass+"' WHERE uid='"+uid+"' AND pass='"+oPass+"';",(aa,bb)=>{if(aa)return res.end(parseSend(WebRes.CCD.DE));res.end(parseSend(null,null)); },global.ldbs._RUN); },global.ldbs._GET);return; });
/////////////////////////////////////////////
/////////////////////////////////////////////
//            Registration
/////////////////////////////////////////////
/////////////////////////////////////////////
app.post("/reg/usr",(req,res)=>{let bdy=req.body;let port=parseInt(bdy.port)||0;if(port>2)port=0;
  if(bdy.uid.length<3)return res.end(parseSend(WebRes.CCD.INV_UID,null));let uid=bdy.uid.toLowerCase();
  if(!isEmail(bdy.eml))return res.end(parseSend(WebRes.CCD.INV_EML,null));let eml=bdy.eml.toLowerCase();
  if(bdy.nme.length<5)return res.end(parseSend(WebRes.CCD.INV_NME,null));
  if(bdy.pass.length<8)return res.end(parseSend(WebRes.CCD.LCN,null));
  global.dbs.mysql.query("INSERT INTO creds(uid,nme,pass,usr_port,usr_eml)VALUES('"+uid+"','"+bdy.nme+"','"+bdy.pass+"',"+bdy.port+",'"+eml+"')",(a,b)=>{console.log(a,b);res.end(parseSend(a,b)); }); });
/////////////////////////////////////////////
/////////////////////////////////////////////
//            My
/////////////////////////////////////////////
/////////////////////////////////////////////
app.post("/my/info",(req,res)=>{let usr={uid:req.headers.uid,sid:req.headers.sid};global.dbs.mysql.query("SELECT nme,usr_tag,pass,usr_port,usr_mn,usr_eml,usr_eml_val,usr_abm,usr_edu,usr_edu_str,usr_edu_stt,usr_res,usr_skl,usr_sm_lin,usr_sm_fb,usr_sm_inst,usr_sm_git,usr_wrk_nme,usr_wrk_ind FROM creds WHERE uid='"+usr.uid+"' AND sid='"+usr.sid+"';",(a,b)=>{res.end(parseSend(a,b)); }); });

app.post("/my/info/update",(req,res)=>{let usr={uid:req.headers.uid,sid:req.headers.sid};let bdy=req.body;let q="";
let cqs="UPDATE creds SET usr_tag='"+bdy.usr_tag+"',nme='"+bdy.nme+"',usr_gen='"+bdy.usr_gen+"',usr_mn='"+bdy.usr_mn+"',usr_abm='"+bdy.usr_abm+"',usr_sm_lin='"+bdy.usr_sm_lin+"',usr_sm_fb='"+bdy.usr_sm_fb+"',usr_sm_inst='"+bdy.usr_sm_inst+"',usr_sm_git='"+bdy.usr_sm_git+"',";
let cqe=" WHERE uid='"+usr.uid+"' AND sid='"+usr.sid+"';";
if(bdy.usr_typ==0)q=cqs+"usr_edu="+bdy.usr_edu+"',usr_edu_str='"+bdy.usr_edu_str+"',usr_edu_stt='"+bdy.usr_edu_stt+"',usr_skl='"+bdy.usr_skl+"'"+cqe;
if(bdy.usr_typ==1)q=q=cqs+"usr_wrk_ind='"+bdy.usr_wrk_ind+"',usr_wrk_nme='"+bdy.usr_wrk_nme+"'"+cqe;
if(bdy.usr_typ==2)q=q=cqs+"usr_wrk_ind='"+bdy.usr_wrk_ind+"',usr_wrk_nme='"+bdy.usr_wrk_nme+"'"+cqe;

global.dbs.mysql.query(q,(a,b)=>{res.end(parseSend(a,b)); }); });

app.post("/my/prof",(req,res)=>{let usr={uid:req.headers.uid,sid:req.headers.sid},bdy=req.body;
global.dbs.mysql.query("SELECT usr_res,usr_logo FROM creds WHERE uid='"+usr.uid+"' AND sid='"+usr.sid+"';",(a,b)=>{res.end(parseSend(a,b)); }); });

app.post("/my/prof/update",(req,res)=>{let usr={uid:req.headers.uid,sid:req.headers.sid},bdy=req.body;
global.dbs.mysql.query("UPDATE creds SET "+bdy.nme+"='"+bdy.ex.data+"' WHERE uid='"+usr.uid+"' AND sid='"+usr.sid+"';",(a,b)=>{res.end(parseSend(a,{nme:bdy.nme,proc:{affectedRows:b&&(b.affectedRows>0)}} )); }); });

app.post("/my/posts/list",(req,res)=>{let usr={uid:req.headers.uid,sid:req.headers.sid};
global.dbs.mysql.query("SELECT creds.uid as ps_usr_id,ps_id,creds.usr_logo as ps_usr_logo,creds.usr_tag as ps_usr_tag,creds.usr_port as ps_usr_port,ps_dte,ps_id,ps_cnt FROM creds JOIN posts ON posts.ps_usr_id=creds.id WHERE uid='"+usr.uid+"' AND sid='"+usr.sid+"';",(a,b)=>{res.end(parseSend(a,b)); }); });

app.post("/my/posts/new/create",(req,res)=>{let usr={uid:req.headers.uid,sid:req.headers.sid},bdy=req.body;
global.dbs.mysql.query("SELECT creds.id,creds.uid FROM creds WHERE uid='"+usr.uid+"' AND sid='"+usr.sid+"';",(a,b)=>{if(a||b.length<1)return res.end(parseSend(a,b));let sb=b[0];
global.dbs.mysql.query("INSERT INTO posts(ps_usr_id,ps_usr_uid,ps_cnt)VALUES('"+sb.id+"','"+sb.uid+"','"+JSON.stringify(bdy.cnt)+"')",(a1,b1)=>{res.end(parseSend(a1,b1)); }); }); });

app.post("/my/posts/delete",(req,res)=>{let usr={uid:req.headers.uid,sid:req.headers.sid},bdy=req.body;if(!bdy.id)return res.end(parseSend(WebRes.CCD.INP));
global.dbs.mysql.query("SELECT creds.id,creds.uid FROM creds WHERE uid='"+usr.uid+"' AND sid='"+usr.sid+"';",(a,b)=>{if(a||b.length<1)return res.end(parseSend(a,b));let sb=b[0];
global.dbs.mysql.query("INSERT INTO posts_bak SELECT*FROM posts WHERE posts.ps_usr_id="+sb.id+" AND posts.ps_id="+bdy.id+";DELETE FROM posts WHERE ps_usr_id="+sb.id+" AND ps_id="+bdy.id+";",(a1,b1)=>{res.end(parseSend(a1,b1)); }); }); });

app.post("/my/jobs/list",(req,res)=>{let usr={uid:req.headers.uid,sid:req.headers.sid};
global.dbs.mysql.query("SELECT creds.uid as ps_usr_id,creds.usr_logo as ps_usr_logo,creds.usr_tag as ps_usr_tag,creds.usr_port as ps_usr_port,jobs.* FROM creds JOIN jobs ON jobs.jb_usr_id=creds.id WHERE uid='"+usr.uid+"' AND sid='"+usr.sid+"';",(a,b)=>{res.end(parseSend(a,b)); }); });
/////////////////////////////////////////////
/////////////////////////////////////////////
//            Job
/////////////////////////////////////////////
/////////////////////////////////////////////
app.post("/jobs/list",(req,res)=>{let bdy=req.body;let cur=bdy.cur||0;let inc=bdy.inc||25;global.dbs.mysql.query("SELECT*FROM jobs LIMIT "+cur+","+inc,(a,b)=>{res.end(parseSend(a,b)); }); });
/////////////////////////////////////////////
/////////////////////////////////////////////
//            Education
/////////////////////////////////////////////
/////////////////////////////////////////////
app.post("/edu/list",(req,res)=>{global.dbs.mysql.query("SELECT edu_nme FROM education ORDER BY edu_nme;",(a,b)=>{res.end(parseSend(a,b)); }); });
/////////////////////////////////////////////
/////////////////////////////////////////////
//            Posts
/////////////////////////////////////////////
/////////////////////////////////////////////
app.post("/posts/list",(req,res)=>{let bdy=req.body;let cur=bdy.cur||0;let inc=bdy.inc||25;
  global.dbs.mysql.query("SELECT creds.uid as ps_usr_id,ps_id,creds.usr_logo as ps_usr_logo,creds.usr_tag as ps_usr_tag,creds.usr_port as ps_usr_port,ps_dte,ps_id,ps_cnt FROM posts JOIN creds ON creds.id=posts.ps_usr_id LIMIT "+cur+","+inc,(a,b)=>{res.end(parseSend(a,b)); }); });
/////////////////////////////////////////////
/////////////////////////////////////////////
//            EXTRAS
/////////////////////////////////////////////
/////////////////////////////////////////////
app.get('/favicon.ico',(req,res)=>{res.sendFile(__dirname+'/cont/logo.png'); });
app.get('/',(req,res)=>{res.sendFile(__dirname+"/panels/main/index.html"); });

app.listen(CON_PORT,()=>{console.log(CON_PORT); });