const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./CFEbfYP3.js","./BC6Im6_J.js","./CdiV8pob.js","./BqLBqXsM.js","./dVouc0k2.js","./D0oeSwMO.js","./3oh2oIpF.js","./CKOQKYhC.js","./skills.BVMdz4zZ.css","./BZuRRumb.js","./BYLkUbAy.js","./blog.C7anqmBz.css","./QKhfetRK.js","./BQjoTi6g.js","./Cm4OYU3N.js","./DGRTGWqa.js","./index.Dwlz92f2.css","./C2RLn30b.js","./Ch3DY6mq.js","./DqMAdv1Q.js","./CjmJjjqI.js","./E1WfNmNJ.js","./tFsLFLRg.js","./index.a_AUxru0.css","./Bu3dsxas.js","./products.DWmjk2Aj.css","./D0rshLNM.js","./6BMYl1Ci.js","./mNAuW6sO.js","./BD8ciVsq.js","./index.qDiuZlw-.css","./BL-V5Bmg.js","./C58LZhNe.js","./D7KGscGp.js","./wSbNHcIL.js","./BCBb_8iq.js","./BXKzhPK9.js","./index.CxfTKPy5.css","./DamWZC-z.js","./_slug_.cqUPpZtO.css","./CUCYvwUS.js","./CjYgLp7J.js","./img.BfHmE6eh.css","./BxXzSZrn.js","./skills.BrAs6V7P.css","./YIWEJGaZ.js","./account.DqJ1m_ZI.css","./Cc6xmyq6.js","./profile.BjktiTpq.css","./PQURZ8w_.js","./c6lCLqwy.js","./colors.F6Ugl0Yg.css","./-yJjMI3a.js","./WST3EVJB.js","./CQGCtah0.js","./tokens.C3Gget6A.css","./FC9UMjEe.js","./technologies.CvqHYwOR.css","./tFIpRUQt.js","./DrWvyhEQ.js","./typography.Bdp4dZK_.css","./CK8pGuGR.js","./dashboard.B_GP2u-i.css","./BLA2phvY.js","./default.CUBpbemw.css","./CxUcIyl0.js","./B9VbqQ2z.js","./error-404.CRsw1OjE.css","./BnG2EkqI.js","./error-500.BQk3Pe-2.css"])))=>i.map(i=>d[i]);
var xC=Object.defineProperty;var MC=(t,e,n)=>e in t?xC(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var Kr=(t,e,n)=>MC(t,typeof e!="symbol"?e+"":e,n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();/**
* @vue/shared v3.5.16
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function Uu(t){const e=Object.create(null);for(const n of t.split(","))e[n]=1;return n=>n in e}const be={},ji=[],bn=()=>{},LC=()=>!1,hc=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&(t.charCodeAt(2)>122||t.charCodeAt(2)<97),Ip=t=>t.startsWith("onUpdate:"),$e=Object.assign,Ap=(t,e)=>{const n=t.indexOf(e);n>-1&&t.splice(n,1)},VC=Object.prototype.hasOwnProperty,De=(t,e)=>VC.call(t,e),re=Array.isArray,Hi=t=>To(t)==="[object Map]",pi=t=>To(t)==="[object Set]",b_=t=>To(t)==="[object Date]",FC=t=>To(t)==="[object RegExp]",he=t=>typeof t=="function",We=t=>typeof t=="string",Fn=t=>typeof t=="symbol",Ue=t=>t!==null&&typeof t=="object",Rp=t=>(Ue(t)||he(t))&&he(t.then)&&he(t.catch),R0=Object.prototype.toString,To=t=>R0.call(t),UC=t=>To(t).slice(8,-1),Bu=t=>To(t)==="[object Object]",Cp=t=>We(t)&&t!=="NaN"&&t[0]!=="-"&&""+parseInt(t,10)===t,qi=Uu(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),$u=t=>{const e=Object.create(null);return n=>e[n]||(e[n]=t(n))},BC=/-(\w)/g,Wt=$u(t=>t.replace(BC,(e,n)=>n?n.toUpperCase():"")),$C=/\B([A-Z])/g,sn=$u(t=>t.replace($C,"-$1").toLowerCase()),ju=$u(t=>t.charAt(0).toUpperCase()+t.slice(1)),El=$u(t=>t?`on${ju(t)}`:""),Xt=(t,e)=>!Object.is(t,e),Wi=(t,...e)=>{for(let n=0;n<t.length;n++)t[n](...e)},C0=(t,e,n,r=!1)=>{Object.defineProperty(t,e,{configurable:!0,enumerable:!1,writable:r,value:n})},Fl=t=>{const e=parseFloat(t);return isNaN(e)?t:e},Ul=t=>{const e=We(t)?Number(t):NaN;return isNaN(e)?t:e};let I_;const Hu=()=>I_||(I_=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),jC="Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol",HC=Uu(jC);function qu(t){if(re(t)){const e={};for(let n=0;n<t.length;n++){const r=t[n],s=We(r)?zC(r):qu(r);if(s)for(const i in s)e[i]=s[i]}return e}else if(We(t)||Ue(t))return t}const qC=/;(?![^(]*\))/g,WC=/:([^]+)/,KC=/\/\*[^]*?\*\//g;function zC(t){const e={};return t.replace(KC,"").split(qC).forEach(n=>{if(n){const r=n.split(WC);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function Wu(t){let e="";if(We(t))e=t;else if(re(t))for(let n=0;n<t.length;n++){const r=Wu(t[n]);r&&(e+=r+" ")}else if(Ue(t))for(const n in t)t[n]&&(e+=n+" ");return e.trim()}function GC(t){if(!t)return null;let{class:e,style:n}=t;return e&&!We(e)&&(t.class=Wu(e)),n&&(t.style=qu(n)),t}const QC="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",YC=Uu(QC);function S0(t){return!!t||t===""}function XC(t,e){if(t.length!==e.length)return!1;let n=!0;for(let r=0;n&&r<t.length;r++)n=_s(t[r],e[r]);return n}function _s(t,e){if(t===e)return!0;let n=b_(t),r=b_(e);if(n||r)return n&&r?t.getTime()===e.getTime():!1;if(n=Fn(t),r=Fn(e),n||r)return t===e;if(n=re(t),r=re(e),n||r)return n&&r?XC(t,e):!1;if(n=Ue(t),r=Ue(e),n||r){if(!n||!r)return!1;const s=Object.keys(t).length,i=Object.keys(e).length;if(s!==i)return!1;for(const o in t){const a=t.hasOwnProperty(o),c=e.hasOwnProperty(o);if(a&&!c||!a&&c||!_s(t[o],e[o]))return!1}}return String(t)===String(e)}function Ku(t,e){return t.findIndex(n=>_s(n,e))}const k0=t=>!!(t&&t.__v_isRef===!0),JC=t=>We(t)?t:t==null?"":re(t)||Ue(t)&&(t.toString===R0||!he(t.toString))?k0(t)?JC(t.value):JSON.stringify(t,P0,2):String(t),P0=(t,e)=>k0(e)?P0(t,e.value):Hi(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((n,[r,s],i)=>(n[sf(r,i)+" =>"]=s,n),{})}:pi(e)?{[`Set(${e.size})`]:[...e.values()].map(n=>sf(n))}:Fn(e)?sf(e):Ue(e)&&!re(e)&&!Bu(e)?String(e):e,sf=(t,e="")=>{var n;return Fn(t)?`Symbol(${(n=t.description)!=null?n:e})`:t};/**
* @vue/reactivity v3.5.16
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Vt;class N0{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=Vt,!e&&Vt&&(this.index=(Vt.scopes||(Vt.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].pause();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].resume();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].resume()}}run(e){if(this._active){const n=Vt;try{return Vt=this,e()}finally{Vt=n}}}on(){++this._on===1&&(this.prevScope=Vt,Vt=this)}off(){this._on>0&&--this._on===0&&(Vt=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let n,r;for(n=0,r=this.effects.length;n<r;n++)this.effects[n].stop();for(this.effects.length=0,n=0,r=this.cleanups.length;n<r;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,r=this.scopes.length;n<r;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function ZC(t){return new N0(t)}function Sp(){return Vt}function eS(t,e=!1){Vt&&Vt.cleanups.push(t)}let He;const of=new WeakSet;class Bl{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Vt&&Vt.active&&Vt.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,of.has(this)&&(of.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||D0(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,A_(this),x0(this);const e=He,n=Mn;He=this,Mn=!0;try{return this.fn()}finally{M0(this),He=e,Mn=n,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)Np(e);this.deps=this.depsTail=void 0,A_(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?of.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Qf(this)&&this.run()}get dirty(){return Qf(this)}}let O0=0,va,Ea;function D0(t,e=!1){if(t.flags|=8,e){t.next=Ea,Ea=t;return}t.next=va,va=t}function kp(){O0++}function Pp(){if(--O0>0)return;if(Ea){let e=Ea;for(Ea=void 0;e;){const n=e.next;e.next=void 0,e.flags&=-9,e=n}}let t;for(;va;){let e=va;for(va=void 0;e;){const n=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){t||(t=r)}e=n}}if(t)throw t}function x0(t){for(let e=t.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function M0(t){let e,n=t.depsTail,r=n;for(;r;){const s=r.prevDep;r.version===-1?(r===n&&(n=s),Np(r),tS(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=s}t.deps=e,t.depsTail=n}function Qf(t){for(let e=t.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(L0(e.dep.computed)||e.dep.version!==e.version))return!0;return!!t._dirty}function L0(t){if(t.flags&4&&!(t.flags&16)||(t.flags&=-17,t.globalVersion===Ba)||(t.globalVersion=Ba,!t.isSSR&&t.flags&128&&(!t.deps&&!t._dirty||!Qf(t))))return;t.flags|=2;const e=t.dep,n=He,r=Mn;He=t,Mn=!0;try{x0(t);const s=t.fn(t._value);(e.version===0||Xt(s,t._value))&&(t.flags|=128,t._value=s,e.version++)}catch(s){throw e.version++,s}finally{He=n,Mn=r,M0(t),t.flags&=-3}}function Np(t,e=!1){const{dep:n,prevSub:r,nextSub:s}=t;if(r&&(r.nextSub=s,t.prevSub=void 0),s&&(s.prevSub=r,t.nextSub=void 0),n.subs===t&&(n.subs=r,!r&&n.computed)){n.computed.flags&=-5;for(let i=n.computed.deps;i;i=i.nextDep)Np(i,!0)}!e&&!--n.sc&&n.map&&n.map.delete(n.key)}function tS(t){const{prevDep:e,nextDep:n}=t;e&&(e.nextDep=n,t.prevDep=void 0),n&&(n.prevDep=e,t.nextDep=void 0)}function XB(t,e){t.effect instanceof Bl&&(t=t.effect.fn);const n=new Bl(t);e&&$e(n,e);try{n.run()}catch(s){throw n.stop(),s}const r=n.run.bind(n);return r.effect=n,r}function JB(t){t.effect.stop()}let Mn=!0;const V0=[];function Rr(){V0.push(Mn),Mn=!1}function Cr(){const t=V0.pop();Mn=t===void 0?!0:t}function A_(t){const{cleanup:e}=t;if(t.cleanup=void 0,e){const n=He;He=void 0;try{e()}finally{He=n}}}let Ba=0;class nS{constructor(e,n){this.sub=e,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class zu{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0}track(e){if(!He||!Mn||He===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==He)n=this.activeLink=new nS(He,this),He.deps?(n.prevDep=He.depsTail,He.depsTail.nextDep=n,He.depsTail=n):He.deps=He.depsTail=n,F0(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const r=n.nextDep;r.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=r),n.prevDep=He.depsTail,n.nextDep=void 0,He.depsTail.nextDep=n,He.depsTail=n,He.deps===n&&(He.deps=r)}return n}trigger(e){this.version++,Ba++,this.notify(e)}notify(e){kp();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{Pp()}}}function F0(t){if(t.dep.sc++,t.sub.flags&4){const e=t.dep.computed;if(e&&!t.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)F0(r)}const n=t.dep.subs;n!==t&&(t.prevSub=n,n&&(n.nextSub=t)),t.dep.subs=t}}const $l=new WeakMap,zs=Symbol(""),Yf=Symbol(""),$a=Symbol("");function Ut(t,e,n){if(Mn&&He){let r=$l.get(t);r||$l.set(t,r=new Map);let s=r.get(n);s||(r.set(n,s=new zu),s.map=r,s.key=n),s.track()}}function yr(t,e,n,r,s,i){const o=$l.get(t);if(!o){Ba++;return}const a=c=>{c&&c.trigger()};if(kp(),e==="clear")o.forEach(a);else{const c=re(t),u=c&&Cp(n);if(c&&n==="length"){const h=Number(r);o.forEach((f,d)=>{(d==="length"||d===$a||!Fn(d)&&d>=h)&&a(f)})}else switch((n!==void 0||o.has(void 0))&&a(o.get(n)),u&&a(o.get($a)),e){case"add":c?u&&a(o.get("length")):(a(o.get(zs)),Hi(t)&&a(o.get(Yf)));break;case"delete":c||(a(o.get(zs)),Hi(t)&&a(o.get(Yf)));break;case"set":Hi(t)&&a(o.get(zs));break}}Pp()}function rS(t,e){const n=$l.get(t);return n&&n.get(e)}function Si(t){const e=ke(t);return e===t?e:(Ut(e,"iterate",$a),In(t)?e:e.map(St))}function Gu(t){return Ut(t=ke(t),"iterate",$a),t}const sS={__proto__:null,[Symbol.iterator](){return af(this,Symbol.iterator,St)},concat(...t){return Si(this).concat(...t.map(e=>re(e)?Si(e):e))},entries(){return af(this,"entries",t=>(t[1]=St(t[1]),t))},every(t,e){return dr(this,"every",t,e,void 0,arguments)},filter(t,e){return dr(this,"filter",t,e,n=>n.map(St),arguments)},find(t,e){return dr(this,"find",t,e,St,arguments)},findIndex(t,e){return dr(this,"findIndex",t,e,void 0,arguments)},findLast(t,e){return dr(this,"findLast",t,e,St,arguments)},findLastIndex(t,e){return dr(this,"findLastIndex",t,e,void 0,arguments)},forEach(t,e){return dr(this,"forEach",t,e,void 0,arguments)},includes(...t){return cf(this,"includes",t)},indexOf(...t){return cf(this,"indexOf",t)},join(t){return Si(this).join(t)},lastIndexOf(...t){return cf(this,"lastIndexOf",t)},map(t,e){return dr(this,"map",t,e,void 0,arguments)},pop(){return Xo(this,"pop")},push(...t){return Xo(this,"push",t)},reduce(t,...e){return R_(this,"reduce",t,e)},reduceRight(t,...e){return R_(this,"reduceRight",t,e)},shift(){return Xo(this,"shift")},some(t,e){return dr(this,"some",t,e,void 0,arguments)},splice(...t){return Xo(this,"splice",t)},toReversed(){return Si(this).toReversed()},toSorted(t){return Si(this).toSorted(t)},toSpliced(...t){return Si(this).toSpliced(...t)},unshift(...t){return Xo(this,"unshift",t)},values(){return af(this,"values",St)}};function af(t,e,n){const r=Gu(t),s=r[e]();return r!==t&&!In(t)&&(s._next=s.next,s.next=()=>{const i=s._next();return i.value&&(i.value=n(i.value)),i}),s}const iS=Array.prototype;function dr(t,e,n,r,s,i){const o=Gu(t),a=o!==t&&!In(t),c=o[e];if(c!==iS[e]){const f=c.apply(t,i);return a?St(f):f}let u=n;o!==t&&(a?u=function(f,d){return n.call(this,St(f),d,t)}:n.length>2&&(u=function(f,d){return n.call(this,f,d,t)}));const h=c.call(o,u,r);return a&&s?s(h):h}function R_(t,e,n,r){const s=Gu(t);let i=n;return s!==t&&(In(t)?n.length>3&&(i=function(o,a,c){return n.call(this,o,a,c,t)}):i=function(o,a,c){return n.call(this,o,St(a),c,t)}),s[e](i,...r)}function cf(t,e,n){const r=ke(t);Ut(r,"iterate",$a);const s=r[e](...n);return(s===-1||s===!1)&&Op(n[0])?(n[0]=ke(n[0]),r[e](...n)):s}function Xo(t,e,n=[]){Rr(),kp();const r=ke(t)[e].apply(t,n);return Pp(),Cr(),r}const oS=Uu("__proto__,__v_isRef,__isVue"),U0=new Set(Object.getOwnPropertyNames(Symbol).filter(t=>t!=="arguments"&&t!=="caller").map(t=>Symbol[t]).filter(Fn));function aS(t){Fn(t)||(t=String(t));const e=ke(this);return Ut(e,"has",t),e.hasOwnProperty(t)}class B0{constructor(e=!1,n=!1){this._isReadonly=e,this._isShallow=n}get(e,n,r){if(n==="__v_skip")return e.__v_skip;const s=this._isReadonly,i=this._isShallow;if(n==="__v_isReactive")return!s;if(n==="__v_isReadonly")return s;if(n==="__v_isShallow")return i;if(n==="__v_raw")return r===(s?i?K0:W0:i?q0:H0).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const o=re(e);if(!s){let c;if(o&&(c=sS[n]))return c;if(n==="hasOwnProperty")return aS}const a=Reflect.get(e,n,at(e)?e:r);return(Fn(n)?U0.has(n):oS(n))||(s||Ut(e,"get",n),i)?a:at(a)?o&&Cp(n)?a:a.value:Ue(a)?s?z0(a):ar(a):a}}class $0 extends B0{constructor(e=!1){super(!1,e)}set(e,n,r,s){let i=e[n];if(!this._isShallow){const c=Sr(i);if(!In(r)&&!Sr(r)&&(i=ke(i),r=ke(r)),!re(e)&&at(i)&&!at(r))return c?!1:(i.value=r,!0)}const o=re(e)&&Cp(n)?Number(n)<e.length:De(e,n),a=Reflect.set(e,n,r,at(e)?e:s);return e===ke(s)&&(o?Xt(r,i)&&yr(e,"set",n,r):yr(e,"add",n,r)),a}deleteProperty(e,n){const r=De(e,n);e[n];const s=Reflect.deleteProperty(e,n);return s&&r&&yr(e,"delete",n,void 0),s}has(e,n){const r=Reflect.has(e,n);return(!Fn(n)||!U0.has(n))&&Ut(e,"has",n),r}ownKeys(e){return Ut(e,"iterate",re(e)?"length":zs),Reflect.ownKeys(e)}}class j0 extends B0{constructor(e=!1){super(!0,e)}set(e,n){return!0}deleteProperty(e,n){return!0}}const cS=new $0,lS=new j0,uS=new $0(!0),hS=new j0(!0),Xf=t=>t,Qc=t=>Reflect.getPrototypeOf(t);function fS(t,e,n){return function(...r){const s=this.__v_raw,i=ke(s),o=Hi(i),a=t==="entries"||t===Symbol.iterator&&o,c=t==="keys"&&o,u=s[t](...r),h=n?Xf:e?jl:St;return!e&&Ut(i,"iterate",c?Yf:zs),{next(){const{value:f,done:d}=u.next();return d?{value:f,done:d}:{value:a?[h(f[0]),h(f[1])]:h(f),done:d}},[Symbol.iterator](){return this}}}}function Yc(t){return function(...e){return t==="delete"?!1:t==="clear"?void 0:this}}function dS(t,e){const n={get(s){const i=this.__v_raw,o=ke(i),a=ke(s);t||(Xt(s,a)&&Ut(o,"get",s),Ut(o,"get",a));const{has:c}=Qc(o),u=e?Xf:t?jl:St;if(c.call(o,s))return u(i.get(s));if(c.call(o,a))return u(i.get(a));i!==o&&i.get(s)},get size(){const s=this.__v_raw;return!t&&Ut(ke(s),"iterate",zs),Reflect.get(s,"size",s)},has(s){const i=this.__v_raw,o=ke(i),a=ke(s);return t||(Xt(s,a)&&Ut(o,"has",s),Ut(o,"has",a)),s===a?i.has(s):i.has(s)||i.has(a)},forEach(s,i){const o=this,a=o.__v_raw,c=ke(a),u=e?Xf:t?jl:St;return!t&&Ut(c,"iterate",zs),a.forEach((h,f)=>s.call(i,u(h),u(f),o))}};return $e(n,t?{add:Yc("add"),set:Yc("set"),delete:Yc("delete"),clear:Yc("clear")}:{add(s){!e&&!In(s)&&!Sr(s)&&(s=ke(s));const i=ke(this);return Qc(i).has.call(i,s)||(i.add(s),yr(i,"add",s,s)),this},set(s,i){!e&&!In(i)&&!Sr(i)&&(i=ke(i));const o=ke(this),{has:a,get:c}=Qc(o);let u=a.call(o,s);u||(s=ke(s),u=a.call(o,s));const h=c.call(o,s);return o.set(s,i),u?Xt(i,h)&&yr(o,"set",s,i):yr(o,"add",s,i),this},delete(s){const i=ke(this),{has:o,get:a}=Qc(i);let c=o.call(i,s);c||(s=ke(s),c=o.call(i,s)),a&&a.call(i,s);const u=i.delete(s);return c&&yr(i,"delete",s,void 0),u},clear(){const s=ke(this),i=s.size!==0,o=s.clear();return i&&yr(s,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(s=>{n[s]=fS(s,t,e)}),n}function Qu(t,e){const n=dS(t,e);return(r,s,i)=>s==="__v_isReactive"?!t:s==="__v_isReadonly"?t:s==="__v_raw"?r:Reflect.get(De(n,s)&&s in r?n:r,s,i)}const pS={get:Qu(!1,!1)},mS={get:Qu(!1,!0)},gS={get:Qu(!0,!1)},_S={get:Qu(!0,!0)},H0=new WeakMap,q0=new WeakMap,W0=new WeakMap,K0=new WeakMap;function yS(t){switch(t){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function vS(t){return t.__v_skip||!Object.isExtensible(t)?0:yS(UC(t))}function ar(t){return Sr(t)?t:Yu(t,!1,cS,pS,H0)}function Zn(t){return Yu(t,!1,uS,mS,q0)}function z0(t){return Yu(t,!0,lS,gS,W0)}function ZB(t){return Yu(t,!0,hS,_S,K0)}function Yu(t,e,n,r,s){if(!Ue(t)||t.__v_raw&&!(e&&t.__v_isReactive))return t;const i=vS(t);if(i===0)return t;const o=s.get(t);if(o)return o;const a=new Proxy(t,i===2?r:n);return s.set(t,a),a}function Gs(t){return Sr(t)?Gs(t.__v_raw):!!(t&&t.__v_isReactive)}function Sr(t){return!!(t&&t.__v_isReadonly)}function In(t){return!!(t&&t.__v_isShallow)}function Op(t){return t?!!t.__v_raw:!1}function ke(t){const e=t&&t.__v_raw;return e?ke(e):t}function ES(t){return!De(t,"__v_skip")&&Object.isExtensible(t)&&C0(t,"__v_skip",!0),t}const St=t=>Ue(t)?ar(t):t,jl=t=>Ue(t)?z0(t):t;function at(t){return t?t.__v_isRef===!0:!1}function ft(t){return G0(t,!1)}function kr(t){return G0(t,!0)}function G0(t,e){return at(t)?t:new TS(t,e)}class TS{constructor(e,n){this.dep=new zu,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?e:ke(e),this._value=n?e:St(e),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(e){const n=this._rawValue,r=this.__v_isShallow||In(e)||Sr(e);e=r?e:ke(e),Xt(e,n)&&(this._rawValue=e,this._value=r?e:St(e),this.dep.trigger())}}function e$(t){t.dep&&t.dep.trigger()}function qe(t){return at(t)?t.value:t}function Qn(t){return he(t)?t():qe(t)}const wS={get:(t,e,n)=>e==="__v_raw"?t:qe(Reflect.get(t,e,n)),set:(t,e,n,r)=>{const s=t[e];return at(s)&&!at(n)?(s.value=n,!0):Reflect.set(t,e,n,r)}};function Q0(t){return Gs(t)?t:new Proxy(t,wS)}class bS{constructor(e){this.__v_isRef=!0,this._value=void 0;const n=this.dep=new zu,{get:r,set:s}=e(n.track.bind(n),n.trigger.bind(n));this._get=r,this._set=s}get value(){return this._value=this._get()}set value(e){this._set(e)}}function IS(t){return new bS(t)}function t$(t){const e=re(t)?new Array(t.length):{};for(const n in t)e[n]=X0(t,n);return e}class AS{constructor(e,n,r){this._object=e,this._key=n,this._defaultValue=r,this.__v_isRef=!0,this._value=void 0}get value(){const e=this._object[this._key];return this._value=e===void 0?this._defaultValue:e}set value(e){this._object[this._key]=e}get dep(){return rS(ke(this._object),this._key)}}class RS{constructor(e){this._getter=e,this.__v_isRef=!0,this.__v_isReadonly=!0,this._value=void 0}get value(){return this._value=this._getter()}}function Y0(t,e,n){return at(t)?t:he(t)?new RS(t):Ue(t)&&arguments.length>1?X0(t,e,n):ft(t)}function X0(t,e,n){const r=t[e];return at(r)?r:new AS(t,e,n)}class CS{constructor(e,n,r){this.fn=e,this.setter=n,this._value=void 0,this.dep=new zu(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=Ba-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&He!==this)return D0(this,!0),!0}get value(){const e=this.dep.track();return L0(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function SS(t,e,n=!1){let r,s;return he(t)?r=t:(r=t.get,s=t.set),new CS(r,s,n)}const n$={GET:"get",HAS:"has",ITERATE:"iterate"},r$={SET:"set",ADD:"add",DELETE:"delete",CLEAR:"clear"},Xc={},Hl=new WeakMap;let Yr;function s$(){return Yr}function kS(t,e=!1,n=Yr){if(n){let r=Hl.get(n);r||Hl.set(n,r=[]),r.push(t)}}function PS(t,e,n=be){const{immediate:r,deep:s,once:i,scheduler:o,augmentJob:a,call:c}=n,u=R=>s?R:In(R)||s===!1||s===0?vr(R,1):vr(R);let h,f,d,m,_=!1,y=!1;if(at(t)?(f=()=>t.value,_=In(t)):Gs(t)?(f=()=>u(t),_=!0):re(t)?(y=!0,_=t.some(R=>Gs(R)||In(R)),f=()=>t.map(R=>{if(at(R))return R.value;if(Gs(R))return u(R);if(he(R))return c?c(R,2):R()})):he(t)?e?f=c?()=>c(t,2):t:f=()=>{if(d){Rr();try{d()}finally{Cr()}}const R=Yr;Yr=h;try{return c?c(t,3,[m]):t(m)}finally{Yr=R}}:f=bn,e&&s){const R=f,x=s===!0?1/0:s;f=()=>vr(R(),x)}const I=Sp(),D=()=>{h.stop(),I&&I.active&&Ap(I.effects,h)};if(i&&e){const R=e;e=(...x)=>{R(...x),D()}}let P=y?new Array(t.length).fill(Xc):Xc;const v=R=>{if(!(!(h.flags&1)||!h.dirty&&!R))if(e){const x=h.run();if(s||_||(y?x.some((M,b)=>Xt(M,P[b])):Xt(x,P))){d&&d();const M=Yr;Yr=h;try{const b=[x,P===Xc?void 0:y&&P[0]===Xc?[]:P,m];P=x,c?c(e,3,b):e(...b)}finally{Yr=M}}}else h.run()};return a&&a(v),h=new Bl(f),h.scheduler=o?()=>o(v,!1):v,m=R=>kS(R,!1,h),d=h.onStop=()=>{const R=Hl.get(h);if(R){if(c)c(R,4);else for(const x of R)x();Hl.delete(h)}},e?r?v(!0):P=h.run():o?o(v.bind(null,!0),!0):h.run(),D.pause=h.pause.bind(h),D.resume=h.resume.bind(h),D.stop=D,D}function vr(t,e=1/0,n){if(e<=0||!Ue(t)||t.__v_skip||(n=n||new Set,n.has(t)))return t;if(n.add(t),e--,at(t))vr(t.value,e,n);else if(re(t))for(let r=0;r<t.length;r++)vr(t[r],e,n);else if(pi(t)||Hi(t))t.forEach(r=>{vr(r,e,n)});else if(Bu(t)){for(const r in t)vr(t[r],e,n);for(const r of Object.getOwnPropertySymbols(t))Object.prototype.propertyIsEnumerable.call(t,r)&&vr(t[r],e,n)}return t}/**
* @vue/runtime-core v3.5.16
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/const J0=[];function NS(t){J0.push(t)}function OS(){J0.pop()}function i$(t,e){}const o$={SETUP_FUNCTION:0,0:"SETUP_FUNCTION",RENDER_FUNCTION:1,1:"RENDER_FUNCTION",NATIVE_EVENT_HANDLER:5,5:"NATIVE_EVENT_HANDLER",COMPONENT_EVENT_HANDLER:6,6:"COMPONENT_EVENT_HANDLER",VNODE_HOOK:7,7:"VNODE_HOOK",DIRECTIVE_HOOK:8,8:"DIRECTIVE_HOOK",TRANSITION_HOOK:9,9:"TRANSITION_HOOK",APP_ERROR_HANDLER:10,10:"APP_ERROR_HANDLER",APP_WARN_HANDLER:11,11:"APP_WARN_HANDLER",FUNCTION_REF:12,12:"FUNCTION_REF",ASYNC_COMPONENT_LOADER:13,13:"ASYNC_COMPONENT_LOADER",SCHEDULER:14,14:"SCHEDULER",COMPONENT_UPDATE:15,15:"COMPONENT_UPDATE",APP_UNMOUNT_CLEANUP:16,16:"APP_UNMOUNT_CLEANUP"},DS={sp:"serverPrefetch hook",bc:"beforeCreate hook",c:"created hook",bm:"beforeMount hook",m:"mounted hook",bu:"beforeUpdate hook",u:"updated",bum:"beforeUnmount hook",um:"unmounted hook",a:"activated hook",da:"deactivated hook",ec:"errorCaptured hook",rtc:"renderTracked hook",rtg:"renderTriggered hook",0:"setup function",1:"render function",2:"watcher getter",3:"watcher callback",4:"watcher cleanup function",5:"native event handler",6:"component event handler",7:"vnode hook",8:"directive hook",9:"transition hook",10:"app errorHandler",11:"app warnHandler",12:"ref function",13:"async component loader",14:"scheduler flush",15:"component update",16:"app unmount cleanup function"};function fc(t,e,n,r){try{return r?t(...r):t()}catch(s){wo(s,e,n)}}function Un(t,e,n,r){if(he(t)){const s=fc(t,e,n,r);return s&&Rp(s)&&s.catch(i=>{wo(i,e,n)}),s}if(re(t)){const s=[];for(let i=0;i<t.length;i++)s.push(Un(t[i],e,n,r));return s}}function wo(t,e,n,r=!0){const s=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:o}=e&&e.appContext.config||be;if(e){let a=e.parent;const c=e.proxy,u=`https://vuejs.org/error-reference/#runtime-${n}`;for(;a;){const h=a.ec;if(h){for(let f=0;f<h.length;f++)if(h[f](t,c,u)===!1)return}a=a.parent}if(i){Rr(),fc(i,null,10,[t,c,u]),Cr();return}}xS(t,n,s,r,o)}function xS(t,e,n,r=!0,s=!1){if(s)throw t;console.error(t)}const Jt=[];let Gn=-1;const Ki=[];let Xr=null,Ni=0;const Z0=Promise.resolve();let ql=null;function Pr(t){const e=ql||Z0;return t?e.then(this?t.bind(this):t):e}function MS(t){let e=Gn+1,n=Jt.length;for(;e<n;){const r=e+n>>>1,s=Jt[r],i=ja(s);i<t||i===t&&s.flags&2?e=r+1:n=r}return e}function Dp(t){if(!(t.flags&1)){const e=ja(t),n=Jt[Jt.length-1];!n||!(t.flags&2)&&e>=ja(n)?Jt.push(t):Jt.splice(MS(e),0,t),t.flags|=1,eT()}}function eT(){ql||(ql=Z0.then(tT))}function Wl(t){re(t)?Ki.push(...t):Xr&&t.id===-1?Xr.splice(Ni+1,0,t):t.flags&1||(Ki.push(t),t.flags|=1),eT()}function C_(t,e,n=Gn+1){for(;n<Jt.length;n++){const r=Jt[n];if(r&&r.flags&2){if(t&&r.id!==t.uid)continue;Jt.splice(n,1),n--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function Kl(t){if(Ki.length){const e=[...new Set(Ki)].sort((n,r)=>ja(n)-ja(r));if(Ki.length=0,Xr){Xr.push(...e);return}for(Xr=e,Ni=0;Ni<Xr.length;Ni++){const n=Xr[Ni];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}Xr=null,Ni=0}}const ja=t=>t.id==null?t.flags&2?-1:1/0:t.id;function tT(t){try{for(Gn=0;Gn<Jt.length;Gn++){const e=Jt[Gn];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),fc(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;Gn<Jt.length;Gn++){const e=Jt[Gn];e&&(e.flags&=-2)}Gn=-1,Jt.length=0,Kl(),ql=null,(Jt.length||Ki.length)&&tT()}}let Oi,Jc=[];function nT(t,e){var n,r;Oi=t,Oi?(Oi.enabled=!0,Jc.forEach(({event:s,args:i})=>Oi.emit(s,...i)),Jc=[]):typeof window<"u"&&window.HTMLElement&&!((r=(n=window.navigator)==null?void 0:n.userAgent)!=null&&r.includes("jsdom"))?((e.__VUE_DEVTOOLS_HOOK_REPLAY__=e.__VUE_DEVTOOLS_HOOK_REPLAY__||[]).push(i=>{nT(i,e)}),setTimeout(()=>{Oi||(e.__VUE_DEVTOOLS_HOOK_REPLAY__=null,Jc=[])},3e3)):Jc=[]}let _t=null,Xu=null;function Ha(t){const e=_t;return _t=t,Xu=t&&t.type.__scopeId||null,e}function a$(t){Xu=t}function c$(){Xu=null}const l$=t=>Ju;function Ju(t,e=_t,n){if(!e||t._n)return t;const r=(...s)=>{r._d&&$_(-1);const i=Ha(e);let o;try{o=t(...s)}finally{Ha(i),r._d&&$_(1)}return o};return r._n=!0,r._c=!0,r._d=!0,r}function u$(t,e){if(_t===null)return t;const n=_c(_t),r=t.dirs||(t.dirs=[]);for(let s=0;s<e.length;s++){let[i,o,a,c=be]=e[s];i&&(he(i)&&(i={mounted:i,updated:i}),i.deep&&vr(o),r.push({dir:i,instance:n,value:o,oldValue:void 0,arg:a,modifiers:c}))}return t}function Yn(t,e,n,r){const s=t.dirs,i=e&&e.dirs;for(let o=0;o<s.length;o++){const a=s[o];i&&(a.oldValue=i[o].value);let c=a.dir[r];c&&(Rr(),Un(c,n,8,[t.el,a,t,e]),Cr())}}const rT=Symbol("_vte"),sT=t=>t.__isTeleport,Ta=t=>t&&(t.disabled||t.disabled===""),S_=t=>t&&(t.defer||t.defer===""),k_=t=>typeof SVGElement<"u"&&t instanceof SVGElement,P_=t=>typeof MathMLElement=="function"&&t instanceof MathMLElement,Jf=(t,e)=>{const n=t&&t.to;return We(n)?e?e(n):null:n},iT={name:"Teleport",__isTeleport:!0,process(t,e,n,r,s,i,o,a,c,u){const{mc:h,pc:f,pbc:d,o:{insert:m,querySelector:_,createText:y,createComment:I}}=u,D=Ta(e.props);let{shapeFlag:P,children:v,dynamicChildren:R}=e;if(t==null){const x=e.el=y(""),M=e.anchor=y("");m(x,n,r),m(M,n,r);const b=(T,A)=>{P&16&&(s&&s.isCE&&(s.ce._teleportTarget=T),h(v,T,A,s,i,o,a,c))},E=()=>{const T=e.target=Jf(e.props,_),A=oT(T,e,y,m);T&&(o!=="svg"&&k_(T)?o="svg":o!=="mathml"&&P_(T)&&(o="mathml"),D||(b(T,A),Tl(e,!1)))};D&&(b(n,M),Tl(e,!0)),S_(e.props)?(e.el.__isMounted=!1,mt(()=>{E(),delete e.el.__isMounted},i)):E()}else{if(S_(e.props)&&t.el.__isMounted===!1){mt(()=>{iT.process(t,e,n,r,s,i,o,a,c,u)},i);return}e.el=t.el,e.targetStart=t.targetStart;const x=e.anchor=t.anchor,M=e.target=t.target,b=e.targetAnchor=t.targetAnchor,E=Ta(t.props),T=E?n:M,A=E?x:b;if(o==="svg"||k_(M)?o="svg":(o==="mathml"||P_(M))&&(o="mathml"),R?(d(t.dynamicChildren,R,T,s,i,o,a),Hp(t,e,!0)):c||f(t,e,T,A,s,i,o,a,!1),D)E?e.props&&t.props&&e.props.to!==t.props.to&&(e.props.to=t.props.to):Zc(e,n,x,u,1);else if((e.props&&e.props.to)!==(t.props&&t.props.to)){const N=e.target=Jf(e.props,_);N&&Zc(e,N,null,u,0)}else E&&Zc(e,M,b,u,1);Tl(e,D)}},remove(t,e,n,{um:r,o:{remove:s}},i){const{shapeFlag:o,children:a,anchor:c,targetStart:u,targetAnchor:h,target:f,props:d}=t;if(f&&(s(u),s(h)),i&&s(c),o&16){const m=i||!Ta(d);for(let _=0;_<a.length;_++){const y=a[_];r(y,e,n,m,!!y.dynamicChildren)}}},move:Zc,hydrate:LS};function Zc(t,e,n,{o:{insert:r},m:s},i=2){i===0&&r(t.targetAnchor,e,n);const{el:o,anchor:a,shapeFlag:c,children:u,props:h}=t,f=i===2;if(f&&r(o,e,n),(!f||Ta(h))&&c&16)for(let d=0;d<u.length;d++)s(u[d],e,n,2);f&&r(a,e,n)}function LS(t,e,n,r,s,i,{o:{nextSibling:o,parentNode:a,querySelector:c,insert:u,createText:h}},f){const d=e.target=Jf(e.props,c);if(d){const m=Ta(e.props),_=d._lpa||d.firstChild;if(e.shapeFlag&16)if(m)e.anchor=f(o(t),e,a(t),n,r,s,i),e.targetStart=_,e.targetAnchor=_&&o(_);else{e.anchor=o(t);let y=_;for(;y;){if(y&&y.nodeType===8){if(y.data==="teleport start anchor")e.targetStart=y;else if(y.data==="teleport anchor"){e.targetAnchor=y,d._lpa=e.targetAnchor&&o(e.targetAnchor);break}}y=o(y)}e.targetAnchor||oT(d,e,h,u),f(_&&o(_),e,d,n,r,s,i)}Tl(e,m)}return e.anchor&&o(e.anchor)}const h$=iT;function Tl(t,e){const n=t.ctx;if(n&&n.ut){let r,s;for(e?(r=t.el,s=t.anchor):(r=t.targetStart,s=t.targetAnchor);r&&r!==s;)r.nodeType===1&&r.setAttribute("data-v-owner",n.uid),r=r.nextSibling;n.ut()}}function oT(t,e,n,r){const s=e.targetStart=n(""),i=e.targetAnchor=n("");return s[rT]=i,t&&(r(s,t),r(i,t)),i}const Jr=Symbol("_leaveCb"),el=Symbol("_enterCb");function aT(){const t={isMounted:!1,isLeaving:!1,isUnmounting:!1,leavingVNodes:new Map};return pc(()=>{t.isMounted=!0}),mc(()=>{t.isUnmounting=!0}),t}const vn=[Function,Array],cT={mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:vn,onEnter:vn,onAfterEnter:vn,onEnterCancelled:vn,onBeforeLeave:vn,onLeave:vn,onAfterLeave:vn,onLeaveCancelled:vn,onBeforeAppear:vn,onAppear:vn,onAfterAppear:vn,onAppearCancelled:vn},lT=t=>{const e=t.subTree;return e.component?lT(e.component):e},VS={name:"BaseTransition",props:cT,setup(t,{slots:e}){const n=un(),r=aT();return()=>{const s=e.default&&xp(e.default(),!0);if(!s||!s.length)return;const i=uT(s),o=ke(t),{mode:a}=o;if(r.isLeaving)return lf(i);const c=N_(i);if(!c)return lf(i);let u=qa(c,o,r,n,f=>u=f);c.type!==ut&&ys(c,u);let h=n.subTree&&N_(n.subTree);if(h&&h.type!==ut&&!Pn(c,h)&&lT(n).type!==ut){let f=qa(h,o,r,n);if(ys(h,f),a==="out-in"&&c.type!==ut)return r.isLeaving=!0,f.afterLeave=()=>{r.isLeaving=!1,n.job.flags&8||n.update(),delete f.afterLeave,h=void 0},lf(i);a==="in-out"&&c.type!==ut?f.delayLeave=(d,m,_)=>{const y=hT(r,h);y[String(h.key)]=h,d[Jr]=()=>{m(),d[Jr]=void 0,delete u.delayedLeave,h=void 0},u.delayedLeave=()=>{_(),delete u.delayedLeave,h=void 0}}:h=void 0}else h&&(h=void 0);return i}}};function uT(t){let e=t[0];if(t.length>1){for(const n of t)if(n.type!==ut){e=n;break}}return e}const FS=VS;function hT(t,e){const{leavingVNodes:n}=t;let r=n.get(e.type);return r||(r=Object.create(null),n.set(e.type,r)),r}function qa(t,e,n,r,s){const{appear:i,mode:o,persisted:a=!1,onBeforeEnter:c,onEnter:u,onAfterEnter:h,onEnterCancelled:f,onBeforeLeave:d,onLeave:m,onAfterLeave:_,onLeaveCancelled:y,onBeforeAppear:I,onAppear:D,onAfterAppear:P,onAppearCancelled:v}=e,R=String(t.key),x=hT(n,t),M=(T,A)=>{T&&Un(T,r,9,A)},b=(T,A)=>{const N=A[1];M(T,A),re(T)?T.every(k=>k.length<=1)&&N():T.length<=1&&N()},E={mode:o,persisted:a,beforeEnter(T){let A=c;if(!n.isMounted)if(i)A=I||c;else return;T[Jr]&&T[Jr](!0);const N=x[R];N&&Pn(t,N)&&N.el[Jr]&&N.el[Jr](),M(A,[T])},enter(T){let A=u,N=h,k=f;if(!n.isMounted)if(i)A=D||u,N=P||h,k=v||f;else return;let C=!1;const me=T[el]=Ee=>{C||(C=!0,Ee?M(k,[T]):M(N,[T]),E.delayedLeave&&E.delayedLeave(),T[el]=void 0)};A?b(A,[T,me]):me()},leave(T,A){const N=String(t.key);if(T[el]&&T[el](!0),n.isUnmounting)return A();M(d,[T]);let k=!1;const C=T[Jr]=me=>{k||(k=!0,A(),me?M(y,[T]):M(_,[T]),T[Jr]=void 0,x[N]===t&&delete x[N])};x[N]=t,m?b(m,[T,C]):C()},clone(T){const A=qa(T,e,n,r,s);return s&&s(A),A}};return E}function lf(t){if(dc(t))return t=Nr(t),t.children=null,t}function N_(t){if(!dc(t))return sT(t.type)&&t.children?uT(t.children):t;if(t.component)return t.component.subTree;const{shapeFlag:e,children:n}=t;if(n){if(e&16)return n[0];if(e&32&&he(n.default))return n.default()}}function ys(t,e){t.shapeFlag&6&&t.component?(t.transition=e,ys(t.component.subTree,e)):t.shapeFlag&128?(t.ssContent.transition=e.clone(t.ssContent),t.ssFallback.transition=e.clone(t.ssFallback)):t.transition=e}function xp(t,e=!1,n){let r=[],s=0;for(let i=0;i<t.length;i++){let o=t[i];const a=n==null?o.key:String(n)+String(o.key!=null?o.key:i);o.type===bt?(o.patchFlag&128&&s++,r=r.concat(xp(o.children,e,a))):(e||o.type!==ut)&&r.push(a!=null?Nr(o,{key:a}):o)}if(s>1)for(let i=0;i<r.length;i++)r[i].patchFlag=-2;return r}/*! #__NO_SIDE_EFFECTS__ */function cr(t,e){return he(t)?$e({name:t.name},e,{setup:t}):t}function f$(){const t=un();return t?(t.appContext.config.idPrefix||"v")+"-"+t.ids[0]+t.ids[1]++:""}function Mp(t){t.ids=[t.ids[0]+t.ids[2]+++"-",0,0]}function d$(t){const e=un(),n=kr(null);if(e){const s=e.refs===be?e.refs={}:e.refs;Object.defineProperty(s,t,{enumerable:!0,get:()=>n.value,set:i=>n.value=i})}return n}function Wa(t,e,n,r,s=!1){if(re(t)){t.forEach((_,y)=>Wa(_,e&&(re(e)?e[y]:e),n,r,s));return}if(ls(r)&&!s){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&Wa(t,e,n,r.component.subTree);return}const i=r.shapeFlag&4?_c(r.component):r.el,o=s?null:i,{i:a,r:c}=t,u=e&&e.r,h=a.refs===be?a.refs={}:a.refs,f=a.setupState,d=ke(f),m=f===be?()=>!1:_=>De(d,_);if(u!=null&&u!==c&&(We(u)?(h[u]=null,m(u)&&(f[u]=null)):at(u)&&(u.value=null)),he(c))fc(c,a,12,[o,h]);else{const _=We(c),y=at(c);if(_||y){const I=()=>{if(t.f){const D=_?m(c)?f[c]:h[c]:c.value;s?re(D)&&Ap(D,i):re(D)?D.includes(i)||D.push(i):_?(h[c]=[i],m(c)&&(f[c]=h[c])):(c.value=[i],t.k&&(h[t.k]=c.value))}else _?(h[c]=o,m(c)&&(f[c]=o)):y&&(c.value=o,t.k&&(h[t.k]=o))};o?(I.id=-1,mt(I,n)):I()}}}let O_=!1;const ki=()=>{O_||(console.error("Hydration completed but contains mismatches."),O_=!0)},US=t=>t.namespaceURI.includes("svg")&&t.tagName!=="foreignObject",BS=t=>t.namespaceURI.includes("MathML"),tl=t=>{if(t.nodeType===1){if(US(t))return"svg";if(BS(t))return"mathml"}},Fi=t=>t.nodeType===8;function $S(t){const{mt:e,p:n,o:{patchProp:r,createText:s,nextSibling:i,parentNode:o,remove:a,insert:c,createComment:u}}=t,h=(v,R)=>{if(!R.hasChildNodes()){n(null,v,R),Kl(),R._vnode=v;return}f(R.firstChild,v,null,null,null),Kl(),R._vnode=v},f=(v,R,x,M,b,E=!1)=>{E=E||!!R.dynamicChildren;const T=Fi(v)&&v.data==="[",A=()=>y(v,R,x,M,b,T),{type:N,ref:k,shapeFlag:C,patchFlag:me}=R;let Ee=v.nodeType;R.el=v,me===-2&&(E=!1,R.dynamicChildren=null);let se=null;switch(N){case Ys:Ee!==3?R.children===""?(c(R.el=s(""),o(v),v),se=v):se=A():(v.data!==R.children&&(ki(),v.data=R.children),se=i(v));break;case ut:P(v)?(se=i(v),D(R.el=v.content.firstChild,v,x)):Ee!==8||T?se=A():se=i(v);break;case Qi:if(T&&(v=i(v),Ee=v.nodeType),Ee===1||Ee===3){se=v;const fe=!R.children.length;for(let te=0;te<R.staticCount;te++)fe&&(R.children+=se.nodeType===1?se.outerHTML:se.data),te===R.staticCount-1&&(R.anchor=se),se=i(se);return T?i(se):se}else A();break;case bt:T?se=_(v,R,x,M,b,E):se=A();break;default:if(C&1)(Ee!==1||R.type.toLowerCase()!==v.tagName.toLowerCase())&&!P(v)?se=A():se=d(v,R,x,M,b,E);else if(C&6){R.slotScopeIds=b;const fe=o(v);if(T?se=I(v):Fi(v)&&v.data==="teleport start"?se=I(v,v.data,"teleport end"):se=i(v),e(R,fe,null,x,M,tl(fe),E),ls(R)&&!R.type.__asyncResolved){let te;T?(te=Ye(bt),te.anchor=se?se.previousSibling:fe.lastChild):te=v.nodeType===3?jT(""):Ye("div"),te.el=v,R.component.subTree=te}}else C&64?Ee!==8?se=A():se=R.type.hydrate(v,R,x,M,b,E,t,m):C&128&&(se=R.type.hydrate(v,R,x,M,tl(o(v)),b,E,t,f))}return k!=null&&Wa(k,null,M,R),se},d=(v,R,x,M,b,E)=>{E=E||!!R.dynamicChildren;const{type:T,props:A,patchFlag:N,shapeFlag:k,dirs:C,transition:me}=R,Ee=T==="input"||T==="option";if(Ee||N!==-1){C&&Yn(R,null,x,"created");let se=!1;if(P(v)){se=PT(null,me)&&x&&x.vnode.props&&x.vnode.props.appear;const te=v.content.firstChild;if(se){const je=te.getAttribute("class");je&&(te.$cls=je),me.beforeEnter(te)}D(te,v,x),R.el=v=te}if(k&16&&!(A&&(A.innerHTML||A.textContent))){let te=m(v.firstChild,R,v,x,M,b,E);for(;te;){nl(v,1)||ki();const je=te;te=te.nextSibling,a(je)}}else if(k&8){let te=R.children;te[0]===`
`&&(v.tagName==="PRE"||v.tagName==="TEXTAREA")&&(te=te.slice(1)),v.textContent!==te&&(nl(v,0)||ki(),v.textContent=R.children)}if(A){if(Ee||!E||N&48){const te=v.tagName.includes("-");for(const je in A)(Ee&&(je.endsWith("value")||je==="indeterminate")||hc(je)&&!qi(je)||je[0]==="."||te)&&r(v,je,null,A[je],void 0,x)}else if(A.onClick)r(v,"onClick",null,A.onClick,void 0,x);else if(N&4&&Gs(A.style))for(const te in A.style)A.style[te]}let fe;(fe=A&&A.onVnodeBeforeMount)&&tn(fe,x,R),C&&Yn(R,null,x,"beforeMount"),((fe=A&&A.onVnodeMounted)||C||se)&&LT(()=>{fe&&tn(fe,x,R),se&&me.enter(v),C&&Yn(R,null,x,"mounted")},M)}return v.nextSibling},m=(v,R,x,M,b,E,T)=>{T=T||!!R.dynamicChildren;const A=R.children,N=A.length;for(let k=0;k<N;k++){const C=T?A[k]:A[k]=rn(A[k]),me=C.type===Ys;v?(me&&!T&&k+1<N&&rn(A[k+1]).type===Ys&&(c(s(v.data.slice(C.children.length)),x,i(v)),v.data=C.children),v=f(v,C,M,b,E,T)):me&&!C.children?c(C.el=s(""),x):(nl(x,1)||ki(),n(null,C,x,null,M,b,tl(x),E))}return v},_=(v,R,x,M,b,E)=>{const{slotScopeIds:T}=R;T&&(b=b?b.concat(T):T);const A=o(v),N=m(i(v),R,A,x,M,b,E);return N&&Fi(N)&&N.data==="]"?i(R.anchor=N):(ki(),c(R.anchor=u("]"),A,N),N)},y=(v,R,x,M,b,E)=>{if(nl(v.parentElement,1)||ki(),R.el=null,E){const N=I(v);for(;;){const k=i(v);if(k&&k!==N)a(k);else break}}const T=i(v),A=o(v);return a(v),n(null,R,A,T,x,M,tl(A),b),x&&(x.vnode.el=R.el,rh(x,R.el)),T},I=(v,R="[",x="]")=>{let M=0;for(;v;)if(v=i(v),v&&Fi(v)&&(v.data===R&&M++,v.data===x)){if(M===0)return i(v);M--}return v},D=(v,R,x)=>{const M=R.parentNode;M&&M.replaceChild(v,R);let b=x;for(;b;)b.vnode.el===R&&(b.vnode.el=b.subTree.el=v),b=b.parent},P=v=>v.nodeType===1&&v.tagName==="TEMPLATE";return[h,f]}const D_="data-allow-mismatch",jS={0:"text",1:"children",2:"class",3:"style",4:"attribute"};function nl(t,e){if(e===0||e===1)for(;t&&!t.hasAttribute(D_);)t=t.parentElement;const n=t&&t.getAttribute(D_);if(n==null)return!1;if(n==="")return!0;{const r=n.split(",");return e===0&&r.includes("children")?!0:n.split(",").includes(jS[e])}}const HS=Hu().requestIdleCallback||(t=>setTimeout(t,1)),qS=Hu().cancelIdleCallback||(t=>clearTimeout(t)),p$=(t=1e4)=>e=>{const n=HS(e,{timeout:t});return()=>qS(n)};function WS(t){const{top:e,left:n,bottom:r,right:s}=t.getBoundingClientRect(),{innerHeight:i,innerWidth:o}=window;return(e>0&&e<i||r>0&&r<i)&&(n>0&&n<o||s>0&&s<o)}const m$=t=>(e,n)=>{const r=new IntersectionObserver(s=>{for(const i of s)if(i.isIntersecting){r.disconnect(),e();break}},t);return n(s=>{if(s instanceof Element){if(WS(s))return e(),r.disconnect(),!1;r.observe(s)}}),()=>r.disconnect()},g$=t=>e=>{if(t){const n=matchMedia(t);if(n.matches)e();else return n.addEventListener("change",e,{once:!0}),()=>n.removeEventListener("change",e)}},_$=(t=[])=>(e,n)=>{We(t)&&(t=[t]);let r=!1;const s=o=>{r||(r=!0,i(),e(),o.target.dispatchEvent(new o.constructor(o.type,o)))},i=()=>{n(o=>{for(const a of t)o.removeEventListener(a,s)})};return n(o=>{for(const a of t)o.addEventListener(a,s,{once:!0})}),i};function KS(t,e){if(Fi(t)&&t.data==="["){let n=1,r=t.nextSibling;for(;r;){if(r.nodeType===1){if(e(r)===!1)break}else if(Fi(r))if(r.data==="]"){if(--n===0)break}else r.data==="["&&n++;r=r.nextSibling}}else e(t)}const ls=t=>!!t.type.__asyncLoader;/*! #__NO_SIDE_EFFECTS__ */function zi(t){he(t)&&(t={loader:t});const{loader:e,loadingComponent:n,errorComponent:r,delay:s=200,hydrate:i,timeout:o,suspensible:a=!0,onError:c}=t;let u=null,h,f=0;const d=()=>(f++,u=null,m()),m=()=>{let _;return u||(_=u=e().catch(y=>{if(y=y instanceof Error?y:new Error(String(y)),c)return new Promise((I,D)=>{c(y,()=>I(d()),()=>D(y),f+1)});throw y}).then(y=>_!==u&&u?u:(y&&(y.__esModule||y[Symbol.toStringTag]==="Module")&&(y=y.default),h=y,y)))};return cr({name:"AsyncComponentWrapper",__asyncLoader:m,__asyncHydrate(_,y,I){const D=i?()=>{const v=i(()=>{I()},R=>KS(_,R));v&&(y.bum||(y.bum=[])).push(v),(y.u||(y.u=[])).push(()=>!0)}:I;h?D():m().then(()=>!y.isUnmounted&&D())},get __asyncResolved(){return h},setup(){const _=gt;if(Mp(_),h)return()=>uf(h,_);const y=v=>{u=null,wo(v,_,13,!r)};if(a&&_.suspense||ro)return m().then(v=>()=>uf(v,_)).catch(v=>(y(v),()=>r?Ye(r,{error:v}):null));const I=ft(!1),D=ft(),P=ft(!!s);return s&&setTimeout(()=>{P.value=!1},s),o!=null&&setTimeout(()=>{if(!I.value&&!D.value){const v=new Error(`Async component timed out after ${o}ms.`);y(v),D.value=v}},o),m().then(()=>{I.value=!0,_.parent&&dc(_.parent.vnode)&&_.parent.update()}).catch(v=>{y(v),D.value=v}),()=>{if(I.value&&h)return uf(h,_);if(D.value&&r)return Ye(r,{error:D.value});if(n&&!P.value)return Ye(n)}}})}function uf(t,e){const{ref:n,props:r,children:s,ce:i}=e.vnode,o=Ye(t,r,s);return o.ref=n,o.ce=i,delete e.vnode.ce,o}const dc=t=>t.type.__isKeepAlive,zS={name:"KeepAlive",__isKeepAlive:!0,props:{include:[String,RegExp,Array],exclude:[String,RegExp,Array],max:[String,Number]},setup(t,{slots:e}){const n=un(),r=n.ctx;if(!r.renderer)return()=>{const P=e.default&&e.default();return P&&P.length===1?P[0]:P};const s=new Map,i=new Set;let o=null;const a=n.suspense,{renderer:{p:c,m:u,um:h,o:{createElement:f}}}=r,d=f("div");r.activate=(P,v,R,x,M)=>{const b=P.component;u(P,v,R,0,a),c(b.vnode,P,v,R,b,a,x,P.slotScopeIds,M),mt(()=>{b.isDeactivated=!1,b.a&&Wi(b.a);const E=P.props&&P.props.onVnodeMounted;E&&tn(E,b.parent,P)},a)},r.deactivate=P=>{const v=P.component;Gl(v.m),Gl(v.a),u(P,d,null,1,a),mt(()=>{v.da&&Wi(v.da);const R=P.props&&P.props.onVnodeUnmounted;R&&tn(R,v.parent,P),v.isDeactivated=!0},a)};function m(P){hf(P),h(P,n,a,!0)}function _(P){s.forEach((v,R)=>{const x=ld(v.type);x&&!P(x)&&y(R)})}function y(P){const v=s.get(P);v&&(!o||!Pn(v,o))?m(v):o&&hf(o),s.delete(P),i.delete(P)}Ln(()=>[t.include,t.exclude],([P,v])=>{P&&_(R=>la(P,R)),v&&_(R=>!la(v,R))},{flush:"post",deep:!0});let I=null;const D=()=>{I!=null&&(Ql(n.subTree.type)?mt(()=>{s.set(I,rl(n.subTree))},n.subTree.suspense):s.set(I,rl(n.subTree)))};return pc(D),Lp(D),mc(()=>{s.forEach(P=>{const{subTree:v,suspense:R}=n,x=rl(v);if(P.type===x.type&&P.key===x.key){hf(x);const M=x.component.da;M&&mt(M,R);return}m(P)})}),()=>{if(I=null,!e.default)return o=null;const P=e.default(),v=P[0];if(P.length>1)return o=null,P;if(!vs(v)||!(v.shapeFlag&4)&&!(v.shapeFlag&128))return o=null,v;let R=rl(v);if(R.type===ut)return o=null,R;const x=R.type,M=ld(ls(R)?R.type.__asyncResolved||{}:x),{include:b,exclude:E,max:T}=t;if(b&&(!M||!la(b,M))||E&&M&&la(E,M))return R.shapeFlag&=-257,o=R,v;const A=R.key==null?x:R.key,N=s.get(A);return R.el&&(R=Nr(R),v.shapeFlag&128&&(v.ssContent=R)),I=A,N?(R.el=N.el,R.component=N.component,R.transition&&ys(R,R.transition),R.shapeFlag|=512,i.delete(A),i.add(A)):(i.add(A),T&&i.size>parseInt(T,10)&&y(i.values().next().value)),R.shapeFlag|=256,o=R,Ql(v.type)?v:R}}},GS=zS;function la(t,e){return re(t)?t.some(n=>la(n,e)):We(t)?t.split(",").includes(e):FC(t)?(t.lastIndex=0,t.test(e)):!1}function fT(t,e){pT(t,"a",e)}function dT(t,e){pT(t,"da",e)}function pT(t,e,n=gt){const r=t.__wdc||(t.__wdc=()=>{let s=n;for(;s;){if(s.isDeactivated)return;s=s.parent}return t()});if(Zu(e,r,n),n){let s=n.parent;for(;s&&s.parent;)dc(s.parent.vnode)&&QS(r,e,n,s),s=s.parent}}function QS(t,e,n,r){const s=Zu(e,t,r,!0);eh(()=>{Ap(r[e],s)},n)}function hf(t){t.shapeFlag&=-257,t.shapeFlag&=-513}function rl(t){return t.shapeFlag&128?t.ssContent:t}function Zu(t,e,n=gt,r=!1){if(n){const s=n[t]||(n[t]=[]),i=e.__weh||(e.__weh=(...o)=>{Rr();const a=ti(n),c=Un(e,n,t,o);return a(),Cr(),c});return r?s.unshift(i):s.push(i),i}}const Vr=t=>(e,n=gt)=>{(!ro||t==="sp")&&Zu(t,(...r)=>e(...r),n)},YS=Vr("bm"),pc=Vr("m"),mT=Vr("bu"),Lp=Vr("u"),mc=Vr("bum"),eh=Vr("um"),XS=Vr("sp"),JS=Vr("rtg"),ZS=Vr("rtc");function gT(t,e=gt){Zu("ec",t,e)}const Vp="components",ek="directives";function y$(t,e){return Fp(Vp,t,!0,e)||t}const _T=Symbol.for("v-ndc");function tk(t){return We(t)?Fp(Vp,t,!1)||t:t||_T}function v$(t){return Fp(ek,t)}function Fp(t,e,n=!0,r=!1){const s=_t||gt;if(s){const i=s.type;if(t===Vp){const a=ld(i,!1);if(a&&(a===e||a===Wt(e)||a===ju(Wt(e))))return i}const o=x_(s[t]||i[t],e)||x_(s.appContext[t],e);return!o&&r?i:o}}function x_(t,e){return t&&(t[e]||t[Wt(e)]||t[ju(Wt(e))])}function E$(t,e,n,r){let s;const i=n&&n[r],o=re(t);if(o||We(t)){const a=o&&Gs(t);let c=!1,u=!1;a&&(c=!In(t),u=Sr(t),t=Gu(t)),s=new Array(t.length);for(let h=0,f=t.length;h<f;h++)s[h]=e(c?u?jl(St(t[h])):St(t[h]):t[h],h,void 0,i&&i[h])}else if(typeof t=="number"){s=new Array(t);for(let a=0;a<t;a++)s[a]=e(a+1,a,void 0,i&&i[a])}else if(Ue(t))if(t[Symbol.iterator])s=Array.from(t,(a,c)=>e(a,c,void 0,i&&i[c]));else{const a=Object.keys(t);s=new Array(a.length);for(let c=0,u=a.length;c<u;c++){const h=a[c];s[c]=e(t[h],h,c,i&&i[c])}}else s=[];return n&&(n[r]=s),s}function T$(t,e){for(let n=0;n<e.length;n++){const r=e[n];if(re(r))for(let s=0;s<r.length;s++)t[r[s].name]=r[s].fn;else r&&(t[r.name]=r.key?(...s)=>{const i=r.fn(...s);return i&&(i.key=r.key),i}:r.fn)}return t}function w$(t,e,n={},r,s){if(_t.ce||_t.parent&&ls(_t.parent)&&_t.parent.ce)return e!=="default"&&(n.name=e),Tn(),Jn(bt,null,[Ye("slot",n,r&&r())],64);let i=t[e];i&&i._c&&(i._d=!1),Tn();const o=i&&Up(i(n)),a=n.key||o&&o.key,c=Jn(bt,{key:(a&&!Fn(a)?a:`_${e}`)+(!o&&r?"_fb":"")},o||(r?r():[]),o&&t._===1?64:-2);return!s&&c.scopeId&&(c.slotScopeIds=[c.scopeId+"-s"]),i&&i._c&&(i._d=!0),c}function Up(t){return t.some(e=>vs(e)?!(e.type===ut||e.type===bt&&!Up(e.children)):!0)?t:null}function b$(t,e){const n={};for(const r in t)n[e&&/[A-Z]/.test(r)?`on:${r}`:El(r)]=t[r];return n}const Zf=t=>t?WT(t)?_c(t):Zf(t.parent):null,wa=$e(Object.create(null),{$:t=>t,$el:t=>t.vnode.el,$data:t=>t.data,$props:t=>t.props,$attrs:t=>t.attrs,$slots:t=>t.slots,$refs:t=>t.refs,$parent:t=>Zf(t.parent),$root:t=>Zf(t.root),$host:t=>t.ce,$emit:t=>t.emit,$options:t=>Bp(t),$forceUpdate:t=>t.f||(t.f=()=>{Dp(t.update)}),$nextTick:t=>t.n||(t.n=Pr.bind(t.proxy)),$watch:t=>bk.bind(t)}),ff=(t,e)=>t!==be&&!t.__isScriptSetup&&De(t,e),ed={get({_:t},e){if(e==="__v_skip")return!0;const{ctx:n,setupState:r,data:s,props:i,accessCache:o,type:a,appContext:c}=t;let u;if(e[0]!=="$"){const m=o[e];if(m!==void 0)switch(m){case 1:return r[e];case 2:return s[e];case 4:return n[e];case 3:return i[e]}else{if(ff(r,e))return o[e]=1,r[e];if(s!==be&&De(s,e))return o[e]=2,s[e];if((u=t.propsOptions[0])&&De(u,e))return o[e]=3,i[e];if(n!==be&&De(n,e))return o[e]=4,n[e];td&&(o[e]=0)}}const h=wa[e];let f,d;if(h)return e==="$attrs"&&Ut(t.attrs,"get",""),h(t);if((f=a.__cssModules)&&(f=f[e]))return f;if(n!==be&&De(n,e))return o[e]=4,n[e];if(d=c.config.globalProperties,De(d,e))return d[e]},set({_:t},e,n){const{data:r,setupState:s,ctx:i}=t;return ff(s,e)?(s[e]=n,!0):r!==be&&De(r,e)?(r[e]=n,!0):De(t.props,e)||e[0]==="$"&&e.slice(1)in t?!1:(i[e]=n,!0)},has({_:{data:t,setupState:e,accessCache:n,ctx:r,appContext:s,propsOptions:i}},o){let a;return!!n[o]||t!==be&&De(t,o)||ff(e,o)||(a=i[0])&&De(a,o)||De(r,o)||De(wa,o)||De(s.config.globalProperties,o)},defineProperty(t,e,n){return n.get!=null?t._.accessCache[e]=0:De(n,"value")&&this.set(t,e,n.value,null),Reflect.defineProperty(t,e,n)}},nk=$e({},ed,{get(t,e){if(e!==Symbol.unscopables)return ed.get(t,e,t)},has(t,e){return e[0]!=="_"&&!HC(e)}});function I$(){return null}function A$(){return null}function R$(t){}function C$(t){}function S$(){return null}function k$(){}function P$(t,e){return null}function N$(){return yT().slots}function O$(){return yT().attrs}function yT(){const t=un();return t.setupContext||(t.setupContext=GT(t))}function Ka(t){return re(t)?t.reduce((e,n)=>(e[n]=null,e),{}):t}function D$(t,e){const n=Ka(t);for(const r in e){if(r.startsWith("__skip"))continue;let s=n[r];s?re(s)||he(s)?s=n[r]={type:s,default:e[r]}:s.default=e[r]:s===null&&(s=n[r]={default:e[r]}),s&&e[`__skip_${r}`]&&(s.skipFactory=!0)}return n}function x$(t,e){return!t||!e?t||e:re(t)&&re(e)?t.concat(e):$e({},Ka(t),Ka(e))}function M$(t,e){const n={};for(const r in t)e.includes(r)||Object.defineProperty(n,r,{enumerable:!0,get:()=>t[r]});return n}function L$(t){const e=un();let n=t();return od(),Rp(n)&&(n=n.catch(r=>{throw ti(e),r})),[n,()=>ti(e)]}let td=!0;function rk(t){const e=Bp(t),n=t.proxy,r=t.ctx;td=!1,e.beforeCreate&&M_(e.beforeCreate,t,"bc");const{data:s,computed:i,methods:o,watch:a,provide:c,inject:u,created:h,beforeMount:f,mounted:d,beforeUpdate:m,updated:_,activated:y,deactivated:I,beforeDestroy:D,beforeUnmount:P,destroyed:v,unmounted:R,render:x,renderTracked:M,renderTriggered:b,errorCaptured:E,serverPrefetch:T,expose:A,inheritAttrs:N,components:k,directives:C,filters:me}=e;if(u&&sk(u,r,null),o)for(const fe in o){const te=o[fe];he(te)&&(r[fe]=te.bind(n))}if(s){const fe=s.call(n,n);Ue(fe)&&(t.data=ar(fe))}if(td=!0,i)for(const fe in i){const te=i[fe],je=he(te)?te.bind(n,n):he(te.get)?te.get.bind(n,n):bn,Sn=!he(te)&&he(te.set)?te.set.bind(n):bn,_n=nt({get:je,set:Sn});Object.defineProperty(r,fe,{enumerable:!0,configurable:!0,get:()=>_n.value,set:Ze=>_n.value=Ze})}if(a)for(const fe in a)vT(a[fe],r,n,fe);if(c){const fe=he(c)?c.call(n):c;Reflect.ownKeys(fe).forEach(te=>{us(te,fe[te])})}h&&M_(h,t,"c");function se(fe,te){re(te)?te.forEach(je=>fe(je.bind(n))):te&&fe(te.bind(n))}if(se(YS,f),se(pc,d),se(mT,m),se(Lp,_),se(fT,y),se(dT,I),se(gT,E),se(ZS,M),se(JS,b),se(mc,P),se(eh,R),se(XS,T),re(A))if(A.length){const fe=t.exposed||(t.exposed={});A.forEach(te=>{Object.defineProperty(fe,te,{get:()=>n[te],set:je=>n[te]=je})})}else t.exposed||(t.exposed={});x&&t.render===bn&&(t.render=x),N!=null&&(t.inheritAttrs=N),k&&(t.components=k),C&&(t.directives=C),T&&Mp(t)}function sk(t,e,n=bn){re(t)&&(t=nd(t));for(const r in t){const s=t[r];let i;Ue(s)?"default"in s?i=ct(s.from||r,s.default,!0):i=ct(s.from||r):i=ct(s),at(i)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>i.value,set:o=>i.value=o}):e[r]=i}}function M_(t,e,n){Un(re(t)?t.map(r=>r.bind(e.proxy)):t.bind(e.proxy),e,n)}function vT(t,e,n,r){let s=r.includes(".")?OT(n,r):()=>n[r];if(We(t)){const i=e[t];he(i)&&Ln(s,i)}else if(he(t))Ln(s,t.bind(n));else if(Ue(t))if(re(t))t.forEach(i=>vT(i,e,n,r));else{const i=he(t.handler)?t.handler.bind(n):e[t.handler];he(i)&&Ln(s,i,t)}}function Bp(t){const e=t.type,{mixins:n,extends:r}=e,{mixins:s,optionsCache:i,config:{optionMergeStrategies:o}}=t.appContext,a=i.get(e);let c;return a?c=a:!s.length&&!n&&!r?c=e:(c={},s.length&&s.forEach(u=>zl(c,u,o,!0)),zl(c,e,o)),Ue(e)&&i.set(e,c),c}function zl(t,e,n,r=!1){const{mixins:s,extends:i}=e;i&&zl(t,i,n,!0),s&&s.forEach(o=>zl(t,o,n,!0));for(const o in e)if(!(r&&o==="expose")){const a=ik[o]||n&&n[o];t[o]=a?a(t[o],e[o]):e[o]}return t}const ik={data:L_,props:V_,emits:V_,methods:ua,computed:ua,beforeCreate:Yt,created:Yt,beforeMount:Yt,mounted:Yt,beforeUpdate:Yt,updated:Yt,beforeDestroy:Yt,beforeUnmount:Yt,destroyed:Yt,unmounted:Yt,activated:Yt,deactivated:Yt,errorCaptured:Yt,serverPrefetch:Yt,components:ua,directives:ua,watch:ak,provide:L_,inject:ok};function L_(t,e){return e?t?function(){return $e(he(t)?t.call(this,this):t,he(e)?e.call(this,this):e)}:e:t}function ok(t,e){return ua(nd(t),nd(e))}function nd(t){if(re(t)){const e={};for(let n=0;n<t.length;n++)e[t[n]]=t[n];return e}return t}function Yt(t,e){return t?[...new Set([].concat(t,e))]:e}function ua(t,e){return t?$e(Object.create(null),t,e):e}function V_(t,e){return t?re(t)&&re(e)?[...new Set([...t,...e])]:$e(Object.create(null),Ka(t),Ka(e??{})):e}function ak(t,e){if(!t)return e;if(!e)return t;const n=$e(Object.create(null),t);for(const r in e)n[r]=Yt(t[r],e[r]);return n}function ET(){return{app:null,config:{isNativeTag:LC,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let ck=0;function lk(t,e){return function(r,s=null){he(r)||(r=$e({},r)),s!=null&&!Ue(s)&&(s=null);const i=ET(),o=new WeakSet,a=[];let c=!1;const u=i.app={_uid:ck++,_component:r,_props:s,_container:null,_context:i,_instance:null,version:Hk,get config(){return i.config},set config(h){},use(h,...f){return o.has(h)||(h&&he(h.install)?(o.add(h),h.install(u,...f)):he(h)&&(o.add(h),h(u,...f))),u},mixin(h){return i.mixins.includes(h)||i.mixins.push(h),u},component(h,f){return f?(i.components[h]=f,u):i.components[h]},directive(h,f){return f?(i.directives[h]=f,u):i.directives[h]},mount(h,f,d){if(!c){const m=u._ceVNode||Ye(r,s);return m.appContext=i,d===!0?d="svg":d===!1&&(d=void 0),f&&e?e(m,h):t(m,h,d),c=!0,u._container=h,h.__vue_app__=u,_c(m.component)}},onUnmount(h){a.push(h)},unmount(){c&&(Un(a,u._instance,16),t(null,u._container),delete u._container.__vue_app__)},provide(h,f){return i.provides[h]=f,u},runWithContext(h){const f=Qs;Qs=u;try{return h()}finally{Qs=f}}};return u}}let Qs=null;function us(t,e){if(gt){let n=gt.provides;const r=gt.parent&&gt.parent.provides;r===n&&(n=gt.provides=Object.create(r)),n[t]=e}}function ct(t,e,n=!1){const r=gt||_t;if(r||Qs){let s=Qs?Qs._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(s&&t in s)return s[t];if(arguments.length>1)return n&&he(e)?e.call(r&&r.proxy):e}}function th(){return!!(gt||_t||Qs)}const TT={},wT=()=>Object.create(TT),bT=t=>Object.getPrototypeOf(t)===TT;function uk(t,e,n,r=!1){const s={},i=wT();t.propsDefaults=Object.create(null),IT(t,e,s,i);for(const o in t.propsOptions[0])o in s||(s[o]=void 0);n?t.props=r?s:Zn(s):t.type.props?t.props=s:t.props=i,t.attrs=i}function hk(t,e,n,r){const{props:s,attrs:i,vnode:{patchFlag:o}}=t,a=ke(s),[c]=t.propsOptions;let u=!1;if((r||o>0)&&!(o&16)){if(o&8){const h=t.vnode.dynamicProps;for(let f=0;f<h.length;f++){let d=h[f];if(nh(t.emitsOptions,d))continue;const m=e[d];if(c)if(De(i,d))m!==i[d]&&(i[d]=m,u=!0);else{const _=Wt(d);s[_]=rd(c,a,_,m,t,!1)}else m!==i[d]&&(i[d]=m,u=!0)}}}else{IT(t,e,s,i)&&(u=!0);let h;for(const f in a)(!e||!De(e,f)&&((h=sn(f))===f||!De(e,h)))&&(c?n&&(n[f]!==void 0||n[h]!==void 0)&&(s[f]=rd(c,a,f,void 0,t,!0)):delete s[f]);if(i!==a)for(const f in i)(!e||!De(e,f))&&(delete i[f],u=!0)}u&&yr(t.attrs,"set","")}function IT(t,e,n,r){const[s,i]=t.propsOptions;let o=!1,a;if(e)for(let c in e){if(qi(c))continue;const u=e[c];let h;s&&De(s,h=Wt(c))?!i||!i.includes(h)?n[h]=u:(a||(a={}))[h]=u:nh(t.emitsOptions,c)||(!(c in r)||u!==r[c])&&(r[c]=u,o=!0)}if(i){const c=ke(n),u=a||be;for(let h=0;h<i.length;h++){const f=i[h];n[f]=rd(s,c,f,u[f],t,!De(u,f))}}return o}function rd(t,e,n,r,s,i){const o=t[n];if(o!=null){const a=De(o,"default");if(a&&r===void 0){const c=o.default;if(o.type!==Function&&!o.skipFactory&&he(c)){const{propsDefaults:u}=s;if(n in u)r=u[n];else{const h=ti(s);r=u[n]=c.call(null,e),h()}}else r=c;s.ce&&s.ce._setProp(n,r)}o[0]&&(i&&!a?r=!1:o[1]&&(r===""||r===sn(n))&&(r=!0))}return r}const fk=new WeakMap;function AT(t,e,n=!1){const r=n?fk:e.propsCache,s=r.get(t);if(s)return s;const i=t.props,o={},a=[];let c=!1;if(!he(t)){const h=f=>{c=!0;const[d,m]=AT(f,e,!0);$e(o,d),m&&a.push(...m)};!n&&e.mixins.length&&e.mixins.forEach(h),t.extends&&h(t.extends),t.mixins&&t.mixins.forEach(h)}if(!i&&!c)return Ue(t)&&r.set(t,ji),ji;if(re(i))for(let h=0;h<i.length;h++){const f=Wt(i[h]);F_(f)&&(o[f]=be)}else if(i)for(const h in i){const f=Wt(h);if(F_(f)){const d=i[h],m=o[f]=re(d)||he(d)?{type:d}:$e({},d),_=m.type;let y=!1,I=!0;if(re(_))for(let D=0;D<_.length;++D){const P=_[D],v=he(P)&&P.name;if(v==="Boolean"){y=!0;break}else v==="String"&&(I=!1)}else y=he(_)&&_.name==="Boolean";m[0]=y,m[1]=I,(y||De(m,"default"))&&a.push(f)}}const u=[o,a];return Ue(t)&&r.set(t,u),u}function F_(t){return t[0]!=="$"&&!qi(t)}const $p=t=>t[0]==="_"||t==="$stable",jp=t=>re(t)?t.map(rn):[rn(t)],dk=(t,e,n)=>{if(e._n)return e;const r=Ju((...s)=>jp(e(...s)),n);return r._c=!1,r},RT=(t,e,n)=>{const r=t._ctx;for(const s in t){if($p(s))continue;const i=t[s];if(he(i))e[s]=dk(s,i,r);else if(i!=null){const o=jp(i);e[s]=()=>o}}},CT=(t,e)=>{const n=jp(e);t.slots.default=()=>n},ST=(t,e,n)=>{for(const r in e)(n||!$p(r))&&(t[r]=e[r])},pk=(t,e,n)=>{const r=t.slots=wT();if(t.vnode.shapeFlag&32){const s=e._;s?(ST(r,e,n),n&&C0(r,"_",s,!0)):RT(e,r)}else e&&CT(t,e)},mk=(t,e,n)=>{const{vnode:r,slots:s}=t;let i=!0,o=be;if(r.shapeFlag&32){const a=e._;a?n&&a===1?i=!1:ST(s,e,n):(i=!e.$stable,RT(e,s)),o=e}else e&&(CT(t,e),o={default:1});if(i)for(const a in s)!$p(a)&&o[a]==null&&delete s[a]},mt=LT;function gk(t){return kT(t)}function _k(t){return kT(t,$S)}function kT(t,e){const n=Hu();n.__VUE__=!0;const{insert:r,remove:s,patchProp:i,createElement:o,createText:a,createComment:c,setText:u,setElementText:h,parentNode:f,nextSibling:d,setScopeId:m=bn,insertStaticContent:_}=t,y=(S,O,V,H=null,U=null,q=null,Q=void 0,z=null,K=!!O.dynamicChildren)=>{if(S===O)return;S&&!Pn(S,O)&&(H=B(S),Ze(S,U,q,!0),S=null),O.patchFlag===-2&&(K=!1,O.dynamicChildren=null);const{type:W,ref:ce,shapeFlag:Y}=O;switch(W){case Ys:I(S,O,V,H);break;case ut:D(S,O,V,H);break;case Qi:S==null&&P(O,V,H,Q);break;case bt:k(S,O,V,H,U,q,Q,z,K);break;default:Y&1?x(S,O,V,H,U,q,Q,z,K):Y&6?C(S,O,V,H,U,q,Q,z,K):(Y&64||Y&128)&&W.process(S,O,V,H,U,q,Q,z,K,ie)}ce!=null&&U&&Wa(ce,S&&S.ref,q,O||S,!O)},I=(S,O,V,H)=>{if(S==null)r(O.el=a(O.children),V,H);else{const U=O.el=S.el;O.children!==S.children&&u(U,O.children)}},D=(S,O,V,H)=>{S==null?r(O.el=c(O.children||""),V,H):O.el=S.el},P=(S,O,V,H)=>{[S.el,S.anchor]=_(S.children,O,V,H,S.el,S.anchor)},v=({el:S,anchor:O},V,H)=>{let U;for(;S&&S!==O;)U=d(S),r(S,V,H),S=U;r(O,V,H)},R=({el:S,anchor:O})=>{let V;for(;S&&S!==O;)V=d(S),s(S),S=V;s(O)},x=(S,O,V,H,U,q,Q,z,K)=>{O.type==="svg"?Q="svg":O.type==="math"&&(Q="mathml"),S==null?M(O,V,H,U,q,Q,z,K):T(S,O,U,q,Q,z,K)},M=(S,O,V,H,U,q,Q,z)=>{let K,W;const{props:ce,shapeFlag:Y,transition:ae,dirs:oe}=S;if(K=S.el=o(S.type,q,ce&&ce.is,ce),Y&8?h(K,S.children):Y&16&&E(S.children,K,null,H,U,df(S,q),Q,z),oe&&Yn(S,null,H,"created"),b(K,S,S.scopeId,Q,H),ce){for(const Oe in ce)Oe!=="value"&&!qi(Oe)&&i(K,Oe,null,ce[Oe],q,H);"value"in ce&&i(K,"value",null,ce.value,q),(W=ce.onVnodeBeforeMount)&&tn(W,H,S)}oe&&Yn(S,null,H,"beforeMount");const ue=PT(U,ae);ue&&ae.beforeEnter(K),r(K,O,V),((W=ce&&ce.onVnodeMounted)||ue||oe)&&mt(()=>{W&&tn(W,H,S),ue&&ae.enter(K),oe&&Yn(S,null,H,"mounted")},U)},b=(S,O,V,H,U)=>{if(V&&m(S,V),H)for(let q=0;q<H.length;q++)m(S,H[q]);if(U){let q=U.subTree;if(O===q||Ql(q.type)&&(q.ssContent===O||q.ssFallback===O)){const Q=U.vnode;b(S,Q,Q.scopeId,Q.slotScopeIds,U.parent)}}},E=(S,O,V,H,U,q,Q,z,K=0)=>{for(let W=K;W<S.length;W++){const ce=S[W]=z?Zr(S[W]):rn(S[W]);y(null,ce,O,V,H,U,q,Q,z)}},T=(S,O,V,H,U,q,Q)=>{const z=O.el=S.el;let{patchFlag:K,dynamicChildren:W,dirs:ce}=O;K|=S.patchFlag&16;const Y=S.props||be,ae=O.props||be;let oe;if(V&&Ls(V,!1),(oe=ae.onVnodeBeforeUpdate)&&tn(oe,V,O,S),ce&&Yn(O,S,V,"beforeUpdate"),V&&Ls(V,!0),(Y.innerHTML&&ae.innerHTML==null||Y.textContent&&ae.textContent==null)&&h(z,""),W?A(S.dynamicChildren,W,z,V,H,df(O,U),q):Q||te(S,O,z,null,V,H,df(O,U),q,!1),K>0){if(K&16)N(z,Y,ae,V,U);else if(K&2&&Y.class!==ae.class&&i(z,"class",null,ae.class,U),K&4&&i(z,"style",Y.style,ae.style,U),K&8){const ue=O.dynamicProps;for(let Oe=0;Oe<ue.length;Oe++){const Pe=ue[Oe],Ot=Y[Pe],vt=ae[Pe];(vt!==Ot||Pe==="value")&&i(z,Pe,Ot,vt,U,V)}}K&1&&S.children!==O.children&&h(z,O.children)}else!Q&&W==null&&N(z,Y,ae,V,U);((oe=ae.onVnodeUpdated)||ce)&&mt(()=>{oe&&tn(oe,V,O,S),ce&&Yn(O,S,V,"updated")},H)},A=(S,O,V,H,U,q,Q)=>{for(let z=0;z<O.length;z++){const K=S[z],W=O[z],ce=K.el&&(K.type===bt||!Pn(K,W)||K.shapeFlag&198)?f(K.el):V;y(K,W,ce,null,H,U,q,Q,!0)}},N=(S,O,V,H,U)=>{if(O!==V){if(O!==be)for(const q in O)!qi(q)&&!(q in V)&&i(S,q,O[q],null,U,H);for(const q in V){if(qi(q))continue;const Q=V[q],z=O[q];Q!==z&&q!=="value"&&i(S,q,z,Q,U,H)}"value"in V&&i(S,"value",O.value,V.value,U)}},k=(S,O,V,H,U,q,Q,z,K)=>{const W=O.el=S?S.el:a(""),ce=O.anchor=S?S.anchor:a("");let{patchFlag:Y,dynamicChildren:ae,slotScopeIds:oe}=O;oe&&(z=z?z.concat(oe):oe),S==null?(r(W,V,H),r(ce,V,H),E(O.children||[],V,ce,U,q,Q,z,K)):Y>0&&Y&64&&ae&&S.dynamicChildren?(A(S.dynamicChildren,ae,V,U,q,Q,z),(O.key!=null||U&&O===U.subTree)&&Hp(S,O,!0)):te(S,O,V,ce,U,q,Q,z,K)},C=(S,O,V,H,U,q,Q,z,K)=>{O.slotScopeIds=z,S==null?O.shapeFlag&512?U.ctx.activate(O,V,H,Q,K):me(O,V,H,U,q,Q,K):Ee(S,O,K)},me=(S,O,V,H,U,q,Q)=>{const z=S.component=qT(S,H,U);if(dc(S)&&(z.ctx.renderer=ie),KT(z,!1,Q),z.asyncDep){if(U&&U.registerDep(z,se,Q),!S.el){const K=z.subTree=Ye(ut);D(null,K,O,V)}}else se(z,S,O,V,U,q,Q)},Ee=(S,O,V)=>{const H=O.component=S.component;if(Sk(S,O,V))if(H.asyncDep&&!H.asyncResolved){fe(H,O,V);return}else H.next=O,H.update();else O.el=S.el,H.vnode=O},se=(S,O,V,H,U,q,Q)=>{const z=()=>{if(S.isMounted){let{next:Y,bu:ae,u:oe,parent:ue,vnode:Oe}=S;{const Dt=NT(S);if(Dt){Y&&(Y.el=Oe.el,fe(S,Y,Q)),Dt.asyncDep.then(()=>{S.isUnmounted||z()});return}}let Pe=Y,Ot;Ls(S,!1),Y?(Y.el=Oe.el,fe(S,Y,Q)):Y=Oe,ae&&Wi(ae),(Ot=Y.props&&Y.props.onVnodeBeforeUpdate)&&tn(Ot,ue,Y,Oe),Ls(S,!0);const vt=wl(S),Rt=S.subTree;S.subTree=vt,y(Rt,vt,f(Rt.el),B(Rt),S,U,q),Y.el=vt.el,Pe===null&&rh(S,vt.el),oe&&mt(oe,U),(Ot=Y.props&&Y.props.onVnodeUpdated)&&mt(()=>tn(Ot,ue,Y,Oe),U)}else{let Y;const{el:ae,props:oe}=O,{bm:ue,m:Oe,parent:Pe,root:Ot,type:vt}=S,Rt=ls(O);if(Ls(S,!1),ue&&Wi(ue),!Rt&&(Y=oe&&oe.onVnodeBeforeMount)&&tn(Y,Pe,O),Ls(S,!0),ae&&Ve){const Dt=()=>{S.subTree=wl(S),Ve(ae,S.subTree,S,U,null)};Rt&&vt.__asyncHydrate?vt.__asyncHydrate(ae,S,Dt):Dt()}else{Ot.ce&&Ot.ce._injectChildStyle(vt);const Dt=S.subTree=wl(S);y(null,Dt,V,H,S,U,q),O.el=Dt.el}if(Oe&&mt(Oe,U),!Rt&&(Y=oe&&oe.onVnodeMounted)){const Dt=O;mt(()=>tn(Y,Pe,Dt),U)}(O.shapeFlag&256||Pe&&ls(Pe.vnode)&&Pe.vnode.shapeFlag&256)&&S.a&&mt(S.a,U),S.isMounted=!0,O=V=H=null}};S.scope.on();const K=S.effect=new Bl(z);S.scope.off();const W=S.update=K.run.bind(K),ce=S.job=K.runIfDirty.bind(K);ce.i=S,ce.id=S.uid,K.scheduler=()=>Dp(ce),Ls(S,!0),W()},fe=(S,O,V)=>{O.component=S;const H=S.vnode.props;S.vnode=O,S.next=null,hk(S,O.props,H,V),mk(S,O.children,V),Rr(),C_(S),Cr()},te=(S,O,V,H,U,q,Q,z,K=!1)=>{const W=S&&S.children,ce=S?S.shapeFlag:0,Y=O.children,{patchFlag:ae,shapeFlag:oe}=O;if(ae>0){if(ae&128){Sn(W,Y,V,H,U,q,Q,z,K);return}else if(ae&256){je(W,Y,V,H,U,q,Q,z,K);return}}oe&8?(ce&16&&en(W,U,q),Y!==W&&h(V,Y)):ce&16?oe&16?Sn(W,Y,V,H,U,q,Q,z,K):en(W,U,q,!0):(ce&8&&h(V,""),oe&16&&E(Y,V,H,U,q,Q,z,K))},je=(S,O,V,H,U,q,Q,z,K)=>{S=S||ji,O=O||ji;const W=S.length,ce=O.length,Y=Math.min(W,ce);let ae;for(ae=0;ae<Y;ae++){const oe=O[ae]=K?Zr(O[ae]):rn(O[ae]);y(S[ae],oe,V,null,U,q,Q,z,K)}W>ce?en(S,U,q,!0,!1,Y):E(O,V,H,U,q,Q,z,K,Y)},Sn=(S,O,V,H,U,q,Q,z,K)=>{let W=0;const ce=O.length;let Y=S.length-1,ae=ce-1;for(;W<=Y&&W<=ae;){const oe=S[W],ue=O[W]=K?Zr(O[W]):rn(O[W]);if(Pn(oe,ue))y(oe,ue,V,null,U,q,Q,z,K);else break;W++}for(;W<=Y&&W<=ae;){const oe=S[Y],ue=O[ae]=K?Zr(O[ae]):rn(O[ae]);if(Pn(oe,ue))y(oe,ue,V,null,U,q,Q,z,K);else break;Y--,ae--}if(W>Y){if(W<=ae){const oe=ae+1,ue=oe<ce?O[oe].el:H;for(;W<=ae;)y(null,O[W]=K?Zr(O[W]):rn(O[W]),V,ue,U,q,Q,z,K),W++}}else if(W>ae)for(;W<=Y;)Ze(S[W],U,q,!0),W++;else{const oe=W,ue=W,Oe=new Map;for(W=ue;W<=ae;W++){const zt=O[W]=K?Zr(O[W]):rn(O[W]);zt.key!=null&&Oe.set(zt.key,W)}let Pe,Ot=0;const vt=ae-ue+1;let Rt=!1,Dt=0;const jr=new Array(vt);for(W=0;W<vt;W++)jr[W]=0;for(W=oe;W<=Y;W++){const zt=S[W];if(Ot>=vt){Ze(zt,U,q,!0);continue}let yn;if(zt.key!=null)yn=Oe.get(zt.key);else for(Pe=ue;Pe<=ae;Pe++)if(jr[Pe-ue]===0&&Pn(zt,O[Pe])){yn=Pe;break}yn===void 0?Ze(zt,U,q,!0):(jr[yn-ue]=W+1,yn>=Dt?Dt=yn:Rt=!0,y(zt,O[yn],V,null,U,q,Q,z,K),Ot++)}const wi=Rt?yk(jr):ji;for(Pe=wi.length-1,W=vt-1;W>=0;W--){const zt=ue+W,yn=O[zt],bi=zt+1<ce?O[zt+1].el:H;jr[W]===0?y(null,yn,V,bi,U,q,Q,z,K):Rt&&(Pe<0||W!==wi[Pe]?_n(yn,V,bi,2):Pe--)}}},_n=(S,O,V,H,U=null)=>{const{el:q,type:Q,transition:z,children:K,shapeFlag:W}=S;if(W&6){_n(S.component.subTree,O,V,H);return}if(W&128){S.suspense.move(O,V,H);return}if(W&64){Q.move(S,O,V,ie);return}if(Q===bt){r(q,O,V);for(let Y=0;Y<K.length;Y++)_n(K[Y],O,V,H);r(S.anchor,O,V);return}if(Q===Qi){v(S,O,V);return}if(H!==2&&W&1&&z)if(H===0)z.beforeEnter(q),r(q,O,V),mt(()=>z.enter(q),U);else{const{leave:Y,delayLeave:ae,afterLeave:oe}=z,ue=()=>{S.ctx.isUnmounted?s(q):r(q,O,V)},Oe=()=>{Y(q,()=>{ue(),oe&&oe()})};ae?ae(q,ue,Oe):Oe()}else r(q,O,V)},Ze=(S,O,V,H=!1,U=!1)=>{const{type:q,props:Q,ref:z,children:K,dynamicChildren:W,shapeFlag:ce,patchFlag:Y,dirs:ae,cacheIndex:oe}=S;if(Y===-2&&(U=!1),z!=null&&(Rr(),Wa(z,null,V,S,!0),Cr()),oe!=null&&(O.renderCache[oe]=void 0),ce&256){O.ctx.deactivate(S);return}const ue=ce&1&&ae,Oe=!ls(S);let Pe;if(Oe&&(Pe=Q&&Q.onVnodeBeforeUnmount)&&tn(Pe,O,S),ce&6)Wn(S.component,V,H);else{if(ce&128){S.suspense.unmount(V,H);return}ue&&Yn(S,null,O,"beforeUnmount"),ce&64?S.type.remove(S,O,V,ie,H):W&&!W.hasOnce&&(q!==bt||Y>0&&Y&64)?en(W,O,V,!1,!0):(q===bt&&Y&384||!U&&ce&16)&&en(K,O,V),H&&et(S)}(Oe&&(Pe=Q&&Q.onVnodeUnmounted)||ue)&&mt(()=>{Pe&&tn(Pe,O,S),ue&&Yn(S,null,O,"unmounted")},V)},et=S=>{const{type:O,el:V,anchor:H,transition:U}=S;if(O===bt){$r(V,H);return}if(O===Qi){R(S);return}const q=()=>{s(V),U&&!U.persisted&&U.afterLeave&&U.afterLeave()};if(S.shapeFlag&1&&U&&!U.persisted){const{leave:Q,delayLeave:z}=U,K=()=>Q(V,q);z?z(S.el,q,K):K()}else q()},$r=(S,O)=>{let V;for(;S!==O;)V=d(S),s(S),S=V;s(O)},Wn=(S,O,V)=>{const{bum:H,scope:U,job:q,subTree:Q,um:z,m:K,a:W,parent:ce,slots:{__:Y}}=S;Gl(K),Gl(W),H&&Wi(H),ce&&re(Y)&&Y.forEach(ae=>{ce.renderCache[ae]=void 0}),U.stop(),q&&(q.flags|=8,Ze(Q,S,O,V)),z&&mt(z,O),mt(()=>{S.isUnmounted=!0},O),O&&O.pendingBranch&&!O.isUnmounted&&S.asyncDep&&!S.asyncResolved&&S.suspenseId===O.pendingId&&(O.deps--,O.deps===0&&O.resolve())},en=(S,O,V,H=!1,U=!1,q=0)=>{for(let Q=q;Q<S.length;Q++)Ze(S[Q],O,V,H,U)},B=S=>{if(S.shapeFlag&6)return B(S.component.subTree);if(S.shapeFlag&128)return S.suspense.next();const O=d(S.anchor||S.el),V=O&&O[rT];return V?d(V):O};let Z=!1;const J=(S,O,V)=>{S==null?O._vnode&&Ze(O._vnode,null,null,!0):y(O._vnode||null,S,O,null,null,null,V),O._vnode=S,Z||(Z=!0,C_(),Kl(),Z=!1)},ie={p:y,um:Ze,m:_n,r:et,mt:me,mc:E,pc:te,pbc:A,n:B,o:t};let we,Ve;return e&&([we,Ve]=e(ie)),{render:J,hydrate:we,createApp:lk(J,we)}}function df({type:t,props:e},n){return n==="svg"&&t==="foreignObject"||n==="mathml"&&t==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:n}function Ls({effect:t,job:e},n){n?(t.flags|=32,e.flags|=4):(t.flags&=-33,e.flags&=-5)}function PT(t,e){return(!t||t&&!t.pendingBranch)&&e&&!e.persisted}function Hp(t,e,n=!1){const r=t.children,s=e.children;if(re(r)&&re(s))for(let i=0;i<r.length;i++){const o=r[i];let a=s[i];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=s[i]=Zr(s[i]),a.el=o.el),!n&&a.patchFlag!==-2&&Hp(o,a)),a.type===Ys&&(a.el=o.el),a.type===ut&&!a.el&&(a.el=o.el)}}function yk(t){const e=t.slice(),n=[0];let r,s,i,o,a;const c=t.length;for(r=0;r<c;r++){const u=t[r];if(u!==0){if(s=n[n.length-1],t[s]<u){e[r]=s,n.push(r);continue}for(i=0,o=n.length-1;i<o;)a=i+o>>1,t[n[a]]<u?i=a+1:o=a;u<t[n[i]]&&(i>0&&(e[r]=n[i-1]),n[i]=r)}}for(i=n.length,o=n[i-1];i-- >0;)n[i]=o,o=e[o];return n}function NT(t){const e=t.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:NT(e)}function Gl(t){if(t)for(let e=0;e<t.length;e++)t[e].flags|=8}const vk=Symbol.for("v-scx"),Ek=()=>ct(vk);function Tk(t,e){return gc(t,null,e)}function V$(t,e){return gc(t,null,{flush:"post"})}function wk(t,e){return gc(t,null,{flush:"sync"})}function Ln(t,e,n){return gc(t,e,n)}function gc(t,e,n=be){const{immediate:r,deep:s,flush:i,once:o}=n,a=$e({},n),c=e&&r||!e&&i!=="post";let u;if(ro){if(i==="sync"){const m=Ek();u=m.__watcherHandles||(m.__watcherHandles=[])}else if(!c){const m=()=>{};return m.stop=bn,m.resume=bn,m.pause=bn,m}}const h=gt;a.call=(m,_,y)=>Un(m,h,_,y);let f=!1;i==="post"?a.scheduler=m=>{mt(m,h&&h.suspense)}:i!=="sync"&&(f=!0,a.scheduler=(m,_)=>{_?m():Dp(m)}),a.augmentJob=m=>{e&&(m.flags|=4),f&&(m.flags|=2,h&&(m.id=h.uid,m.i=h))};const d=PS(t,e,a);return ro&&(u?u.push(d):c&&d()),d}function bk(t,e,n){const r=this.proxy,s=We(t)?t.includes(".")?OT(r,t):()=>r[t]:t.bind(r,r);let i;he(e)?i=e:(i=e.handler,n=e);const o=ti(this),a=gc(s,i.bind(r),n);return o(),a}function OT(t,e){const n=e.split(".");return()=>{let r=t;for(let s=0;s<n.length&&r;s++)r=r[n[s]];return r}}function F$(t,e,n=be){const r=un(),s=Wt(e),i=sn(e),o=DT(t,s),a=IS((c,u)=>{let h,f=be,d;return wk(()=>{const m=t[s];Xt(h,m)&&(h=m,u())}),{get(){return c(),n.get?n.get(h):h},set(m){const _=n.set?n.set(m):m;if(!Xt(_,h)&&!(f!==be&&Xt(m,f)))return;const y=r.vnode.props;y&&(e in y||s in y||i in y)&&(`onUpdate:${e}`in y||`onUpdate:${s}`in y||`onUpdate:${i}`in y)||(h=m,u()),r.emit(`update:${e}`,_),Xt(m,_)&&Xt(m,f)&&!Xt(_,d)&&u(),f=m,d=_}}});return a[Symbol.iterator]=()=>{let c=0;return{next(){return c<2?{value:c++?o||be:a,done:!1}:{done:!0}}}},a}const DT=(t,e)=>e==="modelValue"||e==="model-value"?t.modelModifiers:t[`${e}Modifiers`]||t[`${Wt(e)}Modifiers`]||t[`${sn(e)}Modifiers`];function Ik(t,e,...n){if(t.isUnmounted)return;const r=t.vnode.props||be;let s=n;const i=e.startsWith("update:"),o=i&&DT(r,e.slice(7));o&&(o.trim&&(s=n.map(h=>We(h)?h.trim():h)),o.number&&(s=n.map(Fl)));let a,c=r[a=El(e)]||r[a=El(Wt(e))];!c&&i&&(c=r[a=El(sn(e))]),c&&Un(c,t,6,s);const u=r[a+"Once"];if(u){if(!t.emitted)t.emitted={};else if(t.emitted[a])return;t.emitted[a]=!0,Un(u,t,6,s)}}function xT(t,e,n=!1){const r=e.emitsCache,s=r.get(t);if(s!==void 0)return s;const i=t.emits;let o={},a=!1;if(!he(t)){const c=u=>{const h=xT(u,e,!0);h&&(a=!0,$e(o,h))};!n&&e.mixins.length&&e.mixins.forEach(c),t.extends&&c(t.extends),t.mixins&&t.mixins.forEach(c)}return!i&&!a?(Ue(t)&&r.set(t,null),null):(re(i)?i.forEach(c=>o[c]=null):$e(o,i),Ue(t)&&r.set(t,o),o)}function nh(t,e){return!t||!hc(e)?!1:(e=e.slice(2).replace(/Once$/,""),De(t,e[0].toLowerCase()+e.slice(1))||De(t,sn(e))||De(t,e))}function wl(t){const{type:e,vnode:n,proxy:r,withProxy:s,propsOptions:[i],slots:o,attrs:a,emit:c,render:u,renderCache:h,props:f,data:d,setupState:m,ctx:_,inheritAttrs:y}=t,I=Ha(t);let D,P;try{if(n.shapeFlag&4){const R=s||r,x=R;D=rn(u.call(x,R,h,f,m,d,_)),P=a}else{const R=e;D=rn(R.length>1?R(f,{attrs:a,slots:o,emit:c}):R(f,null)),P=e.props?a:Rk(a)}}catch(R){ba.length=0,wo(R,t,1),D=Ye(ut)}let v=D;if(P&&y!==!1){const R=Object.keys(P),{shapeFlag:x}=v;R.length&&x&7&&(i&&R.some(Ip)&&(P=Ck(P,i)),v=Nr(v,P,!1,!0))}return n.dirs&&(v=Nr(v,null,!1,!0),v.dirs=v.dirs?v.dirs.concat(n.dirs):n.dirs),n.transition&&ys(v,n.transition),D=v,Ha(I),D}function Ak(t,e=!0){let n;for(let r=0;r<t.length;r++){const s=t[r];if(vs(s)){if(s.type!==ut||s.children==="v-if"){if(n)return;n=s}}else return}return n}const Rk=t=>{let e;for(const n in t)(n==="class"||n==="style"||hc(n))&&((e||(e={}))[n]=t[n]);return e},Ck=(t,e)=>{const n={};for(const r in t)(!Ip(r)||!(r.slice(9)in e))&&(n[r]=t[r]);return n};function Sk(t,e,n){const{props:r,children:s,component:i}=t,{props:o,children:a,patchFlag:c}=e,u=i.emitsOptions;if(e.dirs||e.transition)return!0;if(n&&c>=0){if(c&1024)return!0;if(c&16)return r?U_(r,o,u):!!o;if(c&8){const h=e.dynamicProps;for(let f=0;f<h.length;f++){const d=h[f];if(o[d]!==r[d]&&!nh(u,d))return!0}}}else return(s||a)&&(!a||!a.$stable)?!0:r===o?!1:r?o?U_(r,o,u):!0:!!o;return!1}function U_(t,e,n){const r=Object.keys(e);if(r.length!==Object.keys(t).length)return!0;for(let s=0;s<r.length;s++){const i=r[s];if(e[i]!==t[i]&&!nh(n,i))return!0}return!1}function rh({vnode:t,parent:e},n){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===t&&(r.el=t.el),r===t)(t=e.vnode).el=n,e=e.parent;else break}}const Ql=t=>t.__isSuspense;let sd=0;const kk={name:"Suspense",__isSuspense:!0,process(t,e,n,r,s,i,o,a,c,u){if(t==null)Pk(e,n,r,s,i,o,a,c,u);else{if(i&&i.deps>0&&!t.suspense.isInFallback){e.suspense=t.suspense,e.suspense.vnode=e,e.el=t.el;return}Nk(t,e,n,r,s,o,a,c,u)}},hydrate:Ok,normalize:Dk},qp=kk;function za(t,e){const n=t.props&&t.props[e];he(n)&&n()}function Pk(t,e,n,r,s,i,o,a,c){const{p:u,o:{createElement:h}}=c,f=h("div"),d=t.suspense=MT(t,s,r,e,f,n,i,o,a,c);u(null,d.pendingBranch=t.ssContent,f,null,r,d,i,o),d.deps>0?(za(t,"onPending"),za(t,"onFallback"),u(null,t.ssFallback,e,n,r,null,i,o),Gi(d,t.ssFallback)):d.resolve(!1,!0)}function Nk(t,e,n,r,s,i,o,a,{p:c,um:u,o:{createElement:h}}){const f=e.suspense=t.suspense;f.vnode=e,e.el=t.el;const d=e.ssContent,m=e.ssFallback,{activeBranch:_,pendingBranch:y,isInFallback:I,isHydrating:D}=f;if(y)f.pendingBranch=d,Pn(d,y)?(c(y,d,f.hiddenContainer,null,s,f,i,o,a),f.deps<=0?f.resolve():I&&(D||(c(_,m,n,r,s,null,i,o,a),Gi(f,m)))):(f.pendingId=sd++,D?(f.isHydrating=!1,f.activeBranch=y):u(y,s,f),f.deps=0,f.effects.length=0,f.hiddenContainer=h("div"),I?(c(null,d,f.hiddenContainer,null,s,f,i,o,a),f.deps<=0?f.resolve():(c(_,m,n,r,s,null,i,o,a),Gi(f,m))):_&&Pn(d,_)?(c(_,d,n,r,s,f,i,o,a),f.resolve(!0)):(c(null,d,f.hiddenContainer,null,s,f,i,o,a),f.deps<=0&&f.resolve()));else if(_&&Pn(d,_))c(_,d,n,r,s,f,i,o,a),Gi(f,d);else if(za(e,"onPending"),f.pendingBranch=d,d.shapeFlag&512?f.pendingId=d.component.suspenseId:f.pendingId=sd++,c(null,d,f.hiddenContainer,null,s,f,i,o,a),f.deps<=0)f.resolve();else{const{timeout:P,pendingId:v}=f;P>0?setTimeout(()=>{f.pendingId===v&&f.fallback(m)},P):P===0&&f.fallback(m)}}function MT(t,e,n,r,s,i,o,a,c,u,h=!1){const{p:f,m:d,um:m,n:_,o:{parentNode:y,remove:I}}=u;let D;const P=xk(t);P&&e&&e.pendingBranch&&(D=e.pendingId,e.deps++);const v=t.props?Ul(t.props.timeout):void 0,R=i,x={vnode:t,parent:e,parentComponent:n,namespace:o,container:r,hiddenContainer:s,deps:0,pendingId:sd++,timeout:typeof v=="number"?v:-1,activeBranch:null,pendingBranch:null,isInFallback:!h,isHydrating:h,isUnmounted:!1,effects:[],resolve(M=!1,b=!1){const{vnode:E,activeBranch:T,pendingBranch:A,pendingId:N,effects:k,parentComponent:C,container:me}=x;let Ee=!1;x.isHydrating?x.isHydrating=!1:M||(Ee=T&&A.transition&&A.transition.mode==="out-in",Ee&&(T.transition.afterLeave=()=>{N===x.pendingId&&(d(A,me,i===R?_(T):i,0),Wl(k))}),T&&(y(T.el)===me&&(i=_(T)),m(T,C,x,!0)),Ee||d(A,me,i,0)),Gi(x,A),x.pendingBranch=null,x.isInFallback=!1;let se=x.parent,fe=!1;for(;se;){if(se.pendingBranch){se.effects.push(...k),fe=!0;break}se=se.parent}!fe&&!Ee&&Wl(k),x.effects=[],P&&e&&e.pendingBranch&&D===e.pendingId&&(e.deps--,e.deps===0&&!b&&e.resolve()),za(E,"onResolve")},fallback(M){if(!x.pendingBranch)return;const{vnode:b,activeBranch:E,parentComponent:T,container:A,namespace:N}=x;za(b,"onFallback");const k=_(E),C=()=>{x.isInFallback&&(f(null,M,A,k,T,null,N,a,c),Gi(x,M))},me=M.transition&&M.transition.mode==="out-in";me&&(E.transition.afterLeave=C),x.isInFallback=!0,m(E,T,null,!0),me||C()},move(M,b,E){x.activeBranch&&d(x.activeBranch,M,b,E),x.container=M},next(){return x.activeBranch&&_(x.activeBranch)},registerDep(M,b,E){const T=!!x.pendingBranch;T&&x.deps++;const A=M.vnode.el;M.asyncDep.catch(N=>{wo(N,M,0)}).then(N=>{if(M.isUnmounted||x.isUnmounted||x.pendingId!==M.suspenseId)return;M.asyncResolved=!0;const{vnode:k}=M;ad(M,N,!1),A&&(k.el=A);const C=!A&&M.subTree.el;b(M,k,y(A||M.subTree.el),A?null:_(M.subTree),x,o,E),C&&I(C),rh(M,k.el),T&&--x.deps===0&&x.resolve()})},unmount(M,b){x.isUnmounted=!0,x.activeBranch&&m(x.activeBranch,n,M,b),x.pendingBranch&&m(x.pendingBranch,n,M,b)}};return x}function Ok(t,e,n,r,s,i,o,a,c){const u=e.suspense=MT(e,r,n,t.parentNode,document.createElement("div"),null,s,i,o,a,!0),h=c(t,u.pendingBranch=e.ssContent,n,u,i,o);return u.deps===0&&u.resolve(!1,!0),h}function Dk(t){const{shapeFlag:e,children:n}=t,r=e&32;t.ssContent=B_(r?n.default:n),t.ssFallback=r?B_(n.fallback):Ye(ut)}function B_(t){let e;if(he(t)){const n=ei&&t._c;n&&(t._d=!1,Tn()),t=t(),n&&(t._d=!0,e=Ht,VT())}return re(t)&&(t=Ak(t)),t=rn(t),e&&!t.dynamicChildren&&(t.dynamicChildren=e.filter(n=>n!==t)),t}function LT(t,e){e&&e.pendingBranch?re(t)?e.effects.push(...t):e.effects.push(t):Wl(t)}function Gi(t,e){t.activeBranch=e;const{vnode:n,parentComponent:r}=t;let s=e.el;for(;!s&&e.component;)e=e.component.subTree,s=e.el;n.el=s,r&&r.subTree===n&&(r.vnode.el=s,rh(r,s))}function xk(t){const e=t.props&&t.props.suspensible;return e!=null&&e!==!1}const bt=Symbol.for("v-fgt"),Ys=Symbol.for("v-txt"),ut=Symbol.for("v-cmt"),Qi=Symbol.for("v-stc"),ba=[];let Ht=null;function Tn(t=!1){ba.push(Ht=t?null:[])}function VT(){ba.pop(),Ht=ba[ba.length-1]||null}let ei=1;function $_(t,e=!1){ei+=t,t<0&&Ht&&e&&(Ht.hasOnce=!0)}function FT(t){return t.dynamicChildren=ei>0?Ht||ji:null,VT(),ei>0&&Ht&&Ht.push(t),t}function Mk(t,e,n,r,s,i){return FT(BT(t,e,n,r,s,i,!0))}function Jn(t,e,n,r,s){return FT(Ye(t,e,n,r,s,!0))}function vs(t){return t?t.__v_isVNode===!0:!1}function Pn(t,e){return t.type===e.type&&t.key===e.key}function U$(t){}const UT=({key:t})=>t??null,bl=({ref:t,ref_key:e,ref_for:n})=>(typeof t=="number"&&(t=""+t),t!=null?We(t)||at(t)||he(t)?{i:_t,r:t,k:e,f:!!n}:t:null);function BT(t,e=null,n=null,r=0,s=null,i=t===bt?0:1,o=!1,a=!1){const c={__v_isVNode:!0,__v_skip:!0,type:t,props:e,key:e&&UT(e),ref:e&&bl(e),scopeId:Xu,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:r,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:_t};return a?(Wp(c,n),i&128&&t.normalize(c)):n&&(c.shapeFlag|=We(n)?8:16),ei>0&&!o&&Ht&&(c.patchFlag>0||i&6)&&c.patchFlag!==32&&Ht.push(c),c}const Ye=Lk;function Lk(t,e=null,n=null,r=0,s=null,i=!1){if((!t||t===_T)&&(t=ut),vs(t)){const a=Nr(t,e,!0);return n&&Wp(a,n),ei>0&&!i&&Ht&&(a.shapeFlag&6?Ht[Ht.indexOf(t)]=a:Ht.push(a)),a.patchFlag=-2,a}if($k(t)&&(t=t.__vccOpts),e){e=$T(e);let{class:a,style:c}=e;a&&!We(a)&&(e.class=Wu(a)),Ue(c)&&(Op(c)&&!re(c)&&(c=$e({},c)),e.style=qu(c))}const o=We(t)?1:Ql(t)?128:sT(t)?64:Ue(t)?4:he(t)?2:0;return BT(t,e,n,r,s,o,i,!0)}function $T(t){return t?Op(t)||bT(t)?$e({},t):t:null}function Nr(t,e,n=!1,r=!1){const{props:s,ref:i,patchFlag:o,children:a,transition:c}=t,u=e?HT(s||{},e):s,h={__v_isVNode:!0,__v_skip:!0,type:t.type,props:u,key:u&&UT(u),ref:e&&e.ref?n&&i?re(i)?i.concat(bl(e)):[i,bl(e)]:bl(e):i,scopeId:t.scopeId,slotScopeIds:t.slotScopeIds,children:a,target:t.target,targetStart:t.targetStart,targetAnchor:t.targetAnchor,staticCount:t.staticCount,shapeFlag:t.shapeFlag,patchFlag:e&&t.type!==bt?o===-1?16:o|16:o,dynamicProps:t.dynamicProps,dynamicChildren:t.dynamicChildren,appContext:t.appContext,dirs:t.dirs,transition:c,component:t.component,suspense:t.suspense,ssContent:t.ssContent&&Nr(t.ssContent),ssFallback:t.ssFallback&&Nr(t.ssFallback),el:t.el,anchor:t.anchor,ctx:t.ctx,ce:t.ce};return c&&r&&ys(h,c.clone(h)),h}function jT(t=" ",e=0){return Ye(Ys,null,t,e)}function B$(t,e){const n=Ye(Qi,null,t);return n.staticCount=e,n}function $$(t="",e=!1){return e?(Tn(),Jn(ut,null,t)):Ye(ut,null,t)}function rn(t){return t==null||typeof t=="boolean"?Ye(ut):re(t)?Ye(bt,null,t.slice()):vs(t)?Zr(t):Ye(Ys,null,String(t))}function Zr(t){return t.el===null&&t.patchFlag!==-1||t.memo?t:Nr(t)}function Wp(t,e){let n=0;const{shapeFlag:r}=t;if(e==null)e=null;else if(re(e))n=16;else if(typeof e=="object")if(r&65){const s=e.default;s&&(s._c&&(s._d=!1),Wp(t,s()),s._c&&(s._d=!0));return}else{n=32;const s=e._;!s&&!bT(e)?e._ctx=_t:s===3&&_t&&(_t.slots._===1?e._=1:(e._=2,t.patchFlag|=1024))}else he(e)?(e={default:e,_ctx:_t},n=32):(e=String(e),r&64?(n=16,e=[jT(e)]):n=8);t.children=e,t.shapeFlag|=n}function HT(...t){const e={};for(let n=0;n<t.length;n++){const r=t[n];for(const s in r)if(s==="class")e.class!==r.class&&(e.class=Wu([e.class,r.class]));else if(s==="style")e.style=qu([e.style,r.style]);else if(hc(s)){const i=e[s],o=r[s];o&&i!==o&&!(re(i)&&i.includes(o))&&(e[s]=i?[].concat(i,o):o)}else s!==""&&(e[s]=r[s])}return e}function tn(t,e,n,r=null){Un(t,e,7,[n,r])}const Vk=ET();let Fk=0;function qT(t,e,n){const r=t.type,s=(e?e.appContext:t.appContext)||Vk,i={uid:Fk++,vnode:t,type:r,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new N0(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:AT(r,s),emitsOptions:xT(r,s),emit:null,emitted:null,propsDefaults:be,inheritAttrs:r.inheritAttrs,ctx:be,data:be,props:be,attrs:be,slots:be,refs:be,setupState:be,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=Ik.bind(null,i),t.ce&&t.ce(i),i}let gt=null;const un=()=>gt||_t;let Yl,id;{const t=Hu(),e=(n,r)=>{let s;return(s=t[n])||(s=t[n]=[]),s.push(r),i=>{s.length>1?s.forEach(o=>o(i)):s[0](i)}};Yl=e("__VUE_INSTANCE_SETTERS__",n=>gt=n),id=e("__VUE_SSR_SETTERS__",n=>ro=n)}const ti=t=>{const e=gt;return Yl(t),t.scope.on(),()=>{t.scope.off(),Yl(e)}},od=()=>{gt&&gt.scope.off(),Yl(null)};function WT(t){return t.vnode.shapeFlag&4}let ro=!1;function KT(t,e=!1,n=!1){e&&id(e);const{props:r,children:s}=t.vnode,i=WT(t);uk(t,r,i,e),pk(t,s,n||e);const o=i?Uk(t,e):void 0;return e&&id(!1),o}function Uk(t,e){const n=t.type;t.accessCache=Object.create(null),t.proxy=new Proxy(t.ctx,ed);const{setup:r}=n;if(r){Rr();const s=t.setupContext=r.length>1?GT(t):null,i=ti(t),o=fc(r,t,0,[t.props,s]),a=Rp(o);if(Cr(),i(),(a||t.sp)&&!ls(t)&&Mp(t),a){if(o.then(od,od),e)return o.then(c=>{ad(t,c,e)}).catch(c=>{wo(c,t,0)});t.asyncDep=o}else ad(t,o,e)}else zT(t,e)}function ad(t,e,n){he(e)?t.type.__ssrInlineRender?t.ssrRender=e:t.render=e:Ue(e)&&(t.setupState=Q0(e)),zT(t,n)}let Xl,cd;function j$(t){Xl=t,cd=e=>{e.render._rc&&(e.withProxy=new Proxy(e.ctx,nk))}}const H$=()=>!Xl;function zT(t,e,n){const r=t.type;if(!t.render){if(!e&&Xl&&!r.render){const s=r.template||Bp(t).template;if(s){const{isCustomElement:i,compilerOptions:o}=t.appContext.config,{delimiters:a,compilerOptions:c}=r,u=$e($e({isCustomElement:i,delimiters:a},o),c);r.render=Xl(s,u)}}t.render=r.render||bn,cd&&cd(t)}{const s=ti(t);Rr();try{rk(t)}finally{Cr(),s()}}}const Bk={get(t,e){return Ut(t,"get",""),t[e]}};function GT(t){const e=n=>{t.exposed=n||{}};return{attrs:new Proxy(t.attrs,Bk),slots:t.slots,emit:t.emit,expose:e}}function _c(t){return t.exposed?t.exposeProxy||(t.exposeProxy=new Proxy(Q0(ES(t.exposed)),{get(e,n){if(n in e)return e[n];if(n in wa)return wa[n](t)},has(e,n){return n in e||n in wa}})):t.proxy}function ld(t,e=!0){return he(t)?t.displayName||t.name:t.name||e&&t.__name}function $k(t){return he(t)&&"__vccOpts"in t}const nt=(t,e)=>SS(t,e,ro);function At(t,e,n){const r=arguments.length;return r===2?Ue(e)&&!re(e)?vs(e)?Ye(t,null,[e]):Ye(t,e):Ye(t,null,e):(r>3?n=Array.prototype.slice.call(arguments,2):r===3&&vs(n)&&(n=[n]),Ye(t,e,n))}function q$(){}function W$(t,e,n,r){const s=n[r];if(s&&jk(s,t))return s;const i=e();return i.memo=t.slice(),i.cacheIndex=r,n[r]=i}function jk(t,e){const n=t.memo;if(n.length!=e.length)return!1;for(let r=0;r<n.length;r++)if(Xt(n[r],e[r]))return!1;return ei>0&&Ht&&Ht.push(t),!0}const Hk="3.5.16",K$=bn,z$=DS,G$=Oi,Q$=nT,qk={createComponentInstance:qT,setupComponent:KT,renderComponentRoot:wl,setCurrentRenderingInstance:Ha,isVNode:vs,normalizeVNode:rn,getComponentPublicInstance:_c,ensureValidVNode:Up,pushWarningContext:NS,popWarningContext:OS},Y$=qk,X$=null,J$=null,Z$=null;/**
* @vue/runtime-dom v3.5.16
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let ud;const j_=typeof window<"u"&&window.trustedTypes;if(j_)try{ud=j_.createPolicy("vue",{createHTML:t=>t})}catch{}const QT=ud?t=>ud.createHTML(t):t=>t,Wk="http://www.w3.org/2000/svg",Kk="http://www.w3.org/1998/Math/MathML",_r=typeof document<"u"?document:null,H_=_r&&_r.createElement("template"),zk={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,r)=>{const s=e==="svg"?_r.createElementNS(Wk,t):e==="mathml"?_r.createElementNS(Kk,t):n?_r.createElement(t,{is:n}):_r.createElement(t);return t==="select"&&r&&r.multiple!=null&&s.setAttribute("multiple",r.multiple),s},createText:t=>_r.createTextNode(t),createComment:t=>_r.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>_r.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,r,s,i){const o=n?n.previousSibling:e.lastChild;if(s&&(s===i||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),n),!(s===i||!(s=s.nextSibling)););else{H_.innerHTML=QT(r==="svg"?`<svg>${t}</svg>`:r==="mathml"?`<math>${t}</math>`:t);const a=H_.content;if(r==="svg"||r==="mathml"){const c=a.firstChild;for(;c.firstChild;)a.appendChild(c.firstChild);a.removeChild(c)}e.insertBefore(a,n)}return[o?o.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},zr="transition",Jo="animation",so=Symbol("_vtc"),YT={name:String,type:String,css:{type:Boolean,default:!0},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String},XT=$e({},cT,YT),Gk=t=>(t.displayName="Transition",t.props=XT,t),Qk=Gk((t,{slots:e})=>At(FS,JT(t),e)),Vs=(t,e=[])=>{re(t)?t.forEach(n=>n(...e)):t&&t(...e)},q_=t=>t?re(t)?t.some(e=>e.length>1):t.length>1:!1;function JT(t){const e={};for(const k in t)k in YT||(e[k]=t[k]);if(t.css===!1)return e;const{name:n="v",type:r,duration:s,enterFromClass:i=`${n}-enter-from`,enterActiveClass:o=`${n}-enter-active`,enterToClass:a=`${n}-enter-to`,appearFromClass:c=i,appearActiveClass:u=o,appearToClass:h=a,leaveFromClass:f=`${n}-leave-from`,leaveActiveClass:d=`${n}-leave-active`,leaveToClass:m=`${n}-leave-to`}=t,_=Yk(s),y=_&&_[0],I=_&&_[1],{onBeforeEnter:D,onEnter:P,onEnterCancelled:v,onLeave:R,onLeaveCancelled:x,onBeforeAppear:M=D,onAppear:b=P,onAppearCancelled:E=v}=e,T=(k,C,me,Ee)=>{k._enterCancelled=Ee,Qr(k,C?h:a),Qr(k,C?u:o),me&&me()},A=(k,C)=>{k._isLeaving=!1,Qr(k,f),Qr(k,m),Qr(k,d),C&&C()},N=k=>(C,me)=>{const Ee=k?b:P,se=()=>T(C,k,me);Vs(Ee,[C,se]),W_(()=>{Qr(C,k?c:i),zn(C,k?h:a),q_(Ee)||K_(C,r,y,se)})};return $e(e,{onBeforeEnter(k){Vs(D,[k]),zn(k,i),zn(k,o)},onBeforeAppear(k){Vs(M,[k]),zn(k,c),zn(k,u)},onEnter:N(!1),onAppear:N(!0),onLeave(k,C){k._isLeaving=!0;const me=()=>A(k,C);zn(k,f),k._enterCancelled?(zn(k,d),hd()):(hd(),zn(k,d)),W_(()=>{k._isLeaving&&(Qr(k,f),zn(k,m),q_(R)||K_(k,r,I,me))}),Vs(R,[k,me])},onEnterCancelled(k){T(k,!1,void 0,!0),Vs(v,[k])},onAppearCancelled(k){T(k,!0,void 0,!0),Vs(E,[k])},onLeaveCancelled(k){A(k),Vs(x,[k])}})}function Yk(t){if(t==null)return null;if(Ue(t))return[pf(t.enter),pf(t.leave)];{const e=pf(t);return[e,e]}}function pf(t){return Ul(t)}function zn(t,e){e.split(/\s+/).forEach(n=>n&&t.classList.add(n)),(t[so]||(t[so]=new Set)).add(e)}function Qr(t,e){e.split(/\s+/).forEach(r=>r&&t.classList.remove(r));const n=t[so];n&&(n.delete(e),n.size||(t[so]=void 0))}function W_(t){requestAnimationFrame(()=>{requestAnimationFrame(t)})}let Xk=0;function K_(t,e,n,r){const s=t._endId=++Xk,i=()=>{s===t._endId&&r()};if(n!=null)return setTimeout(i,n);const{type:o,timeout:a,propCount:c}=ZT(t,e);if(!o)return r();const u=o+"end";let h=0;const f=()=>{t.removeEventListener(u,d),i()},d=m=>{m.target===t&&++h>=c&&f()};setTimeout(()=>{h<c&&f()},a+1),t.addEventListener(u,d)}function ZT(t,e){const n=window.getComputedStyle(t),r=_=>(n[_]||"").split(", "),s=r(`${zr}Delay`),i=r(`${zr}Duration`),o=z_(s,i),a=r(`${Jo}Delay`),c=r(`${Jo}Duration`),u=z_(a,c);let h=null,f=0,d=0;e===zr?o>0&&(h=zr,f=o,d=i.length):e===Jo?u>0&&(h=Jo,f=u,d=c.length):(f=Math.max(o,u),h=f>0?o>u?zr:Jo:null,d=h?h===zr?i.length:c.length:0);const m=h===zr&&/\b(transform|all)(,|$)/.test(r(`${zr}Property`).toString());return{type:h,timeout:f,propCount:d,hasTransform:m}}function z_(t,e){for(;t.length<e.length;)t=t.concat(t);return Math.max(...e.map((n,r)=>G_(n)+G_(t[r])))}function G_(t){return t==="auto"?0:Number(t.slice(0,-1).replace(",","."))*1e3}function hd(){return document.body.offsetHeight}function Jk(t,e,n){const r=t[so];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const Jl=Symbol("_vod"),ew=Symbol("_vsh"),Zk={beforeMount(t,{value:e},{transition:n}){t[Jl]=t.style.display==="none"?"":t.style.display,n&&e?n.beforeEnter(t):Zo(t,e)},mounted(t,{value:e},{transition:n}){n&&e&&n.enter(t)},updated(t,{value:e,oldValue:n},{transition:r}){!e!=!n&&(r?e?(r.beforeEnter(t),Zo(t,!0),r.enter(t)):r.leave(t,()=>{Zo(t,!1)}):Zo(t,e))},beforeUnmount(t,{value:e}){Zo(t,e)}};function Zo(t,e){t.style.display=e?t[Jl]:"none",t[ew]=!e}function eP(){Zk.getSSRProps=({value:t})=>{if(!t)return{style:{display:"none"}}}}const tw=Symbol("");function ej(t){const e=un();if(!e)return;const n=e.ut=(s=t(e.proxy))=>{Array.from(document.querySelectorAll(`[data-v-owner="${e.uid}"]`)).forEach(i=>Zl(i,s))},r=()=>{const s=t(e.proxy);e.ce?Zl(e.ce,s):fd(e.subTree,s),n(s)};mT(()=>{Wl(r)}),pc(()=>{Ln(r,bn,{flush:"post"});const s=new MutationObserver(r);s.observe(e.subTree.el.parentNode,{childList:!0}),eh(()=>s.disconnect())})}function fd(t,e){if(t.shapeFlag&128){const n=t.suspense;t=n.activeBranch,n.pendingBranch&&!n.isHydrating&&n.effects.push(()=>{fd(n.activeBranch,e)})}for(;t.component;)t=t.component.subTree;if(t.shapeFlag&1&&t.el)Zl(t.el,e);else if(t.type===bt)t.children.forEach(n=>fd(n,e));else if(t.type===Qi){let{el:n,anchor:r}=t;for(;n&&(Zl(n,e),n!==r);)n=n.nextSibling}}function Zl(t,e){if(t.nodeType===1){const n=t.style;let r="";for(const s in e)n.setProperty(`--${s}`,e[s]),r+=`--${s}: ${e[s]};`;n[tw]=r}}const tP=/(^|;)\s*display\s*:/;function nP(t,e,n){const r=t.style,s=We(n);let i=!1;if(n&&!s){if(e)if(We(e))for(const o of e.split(";")){const a=o.slice(0,o.indexOf(":")).trim();n[a]==null&&Il(r,a,"")}else for(const o in e)n[o]==null&&Il(r,o,"");for(const o in n)o==="display"&&(i=!0),Il(r,o,n[o])}else if(s){if(e!==n){const o=r[tw];o&&(n+=";"+o),r.cssText=n,i=tP.test(n)}}else e&&t.removeAttribute("style");Jl in t&&(t[Jl]=i?r.display:"",t[ew]&&(r.display="none"))}const Q_=/\s*!important$/;function Il(t,e,n){if(re(n))n.forEach(r=>Il(t,e,r));else if(n==null&&(n=""),e.startsWith("--"))t.setProperty(e,n);else{const r=rP(t,e);Q_.test(n)?t.setProperty(sn(r),n.replace(Q_,""),"important"):t[r]=n}}const Y_=["Webkit","Moz","ms"],mf={};function rP(t,e){const n=mf[e];if(n)return n;let r=Wt(e);if(r!=="filter"&&r in t)return mf[e]=r;r=ju(r);for(let s=0;s<Y_.length;s++){const i=Y_[s]+r;if(i in t)return mf[e]=i}return e}const X_="http://www.w3.org/1999/xlink";function J_(t,e,n,r,s,i=YC(e)){r&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(X_,e.slice(6,e.length)):t.setAttributeNS(X_,e,n):n==null||i&&!S0(n)?t.removeAttribute(e):t.setAttribute(e,i?"":Fn(n)?String(n):n)}function Z_(t,e,n,r,s){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?QT(n):n);return}const i=t.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const a=i==="OPTION"?t.getAttribute("value")||"":t.value,c=n==null?t.type==="checkbox"?"on":"":String(n);(a!==c||!("_value"in t))&&(t.value=c),n==null&&t.removeAttribute(e),t._value=n;return}let o=!1;if(n===""||n==null){const a=typeof t[e];a==="boolean"?n=S0(n):n==null&&a==="string"?(n="",o=!0):a==="number"&&(n=0,o=!0)}try{t[e]=n}catch{}o&&t.removeAttribute(s||e)}function Er(t,e,n,r){t.addEventListener(e,n,r)}function sP(t,e,n,r){t.removeEventListener(e,n,r)}const ey=Symbol("_vei");function iP(t,e,n,r,s=null){const i=t[ey]||(t[ey]={}),o=i[e];if(r&&o)o.value=r;else{const[a,c]=oP(e);if(r){const u=i[e]=lP(r,s);Er(t,a,u,c)}else o&&(sP(t,a,o,c),i[e]=void 0)}}const ty=/(?:Once|Passive|Capture)$/;function oP(t){let e;if(ty.test(t)){e={};let r;for(;r=t.match(ty);)t=t.slice(0,t.length-r[0].length),e[r[0].toLowerCase()]=!0}return[t[2]===":"?t.slice(3):sn(t.slice(2)),e]}let gf=0;const aP=Promise.resolve(),cP=()=>gf||(aP.then(()=>gf=0),gf=Date.now());function lP(t,e){const n=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=n.attached)return;Un(uP(r,n.value),e,5,[r])};return n.value=t,n.attached=cP(),n}function uP(t,e){if(re(e)){const n=t.stopImmediatePropagation;return t.stopImmediatePropagation=()=>{n.call(t),t._stopped=!0},e.map(r=>s=>!s._stopped&&r&&r(s))}else return e}const ny=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,hP=(t,e,n,r,s,i)=>{const o=s==="svg";e==="class"?Jk(t,r,o):e==="style"?nP(t,n,r):hc(e)?Ip(e)||iP(t,e,n,r,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):fP(t,e,r,o))?(Z_(t,e,r),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&J_(t,e,r,o,i,e!=="value")):t._isVueCE&&(/[A-Z]/.test(e)||!We(r))?Z_(t,Wt(e),r,i,e):(e==="true-value"?t._trueValue=r:e==="false-value"&&(t._falseValue=r),J_(t,e,r,o))};function fP(t,e,n,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in t&&ny(e)&&he(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=t.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return ny(e)&&We(n)?!1:e in t}const ry={};/*! #__NO_SIDE_EFFECTS__ */function dP(t,e,n){const r=cr(t,e);Bu(r)&&$e(r,e);class s extends Kp{constructor(o){super(r,o,n)}}return s.def=r,s}/*! #__NO_SIDE_EFFECTS__ */const tj=(t,e)=>dP(t,e,hw),pP=typeof HTMLElement<"u"?HTMLElement:class{};class Kp extends pP{constructor(e,n={},r=pd){super(),this._def=e,this._props=n,this._createApp=r,this._isVueCE=!0,this._instance=null,this._app=null,this._nonce=this._def.nonce,this._connected=!1,this._resolved=!1,this._numberProps=null,this._styleChildren=new WeakSet,this._ob=null,this.shadowRoot&&r!==pd?this._root=this.shadowRoot:e.shadowRoot!==!1?(this.attachShadow({mode:"open"}),this._root=this.shadowRoot):this._root=this}connectedCallback(){if(!this.isConnected)return;!this.shadowRoot&&!this._resolved&&this._parseSlots(),this._connected=!0;let e=this;for(;e=e&&(e.parentNode||e.host);)if(e instanceof Kp){this._parent=e;break}this._instance||(this._resolved?this._mount(this._def):e&&e._pendingResolve?this._pendingResolve=e._pendingResolve.then(()=>{this._pendingResolve=void 0,this._resolveDef()}):this._resolveDef())}_setParent(e=this._parent){e&&(this._instance.parent=e._instance,this._inheritParentContext(e))}_inheritParentContext(e=this._parent){e&&this._app&&Object.setPrototypeOf(this._app._context.provides,e._instance.provides)}disconnectedCallback(){this._connected=!1,Pr(()=>{this._connected||(this._ob&&(this._ob.disconnect(),this._ob=null),this._app&&this._app.unmount(),this._instance&&(this._instance.ce=void 0),this._app=this._instance=null)})}_resolveDef(){if(this._pendingResolve)return;for(let r=0;r<this.attributes.length;r++)this._setAttr(this.attributes[r].name);this._ob=new MutationObserver(r=>{for(const s of r)this._setAttr(s.attributeName)}),this._ob.observe(this,{attributes:!0});const e=(r,s=!1)=>{this._resolved=!0,this._pendingResolve=void 0;const{props:i,styles:o}=r;let a;if(i&&!re(i))for(const c in i){const u=i[c];(u===Number||u&&u.type===Number)&&(c in this._props&&(this._props[c]=Ul(this._props[c])),(a||(a=Object.create(null)))[Wt(c)]=!0)}this._numberProps=a,this._resolveProps(r),this.shadowRoot&&this._applyStyles(o),this._mount(r)},n=this._def.__asyncLoader;n?this._pendingResolve=n().then(r=>e(this._def=r,!0)):e(this._def)}_mount(e){this._app=this._createApp(e),this._inheritParentContext(),e.configureApp&&e.configureApp(this._app),this._app._ceVNode=this._createVNode(),this._app.mount(this._root);const n=this._instance&&this._instance.exposed;if(n)for(const r in n)De(this,r)||Object.defineProperty(this,r,{get:()=>qe(n[r])})}_resolveProps(e){const{props:n}=e,r=re(n)?n:Object.keys(n||{});for(const s of Object.keys(this))s[0]!=="_"&&r.includes(s)&&this._setProp(s,this[s]);for(const s of r.map(Wt))Object.defineProperty(this,s,{get(){return this._getProp(s)},set(i){this._setProp(s,i,!0,!0)}})}_setAttr(e){if(e.startsWith("data-v-"))return;const n=this.hasAttribute(e);let r=n?this.getAttribute(e):ry;const s=Wt(e);n&&this._numberProps&&this._numberProps[s]&&(r=Ul(r)),this._setProp(s,r,!1,!0)}_getProp(e){return this._props[e]}_setProp(e,n,r=!0,s=!1){if(n!==this._props[e]&&(n===ry?delete this._props[e]:(this._props[e]=n,e==="key"&&this._app&&(this._app._ceVNode.key=n)),s&&this._instance&&this._update(),r)){const i=this._ob;i&&i.disconnect(),n===!0?this.setAttribute(sn(e),""):typeof n=="string"||typeof n=="number"?this.setAttribute(sn(e),n+""):n||this.removeAttribute(sn(e)),i&&i.observe(this,{attributes:!0})}}_update(){const e=this._createVNode();this._app&&(e.appContext=this._app._context),kP(e,this._root)}_createVNode(){const e={};this.shadowRoot||(e.onVnodeMounted=e.onVnodeUpdated=this._renderSlots.bind(this));const n=Ye(this._def,$e(e,this._props));return this._instance||(n.ce=r=>{this._instance=r,r.ce=this,r.isCE=!0;const s=(i,o)=>{this.dispatchEvent(new CustomEvent(i,Bu(o[0])?$e({detail:o},o[0]):{detail:o}))};r.emit=(i,...o)=>{s(i,o),sn(i)!==i&&s(sn(i),o)},this._setParent()}),n}_applyStyles(e,n){if(!e)return;if(n){if(n===this._def||this._styleChildren.has(n))return;this._styleChildren.add(n)}const r=this._nonce;for(let s=e.length-1;s>=0;s--){const i=document.createElement("style");r&&i.setAttribute("nonce",r),i.textContent=e[s],this.shadowRoot.prepend(i)}}_parseSlots(){const e=this._slots={};let n;for(;n=this.firstChild;){const r=n.nodeType===1&&n.getAttribute("slot")||"default";(e[r]||(e[r]=[])).push(n),this.removeChild(n)}}_renderSlots(){const e=(this._teleportTarget||this).querySelectorAll("slot"),n=this._instance.type.__scopeId;for(let r=0;r<e.length;r++){const s=e[r],i=s.getAttribute("name")||"default",o=this._slots[i],a=s.parentNode;if(o)for(const c of o){if(n&&c.nodeType===1){const u=n+"-s",h=document.createTreeWalker(c,1);c.setAttribute(u,"");let f;for(;f=h.nextNode();)f.setAttribute(u,"")}a.insertBefore(c,s)}else for(;s.firstChild;)a.insertBefore(s.firstChild,s);a.removeChild(s)}}_injectChildStyle(e){this._applyStyles(e.styles,e)}_removeChildStyle(e){}}function mP(t){const e=un(),n=e&&e.ce;return n||null}function nj(){const t=mP();return t&&t.shadowRoot}function rj(t="$style"){{const e=un();if(!e)return be;const n=e.type.__cssModules;if(!n)return be;const r=n[t];return r||be}}const nw=new WeakMap,rw=new WeakMap,eu=Symbol("_moveCb"),sy=Symbol("_enterCb"),gP=t=>(delete t.props.mode,t),_P=gP({name:"TransitionGroup",props:$e({},XT,{tag:String,moveClass:String}),setup(t,{slots:e}){const n=un(),r=aT();let s,i;return Lp(()=>{if(!s.length)return;const o=t.moveClass||`${t.name||"v"}-move`;if(!TP(s[0].el,n.vnode.el,o)){s=[];return}s.forEach(yP),s.forEach(vP);const a=s.filter(EP);hd(),a.forEach(c=>{const u=c.el,h=u.style;zn(u,o),h.transform=h.webkitTransform=h.transitionDuration="";const f=u[eu]=d=>{d&&d.target!==u||(!d||/transform$/.test(d.propertyName))&&(u.removeEventListener("transitionend",f),u[eu]=null,Qr(u,o))};u.addEventListener("transitionend",f)}),s=[]}),()=>{const o=ke(t),a=JT(o);let c=o.tag||bt;if(s=[],i)for(let u=0;u<i.length;u++){const h=i[u];h.el&&h.el instanceof Element&&(s.push(h),ys(h,qa(h,a,r,n)),nw.set(h,h.el.getBoundingClientRect()))}i=e.default?xp(e.default()):[];for(let u=0;u<i.length;u++){const h=i[u];h.key!=null&&ys(h,qa(h,a,r,n))}return Ye(c,null,i)}}}),sj=_P;function yP(t){const e=t.el;e[eu]&&e[eu](),e[sy]&&e[sy]()}function vP(t){rw.set(t,t.el.getBoundingClientRect())}function EP(t){const e=nw.get(t),n=rw.get(t),r=e.left-n.left,s=e.top-n.top;if(r||s){const i=t.el.style;return i.transform=i.webkitTransform=`translate(${r}px,${s}px)`,i.transitionDuration="0s",t}}function TP(t,e,n){const r=t.cloneNode(),s=t[so];s&&s.forEach(a=>{a.split(/\s+/).forEach(c=>c&&r.classList.remove(c))}),n.split(/\s+/).forEach(a=>a&&r.classList.add(a)),r.style.display="none";const i=e.nodeType===1?e:e.parentNode;i.appendChild(r);const{hasTransform:o}=ZT(r);return i.removeChild(r),o}const Es=t=>{const e=t.props["onUpdate:modelValue"]||!1;return re(e)?n=>Wi(e,n):e};function wP(t){t.target.composing=!0}function iy(t){const e=t.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const An=Symbol("_assign"),dd={created(t,{modifiers:{lazy:e,trim:n,number:r}},s){t[An]=Es(s);const i=r||s.props&&s.props.type==="number";Er(t,e?"change":"input",o=>{if(o.target.composing)return;let a=t.value;n&&(a=a.trim()),i&&(a=Fl(a)),t[An](a)}),n&&Er(t,"change",()=>{t.value=t.value.trim()}),e||(Er(t,"compositionstart",wP),Er(t,"compositionend",iy),Er(t,"change",iy))},mounted(t,{value:e}){t.value=e??""},beforeUpdate(t,{value:e,oldValue:n,modifiers:{lazy:r,trim:s,number:i}},o){if(t[An]=Es(o),t.composing)return;const a=(i||t.type==="number")&&!/^0\d/.test(t.value)?Fl(t.value):t.value,c=e??"";a!==c&&(document.activeElement===t&&t.type!=="range"&&(r&&e===n||s&&t.value.trim()===c)||(t.value=c))}},sw={deep:!0,created(t,e,n){t[An]=Es(n),Er(t,"change",()=>{const r=t._modelValue,s=io(t),i=t.checked,o=t[An];if(re(r)){const a=Ku(r,s),c=a!==-1;if(i&&!c)o(r.concat(s));else if(!i&&c){const u=[...r];u.splice(a,1),o(u)}}else if(pi(r)){const a=new Set(r);i?a.add(s):a.delete(s),o(a)}else o(ow(t,i))})},mounted:oy,beforeUpdate(t,e,n){t[An]=Es(n),oy(t,e,n)}};function oy(t,{value:e,oldValue:n},r){t._modelValue=e;let s;if(re(e))s=Ku(e,r.props.value)>-1;else if(pi(e))s=e.has(r.props.value);else{if(e===n)return;s=_s(e,ow(t,!0))}t.checked!==s&&(t.checked=s)}const iw={created(t,{value:e},n){t.checked=_s(e,n.props.value),t[An]=Es(n),Er(t,"change",()=>{t[An](io(t))})},beforeUpdate(t,{value:e,oldValue:n},r){t[An]=Es(r),e!==n&&(t.checked=_s(e,r.props.value))}},bP={deep:!0,created(t,{value:e,modifiers:{number:n}},r){const s=pi(e);Er(t,"change",()=>{const i=Array.prototype.filter.call(t.options,o=>o.selected).map(o=>n?Fl(io(o)):io(o));t[An](t.multiple?s?new Set(i):i:i[0]),t._assigning=!0,Pr(()=>{t._assigning=!1})}),t[An]=Es(r)},mounted(t,{value:e}){ay(t,e)},beforeUpdate(t,e,n){t[An]=Es(n)},updated(t,{value:e}){t._assigning||ay(t,e)}};function ay(t,e){const n=t.multiple,r=re(e);if(!(n&&!r&&!pi(e))){for(let s=0,i=t.options.length;s<i;s++){const o=t.options[s],a=io(o);if(n)if(r){const c=typeof a;c==="string"||c==="number"?o.selected=e.some(u=>String(u)===String(a)):o.selected=Ku(e,a)>-1}else o.selected=e.has(a);else if(_s(io(o),e)){t.selectedIndex!==s&&(t.selectedIndex=s);return}}!n&&t.selectedIndex!==-1&&(t.selectedIndex=-1)}}function io(t){return"_value"in t?t._value:t.value}function ow(t,e){const n=e?"_trueValue":"_falseValue";return n in t?t[n]:e}const IP={created(t,e,n){sl(t,e,n,null,"created")},mounted(t,e,n){sl(t,e,n,null,"mounted")},beforeUpdate(t,e,n,r){sl(t,e,n,r,"beforeUpdate")},updated(t,e,n,r){sl(t,e,n,r,"updated")}};function aw(t,e){switch(t){case"SELECT":return bP;case"TEXTAREA":return dd;default:switch(e){case"checkbox":return sw;case"radio":return iw;default:return dd}}}function sl(t,e,n,r,s){const o=aw(t.tagName,n.props&&n.props.type)[s];o&&o(t,e,n,r)}function AP(){dd.getSSRProps=({value:t})=>({value:t}),iw.getSSRProps=({value:t},e)=>{if(e.props&&_s(e.props.value,t))return{checked:!0}},sw.getSSRProps=({value:t},e)=>{if(re(t)){if(e.props&&Ku(t,e.props.value)>-1)return{checked:!0}}else if(pi(t)){if(e.props&&t.has(e.props.value))return{checked:!0}}else if(t)return{checked:!0}},IP.getSSRProps=(t,e)=>{if(typeof e.type!="string")return;const n=aw(e.type.toUpperCase(),e.props&&e.props.type);if(n.getSSRProps)return n.getSSRProps(t,e)}}const RP=["ctrl","shift","alt","meta"],CP={stop:t=>t.stopPropagation(),prevent:t=>t.preventDefault(),self:t=>t.target!==t.currentTarget,ctrl:t=>!t.ctrlKey,shift:t=>!t.shiftKey,alt:t=>!t.altKey,meta:t=>!t.metaKey,left:t=>"button"in t&&t.button!==0,middle:t=>"button"in t&&t.button!==1,right:t=>"button"in t&&t.button!==2,exact:(t,e)=>RP.some(n=>t[`${n}Key`]&&!e.includes(n))},ij=(t,e)=>{const n=t._withMods||(t._withMods={}),r=e.join(".");return n[r]||(n[r]=(s,...i)=>{for(let o=0;o<e.length;o++){const a=CP[e[o]];if(a&&a(s,e))return}return t(s,...i)})},SP={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},oj=(t,e)=>{const n=t._withKeys||(t._withKeys={}),r=e.join(".");return n[r]||(n[r]=s=>{if(!("key"in s))return;const i=sn(s.key);if(e.some(o=>o===i||SP[o]===i))return t(s)})},cw=$e({patchProp:hP},zk);let Ia,cy=!1;function lw(){return Ia||(Ia=gk(cw))}function uw(){return Ia=cy?Ia:_k(cw),cy=!0,Ia}const kP=(...t)=>{lw().render(...t)},aj=(...t)=>{uw().hydrate(...t)},pd=(...t)=>{const e=lw().createApp(...t),{mount:n}=e;return e.mount=r=>{const s=dw(r);if(!s)return;const i=e._component;!he(i)&&!i.render&&!i.template&&(i.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const o=n(s,!1,fw(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),o},e},hw=(...t)=>{const e=uw().createApp(...t),{mount:n}=e;return e.mount=r=>{const s=dw(r);if(s)return n(s,!0,fw(s))},e};function fw(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function dw(t){return We(t)?document.querySelector(t):t}let ly=!1;const cj=()=>{ly||(ly=!0,AP(),eP())},PP=/"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,NP=/"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,OP=/^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;function DP(t,e){if(t==="__proto__"||t==="constructor"&&e&&typeof e=="object"&&"prototype"in e){xP(t);return}return e}function xP(t){console.warn(`[destr] Dropping "${t}" key to prevent prototype pollution.`)}function tu(t,e={}){if(typeof t!="string")return t;if(t[0]==='"'&&t[t.length-1]==='"'&&t.indexOf("\\")===-1)return t.slice(1,-1);const n=t.trim();if(n.length<=9)switch(n.toLowerCase()){case"true":return!0;case"false":return!1;case"undefined":return;case"null":return null;case"nan":return Number.NaN;case"infinity":return Number.POSITIVE_INFINITY;case"-infinity":return Number.NEGATIVE_INFINITY}if(!OP.test(t)){if(e.strict)throw new SyntaxError("[destr] Invalid JSON");return t}try{if(PP.test(t)||NP.test(t)){if(e.strict)throw new Error("[destr] Possible prototype pollution");return JSON.parse(t,DP)}return JSON.parse(t)}catch(r){if(e.strict)throw r;return t}}const MP=/#/g,LP=/&/g,VP=/\//g,FP=/=/g,zp=/\+/g,UP=/%5e/gi,BP=/%60/gi,$P=/%7c/gi,jP=/%20/gi;function HP(t){return encodeURI(""+t).replace($P,"|")}function md(t){return HP(typeof t=="string"?t:JSON.stringify(t)).replace(zp,"%2B").replace(jP,"+").replace(MP,"%23").replace(LP,"%26").replace(BP,"`").replace(UP,"^").replace(VP,"%2F")}function _f(t){return md(t).replace(FP,"%3D")}function nu(t=""){try{return decodeURIComponent(""+t)}catch{return""+t}}function qP(t){return nu(t.replace(zp," "))}function WP(t){return nu(t.replace(zp," "))}function pw(t=""){const e=Object.create(null);t[0]==="?"&&(t=t.slice(1));for(const n of t.split("&")){const r=n.match(/([^=]+)=?(.*)/)||[];if(r.length<2)continue;const s=qP(r[1]);if(s==="__proto__"||s==="constructor")continue;const i=WP(r[2]||"");e[s]===void 0?e[s]=i:Array.isArray(e[s])?e[s].push(i):e[s]=[e[s],i]}return e}function KP(t,e){return(typeof e=="number"||typeof e=="boolean")&&(e=String(e)),e?Array.isArray(e)?e.map(n=>`${_f(t)}=${md(n)}`).join("&"):`${_f(t)}=${md(e)}`:_f(t)}function zP(t){return Object.keys(t).filter(e=>t[e]!==void 0).map(e=>KP(e,t[e])).filter(Boolean).join("&")}const GP=/^[\s\w\0+.-]{2,}:([/\\]{1,2})/,QP=/^[\s\w\0+.-]{2,}:([/\\]{2})?/,YP=/^([/\\]\s*){2,}[^/\\]/,XP=/^[\s\0]*(blob|data|javascript|vbscript):$/i,JP=/\/$|\/\?|\/#/,ZP=/^\.?\//;function mi(t,e={}){return typeof e=="boolean"&&(e={acceptRelative:e}),e.strict?GP.test(t):QP.test(t)||(e.acceptRelative?YP.test(t):!1)}function e1(t){return!!t&&XP.test(t)}function gd(t="",e){return e?JP.test(t):t.endsWith("/")}function Ga(t="",e){if(!e)return(gd(t)?t.slice(0,-1):t)||"/";if(!gd(t,!0))return t||"/";let n=t,r="";const s=t.indexOf("#");s!==-1&&(n=t.slice(0,s),r=t.slice(s));const[i,...o]=n.split("?");return((i.endsWith("/")?i.slice(0,-1):i)||"/")+(o.length>0?`?${o.join("?")}`:"")+r}function t1(t="",e){if(!e)return t.endsWith("/")?t:t+"/";if(gd(t,!0))return t||"/";let n=t,r="";const s=t.indexOf("#");if(s!==-1&&(n=t.slice(0,s),r=t.slice(s),!n))return r;const[i,...o]=n.split("?");return i+"/"+(o.length>0?`?${o.join("?")}`:"")+r}function n1(t,e){if(gw(e)||mi(t))return t;const n=Ga(e);return t.startsWith(n)?t:Gp(n,t)}function uy(t,e){if(gw(e))return t;const n=Ga(e);if(!t.startsWith(n))return t;const r=t.slice(n.length);return r[0]==="/"?r:"/"+r}function mw(t,e){const n=vw(t),r={...pw(n.search),...e};return n.search=zP(r),i1(n)}function gw(t){return!t||t==="/"}function r1(t){return t&&t!=="/"}function Gp(t,...e){let n=t||"";for(const r of e.filter(s=>r1(s)))if(n){const s=r.replace(ZP,"");n=t1(n)+s}else n=r;return n}function _w(...t){var o,a,c,u;const e=/\/(?!\/)/,n=t.filter(Boolean),r=[];let s=0;for(const h of n)if(!(!h||h==="/")){for(const[f,d]of h.split(e).entries())if(!(!d||d===".")){if(d===".."){if(r.length===1&&mi(r[0]))continue;r.pop(),s--;continue}if(f===1&&((o=r[r.length-1])!=null&&o.endsWith(":/"))){r[r.length-1]+="/"+d;continue}r.push(d),s++}}let i=r.join("/");return s>=0?(a=n[0])!=null&&a.startsWith("/")&&!i.startsWith("/")?i="/"+i:(c=n[0])!=null&&c.startsWith("./")&&!i.startsWith("./")&&(i="./"+i):i="../".repeat(-1*s)+i,(u=n[n.length-1])!=null&&u.endsWith("/")&&!i.endsWith("/")&&(i+="/"),i}function s1(t,e){return nu(Ga(t))===nu(Ga(e))}const yw=Symbol.for("ufo:protocolRelative");function vw(t="",e){const n=t.match(/^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i);if(n){const[,f,d=""]=n;return{protocol:f.toLowerCase(),pathname:d,href:f+d,auth:"",host:"",search:"",hash:""}}if(!mi(t,{acceptRelative:!0}))return hy(t);const[,r="",s,i=""]=t.replace(/\\/g,"/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/)||[];let[,o="",a=""]=i.match(/([^#/?]*)(.*)?/)||[];r==="file:"&&(a=a.replace(/\/(?=[A-Za-z]:)/,""));const{pathname:c,search:u,hash:h}=hy(a);return{protocol:r.toLowerCase(),auth:s?s.slice(0,Math.max(0,s.length-1)):"",host:o,pathname:c,search:u,hash:h,[yw]:!r}}function hy(t=""){const[e="",n="",r=""]=(t.match(/([^#?]*)(\?[^#]*)?(#.*)?/)||[]).splice(1);return{pathname:e,search:n,hash:r}}function i1(t){const e=t.pathname||"",n=t.search?(t.search.startsWith("?")?"":"?")+t.search:"",r=t.hash||"",s=t.auth?t.auth+"@":"",i=t.host||"";return(t.protocol||t[yw]?(t.protocol||"")+"//":"")+s+i+e+n+r}class o1 extends Error{constructor(e,n){super(e,n),this.name="FetchError",n!=null&&n.cause&&!this.cause&&(this.cause=n.cause)}}function a1(t){var c,u,h,f,d;const e=((c=t.error)==null?void 0:c.message)||((u=t.error)==null?void 0:u.toString())||"",n=((h=t.request)==null?void 0:h.method)||((f=t.options)==null?void 0:f.method)||"GET",r=((d=t.request)==null?void 0:d.url)||String(t.request)||"/",s=`[${n}] ${JSON.stringify(r)}`,i=t.response?`${t.response.status} ${t.response.statusText}`:"<no response>",o=`${s}: ${i}${e?` ${e}`:""}`,a=new o1(o,t.error?{cause:t.error}:void 0);for(const m of["request","options","response"])Object.defineProperty(a,m,{get(){return t[m]}});for(const[m,_]of[["data","_data"],["status","status"],["statusCode","status"],["statusText","statusText"],["statusMessage","statusText"]])Object.defineProperty(a,m,{get(){return t.response&&t.response[_]}});return a}const c1=new Set(Object.freeze(["PATCH","POST","PUT","DELETE"]));function fy(t="GET"){return c1.has(t.toUpperCase())}function l1(t){if(t===void 0)return!1;const e=typeof t;return e==="string"||e==="number"||e==="boolean"||e===null?!0:e!=="object"?!1:Array.isArray(t)?!0:t.buffer?!1:t.constructor&&t.constructor.name==="Object"||typeof t.toJSON=="function"}const u1=new Set(["image/svg","application/xml","application/xhtml","application/html"]),h1=/^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;function f1(t=""){if(!t)return"json";const e=t.split(";").shift()||"";return h1.test(e)?"json":u1.has(e)||e.startsWith("text/")?"text":"blob"}function d1(t,e,n,r){const s=p1((e==null?void 0:e.headers)??(t==null?void 0:t.headers),n==null?void 0:n.headers,r);let i;return(n!=null&&n.query||n!=null&&n.params||e!=null&&e.params||e!=null&&e.query)&&(i={...n==null?void 0:n.params,...n==null?void 0:n.query,...e==null?void 0:e.params,...e==null?void 0:e.query}),{...n,...e,query:i,params:i,headers:s}}function p1(t,e,n){if(!e)return new n(t);const r=new n(e);if(t)for(const[s,i]of Symbol.iterator in t||Array.isArray(t)?t:new n(t))r.set(s,i);return r}async function il(t,e){if(e)if(Array.isArray(e))for(const n of e)await n(t);else await e(t)}const m1=new Set([408,409,425,429,500,502,503,504]),g1=new Set([101,204,205,304]);function Ew(t={}){const{fetch:e=globalThis.fetch,Headers:n=globalThis.Headers,AbortController:r=globalThis.AbortController}=t;async function s(a){const c=a.error&&a.error.name==="AbortError"&&!a.options.timeout||!1;if(a.options.retry!==!1&&!c){let h;typeof a.options.retry=="number"?h=a.options.retry:h=fy(a.options.method)?0:1;const f=a.response&&a.response.status||500;if(h>0&&(Array.isArray(a.options.retryStatusCodes)?a.options.retryStatusCodes.includes(f):m1.has(f))){const d=typeof a.options.retryDelay=="function"?a.options.retryDelay(a):a.options.retryDelay||0;return d>0&&await new Promise(m=>setTimeout(m,d)),i(a.request,{...a.options,retry:h-1})}}const u=a1(a);throw Error.captureStackTrace&&Error.captureStackTrace(u,i),u}const i=async function(c,u={}){const h={request:c,options:d1(c,u,t.defaults,n),response:void 0,error:void 0};h.options.method&&(h.options.method=h.options.method.toUpperCase()),h.options.onRequest&&await il(h,h.options.onRequest),typeof h.request=="string"&&(h.options.baseURL&&(h.request=n1(h.request,h.options.baseURL)),h.options.query&&(h.request=mw(h.request,h.options.query),delete h.options.query),"query"in h.options&&delete h.options.query,"params"in h.options&&delete h.options.params),h.options.body&&fy(h.options.method)&&(l1(h.options.body)?(h.options.body=typeof h.options.body=="string"?h.options.body:JSON.stringify(h.options.body),h.options.headers=new n(h.options.headers||{}),h.options.headers.has("content-type")||h.options.headers.set("content-type","application/json"),h.options.headers.has("accept")||h.options.headers.set("accept","application/json")):("pipeTo"in h.options.body&&typeof h.options.body.pipeTo=="function"||typeof h.options.body.pipe=="function")&&("duplex"in h.options||(h.options.duplex="half")));let f;if(!h.options.signal&&h.options.timeout){const m=new r;f=setTimeout(()=>{const _=new Error("[TimeoutError]: The operation was aborted due to timeout");_.name="TimeoutError",_.code=23,m.abort(_)},h.options.timeout),h.options.signal=m.signal}try{h.response=await e(h.request,h.options)}catch(m){return h.error=m,h.options.onRequestError&&await il(h,h.options.onRequestError),await s(h)}finally{f&&clearTimeout(f)}if((h.response.body||h.response._bodyInit)&&!g1.has(h.response.status)&&h.options.method!=="HEAD"){const m=(h.options.parseResponse?"json":h.options.responseType)||f1(h.response.headers.get("content-type")||"");switch(m){case"json":{const _=await h.response.text(),y=h.options.parseResponse||tu;h.response._data=y(_);break}case"stream":{h.response._data=h.response.body||h.response._bodyInit;break}default:h.response._data=await h.response[m]()}}return h.options.onResponse&&await il(h,h.options.onResponse),!h.options.ignoreResponseError&&h.response.status>=400&&h.response.status<600?(h.options.onResponseError&&await il(h,h.options.onResponseError),await s(h)):h.response},o=async function(c,u){return(await i(c,u))._data};return o.raw=i,o.native=(...a)=>e(...a),o.create=(a={},c={})=>Ew({...t,...c,defaults:{...t.defaults,...c.defaults,...a}}),o}const ru=function(){if(typeof globalThis<"u")return globalThis;if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("unable to locate global object")}(),_1=ru.fetch?(...t)=>ru.fetch(...t):()=>Promise.reject(new Error("[ofetch] global.fetch is not supported!")),y1=ru.Headers,v1=ru.AbortController,E1=Ew({fetch:_1,Headers:y1,AbortController:v1}),T1=E1,w1=()=>{var t;return((t=window==null?void 0:window.__NUXT__)==null?void 0:t.config)||{}},su=w1().app,b1=()=>su.baseURL,I1=()=>su.buildAssetsDir,Qp=(...t)=>_w(Tw(),I1(),...t),Tw=(...t)=>{const e=su.cdnURL||su.baseURL;return t.length?_w(e,...t):e};globalThis.__buildAssetsURL=Qp,globalThis.__publicAssetsURL=Tw;globalThis.$fetch||(globalThis.$fetch=T1.create({baseURL:b1()}));"global"in globalThis||(globalThis.global=globalThis);function _d(t,e={},n){for(const r in t){const s=t[r],i=n?`${n}:${r}`:r;typeof s=="object"&&s!==null?_d(s,e,i):typeof s=="function"&&(e[i]=s)}return e}const A1={run:t=>t()},R1=()=>A1,ww=typeof console.createTask<"u"?console.createTask:R1;function C1(t,e){const n=e.shift(),r=ww(n);return t.reduce((s,i)=>s.then(()=>r.run(()=>i(...e))),Promise.resolve())}function S1(t,e){const n=e.shift(),r=ww(n);return Promise.all(t.map(s=>r.run(()=>s(...e))))}function yf(t,e){for(const n of[...t])n(e)}class k1{constructor(){this._hooks={},this._before=void 0,this._after=void 0,this._deprecatedMessages=void 0,this._deprecatedHooks={},this.hook=this.hook.bind(this),this.callHook=this.callHook.bind(this),this.callHookWith=this.callHookWith.bind(this)}hook(e,n,r={}){if(!e||typeof n!="function")return()=>{};const s=e;let i;for(;this._deprecatedHooks[e];)i=this._deprecatedHooks[e],e=i.to;if(i&&!r.allowDeprecated){let o=i.message;o||(o=`${s} hook has been deprecated`+(i.to?`, please use ${i.to}`:"")),this._deprecatedMessages||(this._deprecatedMessages=new Set),this._deprecatedMessages.has(o)||(console.warn(o),this._deprecatedMessages.add(o))}if(!n.name)try{Object.defineProperty(n,"name",{get:()=>"_"+e.replace(/\W+/g,"_")+"_hook_cb",configurable:!0})}catch{}return this._hooks[e]=this._hooks[e]||[],this._hooks[e].push(n),()=>{n&&(this.removeHook(e,n),n=void 0)}}hookOnce(e,n){let r,s=(...i)=>(typeof r=="function"&&r(),r=void 0,s=void 0,n(...i));return r=this.hook(e,s),r}removeHook(e,n){if(this._hooks[e]){const r=this._hooks[e].indexOf(n);r!==-1&&this._hooks[e].splice(r,1),this._hooks[e].length===0&&delete this._hooks[e]}}deprecateHook(e,n){this._deprecatedHooks[e]=typeof n=="string"?{to:n}:n;const r=this._hooks[e]||[];delete this._hooks[e];for(const s of r)this.hook(e,s)}deprecateHooks(e){Object.assign(this._deprecatedHooks,e);for(const n in e)this.deprecateHook(n,e[n])}addHooks(e){const n=_d(e),r=Object.keys(n).map(s=>this.hook(s,n[s]));return()=>{for(const s of r.splice(0,r.length))s()}}removeHooks(e){const n=_d(e);for(const r in n)this.removeHook(r,n[r])}removeAllHooks(){for(const e in this._hooks)delete this._hooks[e]}callHook(e,...n){return n.unshift(e),this.callHookWith(C1,e,...n)}callHookParallel(e,...n){return n.unshift(e),this.callHookWith(S1,e,...n)}callHookWith(e,n,...r){const s=this._before||this._after?{name:n,args:r,context:{}}:void 0;this._before&&yf(this._before,s);const i=e(n in this._hooks?[...this._hooks[n]]:[],r);return i instanceof Promise?i.finally(()=>{this._after&&s&&yf(this._after,s)}):(this._after&&s&&yf(this._after,s),i)}beforeEach(e){return this._before=this._before||[],this._before.push(e),()=>{if(this._before!==void 0){const n=this._before.indexOf(e);n!==-1&&this._before.splice(n,1)}}}afterEach(e){return this._after=this._after||[],this._after.push(e),()=>{if(this._after!==void 0){const n=this._after.indexOf(e);n!==-1&&this._after.splice(n,1)}}}}function bw(){return new k1}function P1(t={}){let e,n=!1;const r=o=>{if(e&&e!==o)throw new Error("Context conflict")};let s;if(t.asyncContext){const o=t.AsyncLocalStorage||globalThis.AsyncLocalStorage;o?s=new o:console.warn("[unctx] `AsyncLocalStorage` is not provided.")}const i=()=>{if(s){const o=s.getStore();if(o!==void 0)return o}return e};return{use:()=>{const o=i();if(o===void 0)throw new Error("Context is not available");return o},tryUse:()=>i(),set:(o,a)=>{a||r(o),e=o,n=!0},unset:()=>{e=void 0,n=!1},call:(o,a)=>{r(o),e=o;try{return s?s.run(o,a):a()}finally{n||(e=void 0)}},async callAsync(o,a){e=o;const c=()=>{e=o},u=()=>e===o?c:void 0;yd.add(u);try{const h=s?s.run(o,a):a();return n||(e=void 0),await h}finally{yd.delete(u)}}}}function N1(t={}){const e={};return{get(n,r={}){return e[n]||(e[n]=P1({...t,...r})),e[n]}}}const iu=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof global<"u"?global:typeof window<"u"?window:{},dy="__unctx__",O1=iu[dy]||(iu[dy]=N1()),D1=(t,e={})=>O1.get(t,e),py="__unctx_async_handlers__",yd=iu[py]||(iu[py]=new Set);function Yi(t){const e=[];for(const s of yd){const i=s();i&&e.push(i)}const n=()=>{for(const s of e)s()};let r=t();return r&&typeof r=="object"&&"catch"in r&&(r=r.catch(s=>{throw n(),s})),[r,n]}const x1=!1,my=!1,M1=!1,lj={componentName:"NuxtLink",prefetch:!0,prefetchOn:{visibility:!0}},uj={value:null,errorValue:null,deep:!0},L1=null,hj={},V1="#__nuxt",Iw="nuxt-app",gy=36e5,F1="vite:preloadError";function Aw(t=Iw){return D1(t,{asyncContext:!1})}const U1="__nuxt_plugin";function B1(t){var s;let e=0;const n={_id:t.id||Iw||"nuxt-app",_scope:ZC(),provide:void 0,globalName:"nuxt",versions:{get nuxt(){return"3.17.4"},get vue(){return n.vueApp.version}},payload:Zn({...((s=t.ssrContext)==null?void 0:s.payload)||{},data:Zn({}),state:ar({}),once:new Set,_errors:Zn({})}),static:{data:{}},runWithContext(i){return n._scope.active&&!Sp()?n._scope.run(()=>_y(n,i)):_y(n,i)},isHydrating:!0,deferHydration(){if(!n.isHydrating)return()=>{};e++;let i=!1;return()=>{if(!i&&(i=!0,e--,e===0))return n.isHydrating=!1,n.callHook("app:suspense:resolve")}},_asyncDataPromises:{},_asyncData:Zn({}),_payloadRevivers:{},...t};{const i=window.__NUXT__;if(i)for(const o in i)switch(o){case"data":case"state":case"_errors":Object.assign(n.payload[o],i[o]);break;default:n.payload[o]=i[o]}}n.hooks=bw(),n.hook=n.hooks.hook,n.callHook=n.hooks.callHook,n.provide=(i,o)=>{const a="$"+i;ol(n,a,o),ol(n.vueApp.config.globalProperties,a,o)},ol(n.vueApp,"$nuxt",n),ol(n.vueApp.config.globalProperties,"$nuxt",n);{window.addEventListener(F1,o=>{n.callHook("app:chunkError",{error:o.payload}),o.payload.message.includes("Unable to preload CSS")&&o.preventDefault()}),window.useNuxtApp||(window.useNuxtApp=rt);const i=n.hook("app:error",(...o)=>{console.error("[nuxt] error caught during app initialization",...o)});n.hook("app:mounted",i)}const r=n.payload.config;return n.provide("config",r),n}function $1(t,e){e.hooks&&t.hooks.addHooks(e.hooks)}async function j1(t,e){if(typeof e=="function"){const{provide:n}=await t.runWithContext(()=>e(t))||{};if(n&&typeof n=="object")for(const r in n)t.provide(r,n[r])}}async function H1(t,e){const n=new Set,r=[],s=[],i=[];let o=0;async function a(c){var h;const u=((h=c.dependsOn)==null?void 0:h.filter(f=>e.some(d=>d._name===f)&&!n.has(f)))??[];if(u.length>0)r.push([new Set(u),c]);else{const f=j1(t,c).then(async()=>{c._name&&(n.add(c._name),await Promise.all(r.map(async([d,m])=>{d.has(c._name)&&(d.delete(c._name),d.size===0&&(o++,await a(m)))})))});c.parallel?s.push(f.catch(d=>i.push(d))):await f}}for(const c of e)$1(t,c);for(const c of e)await a(c);if(await Promise.all(s),o)for(let c=0;c<o;c++)await Promise.all(s);if(i.length)throw i[0]}function gn(t){if(typeof t=="function")return t;const e=t._name||t.name;return delete t.name,Object.assign(t.setup||(()=>{}),t,{[U1]:!0,_name:e})}function _y(t,e,n){const r=()=>e();return Aw(t._id).set(t),t.vueApp.runWithContext(r)}function Rw(t){var n;let e;return th()&&(e=(n=un())==null?void 0:n.appContext.app.$nuxt),e||(e=Aw(t).tryUse()),e||null}function rt(t){const e=Rw(t);if(!e)throw new Error("[nuxt] instance unavailable");return e}function bo(t){return rt().$config}function ol(t,e,n){Object.defineProperty(t,e,{get:()=>n})}function q1(t,e){return{ctx:{table:t},matchAll:n=>Sw(n,t)}}function Cw(t){const e={};for(const n in t)e[n]=n==="dynamic"?new Map(Object.entries(t[n]).map(([r,s])=>[r,Cw(s)])):new Map(Object.entries(t[n]));return e}function W1(t){return q1(Cw(t))}function Sw(t,e,n){t.endsWith("/")&&(t=t.slice(0,-1)||"/");const r=[];for(const[i,o]of yy(e.wildcard))(t===i||t.startsWith(i+"/"))&&r.push(o);for(const[i,o]of yy(e.dynamic))if(t.startsWith(i+"/")){const a="/"+t.slice(i.length).split("/").splice(2).join("/");r.push(...Sw(a,o))}const s=e.static.get(t);return s&&r.push(s),r.filter(Boolean)}function yy(t){return[...t.entries()].sort((e,n)=>e[0].length-n[0].length)}function vf(t){if(t===null||typeof t!="object")return!1;const e=Object.getPrototypeOf(t);return e!==null&&e!==Object.prototype&&Object.getPrototypeOf(e)!==null||Symbol.iterator in t?!1:Symbol.toStringTag in t?Object.prototype.toString.call(t)==="[object Module]":!0}function vd(t,e,n=".",r){if(!vf(e))return vd(t,{},n,r);const s=Object.assign({},e);for(const i in t){if(i==="__proto__"||i==="constructor")continue;const o=t[i];o!=null&&(r&&r(s,i,o,n)||(Array.isArray(o)&&Array.isArray(s[i])?s[i]=[...o,...s[i]]:vf(o)&&vf(s[i])?s[i]=vd(o,s[i],(n?`${n}.`:"")+i.toString(),r):s[i]=o))}return s}function kw(t){return(...e)=>e.reduce((n,r)=>vd(n,r,"",t),{})}const Pw=kw(),K1=kw((t,e,n)=>{if(t[e]!==void 0&&typeof n=="function")return t[e]=n(t[e]),!0});function z1(t,e){try{return e in t}catch{return!1}}class Ed extends Error{constructor(n,r={}){super(n,r);Kr(this,"statusCode",500);Kr(this,"fatal",!1);Kr(this,"unhandled",!1);Kr(this,"statusMessage");Kr(this,"data");Kr(this,"cause");r.cause&&!this.cause&&(this.cause=r.cause)}toJSON(){const n={message:this.message,statusCode:Td(this.statusCode,500)};return this.statusMessage&&(n.statusMessage=Nw(this.statusMessage)),this.data!==void 0&&(n.data=this.data),n}}Kr(Ed,"__h3_error__",!0);function G1(t){if(typeof t=="string")return new Ed(t);if(Q1(t))return t;const e=new Ed(t.message??t.statusMessage??"",{cause:t.cause||t});if(z1(t,"stack"))try{Object.defineProperty(e,"stack",{get(){return t.stack}})}catch{try{e.stack=t.stack}catch{}}if(t.data&&(e.data=t.data),t.statusCode?e.statusCode=Td(t.statusCode,e.statusCode):t.status&&(e.statusCode=Td(t.status,e.statusCode)),t.statusMessage?e.statusMessage=t.statusMessage:t.statusText&&(e.statusMessage=t.statusText),e.statusMessage){const n=e.statusMessage;Nw(e.statusMessage)!==n&&console.warn("[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default.")}return t.fatal!==void 0&&(e.fatal=t.fatal),t.unhandled!==void 0&&(e.unhandled=t.unhandled),e}function Q1(t){var e;return((e=t==null?void 0:t.constructor)==null?void 0:e.__h3_error__)===!0}const Y1=/[^\u0009\u0020-\u007E]/g;function Nw(t=""){return t.replace(Y1,"")}function Td(t,e=200){return!t||(typeof t=="string"&&(t=Number.parseInt(t,10)),t<100||t>999)?e:t}const Ow=Symbol("layout-meta"),ni=Symbol("route"),ln=()=>{var t;return(t=rt())==null?void 0:t.$router},sh=()=>th()?ct(ni,rt()._route):rt()._route;const X1=()=>{try{if(rt()._processingMiddleware)return!0}catch{return!1}return!1},fj=(t,e)=>{t||(t="/");const n=typeof t=="string"?t:"path"in t?J1(t):ln().resolve(t).href;if(e!=null&&e.open){const{target:c="_blank",windowFeatures:u={}}=e.open,h=Object.entries(u).filter(([f,d])=>d!==void 0).map(([f,d])=>`${f.toLowerCase()}=${d}`).join(", ");return open(n,c,h),Promise.resolve()}const r=mi(n,{acceptRelative:!0}),s=(e==null?void 0:e.external)||r;if(s){if(!(e!=null&&e.external))throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");const{protocol:c}=new URL(n,window.location.href);if(c&&e1(c))throw new Error(`Cannot navigate to a URL with '${c}' protocol.`)}const i=X1();if(!s&&i){if(e!=null&&e.replace){if(typeof t=="string"){const{pathname:c,search:u,hash:h}=vw(t);return{path:c,...u&&{query:pw(u)},...h&&{hash:h},replace:!0}}return{...t,replace:!0}}return t}const o=ln(),a=rt();return s?(a._scope.stop(),e!=null&&e.replace?location.replace(n):location.href=n,i?a.isHydrating?new Promise(()=>{}):!1:Promise.resolve()):e!=null&&e.replace?o.replace(t):o.push(t)};function J1(t){return mw(t.path||"",t.query||{})+(t.hash||"")}const Dw="__nuxt_error",ih=()=>Y0(rt().payload,"error"),Us=t=>{const e=Xs(t);try{const n=rt(),r=ih();n.hooks.callHook("app:error",e),r.value||(r.value=e)}catch{throw e}return e},Z1=async(t={})=>{const e=rt(),n=ih();e.callHook("app:error:cleared",t),t.redirect&&await ln().replace(t.redirect),n.value=L1},xw=t=>!!t&&typeof t=="object"&&Dw in t,Xs=t=>{const e=G1(t);return Object.defineProperty(e,Dw,{value:!0,configurable:!1,writable:!1}),e};function vy(t){const e=tN(t),n=new ArrayBuffer(e.length),r=new DataView(n);for(let s=0;s<n.byteLength;s++)r.setUint8(s,e.charCodeAt(s));return n}const eN="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function tN(t){t.length%4===0&&(t=t.replace(/==?$/,""));let e="",n=0,r=0;for(let s=0;s<t.length;s++)n<<=6,n|=eN.indexOf(t[s]),r+=6,r===24&&(e+=String.fromCharCode((n&16711680)>>16),e+=String.fromCharCode((n&65280)>>8),e+=String.fromCharCode(n&255),n=r=0);return r===12?(n>>=4,e+=String.fromCharCode(n)):r===18&&(n>>=2,e+=String.fromCharCode((n&65280)>>8),e+=String.fromCharCode(n&255)),e}const nN=-1,rN=-2,sN=-3,iN=-4,oN=-5,aN=-6;function cN(t,e){return lN(JSON.parse(t),e)}function lN(t,e){if(typeof t=="number")return s(t,!0);if(!Array.isArray(t)||t.length===0)throw new Error("Invalid input");const n=t,r=Array(n.length);function s(i,o=!1){if(i===nN)return;if(i===sN)return NaN;if(i===iN)return 1/0;if(i===oN)return-1/0;if(i===aN)return-0;if(o)throw new Error("Invalid input");if(i in r)return r[i];const a=n[i];if(!a||typeof a!="object")r[i]=a;else if(Array.isArray(a))if(typeof a[0]=="string"){const c=a[0],u=e==null?void 0:e[c];if(u)return r[i]=u(s(a[1]));switch(c){case"Date":r[i]=new Date(a[1]);break;case"Set":const h=new Set;r[i]=h;for(let m=1;m<a.length;m+=1)h.add(s(a[m]));break;case"Map":const f=new Map;r[i]=f;for(let m=1;m<a.length;m+=2)f.set(s(a[m]),s(a[m+1]));break;case"RegExp":r[i]=new RegExp(a[1],a[2]);break;case"Object":r[i]=Object(a[1]);break;case"BigInt":r[i]=BigInt(a[1]);break;case"null":const d=Object.create(null);r[i]=d;for(let m=1;m<a.length;m+=2)d[a[m]]=s(a[m+1]);break;case"Int8Array":case"Uint8Array":case"Uint8ClampedArray":case"Int16Array":case"Uint16Array":case"Int32Array":case"Uint32Array":case"Float32Array":case"Float64Array":case"BigInt64Array":case"BigUint64Array":{const m=globalThis[c],_=a[1],y=vy(_),I=new m(y);r[i]=I;break}case"ArrayBuffer":{const m=a[1],_=vy(m);r[i]=_;break}default:throw new Error(`Unknown type ${c}`)}}else{const c=new Array(a.length);r[i]=c;for(let u=0;u<a.length;u+=1){const h=a[u];h!==rN&&(c[u]=s(h))}}else{const c={};r[i]=c;for(const u in a){const h=a[u];c[u]=s(h)}}return r[i]}return s(0)}const uN=new Set(["link","style","script","noscript"]),hN=new Set(["title","titleTemplate","script","style","noscript"]),Ey=new Set(["base","meta","link","style","script","noscript"]),fN=new Set(["title","base","htmlAttrs","bodyAttrs","meta","link","style","script","noscript"]),dN=new Set(["base","title","titleTemplate","bodyAttrs","htmlAttrs","templateParams"]),pN=new Set(["key","tagPosition","tagPriority","tagDuplicateStrategy","innerHTML","textContent","processTemplateParams"]),mN=new Set(["templateParams","htmlAttrs","bodyAttrs"]),gN=new Set(["theme-color","google-site-verification","og","article","book","profile","twitter","author"]);const _N=["name","property","http-equiv"];function Mw(t){const e=t.split(":");return e.length?gN.has(e[1]):!1}function wd(t){const{props:e,tag:n}=t;if(dN.has(n))return n;if(n==="link"&&e.rel==="canonical")return"canonical";if(e.charset)return"charset";if(t.tag==="meta"){for(const r of _N)if(e[r]!==void 0)return`${n}:${e[r]}`}if(t.key)return`${n}:key:${t.key}`;if(e.id)return`${n}:id:${e.id}`;if(hN.has(n)){const r=t.textContent||t.innerHTML;if(r)return`${n}:content:${r}`}}function Ty(t){const e=t._h||t._d;if(e)return e;const n=t.textContent||t.innerHTML;return n||`${t.tag}:${Object.entries(t.props).map(([r,s])=>`${r}:${String(s)}`).join(",")}`}function ou(t,e,n){typeof t==="function"&&(!n||n!=="titleTemplate"&&!(n[0]==="o"&&n[1]==="n"))&&(t=t());let s;if(e&&(s=e(n,t)),Array.isArray(s))return s.map(i=>ou(i,e));if((s==null?void 0:s.constructor)===Object){const i={};for(const o of Object.keys(s))i[o]=ou(s[o],e,o);return i}return s}function yN(t,e){const n=t==="style"?new Map:new Set;function r(s){const i=s.trim();if(i)if(t==="style"){const[o,...a]=i.split(":").map(c=>c.trim());o&&a.length&&n.set(o,a.join(":"))}else i.split(" ").filter(Boolean).forEach(o=>n.add(o))}return typeof e=="string"?t==="style"?e.split(";").forEach(r):r(e):Array.isArray(e)?e.forEach(s=>r(s)):e&&typeof e=="object"&&Object.entries(e).forEach(([s,i])=>{i&&i!=="false"&&(t==="style"?n.set(s.trim(),i):r(s))}),n}function Lw(t,e){return t.props=t.props||{},e&&Object.entries(e).forEach(([n,r])=>{if(r===null){t.props[n]=null;return}if(n==="class"||n==="style"){t.props[n]=yN(n,r);return}if(pN.has(n)){if(["textContent","innerHTML"].includes(n)&&typeof r=="object"){let o=e.type;if(e.type||(o="application/json"),!(o!=null&&o.endsWith("json"))&&o!=="speculationrules")return;e.type=o,t.props.type=o,t[n]=JSON.stringify(r)}else t[n]=r;return}const s=String(r),i=n.startsWith("data-");s==="true"||s===""?t.props[n]=i?s:!0:!r&&i&&s==="false"?t.props[n]="false":r!==void 0&&(t.props[n]=r)}),t}function vN(t,e){const n=typeof e=="object"&&typeof e!="function"?e:{[t==="script"||t==="noscript"||t==="style"?"innerHTML":"textContent"]:e},r=Lw({tag:t,props:{}},n);return r.key&&uN.has(r.tag)&&(r.props["data-hid"]=r._h=r.key),r.tag==="script"&&typeof r.innerHTML=="object"&&(r.innerHTML=JSON.stringify(r.innerHTML),r.props.type=r.props.type||"application/json"),Array.isArray(r.props.content)?r.props.content.map(s=>({...r,props:{...r.props,content:s}})):r}function EN(t,e){if(!t)return[];typeof t=="function"&&(t=t());const n=(s,i)=>{for(let o=0;o<e.length;o++)i=e[o](s,i);return i};t=n(void 0,t);const r=[];return t=ou(t,n),Object.entries(t||{}).forEach(([s,i])=>{if(i!==void 0)for(const o of Array.isArray(i)?i:[i])r.push(vN(s,o))}),r.flat()}const bd=(t,e)=>t._w===e._w?t._p-e._p:t._w-e._w,wy={base:-10,title:10},TN={critical:-8,high:-1,low:2},by={meta:{"content-security-policy":-30,charset:-20,viewport:-15},link:{preconnect:20,stylesheet:60,preload:70,modulepreload:70,prefetch:90,"dns-prefetch":90,prerender:90},script:{async:30,defer:80,sync:50},style:{imported:40,sync:60}},wN=/@import/,ea=t=>t===""||t===!0;function bN(t,e){var i;if(typeof e.tagPriority=="number")return e.tagPriority;let n=100;const r=TN[e.tagPriority]||0,s=t.resolvedOptions.disableCapoSorting?{link:{},script:{},style:{}}:by;if(e.tag in wy)n=wy[e.tag];else if(e.tag==="meta"){const o=e.props["http-equiv"]==="content-security-policy"?"content-security-policy":e.props.charset?"charset":e.props.name==="viewport"?"viewport":null;o&&(n=by.meta[o])}else e.tag==="link"&&e.props.rel?n=s.link[e.props.rel]:e.tag==="script"?ea(e.props.async)?n=s.script.async:e.props.src&&!ea(e.props.defer)&&!ea(e.props.async)&&e.props.type!=="module"&&!((i=e.props.type)!=null&&i.endsWith("json"))?n=s.script.sync:ea(e.props.defer)&&e.props.src&&!ea(e.props.async)&&(n=s.script.defer):e.tag==="style"&&(n=e.innerHTML&&wN.test(e.innerHTML)?s.style.imported:s.style.sync);return(n||100)+r}function Iy(t,e){const n=typeof e=="function"?e(t):e,r=n.key||String(t.plugins.size+1);t.plugins.get(r)||(t.plugins.set(r,n),t.hooks.addHooks(n.hooks||{}))}function IN(t={}){var a;const e=bw();e.addHooks(t.hooks||{});const n=!t.document,r=new Map,s=new Map,i=[],o={_entryCount:1,plugins:s,dirty:!1,resolvedOptions:t,hooks:e,ssr:n,entries:r,headEntries(){return[...r.values()]},use:c=>Iy(o,c),push(c,u){const h={...u||{}};delete h.head;const f=h._index??o._entryCount++,d={_i:f,input:c,options:h},m={_poll(_=!1){o.dirty=!0,!_&&i.push(f),e.callHook("entries:updated",o)},dispose(){r.delete(f)&&m._poll(!0)},patch(_){(!h.mode||h.mode==="server"&&n||h.mode==="client"&&!n)&&(d.input=_,r.set(f,d),m._poll())}};return m.patch(c),m},async resolveTags(){var m;const c={tagMap:new Map,tags:[],entries:[...o.entries.values()]};for(await e.callHook("entries:resolve",c);i.length;){const _=i.shift(),y=r.get(_);if(y){const I={tags:EN(y.input,t.propResolvers||[]).map(D=>Object.assign(D,y.options)),entry:y};await e.callHook("entries:normalize",I),y._tags=I.tags.map((D,P)=>(D._w=bN(o,D),D._p=(y._i<<10)+P,D._d=wd(D),D))}}let u=!1;c.entries.flatMap(_=>(_._tags||[]).map(y=>({...y,props:{...y.props}}))).sort(bd).reduce((_,y)=>{const I=String(y._d||y._p);if(!_.has(I))return _.set(I,y);const D=_.get(I);if(((y==null?void 0:y.tagDuplicateStrategy)||(mN.has(y.tag)?"merge":null)||(y.key&&y.key===D.key?"merge":null))==="merge"){const v={...D.props};Object.entries(y.props).forEach(([R,x])=>v[R]=R==="style"?new Map([...D.props.style||new Map,...x]):R==="class"?new Set([...D.props.class||new Set,...x]):x),_.set(I,{...y,props:v})}else y._p>>10===D._p>>10&&y.tag==="meta"&&Mw(I)?(_.set(I,Object.assign([...Array.isArray(D)?D:[D],y],y)),u=!0):(y._w===D._w?y._p>D._p:(y==null?void 0:y._w)<(D==null?void 0:D._w))&&_.set(I,y);return _},c.tagMap);const h=c.tagMap.get("title"),f=c.tagMap.get("titleTemplate");if(o._title=h==null?void 0:h.textContent,f){const _=f==null?void 0:f.textContent;if(o._titleTemplate=_,_){let y=typeof _=="function"?_(h==null?void 0:h.textContent):_;typeof y=="string"&&!o.plugins.has("template-params")&&(y=y.replace("%s",(h==null?void 0:h.textContent)||"")),h?y===null?c.tagMap.delete("title"):c.tagMap.set("title",{...h,textContent:y}):(f.tag="title",f.textContent=y)}}c.tags=Array.from(c.tagMap.values()),u&&(c.tags=c.tags.flat().sort(bd)),await e.callHook("tags:beforeResolve",c),await e.callHook("tags:resolve",c),await e.callHook("tags:afterResolve",c);const d=[];for(const _ of c.tags){const{innerHTML:y,tag:I,props:D}=_;if(fN.has(I)&&!(Object.keys(D).length===0&&!_.innerHTML&&!_.textContent)&&!(I==="meta"&&!D.content&&!D["http-equiv"]&&!D.charset)){if(I==="script"&&y){if((m=D.type)!=null&&m.endsWith("json")){const P=typeof y=="string"?y:JSON.stringify(y);_.innerHTML=P.replace(/</g,"\\u003C")}else typeof y=="string"&&(_.innerHTML=y.replace(new RegExp(`</${I}`,"g"),`<\\/${I}`));_._d=wd(_)}d.push(_)}}return d}};return((t==null?void 0:t.plugins)||[]).forEach(c=>Iy(o,c)),o.hooks.callHook("init",o),(a=t.init)==null||a.forEach(c=>c&&o.push(c)),o}const es="%separator",AN=new RegExp(`${es}(?:\\s*${es})*`,"g");function RN(t,e,n=!1){var s;let r;if(e==="s"||e==="pageTitle")r=t.pageTitle;else if(e.includes(".")){const i=e.indexOf(".");r=(s=t[e.substring(0,i)])==null?void 0:s[e.substring(i+1)]}else r=t[e];if(r!==void 0)return n?(r||"").replace(/\\/g,"\\\\").replace(/</g,"\\u003C").replace(/"/g,'\\"'):r||""}function al(t,e,n,r=!1){if(typeof t!="string"||!t.includes("%"))return t;let s=t;try{s=decodeURI(t)}catch{}const i=s.match(/%\w+(?:\.\w+)?/g);if(!i)return t;const o=t.includes(es);return t=t.replace(/%\w+(?:\.\w+)?/g,a=>{if(a===es||!i.includes(a))return a;const c=RN(e,a.slice(1),r);return c!==void 0?c:a}).trim(),o&&(t.endsWith(es)&&(t=t.slice(0,-es.length)),t.startsWith(es)&&(t=t.slice(es.length)),t=t.replace(AN,n||"").trim()),t}const Ay=t=>t.includes(":key")?t:t.split(":").join(":key:"),CN={key:"aliasSorting",hooks:{"tags:resolve":t=>{let e=!1;for(const n of t.tags){const r=n.tagPriority;if(!r)continue;const s=String(r);if(s.startsWith("before:")){const i=Ay(s.slice(7)),o=t.tagMap.get(i);o&&(typeof o.tagPriority=="number"&&(n.tagPriority=o.tagPriority),n._p=o._p-1,e=!0)}else if(s.startsWith("after:")){const i=Ay(s.slice(6)),o=t.tagMap.get(i);o&&(typeof o.tagPriority=="number"&&(n.tagPriority=o.tagPriority),n._p=o._p+1,e=!0)}}e&&(t.tags=t.tags.sort(bd))}}},SN={key:"deprecations",hooks:{"entries:normalize":({tags:t})=>{for(const e of t)e.props.children&&(e.innerHTML=e.props.children,delete e.props.children),e.props.hid&&(e.key=e.props.hid,delete e.props.hid),e.props.vmid&&(e.key=e.props.vmid,delete e.props.vmid),e.props.body&&(e.tagPosition="bodyClose",delete e.props.body)}}};async function Id(t){if(typeof t==="function")return t;if(t instanceof Promise)return await t;if(Array.isArray(t))return await Promise.all(t.map(n=>Id(n)));if((t==null?void 0:t.constructor)===Object){const n={};for(const r of Object.keys(t))n[r]=await Id(t[r]);return n}return t}const kN={key:"promises",hooks:{"entries:resolve":async t=>{const e=[];for(const n in t.entries)t.entries[n]._promisesProcessed||e.push(Id(t.entries[n].input).then(r=>{t.entries[n].input=r,t.entries[n]._promisesProcessed=!0}));await Promise.all(e)}}},PN={meta:"content",link:"href",htmlAttrs:"lang"},NN=["innerHTML","textContent"],ON=t=>({key:"template-params",hooks:{"entries:normalize":e=>{var r,s,i;const n=((s=(r=e.tags.filter(o=>o.tag==="templateParams"&&o.mode==="server"))==null?void 0:r[0])==null?void 0:s.props)||{};Object.keys(n).length&&(t._ssrPayload={templateParams:{...((i=t._ssrPayload)==null?void 0:i.templateParams)||{},...n}})},"tags:resolve":({tagMap:e,tags:n})=>{var i;const r=((i=e.get("templateParams"))==null?void 0:i.props)||{},s=r.separator||"|";delete r.separator,r.pageTitle=al(r.pageTitle||t._title||"",r,s);for(const o of n){if(o.processTemplateParams===!1)continue;const a=PN[o.tag];if(a&&typeof o.props[a]=="string")o.props[a]=al(o.props[a],r,s);else if(o.processTemplateParams||o.tag==="titleTemplate"||o.tag==="title")for(const c of NN)typeof o[c]=="string"&&(o[c]=al(o[c],r,s,o.tag==="script"&&o.props.type.endsWith("json")))}t._templateParams=r,t._separator=s},"tags:afterResolve":({tagMap:e})=>{const n=e.get("title");n!=null&&n.textContent&&n.processTemplateParams!==!1&&(n.textContent=al(n.textContent,t._templateParams,t._separator))}}}),DN=(t,e)=>at(e)?Qn(e):e,Yp="usehead";function xN(t){return{install(n){n.config.globalProperties.$unhead=t,n.config.globalProperties.$head=t,n.provide(Yp,t)}}.install}function MN(){if(th()){const t=ct(Yp);if(!t)throw new Error("useHead() was called without provide context, ensure you call it through the setup() function.");return t}throw new Error("useHead() was called without provide context, ensure you call it through the setup() function.")}function LN(t,e={}){const n=e.head||MN();return n.ssr?n.push(t||{},e):VN(n,t,e)}function VN(t,e,n={}){const r=ft(!1);let s;return Tk(()=>{const o=r.value?{}:ou(e,DN);s?s.patch(o):s=t.push(o,n)}),un()&&(mc(()=>{s.dispose()}),dT(()=>{r.value=!0}),fT(()=>{r.value=!1})),s}function FN(t){var n;const e=t||Rw();return((n=e==null?void 0:e.ssrContext)==null?void 0:n.head)||(e==null?void 0:e.runWithContext(()=>{if(th())return ct(Yp)}))}function UN(t,e={}){const n=FN(e.nuxt);if(n)return LN(t,{head:n,...e})}const BN="modulepreload",$N=function(t,e){return new URL(t,e).href},Ry={},Se=function(e,n,r){let s=Promise.resolve();if(n&&n.length>0){let o=function(h){return Promise.all(h.map(f=>Promise.resolve(f).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};const a=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),u=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));s=o(n.map(h=>{if(h=$N(h,r),h in Ry)return;Ry[h]=!0;const f=h.endsWith(".css"),d=f?'[rel="stylesheet"]':"";if(!!r)for(let y=a.length-1;y>=0;y--){const I=a[y];if(I.href===h&&(!f||I.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${h}"]${d}`))return;const _=document.createElement("link");if(_.rel=f?"stylesheet":BN,f||(_.as="script"),_.crossOrigin="",_.href=h,u&&_.setAttribute("nonce",u),document.head.appendChild(_),f)return new Promise((y,I)=>{_.addEventListener("load",y),_.addEventListener("error",()=>I(new Error(`Unable to preload CSS for ${h}`)))})}))}function i(o){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=o,window.dispatchEvent(a),!a.defaultPrevented)throw o}return s.then(o=>{for(const a of o||[])a.status==="rejected"&&i(a.reason);return e().catch(i)})};let Al,Rl;function jN(){return Al=$fetch(Qp(`builds/meta/${bo().app.buildId}.json`),{responseType:"json"}),Al.then(t=>{Rl=W1(t.matcher)}).catch(t=>{console.error("[nuxt] Error fetching app manifest.",t)}),Al}function oh(){return Al||jN()}async function Xp(t){const e=typeof t=="string"?t:t.path;if(await oh(),!Rl)return console.error("[nuxt] Error creating app manifest matcher.",Rl),{};try{return Pw({},...Rl.matchAll(e).reverse())}catch(n){return console.error("[nuxt] Error matching route rules.",n),{}}}async function Cy(t,e={}){if(!await Fw(t))return null;const r=await qN(t,e);return await Vw(r)||null}const HN="_payload.json";async function qN(t,e={}){const n=new URL(t,"http://localhost");if(n.host!=="localhost"||mi(n.pathname,{acceptRelative:!0}))throw new Error("Payload URL must not include hostname: "+t);const r=bo(),s=e.hash||(e.fresh?Date.now():r.app.buildId),i=r.app.cdnURL,o=i&&await Fw(t)?i:r.app.baseURL;return Gp(o,n.pathname,HN+(s?`?${s}`:""))}async function Vw(t){const e=fetch(t,{cache:"force-cache"}).then(n=>n.text().then(Uw));try{return await e}catch(n){console.warn("[nuxt] Cannot load payload ",t,n)}return null}async function Fw(t=sh().path){const e=rt();return t=Ga(t),(await oh()).prerendered.includes(t)?!0:e.runWithContext(async()=>{const r=await Xp({path:t});return!!r.prerender&&!r.redirect})}let Fs=null;async function WN(){var r;if(Fs)return Fs;const t=document.getElementById("__NUXT_DATA__");if(!t)return{};const e=await Uw(t.textContent||""),n=t.dataset.src?await Vw(t.dataset.src):void 0;return Fs={...e,...n,...window.__NUXT__},(r=Fs.config)!=null&&r.public&&(Fs.config.public=ar(Fs.config.public)),Fs}async function Uw(t){return await cN(t,rt()._payloadRevivers)}function KN(t,e){rt()._payloadRevivers[t]=e}const zN=[["NuxtError",t=>Xs(t)],["EmptyShallowRef",t=>kr(t==="_"?void 0:t==="0n"?BigInt(0):tu(t))],["EmptyRef",t=>ft(t==="_"?void 0:t==="0n"?BigInt(0):tu(t))],["ShallowRef",t=>kr(t)],["ShallowReactive",t=>Zn(t)],["Ref",t=>ft(t)],["Reactive",t=>ar(t)]],GN=gn({name:"nuxt:revive-payload:client",order:-30,async setup(t){let e,n;for(const[r,s]of zN)KN(r,s);Object.assign(t.payload,([e,n]=Yi(()=>t.runWithContext(WN)),e=await e,n(),e)),window.__NUXT__=t.payload}});async function Jp(t,e={}){const n=e.document||t.resolvedOptions.document;if(!n||!t.dirty)return;const r={shouldRender:!0,tags:[]};if(await t.hooks.callHook("dom:beforeRender",r),!!r.shouldRender)return t._domUpdatePromise||(t._domUpdatePromise=new Promise(async s=>{var m;const i=new Map,o=new Promise(_=>{t.resolveTags().then(y=>{_(y.map(I=>{const D=i.get(I._d)||0,P={tag:I,id:(D?`${I._d}:${D}`:I._d)||Ty(I),shouldRender:!0};return I._d&&Mw(I._d)&&i.set(I._d,D+1),P}))})});let a=t._dom;if(!a){a={title:n.title,elMap:new Map().set("htmlAttrs",n.documentElement).set("bodyAttrs",n.body)};for(const _ of["body","head"]){const y=(m=n[_])==null?void 0:m.children;for(const I of y){const D=I.tagName.toLowerCase();if(!Ey.has(D))continue;const P=Lw({tag:D,props:{}},{innerHTML:I.innerHTML,...I.getAttributeNames().reduce((v,R)=>(v[R]=I.getAttribute(R),v),{})||{}});if(P.key=I.getAttribute("data-hid")||void 0,P._d=wd(P)||Ty(P),a.elMap.has(P._d)){let v=1,R=P._d;for(;a.elMap.has(R);)R=`${P._d}:${v++}`;a.elMap.set(R,I)}else a.elMap.set(P._d,I)}}}a.pendingSideEffects={...a.sideEffects},a.sideEffects={};function c(_,y,I){const D=`${_}:${y}`;a.sideEffects[D]=I,delete a.pendingSideEffects[D]}function u({id:_,$el:y,tag:I}){const D=I.tag.endsWith("Attrs");a.elMap.set(_,y),D||(I.textContent&&I.textContent!==y.textContent&&(y.textContent=I.textContent),I.innerHTML&&I.innerHTML!==y.innerHTML&&(y.innerHTML=I.innerHTML),c(_,"el",()=>{y==null||y.remove(),a.elMap.delete(_)}));for(const P in I.props){if(!Object.prototype.hasOwnProperty.call(I.props,P))continue;const v=I.props[P];if(P.startsWith("on")&&typeof v=="function"){const x=y==null?void 0:y.dataset;if(x&&x[`${P}fired`]){const M=P.slice(0,-5);v.call(y,new Event(M.substring(2)))}y.getAttribute(`data-${P}`)!==""&&((I.tag==="bodyAttrs"?n.defaultView:y).addEventListener(P.substring(2),v.bind(y)),y.setAttribute(`data-${P}`,""));continue}const R=`attr:${P}`;if(P==="class"){if(!v)continue;for(const x of v)D&&c(_,`${R}:${x}`,()=>y.classList.remove(x)),!y.classList.contains(x)&&y.classList.add(x)}else if(P==="style"){if(!v)continue;for(const[x,M]of v)c(_,`${R}:${x}`,()=>{y.style.removeProperty(x)}),y.style.setProperty(x,M)}else v!==!1&&v!==null&&(y.getAttribute(P)!==v&&y.setAttribute(P,v===!0?"":String(v)),D&&c(_,R,()=>y.removeAttribute(P)))}}const h=[],f={bodyClose:void 0,bodyOpen:void 0,head:void 0},d=await o;for(const _ of d){const{tag:y,shouldRender:I,id:D}=_;if(I){if(y.tag==="title"){n.title=y.textContent,c("title","",()=>n.title=a.title);continue}_.$el=_.$el||a.elMap.get(D),_.$el?u(_):Ey.has(y.tag)&&h.push(_)}}for(const _ of h){const y=_.tag.tagPosition||"head";_.$el=n.createElement(_.tag.tag),u(_),f[y]=f[y]||n.createDocumentFragment(),f[y].appendChild(_.$el)}for(const _ of d)await t.hooks.callHook("dom:renderTag",_,n,c);f.head&&n.head.appendChild(f.head),f.bodyOpen&&n.body.insertBefore(f.bodyOpen,n.body.firstChild),f.bodyClose&&n.body.appendChild(f.bodyClose);for(const _ in a.pendingSideEffects)a.pendingSideEffects[_]();t._dom=a,await t.hooks.callHook("dom:rendered",{renders:d}),s()}).finally(()=>{t._domUpdatePromise=void 0,t.dirty=!1})),t._domUpdatePromise}function QN(t={}){var r,s,i;const e=((r=t.domOptions)==null?void 0:r.render)||Jp;t.document=t.document||(typeof window<"u"?document:void 0);const n=((i=(s=t.document)==null?void 0:s.head.querySelector('script[id="unhead:payload"]'))==null?void 0:i.innerHTML)||!1;return IN({...t,plugins:[...t.plugins||[],{key:"client",hooks:{"entries:updated":e}}],init:[n?JSON.parse(n):!1,...t.init||[]]})}function YN(t,e){let n=0;return()=>{const r=++n;e(()=>{n===r&&t()})}}function XN(t={}){const e=QN({domOptions:{render:YN(()=>Jp(e),n=>setTimeout(n,0))},...t});return e.install=xN(e),e}const JN={disableDefaults:!0,disableCapoSorting:!1,plugins:[SN,kN,ON,CN]},ZN=gn({name:"nuxt:head",enforce:"pre",setup(t){const e=XN(JN);t.vueApp.use(e);{let n=!0;const r=async()=>{n=!1,await Jp(e)};e.hooks.hook("dom:beforeRender",s=>{s.shouldRender=!n}),t.hooks.hook("page:start",()=>{n=!0}),t.hooks.hook("page:finish",()=>{t.isHydrating||r()}),t.hooks.hook("app:error",r),t.hooks.hook("app:suspense:resolve",r)}}});/*!
  * vue-router v4.5.1
  * (c) 2025 Eduardo San Martin Morote
  * @license MIT
  */const Di=typeof document<"u";function Bw(t){return typeof t=="object"||"displayName"in t||"props"in t||"__vccOpts"in t}function eO(t){return t.__esModule||t[Symbol.toStringTag]==="Module"||t.default&&Bw(t.default)}const xe=Object.assign;function Ef(t,e){const n={};for(const r in e){const s=e[r];n[r]=Bn(s)?s.map(t):t(s)}return n}const Aa=()=>{},Bn=Array.isArray,$w=/#/g,tO=/&/g,nO=/\//g,rO=/=/g,sO=/\?/g,jw=/\+/g,iO=/%5B/g,oO=/%5D/g,Hw=/%5E/g,aO=/%60/g,qw=/%7B/g,cO=/%7C/g,Ww=/%7D/g,lO=/%20/g;function Zp(t){return encodeURI(""+t).replace(cO,"|").replace(iO,"[").replace(oO,"]")}function uO(t){return Zp(t).replace(qw,"{").replace(Ww,"}").replace(Hw,"^")}function Ad(t){return Zp(t).replace(jw,"%2B").replace(lO,"+").replace($w,"%23").replace(tO,"%26").replace(aO,"`").replace(qw,"{").replace(Ww,"}").replace(Hw,"^")}function hO(t){return Ad(t).replace(rO,"%3D")}function fO(t){return Zp(t).replace($w,"%23").replace(sO,"%3F")}function dO(t){return t==null?"":fO(t).replace(nO,"%2F")}function Qa(t){try{return decodeURIComponent(""+t)}catch{}return""+t}const pO=/\/$/,mO=t=>t.replace(pO,"");function Tf(t,e,n="/"){let r,s={},i="",o="";const a=e.indexOf("#");let c=e.indexOf("?");return a<c&&a>=0&&(c=-1),c>-1&&(r=e.slice(0,c),i=e.slice(c+1,a>-1?a:e.length),s=t(i)),a>-1&&(r=r||e.slice(0,a),o=e.slice(a,e.length)),r=vO(r??e,n),{fullPath:r+(i&&"?")+i+o,path:r,query:s,hash:Qa(o)}}function gO(t,e){const n=e.query?t(e.query):"";return e.path+(n&&"?")+n+(e.hash||"")}function Sy(t,e){return!e||!t.toLowerCase().startsWith(e.toLowerCase())?t:t.slice(e.length)||"/"}function _O(t,e,n){const r=e.matched.length-1,s=n.matched.length-1;return r>-1&&r===s&&oo(e.matched[r],n.matched[s])&&Kw(e.params,n.params)&&t(e.query)===t(n.query)&&e.hash===n.hash}function oo(t,e){return(t.aliasOf||t)===(e.aliasOf||e)}function Kw(t,e){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(const n in t)if(!yO(t[n],e[n]))return!1;return!0}function yO(t,e){return Bn(t)?ky(t,e):Bn(e)?ky(e,t):t===e}function ky(t,e){return Bn(e)?t.length===e.length&&t.every((n,r)=>n===e[r]):t.length===1&&t[0]===e}function vO(t,e){if(t.startsWith("/"))return t;if(!t)return e;const n=e.split("/"),r=t.split("/"),s=r[r.length-1];(s===".."||s===".")&&r.push("");let i=n.length-1,o,a;for(o=0;o<r.length;o++)if(a=r[o],a!==".")if(a==="..")i>1&&i--;else break;return n.slice(0,i).join("/")+"/"+r.slice(o).join("/")}const En={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};var Ya;(function(t){t.pop="pop",t.push="push"})(Ya||(Ya={}));var Ra;(function(t){t.back="back",t.forward="forward",t.unknown=""})(Ra||(Ra={}));function EO(t){if(!t)if(Di){const e=document.querySelector("base");t=e&&e.getAttribute("href")||"/",t=t.replace(/^\w+:\/\/[^\/]+/,"")}else t="/";return t[0]!=="/"&&t[0]!=="#"&&(t="/"+t),mO(t)}const TO=/^[^#]+#/;function wO(t,e){return t.replace(TO,"#")+e}function bO(t,e){const n=document.documentElement.getBoundingClientRect(),r=t.getBoundingClientRect();return{behavior:e.behavior,left:r.left-n.left-(e.left||0),top:r.top-n.top-(e.top||0)}}const ah=()=>({left:window.scrollX,top:window.scrollY});function IO(t){let e;if("el"in t){const n=t.el,r=typeof n=="string"&&n.startsWith("#"),s=typeof n=="string"?r?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!s)return;e=bO(s,t)}else e=t;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function Py(t,e){return(history.state?history.state.position-e:-1)+t}const Rd=new Map;function AO(t,e){Rd.set(t,e)}function RO(t){const e=Rd.get(t);return Rd.delete(t),e}let CO=()=>location.protocol+"//"+location.host;function zw(t,e){const{pathname:n,search:r,hash:s}=e,i=t.indexOf("#");if(i>-1){let a=s.includes(t.slice(i))?t.slice(i).length:1,c=s.slice(a);return c[0]!=="/"&&(c="/"+c),Sy(c,"")}return Sy(n,t)+r+s}function SO(t,e,n,r){let s=[],i=[],o=null;const a=({state:d})=>{const m=zw(t,location),_=n.value,y=e.value;let I=0;if(d){if(n.value=m,e.value=d,o&&o===_){o=null;return}I=y?d.position-y.position:0}else r(m);s.forEach(D=>{D(n.value,_,{delta:I,type:Ya.pop,direction:I?I>0?Ra.forward:Ra.back:Ra.unknown})})};function c(){o=n.value}function u(d){s.push(d);const m=()=>{const _=s.indexOf(d);_>-1&&s.splice(_,1)};return i.push(m),m}function h(){const{history:d}=window;d.state&&d.replaceState(xe({},d.state,{scroll:ah()}),"")}function f(){for(const d of i)d();i=[],window.removeEventListener("popstate",a),window.removeEventListener("beforeunload",h)}return window.addEventListener("popstate",a),window.addEventListener("beforeunload",h,{passive:!0}),{pauseListeners:c,listen:u,destroy:f}}function Ny(t,e,n,r=!1,s=!1){return{back:t,current:e,forward:n,replaced:r,position:window.history.length,scroll:s?ah():null}}function kO(t){const{history:e,location:n}=window,r={value:zw(t,n)},s={value:e.state};s.value||i(r.value,{back:null,current:r.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function i(c,u,h){const f=t.indexOf("#"),d=f>-1?(n.host&&document.querySelector("base")?t:t.slice(f))+c:CO()+t+c;try{e[h?"replaceState":"pushState"](u,"",d),s.value=u}catch(m){console.error(m),n[h?"replace":"assign"](d)}}function o(c,u){const h=xe({},e.state,Ny(s.value.back,c,s.value.forward,!0),u,{position:s.value.position});i(c,h,!0),r.value=c}function a(c,u){const h=xe({},s.value,e.state,{forward:c,scroll:ah()});i(h.current,h,!0);const f=xe({},Ny(r.value,c,null),{position:h.position+1},u);i(c,f,!1),r.value=c}return{location:r,state:s,push:a,replace:o}}function PO(t){t=EO(t);const e=kO(t),n=SO(t,e.state,e.location,e.replace);function r(i,o=!0){o||n.pauseListeners(),history.go(i)}const s=xe({location:"",base:t,go:r,createHref:wO.bind(null,t)},e,n);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}function NO(t){return typeof t=="string"||t&&typeof t=="object"}function Gw(t){return typeof t=="string"||typeof t=="symbol"}const Qw=Symbol("");var Oy;(function(t){t[t.aborted=4]="aborted",t[t.cancelled=8]="cancelled",t[t.duplicated=16]="duplicated"})(Oy||(Oy={}));function ao(t,e){return xe(new Error,{type:t,[Qw]:!0},e)}function pr(t,e){return t instanceof Error&&Qw in t&&(e==null||!!(t.type&e))}const Dy="[^/]+?",OO={sensitive:!1,strict:!1,start:!0,end:!0},DO=/[.+*?^${}()[\]/\\]/g;function xO(t,e){const n=xe({},OO,e),r=[];let s=n.start?"^":"";const i=[];for(const u of t){const h=u.length?[]:[90];n.strict&&!u.length&&(s+="/");for(let f=0;f<u.length;f++){const d=u[f];let m=40+(n.sensitive?.25:0);if(d.type===0)f||(s+="/"),s+=d.value.replace(DO,"\\$&"),m+=40;else if(d.type===1){const{value:_,repeatable:y,optional:I,regexp:D}=d;i.push({name:_,repeatable:y,optional:I});const P=D||Dy;if(P!==Dy){m+=10;try{new RegExp(`(${P})`)}catch(R){throw new Error(`Invalid custom RegExp for param "${_}" (${P}): `+R.message)}}let v=y?`((?:${P})(?:/(?:${P}))*)`:`(${P})`;f||(v=I&&u.length<2?`(?:/${v})`:"/"+v),I&&(v+="?"),s+=v,m+=20,I&&(m+=-8),y&&(m+=-20),P===".*"&&(m+=-50)}h.push(m)}r.push(h)}if(n.strict&&n.end){const u=r.length-1;r[u][r[u].length-1]+=.7000000000000001}n.strict||(s+="/?"),n.end?s+="$":n.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const o=new RegExp(s,n.sensitive?"":"i");function a(u){const h=u.match(o),f={};if(!h)return null;for(let d=1;d<h.length;d++){const m=h[d]||"",_=i[d-1];f[_.name]=m&&_.repeatable?m.split("/"):m}return f}function c(u){let h="",f=!1;for(const d of t){(!f||!h.endsWith("/"))&&(h+="/"),f=!1;for(const m of d)if(m.type===0)h+=m.value;else if(m.type===1){const{value:_,repeatable:y,optional:I}=m,D=_ in u?u[_]:"";if(Bn(D)&&!y)throw new Error(`Provided param "${_}" is an array but it is not repeatable (* or + modifiers)`);const P=Bn(D)?D.join("/"):D;if(!P)if(I)d.length<2&&(h.endsWith("/")?h=h.slice(0,-1):f=!0);else throw new Error(`Missing required param "${_}"`);h+=P}}return h||"/"}return{re:o,score:r,keys:i,parse:a,stringify:c}}function MO(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=e[n]-t[n];if(r)return r;n++}return t.length<e.length?t.length===1&&t[0]===80?-1:1:t.length>e.length?e.length===1&&e[0]===80?1:-1:0}function Yw(t,e){let n=0;const r=t.score,s=e.score;for(;n<r.length&&n<s.length;){const i=MO(r[n],s[n]);if(i)return i;n++}if(Math.abs(s.length-r.length)===1){if(xy(r))return 1;if(xy(s))return-1}return s.length-r.length}function xy(t){const e=t[t.length-1];return t.length>0&&e[e.length-1]<0}const LO={type:0,value:""},VO=/[a-zA-Z0-9_]/;function FO(t){if(!t)return[[]];if(t==="/")return[[LO]];if(!t.startsWith("/"))throw new Error(`Invalid path "${t}"`);function e(m){throw new Error(`ERR (${n})/"${u}": ${m}`)}let n=0,r=n;const s=[];let i;function o(){i&&s.push(i),i=[]}let a=0,c,u="",h="";function f(){u&&(n===0?i.push({type:0,value:u}):n===1||n===2||n===3?(i.length>1&&(c==="*"||c==="+")&&e(`A repeatable param (${u}) must be alone in its segment. eg: '/:ids+.`),i.push({type:1,value:u,regexp:h,repeatable:c==="*"||c==="+",optional:c==="*"||c==="?"})):e("Invalid state to consume buffer"),u="")}function d(){u+=c}for(;a<t.length;){if(c=t[a++],c==="\\"&&n!==2){r=n,n=4;continue}switch(n){case 0:c==="/"?(u&&f(),o()):c===":"?(f(),n=1):d();break;case 4:d(),n=r;break;case 1:c==="("?n=2:VO.test(c)?d():(f(),n=0,c!=="*"&&c!=="?"&&c!=="+"&&a--);break;case 2:c===")"?h[h.length-1]=="\\"?h=h.slice(0,-1)+c:n=3:h+=c;break;case 3:f(),n=0,c!=="*"&&c!=="?"&&c!=="+"&&a--,h="";break;default:e("Unknown state");break}}return n===2&&e(`Unfinished custom RegExp for param "${u}"`),f(),o(),s}function UO(t,e,n){const r=xO(FO(t.path),n),s=xe(r,{record:t,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function BO(t,e){const n=[],r=new Map;e=Fy({strict:!1,end:!0,sensitive:!1},e);function s(f){return r.get(f)}function i(f,d,m){const _=!m,y=Ly(f);y.aliasOf=m&&m.record;const I=Fy(e,f),D=[y];if("alias"in f){const R=typeof f.alias=="string"?[f.alias]:f.alias;for(const x of R)D.push(Ly(xe({},y,{components:m?m.record.components:y.components,path:x,aliasOf:m?m.record:y})))}let P,v;for(const R of D){const{path:x}=R;if(d&&x[0]!=="/"){const M=d.record.path,b=M[M.length-1]==="/"?"":"/";R.path=d.record.path+(x&&b+x)}if(P=UO(R,d,I),m?m.alias.push(P):(v=v||P,v!==P&&v.alias.push(P),_&&f.name&&!Vy(P)&&o(f.name)),Xw(P)&&c(P),y.children){const M=y.children;for(let b=0;b<M.length;b++)i(M[b],P,m&&m.children[b])}m=m||P}return v?()=>{o(v)}:Aa}function o(f){if(Gw(f)){const d=r.get(f);d&&(r.delete(f),n.splice(n.indexOf(d),1),d.children.forEach(o),d.alias.forEach(o))}else{const d=n.indexOf(f);d>-1&&(n.splice(d,1),f.record.name&&r.delete(f.record.name),f.children.forEach(o),f.alias.forEach(o))}}function a(){return n}function c(f){const d=HO(f,n);n.splice(d,0,f),f.record.name&&!Vy(f)&&r.set(f.record.name,f)}function u(f,d){let m,_={},y,I;if("name"in f&&f.name){if(m=r.get(f.name),!m)throw ao(1,{location:f});I=m.record.name,_=xe(My(d.params,m.keys.filter(v=>!v.optional).concat(m.parent?m.parent.keys.filter(v=>v.optional):[]).map(v=>v.name)),f.params&&My(f.params,m.keys.map(v=>v.name))),y=m.stringify(_)}else if(f.path!=null)y=f.path,m=n.find(v=>v.re.test(y)),m&&(_=m.parse(y),I=m.record.name);else{if(m=d.name?r.get(d.name):n.find(v=>v.re.test(d.path)),!m)throw ao(1,{location:f,currentLocation:d});I=m.record.name,_=xe({},d.params,f.params),y=m.stringify(_)}const D=[];let P=m;for(;P;)D.unshift(P.record),P=P.parent;return{name:I,path:y,params:_,matched:D,meta:jO(D)}}t.forEach(f=>i(f));function h(){n.length=0,r.clear()}return{addRoute:i,resolve:u,removeRoute:o,clearRoutes:h,getRoutes:a,getRecordMatcher:s}}function My(t,e){const n={};for(const r of e)r in t&&(n[r]=t[r]);return n}function Ly(t){const e={path:t.path,redirect:t.redirect,name:t.name,meta:t.meta||{},aliasOf:t.aliasOf,beforeEnter:t.beforeEnter,props:$O(t),children:t.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in t?t.components||null:t.component&&{default:t.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function $O(t){const e={},n=t.props||!1;if("component"in t)e.default=n;else for(const r in t.components)e[r]=typeof n=="object"?n[r]:n;return e}function Vy(t){for(;t;){if(t.record.aliasOf)return!0;t=t.parent}return!1}function jO(t){return t.reduce((e,n)=>xe(e,n.meta),{})}function Fy(t,e){const n={};for(const r in t)n[r]=r in e?e[r]:t[r];return n}function HO(t,e){let n=0,r=e.length;for(;n!==r;){const i=n+r>>1;Yw(t,e[i])<0?r=i:n=i+1}const s=qO(t);return s&&(r=e.lastIndexOf(s,r-1)),r}function qO(t){let e=t;for(;e=e.parent;)if(Xw(e)&&Yw(t,e)===0)return e}function Xw({record:t}){return!!(t.name||t.components&&Object.keys(t.components).length||t.redirect)}function WO(t){const e={};if(t===""||t==="?")return e;const r=(t[0]==="?"?t.slice(1):t).split("&");for(let s=0;s<r.length;++s){const i=r[s].replace(jw," "),o=i.indexOf("="),a=Qa(o<0?i:i.slice(0,o)),c=o<0?null:Qa(i.slice(o+1));if(a in e){let u=e[a];Bn(u)||(u=e[a]=[u]),u.push(c)}else e[a]=c}return e}function Uy(t){let e="";for(let n in t){const r=t[n];if(n=hO(n),r==null){r!==void 0&&(e+=(e.length?"&":"")+n);continue}(Bn(r)?r.map(i=>i&&Ad(i)):[r&&Ad(r)]).forEach(i=>{i!==void 0&&(e+=(e.length?"&":"")+n,i!=null&&(e+="="+i))})}return e}function KO(t){const e={};for(const n in t){const r=t[n];r!==void 0&&(e[n]=Bn(r)?r.map(s=>s==null?null:""+s):r==null?r:""+r)}return e}const zO=Symbol(""),By=Symbol(""),ch=Symbol(""),em=Symbol(""),Cd=Symbol("");function ta(){let t=[];function e(r){return t.push(r),()=>{const s=t.indexOf(r);s>-1&&t.splice(s,1)}}function n(){t=[]}return{add:e,list:()=>t.slice(),reset:n}}function ts(t,e,n,r,s,i=o=>o()){const o=r&&(r.enterCallbacks[s]=r.enterCallbacks[s]||[]);return()=>new Promise((a,c)=>{const u=d=>{d===!1?c(ao(4,{from:n,to:e})):d instanceof Error?c(d):NO(d)?c(ao(2,{from:e,to:d})):(o&&r.enterCallbacks[s]===o&&typeof d=="function"&&o.push(d),a())},h=i(()=>t.call(r&&r.instances[s],e,n,u));let f=Promise.resolve(h);t.length<3&&(f=f.then(u)),f.catch(d=>c(d))})}function wf(t,e,n,r,s=i=>i()){const i=[];for(const o of t)for(const a in o.components){let c=o.components[a];if(!(e!=="beforeRouteEnter"&&!o.instances[a]))if(Bw(c)){const h=(c.__vccOpts||c)[e];h&&i.push(ts(h,n,r,o,a,s))}else{let u=c();i.push(()=>u.then(h=>{if(!h)throw new Error(`Couldn't resolve component "${a}" at "${o.path}"`);const f=eO(h)?h.default:h;o.mods[a]=h,o.components[a]=f;const m=(f.__vccOpts||f)[e];return m&&ts(m,n,r,o,a,s)()}))}}return i}function $y(t){const e=ct(ch),n=ct(em),r=nt(()=>{const c=qe(t.to);return e.resolve(c)}),s=nt(()=>{const{matched:c}=r.value,{length:u}=c,h=c[u-1],f=n.matched;if(!h||!f.length)return-1;const d=f.findIndex(oo.bind(null,h));if(d>-1)return d;const m=jy(c[u-2]);return u>1&&jy(h)===m&&f[f.length-1].path!==m?f.findIndex(oo.bind(null,c[u-2])):d}),i=nt(()=>s.value>-1&&JO(n.params,r.value.params)),o=nt(()=>s.value>-1&&s.value===n.matched.length-1&&Kw(n.params,r.value.params));function a(c={}){if(XO(c)){const u=e[qe(t.replace)?"replace":"push"](qe(t.to)).catch(Aa);return t.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>u),u}return Promise.resolve()}return{route:r,href:nt(()=>r.value.href),isActive:i,isExactActive:o,navigate:a}}function GO(t){return t.length===1?t[0]:t}const QO=cr({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:$y,setup(t,{slots:e}){const n=ar($y(t)),{options:r}=ct(ch),s=nt(()=>({[Hy(t.activeClass,r.linkActiveClass,"router-link-active")]:n.isActive,[Hy(t.exactActiveClass,r.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const i=e.default&&GO(e.default(n));return t.custom?i:At("a",{"aria-current":n.isExactActive?t.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:s.value},i)}}}),YO=QO;function XO(t){if(!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)&&!t.defaultPrevented&&!(t.button!==void 0&&t.button!==0)){if(t.currentTarget&&t.currentTarget.getAttribute){const e=t.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return t.preventDefault&&t.preventDefault(),!0}}function JO(t,e){for(const n in e){const r=e[n],s=t[n];if(typeof r=="string"){if(r!==s)return!1}else if(!Bn(s)||s.length!==r.length||r.some((i,o)=>i!==s[o]))return!1}return!0}function jy(t){return t?t.aliasOf?t.aliasOf.path:t.path:""}const Hy=(t,e,n)=>t??e??n,ZO=cr({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(t,{attrs:e,slots:n}){const r=ct(Cd),s=nt(()=>t.route||r.value),i=ct(By,0),o=nt(()=>{let u=qe(i);const{matched:h}=s.value;let f;for(;(f=h[u])&&!f.components;)u++;return u}),a=nt(()=>s.value.matched[o.value]);us(By,nt(()=>o.value+1)),us(zO,a),us(Cd,s);const c=ft();return Ln(()=>[c.value,a.value,t.name],([u,h,f],[d,m,_])=>{h&&(h.instances[f]=u,m&&m!==h&&u&&u===d&&(h.leaveGuards.size||(h.leaveGuards=m.leaveGuards),h.updateGuards.size||(h.updateGuards=m.updateGuards))),u&&h&&(!m||!oo(h,m)||!d)&&(h.enterCallbacks[f]||[]).forEach(y=>y(u))},{flush:"post"}),()=>{const u=s.value,h=t.name,f=a.value,d=f&&f.components[h];if(!d)return qy(n.default,{Component:d,route:u});const m=f.props[h],_=m?m===!0?u.params:typeof m=="function"?m(u):m:null,I=At(d,xe({},_,e,{onVnodeUnmounted:D=>{D.component.isUnmounted&&(f.instances[h]=null)},ref:c}));return qy(n.default,{Component:I,route:u})||I}}});function qy(t,e){if(!t)return null;const n=t(e);return n.length===1?n[0]:n}const Jw=ZO;function eD(t){const e=BO(t.routes,t),n=t.parseQuery||WO,r=t.stringifyQuery||Uy,s=t.history,i=ta(),o=ta(),a=ta(),c=kr(En);let u=En;Di&&t.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const h=Ef.bind(null,B=>""+B),f=Ef.bind(null,dO),d=Ef.bind(null,Qa);function m(B,Z){let J,ie;return Gw(B)?(J=e.getRecordMatcher(B),ie=Z):ie=B,e.addRoute(ie,J)}function _(B){const Z=e.getRecordMatcher(B);Z&&e.removeRoute(Z)}function y(){return e.getRoutes().map(B=>B.record)}function I(B){return!!e.getRecordMatcher(B)}function D(B,Z){if(Z=xe({},Z||c.value),typeof B=="string"){const O=Tf(n,B,Z.path),V=e.resolve({path:O.path},Z),H=s.createHref(O.fullPath);return xe(O,V,{params:d(V.params),hash:Qa(O.hash),redirectedFrom:void 0,href:H})}let J;if(B.path!=null)J=xe({},B,{path:Tf(n,B.path,Z.path).path});else{const O=xe({},B.params);for(const V in O)O[V]==null&&delete O[V];J=xe({},B,{params:f(O)}),Z.params=f(Z.params)}const ie=e.resolve(J,Z),we=B.hash||"";ie.params=h(d(ie.params));const Ve=gO(r,xe({},B,{hash:uO(we),path:ie.path})),S=s.createHref(Ve);return xe({fullPath:Ve,hash:we,query:r===Uy?KO(B.query):B.query||{}},ie,{redirectedFrom:void 0,href:S})}function P(B){return typeof B=="string"?Tf(n,B,c.value.path):xe({},B)}function v(B,Z){if(u!==B)return ao(8,{from:Z,to:B})}function R(B){return b(B)}function x(B){return R(xe(P(B),{replace:!0}))}function M(B){const Z=B.matched[B.matched.length-1];if(Z&&Z.redirect){const{redirect:J}=Z;let ie=typeof J=="function"?J(B):J;return typeof ie=="string"&&(ie=ie.includes("?")||ie.includes("#")?ie=P(ie):{path:ie},ie.params={}),xe({query:B.query,hash:B.hash,params:ie.path!=null?{}:B.params},ie)}}function b(B,Z){const J=u=D(B),ie=c.value,we=B.state,Ve=B.force,S=B.replace===!0,O=M(J);if(O)return b(xe(P(O),{state:typeof O=="object"?xe({},we,O.state):we,force:Ve,replace:S}),Z||J);const V=J;V.redirectedFrom=Z;let H;return!Ve&&_O(r,ie,J)&&(H=ao(16,{to:V,from:ie}),_n(ie,ie,!0,!1)),(H?Promise.resolve(H):A(V,ie)).catch(U=>pr(U)?pr(U,2)?U:Sn(U):te(U,V,ie)).then(U=>{if(U){if(pr(U,2))return b(xe({replace:S},P(U.to),{state:typeof U.to=="object"?xe({},we,U.to.state):we,force:Ve}),Z||V)}else U=k(V,ie,!0,S,we);return N(V,ie,U),U})}function E(B,Z){const J=v(B,Z);return J?Promise.reject(J):Promise.resolve()}function T(B){const Z=$r.values().next().value;return Z&&typeof Z.runWithContext=="function"?Z.runWithContext(B):B()}function A(B,Z){let J;const[ie,we,Ve]=tD(B,Z);J=wf(ie.reverse(),"beforeRouteLeave",B,Z);for(const O of ie)O.leaveGuards.forEach(V=>{J.push(ts(V,B,Z))});const S=E.bind(null,B,Z);return J.push(S),en(J).then(()=>{J=[];for(const O of i.list())J.push(ts(O,B,Z));return J.push(S),en(J)}).then(()=>{J=wf(we,"beforeRouteUpdate",B,Z);for(const O of we)O.updateGuards.forEach(V=>{J.push(ts(V,B,Z))});return J.push(S),en(J)}).then(()=>{J=[];for(const O of Ve)if(O.beforeEnter)if(Bn(O.beforeEnter))for(const V of O.beforeEnter)J.push(ts(V,B,Z));else J.push(ts(O.beforeEnter,B,Z));return J.push(S),en(J)}).then(()=>(B.matched.forEach(O=>O.enterCallbacks={}),J=wf(Ve,"beforeRouteEnter",B,Z,T),J.push(S),en(J))).then(()=>{J=[];for(const O of o.list())J.push(ts(O,B,Z));return J.push(S),en(J)}).catch(O=>pr(O,8)?O:Promise.reject(O))}function N(B,Z,J){a.list().forEach(ie=>T(()=>ie(B,Z,J)))}function k(B,Z,J,ie,we){const Ve=v(B,Z);if(Ve)return Ve;const S=Z===En,O=Di?history.state:{};J&&(ie||S?s.replace(B.fullPath,xe({scroll:S&&O&&O.scroll},we)):s.push(B.fullPath,we)),c.value=B,_n(B,Z,J,S),Sn()}let C;function me(){C||(C=s.listen((B,Z,J)=>{if(!Wn.listening)return;const ie=D(B),we=M(ie);if(we){b(xe(we,{replace:!0,force:!0}),ie).catch(Aa);return}u=ie;const Ve=c.value;Di&&AO(Py(Ve.fullPath,J.delta),ah()),A(ie,Ve).catch(S=>pr(S,12)?S:pr(S,2)?(b(xe(P(S.to),{force:!0}),ie).then(O=>{pr(O,20)&&!J.delta&&J.type===Ya.pop&&s.go(-1,!1)}).catch(Aa),Promise.reject()):(J.delta&&s.go(-J.delta,!1),te(S,ie,Ve))).then(S=>{S=S||k(ie,Ve,!1),S&&(J.delta&&!pr(S,8)?s.go(-J.delta,!1):J.type===Ya.pop&&pr(S,20)&&s.go(-1,!1)),N(ie,Ve,S)}).catch(Aa)}))}let Ee=ta(),se=ta(),fe;function te(B,Z,J){Sn(B);const ie=se.list();return ie.length?ie.forEach(we=>we(B,Z,J)):console.error(B),Promise.reject(B)}function je(){return fe&&c.value!==En?Promise.resolve():new Promise((B,Z)=>{Ee.add([B,Z])})}function Sn(B){return fe||(fe=!B,me(),Ee.list().forEach(([Z,J])=>B?J(B):Z()),Ee.reset()),B}function _n(B,Z,J,ie){const{scrollBehavior:we}=t;if(!Di||!we)return Promise.resolve();const Ve=!J&&RO(Py(B.fullPath,0))||(ie||!J)&&history.state&&history.state.scroll||null;return Pr().then(()=>we(B,Z,Ve)).then(S=>S&&IO(S)).catch(S=>te(S,B,Z))}const Ze=B=>s.go(B);let et;const $r=new Set,Wn={currentRoute:c,listening:!0,addRoute:m,removeRoute:_,clearRoutes:e.clearRoutes,hasRoute:I,getRoutes:y,resolve:D,options:t,push:R,replace:x,go:Ze,back:()=>Ze(-1),forward:()=>Ze(1),beforeEach:i.add,beforeResolve:o.add,afterEach:a.add,onError:se.add,isReady:je,install(B){const Z=this;B.component("RouterLink",YO),B.component("RouterView",Jw),B.config.globalProperties.$router=Z,Object.defineProperty(B.config.globalProperties,"$route",{enumerable:!0,get:()=>qe(c)}),Di&&!et&&c.value===En&&(et=!0,R(s.location).catch(we=>{}));const J={};for(const we in En)Object.defineProperty(J,we,{get:()=>c.value[we],enumerable:!0});B.provide(ch,Z),B.provide(em,Zn(J)),B.provide(Cd,c);const ie=B.unmount;$r.add(B),B.unmount=function(){$r.delete(B),$r.size<1&&(u=En,C&&C(),C=null,c.value=En,et=!1,fe=!1),ie()}}};function en(B){return B.reduce((Z,J)=>Z.then(()=>T(J)),Promise.resolve())}return Wn}function tD(t,e){const n=[],r=[],s=[],i=Math.max(e.matched.length,t.matched.length);for(let o=0;o<i;o++){const a=e.matched[o];a&&(t.matched.find(u=>oo(u,a))?r.push(a):n.push(a));const c=t.matched[o];c&&(e.matched.find(u=>oo(u,c))||s.push(c))}return[n,r,s]}function dj(){return ct(ch)}function tm(t){return ct(em)}const nD=/(:\w+)\([^)]+\)/g,rD=/(:\w+)[?+*]/g,sD=/:\w+/g,iD=(t,e)=>e.path.replace(nD,"$1").replace(rD,"$1").replace(sD,n=>{var r;return((r=t.params[n.slice(1)])==null?void 0:r.toString())||""}),Sd=(t,e)=>{const n=t.route.matched.find(s=>{var i;return((i=s.components)==null?void 0:i.default)===t.Component.type}),r=e??(n==null?void 0:n.meta.key)??(n&&iD(t.route,n));return typeof r=="function"?r(t.route):r},oD=(t,e)=>({default:()=>t?At(GS,t===!0?{}:t,e):e});function nm(t){return Array.isArray(t)?t:[t]}const aD={layout:"default",title:"Authentication",icon:"i-lucide-lock"};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cD=()=>{};var Wy={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zw={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const X=function(t,e){if(!t)throw Io(e)},Io=function(t){return new Error("Firebase Database ("+Zw.SDK_VERSION+") INTERNAL ASSERT FAILED: "+t)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eb=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},lD=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=t[n++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=t[n++],o=t[n++],a=t[n++],c=((s&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const i=t[n++],o=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},lh={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const i=t[s],o=s+1<t.length,a=o?t[s+1]:0,c=s+2<t.length,u=c?t[s+2]:0,h=i>>2,f=(i&3)<<4|a>>4;let d=(a&15)<<2|u>>6,m=u&63;c||(m=64,o||(d=64)),r.push(n[h],n[f],n[d],n[m])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(eb(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):lD(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const i=n[t.charAt(s++)],a=s<t.length?n[t.charAt(s)]:0;++s;const u=s<t.length?n[t.charAt(s)]:64;++s;const f=s<t.length?n[t.charAt(s)]:64;if(++s,i==null||a==null||u==null||f==null)throw new uD;const d=i<<2|a>>4;if(r.push(d),u!==64){const m=a<<4&240|u>>2;if(r.push(m),f!==64){const _=u<<6&192|f;r.push(_)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class uD extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const tb=function(t){const e=eb(t);return lh.encodeByteArray(e,!0)},au=function(t){return tb(t).replace(/\./g,"")},cu=function(t){try{return lh.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hD(t){return nb(void 0,t)}function nb(t,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const n=e;return new Date(n.getTime());case Object:t===void 0&&(t={});break;case Array:t=[];break;default:return e}for(const n in e)!e.hasOwnProperty(n)||!fD(n)||(t[n]=nb(t[n],e[n]));return t}function fD(t){return t!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dD(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pD=()=>dD().__FIREBASE_DEFAULTS__,mD=()=>{if(typeof process>"u"||typeof Wy>"u")return;const t=Wy.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},gD=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&cu(t[1]);return e&&JSON.parse(e)},uh=()=>{try{return cD()||pD()||mD()||gD()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},_D=t=>{var e,n;return(n=(e=uh())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},rb=t=>{const e=_D(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},sb=()=>{var t;return(t=uh())===null||t===void 0?void 0:t.config},yD=t=>{var e;return(e=uh())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xa{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ao(t){return t.endsWith(".cloudworkstations.dev")}async function ib(t){return(await fetch(t,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ob(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",s=t.iat||0,i=t.sub||t.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},t);return[au(JSON.stringify(n)),au(JSON.stringify(o)),""].join(".")}const Ca={};function vD(){const t={prod:[],emulator:[]};for(const e of Object.keys(Ca))Ca[e]?t.emulator.push(e):t.prod.push(e);return t}function ED(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}let Ky=!1;function ab(t,e){if(typeof window>"u"||typeof document>"u"||!Ao(window.location.host)||Ca[t]===e||Ca[t]||Ky)return;Ca[t]=e;function n(d){return`__firebase__banner__${d}`}const r="__firebase__banner",i=vD().prod.length>0;function o(){const d=document.getElementById(r);d&&d.remove()}function a(d){d.style.display="flex",d.style.background="#7faaf0",d.style.position="fixed",d.style.bottom="5px",d.style.left="5px",d.style.padding=".5em",d.style.borderRadius="5px",d.style.alignItems="center"}function c(d,m){d.setAttribute("width","24"),d.setAttribute("id",m),d.setAttribute("height","24"),d.setAttribute("viewBox","0 0 24 24"),d.setAttribute("fill","none"),d.style.marginLeft="-6px"}function u(){const d=document.createElement("span");return d.style.cursor="pointer",d.style.marginLeft="16px",d.style.fontSize="24px",d.innerHTML=" &times;",d.onclick=()=>{Ky=!0,o()},d}function h(d,m){d.setAttribute("id",m),d.innerText="Learn more",d.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",d.setAttribute("target","__blank"),d.style.paddingLeft="5px",d.style.textDecoration="underline"}function f(){const d=ED(r),m=n("text"),_=document.getElementById(m)||document.createElement("span"),y=n("learnmore"),I=document.getElementById(y)||document.createElement("a"),D=n("preprendIcon"),P=document.getElementById(D)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(d.created){const v=d.element;a(v),h(I,y);const R=u();c(P,D),v.append(P,_,I,R),document.body.appendChild(v)}i?(_.innerText="Preview backend disconnected.",P.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(P.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,_.innerText="Preview backend running in this workspace."),_.setAttribute("id",m)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",f):f()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $n(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function rm(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test($n())}function TD(){var t;const e=(t=uh())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function wD(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function bD(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function cb(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function ID(){return Zw.NODE_ADMIN===!0}function AD(){return!TD()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function lb(){try{return typeof indexedDB=="object"}catch{return!1}}function RD(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CD="FirebaseError";class lr extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=CD,Object.setPrototypeOf(this,lr.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ro.prototype.create)}}class Ro{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?SD(i,r):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new lr(s,a,r)}}function SD(t,e){return t.replace(kD,(n,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const kD=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ja(t){return JSON.parse(t)}function kt(t){return JSON.stringify(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ub=function(t){let e={},n={},r={},s="";try{const i=t.split(".");e=Ja(cu(i[0])||""),n=Ja(cu(i[1])||""),s=i[2],r=n.d||{},delete n.d}catch{}return{header:e,claims:n,data:r,signature:s}},PD=function(t){const e=ub(t),n=e.claims;return!!n&&typeof n=="object"&&n.hasOwnProperty("iat")},ND=function(t){const e=ub(t).claims;return typeof e=="object"&&e.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fr(t,e){return Object.prototype.hasOwnProperty.call(t,e)}function co(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]}function zy(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function lu(t,e,n){const r={};for(const s in t)Object.prototype.hasOwnProperty.call(t,s)&&(r[s]=e.call(n,t[s],s,t));return r}function Za(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const i=t[s],o=e[s];if(Gy(i)&&Gy(o)){if(!Za(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function Gy(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hh(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function ha(t){const e={};return t.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function fa(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OD{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,n){n||(n=0);const r=this.W_;if(typeof e=="string")for(let f=0;f<16;f++)r[f]=e.charCodeAt(n)<<24|e.charCodeAt(n+1)<<16|e.charCodeAt(n+2)<<8|e.charCodeAt(n+3),n+=4;else for(let f=0;f<16;f++)r[f]=e[n]<<24|e[n+1]<<16|e[n+2]<<8|e[n+3],n+=4;for(let f=16;f<80;f++){const d=r[f-3]^r[f-8]^r[f-14]^r[f-16];r[f]=(d<<1|d>>>31)&4294967295}let s=this.chain_[0],i=this.chain_[1],o=this.chain_[2],a=this.chain_[3],c=this.chain_[4],u,h;for(let f=0;f<80;f++){f<40?f<20?(u=a^i&(o^a),h=1518500249):(u=i^o^a,h=1859775393):f<60?(u=i&o|a&(i|o),h=2400959708):(u=i^o^a,h=3395469782);const d=(s<<5|s>>>27)+u+c+h+r[f]&4294967295;c=a,a=o,o=(i<<30|i>>>2)&4294967295,i=s,s=d}this.chain_[0]=this.chain_[0]+s&4294967295,this.chain_[1]=this.chain_[1]+i&4294967295,this.chain_[2]=this.chain_[2]+o&4294967295,this.chain_[3]=this.chain_[3]+a&4294967295,this.chain_[4]=this.chain_[4]+c&4294967295}update(e,n){if(e==null)return;n===void 0&&(n=e.length);const r=n-this.blockSize;let s=0;const i=this.buf_;let o=this.inbuf_;for(;s<n;){if(o===0)for(;s<=r;)this.compress_(e,s),s+=this.blockSize;if(typeof e=="string"){for(;s<n;)if(i[o]=e.charCodeAt(s),++o,++s,o===this.blockSize){this.compress_(i),o=0;break}}else for(;s<n;)if(i[o]=e[s],++o,++s,o===this.blockSize){this.compress_(i),o=0;break}}this.inbuf_=o,this.total_+=n}digest(){const e=[];let n=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let s=this.blockSize-1;s>=56;s--)this.buf_[s]=n&255,n/=256;this.compress_(this.buf_);let r=0;for(let s=0;s<5;s++)for(let i=24;i>=0;i-=8)e[r]=this.chain_[s]>>i&255,++r;return e}}function DD(t,e){const n=new xD(t,e);return n.subscribe.bind(n)}class xD{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let s;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");MD(e,["next","error","complete"])?s=e:s={next:e,error:n,complete:r},s.next===void 0&&(s.next=bf),s.error===void 0&&(s.error=bf),s.complete===void 0&&(s.complete=bf);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function MD(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function bf(){}function LD(t,e){return`${t} failed: ${e} argument `}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const VD=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);if(s>=55296&&s<=56319){const i=s-55296;r++,X(r<t.length,"Surrogate pair missing trail surrogate.");const o=t.charCodeAt(r)-56320;s=65536+(i<<10)+o}s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):s<65536?(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},fh=function(t){let e=0;for(let n=0;n<t.length;n++){const r=t.charCodeAt(n);r<128?e++:r<2048?e+=2:r>=55296&&r<=56319?(e+=4,n++):e+=3}return e};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Je(t){return t&&t._delegate?t._delegate:t}class jn{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bs="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FD{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Xa;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(BD(e))try{this.getOrInitializeService({instanceIdentifier:Bs})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Bs){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Bs){return this.instances.has(e)}getOptions(e=Bs){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[i,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(i);r===a&&o.resolve(s)}return s}onInit(e,n){var r;const s=this.normalizeInstanceIdentifier(n),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const o=this.instances.get(s);return o&&e(o,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:UD(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Bs){return this.component?this.component.multipleInstances?e:Bs:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function UD(t){return t===Bs?void 0:t}function BD(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $D{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new FD(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ve;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(ve||(ve={}));const jD={debug:ve.DEBUG,verbose:ve.VERBOSE,info:ve.INFO,warn:ve.WARN,error:ve.ERROR,silent:ve.SILENT},HD=ve.INFO,qD={[ve.DEBUG]:"log",[ve.VERBOSE]:"log",[ve.INFO]:"info",[ve.WARN]:"warn",[ve.ERROR]:"error"},WD=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=qD[e];if(s)console[s](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class yc{constructor(e){this.name=e,this._logLevel=HD,this._logHandler=WD,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ve))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?jD[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ve.DEBUG,...e),this._logHandler(this,ve.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ve.VERBOSE,...e),this._logHandler(this,ve.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ve.INFO,...e),this._logHandler(this,ve.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ve.WARN,...e),this._logHandler(this,ve.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ve.ERROR,...e),this._logHandler(this,ve.ERROR,...e)}}const KD=(t,e)=>e.some(n=>t instanceof n);let Qy,Yy;function zD(){return Qy||(Qy=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function GD(){return Yy||(Yy=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const hb=new WeakMap,kd=new WeakMap,fb=new WeakMap,If=new WeakMap,sm=new WeakMap;function QD(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",i),t.removeEventListener("error",o)},i=()=>{n(hs(t.result)),s()},o=()=>{r(t.error),s()};t.addEventListener("success",i),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&hb.set(n,t)}).catch(()=>{}),sm.set(e,t),e}function YD(t){if(kd.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",o),t.removeEventListener("abort",o)},i=()=>{n(),s()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",i),t.addEventListener("error",o),t.addEventListener("abort",o)});kd.set(t,e)}let Pd={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return kd.get(t);if(e==="objectStoreNames")return t.objectStoreNames||fb.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return hs(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function XD(t){Pd=t(Pd)}function JD(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(Af(this),e,...n);return fb.set(r,e.sort?e.sort():[e]),hs(r)}:GD().includes(t)?function(...e){return t.apply(Af(this),e),hs(hb.get(this))}:function(...e){return hs(t.apply(Af(this),e))}}function ZD(t){return typeof t=="function"?JD(t):(t instanceof IDBTransaction&&YD(t),KD(t,zD())?new Proxy(t,Pd):t)}function hs(t){if(t instanceof IDBRequest)return QD(t);if(If.has(t))return If.get(t);const e=ZD(t);return e!==t&&(If.set(t,e),sm.set(e,t)),e}const Af=t=>sm.get(t);function ex(t,e,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(t,e),a=hs(o);return r&&o.addEventListener("upgradeneeded",c=>{r(hs(o.result),c.oldVersion,c.newVersion,hs(o.transaction),c)}),n&&o.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",u=>s(u.oldVersion,u.newVersion,u))}).catch(()=>{}),a}const tx=["get","getKey","getAll","getAllKeys","count"],nx=["put","add","delete","clear"],Rf=new Map;function Xy(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Rf.get(e))return Rf.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=nx.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||tx.includes(n)))return;const i=async function(o,...a){const c=this.transaction(o,s?"readwrite":"readonly");let u=c.store;return r&&(u=u.index(a.shift())),(await Promise.all([u[n](...a),s&&c.done]))[0]};return Rf.set(e,i),i}XD(t=>({...t,get:(e,n,r)=>Xy(e,n)||t.get(e,n,r),has:(e,n)=>!!Xy(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rx{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(sx(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function sx(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Nd="@firebase/app",Jy="0.13.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Or=new yc("@firebase/app"),ix="@firebase/app-compat",ox="@firebase/analytics-compat",ax="@firebase/analytics",cx="@firebase/app-check-compat",lx="@firebase/app-check",ux="@firebase/auth",hx="@firebase/auth-compat",fx="@firebase/database",dx="@firebase/data-connect",px="@firebase/database-compat",mx="@firebase/functions",gx="@firebase/functions-compat",_x="@firebase/installations",yx="@firebase/installations-compat",vx="@firebase/messaging",Ex="@firebase/messaging-compat",Tx="@firebase/performance",wx="@firebase/performance-compat",bx="@firebase/remote-config",Ix="@firebase/remote-config-compat",Ax="@firebase/storage",Rx="@firebase/storage-compat",Cx="@firebase/firestore",Sx="@firebase/ai",kx="@firebase/firestore-compat",Px="firebase",Nx="11.8.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Od="[DEFAULT]",Ox={[Nd]:"fire-core",[ix]:"fire-core-compat",[ax]:"fire-analytics",[ox]:"fire-analytics-compat",[lx]:"fire-app-check",[cx]:"fire-app-check-compat",[ux]:"fire-auth",[hx]:"fire-auth-compat",[fx]:"fire-rtdb",[dx]:"fire-data-connect",[px]:"fire-rtdb-compat",[mx]:"fire-fn",[gx]:"fire-fn-compat",[_x]:"fire-iid",[yx]:"fire-iid-compat",[vx]:"fire-fcm",[Ex]:"fire-fcm-compat",[Tx]:"fire-perf",[wx]:"fire-perf-compat",[bx]:"fire-rc",[Ix]:"fire-rc-compat",[Ax]:"fire-gcs",[Rx]:"fire-gcs-compat",[Cx]:"fire-fst",[kx]:"fire-fst-compat",[Sx]:"fire-vertex","fire-js":"fire-js",[Px]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uu=new Map,Dx=new Map,Dd=new Map;function Zy(t,e){try{t.container.addComponent(e)}catch(n){Or.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function ir(t){const e=t.name;if(Dd.has(e))return Or.debug(`There were multiple attempts to register component ${e}.`),!1;Dd.set(e,t);for(const n of uu.values())Zy(n,t);for(const n of Dx.values())Zy(n,t);return!0}function db(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Zt(t){return t==null?!1:t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xx={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},fs=new Ro("app","Firebase",xx);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mx{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new jn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw fs.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Co=Nx;function Lx(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Od,automaticDataCollectionEnabled:!0},e),s=r.name;if(typeof s!="string"||!s)throw fs.create("bad-app-name",{appName:String(s)});if(n||(n=sb()),!n)throw fs.create("no-options");const i=uu.get(s);if(i){if(Za(n,i.options)&&Za(r,i.config))return i;throw fs.create("duplicate-app",{appName:s})}const o=new $D(s);for(const c of Dd.values())o.addComponent(c);const a=new Mx(n,r,o);return uu.set(s,a),a}function im(t=Od){const e=uu.get(t);if(!e&&t===Od&&sb())return Lx();if(!e)throw fs.create("no-app",{appName:t});return e}function pn(t,e,n){var r;let s=(r=Ox[t])!==null&&r!==void 0?r:t;n&&(s+=`-${n}`);const i=s.match(/\s|\//),o=e.match(/\s|\//);if(i||o){const a=[`Unable to register library "${s}" with version "${e}":`];i&&a.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&a.push("and"),o&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Or.warn(a.join(" "));return}ir(new jn(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vx="firebase-heartbeat-database",Fx=1,ec="firebase-heartbeat-store";let Cf=null;function pb(){return Cf||(Cf=ex(Vx,Fx,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(ec)}catch(n){console.warn(n)}}}}).catch(t=>{throw fs.create("idb-open",{originalErrorMessage:t.message})})),Cf}async function Ux(t){try{const n=(await pb()).transaction(ec),r=await n.objectStore(ec).get(mb(t));return await n.done,r}catch(e){if(e instanceof lr)Or.warn(e.message);else{const n=fs.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Or.warn(n.message)}}}async function ev(t,e){try{const r=(await pb()).transaction(ec,"readwrite");await r.objectStore(ec).put(e,mb(t)),await r.done}catch(n){if(n instanceof lr)Or.warn(n.message);else{const r=fs.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Or.warn(r.message)}}}function mb(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bx=1024,$x=30;class jx{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new qx(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=tv();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>$x){const o=Wx(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Or.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=tv(),{heartbeatsToSend:r,unsentEntries:s}=Hx(this._heartbeatsCache.heartbeats),i=au(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return Or.warn(n),""}}}function tv(){return new Date().toISOString().substring(0,10)}function Hx(t,e=Bx){const n=[];let r=t.slice();for(const s of t){const i=n.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),nv(n)>e){i.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),nv(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class qx{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return lb()?RD().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Ux(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return ev(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return ev(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function nv(t){return au(JSON.stringify({version:2,heartbeats:t})).length}function Wx(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kx(t){ir(new jn("platform-logger",e=>new rx(e),"PRIVATE")),ir(new jn("heartbeat",e=>new jx(e),"PRIVATE")),pn(Nd,Jy,t),pn(Nd,Jy,"esm2017"),pn("fire-js","")}Kx("");var rv=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ds,gb;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(b,E){function T(){}T.prototype=E.prototype,b.D=E.prototype,b.prototype=new T,b.prototype.constructor=b,b.C=function(A,N,k){for(var C=Array(arguments.length-2),me=2;me<arguments.length;me++)C[me-2]=arguments[me];return E.prototype[N].apply(A,C)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(b,E,T){T||(T=0);var A=Array(16);if(typeof E=="string")for(var N=0;16>N;++N)A[N]=E.charCodeAt(T++)|E.charCodeAt(T++)<<8|E.charCodeAt(T++)<<16|E.charCodeAt(T++)<<24;else for(N=0;16>N;++N)A[N]=E[T++]|E[T++]<<8|E[T++]<<16|E[T++]<<24;E=b.g[0],T=b.g[1],N=b.g[2];var k=b.g[3],C=E+(k^T&(N^k))+A[0]+3614090360&4294967295;E=T+(C<<7&4294967295|C>>>25),C=k+(N^E&(T^N))+A[1]+3905402710&4294967295,k=E+(C<<12&4294967295|C>>>20),C=N+(T^k&(E^T))+A[2]+606105819&4294967295,N=k+(C<<17&4294967295|C>>>15),C=T+(E^N&(k^E))+A[3]+3250441966&4294967295,T=N+(C<<22&4294967295|C>>>10),C=E+(k^T&(N^k))+A[4]+4118548399&4294967295,E=T+(C<<7&4294967295|C>>>25),C=k+(N^E&(T^N))+A[5]+1200080426&4294967295,k=E+(C<<12&4294967295|C>>>20),C=N+(T^k&(E^T))+A[6]+2821735955&4294967295,N=k+(C<<17&4294967295|C>>>15),C=T+(E^N&(k^E))+A[7]+4249261313&4294967295,T=N+(C<<22&4294967295|C>>>10),C=E+(k^T&(N^k))+A[8]+1770035416&4294967295,E=T+(C<<7&4294967295|C>>>25),C=k+(N^E&(T^N))+A[9]+2336552879&4294967295,k=E+(C<<12&4294967295|C>>>20),C=N+(T^k&(E^T))+A[10]+4294925233&4294967295,N=k+(C<<17&4294967295|C>>>15),C=T+(E^N&(k^E))+A[11]+2304563134&4294967295,T=N+(C<<22&4294967295|C>>>10),C=E+(k^T&(N^k))+A[12]+1804603682&4294967295,E=T+(C<<7&4294967295|C>>>25),C=k+(N^E&(T^N))+A[13]+4254626195&4294967295,k=E+(C<<12&4294967295|C>>>20),C=N+(T^k&(E^T))+A[14]+2792965006&4294967295,N=k+(C<<17&4294967295|C>>>15),C=T+(E^N&(k^E))+A[15]+1236535329&4294967295,T=N+(C<<22&4294967295|C>>>10),C=E+(N^k&(T^N))+A[1]+4129170786&4294967295,E=T+(C<<5&4294967295|C>>>27),C=k+(T^N&(E^T))+A[6]+3225465664&4294967295,k=E+(C<<9&4294967295|C>>>23),C=N+(E^T&(k^E))+A[11]+643717713&4294967295,N=k+(C<<14&4294967295|C>>>18),C=T+(k^E&(N^k))+A[0]+3921069994&4294967295,T=N+(C<<20&4294967295|C>>>12),C=E+(N^k&(T^N))+A[5]+3593408605&4294967295,E=T+(C<<5&4294967295|C>>>27),C=k+(T^N&(E^T))+A[10]+38016083&4294967295,k=E+(C<<9&4294967295|C>>>23),C=N+(E^T&(k^E))+A[15]+3634488961&4294967295,N=k+(C<<14&4294967295|C>>>18),C=T+(k^E&(N^k))+A[4]+3889429448&4294967295,T=N+(C<<20&4294967295|C>>>12),C=E+(N^k&(T^N))+A[9]+568446438&4294967295,E=T+(C<<5&4294967295|C>>>27),C=k+(T^N&(E^T))+A[14]+3275163606&4294967295,k=E+(C<<9&4294967295|C>>>23),C=N+(E^T&(k^E))+A[3]+4107603335&4294967295,N=k+(C<<14&4294967295|C>>>18),C=T+(k^E&(N^k))+A[8]+1163531501&4294967295,T=N+(C<<20&4294967295|C>>>12),C=E+(N^k&(T^N))+A[13]+2850285829&4294967295,E=T+(C<<5&4294967295|C>>>27),C=k+(T^N&(E^T))+A[2]+4243563512&4294967295,k=E+(C<<9&4294967295|C>>>23),C=N+(E^T&(k^E))+A[7]+1735328473&4294967295,N=k+(C<<14&4294967295|C>>>18),C=T+(k^E&(N^k))+A[12]+2368359562&4294967295,T=N+(C<<20&4294967295|C>>>12),C=E+(T^N^k)+A[5]+4294588738&4294967295,E=T+(C<<4&4294967295|C>>>28),C=k+(E^T^N)+A[8]+2272392833&4294967295,k=E+(C<<11&4294967295|C>>>21),C=N+(k^E^T)+A[11]+1839030562&4294967295,N=k+(C<<16&4294967295|C>>>16),C=T+(N^k^E)+A[14]+4259657740&4294967295,T=N+(C<<23&4294967295|C>>>9),C=E+(T^N^k)+A[1]+2763975236&4294967295,E=T+(C<<4&4294967295|C>>>28),C=k+(E^T^N)+A[4]+1272893353&4294967295,k=E+(C<<11&4294967295|C>>>21),C=N+(k^E^T)+A[7]+4139469664&4294967295,N=k+(C<<16&4294967295|C>>>16),C=T+(N^k^E)+A[10]+3200236656&4294967295,T=N+(C<<23&4294967295|C>>>9),C=E+(T^N^k)+A[13]+681279174&4294967295,E=T+(C<<4&4294967295|C>>>28),C=k+(E^T^N)+A[0]+3936430074&4294967295,k=E+(C<<11&4294967295|C>>>21),C=N+(k^E^T)+A[3]+3572445317&4294967295,N=k+(C<<16&4294967295|C>>>16),C=T+(N^k^E)+A[6]+76029189&4294967295,T=N+(C<<23&4294967295|C>>>9),C=E+(T^N^k)+A[9]+3654602809&4294967295,E=T+(C<<4&4294967295|C>>>28),C=k+(E^T^N)+A[12]+3873151461&4294967295,k=E+(C<<11&4294967295|C>>>21),C=N+(k^E^T)+A[15]+530742520&4294967295,N=k+(C<<16&4294967295|C>>>16),C=T+(N^k^E)+A[2]+3299628645&4294967295,T=N+(C<<23&4294967295|C>>>9),C=E+(N^(T|~k))+A[0]+4096336452&4294967295,E=T+(C<<6&4294967295|C>>>26),C=k+(T^(E|~N))+A[7]+1126891415&4294967295,k=E+(C<<10&4294967295|C>>>22),C=N+(E^(k|~T))+A[14]+2878612391&4294967295,N=k+(C<<15&4294967295|C>>>17),C=T+(k^(N|~E))+A[5]+4237533241&4294967295,T=N+(C<<21&4294967295|C>>>11),C=E+(N^(T|~k))+A[12]+1700485571&4294967295,E=T+(C<<6&4294967295|C>>>26),C=k+(T^(E|~N))+A[3]+2399980690&4294967295,k=E+(C<<10&4294967295|C>>>22),C=N+(E^(k|~T))+A[10]+4293915773&4294967295,N=k+(C<<15&4294967295|C>>>17),C=T+(k^(N|~E))+A[1]+2240044497&4294967295,T=N+(C<<21&4294967295|C>>>11),C=E+(N^(T|~k))+A[8]+1873313359&4294967295,E=T+(C<<6&4294967295|C>>>26),C=k+(T^(E|~N))+A[15]+4264355552&4294967295,k=E+(C<<10&4294967295|C>>>22),C=N+(E^(k|~T))+A[6]+2734768916&4294967295,N=k+(C<<15&4294967295|C>>>17),C=T+(k^(N|~E))+A[13]+1309151649&4294967295,T=N+(C<<21&4294967295|C>>>11),C=E+(N^(T|~k))+A[4]+4149444226&4294967295,E=T+(C<<6&4294967295|C>>>26),C=k+(T^(E|~N))+A[11]+3174756917&4294967295,k=E+(C<<10&4294967295|C>>>22),C=N+(E^(k|~T))+A[2]+718787259&4294967295,N=k+(C<<15&4294967295|C>>>17),C=T+(k^(N|~E))+A[9]+3951481745&4294967295,b.g[0]=b.g[0]+E&4294967295,b.g[1]=b.g[1]+(N+(C<<21&4294967295|C>>>11))&4294967295,b.g[2]=b.g[2]+N&4294967295,b.g[3]=b.g[3]+k&4294967295}r.prototype.u=function(b,E){E===void 0&&(E=b.length);for(var T=E-this.blockSize,A=this.B,N=this.h,k=0;k<E;){if(N==0)for(;k<=T;)s(this,b,k),k+=this.blockSize;if(typeof b=="string"){for(;k<E;)if(A[N++]=b.charCodeAt(k++),N==this.blockSize){s(this,A),N=0;break}}else for(;k<E;)if(A[N++]=b[k++],N==this.blockSize){s(this,A),N=0;break}}this.h=N,this.o+=E},r.prototype.v=function(){var b=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);b[0]=128;for(var E=1;E<b.length-8;++E)b[E]=0;var T=8*this.o;for(E=b.length-8;E<b.length;++E)b[E]=T&255,T/=256;for(this.u(b),b=Array(16),E=T=0;4>E;++E)for(var A=0;32>A;A+=8)b[T++]=this.g[E]>>>A&255;return b};function i(b,E){var T=a;return Object.prototype.hasOwnProperty.call(T,b)?T[b]:T[b]=E(b)}function o(b,E){this.h=E;for(var T=[],A=!0,N=b.length-1;0<=N;N--){var k=b[N]|0;A&&k==E||(T[N]=k,A=!1)}this.g=T}var a={};function c(b){return-128<=b&&128>b?i(b,function(E){return new o([E|0],0>E?-1:0)}):new o([b|0],0>b?-1:0)}function u(b){if(isNaN(b)||!isFinite(b))return f;if(0>b)return I(u(-b));for(var E=[],T=1,A=0;b>=T;A++)E[A]=b/T|0,T*=4294967296;return new o(E,0)}function h(b,E){if(b.length==0)throw Error("number format error: empty string");if(E=E||10,2>E||36<E)throw Error("radix out of range: "+E);if(b.charAt(0)=="-")return I(h(b.substring(1),E));if(0<=b.indexOf("-"))throw Error('number format error: interior "-" character');for(var T=u(Math.pow(E,8)),A=f,N=0;N<b.length;N+=8){var k=Math.min(8,b.length-N),C=parseInt(b.substring(N,N+k),E);8>k?(k=u(Math.pow(E,k)),A=A.j(k).add(u(C))):(A=A.j(T),A=A.add(u(C)))}return A}var f=c(0),d=c(1),m=c(16777216);t=o.prototype,t.m=function(){if(y(this))return-I(this).m();for(var b=0,E=1,T=0;T<this.g.length;T++){var A=this.i(T);b+=(0<=A?A:4294967296+A)*E,E*=4294967296}return b},t.toString=function(b){if(b=b||10,2>b||36<b)throw Error("radix out of range: "+b);if(_(this))return"0";if(y(this))return"-"+I(this).toString(b);for(var E=u(Math.pow(b,6)),T=this,A="";;){var N=R(T,E).g;T=D(T,N.j(E));var k=((0<T.g.length?T.g[0]:T.h)>>>0).toString(b);if(T=N,_(T))return k+A;for(;6>k.length;)k="0"+k;A=k+A}},t.i=function(b){return 0>b?0:b<this.g.length?this.g[b]:this.h};function _(b){if(b.h!=0)return!1;for(var E=0;E<b.g.length;E++)if(b.g[E]!=0)return!1;return!0}function y(b){return b.h==-1}t.l=function(b){return b=D(this,b),y(b)?-1:_(b)?0:1};function I(b){for(var E=b.g.length,T=[],A=0;A<E;A++)T[A]=~b.g[A];return new o(T,~b.h).add(d)}t.abs=function(){return y(this)?I(this):this},t.add=function(b){for(var E=Math.max(this.g.length,b.g.length),T=[],A=0,N=0;N<=E;N++){var k=A+(this.i(N)&65535)+(b.i(N)&65535),C=(k>>>16)+(this.i(N)>>>16)+(b.i(N)>>>16);A=C>>>16,k&=65535,C&=65535,T[N]=C<<16|k}return new o(T,T[T.length-1]&-2147483648?-1:0)};function D(b,E){return b.add(I(E))}t.j=function(b){if(_(this)||_(b))return f;if(y(this))return y(b)?I(this).j(I(b)):I(I(this).j(b));if(y(b))return I(this.j(I(b)));if(0>this.l(m)&&0>b.l(m))return u(this.m()*b.m());for(var E=this.g.length+b.g.length,T=[],A=0;A<2*E;A++)T[A]=0;for(A=0;A<this.g.length;A++)for(var N=0;N<b.g.length;N++){var k=this.i(A)>>>16,C=this.i(A)&65535,me=b.i(N)>>>16,Ee=b.i(N)&65535;T[2*A+2*N]+=C*Ee,P(T,2*A+2*N),T[2*A+2*N+1]+=k*Ee,P(T,2*A+2*N+1),T[2*A+2*N+1]+=C*me,P(T,2*A+2*N+1),T[2*A+2*N+2]+=k*me,P(T,2*A+2*N+2)}for(A=0;A<E;A++)T[A]=T[2*A+1]<<16|T[2*A];for(A=E;A<2*E;A++)T[A]=0;return new o(T,0)};function P(b,E){for(;(b[E]&65535)!=b[E];)b[E+1]+=b[E]>>>16,b[E]&=65535,E++}function v(b,E){this.g=b,this.h=E}function R(b,E){if(_(E))throw Error("division by zero");if(_(b))return new v(f,f);if(y(b))return E=R(I(b),E),new v(I(E.g),I(E.h));if(y(E))return E=R(b,I(E)),new v(I(E.g),E.h);if(30<b.g.length){if(y(b)||y(E))throw Error("slowDivide_ only works with positive integers.");for(var T=d,A=E;0>=A.l(b);)T=x(T),A=x(A);var N=M(T,1),k=M(A,1);for(A=M(A,2),T=M(T,2);!_(A);){var C=k.add(A);0>=C.l(b)&&(N=N.add(T),k=C),A=M(A,1),T=M(T,1)}return E=D(b,N.j(E)),new v(N,E)}for(N=f;0<=b.l(E);){for(T=Math.max(1,Math.floor(b.m()/E.m())),A=Math.ceil(Math.log(T)/Math.LN2),A=48>=A?1:Math.pow(2,A-48),k=u(T),C=k.j(E);y(C)||0<C.l(b);)T-=A,k=u(T),C=k.j(E);_(k)&&(k=d),N=N.add(k),b=D(b,C)}return new v(N,b)}t.A=function(b){return R(this,b).h},t.and=function(b){for(var E=Math.max(this.g.length,b.g.length),T=[],A=0;A<E;A++)T[A]=this.i(A)&b.i(A);return new o(T,this.h&b.h)},t.or=function(b){for(var E=Math.max(this.g.length,b.g.length),T=[],A=0;A<E;A++)T[A]=this.i(A)|b.i(A);return new o(T,this.h|b.h)},t.xor=function(b){for(var E=Math.max(this.g.length,b.g.length),T=[],A=0;A<E;A++)T[A]=this.i(A)^b.i(A);return new o(T,this.h^b.h)};function x(b){for(var E=b.g.length+1,T=[],A=0;A<E;A++)T[A]=b.i(A)<<1|b.i(A-1)>>>31;return new o(T,b.h)}function M(b,E){var T=E>>5;E%=32;for(var A=b.g.length-T,N=[],k=0;k<A;k++)N[k]=0<E?b.i(k+T)>>>E|b.i(k+T+1)<<32-E:b.i(k+T);return new o(N,b.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,gb=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=u,o.fromString=h,ds=o}).apply(typeof rv<"u"?rv:typeof self<"u"?self:typeof window<"u"?window:{});var cl=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var _b,da,yb,Cl,xd,vb,Eb,Tb;(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(l,p,g){return l==Array.prototype||l==Object.prototype||(l[p]=g.value),l};function n(l){l=[typeof globalThis=="object"&&globalThis,l,typeof window=="object"&&window,typeof self=="object"&&self,typeof cl=="object"&&cl];for(var p=0;p<l.length;++p){var g=l[p];if(g&&g.Math==Math)return g}throw Error("Cannot find global object")}var r=n(this);function s(l,p){if(p)e:{var g=r;l=l.split(".");for(var w=0;w<l.length-1;w++){var L=l[w];if(!(L in g))break e;g=g[L]}l=l[l.length-1],w=g[l],p=p(w),p!=w&&p!=null&&e(g,l,{configurable:!0,writable:!0,value:p})}}function i(l,p){l instanceof String&&(l+="");var g=0,w=!1,L={next:function(){if(!w&&g<l.length){var F=g++;return{value:p(F,l[F]),done:!1}}return w=!0,{done:!0,value:void 0}}};return L[Symbol.iterator]=function(){return L},L}s("Array.prototype.values",function(l){return l||function(){return i(this,function(p,g){return g})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},a=this||self;function c(l){var p=typeof l;return p=p!="object"?p:l?Array.isArray(l)?"array":p:"null",p=="array"||p=="object"&&typeof l.length=="number"}function u(l){var p=typeof l;return p=="object"&&l!=null||p=="function"}function h(l,p,g){return l.call.apply(l.bind,arguments)}function f(l,p,g){if(!l)throw Error();if(2<arguments.length){var w=Array.prototype.slice.call(arguments,2);return function(){var L=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(L,w),l.apply(p,L)}}return function(){return l.apply(p,arguments)}}function d(l,p,g){return d=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?h:f,d.apply(null,arguments)}function m(l,p){var g=Array.prototype.slice.call(arguments,1);return function(){var w=g.slice();return w.push.apply(w,arguments),l.apply(this,w)}}function _(l,p){function g(){}g.prototype=p.prototype,l.aa=p.prototype,l.prototype=new g,l.prototype.constructor=l,l.Qb=function(w,L,F){for(var G=Array(arguments.length-2),Be=2;Be<arguments.length;Be++)G[Be-2]=arguments[Be];return p.prototype[L].apply(w,G)}}function y(l){const p=l.length;if(0<p){const g=Array(p);for(let w=0;w<p;w++)g[w]=l[w];return g}return[]}function I(l,p){for(let g=1;g<arguments.length;g++){const w=arguments[g];if(c(w)){const L=l.length||0,F=w.length||0;l.length=L+F;for(let G=0;G<F;G++)l[L+G]=w[G]}else l.push(w)}}class D{constructor(p,g){this.i=p,this.j=g,this.h=0,this.g=null}get(){let p;return 0<this.h?(this.h--,p=this.g,this.g=p.next,p.next=null):p=this.i(),p}}function P(l){return/^[\s\xa0]*$/.test(l)}function v(){var l=a.navigator;return l&&(l=l.userAgent)?l:""}function R(l){return R[" "](l),l}R[" "]=function(){};var x=v().indexOf("Gecko")!=-1&&!(v().toLowerCase().indexOf("webkit")!=-1&&v().indexOf("Edge")==-1)&&!(v().indexOf("Trident")!=-1||v().indexOf("MSIE")!=-1)&&v().indexOf("Edge")==-1;function M(l,p,g){for(const w in l)p.call(g,l[w],w,l)}function b(l,p){for(const g in l)p.call(void 0,l[g],g,l)}function E(l){const p={};for(const g in l)p[g]=l[g];return p}const T="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function A(l,p){let g,w;for(let L=1;L<arguments.length;L++){w=arguments[L];for(g in w)l[g]=w[g];for(let F=0;F<T.length;F++)g=T[F],Object.prototype.hasOwnProperty.call(w,g)&&(l[g]=w[g])}}function N(l){var p=1;l=l.split(":");const g=[];for(;0<p&&l.length;)g.push(l.shift()),p--;return l.length&&g.push(l.join(":")),g}function k(l){a.setTimeout(()=>{throw l},0)}function C(){var l=je;let p=null;return l.g&&(p=l.g,l.g=l.g.next,l.g||(l.h=null),p.next=null),p}class me{constructor(){this.h=this.g=null}add(p,g){const w=Ee.get();w.set(p,g),this.h?this.h.next=w:this.g=w,this.h=w}}var Ee=new D(()=>new se,l=>l.reset());class se{constructor(){this.next=this.g=this.h=null}set(p,g){this.h=p,this.g=g,this.next=null}reset(){this.next=this.g=this.h=null}}let fe,te=!1,je=new me,Sn=()=>{const l=a.Promise.resolve(void 0);fe=()=>{l.then(_n)}};var _n=()=>{for(var l;l=C();){try{l.h.call(l.g)}catch(g){k(g)}var p=Ee;p.j(l),100>p.h&&(p.h++,l.next=p.g,p.g=l)}te=!1};function Ze(){this.s=this.s,this.C=this.C}Ze.prototype.s=!1,Ze.prototype.ma=function(){this.s||(this.s=!0,this.N())},Ze.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function et(l,p){this.type=l,this.g=this.target=p,this.defaultPrevented=!1}et.prototype.h=function(){this.defaultPrevented=!0};var $r=function(){if(!a.addEventListener||!Object.defineProperty)return!1;var l=!1,p=Object.defineProperty({},"passive",{get:function(){l=!0}});try{const g=()=>{};a.addEventListener("test",g,p),a.removeEventListener("test",g,p)}catch{}return l}();function Wn(l,p){if(et.call(this,l?l.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,l){var g=this.type=l.type,w=l.changedTouches&&l.changedTouches.length?l.changedTouches[0]:null;if(this.target=l.target||l.srcElement,this.g=p,p=l.relatedTarget){if(x){e:{try{R(p.nodeName);var L=!0;break e}catch{}L=!1}L||(p=null)}}else g=="mouseover"?p=l.fromElement:g=="mouseout"&&(p=l.toElement);this.relatedTarget=p,w?(this.clientX=w.clientX!==void 0?w.clientX:w.pageX,this.clientY=w.clientY!==void 0?w.clientY:w.pageY,this.screenX=w.screenX||0,this.screenY=w.screenY||0):(this.clientX=l.clientX!==void 0?l.clientX:l.pageX,this.clientY=l.clientY!==void 0?l.clientY:l.pageY,this.screenX=l.screenX||0,this.screenY=l.screenY||0),this.button=l.button,this.key=l.key||"",this.ctrlKey=l.ctrlKey,this.altKey=l.altKey,this.shiftKey=l.shiftKey,this.metaKey=l.metaKey,this.pointerId=l.pointerId||0,this.pointerType=typeof l.pointerType=="string"?l.pointerType:en[l.pointerType]||"",this.state=l.state,this.i=l,l.defaultPrevented&&Wn.aa.h.call(this)}}_(Wn,et);var en={2:"touch",3:"pen",4:"mouse"};Wn.prototype.h=function(){Wn.aa.h.call(this);var l=this.i;l.preventDefault?l.preventDefault():l.returnValue=!1};var B="closure_listenable_"+(1e6*Math.random()|0),Z=0;function J(l,p,g,w,L){this.listener=l,this.proxy=null,this.src=p,this.type=g,this.capture=!!w,this.ha=L,this.key=++Z,this.da=this.fa=!1}function ie(l){l.da=!0,l.listener=null,l.proxy=null,l.src=null,l.ha=null}function we(l){this.src=l,this.g={},this.h=0}we.prototype.add=function(l,p,g,w,L){var F=l.toString();l=this.g[F],l||(l=this.g[F]=[],this.h++);var G=S(l,p,w,L);return-1<G?(p=l[G],g||(p.fa=!1)):(p=new J(p,this.src,F,!!w,L),p.fa=g,l.push(p)),p};function Ve(l,p){var g=p.type;if(g in l.g){var w=l.g[g],L=Array.prototype.indexOf.call(w,p,void 0),F;(F=0<=L)&&Array.prototype.splice.call(w,L,1),F&&(ie(p),l.g[g].length==0&&(delete l.g[g],l.h--))}}function S(l,p,g,w){for(var L=0;L<l.length;++L){var F=l[L];if(!F.da&&F.listener==p&&F.capture==!!g&&F.ha==w)return L}return-1}var O="closure_lm_"+(1e6*Math.random()|0),V={};function H(l,p,g,w,L){if(Array.isArray(p)){for(var F=0;F<p.length;F++)H(l,p[F],g,w,L);return null}return g=ae(g),l&&l[B]?l.K(p,g,u(w)?!!w.capture:!1,L):U(l,p,g,!1,w,L)}function U(l,p,g,w,L,F){if(!p)throw Error("Invalid event type");var G=u(L)?!!L.capture:!!L,Be=ce(l);if(Be||(l[O]=Be=new we(l)),g=Be.add(p,g,w,G,F),g.proxy)return g;if(w=q(),g.proxy=w,w.src=l,w.listener=g,l.addEventListener)$r||(L=G),L===void 0&&(L=!1),l.addEventListener(p.toString(),w,L);else if(l.attachEvent)l.attachEvent(K(p.toString()),w);else if(l.addListener&&l.removeListener)l.addListener(w);else throw Error("addEventListener and attachEvent are unavailable.");return g}function q(){function l(g){return p.call(l.src,l.listener,g)}const p=W;return l}function Q(l,p,g,w,L){if(Array.isArray(p))for(var F=0;F<p.length;F++)Q(l,p[F],g,w,L);else w=u(w)?!!w.capture:!!w,g=ae(g),l&&l[B]?(l=l.i,p=String(p).toString(),p in l.g&&(F=l.g[p],g=S(F,g,w,L),-1<g&&(ie(F[g]),Array.prototype.splice.call(F,g,1),F.length==0&&(delete l.g[p],l.h--)))):l&&(l=ce(l))&&(p=l.g[p.toString()],l=-1,p&&(l=S(p,g,w,L)),(g=-1<l?p[l]:null)&&z(g))}function z(l){if(typeof l!="number"&&l&&!l.da){var p=l.src;if(p&&p[B])Ve(p.i,l);else{var g=l.type,w=l.proxy;p.removeEventListener?p.removeEventListener(g,w,l.capture):p.detachEvent?p.detachEvent(K(g),w):p.addListener&&p.removeListener&&p.removeListener(w),(g=ce(p))?(Ve(g,l),g.h==0&&(g.src=null,p[O]=null)):ie(l)}}}function K(l){return l in V?V[l]:V[l]="on"+l}function W(l,p){if(l.da)l=!0;else{p=new Wn(p,this);var g=l.listener,w=l.ha||l.src;l.fa&&z(l),l=g.call(w,p)}return l}function ce(l){return l=l[O],l instanceof we?l:null}var Y="__closure_events_fn_"+(1e9*Math.random()>>>0);function ae(l){return typeof l=="function"?l:(l[Y]||(l[Y]=function(p){return l.handleEvent(p)}),l[Y])}function oe(){Ze.call(this),this.i=new we(this),this.M=this,this.F=null}_(oe,Ze),oe.prototype[B]=!0,oe.prototype.removeEventListener=function(l,p,g,w){Q(this,l,p,g,w)};function ue(l,p){var g,w=l.F;if(w)for(g=[];w;w=w.F)g.push(w);if(l=l.M,w=p.type||p,typeof p=="string")p=new et(p,l);else if(p instanceof et)p.target=p.target||l;else{var L=p;p=new et(w,l),A(p,L)}if(L=!0,g)for(var F=g.length-1;0<=F;F--){var G=p.g=g[F];L=Oe(G,w,!0,p)&&L}if(G=p.g=l,L=Oe(G,w,!0,p)&&L,L=Oe(G,w,!1,p)&&L,g)for(F=0;F<g.length;F++)G=p.g=g[F],L=Oe(G,w,!1,p)&&L}oe.prototype.N=function(){if(oe.aa.N.call(this),this.i){var l=this.i,p;for(p in l.g){for(var g=l.g[p],w=0;w<g.length;w++)ie(g[w]);delete l.g[p],l.h--}}this.F=null},oe.prototype.K=function(l,p,g,w){return this.i.add(String(l),p,!1,g,w)},oe.prototype.L=function(l,p,g,w){return this.i.add(String(l),p,!0,g,w)};function Oe(l,p,g,w){if(p=l.i.g[String(p)],!p)return!0;p=p.concat();for(var L=!0,F=0;F<p.length;++F){var G=p[F];if(G&&!G.da&&G.capture==g){var Be=G.listener,Ct=G.ha||G.src;G.fa&&Ve(l.i,G),L=Be.call(Ct,w)!==!1&&L}}return L&&!w.defaultPrevented}function Pe(l,p,g){if(typeof l=="function")g&&(l=d(l,g));else if(l&&typeof l.handleEvent=="function")l=d(l.handleEvent,l);else throw Error("Invalid listener argument");return 2147483647<Number(p)?-1:a.setTimeout(l,p||0)}function Ot(l){l.g=Pe(()=>{l.g=null,l.i&&(l.i=!1,Ot(l))},l.l);const p=l.h;l.h=null,l.m.apply(null,p)}class vt extends Ze{constructor(p,g){super(),this.m=p,this.l=g,this.h=null,this.i=!1,this.g=null}j(p){this.h=arguments,this.g?this.i=!0:Ot(this)}N(){super.N(),this.g&&(a.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Rt(l){Ze.call(this),this.h=l,this.g={}}_(Rt,Ze);var Dt=[];function jr(l){M(l.g,function(p,g){this.g.hasOwnProperty(g)&&z(p)},l),l.g={}}Rt.prototype.N=function(){Rt.aa.N.call(this),jr(this)},Rt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var wi=a.JSON.stringify,zt=a.JSON.parse,yn=class{stringify(l){return a.JSON.stringify(l,void 0)}parse(l){return a.JSON.parse(l,void 0)}};function bi(){}bi.prototype.h=null;function Og(l){return l.h||(l.h=l.i())}function Dg(){}var Uo={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function qh(){et.call(this,"d")}_(qh,et);function Wh(){et.call(this,"c")}_(Wh,et);var Os={},xg=null;function xc(){return xg=xg||new oe}Os.La="serverreachability";function Mg(l){et.call(this,Os.La,l)}_(Mg,et);function Bo(l){const p=xc();ue(p,new Mg(p))}Os.STAT_EVENT="statevent";function Lg(l,p){et.call(this,Os.STAT_EVENT,l),this.stat=p}_(Lg,et);function Gt(l){const p=xc();ue(p,new Lg(p,l))}Os.Ma="timingevent";function Vg(l,p){et.call(this,Os.Ma,l),this.size=p}_(Vg,et);function $o(l,p){if(typeof l!="function")throw Error("Fn must not be null and must be a function");return a.setTimeout(function(){l()},p)}function jo(){this.g=!0}jo.prototype.xa=function(){this.g=!1};function hC(l,p,g,w,L,F){l.info(function(){if(l.g)if(F)for(var G="",Be=F.split("&"),Ct=0;Ct<Be.length;Ct++){var Ne=Be[Ct].split("=");if(1<Ne.length){var xt=Ne[0];Ne=Ne[1];var Mt=xt.split("_");G=2<=Mt.length&&Mt[1]=="type"?G+(xt+"="+Ne+"&"):G+(xt+"=redacted&")}}else G=null;else G=F;return"XMLHTTP REQ ("+w+") [attempt "+L+"]: "+p+`
`+g+`
`+G})}function fC(l,p,g,w,L,F,G){l.info(function(){return"XMLHTTP RESP ("+w+") [ attempt "+L+"]: "+p+`
`+g+`
`+F+" "+G})}function Ii(l,p,g,w){l.info(function(){return"XMLHTTP TEXT ("+p+"): "+pC(l,g)+(w?" "+w:"")})}function dC(l,p){l.info(function(){return"TIMEOUT: "+p})}jo.prototype.info=function(){};function pC(l,p){if(!l.g)return p;if(!p)return null;try{var g=JSON.parse(p);if(g){for(l=0;l<g.length;l++)if(Array.isArray(g[l])){var w=g[l];if(!(2>w.length)){var L=w[1];if(Array.isArray(L)&&!(1>L.length)){var F=L[0];if(F!="noop"&&F!="stop"&&F!="close")for(var G=1;G<L.length;G++)L[G]=""}}}}return wi(g)}catch{return p}}var Mc={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Fg={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Kh;function Lc(){}_(Lc,bi),Lc.prototype.g=function(){return new XMLHttpRequest},Lc.prototype.i=function(){return{}},Kh=new Lc;function Hr(l,p,g,w){this.j=l,this.i=p,this.l=g,this.R=w||1,this.U=new Rt(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Ug}function Ug(){this.i=null,this.g="",this.h=!1}var Bg={},zh={};function Gh(l,p,g){l.L=1,l.v=Bc(hr(p)),l.m=g,l.P=!0,$g(l,null)}function $g(l,p){l.F=Date.now(),Vc(l),l.A=hr(l.v);var g=l.A,w=l.R;Array.isArray(w)||(w=[String(w)]),t_(g.i,"t",w),l.C=0,g=l.j.J,l.h=new Ug,l.g=v_(l.j,g?p:null,!l.m),0<l.O&&(l.M=new vt(d(l.Y,l,l.g),l.O)),p=l.U,g=l.g,w=l.ca;var L="readystatechange";Array.isArray(L)||(L&&(Dt[0]=L.toString()),L=Dt);for(var F=0;F<L.length;F++){var G=H(g,L[F],w||p.handleEvent,!1,p.h||p);if(!G)break;p.g[G.key]=G}p=l.H?E(l.H):{},l.m?(l.u||(l.u="POST"),p["Content-Type"]="application/x-www-form-urlencoded",l.g.ea(l.A,l.u,l.m,p)):(l.u="GET",l.g.ea(l.A,l.u,null,p)),Bo(),hC(l.i,l.u,l.A,l.l,l.R,l.m)}Hr.prototype.ca=function(l){l=l.target;const p=this.M;p&&fr(l)==3?p.j():this.Y(l)},Hr.prototype.Y=function(l){try{if(l==this.g)e:{const Mt=fr(this.g);var p=this.g.Ba();const Ci=this.g.Z();if(!(3>Mt)&&(Mt!=3||this.g&&(this.h.h||this.g.oa()||c_(this.g)))){this.J||Mt!=4||p==7||(p==8||0>=Ci?Bo(3):Bo(2)),Qh(this);var g=this.g.Z();this.X=g;t:if(jg(this)){var w=c_(this.g);l="";var L=w.length,F=fr(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Ds(this),Ho(this);var G="";break t}this.h.i=new a.TextDecoder}for(p=0;p<L;p++)this.h.h=!0,l+=this.h.i.decode(w[p],{stream:!(F&&p==L-1)});w.length=0,this.h.g+=l,this.C=0,G=this.h.g}else G=this.g.oa();if(this.o=g==200,fC(this.i,this.u,this.A,this.l,this.R,Mt,g),this.o){if(this.T&&!this.K){t:{if(this.g){var Be,Ct=this.g;if((Be=Ct.g?Ct.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!P(Be)){var Ne=Be;break t}}Ne=null}if(g=Ne)Ii(this.i,this.l,g,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Yh(this,g);else{this.o=!1,this.s=3,Gt(12),Ds(this),Ho(this);break e}}if(this.P){g=!0;let kn;for(;!this.J&&this.C<G.length;)if(kn=mC(this,G),kn==zh){Mt==4&&(this.s=4,Gt(14),g=!1),Ii(this.i,this.l,null,"[Incomplete Response]");break}else if(kn==Bg){this.s=4,Gt(15),Ii(this.i,this.l,G,"[Invalid Chunk]"),g=!1;break}else Ii(this.i,this.l,kn,null),Yh(this,kn);if(jg(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Mt!=4||G.length!=0||this.h.h||(this.s=1,Gt(16),g=!1),this.o=this.o&&g,!g)Ii(this.i,this.l,G,"[Invalid Chunked Response]"),Ds(this),Ho(this);else if(0<G.length&&!this.W){this.W=!0;var xt=this.j;xt.g==this&&xt.ba&&!xt.M&&(xt.j.info("Great, no buffering proxy detected. Bytes received: "+G.length),nf(xt),xt.M=!0,Gt(11))}}else Ii(this.i,this.l,G,null),Yh(this,G);Mt==4&&Ds(this),this.o&&!this.J&&(Mt==4?m_(this.j,this):(this.o=!1,Vc(this)))}else OC(this.g),g==400&&0<G.indexOf("Unknown SID")?(this.s=3,Gt(12)):(this.s=0,Gt(13)),Ds(this),Ho(this)}}}catch{}finally{}};function jg(l){return l.g?l.u=="GET"&&l.L!=2&&l.j.Ca:!1}function mC(l,p){var g=l.C,w=p.indexOf(`
`,g);return w==-1?zh:(g=Number(p.substring(g,w)),isNaN(g)?Bg:(w+=1,w+g>p.length?zh:(p=p.slice(w,w+g),l.C=w+g,p)))}Hr.prototype.cancel=function(){this.J=!0,Ds(this)};function Vc(l){l.S=Date.now()+l.I,Hg(l,l.I)}function Hg(l,p){if(l.B!=null)throw Error("WatchDog timer not null");l.B=$o(d(l.ba,l),p)}function Qh(l){l.B&&(a.clearTimeout(l.B),l.B=null)}Hr.prototype.ba=function(){this.B=null;const l=Date.now();0<=l-this.S?(dC(this.i,this.A),this.L!=2&&(Bo(),Gt(17)),Ds(this),this.s=2,Ho(this)):Hg(this,this.S-l)};function Ho(l){l.j.G==0||l.J||m_(l.j,l)}function Ds(l){Qh(l);var p=l.M;p&&typeof p.ma=="function"&&p.ma(),l.M=null,jr(l.U),l.g&&(p=l.g,l.g=null,p.abort(),p.ma())}function Yh(l,p){try{var g=l.j;if(g.G!=0&&(g.g==l||Xh(g.h,l))){if(!l.K&&Xh(g.h,l)&&g.G==3){try{var w=g.Da.g.parse(p)}catch{w=null}if(Array.isArray(w)&&w.length==3){var L=w;if(L[0]==0){e:if(!g.u){if(g.g)if(g.g.F+3e3<l.F)Kc(g),qc(g);else break e;tf(g),Gt(18)}}else g.za=L[1],0<g.za-g.T&&37500>L[2]&&g.F&&g.v==0&&!g.C&&(g.C=$o(d(g.Za,g),6e3));if(1>=Kg(g.h)&&g.ca){try{g.ca()}catch{}g.ca=void 0}}else Ms(g,11)}else if((l.K||g.g==l)&&Kc(g),!P(p))for(L=g.Da.g.parse(p),p=0;p<L.length;p++){let Ne=L[p];if(g.T=Ne[0],Ne=Ne[1],g.G==2)if(Ne[0]=="c"){g.K=Ne[1],g.ia=Ne[2];const xt=Ne[3];xt!=null&&(g.la=xt,g.j.info("VER="+g.la));const Mt=Ne[4];Mt!=null&&(g.Aa=Mt,g.j.info("SVER="+g.Aa));const Ci=Ne[5];Ci!=null&&typeof Ci=="number"&&0<Ci&&(w=1.5*Ci,g.L=w,g.j.info("backChannelRequestTimeoutMs_="+w)),w=g;const kn=l.g;if(kn){const Gc=kn.g?kn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Gc){var F=w.h;F.g||Gc.indexOf("spdy")==-1&&Gc.indexOf("quic")==-1&&Gc.indexOf("h2")==-1||(F.j=F.l,F.g=new Set,F.h&&(Jh(F,F.h),F.h=null))}if(w.D){const rf=kn.g?kn.g.getResponseHeader("X-HTTP-Session-Id"):null;rf&&(w.ya=rf,Ke(w.I,w.D,rf))}}g.G=3,g.l&&g.l.ua(),g.ba&&(g.R=Date.now()-l.F,g.j.info("Handshake RTT: "+g.R+"ms")),w=g;var G=l;if(w.qa=y_(w,w.J?w.ia:null,w.W),G.K){zg(w.h,G);var Be=G,Ct=w.L;Ct&&(Be.I=Ct),Be.B&&(Qh(Be),Vc(Be)),w.g=G}else d_(w);0<g.i.length&&Wc(g)}else Ne[0]!="stop"&&Ne[0]!="close"||Ms(g,7);else g.G==3&&(Ne[0]=="stop"||Ne[0]=="close"?Ne[0]=="stop"?Ms(g,7):ef(g):Ne[0]!="noop"&&g.l&&g.l.ta(Ne),g.v=0)}}Bo(4)}catch{}}var gC=class{constructor(l,p){this.g=l,this.map=p}};function qg(l){this.l=l||10,a.PerformanceNavigationTiming?(l=a.performance.getEntriesByType("navigation"),l=0<l.length&&(l[0].nextHopProtocol=="hq"||l[0].nextHopProtocol=="h2")):l=!!(a.chrome&&a.chrome.loadTimes&&a.chrome.loadTimes()&&a.chrome.loadTimes().wasFetchedViaSpdy),this.j=l?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Wg(l){return l.h?!0:l.g?l.g.size>=l.j:!1}function Kg(l){return l.h?1:l.g?l.g.size:0}function Xh(l,p){return l.h?l.h==p:l.g?l.g.has(p):!1}function Jh(l,p){l.g?l.g.add(p):l.h=p}function zg(l,p){l.h&&l.h==p?l.h=null:l.g&&l.g.has(p)&&l.g.delete(p)}qg.prototype.cancel=function(){if(this.i=Gg(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const l of this.g.values())l.cancel();this.g.clear()}};function Gg(l){if(l.h!=null)return l.i.concat(l.h.D);if(l.g!=null&&l.g.size!==0){let p=l.i;for(const g of l.g.values())p=p.concat(g.D);return p}return y(l.i)}function _C(l){if(l.V&&typeof l.V=="function")return l.V();if(typeof Map<"u"&&l instanceof Map||typeof Set<"u"&&l instanceof Set)return Array.from(l.values());if(typeof l=="string")return l.split("");if(c(l)){for(var p=[],g=l.length,w=0;w<g;w++)p.push(l[w]);return p}p=[],g=0;for(w in l)p[g++]=l[w];return p}function yC(l){if(l.na&&typeof l.na=="function")return l.na();if(!l.V||typeof l.V!="function"){if(typeof Map<"u"&&l instanceof Map)return Array.from(l.keys());if(!(typeof Set<"u"&&l instanceof Set)){if(c(l)||typeof l=="string"){var p=[];l=l.length;for(var g=0;g<l;g++)p.push(g);return p}p=[],g=0;for(const w in l)p[g++]=w;return p}}}function Qg(l,p){if(l.forEach&&typeof l.forEach=="function")l.forEach(p,void 0);else if(c(l)||typeof l=="string")Array.prototype.forEach.call(l,p,void 0);else for(var g=yC(l),w=_C(l),L=w.length,F=0;F<L;F++)p.call(void 0,w[F],g&&g[F],l)}var Yg=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function vC(l,p){if(l){l=l.split("&");for(var g=0;g<l.length;g++){var w=l[g].indexOf("="),L=null;if(0<=w){var F=l[g].substring(0,w);L=l[g].substring(w+1)}else F=l[g];p(F,L?decodeURIComponent(L.replace(/\+/g," ")):"")}}}function xs(l){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,l instanceof xs){this.h=l.h,Fc(this,l.j),this.o=l.o,this.g=l.g,Uc(this,l.s),this.l=l.l;var p=l.i,g=new Ko;g.i=p.i,p.g&&(g.g=new Map(p.g),g.h=p.h),Xg(this,g),this.m=l.m}else l&&(p=String(l).match(Yg))?(this.h=!1,Fc(this,p[1]||"",!0),this.o=qo(p[2]||""),this.g=qo(p[3]||"",!0),Uc(this,p[4]),this.l=qo(p[5]||"",!0),Xg(this,p[6]||"",!0),this.m=qo(p[7]||"")):(this.h=!1,this.i=new Ko(null,this.h))}xs.prototype.toString=function(){var l=[],p=this.j;p&&l.push(Wo(p,Jg,!0),":");var g=this.g;return(g||p=="file")&&(l.push("//"),(p=this.o)&&l.push(Wo(p,Jg,!0),"@"),l.push(encodeURIComponent(String(g)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),g=this.s,g!=null&&l.push(":",String(g))),(g=this.l)&&(this.g&&g.charAt(0)!="/"&&l.push("/"),l.push(Wo(g,g.charAt(0)=="/"?wC:TC,!0))),(g=this.i.toString())&&l.push("?",g),(g=this.m)&&l.push("#",Wo(g,IC)),l.join("")};function hr(l){return new xs(l)}function Fc(l,p,g){l.j=g?qo(p,!0):p,l.j&&(l.j=l.j.replace(/:$/,""))}function Uc(l,p){if(p){if(p=Number(p),isNaN(p)||0>p)throw Error("Bad port number "+p);l.s=p}else l.s=null}function Xg(l,p,g){p instanceof Ko?(l.i=p,AC(l.i,l.h)):(g||(p=Wo(p,bC)),l.i=new Ko(p,l.h))}function Ke(l,p,g){l.i.set(p,g)}function Bc(l){return Ke(l,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),l}function qo(l,p){return l?p?decodeURI(l.replace(/%25/g,"%2525")):decodeURIComponent(l):""}function Wo(l,p,g){return typeof l=="string"?(l=encodeURI(l).replace(p,EC),g&&(l=l.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),l):null}function EC(l){return l=l.charCodeAt(0),"%"+(l>>4&15).toString(16)+(l&15).toString(16)}var Jg=/[#\/\?@]/g,TC=/[#\?:]/g,wC=/[#\?]/g,bC=/[#\?@]/g,IC=/#/g;function Ko(l,p){this.h=this.g=null,this.i=l||null,this.j=!!p}function qr(l){l.g||(l.g=new Map,l.h=0,l.i&&vC(l.i,function(p,g){l.add(decodeURIComponent(p.replace(/\+/g," ")),g)}))}t=Ko.prototype,t.add=function(l,p){qr(this),this.i=null,l=Ai(this,l);var g=this.g.get(l);return g||this.g.set(l,g=[]),g.push(p),this.h+=1,this};function Zg(l,p){qr(l),p=Ai(l,p),l.g.has(p)&&(l.i=null,l.h-=l.g.get(p).length,l.g.delete(p))}function e_(l,p){return qr(l),p=Ai(l,p),l.g.has(p)}t.forEach=function(l,p){qr(this),this.g.forEach(function(g,w){g.forEach(function(L){l.call(p,L,w,this)},this)},this)},t.na=function(){qr(this);const l=Array.from(this.g.values()),p=Array.from(this.g.keys()),g=[];for(let w=0;w<p.length;w++){const L=l[w];for(let F=0;F<L.length;F++)g.push(p[w])}return g},t.V=function(l){qr(this);let p=[];if(typeof l=="string")e_(this,l)&&(p=p.concat(this.g.get(Ai(this,l))));else{l=Array.from(this.g.values());for(let g=0;g<l.length;g++)p=p.concat(l[g])}return p},t.set=function(l,p){return qr(this),this.i=null,l=Ai(this,l),e_(this,l)&&(this.h-=this.g.get(l).length),this.g.set(l,[p]),this.h+=1,this},t.get=function(l,p){return l?(l=this.V(l),0<l.length?String(l[0]):p):p};function t_(l,p,g){Zg(l,p),0<g.length&&(l.i=null,l.g.set(Ai(l,p),y(g)),l.h+=g.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const l=[],p=Array.from(this.g.keys());for(var g=0;g<p.length;g++){var w=p[g];const F=encodeURIComponent(String(w)),G=this.V(w);for(w=0;w<G.length;w++){var L=F;G[w]!==""&&(L+="="+encodeURIComponent(String(G[w]))),l.push(L)}}return this.i=l.join("&")};function Ai(l,p){return p=String(p),l.j&&(p=p.toLowerCase()),p}function AC(l,p){p&&!l.j&&(qr(l),l.i=null,l.g.forEach(function(g,w){var L=w.toLowerCase();w!=L&&(Zg(this,w),t_(this,L,g))},l)),l.j=p}function RC(l,p){const g=new jo;if(a.Image){const w=new Image;w.onload=m(Wr,g,"TestLoadImage: loaded",!0,p,w),w.onerror=m(Wr,g,"TestLoadImage: error",!1,p,w),w.onabort=m(Wr,g,"TestLoadImage: abort",!1,p,w),w.ontimeout=m(Wr,g,"TestLoadImage: timeout",!1,p,w),a.setTimeout(function(){w.ontimeout&&w.ontimeout()},1e4),w.src=l}else p(!1)}function CC(l,p){const g=new jo,w=new AbortController,L=setTimeout(()=>{w.abort(),Wr(g,"TestPingServer: timeout",!1,p)},1e4);fetch(l,{signal:w.signal}).then(F=>{clearTimeout(L),F.ok?Wr(g,"TestPingServer: ok",!0,p):Wr(g,"TestPingServer: server error",!1,p)}).catch(()=>{clearTimeout(L),Wr(g,"TestPingServer: error",!1,p)})}function Wr(l,p,g,w,L){try{L&&(L.onload=null,L.onerror=null,L.onabort=null,L.ontimeout=null),w(g)}catch{}}function SC(){this.g=new yn}function kC(l,p,g){const w=g||"";try{Qg(l,function(L,F){let G=L;u(L)&&(G=wi(L)),p.push(w+F+"="+encodeURIComponent(G))})}catch(L){throw p.push(w+"type="+encodeURIComponent("_badmap")),L}}function $c(l){this.l=l.Ub||null,this.j=l.eb||!1}_($c,bi),$c.prototype.g=function(){return new jc(this.l,this.j)},$c.prototype.i=function(l){return function(){return l}}({});function jc(l,p){oe.call(this),this.D=l,this.o=p,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}_(jc,oe),t=jc.prototype,t.open=function(l,p){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=l,this.A=p,this.readyState=1,Go(this)},t.send=function(l){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const p={headers:this.u,method:this.B,credentials:this.m,cache:void 0};l&&(p.body=l),(this.D||a).fetch(new Request(this.A,p)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,zo(this)),this.readyState=0},t.Sa=function(l){if(this.g&&(this.l=l,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=l.headers,this.readyState=2,Go(this)),this.g&&(this.readyState=3,Go(this),this.g)))if(this.responseType==="arraybuffer")l.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof a.ReadableStream<"u"&&"body"in l){if(this.j=l.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;n_(this)}else l.text().then(this.Ra.bind(this),this.ga.bind(this))};function n_(l){l.j.read().then(l.Pa.bind(l)).catch(l.ga.bind(l))}t.Pa=function(l){if(this.g){if(this.o&&l.value)this.response.push(l.value);else if(!this.o){var p=l.value?l.value:new Uint8Array(0);(p=this.v.decode(p,{stream:!l.done}))&&(this.response=this.responseText+=p)}l.done?zo(this):Go(this),this.readyState==3&&n_(this)}},t.Ra=function(l){this.g&&(this.response=this.responseText=l,zo(this))},t.Qa=function(l){this.g&&(this.response=l,zo(this))},t.ga=function(){this.g&&zo(this)};function zo(l){l.readyState=4,l.l=null,l.j=null,l.v=null,Go(l)}t.setRequestHeader=function(l,p){this.u.append(l,p)},t.getResponseHeader=function(l){return this.h&&this.h.get(l.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const l=[],p=this.h.entries();for(var g=p.next();!g.done;)g=g.value,l.push(g[0]+": "+g[1]),g=p.next();return l.join(`\r
`)};function Go(l){l.onreadystatechange&&l.onreadystatechange.call(l)}Object.defineProperty(jc.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(l){this.m=l?"include":"same-origin"}});function r_(l){let p="";return M(l,function(g,w){p+=w,p+=":",p+=g,p+=`\r
`}),p}function Zh(l,p,g){e:{for(w in g){var w=!1;break e}w=!0}w||(g=r_(g),typeof l=="string"?g!=null&&encodeURIComponent(String(g)):Ke(l,p,g))}function tt(l){oe.call(this),this.headers=new Map,this.o=l||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}_(tt,oe);var PC=/^https?$/i,NC=["POST","PUT"];t=tt.prototype,t.Ha=function(l){this.J=l},t.ea=function(l,p,g,w){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+l);p=p?p.toUpperCase():"GET",this.D=l,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Kh.g(),this.v=this.o?Og(this.o):Og(Kh),this.g.onreadystatechange=d(this.Ea,this);try{this.B=!0,this.g.open(p,String(l),!0),this.B=!1}catch(F){s_(this,F);return}if(l=g||"",g=new Map(this.headers),w)if(Object.getPrototypeOf(w)===Object.prototype)for(var L in w)g.set(L,w[L]);else if(typeof w.keys=="function"&&typeof w.get=="function")for(const F of w.keys())g.set(F,w.get(F));else throw Error("Unknown input type for opt_headers: "+String(w));w=Array.from(g.keys()).find(F=>F.toLowerCase()=="content-type"),L=a.FormData&&l instanceof a.FormData,!(0<=Array.prototype.indexOf.call(NC,p,void 0))||w||L||g.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[F,G]of g)this.g.setRequestHeader(F,G);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{a_(this),this.u=!0,this.g.send(l),this.u=!1}catch(F){s_(this,F)}};function s_(l,p){l.h=!1,l.g&&(l.j=!0,l.g.abort(),l.j=!1),l.l=p,l.m=5,i_(l),Hc(l)}function i_(l){l.A||(l.A=!0,ue(l,"complete"),ue(l,"error"))}t.abort=function(l){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=l||7,ue(this,"complete"),ue(this,"abort"),Hc(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Hc(this,!0)),tt.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?o_(this):this.bb())},t.bb=function(){o_(this)};function o_(l){if(l.h&&typeof o<"u"&&(!l.v[1]||fr(l)!=4||l.Z()!=2)){if(l.u&&fr(l)==4)Pe(l.Ea,0,l);else if(ue(l,"readystatechange"),fr(l)==4){l.h=!1;try{const G=l.Z();e:switch(G){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var p=!0;break e;default:p=!1}var g;if(!(g=p)){var w;if(w=G===0){var L=String(l.D).match(Yg)[1]||null;!L&&a.self&&a.self.location&&(L=a.self.location.protocol.slice(0,-1)),w=!PC.test(L?L.toLowerCase():"")}g=w}if(g)ue(l,"complete"),ue(l,"success");else{l.m=6;try{var F=2<fr(l)?l.g.statusText:""}catch{F=""}l.l=F+" ["+l.Z()+"]",i_(l)}}finally{Hc(l)}}}}function Hc(l,p){if(l.g){a_(l);const g=l.g,w=l.v[0]?()=>{}:null;l.g=null,l.v=null,p||ue(l,"ready");try{g.onreadystatechange=w}catch{}}}function a_(l){l.I&&(a.clearTimeout(l.I),l.I=null)}t.isActive=function(){return!!this.g};function fr(l){return l.g?l.g.readyState:0}t.Z=function(){try{return 2<fr(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(l){if(this.g){var p=this.g.responseText;return l&&p.indexOf(l)==0&&(p=p.substring(l.length)),zt(p)}};function c_(l){try{if(!l.g)return null;if("response"in l.g)return l.g.response;switch(l.H){case"":case"text":return l.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in l.g)return l.g.mozResponseArrayBuffer}return null}catch{return null}}function OC(l){const p={};l=(l.g&&2<=fr(l)&&l.g.getAllResponseHeaders()||"").split(`\r
`);for(let w=0;w<l.length;w++){if(P(l[w]))continue;var g=N(l[w]);const L=g[0];if(g=g[1],typeof g!="string")continue;g=g.trim();const F=p[L]||[];p[L]=F,F.push(g)}b(p,function(w){return w.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Qo(l,p,g){return g&&g.internalChannelParams&&g.internalChannelParams[l]||p}function l_(l){this.Aa=0,this.i=[],this.j=new jo,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Qo("failFast",!1,l),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Qo("baseRetryDelayMs",5e3,l),this.cb=Qo("retryDelaySeedMs",1e4,l),this.Wa=Qo("forwardChannelMaxRetries",2,l),this.wa=Qo("forwardChannelRequestTimeoutMs",2e4,l),this.pa=l&&l.xmlHttpFactory||void 0,this.Xa=l&&l.Tb||void 0,this.Ca=l&&l.useFetchStreams||!1,this.L=void 0,this.J=l&&l.supportsCrossDomainXhr||!1,this.K="",this.h=new qg(l&&l.concurrentRequestLimit),this.Da=new SC,this.P=l&&l.fastHandshake||!1,this.O=l&&l.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=l&&l.Rb||!1,l&&l.xa&&this.j.xa(),l&&l.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&l&&l.detectBufferingProxy||!1,this.ja=void 0,l&&l.longPollingTimeout&&0<l.longPollingTimeout&&(this.ja=l.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=l_.prototype,t.la=8,t.G=1,t.connect=function(l,p,g,w){Gt(0),this.W=l,this.H=p||{},g&&w!==void 0&&(this.H.OSID=g,this.H.OAID=w),this.F=this.X,this.I=y_(this,null,this.W),Wc(this)};function ef(l){if(u_(l),l.G==3){var p=l.U++,g=hr(l.I);if(Ke(g,"SID",l.K),Ke(g,"RID",p),Ke(g,"TYPE","terminate"),Yo(l,g),p=new Hr(l,l.j,p),p.L=2,p.v=Bc(hr(g)),g=!1,a.navigator&&a.navigator.sendBeacon)try{g=a.navigator.sendBeacon(p.v.toString(),"")}catch{}!g&&a.Image&&(new Image().src=p.v,g=!0),g||(p.g=v_(p.j,null),p.g.ea(p.v)),p.F=Date.now(),Vc(p)}__(l)}function qc(l){l.g&&(nf(l),l.g.cancel(),l.g=null)}function u_(l){qc(l),l.u&&(a.clearTimeout(l.u),l.u=null),Kc(l),l.h.cancel(),l.s&&(typeof l.s=="number"&&a.clearTimeout(l.s),l.s=null)}function Wc(l){if(!Wg(l.h)&&!l.s){l.s=!0;var p=l.Ga;fe||Sn(),te||(fe(),te=!0),je.add(p,l),l.B=0}}function DC(l,p){return Kg(l.h)>=l.h.j-(l.s?1:0)?!1:l.s?(l.i=p.D.concat(l.i),!0):l.G==1||l.G==2||l.B>=(l.Va?0:l.Wa)?!1:(l.s=$o(d(l.Ga,l,p),g_(l,l.B)),l.B++,!0)}t.Ga=function(l){if(this.s)if(this.s=null,this.G==1){if(!l){this.U=Math.floor(1e5*Math.random()),l=this.U++;const L=new Hr(this,this.j,l);let F=this.o;if(this.S&&(F?(F=E(F),A(F,this.S)):F=this.S),this.m!==null||this.O||(L.H=F,F=null),this.P)e:{for(var p=0,g=0;g<this.i.length;g++){t:{var w=this.i[g];if("__data__"in w.map&&(w=w.map.__data__,typeof w=="string")){w=w.length;break t}w=void 0}if(w===void 0)break;if(p+=w,4096<p){p=g;break e}if(p===4096||g===this.i.length-1){p=g+1;break e}}p=1e3}else p=1e3;p=f_(this,L,p),g=hr(this.I),Ke(g,"RID",l),Ke(g,"CVER",22),this.D&&Ke(g,"X-HTTP-Session-Id",this.D),Yo(this,g),F&&(this.O?p="headers="+encodeURIComponent(String(r_(F)))+"&"+p:this.m&&Zh(g,this.m,F)),Jh(this.h,L),this.Ua&&Ke(g,"TYPE","init"),this.P?(Ke(g,"$req",p),Ke(g,"SID","null"),L.T=!0,Gh(L,g,null)):Gh(L,g,p),this.G=2}}else this.G==3&&(l?h_(this,l):this.i.length==0||Wg(this.h)||h_(this))};function h_(l,p){var g;p?g=p.l:g=l.U++;const w=hr(l.I);Ke(w,"SID",l.K),Ke(w,"RID",g),Ke(w,"AID",l.T),Yo(l,w),l.m&&l.o&&Zh(w,l.m,l.o),g=new Hr(l,l.j,g,l.B+1),l.m===null&&(g.H=l.o),p&&(l.i=p.D.concat(l.i)),p=f_(l,g,1e3),g.I=Math.round(.5*l.wa)+Math.round(.5*l.wa*Math.random()),Jh(l.h,g),Gh(g,w,p)}function Yo(l,p){l.H&&M(l.H,function(g,w){Ke(p,w,g)}),l.l&&Qg({},function(g,w){Ke(p,w,g)})}function f_(l,p,g){g=Math.min(l.i.length,g);var w=l.l?d(l.l.Na,l.l,l):null;e:{var L=l.i;let F=-1;for(;;){const G=["count="+g];F==-1?0<g?(F=L[0].g,G.push("ofs="+F)):F=0:G.push("ofs="+F);let Be=!0;for(let Ct=0;Ct<g;Ct++){let Ne=L[Ct].g;const xt=L[Ct].map;if(Ne-=F,0>Ne)F=Math.max(0,L[Ct].g-100),Be=!1;else try{kC(xt,G,"req"+Ne+"_")}catch{w&&w(xt)}}if(Be){w=G.join("&");break e}}}return l=l.i.splice(0,g),p.D=l,w}function d_(l){if(!l.g&&!l.u){l.Y=1;var p=l.Fa;fe||Sn(),te||(fe(),te=!0),je.add(p,l),l.v=0}}function tf(l){return l.g||l.u||3<=l.v?!1:(l.Y++,l.u=$o(d(l.Fa,l),g_(l,l.v)),l.v++,!0)}t.Fa=function(){if(this.u=null,p_(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var l=2*this.R;this.j.info("BP detection timer enabled: "+l),this.A=$o(d(this.ab,this),l)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Gt(10),qc(this),p_(this))};function nf(l){l.A!=null&&(a.clearTimeout(l.A),l.A=null)}function p_(l){l.g=new Hr(l,l.j,"rpc",l.Y),l.m===null&&(l.g.H=l.o),l.g.O=0;var p=hr(l.qa);Ke(p,"RID","rpc"),Ke(p,"SID",l.K),Ke(p,"AID",l.T),Ke(p,"CI",l.F?"0":"1"),!l.F&&l.ja&&Ke(p,"TO",l.ja),Ke(p,"TYPE","xmlhttp"),Yo(l,p),l.m&&l.o&&Zh(p,l.m,l.o),l.L&&(l.g.I=l.L);var g=l.g;l=l.ia,g.L=1,g.v=Bc(hr(p)),g.m=null,g.P=!0,$g(g,l)}t.Za=function(){this.C!=null&&(this.C=null,qc(this),tf(this),Gt(19))};function Kc(l){l.C!=null&&(a.clearTimeout(l.C),l.C=null)}function m_(l,p){var g=null;if(l.g==p){Kc(l),nf(l),l.g=null;var w=2}else if(Xh(l.h,p))g=p.D,zg(l.h,p),w=1;else return;if(l.G!=0){if(p.o)if(w==1){g=p.m?p.m.length:0,p=Date.now()-p.F;var L=l.B;w=xc(),ue(w,new Vg(w,g)),Wc(l)}else d_(l);else if(L=p.s,L==3||L==0&&0<p.X||!(w==1&&DC(l,p)||w==2&&tf(l)))switch(g&&0<g.length&&(p=l.h,p.i=p.i.concat(g)),L){case 1:Ms(l,5);break;case 4:Ms(l,10);break;case 3:Ms(l,6);break;default:Ms(l,2)}}}function g_(l,p){let g=l.Ta+Math.floor(Math.random()*l.cb);return l.isActive()||(g*=2),g*p}function Ms(l,p){if(l.j.info("Error code "+p),p==2){var g=d(l.fb,l),w=l.Xa;const L=!w;w=new xs(w||"//www.google.com/images/cleardot.gif"),a.location&&a.location.protocol=="http"||Fc(w,"https"),Bc(w),L?RC(w.toString(),g):CC(w.toString(),g)}else Gt(2);l.G=0,l.l&&l.l.sa(p),__(l),u_(l)}t.fb=function(l){l?(this.j.info("Successfully pinged google.com"),Gt(2)):(this.j.info("Failed to ping google.com"),Gt(1))};function __(l){if(l.G=0,l.ka=[],l.l){const p=Gg(l.h);(p.length!=0||l.i.length!=0)&&(I(l.ka,p),I(l.ka,l.i),l.h.i.length=0,y(l.i),l.i.length=0),l.l.ra()}}function y_(l,p,g){var w=g instanceof xs?hr(g):new xs(g);if(w.g!="")p&&(w.g=p+"."+w.g),Uc(w,w.s);else{var L=a.location;w=L.protocol,p=p?p+"."+L.hostname:L.hostname,L=+L.port;var F=new xs(null);w&&Fc(F,w),p&&(F.g=p),L&&Uc(F,L),g&&(F.l=g),w=F}return g=l.D,p=l.ya,g&&p&&Ke(w,g,p),Ke(w,"VER",l.la),Yo(l,w),w}function v_(l,p,g){if(p&&!l.J)throw Error("Can't create secondary domain capable XhrIo object.");return p=l.Ca&&!l.pa?new tt(new $c({eb:g})):new tt(l.pa),p.Ha(l.J),p}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function E_(){}t=E_.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function zc(){}zc.prototype.g=function(l,p){return new hn(l,p)};function hn(l,p){oe.call(this),this.g=new l_(p),this.l=l,this.h=p&&p.messageUrlParams||null,l=p&&p.messageHeaders||null,p&&p.clientProtocolHeaderRequired&&(l?l["X-Client-Protocol"]="webchannel":l={"X-Client-Protocol":"webchannel"}),this.g.o=l,l=p&&p.initMessageHeaders||null,p&&p.messageContentType&&(l?l["X-WebChannel-Content-Type"]=p.messageContentType:l={"X-WebChannel-Content-Type":p.messageContentType}),p&&p.va&&(l?l["X-WebChannel-Client-Profile"]=p.va:l={"X-WebChannel-Client-Profile":p.va}),this.g.S=l,(l=p&&p.Sb)&&!P(l)&&(this.g.m=l),this.v=p&&p.supportsCrossDomainXhr||!1,this.u=p&&p.sendRawJson||!1,(p=p&&p.httpSessionIdParam)&&!P(p)&&(this.g.D=p,l=this.h,l!==null&&p in l&&(l=this.h,p in l&&delete l[p])),this.j=new Ri(this)}_(hn,oe),hn.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},hn.prototype.close=function(){ef(this.g)},hn.prototype.o=function(l){var p=this.g;if(typeof l=="string"){var g={};g.__data__=l,l=g}else this.u&&(g={},g.__data__=wi(l),l=g);p.i.push(new gC(p.Ya++,l)),p.G==3&&Wc(p)},hn.prototype.N=function(){this.g.l=null,delete this.j,ef(this.g),delete this.g,hn.aa.N.call(this)};function T_(l){qh.call(this),l.__headers__&&(this.headers=l.__headers__,this.statusCode=l.__status__,delete l.__headers__,delete l.__status__);var p=l.__sm__;if(p){e:{for(const g in p){l=g;break e}l=void 0}(this.i=l)&&(l=this.i,p=p!==null&&l in p?p[l]:void 0),this.data=p}else this.data=l}_(T_,qh);function w_(){Wh.call(this),this.status=1}_(w_,Wh);function Ri(l){this.g=l}_(Ri,E_),Ri.prototype.ua=function(){ue(this.g,"a")},Ri.prototype.ta=function(l){ue(this.g,new T_(l))},Ri.prototype.sa=function(l){ue(this.g,new w_)},Ri.prototype.ra=function(){ue(this.g,"b")},zc.prototype.createWebChannel=zc.prototype.g,hn.prototype.send=hn.prototype.o,hn.prototype.open=hn.prototype.m,hn.prototype.close=hn.prototype.close,Tb=function(){return new zc},Eb=function(){return xc()},vb=Os,xd={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Mc.NO_ERROR=0,Mc.TIMEOUT=8,Mc.HTTP_ERROR=6,Cl=Mc,Fg.COMPLETE="complete",yb=Fg,Dg.EventType=Uo,Uo.OPEN="a",Uo.CLOSE="b",Uo.ERROR="c",Uo.MESSAGE="d",oe.prototype.listen=oe.prototype.K,da=Dg,tt.prototype.listenOnce=tt.prototype.L,tt.prototype.getLastError=tt.prototype.Ka,tt.prototype.getLastErrorCode=tt.prototype.Ba,tt.prototype.getStatus=tt.prototype.Z,tt.prototype.getResponseJson=tt.prototype.Oa,tt.prototype.getResponseText=tt.prototype.oa,tt.prototype.send=tt.prototype.ea,tt.prototype.setWithCredentials=tt.prototype.Ha,_b=tt}).apply(typeof cl<"u"?cl:typeof self<"u"?self:typeof window<"u"?window:{});const sv="@firebase/firestore",iv="4.7.16";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ft{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ft.UNAUTHENTICATED=new Ft(null),Ft.GOOGLE_CREDENTIALS=new Ft("google-credentials-uid"),Ft.FIRST_PARTY=new Ft("first-party-uid"),Ft.MOCK_USER=new Ft("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let So="11.8.1";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ri=new yc("@firebase/firestore");function xi(){return ri.logLevel}function ee(t,...e){if(ri.logLevel<=ve.DEBUG){const n=e.map(om);ri.debug(`Firestore (${So}): ${t}`,...n)}}function Dr(t,...e){if(ri.logLevel<=ve.ERROR){const n=e.map(om);ri.error(`Firestore (${So}): ${t}`,...n)}}function lo(t,...e){if(ri.logLevel<=ve.WARN){const n=e.map(om);ri.warn(`Firestore (${So}): ${t}`,...n)}}function om(t){if(typeof t=="string")return t;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(n){return JSON.stringify(n)}(t)}catch{return t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function de(t,e,n){let r="Unexpected state";typeof e=="string"?r=e:n=e,wb(t,r,n)}function wb(t,e,n){let r=`FIRESTORE (${So}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{r+=" CONTEXT: "+JSON.stringify(n)}catch{r+=" CONTEXT: "+n}throw Dr(r),new Error(r)}function Le(t,e,n,r){let s="Unexpected state";typeof n=="string"?s=n:r=n,t||wb(e,s,r)}function ge(t,e){return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const j={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class ne extends lr{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class br{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bb{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class zx{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(Ft.UNAUTHENTICATED))}shutdown(){}}class Gx{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class Qx{constructor(e){this.t=e,this.currentUser=Ft.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){Le(this.o===void 0,42304);let r=this.i;const s=c=>this.i!==r?(r=this.i,n(c)):Promise.resolve();let i=new br;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new br,e.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const c=i;e.enqueueRetryable(async()=>{await c.promise,await s(this.currentUser)})},a=c=>{ee("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(c=>a(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?a(c):(ee("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new br)}},0),o()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(ee("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Le(typeof r.accessToken=="string",31837,{l:r}),new bb(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Le(e===null||typeof e=="string",2055,{h:e}),new Ft(e)}}class Yx{constructor(e,n,r){this.P=e,this.T=n,this.I=r,this.type="FirstParty",this.user=Ft.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class Xx{constructor(e,n,r){this.P=e,this.T=n,this.I=r}getToken(){return Promise.resolve(new Yx(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(Ft.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class ov{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Jx{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Zt(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){Le(this.o===void 0,3512);const r=i=>{i.error!=null&&ee("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.m;return this.m=i.token,ee("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?n(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{ee("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):ee("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new ov(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(Le(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new ov(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zx(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ib(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ab{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=Zx(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<n&&(r+=e.charAt(s[i]%62))}return r}}function ye(t,e){return t<e?-1:t>e?1:0}function Md(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=t.codePointAt(n),s=e.codePointAt(n);if(r!==s){if(r<128&&s<128)return ye(r,s);{const i=Ib(),o=eM(i.encode(av(t,n)),i.encode(av(e,n)));return o!==0?o:ye(r,s)}}n+=r>65535?2:1}return ye(t.length,e.length)}function av(t,e){return t.codePointAt(e)>65535?t.substring(e,e+2):t.substring(e,e+1)}function eM(t,e){for(let n=0;n<t.length&&n<e.length;++n)if(t[n]!==e[n])return ye(t[n],e[n]);return ye(t.length,e.length)}function uo(t,e,n){return t.length===e.length&&t.every((r,s)=>n(r,e[s]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cv=-62135596800,lv=1e6;class dt{static now(){return dt.fromMillis(Date.now())}static fromDate(e){return dt.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor((e-1e3*n)*lv);return new dt(n,r)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new ne(j.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new ne(j.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<cv)throw new ne(j.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new ne(j.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/lv}_compareTo(e){return this.seconds===e.seconds?ye(this.nanoseconds,e.nanoseconds):ye(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds-cv;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pe{static fromTimestamp(e){return new pe(e)}static min(){return new pe(new dt(0,0))}static max(){return new pe(new dt(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uv="__name__";class Xn{constructor(e,n,r){n===void 0?n=0:n>e.length&&de(637,{offset:n,range:e.length}),r===void 0?r=e.length-n:r>e.length-n&&de(1746,{length:r,range:e.length-n}),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return Xn.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof Xn?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let s=0;s<r;s++){const i=Xn.compareSegments(e.get(s),n.get(s));if(i!==0)return i}return ye(e.length,n.length)}static compareSegments(e,n){const r=Xn.isNumericId(e),s=Xn.isNumericId(n);return r&&!s?-1:!r&&s?1:r&&s?Xn.extractNumericId(e).compare(Xn.extractNumericId(n)):Md(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return ds.fromString(e.substring(4,e.length-2))}}class Qe extends Xn{construct(e,n,r){return new Qe(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new ne(j.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(s=>s.length>0))}return new Qe(n)}static emptyPath(){return new Qe([])}}const tM=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Pt extends Xn{construct(e,n,r){return new Pt(e,n,r)}static isValidIdentifier(e){return tM.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Pt.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===uv}static keyField(){return new Pt([uv])}static fromServerFormat(e){const n=[];let r="",s=0;const i=()=>{if(r.length===0)throw new ne(j.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let o=!1;for(;s<e.length;){const a=e[s];if(a==="\\"){if(s+1===e.length)throw new ne(j.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new ne(j.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,s+=2}else a==="`"?(o=!o,s++):a!=="."||o?(r+=a,s++):(i(),s++)}if(i(),o)throw new ne(j.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Pt(n)}static emptyPath(){return new Pt([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class le{constructor(e){this.path=e}static fromPath(e){return new le(Qe.fromString(e))}static fromName(e){return new le(Qe.fromString(e).popFirst(5))}static empty(){return new le(Qe.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Qe.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return Qe.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new le(new Qe(e.slice()))}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tc=-1;function nM(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,s=pe.fromTimestamp(r===1e9?new dt(n+1,0):new dt(n,r));return new Ts(s,le.empty(),e)}function rM(t){return new Ts(t.readTime,t.key,tc)}class Ts{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new Ts(pe.min(),le.empty(),tc)}static max(){return new Ts(pe.max(),le.empty(),tc)}}function sM(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=le.comparator(t.documentKey,e.documentKey),n!==0?n:ye(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iM="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class oM{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ko(t){if(t.code!==j.FAILED_PRECONDITION||t.message!==iM)throw t;ee("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ${constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&de(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new $((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(n,i).next(r,s)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof $?n:$.resolve(n)}catch(n){return $.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):$.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):$.reject(n)}static resolve(e){return new $((n,r)=>{n(e)})}static reject(e){return new $((n,r)=>{r(e)})}static waitFor(e){return new $((n,r)=>{let s=0,i=0,o=!1;e.forEach(a=>{++s,a.next(()=>{++i,o&&i===s&&n()},c=>r(c))}),o=!0,i===s&&n()})}static or(e){let n=$.resolve(!1);for(const r of e)n=n.next(s=>s?$.resolve(s):r());return n}static forEach(e,n){const r=[];return e.forEach((s,i)=>{r.push(n.call(this,s,i))}),this.waitFor(r)}static mapArray(e,n){return new $((r,s)=>{const i=e.length,o=new Array(i);let a=0;for(let c=0;c<i;c++){const u=c;n(e[u]).next(h=>{o[u]=h,++a,a===i&&r(o)},h=>s(h))}})}static doWhile(e,n){return new $((r,s)=>{const i=()=>{e()===!0?n().next(()=>{i()},s):r()};i()})}}function aM(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function Po(t){return t.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dh{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this.ue(r),this.ce=r=>n.writeSequenceNumber(r))}ue(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ce&&this.ce(e),e}}dh.le=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const am=-1;function ph(t){return t==null}function hu(t){return t===0&&1/t==-1/0}function cM(t){return typeof t=="number"&&Number.isInteger(t)&&!hu(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rb="";function lM(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=hv(e)),e=uM(t.get(n),e);return hv(e)}function uM(t,e){let n=e;const r=t.length;for(let s=0;s<r;s++){const i=t.charAt(s);switch(i){case"\0":n+="";break;case Rb:n+="";break;default:n+=i}}return n}function hv(t){return t+Rb+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fv(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Ss(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function Cb(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let pt=class Ld{constructor(e,n){this.comparator=e,this.root=n||ps.EMPTY}insert(e,n){return new Ld(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,ps.BLACK,null,null))}remove(e){return new Ld(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ps.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return n+r.left.size;s<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new ll(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new ll(this.root,e,this.comparator,!1)}getReverseIterator(){return new ll(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new ll(this.root,e,this.comparator,!0)}},ll=class{constructor(e,n,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=n?r(e.key,n):1,n&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},ps=class gr{constructor(e,n,r,s,i){this.key=e,this.value=n,this.color=r??gr.RED,this.left=s??gr.EMPTY,this.right=i??gr.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,s,i){return new gr(e??this.key,n??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,n,r),null):i===0?s.copy(null,n,null,null,null):s.copy(null,null,null,null,s.right.insert(e,n,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return gr.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,s=this;if(n(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,n),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),n(e,s.key)===0){if(s.right.isEmpty())return gr.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,n))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,gr.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,gr.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw de(43730,{key:this.key,value:this.value});if(this.right.isRed())throw de(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw de(27949);return e+(this.isRed()?0:1)}};ps.EMPTY=null,ps.RED=!0,ps.BLACK=!1;ps.EMPTY=new class{constructor(){this.size=0}get key(){throw de(57766)}get value(){throw de(16141)}get color(){throw de(16727)}get left(){throw de(29726)}get right(){throw de(36894)}copy(e,n,r,s,i){return this}insert(e,n,r){return new ps(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yt{constructor(e){this.comparator=e,this.data=new pt(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;n(s.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new dv(this.data.getIterator())}getIteratorFrom(e){return new dv(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof yt)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new yt(this.comparator);return n.data=e,n}}class dv{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fn{constructor(e){this.fields=e,e.sort(Pt.comparator)}static empty(){return new fn([])}unionWith(e){let n=new yt(Pt.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new fn(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return uo(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sb extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Sb("Invalid base64 string: "+i):i}}(e);return new Nt(n)}static fromUint8Array(e){const n=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(e);return new Nt(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let s=0;s<n.length;s++)r[s]=n.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return ye(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Nt.EMPTY_BYTE_STRING=new Nt("");const hM=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function ws(t){if(Le(!!t,39018),typeof t=="string"){let e=0;const n=hM.exec(t);if(Le(!!n,46558,{timestamp:t}),n[1]){let s=n[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ot(t.seconds),nanos:ot(t.nanos)}}function ot(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function bs(t){return typeof t=="string"?Nt.fromBase64String(t):Nt.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kb="server_timestamp",Pb="__type__",Nb="__previous_value__",Ob="__local_write_time__";function cm(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{})[Pb])===null||n===void 0?void 0:n.stringValue)===kb}function mh(t){const e=t.mapValue.fields[Nb];return cm(e)?mh(e):e}function nc(t){const e=ws(t.mapValue.fields[Ob].timestampValue);return new dt(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fM{constructor(e,n,r,s,i,o,a,c,u,h){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=a,this.longPollingOptions=c,this.useFetchStreams=u,this.isUsingEmulator=h}}const fu="(default)";class rc{constructor(e,n){this.projectId=e,this.database=n||fu}static empty(){return new rc("","")}get isDefaultDatabase(){return this.database===fu}isEqual(e){return e instanceof rc&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Db="__type__",dM="__max__",ul={mapValue:{}},xb="__vector__",du="value";function Is(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?cm(t)?4:mM(t)?9007199254740991:pM(t)?10:11:de(28295,{value:t})}function or(t,e){if(t===e)return!0;const n=Is(t);if(n!==Is(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return nc(t).isEqual(nc(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const o=ws(s.timestampValue),a=ws(i.timestampValue);return o.seconds===a.seconds&&o.nanos===a.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(s,i){return bs(s.bytesValue).isEqual(bs(i.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(s,i){return ot(s.geoPointValue.latitude)===ot(i.geoPointValue.latitude)&&ot(s.geoPointValue.longitude)===ot(i.geoPointValue.longitude)}(t,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return ot(s.integerValue)===ot(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const o=ot(s.doubleValue),a=ot(i.doubleValue);return o===a?hu(o)===hu(a):isNaN(o)&&isNaN(a)}return!1}(t,e);case 9:return uo(t.arrayValue.values||[],e.arrayValue.values||[],or);case 10:case 11:return function(s,i){const o=s.mapValue.fields||{},a=i.mapValue.fields||{};if(fv(o)!==fv(a))return!1;for(const c in o)if(o.hasOwnProperty(c)&&(a[c]===void 0||!or(o[c],a[c])))return!1;return!0}(t,e);default:return de(52216,{left:t})}}function sc(t,e){return(t.values||[]).find(n=>or(n,e))!==void 0}function ho(t,e){if(t===e)return 0;const n=Is(t),r=Is(e);if(n!==r)return ye(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return ye(t.booleanValue,e.booleanValue);case 2:return function(i,o){const a=ot(i.integerValue||i.doubleValue),c=ot(o.integerValue||o.doubleValue);return a<c?-1:a>c?1:a===c?0:isNaN(a)?isNaN(c)?0:-1:1}(t,e);case 3:return pv(t.timestampValue,e.timestampValue);case 4:return pv(nc(t),nc(e));case 5:return Md(t.stringValue,e.stringValue);case 6:return function(i,o){const a=bs(i),c=bs(o);return a.compareTo(c)}(t.bytesValue,e.bytesValue);case 7:return function(i,o){const a=i.split("/"),c=o.split("/");for(let u=0;u<a.length&&u<c.length;u++){const h=ye(a[u],c[u]);if(h!==0)return h}return ye(a.length,c.length)}(t.referenceValue,e.referenceValue);case 8:return function(i,o){const a=ye(ot(i.latitude),ot(o.latitude));return a!==0?a:ye(ot(i.longitude),ot(o.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return mv(t.arrayValue,e.arrayValue);case 10:return function(i,o){var a,c,u,h;const f=i.fields||{},d=o.fields||{},m=(a=f[du])===null||a===void 0?void 0:a.arrayValue,_=(c=d[du])===null||c===void 0?void 0:c.arrayValue,y=ye(((u=m==null?void 0:m.values)===null||u===void 0?void 0:u.length)||0,((h=_==null?void 0:_.values)===null||h===void 0?void 0:h.length)||0);return y!==0?y:mv(m,_)}(t.mapValue,e.mapValue);case 11:return function(i,o){if(i===ul.mapValue&&o===ul.mapValue)return 0;if(i===ul.mapValue)return 1;if(o===ul.mapValue)return-1;const a=i.fields||{},c=Object.keys(a),u=o.fields||{},h=Object.keys(u);c.sort(),h.sort();for(let f=0;f<c.length&&f<h.length;++f){const d=Md(c[f],h[f]);if(d!==0)return d;const m=ho(a[c[f]],u[h[f]]);if(m!==0)return m}return ye(c.length,h.length)}(t.mapValue,e.mapValue);default:throw de(23264,{Pe:n})}}function pv(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return ye(t,e);const n=ws(t),r=ws(e),s=ye(n.seconds,r.seconds);return s!==0?s:ye(n.nanos,r.nanos)}function mv(t,e){const n=t.values||[],r=e.values||[];for(let s=0;s<n.length&&s<r.length;++s){const i=ho(n[s],r[s]);if(i)return i}return ye(n.length,r.length)}function fo(t){return Vd(t)}function Vd(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=ws(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return bs(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return le.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",s=!0;for(const i of n.values||[])s?s=!1:r+=",",r+=Vd(i);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${Vd(n.fields[o])}`;return s+"}"}(t.mapValue):de(61005,{value:t})}function Sl(t){switch(Is(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=mh(t);return e?16+Sl(e):16;case 5:return 2*t.stringValue.length;case 6:return bs(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((s,i)=>s+Sl(i),0)}(t.arrayValue);case 10:case 11:return function(r){let s=0;return Ss(r.fields,(i,o)=>{s+=i.length+Sl(o)}),s}(t.mapValue);default:throw de(13486,{value:t})}}function gv(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function Fd(t){return!!t&&"integerValue"in t}function lm(t){return!!t&&"arrayValue"in t}function _v(t){return!!t&&"nullValue"in t}function yv(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function kl(t){return!!t&&"mapValue"in t}function pM(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{})[Db])===null||n===void 0?void 0:n.stringValue)===xb}function Sa(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return Ss(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=Sa(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Sa(t.arrayValue.values[n]);return e}return Object.assign({},t)}function mM(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===dM}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class on{constructor(e){this.value=e}static empty(){return new on({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!kl(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Sa(n)}setAll(e){let n=Pt.emptyPath(),r={},s=[];e.forEach((o,a)=>{if(!n.isImmediateParentOf(a)){const c=this.getFieldsMap(n);this.applyChanges(c,r,s),r={},s=[],n=a.popLast()}o?r[a.lastSegment()]=Sa(o):s.push(a.lastSegment())});const i=this.getFieldsMap(n);this.applyChanges(i,r,s)}delete(e){const n=this.field(e.popLast());kl(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return or(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=n.mapValue.fields[e.get(r)];kl(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=s),n=s}return n.mapValue.fields}applyChanges(e,n,r){Ss(n,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new on(Sa(this.value))}}function Mb(t){const e=[];return Ss(t.fields,(n,r)=>{const s=new Pt([n]);if(kl(r)){const i=Mb(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)}),new fn(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bt{constructor(e,n,r,s,i,o,a){this.key=e,this.documentType=n,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=a}static newInvalidDocument(e){return new Bt(e,0,pe.min(),pe.min(),pe.min(),on.empty(),0)}static newFoundDocument(e,n,r,s){return new Bt(e,1,n,pe.min(),r,s,0)}static newNoDocument(e,n){return new Bt(e,2,n,pe.min(),pe.min(),on.empty(),0)}static newUnknownDocument(e,n){return new Bt(e,3,n,pe.min(),pe.min(),on.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(pe.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=on.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=on.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=pe.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Bt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Bt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pu{constructor(e,n){this.position=e,this.inclusive=n}}function vv(t,e,n){let r=0;for(let s=0;s<t.position.length;s++){const i=e[s],o=t.position[s];if(i.field.isKeyField()?r=le.comparator(le.fromName(o.referenceValue),n.key):r=ho(o,n.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function Ev(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!or(t.position[n],e.position[n]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mu{constructor(e,n="asc"){this.field=e,this.dir=n}}function gM(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lb{}class ht extends Lb{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new yM(e,n,r):n==="array-contains"?new TM(e,r):n==="in"?new wM(e,r):n==="not-in"?new bM(e,r):n==="array-contains-any"?new IM(e,r):new ht(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new vM(e,r):new EM(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(ho(n,this.value)):n!==null&&Is(this.value)===Is(n)&&this.matchesComparison(ho(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return de(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Hn extends Lb{constructor(e,n){super(),this.filters=e,this.op=n,this.Te=null}static create(e,n){return new Hn(e,n)}matches(e){return Vb(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.Te!==null||(this.Te=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.Te}getFilters(){return Object.assign([],this.filters)}}function Vb(t){return t.op==="and"}function Fb(t){return _M(t)&&Vb(t)}function _M(t){for(const e of t.filters)if(e instanceof Hn)return!1;return!0}function Ud(t){if(t instanceof ht)return t.field.canonicalString()+t.op.toString()+fo(t.value);if(Fb(t))return t.filters.map(e=>Ud(e)).join(",");{const e=t.filters.map(n=>Ud(n)).join(",");return`${t.op}(${e})`}}function Ub(t,e){return t instanceof ht?function(r,s){return s instanceof ht&&r.op===s.op&&r.field.isEqual(s.field)&&or(r.value,s.value)}(t,e):t instanceof Hn?function(r,s){return s instanceof Hn&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,o,a)=>i&&Ub(o,s.filters[a]),!0):!1}(t,e):void de(19439)}function Bb(t){return t instanceof ht?function(n){return`${n.field.canonicalString()} ${n.op} ${fo(n.value)}`}(t):t instanceof Hn?function(n){return n.op.toString()+" {"+n.getFilters().map(Bb).join(" ,")+"}"}(t):"Filter"}class yM extends ht{constructor(e,n,r){super(e,n,r),this.key=le.fromName(r.referenceValue)}matches(e){const n=le.comparator(e.key,this.key);return this.matchesComparison(n)}}class vM extends ht{constructor(e,n){super(e,"in",n),this.keys=$b("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class EM extends ht{constructor(e,n){super(e,"not-in",n),this.keys=$b("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function $b(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(r=>le.fromName(r.referenceValue))}class TM extends ht{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return lm(n)&&sc(n.arrayValue,this.value)}}class wM extends ht{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&sc(this.value.arrayValue,n)}}class bM extends ht{constructor(e,n){super(e,"not-in",n)}matches(e){if(sc(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!sc(this.value.arrayValue,n)}}class IM extends ht{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!lm(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>sc(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AM{constructor(e,n=null,r=[],s=[],i=null,o=null,a=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=a,this.Ie=null}}function Tv(t,e=null,n=[],r=[],s=null,i=null,o=null){return new AM(t,e,n,r,s,i,o)}function um(t){const e=ge(t);if(e.Ie===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>Ud(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),ph(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>fo(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>fo(r)).join(",")),e.Ie=n}return e.Ie}function hm(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!gM(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!Ub(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!Ev(t.startAt,e.startAt)&&Ev(t.endAt,e.endAt)}function Bd(t){return le.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vc{constructor(e,n=null,r=[],s=[],i=null,o="F",a=null,c=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=a,this.endAt=c,this.Ee=null,this.de=null,this.Ae=null,this.startAt,this.endAt}}function RM(t,e,n,r,s,i,o,a){return new vc(t,e,n,r,s,i,o,a)}function gh(t){return new vc(t)}function wv(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function jb(t){return t.collectionGroup!==null}function ka(t){const e=ge(t);if(e.Ee===null){e.Ee=[];const n=new Set;for(const i of e.explicitOrderBy)e.Ee.push(i),n.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let a=new yt(Pt.comparator);return o.filters.forEach(c=>{c.getFlattenedFilters().forEach(u=>{u.isInequality()&&(a=a.add(u.field))})}),a})(e).forEach(i=>{n.has(i.canonicalString())||i.isKeyField()||e.Ee.push(new mu(i,r))}),n.has(Pt.keyField().canonicalString())||e.Ee.push(new mu(Pt.keyField(),r))}return e.Ee}function rr(t){const e=ge(t);return e.de||(e.de=CM(e,ka(t))),e.de}function CM(t,e){if(t.limitType==="F")return Tv(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new mu(s.field,i)});const n=t.endAt?new pu(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new pu(t.startAt.position,t.startAt.inclusive):null;return Tv(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function $d(t,e){const n=t.filters.concat([e]);return new vc(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function jd(t,e,n){return new vc(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function _h(t,e){return hm(rr(t),rr(e))&&t.limitType===e.limitType}function Hb(t){return`${um(rr(t))}|lt:${t.limitType}`}function Mi(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(s=>Bb(s)).join(", ")}]`),ph(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(s=>fo(s)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(s=>fo(s)).join(",")),`Target(${r})`}(rr(t))}; limitType=${t.limitType})`}function yh(t,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):le.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(t,e)&&function(r,s){for(const i of ka(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(t,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(t,e)&&function(r,s){return!(r.startAt&&!function(o,a,c){const u=vv(o,a,c);return o.inclusive?u<=0:u<0}(r.startAt,ka(r),s)||r.endAt&&!function(o,a,c){const u=vv(o,a,c);return o.inclusive?u>=0:u>0}(r.endAt,ka(r),s))}(t,e)}function SM(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function qb(t){return(e,n)=>{let r=!1;for(const s of ka(t)){const i=kM(s,e,n);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function kM(t,e,n){const r=t.field.isKeyField()?le.comparator(e.key,n.key):function(i,o,a){const c=o.data.field(i),u=a.data.field(i);return c!==null&&u!==null?ho(c,u):de(42886)}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return de(19790,{direction:t.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gi{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,n]);s.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[n]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Ss(this.inner,(n,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return Cb(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PM=new pt(le.comparator);function xr(){return PM}const Wb=new pt(le.comparator);function pa(...t){let e=Wb;for(const n of t)e=e.insert(n.key,n);return e}function Kb(t){let e=Wb;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function Hs(){return Pa()}function zb(){return Pa()}function Pa(){return new gi(t=>t.toString(),(t,e)=>t.isEqual(e))}const NM=new pt(le.comparator),OM=new yt(le.comparator);function Te(...t){let e=OM;for(const n of t)e=e.add(n);return e}const DM=new yt(ye);function xM(){return DM}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fm(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:hu(e)?"-0":e}}function Gb(t){return{integerValue:""+t}}function MM(t,e){return cM(e)?Gb(e):fm(t,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vh{constructor(){this._=void 0}}function LM(t,e,n){return t instanceof ic?function(s,i){const o={fields:{[Pb]:{stringValue:kb},[Ob]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&cm(i)&&(i=mh(i)),i&&(o.fields[Nb]=i),{mapValue:o}}(n,e):t instanceof po?Yb(t,e):t instanceof oc?Xb(t,e):function(s,i){const o=Qb(s,i),a=bv(o)+bv(s.Re);return Fd(o)&&Fd(s.Re)?Gb(a):fm(s.serializer,a)}(t,e)}function VM(t,e,n){return t instanceof po?Yb(t,e):t instanceof oc?Xb(t,e):n}function Qb(t,e){return t instanceof gu?function(r){return Fd(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class ic extends vh{}class po extends vh{constructor(e){super(),this.elements=e}}function Yb(t,e){const n=Jb(e);for(const r of t.elements)n.some(s=>or(s,r))||n.push(r);return{arrayValue:{values:n}}}class oc extends vh{constructor(e){super(),this.elements=e}}function Xb(t,e){let n=Jb(e);for(const r of t.elements)n=n.filter(s=>!or(s,r));return{arrayValue:{values:n}}}class gu extends vh{constructor(e,n){super(),this.serializer=e,this.Re=n}}function bv(t){return ot(t.integerValue||t.doubleValue)}function Jb(t){return lm(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zb{constructor(e,n){this.field=e,this.transform=n}}function FM(t,e){return t.field.isEqual(e.field)&&function(r,s){return r instanceof po&&s instanceof po||r instanceof oc&&s instanceof oc?uo(r.elements,s.elements,or):r instanceof gu&&s instanceof gu?or(r.Re,s.Re):r instanceof ic&&s instanceof ic}(t.transform,e.transform)}class UM{constructor(e,n){this.version=e,this.transformResults=n}}class Rn{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new Rn}static exists(e){return new Rn(void 0,e)}static updateTime(e){return new Rn(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Pl(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class Eh{}function eI(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new dm(t.key,Rn.none()):new Ec(t.key,t.data,Rn.none());{const n=t.data,r=on.empty();let s=new yt(Pt.comparator);for(let i of e.fields)if(!s.has(i)){let o=n.field(i);o===null&&i.length>1&&(i=i.popLast(),o=n.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new ks(t.key,r,new fn(s.toArray()),Rn.none())}}function BM(t,e,n){t instanceof Ec?function(s,i,o){const a=s.value.clone(),c=Av(s.fieldTransforms,i,o.transformResults);a.setAll(c),i.convertToFoundDocument(o.version,a).setHasCommittedMutations()}(t,e,n):t instanceof ks?function(s,i,o){if(!Pl(s.precondition,i))return void i.convertToUnknownDocument(o.version);const a=Av(s.fieldTransforms,i,o.transformResults),c=i.data;c.setAll(tI(s)),c.setAll(a),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(t,e,n):function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,n)}function Na(t,e,n,r){return t instanceof Ec?function(i,o,a,c){if(!Pl(i.precondition,o))return a;const u=i.value.clone(),h=Rv(i.fieldTransforms,c,o);return u.setAll(h),o.convertToFoundDocument(o.version,u).setHasLocalMutations(),null}(t,e,n,r):t instanceof ks?function(i,o,a,c){if(!Pl(i.precondition,o))return a;const u=Rv(i.fieldTransforms,c,o),h=o.data;return h.setAll(tI(i)),h.setAll(u),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),a===null?null:a.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(f=>f.field))}(t,e,n,r):function(i,o,a){return Pl(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):a}(t,e,n)}function $M(t,e){let n=null;for(const r of t.fieldTransforms){const s=e.data.field(r.field),i=Qb(r.transform,s||null);i!=null&&(n===null&&(n=on.empty()),n.set(r.field,i))}return n||null}function Iv(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&uo(r,s,(i,o)=>FM(i,o))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class Ec extends Eh{constructor(e,n,r,s=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class ks extends Eh{constructor(e,n,r,s,i=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function tI(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function Av(t,e,n){const r=new Map;Le(t.length===n.length,32656,{Ve:n.length,me:t.length});for(let s=0;s<n.length;s++){const i=t[s],o=i.transform,a=e.data.field(i.field);r.set(i.field,VM(o,a,n[s]))}return r}function Rv(t,e,n){const r=new Map;for(const s of t){const i=s.transform,o=n.data.field(s.field);r.set(s.field,LM(i,o,e))}return r}class dm extends Eh{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class jM extends Eh{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HM{constructor(e,n,r,s){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&BM(i,e,r[s])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=Na(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=Na(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=zb();return this.mutations.forEach(s=>{const i=e.get(s.key),o=i.overlayedDocument;let a=this.applyToLocalView(o,i.mutatedFields);a=n.has(s.key)?null:a;const c=eI(o,a);c!==null&&r.set(s.key,c),o.isValidDocument()||o.convertToNoDocument(pe.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),Te())}isEqual(e){return this.batchId===e.batchId&&uo(this.mutations,e.mutations,(n,r)=>Iv(n,r))&&uo(this.baseMutations,e.baseMutations,(n,r)=>Iv(n,r))}}class pm{constructor(e,n,r,s){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=s}static from(e,n,r){Le(e.mutations.length===r.length,58842,{fe:e.mutations.length,ge:r.length});let s=function(){return NM}();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new pm(e,n,r,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qM{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WM{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var lt,Ae;function KM(t){switch(t){case j.OK:return de(64938);case j.CANCELLED:case j.UNKNOWN:case j.DEADLINE_EXCEEDED:case j.RESOURCE_EXHAUSTED:case j.INTERNAL:case j.UNAVAILABLE:case j.UNAUTHENTICATED:return!1;case j.INVALID_ARGUMENT:case j.NOT_FOUND:case j.ALREADY_EXISTS:case j.PERMISSION_DENIED:case j.FAILED_PRECONDITION:case j.ABORTED:case j.OUT_OF_RANGE:case j.UNIMPLEMENTED:case j.DATA_LOSS:return!0;default:return de(15467,{code:t})}}function nI(t){if(t===void 0)return Dr("GRPC error has no .code"),j.UNKNOWN;switch(t){case lt.OK:return j.OK;case lt.CANCELLED:return j.CANCELLED;case lt.UNKNOWN:return j.UNKNOWN;case lt.DEADLINE_EXCEEDED:return j.DEADLINE_EXCEEDED;case lt.RESOURCE_EXHAUSTED:return j.RESOURCE_EXHAUSTED;case lt.INTERNAL:return j.INTERNAL;case lt.UNAVAILABLE:return j.UNAVAILABLE;case lt.UNAUTHENTICATED:return j.UNAUTHENTICATED;case lt.INVALID_ARGUMENT:return j.INVALID_ARGUMENT;case lt.NOT_FOUND:return j.NOT_FOUND;case lt.ALREADY_EXISTS:return j.ALREADY_EXISTS;case lt.PERMISSION_DENIED:return j.PERMISSION_DENIED;case lt.FAILED_PRECONDITION:return j.FAILED_PRECONDITION;case lt.ABORTED:return j.ABORTED;case lt.OUT_OF_RANGE:return j.OUT_OF_RANGE;case lt.UNIMPLEMENTED:return j.UNIMPLEMENTED;case lt.DATA_LOSS:return j.DATA_LOSS;default:return de(39323,{code:t})}}(Ae=lt||(lt={}))[Ae.OK=0]="OK",Ae[Ae.CANCELLED=1]="CANCELLED",Ae[Ae.UNKNOWN=2]="UNKNOWN",Ae[Ae.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Ae[Ae.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Ae[Ae.NOT_FOUND=5]="NOT_FOUND",Ae[Ae.ALREADY_EXISTS=6]="ALREADY_EXISTS",Ae[Ae.PERMISSION_DENIED=7]="PERMISSION_DENIED",Ae[Ae.UNAUTHENTICATED=16]="UNAUTHENTICATED",Ae[Ae.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Ae[Ae.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Ae[Ae.ABORTED=10]="ABORTED",Ae[Ae.OUT_OF_RANGE=11]="OUT_OF_RANGE",Ae[Ae.UNIMPLEMENTED=12]="UNIMPLEMENTED",Ae[Ae.INTERNAL=13]="INTERNAL",Ae[Ae.UNAVAILABLE=14]="UNAVAILABLE",Ae[Ae.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zM=new ds([4294967295,4294967295],0);function Cv(t){const e=Ib().encode(t),n=new gb;return n.update(e),new Uint8Array(n.digest())}function Sv(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new ds([n,r],0),new ds([s,i],0)]}class mm{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new ma(`Invalid padding: ${n}`);if(r<0)throw new ma(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new ma(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new ma(`Invalid padding when bitmap length is 0: ${n}`);this.pe=8*e.length-n,this.ye=ds.fromNumber(this.pe)}we(e,n,r){let s=e.add(n.multiply(ds.fromNumber(r)));return s.compare(zM)===1&&(s=new ds([s.getBits(0),s.getBits(1)],0)),s.modulo(this.ye).toNumber()}Se(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.pe===0)return!1;const n=Cv(e),[r,s]=Sv(n);for(let i=0;i<this.hashCount;i++){const o=this.we(r,s,i);if(!this.Se(o))return!1}return!0}static create(e,n,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new mm(i,s,n);return r.forEach(a=>o.insert(a)),o}insert(e){if(this.pe===0)return;const n=Cv(e),[r,s]=Sv(n);for(let i=0;i<this.hashCount;i++){const o=this.we(r,s,i);this.be(o)}}be(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class ma extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Th{constructor(e,n,r,s,i){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const s=new Map;return s.set(e,Tc.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new Th(pe.min(),s,new pt(ye),xr(),Te())}}class Tc{constructor(e,n,r,s,i){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new Tc(r,n,Te(),Te(),Te())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nl{constructor(e,n,r,s){this.De=e,this.removedTargetIds=n,this.key=r,this.ve=s}}class rI{constructor(e,n){this.targetId=e,this.Ce=n}}class sI{constructor(e,n,r=Nt.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=s}}class kv{constructor(){this.Fe=0,this.Me=Pv(),this.xe=Nt.EMPTY_BYTE_STRING,this.Oe=!1,this.Ne=!0}get current(){return this.Oe}get resumeToken(){return this.xe}get Be(){return this.Fe!==0}get Le(){return this.Ne}ke(e){e.approximateByteSize()>0&&(this.Ne=!0,this.xe=e)}qe(){let e=Te(),n=Te(),r=Te();return this.Me.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:n=n.add(s);break;case 1:r=r.add(s);break;default:de(38017,{changeType:i})}}),new Tc(this.xe,this.Oe,e,n,r)}Qe(){this.Ne=!1,this.Me=Pv()}$e(e,n){this.Ne=!0,this.Me=this.Me.insert(e,n)}Ue(e){this.Ne=!0,this.Me=this.Me.remove(e)}Ke(){this.Fe+=1}We(){this.Fe-=1,Le(this.Fe>=0,3241,{Fe:this.Fe})}Ge(){this.Ne=!0,this.Oe=!0}}class GM{constructor(e){this.ze=e,this.je=new Map,this.He=xr(),this.Je=hl(),this.Ye=hl(),this.Ze=new pt(ye)}Xe(e){for(const n of e.De)e.ve&&e.ve.isFoundDocument()?this.et(n,e.ve):this.tt(n,e.key,e.ve);for(const n of e.removedTargetIds)this.tt(n,e.key,e.ve)}nt(e){this.forEachTarget(e,n=>{const r=this.rt(n);switch(e.state){case 0:this.it(n)&&r.ke(e.resumeToken);break;case 1:r.We(),r.Be||r.Qe(),r.ke(e.resumeToken);break;case 2:r.We(),r.Be||this.removeTarget(n);break;case 3:this.it(n)&&(r.Ge(),r.ke(e.resumeToken));break;case 4:this.it(n)&&(this.st(n),r.ke(e.resumeToken));break;default:de(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.je.forEach((r,s)=>{this.it(s)&&n(s)})}ot(e){const n=e.targetId,r=e.Ce.count,s=this._t(n);if(s){const i=s.target;if(Bd(i))if(r===0){const o=new le(i.path);this.tt(n,o,Bt.newNoDocument(o,pe.min()))}else Le(r===1,20013,{expectedCount:r});else{const o=this.ut(n);if(o!==r){const a=this.ct(e),c=a?this.lt(a,e,o):1;if(c!==0){this.st(n);const u=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(n,u)}}}}}ct(e){const n=e.Ce.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=n;let o,a;try{o=bs(r).toUint8Array()}catch(c){if(c instanceof Sb)return lo("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{a=new mm(o,s,i)}catch(c){return lo(c instanceof ma?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return a.pe===0?null:a}lt(e,n,r){return n.Ce.count===r-this.Tt(e,n.targetId)?0:2}Tt(e,n){const r=this.ze.getRemoteKeysForTarget(n);let s=0;return r.forEach(i=>{const o=this.ze.Pt(),a=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(a)||(this.tt(n,i,null),s++)}),s}It(e){const n=new Map;this.je.forEach((i,o)=>{const a=this._t(o);if(a){if(i.current&&Bd(a.target)){const c=new le(a.target.path);this.Et(c).has(o)||this.dt(o,c)||this.tt(o,c,Bt.newNoDocument(c,e))}i.Le&&(n.set(o,i.qe()),i.Qe())}});let r=Te();this.Ye.forEach((i,o)=>{let a=!0;o.forEachWhile(c=>{const u=this._t(c);return!u||u.purpose==="TargetPurposeLimboResolution"||(a=!1,!1)}),a&&(r=r.add(i))}),this.He.forEach((i,o)=>o.setReadTime(e));const s=new Th(e,n,this.Ze,this.He,r);return this.He=xr(),this.Je=hl(),this.Ye=hl(),this.Ze=new pt(ye),s}et(e,n){if(!this.it(e))return;const r=this.dt(e,n.key)?2:0;this.rt(e).$e(n.key,r),this.He=this.He.insert(n.key,n),this.Je=this.Je.insert(n.key,this.Et(n.key).add(e)),this.Ye=this.Ye.insert(n.key,this.At(n.key).add(e))}tt(e,n,r){if(!this.it(e))return;const s=this.rt(e);this.dt(e,n)?s.$e(n,1):s.Ue(n),this.Ye=this.Ye.insert(n,this.At(n).delete(e)),this.Ye=this.Ye.insert(n,this.At(n).add(e)),r&&(this.He=this.He.insert(n,r))}removeTarget(e){this.je.delete(e)}ut(e){const n=this.rt(e).qe();return this.ze.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}Ke(e){this.rt(e).Ke()}rt(e){let n=this.je.get(e);return n||(n=new kv,this.je.set(e,n)),n}At(e){let n=this.Ye.get(e);return n||(n=new yt(ye),this.Ye=this.Ye.insert(e,n)),n}Et(e){let n=this.Je.get(e);return n||(n=new yt(ye),this.Je=this.Je.insert(e,n)),n}it(e){const n=this._t(e)!==null;return n||ee("WatchChangeAggregator","Detected inactive target",e),n}_t(e){const n=this.je.get(e);return n&&n.Be?null:this.ze.Rt(e)}st(e){this.je.set(e,new kv),this.ze.getRemoteKeysForTarget(e).forEach(n=>{this.tt(e,n,null)})}dt(e,n){return this.ze.getRemoteKeysForTarget(e).has(n)}}function hl(){return new pt(le.comparator)}function Pv(){return new pt(le.comparator)}const QM={asc:"ASCENDING",desc:"DESCENDING"},YM={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},XM={and:"AND",or:"OR"};class JM{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function Hd(t,e){return t.useProto3Json||ph(e)?e:{value:e}}function _u(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function iI(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function ZM(t,e){return _u(t,e.toTimestamp())}function sr(t){return Le(!!t,49232),pe.fromTimestamp(function(n){const r=ws(n);return new dt(r.seconds,r.nanos)}(t))}function gm(t,e){return qd(t,e).canonicalString()}function qd(t,e){const n=function(s){return new Qe(["projects",s.projectId,"databases",s.database])}(t).child("documents");return e===void 0?n:n.child(e)}function oI(t){const e=Qe.fromString(t);return Le(hI(e),10190,{key:e.toString()}),e}function Wd(t,e){return gm(t.databaseId,e.path)}function Sf(t,e){const n=oI(e);if(n.get(1)!==t.databaseId.projectId)throw new ne(j.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new ne(j.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new le(cI(n))}function aI(t,e){return gm(t.databaseId,e)}function eL(t){const e=oI(t);return e.length===4?Qe.emptyPath():cI(e)}function Kd(t){return new Qe(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function cI(t){return Le(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function Nv(t,e,n){return{name:Wd(t,e),fields:n.value.mapValue.fields}}function tL(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:de(39313,{state:u})}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(u,h){return u.useProto3Json?(Le(h===void 0||typeof h=="string",58123),Nt.fromBase64String(h||"")):(Le(h===void 0||h instanceof Buffer||h instanceof Uint8Array,16193),Nt.fromUint8Array(h||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,a=o&&function(u){const h=u.code===void 0?j.UNKNOWN:nI(u.code);return new ne(h,u.message||"")}(o);n=new sI(r,s,i,a||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Sf(t,r.document.name),i=sr(r.document.updateTime),o=r.document.createTime?sr(r.document.createTime):pe.min(),a=new on({mapValue:{fields:r.document.fields}}),c=Bt.newFoundDocument(s,i,o,a),u=r.targetIds||[],h=r.removedTargetIds||[];n=new Nl(u,h,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Sf(t,r.document),i=r.readTime?sr(r.readTime):pe.min(),o=Bt.newNoDocument(s,i),a=r.removedTargetIds||[];n=new Nl([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Sf(t,r.document),i=r.removedTargetIds||[];n=new Nl([],i,s,null)}else{if(!("filter"in e))return de(11601,{Vt:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new WM(s,i),a=r.targetId;n=new rI(a,o)}}return n}function nL(t,e){let n;if(e instanceof Ec)n={update:Nv(t,e.key,e.value)};else if(e instanceof dm)n={delete:Wd(t,e.key)};else if(e instanceof ks)n={update:Nv(t,e.key,e.data),updateMask:hL(e.fieldMask)};else{if(!(e instanceof jM))return de(16599,{ft:e.type});n={verify:Wd(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(i,o){const a=o.transform;if(a instanceof ic)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(a instanceof po)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:a.elements}};if(a instanceof oc)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:a.elements}};if(a instanceof gu)return{fieldPath:o.field.canonicalString(),increment:a.Re};throw de(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(n.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:ZM(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:de(27497)}(t,e.precondition)),n}function rL(t,e){return t&&t.length>0?(Le(e!==void 0,14353),t.map(n=>function(s,i){let o=s.updateTime?sr(s.updateTime):sr(i);return o.isEqual(pe.min())&&(o=sr(i)),new UM(o,s.transformResults||[])}(n,e))):[]}function sL(t,e){return{documents:[aI(t,e.path)]}}function iL(t,e){const n={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=aI(t,s);const i=function(u){if(u.length!==0)return uI(Hn.create(u,"and"))}(e.filters);i&&(n.structuredQuery.where=i);const o=function(u){if(u.length!==0)return u.map(h=>function(d){return{field:Li(d.field),direction:cL(d.dir)}}(h))}(e.orderBy);o&&(n.structuredQuery.orderBy=o);const a=Hd(t,e.limit);return a!==null&&(n.structuredQuery.limit=a),e.startAt&&(n.structuredQuery.startAt=function(u){return{before:u.inclusive,values:u.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(u){return{before:!u.inclusive,values:u.position}}(e.endAt)),{gt:n,parent:s}}function oL(t){let e=eL(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){Le(r===1,65062);const h=n.from[0];h.allDescendants?s=h.collectionId:e=e.child(h.collectionId)}let i=[];n.where&&(i=function(f){const d=lI(f);return d instanceof Hn&&Fb(d)?d.getFilters():[d]}(n.where));let o=[];n.orderBy&&(o=function(f){return f.map(d=>function(_){return new mu(Vi(_.field),function(I){switch(I){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(_.direction))}(d))}(n.orderBy));let a=null;n.limit&&(a=function(f){let d;return d=typeof f=="object"?f.value:f,ph(d)?null:d}(n.limit));let c=null;n.startAt&&(c=function(f){const d=!!f.before,m=f.values||[];return new pu(m,d)}(n.startAt));let u=null;return n.endAt&&(u=function(f){const d=!f.before,m=f.values||[];return new pu(m,d)}(n.endAt)),RM(e,s,o,i,a,"F",c,u)}function aL(t,e){const n=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return de(28987,{purpose:s})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function lI(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=Vi(n.unaryFilter.field);return ht.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Vi(n.unaryFilter.field);return ht.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Vi(n.unaryFilter.field);return ht.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Vi(n.unaryFilter.field);return ht.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return de(61313);default:return de(60726)}}(t):t.fieldFilter!==void 0?function(n){return ht.create(Vi(n.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return de(58110);default:return de(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return Hn.create(n.compositeFilter.filters.map(r=>lI(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return de(1026)}}(n.compositeFilter.op))}(t):de(30097,{filter:t})}function cL(t){return QM[t]}function lL(t){return YM[t]}function uL(t){return XM[t]}function Li(t){return{fieldPath:t.canonicalString()}}function Vi(t){return Pt.fromServerFormat(t.fieldPath)}function uI(t){return t instanceof ht?function(n){if(n.op==="=="){if(yv(n.value))return{unaryFilter:{field:Li(n.field),op:"IS_NAN"}};if(_v(n.value))return{unaryFilter:{field:Li(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(yv(n.value))return{unaryFilter:{field:Li(n.field),op:"IS_NOT_NAN"}};if(_v(n.value))return{unaryFilter:{field:Li(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Li(n.field),op:lL(n.op),value:n.value}}}(t):t instanceof Hn?function(n){const r=n.getFilters().map(s=>uI(s));return r.length===1?r[0]:{compositeFilter:{op:uL(n.op),filters:r}}}(t):de(54877,{filter:t})}function hL(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function hI(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class as{constructor(e,n,r,s,i=pe.min(),o=pe.min(),a=Nt.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=a,this.expectedCount=c}withSequenceNumber(e){return new as(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new as(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new as(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new as(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fL{constructor(e){this.wt=e}}function dL(t){const e=oL({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?jd(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pL{constructor(){this.Cn=new mL}addToCollectionParentIndex(e,n){return this.Cn.add(n),$.resolve()}getCollectionParents(e,n){return $.resolve(this.Cn.getEntries(n))}addFieldIndex(e,n){return $.resolve()}deleteFieldIndex(e,n){return $.resolve()}deleteAllFieldIndexes(e){return $.resolve()}createTargetIndexes(e,n){return $.resolve()}getDocumentsMatchingTarget(e,n){return $.resolve(null)}getIndexType(e,n){return $.resolve(0)}getFieldIndexes(e,n){return $.resolve([])}getNextCollectionGroupToUpdate(e){return $.resolve(null)}getMinOffset(e,n){return $.resolve(Ts.min())}getMinOffsetFromCollectionGroup(e,n){return $.resolve(Ts.min())}updateCollectionGroup(e,n,r){return $.resolve()}updateIndexEntries(e,n){return $.resolve()}}class mL{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n]||new yt(Qe.comparator),i=!s.has(r);return this.index[n]=s.add(r),i}has(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n];return s&&s.has(r)}getEntries(e){return(this.index[e]||new yt(Qe.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ov={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},fI=41943040;class nn{static withCacheSize(e){return new nn(e,nn.DEFAULT_COLLECTION_PERCENTILE,nn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */nn.DEFAULT_COLLECTION_PERCENTILE=10,nn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,nn.DEFAULT=new nn(fI,nn.DEFAULT_COLLECTION_PERCENTILE,nn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),nn.DISABLED=new nn(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mo{constructor(e){this.ur=e}next(){return this.ur+=2,this.ur}static cr(){return new mo(0)}static lr(){return new mo(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dv="LruGarbageCollector",gL=1048576;function xv([t,e],[n,r]){const s=ye(t,n);return s===0?ye(e,r):s}class _L{constructor(e){this.Er=e,this.buffer=new yt(xv),this.dr=0}Ar(){return++this.dr}Rr(e){const n=[e,this.Ar()];if(this.buffer.size<this.Er)this.buffer=this.buffer.add(n);else{const r=this.buffer.last();xv(n,r)<0&&(this.buffer=this.buffer.delete(r).add(n))}}get maxValue(){return this.buffer.last()[0]}}class yL{constructor(e,n,r){this.garbageCollector=e,this.asyncQueue=n,this.localStore=r,this.Vr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.mr(6e4)}stop(){this.Vr&&(this.Vr.cancel(),this.Vr=null)}get started(){return this.Vr!==null}mr(e){ee(Dv,`Garbage collection scheduled in ${e}ms`),this.Vr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Vr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){Po(n)?ee(Dv,"Ignoring IndexedDB error during garbage collection: ",n):await ko(n)}await this.mr(3e5)})}}class vL{constructor(e,n){this.gr=e,this.params=n}calculateTargetCount(e,n){return this.gr.pr(e).next(r=>Math.floor(n/100*r))}nthSequenceNumber(e,n){if(n===0)return $.resolve(dh.le);const r=new _L(n);return this.gr.forEachTarget(e,s=>r.Rr(s.sequenceNumber)).next(()=>this.gr.yr(e,s=>r.Rr(s))).next(()=>r.maxValue)}removeTargets(e,n,r){return this.gr.removeTargets(e,n,r)}removeOrphanedDocuments(e,n){return this.gr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?(ee("LruGarbageCollector","Garbage collection skipped; disabled"),$.resolve(Ov)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(ee("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Ov):this.wr(e,n))}getCacheSize(e){return this.gr.getCacheSize(e)}wr(e,n){let r,s,i,o,a,c,u;const h=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(f=>(f>this.params.maximumSequenceNumbersToCollect?(ee("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${f}`),s=this.params.maximumSequenceNumbersToCollect):s=f,o=Date.now(),this.nthSequenceNumber(e,s))).next(f=>(r=f,a=Date.now(),this.removeTargets(e,r,n))).next(f=>(i=f,c=Date.now(),this.removeOrphanedDocuments(e,r))).next(f=>(u=Date.now(),xi()<=ve.DEBUG&&ee("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-h}ms
	Determined least recently used ${s} in `+(a-o)+`ms
	Removed ${i} targets in `+(c-a)+`ms
	Removed ${f} documents in `+(u-c)+`ms
Total Duration: ${u-h}ms`),$.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:f})))}}function EL(t,e){return new vL(t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TL{constructor(){this.changes=new gi(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,Bt.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?$.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wL{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bL{constructor(e,n,r,s){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,n))).next(s=>(r!==null&&Na(r.mutation,s,fn.empty(),dt.now()),s))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,Te()).next(()=>r))}getLocalViewOfDocuments(e,n,r=Te()){const s=Hs();return this.populateOverlays(e,s,n).next(()=>this.computeViews(e,n,s,r).next(i=>{let o=pa();return i.forEach((a,c)=>{o=o.insert(a,c.overlayedDocument)}),o}))}getOverlayedDocuments(e,n){const r=Hs();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,Te()))}populateOverlays(e,n,r){const s=[];return r.forEach(i=>{n.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((o,a)=>{n.set(o,a)})})}computeViews(e,n,r,s){let i=xr();const o=Pa(),a=function(){return Pa()}();return n.forEach((c,u)=>{const h=r.get(u.key);s.has(u.key)&&(h===void 0||h.mutation instanceof ks)?i=i.insert(u.key,u):h!==void 0?(o.set(u.key,h.mutation.getFieldMask()),Na(h.mutation,u,h.mutation.getFieldMask(),dt.now())):o.set(u.key,fn.empty())}),this.recalculateAndSaveOverlays(e,i).next(c=>(c.forEach((u,h)=>o.set(u,h)),n.forEach((u,h)=>{var f;return a.set(u,new wL(h,(f=o.get(u))!==null&&f!==void 0?f:null))}),a))}recalculateAndSaveOverlays(e,n){const r=Pa();let s=new pt((o,a)=>o-a),i=Te();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(o=>{for(const a of o)a.keys().forEach(c=>{const u=n.get(c);if(u===null)return;let h=r.get(c)||fn.empty();h=a.applyToLocalView(u,h),r.set(c,h);const f=(s.get(a.batchId)||Te()).add(c);s=s.insert(a.batchId,f)})}).next(()=>{const o=[],a=s.getReverseIterator();for(;a.hasNext();){const c=a.getNext(),u=c.key,h=c.value,f=zb();h.forEach(d=>{if(!i.has(d)){const m=eI(n.get(d),r.get(d));m!==null&&f.set(d,m),i=i.add(d)}}),o.push(this.documentOverlayCache.saveOverlays(e,u,f))}return $.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,s){return function(o){return le.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):jb(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,s):this.getDocumentsMatchingCollectionQuery(e,n,r,s)}getNextDocuments(e,n,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,s).next(i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,s-i.size):$.resolve(Hs());let a=tc,c=i;return o.next(u=>$.forEach(u,(h,f)=>(a<f.largestBatchId&&(a=f.largestBatchId),i.get(h)?$.resolve():this.remoteDocumentCache.getEntry(e,h).next(d=>{c=c.insert(h,d)}))).next(()=>this.populateOverlays(e,u,i)).next(()=>this.computeViews(e,c,u,Te())).next(h=>({batchId:a,changes:Kb(h)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new le(n)).next(r=>{let s=pa();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,n,r,s){const i=n.collectionGroup;let o=pa();return this.indexManager.getCollectionParents(e,i).next(a=>$.forEach(a,c=>{const u=function(f,d){return new vc(d,null,f.explicitOrderBy.slice(),f.filters.slice(),f.limit,f.limitType,f.startAt,f.endAt)}(n,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,u,r,s).next(h=>{h.forEach((f,d)=>{o=o.insert(f,d)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,n,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,i,s))).next(o=>{i.forEach((c,u)=>{const h=u.getKey();o.get(h)===null&&(o=o.insert(h,Bt.newInvalidDocument(h)))});let a=pa();return o.forEach((c,u)=>{const h=i.get(c);h!==void 0&&Na(h.mutation,u,fn.empty(),dt.now()),yh(n,u)&&(a=a.insert(c,u))}),a})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class IL{constructor(e){this.serializer=e,this.kr=new Map,this.qr=new Map}getBundleMetadata(e,n){return $.resolve(this.kr.get(n))}saveBundleMetadata(e,n){return this.kr.set(n.id,function(s){return{id:s.id,version:s.version,createTime:sr(s.createTime)}}(n)),$.resolve()}getNamedQuery(e,n){return $.resolve(this.qr.get(n))}saveNamedQuery(e,n){return this.qr.set(n.name,function(s){return{name:s.name,query:dL(s.bundledQuery),readTime:sr(s.readTime)}}(n)),$.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AL{constructor(){this.overlays=new pt(le.comparator),this.Qr=new Map}getOverlay(e,n){return $.resolve(this.overlays.get(n))}getOverlays(e,n){const r=Hs();return $.forEach(n,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((s,i)=>{this.bt(e,n,i)}),$.resolve()}removeOverlaysForBatchId(e,n,r){const s=this.Qr.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Qr.delete(r)),$.resolve()}getOverlaysForCollection(e,n,r){const s=Hs(),i=n.length+1,o=new le(n.child("")),a=this.overlays.getIteratorFrom(o);for(;a.hasNext();){const c=a.getNext().value,u=c.getKey();if(!n.isPrefixOf(u.path))break;u.path.length===i&&c.largestBatchId>r&&s.set(c.getKey(),c)}return $.resolve(s)}getOverlaysForCollectionGroup(e,n,r,s){let i=new pt((u,h)=>u-h);const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===n&&u.largestBatchId>r){let h=i.get(u.largestBatchId);h===null&&(h=Hs(),i=i.insert(u.largestBatchId,h)),h.set(u.getKey(),u)}}const a=Hs(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((u,h)=>a.set(u,h)),!(a.size()>=s)););return $.resolve(a)}bt(e,n,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.Qr.get(s.largestBatchId).delete(r.key);this.Qr.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new qM(n,r));let i=this.Qr.get(n);i===void 0&&(i=Te(),this.Qr.set(n,i)),this.Qr.set(n,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RL{constructor(){this.sessionToken=Nt.EMPTY_BYTE_STRING}getSessionToken(e){return $.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,$.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _m{constructor(){this.$r=new yt(Tt.Ur),this.Kr=new yt(Tt.Wr)}isEmpty(){return this.$r.isEmpty()}addReference(e,n){const r=new Tt(e,n);this.$r=this.$r.add(r),this.Kr=this.Kr.add(r)}Gr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.zr(new Tt(e,n))}jr(e,n){e.forEach(r=>this.removeReference(r,n))}Hr(e){const n=new le(new Qe([])),r=new Tt(n,e),s=new Tt(n,e+1),i=[];return this.Kr.forEachInRange([r,s],o=>{this.zr(o),i.push(o.key)}),i}Jr(){this.$r.forEach(e=>this.zr(e))}zr(e){this.$r=this.$r.delete(e),this.Kr=this.Kr.delete(e)}Yr(e){const n=new le(new Qe([])),r=new Tt(n,e),s=new Tt(n,e+1);let i=Te();return this.Kr.forEachInRange([r,s],o=>{i=i.add(o.key)}),i}containsKey(e){const n=new Tt(e,0),r=this.$r.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class Tt{constructor(e,n){this.key=e,this.Zr=n}static Ur(e,n){return le.comparator(e.key,n.key)||ye(e.Zr,n.Zr)}static Wr(e,n){return ye(e.Zr,n.Zr)||le.comparator(e.key,n.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CL{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.nr=1,this.Xr=new yt(Tt.Ur)}checkEmpty(e){return $.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,s){const i=this.nr;this.nr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new HM(i,n,r,s);this.mutationQueue.push(o);for(const a of s)this.Xr=this.Xr.add(new Tt(a.key,i)),this.indexManager.addToCollectionParentIndex(e,a.key.path.popLast());return $.resolve(o)}lookupMutationBatch(e,n){return $.resolve(this.ei(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,s=this.ti(r),i=s<0?0:s;return $.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return $.resolve(this.mutationQueue.length===0?am:this.nr-1)}getAllMutationBatches(e){return $.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new Tt(n,0),s=new Tt(n,Number.POSITIVE_INFINITY),i=[];return this.Xr.forEachInRange([r,s],o=>{const a=this.ei(o.Zr);i.push(a)}),$.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new yt(ye);return n.forEach(s=>{const i=new Tt(s,0),o=new Tt(s,Number.POSITIVE_INFINITY);this.Xr.forEachInRange([i,o],a=>{r=r.add(a.Zr)})}),$.resolve(this.ni(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,s=r.length+1;let i=r;le.isDocumentKey(i)||(i=i.child(""));const o=new Tt(new le(i),0);let a=new yt(ye);return this.Xr.forEachWhile(c=>{const u=c.key.path;return!!r.isPrefixOf(u)&&(u.length===s&&(a=a.add(c.Zr)),!0)},o),$.resolve(this.ni(a))}ni(e){const n=[];return e.forEach(r=>{const s=this.ei(r);s!==null&&n.push(s)}),n}removeMutationBatch(e,n){Le(this.ri(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Xr;return $.forEach(n.mutations,s=>{const i=new Tt(s.key,n.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.Xr=r})}sr(e){}containsKey(e,n){const r=new Tt(n,0),s=this.Xr.firstAfterOrEqual(r);return $.resolve(n.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,$.resolve()}ri(e,n){return this.ti(e)}ti(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}ei(e){const n=this.ti(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SL{constructor(e){this.ii=e,this.docs=function(){return new pt(le.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,s=this.docs.get(r),i=s?s.size:0,o=this.ii(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return $.resolve(r?r.document.mutableCopy():Bt.newInvalidDocument(n))}getEntries(e,n){let r=xr();return n.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Bt.newInvalidDocument(s))}),$.resolve(r)}getDocumentsMatchingQuery(e,n,r,s){let i=xr();const o=n.path,a=new le(o.child("__id-9223372036854775808__")),c=this.docs.getIteratorFrom(a);for(;c.hasNext();){const{key:u,value:{document:h}}=c.getNext();if(!o.isPrefixOf(u.path))break;u.path.length>o.length+1||sM(rM(h),r)<=0||(s.has(h.key)||yh(n,h))&&(i=i.insert(h.key,h.mutableCopy()))}return $.resolve(i)}getAllFromCollectionGroup(e,n,r,s){de(9500)}si(e,n){return $.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new kL(this)}getSize(e){return $.resolve(this.size)}}class kL extends TL{constructor(e){super(),this.Br=e}applyChanges(e){const n=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?n.push(this.Br.addEntry(e,s)):this.Br.removeEntry(r)}),$.waitFor(n)}getFromCache(e,n){return this.Br.getEntry(e,n)}getAllFromCache(e,n){return this.Br.getEntries(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PL{constructor(e){this.persistence=e,this.oi=new gi(n=>um(n),hm),this.lastRemoteSnapshotVersion=pe.min(),this.highestTargetId=0,this._i=0,this.ai=new _m,this.targetCount=0,this.ui=mo.cr()}forEachTarget(e,n){return this.oi.forEach((r,s)=>n(s)),$.resolve()}getLastRemoteSnapshotVersion(e){return $.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return $.resolve(this._i)}allocateTargetId(e){return this.highestTargetId=this.ui.next(),$.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this._i&&(this._i=n),$.resolve()}Tr(e){this.oi.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this.ui=new mo(n),this.highestTargetId=n),e.sequenceNumber>this._i&&(this._i=e.sequenceNumber)}addTargetData(e,n){return this.Tr(n),this.targetCount+=1,$.resolve()}updateTargetData(e,n){return this.Tr(n),$.resolve()}removeTargetData(e,n){return this.oi.delete(n.target),this.ai.Hr(n.targetId),this.targetCount-=1,$.resolve()}removeTargets(e,n,r){let s=0;const i=[];return this.oi.forEach((o,a)=>{a.sequenceNumber<=n&&r.get(a.targetId)===null&&(this.oi.delete(o),i.push(this.removeMatchingKeysForTargetId(e,a.targetId)),s++)}),$.waitFor(i).next(()=>s)}getTargetCount(e){return $.resolve(this.targetCount)}getTargetData(e,n){const r=this.oi.get(n)||null;return $.resolve(r)}addMatchingKeys(e,n,r){return this.ai.Gr(n,r),$.resolve()}removeMatchingKeys(e,n,r){this.ai.jr(n,r);const s=this.persistence.referenceDelegate,i=[];return s&&n.forEach(o=>{i.push(s.markPotentiallyOrphaned(e,o))}),$.waitFor(i)}removeMatchingKeysForTargetId(e,n){return this.ai.Hr(n),$.resolve()}getMatchingKeysForTargetId(e,n){const r=this.ai.Yr(n);return $.resolve(r)}containsKey(e,n){return $.resolve(this.ai.containsKey(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dI{constructor(e,n){this.ci={},this.overlays={},this.li=new dh(0),this.hi=!1,this.hi=!0,this.Pi=new RL,this.referenceDelegate=e(this),this.Ti=new PL(this),this.indexManager=new pL,this.remoteDocumentCache=function(s){return new SL(s)}(r=>this.referenceDelegate.Ii(r)),this.serializer=new fL(n),this.Ei=new IL(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.hi=!1,Promise.resolve()}get started(){return this.hi}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new AL,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.ci[e.toKey()];return r||(r=new CL(n,this.referenceDelegate),this.ci[e.toKey()]=r),r}getGlobalsCache(){return this.Pi}getTargetCache(){return this.Ti}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ei}runTransaction(e,n,r){ee("MemoryPersistence","Starting transaction:",e);const s=new NL(this.li.next());return this.referenceDelegate.di(),r(s).next(i=>this.referenceDelegate.Ai(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Ri(e,n){return $.or(Object.values(this.ci).map(r=>()=>r.containsKey(e,n)))}}class NL extends oM{constructor(e){super(),this.currentSequenceNumber=e}}class ym{constructor(e){this.persistence=e,this.Vi=new _m,this.mi=null}static fi(e){return new ym(e)}get gi(){if(this.mi)return this.mi;throw de(60996)}addReference(e,n,r){return this.Vi.addReference(r,n),this.gi.delete(r.toString()),$.resolve()}removeReference(e,n,r){return this.Vi.removeReference(r,n),this.gi.add(r.toString()),$.resolve()}markPotentiallyOrphaned(e,n){return this.gi.add(n.toString()),$.resolve()}removeTarget(e,n){this.Vi.Hr(n.targetId).forEach(s=>this.gi.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(s=>{s.forEach(i=>this.gi.add(i.toString()))}).next(()=>r.removeTargetData(e,n))}di(){this.mi=new Set}Ai(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return $.forEach(this.gi,r=>{const s=le.fromPath(r);return this.pi(e,s).next(i=>{i||n.removeEntry(s,pe.min())})}).next(()=>(this.mi=null,n.apply(e)))}updateLimboDocument(e,n){return this.pi(e,n).next(r=>{r?this.gi.delete(n.toString()):this.gi.add(n.toString())})}Ii(e){return 0}pi(e,n){return $.or([()=>$.resolve(this.Vi.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ri(e,n)])}}class yu{constructor(e,n){this.persistence=e,this.yi=new gi(r=>lM(r.path),(r,s)=>r.isEqual(s)),this.garbageCollector=EL(this,n)}static fi(e,n){return new yu(e,n)}di(){}Ai(e){return $.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}pr(e){const n=this.Sr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>n.next(s=>r+s))}Sr(e){let n=0;return this.yr(e,r=>{n++}).next(()=>n)}yr(e,n){return $.forEach(this.yi,(r,s)=>this.Dr(e,r,s).next(i=>i?$.resolve():n(s)))}removeTargets(e,n,r){return this.persistence.getTargetCache().removeTargets(e,n,r)}removeOrphanedDocuments(e,n){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.si(e,o=>this.Dr(e,o,n).next(a=>{a||(r++,i.removeEntry(o,pe.min()))})).next(()=>i.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,n){return this.yi.set(n,e.currentSequenceNumber),$.resolve()}removeTarget(e,n){const r=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,n,r){return this.yi.set(r,e.currentSequenceNumber),$.resolve()}removeReference(e,n,r){return this.yi.set(r,e.currentSequenceNumber),$.resolve()}updateLimboDocument(e,n){return this.yi.set(n,e.currentSequenceNumber),$.resolve()}Ii(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=Sl(e.data.value)),n}Dr(e,n,r){return $.or([()=>this.persistence.Ri(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{const s=this.yi.get(n);return $.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vm{constructor(e,n,r,s){this.targetId=e,this.fromCache=n,this.ds=r,this.As=s}static Rs(e,n){let r=Te(),s=Te();for(const i of n.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new vm(e,n.fromCache,r,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OL{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DL{constructor(){this.Vs=!1,this.fs=!1,this.gs=100,this.ps=function(){return AD()?8:aM($n())>0?6:4}()}initialize(e,n){this.ys=e,this.indexManager=n,this.Vs=!0}getDocumentsMatchingQuery(e,n,r,s){const i={result:null};return this.ws(e,n).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.Ss(e,n,s,r).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new OL;return this.bs(e,n,o).next(a=>{if(i.result=a,this.fs)return this.Ds(e,n,o,a.size)})}).next(()=>i.result)}Ds(e,n,r,s){return r.documentReadCount<this.gs?(xi()<=ve.DEBUG&&ee("QueryEngine","SDK will not create cache indexes for query:",Mi(n),"since it only creates cache indexes for collection contains","more than or equal to",this.gs,"documents"),$.resolve()):(xi()<=ve.DEBUG&&ee("QueryEngine","Query:",Mi(n),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.ps*s?(xi()<=ve.DEBUG&&ee("QueryEngine","The SDK decides to create cache indexes for query:",Mi(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,rr(n))):$.resolve())}ws(e,n){if(wv(n))return $.resolve(null);let r=rr(n);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(n.limit!==null&&s===1&&(n=jd(n,null,"F"),r=rr(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const o=Te(...i);return this.ys.getDocuments(e,o).next(a=>this.indexManager.getMinOffset(e,r).next(c=>{const u=this.vs(n,a);return this.Cs(n,u,o,c.readTime)?this.ws(e,jd(n,null,"F")):this.Fs(e,u,n,c)}))})))}Ss(e,n,r,s){return wv(n)||s.isEqual(pe.min())?$.resolve(null):this.ys.getDocuments(e,r).next(i=>{const o=this.vs(n,i);return this.Cs(n,o,r,s)?$.resolve(null):(xi()<=ve.DEBUG&&ee("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Mi(n)),this.Fs(e,o,n,nM(s,tc)).next(a=>a))})}vs(e,n){let r=new yt(qb(e));return n.forEach((s,i)=>{yh(e,i)&&(r=r.add(i))}),r}Cs(e,n,r,s){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const i=e.limitType==="F"?n.last():n.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}bs(e,n,r){return xi()<=ve.DEBUG&&ee("QueryEngine","Using full collection scan to execute query:",Mi(n)),this.ys.getDocumentsMatchingQuery(e,n,Ts.min(),r)}Fs(e,n,r,s){return this.ys.getDocumentsMatchingQuery(e,r,s).next(i=>(n.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Em="LocalStore",xL=3e8;class ML{constructor(e,n,r,s){this.persistence=e,this.Ms=n,this.serializer=s,this.xs=new pt(ye),this.Os=new gi(i=>um(i),hm),this.Ns=new Map,this.Bs=e.getRemoteDocumentCache(),this.Ti=e.getTargetCache(),this.Ei=e.getBundleCache(),this.Ls(r)}Ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new bL(this.Bs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Bs.setIndexManager(this.indexManager),this.Ms.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.xs))}}function LL(t,e,n,r){return new ML(t,e,n,r)}async function pI(t,e){const n=ge(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let s;return n.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,n.Ls(e),n.mutationQueue.getAllMutationBatches(r))).next(i=>{const o=[],a=[];let c=Te();for(const u of s){o.push(u.batchId);for(const h of u.mutations)c=c.add(h.key)}for(const u of i){a.push(u.batchId);for(const h of u.mutations)c=c.add(h.key)}return n.localDocuments.getDocuments(r,c).next(u=>({ks:u,removedBatchIds:o,addedBatchIds:a}))})})}function VL(t,e){const n=ge(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=n.Bs.newChangeBuffer({trackRemovals:!0});return function(a,c,u,h){const f=u.batch,d=f.keys();let m=$.resolve();return d.forEach(_=>{m=m.next(()=>h.getEntry(c,_)).next(y=>{const I=u.docVersions.get(_);Le(I!==null,48541),y.version.compareTo(I)<0&&(f.applyToRemoteDocument(y,u),y.isValidDocument()&&(y.setReadTime(u.commitVersion),h.addEntry(y)))})}),m.next(()=>a.mutationQueue.removeMutationBatch(c,f))}(n,r,e,i).next(()=>i.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(a){let c=Te();for(let u=0;u<a.mutationResults.length;++u)a.mutationResults[u].transformResults.length>0&&(c=c.add(a.batch.mutations[u].key));return c}(e))).next(()=>n.localDocuments.getDocuments(r,s))})}function mI(t){const e=ge(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.Ti.getLastRemoteSnapshotVersion(n))}function FL(t,e){const n=ge(t),r=e.snapshotVersion;let s=n.xs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=n.Bs.newChangeBuffer({trackRemovals:!0});s=n.xs;const a=[];e.targetChanges.forEach((h,f)=>{const d=s.get(f);if(!d)return;a.push(n.Ti.removeMatchingKeys(i,h.removedDocuments,f).next(()=>n.Ti.addMatchingKeys(i,h.addedDocuments,f)));let m=d.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(f)!==null?m=m.withResumeToken(Nt.EMPTY_BYTE_STRING,pe.min()).withLastLimboFreeSnapshotVersion(pe.min()):h.resumeToken.approximateByteSize()>0&&(m=m.withResumeToken(h.resumeToken,r)),s=s.insert(f,m),function(y,I,D){return y.resumeToken.approximateByteSize()===0||I.snapshotVersion.toMicroseconds()-y.snapshotVersion.toMicroseconds()>=xL?!0:D.addedDocuments.size+D.modifiedDocuments.size+D.removedDocuments.size>0}(d,m,h)&&a.push(n.Ti.updateTargetData(i,m))});let c=xr(),u=Te();if(e.documentUpdates.forEach(h=>{e.resolvedLimboDocuments.has(h)&&a.push(n.persistence.referenceDelegate.updateLimboDocument(i,h))}),a.push(UL(i,o,e.documentUpdates).next(h=>{c=h.qs,u=h.Qs})),!r.isEqual(pe.min())){const h=n.Ti.getLastRemoteSnapshotVersion(i).next(f=>n.Ti.setTargetsMetadata(i,i.currentSequenceNumber,r));a.push(h)}return $.waitFor(a).next(()=>o.apply(i)).next(()=>n.localDocuments.getLocalViewOfDocuments(i,c,u)).next(()=>c)}).then(i=>(n.xs=s,i))}function UL(t,e,n){let r=Te(),s=Te();return n.forEach(i=>r=r.add(i)),e.getEntries(t,r).next(i=>{let o=xr();return n.forEach((a,c)=>{const u=i.get(a);c.isFoundDocument()!==u.isFoundDocument()&&(s=s.add(a)),c.isNoDocument()&&c.version.isEqual(pe.min())?(e.removeEntry(a,c.readTime),o=o.insert(a,c)):!u.isValidDocument()||c.version.compareTo(u.version)>0||c.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(c),o=o.insert(a,c)):ee(Em,"Ignoring outdated watch update for ",a,". Current version:",u.version," Watch version:",c.version)}),{qs:o,Qs:s}})}function BL(t,e){const n=ge(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=am),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function $L(t,e){const n=ge(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return n.Ti.getTargetData(r,e).next(i=>i?(s=i,$.resolve(s)):n.Ti.allocateTargetId(r).next(o=>(s=new as(e,o,"TargetPurposeListen",r.currentSequenceNumber),n.Ti.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=n.xs.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(n.xs=n.xs.insert(r.targetId,r),n.Os.set(e,r.targetId)),r})}async function zd(t,e,n){const r=ge(t),s=r.xs.get(e),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,o=>r.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!Po(o))throw o;ee(Em,`Failed to update sequence numbers for target ${e}: ${o}`)}r.xs=r.xs.remove(e),r.Os.delete(s.target)}function Mv(t,e,n){const r=ge(t);let s=pe.min(),i=Te();return r.persistence.runTransaction("Execute query","readwrite",o=>function(c,u,h){const f=ge(c),d=f.Os.get(h);return d!==void 0?$.resolve(f.xs.get(d)):f.Ti.getTargetData(u,h)}(r,o,rr(e)).next(a=>{if(a)return s=a.lastLimboFreeSnapshotVersion,r.Ti.getMatchingKeysForTargetId(o,a.targetId).next(c=>{i=c})}).next(()=>r.Ms.getDocumentsMatchingQuery(o,e,n?s:pe.min(),n?i:Te())).next(a=>(jL(r,SM(e),a),{documents:a,$s:i})))}function jL(t,e,n){let r=t.Ns.get(e)||pe.min();n.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),t.Ns.set(e,r)}class Lv{constructor(){this.activeTargetIds=xM()}js(e){this.activeTargetIds=this.activeTargetIds.add(e)}Hs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}zs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class HL{constructor(){this.xo=new Lv,this.Oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.xo.js(e),this.Oo[e]||"not-current"}updateQueryState(e,n,r){this.Oo[e]=n}removeLocalQueryTarget(e){this.xo.Hs(e)}isLocalQueryTarget(e){return this.xo.activeTargetIds.has(e)}clearQueryState(e){delete this.Oo[e]}getAllActiveQueryTargets(){return this.xo.activeTargetIds}isActiveQueryTarget(e){return this.xo.activeTargetIds.has(e)}start(){return this.xo=new Lv,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qL{No(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vv="ConnectivityMonitor";class Fv{constructor(){this.Bo=()=>this.Lo(),this.ko=()=>this.qo(),this.Qo=[],this.$o()}No(e){this.Qo.push(e)}shutdown(){window.removeEventListener("online",this.Bo),window.removeEventListener("offline",this.ko)}$o(){window.addEventListener("online",this.Bo),window.addEventListener("offline",this.ko)}Lo(){ee(Vv,"Network connectivity changed: AVAILABLE");for(const e of this.Qo)e(0)}qo(){ee(Vv,"Network connectivity changed: UNAVAILABLE");for(const e of this.Qo)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let fl=null;function Gd(){return fl===null?fl=function(){return 268435456+Math.round(2147483648*Math.random())}():fl++,"0x"+fl.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kf="RestConnection",WL={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class KL{get Uo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const n=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Ko=n+"://"+e.host,this.Wo=`projects/${r}/databases/${s}`,this.Go=this.databaseId.database===fu?`project_id=${r}`:`project_id=${r}&database_id=${s}`}zo(e,n,r,s,i){const o=Gd(),a=this.jo(e,n.toUriEncodedString());ee(kf,`Sending RPC '${e}' ${o}:`,a,r);const c={"google-cloud-resource-prefix":this.Wo,"x-goog-request-params":this.Go};this.Ho(c,s,i);const{host:u}=new URL(a),h=Ao(u);return this.Jo(e,a,c,r,h).then(f=>(ee(kf,`Received RPC '${e}' ${o}: `,f),f),f=>{throw lo(kf,`RPC '${e}' ${o} failed with error: `,f,"url: ",a,"request:",r),f})}Yo(e,n,r,s,i,o){return this.zo(e,n,r,s,i)}Ho(e,n,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+So}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((s,i)=>e[i]=s),r&&r.headers.forEach((s,i)=>e[i]=s)}jo(e,n){const r=WL[e];return`${this.Ko}/v1/${n}:${r}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zL{constructor(e){this.Zo=e.Zo,this.Xo=e.Xo}e_(e){this.t_=e}n_(e){this.r_=e}i_(e){this.s_=e}onMessage(e){this.o_=e}close(){this.Xo()}send(e){this.Zo(e)}__(){this.t_()}a_(){this.r_()}u_(e){this.s_(e)}c_(e){this.o_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lt="WebChannelConnection";class GL extends KL{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Jo(e,n,r,s,i){const o=Gd();return new Promise((a,c)=>{const u=new _b;u.setWithCredentials(!0),u.listenOnce(yb.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case Cl.NO_ERROR:const f=u.getResponseJson();ee(Lt,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(f)),a(f);break;case Cl.TIMEOUT:ee(Lt,`RPC '${e}' ${o} timed out`),c(new ne(j.DEADLINE_EXCEEDED,"Request time out"));break;case Cl.HTTP_ERROR:const d=u.getStatus();if(ee(Lt,`RPC '${e}' ${o} failed with status:`,d,"response text:",u.getResponseText()),d>0){let m=u.getResponseJson();Array.isArray(m)&&(m=m[0]);const _=m==null?void 0:m.error;if(_&&_.status&&_.message){const y=function(D){const P=D.toLowerCase().replace(/_/g,"-");return Object.values(j).indexOf(P)>=0?P:j.UNKNOWN}(_.status);c(new ne(y,_.message))}else c(new ne(j.UNKNOWN,"Server responded with status "+u.getStatus()))}else c(new ne(j.UNAVAILABLE,"Connection failed."));break;default:de(9055,{l_:e,streamId:o,h_:u.getLastErrorCode(),P_:u.getLastError()})}}finally{ee(Lt,`RPC '${e}' ${o} completed.`)}});const h=JSON.stringify(s);ee(Lt,`RPC '${e}' ${o} sending request:`,s),u.send(n,"POST",h,r,15)})}T_(e,n,r){const s=Gd(),i=[this.Ko,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=Tb(),a=Eb(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(c.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Ho(c.initMessageHeaders,n,r),c.encodeInitMessageHeaders=!0;const h=i.join("");ee(Lt,`Creating RPC '${e}' stream ${s}: ${h}`,c);const f=o.createWebChannel(h,c);let d=!1,m=!1;const _=new zL({Zo:I=>{m?ee(Lt,`Not sending because RPC '${e}' stream ${s} is closed:`,I):(d||(ee(Lt,`Opening RPC '${e}' stream ${s} transport.`),f.open(),d=!0),ee(Lt,`RPC '${e}' stream ${s} sending:`,I),f.send(I))},Xo:()=>f.close()}),y=(I,D,P)=>{I.listen(D,v=>{try{P(v)}catch(R){setTimeout(()=>{throw R},0)}})};return y(f,da.EventType.OPEN,()=>{m||(ee(Lt,`RPC '${e}' stream ${s} transport opened.`),_.__())}),y(f,da.EventType.CLOSE,()=>{m||(m=!0,ee(Lt,`RPC '${e}' stream ${s} transport closed`),_.u_())}),y(f,da.EventType.ERROR,I=>{m||(m=!0,lo(Lt,`RPC '${e}' stream ${s} transport errored. Name:`,I.name,"Message:",I.message),_.u_(new ne(j.UNAVAILABLE,"The operation could not be completed")))}),y(f,da.EventType.MESSAGE,I=>{var D;if(!m){const P=I.data[0];Le(!!P,16349);const v=P,R=(v==null?void 0:v.error)||((D=v[0])===null||D===void 0?void 0:D.error);if(R){ee(Lt,`RPC '${e}' stream ${s} received error:`,R);const x=R.status;let M=function(T){const A=lt[T];if(A!==void 0)return nI(A)}(x),b=R.message;M===void 0&&(M=j.INTERNAL,b="Unknown error status: "+x+" with message "+R.message),m=!0,_.u_(new ne(M,b)),f.close()}else ee(Lt,`RPC '${e}' stream ${s} received:`,P),_.c_(P)}}),y(a,vb.STAT_EVENT,I=>{I.stat===xd.PROXY?ee(Lt,`RPC '${e}' stream ${s} detected buffering proxy`):I.stat===xd.NOPROXY&&ee(Lt,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{_.a_()},0),_}}function Pf(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wh(t){return new JM(t,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gI{constructor(e,n,r=1e3,s=1.5,i=6e4){this.xi=e,this.timerId=n,this.I_=r,this.E_=s,this.d_=i,this.A_=0,this.R_=null,this.V_=Date.now(),this.reset()}reset(){this.A_=0}m_(){this.A_=this.d_}f_(e){this.cancel();const n=Math.floor(this.A_+this.g_()),r=Math.max(0,Date.now()-this.V_),s=Math.max(0,n-r);s>0&&ee("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.A_} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.R_=this.xi.enqueueAfterDelay(this.timerId,s,()=>(this.V_=Date.now(),e())),this.A_*=this.E_,this.A_<this.I_&&(this.A_=this.I_),this.A_>this.d_&&(this.A_=this.d_)}p_(){this.R_!==null&&(this.R_.skipDelay(),this.R_=null)}cancel(){this.R_!==null&&(this.R_.cancel(),this.R_=null)}g_(){return(Math.random()-.5)*this.A_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uv="PersistentStream";class _I{constructor(e,n,r,s,i,o,a,c){this.xi=e,this.y_=r,this.w_=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=a,this.listener=c,this.state=0,this.S_=0,this.b_=null,this.D_=null,this.stream=null,this.v_=0,this.C_=new gI(e,n)}F_(){return this.state===1||this.state===5||this.M_()}M_(){return this.state===2||this.state===3}start(){this.v_=0,this.state!==4?this.auth():this.x_()}async stop(){this.F_()&&await this.close(0)}O_(){this.state=0,this.C_.reset()}N_(){this.M_()&&this.b_===null&&(this.b_=this.xi.enqueueAfterDelay(this.y_,6e4,()=>this.B_()))}L_(e){this.k_(),this.stream.send(e)}async B_(){if(this.M_())return this.close(0)}k_(){this.b_&&(this.b_.cancel(),this.b_=null)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}async close(e,n){this.k_(),this.q_(),this.C_.cancel(),this.S_++,e!==4?this.C_.reset():n&&n.code===j.RESOURCE_EXHAUSTED?(Dr(n.toString()),Dr("Using maximum backoff delay to prevent overloading the backend."),this.C_.m_()):n&&n.code===j.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.Q_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.i_(n)}Q_(){}auth(){this.state=1;const e=this.U_(this.S_),n=this.S_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.S_===n&&this.K_(r,s)},r=>{e(()=>{const s=new ne(j.UNKNOWN,"Fetching auth token failed: "+r.message);return this.W_(s)})})}K_(e,n){const r=this.U_(this.S_);this.stream=this.G_(e,n),this.stream.e_(()=>{r(()=>this.listener.e_())}),this.stream.n_(()=>{r(()=>(this.state=2,this.D_=this.xi.enqueueAfterDelay(this.w_,1e4,()=>(this.M_()&&(this.state=3),Promise.resolve())),this.listener.n_()))}),this.stream.i_(s=>{r(()=>this.W_(s))}),this.stream.onMessage(s=>{r(()=>++this.v_==1?this.z_(s):this.onNext(s))})}x_(){this.state=5,this.C_.f_(async()=>{this.state=0,this.start()})}W_(e){return ee(Uv,`close with error: ${e}`),this.stream=null,this.close(4,e)}U_(e){return n=>{this.xi.enqueueAndForget(()=>this.S_===e?n():(ee(Uv,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class QL extends _I{constructor(e,n,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,s,o),this.serializer=i}G_(e,n){return this.connection.T_("Listen",e,n)}z_(e){return this.onNext(e)}onNext(e){this.C_.reset();const n=tL(this.serializer,e),r=function(i){if(!("targetChange"in i))return pe.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?pe.min():o.readTime?sr(o.readTime):pe.min()}(e);return this.listener.j_(n,r)}H_(e){const n={};n.database=Kd(this.serializer),n.addTarget=function(i,o){let a;const c=o.target;if(a=Bd(c)?{documents:sL(i,c)}:{query:iL(i,c).gt},a.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){a.resumeToken=iI(i,o.resumeToken);const u=Hd(i,o.expectedCount);u!==null&&(a.expectedCount=u)}else if(o.snapshotVersion.compareTo(pe.min())>0){a.readTime=_u(i,o.snapshotVersion.toTimestamp());const u=Hd(i,o.expectedCount);u!==null&&(a.expectedCount=u)}return a}(this.serializer,e);const r=aL(this.serializer,e);r&&(n.labels=r),this.L_(n)}J_(e){const n={};n.database=Kd(this.serializer),n.removeTarget=e,this.L_(n)}}class YL extends _I{constructor(e,n,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,s,o),this.serializer=i}get Y_(){return this.v_>0}start(){this.lastStreamToken=void 0,super.start()}Q_(){this.Y_&&this.Z_([])}G_(e,n){return this.connection.T_("Write",e,n)}z_(e){return Le(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,Le(!e.writeResults||e.writeResults.length===0,55816),this.listener.X_()}onNext(e){Le(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.C_.reset();const n=rL(e.writeResults,e.commitTime),r=sr(e.commitTime);return this.listener.ea(r,n)}ta(){const e={};e.database=Kd(this.serializer),this.L_(e)}Z_(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>nL(this.serializer,r))};this.L_(n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XL{}class JL extends XL{constructor(e,n,r,s){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=s,this.na=!1}ra(){if(this.na)throw new ne(j.FAILED_PRECONDITION,"The client has already been terminated.")}zo(e,n,r,s){return this.ra(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.zo(e,qd(n,r),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===j.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new ne(j.UNKNOWN,i.toString())})}Yo(e,n,r,s,i){return this.ra(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.Yo(e,qd(n,r),s,o,a,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===j.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new ne(j.UNKNOWN,o.toString())})}terminate(){this.na=!0,this.connection.terminate()}}class ZL{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.ia=0,this.sa=null,this.oa=!0}_a(){this.ia===0&&(this.aa("Unknown"),this.sa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.sa=null,this.ua("Backend didn't respond within 10 seconds."),this.aa("Offline"),Promise.resolve())))}ca(e){this.state==="Online"?this.aa("Unknown"):(this.ia++,this.ia>=1&&(this.la(),this.ua(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.aa("Offline")))}set(e){this.la(),this.ia=0,e==="Online"&&(this.oa=!1),this.aa(e)}aa(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ua(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.oa?(Dr(n),this.oa=!1):ee("OnlineStateTracker",n)}la(){this.sa!==null&&(this.sa.cancel(),this.sa=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const si="RemoteStore";class e2{constructor(e,n,r,s,i){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.ha=[],this.Pa=new Map,this.Ta=new Set,this.Ia=[],this.Ea=i,this.Ea.No(o=>{r.enqueueAndForget(async()=>{_i(this)&&(ee(si,"Restarting streams for network reachability change."),await async function(c){const u=ge(c);u.Ta.add(4),await wc(u),u.da.set("Unknown"),u.Ta.delete(4),await bh(u)}(this))})}),this.da=new ZL(r,s)}}async function bh(t){if(_i(t))for(const e of t.Ia)await e(!0)}async function wc(t){for(const e of t.Ia)await e(!1)}function yI(t,e){const n=ge(t);n.Pa.has(e.targetId)||(n.Pa.set(e.targetId,e),Im(n)?bm(n):No(n).M_()&&wm(n,e))}function Tm(t,e){const n=ge(t),r=No(n);n.Pa.delete(e),r.M_()&&vI(n,e),n.Pa.size===0&&(r.M_()?r.N_():_i(n)&&n.da.set("Unknown"))}function wm(t,e){if(t.Aa.Ke(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(pe.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}No(t).H_(e)}function vI(t,e){t.Aa.Ke(e),No(t).J_(e)}function bm(t){t.Aa=new GM({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),Rt:e=>t.Pa.get(e)||null,Pt:()=>t.datastore.serializer.databaseId}),No(t).start(),t.da._a()}function Im(t){return _i(t)&&!No(t).F_()&&t.Pa.size>0}function _i(t){return ge(t).Ta.size===0}function EI(t){t.Aa=void 0}async function t2(t){t.da.set("Online")}async function n2(t){t.Pa.forEach((e,n)=>{wm(t,e)})}async function r2(t,e){EI(t),Im(t)?(t.da.ca(e),bm(t)):t.da.set("Unknown")}async function s2(t,e,n){if(t.da.set("Online"),e instanceof sI&&e.state===2&&e.cause)try{await async function(s,i){const o=i.cause;for(const a of i.targetIds)s.Pa.has(a)&&(await s.remoteSyncer.rejectListen(a,o),s.Pa.delete(a),s.Aa.removeTarget(a))}(t,e)}catch(r){ee(si,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await vu(t,r)}else if(e instanceof Nl?t.Aa.Xe(e):e instanceof rI?t.Aa.ot(e):t.Aa.nt(e),!n.isEqual(pe.min()))try{const r=await mI(t.localStore);n.compareTo(r)>=0&&await function(i,o){const a=i.Aa.It(o);return a.targetChanges.forEach((c,u)=>{if(c.resumeToken.approximateByteSize()>0){const h=i.Pa.get(u);h&&i.Pa.set(u,h.withResumeToken(c.resumeToken,o))}}),a.targetMismatches.forEach((c,u)=>{const h=i.Pa.get(c);if(!h)return;i.Pa.set(c,h.withResumeToken(Nt.EMPTY_BYTE_STRING,h.snapshotVersion)),vI(i,c);const f=new as(h.target,c,u,h.sequenceNumber);wm(i,f)}),i.remoteSyncer.applyRemoteEvent(a)}(t,n)}catch(r){ee(si,"Failed to raise snapshot:",r),await vu(t,r)}}async function vu(t,e,n){if(!Po(e))throw e;t.Ta.add(1),await wc(t),t.da.set("Offline"),n||(n=()=>mI(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{ee(si,"Retrying IndexedDB access"),await n(),t.Ta.delete(1),await bh(t)})}function TI(t,e){return e().catch(n=>vu(t,n,e))}async function Ih(t){const e=ge(t),n=As(e);let r=e.ha.length>0?e.ha[e.ha.length-1].batchId:am;for(;i2(e);)try{const s=await BL(e.localStore,r);if(s===null){e.ha.length===0&&n.N_();break}r=s.batchId,o2(e,s)}catch(s){await vu(e,s)}wI(e)&&bI(e)}function i2(t){return _i(t)&&t.ha.length<10}function o2(t,e){t.ha.push(e);const n=As(t);n.M_()&&n.Y_&&n.Z_(e.mutations)}function wI(t){return _i(t)&&!As(t).F_()&&t.ha.length>0}function bI(t){As(t).start()}async function a2(t){As(t).ta()}async function c2(t){const e=As(t);for(const n of t.ha)e.Z_(n.mutations)}async function l2(t,e,n){const r=t.ha.shift(),s=pm.from(r,e,n);await TI(t,()=>t.remoteSyncer.applySuccessfulWrite(s)),await Ih(t)}async function u2(t,e){e&&As(t).Y_&&await async function(r,s){if(function(o){return KM(o)&&o!==j.ABORTED}(s.code)){const i=r.ha.shift();As(r).O_(),await TI(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await Ih(r)}}(t,e),wI(t)&&bI(t)}async function Bv(t,e){const n=ge(t);n.asyncQueue.verifyOperationInProgress(),ee(si,"RemoteStore received new credentials");const r=_i(n);n.Ta.add(3),await wc(n),r&&n.da.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ta.delete(3),await bh(n)}async function h2(t,e){const n=ge(t);e?(n.Ta.delete(2),await bh(n)):e||(n.Ta.add(2),await wc(n),n.da.set("Unknown"))}function No(t){return t.Ra||(t.Ra=function(n,r,s){const i=ge(n);return i.ra(),new QL(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{e_:t2.bind(null,t),n_:n2.bind(null,t),i_:r2.bind(null,t),j_:s2.bind(null,t)}),t.Ia.push(async e=>{e?(t.Ra.O_(),Im(t)?bm(t):t.da.set("Unknown")):(await t.Ra.stop(),EI(t))})),t.Ra}function As(t){return t.Va||(t.Va=function(n,r,s){const i=ge(n);return i.ra(),new YL(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{e_:()=>Promise.resolve(),n_:a2.bind(null,t),i_:u2.bind(null,t),X_:c2.bind(null,t),ea:l2.bind(null,t)}),t.Ia.push(async e=>{e?(t.Va.O_(),await Ih(t)):(await t.Va.stop(),t.ha.length>0&&(ee(si,`Stopping write stream with ${t.ha.length} pending writes`),t.ha=[]))})),t.Va}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Am{constructor(e,n,r,s,i){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new br,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,s,i){const o=Date.now()+r,a=new Am(e,n,o,s,i);return a.start(r),a}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new ne(j.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Rm(t,e){if(Dr("AsyncQueue",`${e}: ${t}`),Po(t))return new ne(j.UNAVAILABLE,`${e}: ${t}`);throw t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xi{static emptySet(e){return new Xi(e.comparator)}constructor(e){this.comparator=e?(n,r)=>e(n,r)||le.comparator(n.key,r.key):(n,r)=>le.comparator(n.key,r.key),this.keyedMap=pa(),this.sortedSet=new pt(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof Xi)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const r=new Xi;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=n,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $v{constructor(){this.ma=new pt(le.comparator)}track(e){const n=e.doc.key,r=this.ma.get(n);r?e.type!==0&&r.type===3?this.ma=this.ma.insert(n,e):e.type===3&&r.type!==1?this.ma=this.ma.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.ma=this.ma.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.ma=this.ma.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.ma=this.ma.remove(n):e.type===1&&r.type===2?this.ma=this.ma.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.ma=this.ma.insert(n,{type:2,doc:e.doc}):de(63341,{Vt:e,fa:r}):this.ma=this.ma.insert(n,e)}ga(){const e=[];return this.ma.inorderTraversal((n,r)=>{e.push(r)}),e}}class go{constructor(e,n,r,s,i,o,a,c,u){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=a,this.excludesMetadataChanges=c,this.hasCachedResults=u}static fromInitialDocuments(e,n,r,s,i){const o=[];return n.forEach(a=>{o.push({type:0,doc:a})}),new go(e,n,Xi.emptySet(n),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&_h(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let s=0;s<n.length;s++)if(n[s].type!==r[s].type||!n[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f2{constructor(){this.pa=void 0,this.ya=[]}wa(){return this.ya.some(e=>e.Sa())}}class d2{constructor(){this.queries=jv(),this.onlineState="Unknown",this.ba=new Set}terminate(){(function(n,r){const s=ge(n),i=s.queries;s.queries=jv(),i.forEach((o,a)=>{for(const c of a.ya)c.onError(r)})})(this,new ne(j.ABORTED,"Firestore shutting down"))}}function jv(){return new gi(t=>Hb(t),_h)}async function Cm(t,e){const n=ge(t);let r=3;const s=e.query;let i=n.queries.get(s);i?!i.wa()&&e.Sa()&&(r=2):(i=new f2,r=e.Sa()?0:1);try{switch(r){case 0:i.pa=await n.onListen(s,!0);break;case 1:i.pa=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(o){const a=Rm(o,`Initialization of query '${Mi(e.query)}' failed`);return void e.onError(a)}n.queries.set(s,i),i.ya.push(e),e.Da(n.onlineState),i.pa&&e.va(i.pa)&&km(n)}async function Sm(t,e){const n=ge(t),r=e.query;let s=3;const i=n.queries.get(r);if(i){const o=i.ya.indexOf(e);o>=0&&(i.ya.splice(o,1),i.ya.length===0?s=e.Sa()?0:1:!i.wa()&&e.Sa()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function p2(t,e){const n=ge(t);let r=!1;for(const s of e){const i=s.query,o=n.queries.get(i);if(o){for(const a of o.ya)a.va(s)&&(r=!0);o.pa=s}}r&&km(n)}function m2(t,e,n){const r=ge(t),s=r.queries.get(e);if(s)for(const i of s.ya)i.onError(n);r.queries.delete(e)}function km(t){t.ba.forEach(e=>{e.next()})}var Qd,Hv;(Hv=Qd||(Qd={})).Ca="default",Hv.Cache="cache";class Pm{constructor(e,n,r){this.query=e,this.Fa=n,this.Ma=!1,this.xa=null,this.onlineState="Unknown",this.options=r||{}}va(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new go(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Ma?this.Oa(e)&&(this.Fa.next(e),n=!0):this.Na(e,this.onlineState)&&(this.Ba(e),n=!0),this.xa=e,n}onError(e){this.Fa.error(e)}Da(e){this.onlineState=e;let n=!1;return this.xa&&!this.Ma&&this.Na(this.xa,e)&&(this.Ba(this.xa),n=!0),n}Na(e,n){if(!e.fromCache||!this.Sa())return!0;const r=n!=="Offline";return(!this.options.La||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Oa(e){if(e.docChanges.length>0)return!0;const n=this.xa&&this.xa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}Ba(e){e=go.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Ma=!0,this.Fa.next(e)}Sa(){return this.options.source!==Qd.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class II{constructor(e){this.key=e}}class AI{constructor(e){this.key=e}}class g2{constructor(e,n){this.query=e,this.Ga=n,this.za=null,this.hasCachedResults=!1,this.current=!1,this.ja=Te(),this.mutatedKeys=Te(),this.Ha=qb(e),this.Ja=new Xi(this.Ha)}get Ya(){return this.Ga}Za(e,n){const r=n?n.Xa:new $v,s=n?n.Ja:this.Ja;let i=n?n.mutatedKeys:this.mutatedKeys,o=s,a=!1;const c=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,u=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((h,f)=>{const d=s.get(h),m=yh(this.query,f)?f:null,_=!!d&&this.mutatedKeys.has(d.key),y=!!m&&(m.hasLocalMutations||this.mutatedKeys.has(m.key)&&m.hasCommittedMutations);let I=!1;d&&m?d.data.isEqual(m.data)?_!==y&&(r.track({type:3,doc:m}),I=!0):this.eu(d,m)||(r.track({type:2,doc:m}),I=!0,(c&&this.Ha(m,c)>0||u&&this.Ha(m,u)<0)&&(a=!0)):!d&&m?(r.track({type:0,doc:m}),I=!0):d&&!m&&(r.track({type:1,doc:d}),I=!0,(c||u)&&(a=!0)),I&&(m?(o=o.add(m),i=y?i.add(h):i.delete(h)):(o=o.delete(h),i=i.delete(h)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const h=this.query.limitType==="F"?o.last():o.first();o=o.delete(h.key),i=i.delete(h.key),r.track({type:1,doc:h})}return{Ja:o,Xa:r,Cs:a,mutatedKeys:i}}eu(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,s){const i=this.Ja;this.Ja=e.Ja,this.mutatedKeys=e.mutatedKeys;const o=e.Xa.ga();o.sort((h,f)=>function(m,_){const y=I=>{switch(I){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return de(20277,{Vt:I})}};return y(m)-y(_)}(h.type,f.type)||this.Ha(h.doc,f.doc)),this.tu(r),s=s!=null&&s;const a=n&&!s?this.nu():[],c=this.ja.size===0&&this.current&&!s?1:0,u=c!==this.za;return this.za=c,o.length!==0||u?{snapshot:new go(this.query,e.Ja,i,o,e.mutatedKeys,c===0,u,!1,!!r&&r.resumeToken.approximateByteSize()>0),ru:a}:{ru:a}}Da(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ja:this.Ja,Xa:new $v,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{ru:[]}}iu(e){return!this.Ga.has(e)&&!!this.Ja.has(e)&&!this.Ja.get(e).hasLocalMutations}tu(e){e&&(e.addedDocuments.forEach(n=>this.Ga=this.Ga.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ga=this.Ga.delete(n)),this.current=e.current)}nu(){if(!this.current)return[];const e=this.ja;this.ja=Te(),this.Ja.forEach(r=>{this.iu(r.key)&&(this.ja=this.ja.add(r.key))});const n=[];return e.forEach(r=>{this.ja.has(r)||n.push(new AI(r))}),this.ja.forEach(r=>{e.has(r)||n.push(new II(r))}),n}su(e){this.Ga=e.$s,this.ja=Te();const n=this.Za(e.documents);return this.applyChanges(n,!0)}ou(){return go.fromInitialDocuments(this.query,this.Ja,this.mutatedKeys,this.za===0,this.hasCachedResults)}}const Nm="SyncEngine";class _2{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class y2{constructor(e){this.key=e,this._u=!1}}class v2{constructor(e,n,r,s,i,o){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.au={},this.uu=new gi(a=>Hb(a),_h),this.cu=new Map,this.lu=new Set,this.hu=new pt(le.comparator),this.Pu=new Map,this.Tu=new _m,this.Iu={},this.Eu=new Map,this.du=mo.lr(),this.onlineState="Unknown",this.Au=void 0}get isPrimaryClient(){return this.Au===!0}}async function E2(t,e,n=!0){const r=NI(t);let s;const i=r.uu.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.ou()):s=await RI(r,e,n,!0),s}async function T2(t,e){const n=NI(t);await RI(n,e,!0,!1)}async function RI(t,e,n,r){const s=await $L(t.localStore,rr(e)),i=s.targetId,o=t.sharedClientState.addLocalQueryTarget(i,n);let a;return r&&(a=await w2(t,e,i,o==="current",s.resumeToken)),t.isPrimaryClient&&n&&yI(t.remoteStore,s),a}async function w2(t,e,n,r,s){t.Ru=(f,d,m)=>async function(y,I,D,P){let v=I.view.Za(D);v.Cs&&(v=await Mv(y.localStore,I.query,!1).then(({documents:b})=>I.view.Za(b,v)));const R=P&&P.targetChanges.get(I.targetId),x=P&&P.targetMismatches.get(I.targetId)!=null,M=I.view.applyChanges(v,y.isPrimaryClient,R,x);return Wv(y,I.targetId,M.ru),M.snapshot}(t,f,d,m);const i=await Mv(t.localStore,e,!0),o=new g2(e,i.$s),a=o.Za(i.documents),c=Tc.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",s),u=o.applyChanges(a,t.isPrimaryClient,c);Wv(t,n,u.ru);const h=new _2(e,n,o);return t.uu.set(e,h),t.cu.has(n)?t.cu.get(n).push(e):t.cu.set(n,[e]),u.snapshot}async function b2(t,e,n){const r=ge(t),s=r.uu.get(e),i=r.cu.get(s.targetId);if(i.length>1)return r.cu.set(s.targetId,i.filter(o=>!_h(o,e))),void r.uu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await zd(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&Tm(r.remoteStore,s.targetId),Yd(r,s.targetId)}).catch(ko)):(Yd(r,s.targetId),await zd(r.localStore,s.targetId,!0))}async function I2(t,e){const n=ge(t),r=n.uu.get(e),s=n.cu.get(r.targetId);n.isPrimaryClient&&s.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),Tm(n.remoteStore,r.targetId))}async function A2(t,e,n){const r=O2(t);try{const s=await function(o,a){const c=ge(o),u=dt.now(),h=a.reduce((m,_)=>m.add(_.key),Te());let f,d;return c.persistence.runTransaction("Locally write mutations","readwrite",m=>{let _=xr(),y=Te();return c.Bs.getEntries(m,h).next(I=>{_=I,_.forEach((D,P)=>{P.isValidDocument()||(y=y.add(D))})}).next(()=>c.localDocuments.getOverlayedDocuments(m,_)).next(I=>{f=I;const D=[];for(const P of a){const v=$M(P,f.get(P.key).overlayedDocument);v!=null&&D.push(new ks(P.key,v,Mb(v.value.mapValue),Rn.exists(!0)))}return c.mutationQueue.addMutationBatch(m,u,D,a)}).next(I=>{d=I;const D=I.applyToLocalDocumentSet(f,y);return c.documentOverlayCache.saveOverlays(m,I.batchId,D)})}).then(()=>({batchId:d.batchId,changes:Kb(f)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(o,a,c){let u=o.Iu[o.currentUser.toKey()];u||(u=new pt(ye)),u=u.insert(a,c),o.Iu[o.currentUser.toKey()]=u}(r,s.batchId,n),await bc(r,s.changes),await Ih(r.remoteStore)}catch(s){const i=Rm(s,"Failed to persist write");n.reject(i)}}async function CI(t,e){const n=ge(t);try{const r=await FL(n.localStore,e);e.targetChanges.forEach((s,i)=>{const o=n.Pu.get(i);o&&(Le(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o._u=!0:s.modifiedDocuments.size>0?Le(o._u,14607):s.removedDocuments.size>0&&(Le(o._u,42227),o._u=!1))}),await bc(n,r,e)}catch(r){await ko(r)}}function qv(t,e,n){const r=ge(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const s=[];r.uu.forEach((i,o)=>{const a=o.view.Da(e);a.snapshot&&s.push(a.snapshot)}),function(o,a){const c=ge(o);c.onlineState=a;let u=!1;c.queries.forEach((h,f)=>{for(const d of f.ya)d.Da(a)&&(u=!0)}),u&&km(c)}(r.eventManager,e),s.length&&r.au.j_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function R2(t,e,n){const r=ge(t);r.sharedClientState.updateQueryState(e,"rejected",n);const s=r.Pu.get(e),i=s&&s.key;if(i){let o=new pt(le.comparator);o=o.insert(i,Bt.newNoDocument(i,pe.min()));const a=Te().add(i),c=new Th(pe.min(),new Map,new pt(ye),o,a);await CI(r,c),r.hu=r.hu.remove(i),r.Pu.delete(e),Om(r)}else await zd(r.localStore,e,!1).then(()=>Yd(r,e,n)).catch(ko)}async function C2(t,e){const n=ge(t),r=e.batch.batchId;try{const s=await VL(n.localStore,e);kI(n,r,null),SI(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await bc(n,s)}catch(s){await ko(s)}}async function S2(t,e,n){const r=ge(t);try{const s=await function(o,a){const c=ge(o);return c.persistence.runTransaction("Reject batch","readwrite-primary",u=>{let h;return c.mutationQueue.lookupMutationBatch(u,a).next(f=>(Le(f!==null,37113),h=f.keys(),c.mutationQueue.removeMutationBatch(u,f))).next(()=>c.mutationQueue.performConsistencyCheck(u)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(u,h,a)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,h)).next(()=>c.localDocuments.getDocuments(u,h))})}(r.localStore,e);kI(r,e,n),SI(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await bc(r,s)}catch(s){await ko(s)}}function SI(t,e){(t.Eu.get(e)||[]).forEach(n=>{n.resolve()}),t.Eu.delete(e)}function kI(t,e,n){const r=ge(t);let s=r.Iu[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(n?i.reject(n):i.resolve(),s=s.remove(e)),r.Iu[r.currentUser.toKey()]=s}}function Yd(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.cu.get(e))t.uu.delete(r),n&&t.au.Vu(r,n);t.cu.delete(e),t.isPrimaryClient&&t.Tu.Hr(e).forEach(r=>{t.Tu.containsKey(r)||PI(t,r)})}function PI(t,e){t.lu.delete(e.path.canonicalString());const n=t.hu.get(e);n!==null&&(Tm(t.remoteStore,n),t.hu=t.hu.remove(e),t.Pu.delete(n),Om(t))}function Wv(t,e,n){for(const r of n)r instanceof II?(t.Tu.addReference(r.key,e),k2(t,r)):r instanceof AI?(ee(Nm,"Document no longer in limbo: "+r.key),t.Tu.removeReference(r.key,e),t.Tu.containsKey(r.key)||PI(t,r.key)):de(19791,{mu:r})}function k2(t,e){const n=e.key,r=n.path.canonicalString();t.hu.get(n)||t.lu.has(r)||(ee(Nm,"New document in limbo: "+n),t.lu.add(r),Om(t))}function Om(t){for(;t.lu.size>0&&t.hu.size<t.maxConcurrentLimboResolutions;){const e=t.lu.values().next().value;t.lu.delete(e);const n=new le(Qe.fromString(e)),r=t.du.next();t.Pu.set(r,new y2(n)),t.hu=t.hu.insert(n,r),yI(t.remoteStore,new as(rr(gh(n.path)),r,"TargetPurposeLimboResolution",dh.le))}}async function bc(t,e,n){const r=ge(t),s=[],i=[],o=[];r.uu.isEmpty()||(r.uu.forEach((a,c)=>{o.push(r.Ru(c,e,n).then(u=>{var h;if((u||n)&&r.isPrimaryClient){const f=u?!u.fromCache:(h=n==null?void 0:n.targetChanges.get(c.targetId))===null||h===void 0?void 0:h.current;r.sharedClientState.updateQueryState(c.targetId,f?"current":"not-current")}if(u){s.push(u);const f=vm.Rs(c.targetId,u);i.push(f)}}))}),await Promise.all(o),r.au.j_(s),await async function(c,u){const h=ge(c);try{await h.persistence.runTransaction("notifyLocalViewChanges","readwrite",f=>$.forEach(u,d=>$.forEach(d.ds,m=>h.persistence.referenceDelegate.addReference(f,d.targetId,m)).next(()=>$.forEach(d.As,m=>h.persistence.referenceDelegate.removeReference(f,d.targetId,m)))))}catch(f){if(!Po(f))throw f;ee(Em,"Failed to update sequence numbers: "+f)}for(const f of u){const d=f.targetId;if(!f.fromCache){const m=h.xs.get(d),_=m.snapshotVersion,y=m.withLastLimboFreeSnapshotVersion(_);h.xs=h.xs.insert(d,y)}}}(r.localStore,i))}async function P2(t,e){const n=ge(t);if(!n.currentUser.isEqual(e)){ee(Nm,"User change. New user:",e.toKey());const r=await pI(n.localStore,e);n.currentUser=e,function(i,o){i.Eu.forEach(a=>{a.forEach(c=>{c.reject(new ne(j.CANCELLED,o))})}),i.Eu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await bc(n,r.ks)}}function N2(t,e){const n=ge(t),r=n.Pu.get(e);if(r&&r._u)return Te().add(r.key);{let s=Te();const i=n.cu.get(e);if(!i)return s;for(const o of i){const a=n.uu.get(o);s=s.unionWith(a.view.Ya)}return s}}function NI(t){const e=ge(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=CI.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=N2.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=R2.bind(null,e),e.au.j_=p2.bind(null,e.eventManager),e.au.Vu=m2.bind(null,e.eventManager),e}function O2(t){const e=ge(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=C2.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=S2.bind(null,e),e}class Eu{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=wh(e.databaseInfo.databaseId),this.sharedClientState=this.pu(e),this.persistence=this.yu(e),await this.persistence.start(),this.localStore=this.wu(e),this.gcScheduler=this.Su(e,this.localStore),this.indexBackfillerScheduler=this.bu(e,this.localStore)}Su(e,n){return null}bu(e,n){return null}wu(e){return LL(this.persistence,new DL,e.initialUser,this.serializer)}yu(e){return new dI(ym.fi,this.serializer)}pu(e){return new HL}async terminate(){var e,n;(e=this.gcScheduler)===null||e===void 0||e.stop(),(n=this.indexBackfillerScheduler)===null||n===void 0||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Eu.provider={build:()=>new Eu};class D2 extends Eu{constructor(e){super(),this.cacheSizeBytes=e}Su(e,n){Le(this.persistence.referenceDelegate instanceof yu,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new yL(r,e.asyncQueue,n)}yu(e){const n=this.cacheSizeBytes!==void 0?nn.withCacheSize(this.cacheSizeBytes):nn.DEFAULT;return new dI(r=>yu.fi(r,n),this.serializer)}}class Xd{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>qv(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=P2.bind(null,this.syncEngine),await h2(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new d2}()}createDatastore(e){const n=wh(e.databaseInfo.databaseId),r=function(i){return new GL(i)}(e.databaseInfo);return function(i,o,a,c){return new JL(i,o,a,c)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,s,i,o,a){return new e2(r,s,i,o,a)}(this.localStore,this.datastore,e.asyncQueue,n=>qv(this.syncEngine,n,0),function(){return Fv.C()?new Fv:new qL}())}createSyncEngine(e,n){return function(s,i,o,a,c,u,h){const f=new v2(s,i,o,a,c,u);return h&&(f.Au=!0),f}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(s){const i=ge(s);ee(si,"RemoteStore shutting down."),i.Ta.add(5),await wc(i),i.Ea.shutdown(),i.da.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(n=this.eventManager)===null||n===void 0||n.terminate()}}Xd.provider={build:()=>new Xd};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dm{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.vu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.vu(this.observer.error,e):Dr("Uncaught Error in snapshot listener:",e.toString()))}Cu(){this.muted=!0}vu(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rs="FirestoreClient";class x2{constructor(e,n,r,s,i){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=s,this.user=Ft.UNAUTHENTICATED,this.clientId=Ab.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async o=>{ee(Rs,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(ee(Rs,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new br;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=Rm(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Nf(t,e){t.asyncQueue.verifyOperationInProgress(),ee(Rs,"Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async s=>{r.isEqual(s)||(await pI(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Kv(t,e){t.asyncQueue.verifyOperationInProgress();const n=await M2(t);ee(Rs,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>Bv(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,s)=>Bv(e.remoteStore,s)),t._onlineComponents=e}async function M2(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){ee(Rs,"Using user provided OfflineComponentProvider");try{await Nf(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(s){return s.name==="FirebaseError"?s.code===j.FAILED_PRECONDITION||s.code===j.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(n))throw n;lo("Error using user provided cache. Falling back to memory cache: "+n),await Nf(t,new Eu)}}else ee(Rs,"Using default OfflineComponentProvider"),await Nf(t,new D2(void 0));return t._offlineComponents}async function OI(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(ee(Rs,"Using user provided OnlineComponentProvider"),await Kv(t,t._uninitializedComponentsProvider._online)):(ee(Rs,"Using default OnlineComponentProvider"),await Kv(t,new Xd))),t._onlineComponents}function L2(t){return OI(t).then(e=>e.syncEngine)}async function Tu(t){const e=await OI(t),n=e.eventManager;return n.onListen=E2.bind(null,e.syncEngine),n.onUnlisten=b2.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=T2.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=I2.bind(null,e.syncEngine),n}function V2(t,e,n={}){const r=new br;return t.asyncQueue.enqueueAndForget(async()=>function(i,o,a,c,u){const h=new Dm({next:d=>{h.Cu(),o.enqueueAndForget(()=>Sm(i,f));const m=d.docs.has(a);!m&&d.fromCache?u.reject(new ne(j.UNAVAILABLE,"Failed to get document because the client is offline.")):m&&d.fromCache&&c&&c.source==="server"?u.reject(new ne(j.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(d)},error:d=>u.reject(d)}),f=new Pm(gh(a.path),h,{includeMetadataChanges:!0,La:!0});return Cm(i,f)}(await Tu(t),t.asyncQueue,e,n,r)),r.promise}function F2(t,e,n={}){const r=new br;return t.asyncQueue.enqueueAndForget(async()=>function(i,o,a,c,u){const h=new Dm({next:d=>{h.Cu(),o.enqueueAndForget(()=>Sm(i,f)),d.fromCache&&c.source==="server"?u.reject(new ne(j.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(d)},error:d=>u.reject(d)}),f=new Pm(a,h,{includeMetadataChanges:!0,La:!0});return Cm(i,f)}(await Tu(t),t.asyncQueue,e,n,r)),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function DI(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zv=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xI(t,e,n){if(!n)throw new ne(j.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function U2(t,e,n,r){if(e===!0&&r===!0)throw new ne(j.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function Gv(t){if(!le.isDocumentKey(t))throw new ne(j.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function Qv(t){if(le.isDocumentKey(t))throw new ne(j.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function Ah(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":de(12329,{type:typeof t})}function cn(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new ne(j.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=Ah(t);throw new ne(j.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const MI="firestore.googleapis.com",Yv=!0;class Xv{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new ne(j.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=MI,this.ssl=Yv}else this.host=e.host,this.ssl=(n=e.ssl)!==null&&n!==void 0?n:Yv;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=fI;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<gL)throw new ne(j.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}U2("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=DI((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new ne(j.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new ne(j.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new ne(j.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Rh{constructor(e,n,r,s){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Xv({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new ne(j.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new ne(j.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Xv(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new zx;switch(r.type){case"firstParty":return new Xx(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new ne(j.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=zv.get(n);r&&(ee("ComponentProvider","Removing Datastore"),zv.delete(n),r.terminate())}(this),Promise.resolve()}}function B2(t,e,n,r={}){var s;t=cn(t,Rh);const i=Ao(e),o=t._getSettings(),a=Object.assign(Object.assign({},o),{emulatorOptions:t._getEmulatorOptions()}),c=`${e}:${n}`;i&&(ib(`https://${c}`),ab("Firestore",!0)),o.host!==MI&&o.host!==c&&lo("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u=Object.assign(Object.assign({},o),{host:c,ssl:i,emulatorOptions:r});if(!Za(u,a)&&(t._setSettings(u),r.mockUserToken)){let h,f;if(typeof r.mockUserToken=="string")h=r.mockUserToken,f=Ft.MOCK_USER;else{h=ob(r.mockUserToken,(s=t._app)===null||s===void 0?void 0:s.options.projectId);const d=r.mockUserToken.sub||r.mockUserToken.user_id;if(!d)throw new ne(j.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new Ft(d)}t._authCredentials=new Gx(new bb(h,f))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yi{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new yi(this.firestore,e,this._query)}}class Kt{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new ms(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Kt(this.firestore,e,this._key)}}class ms extends yi{constructor(e,n,r){super(e,n,gh(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Kt(this.firestore,null,new le(e))}withConverter(e){return new ms(this.firestore,e,this._path)}}function Ui(t,e,...n){if(t=Je(t),xI("collection","path",e),t instanceof Rh){const r=Qe.fromString(e,...n);return Qv(r),new ms(t,null,r)}{if(!(t instanceof Kt||t instanceof ms))throw new ne(j.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Qe.fromString(e,...n));return Qv(r),new ms(t.firestore,null,r)}}function On(t,e,...n){if(t=Je(t),arguments.length===1&&(e=Ab.newId()),xI("doc","path",e),t instanceof Rh){const r=Qe.fromString(e,...n);return Gv(r),new Kt(t,null,new le(r))}{if(!(t instanceof Kt||t instanceof ms))throw new ne(j.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Qe.fromString(e,...n));return Gv(r),new Kt(t.firestore,t instanceof ms?t.converter:null,new le(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jv="AsyncQueue";class Zv{constructor(e=Promise.resolve()){this.zu=[],this.ju=!1,this.Hu=[],this.Ju=null,this.Yu=!1,this.Zu=!1,this.Xu=[],this.C_=new gI(this,"async_queue_retry"),this.ec=()=>{const r=Pf();r&&ee(Jv,"Visibility state changed to "+r.visibilityState),this.C_.p_()},this.tc=e;const n=Pf();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.ec)}get isShuttingDown(){return this.ju}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.nc(),this.rc(e)}enterRestrictedMode(e){if(!this.ju){this.ju=!0,this.Zu=e||!1;const n=Pf();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.ec)}}enqueue(e){if(this.nc(),this.ju)return new Promise(()=>{});const n=new br;return this.rc(()=>this.ju&&this.Zu?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.zu.push(e),this.sc()))}async sc(){if(this.zu.length!==0){try{await this.zu[0](),this.zu.shift(),this.C_.reset()}catch(e){if(!Po(e))throw e;ee(Jv,"Operation failed with retryable error: "+e)}this.zu.length>0&&this.C_.f_(()=>this.sc())}}rc(e){const n=this.tc.then(()=>(this.Yu=!0,e().catch(r=>{throw this.Ju=r,this.Yu=!1,Dr("INTERNAL UNHANDLED ERROR: ",eE(r)),r}).then(r=>(this.Yu=!1,r))));return this.tc=n,n}enqueueAfterDelay(e,n,r){this.nc(),this.Xu.indexOf(e)>-1&&(n=0);const s=Am.createAndSchedule(this,e,n,r,i=>this.oc(i));return this.Hu.push(s),s}nc(){this.Ju&&de(47125,{_c:eE(this.Ju)})}verifyOperationInProgress(){}async ac(){let e;do e=this.tc,await e;while(e!==this.tc)}uc(e){for(const n of this.Hu)if(n.timerId===e)return!0;return!1}cc(e){return this.ac().then(()=>{this.Hu.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.Hu)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.ac()})}lc(e){this.Xu.push(e)}oc(e){const n=this.Hu.indexOf(e);this.Hu.splice(n,1)}}function eE(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tE(t){return function(n,r){if(typeof n!="object"||n===null)return!1;const s=n;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1}(t,["next","error","complete"])}class Mr extends Rh{constructor(e,n,r,s){super(e,n,r,s),this.type="firestore",this._queue=new Zv,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Zv(e),this._firestoreClient=void 0,await e}}}function $2(t,e){const n=typeof t=="object"?t:im(),r=typeof t=="string"?t:fu,s=db(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=rb("firestore");i&&B2(s,...i)}return s}function Ch(t){if(t._terminated)throw new ne(j.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||j2(t),t._firestoreClient}function j2(t){var e,n,r;const s=t._freezeSettings(),i=function(a,c,u,h){return new fM(a,c,u,h.host,h.ssl,h.experimentalForceLongPolling,h.experimentalAutoDetectLongPolling,DI(h.experimentalLongPollingOptions),h.useFetchStreams,h.isUsingEmulator)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,s);t._componentsProvider||!((n=s.localCache)===null||n===void 0)&&n._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(t._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),t._firestoreClient=new x2(t._authCredentials,t._appCheckCredentials,t._queue,i,t._componentsProvider&&function(a){const c=a==null?void 0:a._online.build();return{_offline:a==null?void 0:a._offline.build(c),_online:c}}(t._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _o{constructor(e){this._byteString=e}static fromBase64String(e){try{return new _o(Nt.fromBase64String(e))}catch(n){throw new ne(j.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new _o(Nt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sh{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new ne(j.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Pt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ic{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kh{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new ne(j.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new ne(j.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return ye(this._lat,e._lat)||ye(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xm{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const H2=/^__.*__$/;class q2{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new ks(e,this.data,this.fieldMask,n,this.fieldTransforms):new Ec(e,this.data,n,this.fieldTransforms)}}class LI{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new ks(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function VI(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw de(40011,{hc:t})}}class Ph{constructor(e,n,r,s,i,o){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.Pc(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get hc(){return this.settings.hc}Tc(e){return new Ph(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Ic(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Tc({path:r,Ec:!1});return s.dc(e),s}Ac(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Tc({path:r,Ec:!1});return s.Pc(),s}Rc(e){return this.Tc({path:void 0,Ec:!0})}Vc(e){return wu(e,this.settings.methodName,this.settings.mc||!1,this.path,this.settings.fc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}Pc(){if(this.path)for(let e=0;e<this.path.length;e++)this.dc(this.path.get(e))}dc(e){if(e.length===0)throw this.Vc("Document fields must not be empty");if(VI(this.hc)&&H2.test(e))throw this.Vc('Document fields cannot begin and end with "__"')}}class W2{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||wh(e)}gc(e,n,r,s=!1){return new Ph({hc:e,methodName:n,fc:r,path:Pt.emptyPath(),Ec:!1,mc:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Nh(t){const e=t._freezeSettings(),n=wh(t._databaseId);return new W2(t._databaseId,!!e.ignoreUndefinedProperties,n)}function FI(t,e,n,r,s,i={}){const o=t.gc(i.merge||i.mergeFields?2:0,e,n,s);Vm("Data must be an object, but it was:",o,r);const a=UI(r,o);let c,u;if(i.merge)c=new fn(o.fieldMask),u=o.fieldTransforms;else if(i.mergeFields){const h=[];for(const f of i.mergeFields){const d=Jd(e,f,n);if(!o.contains(d))throw new ne(j.INVALID_ARGUMENT,`Field '${d}' is specified in your field mask but missing from your input data.`);$I(h,d)||h.push(d)}c=new fn(h),u=o.fieldTransforms.filter(f=>c.covers(f.field))}else c=null,u=o.fieldTransforms;return new q2(new on(a),c,u)}class Oh extends Ic{_toFieldTransform(e){if(e.hc!==2)throw e.hc===1?e.Vc(`${this._methodName}() can only appear at the top level of your update data`):e.Vc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Oh}}function K2(t,e,n){return new Ph({hc:3,fc:e.settings.fc,methodName:t._methodName,Ec:n},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class Mm extends Ic{_toFieldTransform(e){return new Zb(e.path,new ic)}isEqual(e){return e instanceof Mm}}class Lm extends Ic{constructor(e,n){super(e),this.yc=n}_toFieldTransform(e){const n=K2(this,e,!0),r=this.yc.map(i=>Oo(i,n)),s=new po(r);return new Zb(e.path,s)}isEqual(e){return e instanceof Lm&&Za(this.yc,e.yc)}}function z2(t,e,n,r){const s=t.gc(1,e,n);Vm("Data must be an object, but it was:",s,r);const i=[],o=on.empty();Ss(r,(c,u)=>{const h=Fm(e,c,n);u=Je(u);const f=s.Ac(h);if(u instanceof Oh)i.push(h);else{const d=Oo(u,f);d!=null&&(i.push(h),o.set(h,d))}});const a=new fn(i);return new LI(o,a,s.fieldTransforms)}function G2(t,e,n,r,s,i){const o=t.gc(1,e,n),a=[Jd(e,r,n)],c=[s];if(i.length%2!=0)throw new ne(j.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let d=0;d<i.length;d+=2)a.push(Jd(e,i[d])),c.push(i[d+1]);const u=[],h=on.empty();for(let d=a.length-1;d>=0;--d)if(!$I(u,a[d])){const m=a[d];let _=c[d];_=Je(_);const y=o.Ac(m);if(_ instanceof Oh)u.push(m);else{const I=Oo(_,y);I!=null&&(u.push(m),h.set(m,I))}}const f=new fn(u);return new LI(h,f,o.fieldTransforms)}function Q2(t,e,n,r=!1){return Oo(n,t.gc(r?4:3,e))}function Oo(t,e){if(BI(t=Je(t)))return Vm("Unsupported field value:",e,t),UI(t,e);if(t instanceof Ic)return function(r,s){if(!VI(s.hc))throw s.Vc(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Vc(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.Ec&&e.hc!==4)throw e.Vc("Nested arrays are not supported");return function(r,s){const i=[];let o=0;for(const a of r){let c=Oo(a,s.Rc(o));c==null&&(c={nullValue:"NULL_VALUE"}),i.push(c),o++}return{arrayValue:{values:i}}}(t,e)}return function(r,s){if((r=Je(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return MM(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=dt.fromDate(r);return{timestampValue:_u(s.serializer,i)}}if(r instanceof dt){const i=new dt(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:_u(s.serializer,i)}}if(r instanceof kh)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof _o)return{bytesValue:iI(s.serializer,r._byteString)};if(r instanceof Kt){const i=s.databaseId,o=r.firestore._databaseId;if(!o.isEqual(i))throw s.Vc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:gm(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof xm)return function(o,a){return{mapValue:{fields:{[Db]:{stringValue:xb},[du]:{arrayValue:{values:o.toArray().map(u=>{if(typeof u!="number")throw a.Vc("VectorValues must only contain numeric values.");return fm(a.serializer,u)})}}}}}}(r,s);throw s.Vc(`Unsupported field value: ${Ah(r)}`)}(t,e)}function UI(t,e){const n={};return Cb(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Ss(t,(r,s)=>{const i=Oo(s,e.Ic(r));i!=null&&(n[r]=i)}),{mapValue:{fields:n}}}function BI(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof dt||t instanceof kh||t instanceof _o||t instanceof Kt||t instanceof Ic||t instanceof xm)}function Vm(t,e,n){if(!BI(n)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(n)){const r=Ah(n);throw r==="an object"?e.Vc(t+" a custom object"):e.Vc(t+" "+r)}}function Jd(t,e,n){if((e=Je(e))instanceof Sh)return e._internalPath;if(typeof e=="string")return Fm(t,e);throw wu("Field path arguments must be of type string or ",t,!1,void 0,n)}const Y2=new RegExp("[~\\*/\\[\\]]");function Fm(t,e,n){if(e.search(Y2)>=0)throw wu(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Sh(...e.split("."))._internalPath}catch{throw wu(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function wu(t,e,n,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let a=`Function ${e}() called with invalid data`;n&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${r}`),o&&(c+=` in document ${s}`),c+=")"),new ne(j.INVALID_ARGUMENT,a+t+c)}function $I(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jI{constructor(e,n,r,s,i){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Kt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new X2(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(Um("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class X2 extends jI{data(){return super.data()}}function Um(t,e){return typeof e=="string"?Fm(t,e):e instanceof Sh?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function HI(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new ne(j.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Bm{}class J2 extends Bm{}function Ol(t,e,...n){let r=[];e instanceof Bm&&r.push(e),r=r.concat(n),function(i){const o=i.filter(c=>c instanceof $m).length,a=i.filter(c=>c instanceof Dh).length;if(o>1||o>0&&a>0)throw new ne(j.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)t=s._apply(t);return t}class Dh extends J2{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new Dh(e,n,r)}_apply(e){const n=this._parse(e);return qI(e._query,n),new yi(e.firestore,e.converter,$d(e._query,n))}_parse(e){const n=Nh(e.firestore);return function(i,o,a,c,u,h,f){let d;if(u.isKeyField()){if(h==="array-contains"||h==="array-contains-any")throw new ne(j.INVALID_ARGUMENT,`Invalid Query. You can't perform '${h}' queries on documentId().`);if(h==="in"||h==="not-in"){rE(f,h);const _=[];for(const y of f)_.push(nE(c,i,y));d={arrayValue:{values:_}}}else d=nE(c,i,f)}else h!=="in"&&h!=="not-in"&&h!=="array-contains-any"||rE(f,h),d=Q2(a,o,f,h==="in"||h==="not-in");return ht.create(u,h,d)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}function $s(t,e,n){const r=e,s=Um("where",t);return Dh._create(s,r,n)}class $m extends Bm{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new $m(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:Hn.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(s,i){let o=s;const a=i.getFlattenedFilters();for(const c of a)qI(o,c),o=$d(o,c)}(e._query,n),new yi(e.firestore,e.converter,$d(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function nE(t,e,n){if(typeof(n=Je(n))=="string"){if(n==="")throw new ne(j.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!jb(e)&&n.indexOf("/")!==-1)throw new ne(j.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(Qe.fromString(n));if(!le.isDocumentKey(r))throw new ne(j.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return gv(t,new le(r))}if(n instanceof Kt)return gv(t,n._key);throw new ne(j.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Ah(n)}.`)}function rE(t,e){if(!Array.isArray(t)||t.length===0)throw new ne(j.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function qI(t,e){const n=function(s,i){for(const o of s)for(const a of o.getFlattenedFilters())if(i.indexOf(a.op)>=0)return a.op;return null}(t.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new ne(j.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new ne(j.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class Z2{convertValue(e,n="none"){switch(Is(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ot(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(bs(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw de(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return Ss(e,(s,i)=>{r[s]=this.convertValue(i,n)}),r}convertVectorValue(e){var n,r,s;const i=(s=(r=(n=e.fields)===null||n===void 0?void 0:n[du].arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(o=>ot(o.doubleValue));return new xm(i)}convertGeoPoint(e){return new kh(ot(e.latitude),ot(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=mh(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(nc(e));default:return null}}convertTimestamp(e){const n=ws(e);return new dt(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=Qe.fromString(e);Le(hI(r),9688,{name:e});const s=new rc(r.get(1),r.get(3)),i=new le(r.popFirst(5));return s.isEqual(n)||Dr(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function WI(t,e,n){let r;return r=t?t.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ga{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class KI extends jI{constructor(e,n,r,s,i,o){super(e,n,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new Dl(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field(Um("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}}class Dl extends KI{data(e={}){return super.data(e)}}class zI{constructor(e,n,r,s){this._firestore=e,this._userDataWriter=n,this._snapshot=s,this.metadata=new ga(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new Dl(this._firestore,this._userDataWriter,r.key,r,new ga(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new ne(j.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(a=>{const c=new Dl(s._firestore,s._userDataWriter,a.doc.key,a.doc,new ga(s._snapshot.mutatedKeys.has(a.doc.key),s._snapshot.fromCache),s.query.converter);return a.doc,{type:"added",doc:c,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(a=>i||a.type!==3).map(a=>{const c=new Dl(s._firestore,s._userDataWriter,a.doc.key,a.doc,new ga(s._snapshot.mutatedKeys.has(a.doc.key),s._snapshot.fromCache),s.query.converter);let u=-1,h=-1;return a.type!==0&&(u=o.indexOf(a.doc.key),o=o.delete(a.doc.key)),a.type!==1&&(o=o.add(a.doc),h=o.indexOf(a.doc.key)),{type:eV(a.type),doc:c,oldIndex:u,newIndex:h}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}}function eV(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return de(61501,{type:t})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oa(t){t=cn(t,Kt);const e=cn(t.firestore,Mr);return V2(Ch(e),t._key).then(n=>GI(e,t,n))}class jm extends Z2{constructor(e){super(),this.firestore=e}convertBytes(e){return new _o(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new Kt(this.firestore,null,n)}}function _a(t){t=cn(t,yi);const e=cn(t.firestore,Mr),n=Ch(e),r=new jm(e);return HI(t._query),F2(n,t._query).then(s=>new zI(e,r,t,s))}function tV(t,e,n){t=cn(t,Kt);const r=cn(t.firestore,Mr),s=WI(t.converter,e);return xh(r,[FI(Nh(r),"setDoc",t._key,s,t.converter!==null,n).toMutation(t._key,Rn.none())])}function Hm(t,e,n,...r){t=cn(t,Kt);const s=cn(t.firestore,Mr),i=Nh(s);let o;return o=typeof(e=Je(e))=="string"||e instanceof Sh?G2(i,"updateDoc",t._key,e,n,r):z2(i,"updateDoc",t._key,e),xh(s,[o.toMutation(t._key,Rn.exists(!0))])}function nV(t){return xh(cn(t.firestore,Mr),[new dm(t._key,Rn.none())])}function rV(t,e){const n=cn(t.firestore,Mr),r=On(t),s=WI(t.converter,e);return xh(n,[FI(Nh(t.firestore),"addDoc",r._key,s,t.converter!==null,{}).toMutation(r._key,Rn.exists(!1))]).then(()=>r)}function qm(t,...e){var n,r,s;t=Je(t);let i={includeMetadataChanges:!1,source:"default"},o=0;typeof e[o]!="object"||tE(e[o])||(i=e[o],o++);const a={includeMetadataChanges:i.includeMetadataChanges,source:i.source};if(tE(e[o])){const f=e[o];e[o]=(n=f.next)===null||n===void 0?void 0:n.bind(f),e[o+1]=(r=f.error)===null||r===void 0?void 0:r.bind(f),e[o+2]=(s=f.complete)===null||s===void 0?void 0:s.bind(f)}let c,u,h;if(t instanceof Kt)u=cn(t.firestore,Mr),h=gh(t._key.path),c={next:f=>{e[o]&&e[o](GI(u,t,f))},error:e[o+1],complete:e[o+2]};else{const f=cn(t,yi);u=cn(f.firestore,Mr),h=f._query;const d=new jm(u);c={next:m=>{e[o]&&e[o](new zI(u,d,f,m))},error:e[o+1],complete:e[o+2]},HI(t._query)}return function(d,m,_,y){const I=new Dm(y),D=new Pm(m,I,_);return d.asyncQueue.enqueueAndForget(async()=>Cm(await Tu(d),D)),()=>{I.Cu(),d.asyncQueue.enqueueAndForget(async()=>Sm(await Tu(d),D))}}(Ch(u),h,a,c)}function xh(t,e){return function(r,s){const i=new br;return r.asyncQueue.enqueueAndForget(async()=>A2(await L2(r),s,i)),i.promise}(Ch(t),e)}function GI(t,e,n){const r=n.docs.get(e._key),s=new jm(t);return new KI(t,s,e._key,r,new ga(n.hasPendingWrites,n.fromCache),e.converter)}function QI(){return new Mm("serverTimestamp")}function sV(...t){return new Lm("arrayUnion",t)}(function(e,n=!0){(function(s){So=s})(Co),ir(new jn("firestore",(r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),a=new Mr(new Qx(r.getProvider("auth-internal")),new Jx(o,r.getProvider("app-check-internal")),function(u,h){if(!Object.prototype.hasOwnProperty.apply(u.options,["projectId"]))throw new ne(j.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new rc(u.options.projectId,h)}(o,s),o);return i=Object.assign({useFetchStreams:n},i),a._setSettings(i),a},"PUBLIC").setMultipleInstances(!0)),pn(sv,iv,e),pn(sv,iv,"esm2017")})();function Wm(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(t);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(t,r[s])&&(n[r[s]]=t[r[s]]);return n}function YI(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const iV=YI,XI=new Ro("auth","Firebase",YI());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bu=new yc("@firebase/auth");function oV(t,...e){bu.logLevel<=ve.WARN&&bu.warn(`Auth (${Co}): ${t}`,...e)}function xl(t,...e){bu.logLevel<=ve.ERROR&&bu.error(`Auth (${Co}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lr(t,...e){throw zm(t,...e)}function Js(t,...e){return zm(t,...e)}function Km(t,e,n){const r=Object.assign(Object.assign({},iV()),{[e]:n});return new Ro("auth","Firebase",r).create(e,{appName:t.name})}function Ir(t){return Km(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function aV(t,e,n){const r=n;if(!(e instanceof r))throw r.name!==e.constructor.name&&Lr(t,"argument-error"),Km(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function zm(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return XI.create(t,...e)}function _e(t,e,...n){if(!t)throw zm(e,...n)}function Tr(t){const e="INTERNAL ASSERTION FAILED: "+t;throw xl(e),new Error(e)}function ii(t,e){t||Tr(e)}function cV(){return sE()==="http:"||sE()==="https:"}function sE(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lV(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(cV()||bD()||"connection"in navigator)?navigator.onLine:!0}function uV(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ac{constructor(e,n){this.shortDelay=e,this.longDelay=n,ii(n>e,"Short delay should be less than long delay!"),this.isMobile=rm()||cb()}get(){return lV()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hV(t,e){ii(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JI{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Tr("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Tr("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Tr("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fV={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dV=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],pV=new Ac(3e4,6e4);function Ur(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function Br(t,e,n,r,s={}){return ZI(t,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const a=hh(Object.assign({key:t.config.apiKey},o)).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const u=Object.assign({method:e,headers:c},i);return wD()||(u.referrerPolicy="no-referrer"),t.emulatorConfig&&Ao(t.emulatorConfig.host)&&(u.credentials="include"),JI.fetch()(await eA(t,t.config.apiHost,n,a),u)})}async function ZI(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},fV),e);try{const s=new gV(t),i=await Promise.race([n(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw dl(t,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const a=i.ok?o.errorMessage:o.error.message,[c,u]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw dl(t,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw dl(t,"email-already-in-use",o);if(c==="USER_DISABLED")throw dl(t,"user-disabled",o);const h=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw Km(t,h,u);Lr(t,h)}}catch(s){if(s instanceof lr)throw s;Lr(t,"network-request-failed",{message:String(s)})}}async function Rc(t,e,n,r,s={}){const i=await Br(t,e,n,r,s);return"mfaPendingCredential"in i&&Lr(t,"multi-factor-auth-required",{_serverResponse:i}),i}async function eA(t,e,n,r){const s=`${e}${n}?${r}`,i=t,o=i.config.emulator?hV(t.config,s):`${t.config.apiScheme}://${s}`;return dV.includes(n)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function mV(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class gV{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(Js(this.auth,"network-request-failed")),pV.get())})}}function dl(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const s=Js(t,e,r);return s.customData._tokenResponse=n,s}function iE(t){return t!==void 0&&t.enterprise!==void 0}class _V{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return mV(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function yV(t,e){return Br(t,"GET","/v2/recaptchaConfig",Ur(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vV(t,e){return Br(t,"POST","/v1/accounts:delete",e)}async function Iu(t,e){return Br(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Da(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function EV(t,e=!1){const n=Je(t),r=await n.getIdToken(e),s=Gm(r);_e(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Da(Of(s.auth_time)),issuedAtTime:Da(Of(s.iat)),expirationTime:Da(Of(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Of(t){return Number(t)*1e3}function Gm(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return xl("JWT malformed, contained fewer than 3 sections"),null;try{const s=cu(n);return s?JSON.parse(s):(xl("Failed to decode base64 JWT payload"),null)}catch(s){return xl("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function oE(t){const e=Gm(t);return _e(e,"internal-error"),_e(typeof e.exp<"u","internal-error"),_e(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yo(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof lr&&TV(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function TV({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wV{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zd{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Da(this.lastLoginAt),this.creationTime=Da(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Au(t){var e;const n=t.auth,r=await t.getIdToken(),s=await yo(t,Iu(n,{idToken:r}));_e(s==null?void 0:s.users.length,n,"internal-error");const i=s.users[0];t._notifyReloadListener(i);const o=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?tA(i.providerUserInfo):[],a=IV(t.providerData,o),c=t.isAnonymous,u=!(t.email&&i.passwordHash)&&!(a!=null&&a.length),h=c?u:!1,f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:a,metadata:new Zd(i.createdAt,i.lastLoginAt),isAnonymous:h};Object.assign(t,f)}async function bV(t){const e=Je(t);await Au(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function IV(t,e){return[...t.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function tA(t){return t.map(e=>{var{providerId:n}=e,r=Wm(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function AV(t,e){const n=await ZI(t,{},async()=>{const r=hh({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=t.config,o=await eA(t,s,"/v1/token",`key=${i}`),a=await t._getAdditionalHeaders();return a["Content-Type"]="application/x-www-form-urlencoded",JI.fetch()(o,{method:"POST",headers:a,body:r})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function RV(t,e){return Br(t,"POST","/v2/accounts:revokeToken",Ur(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ji{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){_e(e.idToken,"internal-error"),_e(typeof e.idToken<"u","internal-error"),_e(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):oE(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){_e(e.length!==0,"internal-error");const n=oE(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(_e(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:s,expiresIn:i}=await AV(e,n);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:s,expirationTime:i}=n,o=new Ji;return r&&(_e(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(_e(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(_e(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Ji,this.toJSON())}_performRefresh(){return Tr("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gr(t,e){_e(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class Dn{constructor(e){var{uid:n,auth:r,stsTokenManager:s}=e,i=Wm(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new wV(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Zd(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await yo(this,this.stsTokenManager.getToken(this.auth,e));return _e(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return EV(this,e)}reload(){return bV(this)}_assign(e){this!==e&&(_e(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new Dn(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){_e(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await Au(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Zt(this.auth.app))return Promise.reject(Ir(this.auth));const e=await this.getIdToken();return await yo(this,vV(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,s,i,o,a,c,u,h;const f=(r=n.displayName)!==null&&r!==void 0?r:void 0,d=(s=n.email)!==null&&s!==void 0?s:void 0,m=(i=n.phoneNumber)!==null&&i!==void 0?i:void 0,_=(o=n.photoURL)!==null&&o!==void 0?o:void 0,y=(a=n.tenantId)!==null&&a!==void 0?a:void 0,I=(c=n._redirectEventId)!==null&&c!==void 0?c:void 0,D=(u=n.createdAt)!==null&&u!==void 0?u:void 0,P=(h=n.lastLoginAt)!==null&&h!==void 0?h:void 0,{uid:v,emailVerified:R,isAnonymous:x,providerData:M,stsTokenManager:b}=n;_e(v&&b,e,"internal-error");const E=Ji.fromJSON(this.name,b);_e(typeof v=="string",e,"internal-error"),Gr(f,e.name),Gr(d,e.name),_e(typeof R=="boolean",e,"internal-error"),_e(typeof x=="boolean",e,"internal-error"),Gr(m,e.name),Gr(_,e.name),Gr(y,e.name),Gr(I,e.name),Gr(D,e.name),Gr(P,e.name);const T=new Dn({uid:v,auth:e,email:d,emailVerified:R,displayName:f,isAnonymous:x,photoURL:_,phoneNumber:m,tenantId:y,stsTokenManager:E,createdAt:D,lastLoginAt:P});return M&&Array.isArray(M)&&(T.providerData=M.map(A=>Object.assign({},A))),I&&(T._redirectEventId=I),T}static async _fromIdTokenResponse(e,n,r=!1){const s=new Ji;s.updateFromServerResponse(n);const i=new Dn({uid:n.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await Au(i),i}static async _fromGetAccountInfoResponse(e,n,r){const s=n.users[0];_e(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?tA(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),a=new Ji;a.updateFromIdToken(r);const c=new Dn({uid:s.localId,auth:e,stsTokenManager:a,isAnonymous:o}),u={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Zd(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,u),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aE=new Map;function qs(t){ii(t instanceof Function,"Expected a class definition");let e=aE.get(t);return e?(ii(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,aE.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nA{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}nA.type="NONE";const cE=nA;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Df(t,e,n){return`firebase:${t}:${e}:${n}`}class Zi{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Df(this.userKey,s.apiKey,i),this.fullPersistenceKey=Df("persistence",s.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await Iu(this.auth,{idToken:e}).catch(()=>{});return n?Dn._fromGetAccountInfoResponse(this.auth,n,e):null}return Dn._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Zi(qs(cE),e,r);const s=(await Promise.all(n.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let i=s[0]||qs(cE);const o=Df(r,e.config.apiKey,e.name);let a=null;for(const u of n)try{const h=await u._get(o);if(h){let f;if(typeof h=="string"){const d=await Iu(e,{idToken:h}).catch(()=>{});if(!d)break;f=await Dn._fromGetAccountInfoResponse(e,d,h)}else f=Dn._fromJSON(e,h);u!==i&&(a=f),i=u;break}}catch{}const c=s.filter(u=>u._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new Zi(i,e,r):(i=c[0],a&&await i._set(o,a.toJSON()),await Promise.all(n.map(async u=>{if(u!==i)try{await u._remove(o)}catch{}})),new Zi(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lE(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(PV(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(CV(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(OV(e))return"Blackberry";if(DV(e))return"Webos";if(SV(e))return"Safari";if((e.includes("chrome/")||kV(e))&&!e.includes("edge/"))return"Chrome";if(NV(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function CV(t=$n()){return/firefox\//i.test(t)}function SV(t=$n()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function kV(t=$n()){return/crios\//i.test(t)}function PV(t=$n()){return/iemobile/i.test(t)}function NV(t=$n()){return/android/i.test(t)}function OV(t=$n()){return/blackberry/i.test(t)}function DV(t=$n()){return/webos/i.test(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rA(t,e=[]){let n;switch(t){case"Browser":n=lE($n());break;case"Worker":n=`${lE($n())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Co}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xV{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=i=>new Promise((o,a)=>{try{const c=e(i);o(c)}catch(c){a(c)}});r.onAbort=n,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const s of n)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function MV(t,e={}){return Br(t,"GET","/v2/passwordPolicy",Ur(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const LV=6;class VV{constructor(e){var n,r,s,i;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=o.minPasswordLength)!==null&&n!==void 0?n:LV,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,s,i,o,a;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(n=c.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),c.isValid&&(c.isValid=(r=c.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(s=c.containsLowercaseLetter)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(i=c.containsUppercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(o=c.containsNumericCharacter)!==null&&o!==void 0?o:!0),c.isValid&&(c.isValid=(a=c.containsNonAlphanumericCharacter)!==null&&a!==void 0?a:!0),c}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),s&&(n.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FV{constructor(e,n,r,s){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new uE(this),this.idTokenSubscription=new uE(this),this.beforeStateQueue=new xV(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=XI,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=qs(n)),this._initializationPromise=this.queue(async()=>{var r,s,i;if(!this._deleted&&(this.persistenceManager=await Zi.create(this,e),(r=this._resolvePersistenceManagerAvailable)===null||r===void 0||r.call(this),!this._deleted)){if(!((s=this._popupRedirectResolver)===null||s===void 0)&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Iu(this,{idToken:e}),r=await Dn._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(Zt(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,a=s==null?void 0:s._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===a)&&(c!=null&&c.user)&&(s=c.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(o){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return _e(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Au(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=uV()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Zt(this.app))return Promise.reject(Ir(this));const n=e?Je(e):null;return n&&_e(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&_e(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Zt(this.app)?Promise.reject(Ir(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Zt(this.app)?Promise.reject(Ir(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(qs(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await MV(this),n=new VV(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Ro("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await RV(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&qs(e)||this._popupRedirectResolver;_e(n,this,"argument-error"),this.redirectPersistenceManager=await Zi.create(this,[qs(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,s){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(_e(a,this,"internal-error"),a.then(()=>{o||i(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,r,s);return()=>{o=!0,c()}}else{const c=e.addObserver(n);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return _e(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=rA(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(n["X-Firebase-AppCheck"]=s),n}async _getAppCheckToken(){var e;if(Zt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&oV(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Do(t){return Je(t)}class uE{constructor(e){this.auth=e,this.observer=null,this.addObserver=DD(n=>this.observer=n)}get next(){return _e(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Qm={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function UV(t){Qm=t}function BV(t){return Qm.loadJS(t)}function $V(){return Qm.recaptchaEnterpriseScript}class jV{constructor(){this.enterprise=new HV}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class HV{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}const qV="recaptcha-enterprise",sA="NO_RECAPTCHA";class WV{constructor(e){this.type=qV,this.auth=Do(e)}async verify(e="verify",n=!1){async function r(i){if(!n){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,a)=>{yV(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const u=new _V(c);return i.tenantId==null?i._agentRecaptchaConfig=u:i._tenantRecaptchaConfigs[i.tenantId]=u,o(u.siteKey)}}).catch(c=>{a(c)})})}function s(i,o,a){const c=window.grecaptcha;iE(c)?c.enterprise.ready(()=>{c.enterprise.execute(i,{action:e}).then(u=>{o(u)}).catch(()=>{o(sA)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new jV().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{r(this.auth).then(a=>{if(!n&&iE(window.grecaptcha))s(a,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=$V();c.length!==0&&(c+=a),BV(c).then(()=>{s(a,i,o)}).catch(u=>{o(u)})}}).catch(a=>{o(a)})})}}async function hE(t,e,n,r=!1,s=!1){const i=new WV(t);let o;if(s)o=sA;else try{o=await i.verify(n)}catch{o=await i.verify(n,!0)}const a=Object.assign({},e);if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in a){const c=a.phoneEnrollmentInfo.phoneNumber,u=a.phoneEnrollmentInfo.recaptchaToken;Object.assign(a,{phoneEnrollmentInfo:{phoneNumber:c,recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in a){const c=a.phoneSignInInfo.recaptchaToken;Object.assign(a,{phoneSignInInfo:{recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return a}return r?Object.assign(a,{captchaResp:o}):Object.assign(a,{captchaResponse:o}),Object.assign(a,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(a,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),a}async function ep(t,e,n,r,s){var i;if(!((i=t._getRecaptchaConfig())===null||i===void 0)&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await hE(t,e,n,n==="getOobCode");return r(t,o)}else return r(t,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const a=await hE(t,e,n,n==="getOobCode");return r(t,a)}else return Promise.reject(o)})}function KV(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(qs);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ym{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Tr("not implemented")}_getIdTokenResponse(e){return Tr("not implemented")}_linkToIdToken(e,n){return Tr("not implemented")}_getReauthenticationResolver(e){return Tr("not implemented")}}async function zV(t,e){return Br(t,"POST","/v1/accounts:update",e)}async function GV(t,e){return Br(t,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function QV(t,e){return Rc(t,"POST","/v1/accounts:signInWithPassword",Ur(t,e))}async function YV(t,e){return Br(t,"POST","/v1/accounts:sendOobCode",Ur(t,e))}async function XV(t,e){return YV(t,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function JV(t,e){return Rc(t,"POST","/v1/accounts:signInWithEmailLink",Ur(t,e))}async function ZV(t,e){return Rc(t,"POST","/v1/accounts:signInWithEmailLink",Ur(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ac extends Ym{constructor(e,n,r,s=null){super("password",r),this._email=e,this._password=n,this._tenantId=s}static _fromEmailAndPassword(e,n){return new ac(e,n,"password")}static _fromEmailAndCode(e,n,r=null){return new ac(e,n,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ep(e,n,"signInWithPassword",QV);case"emailLink":return JV(e,{email:this._email,oobCode:this._password});default:Lr(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const r={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ep(e,r,"signUpPassword",GV);case"emailLink":return ZV(e,{idToken:n,email:this._email,oobCode:this._password});default:Lr(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eo(t,e){return Rc(t,"POST","/v1/accounts:signInWithIdp",Ur(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eF="http://localhost";class oi extends Ym{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new oi(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Lr("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=n,i=Wm(n,["providerId","signInMethod"]);if(!r||!s)return null;const o=new oi(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return eo(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,eo(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,eo(e,n)}buildRequest(){const e={requestUri:eF,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=hh(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tF(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function nF(t){const e=ha(fa(t)).link,n=e?ha(fa(e)).deep_link_id:null,r=ha(fa(t)).deep_link_id;return(r?ha(fa(r)).link:null)||r||n||e||t}class Xm{constructor(e){var n,r,s,i,o,a;const c=ha(fa(e)),u=(n=c.apiKey)!==null&&n!==void 0?n:null,h=(r=c.oobCode)!==null&&r!==void 0?r:null,f=tF((s=c.mode)!==null&&s!==void 0?s:null);_e(u&&h&&f,"argument-error"),this.apiKey=u,this.operation=f,this.code=h,this.continueUrl=(i=c.continueUrl)!==null&&i!==void 0?i:null,this.languageCode=(o=c.lang)!==null&&o!==void 0?o:null,this.tenantId=(a=c.tenantId)!==null&&a!==void 0?a:null}static parseLink(e){const n=nF(e);try{return new Xm(n)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xo{constructor(){this.providerId=xo.PROVIDER_ID}static credential(e,n){return ac._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const r=Xm.parseLink(n);return _e(r,"argument-error"),ac._fromEmailAndCode(e,r.code,r.tenantId)}}xo.PROVIDER_ID="password";xo.EMAIL_PASSWORD_SIGN_IN_METHOD="password";xo.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iA{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mh extends iA{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ns extends Mh{constructor(){super("facebook.com")}static credential(e){return oi._fromParams({providerId:ns.PROVIDER_ID,signInMethod:ns.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ns.credentialFromTaggedObject(e)}static credentialFromError(e){return ns.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ns.credential(e.oauthAccessToken)}catch{return null}}}ns.FACEBOOK_SIGN_IN_METHOD="facebook.com";ns.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rs extends Mh{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return oi._fromParams({providerId:rs.PROVIDER_ID,signInMethod:rs.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return rs.credentialFromTaggedObject(e)}static credentialFromError(e){return rs.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return rs.credential(n,r)}catch{return null}}}rs.GOOGLE_SIGN_IN_METHOD="google.com";rs.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ss extends Mh{constructor(){super("github.com")}static credential(e){return oi._fromParams({providerId:ss.PROVIDER_ID,signInMethod:ss.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ss.credentialFromTaggedObject(e)}static credentialFromError(e){return ss.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ss.credential(e.oauthAccessToken)}catch{return null}}}ss.GITHUB_SIGN_IN_METHOD="github.com";ss.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class is extends Mh{constructor(){super("twitter.com")}static credential(e,n){return oi._fromParams({providerId:is.PROVIDER_ID,signInMethod:is.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return is.credentialFromTaggedObject(e)}static credentialFromError(e){return is.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return is.credential(n,r)}catch{return null}}}is.TWITTER_SIGN_IN_METHOD="twitter.com";is.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rF(t,e){return Rc(t,"POST","/v1/accounts:signUp",Ur(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ai{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,s=!1){const i=await Dn._fromIdTokenResponse(e,r,s),o=fE(r);return new ai({user:i,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const s=fE(r);return new ai({user:e,providerId:s,_tokenResponse:r,operationType:n})}}function fE(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ru extends lr{constructor(e,n,r,s){var i;super(n.code,n.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Ru.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,s){return new Ru(e,n,r,s)}}function oA(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Ru._fromErrorAndOperation(t,i,e,r):i})}async function sF(t,e,n=!1){const r=await yo(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return ai._forOperation(t,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function iF(t,e,n=!1){const{auth:r}=t;if(Zt(r.app))return Promise.reject(Ir(r));const s="reauthenticate";try{const i=await yo(t,oA(r,s,e,t),n);_e(i.idToken,r,"internal-error");const o=Gm(i.idToken);_e(o,r,"internal-error");const{sub:a}=o;return _e(t.uid===a,r,"user-mismatch"),ai._forOperation(t,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Lr(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function aA(t,e,n=!1){if(Zt(t.app))return Promise.reject(Ir(t));const r="signIn",s=await oA(t,r,e),i=await ai._fromIdTokenResponse(t,r,s);return n||await t._updateCurrentUser(i.user),i}async function oF(t,e){return aA(Do(t),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cA(t){const e=Do(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function gj(t,e,n){if(Zt(t.app))return Promise.reject(Ir(t));const r=Do(t),o=await ep(r,{returnSecureToken:!0,email:e,password:n,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",rF).catch(c=>{throw c.code==="auth/password-does-not-meet-requirements"&&cA(t),c}),a=await ai._fromIdTokenResponse(r,"signIn",o);return await r._updateCurrentUser(a.user),a}function _j(t,e,n){return Zt(t.app)?Promise.reject(Ir(t)):oF(Je(t),xo.credential(e,n)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&cA(t),r})}async function yj(t,e){const n=Je(t),s={requestType:"VERIFY_EMAIL",idToken:await t.getIdToken()},{email:i}=await XV(n.auth,s);i!==t.email&&await t.reload()}function vj(t,e){const n=Je(t);return Zt(n.auth.app)?Promise.reject(Ir(n.auth)):lA(n,e,null)}function Ej(t,e){return lA(Je(t),null,e)}async function lA(t,e,n){const{auth:r}=t,i={idToken:await t.getIdToken(),returnSecureToken:!0};e&&(i.email=e),n&&(i.password=n);const o=await yo(t,zV(r,i));await t._updateTokensIfNecessary(o,!0)}function Tj(t){return Je(t).signOut()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aF(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}new Ac(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cF(t,e){return _e(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jm extends Ym{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return eo(e,this._buildIdpRequest())}_linkToIdToken(e,n){return eo(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return eo(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function lF(t){return aA(t.auth,new Jm(t),t.bypassAuthState)}function uF(t){const{auth:e,user:n}=t;return _e(n,e,"internal-error"),iF(n,new Jm(t),t.bypassAuthState)}async function hF(t){const{auth:e,user:n}=t;return _e(n,e,"internal-error"),sF(n,new Jm(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fF{constructor(e,n,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:s,tenantId:i,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:n,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return lF;case"linkViaPopup":case"linkViaRedirect":return hF;case"reauthViaPopup":case"reauthViaRedirect":return uF;default:Lr(this.auth,"internal-error")}}resolve(e){ii(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){ii(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dF=new Ac(2e3,1e4);async function wj(t,e,n){if(Zt(t.app))return Promise.reject(Js(t,"operation-not-supported-in-this-environment"));const r=Do(t);aV(t,e,iA);const s=cF(r);return new Ws(r,"signInViaPopup",e,s).executeNotNull()}class Ws extends fF{constructor(e,n,r,s,i){super(e,n,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Ws.currentPopupAction&&Ws.currentPopupAction.cancel(),Ws.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return _e(e,this.auth,"internal-error"),e}async onExecution(){ii(this.filter.length===1,"Popup operations only handle one event");const e=aF();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(Js(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Js(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Ws.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Js(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,dF.get())};e()}}Ws.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Ac(3e4,6e4);/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Ac(5e3,15e3);var dE="@firebase/auth",pE="1.10.6";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pF{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){_e(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mF(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function gF(t){ir(new jn("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=r.options;_e(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:o,authDomain:a,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:rA(t)},u=new FV(r,s,i,c);return KV(u,n),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),ir(new jn("auth-internal",e=>{const n=Do(e.getProvider("auth").getImmediate());return(r=>new pF(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),pn(dE,pE,mF(t)),pn(dE,pE,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _F=5*60;yD("authIdTokenMaxAge");function yF(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}UV({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=s=>{const i=Js("internal-error");i.customData=s,n(i)},r.type="text/javascript",r.charset="UTF-8",yF().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});gF("Browser");/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vF=new Map,EF={activated:!1,tokenObservers:[]};function qn(t){return vF.get(t)||Object.assign({},EF)}const mE={RETRIAL_MIN_WAIT:30*1e3,RETRIAL_MAX_WAIT:16*60*1e3};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TF{constructor(e,n,r,s,i){if(this.operation=e,this.retryPolicy=n,this.getWaitDuration=r,this.lowerBound=s,this.upperBound=i,this.pending=null,this.nextErrorWaitInterval=s,s>i)throw new Error("Proactive refresh lower bound greater than upper bound!")}start(){this.nextErrorWaitInterval=this.lowerBound,this.process(!0).catch(()=>{})}stop(){this.pending&&(this.pending.reject("cancelled"),this.pending=null)}isRunning(){return!!this.pending}async process(e){this.stop();try{this.pending=new Xa,this.pending.promise.catch(n=>{}),await wF(this.getNextRun(e)),this.pending.resolve(),await this.pending.promise,this.pending=new Xa,this.pending.promise.catch(n=>{}),await this.operation(),this.pending.resolve(),await this.pending.promise,this.process(!0).catch(()=>{})}catch(n){this.retryPolicy(n)?this.process(!1).catch(()=>{}):this.stop()}}getNextRun(e){if(e)return this.nextErrorWaitInterval=this.lowerBound,this.getWaitDuration();{const n=this.nextErrorWaitInterval;return this.nextErrorWaitInterval*=2,this.nextErrorWaitInterval>this.upperBound&&(this.nextErrorWaitInterval=this.upperBound),n}}}function wF(t){return new Promise(e=>{setTimeout(e,t)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bF={"already-initialized":"You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.","use-before-activation":"App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.","fetch-network-error":"Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.","fetch-parse-error":"Fetch client could not parse response. Original error: {$originalErrorMessage}.","fetch-status-error":"Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.","storage-open":"Error thrown when opening storage. Original error: {$originalErrorMessage}.","storage-get":"Error thrown when reading from storage. Original error: {$originalErrorMessage}.","storage-set":"Error thrown when writing to storage. Original error: {$originalErrorMessage}.","recaptcha-error":"ReCAPTCHA error.","initial-throttle":"{$httpStatus} error. Attempts allowed again after {$time}",throttled:"Requests throttled due to previous {$httpStatus} error. Attempts allowed again after {$time}"},Cu=new Ro("appCheck","AppCheck",bF);function uA(t){if(!qn(t).activated)throw Cu.create("use-before-activation",{appName:t.name})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IF="firebase-app-check-database",AF=1,tp="firebase-app-check-store";let pl=null;function RF(){return pl||(pl=new Promise((t,e)=>{try{const n=indexedDB.open(IF,AF);n.onsuccess=r=>{t(r.target.result)},n.onerror=r=>{var s;e(Cu.create("storage-open",{originalErrorMessage:(s=r.target.error)===null||s===void 0?void 0:s.message}))},n.onupgradeneeded=r=>{const s=r.target.result;switch(r.oldVersion){case 0:s.createObjectStore(tp,{keyPath:"compositeKey"})}}}catch(n){e(Cu.create("storage-open",{originalErrorMessage:n==null?void 0:n.message}))}}),pl)}function CF(t,e){return SF(kF(t),e)}async function SF(t,e){const r=(await RF()).transaction(tp,"readwrite"),i=r.objectStore(tp).put({compositeKey:t,value:e});return new Promise((o,a)=>{i.onsuccess=c=>{o()},r.onerror=c=>{var u;a(Cu.create("storage-set",{originalErrorMessage:(u=c.target.error)===null||u===void 0?void 0:u.message}))}})}function kF(t){return`${t.options.appId}-${t.name}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const np=new yc("@firebase/app-check");function gE(t,e){return lb()?CF(t,e).catch(n=>{np.warn(`Failed to write token to IndexedDB. Error: ${n}`)}):Promise.resolve()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PF={error:"UNKNOWN_ERROR"};function NF(t){return lh.encodeString(JSON.stringify(t),!1)}async function rp(t,e=!1,n=!1){const r=t.app;uA(r);const s=qn(r);let i=s.token,o;if(i&&!ya(i)&&(s.token=void 0,i=void 0),!i){const u=await s.cachedTokenPromise;u&&(ya(u)?i=u:await gE(r,void 0))}if(!e&&i&&ya(i))return{token:i.token};let a=!1;try{s.exchangeTokenPromise||(s.exchangeTokenPromise=s.provider.getToken().finally(()=>{s.exchangeTokenPromise=void 0}),a=!0),i=await qn(r).exchangeTokenPromise}catch(u){u.code==="appCheck/throttled"||u.code==="appCheck/initial-throttle"?np.warn(u.message):n&&np.error(u),o=u}let c;return i?o?ya(i)?c={token:i.token,internalError:o}:c=yE(o):(c={token:i.token},s.token=i,await gE(r,i)):c=yE(o),a&&MF(r,c),c}async function OF(t){const e=t.app;uA(e);const{provider:n}=qn(e);{const{token:r}=await n.getToken();return{token:r}}}function DF(t,e,n,r){const{app:s}=t,i=qn(s),o={next:n,error:r,type:e};if(i.tokenObservers=[...i.tokenObservers,o],i.token&&ya(i.token)){const a=i.token;Promise.resolve().then(()=>{n({token:a.token}),_E(t)}).catch(()=>{})}i.cachedTokenPromise.then(()=>_E(t))}function hA(t,e){const n=qn(t),r=n.tokenObservers.filter(s=>s.next!==e);r.length===0&&n.tokenRefresher&&n.tokenRefresher.isRunning()&&n.tokenRefresher.stop(),n.tokenObservers=r}function _E(t){const{app:e}=t,n=qn(e);let r=n.tokenRefresher;r||(r=xF(t),n.tokenRefresher=r),!r.isRunning()&&n.isTokenAutoRefreshEnabled&&r.start()}function xF(t){const{app:e}=t;return new TF(async()=>{const n=qn(e);let r;if(n.token?r=await rp(t,!0):r=await rp(t),r.error)throw r.error;if(r.internalError)throw r.internalError},()=>!0,()=>{const n=qn(e);if(n.token){let r=n.token.issuedAtTimeMillis+(n.token.expireTimeMillis-n.token.issuedAtTimeMillis)*.5+3e5;const s=n.token.expireTimeMillis-5*60*1e3;return r=Math.min(r,s),Math.max(0,r-Date.now())}else return 0},mE.RETRIAL_MIN_WAIT,mE.RETRIAL_MAX_WAIT)}function MF(t,e){const n=qn(t).tokenObservers;for(const r of n)try{r.type==="EXTERNAL"&&e.error!=null?r.error(e.error):r.next(e)}catch{}}function ya(t){return t.expireTimeMillis-Date.now()>0}function yE(t){return{token:NF(PF),error:t}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LF{constructor(e,n){this.app=e,this.heartbeatServiceProvider=n}_delete(){const{tokenObservers:e}=qn(this.app);for(const n of e)hA(this.app,n.next);return Promise.resolve()}}function VF(t,e){return new LF(t,e)}function FF(t){return{getToken:e=>rp(t,e),getLimitedUseToken:()=>OF(t),addTokenListener:e=>DF(t,"INTERNAL",e),removeTokenListener:e=>hA(t.app,e)}}const UF="@firebase/app-check",BF="0.10.0",$F="app-check",vE="app-check-internal";function jF(){ir(new jn($F,t=>{const e=t.getProvider("app").getImmediate(),n=t.getProvider("heartbeat");return VF(e,n)},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((t,e,n)=>{t.getProvider(vE).initialize()})),ir(new jn(vE,t=>{const e=t.getProvider("app-check").getImmediate();return FF(e)},"PUBLIC").setInstantiationMode("EXPLICIT")),pn(UF,BF)}jF();var HF="firebase",qF="11.8.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */pn(HF,qF,"app");const WF=Symbol("firebaseApp");function Lh(t){return un()&&ct(WF,null)||im(t)}const er=()=>{},KF=typeof window<"u";function Zm(t,e){return e.split(".").reduce((n,r)=>n&&n[r],t)}function zF(t,e,n){const r=(""+e).split("."),s=r.pop(),i=r.reduce((o,a)=>o&&o[a],t);if(i!=null)return Array.isArray(i)?i.splice(Number(s),1,n):i[s]=n}function vi(t){return!!t&&typeof t=="object"}const GF=Object.prototype;function QF(t){return vi(t)&&Object.getPrototypeOf(t)===GF}function eg(t){return vi(t)&&t.type==="document"}function YF(t){return vi(t)&&t.type==="collection"}function XF(t){return eg(t)||YF(t)}function JF(t){return vi(t)&&t.type==="query"}function ZF(t){return vi(t)&&"ref"in t}function e4(t){return vi(t)&&typeof t.bucket=="string"}function t4(t,e){let n;return()=>{if(!n)return n=!0,t(e())}}const n4=Symbol.for("v-scx");function r4(){return!!ct(n4,0)}const s4=new WeakMap;function tg(t){return s4.get(Lh(t))}var EE={};const TE="@firebase/database",wE="1.0.19";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let fA="";function i4(t){fA=t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class o4{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,n){n==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),kt(n))}get(e){const n=this.domStorage_.getItem(this.prefixedName_(e));return n==null?null:Ja(n)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a4{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,n){n==null?delete this.cache_[e]:this.cache_[e]=n}get(e){return Fr(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dA=function(t){try{if(typeof window<"u"&&typeof window[t]<"u"){const e=window[t];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new o4(e)}}catch{}return new a4},Ks=dA("localStorage"),c4=dA("sessionStorage");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const to=new yc("@firebase/database"),l4=function(){let t=1;return function(){return t++}}(),pA=function(t){const e=VD(t),n=new OD;n.update(e);const r=n.digest();return lh.encodeByteArray(r)},Cc=function(...t){let e="";for(let n=0;n<t.length;n++){const r=t[n];Array.isArray(r)||r&&typeof r=="object"&&typeof r.length=="number"?e+=Cc.apply(null,r):typeof r=="object"?e+=kt(r):e+=r,e+=" "}return e};let xa=null,bE=!0;const u4=function(t,e){X(!0,"Can't turn on custom loggers persistently."),to.logLevel=ve.VERBOSE,xa=to.log.bind(to)},$t=function(...t){if(bE===!0&&(bE=!1,xa===null&&c4.get("logging_enabled")===!0&&u4()),xa){const e=Cc.apply(null,t);xa(e)}},Sc=function(t){return function(...e){$t(t,...e)}},sp=function(...t){const e="FIREBASE INTERNAL ERROR: "+Cc(...t);to.error(e)},ci=function(...t){const e=`FIREBASE FATAL ERROR: ${Cc(...t)}`;throw to.error(e),new Error(e)},mn=function(...t){const e="FIREBASE WARNING: "+Cc(...t);to.warn(e)},h4=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&mn("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},mA=function(t){return typeof t=="number"&&(t!==t||t===Number.POSITIVE_INFINITY||t===Number.NEGATIVE_INFINITY)},f4=function(t){if(document.readyState==="complete")t();else{let e=!1;const n=function(){if(!document.body){setTimeout(n,Math.floor(10));return}e||(e=!0,t())};document.addEventListener?(document.addEventListener("DOMContentLoaded",n,!1),window.addEventListener("load",n,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&n()}),window.attachEvent("onload",n))}},vo="[MIN_NAME]",li="[MAX_NAME]",Mo=function(t,e){if(t===e)return 0;if(t===vo||e===li)return-1;if(e===vo||t===li)return 1;{const n=IE(t),r=IE(e);return n!==null?r!==null?n-r===0?t.length-e.length:n-r:-1:r!==null?1:t<e?-1:1}},d4=function(t,e){return t===e?0:t<e?-1:1},na=function(t,e){if(e&&t in e)return e[t];throw new Error("Missing required key ("+t+") in object: "+kt(e))},ng=function(t){if(typeof t!="object"||t===null)return kt(t);const e=[];for(const r in t)e.push(r);e.sort();let n="{";for(let r=0;r<e.length;r++)r!==0&&(n+=","),n+=kt(e[r]),n+=":",n+=ng(t[e[r]]);return n+="}",n},gA=function(t,e){const n=t.length;if(n<=e)return[t];const r=[];for(let s=0;s<n;s+=e)s+e>n?r.push(t.substring(s,n)):r.push(t.substring(s,s+e));return r};function Cn(t,e){for(const n in t)t.hasOwnProperty(n)&&e(n,t[n])}const _A=function(t){X(!mA(t),"Invalid JSON number");const e=11,n=52,r=(1<<e-1)-1;let s,i,o,a,c;t===0?(i=0,o=0,s=1/t===-1/0?1:0):(s=t<0,t=Math.abs(t),t>=Math.pow(2,1-r)?(a=Math.min(Math.floor(Math.log(t)/Math.LN2),r),i=a+r,o=Math.round(t*Math.pow(2,n-a)-Math.pow(2,n))):(i=0,o=Math.round(t/Math.pow(2,1-r-n))));const u=[];for(c=n;c;c-=1)u.push(o%2?1:0),o=Math.floor(o/2);for(c=e;c;c-=1)u.push(i%2?1:0),i=Math.floor(i/2);u.push(s?1:0),u.reverse();const h=u.join("");let f="";for(c=0;c<64;c+=8){let d=parseInt(h.substr(c,8),2).toString(16);d.length===1&&(d="0"+d),f=f+d}return f.toLowerCase()},p4=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},m4=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"},g4=new RegExp("^-?(0*)\\d{1,10}$"),_4=-2147483648,y4=2147483647,IE=function(t){if(g4.test(t)){const e=Number(t);if(e>=_4&&e<=y4)return e}return null},kc=function(t){try{t()}catch(e){setTimeout(()=>{const n=e.stack||"";throw mn("Exception was thrown by user callback.",n),e},Math.floor(0))}},v4=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},Ma=function(t,e){const n=setTimeout(t,e);return typeof n=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(n):typeof n=="object"&&n.unref&&n.unref(),n};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class E4{constructor(e,n){this.appCheckProvider=n,this.appName=e.name,Zt(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.appCheck=n==null?void 0:n.getImmediate({optional:!0}),this.appCheck||n==null||n.get().then(r=>this.appCheck=r)}getToken(e){if(this.serverAppAppCheckToken){if(e)throw new Error("Attempted reuse of `FirebaseServerApp.appCheckToken` after previous usage failed.");return Promise.resolve({token:this.serverAppAppCheckToken})}return this.appCheck?this.appCheck.getToken(e):new Promise((n,r)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(n,r):n(null)},0)})}addTokenChangeListener(e){var n;(n=this.appCheckProvider)===null||n===void 0||n.get().then(r=>r.addTokenListener(e))}notifyForInvalidToken(){mn(`Provided AppCheck credentials for the app named "${this.appName}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class T4{constructor(e,n,r){this.appName_=e,this.firebaseOptions_=n,this.authProvider_=r,this.auth_=null,this.auth_=r.getImmediate({optional:!0}),this.auth_||r.onInit(s=>this.auth_=s)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(n=>n&&n.code==="auth/token-not-initialized"?($t("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(n)):new Promise((n,r)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(n,r):n(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(n=>n.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(n=>n.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',mn(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rg="5",yA="v",vA="s",EA="r",TA="f",wA=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,bA="ls",IA="p",ip="ac",AA="websocket",RA="long_polling";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w4{constructor(e,n,r,s,i=!1,o="",a=!1,c=!1,u=null){this.secure=n,this.namespace=r,this.webSocketOnly=s,this.nodeAdmin=i,this.persistenceKey=o,this.includeNamespaceInQueryParams=a,this.isUsingEmulator=c,this.emulatorOptions=u,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=Ks.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&Ks.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",n=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${n}`}}function b4(t){return t.host!==t.internalHost||t.isCustomHost()||t.includeNamespaceInQueryParams}function CA(t,e,n){X(typeof e=="string","typeof type must == string"),X(typeof n=="object","typeof params must == object");let r;if(e===AA)r=(t.secure?"wss://":"ws://")+t.internalHost+"/.ws?";else if(e===RA)r=(t.secure?"https://":"http://")+t.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);b4(t)&&(n.ns=t.namespace);const s=[];return Cn(n,(i,o)=>{s.push(i+"="+o)}),r+s.join("&")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class I4{constructor(){this.counters_={}}incrementCounter(e,n=1){Fr(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=n}get(){return hD(this.counters_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xf={},Mf={};function sg(t){const e=t.toString();return xf[e]||(xf[e]=new I4),xf[e]}function A4(t,e){const n=t.toString();return Mf[n]||(Mf[n]=e()),Mf[n]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R4{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,n){this.closeAfterResponse=e,this.onClose=n,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,n){for(this.pendingResponses[e]=n;this.pendingResponses[this.currentResponseNum];){const r=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let s=0;s<r.length;++s)r[s]&&kc(()=>{this.onMessage_(r[s])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const AE="start",C4="close",S4="pLPCommand",k4="pRTLPCB",SA="id",kA="pw",PA="ser",P4="cb",N4="seg",O4="ts",D4="d",x4="dframe",NA=1870,OA=30,M4=NA-OA,L4=25e3,V4=3e4;class Bi{constructor(e,n,r,s,i,o,a){this.connId=e,this.repoInfo=n,this.applicationId=r,this.appCheckToken=s,this.authToken=i,this.transportSessionId=o,this.lastSessionId=a,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=Sc(e),this.stats_=sg(n),this.urlFn=c=>(this.appCheckToken&&(c[ip]=this.appCheckToken),CA(n,RA,c))}open(e,n){this.curSegmentNum=0,this.onDisconnect_=n,this.myPacketOrderer=new R4(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(V4)),f4(()=>{if(this.isClosed_)return;this.scriptTagHolder=new ig((...i)=>{const[o,a,c,u,h]=i;if(this.incrementIncomingBytes_(i),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,o===AE)this.id=a,this.password=c;else if(o===C4)a?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(a,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+o)},(...i)=>{const[o,a]=i;this.incrementIncomingBytes_(i),this.myPacketOrderer.handleResponse(o,a)},()=>{this.onClosed_()},this.urlFn);const r={};r[AE]="t",r[PA]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(r[P4]=this.scriptTagHolder.uniqueCallbackIdentifier),r[yA]=rg,this.transportSessionId&&(r[vA]=this.transportSessionId),this.lastSessionId&&(r[bA]=this.lastSessionId),this.applicationId&&(r[IA]=this.applicationId),this.appCheckToken&&(r[ip]=this.appCheckToken),typeof location<"u"&&location.hostname&&wA.test(location.hostname)&&(r[EA]=TA);const s=this.urlFn(r);this.log_("Connecting via long-poll to "+s),this.scriptTagHolder.addTag(s,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){Bi.forceAllow_=!0}static forceDisallow(){Bi.forceDisallow_=!0}static isAvailable(){return Bi.forceAllow_?!0:!Bi.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!p4()&&!m4()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const n=kt(e);this.bytesSent+=n.length,this.stats_.incrementCounter("bytes_sent",n.length);const r=tb(n),s=gA(r,M4);for(let i=0;i<s.length;i++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,s.length,s[i]),this.curSegmentNum++}addDisconnectPingFrame(e,n){this.myDisconnFrame=document.createElement("iframe");const r={};r[x4]="t",r[SA]=e,r[kA]=n,this.myDisconnFrame.src=this.urlFn(r),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const n=kt(e).length;this.bytesReceived+=n,this.stats_.incrementCounter("bytes_received",n)}}class ig{constructor(e,n,r,s){this.onDisconnect=r,this.urlFn=s,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=l4(),window[S4+this.uniqueCallbackIdentifier]=e,window[k4+this.uniqueCallbackIdentifier]=n,this.myIFrame=ig.createIFrame_();let i="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(i='<script>document.domain="'+document.domain+'";<\/script>');const o="<html><body>"+i+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(o),this.myIFrame.doc.close()}catch(a){$t("frame writing exception"),a.stack&&$t(a.stack),$t(a)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||$t("No IE domain setting required")}catch{const r=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+r+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,n){for(this.myID=e,this.myPW=n,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[SA]=this.myID,e[kA]=this.myPW,e[PA]=this.currentSerial;let n=this.urlFn(e),r="",s=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+OA+r.length<=NA;){const o=this.pendingSegs.shift();r=r+"&"+N4+s+"="+o.seg+"&"+O4+s+"="+o.ts+"&"+D4+s+"="+o.d,s++}return n=n+r,this.addLongPollTag_(n,this.currentSerial),!0}else return!1}enqueueSegment(e,n,r){this.pendingSegs.push({seg:e,ts:n,d:r}),this.alive&&this.newRequest_()}addLongPollTag_(e,n){this.outstandingRequests.add(n);const r=()=>{this.outstandingRequests.delete(n),this.newRequest_()},s=setTimeout(r,Math.floor(L4)),i=()=>{clearTimeout(s),r()};this.addTag(e,i)}addTag(e,n){setTimeout(()=>{try{if(!this.sendNewPolls)return;const r=this.myIFrame.doc.createElement("script");r.type="text/javascript",r.async=!0,r.src=e,r.onload=r.onreadystatechange=function(){const s=r.readyState;(!s||s==="loaded"||s==="complete")&&(r.onload=r.onreadystatechange=null,r.parentNode&&r.parentNode.removeChild(r),n())},r.onerror=()=>{$t("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(r)}catch{}},Math.floor(1))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F4=16384,U4=45e3;let Su=null;typeof MozWebSocket<"u"?Su=MozWebSocket:typeof WebSocket<"u"&&(Su=WebSocket);class Nn{constructor(e,n,r,s,i,o,a){this.connId=e,this.applicationId=r,this.appCheckToken=s,this.authToken=i,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=Sc(this.connId),this.stats_=sg(n),this.connURL=Nn.connectionURL_(n,o,a,s,r),this.nodeAdmin=n.nodeAdmin}static connectionURL_(e,n,r,s,i){const o={};return o[yA]=rg,typeof location<"u"&&location.hostname&&wA.test(location.hostname)&&(o[EA]=TA),n&&(o[vA]=n),r&&(o[bA]=r),s&&(o[ip]=s),i&&(o[IA]=i),CA(e,AA,o)}open(e,n){this.onDisconnect=n,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,Ks.set("previous_websocket_failure",!0);try{let r;ID(),this.mySock=new Su(this.connURL,[],r)}catch(r){this.log_("Error instantiating WebSocket.");const s=r.message||r.data;s&&this.log_(s),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=r=>{this.handleIncomingFrame(r)},this.mySock.onerror=r=>{this.log_("WebSocket error.  Closing connection.");const s=r.message||r.data;s&&this.log_(s),this.onClosed_()}}start(){}static forceDisallow(){Nn.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const n=/Android ([0-9]{0,}\.[0-9]{0,})/,r=navigator.userAgent.match(n);r&&r.length>1&&parseFloat(r[1])<4.4&&(e=!0)}return!e&&Su!==null&&!Nn.forceDisallow_}static previouslyFailed(){return Ks.isInMemoryStorage||Ks.get("previous_websocket_failure")===!0}markConnectionHealthy(){Ks.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const n=this.frames.join("");this.frames=null;const r=Ja(n);this.onMessage(r)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(X(this.frames===null,"We already have a frame buffer"),e.length<=6){const n=Number(e);if(!isNaN(n))return this.handleNewFrameCount_(n),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const n=e.data;if(this.bytesReceived+=n.length,this.stats_.incrementCounter("bytes_received",n.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(n);else{const r=this.extractFrameCount_(n);r!==null&&this.appendFrame_(r)}}send(e){this.resetKeepAlive();const n=kt(e);this.bytesSent+=n.length,this.stats_.incrementCounter("bytes_sent",n.length);const r=gA(n,F4);r.length>1&&this.sendString_(String(r.length));for(let s=0;s<r.length;s++)this.sendString_(r[s])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(U4))}sendString_(e){try{this.mySock.send(e)}catch(n){this.log_("Exception thrown from WebSocket.send():",n.message||n.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}Nn.responsesRequiredToBeHealthy=2;Nn.healthyTimeout=3e4;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cc{static get ALL_TRANSPORTS(){return[Bi,Nn]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}constructor(e){this.initTransports_(e)}initTransports_(e){const n=Nn&&Nn.isAvailable();let r=n&&!Nn.previouslyFailed();if(e.webSocketOnly&&(n||mn("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),r=!0),r)this.transports_=[Nn];else{const s=this.transports_=[];for(const i of cc.ALL_TRANSPORTS)i&&i.isAvailable()&&s.push(i);cc.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}cc.globalTransportInitialized_=!1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const B4=6e4,$4=5e3,j4=10*1024,H4=100*1024,Lf="t",RE="d",q4="s",CE="r",W4="e",SE="o",kE="a",PE="n",NE="p",K4="h";class z4{constructor(e,n,r,s,i,o,a,c,u,h){this.id=e,this.repoInfo_=n,this.applicationId_=r,this.appCheckToken_=s,this.authToken_=i,this.onMessage_=o,this.onReady_=a,this.onDisconnect_=c,this.onKill_=u,this.lastSessionId=h,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=Sc("c:"+this.id+":"),this.transportManager_=new cc(n),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const n=this.connReceiver_(this.conn_),r=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(n,r)},Math.floor(0));const s=e.healthyTimeout||0;s>0&&(this.healthyTimeout_=Ma(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>H4?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>j4?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(s)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return n=>{e===this.conn_?this.onConnectionLost_(n):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return n=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(n):e===this.secondaryConn_?this.onSecondaryMessageReceived_(n):this.log_("message on old connection"))}}sendRequest(e){const n={t:"d",d:e};this.sendData_(n)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(Lf in e){const n=e[Lf];n===kE?this.upgradeIfSecondaryHealthy_():n===CE?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):n===SE&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const n=na("t",e),r=na("d",e);if(n==="c")this.onSecondaryControl_(r);else if(n==="d")this.pendingDataMessages.push(r);else throw new Error("Unknown protocol layer: "+n)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:NE,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:kE,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:PE,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const n=na("t",e),r=na("d",e);n==="c"?this.onControl_(r):n==="d"&&this.onDataMessage_(r)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const n=na(Lf,e);if(RE in e){const r=e[RE];if(n===K4){const s=Object.assign({},r);this.repoInfo_.isUsingEmulator&&(s.h=this.repoInfo_.host),this.onHandshake_(s)}else if(n===PE){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let s=0;s<this.pendingDataMessages.length;++s)this.onDataMessage_(this.pendingDataMessages[s]);this.pendingDataMessages=[],this.tryCleanupConnection()}else n===q4?this.onConnectionShutdown_(r):n===CE?this.onReset_(r):n===W4?sp("Server Error: "+r):n===SE?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):sp("Unknown control packet command: "+n)}}onHandshake_(e){const n=e.ts,r=e.v,s=e.h;this.sessionId=e.s,this.repoInfo_.host=s,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,n),rg!==r&&mn("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const n=this.connReceiver_(this.secondaryConn_),r=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(n,r),Ma(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(B4))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,n){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(n,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):Ma(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor($4))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:NE,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(Ks.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DA{put(e,n,r,s){}merge(e,n,r,s){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,n,r){}onDisconnectMerge(e,n,r){}onDisconnectCancel(e,n){}reportStats(e){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xA{constructor(e){this.allowedEvents_=e,this.listeners_={},X(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...n){if(Array.isArray(this.listeners_[e])){const r=[...this.listeners_[e]];for(let s=0;s<r.length;s++)r[s].callback.apply(r[s].context,n)}}on(e,n,r){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:n,context:r});const s=this.getInitialEvent(e);s&&n.apply(r,s)}off(e,n,r){this.validateEventType_(e);const s=this.listeners_[e]||[];for(let i=0;i<s.length;i++)if(s[i].callback===n&&(!r||r===s[i].context)){s.splice(i,1);return}}validateEventType_(e){X(this.allowedEvents_.find(n=>n===e),"Unknown event: "+e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ku extends xA{static getInstance(){return new ku}constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!rm()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}getInitialEvent(e){return X(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const OE=32,DE=768;class Xe{constructor(e,n){if(n===void 0){this.pieces_=e.split("/");let r=0;for(let s=0;s<this.pieces_.length;s++)this.pieces_[s].length>0&&(this.pieces_[r]=this.pieces_[s],r++);this.pieces_.length=r,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=n}toString(){let e="";for(let n=this.pieceNum_;n<this.pieces_.length;n++)this.pieces_[n]!==""&&(e+="/"+this.pieces_[n]);return e||"/"}}function Fe(){return new Xe("")}function Re(t){return t.pieceNum_>=t.pieces_.length?null:t.pieces_[t.pieceNum_]}function Cs(t){return t.pieces_.length-t.pieceNum_}function Ge(t){let e=t.pieceNum_;return e<t.pieces_.length&&e++,new Xe(t.pieces_,e)}function MA(t){return t.pieceNum_<t.pieces_.length?t.pieces_[t.pieces_.length-1]:null}function G4(t){let e="";for(let n=t.pieceNum_;n<t.pieces_.length;n++)t.pieces_[n]!==""&&(e+="/"+encodeURIComponent(String(t.pieces_[n])));return e||"/"}function LA(t,e=0){return t.pieces_.slice(t.pieceNum_+e)}function VA(t){if(t.pieceNum_>=t.pieces_.length)return null;const e=[];for(let n=t.pieceNum_;n<t.pieces_.length-1;n++)e.push(t.pieces_[n]);return new Xe(e,0)}function It(t,e){const n=[];for(let r=t.pieceNum_;r<t.pieces_.length;r++)n.push(t.pieces_[r]);if(e instanceof Xe)for(let r=e.pieceNum_;r<e.pieces_.length;r++)n.push(e.pieces_[r]);else{const r=e.split("/");for(let s=0;s<r.length;s++)r[s].length>0&&n.push(r[s])}return new Xe(n,0)}function Ie(t){return t.pieceNum_>=t.pieces_.length}function wn(t,e){const n=Re(t),r=Re(e);if(n===null)return e;if(n===r)return wn(Ge(t),Ge(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+t+")")}function FA(t,e){if(Cs(t)!==Cs(e))return!1;for(let n=t.pieceNum_,r=e.pieceNum_;n<=t.pieces_.length;n++,r++)if(t.pieces_[n]!==e.pieces_[r])return!1;return!0}function xn(t,e){let n=t.pieceNum_,r=e.pieceNum_;if(Cs(t)>Cs(e))return!1;for(;n<t.pieces_.length;){if(t.pieces_[n]!==e.pieces_[r])return!1;++n,++r}return!0}class Q4{constructor(e,n){this.errorPrefix_=n,this.parts_=LA(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let r=0;r<this.parts_.length;r++)this.byteLength_+=fh(this.parts_[r]);UA(this)}}function Y4(t,e){t.parts_.length>0&&(t.byteLength_+=1),t.parts_.push(e),t.byteLength_+=fh(e),UA(t)}function X4(t){const e=t.parts_.pop();t.byteLength_-=fh(e),t.parts_.length>0&&(t.byteLength_-=1)}function UA(t){if(t.byteLength_>DE)throw new Error(t.errorPrefix_+"has a key path longer than "+DE+" bytes ("+t.byteLength_+").");if(t.parts_.length>OE)throw new Error(t.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+OE+") or object contains a cycle "+js(t))}function js(t){return t.parts_.length===0?"":"in property '"+t.parts_.join(".")+"'"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class og extends xA{static getInstance(){return new og}constructor(){super(["visible"]);let e,n;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(n="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(n="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(n="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(n="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,n&&document.addEventListener(n,()=>{const r=!document[e];r!==this.visible_&&(this.visible_=r,this.trigger("visible",r))},!1)}getInitialEvent(e){return X(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ra=1e3,J4=60*5*1e3,xE=30*1e3,Z4=1.3,eU=3e4,tU="server_kill",ME=3;class Ar extends DA{constructor(e,n,r,s,i,o,a,c){if(super(),this.repoInfo_=e,this.applicationId_=n,this.onDataUpdate_=r,this.onConnectStatus_=s,this.onServerInfoUpdate_=i,this.authTokenProvider_=o,this.appCheckTokenProvider_=a,this.authOverride_=c,this.id=Ar.nextPersistentConnectionId_++,this.log_=Sc("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=ra,this.maxReconnectDelay_=J4,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,c)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");og.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&ku.getInstance().on("online",this.onOnline_,this)}sendRequest(e,n,r){const s=++this.requestNumber_,i={r:s,a:e,b:n};this.log_(kt(i)),X(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(i),r&&(this.requestCBHash_[s]=r)}get(e){this.initConnection_();const n=new Xa,s={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:o=>{const a=o.d;o.s==="ok"?n.resolve(a):n.reject(a)}};this.outstandingGets_.push(s),this.outstandingGetCount_++;const i=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(i),n.promise}listen(e,n,r,s){this.initConnection_();const i=e._queryIdentifier,o=e._path.toString();this.log_("Listen called for "+o+" "+i),this.listens.has(o)||this.listens.set(o,new Map),X(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),X(!this.listens.get(o).has(i),"listen() called twice for same path/queryId.");const a={onComplete:s,hashFn:n,query:e,tag:r};this.listens.get(o).set(i,a),this.connected_&&this.sendListen_(a)}sendGet_(e){const n=this.outstandingGets_[e];this.sendRequest("g",n.request,r=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),n.onComplete&&n.onComplete(r)})}sendListen_(e){const n=e.query,r=n._path.toString(),s=n._queryIdentifier;this.log_("Listen on "+r+" for "+s);const i={p:r},o="q";e.tag&&(i.q=n._queryObject,i.t=e.tag),i.h=e.hashFn(),this.sendRequest(o,i,a=>{const c=a.d,u=a.s;Ar.warnOnListenWarnings_(c,n),(this.listens.get(r)&&this.listens.get(r).get(s))===e&&(this.log_("listen response",a),u!=="ok"&&this.removeListen_(r,s),e.onComplete&&e.onComplete(u,c))})}static warnOnListenWarnings_(e,n){if(e&&typeof e=="object"&&Fr(e,"w")){const r=co(e,"w");if(Array.isArray(r)&&~r.indexOf("no_index")){const s='".indexOn": "'+n._queryParams.getIndex().toString()+'"',i=n._path.toString();mn(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${s} at ${i} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||ND(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=xE)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,n=PD(e)?"auth":"gauth",r={cred:e};this.authOverride_===null?r.noauth=!0:typeof this.authOverride_=="object"&&(r.authvar=this.authOverride_),this.sendRequest(n,r,s=>{const i=s.s,o=s.d||"error";this.authToken_===e&&(i==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(i,o))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const n=e.s,r=e.d||"error";n==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(n,r)})}unlisten(e,n){const r=e._path.toString(),s=e._queryIdentifier;this.log_("Unlisten called for "+r+" "+s),X(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(r,s)&&this.connected_&&this.sendUnlisten_(r,s,e._queryObject,n)}sendUnlisten_(e,n,r,s){this.log_("Unlisten on "+e+" for "+n);const i={p:e},o="n";s&&(i.q=r,i.t=s),this.sendRequest(o,i)}onDisconnectPut(e,n,r){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,n,r):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:n,onComplete:r})}onDisconnectMerge(e,n,r){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,n,r):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:n,onComplete:r})}onDisconnectCancel(e,n){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,n):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:n})}sendOnDisconnect_(e,n,r,s){const i={p:n,d:r};this.log_("onDisconnect "+e,i),this.sendRequest(e,i,o=>{s&&setTimeout(()=>{s(o.s,o.d)},Math.floor(0))})}put(e,n,r,s){this.putInternal("p",e,n,r,s)}merge(e,n,r,s){this.putInternal("m",e,n,r,s)}putInternal(e,n,r,s,i){this.initConnection_();const o={p:n,d:r};i!==void 0&&(o.h=i),this.outstandingPuts_.push({action:e,request:o,onComplete:s}),this.outstandingPutCount_++;const a=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(a):this.log_("Buffering put: "+n)}sendPut_(e){const n=this.outstandingPuts_[e].action,r=this.outstandingPuts_[e].request,s=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(n,r,i=>{this.log_(n+" response",i),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),s&&s(i.s,i.d)})}reportStats(e){if(this.connected_){const n={c:e};this.log_("reportStats",n),this.sendRequest("s",n,r=>{if(r.s!=="ok"){const i=r.d;this.log_("reportStats","Error sending stats: "+i)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+kt(e));const n=e.r,r=this.requestCBHash_[n];r&&(delete this.requestCBHash_[n],r(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,n){this.log_("handleServerMessage",e,n),e==="d"?this.onDataUpdate_(n.p,n.d,!1,n.t):e==="m"?this.onDataUpdate_(n.p,n.d,!0,n.t):e==="c"?this.onListenRevoked_(n.p,n.q):e==="ac"?this.onAuthRevoked_(n.s,n.d):e==="apc"?this.onAppCheckRevoked_(n.s,n.d):e==="sd"?this.onSecurityDebugPacket_(n):sp("Unrecognized action received from server: "+kt(e)+`
Are you using the latest client?`)}onReady_(e,n){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=n,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){X(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=ra,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=ra,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>eU&&(this.reconnectDelay_=ra),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=Math.max(0,new Date().getTime()-this.lastConnectionAttemptTime_);let n=Math.max(0,this.reconnectDelay_-e);n=Math.random()*n,this.log_("Trying to reconnect in "+n+"ms"),this.scheduleConnect_(n),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*Z4)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),n=this.onReady_.bind(this),r=this.onRealtimeDisconnect_.bind(this),s=this.id+":"+Ar.nextConnectionId_++,i=this.lastSessionId;let o=!1,a=null;const c=function(){a?a.close():(o=!0,r())},u=function(f){X(a,"sendRequest call when we're not connected not allowed."),a.sendRequest(f)};this.realtime_={close:c,sendRequest:u};const h=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[f,d]=await Promise.all([this.authTokenProvider_.getToken(h),this.appCheckTokenProvider_.getToken(h)]);o?$t("getToken() completed but was canceled"):($t("getToken() completed. Creating connection."),this.authToken_=f&&f.accessToken,this.appCheckToken_=d&&d.token,a=new z4(s,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,n,r,m=>{mn(m+" ("+this.repoInfo_.toString()+")"),this.interrupt(tU)},i))}catch(f){this.log_("Failed to get token: "+f),o||(this.repoInfo_.nodeAdmin&&mn(f),c())}}}interrupt(e){$t("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){$t("Resuming connection for reason: "+e),delete this.interruptReasons_[e],zy(this.interruptReasons_)&&(this.reconnectDelay_=ra,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const n=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:n})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const n=this.outstandingPuts_[e];n&&"h"in n.request&&n.queued&&(n.onComplete&&n.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,n){let r;n?r=n.map(i=>ng(i)).join("$"):r="default";const s=this.removeListen_(e,r);s&&s.onComplete&&s.onComplete("permission_denied")}removeListen_(e,n){const r=new Xe(e).toString();let s;if(this.listens.has(r)){const i=this.listens.get(r);s=i.get(n),i.delete(n),i.size===0&&this.listens.delete(r)}else s=void 0;return s}onAuthRevoked_(e,n){$t("Auth token revoked: "+e+"/"+n),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=ME&&(this.reconnectDelay_=xE,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,n){$t("App check token revoked: "+e+"/"+n),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=ME&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const n of e.values())this.sendListen_(n);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let n="js";e["sdk."+n+"."+fA.replace(/\./g,"-")]=1,rm()?e["framework.cordova"]=1:cb()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=ku.getInstance().currentlyOnline();return zy(this.interruptReasons_)&&e}}Ar.nextPersistentConnectionId_=0;Ar.nextConnectionId_=0;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ce{constructor(e,n){this.name=e,this.node=n}static Wrap(e,n){return new Ce(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vh{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,n){const r=new Ce(vo,e),s=new Ce(vo,n);return this.compare(r,s)!==0}minPost(){return Ce.MIN}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ml;class BA extends Vh{static get __EMPTY_NODE(){return ml}static set __EMPTY_NODE(e){ml=e}compare(e,n){return Mo(e.name,n.name)}isDefinedOn(e){throw Io("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,n){return!1}minPost(){return Ce.MIN}maxPost(){return new Ce(li,ml)}makePost(e,n){return X(typeof e=="string","KeyIndex indexValue must always be a string."),new Ce(e,ml)}toString(){return".key"}}const no=new BA;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gl{constructor(e,n,r,s,i=null){this.isReverse_=s,this.resultGenerator_=i,this.nodeStack_=[];let o=1;for(;!e.isEmpty();)if(e=e,o=n?r(e.key,n):1,s&&(o*=-1),o<0)this.isReverse_?e=e.left:e=e.right;else if(o===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),n;if(this.resultGenerator_?n=this.resultGenerator_(e.key,e.value):n={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return n}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class wt{constructor(e,n,r,s,i){this.key=e,this.value=n,this.color=r??wt.RED,this.left=s??an.EMPTY_NODE,this.right=i??an.EMPTY_NODE}copy(e,n,r,s,i){return new wt(e??this.key,n??this.value,r??this.color,s??this.left,i??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let s=this;const i=r(e,s.key);return i<0?s=s.copy(null,null,null,s.left.insert(e,n,r),null):i===0?s=s.copy(null,n,null,null,null):s=s.copy(null,null,null,null,s.right.insert(e,n,r)),s.fixUp_()}removeMin_(){if(this.left.isEmpty())return an.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,n){let r,s;if(r=this,n(e,r.key)<0)!r.left.isEmpty()&&!r.left.isRed_()&&!r.left.left.isRed_()&&(r=r.moveRedLeft_()),r=r.copy(null,null,null,r.left.remove(e,n),null);else{if(r.left.isRed_()&&(r=r.rotateRight_()),!r.right.isEmpty()&&!r.right.isRed_()&&!r.right.left.isRed_()&&(r=r.moveRedRight_()),n(e,r.key)===0){if(r.right.isEmpty())return an.EMPTY_NODE;s=r.right.min_(),r=r.copy(s.key,s.value,null,null,r.right.removeMin_())}r=r.copy(null,null,null,null,r.right.remove(e,n))}return r.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,wt.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,wt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}wt.RED=!0;wt.BLACK=!1;class nU{copy(e,n,r,s,i){return this}insert(e,n,r){return new wt(e,n,null)}remove(e,n){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class an{constructor(e,n=an.EMPTY_NODE){this.comparator_=e,this.root_=n}insert(e,n){return new an(this.comparator_,this.root_.insert(e,n,this.comparator_).copy(null,null,wt.BLACK,null,null))}remove(e){return new an(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,wt.BLACK,null,null))}get(e){let n,r=this.root_;for(;!r.isEmpty();){if(n=this.comparator_(e,r.key),n===0)return r.value;n<0?r=r.left:n>0&&(r=r.right)}return null}getPredecessorKey(e){let n,r=this.root_,s=null;for(;!r.isEmpty();)if(n=this.comparator_(e,r.key),n===0){if(r.left.isEmpty())return s?s.key:null;for(r=r.left;!r.right.isEmpty();)r=r.right;return r.key}else n<0?r=r.left:n>0&&(s=r,r=r.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new gl(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,n){return new gl(this.root_,e,this.comparator_,!1,n)}getReverseIteratorFrom(e,n){return new gl(this.root_,e,this.comparator_,!0,n)}getReverseIterator(e){return new gl(this.root_,null,this.comparator_,!0,e)}}an.EMPTY_NODE=new nU;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rU(t,e){return Mo(t.name,e.name)}function ag(t,e){return Mo(t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let op;function sU(t){op=t}const $A=function(t){return typeof t=="number"?"number:"+_A(t):"string:"+t},jA=function(t){if(t.isLeafNode()){const e=t.val();X(typeof e=="string"||typeof e=="number"||typeof e=="object"&&Fr(e,".sv"),"Priority must be a string or number.")}else X(t===op||t.isEmpty(),"priority of unexpected type.");X(t===op||t.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let LE;class Et{static set __childrenNodeConstructor(e){LE=e}static get __childrenNodeConstructor(){return LE}constructor(e,n=Et.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=n,this.lazyHash_=null,X(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),jA(this.priorityNode_)}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new Et(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:Et.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return Ie(e)?this:Re(e)===".priority"?this.priorityNode_:Et.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,n){return null}updateImmediateChild(e,n){return e===".priority"?this.updatePriority(n):n.isEmpty()&&e!==".priority"?this:Et.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,n).updatePriority(this.priorityNode_)}updateChild(e,n){const r=Re(e);return r===null?n:n.isEmpty()&&r!==".priority"?this:(X(r!==".priority"||Cs(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(r,Et.__childrenNodeConstructor.EMPTY_NODE.updateChild(Ge(e),n)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,n){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+$A(this.priorityNode_.val())+":");const n=typeof this.value_;e+=n+":",n==="number"?e+=_A(this.value_):e+=this.value_,this.lazyHash_=pA(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===Et.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof Et.__childrenNodeConstructor?-1:(X(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const n=typeof e.value_,r=typeof this.value_,s=Et.VALUE_TYPE_ORDER.indexOf(n),i=Et.VALUE_TYPE_ORDER.indexOf(r);return X(s>=0,"Unknown leaf type: "+n),X(i>=0,"Unknown leaf type: "+r),s===i?r==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:i-s}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const n=e;return this.value_===n.value_&&this.priorityNode_.equals(n.priorityNode_)}else return!1}}Et.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let HA,qA;function iU(t){HA=t}function oU(t){qA=t}class aU extends Vh{compare(e,n){const r=e.node.getPriority(),s=n.node.getPriority(),i=r.compareTo(s);return i===0?Mo(e.name,n.name):i}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,n){return!e.getPriority().equals(n.getPriority())}minPost(){return Ce.MIN}maxPost(){return new Ce(li,new Et("[PRIORITY-POST]",qA))}makePost(e,n){const r=HA(e);return new Ce(n,new Et("[PRIORITY-POST]",r))}toString(){return".priority"}}const qt=new aU;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cU=Math.log(2);class lU{constructor(e){const n=i=>parseInt(Math.log(i)/cU,10),r=i=>parseInt(Array(i+1).join("1"),2);this.count=n(e+1),this.current_=this.count-1;const s=r(this.count);this.bits_=e+1&s}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const Pu=function(t,e,n,r){t.sort(e);const s=function(c,u){const h=u-c;let f,d;if(h===0)return null;if(h===1)return f=t[c],d=n?n(f):f,new wt(d,f.node,wt.BLACK,null,null);{const m=parseInt(h/2,10)+c,_=s(c,m),y=s(m+1,u);return f=t[m],d=n?n(f):f,new wt(d,f.node,wt.BLACK,_,y)}},i=function(c){let u=null,h=null,f=t.length;const d=function(_,y){const I=f-_,D=f;f-=_;const P=s(I+1,D),v=t[I],R=n?n(v):v;m(new wt(R,v.node,y,null,P))},m=function(_){u?(u.left=_,u=_):(h=_,u=_)};for(let _=0;_<c.count;++_){const y=c.nextBitIsOne(),I=Math.pow(2,c.count-(_+1));y?d(I,wt.BLACK):(d(I,wt.BLACK),d(I,wt.RED))}return h},o=new lU(t.length),a=i(o);return new an(r||e,a)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Vf;const Pi={};class wr{static get Default(){return X(Pi&&qt,"ChildrenNode.ts has not been loaded"),Vf=Vf||new wr({".priority":Pi},{".priority":qt}),Vf}constructor(e,n){this.indexes_=e,this.indexSet_=n}get(e){const n=co(this.indexes_,e);if(!n)throw new Error("No index defined for "+e);return n instanceof an?n:null}hasIndex(e){return Fr(this.indexSet_,e.toString())}addIndex(e,n){X(e!==no,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const r=[];let s=!1;const i=n.getIterator(Ce.Wrap);let o=i.getNext();for(;o;)s=s||e.isDefinedOn(o.node),r.push(o),o=i.getNext();let a;s?a=Pu(r,e.getCompare()):a=Pi;const c=e.toString(),u=Object.assign({},this.indexSet_);u[c]=e;const h=Object.assign({},this.indexes_);return h[c]=a,new wr(h,u)}addToIndexes(e,n){const r=lu(this.indexes_,(s,i)=>{const o=co(this.indexSet_,i);if(X(o,"Missing index implementation for "+i),s===Pi)if(o.isDefinedOn(e.node)){const a=[],c=n.getIterator(Ce.Wrap);let u=c.getNext();for(;u;)u.name!==e.name&&a.push(u),u=c.getNext();return a.push(e),Pu(a,o.getCompare())}else return Pi;else{const a=n.get(e.name);let c=s;return a&&(c=c.remove(new Ce(e.name,a))),c.insert(e,e.node)}});return new wr(r,this.indexSet_)}removeFromIndexes(e,n){const r=lu(this.indexes_,s=>{if(s===Pi)return s;{const i=n.get(e.name);return i?s.remove(new Ce(e.name,i)):s}});return new wr(r,this.indexSet_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let sa;class Me{static get EMPTY_NODE(){return sa||(sa=new Me(new an(ag),null,wr.Default))}constructor(e,n,r){this.children_=e,this.priorityNode_=n,this.indexMap_=r,this.lazyHash_=null,this.priorityNode_&&jA(this.priorityNode_),this.children_.isEmpty()&&X(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}isLeafNode(){return!1}getPriority(){return this.priorityNode_||sa}updatePriority(e){return this.children_.isEmpty()?this:new Me(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const n=this.children_.get(e);return n===null?sa:n}}getChild(e){const n=Re(e);return n===null?this:this.getImmediateChild(n).getChild(Ge(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,n){if(X(n,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(n);{const r=new Ce(e,n);let s,i;n.isEmpty()?(s=this.children_.remove(e),i=this.indexMap_.removeFromIndexes(r,this.children_)):(s=this.children_.insert(e,n),i=this.indexMap_.addToIndexes(r,this.children_));const o=s.isEmpty()?sa:this.priorityNode_;return new Me(s,o,i)}}updateChild(e,n){const r=Re(e);if(r===null)return n;{X(Re(e)!==".priority"||Cs(e)===1,".priority must be the last token in a path");const s=this.getImmediateChild(r).updateChild(Ge(e),n);return this.updateImmediateChild(r,s)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const n={};let r=0,s=0,i=!0;if(this.forEachChild(qt,(o,a)=>{n[o]=a.val(e),r++,i&&Me.INTEGER_REGEXP_.test(o)?s=Math.max(s,Number(o)):i=!1}),!e&&i&&s<2*r){const o=[];for(const a in n)o[a]=n[a];return o}else return e&&!this.getPriority().isEmpty()&&(n[".priority"]=this.getPriority().val()),n}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+$A(this.getPriority().val())+":"),this.forEachChild(qt,(n,r)=>{const s=r.hash();s!==""&&(e+=":"+n+":"+s)}),this.lazyHash_=e===""?"":pA(e)}return this.lazyHash_}getPredecessorChildName(e,n,r){const s=this.resolveIndex_(r);if(s){const i=s.getPredecessorKey(new Ce(e,n));return i?i.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const n=this.resolveIndex_(e);if(n){const r=n.minKey();return r&&r.name}else return this.children_.minKey()}getFirstChild(e){const n=this.getFirstChildName(e);return n?new Ce(n,this.children_.get(n)):null}getLastChildName(e){const n=this.resolveIndex_(e);if(n){const r=n.maxKey();return r&&r.name}else return this.children_.maxKey()}getLastChild(e){const n=this.getLastChildName(e);return n?new Ce(n,this.children_.get(n)):null}forEachChild(e,n){const r=this.resolveIndex_(e);return r?r.inorderTraversal(s=>n(s.name,s.node)):this.children_.inorderTraversal(n)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,n){const r=this.resolveIndex_(n);if(r)return r.getIteratorFrom(e,s=>s);{const s=this.children_.getIteratorFrom(e.name,Ce.Wrap);let i=s.peek();for(;i!=null&&n.compare(i,e)<0;)s.getNext(),i=s.peek();return s}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,n){const r=this.resolveIndex_(n);if(r)return r.getReverseIteratorFrom(e,s=>s);{const s=this.children_.getReverseIteratorFrom(e.name,Ce.Wrap);let i=s.peek();for(;i!=null&&n.compare(i,e)>0;)s.getNext(),i=s.peek();return s}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===Pc?-1:0}withIndex(e){if(e===no||this.indexMap_.hasIndex(e))return this;{const n=this.indexMap_.addIndex(e,this.children_);return new Me(this.children_,this.priorityNode_,n)}}isIndexed(e){return e===no||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const n=e;if(this.getPriority().equals(n.getPriority()))if(this.children_.count()===n.children_.count()){const r=this.getIterator(qt),s=n.getIterator(qt);let i=r.getNext(),o=s.getNext();for(;i&&o;){if(i.name!==o.name||!i.node.equals(o.node))return!1;i=r.getNext(),o=s.getNext()}return i===null&&o===null}else return!1;else return!1}}resolveIndex_(e){return e===no?null:this.indexMap_.get(e.toString())}}Me.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class uU extends Me{constructor(){super(new an(ag),Me.EMPTY_NODE,wr.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return Me.EMPTY_NODE}isEmpty(){return!1}}const Pc=new uU;Object.defineProperties(Ce,{MIN:{value:new Ce(vo,Me.EMPTY_NODE)},MAX:{value:new Ce(li,Pc)}});BA.__EMPTY_NODE=Me.EMPTY_NODE;Et.__childrenNodeConstructor=Me;sU(Pc);oU(Pc);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hU=!0;function jt(t,e=null){if(t===null)return Me.EMPTY_NODE;if(typeof t=="object"&&".priority"in t&&(e=t[".priority"]),X(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof t=="object"&&".value"in t&&t[".value"]!==null&&(t=t[".value"]),typeof t!="object"||".sv"in t){const n=t;return new Et(n,jt(e))}if(!(t instanceof Array)&&hU){const n=[];let r=!1;if(Cn(t,(o,a)=>{if(o.substring(0,1)!=="."){const c=jt(a);c.isEmpty()||(r=r||!c.getPriority().isEmpty(),n.push(new Ce(o,c)))}}),n.length===0)return Me.EMPTY_NODE;const i=Pu(n,rU,o=>o.name,ag);if(r){const o=Pu(n,qt.getCompare());return new Me(i,jt(e),new wr({".priority":o},{".priority":qt}))}else return new Me(i,jt(e),wr.Default)}else{let n=Me.EMPTY_NODE;return Cn(t,(r,s)=>{if(Fr(t,r)&&r.substring(0,1)!=="."){const i=jt(s);(i.isLeafNode()||!i.isEmpty())&&(n=n.updateImmediateChild(r,i))}}),n.updatePriority(jt(e))}}iU(jt);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fU extends Vh{constructor(e){super(),this.indexPath_=e,X(!Ie(e)&&Re(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,n){const r=this.extractChild(e.node),s=this.extractChild(n.node),i=r.compareTo(s);return i===0?Mo(e.name,n.name):i}makePost(e,n){const r=jt(e),s=Me.EMPTY_NODE.updateChild(this.indexPath_,r);return new Ce(n,s)}maxPost(){const e=Me.EMPTY_NODE.updateChild(this.indexPath_,Pc);return new Ce(li,e)}toString(){return LA(this.indexPath_,0).join("/")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dU extends Vh{compare(e,n){const r=e.node.compareTo(n.node);return r===0?Mo(e.name,n.name):r}isDefinedOn(e){return!0}indexedValueChanged(e,n){return!e.equals(n)}minPost(){return Ce.MIN}maxPost(){return Ce.MAX}makePost(e,n){const r=jt(e);return new Ce(n,r)}toString(){return".value"}}const pU=new dU;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mU(t){return{type:"value",snapshotNode:t}}function gU(t,e){return{type:"child_added",snapshotNode:e,childName:t}}function _U(t,e){return{type:"child_removed",snapshotNode:e,childName:t}}function VE(t,e,n){return{type:"child_changed",snapshotNode:e,childName:t,oldSnap:n}}function yU(t,e){return{type:"child_moved",snapshotNode:e,childName:t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cg{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=qt}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return X(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return X(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:vo}hasEnd(){return this.endSet_}getIndexEndValue(){return X(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return X(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:li}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return X(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===qt}copy(){const e=new cg;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function FE(t){const e={};if(t.isDefault())return e;let n;if(t.index_===qt?n="$priority":t.index_===pU?n="$value":t.index_===no?n="$key":(X(t.index_ instanceof fU,"Unrecognized index type!"),n=t.index_.toString()),e.orderBy=kt(n),t.startSet_){const r=t.startAfterSet_?"startAfter":"startAt";e[r]=kt(t.indexStartValue_),t.startNameSet_&&(e[r]+=","+kt(t.indexStartName_))}if(t.endSet_){const r=t.endBeforeSet_?"endBefore":"endAt";e[r]=kt(t.indexEndValue_),t.endNameSet_&&(e[r]+=","+kt(t.indexEndName_))}return t.limitSet_&&(t.isViewFromLeft()?e.limitToFirst=t.limit_:e.limitToLast=t.limit_),e}function UE(t){const e={};if(t.startSet_&&(e.sp=t.indexStartValue_,t.startNameSet_&&(e.sn=t.indexStartName_),e.sin=!t.startAfterSet_),t.endSet_&&(e.ep=t.indexEndValue_,t.endNameSet_&&(e.en=t.indexEndName_),e.ein=!t.endBeforeSet_),t.limitSet_){e.l=t.limit_;let n=t.viewFrom_;n===""&&(t.isViewFromLeft()?n="l":n="r"),e.vf=n}return t.index_!==qt&&(e.i=t.index_.toString()),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nu extends DA{reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,n){return n!==void 0?"tag$"+n:(X(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}constructor(e,n,r,s){super(),this.repoInfo_=e,this.onDataUpdate_=n,this.authTokenProvider_=r,this.appCheckTokenProvider_=s,this.log_=Sc("p:rest:"),this.listens_={}}listen(e,n,r,s){const i=e._path.toString();this.log_("Listen called for "+i+" "+e._queryIdentifier);const o=Nu.getListenId_(e,r),a={};this.listens_[o]=a;const c=FE(e._queryParams);this.restRequest_(i+".json",c,(u,h)=>{let f=h;if(u===404&&(f=null,u=null),u===null&&this.onDataUpdate_(i,f,!1,r),co(this.listens_,o)===a){let d;u?u===401?d="permission_denied":d="rest_error:"+u:d="ok",s(d,null)}})}unlisten(e,n){const r=Nu.getListenId_(e,n);delete this.listens_[r]}get(e){const n=FE(e._queryParams),r=e._path.toString(),s=new Xa;return this.restRequest_(r+".json",n,(i,o)=>{let a=o;i===404&&(a=null,i=null),i===null?(this.onDataUpdate_(r,a,!1,null),s.resolve(a)):s.reject(new Error(a))}),s.promise}refreshAuthToken(e){}restRequest_(e,n={},r){return n.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([s,i])=>{s&&s.accessToken&&(n.auth=s.accessToken),i&&i.token&&(n.ac=i.token);const o=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+hh(n);this.log_("Sending REST request for "+o);const a=new XMLHttpRequest;a.onreadystatechange=()=>{if(r&&a.readyState===4){this.log_("REST Response for "+o+" received. status:",a.status,"response:",a.responseText);let c=null;if(a.status>=200&&a.status<300){try{c=Ja(a.responseText)}catch{mn("Failed to parse JSON response for "+o+": "+a.responseText)}r(null,c)}else a.status!==401&&a.status!==404&&mn("Got unsuccessful REST response for "+o+" Status: "+a.status),r(a.status);r=null}},a.open("GET",o,!0),a.send()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vU{constructor(){this.rootNode_=Me.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,n){this.rootNode_=this.rootNode_.updateChild(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ou(){return{value:null,children:new Map}}function WA(t,e,n){if(Ie(e))t.value=n,t.children.clear();else if(t.value!==null)t.value=t.value.updateChild(e,n);else{const r=Re(e);t.children.has(r)||t.children.set(r,Ou());const s=t.children.get(r);e=Ge(e),WA(s,e,n)}}function ap(t,e,n){t.value!==null?n(e,t.value):EU(t,(r,s)=>{const i=new Xe(e.toString()+"/"+r);ap(s,i,n)})}function EU(t,e){t.children.forEach((n,r)=>{e(r,n)})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TU{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),n=Object.assign({},e);return this.last_&&Cn(this.last_,(r,s)=>{n[r]=n[r]-s}),this.last_=e,n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BE=10*1e3,wU=30*1e3,bU=5*60*1e3;class IU{constructor(e,n){this.server_=n,this.statsToReport_={},this.statsListener_=new TU(e);const r=BE+(wU-BE)*Math.random();Ma(this.reportStats_.bind(this),Math.floor(r))}reportStats_(){const e=this.statsListener_.get(),n={};let r=!1;Cn(e,(s,i)=>{i>0&&Fr(this.statsToReport_,s)&&(n[s]=i,r=!0)}),r&&this.server_.reportStats(n),Ma(this.reportStats_.bind(this),Math.floor(Math.random()*2*bU))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var tr;(function(t){t[t.OVERWRITE=0]="OVERWRITE",t[t.MERGE=1]="MERGE",t[t.ACK_USER_WRITE=2]="ACK_USER_WRITE",t[t.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(tr||(tr={}));function KA(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function zA(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function GA(t){return{fromUser:!1,fromServer:!0,queryId:t,tagged:!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Du{constructor(e,n,r){this.path=e,this.affectedTree=n,this.revert=r,this.type=tr.ACK_USER_WRITE,this.source=KA()}operationForChild(e){if(Ie(this.path)){if(this.affectedTree.value!=null)return X(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const n=this.affectedTree.subtree(new Xe(e));return new Du(Fe(),n,this.revert)}}else return X(Re(this.path)===e,"operationForChild called for unrelated child."),new Du(Ge(this.path),this.affectedTree,this.revert)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ui{constructor(e,n,r){this.source=e,this.path=n,this.snap=r,this.type=tr.OVERWRITE}operationForChild(e){return Ie(this.path)?new ui(this.source,Fe(),this.snap.getImmediateChild(e)):new ui(this.source,Ge(this.path),this.snap)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lc{constructor(e,n,r){this.source=e,this.path=n,this.children=r,this.type=tr.MERGE}operationForChild(e){if(Ie(this.path)){const n=this.children.subtree(new Xe(e));return n.isEmpty()?null:n.value?new ui(this.source,Fe(),n.value):new lc(this.source,Fe(),n)}else return X(Re(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new lc(this.source,Ge(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lg{constructor(e,n,r){this.node_=e,this.fullyInitialized_=n,this.filtered_=r}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(Ie(e))return this.isFullyInitialized()&&!this.filtered_;const n=Re(e);return this.isCompleteForChild(n)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}function AU(t,e,n,r){const s=[],i=[];return e.forEach(o=>{o.type==="child_changed"&&t.index_.indexedValueChanged(o.oldSnap,o.snapshotNode)&&i.push(yU(o.childName,o.snapshotNode))}),ia(t,s,"child_removed",e,r,n),ia(t,s,"child_added",e,r,n),ia(t,s,"child_moved",i,r,n),ia(t,s,"child_changed",e,r,n),ia(t,s,"value",e,r,n),s}function ia(t,e,n,r,s,i){const o=r.filter(a=>a.type===n);o.sort((a,c)=>CU(t,a,c)),o.forEach(a=>{const c=RU(t,a,i);s.forEach(u=>{u.respondsTo(a.type)&&e.push(u.createEvent(c,t.query_))})})}function RU(t,e,n){return e.type==="value"||e.type==="child_removed"||(e.prevName=n.getPredecessorChildName(e.childName,e.snapshotNode,t.index_)),e}function CU(t,e,n){if(e.childName==null||n.childName==null)throw Io("Should only compare child_ events.");const r=new Ce(e.childName,e.snapshotNode),s=new Ce(n.childName,n.snapshotNode);return t.index_.compare(r,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QA(t,e){return{eventCache:t,serverCache:e}}function La(t,e,n,r){return QA(new lg(e,n,r),t.serverCache)}function YA(t,e,n,r){return QA(t.eventCache,new lg(e,n,r))}function cp(t){return t.eventCache.isFullyInitialized()?t.eventCache.getNode():null}function hi(t){return t.serverCache.isFullyInitialized()?t.serverCache.getNode():null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ff;const SU=()=>(Ff||(Ff=new an(d4)),Ff);class ze{static fromObject(e){let n=new ze(null);return Cn(e,(r,s)=>{n=n.set(new Xe(r),s)}),n}constructor(e,n=SU()){this.value=e,this.children=n}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,n){if(this.value!=null&&n(this.value))return{path:Fe(),value:this.value};if(Ie(e))return null;{const r=Re(e),s=this.children.get(r);if(s!==null){const i=s.findRootMostMatchingPathAndValue(Ge(e),n);return i!=null?{path:It(new Xe(r),i.path),value:i.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(Ie(e))return this;{const n=Re(e),r=this.children.get(n);return r!==null?r.subtree(Ge(e)):new ze(null)}}set(e,n){if(Ie(e))return new ze(n,this.children);{const r=Re(e),i=(this.children.get(r)||new ze(null)).set(Ge(e),n),o=this.children.insert(r,i);return new ze(this.value,o)}}remove(e){if(Ie(e))return this.children.isEmpty()?new ze(null):new ze(null,this.children);{const n=Re(e),r=this.children.get(n);if(r){const s=r.remove(Ge(e));let i;return s.isEmpty()?i=this.children.remove(n):i=this.children.insert(n,s),this.value===null&&i.isEmpty()?new ze(null):new ze(this.value,i)}else return this}}get(e){if(Ie(e))return this.value;{const n=Re(e),r=this.children.get(n);return r?r.get(Ge(e)):null}}setTree(e,n){if(Ie(e))return n;{const r=Re(e),i=(this.children.get(r)||new ze(null)).setTree(Ge(e),n);let o;return i.isEmpty()?o=this.children.remove(r):o=this.children.insert(r,i),new ze(this.value,o)}}fold(e){return this.fold_(Fe(),e)}fold_(e,n){const r={};return this.children.inorderTraversal((s,i)=>{r[s]=i.fold_(It(e,s),n)}),n(e,this.value,r)}findOnPath(e,n){return this.findOnPath_(e,Fe(),n)}findOnPath_(e,n,r){const s=this.value?r(n,this.value):!1;if(s)return s;if(Ie(e))return null;{const i=Re(e),o=this.children.get(i);return o?o.findOnPath_(Ge(e),It(n,i),r):null}}foreachOnPath(e,n){return this.foreachOnPath_(e,Fe(),n)}foreachOnPath_(e,n,r){if(Ie(e))return this;{this.value&&r(n,this.value);const s=Re(e),i=this.children.get(s);return i?i.foreachOnPath_(Ge(e),It(n,s),r):new ze(null)}}foreach(e){this.foreach_(Fe(),e)}foreach_(e,n){this.children.inorderTraversal((r,s)=>{s.foreach_(It(e,r),n)}),this.value&&n(e,this.value)}foreachChild(e){this.children.inorderTraversal((n,r)=>{r.value&&e(n,r.value)})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vn{constructor(e){this.writeTree_=e}static empty(){return new Vn(new ze(null))}}function Va(t,e,n){if(Ie(e))return new Vn(new ze(n));{const r=t.writeTree_.findRootMostValueAndPath(e);if(r!=null){const s=r.path;let i=r.value;const o=wn(s,e);return i=i.updateChild(o,n),new Vn(t.writeTree_.set(s,i))}else{const s=new ze(n),i=t.writeTree_.setTree(e,s);return new Vn(i)}}}function $E(t,e,n){let r=t;return Cn(n,(s,i)=>{r=Va(r,It(e,s),i)}),r}function jE(t,e){if(Ie(e))return Vn.empty();{const n=t.writeTree_.setTree(e,new ze(null));return new Vn(n)}}function lp(t,e){return Ei(t,e)!=null}function Ei(t,e){const n=t.writeTree_.findRootMostValueAndPath(e);return n!=null?t.writeTree_.get(n.path).getChild(wn(n.path,e)):null}function HE(t){const e=[],n=t.writeTree_.value;return n!=null?n.isLeafNode()||n.forEachChild(qt,(r,s)=>{e.push(new Ce(r,s))}):t.writeTree_.children.inorderTraversal((r,s)=>{s.value!=null&&e.push(new Ce(r,s.value))}),e}function gs(t,e){if(Ie(e))return t;{const n=Ei(t,e);return n!=null?new Vn(new ze(n)):new Vn(t.writeTree_.subtree(e))}}function up(t){return t.writeTree_.isEmpty()}function Eo(t,e){return XA(Fe(),t.writeTree_,e)}function XA(t,e,n){if(e.value!=null)return n.updateChild(t,e.value);{let r=null;return e.children.inorderTraversal((s,i)=>{s===".priority"?(X(i.value!==null,"Priority writes must always be leaf nodes"),r=i.value):n=XA(It(t,s),i,n)}),!n.getChild(t).isEmpty()&&r!==null&&(n=n.updateChild(It(t,".priority"),r)),n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function JA(t,e){return rR(e,t)}function kU(t,e,n,r,s){X(r>t.lastWriteId,"Stacking an older write on top of newer ones"),s===void 0&&(s=!0),t.allWrites.push({path:e,snap:n,writeId:r,visible:s}),s&&(t.visibleWrites=Va(t.visibleWrites,e,n)),t.lastWriteId=r}function PU(t,e){for(let n=0;n<t.allWrites.length;n++){const r=t.allWrites[n];if(r.writeId===e)return r}return null}function NU(t,e){const n=t.allWrites.findIndex(a=>a.writeId===e);X(n>=0,"removeWrite called with nonexistent writeId.");const r=t.allWrites[n];t.allWrites.splice(n,1);let s=r.visible,i=!1,o=t.allWrites.length-1;for(;s&&o>=0;){const a=t.allWrites[o];a.visible&&(o>=n&&OU(a,r.path)?s=!1:xn(r.path,a.path)&&(i=!0)),o--}if(s){if(i)return DU(t),!0;if(r.snap)t.visibleWrites=jE(t.visibleWrites,r.path);else{const a=r.children;Cn(a,c=>{t.visibleWrites=jE(t.visibleWrites,It(r.path,c))})}return!0}else return!1}function OU(t,e){if(t.snap)return xn(t.path,e);for(const n in t.children)if(t.children.hasOwnProperty(n)&&xn(It(t.path,n),e))return!0;return!1}function DU(t){t.visibleWrites=ZA(t.allWrites,xU,Fe()),t.allWrites.length>0?t.lastWriteId=t.allWrites[t.allWrites.length-1].writeId:t.lastWriteId=-1}function xU(t){return t.visible}function ZA(t,e,n){let r=Vn.empty();for(let s=0;s<t.length;++s){const i=t[s];if(e(i)){const o=i.path;let a;if(i.snap)xn(n,o)?(a=wn(n,o),r=Va(r,a,i.snap)):xn(o,n)&&(a=wn(o,n),r=Va(r,Fe(),i.snap.getChild(a)));else if(i.children){if(xn(n,o))a=wn(n,o),r=$E(r,a,i.children);else if(xn(o,n))if(a=wn(o,n),Ie(a))r=$E(r,Fe(),i.children);else{const c=co(i.children,Re(a));if(c){const u=c.getChild(Ge(a));r=Va(r,Fe(),u)}}}else throw Io("WriteRecord should have .snap or .children")}}return r}function eR(t,e,n,r,s){if(!r&&!s){const i=Ei(t.visibleWrites,e);if(i!=null)return i;{const o=gs(t.visibleWrites,e);if(up(o))return n;if(n==null&&!lp(o,Fe()))return null;{const a=n||Me.EMPTY_NODE;return Eo(o,a)}}}else{const i=gs(t.visibleWrites,e);if(!s&&up(i))return n;if(!s&&n==null&&!lp(i,Fe()))return null;{const o=function(u){return(u.visible||s)&&(!r||!~r.indexOf(u.writeId))&&(xn(u.path,e)||xn(e,u.path))},a=ZA(t.allWrites,o,e),c=n||Me.EMPTY_NODE;return Eo(a,c)}}}function MU(t,e,n){let r=Me.EMPTY_NODE;const s=Ei(t.visibleWrites,e);if(s)return s.isLeafNode()||s.forEachChild(qt,(i,o)=>{r=r.updateImmediateChild(i,o)}),r;if(n){const i=gs(t.visibleWrites,e);return n.forEachChild(qt,(o,a)=>{const c=Eo(gs(i,new Xe(o)),a);r=r.updateImmediateChild(o,c)}),HE(i).forEach(o=>{r=r.updateImmediateChild(o.name,o.node)}),r}else{const i=gs(t.visibleWrites,e);return HE(i).forEach(o=>{r=r.updateImmediateChild(o.name,o.node)}),r}}function LU(t,e,n,r,s){X(r||s,"Either existingEventSnap or existingServerSnap must exist");const i=It(e,n);if(lp(t.visibleWrites,i))return null;{const o=gs(t.visibleWrites,i);return up(o)?s.getChild(n):Eo(o,s.getChild(n))}}function VU(t,e,n,r){const s=It(e,n),i=Ei(t.visibleWrites,s);if(i!=null)return i;if(r.isCompleteForChild(n)){const o=gs(t.visibleWrites,s);return Eo(o,r.getNode().getImmediateChild(n))}else return null}function FU(t,e){return Ei(t.visibleWrites,e)}function UU(t,e,n,r,s,i,o){let a;const c=gs(t.visibleWrites,e),u=Ei(c,Fe());if(u!=null)a=u;else if(n!=null)a=Eo(c,n);else return[];if(a=a.withIndex(o),!a.isEmpty()&&!a.isLeafNode()){const h=[],f=o.getCompare(),d=i?a.getReverseIteratorFrom(r,o):a.getIteratorFrom(r,o);let m=d.getNext();for(;m&&h.length<s;)f(m,r)!==0&&h.push(m),m=d.getNext();return h}else return[]}function BU(){return{visibleWrites:Vn.empty(),allWrites:[],lastWriteId:-1}}function hp(t,e,n,r){return eR(t.writeTree,t.treePath,e,n,r)}function tR(t,e){return MU(t.writeTree,t.treePath,e)}function qE(t,e,n,r){return LU(t.writeTree,t.treePath,e,n,r)}function xu(t,e){return FU(t.writeTree,It(t.treePath,e))}function $U(t,e,n,r,s,i){return UU(t.writeTree,t.treePath,e,n,r,s,i)}function ug(t,e,n){return VU(t.writeTree,t.treePath,e,n)}function nR(t,e){return rR(It(t.treePath,e),t.writeTree)}function rR(t,e){return{treePath:t,writeTree:e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jU{constructor(){this.changeMap=new Map}trackChildChange(e){const n=e.type,r=e.childName;X(n==="child_added"||n==="child_changed"||n==="child_removed","Only child changes supported for tracking"),X(r!==".priority","Only non-priority child changes can be tracked.");const s=this.changeMap.get(r);if(s){const i=s.type;if(n==="child_added"&&i==="child_removed")this.changeMap.set(r,VE(r,e.snapshotNode,s.snapshotNode));else if(n==="child_removed"&&i==="child_added")this.changeMap.delete(r);else if(n==="child_removed"&&i==="child_changed")this.changeMap.set(r,_U(r,s.oldSnap));else if(n==="child_changed"&&i==="child_added")this.changeMap.set(r,gU(r,e.snapshotNode));else if(n==="child_changed"&&i==="child_changed")this.changeMap.set(r,VE(r,e.snapshotNode,s.oldSnap));else throw Io("Illegal combination of changes: "+e+" occurred after "+s)}else this.changeMap.set(r,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HU{getCompleteChild(e){return null}getChildAfterChild(e,n,r){return null}}const sR=new HU;class hg{constructor(e,n,r=null){this.writes_=e,this.viewCache_=n,this.optCompleteServerCache_=r}getCompleteChild(e){const n=this.viewCache_.eventCache;if(n.isCompleteForChild(e))return n.getNode().getImmediateChild(e);{const r=this.optCompleteServerCache_!=null?new lg(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return ug(this.writes_,e,r)}}getChildAfterChild(e,n,r){const s=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:hi(this.viewCache_),i=$U(this.writes_,s,n,1,r,e);return i.length===0?null:i[0]}}function qU(t,e){X(e.eventCache.getNode().isIndexed(t.filter.getIndex()),"Event snap not indexed"),X(e.serverCache.getNode().isIndexed(t.filter.getIndex()),"Server snap not indexed")}function WU(t,e,n,r,s){const i=new jU;let o,a;if(n.type===tr.OVERWRITE){const u=n;u.source.fromUser?o=fp(t,e,u.path,u.snap,r,s,i):(X(u.source.fromServer,"Unknown source."),a=u.source.tagged||e.serverCache.isFiltered()&&!Ie(u.path),o=Mu(t,e,u.path,u.snap,r,s,a,i))}else if(n.type===tr.MERGE){const u=n;u.source.fromUser?o=zU(t,e,u.path,u.children,r,s,i):(X(u.source.fromServer,"Unknown source."),a=u.source.tagged||e.serverCache.isFiltered(),o=dp(t,e,u.path,u.children,r,s,a,i))}else if(n.type===tr.ACK_USER_WRITE){const u=n;u.revert?o=YU(t,e,u.path,r,s,i):o=GU(t,e,u.path,u.affectedTree,r,s,i)}else if(n.type===tr.LISTEN_COMPLETE)o=QU(t,e,n.path,r,i);else throw Io("Unknown operation type: "+n.type);const c=i.getChanges();return KU(e,o,c),{viewCache:o,changes:c}}function KU(t,e,n){const r=e.eventCache;if(r.isFullyInitialized()){const s=r.getNode().isLeafNode()||r.getNode().isEmpty(),i=cp(t);(n.length>0||!t.eventCache.isFullyInitialized()||s&&!r.getNode().equals(i)||!r.getNode().getPriority().equals(i.getPriority()))&&n.push(mU(cp(e)))}}function iR(t,e,n,r,s,i){const o=e.eventCache;if(xu(r,n)!=null)return e;{let a,c;if(Ie(n))if(X(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const u=hi(e),h=u instanceof Me?u:Me.EMPTY_NODE,f=tR(r,h);a=t.filter.updateFullNode(e.eventCache.getNode(),f,i)}else{const u=hp(r,hi(e));a=t.filter.updateFullNode(e.eventCache.getNode(),u,i)}else{const u=Re(n);if(u===".priority"){X(Cs(n)===1,"Can't have a priority with additional path components");const h=o.getNode();c=e.serverCache.getNode();const f=qE(r,n,h,c);f!=null?a=t.filter.updatePriority(h,f):a=o.getNode()}else{const h=Ge(n);let f;if(o.isCompleteForChild(u)){c=e.serverCache.getNode();const d=qE(r,n,o.getNode(),c);d!=null?f=o.getNode().getImmediateChild(u).updateChild(h,d):f=o.getNode().getImmediateChild(u)}else f=ug(r,u,e.serverCache);f!=null?a=t.filter.updateChild(o.getNode(),u,f,h,s,i):a=o.getNode()}}return La(e,a,o.isFullyInitialized()||Ie(n),t.filter.filtersNodes())}}function Mu(t,e,n,r,s,i,o,a){const c=e.serverCache;let u;const h=o?t.filter:t.filter.getIndexedFilter();if(Ie(n))u=h.updateFullNode(c.getNode(),r,null);else if(h.filtersNodes()&&!c.isFiltered()){const m=c.getNode().updateChild(n,r);u=h.updateFullNode(c.getNode(),m,null)}else{const m=Re(n);if(!c.isCompleteForPath(n)&&Cs(n)>1)return e;const _=Ge(n),I=c.getNode().getImmediateChild(m).updateChild(_,r);m===".priority"?u=h.updatePriority(c.getNode(),I):u=h.updateChild(c.getNode(),m,I,_,sR,null)}const f=YA(e,u,c.isFullyInitialized()||Ie(n),h.filtersNodes()),d=new hg(s,f,i);return iR(t,f,n,s,d,a)}function fp(t,e,n,r,s,i,o){const a=e.eventCache;let c,u;const h=new hg(s,e,i);if(Ie(n))u=t.filter.updateFullNode(e.eventCache.getNode(),r,o),c=La(e,u,!0,t.filter.filtersNodes());else{const f=Re(n);if(f===".priority")u=t.filter.updatePriority(e.eventCache.getNode(),r),c=La(e,u,a.isFullyInitialized(),a.isFiltered());else{const d=Ge(n),m=a.getNode().getImmediateChild(f);let _;if(Ie(d))_=r;else{const y=h.getCompleteChild(f);y!=null?MA(d)===".priority"&&y.getChild(VA(d)).isEmpty()?_=y:_=y.updateChild(d,r):_=Me.EMPTY_NODE}if(m.equals(_))c=e;else{const y=t.filter.updateChild(a.getNode(),f,_,d,h,o);c=La(e,y,a.isFullyInitialized(),t.filter.filtersNodes())}}}return c}function WE(t,e){return t.eventCache.isCompleteForChild(e)}function zU(t,e,n,r,s,i,o){let a=e;return r.foreach((c,u)=>{const h=It(n,c);WE(e,Re(h))&&(a=fp(t,a,h,u,s,i,o))}),r.foreach((c,u)=>{const h=It(n,c);WE(e,Re(h))||(a=fp(t,a,h,u,s,i,o))}),a}function KE(t,e,n){return n.foreach((r,s)=>{e=e.updateChild(r,s)}),e}function dp(t,e,n,r,s,i,o,a){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let c=e,u;Ie(n)?u=r:u=new ze(null).setTree(n,r);const h=e.serverCache.getNode();return u.children.inorderTraversal((f,d)=>{if(h.hasChild(f)){const m=e.serverCache.getNode().getImmediateChild(f),_=KE(t,m,d);c=Mu(t,c,new Xe(f),_,s,i,o,a)}}),u.children.inorderTraversal((f,d)=>{const m=!e.serverCache.isCompleteForChild(f)&&d.value===null;if(!h.hasChild(f)&&!m){const _=e.serverCache.getNode().getImmediateChild(f),y=KE(t,_,d);c=Mu(t,c,new Xe(f),y,s,i,o,a)}}),c}function GU(t,e,n,r,s,i,o){if(xu(s,n)!=null)return e;const a=e.serverCache.isFiltered(),c=e.serverCache;if(r.value!=null){if(Ie(n)&&c.isFullyInitialized()||c.isCompleteForPath(n))return Mu(t,e,n,c.getNode().getChild(n),s,i,a,o);if(Ie(n)){let u=new ze(null);return c.getNode().forEachChild(no,(h,f)=>{u=u.set(new Xe(h),f)}),dp(t,e,n,u,s,i,a,o)}else return e}else{let u=new ze(null);return r.foreach((h,f)=>{const d=It(n,h);c.isCompleteForPath(d)&&(u=u.set(h,c.getNode().getChild(d)))}),dp(t,e,n,u,s,i,a,o)}}function QU(t,e,n,r,s){const i=e.serverCache,o=YA(e,i.getNode(),i.isFullyInitialized()||Ie(n),i.isFiltered());return iR(t,o,n,r,sR,s)}function YU(t,e,n,r,s,i){let o;if(xu(r,n)!=null)return e;{const a=new hg(r,e,s),c=e.eventCache.getNode();let u;if(Ie(n)||Re(n)===".priority"){let h;if(e.serverCache.isFullyInitialized())h=hp(r,hi(e));else{const f=e.serverCache.getNode();X(f instanceof Me,"serverChildren would be complete if leaf node"),h=tR(r,f)}h=h,u=t.filter.updateFullNode(c,h,i)}else{const h=Re(n);let f=ug(r,h,e.serverCache);f==null&&e.serverCache.isCompleteForChild(h)&&(f=c.getImmediateChild(h)),f!=null?u=t.filter.updateChild(c,h,f,Ge(n),a,i):e.eventCache.getNode().hasChild(h)?u=t.filter.updateChild(c,h,Me.EMPTY_NODE,Ge(n),a,i):u=c,u.isEmpty()&&e.serverCache.isFullyInitialized()&&(o=hp(r,hi(e)),o.isLeafNode()&&(u=t.filter.updateFullNode(u,o,i)))}return o=e.serverCache.isFullyInitialized()||xu(r,Fe())!=null,La(e,u,o,t.filter.filtersNodes())}}function XU(t,e){const n=hi(t.viewCache_);return n&&(t.query._queryParams.loadsAllData()||!Ie(e)&&!n.getImmediateChild(Re(e)).isEmpty())?n.getChild(e):null}function zE(t,e,n,r){e.type===tr.MERGE&&e.source.queryId!==null&&(X(hi(t.viewCache_),"We should always have a full cache before handling merges"),X(cp(t.viewCache_),"Missing event cache, even though we have a server cache"));const s=t.viewCache_,i=WU(t.processor_,s,e,n,r);return qU(t.processor_,i.viewCache),X(i.viewCache.serverCache.isFullyInitialized()||!s.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),t.viewCache_=i.viewCache,JU(t,i.changes,i.viewCache.eventCache.getNode())}function JU(t,e,n,r){const s=t.eventRegistrations_;return AU(t.eventGenerator_,e,n,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let GE;function ZU(t){X(!GE,"__referenceConstructor has already been defined"),GE=t}function fg(t,e,n,r){const s=e.source.queryId;if(s!==null){const i=t.views.get(s);return X(i!=null,"SyncTree gave us an op for an invalid query."),zE(i,e,n,r)}else{let i=[];for(const o of t.views.values())i=i.concat(zE(o,e,n,r));return i}}function dg(t,e){let n=null;for(const r of t.views.values())n=n||XU(r,e);return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let QE;function e6(t){X(!QE,"__referenceConstructor has already been defined"),QE=t}class YE{constructor(e){this.listenProvider_=e,this.syncPointTree_=new ze(null),this.pendingWriteTree_=BU(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function t6(t,e,n,r,s){return kU(t.pendingWriteTree_,e,n,r,s),s?Uh(t,new ui(KA(),e,n)):[]}function $i(t,e,n=!1){const r=PU(t.pendingWriteTree_,e);if(NU(t.pendingWriteTree_,e)){let i=new ze(null);return r.snap!=null?i=i.set(Fe(),!0):Cn(r.children,o=>{i=i.set(new Xe(o),!0)}),Uh(t,new Du(r.path,i,n))}else return[]}function Fh(t,e,n){return Uh(t,new ui(zA(),e,n))}function n6(t,e,n){const r=ze.fromObject(n);return Uh(t,new lc(zA(),e,r))}function r6(t,e,n,r){const s=lR(t,r);if(s!=null){const i=uR(s),o=i.path,a=i.queryId,c=wn(o,e),u=new ui(GA(a),c,n);return hR(t,o,u)}else return[]}function s6(t,e,n,r){const s=lR(t,r);if(s){const i=uR(s),o=i.path,a=i.queryId,c=wn(o,e),u=ze.fromObject(n),h=new lc(GA(a),c,u);return hR(t,o,h)}else return[]}function oR(t,e,n){const s=t.pendingWriteTree_,i=t.syncPointTree_.findOnPath(e,(o,a)=>{const c=wn(o,e),u=dg(a,c);if(u)return u});return eR(s,e,i,n,!0)}function Uh(t,e){return aR(e,t.syncPointTree_,null,JA(t.pendingWriteTree_,Fe()))}function aR(t,e,n,r){if(Ie(t.path))return cR(t,e,n,r);{const s=e.get(Fe());n==null&&s!=null&&(n=dg(s,Fe()));let i=[];const o=Re(t.path),a=t.operationForChild(o),c=e.children.get(o);if(c&&a){const u=n?n.getImmediateChild(o):null,h=nR(r,o);i=i.concat(aR(a,c,u,h))}return s&&(i=i.concat(fg(s,t,r,n))),i}}function cR(t,e,n,r){const s=e.get(Fe());n==null&&s!=null&&(n=dg(s,Fe()));let i=[];return e.children.inorderTraversal((o,a)=>{const c=n?n.getImmediateChild(o):null,u=nR(r,o),h=t.operationForChild(o);h&&(i=i.concat(cR(h,a,c,u)))}),s&&(i=i.concat(fg(s,t,r,n))),i}function lR(t,e){return t.tagToQueryMap.get(e)}function uR(t){const e=t.indexOf("$");return X(e!==-1&&e<t.length-1,"Bad queryKey."),{queryId:t.substr(e+1),path:new Xe(t.substr(0,e))}}function hR(t,e,n){const r=t.syncPointTree_.get(e);X(r,"Missing sync point for query tag that we're tracking");const s=JA(t.pendingWriteTree_,e);return fg(r,n,s,null)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pg{constructor(e){this.node_=e}getImmediateChild(e){const n=this.node_.getImmediateChild(e);return new pg(n)}node(){return this.node_}}class mg{constructor(e,n){this.syncTree_=e,this.path_=n}getImmediateChild(e){const n=It(this.path_,e);return new mg(this.syncTree_,n)}node(){return oR(this.syncTree_,this.path_)}}const i6=function(t){return t=t||{},t.timestamp=t.timestamp||new Date().getTime(),t},XE=function(t,e,n){if(!t||typeof t!="object")return t;if(X(".sv"in t,"Unexpected leaf node or priority contents"),typeof t[".sv"]=="string")return o6(t[".sv"],e,n);if(typeof t[".sv"]=="object")return a6(t[".sv"],e);X(!1,"Unexpected server value: "+JSON.stringify(t,null,2))},o6=function(t,e,n){switch(t){case"timestamp":return n.timestamp;default:X(!1,"Unexpected server value: "+t)}},a6=function(t,e,n){t.hasOwnProperty("increment")||X(!1,"Unexpected server value: "+JSON.stringify(t,null,2));const r=t.increment;typeof r!="number"&&X(!1,"Unexpected increment value: "+r);const s=e.node();if(X(s!==null&&typeof s<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!s.isLeafNode())return r;const o=s.getValue();return typeof o!="number"?r:o+r},c6=function(t,e,n,r){return gg(e,new mg(n,t),r)},l6=function(t,e,n){return gg(t,new pg(e),n)};function gg(t,e,n){const r=t.getPriority().val(),s=XE(r,e.getImmediateChild(".priority"),n);let i;if(t.isLeafNode()){const o=t,a=XE(o.getValue(),e,n);return a!==o.getValue()||s!==o.getPriority().val()?new Et(a,jt(s)):t}else{const o=t;return i=o,s!==o.getPriority().val()&&(i=i.updatePriority(new Et(s))),o.forEachChild(qt,(a,c)=>{const u=gg(c,e.getImmediateChild(a),n);u!==c&&(i=i.updateImmediateChild(a,u))}),i}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _g{constructor(e="",n=null,r={children:{},childCount:0}){this.name=e,this.parent=n,this.node=r}}function yg(t,e){let n=e instanceof Xe?e:new Xe(e),r=t,s=Re(n);for(;s!==null;){const i=co(r.node.children,s)||{children:{},childCount:0};r=new _g(s,r,i),n=Ge(n),s=Re(n)}return r}function Lo(t){return t.node.value}function fR(t,e){t.node.value=e,pp(t)}function dR(t){return t.node.childCount>0}function u6(t){return Lo(t)===void 0&&!dR(t)}function Bh(t,e){Cn(t.node.children,(n,r)=>{e(new _g(n,t,r))})}function pR(t,e,n,r){n&&e(t),Bh(t,s=>{pR(s,e,!0)})}function h6(t,e,n){let r=t.parent;for(;r!==null;){if(e(r))return!0;r=r.parent}return!1}function Nc(t){return new Xe(t.parent===null?t.name:Nc(t.parent)+"/"+t.name)}function pp(t){t.parent!==null&&f6(t.parent,t.name,t)}function f6(t,e,n){const r=u6(n),s=Fr(t.node.children,e);r&&s?(delete t.node.children[e],t.node.childCount--,pp(t)):!r&&!s&&(t.node.children[e]=n.node,t.node.childCount++,pp(t))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const d6=/[\[\].#$\/\u0000-\u001F\u007F]/,p6=/[\[\].#$\u0000-\u001F\u007F]/,Uf=10*1024*1024,mR=function(t){return typeof t=="string"&&t.length!==0&&!d6.test(t)},m6=function(t){return typeof t=="string"&&t.length!==0&&!p6.test(t)},g6=function(t){return t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),m6(t)},gR=function(t,e,n){const r=n instanceof Xe?new Q4(n,t):n;if(e===void 0)throw new Error(t+"contains undefined "+js(r));if(typeof e=="function")throw new Error(t+"contains a function "+js(r)+" with contents = "+e.toString());if(mA(e))throw new Error(t+"contains "+e.toString()+" "+js(r));if(typeof e=="string"&&e.length>Uf/3&&fh(e)>Uf)throw new Error(t+"contains a string greater than "+Uf+" utf8 bytes "+js(r)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let s=!1,i=!1;if(Cn(e,(o,a)=>{if(o===".value")s=!0;else if(o!==".priority"&&o!==".sv"&&(i=!0,!mR(o)))throw new Error(t+" contains an invalid key ("+o+") "+js(r)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);Y4(r,o),gR(t,a,r),X4(r)}),s&&i)throw new Error(t+' contains ".value" child '+js(r)+" in addition to actual children.")}},_6=function(t,e){const n=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!mR(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||n.length!==0&&!g6(n))throw new Error(LD(t,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y6{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function v6(t,e){let n=null;for(let r=0;r<e.length;r++){const s=e[r],i=s.getPath();n!==null&&!FA(i,n.path)&&(t.eventLists_.push(n),n=null),n===null&&(n={events:[],path:i}),n.events.push(s)}n&&t.eventLists_.push(n)}function Ti(t,e,n){v6(t,n),E6(t,r=>xn(r,e)||xn(e,r))}function E6(t,e){t.recursionDepth_++;let n=!0;for(let r=0;r<t.eventLists_.length;r++){const s=t.eventLists_[r];if(s){const i=s.path;e(i)?(T6(t.eventLists_[r]),t.eventLists_[r]=null):n=!1}}n&&(t.eventLists_=[]),t.recursionDepth_--}function T6(t){for(let e=0;e<t.events.length;e++){const n=t.events[e];if(n!==null){t.events[e]=null;const r=n.getEventRunner();xa&&$t("event: "+n.toString()),kc(r)}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const w6="repo_interrupt",b6=25;class I6{constructor(e,n,r,s){this.repoInfo_=e,this.forceRestClient_=n,this.authTokenProvider_=r,this.appCheckProvider_=s,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new y6,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=Ou(),this.transactionQueueTree_=new _g,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function A6(t,e,n){if(t.stats_=sg(t.repoInfo_),t.forceRestClient_||v4())t.server_=new Nu(t.repoInfo_,(r,s,i,o)=>{JE(t,r,s,i,o)},t.authTokenProvider_,t.appCheckProvider_),setTimeout(()=>ZE(t,!0),0);else{if(typeof n<"u"&&n!==null){if(typeof n!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{kt(n)}catch(r){throw new Error("Invalid authOverride provided: "+r)}}t.persistentConnection_=new Ar(t.repoInfo_,e,(r,s,i,o)=>{JE(t,r,s,i,o)},r=>{ZE(t,r)},r=>{C6(t,r)},t.authTokenProvider_,t.appCheckProvider_,n),t.server_=t.persistentConnection_}t.authTokenProvider_.addTokenChangeListener(r=>{t.server_.refreshAuthToken(r)}),t.appCheckProvider_.addTokenChangeListener(r=>{t.server_.refreshAppCheckToken(r.token)}),t.statsReporter_=A4(t.repoInfo_,()=>new IU(t.stats_,t.server_)),t.infoData_=new vU,t.infoSyncTree_=new YE({startListening:(r,s,i,o)=>{let a=[];const c=t.infoData_.getNode(r._path);return c.isEmpty()||(a=Fh(t.infoSyncTree_,r._path,c),setTimeout(()=>{o("ok")},0)),a},stopListening:()=>{}}),vg(t,"connected",!1),t.serverSyncTree_=new YE({startListening:(r,s,i,o)=>(t.server_.listen(r,i,s,(a,c)=>{const u=o(a,c);Ti(t.eventQueue_,r._path,u)}),[]),stopListening:(r,s)=>{t.server_.unlisten(r,s)}})}function R6(t){const n=t.infoData_.getNode(new Xe(".info/serverTimeOffset")).val()||0;return new Date().getTime()+n}function _R(t){return i6({timestamp:R6(t)})}function JE(t,e,n,r,s){t.dataUpdateCount++;const i=new Xe(e);n=t.interceptServerDataCallback_?t.interceptServerDataCallback_(e,n):n;let o=[];if(s)if(r){const c=lu(n,u=>jt(u));o=s6(t.serverSyncTree_,i,c,s)}else{const c=jt(n);o=r6(t.serverSyncTree_,i,c,s)}else if(r){const c=lu(n,u=>jt(u));o=n6(t.serverSyncTree_,i,c)}else{const c=jt(n);o=Fh(t.serverSyncTree_,i,c)}let a=i;o.length>0&&(a=Tg(t,i)),Ti(t.eventQueue_,a,o)}function ZE(t,e){vg(t,"connected",e),e===!1&&k6(t)}function C6(t,e){Cn(e,(n,r)=>{vg(t,n,r)})}function vg(t,e,n){const r=new Xe("/.info/"+e),s=jt(n);t.infoData_.updateSnapshot(r,s);const i=Fh(t.infoSyncTree_,r,s);Ti(t.eventQueue_,r,i)}function S6(t){return t.nextWriteId_++}function k6(t){yR(t,"onDisconnectEvents");const e=_R(t),n=Ou();ap(t.onDisconnect_,Fe(),(s,i)=>{const o=c6(s,i,t.serverSyncTree_,e);WA(n,s,o)});let r=[];ap(n,Fe(),(s,i)=>{r=r.concat(Fh(t.serverSyncTree_,s,i));const o=D6(t,s);Tg(t,o)}),t.onDisconnect_=Ou(),Ti(t.eventQueue_,Fe(),r)}function P6(t){t.persistentConnection_&&t.persistentConnection_.interrupt(w6)}function yR(t,...e){let n="";t.persistentConnection_&&(n=t.persistentConnection_.id+":"),$t(n,...e)}function vR(t,e,n){return oR(t.serverSyncTree_,e,n)||Me.EMPTY_NODE}function Eg(t,e=t.transactionQueueTree_){if(e||$h(t,e),Lo(e)){const n=TR(t,e);X(n.length>0,"Sending zero length transaction queue"),n.every(s=>s.status===0)&&N6(t,Nc(e),n)}else dR(e)&&Bh(e,n=>{Eg(t,n)})}function N6(t,e,n){const r=n.map(u=>u.currentWriteId),s=vR(t,e,r);let i=s;const o=s.hash();for(let u=0;u<n.length;u++){const h=n[u];X(h.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),h.status=1,h.retryCount++;const f=wn(e,h.path);i=i.updateChild(f,h.currentOutputSnapshotRaw)}const a=i.val(!0),c=e;t.server_.put(c.toString(),a,u=>{yR(t,"transaction put response",{path:c.toString(),status:u});let h=[];if(u==="ok"){const f=[];for(let d=0;d<n.length;d++)n[d].status=2,h=h.concat($i(t.serverSyncTree_,n[d].currentWriteId)),n[d].onComplete&&f.push(()=>n[d].onComplete(null,!0,n[d].currentOutputSnapshotResolved)),n[d].unwatcher();$h(t,yg(t.transactionQueueTree_,e)),Eg(t,t.transactionQueueTree_),Ti(t.eventQueue_,e,h);for(let d=0;d<f.length;d++)kc(f[d])}else{if(u==="datastale")for(let f=0;f<n.length;f++)n[f].status===3?n[f].status=4:n[f].status=0;else{mn("transaction at "+c.toString()+" failed: "+u);for(let f=0;f<n.length;f++)n[f].status=4,n[f].abortReason=u}Tg(t,e)}},o)}function Tg(t,e){const n=ER(t,e),r=Nc(n),s=TR(t,n);return O6(t,s,r),r}function O6(t,e,n){if(e.length===0)return;const r=[];let s=[];const o=e.filter(a=>a.status===0).map(a=>a.currentWriteId);for(let a=0;a<e.length;a++){const c=e[a],u=wn(n,c.path);let h=!1,f;if(X(u!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),c.status===4)h=!0,f=c.abortReason,s=s.concat($i(t.serverSyncTree_,c.currentWriteId,!0));else if(c.status===0)if(c.retryCount>=b6)h=!0,f="maxretry",s=s.concat($i(t.serverSyncTree_,c.currentWriteId,!0));else{const d=vR(t,c.path,o);c.currentInputSnapshot=d;const m=e[a].update(d.val());if(m!==void 0){gR("transaction failed: Data returned ",m,c.path);let _=jt(m);typeof m=="object"&&m!=null&&Fr(m,".priority")||(_=_.updatePriority(d.getPriority()));const I=c.currentWriteId,D=_R(t),P=l6(_,d,D);c.currentOutputSnapshotRaw=_,c.currentOutputSnapshotResolved=P,c.currentWriteId=S6(t),o.splice(o.indexOf(I),1),s=s.concat(t6(t.serverSyncTree_,c.path,P,c.currentWriteId,c.applyLocally)),s=s.concat($i(t.serverSyncTree_,I,!0))}else h=!0,f="nodata",s=s.concat($i(t.serverSyncTree_,c.currentWriteId,!0))}Ti(t.eventQueue_,n,s),s=[],h&&(e[a].status=2,function(d){setTimeout(d,Math.floor(0))}(e[a].unwatcher),e[a].onComplete&&(f==="nodata"?r.push(()=>e[a].onComplete(null,!1,e[a].currentInputSnapshot)):r.push(()=>e[a].onComplete(new Error(f),!1,null))))}$h(t,t.transactionQueueTree_);for(let a=0;a<r.length;a++)kc(r[a]);Eg(t,t.transactionQueueTree_)}function ER(t,e){let n,r=t.transactionQueueTree_;for(n=Re(e);n!==null&&Lo(r)===void 0;)r=yg(r,n),e=Ge(e),n=Re(e);return r}function TR(t,e){const n=[];return wR(t,e,n),n.sort((r,s)=>r.order-s.order),n}function wR(t,e,n){const r=Lo(e);if(r)for(let s=0;s<r.length;s++)n.push(r[s]);Bh(e,s=>{wR(t,s,n)})}function $h(t,e){const n=Lo(e);if(n){let r=0;for(let s=0;s<n.length;s++)n[s].status!==2&&(n[r]=n[s],r++);n.length=r,fR(e,n.length>0?n:void 0)}Bh(e,r=>{$h(t,r)})}function D6(t,e){const n=Nc(ER(t,e)),r=yg(t.transactionQueueTree_,e);return h6(r,s=>{Bf(t,s)}),Bf(t,r),pR(r,s=>{Bf(t,s)}),n}function Bf(t,e){const n=Lo(e);if(n){const r=[];let s=[],i=-1;for(let o=0;o<n.length;o++)n[o].status===3||(n[o].status===1?(X(i===o-1,"All SENT items should be at beginning of queue."),i=o,n[o].status=3,n[o].abortReason="set"):(X(n[o].status===0,"Unexpected transaction status in abort"),n[o].unwatcher(),s=s.concat($i(t.serverSyncTree_,n[o].currentWriteId,!0)),n[o].onComplete&&r.push(n[o].onComplete.bind(null,new Error("set"),!1,null))));i===-1?fR(e,void 0):n.length=i+1,Ti(t.eventQueue_,Nc(e),s);for(let o=0;o<r.length;o++)kc(r[o])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function x6(t){let e="";const n=t.split("/");for(let r=0;r<n.length;r++)if(n[r].length>0){let s=n[r];try{s=decodeURIComponent(s.replace(/\+/g," "))}catch{}e+="/"+s}return e}function M6(t){const e={};t.charAt(0)==="?"&&(t=t.substring(1));for(const n of t.split("&")){if(n.length===0)continue;const r=n.split("=");r.length===2?e[decodeURIComponent(r[0])]=decodeURIComponent(r[1]):mn(`Invalid query segment '${n}' in query '${t}'`)}return e}const e0=function(t,e){const n=L6(t),r=n.namespace;n.domain==="firebase.com"&&ci(n.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!r||r==="undefined")&&n.domain!=="localhost"&&ci("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),n.secure||h4();const s=n.scheme==="ws"||n.scheme==="wss";return{repoInfo:new w4(n.host,n.secure,r,s,e,"",r!==n.subdomain),path:new Xe(n.pathString)}},L6=function(t){let e="",n="",r="",s="",i="",o=!0,a="https",c=443;if(typeof t=="string"){let u=t.indexOf("//");u>=0&&(a=t.substring(0,u-1),t=t.substring(u+2));let h=t.indexOf("/");h===-1&&(h=t.length);let f=t.indexOf("?");f===-1&&(f=t.length),e=t.substring(0,Math.min(h,f)),h<f&&(s=x6(t.substring(h,f)));const d=M6(t.substring(Math.min(t.length,f)));u=e.indexOf(":"),u>=0?(o=a==="https"||a==="wss",c=parseInt(e.substring(u+1),10)):u=e.length;const m=e.slice(0,u);if(m.toLowerCase()==="localhost")n="localhost";else if(m.split(".").length<=2)n=m;else{const _=e.indexOf(".");r=e.substring(0,_).toLowerCase(),n=e.substring(_+1),i=r}"ns"in d&&(i=d.ns)}return{host:e,port:c,domain:n,subdomain:r,secure:o,scheme:a,pathString:s,namespace:i}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wg{constructor(e,n,r,s){this._repo=e,this._path=n,this._queryParams=r,this._orderByCalled=s}get key(){return Ie(this._path)?null:MA(this._path)}get ref(){return new Vo(this._repo,this._path)}get _queryIdentifier(){const e=UE(this._queryParams),n=ng(e);return n==="{}"?"default":n}get _queryObject(){return UE(this._queryParams)}isEqual(e){if(e=Je(e),!(e instanceof wg))return!1;const n=this._repo===e._repo,r=FA(this._path,e._path),s=this._queryIdentifier===e._queryIdentifier;return n&&r&&s}toJSON(){return this.toString()}toString(){return this._repo.toString()+G4(this._path)}}class Vo extends wg{constructor(e,n){super(e,n,new cg,!1)}get parent(){const e=VA(this._path);return e===null?null:new Vo(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}ZU(Vo);e6(Vo);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V6="FIREBASE_DATABASE_EMULATOR_HOST",mp={};let F6=!1;function U6(t,e,n,r,s){let i=r||t.options.databaseURL;i===void 0&&(t.options.projectId||ci("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),$t("Using default host for project ",t.options.projectId),i=`${t.options.projectId}-default-rtdb.firebaseio.com`);let o=e0(i,s),a=o.repoInfo,c;typeof process<"u"&&EE&&(c=EE[V6]),c?(i=`http://${c}?ns=${a.namespace}`,o=e0(i,s),a=o.repoInfo):o.repoInfo.secure;const u=new T4(t.name,t.options,e);_6("Invalid Firebase Database URL",o),Ie(o.path)||ci("Database URL must point to the root of a Firebase Database (not including a child path).");const h=$6(a,t,u,new E4(t,n));return new j6(h,t)}function B6(t,e){const n=mp[e];(!n||n[t.key]!==t)&&ci(`Database ${e}(${t.repoInfo_}) has already been deleted.`),P6(t),delete n[t.key]}function $6(t,e,n,r){let s=mp[e.name];s||(s={},mp[e.name]=s);let i=s[t.toURLString()];return i&&ci("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),i=new I6(t,F6,n,r),s[t.toURLString()]=i,i}class j6{constructor(e,n){this._repoInternal=e,this.app=n,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(A6(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new Vo(this._repo,Fe())),this._rootInternal}_delete(){return this._rootInternal!==null&&(B6(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&ci("Cannot call "+e+" on a deleted database.")}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function H6(t){i4(Co),ir(new jn("database",(e,{instanceIdentifier:n})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),i=e.getProvider("app-check-internal");return U6(r,s,i,n)},"PUBLIC").setMultipleInstances(!0)),pn(TE,wE,t),pn(TE,wE,"esm2017")}Ar.prototype.simpleListen=function(t,e){this.sendRequest("q",{p:t},e)};Ar.prototype.echo=function(t,e){this.sendRequest("echo",{d:t},e)};H6();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bR="firebasestorage.googleapis.com",IR="storageBucket",q6=2*60*1e3,W6=10*60*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it extends lr{constructor(e,n,r=0){super($f(e),`Firebase Storage: ${n} (${$f(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,it.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return $f(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var st;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(st||(st={}));function $f(t){return"storage/"+t}function bg(){const t="An unknown error occurred, please check the error payload for server response.";return new it(st.UNKNOWN,t)}function K6(t){return new it(st.OBJECT_NOT_FOUND,"Object '"+t+"' does not exist.")}function z6(t){return new it(st.QUOTA_EXCEEDED,"Quota for bucket '"+t+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function G6(){const t="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new it(st.UNAUTHENTICATED,t)}function Q6(){return new it(st.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function Y6(t){return new it(st.UNAUTHORIZED,"User does not have permission to access '"+t+"'.")}function X6(){return new it(st.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function J6(){return new it(st.CANCELED,"User canceled the upload/download.")}function Z6(t){return new it(st.INVALID_URL,"Invalid URL '"+t+"'.")}function e9(t){return new it(st.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function t9(){return new it(st.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+IR+"' property when initializing the app?")}function n9(){return new it(st.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function r9(){return new it(st.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function s9(t){return new it(st.UNSUPPORTED_ENVIRONMENT,`${t} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function gp(t){return new it(st.INVALID_ARGUMENT,t)}function AR(){return new it(st.APP_DELETED,"The Firebase app was deleted.")}function i9(t){return new it(st.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function Fa(t,e){return new it(st.INVALID_FORMAT,"String does not match format '"+t+"': "+e)}function oa(t){throw new it(st.INTERNAL_ERROR,"Internal error: "+t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dn{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let r;try{r=dn.makeFromUrl(e,n)}catch{return new dn(e,"")}if(r.path==="")return r;throw e9(e)}static makeFromUrl(e,n){let r=null;const s="([A-Za-z0-9.\\-_]+)";function i(R){R.path.charAt(R.path.length-1)==="/"&&(R.path_=R.path_.slice(0,-1))}const o="(/(.*))?$",a=new RegExp("^gs://"+s+o,"i"),c={bucket:1,path:3};function u(R){R.path_=decodeURIComponent(R.path)}const h="v[A-Za-z0-9_]+",f=n.replace(/[.]/g,"\\."),d="(/([^?#]*).*)?$",m=new RegExp(`^https?://${f}/${h}/b/${s}/o${d}`,"i"),_={bucket:1,path:3},y=n===bR?"(?:storage.googleapis.com|storage.cloud.google.com)":n,I="([^?#]*)",D=new RegExp(`^https?://${y}/${s}/${I}`,"i"),v=[{regex:a,indices:c,postModify:i},{regex:m,indices:_,postModify:u},{regex:D,indices:{bucket:1,path:2},postModify:u}];for(let R=0;R<v.length;R++){const x=v[R],M=x.regex.exec(e);if(M){const b=M[x.indices.bucket];let E=M[x.indices.path];E||(E=""),r=new dn(b,E),x.postModify(r);break}}if(r==null)throw Z6(e);return r}}class o9{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function a9(t,e,n){let r=1,s=null,i=null,o=!1,a=0;function c(){return a===2}let u=!1;function h(...I){u||(u=!0,e.apply(null,I))}function f(I){s=setTimeout(()=>{s=null,t(m,c())},I)}function d(){i&&clearTimeout(i)}function m(I,...D){if(u){d();return}if(I){d(),h.call(null,I,...D);return}if(c()||o){d(),h.call(null,I,...D);return}r<64&&(r*=2);let v;a===1?(a=2,v=0):v=(r+Math.random())*1e3,f(v)}let _=!1;function y(I){_||(_=!0,d(),!u&&(s!==null?(I||(a=2),clearTimeout(s),f(0)):I||(a=1)))}return f(0),i=setTimeout(()=>{o=!0,y(!0)},n),y}function c9(t){t(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function l9(t){return t!==void 0}function u9(t){return typeof t=="object"&&!Array.isArray(t)}function Ig(t){return typeof t=="string"||t instanceof String}function t0(t){return Ag()&&t instanceof Blob}function Ag(){return typeof Blob<"u"}function n0(t,e,n,r){if(r<e)throw gp(`Invalid value for '${t}'. Expected ${e} or greater.`);if(r>n)throw gp(`Invalid value for '${t}'. Expected ${n} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rg(t,e,n){let r=e;return n==null&&(r=`https://${e}`),`${n}://${r}/v0${t}`}function RR(t){const e=encodeURIComponent;let n="?";for(const r in t)if(t.hasOwnProperty(r)){const s=e(r)+"="+e(t[r]);n=n+s+"&"}return n=n.slice(0,-1),n}var Zs;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(Zs||(Zs={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function h9(t,e){const n=t>=500&&t<600,s=[408,429].indexOf(t)!==-1,i=e.indexOf(t)!==-1;return n||s||i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f9{constructor(e,n,r,s,i,o,a,c,u,h,f,d=!0,m=!1){this.url_=e,this.method_=n,this.headers_=r,this.body_=s,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=a,this.errorCallback_=c,this.timeout_=u,this.progressCallback_=h,this.connectionFactory_=f,this.retry=d,this.isUsingEmulator=m,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((_,y)=>{this.resolve_=_,this.reject_=y,this.start_()})}start_(){const e=(r,s)=>{if(s){r(!1,new _l(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=a=>{const c=a.loaded,u=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,u)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const a=i.getErrorCode()===Zs.NO_ERROR,c=i.getStatus();if(!a||h9(c,this.additionalRetryCodes_)&&this.retry){const h=i.getErrorCode()===Zs.ABORT;r(!1,new _l(!1,null,h));return}const u=this.successCodes_.indexOf(c)!==-1;r(!0,new _l(u,i))})},n=(r,s)=>{const i=this.resolve_,o=this.reject_,a=s.connection;if(s.wasSuccessCode)try{const c=this.callback_(a,a.getResponse());l9(c)?i(c):i()}catch(c){o(c)}else if(a!==null){const c=bg();c.serverResponse=a.getErrorText(),this.errorCallback_?o(this.errorCallback_(a,c)):o(c)}else if(s.canceled){const c=this.appDelete_?AR():J6();o(c)}else{const c=X6();o(c)}};this.canceled_?n(!1,new _l(!1,null,!0)):this.backoffId_=a9(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&c9(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class _l{constructor(e,n,r){this.wasSuccessCode=e,this.connection=n,this.canceled=!!r}}function d9(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function p9(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function m9(t,e){e&&(t["X-Firebase-GMPID"]=e)}function g9(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function _9(t,e,n,r,s,i,o=!0,a=!1){const c=RR(t.urlParams),u=t.url+c,h=Object.assign({},t.headers);return m9(h,e),d9(h,n),p9(h,i),g9(h,r),new f9(u,t.method,h,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,s,o,a)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function y9(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function v9(...t){const e=y9();if(e!==void 0){const n=new e;for(let r=0;r<t.length;r++)n.append(t[r]);return n.getBlob()}else{if(Ag())return new Blob(t);throw new it(st.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function E9(t,e,n){return t.webkitSlice?t.webkitSlice(e,n):t.mozSlice?t.mozSlice(e,n):t.slice?t.slice(e,n):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function T9(t){if(typeof atob>"u")throw s9("base-64");return atob(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nr={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class jf{constructor(e,n){this.data=e,this.contentType=n||null}}function w9(t,e){switch(t){case nr.RAW:return new jf(CR(e));case nr.BASE64:case nr.BASE64URL:return new jf(SR(t,e));case nr.DATA_URL:return new jf(I9(e),A9(e))}throw bg()}function CR(t){const e=[];for(let n=0;n<t.length;n++){let r=t.charCodeAt(n);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(n<t.length-1&&(t.charCodeAt(n+1)&64512)===56320))e.push(239,191,189);else{const i=r,o=t.charCodeAt(++n);r=65536|(i&1023)<<10|o&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function b9(t){let e;try{e=decodeURIComponent(t)}catch{throw Fa(nr.DATA_URL,"Malformed data URL.")}return CR(e)}function SR(t,e){switch(t){case nr.BASE64:{const s=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(s||i)throw Fa(t,"Invalid character '"+(s?"-":"_")+"' found: is it base64url encoded?");break}case nr.BASE64URL:{const s=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(s||i)throw Fa(t,"Invalid character '"+(s?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=T9(e)}catch(s){throw s.message.includes("polyfill")?s:Fa(t,"Invalid character found")}const r=new Uint8Array(n.length);for(let s=0;s<n.length;s++)r[s]=n.charCodeAt(s);return r}class kR{constructor(e){this.base64=!1,this.contentType=null;const n=e.match(/^data:([^,]+)?,/);if(n===null)throw Fa(nr.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=n[1]||null;r!=null&&(this.base64=R9(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function I9(t){const e=new kR(t);return e.base64?SR(nr.BASE64,e.rest):b9(e.rest)}function A9(t){return new kR(t).contentType}function R9(t,e){return t.length>=e.length?t.substring(t.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class os{constructor(e,n){let r=0,s="";t0(e)?(this.data_=e,r=e.size,s=e.type):e instanceof ArrayBuffer?(n?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(n?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=s}size(){return this.size_}type(){return this.type_}slice(e,n){if(t0(this.data_)){const r=this.data_,s=E9(r,e,n);return s===null?null:new os(s)}else{const r=new Uint8Array(this.data_.buffer,e,n-e);return new os(r,!0)}}static getBlob(...e){if(Ag()){const n=e.map(r=>r instanceof os?r.data_:r);return new os(v9.apply(null,n))}else{const n=e.map(o=>Ig(o)?w9(nr.RAW,o).data:o.data_);let r=0;n.forEach(o=>{r+=o.byteLength});const s=new Uint8Array(r);let i=0;return n.forEach(o=>{for(let a=0;a<o.length;a++)s[i++]=o[a]}),new os(s,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function PR(t){let e;try{e=JSON.parse(t)}catch{return null}return u9(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function C9(t){if(t.length===0)return null;const e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function S9(t,e){const n=e.split("/").filter(r=>r.length>0).join("/");return t.length===0?n:t+"/"+n}function NR(t){const e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function k9(t,e){return e}class Qt{constructor(e,n,r,s){this.server=e,this.local=n||e,this.writable=!!r,this.xform=s||k9}}let yl=null;function P9(t){return!Ig(t)||t.length<2?t:NR(t)}function OR(){if(yl)return yl;const t=[];t.push(new Qt("bucket")),t.push(new Qt("generation")),t.push(new Qt("metageneration")),t.push(new Qt("name","fullPath",!0));function e(i,o){return P9(o)}const n=new Qt("name");n.xform=e,t.push(n);function r(i,o){return o!==void 0?Number(o):o}const s=new Qt("size");return s.xform=r,t.push(s),t.push(new Qt("timeCreated")),t.push(new Qt("updated")),t.push(new Qt("md5Hash",null,!0)),t.push(new Qt("cacheControl",null,!0)),t.push(new Qt("contentDisposition",null,!0)),t.push(new Qt("contentEncoding",null,!0)),t.push(new Qt("contentLanguage",null,!0)),t.push(new Qt("contentType",null,!0)),t.push(new Qt("metadata","customMetadata",!0)),yl=t,yl}function N9(t,e){function n(){const r=t.bucket,s=t.fullPath,i=new dn(r,s);return e._makeStorageReference(i)}Object.defineProperty(t,"ref",{get:n})}function O9(t,e,n){const r={};r.type="file";const s=n.length;for(let i=0;i<s;i++){const o=n[i];r[o.local]=o.xform(r,e[o.server])}return N9(r,t),r}function DR(t,e,n){const r=PR(e);return r===null?null:O9(t,r,n)}function D9(t,e,n,r){const s=PR(e);if(s===null||!Ig(s.downloadTokens))return null;const i=s.downloadTokens;if(i.length===0)return null;const o=encodeURIComponent;return i.split(",").map(u=>{const h=t.bucket,f=t.fullPath,d="/b/"+o(h)+"/o/"+o(f),m=Rg(d,n,r),_=RR({alt:"media",token:u});return m+_})[0]}function x9(t,e){const n={},r=e.length;for(let s=0;s<r;s++){const i=e[s];i.writable&&(n[i.server]=t[i.local])}return JSON.stringify(n)}class xR{constructor(e,n,r,s){this.url=e,this.method=n,this.handler=r,this.timeout=s,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function MR(t){if(!t)throw bg()}function M9(t,e){function n(r,s){const i=DR(t,s,e);return MR(i!==null),i}return n}function L9(t,e){function n(r,s){const i=DR(t,s,e);return MR(i!==null),D9(i,s,t.host,t._protocol)}return n}function LR(t){function e(n,r){let s;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?s=Q6():s=G6():n.getStatus()===402?s=z6(t.bucket):n.getStatus()===403?s=Y6(t.path):s=r,s.status=n.getStatus(),s.serverResponse=r.serverResponse,s}return e}function V9(t){const e=LR(t);function n(r,s){let i=e(r,s);return r.getStatus()===404&&(i=K6(t.path)),i.serverResponse=s.serverResponse,i}return n}function F9(t,e,n){const r=e.fullServerUrl(),s=Rg(r,t.host,t._protocol),i="GET",o=t.maxOperationRetryTime,a=new xR(s,i,L9(t,n),o);return a.errorHandler=V9(e),a}function U9(t,e){return t&&t.contentType||e&&e.type()||"application/octet-stream"}function B9(t,e,n){const r=Object.assign({},n);return r.fullPath=t.path,r.size=e.size(),r.contentType||(r.contentType=U9(null,e)),r}function $9(t,e,n,r,s){const i=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function a(){let v="";for(let R=0;R<2;R++)v=v+Math.random().toString().slice(2);return v}const c=a();o["Content-Type"]="multipart/related; boundary="+c;const u=B9(e,r,s),h=x9(u,n),f="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+h+`\r
--`+c+`\r
Content-Type: `+u.contentType+`\r
\r
`,d=`\r
--`+c+"--",m=os.getBlob(f,r,d);if(m===null)throw n9();const _={name:u.fullPath},y=Rg(i,t.host,t._protocol),I="POST",D=t.maxUploadRetryTime,P=new xR(y,I,M9(t,n),D);return P.urlParams=_,P.headers=o,P.body=m.uploadData(),P.errorHandler=LR(e),P}class j9{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=Zs.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=Zs.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=Zs.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,n,r,s,i){if(this.sent_)throw oa("cannot .send() more than once");if(Ao(e)&&r&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,e,!0),i!==void 0)for(const o in i)i.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,i[o].toString());return s!==void 0?this.xhr_.send(s):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw oa("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw oa("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw oa("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw oa("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class H9 extends j9{initXhr(){this.xhr_.responseType="text"}}function VR(){return new H9}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{constructor(e,n){this._service=e,n instanceof dn?this._location=n:this._location=dn.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new fi(e,n)}get root(){const e=new dn(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return NR(this._location.path)}get storage(){return this._service}get parent(){const e=C9(this._location.path);if(e===null)return null;const n=new dn(this._location.bucket,e);return new fi(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw i9(e)}}function q9(t,e,n){t._throwIfRoot("uploadBytes");const r=$9(t.storage,t._location,OR(),new os(e,!0),n);return t.storage.makeRequestWithTokens(r,VR).then(s=>({metadata:s,ref:t}))}function W9(t){t._throwIfRoot("getDownloadURL");const e=F9(t.storage,t._location,OR());return t.storage.makeRequestWithTokens(e,VR).then(n=>{if(n===null)throw r9();return n})}function K9(t,e){const n=S9(t._location.path,e),r=new dn(t._location.bucket,n);return new fi(t.storage,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z9(t){return/^[A-Za-z]+:\/\//.test(t)}function G9(t,e){return new fi(t,e)}function FR(t,e){if(t instanceof Cg){const n=t;if(n._bucket==null)throw t9();const r=new fi(n,n._bucket);return e!=null?FR(r,e):r}else return e!==void 0?K9(t,e):t}function Q9(t,e){if(e&&z9(e)){if(t instanceof Cg)return G9(t,e);throw gp("To use ref(service, url), the first argument must be a Storage instance.")}else return FR(t,e)}function r0(t,e){const n=e==null?void 0:e[IR];return n==null?null:dn.makeFromBucketSpec(n,t)}function Y9(t,e,n,r={}){t.host=`${e}:${n}`;const s=Ao(e);s&&(ib(`https://${t.host}`),ab("Storage",!0)),t._isUsingEmulator=!0,t._protocol=s?"https":"http";const{mockUserToken:i}=r;i&&(t._overrideAuthToken=typeof i=="string"?i:ob(i,t.app.options.projectId))}class Cg{constructor(e,n,r,s,i,o=!1){this.app=e,this._authProvider=n,this._appCheckProvider=r,this._url=s,this._firebaseVersion=i,this._isUsingEmulator=o,this._bucket=null,this._host=bR,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=q6,this._maxUploadRetryTime=W6,this._requests=new Set,s!=null?this._bucket=dn.makeFromBucketSpec(s,this._host):this._bucket=r0(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=dn.makeFromBucketSpec(this._url,e):this._bucket=r0(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){n0("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){n0("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Zt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new fi(this,e)}_makeRequest(e,n,r,s,i=!0){if(this._deleted)return new o9(AR());{const o=_9(e,this._appId,r,s,n,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,n){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,r,s).getPromise()}}const s0="@firebase/storage",i0="0.13.12";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const UR="storage";function bj(t,e,n){return t=Je(t),q9(t,e,n)}function Ij(t){return t=Je(t),W9(t)}function Aj(t,e){return t=Je(t),Q9(t,e)}function Rj(t=im(),e){t=Je(t);const r=db(t,UR).getImmediate({identifier:e}),s=rb("storage");return s&&X9(r,...s),r}function X9(t,e,n,r={}){Y9(t,e,n,r)}function J9(t,{instanceIdentifier:e}){const n=t.getProvider("app").getImmediate(),r=t.getProvider("auth-internal"),s=t.getProvider("app-check-internal");return new Cg(n,r,s,e,Co)}function Z9(){ir(new jn(UR,J9,"PUBLIC").setMultipleInstances(!0)),pn(s0,i0,""),pn(s0,i0,"esm2017")}Z9();const Hf=new WeakMap;function BR(t,e){return Hf.has(e)||Hf.set(e,{f:{},r:{},s:{},u:{}}),Hf.get(e)}function e5(t,e,n,r){if(!t)return n;const[s,i]=$R(t);if(!s)return n;const o=BR(void 0,r)[s]||{},a=e||i;return a&&a in o?o[a]:n}function t5(t,e,n,r){if(!t)return;const[s,i]=$R(t);if(!s)return;const o=BR(void 0,r)[s],a=e||i;if(a)return n.then(c=>{o[a]=c}).catch(er),a}function $R(t){return XF(t)||JF(t)?["f",t.path]:ZF(t)?["r",t.toString()]:e4(t)?["s",t.toString()]:[]}const qf=new WeakMap;function n5(t,e,n){const r=Lh();qf.has(r)||qf.set(r,new Map);const s=qf.get(r),i=t5(e,n,t,r);return i&&s.set(i,t),i?()=>s.delete(i):er}const r5={toFirestore(t){return t},fromFirestore(t,e){return t.exists()?Object.defineProperties(t.data(e),{id:{value:t.id}}):null}};function _p(t,e,n,r){if(!QF(t))return[t,{}];const s=[{},{}],i=Object.keys(n).reduce((a,c)=>{const u=n[c];return a[u.path]=u.data(),a},{});function o(a,c,u,h){c=c||{};const[f,d]=h;Object.getOwnPropertyNames(a).forEach(m=>{const _=Object.getOwnPropertyDescriptor(a,m);_&&!_.enumerable&&Object.defineProperty(f,m,_)});for(const m in a){const _=a[m];if(_==null||_ instanceof Date||_ instanceof dt||_ instanceof kh)f[m]=_;else if(eg(_)){const y=u+m;f[m]=y in n?c[m]:_.path,d[y]=_.converter?_:_.withConverter(r.converter)}else if(Array.isArray(_)){f[m]=Array(_.length);for(let y=0;y<_.length;y++){const I=_[y];I&&I.path in i&&(f[m][y]=i[I.path])}o(_,c[m]||f[m],u+m+".",[f[m],d])}else vi(_)?(f[m]={},o(_,c[m],u+m+".",[f[m],d])):f[m]=_}}return o(t,e,"",s),s}const Sg={reset:!1,wait:!0,maxRefDepth:2,converter:r5,snapshotOptions:{serverTimestamps:"estimate"}};function Lu(t){for(const e in t)t[e].unsub()}function yp(t,e,n,r,s,i,o,a,c){const[u,h]=_p(r.data(t.snapshotOptions),Zm(e,n),s,t);i.set(e,n,u),vp(t,e,n,s,h,i,o,a,c)}function s5({ref:t,target:e,path:n,depth:r,resolve:s,reject:i,ops:o},a){const c=Object.create(null);let u=er;return a.once?Oa(t).then(h=>{h.exists()?yp(a,e,n,h,c,o,r,s,i):(o.set(e,n,null),s())}).catch(i):u=qm(t,h=>{h.exists()?yp(a,e,n,h,c,o,r,s,i):(o.set(e,n,null),s())},i),()=>{u(),Lu(c)}}function vp(t,e,n,r,s,i,o,a,c){const u=Object.keys(s);if(Object.keys(r).filter(y=>u.indexOf(y)<0).forEach(y=>{r[y].unsub(),delete r[y]}),!u.length||++o>t.maxRefDepth)return a(n);let f=0;const d=u.length,m=Object.create(null);function _(y){y in m&&++f>=d&&a(n)}u.forEach(y=>{const I=r[y],D=s[y],P=`${n}.${y}`;if(m[P]=!0,I)if(I.path!==D.path)I.unsub();else return;r[y]={data:()=>Zm(e,P),unsub:s5({ref:D,target:e,path:P,depth:o,ops:i,resolve:_.bind(null,P),reject:c},t),path:D.path}})}function i5(t,e,n,r,s,i){const o=Object.assign({},Sg,i),{snapshotListenOptions:a,snapshotOptions:c,wait:u,once:h}=o,f="value";let d=ft(u?[]:t.value);u||n.set(t,f,[]);const m=r;let _,y=er;const I=[],D={added:({newIndex:v,doc:R})=>{I.splice(v,0,Object.create(null));const x=I[v],[M,b]=_p(R.data(c),void 0,x,o);n.add(Qn(d),v,M),vp(o,d,`${f}.${v}`,x,b,n,0,r.bind(null,R),s)},modified:({oldIndex:v,newIndex:R,doc:x})=>{const M=Qn(d),b=I[v],E=M[v],[T,A]=_p(x.data(c),E,b,o);I.splice(R,0,b),n.remove(M,v),n.add(M,R,T),vp(o,d,`${f}.${R}`,b,A,n,0,r,s)},removed:({oldIndex:v})=>{const R=Qn(d);n.remove(R,v),Lu(I.splice(v,1)[0])}};function P(v){const R=v.docChanges(a);if(!_&&R.length){_=!0;let x=0;const M=R.length,b=Object.create(null);for(let E=0;E<M;E++)b[R[E].doc.id]=!0;r=E=>{E&&E.id in b&&++x>=M&&(u&&(n.set(t,f,Qn(d)),d=t),m(Qn(d)),r=er)}}R.forEach(x=>{D[x.type](x)}),R.length||(u&&(n.set(t,f,Qn(d)),d=t),r(Qn(d)))}return h?_a(e).then(P).catch(s):y=qm(e,P,s),v=>{if(y(),v){const R=typeof v=="function"?v():[];n.set(t,f,R)}I.forEach(Lu)}}function o5(t,e,n,r,s,i){const o=Object.assign({},Sg,i),a="value",c=Object.create(null);r=t4(r,()=>Zm(t,a));let u=er;function h(f){f.exists()?yp(o,t,a,f,c,n,0,r,s):(n.set(t,a,null),r(null))}return o.once?Oa(e).then(h).catch(s):u=qm(e,h,s),f=>{if(u(),f){const d=typeof f=="function"?f():null;n.set(t,a,d)}Lu(c)}}const o0=Symbol();function jR(t,e){let n=er;const r=Object.assign({},Sg,e),s=Qn(t),i=r.target||ft();r4()&&(r.once=!0);const o=e5(s,r.ssrKey,o0,Lh()),a=o!==o0;a&&(i.value=o);let c=!a;const u=ft(!1),h=ft(),f=kr(),d=Sp();let m=er;function _(){let D=Qn(t);const P=new Promise((v,R)=>{if(n(r.reset),!D)return n=er,v(null);u.value=c,c=!0,D.converter||(D=D.withConverter(r.converter)),n=(eg(D)?o5:i5)(i,D,a5,v,R,r)}).catch(v=>(f.value===P&&(h.value=v),Promise.reject(v))).finally(()=>{f.value===P&&(u.value=!1)});f.value=P}let y=er;(at(t)||typeof t=="function")&&(y=Ln(t,_)),_(),s&&(m=n5(f.value,s,r.ssrKey)),d&&eS(I);function I(D=r.reset){y(),m(),n(D)}return Object.defineProperties(i,{error:{get:()=>h},data:{get:()=>i},pending:{get:()=>u},promise:{get:()=>f},stop:{get:()=>I}})}const a5={set:(t,e,n)=>zF(t,e,n),add:(t,e,n)=>t.splice(e,0,n),remove:(t,e)=>t.splice(e,1)};function c5(t,e){return jR(t,{target:ft([]),...e})}function HR(t,e){return jR(t,e)}function Ps(t){return $2(Lh(t))}const l5=Symbol("VueFireAuth");function Cj(t){return KF?ct(l5):null}function qR(){function t(r){return!r||typeof r!="string"?n():r.trim().toLowerCase().replace(/\s+/g,"")||n()}function e(r,s){return s!=null&&s.trim()?s:r!=null&&r.trim()&&r.split("@")[0]||n()}function n(){return Math.random().toString(36).substring(2,10)}return{generateHandle:t,generateDisplayName:e,randomUserId:n}}const WR=(t,e)=>({default:()=>{var n;return t?At(Qk,t===!0?{}:t,e):(n=e.default)==null?void 0:n.call(e)}}),u5=/(:\w+)\([^)]+\)/g,h5=/(:\w+)[?+*]/g,f5=/:\w+/g;function a0(t){const e=(t==null?void 0:t.meta.key)??t.path.replace(u5,"$1").replace(h5,"$1").replace(f5,n=>{var r;return((r=t.params[n.slice(1)])==null?void 0:r.toString())||""});return typeof e=="function"?e(t):e}function d5(t,e){return t===e||e===En?!1:a0(t)!==a0(e)?!0:!t.matched.every((r,s)=>{var i,o;return r.components&&r.components.default===((o=(i=e.matched[s])==null?void 0:i.components)==null?void 0:o.default)})}const c0=globalThis.requestIdleCallback||(t=>{const e=Date.now(),n={didTimeout:!1,timeRemaining:()=>Math.max(0,50-(Date.now()-e))};return setTimeout(()=>{t(n)},1)}),Sj=globalThis.cancelIdleCallback||(t=>{clearTimeout(t)}),kg=t=>{const e=rt();e.isHydrating?e.hooks.hookOnce("app:suspense:resolve",()=>{c0(()=>t())}):c0(()=>t())},p5="$s";function m5(...t){const e=typeof t[t.length-1]=="string"?t.pop():void 0;typeof t[0]!="string"&&t.unshift(e);const[n,r]=t;if(!n||typeof n!="string")throw new TypeError("[nuxt] [useState] key must be a string: "+n);if(r!==void 0&&typeof r!="function")throw new Error("[nuxt] [useState] init must be a function: "+r);const s=p5+n,i=rt(),o=Y0(i.payload.state,s);if(o.value===void 0&&r){const a=r();if(at(a))return i.payload.state[s]=a,a;o.value=a}return o}function g5(t){if(t!=null&&t.__asyncLoader&&!t.__asyncResolved)return t.__asyncLoader()}async function _5(t,e=ln()){const{path:n,matched:r}=e.resolve(t);if(!r.length||(e._routePreloaded||(e._routePreloaded=new Set),e._routePreloaded.has(n)))return;const s=e._preloadPromises||(e._preloadPromises=[]);if(s.length>4)return Promise.all(s).then(()=>_5(t,e));e._routePreloaded.add(n);const i=r.map(o=>{var a;return(a=o.components)==null?void 0:a.default}).filter(o=>typeof o=="function");for(const o of i){const a=Promise.resolve(o()).catch(()=>{}).finally(()=>s.splice(s.indexOf(a)));s.push(a)}await Promise.all(s)}function y5(t={}){const e=t.path||window.location.pathname;let n={};try{n=tu(sessionStorage.getItem("nuxt:reload")||"{}")}catch{}if(t.force||(n==null?void 0:n.path)!==e||(n==null?void 0:n.expires)<Date.now()){try{sessionStorage.setItem("nuxt:reload",JSON.stringify({path:e,expires:Date.now()+(t.ttl??1e4)}))}catch{}if(t.persistState)try{sessionStorage.setItem("nuxt:reload:state",JSON.stringify({state:rt().payload.state}))}catch{}window.location.pathname!==e?window.location.href=e:window.location.reload()}}const v5={scrollBehavior(t,e,n){var c;const r=rt(),s=((c=ln().options)==null?void 0:c.scrollBehaviorType)??"auto";if(t.path===e.path)return e.hash&&!t.hash?{left:0,top:0}:t.hash?{el:t.hash,top:KR(t.hash),behavior:s}:!1;if((typeof t.meta.scrollToTop=="function"?t.meta.scrollToTop(t,e):t.meta.scrollToTop)===!1)return!1;let o=n||void 0;!o&&d5(t,e)&&(o={left:0,top:0});const a=r._runningTransition?"page:transition:finish":"page:loading:end";return new Promise(u=>{if(e===En){u(l0(t,"instant",o));return}r.hooks.hookOnce(a,()=>{requestAnimationFrame(()=>u(l0(t,"instant",o)))})})}};function KR(t){try{const e=document.querySelector(t);if(e)return(Number.parseFloat(getComputedStyle(e).scrollMarginTop)||0)+(Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0)}catch{}return 0}function l0(t,e,n){return n||(t.hash?{el:t.hash,top:KR(t.hash),behavior:e}:{left:0,top:0,behavior:e})}const E5={hashMode:!1,scrollBehaviorType:"auto"},Kn={...E5,...v5},T5={nuxt:{},ui:{colors:{primary:"green",secondary:"blue",success:"green",info:"blue",warning:"yellow",error:"red",neutral:"slate"},icons:{arrowLeft:"i-lucide-arrow-left",arrowRight:"i-lucide-arrow-right",check:"i-lucide-check",chevronDoubleLeft:"i-lucide-chevrons-left",chevronDoubleRight:"i-lucide-chevrons-right",chevronDown:"i-lucide-chevron-down",chevronLeft:"i-lucide-chevron-left",chevronRight:"i-lucide-chevron-right",chevronUp:"i-lucide-chevron-up",close:"i-lucide-x",ellipsis:"i-lucide-ellipsis",external:"i-lucide-arrow-up-right",folder:"i-lucide-folder",folderOpen:"i-lucide-folder-open",loading:"i-lucide-loader-circle",minus:"i-lucide-minus",plus:"i-lucide-plus",search:"i-lucide-search"}},icon:{provider:"server",class:"",aliases:{},iconifyApiEndpoint:"https://api.iconify.design",localApiEndpoint:"/api/_nuxt_icon",fallbackToApi:!0,cssSelectorPrefix:"i-",cssWherePseudo:!0,cssLayer:"components",mode:"css",attrs:{"aria-hidden":!0},collections:["academicons","akar-icons","ant-design","arcticons","basil","bi","bitcoin-icons","bpmn","brandico","bx","bxl","bxs","bytesize","carbon","catppuccin","cbi","charm","ci","cib","cif","cil","circle-flags","circum","clarity","codicon","covid","cryptocurrency","cryptocurrency-color","dashicons","devicon","devicon-plain","ei","el","emojione","emojione-monotone","emojione-v1","entypo","entypo-social","eos-icons","ep","et","eva","f7","fa","fa-brands","fa-regular","fa-solid","fa6-brands","fa6-regular","fa6-solid","fad","fe","feather","file-icons","flag","flagpack","flat-color-icons","flat-ui","flowbite","fluent","fluent-emoji","fluent-emoji-flat","fluent-emoji-high-contrast","fluent-mdl2","fontelico","fontisto","formkit","foundation","fxemoji","gala","game-icons","geo","gg","gis","gravity-ui","gridicons","grommet-icons","guidance","healthicons","heroicons","heroicons-outline","heroicons-solid","hugeicons","humbleicons","ic","icomoon-free","icon-park","icon-park-outline","icon-park-solid","icon-park-twotone","iconamoon","iconoir","icons8","il","ion","iwwa","jam","la","lets-icons","line-md","logos","ls","lucide","lucide-lab","mage","majesticons","maki","map","marketeq","material-symbols","material-symbols-light","mdi","mdi-light","medical-icon","memory","meteocons","mi","mingcute","mono-icons","mynaui","nimbus","nonicons","noto","noto-v1","octicon","oi","ooui","openmoji","oui","pajamas","pepicons","pepicons-pencil","pepicons-pop","pepicons-print","ph","pixelarticons","prime","ps","quill","radix-icons","raphael","ri","rivet-icons","si-glyph","simple-icons","simple-line-icons","skill-icons","solar","streamline","streamline-emojis","subway","svg-spinners","system-uicons","tabler","tdesign","teenyicons","token","token-branded","topcoat","twemoji","typcn","uil","uim","uis","uit","uiw","unjs","vaadin","vs","vscode-icons","websymbol","weui","whh","wi","wpf","zmdi","zondicons"],fetchTimeout:1500}},w5=K1(T5);function zR(){const t=rt();return t._appConfig||(t._appConfig=ar(w5)),t._appConfig}function Ns(){const t=bo(),e=t.public.appSettings,n=t.public.devMode,{projectName:r,appName:s,appId:i,appIcon:o}=e;if(!r||typeof r!="string")throw new Error("❌ Project Name must be a valid string.");if(!s||typeof s!="string")throw new Error("❌ App Name must be a valid string.");if(!i||typeof i!="string")throw new Error("❌ App ID must be a valid string.");return{devMode:n,projectName:r,appName:s,appId:i,appIcon:o}}function GR(){const t=Ps(),{appId:e}=Ns();async function n(o,a){const c=Ui(t,o),u=await i(a);await rV(c,u)}async function r(o,a,c){const u=On(t,o,a),h=await i(c);await tV(u,h)}function s(){const o=tg().value;if(!(o!=null&&o.uid))throw new Error("User is not authenticated.");return o.uid}async function i(o){return{...o,appId:e,created_at:QI(),creator_id:s()}}return{createDocument:n,setDocument:r}}function Oc(){const t=Ps(),{appId:e}=Ns();async function n(c,u,h,f=!0){const d=[$s(u,"==",h)];f&&d.push($s("appId","==",e));const m=Ol(Ui(t,c),...d);return!(await _a(m)).empty}function r(c){return`${e}/${c}`}async function s(c,u,h){const f=[$s(u,"==",h)];f.push($s("appId","==",e));const d=Ol(Ui(t,c),...f);return(await _a(d)).docs.map(_=>_.data())}async function i(c,u,h){const f=[$s(u,"==",h),$s("appId","==",e)],d=Ol(Ui(t,c),...f),m=await _a(d);return m.empty?null:m.docs[0].data()}async function o(c,u,h){const f=Ui(t,`${c}/${u}/${h}`);return(await _a(f)).docs.map(m=>m.data())}async function a(c=5e3){const u=tg(),h=Date.now();return new Promise((f,d)=>{const m=()=>{u.value&&u.value.uid?f(u.value):Date.now()-h>c?(console.error("Timeout waiting for current user or invalid user"),d(new Error("Timeout waiting for current user or invalid user"))):setTimeout(m,50)};m()})}return{checkUnique:n,getCollectionPath:r,fetchDocumentsByField:s,firestoreQueryOneByField:i,firestoreFetchSubcollection:o,waitForCurrentUser:a}}function b5(){const t=Ps(),{appId:e}=Ns(),{waitForCurrentUser:n}=Oc();async function r(i){await n();const o=Ol(Ui(t,i),$s("appId","==",e)),{data:a}=c5(o,{ssrKey:i});return a}async function s(i,o){await n();const a=On(t,i,o),{data:c}=HR(a,{ssrKey:`${i}-${o}`});return c}return{firestoreFetchCollection:r,firestoreFetchDoc:s}}function I5(){const t=Ps(),{appName:e,appId:n}=Ns(),{waitForCurrentUser:r}=Oc();async function s(i,o,a){if(!i||!o||!a)return Promise.reject("❌ Collection name, document ID, and data are required.");try{await r();const c=On(t,i,o);a.updated_at=QI(),await Hm(c,{...a,app_name:e,app_id:n}),console.log(`✅ Document updated in '${i}' with ID: ${o}`)}catch(c){throw console.error(`❌ Error updating document in '${i}':`,c),c}}return{updateDocument:s}}function A5(){const t=Ps(),{waitForCurrentUser:e}=Oc();async function n(r,s){await e();const i=On(t,r,s);await nV(i)}return{deleteDocument:n}}function R5(){try{const t=b5(),e=GR(),n=I5(),r=A5(),s=Oc();return{...t,...e,...n,...r,...s}}catch(t){throw console.error("Error initializing Firestore Manager:",t),t}}function C5(){async function t(e){var n;try{console.log("🚀 [ensureAppUser] Function invoked.");const{appId:r}=Ns();if(!r){console.warn("⚠️ [ensureAppUser] No app ID configured");return}const{waitForCurrentUser:s}=R5(),i=await s();if(!i||!i.uid){console.warn("⚠️ [ensureAppUser] No current user found after waiting");return}const o=i.uid;if(!e){const{useCoreUserEnsure:P}=await Se(async()=>{const{useCoreUserEnsure:R}=await import("./CFEbfYP3.js");return{useCoreUserEnsure:R}},__vite__mapDeps([0,1]),import.meta.url),{ensureCoreUser:v}=P();await v()}const a=Ps(),c=On(a,"apps",r),u=await Oa(c);if(!u.exists()){console.warn(`❌ [ensureAppUser] App [${r}] does not exist`);return}const h=u.data(),f=On(a,`apps/${r}/users`,o);if((await Oa(f)).exists()){console.log(`✅ [ensureAppUser] App user exists for ${r}`);return}let m=e;if(!m){const P=On(a,"core-users",o),v=await Oa(P);if(!v.exists()){console.warn(`❌ [ensureAppUser] Core user [${o}] not found`);return}if(m=v.data(),!m){console.warn(`❌ [ensureAppUser] Core user data for [${o}] is empty`);return}}const{generateHandle:_}=qR(),{setDocument:y}=GR(),I={uid:o,email:m.email,role:(n=h.admin_ids)!=null&&n.includes(o)?"admin":"user",display_name:m.email,avatar:m.avatar,handle:_(m.email),bio:""};await y(`apps/${r}/users`,o,I),console.log(`✅ [ensureAppUser] Created app user for ${r}`);const D=On(a,"core-users",o);await Hm(D,{userOf:sV(r)}),console.log(`✅ [ensureAppUser] Added ${r} to core user's userOf array`)}catch(r){console.error(`❌ [ensureAppUser] Error: ${r}`)}}return t}function S5(){const t=Ps(),{waitForCurrentUser:e}=Oc(),{appId:n}=Ns();async function r(d){const m=await e(),_=On(t,`apps/${n}/users/${m.uid}`);await Hm(_,d)}async function s(d){await r({avatar:d})}async function i(d){await r({handle:d})}async function o(d){await r({display_name:d})}async function a(d){await r({bio:d})}async function c(d){await r({notifications:d})}async function u(d){await r({followers:d})}async function h(d){await r({following:d})}async function f(d){await r({preferences:d})}return{updateAppProfile:r,updateAvatar:s,updateHandle:i,updateDisplayName:o,updateBio:a,updateNotifications:c,updateFollowers:u,updateFollowing:h,updatePreferences:f}}function k5(){const t=Ps(),e=tg(),{appId:n}=Ns(),r=nt(()=>e.value&&n?On(t,`apps/${n}/users`,e.value.uid):null),{data:s}=HR(r),i=nt(()=>{var h,f;return s.value?{...s.value,display_name:s.value.display_name||((h=e.value)==null?void 0:h.displayName)||s.value.email,handle:s.value.handle||((f=s.value.email)==null?void 0:f.split("@")[0])||"user",notifications:s.value.notifications||[],followers:s.value.followers||[],following:s.value.following||[]}:null}),o=nt(()=>{var h;return((h=i.value)==null?void 0:h.role)==="admin"}),a=nt(()=>{var h,f;return((f=(h=i.value)==null?void 0:h.subscription)==null?void 0:f.is_pro)===!0});function c(h="pro"){var f,d,m,_;return h==="pro"?a.value:((d=(f=i.value)==null?void 0:f.subscription)==null?void 0:d.plan)===h&&((_=(m=i.value)==null?void 0:m.subscription)==null?void 0:_.is_pro)===!0}const u=nt(()=>{var h,f;return((f=(h=i.value)==null?void 0:h.subscription)==null?void 0:f.plan)||"free"});return{appUser:i,isAdmin:o,isPro:a,hasSubscription:c,subscriptionPlan:u,...qR(),...C5(),...S5()}}function P5(){const{appIcon:t,appName:e}=Ns(),n=typeof t=="string"&&t?`i-lucide-${t}`:"i-lucide-app";return{app:[{label:typeof e=="string"?e:"App",icon:n,to:"/content"},{label:"Products",icon:"i-lucide-box",to:"/products"},{label:"Blog",icon:"i-lucide-book",to:"/blog"}],dashboard:[{label:"User",icon:"i-lucide-user-circle",children:[{label:"Overview",icon:"i-lucide-layout-dashboard",to:"/dashboard"},{label:"Profile",icon:"i-lucide-user",to:"/dashboard/profile"},{label:"Account",icon:"i-lucide-settings",to:"/dashboard/account"},{label:"Orders",icon:"i-lucide-shopping-cart",to:"/dashboard/orders"},{label:"Subscriptions",icon:"i-lucide-credit-card",to:"/dashboard/subscriptions"},{label:"Favorites",icon:"i-lucide-heart",to:"/dashboard/favorites"}]}],admin:[{label:"Admin",icon:"i-lucide-shield-check",children:[{label:"Overview",icon:"i-lucide-layout-dashboard",to:"/admin"},{label:"Users",icon:"i-lucide-users",to:"/admin/users"},{label:"Products",icon:"i-lucide-box",to:"/admin/products"},{label:"Blog",icon:"i-lucide-book",to:"/admin/blog"},{label:"Settings",icon:"i-lucide-sliders",to:"/admin/settings"}]}]}}function ur(t,e){return{label:"",icon:""}}function kj(){const t=tm(),e=P5();let n=ft(!1);try{n=k5().isAdmin||ft(!1)}catch{n=ft(!1)}const r=nt(()=>e.app),s=nt(()=>{const a=e.dashboard[0],c=a&&a.children?a.children:[];return n.value?[...c,...e.admin]:c}),i=nt(()=>{const a=[];return a.push(e.app),a.push(e.dashboard),n.value&&a.push(e.admin),a}),o=nt(()=>{var u,h;const a=(u=t.meta)==null?void 0:u.title,c=(h=t.meta)==null?void 0:h.icon;return{label:typeof a=="string"?a:"Dashboard",icon:typeof c=="string"?c:"i-lucide-layout-dashboard"}});return{appLinks:r,dashboardLinks:s,mobileLinks:i,subHeader:o}}const{label:N5,icon:O5}=ur(),D5={layout:"dashboard",layoutProps:{dashboardType:"admin-dashboard"},title:N5,icon:O5},{label:x5,icon:M5}=ur(),L5={layout:"dashboard",layoutProps:{dashboardType:"admin-dashboard"},title:x5,icon:M5},{label:V5,icon:F5}=ur(),U5={layout:"dashboard",layoutProps:{dashboardType:"admin-dashboard"},title:V5,icon:F5},{label:B5,icon:$5}=ur(),j5={layout:"dashboard",layoutProps:{dashboardType:"admin-dashboard"},title:B5,icon:$5},{label:H5,icon:q5}=ur(),W5={layout:"dashboard",layoutProps:{dashboardType:"admin-dashboard"},title:H5,icon:q5},K5={layout:"dashboard",title:"Dashboard",icon:"i-heroicons-squares-2x2"},{label:z5,icon:G5}=ur(),Q5={layout:"dashboard",layoutProps:{dashboardType:"user-dashboard"},title:z5,icon:G5},{label:Y5,icon:X5}=ur(),J5={layout:"dashboard",layoutProps:{dashboardType:"user-dashboard"},title:Y5,icon:X5},{label:Z5,icon:e3}=ur(),t3={layout:"dashboard",layoutProps:{dashboardType:"user-dashboard"},title:Z5,icon:e3},{label:n3,icon:r3}=ur(),s3={layout:"dashboard",layoutProps:{dashboardType:"user-dashboard"},title:n3,icon:r3},i3={layout:"design"},o3={layout:"design"},{label:a3,icon:c3}=ur(),l3={layout:"dashboard",layoutProps:{dashboardType:"user-dashboard"},title:a3,icon:c3},u3={layout:"design"},Wf=[{name:"auth",path:"/auth",meta:aD||{},component:()=>Se(()=>import("./CdiV8pob.js"),__vite__mapDeps([2,3,4,5,0,1]),import.meta.url)},{name:"skills",path:"/skills",component:()=>Se(()=>import("./3oh2oIpF.js"),__vite__mapDeps([6,7,8]),import.meta.url)},{name:"admin-blog",path:"/admin/blog",meta:D5||{},component:()=>Se(()=>import("./BZuRRumb.js"),__vite__mapDeps([9,10,11]),import.meta.url)},{name:"blog",path:"/blog",component:()=>Se(()=>import("./QKhfetRK.js"),__vite__mapDeps([12,13]),import.meta.url)},{name:"admin",path:"/admin",meta:L5||{},component:()=>Se(()=>import("./Cm4OYU3N.js"),__vite__mapDeps([14,15,4,13,10,16]),import.meta.url)},{name:"admin-users",path:"/admin/users",meta:U5||{},component:()=>Se(()=>import("./C2RLn30b.js"),__vite__mapDeps([17,15,4,10]),import.meta.url)},{name:"blog-slug",path:"/blog/:slug()",component:()=>Se(()=>import("./Ch3DY6mq.js"),__vite__mapDeps([18,13]),import.meta.url)},{name:"design",path:"/design",component:()=>Se(()=>import("./DqMAdv1Q.js"),__vite__mapDeps([19,20,7,21,22,23]),import.meta.url)},{name:"admin-products",path:"/admin/products",meta:j5||{},component:()=>Se(()=>import("./Bu3dsxas.js"),__vite__mapDeps([24,10,25]),import.meta.url)},{name:"admin-settings",path:"/admin/settings",meta:W5||{},component:()=>Se(()=>import("./D0rshLNM.js"),__vite__mapDeps([26,15,4,10]),import.meta.url)},{name:"products",path:"/products",component:()=>Se(()=>import("./6BMYl1Ci.js"),__vite__mapDeps([27,28,29,21,1,30]),import.meta.url)},{name:"dashboard",path:"/dashboard",meta:K5||{},component:()=>Se(()=>import("./BL-V5Bmg.js"),__vite__mapDeps([31,15,4,20,7,21,32,33,22,34,35,10,5,0,1]),import.meta.url)},{name:"developer",path:"/developer",component:()=>Se(()=>import("./BXKzhPK9.js"),__vite__mapDeps([36,7,22,37]),import.meta.url)},{name:"getting-started",path:"/getting-started",component:()=>Se(()=>import("./PvHTUYOt.js"),[],import.meta.url)},{name:"products-slug",path:"/products/:slug()",component:()=>Se(()=>import("./DamWZC-z.js"),__vite__mapDeps([38,32,33,22,4,34,21,20,7,35,15,28,29,1,39]),import.meta.url)},{name:"dashboard-orders",path:"/dashboard/orders",meta:Q5||{},component:()=>Se(()=>import("./CUCYvwUS.js"),__vite__mapDeps([40,15,4,10]),import.meta.url)},{name:"design-atoms-img",path:"/design/atoms/img",component:()=>Se(()=>import("./CjYgLp7J.js"),__vite__mapDeps([41,34,10,42]),import.meta.url)},{name:"developer-skills",path:"/developer/skills",component:()=>Se(()=>import("./BxXzSZrn.js"),__vite__mapDeps([43,7,44]),import.meta.url)},{name:"dashboard-account",path:"/dashboard/account",meta:J5||{},component:()=>Se(()=>import("./YIWEJGaZ.js"),__vite__mapDeps([45,33,22,4,34,21,20,7,32,35,15,29,10,46]),import.meta.url)},{name:"dashboard-profile",path:"/dashboard/profile",meta:t3||{},component:()=>Se(()=>import("./Cc6xmyq6.js"),__vite__mapDeps([47,15,4,20,7,21,10,48]),import.meta.url)},{name:"dashboard-favorites",path:"/dashboard/favorites",meta:s3||{},component:()=>Se(()=>import("./PQURZ8w_.js"),__vite__mapDeps([49,15,4,10]),import.meta.url)},{name:"design-atoms-colors",path:"/design/atoms/colors",meta:i3||{},component:()=>Se(()=>import("./c6lCLqwy.js"),__vite__mapDeps([50,51]),import.meta.url)},{name:"design-atoms-tokens",path:"/design/atoms/tokens",meta:o3||{},component:()=>Se(()=>import("./-yJjMI3a.js"),__vite__mapDeps([52,53,35,4,20,7,21,54,55]),import.meta.url)},{name:"developer-technologies",path:"/developer/technologies",component:()=>Se(()=>import("./FC9UMjEe.js"),__vite__mapDeps([56,7,57]),import.meta.url)},{name:"dashboard-subscriptions",path:"/dashboard/subscriptions",meta:l3||{},component:()=>Se(()=>import("./tFIpRUQt.js"),__vite__mapDeps([58,15,4,10]),import.meta.url)},{name:"design-atoms-typography",path:"/design/atoms/typography",meta:u3||{},component:()=>Se(()=>import("./DrWvyhEQ.js"),__vite__mapDeps([59,53,35,4,20,7,21,54,60]),import.meta.url)}],h3=async(t,e)=>{var o;let n,r;if(!((o=t.meta)!=null&&o.validate))return;const s=([n,r]=Yi(()=>Promise.resolve(t.meta.validate(t))),n=await n,r(),n);if(s===!0)return;const i=Xs({fatal:!0,statusCode:s&&s.statusCode||404,statusMessage:s&&s.statusMessage||`Page Not Found: ${t.fullPath}`,data:{path:t.fullPath}});return typeof window<"u"&&window.history.pushState({},"",e.fullPath),i},f3=async t=>{let e,n;const r=([e,n]=Yi(()=>Xp({path:t.path})),e=await e,n(),e);if(r.redirect)return mi(r.redirect,{acceptRelative:!0})?(window.location.href=r.redirect,!1):r.redirect},d3=[h3,f3],Ua={};function p3(t,e,n){const{pathname:r,search:s,hash:i}=e,o=t.indexOf("#");if(o>-1){const u=i.includes(t.slice(o))?t.slice(o).length:1;let h=i.slice(u);return h[0]!=="/"&&(h="/"+h),uy(h,"")}const a=uy(r,t),c=!n||s1(a,n)?a:n;return c+(c.includes("?")?"":s)+i}const m3=gn({name:"nuxt:router",enforce:"pre",async setup(t){var I;let e,n,r=bo().app.baseURL;const s=((I=Kn.history)==null?void 0:I.call(Kn,r))??PO(r),i=Kn.routes?([e,n]=Yi(()=>Kn.routes(Wf)),e=await e,n(),e??Wf):Wf;let o;const a=eD({...Kn,scrollBehavior:(D,P,v)=>{if(P===En){o=v;return}if(Kn.scrollBehavior){if(a.options.scrollBehavior=Kn.scrollBehavior,"scrollRestoration"in window.history){const R=a.beforeEach(()=>{R(),window.history.scrollRestoration="manual"})}return Kn.scrollBehavior(D,En,o||v)}},history:s,routes:i});"scrollRestoration"in window.history&&(window.history.scrollRestoration="auto"),t.vueApp.use(a);const c=kr(a.currentRoute.value);a.afterEach((D,P)=>{c.value=P}),Object.defineProperty(t.vueApp.config.globalProperties,"previousRoute",{get:()=>c.value});const u=p3(r,window.location,t.payload.path),h=kr(a.currentRoute.value),f=()=>{h.value=a.currentRoute.value};t.hook("page:finish",f),a.afterEach((D,P)=>{var v,R,x,M;((R=(v=D.matched[0])==null?void 0:v.components)==null?void 0:R.default)===((M=(x=P.matched[0])==null?void 0:x.components)==null?void 0:M.default)&&f()});const d={};for(const D in h.value)Object.defineProperty(d,D,{get:()=>h.value[D],enumerable:!0});t._route=Zn(d),t._middleware||(t._middleware={global:[],named:{}});const m=ih();a.afterEach(async(D,P,v)=>{delete t._processingMiddleware,!t.isHydrating&&m.value&&await t.runWithContext(Z1),v&&await t.callHook("page:loading:end")});try{[e,n]=Yi(()=>a.isReady()),await e,n()}catch(D){[e,n]=Yi(()=>t.runWithContext(()=>Us(D))),await e,n()}const _=u!==a.currentRoute.value.fullPath?a.resolve(u):a.currentRoute.value;f();const y=t.payload.state._layout;return a.beforeEach(async(D,P)=>{var v;await t.callHook("page:loading:start"),D.meta=ar(D.meta),t.isHydrating&&y&&!Sr(D.meta.layout)&&(D.meta.layout=y),t._processingMiddleware=!0;{const R=new Set([...d3,...t._middleware.global]);for(const x of D.matched){const M=x.meta.middleware;if(M)for(const b of nm(M))R.add(b)}{const x=await t.runWithContext(()=>Xp({path:D.path}));if(x.appMiddleware)for(const M in x.appMiddleware)x.appMiddleware[M]?R.add(M):R.delete(M)}for(const x of R){const M=typeof x=="string"?t._middleware.named[x]||await((v=Ua[x])==null?void 0:v.call(Ua).then(b=>b.default||b)):x;if(!M)throw new Error(`Unknown route middleware: '${x}'.`);try{const b=await t.runWithContext(()=>M(D,P));if(!t.payload.serverRendered&&t.isHydrating&&(b===!1||b instanceof Error)){const E=b||Xs({statusCode:404,statusMessage:`Page Not Found: ${u}`});return await t.runWithContext(()=>Us(E)),!1}if(b===!0)continue;if(b===!1)return b;if(b)return xw(b)&&b.fatal&&await t.runWithContext(()=>Us(b)),b}catch(b){const E=Xs(b);return E.fatal&&await t.runWithContext(()=>Us(E)),E}}}}),a.onError(async()=>{delete t._processingMiddleware,await t.callHook("page:loading:end")}),a.afterEach(async(D,P)=>{D.matched.length===0&&await t.runWithContext(()=>Us(Xs({statusCode:404,fatal:!1,statusMessage:`Page not found: ${D.fullPath}`,data:{path:D.fullPath}})))}),t.hooks.hookOnce("app:created",async()=>{try{"name"in _&&(_.name=void 0),await a.replace({..._,force:!0}),a.options.scrollBehavior=Kn.scrollBehavior}catch(D){await t.runWithContext(()=>Us(D))}}),{provide:{router:a}}}}),g3=gn({name:"nuxt:payload",setup(t){const e=new Set;ln().beforeResolve(async(n,r)=>{if(n.path===r.path)return;const s=await Cy(n.path);if(s){for(const i of e)delete t.static.data[i];for(const i in s.data)i in t.static.data||e.add(i),t.static.data[i]=s.data[i]}}),kg(()=>{var n;t.hooks.hook("link:prefetch",async r=>{const{hostname:s}=new URL(r,window.location.href);s===window.location.hostname&&await Cy(r).catch(()=>{console.warn("[nuxt] Error preloading payload for",r)})}),((n=navigator.connection)==null?void 0:n.effectiveType)!=="slow-2g"&&setTimeout(oh,1e3)})}}),_3=gn(()=>{const t=ln();kg(()=>{t.beforeResolve(async()=>{await new Promise(e=>{setTimeout(e,100),requestAnimationFrame(()=>{setTimeout(e,0)})})})})}),y3=gn(t=>{let e;async function n(){const r=await oh();e&&clearTimeout(e),e=setTimeout(n,gy);try{const s=await $fetch(Qp("builds/latest.json")+`?${Date.now()}`);s.id!==r.id&&t.hooks.callHook("app:manifest:update",s)}catch{}}kg(()=>{e=setTimeout(n,gy)})}),v3=gn({name:"nuxt:chunk-reload",setup(t){const e=ln(),n=bo(),r=new Set;e.beforeEach(()=>{r.clear()}),t.hook("app:chunkError",({error:i})=>{r.add(i)});function s(i){const a="href"in i&&i.href[0]==="#"?n.app.baseURL+i.href:Gp(n.app.baseURL,i.fullPath);y5({path:a,persistState:!0})}t.hook("app:manifest:update",()=>{e.beforeResolve(s)}),e.onError((i,o)=>{r.has(i)&&s(o)})}}),E3=zi(()=>Se(()=>import("./CKOQKYhC.js"),[],import.meta.url).then(t=>t.default||t.default||t)),T3=[["Icon",E3]],w3=gn({name:"nuxt:global-components",setup(t){for(const[e,n]of T3)t.vueApp.component(e,n),t.vueApp.component("Lazy"+e,n)}}),cs={dashboard:zi(()=>Se(()=>import("./CK8pGuGR.js"),__vite__mapDeps([61,29,21,35,4,20,7,33,22,34,54,10,62]),import.meta.url).then(t=>t.default||t)),default:zi(()=>Se(()=>import("./BLA2phvY.js"),__vite__mapDeps([63,10,29,21,64]),import.meta.url).then(t=>t.default||t)),docs:zi(()=>Se(()=>import("./CxUcIyl0.js"),__vite__mapDeps([65,3,4]),import.meta.url).then(t=>t.default||t))},b3=gn({name:"nuxt:prefetch",setup(t){const e=ln();t.hooks.hook("app:mounted",()=>{e.beforeEach(async n=>{var s;const r=(s=n==null?void 0:n.meta)==null?void 0:s.layout;r&&typeof cs[r]=="function"&&await cs[r]()})}),t.hooks.hook("link:prefetch",n=>{if(mi(n))return;const r=e.resolve(n);if(!r)return;const s=r.meta.layout;let i=nm(r.meta.middleware);i=i.filter(o=>typeof o=="string");for(const o of i)typeof Ua[o]=="function"&&Ua[o]();typeof s=="string"&&s in cs&&g5(cs[s])})}});var vl={inherit:"inherit",current:"currentcolor",transparent:"transparent",black:"#000",white:"#fff",slate:{50:"oklch(98.4% 0.003 247.858)",100:"oklch(96.8% 0.007 247.896)",200:"oklch(92.9% 0.013 255.508)",300:"oklch(86.9% 0.022 252.894)",400:"oklch(70.4% 0.04 256.788)",500:"oklch(55.4% 0.046 257.417)",600:"oklch(44.6% 0.043 257.281)",700:"oklch(37.2% 0.044 257.287)",800:"oklch(27.9% 0.041 260.031)",900:"oklch(20.8% 0.042 265.755)",950:"oklch(12.9% 0.042 264.695)"},gray:{50:"oklch(98.5% 0.002 247.839)",100:"oklch(96.7% 0.003 264.542)",200:"oklch(92.8% 0.006 264.531)",300:"oklch(87.2% 0.01 258.338)",400:"oklch(70.7% 0.022 261.325)",500:"oklch(55.1% 0.027 264.364)",600:"oklch(44.6% 0.03 256.802)",700:"oklch(37.3% 0.034 259.733)",800:"oklch(27.8% 0.033 256.848)",900:"oklch(21% 0.034 264.665)",950:"oklch(13% 0.028 261.692)"},zinc:{50:"oklch(98.5% 0 0)",100:"oklch(96.7% 0.001 286.375)",200:"oklch(92% 0.004 286.32)",300:"oklch(87.1% 0.006 286.286)",400:"oklch(70.5% 0.015 286.067)",500:"oklch(55.2% 0.016 285.938)",600:"oklch(44.2% 0.017 285.786)",700:"oklch(37% 0.013 285.805)",800:"oklch(27.4% 0.006 286.033)",900:"oklch(21% 0.006 285.885)",950:"oklch(14.1% 0.005 285.823)"},neutral:{50:"oklch(98.5% 0 0)",100:"oklch(97% 0 0)",200:"oklch(92.2% 0 0)",300:"oklch(87% 0 0)",400:"oklch(70.8% 0 0)",500:"oklch(55.6% 0 0)",600:"oklch(43.9% 0 0)",700:"oklch(37.1% 0 0)",800:"oklch(26.9% 0 0)",900:"oklch(20.5% 0 0)",950:"oklch(14.5% 0 0)"},stone:{50:"oklch(98.5% 0.001 106.423)",100:"oklch(97% 0.001 106.424)",200:"oklch(92.3% 0.003 48.717)",300:"oklch(86.9% 0.005 56.366)",400:"oklch(70.9% 0.01 56.259)",500:"oklch(55.3% 0.013 58.071)",600:"oklch(44.4% 0.011 73.639)",700:"oklch(37.4% 0.01 67.558)",800:"oklch(26.8% 0.007 34.298)",900:"oklch(21.6% 0.006 56.043)",950:"oklch(14.7% 0.004 49.25)"},red:{50:"oklch(97.1% 0.013 17.38)",100:"oklch(93.6% 0.032 17.717)",200:"oklch(88.5% 0.062 18.334)",300:"oklch(80.8% 0.114 19.571)",400:"oklch(70.4% 0.191 22.216)",500:"oklch(63.7% 0.237 25.331)",600:"oklch(57.7% 0.245 27.325)",700:"oklch(50.5% 0.213 27.518)",800:"oklch(44.4% 0.177 26.899)",900:"oklch(39.6% 0.141 25.723)",950:"oklch(25.8% 0.092 26.042)"},orange:{50:"oklch(98% 0.016 73.684)",100:"oklch(95.4% 0.038 75.164)",200:"oklch(90.1% 0.076 70.697)",300:"oklch(83.7% 0.128 66.29)",400:"oklch(75% 0.183 55.934)",500:"oklch(70.5% 0.213 47.604)",600:"oklch(64.6% 0.222 41.116)",700:"oklch(55.3% 0.195 38.402)",800:"oklch(47% 0.157 37.304)",900:"oklch(40.8% 0.123 38.172)",950:"oklch(26.6% 0.079 36.259)"},amber:{50:"oklch(98.7% 0.022 95.277)",100:"oklch(96.2% 0.059 95.617)",200:"oklch(92.4% 0.12 95.746)",300:"oklch(87.9% 0.169 91.605)",400:"oklch(82.8% 0.189 84.429)",500:"oklch(76.9% 0.188 70.08)",600:"oklch(66.6% 0.179 58.318)",700:"oklch(55.5% 0.163 48.998)",800:"oklch(47.3% 0.137 46.201)",900:"oklch(41.4% 0.112 45.904)",950:"oklch(27.9% 0.077 45.635)"},yellow:{50:"oklch(98.7% 0.026 102.212)",100:"oklch(97.3% 0.071 103.193)",200:"oklch(94.5% 0.129 101.54)",300:"oklch(90.5% 0.182 98.111)",400:"oklch(85.2% 0.199 91.936)",500:"oklch(79.5% 0.184 86.047)",600:"oklch(68.1% 0.162 75.834)",700:"oklch(55.4% 0.135 66.442)",800:"oklch(47.6% 0.114 61.907)",900:"oklch(42.1% 0.095 57.708)",950:"oklch(28.6% 0.066 53.813)"},lime:{50:"oklch(98.6% 0.031 120.757)",100:"oklch(96.7% 0.067 122.328)",200:"oklch(93.8% 0.127 124.321)",300:"oklch(89.7% 0.196 126.665)",400:"oklch(84.1% 0.238 128.85)",500:"oklch(76.8% 0.233 130.85)",600:"oklch(64.8% 0.2 131.684)",700:"oklch(53.2% 0.157 131.589)",800:"oklch(45.3% 0.124 130.933)",900:"oklch(40.5% 0.101 131.063)",950:"oklch(27.4% 0.072 132.109)"},green:{50:"oklch(98.2% 0.018 155.826)",100:"oklch(96.2% 0.044 156.743)",200:"oklch(92.5% 0.084 155.995)",300:"oklch(87.1% 0.15 154.449)",400:"oklch(79.2% 0.209 151.711)",500:"oklch(72.3% 0.219 149.579)",600:"oklch(62.7% 0.194 149.214)",700:"oklch(52.7% 0.154 150.069)",800:"oklch(44.8% 0.119 151.328)",900:"oklch(39.3% 0.095 152.535)",950:"oklch(26.6% 0.065 152.934)"},emerald:{50:"oklch(97.9% 0.021 166.113)",100:"oklch(95% 0.052 163.051)",200:"oklch(90.5% 0.093 164.15)",300:"oklch(84.5% 0.143 164.978)",400:"oklch(76.5% 0.177 163.223)",500:"oklch(69.6% 0.17 162.48)",600:"oklch(59.6% 0.145 163.225)",700:"oklch(50.8% 0.118 165.612)",800:"oklch(43.2% 0.095 166.913)",900:"oklch(37.8% 0.077 168.94)",950:"oklch(26.2% 0.051 172.552)"},teal:{50:"oklch(98.4% 0.014 180.72)",100:"oklch(95.3% 0.051 180.801)",200:"oklch(91% 0.096 180.426)",300:"oklch(85.5% 0.138 181.071)",400:"oklch(77.7% 0.152 181.912)",500:"oklch(70.4% 0.14 182.503)",600:"oklch(60% 0.118 184.704)",700:"oklch(51.1% 0.096 186.391)",800:"oklch(43.7% 0.078 188.216)",900:"oklch(38.6% 0.063 188.416)",950:"oklch(27.7% 0.046 192.524)"},cyan:{50:"oklch(98.4% 0.019 200.873)",100:"oklch(95.6% 0.045 203.388)",200:"oklch(91.7% 0.08 205.041)",300:"oklch(86.5% 0.127 207.078)",400:"oklch(78.9% 0.154 211.53)",500:"oklch(71.5% 0.143 215.221)",600:"oklch(60.9% 0.126 221.723)",700:"oklch(52% 0.105 223.128)",800:"oklch(45% 0.085 224.283)",900:"oklch(39.8% 0.07 227.392)",950:"oklch(30.2% 0.056 229.695)"},sky:{50:"oklch(97.7% 0.013 236.62)",100:"oklch(95.1% 0.026 236.824)",200:"oklch(90.1% 0.058 230.902)",300:"oklch(82.8% 0.111 230.318)",400:"oklch(74.6% 0.16 232.661)",500:"oklch(68.5% 0.169 237.323)",600:"oklch(58.8% 0.158 241.966)",700:"oklch(50% 0.134 242.749)",800:"oklch(44.3% 0.11 240.79)",900:"oklch(39.1% 0.09 240.876)",950:"oklch(29.3% 0.066 243.157)"},blue:{50:"oklch(97% 0.014 254.604)",100:"oklch(93.2% 0.032 255.585)",200:"oklch(88.2% 0.059 254.128)",300:"oklch(80.9% 0.105 251.813)",400:"oklch(70.7% 0.165 254.624)",500:"oklch(62.3% 0.214 259.815)",600:"oklch(54.6% 0.245 262.881)",700:"oklch(48.8% 0.243 264.376)",800:"oklch(42.4% 0.199 265.638)",900:"oklch(37.9% 0.146 265.522)",950:"oklch(28.2% 0.091 267.935)"},indigo:{50:"oklch(96.2% 0.018 272.314)",100:"oklch(93% 0.034 272.788)",200:"oklch(87% 0.065 274.039)",300:"oklch(78.5% 0.115 274.713)",400:"oklch(67.3% 0.182 276.935)",500:"oklch(58.5% 0.233 277.117)",600:"oklch(51.1% 0.262 276.966)",700:"oklch(45.7% 0.24 277.023)",800:"oklch(39.8% 0.195 277.366)",900:"oklch(35.9% 0.144 278.697)",950:"oklch(25.7% 0.09 281.288)"},violet:{50:"oklch(96.9% 0.016 293.756)",100:"oklch(94.3% 0.029 294.588)",200:"oklch(89.4% 0.057 293.283)",300:"oklch(81.1% 0.111 293.571)",400:"oklch(70.2% 0.183 293.541)",500:"oklch(60.6% 0.25 292.717)",600:"oklch(54.1% 0.281 293.009)",700:"oklch(49.1% 0.27 292.581)",800:"oklch(43.2% 0.232 292.759)",900:"oklch(38% 0.189 293.745)",950:"oklch(28.3% 0.141 291.089)"},purple:{50:"oklch(97.7% 0.014 308.299)",100:"oklch(94.6% 0.033 307.174)",200:"oklch(90.2% 0.063 306.703)",300:"oklch(82.7% 0.119 306.383)",400:"oklch(71.4% 0.203 305.504)",500:"oklch(62.7% 0.265 303.9)",600:"oklch(55.8% 0.288 302.321)",700:"oklch(49.6% 0.265 301.924)",800:"oklch(43.8% 0.218 303.724)",900:"oklch(38.1% 0.176 304.987)",950:"oklch(29.1% 0.149 302.717)"},fuchsia:{50:"oklch(97.7% 0.017 320.058)",100:"oklch(95.2% 0.037 318.852)",200:"oklch(90.3% 0.076 319.62)",300:"oklch(83.3% 0.145 321.434)",400:"oklch(74% 0.238 322.16)",500:"oklch(66.7% 0.295 322.15)",600:"oklch(59.1% 0.293 322.896)",700:"oklch(51.8% 0.253 323.949)",800:"oklch(45.2% 0.211 324.591)",900:"oklch(40.1% 0.17 325.612)",950:"oklch(29.3% 0.136 325.661)"},pink:{50:"oklch(97.1% 0.014 343.198)",100:"oklch(94.8% 0.028 342.258)",200:"oklch(89.9% 0.061 343.231)",300:"oklch(82.3% 0.12 346.018)",400:"oklch(71.8% 0.202 349.761)",500:"oklch(65.6% 0.241 354.308)",600:"oklch(59.2% 0.249 0.584)",700:"oklch(52.5% 0.223 3.958)",800:"oklch(45.9% 0.187 3.815)",900:"oklch(40.8% 0.153 2.432)",950:"oklch(28.4% 0.109 3.907)"},rose:{50:"oklch(96.9% 0.015 12.422)",100:"oklch(94.1% 0.03 12.58)",200:"oklch(89.2% 0.058 10.001)",300:"oklch(81% 0.117 11.638)",400:"oklch(71.2% 0.194 13.428)",500:"oklch(64.5% 0.246 16.439)",600:"oklch(58.6% 0.253 17.585)",700:"oklch(51.4% 0.222 16.935)",800:"oklch(45.5% 0.188 13.697)",900:"oklch(41% 0.159 10.272)",950:"oklch(27.1% 0.105 12.094)"}};const I3=[50,100,200,300,400,500,600,700,800,900,950];function A3(t,e){return t in vl&&typeof vl[t]=="object"&&e in vl[t]?vl[t][e]:""}function R3(t,e){return`${I3.map(n=>`--ui-color-${t}-${n}: var(--color-${e==="neutral"?"old-neutral":e}-${n}, ${A3(e,n)});`).join(`
  `)}`}function u0(t,e){return`--ui-${t}: var(--ui-color-${t}-${e});`}const C3=gn(()=>{const t=zR(),e=rt(),n=nt(()=>{const{neutral:s,...i}=t.ui.colors;return`@layer base {
  :root {
  ${Object.entries(t.ui.colors).map(([o,a])=>R3(o,a)).join(`
  `)}
  }
  :root, .light {
  ${Object.keys(i).map(o=>u0(o,500)).join(`
  `)}
  }
  .dark {
  ${Object.keys(i).map(o=>u0(o,400)).join(`
  `)}
  }
}`}),r={style:[{innerHTML:()=>n.value,tagPriority:-2,id:"nuxt-ui-colors"}]};if(e.isHydrating&&!e.payload.serverRendered){const s=document.createElement("style");s.innerHTML=n.value,s.setAttribute("data-nuxt-ui-colors",""),document.head.appendChild(s),r.script=[{innerHTML:"document.head.removeChild(document.querySelector('[data-nuxt-ui-colors]'))"}]}UN(r)}),S3="__NUXT_COLOR_MODE__",Kf="nuxt-color-mode",k3="localStorage",mr=window[S3]||{},P3=gn(t=>{const e=m5("color-mode",()=>ar({preference:mr.preference,value:mr.value,unknown:!1,forced:!1})).value;ln().afterEach(i=>{const o=i.meta.colorMode;o&&o!=="system"?(e.value=o,e.forced=!0):(o==="system"&&console.warn("You cannot force the colorMode to system at the page level."),e.forced=!1,e.value=e.preference==="system"?mr.getColorScheme():e.preference)});let n;function r(){n||!window.matchMedia||(n=window.matchMedia("(prefers-color-scheme: dark)"),n.addEventListener("change",()=>{!e.forced&&e.preference==="system"&&(e.value=mr.getColorScheme())}))}function s(i,o){var a,c;switch(i){case"cookie":window.document.cookie=Kf+"="+o;break;case"sessionStorage":(a=window.sessionStorage)==null||a.setItem(Kf,o);break;case"localStorage":default:(c=window.localStorage)==null||c.setItem(Kf,o)}}Ln(()=>e.preference,i=>{e.forced||(i==="system"?(e.value=mr.getColorScheme(),r()):e.value=i,s(k3,i))},{immediate:!0}),Ln(()=>e.value,(i,o)=>{let a;a=window.document.createElement("style"),a.appendChild(document.createTextNode("*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),window.document.head.appendChild(a),mr.removeColorScheme(o),mr.addColorScheme(i),window.getComputedStyle(a).opacity,document.head.removeChild(a)}),e.preference==="system"&&r(),t.hook("app:mounted",()=>{e.unknown&&(e.preference=mr.preference,e.value=mr.value,e.unknown=!1)}),t.provide("colorMode",e)}),QR=/^[a-z0-9]+(-[a-z0-9]+)*$/,Dc=(t,e,n,r="")=>{const s=t.split(":");if(t.slice(0,1)==="@"){if(s.length<2||s.length>3)return null;r=s.shift().slice(1)}if(s.length>3||!s.length)return null;if(s.length>1){const a=s.pop(),c=s.pop(),u={provider:s.length>0?s[0]:r,prefix:c,name:a};return e&&!Ml(u)?null:u}const i=s[0],o=i.split("-");if(o.length>1){const a={provider:r,prefix:o.shift(),name:o.join("-")};return e&&!Ml(a)?null:a}if(n&&r===""){const a={provider:r,prefix:"",name:i};return e&&!Ml(a,n)?null:a}return null},Ml=(t,e)=>t?!!((e&&t.prefix===""||t.prefix)&&t.name):!1,YR=Object.freeze({left:0,top:0,width:16,height:16}),Vu=Object.freeze({rotate:0,vFlip:!1,hFlip:!1}),Fo=Object.freeze({...YR,...Vu}),Ep=Object.freeze({...Fo,body:"",hidden:!1});function N3(t,e){const n={};!t.hFlip!=!e.hFlip&&(n.hFlip=!0),!t.vFlip!=!e.vFlip&&(n.vFlip=!0);const r=((t.rotate||0)+(e.rotate||0))%4;return r&&(n.rotate=r),n}function h0(t,e){const n=N3(t,e);for(const r in Ep)r in Vu?r in t&&!(r in n)&&(n[r]=Vu[r]):r in e?n[r]=e[r]:r in t&&(n[r]=t[r]);return n}function O3(t,e){const n=t.icons,r=t.aliases||Object.create(null),s=Object.create(null);function i(o){if(n[o])return s[o]=[];if(!(o in s)){s[o]=null;const a=r[o]&&r[o].parent,c=a&&i(a);c&&(s[o]=[a].concat(c))}return s[o]}return Object.keys(n).concat(Object.keys(r)).forEach(i),s}function D3(t,e,n){const r=t.icons,s=t.aliases||Object.create(null);let i={};function o(a){i=h0(r[a]||s[a],i)}return o(e),n.forEach(o),h0(t,i)}function XR(t,e){const n=[];if(typeof t!="object"||typeof t.icons!="object")return n;t.not_found instanceof Array&&t.not_found.forEach(s=>{e(s,null),n.push(s)});const r=O3(t);for(const s in r){const i=r[s];i&&(e(s,D3(t,s,i)),n.push(s))}return n}const x3={provider:"",aliases:{},not_found:{},...YR};function zf(t,e){for(const n in e)if(n in t&&typeof t[n]!=typeof e[n])return!1;return!0}function JR(t){if(typeof t!="object"||t===null)return null;const e=t;if(typeof e.prefix!="string"||!t.icons||typeof t.icons!="object"||!zf(t,x3))return null;const n=e.icons;for(const s in n){const i=n[s];if(!s||typeof i.body!="string"||!zf(i,Ep))return null}const r=e.aliases||Object.create(null);for(const s in r){const i=r[s],o=i.parent;if(!s||typeof o!="string"||!n[o]&&!r[o]||!zf(i,Ep))return null}return e}const f0=Object.create(null);function M3(t,e){return{provider:t,prefix:e,icons:Object.create(null),missing:new Set}}function di(t,e){const n=f0[t]||(f0[t]=Object.create(null));return n[e]||(n[e]=M3(t,e))}function ZR(t,e){return JR(e)?XR(e,(n,r)=>{r?t.icons[n]=r:t.missing.add(n)}):[]}function L3(t,e,n){try{if(typeof n.body=="string")return t.icons[e]={...n},!0}catch{}return!1}let uc=!1;function eC(t){return typeof t=="boolean"&&(uc=t),uc}function Pg(t){const e=typeof t=="string"?Dc(t,!0,uc):t;if(e){const n=di(e.provider,e.prefix),r=e.name;return n.icons[r]||(n.missing.has(r)?null:void 0)}}function V3(t,e){const n=Dc(t,!0,uc);if(!n)return!1;const r=di(n.provider,n.prefix);return e?L3(r,n.name,e):(r.missing.add(n.name),!0)}function F3(t,e){if(typeof t!="object")return!1;if(typeof e!="string"&&(e=t.provider||""),uc&&!e&&!t.prefix){let s=!1;return JR(t)&&(t.prefix="",XR(t,(i,o)=>{V3(i,o)&&(s=!0)})),s}const n=t.prefix;if(!Ml({prefix:n,name:"a"}))return!1;const r=di(e,n);return!!ZR(r,t)}function Pj(t){const e=Pg(t);return e&&{...Fo,...e}}const tC=Object.freeze({width:null,height:null}),nC=Object.freeze({...tC,...Vu}),U3=/(-?[0-9.]*[0-9]+[0-9.]*)/g,B3=/^-?[0-9.]*[0-9]+[0-9.]*$/g;function d0(t,e,n){if(e===1)return t;if(n=n||100,typeof t=="number")return Math.ceil(t*e*n)/n;if(typeof t!="string")return t;const r=t.split(U3);if(r===null||!r.length)return t;const s=[];let i=r.shift(),o=B3.test(i);for(;;){if(o){const a=parseFloat(i);isNaN(a)?s.push(i):s.push(Math.ceil(a*e*n)/n)}else s.push(i);if(i=r.shift(),i===void 0)return s.join("");o=!o}}function $3(t,e="defs"){let n="";const r=t.indexOf("<"+e);for(;r>=0;){const s=t.indexOf(">",r),i=t.indexOf("</"+e);if(s===-1||i===-1)break;const o=t.indexOf(">",i);if(o===-1)break;n+=t.slice(s+1,i).trim(),t=t.slice(0,r).trim()+t.slice(o+1)}return{defs:n,content:t}}function j3(t,e){return t?"<defs>"+t+"</defs>"+e:e}function H3(t,e,n){const r=$3(t);return j3(r.defs,e+r.content+n)}const q3=t=>t==="unset"||t==="undefined"||t==="none";function W3(t,e){const n={...Fo,...t},r={...nC,...e},s={left:n.left,top:n.top,width:n.width,height:n.height};let i=n.body;[n,r].forEach(y=>{const I=[],D=y.hFlip,P=y.vFlip;let v=y.rotate;D?P?v+=2:(I.push("translate("+(s.width+s.left).toString()+" "+(0-s.top).toString()+")"),I.push("scale(-1 1)"),s.top=s.left=0):P&&(I.push("translate("+(0-s.left).toString()+" "+(s.height+s.top).toString()+")"),I.push("scale(1 -1)"),s.top=s.left=0);let R;switch(v<0&&(v-=Math.floor(v/4)*4),v=v%4,v){case 1:R=s.height/2+s.top,I.unshift("rotate(90 "+R.toString()+" "+R.toString()+")");break;case 2:I.unshift("rotate(180 "+(s.width/2+s.left).toString()+" "+(s.height/2+s.top).toString()+")");break;case 3:R=s.width/2+s.left,I.unshift("rotate(-90 "+R.toString()+" "+R.toString()+")");break}v%2===1&&(s.left!==s.top&&(R=s.left,s.left=s.top,s.top=R),s.width!==s.height&&(R=s.width,s.width=s.height,s.height=R)),I.length&&(i=H3(i,'<g transform="'+I.join(" ")+'">',"</g>"))});const o=r.width,a=r.height,c=s.width,u=s.height;let h,f;o===null?(f=a===null?"1em":a==="auto"?u:a,h=d0(f,c/u)):(h=o==="auto"?c:o,f=a===null?d0(h,u/c):a==="auto"?u:a);const d={},m=(y,I)=>{q3(I)||(d[y]=I.toString())};m("width",h),m("height",f);const _=[s.left,s.top,c,u];return d.viewBox=_.join(" "),{attributes:d,viewBox:_,body:i}}const K3=/\sid="(\S+)"/g,z3="IconifyId"+Date.now().toString(16)+(Math.random()*16777216|0).toString(16);let G3=0;function Q3(t,e=z3){const n=[];let r;for(;r=K3.exec(t);)n.push(r[1]);if(!n.length)return t;const s="suffix"+(Math.random()*16777216|Date.now()).toString(16);return n.forEach(i=>{const o=typeof e=="function"?e(i):e+(G3++).toString(),a=i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");t=t.replace(new RegExp('([#;"])('+a+')([")]|\\.[a-z])',"g"),"$1"+o+s+"$3")}),t=t.replace(new RegExp(s,"g"),""),t}const Tp=Object.create(null);function rC(t,e){Tp[t]=e}function wp(t){return Tp[t]||Tp[""]}function Ng(t){let e;if(typeof t.resources=="string")e=[t.resources];else if(e=t.resources,!(e instanceof Array)||!e.length)return null;return{resources:e,path:t.path||"/",maxURL:t.maxURL||500,rotate:t.rotate||750,timeout:t.timeout||5e3,random:t.random===!0,index:t.index||0,dataAfterTimeout:t.dataAfterTimeout!==!1}}const jh=Object.create(null),aa=["https://api.simplesvg.com","https://api.unisvg.com"],Ll=[];for(;aa.length>0;)aa.length===1||Math.random()>.5?Ll.push(aa.shift()):Ll.push(aa.pop());jh[""]=Ng({resources:["https://api.iconify.design"].concat(Ll)});function sC(t,e){const n=Ng(e);return n===null?!1:(jh[t]=n,!0)}function Hh(t){return jh[t]}function Y3(){return Object.keys(jh)}const X3=()=>{let t;try{if(t=fetch,typeof t=="function")return t}catch{}};let Fu=X3();function J3(t){Fu=t}function Z3(){return Fu}function eB(t,e){const n=Hh(t);if(!n)return 0;let r;if(!n.maxURL)r=0;else{let s=0;n.resources.forEach(o=>{s=Math.max(s,o.length)});const i=e+".json?icons=";r=n.maxURL-s-n.path.length-i.length}return r}function tB(t){return t===404}const nB=(t,e,n)=>{const r=[],s=eB(t,e),i="icons";let o={type:i,provider:t,prefix:e,icons:[]},a=0;return n.forEach((c,u)=>{a+=c.length+1,a>=s&&u>0&&(r.push(o),o={type:i,provider:t,prefix:e,icons:[]},a=c.length),o.icons.push(c)}),r.push(o),r};function rB(t){if(typeof t=="string"){const e=Hh(t);if(e)return e.path}return"/"}const sB=(t,e,n)=>{if(!Fu){n("abort",424);return}let r=rB(e.provider);switch(e.type){case"icons":{const i=e.prefix,a=e.icons.join(","),c=new URLSearchParams({icons:a});r+=i+".json?"+c.toString();break}case"custom":{const i=e.uri;r+=i.slice(0,1)==="/"?i.slice(1):i;break}default:n("abort",400);return}let s=503;Fu(t+r).then(i=>{const o=i.status;if(o!==200){setTimeout(()=>{n(tB(o)?"abort":"next",o)});return}return s=501,i.json()}).then(i=>{if(typeof i!="object"||i===null){setTimeout(()=>{i===404?n("abort",i):n("next",s)});return}setTimeout(()=>{n("success",i)})}).catch(()=>{n("next",s)})},iB={prepare:nB,send:sB};function oB(t){const e={loaded:[],missing:[],pending:[]},n=Object.create(null);t.sort((s,i)=>s.provider!==i.provider?s.provider.localeCompare(i.provider):s.prefix!==i.prefix?s.prefix.localeCompare(i.prefix):s.name.localeCompare(i.name));let r={provider:"",prefix:"",name:""};return t.forEach(s=>{if(r.name===s.name&&r.prefix===s.prefix&&r.provider===s.provider)return;r=s;const i=s.provider,o=s.prefix,a=s.name,c=n[i]||(n[i]=Object.create(null)),u=c[o]||(c[o]=di(i,o));let h;a in u.icons?h=e.loaded:o===""||u.missing.has(a)?h=e.missing:h=e.pending;const f={provider:i,prefix:o,name:a};h.push(f)}),e}function iC(t,e){t.forEach(n=>{const r=n.loaderCallbacks;r&&(n.loaderCallbacks=r.filter(s=>s.id!==e))})}function aB(t){t.pendingCallbacksFlag||(t.pendingCallbacksFlag=!0,setTimeout(()=>{t.pendingCallbacksFlag=!1;const e=t.loaderCallbacks?t.loaderCallbacks.slice(0):[];if(!e.length)return;let n=!1;const r=t.provider,s=t.prefix;e.forEach(i=>{const o=i.icons,a=o.pending.length;o.pending=o.pending.filter(c=>{if(c.prefix!==s)return!0;const u=c.name;if(t.icons[u])o.loaded.push({provider:r,prefix:s,name:u});else if(t.missing.has(u))o.missing.push({provider:r,prefix:s,name:u});else return n=!0,!0;return!1}),o.pending.length!==a&&(n||iC([t],i.id),i.callback(o.loaded.slice(0),o.missing.slice(0),o.pending.slice(0),i.abort))})}))}let cB=0;function lB(t,e,n){const r=cB++,s=iC.bind(null,n,r);if(!e.pending.length)return s;const i={id:r,icons:e,callback:t,abort:s};return n.forEach(o=>{(o.loaderCallbacks||(o.loaderCallbacks=[])).push(i)}),s}function uB(t,e=!0,n=!1){const r=[];return t.forEach(s=>{const i=typeof s=="string"?Dc(s,e,n):s;i&&r.push(i)}),r}var hB={resources:[],index:0,timeout:2e3,rotate:750,random:!1,dataAfterTimeout:!1};function fB(t,e,n,r){const s=t.resources.length,i=t.random?Math.floor(Math.random()*s):t.index;let o;if(t.random){let M=t.resources.slice(0);for(o=[];M.length>1;){const b=Math.floor(Math.random()*M.length);o.push(M[b]),M=M.slice(0,b).concat(M.slice(b+1))}o=o.concat(M)}else o=t.resources.slice(i).concat(t.resources.slice(0,i));const a=Date.now();let c="pending",u=0,h,f=null,d=[],m=[];typeof r=="function"&&m.push(r);function _(){f&&(clearTimeout(f),f=null)}function y(){c==="pending"&&(c="aborted"),_(),d.forEach(M=>{M.status==="pending"&&(M.status="aborted")}),d=[]}function I(M,b){b&&(m=[]),typeof M=="function"&&m.push(M)}function D(){return{startTime:a,payload:e,status:c,queriesSent:u,queriesPending:d.length,subscribe:I,abort:y}}function P(){c="failed",m.forEach(M=>{M(void 0,h)})}function v(){d.forEach(M=>{M.status==="pending"&&(M.status="aborted")}),d=[]}function R(M,b,E){const T=b!=="success";switch(d=d.filter(A=>A!==M),c){case"pending":break;case"failed":if(T||!t.dataAfterTimeout)return;break;default:return}if(b==="abort"){h=E,P();return}if(T){h=E,d.length||(o.length?x():P());return}if(_(),v(),!t.random){const A=t.resources.indexOf(M.resource);A!==-1&&A!==t.index&&(t.index=A)}c="completed",m.forEach(A=>{A(E)})}function x(){if(c!=="pending")return;_();const M=o.shift();if(M===void 0){if(d.length){f=setTimeout(()=>{_(),c==="pending"&&(v(),P())},t.timeout);return}P();return}const b={status:"pending",resource:M,callback:(E,T)=>{R(b,E,T)}};d.push(b),u++,f=setTimeout(x,t.rotate),n(M,e,b.callback)}return setTimeout(x),D}function oC(t){const e={...hB,...t};let n=[];function r(){n=n.filter(a=>a().status==="pending")}function s(a,c,u){const h=fB(e,a,c,(f,d)=>{r(),u&&u(f,d)});return n.push(h),h}function i(a){return n.find(c=>a(c))||null}return{query:s,find:i,setIndex:a=>{e.index=a},getIndex:()=>e.index,cleanup:r}}function p0(){}const Gf=Object.create(null);function dB(t){if(!Gf[t]){const e=Hh(t);if(!e)return;const n=oC(e),r={config:e,redundancy:n};Gf[t]=r}return Gf[t]}function aC(t,e,n){let r,s;if(typeof t=="string"){const i=wp(t);if(!i)return n(void 0,424),p0;s=i.send;const o=dB(t);o&&(r=o.redundancy)}else{const i=Ng(t);if(i){r=oC(i);const o=t.resources?t.resources[0]:"",a=wp(o);a&&(s=a.send)}}return!r||!s?(n(void 0,424),p0):r.query(e,s,n)().abort}function m0(){}function pB(t){t.iconsLoaderFlag||(t.iconsLoaderFlag=!0,setTimeout(()=>{t.iconsLoaderFlag=!1,aB(t)}))}function mB(t){const e=[],n=[];return t.forEach(r=>{(r.match(QR)?e:n).push(r)}),{valid:e,invalid:n}}function ca(t,e,n){function r(){const s=t.pendingIcons;e.forEach(i=>{s&&s.delete(i),t.icons[i]||t.missing.add(i)})}if(n&&typeof n=="object")try{if(!ZR(t,n).length){r();return}}catch(s){console.error(s)}r(),pB(t)}function g0(t,e){t instanceof Promise?t.then(n=>{e(n)}).catch(()=>{e(null)}):e(t)}function gB(t,e){t.iconsToLoad?t.iconsToLoad=t.iconsToLoad.concat(e).sort():t.iconsToLoad=e,t.iconsQueueFlag||(t.iconsQueueFlag=!0,setTimeout(()=>{t.iconsQueueFlag=!1;const{provider:n,prefix:r}=t,s=t.iconsToLoad;if(delete t.iconsToLoad,!s||!s.length)return;const i=t.loadIcon;if(t.loadIcons&&(s.length>1||!i)){g0(t.loadIcons(s,r,n),h=>{ca(t,s,h)});return}if(i){s.forEach(h=>{const f=i(h,r,n);g0(f,d=>{const m=d?{prefix:r,icons:{[h]:d}}:null;ca(t,[h],m)})});return}const{valid:o,invalid:a}=mB(s);if(a.length&&ca(t,a,null),!o.length)return;const c=r.match(QR)?wp(n):null;if(!c){ca(t,o,null);return}c.prepare(n,r,o).forEach(h=>{aC(n,h,f=>{ca(t,h.icons,f)})})}))}const cC=(t,e)=>{const n=uB(t,!0,eC()),r=oB(n);if(!r.pending.length){let c=!0;return e&&setTimeout(()=>{c&&e(r.loaded,r.missing,r.pending,m0)}),()=>{c=!1}}const s=Object.create(null),i=[];let o,a;return r.pending.forEach(c=>{const{provider:u,prefix:h}=c;if(h===a&&u===o)return;o=u,a=h,i.push(di(u,h));const f=s[u]||(s[u]=Object.create(null));f[h]||(f[h]=[])}),r.pending.forEach(c=>{const{provider:u,prefix:h,name:f}=c,d=di(u,h),m=d.pendingIcons||(d.pendingIcons=new Set);m.has(f)||(m.add(f),s[u][h].push(f))}),i.forEach(c=>{const u=s[c.provider][c.prefix];u.length&&gB(c,u)}),e?lB(e,r,i):m0},Nj=t=>new Promise((e,n)=>{const r=typeof t=="string"?Dc(t,!0):t;if(!r){n(t);return}cC([r||t],s=>{if(s.length&&r){const i=Pg(r);if(i){e({...Fo,...i});return}}n(t)})});function _B(t,e,n){di("",e).loadIcons=t}function yB(t,e){const n={...t};for(const r in e){const s=e[r],i=typeof s;r in tC?(s===null||s&&(i==="string"||i==="number"))&&(n[r]=s):i===typeof n[r]&&(n[r]=r==="rotate"?s%4:s)}return n}const vB=/[\s,]+/;function EB(t,e){e.split(vB).forEach(n=>{switch(n.trim()){case"horizontal":t.hFlip=!0;break;case"vertical":t.vFlip=!0;break}})}function TB(t,e=0){const n=t.replace(/^-?[0-9.]*/,"");function r(s){for(;s<0;)s+=4;return s%4}if(n===""){const s=parseInt(t);return isNaN(s)?0:r(s)}else if(n!==t){let s=0;switch(n){case"%":s=25;break;case"deg":s=90}if(s){let i=parseFloat(t.slice(0,t.length-n.length));return isNaN(i)?0:(i=i/s,i%1===0?r(i):0)}}return e}function wB(t,e){let n=t.indexOf("xlink:")===-1?"":' xmlns:xlink="http://www.w3.org/1999/xlink"';for(const r in e)n+=" "+r+'="'+e[r]+'"';return'<svg xmlns="http://www.w3.org/2000/svg"'+n+">"+t+"</svg>"}function bB(t){return t.replace(/"/g,"'").replace(/%/g,"%25").replace(/#/g,"%23").replace(/</g,"%3C").replace(/>/g,"%3E").replace(/\s+/g," ")}function IB(t){return"data:image/svg+xml,"+bB(t)}function AB(t){return'url("'+IB(t)+'")'}const _0={...nC,inline:!1},RB={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink","aria-hidden":!0,role:"img"},CB={display:"inline-block"},bp={backgroundColor:"currentColor"},lC={backgroundColor:"transparent"},y0={Image:"var(--svg)",Repeat:"no-repeat",Size:"100% 100%"},v0={webkitMask:bp,mask:bp,background:lC};for(const t in v0){const e=v0[t];for(const n in y0)e[t+n]=y0[n]}const Vl={};["horizontal","vertical"].forEach(t=>{const e=t.slice(0,1)+"Flip";Vl[t+"-flip"]=e,Vl[t.slice(0,1)+"-flip"]=e,Vl[t+"Flip"]=e});function E0(t){return t+(t.match(/^[-0-9.]+$/)?"px":"")}const T0=(t,e)=>{const n=yB(_0,e),r={...RB},s=e.mode||"svg",i={},o=e.style,a=typeof o=="object"&&!(o instanceof Array)?o:{};for(let y in e){const I=e[y];if(I!==void 0)switch(y){case"icon":case"style":case"onLoad":case"mode":case"ssr":break;case"inline":case"hFlip":case"vFlip":n[y]=I===!0||I==="true"||I===1;break;case"flip":typeof I=="string"&&EB(n,I);break;case"color":i.color=I;break;case"rotate":typeof I=="string"?n[y]=TB(I):typeof I=="number"&&(n[y]=I);break;case"ariaHidden":case"aria-hidden":I!==!0&&I!=="true"&&delete r["aria-hidden"];break;default:{const D=Vl[y];D?(I===!0||I==="true"||I===1)&&(n[D]=!0):_0[y]===void 0&&(r[y]=I)}}}const c=W3(t,n),u=c.attributes;if(n.inline&&(i.verticalAlign="-0.125em"),s==="svg"){r.style={...i,...a},Object.assign(r,u);let y=0,I=e.id;return typeof I=="string"&&(I=I.replace(/-/g,"_")),r.innerHTML=Q3(c.body,I?()=>I+"ID"+y++:"iconifyVue"),At("svg",r)}const{body:h,width:f,height:d}=t,m=s==="mask"||(s==="bg"?!1:h.indexOf("currentColor")!==-1),_=wB(h,{...u,width:f+"",height:d+""});return r.style={...i,"--svg":AB(_),width:E0(u.width),height:E0(u.height),...CB,...m?bp:lC,...a},At("span",r)};eC(!0);rC("",iB);if(typeof document<"u"&&typeof window<"u"){const t=window;if(t.IconifyPreload!==void 0){const e=t.IconifyPreload,n="Invalid IconifyPreload syntax.";typeof e=="object"&&e!==null&&(e instanceof Array?e:[e]).forEach(r=>{try{(typeof r!="object"||r===null||r instanceof Array||typeof r.icons!="object"||typeof r.prefix!="string"||!F3(r))&&console.error(n)}catch{console.error(n)}})}if(t.IconifyProviders!==void 0){const e=t.IconifyProviders;if(typeof e=="object"&&e!==null)for(let n in e){const r="IconifyProviders["+n+"] is invalid.";try{const s=e[n];if(typeof s!="object"||!s||s.resources===void 0)continue;sC(n,s)||console.error(r)}catch{console.error(r)}}}}const SB={...Fo,body:""},Oj=cr((t,{emit:e})=>{const n=ft(null);function r(){var u,h;n.value&&((h=(u=n.value).abort)==null||h.call(u),n.value=null)}const s=ft(!!t.ssr),i=ft(""),o=kr(null);function a(){const u=t.icon;if(typeof u=="object"&&u!==null&&typeof u.body=="string")return i.value="",{data:u};let h;if(typeof u!="string"||(h=Dc(u,!1,!0))===null)return null;let f=Pg(h);if(!f){const _=n.value;return(!_||_.name!==u)&&(f===null?n.value={name:u}:n.value={name:u,abort:cC([h],c)}),null}r(),i.value!==u&&(i.value=u,Pr(()=>{e("load",u)}));const d=t.customise;if(d){f=Object.assign({},f);const _=d(f.body,h.name,h.prefix,h.provider);typeof _=="string"&&(f.body=_)}const m=["iconify"];return h.prefix!==""&&m.push("iconify--"+h.prefix),h.provider!==""&&m.push("iconify--"+h.provider),{data:f,classes:m}}function c(){var h;const u=a();u?u.data!==((h=o.value)==null?void 0:h.data)&&(o.value=u):o.value=null}return s.value?c():pc(()=>{s.value=!0,c()}),Ln(()=>t.icon,c),eh(r),()=>{const u=o.value;if(!u)return T0(SB,t);let h=t;return u.classes&&(h={...t,class:u.classes.join(" ")}),T0({...Fo,...u.data},h)}},{props:["icon","mode","ssr","width","height","style","color","inline","rotate","hFlip","horizontalFlip","vFlip","verticalFlip","flip","id","ariaHidden","customise","title"],emits:["load"]}),w0={getAPIConfig:Hh,setAPIModule:rC,sendAPIQuery:aC,setFetch:J3,getFetch:Z3,listAPIProviders:Y3},kB=gn({name:"@nuxt/icon",setup(){var s,i;const t=bo(),e=zR().icon;w0.setFetch($fetch.native);const n=[];if(e.provider==="server"){const o=((i=(s=t.app)==null?void 0:s.baseURL)==null?void 0:i.replace(/\/$/,""))??"";n.push(o+(e.localApiEndpoint||"/api/_nuxt_icon")),(e.fallbackToApi===!0||e.fallbackToApi==="client-only")&&n.push(e.iconifyApiEndpoint)}else e.provider==="none"?w0.setFetch(()=>Promise.resolve(new Response)):n.push(e.iconifyApiEndpoint);async function r(o,a){try{const c=await $fetch(n[0]+"/"+a+".json",{query:{icons:o.join(",")}});if(!c||c.prefix!==a||!c.icons)throw new Error("Invalid data"+JSON.stringify(c));return c}catch(c){return console.error("Failed to load custom icons",c),null}}sC("",{resources:n});for(const o of e.customCollections||[])o&&_B(r,o)}}),PB=gn(()=>{}),NB=()=>{},OB=()=>{},DB=[GN,ZN,m3,g3,_3,y3,v3,w3,b3,C3,P3,kB,PB,NB,OB],uC=(t="RouteProvider")=>cr({name:t,props:{vnode:{type:Object,required:!0},route:{type:Object,required:!0},vnodeRef:Object,renderKey:String,trackRootNodes:Boolean},setup(e){const n=e.renderKey,r=e.route,s={};for(const i in e.route)Object.defineProperty(s,i,{get:()=>n===e.renderKey?e.route[i]:r[i],enumerable:!0});return us(ni,Zn(s)),()=>At(e.vnode,{ref:e.vnodeRef})}}),xB=uC(),b0=new WeakMap,MB=cr({name:"NuxtPage",inheritAttrs:!1,props:{name:{type:String},transition:{type:[Boolean,Object],default:void 0},keepalive:{type:[Boolean,Object],default:void 0},route:{type:Object},pageKey:{type:[Function,String],default:null}},setup(t,{attrs:e,slots:n,expose:r}){const s=rt(),i=ft(),o=ct(ni,null);let a;r({pageRef:i});const c=ct(Ow,null);let u;const h=s.deferHydration();if(s.isHydrating){const d=s.hooks.hookOnce("app:error",h);ln().beforeEach(d)}t.pageKey&&Ln(()=>t.pageKey,(d,m)=>{d!==m&&s.callHook("page:loading:start")});let f=!1;{const d=ln().beforeResolve(()=>{f=!1});mc(()=>{d()})}return()=>At(Jw,{name:t.name,route:t.route,...e},{default:d=>{const m=VB(o,d.route,d.Component),_=o&&o.matched.length===d.route.matched.length;if(!d.Component){if(u&&!_)return u;h();return}if(u&&c&&!c.isCurrent(d.route))return u;if(m&&o&&(!c||c!=null&&c.isCurrent(o)))return _?u:null;const y=Sd(d,t.pageKey),I=FB(o,d.route,d.Component);!s.isHydrating&&a===y&&!I&&Pr(()=>{f=!0,s.callHook("page:loading:end")}),a=y;const D=!!(t.transition??d.route.meta.pageTransition??my),P=D&&LB([t.transition,d.route.meta.pageTransition,my,{onBeforeLeave(){s._runningTransition=!0},onAfterLeave(){delete s._runningTransition,s.callHook("page:transition:finish",d.Component)}}]),v=t.keepalive??d.route.meta.keepalive??M1;return u=WR(D&&P,oD(v,At(qp,{suspensible:!0,onPending:()=>s.callHook("page:start",d.Component),onResolve:()=>{Pr(()=>s.callHook("page:finish",d.Component).then(()=>{if(!f&&!I)return f=!0,s.callHook("page:loading:end")}).finally(h))}},{default:()=>{const R={key:y||void 0,vnode:n.default?UB(n.default,d):d.Component,route:d.route,renderKey:y||void 0,trackRootNodes:D,vnodeRef:i};if(!v)return At(xB,R);const x=d.Component.type,M=x;let b=b0.get(M);return b||(b=uC(x.name||x.__name),b0.set(M,b)),At(b,R)}}))).default(),u}})}});function LB(t){const e=t.filter(Boolean).map(n=>({...n,onAfterLeave:n.onAfterLeave?nm(n.onAfterLeave):void 0}));return Pw(...e)}function VB(t,e,n){if(!t)return!1;const r=e.matched.findIndex(s=>{var i;return((i=s.components)==null?void 0:i.default)===(n==null?void 0:n.type)});return!r||r===-1?!1:e.matched.slice(0,r).some((s,i)=>{var o,a,c;return((o=s.components)==null?void 0:o.default)!==((c=(a=t.matched[i])==null?void 0:a.components)==null?void 0:c.default)})||n&&Sd({route:e,Component:n})!==Sd({route:t,Component:n})}function FB(t,e,n){return t?e.matched.findIndex(s=>{var i;return((i=s.components)==null?void 0:i.default)===(n==null?void 0:n.type)})<e.matched.length-1:!1}function UB(t,e){const n=t(e);return n.length===1?At(n[0]):At(bt,void 0,n)}const BB=cr({name:"LayoutLoader",inheritAttrs:!1,props:{name:String,layoutProps:Object},setup(t,e){return()=>At(cs[t.name],t.layoutProps,e.slots)}}),$B={name:{type:[String,Boolean,Object],default:null},fallback:{type:[String,Object],default:null}},jB=cr({name:"NuxtLayout",inheritAttrs:!1,props:$B,setup(t,e){const n=rt(),r=ct(ni),i=!r||r===sh()?tm():r,o=nt(()=>{let h=qe(t.name)??(i==null?void 0:i.meta.layout)??"default";return h&&!(h in cs)&&t.fallback&&(h=qe(t.fallback)),h}),a=kr();e.expose({layoutRef:a});const c=n.deferHydration();if(n.isHydrating){const h=n.hooks.hookOnce("app:error",c);ln().beforeEach(h)}let u;return()=>{const h=o.value&&o.value in cs,f=(i==null?void 0:i.meta.layoutTransition)??x1,d=u;return u=o.value,WR(h&&f,{default:()=>At(qp,{suspensible:!0,onResolve:()=>{Pr(c)}},{default:()=>At(HB,{layoutProps:HT(e.attrs,{ref:a}),key:o.value||void 0,name:o.value,shouldProvide:!t.name,isRenderingNewLayout:m=>m!==d&&m===o.value,hasTransition:!!f},e.slots)})}).default()}}}),HB=cr({name:"NuxtLayoutProvider",inheritAttrs:!1,props:{name:{type:[String,Boolean]},layoutProps:{type:Object},hasTransition:{type:Boolean},shouldProvide:{type:Boolean},isRenderingNewLayout:{type:Function,required:!0}},setup(t,e){const n=t.name;t.shouldProvide&&us(Ow,{isCurrent:i=>n===(i.meta.layout??"default")});const r=ct(ni);if(r&&r===sh()){const i=tm(),o={};for(const a in i){const c=a;Object.defineProperty(o,c,{enumerable:!0,get:()=>t.isRenderingNewLayout(t.name)?i[c]:r[c]})}us(ni,Zn(o))}return()=>{var i,o;return!n||typeof n=="string"&&!(n in cs)?(o=(i=e.slots).default)==null?void 0:o.call(i):At(BB,{key:n,layoutProps:t.layoutProps,name:n},e.slots)}}}),qB=(t,e)=>{const n=t.__vccOpts||t;for(const[r,s]of e)n[r]=s;return n},WB={};function KB(t,e){const n=MB,r=jB;return Tn(),Jn(r,null,{default:Ju(()=>[Ye(n)]),_:1})}const zB=qB(WB,[["render",KB]]),GB={__name:"nuxt-error-page",props:{error:Object},setup(t){const n=t.error;n.stack&&n.stack.split(`
`).splice(1).map(f=>({text:f.replace("webpack:/","").replace(".vue",".js").trim(),internal:f.includes("node_modules")&&!f.includes(".cache")||f.includes("internal")||f.includes("new Promise")})).map(f=>`<span class="stack${f.internal?" internal":""}">${f.text}</span>`).join(`
`);const r=Number(n.statusCode||500),s=r===404,i=n.statusMessage??(s?"Page Not Found":"Internal Server Error"),o=n.message||n.toString(),a=void 0,h=s?zi(()=>Se(()=>import("./B9VbqQ2z.js"),__vite__mapDeps([66,22,67]),import.meta.url)):zi(()=>Se(()=>import("./BnG2EkqI.js"),__vite__mapDeps([68,69]),import.meta.url));return(f,d)=>(Tn(),Jn(qe(h),GC($T({statusCode:qe(r),statusMessage:qe(i),description:qe(o),stack:qe(a)})),null,16))}},QB={key:0},I0={__name:"nuxt-root",setup(t){const e=()=>null,n=rt(),r=n.deferHydration();if(n.isHydrating){const u=n.hooks.hookOnce("app:error",r);ln().beforeEach(u)}const s=!1;us(ni,sh()),n.hooks.callHookWith(u=>u.map(h=>h()),"vue:setup");const i=ih(),o=!1,a=/bot\b|chrome-lighthouse|facebookexternalhit|google\b|googlebot/i;gT((u,h,f)=>{if(n.hooks.callHook("vue:error",u,h,f).catch(d=>console.error("[nuxt] Error in `vue:error` hook",d)),a.test(navigator.userAgent))return n.hooks.callHook("app:error",u),console.error(`[nuxt] Not rendering error page for bot with user agent \`${navigator.userAgent}\`:`,u),!1;if(xw(u)&&(u.fatal||u.unhandled))return n.runWithContext(()=>Us(u)),!1});const c=!1;return(u,h)=>(Tn(),Jn(qp,{onResolve:qe(r)},{default:Ju(()=>[qe(o)?(Tn(),Mk("div",QB)):qe(i)?(Tn(),Jn(qe(GB),{key:1,error:qe(i)},null,8,["error"])):qe(c)?(Tn(),Jn(qe(e),{key:2,context:qe(c)},null,8,["context"])):qe(s)?(Tn(),Jn(tk(qe(s)),{key:3})):(Tn(),Jn(qe(zB),{key:4}))]),_:1},8,["onResolve"]))}};let A0;{let t;A0=async function(){var o,a;if(t)return t;const r=!!(((o=window.__NUXT__)==null?void 0:o.serverRendered)??((a=document.getElementById("__NUXT_DATA__"))==null?void 0:a.dataset.ssr)==="true")?hw(I0):pd(I0),s=B1({vueApp:r});async function i(c){var u;await s.callHook("app:error",c),(u=s.payload).error||(u.error=Xs(c))}r.config.errorHandler=i,s.hook("app:suspense:resolve",()=>{r.config.errorHandler===i&&(r.config.errorHandler=void 0)});try{await H1(s,DB)}catch(c){i(c)}try{await s.hooks.callHook("app:created",r),await s.hooks.callHook("app:beforeMount",r),r.mount(V1),await s.hooks.callHook("app:mounted",r),await Pr()}catch(c){i(c)}return r},t=A0().catch(e=>{throw console.error("Error while mounting app:",e),e})}export{kr as $,Ps as A,On as B,Hm as C,nV as D,tg as E,bt as F,HR as G,Tj as H,Cj as I,gj as J,_j as K,rs as L,wj as M,T$ as N,$$ as O,qu as P,Ln as Q,pc as R,Qn as S,rt as T,uj as U,un as V,YS as W,eh as X,ct as Y,eS as Z,qB as _,BT as a,sj as a$,Y0 as a0,Pr as a1,Xs as a2,Sp as a3,ar as a4,hj as a5,Bu as a6,x$ as a7,N$ as a8,F$ as a9,c0 as aA,mc as aB,Sj as aC,At as aD,pw as aE,J1 as aF,_5 as aG,mi as aH,Gp as aI,bo as aJ,fj as aK,t1 as aL,Ga as aM,lj as aN,FS as aO,cT as aP,Z$ as aQ,N0 as aR,o$ as aS,z$ as aT,GS as aU,Bl as aV,Qi as aW,qp as aX,Ys as aY,n$ as aZ,Qk as a_,zR as aa,HT as ab,Wu as ac,vj as ad,yj as ae,f$ as af,us as ag,z0 as ah,ij as ai,tk as aj,Ej as ak,Pw as al,t$ as am,oj as an,ZB as ao,Tk as ap,h$ as aq,V$ as ar,D$ as as,GC as at,$T as au,ut as av,b$ as aw,kj as ax,MB as ay,kg as az,Ye as b,v$ as b$,r$ as b0,Kp as b1,i$ as b2,Un as b3,fc as b4,Wt as b5,ju as b6,Nr as b7,J$ as b8,pd as b9,m$ as bA,q$ as bB,cj as bC,jk as bD,Op as bE,Gs as bF,Sr as bG,at as bH,H$ as bI,In as bJ,vs as bK,ES as bL,fT as bM,mT as bN,dT as bO,gT as bP,ZS as bQ,JS as bR,XS as bS,Lp as bT,kS as bU,c$ as bV,Q0 as bW,a$ as bX,Wl as bY,j$ as bZ,kP as b_,_k as ba,M$ as bb,gk as bc,hw as bd,B$ as be,IS as bf,zi as bg,dP as bh,A$ as bi,R$ as bj,k$ as bk,C$ as bl,I$ as bm,tj as bn,S$ as bo,G$ as bp,XB as bq,ZC as br,s$ as bs,xp as bt,wo as bu,th as bv,aj as bw,p$ as bx,_$ as by,g$ as bz,Mk as c,X$ as c0,qa as c1,$_ as c2,Q$ as c3,ys as c4,Zn as c5,vk as c6,Y$ as c7,JB as c8,El as c9,V3 as cA,Oj as cB,w5 as cC,Oa as cD,GR as cE,C5 as cF,Rj as cG,Aj as cH,bj as cI,Ij as cJ,ke as ca,U$ as cb,e$ as cc,O$ as cd,rj as ce,ej as cf,mP as cg,Ek as ch,nj as ci,d$ as cj,aT as ck,sw as cl,IP as cm,iw as cn,bP as co,dd as cp,Zk as cq,Hk as cr,K$ as cs,wk as ct,P$ as cu,u$ as cv,W$ as cw,l$ as cx,Pj as cy,Nj as cz,jT as d,Ns as e,dj as f,qe as g,E$ as h,ur as i,Jn as j,cr as k,L$ as l,nt as m,sh as n,Tn as o,R5 as p,I5 as q,y$ as r,k5 as s,JC as t,UN as u,b5 as v,Ju as w,w$ as x,ln as y,ft as z};
