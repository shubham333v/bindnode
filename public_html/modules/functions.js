const {v4:uuidv4,v1:uuidv1,validate}=require("uuid");

function isString(a){return typeof a=="string"; }
function areStrings(a){for(let i=0;i<a.length;i++){if(typeof a[i]!="string")return false; }return true; }
function randomString(l){let ca="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~`!@#$%^&*()_+-={}[]:\";\'<>?,./|\\";let r='';for(let i=l;i>0;--i)r+=ca[Math.floor(Math.random()*ca.length)];return r; }

function genSid(){return uuidv4()+uuidv1()+uuidv4()+uuidv1()+uuidv1()+uuidv4(); }
function addZero(str){return str<10?('0'+str):str; }
function getCrTimDt(d){let cdt=d||new Date();return addZero(cdt.getFullYear())+"-"+addZero(cdt.getMonth()+1)+"-"+addZero(cdt.getDate())+" "+addZero(cdt.getHours())+":"+addZero(cdt.getMinutes())+":"+addZero(cdt.getSeconds()); }
function getCrDt(d){let cdt=d||new Date();return addZero(cdt.getFullYear())+"-"+addZero(cdt.getMonth()+1)+"-"+addZero(cdt.getDate()); }
function getDfDt(dt2,dt1){let diff=(dt2-dt1)/1000;diff/=(60*60*24);return Math.abs(Math.round(diff)); }
function DtToInt(a){return parseInt(a.replace(/[:.\-Zz\s]+/g,"")); }

function isEmail(a){return  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(a); }

if(typeof module=="object")module.exports={isString,areStrings,randomString,genSid,addZero,getCrTimDt,getCrDt,getDfDt,DtToInt,isEmail};
