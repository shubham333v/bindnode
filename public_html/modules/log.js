const fs=require('fs');
const {getCrTimDt}=require('../modules/functions');
const LogDir=__dirname+"/../log/";  

if(!fs.existsSync(LogDir)){Log.ign("Creating log dir");fs.mkdirSync(LogDir); }

const Log={parseArg:(a,c)=>{let b=[];for(let i=0;i<a.length;i++){let cs=a[i];if(typeof cs=="object"){cs=JSON.stringify(cs,(key,value)=>{
    if(typeof value==='object'&&value!==null){if(value instanceof Array){return value.map((item,index)=>(index===value.length-1?'circular reference':item)); }
        return{...value,circular: 'circular reference' }; };return value; },2); };b.push(c+cs+"\x1b[0m"); };b=b.join(" \x1b[34m|+++|\x1b[0m ");return b+"\n|--------------------------------------------------------------------------------------------------------------------------------------------|\n"; },
    parseTxt:(f=arguments[3],a)=>{let b=[];let date=getCrTimDt();for(let i=0;i<a.length;i++){let cs=a[i];if(typeof cs=="object"){cs=JSON.stringify(cs,(key,value)=>{
    if(typeof value==='object'&&value!==null){if(value instanceof Array){return value.map((item,index)=>(index===value.length-1?'circular reference':item)); }
        return{...value,circular: 'circular reference' }; };return value; },2); };b.push(cs); };b=b.join(" <|+++|> ");

        return"\n\n|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|\n FILE NAME : "+f+" || DATE : "+date+"\n|--------------------------------------------------------------------------------------------------------------------------------------------|\n"+b+"\n|^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^|\n"; },
    err:(x,...a)=>{let ld=Log.parseArg(a,"\x1b[31m");let td=Log.parseTxt(x,a);console.log(ld);fs.writeFile(LogDir+"err.log",td,{flag:'a+'},()=>{}); },
    info:(x,...a)=>{let ld=Log.parseArg(a,"\x1b[36m");let td=Log.parseTxt(x,a);console.log(ld);fs.writeFile(LogDir+"info.log",td,{flag:'wx'},()=>{}); },
    warn:(x,...a)=>{let ld=Log.parseArg(a,"\x1b[33m");let td=Log.parseTxt(x,a);console.log(ld);fs.writeFile(LogDir+"warn.log",td,{flag:'wx'},()=>{}); },
    log:(x,...a)=>{let ld=Log.parseArg(a,"\x1b[37m");let td=Log.parseTxt(x,a);console.log(ld);fs.writeFile(LogDir+"log.log",td,{flag:'wx'},()=>{}); },
    ign:(x,...a)=>{let ld=Log.parseArg(a,"\x1b[35m");console.log(ld); }
};

module.exports=Log;
