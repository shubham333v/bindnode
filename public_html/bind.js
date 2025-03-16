const fs = require('fs');
const path=require("path");
const Log=require("./modules/log");
const OutDir=__dirname+"/panels";
const InDir=__dirname+"/build/panels";
const BindFilNme=__dirname+"/build/binded.jsx";
Log.info(__dirname,"Binding started");

prio=["/var/www/soc.kdgb/public_html/build/panels/comps/structure.jsx"];

if(!fs.existsSync(OutDir))fs.mkdir(OutDir,{recursive:true},()=>{fs.writeFile(BindFilNme,"",{},()=>{}); });else fs.writeFile(BindFilNme,"",{},()=>{});

treeDir=(a)=>{
  fs.readdir(a,{withFileTypes:true},(e,fns)=>{if(e){Log.err(__filename,e);return; }
    fns.forEach(function(fn){let cf=fn.path+"/"+fn.name;let cfb=cf.replace(InDir,OutDir);let ind=prio.indexOf(cf);
    if(fn.isDirectory()){fs.mkdir(cfb,{},()=>{});treeDir(cf); };
    if(fn.isFile()&&ind<0){let pe=path.extname(cf).toUpperCase();
      fs.readFile(cf,"utf-8",(err,cnt)=>{if(err){Log.err(__filename,err);return; };
      if(pe==".JSX"){console.log(__dirname,"Binding...",cf);fs.writeFile(BindFilNme,cnt,{flag:'a+'},(err)=>{ }); }else fs.writeFile(cfb,cnt,{},()=>{}); }); }
    });
   });
  }
    

  prio.forEach(function(fd){fs.readFile(fd,"utf-8",(err,cnt)=>{if(err){Log.err(__filename,err);return; };
    console.log(__dirname,"Binding... PRIO",fd);fs.writeFile(BindFilNme,cnt,{flag:'a+'},(err)=>{ }); }); });
treeDir(InDir);console.log("Prio",prio.length);