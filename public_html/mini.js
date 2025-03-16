const fs = require('fs');
const Log=require("./modules/log");
const compressor = require('node-minify');
const OutDir=__dirname+"/panels";
const BindFilNme=__dirname+"/build/binded.jsx";
const MinFilNme=OutDir+"/binded.jsx";
Log.info("Minifying started",BindFilNme);

const UglifyJS = require("uglify-js");
/*compressor.minify({compressor:'uglifyjs',input:BindFilNme,output:MinFilNme,callback:function(err,min){if(err)return console.log("Error",err);
    console.log("mini",min);
//    fs.writeFile(MinFilNme,min,{flag:'a+'},(err)=>{ });
 } });*/

async function minify(){let cnt=await fs.readFileSync(BindFilNme,"utf-8");let res=UglifyJS.minify(cnt);if(res.error)return console.log(res.error);
fs.writeFile(MinFilNme,res.code,{},()=>{}); }

minify();