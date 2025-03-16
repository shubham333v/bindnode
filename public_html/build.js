const bcr=require("@babel/core");
const fs = require('fs');
const path=require("path");
const Log=require("./modules/log");
const InDir=__dirname+"/_panels";
const OutDir=__dirname+"/build/panels";

if(!fs.existsSync(OutDir))fs.mkdir(OutDir,{recursive: true},()=>{});

//fs.readdir(OutDir,(err,files)=>{if(err)throw err;for(let file of files){console.log(file);fs.unlink(path.join(OutDir,file),(err)=>{if(err)console.log("Emptying Build Error..",err); }); } });

async function unlDir(a){let fns=await fs.readdirSync(a,{withFileTypes:true});
for(fn of fns){let cf=fn.path+"/"+fn.name;let cfb=cf.replace(InDir,OutDir);if(fn.isDirectory()){unlDir(cf); }
  if(fn.isFile()){console.log("Clearing...",cfb);await fs.unlink(cf,(err)=>{if(err)console.log("Emptying Build Error..",err); }); } } }

async function buildPath(cfb,cf,cnt){let bct=await bcr.transformSync(cnt,{plugins:["@babel/plugin-transform-react-jsx"] },()=>{});console.log(cf,cfb);await fs.writeFile(cfb,bct.code,{},()=>{}); }

async function readPath(cf,cfb,pe){let cnt=await fs.readFileSync(cf,"utf-8");if(pe==".JSX"){await buildPath(cfb,cf,cnt); }else fs.writeFile(cfb,cnt,{},()=>{}); }

async function treeDir(a){let fns=await fs.readdirSync(a,{withFileTypes:true}); 
for(fn of fns){let cf=fn.path+"/"+fn.name;let cfb=cf.replace(InDir,OutDir);if(fn.isDirectory()){fs.mkdir(cfb,{},()=>{});treeDir(cf);continue; };
let pe=path.extname(cf).toUpperCase();await readPath(cf,cfb,pe); }; }

Log.info(__dirname,"Clearing started");


unlDir(OutDir).then(()=>{Log.info(__dirname,"Building started");treeDir(InDir); });

