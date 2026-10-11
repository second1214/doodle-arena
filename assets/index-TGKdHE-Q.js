(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e,t,n){let r=[],i=0,a=0;for(let o=0;o<t*n;o++){let t=+!!e[o];t===i?a++:(r.push(a.toString(36)),i=t,a=1)}return r.push(a.toString(36)),`${t}x${n}:${r.join(`,`)}`}var t=new Map;function n(e){let n=t.get(e);if(n)return n;let r=/^(\d+)x(\d+):([0-9a-z,]*)$/.exec(e);if(!r)return null;let i=Number(r[1]),a=Number(r[2]);if(!i||!a||i*a>1e6)return null;let o=new Uint8Array(i*a),s=0,c=0;for(let e of r[3].split(`,`)){let t=parseInt(e,36)||0;c&&o.fill(1,s,Math.min(i*a,s+t)),s+=t,c^=1}t.size>40&&t.clear();let l={w:i,h:a,m:o};return t.set(e,l),l}var r={size:256,closeRadius:3,alpha:.45,minAreaRatio:.004,minAspect:1.5,footAngleDeg:50},i=0x56bc75e2d63100000;function a(e,t){let r=new Uint8Array(t*t),i=t/512;for(let a of e){if(a.img){let e=a.mask?n(a.mask):null,[o,s,c,l]=a.points;if(!e||!(c>0)||!(l>0))continue;let u=Math.max(0,Math.floor(o*i)),d=Math.max(0,Math.floor(s*i)),f=Math.min(t-1,Math.ceil((o+c)*i)),p=Math.min(t-1,Math.ceil((s+l)*i));for(let n=d;n<=p;n++)for(let a=u;a<=f;a++){let u=Math.floor(((a+.5)/i-o)/c*e.w),d=Math.floor(((n+.5)/i-s)/l*e.h);u>=0&&d>=0&&u<e.w&&d<e.h&&e.m[d*e.w+u]&&(r[n*t+a]=1)}continue}if(a.fill){o(r,t,Math.floor(a.points[0]*i),Math.floor(a.points[1]*i));continue}let e=a.color===`erase`?0:1,s=Math.max(.75,a.width*i/2),c=a.points;if(c.length<2)continue;let l=c.length===2?[[c[0],c[1],c[0],c[1]]]:[];for(let e=0;e+3<c.length;e+=2)l.push([c[e],c[e+1],c[e+2],c[e+3]]);for(let[n,a,o,c]of l){let l=n*i,u=a*i,d=o*i,f=c*i,p=Math.max(0,Math.floor(Math.min(l,d)-s)),m=Math.min(t-1,Math.ceil(Math.max(l,d)+s)),h=Math.max(0,Math.floor(Math.min(u,f)-s)),g=Math.min(t-1,Math.ceil(Math.max(u,f)+s)),_=d-l,v=f-u,y=_*_+v*v;for(let n=h;n<=g;n++)for(let i=p;i<=m;i++){let a=i+.5,o=n+.5,c=y>0?((a-l)*_+(o-u)*v)/y:0;c=c<0?0:c>1?1:c;let d=l+c*_-a,f=u+c*v-o;d*d+f*f<=s*s&&(r[n*t+i]=e)}}}return r}function o(e,t,n,r){if(n<0||r<0||n>=t||r>=t||e[r*t+n])return;let i=[r*t+n];for(e[i[0]]=1;i.length;){let n=i.pop(),r=n%t,a=(n-r)/t;r>0&&!e[n-1]&&(e[n-1]=1,i.push(n-1)),r<t-1&&!e[n+1]&&(e[n+1]=1,i.push(n+1)),a>0&&!e[n-t]&&(e[n-t]=1,i.push(n-t)),a<t-1&&!e[n+t]&&(e[n+t]=1,i.push(n+t))}}function s(e,t){let n=t,r=new Float64Array(n*n);for(let t=0;t<n*n;t++)r[t]=e[t]?0:i;let a=new Float64Array(n),o=new Float64Array(n),s=new Int32Array(n),c=new Float64Array(n+1),l=(e,t)=>{for(let t=0;t<n;t++)a[t]=e(t);let r=0;s[0]=0,c[0]=-0x56bc75e2d63100000,c[1]=i;for(let e=1;e<n;e++){let t=(a[e]+e*e-(a[s[r]]+s[r]*s[r]))/(2*e-2*s[r]);for(;t<=c[r];)r--,t=(a[e]+e*e-(a[s[r]]+s[r]*s[r]))/(2*e-2*s[r]);r++,s[r]=e,c[r]=t,c[r+1]=i}r=0;for(let e=0;e<n;e++){for(;c[r+1]<e;)r++;o[e]=(e-s[r])*(e-s[r])+a[s[r]]}for(let e=0;e<n;e++)t(e,o[e])};for(let e=0;e<n;e++)l(t=>r[t*n+e],(t,i)=>r[t*n+e]=i);for(let e=0;e<n;e++)l(t=>r[e*n+t],(t,i)=>r[e*n+t]=i);return r}function c(e,t,n){let r=s(e,t),i=new Uint8Array(e.length),a=n*n;for(let e=0;e<i.length;e++)i[e]=+(r[e]<=a);return i}function l(e){let t=new Uint8Array(e.length);for(let n=0;n<t.length;n++)t[n]=+!e[n];return t}function u(e,t,n){return n<=0?e.slice():l(c(l(c(e,t,n)),t,n))}function d(e,t){let n=new Uint8Array(e.length),r=[],i=t=>{!e[t]&&!n[t]&&(n[t]=1,r.push(t))};for(let e=0;e<t;e++)i(e),i((t-1)*t+e),i(e*t),i(e*t+t-1);for(;r.length;){let e=r.pop(),n=e%t,a=(e-n)/t;n>0&&i(e-1),n<t-1&&i(e+1),a>0&&i(e-t),a<t-1&&i(e+t)}return l(n)}function f(e,t){let n=new Uint8Array(e.length),r=[];for(let i=0;i<e.length;i++){if(!e[i]||n[i])continue;let a=[],o=[i];for(n[i]=1;o.length;){let r=o.pop();a.push(r);let i=r%t,s=(r-i)/t,c=[i>0?r-1:-1,i<t-1?r+1:-1,s>0?r-t:-1,s<t-1?r+t:-1];for(let t of c)t>=0&&e[t]&&!n[t]&&(n[t]=1,o.push(t))}r.push(a)}return r}var p=e=>!!e?.some(e=>e.color===`hand`||e.color===`foot`);function m(e,t,n){return a(e.map(e=>({...e,fill:!1,color:e.color===t?`#000000`:`erase`})),n)}function h(e,t=r,n){let i=t.size,o=i*i,m=new Int16Array(o),h={size:i,labels:m,limbs:[],silhouette:new Uint8Array(o),core:new Uint8Array(o),centroid:[i/2,i/2]},_=d(u(a(e,i),i,t.closeRadius),i),v=f(_,i).sort((e,t)=>t.length-e.length);if(v.length===0)return h;let b=new Uint8Array(o);for(let e of v[0])b[e]=1;for(let e=0;e<o;e++)_[e]&&(m[e]=1);let x=0,S=0;for(let e of v[0])x+=e%i,S+=Math.floor(e/i);let C=[x/v[0].length,S/v[0].length];if(p(n)){let e=g(_,m,C,n,t);if(e)return e}let w=s(l(b),i),T=0;for(let e=0;e<o;e++)b[e]&&w[e]>T&&(T=w[e]);let E=t.alpha*Math.sqrt(T),D=new Uint8Array(o);for(let e=0;e<o;e++)D[e]=b[e]&&w[e]>=E*E?1:0;let O=c(D,i,E);for(let e=0;e<o;e++)O[e]&=b[e];let k=new Uint8Array(o);for(let e=0;e<o;e++)k[e]=b[e]&&!O[e]?1:0;let A=[],j=Math.max(4,t.minAreaRatio*v[0].length),M=Math.max(6,2*E),N=Math.cos(t.footAngleDeg*Math.PI/180),P=(e,t,n)=>{let r=Math.hypot(n[0]-t[0],n[1]-t[1]),i=r>0&&(n[1]-t[1])/r>=N&&t[1]>C[1],a=A.length+2;for(let t of e)m[t]=a;A.push({kind:i?`foot`:`hand`,pivot:t,tip:n,length:r,area:e.length})};for(let e of f(k,i)){if(e.length<j)continue;let n=0,r=0,a=0;for(let t of e){let e=t%i,o=(t-e)/i;(e>0&&O[t-1]||e<i-1&&O[t+1]||o>0&&O[t-i]||o<i-1&&O[t+i])&&(n+=e,r+=o,a++)}if(a===0)continue;n/=a,r/=a;let o=y(e,i,[n,r],M);if(o){for(let e of o)e.pixels.length>=j&&P(e.pixels,e.pivot,e.tip);continue}let s=-1,c=n,l=r;for(let t of e){let e=t%i,a=(t-e)/i,o=(e-n)**2+(a-r)**2;o>s&&(s=o,c=e,l=a)}let u=Math.sqrt(s);u<=0||u/(e.length/u)<t.minAspect||P(e,[n,r],[c,l])}return{size:i,labels:m,limbs:A,silhouette:_,core:O,centroid:C}}function g(e,t,n,r,i){let a=i.size,o=a*a,s=[],c=new Uint8Array(o),l=0;for(let t=0;t<o;t++)l+=e[t];let u=Math.max(4,i.minAreaRatio*l*.5),d=[],p=[`hand`,`foot`].map(e=>({kind:e,m:m(r,e,a)}));if(p.every(({m:e})=>!e.some(e=>e)))return null;for(let{kind:t,m:n}of p){for(let t=0;t<o;t++)n[t]&=e[t];for(let e of f(n,a))if(e.length>=u){d.push({kind:t,comp:e});for(let t of e)c[t]=1}}let h=new Uint8Array(o);for(let t=0;t<o;t++)h[t]=e[t]&&!c[t]?1:0;for(let{kind:e,comp:r}of d){let i=0,o=0,c=0;for(let e of r){let t=e%a,n=(e-t)/a;(t>0&&h[e-1]||t<a-1&&h[e+1]||n>0&&h[e-a]||n<a-1&&h[e+a])&&(i+=t,o+=n,c++)}if(c)i/=c,o/=c;else{let e=1/0;for(let t of r){let r=t%a,s=(t-r)/a,c=(r-n[0])**2+(s-n[1])**2;c<e&&(e=c,i=r,o=s)}}let l=-1,u=i,d=o;for(let e of r){let t=e%a,n=(e-t)/a,r=(t-i)**2+(n-o)**2;r>l&&(l=r,u=t,d=n)}let f=s.length+2;for(let e of r)t[e]=f;s.push({kind:e,pivot:[i,o],tip:[u,d],length:Math.sqrt(l),area:r.length})}return{size:a,labels:t,limbs:s,silhouette:e,core:h,centroid:n}}var _=[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];function v(e,t,n){let r=e.slice(),i=(e,i)=>e<0||i<0||e>=t||i>=n?0:r[i*t+e],a=!0;for(;a;){a=!1;for(let e=0;e<2;e++){let o=[];for(let a=0;a<n;a++)for(let n=0;n<t;n++){if(!r[a*t+n])continue;let s=[i(n,a-1),i(n+1,a-1),i(n+1,a),i(n+1,a+1),i(n,a+1),i(n-1,a+1),i(n-1,a),i(n-1,a-1)],c=s.reduce((e,t)=>e+t,0);if(c<2||c>6)continue;let l=0;for(let e=0;e<8;e++)!s[e]&&s[(e+1)%8]&&l++;if(l!==1)continue;let[u,,d,,f,,p]=s;(e===0?u*d*f||d*f*p:u*d*p||u*f*p)||o.push(a*t+n)}for(let e of o)r[e]=0;o.length&&(a=!0)}}return r}function y(e,t,n,r){let i=t,a=t,o=0,s=0;for(let n of e){let e=n%t,r=(n-e)/t;e<i&&(i=e),e>o&&(o=e),r<a&&(a=r),r>s&&(s=r)}let c=o-i+1,l=s-a+1,u=new Uint8Array(c*l);for(let n of e)u[(Math.floor(n/t)-a)*c+n%t-i]=1;let d=v(u,c,l),f=e=>{let t=e%c,n=(e-t)/c;return _.map(([e,r])=>{let i=t+e,a=n+r;return i>=0&&a>=0&&i<c&&a<l?a*c+i:-1})},p=e=>{let t=f(e).map(e=>e>=0&&d[e]?1:0),n=0;for(let e=0;e<8;e++)t[e]&&!t[(e+1)%8]&&n++;return n},m=()=>{let e=new Uint8Array(c*l);for(let t=0;t<d.length;t++)if(!(!d[t]||p(t)<3)){e[t]=1;for(let n of f(t))n>=0&&d[n]&&(e[n]=1)}let t=new Uint8Array(c*l),n=[];for(let r=0;r<d.length;r++){if(!d[r]||e[r]||t[r])continue;let i={pixels:[],ends:[],joints:new Set},a=[r];for(t[r]=1;a.length;){let n=a.pop();i.pixels.push(n),p(n)<=1&&i.ends.push(n);for(let r of f(n))r<0||!d[r]||(e[r]?i.joints.add(r):t[r]||(t[r]=1,a.push(r)))}n.push(i)}return{junction:e,segs:n}};for(let e=0;e<3;e++){let e=!1;for(let t of m().segs)if(t.ends.length&&t.joints.size&&t.pixels.length<r){for(let e of t.pixels)d[e]=0;e=!0}if(!e)break}let{junction:h,segs:g}=m();if(!h.some(e=>e))return null;let y=n[0]-i,b=n[1]-a,x=-1,S=1/0;for(let e=0;e<d.length;e++){if(!d[e])continue;let t=(e%c-y)**2+(Math.floor(e/c)-b)**2;t<S&&(S=t,x=e)}let C=new Int32Array(c*l).fill(-1);for(let e=0;e<d.length;e++)d[e]&&(C[e]=-2);let w=e=>[e%c+i,Math.floor(e/c)+a],T=[];for(let e of g){if(!e.ends.length||!e.joints.size||e.pixels.includes(x))continue;let t=0,n=0;for(let r of e.joints)t+=r%c,n+=Math.floor(r/c);t/=e.joints.size,n/=e.joints.size;let r=e.ends[0],o=-1;for(let i of e.ends){let e=(i%c-t)**2+(Math.floor(i/c)-n)**2;e>o&&(o=e,r=i)}for(let t of e.pixels)C[t]=T.length;T.push({pixels:[],pivot:[t+i,n+a],tip:w(r)})}if(T.length===0)return null;let E=new Int32Array(c*l).fill(-3),D=[];for(let e=0;e<d.length;e++)d[e]&&(E[e]=C[e],D.push(e));for(let e=0;e<D.length;e++){let t=D[e];for(let e of f(t))e>=0&&u[e]&&E[e]===-3&&(E[e]=E[t],D.push(e))}let O=e=>(Math.floor(e/c)+a)*t+e%c+i;for(let e=0;e<E.length;e++)u[e]&&E[e]>=0&&T[E[e]].pixels.push(O(e));return T}function b(e,t,n){let r=e.size/512,i=Math.floor(t*r),a=Math.floor(n*r),o=0;for(let t=0;t<=2;t++){for(let n=-t;n<=t;n++)for(let r=-t;r<=t;r++){let t=i+r,s=a+n;if(t<0||s<0||t>=e.size||s>=e.size)continue;let c=e.labels[s*e.size+t];if(c>1)return c;c===1&&(o=1)}if(o)return o}return 1}var x=new Map,S=new Map,C=new Set,w=(e,t)=>`${e.length}:${e.slice(-40)}|${t??``}`;function T(e,t){let r=w(e,t);if(x.has(r))return Promise.resolve();let i=S.get(r);if(i)return i;let a=new Promise(i=>{let a=new Image;a.onload=()=>{let e=document.createElement(`canvas`);e.width=a.naturalWidth,e.height=a.naturalHeight;let o=e.getContext(`2d`);o.drawImage(a,0,0);let s=t?n(t):null;if(s){let t=document.createElement(`canvas`);t.width=s.w,t.height=s.h;let n=new ImageData(s.w,s.h);for(let e=0;e<s.m.length;e++)s.m[e]&&(n.data[e*4+3]=255);t.getContext(`2d`).putImageData(n,0,0),o.globalCompositeOperation=`destination-in`,o.imageSmoothingEnabled=!0,o.drawImage(t,0,0,e.width,e.height)}x.set(r,e),x.size>60&&x.delete(x.keys().next().value),S.delete(r),i();for(let e of C)e()},a.onerror=()=>{S.delete(r),i()},a.src=e});return S.set(r,a),a}function E(e){if(!e.img)return null;let t=x.get(w(e.img,e.mask));return t||T(e.img,e.mask),t??null}var D=e=>Promise.all(e.filter(e=>e.img).map(e=>T(e.img,e.mask))).then(()=>void 0);function O(e){C.add(e)}function k(t,n,r,i,a){let o=(e,n)=>{let r=e/Math.max(t.width,t.height),i=document.createElement(`canvas`);i.width=Math.max(1,Math.round(t.width*r)),i.height=Math.max(1,Math.round(t.height*r));let a=i.getContext(`2d`);return a.fillStyle=`#fff`,a.fillRect(0,0,i.width,i.height),a.drawImage(t,0,0,i.width,i.height),i.toDataURL(`image/jpeg`,n)};return{color:`#000000`,width:0,points:a.map(e=>Math.round(e)),img:o(300,.85),mask:e(n,r,i),timg:o(72,.7)}}function A(e,t,n,r){let i=e.canvas.width,a=e.canvas.height;if(t=Math.floor(t),n=Math.floor(n),t<0||n<0||t>=i||n>=a)return;let o=e.getImageData(0,0,i,a),s=o.data,c=(n*i+t)*4,l=s[c],u=s[c+1],d=s[c+2],f=s[c+3],p=document.createElement(`canvas`).getContext(`2d`);p.fillStyle=r,p.fillRect(0,0,1,1);let[m,h,g]=p.getImageData(0,0,1,1).data,_=e=>Math.abs(s[e+3]-f)<=60&&(f<20||Math.abs(s[e]-l)+Math.abs(s[e+1]-u)+Math.abs(s[e+2]-d)<=120),v=new Uint8Array(i*a),y=[n*i+t];for(v[y[0]]=1;y.length;){let e=y.pop(),t=e%i,n=(e-t)/i,r=[t>0?e-1:-1,t<i-1?e+1:-1,n>0?e-i:-1,n<a-1?e+i:-1];for(let e of r)e>=0&&!v[e]&&_(e*4)&&(v[e]=1,y.push(e))}let b=e=>{let t=e*4;s[t]=m,s[t+1]=h,s[t+2]=g,s[t+3]=255},x=[];for(let e=0;e<v.length;e++){if(!v[e])continue;b(e);let t=e%i,n=(e-t)/i;for(let r of[t>0?e-1:-1,t<i-1?e+1:-1,n>0?e-i:-1,n<a-1?e+i:-1])r>=0&&!v[r]&&x.push(r)}for(let e of x)s[e*4+3]<200&&b(e);e.putImageData(o,0,0)}function j(e,t){let n=t.points;if(t.img){let r=E(t);r&&n.length>=4&&e.drawImage(r,n[0],n[1],n[2],n[3])}else if(!(n.length<2)){if(t.fill)A(e,n[0],n[1],t.color);else{if(e.save(),e.lineCap=`round`,e.lineJoin=`round`,e.lineWidth=t.width,t.color===`erase`?(e.globalCompositeOperation=`destination-out`,e.strokeStyle=`#000`,e.fillStyle=`#000`):(e.strokeStyle=t.color,e.fillStyle=t.color),n.length===2)e.beginPath(),e.arc(n[0],n[1],t.width/2,0,Math.PI*2),e.fill();else{e.beginPath(),e.moveTo(n[0],n[1]);for(let t=2;t<n.length;t+=2)e.lineTo(n[t],n[t+1]);e.stroke()}e.restore()}}}function M(e){let t=document.createElement(`canvas`);t.width=t.height=512;let n=t.getContext(`2d`);for(let t of e)j(n,t);return t}function N(e,t){let n=M(e).getContext(`2d`).getImageData(0,0,512,512),r=t.limbs.length+1,i=Array.from({length:r},()=>new ImageData(512,512)),a=512,o=512,s=0,c=0;for(let e=0;e<512;e++)for(let r=0;r<512;r++){let l=(e*512+r)*4;if(n.data[l+3]===0)continue;r<a&&(a=r),r>s&&(s=r),e<o&&(o=e),e>c&&(c=e);let u=b(t,r,e)-1,d=i[Math.max(0,u)].data;d[l]=n.data[l],d[l+1]=n.data[l+1],d[l+2]=n.data[l+2],d[l+3]=n.data[l+3]}return s<a&&(a=o=0,s=c=511),{canvases:i.map(e=>{let t=document.createElement(`canvas`);return t.width=t.height=512,t.getContext(`2d`).putImageData(e,0,0),t}),bounds:{x0:a,y0:o,x1:s,y1:c}}}var P=(e,t=8,n=`#222222`)=>({color:n,width:t,points:e});function F(e,t,n,r=8,i=`#222222`,a=40){let o=[];for(let r=0;r<=a;r++){let i=r/a*Math.PI*2;o.push(e+Math.cos(i)*n,t+Math.sin(i)*n)}return P(o,r,i)}function ee(e,t,n,r,i=8,a=`#222222`){let o=[];for(let i=0;i<=48;i++){let a=i/48*Math.PI*2;o.push(e+Math.cos(a)*n,t+Math.sin(a)*r)}return P(o,i,a)}function te(e,t,n,r){let i=[];for(let r=-n;r<=n;r+=10){let a=Math.sqrt(Math.max(0,n*n-r*r));i.push(e-a,t+r,e+a,t+r+5)}return P(i,14,r)}var I={ふつうの生き物:()=>[ee(256,230,90,110),P([175,200,110,160,90,120]),P([175,205,120,190,80,140]),P([337,200,400,170,430,130]),P([337,205,395,190,440,150]),P([220,335,210,420,190,450]),P([245,338,240,420,220,455]),P([270,338,275,420,295,455]),P([295,335,305,420,325,450]),F(225,200,8,6),F(285,200,8,6)],棒人間:()=>[F(256,110,45),P([256,155,256,310]),P([256,200,180,260]),P([256,200,332,260]),P([256,310,200,430]),P([256,310,312,430])],トゲトゲ:()=>{let e=[te(256,256,90,`#c0392b`)];for(let t=0;t<20;t++){let n=t/20*Math.PI*2;e.push(P([256+Math.cos(n)*85,256+Math.sin(n)*85,256+Math.cos(n)*170,256+Math.sin(n)*170],10,`#c0392b`))}return e},タコ:()=>{let e=[te(256,190,100,`#2e86de`)];for(let t=0;t<8;t++){let n=170+t*25,r=[];for(let e=0;e<=10;e++)r.push(n+Math.sin(e*.8+t)*15,270+e*18);e.push(P(r,12,`#2e86de`))}return e},"まんまる（塗りつぶし）":()=>[te(256,256,130,`#27ae60`)],"文字 ABC":()=>[P([90,330,130,180,170,330]),P([105,270,155,270]),P([210,180,210,330]),P([210,180,260,190,265,245,210,255,270,270,265,325,210,330]),P([400,195,360,180,320,210,315,280,345,325,400,315])],巨大な片手:()=>[ee(150,300,70,70),P([215,280,330,230,480,200],22)],胴長ノッポ:()=>[ee(256,200,50,150),P([230,345,225,470]),P([282,345,287,470]),P([210,150,150,200]),P([302,150,362,200])],短足ずんぐり:()=>[ee(256,240,160,110),P([200,345,195,385],14),P([312,345,317,385],14),P([100,220,40,180]),P([412,220,472,180])]},ne=new Map(`必殺:ひっさつ 通常:つうじょう 通常攻撃:つうじょうこうげき 手:て 足:あし 威力:いりょく 絵:え 移動:いどう 飛:と 見:み 読:よ 込:こ 大:おお 消:き 消し:け 消す:け 消さ:け 防御:ぼうぎょ 中:ちゅう 中に:なか 中の:なか 中は:なか
中だ:なか 中ま:なか 速:はや 描:か 弾:たま 引:ひ 出:で 出し:だ 出す:だ 出さ:だ 取:と 体力:たいりょく 直:なお 回避:かいひ 長:なが 吹:ふ 棒人間:ぼうにんげん 動:うご 使:つか 振:ふ
転:ころ 名無:なな 強:つよ 継:つ 代:か 手足:てあし 線:せん 構:かま 回復:かいふく 回:かい 回せ:まわ 回っ:まわ 回る:まわ 回す:まわ 相手:あいて 作:つく 分解:ぶんかい 全部消:ぜんぶけ
命中:めいちゅう 分:ぶん 分か:わ 分け:わ 門番:もんばん 防御中:ぼうぎょちゅう 勝:しょう 勝ち:か 勝つ:か 勝て:か 勝っ:か 自動:じどう 合成:ごうせい 付:つ 保存:ほぞん 攻撃:こうげき 当:あ
倍:ばい 文字:もじ 文:ぶん 機種変更:きしゅへんこう 四角:しかく 明:あか 色:いろ 背景:はいけい 鍵:かぎ 材料:ざいりょう 個:こ 開:ひら 用:よう 白:しろ 左:ひだり 写真:しゃしん 巨大:きょだい 体当:たいあ 大王:だいおう 章:しょう 竜:りゅう 将軍:しょうぐん 与:よ 与え:あた 溜:た 受:う 入:はい 入れ:い 名前:なまえ 合:あ 同:おな 押:お 突:つ 塗:ぬ
少:すこ 必要:ひつよう 遅:おそ 空:そら 殴:なぐ 片手:かたて 連打:れんだ 無:な 第:だい 王:おう 魔女:まじょ 白紙:はくし 防御成功:ぼうぎょせいこう 下:した 下げ:さ 物:もの 近接:きんせつ
装備:そうび 端末:たんまつ 画面:がめん 間:あいだ 止:と 上:うえ 上が:あ 上げ:あ 近:ちか 遠:とお 投:な 時間:じかん 技:わざ 消費:しょうひ 経験値:けいけんち 装備中:そうびちゅう 戦:たたか
検知:けんち 書:か 形:かたち 丸:まる 外:そと 外し:はず 外す:はず 外れ:はず 大技:おおわざ 今:いま 遠距離:えんきょり 編集中:へんしゅうちゅう 操作:そうさ 胴体:どうたい 所:ところ 何:なに 戻:もど
変:か 拘束:こうそく 足封:あしふう 短:みじか 届:とど 返:かえ 地面:じめん 前:まえ 胴長:どうなが 短足:たんそく 体:からだ 体あ:たい 軽:かる 本:ほん 重:おも 拳:こぶし 降:ふ 横:よこ
名人:めいじん 最大:さいだい 減:へ 割合:わりあい 先:さき 一度:いちど 上限:じょうげん 組:く 枝:えだ 敗:はい 今日:きょう 人:ひと 音:おと 流:なが 自由:じゆう 観戦:かんせん 設定:せってい 持:も
表示:ひょうじ 才能:さいのう 効:き 説明:せつめい 中心:ちゅうしん 順:じゅん 先端:せんたん 損:そん 共通:きょうつう 数値:すうち 度:ど 度に:たび 進:すす 具合:ぐあい 続:つづ 置:お 貼:は 育:そだ
自分:じぶん 素早:すばや 後:あと 後ろ:うし 太:ふと 補正:ほせい 終:お 全部:ぜんぶ 弾速:だんそく 近接必殺:きんせつひっさつ 個目:こめ 距離:きょり 会心:かいしん 何回:なんかい 小:ちい 痛:いた
追:お 足元:あしもと 時:とき 走:はし 内側:うちがわ 紙:かみ 弱:よわ 効果:こうか 状態異常:じょうたいいじょう 撃:う 生:い 全部手:ぜんぶて 揺:ゆ 町:まち 背中:せなか 隕石:いんせき 突進:とっしん
豆粒:まめつぶ 竜巻:たつまき 反動:はんどう 身:み 割:わり 一度押:いちどお 禁止:きんし 取得済:しゅとくず 山場:やまば 道:みち 両方:りょうほう 称号:しょうごう 準備中:じゅんびちゅう 選択:せんたく
替:か 本足:ほんあし 負:ま 抜:ぬ 多:おお 学校:がっこう 住所:じゅうしょ 電話番号:でんわばんごう 顔:かお 言葉:ことば 悪:わる 言:い 預:あず 個人情報:こじんじょうほう 回数制限:かいすうせいげん
内容:ないよう 非表示:ひひょうじ 予告:よこく 削除:さくじょ 敵:てき 倒:たお 好:す 強化:きょうか 全:ぜん 合計:ごうけい 種類:しゅるい 個集:こあつ 段上:だんうえ 別:べつ 遊:あそ 安心:あんしん
換:か 決:き 戦闘開始:せんとうかいし 左下:ひだりした 右下:みぎした 不要:ふよう 入力方向:にゅうりょくほうこう 方向:ほうこう 関節:かんせつ 細:ほそ 左半分:ひだりはんぶん 右:みぎ
左右対称:さゆうたいしょう 大丈夫:だいじょうぶ 調整:ちょうせい 初期値:しょきち 検知結果:けんちけっか 即反映:そくはんえい 良:よ 値:あたい 教:おし 目延長:めえんちょう 短縮:たんしゅく 発動:はつどう
回減:かいへ 残:のこ 通:とお 削:けず 落:お 行:い 踏:ふ 待:ま 跳:と 輪:わ 安全:あんぜん 逆:ぎゃく 手元:てもと 本体:ほんたい 追加:ついか 確率:かくりつ 貫:つらぬ 得意:とくい 背:せ 高:たか
王冠:おうかん 来:く 一歩:いっぽ 雨:あめ 注意:ちゅうい 森:もり 墨:すみ 砦:とりで 嵐:あらし 城:しろ 地:じ 果:は 光:ひかり 最後:さいご 最高速:さいこうそく 甘:あま 発:はつ 自慢:じまん 目:め
練習:れんしゅう 身軽:みがる 韋駄天:いだてん 満:まん 深呼吸:しんこきゅう 肺:はい 無尽蔵:むじんぞう 皮:かわ 盾:たて 鉄壁:てっぺき 標準:ひょうじゅん 大爆発:だいばくはつ 番長:ばんちょう 千手:せんじゅ
一撃:いちげき 指:ゆび 立体:りったい 失敗:しっぱい 可能性:かのうせい 円:えん 隙間:すきま 埋:う 最小:さいしょう 細長:ほそなが 角度:かくど 真下:ました 右上:みぎうえ 数字:すうじ 次:つぎ
使用:しよう 片方:かたほう 取得:しゅとく 全部戻:ぜんぶもど 最高:さいこう 済:ず 長押:ながお 件:けん 壊:こわ 中身:なかみ 三角:さんかく 勢:いきお 具:ぐ 触角:しょっかく 数:かず 一本足:いっぽんあし
槍:やり 横長:よこなが 車体:しゃたい 発車:はっしゃ 冷:つめ 刃:は 切:き 羽根:はね 枚:まい 意外:いがい 上向:うわむ 触手:しょくしゅ 猛攻:もうこう 慎重:しんちょう 守:まも 固:かた 反撃:はんげき
狙:ねら 狙撃:そげき 離:はな 多用:たよう 伸:の 視界:しかい 多段:ただん 高威力:こういりょく 高速:こうそく 追尾:ついび 打:う 落下:らっか 分裂弾:ぶんれつだん 罠:わな 明日:あした 勝利:しょうり
注目:ちゅうもく 的中:てきちゅう 日本中:にほんじゅう 結果:けっか 金:かね 保護者:ほごしゃ 方:ほう 利用規約:りようきやく 個人:こじん 無料:むりょう 運営:うんえい 広告:こうこく 課金:かきん
公開:こうかい 公開日:こうかいび 持ち主:もちぬし 持主:もちぬし 印:しるし 主:ぬし 性格:せいかく 対戦:たいせん 勝敗:しょうはい 番号:ばんごう 化:か 氏名:しめい 位置情報:いちじょうほう 秘密:ひみつ 乱数:らんすう 混:ま 元:もと 重複防止:ちょうふくぼうし 記録:きろく
日:ひ 順次消:じゅんじけ 保存先:ほぞんさき 米国:べいこく 配信:はいしん 性的:せいてき 暴力的:ぼうりょくてき 差別的:さべつてき 他:ほか 作品:さくひん 悪口:わるぐち 別々:べつべつ 運営者:うんえいしゃ
判断:はんだん 依頼:いらい 問:と 変更:へんこう 停止:ていし 終了:しゅうりょう 保証:ほしょう 知:し 一回:いっかい 再戦:さいせん 戦闘:せんとう 発射:はっしゃ`.split(/\s+/).map(e=>e.split(`:`))),re=/[\u4e00-\u9fff々]/,ie=/[\u4e00-\u9fff々]+/g;function ae(e,t=``){let n=[],r=0;for(;r<e.length;){let i=null;for(let n=e.length;n>r&&!i;n--){let a=e.slice(r,n);if(n===e.length)for(let e=3;e>=1&&!i;e--){let n=ne.get(a+t.slice(0,e));n&&t.length>=e&&(i=[a,n])}if(!i){let e=ne.get(a);e&&(i=[a,e])}}i||=[e[r],null],n.push(i),r+=i[0].length}return n}function oe(e){let t=[],n=0;for(let r of e.matchAll(ie))r.index>n&&t.push([e.slice(n,r.index),null]),t.push(...ae(r[0],e.slice(r.index+r[0].length))),n=r.index+r[0].length;return n<e.length&&t.push([e.slice(n),null]),t}var se=e=>oe(e).map(([e,t])=>t??e).join(``),ce=`doodle-arena:furigana`;function le(){try{return localStorage.getItem(ce)!==`off`}catch{return!0}}function ue(e){try{localStorage.setItem(ce,e?`on`:`off`)}catch{}}var L=new Set([`SCRIPT`,`STYLE`,`TEXTAREA`,`INPUT`,`RUBY`,`RT`,`RP`,`TITLE`]),de=new Set([`OPTION`,`text`,`tspan`,`title`]);function fe(e){let t=e.nodeValue;if(!t||!re.test(t))return;let n=e.parentElement;if(!n||n.closest(`.furi,ruby,script,style,textarea,[data-noruby]`))return;if(de.has(n.tagName)||n instanceof SVGElement){let n=se(t);n!==t&&(e.nodeValue=n);return}if(L.has(n.tagName))return;let r=oe(t);if(!r.some(([,e])=>e))return;let i=document.createElement(`span`);for(let[e,t]of r){if(!t){i.appendChild(document.createTextNode(e));continue}let n=document.createElement(`ruby`);n.append(e);let r=document.createElement(`rt`);r.textContent=t,n.appendChild(r),i.appendChild(n)}i.className=`furi`,n.replaceChild(i,e)}function pe(e){if(e.nodeType===Node.TEXT_NODE){fe(e);return}if(e.nodeType!==Node.ELEMENT_NODE||L.has(e.tagName))return;let t=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),n=[];for(let e=t.nextNode();e;e=t.nextNode())n.push(e);for(let e of n)fe(e)}function R(e=document.body){le()&&(pe(e),new MutationObserver(e=>{for(let t of e)t.type===`characterData`?fe(t.target):t.addedNodes.forEach(pe)}).observe(e,{childList:!0,characterData:!0,subtree:!0}))}var me=`https://rakugaki-arena.pages.dev/`,z=`#らくがきアリーナ`;function B(e,t){let n=t.flatMap(e=>e.stages.map(t=>({c:e,s:t}))),r=n.filter(({s:t})=>e[t.id]);if(!r.length)return`📖 ストーリー: これから ぼうけん スタート！`;let i=r.reduce((e,t)=>t.s.no>e.s.no?t:e),a=r.length===n.length,o=n.filter(({s:t})=>t.boss&&e[t.id]).map(({s:e})=>e.enemy);return[a?`📖 ストーリー: ぜんぶ クリア！（${n.length}ステージ）`:`📖 ストーリー: 第${i.c.no}章「${i.c.title}」${i.s.id}「${i.s.title}」まで クリア（${r.length}/${n.length}）`,...o.length?[`👑 たおした ボス: ${o.join(`・`)}`]:[]].join(`
`)}function he(e){return[`らくがきアリーナで あそんでるよ！✏️⚔️`,...e.charName?[`🧑 わたしの キャラ: 「${e.charName}」`]:[],B(e.cleared,e.chapters),`⭐ Lv${e.level}・スキルツリー ${e.spent}/${e.cap}${e.titles.length?`（${e.titles.join(`・`)}）`:``}`,`🧩 ひっさつパーツ ${e.partCount}こ${e.bestPart?`（いちばん レア: ${e.bestPart}）`:``}`,``,`じぶんで かいた絵が たたかう ゲーム`,me,z].join(`
`)}var ge=e=>{let t=[];for(let n=0;n+1<e.length;n+=2)t.push([e[n],e[n+1]]);return t},_e=e=>e.flatMap(([e,t])=>[Math.round(e),Math.round(t)]),ve=(e,t)=>Math.hypot(e[0]-t[0],e[1]-t[1]),ye=.35,be=(e,t,n=ye)=>[e[0]+(t[0]-e[0])*n,e[1]+(t[1]-e[1])*n];function xe(e){return{...e,points:e.points.map((e,t)=>t%2==0?512-e:e)}}function Se(e,t){let n=[0];for(let t=1;t<e.length;t++)n.push(n[t-1]+ve(e[t-1],e[t]));let r=n[n.length-1];if(r<=0)return[e[0]];let i=[],a=1;for(let o=0;o<t;o++){let s=r*o/(t-1);for(;a<n.length-1&&n[a]<s;)a++;let c=e[a-1],l=e[a],u=n[a]>n[a-1]?(s-n[a-1])/(n[a]-n[a-1]):0;i.push([c[0]+(l[0]-c[0])*u,c[1]+(l[1]-c[1])*u])}return i}function Ce(e){let t=ge(e);if(t.length<3)return null;let n=1/0,r=1/0,i=-1/0,a=-1/0,o=0;t.forEach((e,s)=>{n=Math.min(n,e[0]),r=Math.min(r,e[1]),i=Math.max(i,e[0]),a=Math.max(a,e[1]),s&&(o+=ve(t[s-1],e))});let s=Math.hypot(i-n,a-r);if(s<16)return null;let c=t[0],l=t[t.length-1],u=ve(c,l);if(u>.8*o){let e=0;for(let n of t)e=Math.max(e,Math.abs((l[0]-c[0])*(c[1]-n[1])-(c[0]-n[0])*(l[1]-c[1]))/u);return e<Math.max(4,.07*u)?{kind:`line`,points:_e([c,l])}:null}if(u>.3*s)return null;let d=Se(t,64),f=0,p=0;for(let e of d)f+=e[0],p+=e[1];f/=d.length,p/=d.length;let m=0,h=0,g=0;for(let[e,t]of d)m+=(e-f)**2,h+=(t-p)**2,g+=(e-f)*(t-p);m/=d.length,h/=d.length,g/=d.length;let _=.5*Math.atan2(2*g,m-h),v=Math.cos(_),y=Math.sin(_),b=0,x=0;for(let[e,t]of d){let n=(e-f)*v+(t-p)*y,r=-(e-f)*y+(t-p)*v;b+=n*n,x+=r*r}let S=Math.sqrt(2*b/d.length),C=Math.sqrt(2*x/d.length);if(S<4||C<4)return null;let w=0;for(let[e,t]of d){let n=(e-f)*v+(t-p)*y,r=-(e-f)*y+(t-p)*v;w+=Math.abs(Math.hypot(n/S,r/C)-1)}if(w/d.length>.14)return null;let T=Math.max(S,C)/Math.min(S,C)<1.18;T&&(S=C=(S+C)/2);let E=[];for(let e=0;e<=48;e++){let t=e/48*Math.PI*2,n=S*Math.cos(t),r=C*Math.sin(t);E.push([f+n*v-r*y,p+n*y+r*v])}return{kind:T?`circle`:`ellipse`,points:_e(E)}}function we(e){let t=e;for(let e=0;e<2;e++){if(t.length<3)return t;let e=[t[0]];for(let n=0;n+1<t.length;n++){let[r,i]=[t[n],t[n+1]];e.push([.75*r[0]+.25*i[0],.75*r[1]+.25*i[1]],[.25*r[0]+.75*i[0],.25*r[1]+.75*i[1]])}e.push(t[t.length-1]),t=e}let n=[t[0]];for(let e=1;e<t.length-1;e++)ve(t[e],n[n.length-1])>=2&&n.push(t[e]);return n.push(t[t.length-1]),n}function Te(e,t,n){let r=n[0]-t[0],i=n[1]-t[1],a=r*r+i*i,o=a?Math.max(0,Math.min(1,((e[0]-t[0])*r+(e[1]-t[1])*i)/a)):0;return[t[0]+o*r,t[1]+o*i]}var Ee=e=>!e.fill&&!e.img&&e.color!==`erase`&&e.points.length>=4;function De(e){let t=e.map(e=>Ee(e)?{...e,points:_e(we(ge(e.points)))}:{...e,points:[...e.points]}),n=t.map((e,t)=>({s:e,i:t,ps:Ee(e)?ge(e.points):[]})).filter(e=>e.ps.length>=2);for(let e of n){let r=Math.max(14,e.s.width*1.6);for(let t of[0,1]){let i=t?e.ps[e.ps.length-1]:e.ps[0],a=null,o=r;for(let r of n){let n=r===e?t?[[0,1]]:[[e.ps.length-2,e.ps.length-1]]:r.ps.slice(1).map((e,t)=>[t,t+1]);if(!(r===e&&e.ps.length<6))for(let[e,t]of n){let n=Te(i,r.ps[e],r.ps[t]),s=ve(i,n);s>1&&s<o&&(o=s,a=n)}}!a||o<=e.s.width*.5||(t?e.ps.push(a):e.ps.unshift(a))}t[e.i]={...e.s,points:_e(e.ps)}}return t}var Oe=400;function ke(e,t,n){let r=new Float64Array((t+1)*(t+1));for(let n=0;n<t;n++){let i=0;for(let a=0;a<t;a++)i+=e[n*t+a],r[(n+1)*(t+1)+a+1]=r[n*(t+1)+a+1]+i}let i=new Float32Array(t*t);for(let e=0;e<t;e++){let a=Math.max(0,e-n),o=Math.min(t,e+n+1);for(let s=0;s<t;s++){let c=Math.max(0,s-n),l=Math.min(t,s+n+1),u=r[o*(t+1)+l]-r[a*(t+1)+l]-r[o*(t+1)+c]+r[a*(t+1)+c];i[e*t+s]=u/((o-a)*(l-c))}}return i}function Ae(e,t=.5){let n=e.width,r=[0,1,2].map(t=>{let r=new Float32Array(n*n);for(let i=0;i<n*n;i++)r[i]=e.data[i*4+t];return r}),i=r.map(e=>ke(e,n,Math.max(4,Math.round(n/10)))),a=90-70*Math.max(0,Math.min(1,t)),o=new Uint8Array(n*n);for(let e=0;e<n*n;e++){let t=r[0][e]-i[0][e],n=r[1][e]-i[1][e],s=r[2][e]-i[2][e];.3*t+.59*n+.11*s>12||Math.hypot(t,n,s)>a&&(o[e]=1)}let s=new Uint8Array(n*n),c=Math.max(6,Math.round(n*n*2e-4));for(let e=0;e<n*n;e++){if(!o[e]||s[e])continue;let t=[e];s[e]=1;for(let e=0;e<t.length;e++){let r=t[e],i=r%n,a=(r-i)/n;for(let e of[i>0?r-1:-1,i<n-1?r+1:-1,a>0?r-n:-1,a<n-1?r+n:-1])e>=0&&o[e]&&!s[e]&&(s[e]=1,t.push(e))}if(t.length<c)for(let e of t)o[e]=0}return o}function je(e,t){if(e.length<3)return e;let[n,r]=[e[0],e[e.length-1]],i=Math.hypot(r[0]-n[0],r[1]-n[1]),a=-1,o=0;for(let t=1;t<e.length-1;t++){let s=e[t],c=i?Math.abs((r[0]-n[0])*(n[1]-s[1])-(n[0]-s[0])*(r[1]-n[1]))/i:Math.hypot(s[0]-n[0],s[1]-n[1]);c>a&&(a=c,o=t)}return a<=t?[n,r]:[...je(e.slice(0,o+1),t).slice(0,-1),...je(e.slice(o),t)]}var Me=e=>Math.round(Math.max(0,Math.min(255,e))).toString(16).padStart(2,`0`);function Ne(e,t){let n=n=>{let r=n%t,i=(n-r)/t,a=[];for(let n=-1;n<=1;n++)for(let o=-1;o<=1;o++){if(!o&&!n)continue;let s=r+o,c=i+n;s>=0&&c>=0&&s<t&&c<t&&e[c*t+s]&&a.push(c*t+s)}return a},r=new Uint8Array(t*t),i=[],a=e=>{let t=[e];r[e]=1;for(let i=e;;){let e=n(i).find(e=>!r[e]);if(e===void 0)break;r[e]=1,t.push(e),i=e}i.push(t)};for(let i=0;i<t*t;i++)e[i]&&!r[i]&&n(i).length===1&&a(i);for(let n=0;n<t*t;n++)e[n]&&!r[n]&&a(n);return i}function Pe(e,t=.5){let n=e.width,r=Ae(e,t),i=n,a=n,o=-1,c=-1;for(let e=0;e<n*n;e++)if(r[e]){let t=e%n,r=(e-t)/n;i=Math.min(i,t),o=Math.max(o,t),a=Math.min(a,r),c=Math.max(c,r)}if(o<0)return[];let l=432/Math.max(8,o-i+1,c-a+1),u=256-(i+o+1)/2*l,d=256-(a+c+1)/2*l,f=new Uint8Array(n*n);for(let e=0;e<n*n;e++)f[e]=+!r[e];let p=s(f,n),m=Ne(v(r,n,n),n),h=[];for(let t of m){let r=0,i=0,a=0,o=0;for(let n of t)r+=Math.sqrt(p[n]),i+=e.data[n*4],a+=e.data[n*4+1],o+=e.data[n*4+2];let s=t.length;if(r/=s,i/=s,a/=s,o/=s,s<3&&r<1.5)continue;let c=.3*i+.59*a+.11*o<95&&Math.max(i,a,o)-Math.min(i,a,o)<40?`#222222`:`#${Me(i)}${Me(a)}${Me(o)}`,f=je(t.map(e=>[e%n,Math.floor(e/n)]),.8).flatMap(([e,t])=>[Math.round(u+(e+.5)*l),Math.round(d+(t+.5)*l)]),m=Math.max(3,Math.min(40,Math.round(2*r*l)));h.push({s:{color:c,width:m,points:f.length>=4?f:[f[0],f[1]]},len:s})}let g=h.sort((e,t)=>t.len-e.len).slice(0,Oe).map(e=>e.s);return[...g.filter(e=>e.color!==`#222222`),...g.filter(e=>e.color===`#222222`)]}var Fe=(e,t)=>(e[0]-t[0])**2+(e[1]-t[1])**2+(e[2]-t[2])**2,Ie=(e,t)=>Fe(e,t)+((e[3]??0)-(t[3]??0))**2,Le=(e,t)=>[e.data[t*4],e.data[t*4+1],e.data[t*4+2]];function Re(e,t,n=8){if(!e.length)return[];let r=[e[Math.floor(e.length/2)]];for(;r.length<t;){let t=-1,n=-1;for(let i=0;i<e.length;i++){let a=Math.min(...r.map(t=>Ie(t,e[i])));a>n&&(n=a,t=i)}if(n<200)break;r.push(e[t])}for(let t=0;t<n;t++){let t=e[0].length,n=r.map(()=>Array(t+1).fill(0));for(let i of e){let e=0,a=1/0;r.forEach((t,n)=>{let r=Ie(t,i);r<a&&(a=r,e=n)});for(let r=0;r<t;r++)n[e][r]+=i[r];n[e][t]++}n.forEach((e,n)=>{e[t]&&(r[n]=e.slice(0,t).map(n=>n/e[t]))})}return r}function ze(e,t=.5){let n=e.width,r=n*n,i=t=>e.data[t*4+3]>0,a=n,o=n,s=-1,c=-1;for(let e=0;e<r;e++)if(i(e)){let t=e%n,r=(e-t)/n;a=Math.min(a,t),s=Math.max(s,t),o=Math.min(o,r),c=Math.max(c,r)}if(s<0)return new Uint8Array(r);let l=s-a+1,u=c-o+1,d=(a+s)/2,f=(o+c)/2,p=Math.max(2,Math.round(Math.min(l,u)*.04)),m=Math.max(2,Math.round(n/64)),h=[0,1,2].map(t=>{let i=new Float32Array(r);for(let n=0;n<r;n++)i[n]=e.data[n*4+t];return ke(i,n,m)}),g=new Float32Array(r),_=new Float32Array(r);for(let t=0;t<r;t++){let n=.3*e.data[t*4]+.59*e.data[t*4+1]+.11*e.data[t*4+2];g[t]=n,_[t]=n*n}let v=ke(g,n,m),y=ke(_,n,m),b=e=>[h[0][e],h[1][e],h[2][e],1.5*Math.sqrt(Math.max(0,y[e]-v[e]*v[e]))],x=[],S=[];for(let e=o;e<=c;e++)for(let t=a;t<=s;t++){let r=e*n+t;i(r)&&(t-a<p||s-t<p||e-o<p||c-e<p?x.push(b(r)):((t-d)/(l*.22))**2+((e-f)/(u*.22))**2<=1&&S.push(b(r)))}let C=Re(x,6),w=Re(S,6).filter(e=>C.every(t=>Ie(t,e)>484));if(!w.length){let e=new Uint8Array(r);for(let t=0;t<r;t++)e[t]=+!!i(t);return e}let T=1.6-1.2*Math.max(0,Math.min(1,t)),E=(e,t)=>{let p=new Uint8Array(r),m=new Uint8Array(r);for(let n=0;n<r;n++){if(!i(n))continue;let r=b(n),a=Math.min(...e.map(e=>Ie(e,r))),o=Math.min(...t.map(e=>Ie(e,r)));m[n]=+(o<a*T*T)}for(let e=0;e<2;e++){let e=new Uint8Array(r);for(let t=o;t<=c;t++)for(let r=a;r<=s;r++){let i=0,l=0;for(let e=-2;e<=2;e++)for(let u=-2;u<=2;u++){let d=r+u,f=t+e;d<a||f<o||d>s||f>c||(l++,i+=m[f*n+d])}e[t*n+r]=+(i*2>l)}m=e}let h=new Int32Array(r).fill(-1),g=[];for(let e=0;e<r;e++){if(!m[e]||h[e]>=0)continue;let t=[e];h[e]=g.length;for(let e=0;e<t.length;e++){let r=t[e],i=r%n,a=(r-i)/n;for(let e of[i>0?r-1:-1,i<n-1?r+1:-1,a>0?r-n:-1,a<n-1?r+n:-1])e>=0&&m[e]&&h[e]<0&&(h[e]=g.length,t.push(e))}g.push(t)}if(!g.length)return p;let _=e=>{let t=0;for(let r of e){let e=r%n,i=(r-e)/n;t+=+(Math.hypot((e-d)/l,(i-f)/u)<.25)}return t*10+e.length*.01},v=g.reduce((e,t)=>_(t)>_(e)?t:e);for(let e of v)p[e]=1;let y=new Uint8Array(r),x=[];for(let e=o;e<=c;e++)for(let t=a;t<=s;t++)(t===a||t===s||e===o||e===c)&&!p[e*n+t]&&(y[e*n+t]=1,x.push(e*n+t));for(;x.length;){let e=x.pop(),t=e%n,r=(e-t)/n;for(let i of[t>a?e-1:-1,t<s?e+1:-1,r>o?e-n:-1,r<c?e+n:-1])i>=0&&!p[i]&&!y[i]&&(y[i]=1,x.push(i))}for(let e=o;e<=c;e++)for(let t=a;t<=s;t++)y[e*n+t]||(p[e*n+t]=1);return p},D=E(C,w);for(let e=0;e<2;e++){let e=[],t=[],r=Math.max(1,Math.floor(Math.sqrt(l*u/6e3)));for(let l=o;l<=c;l+=r)for(let o=a;o<=s;o+=r){let r=l*n+o;i(r)&&(D[r]?e:t).push(b(r))}if(e.length<20||t.length<20)break;let d=Re(t,8),f=Re(e,8).filter(e=>d.every(t=>Ie(t,e)>324));if(!f.length)break;D=E(d,f)}let O=(e,t)=>{let i=new Uint8Array(r);for(let r=o;r<=c;r++)for(let l=a;l<=s;l++){let u=!1;for(let i=-2;i<=2&&!u;i++)for(let d=-2;d<=2&&!u;d++){let f=l+d,p=r+i;(f<a||p<o||f>s||p>c?0:e[p*n+f])===t&&(u=!0)}i[r*n+l]=t?+!!u:+!u}return i};return O(O(D,1),0)}var Be=520;function Ve(e,t=.5,n=.5,r){let i=e.width,a=r??ze(e,n),o=0;for(let e=0;e<i*i;e++)o+=a[e];if(o<16)return[];let s=i,c=i,l=-1,u=-1;for(let e=0;e<i*i;e++)if(a[e]){let t=e%i,n=(e-t)/i;s=Math.min(s,t),l=Math.max(l,t),c=Math.min(c,n),u=Math.max(u,n)}if(l<0)return[];let d=Math.max(8,l-s+1,u-c+1),f=432/d,p=256-(s+l+1)/2*f,m=256-(c+u+1)/2*f,h=(e,t)=>[Math.round(p+e*f),Math.round(m+t*f)];{let e=new Uint8Array(i*i),t=[];for(let n=0;n<i;n++)for(let r of[n,(i-1)*i+n,n*i,n*i+i-1])!a[r]&&!e[r]&&(e[r]=1,t.push(r));for(;t.length;){let n=t.pop(),r=n%i,o=(n-r)/i;for(let s of[r>0?n-1:-1,r<i-1?n+1:-1,o>0?n-i:-1,o<i-1?n+i:-1])s>=0&&!a[s]&&!e[s]&&(e[s]=1,t.push(s))}for(let t=0;t<i*i;t++)e[t]||(a[t]=1)}for(let n=Math.round(36+54*Math.max(0,Math.min(1,t)));n>=16;n=Math.round(n*.85)){let t=d/n,r=[];for(let n=0;n*t<=u-c;n++){let o=Math.min(u,Math.round(c+(n+.5)*t)),d=[];for(let n=0;n*t<=l-s;n++){let r=Math.min(l,Math.round(s+(n+.5)*t)),c=null;if(a[o*i+r]){let n=[0,0,0],s=0,l=Math.max(0,Math.floor(t/2));for(let t=-l;t<=l;t++)for(let c=-l;c<=l;c++){let l=r+c,u=o+t;if(l<0||u<0||l>=i||u>=i||!a[u*i+l])continue;let d=Le(e,u*i+l);n[0]+=d[0],n[1]+=d[1],n[2]+=d[2],s++}c=s?n.map(e=>e/s):Le(e,o*i+r)}d.push({y:o,xs:Math.round(s+n*t),xe:Math.round(s+(n+1)*t),rgb:c})}r.push(d)}let o=Re(r.flat().filter(e=>e.rgb).map(e=>e.rgb),6),p=o.map(e=>(e[0]+e[1]+e[2])/3),m=Math.min(...p),g=Math.max(...p),_=o.map((e,t)=>{let n=Math.max(1,p[t]),r=g-m>8?60+(p[t]-m)/(g-m)*175:Math.min(235,n*1.25+20);return e.slice(0,3).map(e=>Math.max(0,Math.min(255,r+(e-n)*1.35*(r/n))))}),y=e=>{let t=0,n=1/0;return o.forEach((r,i)=>{let a=Fe(r,e);a<n&&(n=a,t=i)}),t},b=_.map(()=>[]),x=Math.max(4,Math.round(t*f*1.3));for(let e of r){let t=-1,n=0,r=0,i=()=>{if(t<0)return;let[i,a]=h(n,e[0].y+.5),[o]=h(r,e[0].y+.5),s=_[t];b[t].push({color:`#${Me(s[0])}${Me(s[1])}${Me(s[2])}`,width:x,points:o-i>1?[i,a,o,a]:[i,a]})};for(let a of e){let e=a.rgb?y(a.rgb):-1;e!==t&&(i(),t=e,n=a.xs),r=a.xe}i()}let S=new Uint8Array(i*i);for(let e=0;e<i*i;e++){if(!a[e])continue;let t=e%i,n=(e-t)/i;(t===0||n===0||t===i-1||n===i-1||!a[e-1]||!a[e+1]||!a[e-i]||!a[e+i])&&(S[e]=1)}let C=Ne(v(S,i,i),i).filter(e=>e.length>=6).map(e=>({color:`#222222`,width:Math.max(4,Math.round(x*.45)),points:je(e.map(e=>[e%i,Math.floor(e/i)]),1).flatMap(([e,t])=>h(e+.5,t+.5))})),w=[...b.map((e,t)=>({list:e,q:t})).sort((e,t)=>t.list.length-e.list.length).flatMap(e=>e.list),...C];if(w.length<=Be)return w}return[]}var He=class{s;constructor(e){this.s=e>>>0||2654435769}next(){let e=this.s;return e^=e<<13,e>>>=0,e^=e>>>17,e^=e<<5,e>>>=0,this.s=e,e/4294967296}state(){return this.s}},Ue=[`mul`,`add`,`motion`,`behavior`],We=.14,Ge=7,Ke={speed:9,size:.35,damage:12,hits:1,hitInterval:6,visible:!0,lifetime:120,homing:0,wobble:0,meteor:!1,restrainTicks:0,grind:!1,split:0,bounces:0,boomerang:!1,trap:!1,pull:0,lifesteal:0,freezeTicks:0,blast:0,tags:[]},qe=[{id:`invisible`,name:`見えない弾`,cost:11,phase:`behavior`,apply:e=>{e.visible=!1}},{id:`giant`,name:`巨大`,cost:6,phase:`mul`,apply:e=>{e.size*=3,e.speed*=.75}},{id:`multi`,name:`多段ヒット`,cost:7,phase:`add`,apply:e=>{e.hits+=Ge,e.damage*=We,e.hitInterval=3,e.grind=!0}},{id:`restrain`,name:`拘束`,cost:7,phase:`behavior`,apply:e=>{e.restrainTicks+=90}},{id:`tiny`,name:`豆粒（高威力）`,cost:12,phase:`mul`,apply:e=>{e.size*=.35,e.damage*=2.2}},{id:`fast`,name:`高速`,cost:9,phase:`mul`,apply:e=>{e.speed*=2.2}},{id:`homing`,name:`ゆらゆら追尾`,cost:5,phase:`motion`,apply:e=>{e.homing+=2.2,e.wobble+=4}},{id:`meteor`,name:`打ち上げ→落下`,cost:5,phase:`motion`,apply:e=>{e.meteor=!0}},{id:`split`,name:`分裂弾`,cost:4,phase:`add`,apply:e=>{e.split+=1}},{id:`bounce`,name:`はね返り`,cost:2,phase:`motion`,apply:e=>{e.bounces+=3,e.lifetime+=90}},{id:`boomerang`,name:`ブーメラン`,cost:3,phase:`motion`,apply:e=>{e.boomerang=!0,e.lifetime+=60}},{id:`trap`,name:`おき罠`,cost:4,phase:`behavior`,apply:e=>{e.trap=!0,e.lifetime+=240}},{id:`vacuum`,name:`すいこみ`,cost:4,phase:`behavior`,apply:e=>{e.pull+=8}},{id:`drain`,name:`すいとり`,cost:13,phase:`behavior`,apply:e=>{e.lifesteal+=.6}},{id:`freeze`,name:`こおり`,cost:2,phase:`behavior`,apply:e=>{e.freezeTicks+=90}},{id:`blast`,name:`ばくはつ`,cost:15,phase:`behavior`,apply:e=>{e.blast+=2.2}}];function Je(e){let t={...Ke},n=qe.flatMap(t=>e.filter(e=>e===t.id).map(()=>t));for(let e of Ue)for(let r of n)r.phase===e&&r.apply(t);return t.tags=qe.filter(t=>e.includes(t.id)).map(e=>e.id),t}var Ye={walk:1,top:1,accel:.08,dmg:1,cost:1,hits:1,knockGiven:1,knockTaken:1,selfDmg:0,radius:1,rollGuardCut:.7,momentum:0,windupPerReach:1.5,weight:1},Xe={tinyLimb:.12,walkBase:.55,walkPerLeg:1.5,manyFeetSlow:.04,manyFeetSteady:.06,knockBase:.8,knockPerLeg:.7,rollTopBase:1.15,rollTopRound:.35,rollAccelBase:.035,rollAccelSquare:.03,rollGuardCut:.4,momentum:.5,longHandDmg:.5,longHandCost:0,longHandRef:.25,windupPerReach:1.5,multiCostPerHit:.12,tackleDmg:1.5,tackleKnock:1.4,selfDmg:.2,weightBase:.4,weightPerFill:1.5,radiusBase:.75,radiusPerWidth:.5},Ze=e=>e<=1?1-.4*Math.tanh((1-e)/.4):1+.6*Math.tanh((e-1)/.6);function Qe(e){let t=e.size,n=t,r=t,i=0,a=0,o=0;for(let s=0;s<t*t;s++){if(!e.silhouette[s])continue;o++;let c=s%t,l=(s-c)/t;c<n&&(n=c),c>i&&(i=c),l<r&&(r=l),l>a&&(a=l)}if(!o)return{hands:0,feet:0,handMax:0,handEff:0,footMean:0,footEff:0,fill:.5,widthFrac:1,round:1};let s=i-n+1,c=a-r+1,l=Math.max(s,c),u=Xe.tinyLimb*l,d=e.limbs.filter(e=>e.kind===`hand`&&e.length>=u),f=e.limbs.filter(e=>e.kind===`foot`),p=f.filter(e=>e.length>=u),m=e=>e.reduce((e,t)=>e+t,0),h=e=>e.length?m(e.map(e=>e.length))/Math.max(...e.map(e=>e.length)):0,g=Math.round(e.centroid[0]),_=0,v=0;for(let o=r;o<=a;o++)for(let r=n;r<=i;r++){let n=e.silhouette[o*t+r],i=2*g-r,a=i>=0&&i<t?e.silhouette[o*t+i]:0;(n||a)&&v++,n&&a&&_++}let y=c/s;return{hands:d.length,feet:p.length,handMax:d.length?Math.max(...d.map(e=>e.length))/l:0,handEff:h(d),footMean:f.length?m(f.map(e=>e.length))/f.length/l:0,footEff:h(f),fill:o/(l*l),widthFrac:s/l,round:(v?_/v:1)*Math.min(y,1/y)}}function $e(e){let t=Xe,n=e.footEff>0,r=e.hands>0,i=Ze(t.weightBase+t.weightPerFill*e.fill),a=i**-.5,o=Math.max(0,e.footEff-2),s=Ze(t.walkBase+t.walkPerLeg*e.footMean)*Ze(1-t.manyFeetSlow*o)*a,c=Ze(t.knockBase+t.knockPerLeg*e.footMean)/i*Ze(1-t.manyFeetSteady*o),l=Ze(t.rollTopBase+t.rollTopRound*e.round)*a,u=t.rollAccelBase+t.rollAccelSquare*(1-e.round),d=r?Math.max(1,Math.round(Math.sqrt(e.handEff))):1,f=e.handMax-t.longHandRef;return{walk:s,top:l,accel:u,dmg:Ze(r?1-t.longHandDmg*f:t.tackleDmg*Math.sqrt(i)),cost:r?Ze((1+t.multiCostPerHit*(d-1))*(1+t.longHandCost*f)):1,hits:d,knockGiven:r?1/Math.sqrt(d):Ze(t.tackleKnock*i),knockTaken:c,selfDmg:r?0:t.selfDmg,radius:Ze(t.radiusBase+t.radiusPerWidth*e.widthFrac),rollGuardCut:n?.7:t.rollGuardCut,momentum:n?0:t.momentum,windupPerReach:t.windupPerReach,weight:i}}var et=1.8;function tt(e){let t=Qe(e);return{features:t,traits:$e(t),hasHands:t.hands>0,hasFeet:t.footEff>0,reach:Math.max(.35,t.handMax*et)}}function nt(e){let t=e.traits,n=[];return e.hasFeet?t.walk>=1.15?n.push([`🏃`,`足が はやい`]):t.walk<=.87?n.push([`🐢`,`足が おそい`]):n.push([`🚶`,`ふつうの 足`]):n.push([`🛞`,`ころがって うごく`]),e.hasHands?(e.reach>=.7?n.push([`🤜`,`手が ながい`]):e.reach<=.3&&n.push([`✊`,`手が みじかい`]),t.hits>1&&n.push([`👐`,`手が いっぱい（${t.hits}れんだ）`])):n.push([`💥`,`体あたりで こうげき`]),t.knockTaken>=1.15?n.push([`🪶`,`かるくて とばされやすい`]):t.knockTaken<=.87&&n.push([`🪨`,`おもくて どっしり`]),t.radius>=1.15&&n.push([`📦`,`からだが 大きい`]),n}var rt=128;function it(e,t){let n=a(e,rt),r=rt,i=rt,o=-1,c=-1;for(let e=0;e<n.length;e++){if(!n[e])continue;let t=e%rt,a=(e-t)/rt;t<r&&(r=t),t>o&&(o=t),a<i&&(i=a),a>c&&(c=a)}if(o<0)return;let l=512/rt,u=et/Math.max(40,(o-r+1)*l,(c-i+1)*l),d=o-r+1,f=c-i+1,p=Math.max(d,f),m=new Uint8Array(p*p);for(let e=0;e<f;e++)for(let t=0;t<d;t++)m[e*p+t]=n[(e+i)*rt+t+r];let h=s(m,p),g=new Float32Array(d*f);for(let e=0;e<f;e++)for(let t=0;t<d;t++)g[e*d+t]=Math.sqrt(h[e*p+t]);let _=512/t.size,v=t.centroid[0]*_,y=t.limbs.filter(e=>e.kind===`hand`).sort((e,t)=>t.length-e.length),b=(c+1)*l,x=y.length?Math.max(.2,(b-y[0].pivot[1]*_)*u):f*l*u/2;return{cs:l*u,gw:d,gh:f,ox:v/l-r,dist:g,handV:x}}var at=[`body`,`motion`,`hit`,`after`],ot={windup:3,active:6,recover:15,damage:16,hits:1,hitInterval:4,range:1.4,arc:Math.PI/3,knock:9,spinTicks:0,dash:0,grab:!1,slam:!1,wobbleTicks:0,legbindTicks:0,crumpleTicks:0,limbScale:1,rubberScale:1,pull:0,lifesteal:0,freezeTicks:0,counter:!1,bigTicks:0,push:0,tags:[]},st=[{id:`giantHands`,name:`巨大な手`,cost:6,phase:`body`,apply:e=>{e.limbScale*=3,e.range*=2.2,e.windup+=6}},{id:`rubber`,name:`ゴム伸びパンチ`,cost:4,phase:`body`,apply:e=>{e.rubberScale*=4,e.range*=3.5,e.arc*=.3,e.recover+=8}},{id:`tornado`,name:`竜巻スピン`,cost:8,phase:`motion`,apply:e=>{e.spinTicks+=45,e.arc=Math.PI,e.hits=Math.max(e.hits,6),e.hitInterval=6}},{id:`dash`,name:`突進すり抜け`,cost:5,phase:`motion`,apply:e=>{e.dash+=5,e.arc=Math.PI}},{id:`slam`,name:`地面たたき`,cost:5,phase:`motion`,apply:e=>{e.slam=!0,e.windup+=6}},{id:`grab`,name:`つかみ投げ`,cost:7,phase:`hit`,apply:e=>{e.grab=!0,e.knock*=1.8}},{id:`wobble`,name:`グニャグニャ視界`,cost:7,phase:`after`,apply:e=>{e.wobbleTicks+=120}},{id:`legbind`,name:`足封じ`,cost:6,phase:`after`,apply:e=>{e.legbindTicks+=120}},{id:`crumple`,name:`紙くしゃくしゃ`,cost:9,phase:`after`,apply:e=>{e.crumpleTicks+=60}},{id:`magnet`,name:`じしゃくの手`,cost:6,phase:`motion`,apply:e=>{e.pull+=1,e.active+=4}},{id:`vampire`,name:`すいとりパンチ`,cost:14,phase:`after`,apply:e=>{e.lifesteal+=.6}},{id:`ice`,name:`こおりタッチ`,cost:4,phase:`after`,apply:e=>{e.freezeTicks+=120}},{id:`counter`,name:`カウンター`,cost:1,phase:`hit`,apply:e=>{e.counter=!0,e.windup+=22}},{id:`mushroom`,name:`でっかくなる`,cost:1,phase:`after`,apply:e=>{e.bigTicks+=180,e.damage*=.5}},{id:`bulldozer`,name:`ブルドーザー`,cost:6,phase:`motion`,apply:e=>{e.push+=1,e.active+=20,e.knock=0,e.damage*=.6}}];function ct(e){let t={...ot},n=st.flatMap(t=>e.filter(e=>e===t.id).map(()=>t));for(let e of at)for(let r of n)r.phase===e&&r.apply(t);return t.active+=t.spinTicks,t.tags=st.filter(t=>e.includes(t.id)).map(e=>e.id),t}var lt=[`dealt`,`taken`,`speed`,`hp`,`stamina`,`regen`,`special`,`punch`,`windup`,`chargeNeed`,`dodgeCost`,`guardCut`,`guardMove`,`knock`,`guardCharge`,`guardDrain`];function ut(e){let t={};for(let n of e)for(let e of lt)n[e]&&(t[e]=(t[e]??0)+n[e]);return t}function dt(e={}){let t=t=>e[t]??0;return{dealt:Math.max(.05,1+t(`dealt`)),taken:Math.max(.05,1-t(`taken`)),speed:Math.max(.1,1+t(`speed`)),maxHp:Math.max(1,100+t(`hp`)),maxStamina:Math.max(10,100+t(`stamina`)),regen:Math.max(.05,1+t(`regen`)),special:Math.max(.05,1+t(`special`)),punch:Math.max(.05,1+t(`punch`)),windup:Math.max(0,Math.round(t(`windup`))),chargeNeed:Math.max(1,Math.round(5+t(`chargeNeed`))),dodgeCost:Math.max(0,22+t(`dodgeCost`)),guardCut:Math.min(1,Math.max(0,.7+t(`guardCut`))),guardMove:Math.max(0,.5+t(`guardMove`)),knockTaken:Math.max(.05,1+t(`knock`)),guardCharge:Math.max(0,.5+t(`guardCharge`)),guardDrain:Math.max(0,1+t(`guardDrain`))}}var ft=[`attack`,`defense`,`speed`,`hp`,`stamina`],pt={attack:4,defense:4,speed:4,hp:4,stamina:4},mt=1/30,ht=.6,gt=3600,_t=1.6,vt=e=>Math.max(1,Math.round(e*_t)),yt=.75,bt=1.25,xt=.315,St=vt(15),Ct=.3,wt=28,Tt=.85,Et=5.95,Dt=9*.85,Ot=vt(9),kt=vt(4),At=vt(12),jt=2,Mt=4,Nt=.3,Pt=2,Ft=vt(3),It=vt(2),Lt=vt(9),Rt=vt(30),zt=9.35,Bt=vt(8),Vt=vt(5),Ht=9.75,Ut=3,Wt=15,Gt=.75,Kt=3,qt=3,Jt=vt(4),Yt=5,Xt=5,Zt=e=>e.traits??Ye,Qt=e=>ht*Zt(e).radius,$t=.35;function en(e,t,n,r,i){let a=e.cfg.hurt;if(!a)return Math.hypot(t-e.x,r-e.z)<=i+Qt(e.cfg)&&n<=1.8+i&&n>=-i;if(Math.abs(r-e.z)>$t+i)return!1;let o=e.fx>=0?1:-1,s=(t-e.x)*o/a.cs+a.ox,c=a.gh-n/a.cs,l=Math.max(0,Math.min(a.gw-1,Math.floor(s))),u=Math.max(0,Math.min(a.gh-1,Math.floor(c))),d=Math.hypot(s<0?-s:s>a.gw?s-a.gw:0,c<0?-c:c>a.gh?c-a.gh:0);return(a.dist[u*a.gw+l]+d)*a.cs<=i+a.cs*.5+.06}var tn=()=>({phase:`none`,t:0,hitsDone:0,rehit:0,spin:0,dashLeft:0,dirX:1,dirZ:0,grabbed:!1,slamR:0,slamHit:!1,extraRecover:0,mult:1,pulled:!1,pushHit:!1});function nn(e,t={}){let n=t.duration??1;return{...e,damage:e.damage*Math.max(.05,t.power??1),speed:e.speed*Math.max(.05,t.speed??1),restrainTicks:Math.round(e.restrainTicks*n),size:e.size*Math.max(.05,t.size??1),freezeTicks:Math.round(e.freezeTicks*n)}}function rn(e,t={}){let n=t.duration??1;return{...e,damage:e.damage*Math.max(.05,t.power??1),windup:Math.max(1,e.windup-Math.round(t.windup??0)),wobbleTicks:Math.round(e.wobbleTicks*n),legbindTicks:Math.round(e.legbindTicks*n),crumpleTicks:Math.round(e.crumpleTicks*n),range:e.range*(1+((t.size??1)-1)*.6),freezeTicks:Math.round(e.freezeTicks*n),bigTicks:Math.round(e.bigTicks*n)}}function an(e){return{...e,speed:e.speed*yt}}function on(e){return{...e,windup:vt(e.windup),active:vt(e.active),recover:vt(e.recover)}}function sn(e,t){let n=dt(e.boost);return{st:n,maxHp:n.maxHp,maxStamina:n.maxStamina,cfg:e,spec:an(nn(Je(e.special),e.specialMod)),x:t,z:0,vx:0,vz:0,fx:t<0?1:-1,fz:0,hp:n.maxHp,stamina:n.maxStamina,guarding:!1,guardBroken:0,attack:`none`,attackT:0,attackHit:!1,charge:0,specialSeq:0,guardedSeq:0,shootSlow:0,rooted:0,hitFlash:0,moving:!1,kx:0,kz:0,stun:0,guardStun:!1,regenDelay:0,preSpeed:0,swingHits:0,mspec:on(rn(ct(e.melee??[]),e.specialMod)),ms:tn(),wobble:0,dizzy:0,legbind:0,crumple:0,feetNow:e.hasFeet,shoveT:0,shoveCd:0,dodgeT:0,dodgeRec:0,dodgeX:0,dodgeZ:0,ice:0,big:0}}function cn(e,t,n){return{tick:0,rng:new He(n),fighters:[sn(e,-4),sn(t,4)],projectiles:[],nextId:1,winner:-1,hitstop:0,events:[],spawn:[]}}function ln(e,t){return Qt(e)+(t?Qt(t):ht)+(e.hasHands?e.reach:.35)}function un(e){return Math.round(bt*vt(e.hasHands?3+Math.round(e.reach*Zt(e).windupPerReach):5))}function dn(e){return vt(e.hasHands?6+Math.round(e.reach*Zt(e).windupPerReach):9)}function fn(e){return Jt+2*(Zt(e).hits-1)}function pn(e){return wt*Zt(e).cost}function mn(e,t,n){let r=e.fighters[t];if(r.dodgeT>0){e.events.push({kind:`evade`,x:r.x,z:r.z,h:1.5,amount:0,src:n.src,target:t,dx:0,dz:0,size:0});return}if(n.src===`melee`&&r.mspec.counter&&r.ms.phase===`windup`){r.ms.phase=`active`,r.ms.t=0,r.ms.mult*=2,r.ms.dashLeft=r.mspec.dash,e.events.push({kind:`evade`,x:r.x,z:r.z,h:1.5,amount:0,src:`special`,target:t,dx:0,dz:0,size:0,tags:[`counter`]});return}let i=r.guarding&&!n.ignoreGuard,a=!r.feetNow&&Math.hypot(r.vx,r.vz)>Ut*.5,o=e.fighters[1-t],s=n.amount*o.st.dealt*r.st.taken*(o.big>0?1.5:1)*(r.big>0?.8:1);n={...n,amount:s};let c=s*(i?1-(a?Zt(r.cfg).rollGuardCut:r.st.guardCut)*(1-Math.min(1,n.pierce??0)):1);(n.lifesteal??0)>0&&o.hp>0&&(o.hp=Math.min(o.maxHp,o.hp+Math.min(r.hp,c)*n.lifesteal));let l=r.hp>0;r.hp=Math.max(0,r.hp-c);let u=i&&r.hp>0?Math.min(Pt,(n.amount-c)*Nt):0;u>0&&(r.hp=Math.min(r.maxHp,r.hp+u)),r.hitFlash=6;let d=n.knock*Zt(r.cfg).knockTaken*r.st.knockTaken*(i?.3:1);if(r.kx+=n.dx*d,r.kz+=n.dz*d,r.stun=Math.max(r.stun,i?kt:n.stun),r.guardStun=i,!i&&r.attack!==`none`&&(r.attack=`none`,r.attackT=0),!i&&r.ms.phase===`windup`&&(r.ms=tn()),!i){let i=(i,a)=>{a&&(i===`crumple`?(r.crumple=Math.max(r.crumple,a),r.vx=n.dx*8,r.vz=n.dz*8,r.kx=r.kz=0):r[i]=Math.max(r[i],a),e.events.push({kind:`status`,x:r.x,z:r.z,h:2,amount:a,src:`special`,target:t,dx:0,dz:0,size:0,status:i}))};i(`wobble`,n.wobble),i(`legbind`,n.legbind),i(`crumple`,n.crumple),n.freeze&&(r.ice=Math.max(r.ice,n.freeze))}e.hitstop=Math.max(e.hitstop,n.src===`special`||c>=8?Mt:jt);let f=!i&&(n.restrain??0)>0;f&&(r.rooted=Math.max(r.rooted,n.restrain)),e.events.push({kind:i?`guard`:`hit`,x:n.x,z:n.z,h:n.h,amount:c,src:n.src,target:t,dx:n.dx,dz:n.dz,size:n.size,pid:n.pid,tags:n.tags,restrained:f,heal:u});let p=e.fighters[1-t];n.src===`melee`&&n.firstOfSwing&&hn(e,1-t,1),i&&(n.src===`melee`&&n.firstOfSwing?hn(e,t,r.st.guardCharge):n.src===`special`&&r.guardedSeq!==p.specialSeq&&(r.guardedSeq=p.specialSeq,hn(e,t,r.st.guardCharge))),l&&r.hp<=0&&(e.hitstop=8,e.events.push({kind:`ko`,x:r.x,z:r.z,h:1,amount:0,src:n.src,target:t,dx:n.dx,dz:n.dz,size:0}))}function hn(e,t,n){let r=e.fighters[t],i=r.st.chargeNeed;r.charge>=i||n<=0||(r.charge=Math.min(i,r.charge+n),r.charge===i&&e.events.push({kind:`ready`,x:r.x,z:r.z,h:1,amount:0,src:`melee`,target:t,dx:0,dz:0,size:0}))}var gn=[];function _n(e,t,n){let r=e.fighters[t],i=e.fighters[1-t],a=i.x-r.x,o=i.z-r.z,s=Math.hypot(a,o)||1;r.fx=a/s,r.fz=o/s,r.hitFlash>0&&r.hitFlash--,r.guardBroken>0&&r.guardBroken--,r.shootSlow>0&&r.shootSlow--,r.regenDelay>0&&r.regenDelay--,r.wobble>0&&r.wobble--,r.dizzy>0&&r.dizzy--,r.legbind>0&&r.legbind--,r.shoveCd>0&&r.shoveCd--,r.dodgeRec>0&&r.dodgeRec--,r.ice>0&&r.ice--,r.big>0&&r.big--,r.feetNow=r.legbind>0?!r.cfg.hasFeet:r.cfg.hasFeet;let c=r.stun>0;if(c&&r.stun--,r.crumple>0){r.crumple--,r.guarding=!1,r.attack=`none`,r.ms=tn(),r.vx*=.985,r.vz*=.985;let e=Math.hypot(r.x,r.z);if(e>=9-Qt(r.cfg)-.05){let t=r.x/e,n=r.z/e,i=r.vx*t+r.vz*n;i>0&&(r.vx-=2*i*t,r.vz-=2*i*n)}r.moving=!0;return}let l={...n};if(r.wobble>0||r.dizzy>0){let n=Math.sin(e.tick*.15+t*1.7)*.6,i=Math.cos(n),a=Math.sin(n),o=l.mx*i-l.mz*a,s=l.mx*a+l.mz*i;r.wobble>0&&(o=-o,s=-s),l.mx=o,l.mz=s}let u=r.rooted>0||c;if(r.rooted>0&&r.rooted--,r.dodgeT>0){r.dodgeT--;let e=Ht*(.4+.6*(r.dodgeT/Bt));r.vx=r.dodgeX*e,r.vz=r.dodgeZ*e,r.guarding=!1,r.moving=!0,r.dodgeT===0&&(r.dodgeRec=Vt);return}let d=r.attack!==`none`||r.ms.phase!==`none`||r.shoveT>0||r.dodgeRec>0;r.guarding=r.rooted===0&&(!c||r.guardStun)&&l.guard&&r.guardBroken===0&&!d,r.guarding?(r.stamina-=Ct*r.st.guardDrain,r.stamina<=0&&(r.stamina=0,r.guarding=!1,r.guardBroken=30)):r.regenDelay===0&&!d&&(r.stamina=Math.min(r.maxStamina,r.stamina+xt*r.st.regen));let f=l.mx,p=l.mz,m=Math.hypot(f,p);m>1&&(f/=m,p/=m);let h=Ut*r.st.speed*(r.feetNow?Zt(r.cfg).walk:Zt(r.cfg).top)*(r.guarding?r.st.guardMove:1);r.shootSlow>0&&(h*=.3),f*r.fx+p*r.fz<-.3&&(h*=Gt),(u||r.attack===`active`||r.attack===`windup`)&&(h*=u?0:.3);let g=r.ms.phase;g===`windup`?h*=.3:g===`active`?h*=r.mspec.spinTicks>0?.75:0:g===`recover`&&(h=0);let _=f*h,v=p*h;if(r.ice>0)r.vx+=(_-r.vx)*.04,r.vz+=(v-r.vz)*.04;else if(r.feetNow)r.vx=_,r.vz=v;else{let e=Zt(r.cfg).accel;r.vx+=(_-r.vx)*e,r.vz+=(v-r.vz)*e}if(r.moving=Math.hypot(r.vx,r.vz)>.3,r.attack===`none`&&(r.preSpeed=Math.hypot(r.vx,r.vz)),l.attack&&!u&&!d&&r.stamina>=pn(r.cfg)&&(r.attack=`windup`,r.attackT=0,r.attackHit=!1,r.swingHits=0,r.stamina-=pn(r.cfg),r.regenDelay=St),r.attack!==`none`&&(r.attackT++,r.attack===`windup`&&r.attackT>=un(r.cfg)+r.st.windup?(r.attack=`active`,r.attackT=0):r.attack===`active`&&r.attackT>=fn(r.cfg)?(r.attack=`recover`,r.attackT=0):r.attack===`recover`&&r.attackT>=dn(r.cfg)&&(r.attack=`none`,r.attackT=0)),r.attack===`active`){let n=Zt(r.cfg);if(!r.cfg.hasHands){let e=Math.max(6,r.preSpeed);r.vx=r.fx*e,r.vz=r.fz*e}let a=s<=ln(r.cfg,i.cfg);if(a&&i.cfg.hurt){let n=Qt(r.cfg)+(r.cfg.hasHands?r.cfg.reach:.35),o=r.x+r.fx*n,s=r.z+r.fz*n,c=r.cfg.hasHands?r.cfg.hurt?.handV??1:.9,l=r.cfg.hasHands?.45:.7;a=!1;for(let e of[-l,-l/2,0,l/2,l]){for(let t of[0,.25,.5])if(en(i,o-r.fx*t,c+e,s-r.fz*t,.18)){a=!0;break}if(a)break}!a&&!r.attackHit&&r.swingHits===0&&r.attackT===fn(r.cfg)-1&&e.events.push({kind:`evade`,x:i.x,z:i.z,h:1.2,amount:0,src:`melee`,target:1-t,dx:0,dz:0,size:0,gap:!0})}if(r.swingHits<n.hits&&r.attackT>=r.swingHits*2&&a){let a=1+n.momentum*Math.min(1,r.preSpeed/(Ut*n.top)),o=(r.cfg.hasHands?Yt:Xt)*n.dmg*n.hits**.25*a*r.st.punch/n.hits;if(n.selfDmg>0){let i=Math.min(r.hp-1,o*n.selfDmg);i>0&&(r.hp-=i,e.events.push({kind:`recoil`,x:r.x,z:r.z,h:1,amount:i,src:`melee`,target:t,dx:-r.fx,dz:-r.fz,size:0}))}gn.push([1-t,{amount:o,src:`melee`,dx:r.fx,dz:r.fz,knock:(r.cfg.hasHands?Et:Dt)*n.knockGiven*a/n.hits,stun:Ot,x:(r.x+i.x)/2,z:(r.z+i.z)/2,h:1,size:0,firstOfSwing:r.swingHits===0}]),r.swingHits++,r.attackHit=!0}}if(l.dodge&&!u&&!d&&r.stamina>=r.st.dodgeCost){let n=l.mx,i=l.mz,a=Math.hypot(n,i);a<.2?(n=-r.fx,i=-r.fz):(n/=a,i/=a),r.stamina-=r.st.dodgeCost,r.regenDelay=St,r.dodgeT=Bt,r.dodgeX=n,r.dodgeZ=i,r.guarding=!1,e.events.push({kind:`dodge`,x:r.x,z:r.z,h:1,amount:0,src:`melee`,target:t,dx:n,dz:i,size:0});return}if(l.shove&&!u&&!d&&r.shoveCd===0&&(r.shoveT=Ft+It+Lt,r.shoveCd=Rt,r.guarding=!1),r.shoveT>0&&(r.shoveT--,Ft+It+Lt-r.shoveT===Ft+1&&s<=Qt(r.cfg)+Qt(i.cfg)+.4+(r.cfg.hasHands?r.cfg.reach*.5:0)&&i.dodgeT===0)){let n=zt*Zt(i.cfg).knockTaken*i.st.knockTaken;i.kx+=r.fx*n,i.kz+=r.fz*n,i.stun=Math.max(i.stun,6),i.guardStun=!1,i.guarding&&(i.guarding=!1,i.guardBroken=Math.max(i.guardBroken,12)),i.attack!==`none`&&(i.attack=`none`,i.attackT=0),i.ms.phase===`windup`&&(i.ms=tn()),e.hitstop=Math.max(e.hitstop,jt),e.events.push({kind:`shove`,x:(r.x+i.x)/2,z:(r.z+i.z)/2,h:1,amount:0,src:`melee`,target:1-t,dx:r.fx,dz:r.fz,size:0})}let y=l.special&&!u&&!r.guarding&&!d&&r.charge>=r.st.chargeNeed;y&&r.specialSeq++;let b=r.cfg.specialMod??{},x=y&&(b.crit??0)>0&&e.rng.next()<b.crit?2:1,S=Math.max(0,b.carry??0);if(y&&r.cfg.specialType===`melee`)r.charge=Math.min(r.st.chargeNeed,S),r.ms={...tn(),phase:`windup`,dirX:r.fx,dirZ:r.fz,mult:x},e.events.push({kind:`mstart`,x:r.x,z:r.z,h:1,amount:0,src:`special`,target:t,dx:r.fx,dz:r.fz,size:0,tags:r.mspec.tags});else if(y&&e.projectiles.length<128){r.charge=Math.min(r.st.chargeNeed,S),r.shootSlow=Wt;let n=r.spec;e.projectiles.push({id:e.nextId++,owner:t,spec:n,x:r.x+r.fx*.8,z:r.z+r.fz*.8,h:1,dx:r.fx,dz:r.fz,age:0,hitsLeft:n.hits,rehit:0,tx:i.x,tz:i.z,sx:r.x,sz:r.z,mult:x,bouncesLeft:n.bounces}),e.events.push({kind:`shoot`,x:r.x,z:r.z,h:1,amount:0,src:`special`,target:t,dx:r.fx,dz:r.fz,size:n.size,tags:n.tags})}xn(e,t,s)}var vn=.8;function yn(e,t){return Qt(e)+Qt(t)+vn}function bn(e,t,n){let r=e.hasHands?Math.max(.4,e.reach):.5;return Qt(e)+(n?Qt(n):ht)+r*t.range}function xn(e,t,n){let r=e.fighters[t],i=e.fighters[1-t],a=r.ms,o=r.mspec;if(a.phase===`none`)return;a.t++,a.rehit>0&&a.rehit--;let s=(n,i={})=>e.events.push({kind:n,x:r.x,z:r.z,h:1,amount:0,src:`special`,target:t,dx:a.dirX,dz:a.dirZ,size:0,tags:o.tags,...i});if(a.phase===`windup`){if(a.t>=o.windup){if(a.phase=`active`,a.t=0,a.dashLeft=o.dash,s(`mactive`),o.slam&&(a.slamR=.4,s(`slam`)),o.bigTicks>0&&(r.big=Math.max(r.big,o.bigTicks)),o.pull>0&&i.dodgeT===0&&n<=bn(r.cfg,o,i.cfg)*2.5){let e=14*o.pull*Zt(i.cfg).knockTaken;i.kx-=(i.x-r.x)/n*e,i.kz-=(i.z-r.z)/n*e,i.guarding=!1,i.guardBroken=Math.max(i.guardBroken,8),a.pulled=!0}o.grab&&(n<=yn(r.cfg,i.cfg)&&i.crumple===0?(a.grabbed=!0,s(`grab`)):(a.extraRecover=30,s(`whiff`)))}}else if(a.phase===`active`){o.spinTicks>0&&(a.spin+=.55);let s=o.spinTicks>0?[Math.cos(a.spin),Math.sin(a.spin)]:[a.dirX,a.dirZ];if(a.dashLeft>0){let e=Math.min(a.dashLeft,18*mt);r.x+=s[0]*e,r.z+=s[1]*e,a.dashLeft-=e}if(a.grabbed){let e=Qt(r.cfg)+Qt(i.cfg)+.1;i.x=r.x+s[0]*e,i.z=r.z+s[1]*e,i.vx=i.vz=i.kx=i.kz=0,i.stun=Math.max(i.stun,3),i.guardStun=!1}if(a.slamR>0&&(a.slamR+=.28,!a.slamHit&&Math.abs(n-a.slamR)<.5&&(a.slamHit=!0,Sn(e,t,i.x,i.z,r.fx,r.fz,o.damage,o.knock,!1)),a.slamR>4.5&&(a.slamR=0)),o.push>0&&n<=bn(r.cfg,o,i.cfg)+.3&&i.dodgeT===0){let n=7*o.push*mt;r.x+=a.dirX*n,r.z+=a.dirZ*n,i.x+=a.dirX*n,i.z+=a.dirZ*n,i.kx=i.kz=0,i.vx=i.vz=0,i.stun=Math.max(i.stun,2),i.guardStun=i.guarding,!a.pushHit&&Math.hypot(i.x,i.z)>=8.25&&(a.pushHit=!0,Sn(e,t,i.x,i.z,a.dirX,a.dirZ,o.damage,0,!1))}if(!o.grab&&!o.slam&&a.hitsDone<o.hits&&a.rehit===0){let s=bn(r.cfg,o,i.cfg),c=(i.x-r.x)/n,l=(i.z-r.z)/n,u=o.spinTicks>0?1:c*a.dirX+l*a.dirZ;if(n<=s&&Math.acos(Math.max(-1,Math.min(1,u)))<=o.arc){let n=o.hits>1?o.damage*1.3/o.hits:o.damage;o.spinTicks>0?Sn(e,t,i.x,i.z,-c,-l,n,1.5,!1):Sn(e,t,i.x,i.z,c,l,n,o.knock/Math.sqrt(o.hits),!1),a.hitsDone++,a.rehit=o.hitInterval}}a.t>=o.active+(o.dash>0?8:0)&&(a.grabbed&&(a.grabbed=!1,Sn(e,t,i.x,i.z,s[0],s[1],o.damage,o.knock*1.6,!0)),a.phase=`recover`,a.t=0,o.spinTicks>0&&(r.dizzy=Math.max(r.dizzy,Math.round(o.spinTicks*.5))))}else a.phase===`recover`&&a.t>=o.recover+a.extraRecover&&(r.ms=tn())}function Sn(e,t,n,r,i,a,o,s,c){let l=e.fighters[t].mspec;mn(e,1-t,{amount:o*e.fighters[t].st.special*e.fighters[t].ms.mult,src:`special`,dx:i,dz:a,knock:s,stun:At,x:n,z:r,h:1,size:0,tags:l.tags,ignoreGuard:c,wobble:l.wobbleTicks,legbind:l.legbindTicks,crumple:l.crumpleTicks,lifesteal:l.lifesteal,freeze:l.freezeTicks,pierce:e.fighters[t].cfg.specialMod?.pierce??0})}function Cn(e,t){let n=wn(e,t),r=t.spec;if(!n&&r.blast>0){let n=e.fighters[1-t.owner],i=n.x-t.x,a=n.z-t.z,o=Math.hypot(i,a)||1;e.events.push({kind:`land`,x:t.x,z:t.z,h:0,amount:0,src:`special`,target:t.owner,dx:0,dz:0,size:r.blast,tags:r.tags}),o<=r.blast+Qt(n.cfg)&&mn(e,1-t.owner,{amount:r.damage*.7*t.mult*e.fighters[t.owner].st.special,src:`special`,dx:i/o,dz:a/o,knock:8,stun:At,x:n.x,z:n.z,h:1,size:r.blast,pid:t.id,tags:r.tags,lifesteal:r.lifesteal,freeze:r.freezeTicks,pierce:e.fighters[t.owner].cfg.specialMod?.pierce??0})}return n}function wn(e,t){let n=t.spec,r=e.fighters[1-t.owner];if(t.age++,t.rehit>0&&t.rehit--,n.split>0&&t.age===20){let r=Math.atan2(t.dz,t.dx);for(let i of[-.45,0,.45]){if(e.projectiles.length+e.spawn.length>=128)break;let a={...n,split:n.split-1,damage:n.damage*.5};e.spawn.push({...t,id:e.nextId++,spec:a,dx:Math.cos(r+i),dz:Math.sin(r+i),age:0,hitsLeft:a.hits,rehit:0})}return!1}if(n.pull>0&&r.dodgeT===0){let e=t.x-r.x,i=t.z-r.z,a=Math.hypot(e,i);if(a<3.5&&a>.3){let t=n.pull*.075*Zt(r.cfg).knockTaken;r.kx+=e/a*t,r.kz+=i/a*t}}if(n.boomerang&&t.age>=35){let n=e.fighters[t.owner],r=Math.atan2(n.z-t.z,n.x-t.x),i=Math.atan2(t.dz,t.dx),a=r-i;for(;a>Math.PI;)a-=Math.PI*2;for(;a<-Math.PI;)a+=Math.PI*2;let o=Math.max(-5*mt,Math.min(5*mt,a));if(t.dx=Math.cos(i+o),t.dz=Math.sin(i+o),t.age>45&&Math.hypot(n.x-t.x,n.z-t.z)<.9)return!1}let i=Math.hypot(r.x-t.x,r.z-t.z)<=n.size+Qt(r.cfg)&&en(r,t.x,t.h,t.z,n.size),a=n.grind&&i?.15:1;if(n.meteor){let i=Math.max(8,Math.round(216/Math.max(1,n.speed)));if(t.age<=30)t.h=1+t.age/30*7;else if(t.age<=45)t.age===45&&(t.tx=r.x,t.tz=r.z,t.sx=t.x,t.sz=t.z);else{let a=(qt+n.homing*.5)*mt,o=r.x-t.tx,s=r.z-t.tz,c=Math.hypot(o,s);if(c>1e-6){let e=Math.min(1,a/c);t.tx+=o*e,t.tz+=s*e}let l=Math.min(1,(t.age-30-15)/i);if(t.x=t.sx+(t.tx-t.sx)*l,t.z=t.sz+(t.tz-t.sz)*l,t.h=8*(1-l),l>=1&&t.age===45+i&&e.events.push({kind:`land`,x:t.x,z:t.z,h:0,amount:0,src:`special`,target:t.owner,dx:0,dz:0,size:n.size,tags:n.tags}),l>=1&&t.hitsLeft===n.hits)return!1}}if(!n.meteor||t.age>45){if(n.homing>0){let e=Math.atan2(r.z-t.z,r.x-t.x),i=Math.atan2(t.dz,t.dx),a=e-i;for(;a>Math.PI;)a-=Math.PI*2;for(;a<-Math.PI;)a+=Math.PI*2;let o=Math.max(-n.homing*mt,Math.min(n.homing*mt,a));t.dx=Math.cos(i+o),t.dz=Math.sin(i+o)}if(n.trap&&!n.meteor&&t.age>18)t.h=.3;else if(!n.meteor){let e=Math.sin(t.age*.25)*n.wobble*mt;t.x+=(t.dx*n.speed*mt-t.dz*e)*a,t.z+=(t.dz*n.speed*mt+t.dx*e)*a}}if(t.bouncesLeft>0&&!n.meteor){let e=Math.hypot(t.x,t.z),r=9-n.size;if(e>r){let n=t.x/e,i=t.z/e,a=t.dx*n+t.dz*i;a>0&&(t.dx-=2*a*n,t.dz-=2*a*i,t.bouncesLeft--,t.rehit=0),t.x=n*r,t.z=i*r}}if(Math.hypot(r.x-t.x,r.z-t.z)<=n.size+Qt(r.cfg)+.6&&en(r,t.x,t.h,t.z,n.size)&&r.dodgeT===0&&t.age>Kt&&t.h-n.size<=1.8&&t.h+n.size>=0&&t.rehit===0){let i=t.dx,a=t.dz;if(n.meteor){let e=r.x-t.x,n=r.z-t.z,o=Math.hypot(e,n);o>.01&&(i=e/o,a=n/o)}let o=n.restrainTicks>0&&!r.guarding;if(mn(e,1-t.owner,{amount:n.damage*t.mult*e.fighters[t.owner].st.special,src:`special`,dx:i,dz:a,lifesteal:n.lifesteal,freeze:n.freezeTicks,pierce:e.fighters[t.owner].cfg.specialMod?.pierce??0,knock:o||n.grind?.5:4+n.damage*.35+n.size*2,stun:At,x:t.x,z:t.z,h:t.h,size:n.size,pid:t.id,tags:n.tags,restrain:n.restrainTicks}),t.hitsLeft--,t.rehit=n.hitInterval,t.hitsLeft<=0)return!1}return!(t.age>n.lifetime+(n.meteor?45:0)||Math.hypot(t.x,t.z)>13||!Number.isFinite(t.x)||!Number.isFinite(t.z)||!Number.isFinite(t.h))}function Tn(e,t){if(e.events=[],e.winner!==-1)return;if(e.hitstop>0){e.hitstop--;return}e.tick++;let n=e.tick&1,r=1-n;gn=[],_n(e,n,t[n]),_n(e,r,t[r]);for(let[t,n]of gn)mn(e,t,n);for(let t of e.fighters){t.x+=(t.vx+t.kx)*mt,t.z+=(t.vz+t.kz)*mt,t.kx*=Tt,t.kz*=Tt,Math.abs(t.kx)<.05&&(t.kx=0),Math.abs(t.kz)<.05&&(t.kz=0);let e=Math.hypot(t.x,t.z),n=8.4;e>n&&(t.x*=n/e,t.z*=n/e)}let[i,a]=e.fighters,o=a.x-i.x,s=a.z-i.z,c=Math.hypot(o,s),l=Qt(i.cfg)+Qt(a.cfg);if(c>0&&c<l){let e=(l-c)/2;i.x-=o/c*e,i.z-=s/c*e,a.x+=o/c*e,a.z+=s/c*e}e.spawn=[],e.projectiles=e.projectiles.filter(t=>Cn(e,t)),e.spawn.length&&e.projectiles.push(...e.spawn);let[u,d]=[i.hp,a.hp];u<=0||d<=0?e.winner=u<=0&&d<=0?2:+(u<=0):e.tick>=3600&&(e.winner=u===d?2:u>d?0:1)}var En={aggressive:{label:`猛攻`,desc:`ひたすら前に出て殴る`,attack:.8,backoff:.4,backoffTicks:[8,18],guard:.25,react:.6,dodge:.3,shove:.5,keep:2.5,strafeFlip:.1,feint:0},cautious:{label:`慎重`,desc:`守りを固めて反撃を狙う`,attack:.6,backoff:.8,backoffTicks:[15,25],guard:.5,react:.85,dodge:.45,shove:.3,keep:3,strafeFlip:.08,feint:0},sniper:{label:`狙撃`,desc:`殴ったら離れ、溜まった必殺を遠くから撃つ`,attack:.8,backoff:.8,backoffTicks:[12,18],guard:.4,react:.85,dodge:.4,shove:.3,keep:4.5,strafeFlip:.12,feint:0},tricky:{label:`トリッキー`,desc:`横に揺さぶり、突き飛ばしと回避を多用する`,attack:.75,backoff:.5,backoffTicks:[8,20],guard:.35,react:.75,dodge:.55,shove:.8,keep:3,strafeFlip:.25,feint:.025}},Dn={wait:[2,4],defend:1};function On(e=Dn){return{level:e,hold:{mx:0,mz:0,attack:!1,guard:!1,special:!1},wait:0,strafe:1,backoff:0}}function kn(e,t,n){let r=e.rng,i={...n.hold,attack:!1,special:!1,shove:!1,dodge:!1};if(n.backoff>0&&n.backoff--,n.wait>0)return n.wait--,i;let a=e.fighters[t];n.wait=n.level.wait[0]+Math.floor(r.next()*n.level.wait[1])+(a.wobble>0||a.dizzy>0?2+Math.floor(r.next()*3):0);let o=e.fighters[1-t],s=En[a.cfg.personality??`aggressive`],c=n.level.defend,l=c===1?s:{...s,guard:Math.min(1,s.guard*c),react:Math.min(1,s.react*c),dodge:Math.min(1,s.dodge*c)},u=o.x-a.x,d=o.z-a.z,f=Math.hypot(u,d)||1,p=u/f,m=d/f,h=ln(a.cfg,o.cfg),g=e.projectiles.find(e=>{if(e.owner===t||!e.spec.visible)return!1;let n=a.x-e.x,r=a.z-e.z,i=Math.hypot(n,r);return e.spec.meteor?e.age>=40&&Math.hypot(a.x-e.tx,a.z-e.tz)<e.spec.size+1.5:i<4+e.spec.size&&n*e.dx+r*e.dz>0}),_=o.attack===`windup`&&f<ln(o.cfg,a.cfg)+.6,v=a.charge>=a.st.chargeNeed,y=a.cfg.specialType===`melee`,b=bn(a.cfg,a.mspec,o.cfg),x=o.cfg.specialType===`melee`&&(o.ms.phase===`windup`||o.charge>=o.st.chargeNeed&&f<bn(o.cfg,o.mspec,a.cfg)+.5),S=0,C=0,w=!1,T=!1,E=!1,D=!1,O=!1,k=a.stamina>=a.st.dodgeCost+10;if(k&&r.next()<l.feint)S=-m*n.strafe,C=p*n.strafe,O=!0;else if(g&&r.next()<l.react){if(k&&r.next()<l.dodge){let e=(a.x-g.x)*-g.dz+(a.z-g.z)*g.dx>=0?1:-1;S=-g.dz*e,C=g.dx*e,O=!0}else if(g.spec.meteor){let e=a.x-g.tx,t=a.z-g.tz,n=Math.hypot(e,t)||1;S=e/n,C=t/n}else if(r.next()<.6){let e=(a.x-g.x)*-g.dz+(a.z-g.z)*g.dx>=0?1:-1;S=-g.dz*e,C=g.dx*e}else w=a.stamina>10}else if(_&&r.next()<l.guard)w=a.stamina>10;else if(x&&r.next()<Math.min(1,.4*c))o.ms.phase===`windup`&&k&&r.next()<.5?O=!0:r.next()<.5?w=a.stamina>10:(S=-p,C=-m);else if(o.guarding&&f<h+.3&&a.shoveCd===0&&r.next()<l.shove)D=!0;else if(v&&y){let e=a.mspec.grab&&a.mspec.dash===0;f<=(e?yn(a.cfg,o.cfg)-.25:a.mspec.dash>0?b+3:a.mspec.slam?4:b)&&r.next()<(e&&o.guarding?.95:.7)?E=!0:(S=p,C=m)}else if(v&&f<l.keep-.5&&l.keep>3)S=-p,C=-m;else if(v&&(f>2.5?r.next()<.6:r.next()<.2))E=!0;else if(n.backoff>0){r.next()<l.strafeFlip*1.5&&(n.strafe=-n.strafe);let e=f<h+1.5+(l.keep>3?1.5:0)?-.8:.1;S=p*e-m*.7*n.strafe,C=m*e+p*.7*n.strafe}else if(f>h*.9){let e=o.vx*p+o.vz*m>.5?.6:0,t=o.x+o.vx*e-a.x,n=o.z+o.vz*e-a.z,r=Math.hypot(t,n)||1;S=t/r,C=n/r;let i=a.vx*p+a.vz*m;!a.cfg.hasFeet&&f<h+1.5&&i>3&&(S=-S*.5,C=-C*.5)}else{a.stamina>=pn(a.cfg)&&r.next()<l.attack?(T=!0,r.next()<l.backoff&&(n.backoff=l.backoffTicks[0]+Math.floor(r.next()*l.backoffTicks[1]))):a.stamina<pn(a.cfg)&&(n.backoff=20+Math.floor(r.next()*20)),r.next()<l.strafeFlip&&(n.strafe=-n.strafe),S=-m*.5*n.strafe,C=p*.5*n.strafe;let e=ln(o.cfg,a.cfg);h>e+.3&&f<e+.2&&(S-=p*.8,C-=m*.8)}return n.hold={mx:S,mz:C,attack:!1,guard:w,special:!1},{mx:S,mz:C,attack:T,guard:w,special:E,shove:D,dodge:O}}var An=1e3,jn=1001,Mn=1002,Nn=1003,Pn=1004,Fn=1005,In=1006,Ln=1007,Rn=1008,zn=1009,Bn=1010,Vn=1011,Hn=1012,Un=1013,Wn=1014,Gn=1015,Kn=1016,qn=1017,Jn=1018,Yn=1020,Xn=35902,Zn=35899,Qn=1021,$n=1022,er=1023,tr=1026,nr=1027,rr=1028,ir=1029,ar=1030,or=1031,sr=1033,cr=33776,lr=33777,ur=33778,dr=33779,fr=35840,pr=35841,mr=35842,hr=35843,gr=36196,_r=37492,vr=37496,yr=37808,br=37809,xr=37810,Sr=37811,Cr=37812,wr=37813,Tr=37814,Er=37815,Dr=37816,Or=37817,kr=37818,Ar=37819,jr=37820,Mr=37821,Nr=36492,Pr=36494,Fr=36495,Ir=36283,Lr=36284,Rr=36285,zr=36286,Br=2300,Vr=2301,Hr=2302,Ur=2400,Wr=2401,Gr=2402,Kr=3200,qr=3201,Jr=`srgb`,Yr=`srgb-linear`,Xr=`linear`,Zr=`srgb`,Qr=7680,$r=35044,ei=2e3,ti=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},ni=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),ri=1234567,ii=Math.PI/180,ai=180/Math.PI;function oi(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(ni[e&255]+ni[e>>8&255]+ni[e>>16&255]+ni[e>>24&255]+`-`+ni[t&255]+ni[t>>8&255]+`-`+ni[t>>16&15|64]+ni[t>>24&255]+`-`+ni[n&63|128]+ni[n>>8&255]+`-`+ni[n>>16&255]+ni[n>>24&255]+ni[r&255]+ni[r>>8&255]+ni[r>>16&255]+ni[r>>24&255]).toLowerCase()}function V(e,t,n){return Math.max(t,Math.min(n,e))}function si(e,t){return(e%t+t)%t}function ci(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function li(e,t,n){return e===t?0:(n-e)/(t-e)}function ui(e,t,n){return(1-n)*e+n*t}function di(e,t,n,r){return ui(e,t,1-Math.exp(-n*r))}function fi(e,t=1){return t-Math.abs(si(e,t*2)-t)}function pi(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function mi(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function hi(e,t){return e+Math.floor(Math.random()*(t-e+1))}function gi(e,t){return e+Math.random()*(t-e)}function _i(e){return e*(.5-Math.random())}function vi(e){e!==void 0&&(ri=e);let t=ri+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function yi(e){return e*ii}function bi(e){return e*ai}function xi(e){return!(e&e-1)&&e!==0}function Si(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function Ci(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function wi(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:console.warn(`THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function Ti(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function Ei(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var Di={DEG2RAD:ii,RAD2DEG:ai,generateUUID:oi,clamp:V,euclideanModulo:si,mapLinear:ci,inverseLerp:li,lerp:ui,damp:di,pingpong:fi,smoothstep:pi,smootherstep:mi,randInt:hi,randFloat:gi,randFloatSpread:_i,seededRandom:vi,degToRad:yi,radToDeg:bi,isPowerOfTwo:xi,ceilPowerOfTwo:Si,floorPowerOfTwo:Ci,setQuaternionFromProperEuler:wi,normalize:Ei,denormalize:Ti},H=class e{constructor(t=0,n=0){e.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=V(this.x,e.x,t.x),this.y=V(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=V(this.x,e,t),this.y=V(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(V(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(V(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Oi=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(o===0)e[t+0]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u;else if(o===1)e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=m;else{if(u!==m||s!==d||c!==f||l!==p){let e=1-o,t=s*d+c*f+l*p+u*m,n=t>=0?1:-1,r=1-t*t;if(r>2**-52){let i=Math.sqrt(r),a=Math.atan2(i,t*n);e=Math.sin(e*a)/i,o=Math.sin(o*a)/i}let i=o*n;if(s=s*e+d*i,c=c*e+f*i,l=l*e+p*i,u=u*e+m*i,e===1-o){let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:console.warn(`THREE.Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(V(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,i=this._z,a=this._w,o=a*e._w+n*e._x+r*e._y+i*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=i,this;let s=1-o*o;if(s<=2**-52){let e=1-t;return this._w=e*a+t*this._w,this._x=e*n+t*this._x,this._y=e*r+t*this._y,this._z=e*i+t*this._z,this.normalize(),this}let c=Math.sqrt(s),l=Math.atan2(c,o),u=Math.sin((1-t)*l)/c,d=Math.sin(t*l)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=r*u+this._y*d,this._z=i*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class e{constructor(t=0,n=0,r=0){e.prototype.isVector3=!0,this.x=t,this.y=n,this.z=r}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ai.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ai.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=V(this.x,e.x,t.x),this.y=V(this.y,e.y,t.y),this.z=V(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=V(this.x,e,t),this.y=V(this.y,e,t),this.z=V(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(V(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ki.copy(this).projectOnVector(e),this.sub(ki)}reflect(e){return this.sub(ki.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(V(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ki=new U,Ai=new Oi,W=class e{constructor(t,n,r,i,a,o,s,c,l){e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(ji.makeScale(e,t)),this}rotate(e){return this.premultiply(ji.makeRotation(-e)),this}translate(e,t){return this.premultiply(ji.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},ji=new W;function Mi(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Ni(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Pi(){let e=Ni(`canvas`);return e.style.display=`block`,e}var Fi={};function Ii(e){e in Fi||(Fi[e]=!0,console.warn(e))}function Li(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Ri=new W().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),zi=new W().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Bi(){let e={enabled:!0,workingColorSpace:Yr,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=Hi(e.r),e.g=Hi(e.g),e.b=Hi(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Ui(e.r),e.g=Ui(e.g),e.b=Ui(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Xr:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return Ii(`THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return Ii(`THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Yr]:{primaries:t,whitePoint:r,transfer:Xr,toXYZ:Ri,fromXYZ:zi,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Jr},outputColorSpaceConfig:{drawingBufferColorSpace:Jr}},[Jr]:{primaries:t,whitePoint:r,transfer:Zr,toXYZ:Ri,fromXYZ:zi,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Jr}}}),e}var Vi=Bi();function Hi(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Ui(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Wi,Gi=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Wi===void 0&&(Wi=Ni(`canvas`)),Wi.width=e.width,Wi.height=e.height;let t=Wi.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Wi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Ni(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Hi(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Hi(t[e]/255)*255):t[e]=Hi(t[e]);return{data:t,width:e.width,height:e.height}}return console.warn(`THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Ki=0,qi=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Ki++}),this.uuid=oi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Ji(r[t].image)):e.push(Ji(r[t]))}else e=Ji(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Ji(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Gi.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn(`THREE.Texture: Unable to serialize Texture.`),{})}var Yi=0,Xi=new U,Zi=class e extends ti{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=jn,i=jn,a=In,o=Rn,s=er,c=zn,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Yi++}),this.uuid=oi(),this.name=``,this.source=new qi(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new H(0,0),this.repeat=new H(1,1),this.center=new H(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new W,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Xi).x}get height(){return this.source.getSize(Xi).y}get depth(){return this.source.getSize(Xi).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case An:e.x-=Math.floor(e.x);break;case jn:e.x=e.x<0?0:1;break;case Mn:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case An:e.y-=Math.floor(e.y);break;case jn:e.y=e.y<0?0:1;break;case Mn:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Zi.DEFAULT_IMAGE=null,Zi.DEFAULT_MAPPING=300,Zi.DEFAULT_ANISOTROPY=1;var Qi=class e{constructor(t=0,n=0,r=0,i=1){e.prototype.isVector4=!0,this.x=t,this.y=n,this.z=r,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=V(this.x,e.x,t.x),this.y=V(this.y,e.y,t.y),this.z=V(this.z,e.z,t.z),this.w=V(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=V(this.x,e,t),this.y=V(this.y,e,t),this.z=V(this.z,e,t),this.w=V(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(V(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},$i=class extends ti{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:In,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Qi(0,0,e,t),this.scissorTest=!1,this.viewport=new Qi(0,0,e,t);let r=new Zi({width:e,height:t,depth:n.depth});this.textures=[];let i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:In,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new qi(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:`dispose`})}},ea=class extends $i{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},ta=class extends Zi{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Nn,this.minFilter=Nn,this.wrapR=jn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},na=class extends Zi{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Nn,this.minFilter=Nn,this.wrapR=jn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},ra=class{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(aa.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(aa.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=aa.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,aa):aa.fromBufferAttribute(r,t),aa.applyMatrix4(e.matrixWorld),this.expandByPoint(aa);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),oa.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),oa.copy(e.boundingBox)),oa.applyMatrix4(e.matrixWorld),this.union(oa)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,aa),aa.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(pa),ma.subVectors(this.max,pa),sa.subVectors(e.a,pa),ca.subVectors(e.b,pa),la.subVectors(e.c,pa),ua.subVectors(ca,sa),da.subVectors(la,ca),fa.subVectors(sa,la);let t=[0,-ua.z,ua.y,0,-da.z,da.y,0,-fa.z,fa.y,ua.z,0,-ua.x,da.z,0,-da.x,fa.z,0,-fa.x,-ua.y,ua.x,0,-da.y,da.x,0,-fa.y,fa.x,0];return!_a(t,sa,ca,la,ma)||(t=[1,0,0,0,1,0,0,0,1],!_a(t,sa,ca,la,ma))?!1:(ha.crossVectors(ua,da),t=[ha.x,ha.y,ha.z],_a(t,sa,ca,la,ma))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,aa).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(aa).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(ia[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ia[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ia[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ia[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ia[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ia[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ia[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ia[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ia)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},ia=[new U,new U,new U,new U,new U,new U,new U,new U],aa=new U,oa=new ra,sa=new U,ca=new U,la=new U,ua=new U,da=new U,fa=new U,pa=new U,ma=new U,ha=new U,ga=new U;function _a(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){ga.fromArray(e,a);let o=i.x*Math.abs(ga.x)+i.y*Math.abs(ga.y)+i.z*Math.abs(ga.z),s=t.dot(ga),c=n.dot(ga),l=r.dot(ga);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var va=new ra,ya=new U,ba=new U,xa=class{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?va.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ya.subVectors(e,this.center);let t=ya.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(ya,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ba.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ya.copy(e.center).add(ba)),this.expandByPoint(ya.copy(e.center).sub(ba))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Sa=new U,Ca=new U,wa=new U,Ta=new U,Ea=new U,Da=new U,Oa=new U,ka=class{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Sa)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Sa.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Sa.copy(this.origin).addScaledVector(this.direction,t),Sa.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Ca.copy(e).add(t).multiplyScalar(.5),wa.copy(t).sub(e).normalize(),Ta.copy(this.origin).sub(Ca);let i=e.distanceTo(t)*.5,a=-this.direction.dot(wa),o=Ta.dot(this.direction),s=-Ta.dot(wa),c=Ta.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Ca).addScaledVector(wa,d),f}intersectSphere(e,t){Sa.subVectors(e.center,this.origin);let n=Sa.dot(this.direction),r=Sa.dot(Sa)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Sa)!==null}intersectTriangle(e,t,n,r,i){Ea.subVectors(t,e),Da.subVectors(n,e),Oa.crossVectors(Ea,Da);let a=this.direction.dot(Oa),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ta.subVectors(this.origin,e);let s=o*this.direction.dot(Da.crossVectors(Ta,Da));if(s<0)return null;let c=o*this.direction.dot(Ea.cross(Ta));if(c<0||s+c>a)return null;let l=-o*Ta.dot(Oa);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Aa=class e{constructor(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g){e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/ja.setFromMatrixColumn(e,0).length(),i=1/ja.setFromMatrixColumn(e,1).length(),a=1/ja.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Na,e,Pa)}lookAt(e,t,n){let r=this.elements;return La.subVectors(e,t),La.lengthSq()===0&&(La.z=1),La.normalize(),Fa.crossVectors(n,La),Fa.lengthSq()===0&&(Math.abs(n.z)===1?La.x+=1e-4:La.z+=1e-4,La.normalize(),Fa.crossVectors(n,La)),Fa.normalize(),Ia.crossVectors(La,Fa),r[0]=Fa.x,r[4]=Ia.x,r[8]=La.x,r[1]=Fa.y,r[5]=Ia.y,r[9]=La.y,r[2]=Fa.z,r[6]=Ia.z,r[10]=La.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],N=r[3],P=r[7],F=r[11],ee=r[15];return i[0]=a*x+o*T+s*k+c*N,i[4]=a*S+o*E+s*A+c*P,i[8]=a*C+o*D+s*j+c*F,i[12]=a*w+o*O+s*M+c*ee,i[1]=l*x+u*T+d*k+f*N,i[5]=l*S+u*E+d*A+f*P,i[9]=l*C+u*D+d*j+f*F,i[13]=l*w+u*O+d*M+f*ee,i[2]=p*x+m*T+h*k+g*N,i[6]=p*S+m*E+h*A+g*P,i[10]=p*C+m*D+h*j+g*F,i[14]=p*w+m*O+h*M+g*ee,i[3]=_*x+v*T+y*k+b*N,i[7]=_*S+v*E+y*A+b*P,i[11]=_*C+v*D+y*j+b*F,i[15]=_*w+v*O+y*M+b*ee,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15];return p*(+i*s*u-r*c*u-i*o*d+n*c*d+r*o*f-n*s*f)+m*(+t*s*f-t*c*d+i*a*d-r*a*f+r*c*l-i*s*l)+h*(+t*c*u-t*o*f-i*a*u+n*a*f+i*o*l-n*c*l)+g*(-r*o*l-t*s*u+t*o*d+r*a*u-n*a*d+n*s*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=u*h*c-m*d*c+m*s*f-o*h*f-u*s*g+o*d*g,v=p*d*c-l*h*c-p*s*f+a*h*f+l*s*g-a*d*g,y=l*m*c-p*u*c+p*o*f-a*m*f-l*o*g+a*u*g,b=p*u*s-l*m*s-p*o*d+a*m*d+l*o*h-a*u*h,x=t*_+n*v+r*y+i*b;if(x===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/x;return e[0]=_*S,e[1]=(m*d*i-u*h*i-m*r*f+n*h*f+u*r*g-n*d*g)*S,e[2]=(o*h*i-m*s*i+m*r*c-n*h*c-o*r*g+n*s*g)*S,e[3]=(u*s*i-o*d*i-u*r*c+n*d*c+o*r*f-n*s*f)*S,e[4]=v*S,e[5]=(l*h*i-p*d*i+p*r*f-t*h*f-l*r*g+t*d*g)*S,e[6]=(p*s*i-a*h*i-p*r*c+t*h*c+a*r*g-t*s*g)*S,e[7]=(a*d*i-l*s*i+l*r*c-t*d*c-a*r*f+t*s*f)*S,e[8]=y*S,e[9]=(p*u*i-l*m*i-p*n*f+t*m*f+l*n*g-t*u*g)*S,e[10]=(a*m*i-p*o*i+p*n*c-t*m*c-a*n*g+t*o*g)*S,e[11]=(l*o*i-a*u*i-l*n*c+t*u*c+a*n*f-t*o*f)*S,e[12]=b*S,e[13]=(l*m*r-p*u*r+p*n*d-t*m*d-l*n*h+t*u*h)*S,e[14]=(p*o*r-a*m*r-p*n*s+t*m*s+a*n*h-t*o*h)*S,e[15]=(a*u*r-l*o*r+l*n*s-t*u*s-a*n*d+t*o*d)*S,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,i=ja.set(r[0],r[1],r[2]).length(),a=ja.set(r[4],r[5],r[6]).length(),o=ja.set(r[8],r[9],r[10]).length();this.determinant()<0&&(i=-i),e.x=r[12],e.y=r[13],e.z=r[14],Ma.copy(this);let s=1/i,c=1/a,l=1/o;return Ma.elements[0]*=s,Ma.elements[1]*=s,Ma.elements[2]*=s,Ma.elements[4]*=c,Ma.elements[5]*=c,Ma.elements[6]*=c,Ma.elements[8]*=l,Ma.elements[9]*=l,Ma.elements[10]*=l,t.setFromRotationMatrix(Ma),n.x=i,n.y=a,n.z=o,this}makePerspective(e,t,n,r,i,a,o=ei,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=ei,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},ja=new U,Ma=new Aa,Na=new U(0,0,0),Pa=new U(1,1,1),Fa=new U,Ia=new U,La=new U,Ra=new Aa,za=new Oi,Ba=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(V(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-V(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(V(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-V(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(V(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-V(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:console.warn(`THREE.Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ra.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ra,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return za.setFromEuler(this),this.setFromQuaternion(za,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ba.DEFAULT_ORDER=`XYZ`;var Va=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},Ha=0,Ua=new U,Wa=new Oi,Ga=new Aa,Ka=new U,qa=new U,Ja=new U,Ya=new Oi,Xa=new U(1,0,0),Za=new U(0,1,0),Qa=new U(0,0,1),$a={type:`added`},eo={type:`removed`},to={type:`childadded`,child:null},no={type:`childremoved`,child:null},ro=class e extends ti{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ha++}),this.uuid=oi(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new U,n=new Ba,r=new Oi,i=new U(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Aa},normalMatrix:{value:new W}}),this.matrix=new Aa,this.matrixWorld=new Aa,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Va,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Wa.setFromAxisAngle(e,t),this.quaternion.multiply(Wa),this}rotateOnWorldAxis(e,t){return Wa.setFromAxisAngle(e,t),this.quaternion.premultiply(Wa),this}rotateX(e){return this.rotateOnAxis(Xa,e)}rotateY(e){return this.rotateOnAxis(Za,e)}rotateZ(e){return this.rotateOnAxis(Qa,e)}translateOnAxis(e,t){return Ua.copy(e).applyQuaternion(this.quaternion),this.position.add(Ua.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Xa,e)}translateY(e){return this.translateOnAxis(Za,e)}translateZ(e){return this.translateOnAxis(Qa,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ga.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ka.copy(e):Ka.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),qa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ga.lookAt(qa,Ka,this.up):Ga.lookAt(Ka,qa,this.up),this.quaternion.setFromRotationMatrix(Ga),r&&(Ga.extractRotation(r.matrixWorld),Wa.setFromRotationMatrix(Ga),this.quaternion.premultiply(Wa.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(console.error(`THREE.Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent($a),to.child=e,this.dispatchEvent(to),to.child=null):console.error(`THREE.Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(eo),no.child=e,this.dispatchEvent(no),no.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ga.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ga.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ga),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent($a),to.child=e,this.dispatchEvent(to),to.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qa,e,Ja),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qa,Ya,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};ro.DEFAULT_UP=new U(0,1,0),ro.DEFAULT_MATRIX_AUTO_UPDATE=!0,ro.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var io=new U,ao=new U,oo=new U,so=new U,co=new U,lo=new U,uo=new U,fo=new U,po=new U,mo=new U,ho=new Qi,go=new Qi,_o=new Qi,vo=class e{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),io.subVectors(e,t),r.cross(io);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){io.subVectors(r,t),ao.subVectors(n,t),oo.subVectors(e,t);let a=io.dot(io),o=io.dot(ao),s=io.dot(oo),c=ao.dot(ao),l=ao.dot(oo),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,so)!==null&&so.x>=0&&so.y>=0&&so.x+so.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,so)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,so.x),s.addScaledVector(a,so.y),s.addScaledVector(o,so.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return ho.setScalar(0),go.setScalar(0),_o.setScalar(0),ho.fromBufferAttribute(e,t),go.fromBufferAttribute(e,n),_o.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(ho,i.x),a.addScaledVector(go,i.y),a.addScaledVector(_o,i.z),a}static isFrontFacing(e,t,n,r){return io.subVectors(n,t),ao.subVectors(e,t),io.cross(ao).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return io.subVectors(this.c,this.b),ao.subVectors(this.a,this.b),io.cross(ao).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;co.subVectors(r,n),lo.subVectors(i,n),fo.subVectors(e,n);let s=co.dot(fo),c=lo.dot(fo);if(s<=0&&c<=0)return t.copy(n);po.subVectors(e,r);let l=co.dot(po),u=lo.dot(po);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(co,a);mo.subVectors(e,i);let f=co.dot(mo),p=lo.dot(mo);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(lo,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return uo.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(uo,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(co,a).addScaledVector(lo,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},yo={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},bo={h:0,s:0,l:0},xo={h:0,s:0,l:0};function So(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var G=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Jr){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Vi.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Vi.workingColorSpace){return this.r=e,this.g=t,this.b=n,Vi.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Vi.workingColorSpace){if(e=si(e,1),t=V(t,0,1),n=V(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=So(i,r,e+1/3),this.g=So(i,r,e),this.b=So(i,r,e-1/3)}return Vi.colorSpaceToWorking(this,r),this}setStyle(e,t=Jr){function n(t){t!==void 0&&parseFloat(t)<1&&console.warn(`THREE.Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:console.warn(`THREE.Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);console.warn(`THREE.Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Jr){let n=yo[e.toLowerCase()];return n===void 0?console.warn(`THREE.Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Hi(e.r),this.g=Hi(e.g),this.b=Hi(e.b),this}copyLinearToSRGB(e){return this.r=Ui(e.r),this.g=Ui(e.g),this.b=Ui(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Jr){return Vi.workingToColorSpace(Co.copy(this),e),Math.round(V(Co.r*255,0,255))*65536+Math.round(V(Co.g*255,0,255))*256+Math.round(V(Co.b*255,0,255))}getHexString(e=Jr){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Vi.workingColorSpace){Vi.workingToColorSpace(Co.copy(this),t);let n=Co.r,r=Co.g,i=Co.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Vi.workingColorSpace){return Vi.workingToColorSpace(Co.copy(this),t),e.r=Co.r,e.g=Co.g,e.b=Co.b,e}getStyle(e=Jr){Vi.workingToColorSpace(Co.copy(this),e);let t=Co.r,n=Co.g,r=Co.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(bo),this.setHSL(bo.h+e,bo.s+t,bo.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(bo),e.getHSL(xo);let n=ui(bo.h,xo.h,t),r=ui(bo.s,xo.s,t),i=ui(bo.l,xo.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Co=new G;G.NAMES=yo;var wo=0,To=class extends ti{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:wo++}),this.uuid=oi(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new G(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Qr,this.stencilZFail=Qr,this.stencilZPass=Qr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Eo=class extends To{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new G(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ba,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Do=new U,Oo=new H,ko=0,Ao=class{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ko++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=$r,this.updateRanges=[],this.gpuType=Gn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Oo.fromBufferAttribute(this,t),Oo.applyMatrix3(e),this.setXY(t,Oo.x,Oo.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Do.fromBufferAttribute(this,t),Do.applyMatrix3(e),this.setXYZ(t,Do.x,Do.y,Do.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Do.fromBufferAttribute(this,t),Do.applyMatrix4(e),this.setXYZ(t,Do.x,Do.y,Do.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Do.fromBufferAttribute(this,t),Do.applyNormalMatrix(e),this.setXYZ(t,Do.x,Do.y,Do.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Do.fromBufferAttribute(this,t),Do.transformDirection(e),this.setXYZ(t,Do.x,Do.y,Do.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ti(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ei(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ti(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ei(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ti(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ei(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ti(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ei(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ti(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ei(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ei(t,this.array),n=Ei(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Ei(t,this.array),n=Ei(n,this.array),r=Ei(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=Ei(t,this.array),n=Ei(n,this.array),r=Ei(r,this.array),i=Ei(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}},jo=class extends Ao{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Mo=class extends Ao{constructor(e,t,n){super(new Uint32Array(e),t,n)}},No=class extends Ao{constructor(e,t,n){super(new Float32Array(e),t,n)}},Po=0,Fo=new Aa,Io=new ro,Lo=new U,Ro=new ra,zo=new ra,Bo=new U,Vo=class e extends ti{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Po++}),this.uuid=oi(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Mi(e)?Mo:jo)(e,1):e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new W().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Fo.makeRotationFromQuaternion(e),this.applyMatrix4(Fo),this}rotateX(e){return Fo.makeRotationX(e),this.applyMatrix4(Fo),this}rotateY(e){return Fo.makeRotationY(e),this.applyMatrix4(Fo),this}rotateZ(e){return Fo.makeRotationZ(e),this.applyMatrix4(Fo),this}translate(e,t,n){return Fo.makeTranslation(e,t,n),this.applyMatrix4(Fo),this}scale(e,t,n){return Fo.makeScale(e,t,n),this.applyMatrix4(Fo),this}lookAt(e){return Io.lookAt(e),Io.updateMatrix(),this.applyMatrix4(Io.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Lo).negate(),this.translate(Lo.x,Lo.y,Lo.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new No(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&console.warn(`THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ra);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)console.error(`THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Ro.setFromBufferAttribute(n),this.morphTargetsRelative?(Bo.addVectors(this.boundingBox.min,Ro.min),this.boundingBox.expandByPoint(Bo),Bo.addVectors(this.boundingBox.max,Ro.max),this.boundingBox.expandByPoint(Bo)):(this.boundingBox.expandByPoint(Ro.min),this.boundingBox.expandByPoint(Ro.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error(`THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new xa);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)console.error(`THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new U,1/0);else if(e){let n=this.boundingSphere.center;if(Ro.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];zo.setFromBufferAttribute(n),this.morphTargetsRelative?(Bo.addVectors(Ro.min,zo.min),Ro.expandByPoint(Bo),Bo.addVectors(Ro.max,zo.max),Ro.expandByPoint(Bo)):(Ro.expandByPoint(zo.min),Ro.expandByPoint(zo.max))}Ro.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Bo.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Bo));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Bo.fromBufferAttribute(a,t),o&&(Lo.fromBufferAttribute(e,t),Bo.add(Lo)),r=Math.max(r,n.distanceToSquared(Bo))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error(`THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new Ao(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new U,s[e]=new U;let c=new U,l=new U,u=new U,d=new H,f=new H,p=new H,m=new U,h=new U;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new U,y=new U,b=new U,x=new U;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new Ao(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new U,i=new U,a=new U,o=new U,s=new U,c=new U,l=new U,u=new U;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Bo.fromBufferAttribute(e,t),Bo.normalize(),e.setXYZ(t,Bo.x,Bo.y,Bo.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Ao(a,r,i)}if(this.index===null)return console.warn(`THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},Ho=new Aa,Uo=new ka,Wo=new xa,Go=new U,Ko=new U,qo=new U,Jo=new U,Yo=new U,Xo=new U,Zo=new U,Qo=new U,$o=class extends ro{constructor(e=new Vo,t=new Eo){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Xo.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Yo.fromBufferAttribute(s,e),a?Xo.addScaledVector(Yo,r):Xo.addScaledVector(Yo.sub(t),r))}t.add(Xo)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Wo.copy(n.boundingSphere),Wo.applyMatrix4(i),Uo.copy(e.ray).recast(e.near),!(Wo.containsPoint(Uo.origin)===!1&&(Uo.intersectSphere(Wo,Go)===null||Uo.origin.distanceToSquared(Go)>(e.far-e.near)**2))&&(Ho.copy(i).invert(),Uo.copy(e.ray).applyMatrix4(Ho),(n.boundingBox===null||Uo.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Uo)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=ts(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=ts(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=ts(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=ts(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function es(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Qo.copy(s),Qo.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Qo);return l<n.near||l>n.far?null:{distance:l,point:Qo.clone(),object:e}}function ts(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Ko),e.getVertexPosition(c,qo),e.getVertexPosition(l,Jo);let u=es(e,t,n,r,Ko,qo,Jo,Zo);if(u){let e=new U;vo.getBarycoord(Zo,Ko,qo,Jo,e),i&&(u.uv=vo.getInterpolatedAttribute(i,s,c,l,e,new H)),a&&(u.uv1=vo.getInterpolatedAttribute(a,s,c,l,e,new H)),o&&(u.normal=vo.getInterpolatedAttribute(o,s,c,l,e,new U),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new U,materialIndex:0};vo.getNormal(Ko,qo,Jo,t.normal),u.face=t,u.barycoord=e}return u}var ns=class e extends Vo{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new No(c,3)),this.setAttribute(`normal`,new No(l,3)),this.setAttribute(`uv`,new No(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new U;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function rs(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone():Array.isArray(i)?t[n][r]=i.slice():t[n][r]=i}}return t}function is(e){let t={};for(let n=0;n<e.length;n++){let r=rs(e[n]);for(let e in r)t[e]=r[e]}return t}function as(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function os(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Vi.workingColorSpace}var ss={clone:rs,merge:is},cs=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ls=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,us=class extends To{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=cs,this.fragmentShader=ls,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=rs(e.uniforms),this.uniformsGroups=as(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},ds=class extends ro{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Aa,this.projectionMatrix=new Aa,this.projectionMatrixInverse=new Aa,this.coordinateSystem=ei,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},fs=new U,ps=new H,ms=new H,hs=class extends ds{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ai*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ii*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ai*2*Math.atan(Math.tan(ii*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){fs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(fs.x,fs.y).multiplyScalar(-e/fs.z),fs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(fs.x,fs.y).multiplyScalar(-e/fs.z)}getViewSize(e,t){return this.getViewBounds(e,ps,ms),t.subVectors(ms,ps)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ii*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},gs=-90,_s=1,vs=class extends ro{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new hs(gs,_s,e,t);r.layers=this.layers,this.add(r);let i=new hs(gs,_s,e,t);i.layers=this.layers,this.add(i);let a=new hs(gs,_s,e,t);a.layers=this.layers,this.add(a);let o=new hs(gs,_s,e,t);o.layers=this.layers,this.add(o);let s=new hs(gs,_s,e,t);s.layers=this.layers,this.add(s);let c=new hs(gs,_s,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,i),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,s),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},ys=class extends Zi{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},bs=class extends ea{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new ys(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new ns(5,5,5),i=new us({name:`CubemapFromEquirect`,uniforms:rs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new $o(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=In),new vs(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},xs=class extends ro{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Ss={type:`move`},Cs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new xs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new xs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new xs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Ss)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new xs;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},ws=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new G(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Ts=class extends ro{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ba,this.environmentIntensity=1,this.environmentRotation=new Ba,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Es=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=$r,this.updateRanges=[],this.version=0,this.uuid=oi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=oi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=oi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Ds=new U,Os=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Ds.fromBufferAttribute(this,t),Ds.applyMatrix4(e),this.setXYZ(t,Ds.x,Ds.y,Ds.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ds.fromBufferAttribute(this,t),Ds.applyNormalMatrix(e),this.setXYZ(t,Ds.x,Ds.y,Ds.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ds.fromBufferAttribute(this,t),Ds.transformDirection(e),this.setXYZ(t,Ds.x,Ds.y,Ds.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Ti(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ei(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Ei(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Ei(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Ei(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Ei(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Ti(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Ti(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Ti(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Ti(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ei(t,this.array),n=Ei(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ei(t,this.array),n=Ei(n,this.array),r=Ei(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ei(t,this.array),n=Ei(n,this.array),r=Ei(r,this.array),i=Ei(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){console.log(`THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Ao(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log(`THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},ks=class extends To{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new G(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},As,js=new U,Ms=new U,Ns=new U,Ps=new H,Fs=new H,Is=new Aa,Ls=new U,Rs=new U,zs=new U,Bs=new H,Vs=new H,Hs=new H,Us=class extends ro{constructor(e=new ks){if(super(),this.isSprite=!0,this.type=`Sprite`,As===void 0){As=new Vo;let e=new Es(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);As.setIndex([0,1,2,0,2,3]),As.setAttribute(`position`,new Os(e,3,0,!1)),As.setAttribute(`uv`,new Os(e,2,3,!1))}this.geometry=As,this.material=e,this.center=new H(.5,.5),this.count=1}raycast(e,t){e.camera===null&&console.error(`THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),Ms.setFromMatrixScale(this.matrixWorld),Is.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ns.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Ms.multiplyScalar(-Ns.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;Ws(Ls.set(-.5,-.5,0),Ns,a,Ms,r,i),Ws(Rs.set(.5,-.5,0),Ns,a,Ms,r,i),Ws(zs.set(.5,.5,0),Ns,a,Ms,r,i),Bs.set(0,0),Vs.set(1,0),Hs.set(1,1);let o=e.ray.intersectTriangle(Ls,Rs,zs,!1,js);if(o===null&&(Ws(Rs.set(-.5,.5,0),Ns,a,Ms,r,i),Vs.set(0,1),o=e.ray.intersectTriangle(Ls,zs,Rs,!1,js),o===null))return;let s=e.ray.origin.distanceTo(js);s<e.near||s>e.far||t.push({distance:s,point:js.clone(),uv:vo.getInterpolation(js,Ls,Rs,zs,Bs,Vs,Hs,new H),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Ws(e,t,n,r,i,a){Ps.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?Fs.copy(Ps):(Fs.x=a*Ps.x-i*Ps.y,Fs.y=i*Ps.x+a*Ps.y),e.copy(t),e.x+=Fs.x,e.y+=Fs.y,e.applyMatrix4(Is)}var Gs=new U,Ks=new U,qs=new W,Js=class{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Gs.subVectors(n,t).cross(Ks.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Gs),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let i=-(e.start.dot(this.normal)+this.constant)/r;return i<0||i>1?null:t.copy(e.start).addScaledVector(n,i)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||qs.getNormalMatrix(e),r=this.coplanarPoint(Gs).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ys=new xa,Xs=new H(.5,.5),Zs=new U,Qs=class{constructor(e=new Js,t=new Js,n=new Js,r=new Js,i=new Js,a=new Js){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ei,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ys.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ys.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ys)}intersectsSprite(e){return Ys.center.set(0,0,0),Ys.radius=.7071067811865476+Xs.distanceTo(e.center),Ys.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ys)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Zs.x=r.normal.x>0?e.max.x:e.min.x,Zs.y=r.normal.y>0?e.max.y:e.min.y,Zs.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Zs)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},$s=class extends To{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new G(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},ec=new U,tc=new U,nc=new Aa,rc=new ka,ic=new xa,ac=new U,oc=new U,sc=class extends ro{constructor(e=new Vo,t=new $s){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)ec.fromBufferAttribute(t,e-1),tc.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=ec.distanceTo(tc);e.setAttribute(`lineDistance`,new No(n,1))}else console.warn(`THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ic.copy(n.boundingSphere),ic.applyMatrix4(r),ic.radius+=i,e.ray.intersectsSphere(ic)===!1)return;nc.copy(r).invert(),rc.copy(e.ray).applyMatrix4(nc);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=cc(this,e,rc,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=cc(this,e,rc,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=cc(this,e,rc,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=cc(this,e,rc,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function cc(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(ec.fromBufferAttribute(s,i),tc.fromBufferAttribute(s,a),n.distanceSqToSegment(ec,tc,ac,oc)>r)return;ac.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(ac);if(!(c<t.near||c>t.far))return{distance:c,point:oc.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var lc=new U,uc=new U,dc=class extends sc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)lc.fromBufferAttribute(t,e),uc.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+lc.distanceTo(uc);e.setAttribute(`lineDistance`,new No(n,1))}else console.warn(`THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},fc=class extends To{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new G(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},pc=new Aa,mc=new ka,hc=new xa,gc=new U,_c=class extends ro{constructor(e=new Vo,t=new fc){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),hc.copy(n.boundingSphere),hc.applyMatrix4(r),hc.radius+=i,e.ray.intersectsSphere(hc)===!1)return;pc.copy(r).invert(),mc.copy(e.ray).applyMatrix4(pc);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);gc.fromBufferAttribute(l,n),vc(gc,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)gc.fromBufferAttribute(l,a),vc(gc,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function vc(e,t,n,r,i,a,o){let s=mc.distanceSqToPoint(e);if(s<n){let n=new U;mc.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var yc=class extends Zi{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},bc=class extends Zi{constructor(e,t,n=Wn,r,i,a,o=Nn,s=Nn,c,l=tr,u=1){if(l!==1026&&l!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new qi(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},xc=class extends Zi{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Sc=class e extends Vo{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new U,l=new H;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new No(a,3)),this.setAttribute(`normal`,new No(o,3)),this.setAttribute(`uv`,new No(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Cc=class e extends Vo{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new No(u,3)),this.setAttribute(`normal`,new No(d,3)),this.setAttribute(`uv`,new No(f,2));function _(){let a=new U,_=new U,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new H,m=new U,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},wc=class e extends Vo{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new No(p,3)),this.setAttribute(`normal`,new No(m,3)),this.setAttribute(`uv`,new No(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Tc=class e extends Vo{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new U,p=new H;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new No(s,3)),this.setAttribute(`normal`,new No(c,3)),this.setAttribute(`uv`,new No(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Ec=class e extends Vo{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i},n=Math.floor(n),r=Math.floor(r);let a=[],o=[],s=[],c=[],l=new U,u=new U,d=new U;for(let a=0;a<=n;a++)for(let f=0;f<=r;f++){let p=f/r*i,m=a/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(p),u.y=(e+t*Math.cos(m))*Math.sin(p),u.z=t*Math.sin(m),o.push(u.x,u.y,u.z),l.x=e*Math.cos(p),l.y=e*Math.sin(p),d.subVectors(u,l).normalize(),s.push(d.x,d.y,d.z),c.push(f/r),c.push(a/n)}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,o=(r+1)*(e-1)+t,s=(r+1)*e+t;a.push(n,i,s),a.push(i,o,s)}this.setIndex(a),this.setAttribute(`position`,new No(o,3)),this.setAttribute(`normal`,new No(s,3)),this.setAttribute(`uv`,new No(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}},Dc=class extends To{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new G(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new G(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new H(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ba,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Oc=class extends To{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Kr,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},kc=class extends To{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ac(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function jc(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}var Mc=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},Nc=class extends Mc{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ur,endingEnd:Ur}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Wr:i=e,o=2*t-n;break;case Gr:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Wr:a=e,s=2*n-t;break;case Gr:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Pc=class extends Mc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Fc=class extends Mc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ic=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Ac(t,this.TimeBufferType),this.values=Ac(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ac(e.times,Array),values:Ac(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Fc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Pc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Nc(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Br:t=this.InterpolantFactoryMethodDiscrete;break;case Vr:t=this.InterpolantFactoryMethodLinear;break;case Hr:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return console.warn(`THREE.KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Br;case this.InterpolantFactoryMethodLinear:return Vr;case this.InterpolantFactoryMethodSmooth:return Hr}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error(`THREE.KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(console.error(`THREE.KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){console.error(`THREE.KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){console.error(`THREE.KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&jc(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){console.error(`THREE.KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Hr,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Ic.prototype.ValueTypeName=``,Ic.prototype.TimeBufferType=Float32Array,Ic.prototype.ValueBufferType=Float32Array,Ic.prototype.DefaultInterpolation=Vr;var Lc=class extends Ic{constructor(e,t,n){super(e,t,n)}};Lc.prototype.ValueTypeName=`bool`,Lc.prototype.ValueBufferType=Array,Lc.prototype.DefaultInterpolation=Br,Lc.prototype.InterpolantFactoryMethodLinear=void 0,Lc.prototype.InterpolantFactoryMethodSmooth=void 0;var Rc=class extends Ic{constructor(e,t,n,r){super(e,t,n,r)}};Rc.prototype.ValueTypeName=`color`;var zc=class extends Ic{constructor(e,t,n,r){super(e,t,n,r)}};zc.prototype.ValueTypeName=`number`;var Bc=class extends Mc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Oi.slerpFlat(i,0,a,c-o,a,c,s);return i}},Vc=class extends Ic{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Bc(this.times,this.values,this.getValueSize(),e)}};Vc.prototype.ValueTypeName=`quaternion`,Vc.prototype.InterpolantFactoryMethodSmooth=void 0;var Hc=class extends Ic{constructor(e,t,n){super(e,t,n)}};Hc.prototype.ValueTypeName=`string`,Hc.prototype.ValueBufferType=Array,Hc.prototype.DefaultInterpolation=Br,Hc.prototype.InterpolantFactoryMethodLinear=void 0,Hc.prototype.InterpolantFactoryMethodSmooth=void 0;var Uc=class extends Ic{constructor(e,t,n,r){super(e,t,n,r)}};Uc.prototype.ValueTypeName=`vector`;var Wc=class extends ro{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new G(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Gc=class extends Wc{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(ro.DEFAULT_UP),this.updateMatrix(),this.groundColor=new G(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Kc=new Aa,qc=new U,Jc=new U,Yc=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new H(512,512),this.mapType=zn,this.map=null,this.mapPass=null,this.matrix=new Aa,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Qs,this._frameExtents=new H(1,1),this._viewportCount=1,this._viewports=[new Qi(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;qc.setFromMatrixPosition(e.matrixWorld),t.position.copy(qc),Jc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Jc),t.updateMatrixWorld(),Kc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Kc,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Kc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Xc=class extends ds{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Zc=class extends Yc{constructor(){super(new Xc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Qc=class extends Wc{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(ro.DEFAULT_UP),this.updateMatrix(),this.target=new ro,this.shadow=new Zc}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},$c=class extends hs{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},el=`\\[\\]\\.:\\/`,tl=RegExp(`[\\[\\]\\.:\\/]`,`g`),nl=`[^\\[\\]\\.:\\/]`,rl=`[^`+el.replace(`\\.`,``)+`]`,il=`((?:WC+[\\/:])*)`.replace(`WC`,nl),al=`(WCOD+)?`.replace(`WCOD`,rl),ol=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,nl),sl=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,nl),cl=RegExp(`^`+il+al+ol+sl+`$`),ll=[`material`,`materials`,`bones`,`map`],ul=class{constructor(e,t,n){let r=n||dl.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},dl=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(tl,``)}static parseTrackName(e){let t=cl.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);ll.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn(`THREE.PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){console.error(`THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){console.error(`THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){console.error(`THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){console.error(`THREE.PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){console.error(`THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;console.error(`THREE.PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};dl.Composite=ul,dl.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},dl.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},dl.prototype.GetterByBindingType=[dl.prototype._getValue_direct,dl.prototype._getValue_array,dl.prototype._getValue_arrayElement,dl.prototype._getValue_toArray],dl.prototype.SetterByBindingTypeAndVersioning=[[dl.prototype._setValue_direct,dl.prototype._setValue_direct_setNeedsUpdate,dl.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[dl.prototype._setValue_array,dl.prototype._setValue_array_setNeedsUpdate,dl.prototype._setValue_array_setMatrixWorldNeedsUpdate],[dl.prototype._setValue_arrayElement,dl.prototype._setValue_arrayElement_setNeedsUpdate,dl.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[dl.prototype._setValue_fromArray,dl.prototype._setValue_fromArray_setNeedsUpdate,dl.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var fl=class extends dc{constructor(e=10,t=10,n=4473924,r=8947848){n=new G(n),r=new G(r);let i=t/2,a=e/t,o=e/2,s=[],c=[];for(let e=0,l=0,u=-o;e<=t;e++,u+=a){s.push(-o,0,u,o,0,u),s.push(u,0,-o,u,0,o);let t=e===i?n:r;t.toArray(c,l),l+=3,t.toArray(c,l),l+=3,t.toArray(c,l),l+=3,t.toArray(c,l),l+=3}let l=new Vo;l.setAttribute(`position`,new No(s,3)),l.setAttribute(`color`,new No(c,3));let u=new $s({vertexColors:!0,toneMapped:!1});super(l,u),this.type=`GridHelper`}dispose(){this.geometry.dispose(),this.material.dispose()}};function pl(e,t,n,r){let i=ml(r);switch(n){case Qn:return e*t;case rr:return e*t/i.components*i.byteLength;case ir:return e*t/i.components*i.byteLength;case ar:return e*t*2/i.components*i.byteLength;case or:return e*t*2/i.components*i.byteLength;case $n:return e*t*3/i.components*i.byteLength;case er:return e*t*4/i.components*i.byteLength;case sr:return e*t*4/i.components*i.byteLength;case cr:case lr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ur:case dr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case pr:case hr:return Math.max(e,16)*Math.max(t,8)/4;case fr:case mr:return Math.max(e,8)*Math.max(t,8)/2;case gr:case _r:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case vr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case yr:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case br:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case xr:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Sr:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Cr:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case wr:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Tr:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Er:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Dr:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Or:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case kr:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Ar:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case jr:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Mr:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Nr:case Pr:case Fr:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ir:case Lr:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Rr:case zr:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function ml(e){switch(e){case zn:case Bn:return{byteLength:1,components:1};case Hn:case Vn:case Kn:return{byteLength:2,components:1};case qn:case Jn:return{byteLength:2,components:4};case Wn:case Un:case Gn:return{byteLength:4,components:1};case Xn:case Zn:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`180`}})),typeof window<`u`&&(window.__THREE__?console.warn(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`180`);function hl(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function gl(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var K={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},q={common:{diffuse:{value:new G(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new W},alphaMap:{value:null},alphaMapTransform:{value:new W},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new W}},envmap:{envMap:{value:null},envMapRotation:{value:new W},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new W}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new W}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new W},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new W},normalScale:{value:new H(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new W},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new W}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new W}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new W}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new G(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new G(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new W},alphaTest:{value:0},uvTransform:{value:new W}},sprite:{diffuse:{value:new G(16777215)},opacity:{value:1},center:{value:new H(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new W},alphaMap:{value:null},alphaMapTransform:{value:new W},alphaTest:{value:0}}},_l={basic:{uniforms:is([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.fog]),vertexShader:K.meshbasic_vert,fragmentShader:K.meshbasic_frag},lambert:{uniforms:is([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.fog,q.lights,{emissive:{value:new G(0)}}]),vertexShader:K.meshlambert_vert,fragmentShader:K.meshlambert_frag},phong:{uniforms:is([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.fog,q.lights,{emissive:{value:new G(0)},specular:{value:new G(1118481)},shininess:{value:30}}]),vertexShader:K.meshphong_vert,fragmentShader:K.meshphong_frag},standard:{uniforms:is([q.common,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.roughnessmap,q.metalnessmap,q.fog,q.lights,{emissive:{value:new G(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:K.meshphysical_vert,fragmentShader:K.meshphysical_frag},toon:{uniforms:is([q.common,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.gradientmap,q.fog,q.lights,{emissive:{value:new G(0)}}]),vertexShader:K.meshtoon_vert,fragmentShader:K.meshtoon_frag},matcap:{uniforms:is([q.common,q.bumpmap,q.normalmap,q.displacementmap,q.fog,{matcap:{value:null}}]),vertexShader:K.meshmatcap_vert,fragmentShader:K.meshmatcap_frag},points:{uniforms:is([q.points,q.fog]),vertexShader:K.points_vert,fragmentShader:K.points_frag},dashed:{uniforms:is([q.common,q.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:K.linedashed_vert,fragmentShader:K.linedashed_frag},depth:{uniforms:is([q.common,q.displacementmap]),vertexShader:K.depth_vert,fragmentShader:K.depth_frag},normal:{uniforms:is([q.common,q.bumpmap,q.normalmap,q.displacementmap,{opacity:{value:1}}]),vertexShader:K.meshnormal_vert,fragmentShader:K.meshnormal_frag},sprite:{uniforms:is([q.sprite,q.fog]),vertexShader:K.sprite_vert,fragmentShader:K.sprite_frag},background:{uniforms:{uvTransform:{value:new W},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:K.background_vert,fragmentShader:K.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new W}},vertexShader:K.backgroundCube_vert,fragmentShader:K.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:K.cube_vert,fragmentShader:K.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:K.equirect_vert,fragmentShader:K.equirect_frag},distanceRGBA:{uniforms:is([q.common,q.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:K.distanceRGBA_vert,fragmentShader:K.distanceRGBA_frag},shadow:{uniforms:is([q.lights,q.fog,{color:{value:new G(0)},opacity:{value:1}}]),vertexShader:K.shadow_vert,fragmentShader:K.shadow_frag}};_l.physical={uniforms:is([_l.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new W},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new W},clearcoatNormalScale:{value:new H(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new W},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new W},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new W},sheen:{value:0},sheenColor:{value:new G(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new W},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new W},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new W},transmissionSamplerSize:{value:new H},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new W},attenuationDistance:{value:0},attenuationColor:{value:new G(0)},specularColor:{value:new G(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new W},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new W},anisotropyVector:{value:new H},anisotropyMap:{value:null},anisotropyMapTransform:{value:new W}}]),vertexShader:K.meshphysical_vert,fragmentShader:K.meshphysical_frag};var vl={r:0,b:0,g:0},yl=new Ba,bl=new Aa;function xl(e,t,n,r,i,a,o){let s=new G(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new $o(new ns(1,1,1),new us({name:`BackgroundCubeMaterial`,uniforms:rs(_l.backgroundCube.uniforms),vertexShader:_l.backgroundCube.vertexShader,fragmentShader:_l.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),yl.copy(n.backgroundRotation),yl.x*=-1,yl.y*=-1,yl.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(yl.y*=-1,yl.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(bl.makeRotationFromEuler(yl)),u.material.toneMapped=Vi.getTransfer(r.colorSpace)!==Zr,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new $o(new wc(2,2),new us({name:`BackgroundMaterial`,uniforms:rs(_l.background.uniforms),vertexShader:_l.background.vertexShader,fragmentShader:_l.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=Vi.getTransfer(r.colorSpace)!==Zr,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(vl,os(e)),r.buffers.color.setClear(vl.r,vl.g,vl.b,n,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function Sl(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Cl(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function wl(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function Tl(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Js,s=new W,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function El(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new bs(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var Dl=4,Ol=[.125,.215,.35,.446,.526,.582],kl=20,Al=new Xc,jl=new G,Ml=null,Nl=0,Pl=0,Fl=!1,Il=(1+Math.sqrt(5))/2,Ll=1/Il,Rl=[new U(-Il,Ll,0),new U(Il,Ll,0),new U(-Ll,0,Il),new U(Ll,0,Il),new U(0,Il,-Ll),new U(0,Il,Ll),new U(-1,1,-1),new U(1,1,-1),new U(-1,1,1),new U(1,1,1)],zl=new U,Bl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=zl}=i;Ml=this._renderer.getRenderTarget(),Nl=this._renderer.getActiveCubeFace(),Pl=this._renderer.getActiveMipmapLevel(),Fl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Kl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Gl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ml,Nl,Pl),this._renderer.xr.enabled=Fl,e.scissorTest=!1,Ul(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ml=this._renderer.getRenderTarget(),Nl=this._renderer.getActiveCubeFace(),Pl=this._renderer.getActiveMipmapLevel(),Fl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:In,minFilter:In,generateMipmaps:!1,type:Kn,format:er,colorSpace:Yr,depthBuffer:!1},r=Hl(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Hl(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Vl(r)),this._blurMaterial=Wl(r,e,t)}return r}_compileMaterial(e){let t=new $o(this._lodPlanes[0],e);this._renderer.compile(t,Al)}_sceneToCubeUV(e,t,n,r,i){let a=new hs(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(jl),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new Eo({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new $o(new ns,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(jl),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Ul(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Kl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Gl());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new $o(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Ul(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Al)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=Rl[(r-t-1)%Rl.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new $o(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):kl;m>kl&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${kl}`);let h=[],g=0;for(let e=0;e<kl;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];Ul(t,3*v*(r>_-Dl?r-_+Dl:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,Al)}};function Vl(e){let t=[],n=[],r=[],i=e,a=e-Dl+1+Ol.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-Dl?s=Ol[o-e+Dl-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Vo;h.setAttribute(`position`,new Ao(f,3)),h.setAttribute(`uv`,new Ao(p,2)),h.setAttribute(`faceIndex`,new Ao(m,1)),t.push(h),i>Dl&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function Hl(e,t,n){let r=new ea(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Ul(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Wl(e,t,n){let r=new Float32Array(kl),i=new U(0,1,0);return new us({name:`SphericalGaussianBlur`,defines:{n:kl,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:ql(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Gl(){return new us({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:ql(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Kl(){return new us({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ql(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function ql(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Jl(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new Bl(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new Bl(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function Yl(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Ii(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function Xl(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0||(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++),t}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(Mi(n)?Mo:jo)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Zl(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function Ql(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function $l(e,t,n){let r=new WeakMap,i=new Qi;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new ta(h,p,m,u);g.type=Gn,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new H(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function eu(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var tu=new Zi,nu=new bc(1,1),ru=new ta,iu=new na,au=new ys,ou=[],su=[],cu=new Float32Array(16),lu=new Float32Array(9),uu=new Float32Array(4);function du(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=ou[i];if(a===void 0&&(a=new Float32Array(i),ou[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function fu(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function pu(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function mu(e,t){let n=su[t];n===void 0&&(n=new Int32Array(t),su[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function hu(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function gu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(fu(n,t))return;e.uniform2fv(this.addr,t),pu(n,t)}}function _u(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(fu(n,t))return;e.uniform3fv(this.addr,t),pu(n,t)}}function vu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(fu(n,t))return;e.uniform4fv(this.addr,t),pu(n,t)}}function yu(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(fu(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),pu(n,t)}else{if(fu(n,r))return;uu.set(r),e.uniformMatrix2fv(this.addr,!1,uu),pu(n,r)}}function bu(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(fu(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),pu(n,t)}else{if(fu(n,r))return;lu.set(r),e.uniformMatrix3fv(this.addr,!1,lu),pu(n,r)}}function xu(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(fu(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),pu(n,t)}else{if(fu(n,r))return;cu.set(r),e.uniformMatrix4fv(this.addr,!1,cu),pu(n,r)}}function Su(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Cu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(fu(n,t))return;e.uniform2iv(this.addr,t),pu(n,t)}}function wu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(fu(n,t))return;e.uniform3iv(this.addr,t),pu(n,t)}}function Tu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(fu(n,t))return;e.uniform4iv(this.addr,t),pu(n,t)}}function Eu(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Du(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(fu(n,t))return;e.uniform2uiv(this.addr,t),pu(n,t)}}function Ou(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(fu(n,t))return;e.uniform3uiv(this.addr,t),pu(n,t)}}function ku(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(fu(n,t))return;e.uniform4uiv(this.addr,t),pu(n,t)}}function Au(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(nu.compareFunction=515,a=nu):a=tu,n.setTexture2D(t||a,i)}function ju(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||iu,i)}function Mu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||au,i)}function Nu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||ru,i)}function Pu(e){switch(e){case 5126:return hu;case 35664:return gu;case 35665:return _u;case 35666:return vu;case 35674:return yu;case 35675:return bu;case 35676:return xu;case 5124:case 35670:return Su;case 35667:case 35671:return Cu;case 35668:case 35672:return wu;case 35669:case 35673:return Tu;case 5125:return Eu;case 36294:return Du;case 36295:return Ou;case 36296:return ku;case 35678:case 36198:case 36298:case 36306:case 35682:return Au;case 35679:case 36299:case 36307:return ju;case 35680:case 36300:case 36308:case 36293:return Mu;case 36289:case 36303:case 36311:case 36292:return Nu}}function Fu(e,t){e.uniform1fv(this.addr,t)}function Iu(e,t){let n=du(t,this.size,2);e.uniform2fv(this.addr,n)}function Lu(e,t){let n=du(t,this.size,3);e.uniform3fv(this.addr,n)}function Ru(e,t){let n=du(t,this.size,4);e.uniform4fv(this.addr,n)}function zu(e,t){let n=du(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Bu(e,t){let n=du(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Vu(e,t){let n=du(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Hu(e,t){e.uniform1iv(this.addr,t)}function Uu(e,t){e.uniform2iv(this.addr,t)}function Wu(e,t){e.uniform3iv(this.addr,t)}function Gu(e,t){e.uniform4iv(this.addr,t)}function Ku(e,t){e.uniform1uiv(this.addr,t)}function qu(e,t){e.uniform2uiv(this.addr,t)}function Ju(e,t){e.uniform3uiv(this.addr,t)}function Yu(e,t){e.uniform4uiv(this.addr,t)}function Xu(e,t,n){let r=this.cache,i=t.length,a=mu(n,i);fu(r,a)||(e.uniform1iv(this.addr,a),pu(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||tu,a[e])}function Zu(e,t,n){let r=this.cache,i=t.length,a=mu(n,i);fu(r,a)||(e.uniform1iv(this.addr,a),pu(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||iu,a[e])}function Qu(e,t,n){let r=this.cache,i=t.length,a=mu(n,i);fu(r,a)||(e.uniform1iv(this.addr,a),pu(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||au,a[e])}function $u(e,t,n){let r=this.cache,i=t.length,a=mu(n,i);fu(r,a)||(e.uniform1iv(this.addr,a),pu(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||ru,a[e])}function ed(e){switch(e){case 5126:return Fu;case 35664:return Iu;case 35665:return Lu;case 35666:return Ru;case 35674:return zu;case 35675:return Bu;case 35676:return Vu;case 5124:case 35670:return Hu;case 35667:case 35671:return Uu;case 35668:case 35672:return Wu;case 35669:case 35673:return Gu;case 5125:return Ku;case 36294:return qu;case 36295:return Ju;case 36296:return Yu;case 35678:case 36198:case 36298:case 36306:case 35682:return Xu;case 35679:case 36299:case 36307:return Zu;case 35680:case 36300:case 36308:case 36293:return Qu;case 36289:case 36303:case 36311:case 36292:return $u}}var td=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Pu(t.type)}},nd=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ed(t.type)}},rd=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},id=/(\w+)(\])?(\[|\.)?/g;function ad(e,t){e.seq.push(t),e.map[t.id]=t}function od(e,t,n){let r=e.name,i=r.length;for(id.lastIndex=0;;){let a=id.exec(r),o=id.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){ad(n,l===void 0?new td(s,e,t):new nd(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new rd(s),ad(n,e)),n=e}}}var sd=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);od(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function cd(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var ld=37297,ud=0;function dd(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var fd=new W;function pd(e){Vi._getMatrix(fd,Vi.workingColorSpace,e);let t=`mat3( ${fd.elements.map(e=>e.toFixed(4))} )`;switch(Vi.getTransfer(e)){case Xr:return[t,`LinearTransferOETF`];case Zr:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function md(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+dd(e.getShaderSource(t),r)}return i}function hd(e,t){let n=pd(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function gd(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var _d=new U;function vd(){return Vi.getLuminanceCoefficients(_d),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${_d.x.toFixed(4)}, ${_d.y.toFixed(4)}, ${_d.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function yd(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Sd).join(`
`)}function bd(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function xd(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Sd(e){return e!==``}function Cd(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function wd(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Td=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ed(e){return e.replace(Td,Od)}var Dd=new Map;function Od(e,t){let n=K[t];if(n===void 0){let e=Dd.get(t);if(e!==void 0)n=K[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return Ed(n)}var kd=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ad(e){return e.replace(kd,jd)}function jd(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Md(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}function Nd(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function Pd(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function Fd(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function Id(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function Ld(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Rd(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Nd(n),l=Pd(n),u=Fd(n),d=Id(n),f=Ld(n),p=yd(n),m=bd(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Sd).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Sd).join(`
`),_.length>0&&(_+=`
`)):(g=[Md(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Sd).join(`
`),_=[Md(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:K.tonemapping_pars_fragment,n.toneMapping===0?``:gd(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,K.colorspace_pars_fragment,hd(`linearToOutputTexel`,n.outputColorSpace),vd(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Sd).join(`
`)),o=Ed(o),o=Cd(o,n),o=wd(o,n),s=Ed(s),s=Cd(s,n),s=wd(s,n),o=Ad(o),s=Ad(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=cd(i,i.VERTEX_SHADER,y),S=cd(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=md(i,x,`vertex`),n=md(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new sd(i,h),T=xd(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,ld)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=ud++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var zd=0,Bd=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Vd(e),t.set(e,n)),n}},Vd=class{constructor(e){this.id=zd++,this.code=e,this.usedTimes=0}};function Hd(e,t,n,r,i,a,o){let s=new Va,c=new Bd,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=_l[C];D=e.vertexShader,O=e.fragmentShader}else D=a.vertexShader,O=a.fragmentShader,c.update(a),k=c.getVertexShaderID(a),A=c.getFragmentShaderID(a);let j=e.getRenderTarget(),M=e.state.buffers.depth.getReversed(),N=_.isInstancedMesh===!0,P=_.isBatchedMesh===!0,F=!!a.map,ee=!!a.matcap,te=!!x,I=!!a.aoMap,ne=!!a.lightMap,re=!!a.bumpMap,ie=!!a.normalMap,ae=!!a.displacementMap,oe=!!a.emissiveMap,se=!!a.metalnessMap,ce=!!a.roughnessMap,le=a.anisotropy>0,ue=a.clearcoat>0,L=a.dispersion>0,de=a.iridescence>0,fe=a.sheen>0,pe=a.transmission>0,R=le&&!!a.anisotropyMap,me=ue&&!!a.clearcoatMap,z=ue&&!!a.clearcoatNormalMap,B=ue&&!!a.clearcoatRoughnessMap,he=de&&!!a.iridescenceMap,ge=de&&!!a.iridescenceThicknessMap,_e=fe&&!!a.sheenColorMap,ve=fe&&!!a.sheenRoughnessMap,ye=!!a.specularMap,be=!!a.specularColorMap,xe=!!a.specularIntensityMap,Se=pe&&!!a.transmissionMap,Ce=pe&&!!a.thicknessMap,we=!!a.gradientMap,Te=!!a.alphaMap,Ee=a.alphaTest>0,De=!!a.alphaHash,Oe=!!a.extensions,ke=0;a.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(ke=e.toneMapping);let Ae={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:O,defines:a.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:P,batchingColor:P&&_._colorsTexture!==null,instancing:N,instancingColor:N&&_.instanceColor!==null,instancingMorph:N&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Yr,alphaToCoverage:!!a.alphaToCoverage,map:F,matcap:ee,envMap:te,envMapMode:te&&x.mapping,envMapCubeUVHeight:S,aoMap:I,lightMap:ne,bumpMap:re,normalMap:ie,displacementMap:f&&ae,emissiveMap:oe,normalMapObjectSpace:ie&&a.normalMapType===1,normalMapTangentSpace:ie&&a.normalMapType===0,metalnessMap:se,roughnessMap:ce,anisotropy:le,anisotropyMap:R,clearcoat:ue,clearcoatMap:me,clearcoatNormalMap:z,clearcoatRoughnessMap:B,dispersion:L,iridescence:de,iridescenceMap:he,iridescenceThicknessMap:ge,sheen:fe,sheenColorMap:_e,sheenRoughnessMap:ve,specularMap:ye,specularColorMap:be,specularIntensityMap:xe,transmission:pe,transmissionMap:Se,thicknessMap:Ce,gradientMap:we,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:Te,alphaTest:Ee,alphaHash:De,combine:a.combine,mapUv:F&&h(a.map.channel),aoMapUv:I&&h(a.aoMap.channel),lightMapUv:ne&&h(a.lightMap.channel),bumpMapUv:re&&h(a.bumpMap.channel),normalMapUv:ie&&h(a.normalMap.channel),displacementMapUv:ae&&h(a.displacementMap.channel),emissiveMapUv:oe&&h(a.emissiveMap.channel),metalnessMapUv:se&&h(a.metalnessMap.channel),roughnessMapUv:ce&&h(a.roughnessMap.channel),anisotropyMapUv:R&&h(a.anisotropyMap.channel),clearcoatMapUv:me&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:z&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:B&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:he&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:ge&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:ve&&h(a.sheenRoughnessMap.channel),specularMapUv:ye&&h(a.specularMap.channel),specularColorMapUv:be&&h(a.specularColorMap.channel),specularIntensityMapUv:xe&&h(a.specularIntensityMap.channel),transmissionMapUv:Se&&h(a.transmissionMap.channel),thicknessMapUv:Ce&&h(a.thicknessMap.channel),alphaMapUv:Te&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(ie||le),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(F||Te),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:M,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:ke,decodeVideoTexture:F&&a.map.isVideoTexture===!0&&Vi.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:oe&&a.emissiveMap.isVideoTexture===!0&&Vi.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Oe&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Oe&&a.extensions.multiDraw===!0||P)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return Ae.vertexUv1s=l.has(1),Ae.vertexUv2s=l.has(2),Ae.vertexUv3s=l.has(3),l.clear(),Ae}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=_l[t];n=ss.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new Rd(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function Ud(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Wd(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Gd(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Kd(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||Wd),r.length>1&&r.sort(t||Gd),i.length>1&&i.sort(t||Gd)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function qd(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Kd,e.set(t,[i])):n>=r.length?(i=new Kd,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Jd(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new U,color:new G};break;case`SpotLight`:n={position:new U,direction:new U,color:new G,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new U,color:new G,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new U,skyColor:new G,groundColor:new G};break;case`RectAreaLight`:n={color:new G,position:new U,halfWidth:new U,halfHeight:new U}}return e[t.id]=n,n}}}function Yd(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Xd=0;function Zd(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Qd(e){let t=new Jd,n=Yd(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new U);let i=new U,a=new Aa,o=new Aa;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(Zd);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=q.LTC_FLOAT_1,r.rectAreaLTC2=q.LTC_FLOAT_2):(r.rectAreaLTC1=q.LTC_HALF_1,r.rectAreaLTC2=q.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=Xd++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function $d(e){let t=new Qd(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function ef(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new $d(e),t.set(n,[a])):r>=i.length?(a=new $d(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var tf=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,nf=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function rf(e,t,n){let r=new Qs,i=new H,a=new H,o=new Qi,s=new Oc({depthPacking:qr}),c=new kc,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new us({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new H},radius:{value:4}},vertexShader:tf,fragmentShader:nf}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Vo;m.setAttribute(`position`,new Ao(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new $o(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==3&&this.type===3,m=_===3&&this.type!==3;for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){console.warn(`THREE.WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let h=d.getFrameExtents();if(i.multiply(h),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/h.x),i.x=a.x*h.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/h.y),i.y=a.y*h.y,d.mapSize.y=a.y)),d.map===null||p===!0||m===!0){let e=this.type===3?{}:{minFilter:Nn,magFilter:Nn};d.map!==null&&d.map.dispose(),d.map=new ea(i.x,i.y,e),d.map.texture.name=l.name+`.shadowMap`,d.camera.updateProjectionMatrix()}e.setRenderTarget(d.map),e.clear();let g=d.getViewportCount();for(let e=0;e<g;e++){let t=d.getViewport(e);o.set(a.x*t.x,a.y*t.y,a.x*t.z,a.y*t.w),f.viewport(o),d.updateMatrices(l,e),r=d.getFrustum(),b(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new ea(i.x,i.y)),f.uniforms.shadow_pass.value=n.map.texture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var af={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function of(e,t){function n(){let t=!1,n=new Qi,r=null,i=new Qi(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?oe(e.DEPTH_TEST):se(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=af[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?oe(e.STENCIL_TEST):se(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new G(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,j=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,N=0,P=e.getParameter(e.VERSION);P.indexOf(`WebGL`)===-1?P.indexOf(`OpenGL ES`)!==-1&&(N=parseFloat(/^OpenGL ES (\d)/.exec(P)[1]),M=N>=2):(N=parseFloat(/^WebGL (\d)/.exec(P)[1]),M=N>=1);let F=null,ee={},te=e.getParameter(e.SCISSOR_BOX),I=e.getParameter(e.VIEWPORT),ne=new Qi().fromArray(te),re=new Qi().fromArray(I);function ie(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ae={};ae[e.TEXTURE_2D]=ie(e.TEXTURE_2D,e.TEXTURE_2D,1),ae[e.TEXTURE_CUBE_MAP]=ie(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ae[e.TEXTURE_2D_ARRAY]=ie(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ae[e.TEXTURE_3D]=ie(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),oe(e.DEPTH_TEST),o.setFunc(3),R(!1),me(1),oe(e.CULL_FACE),fe(0);function oe(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function se(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ce(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function le(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function ue(t){return m!==t&&(e.useProgram(t),m=t,!0)}let L={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};L[103]=e.MIN,L[104]=e.MAX;let de={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function fe(t,n,r,i,a,o,s,c,l,u){if(t===0)h===!0&&(se(e.BLEND),h=!1);else if(h===!1&&(oe(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}}else a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(L[n],L[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(de[r],de[i],de[o],de[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function pe(t,n){t.side===2?se(e.CULL_FACE):oe(e.CULL_FACE);let r=t.side===1;n&&(r=!r),R(r),t.blending===1&&t.transparent===!1?fe(0):fe(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),B(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?oe(e.SAMPLE_ALPHA_TO_COVERAGE):se(e.SAMPLE_ALPHA_TO_COVERAGE)}function R(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function me(t){t===0?se(e.CULL_FACE):(oe(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function z(t){t!==O&&(M&&e.lineWidth(t),O=t)}function B(t,n,r){t?(oe(e.POLYGON_OFFSET_FILL),(k!==n||A!==r)&&(e.polygonOffset(n,r),k=n,A=r)):se(e.POLYGON_OFFSET_FILL)}function he(t){t?oe(e.SCISSOR_TEST):se(e.SCISSOR_TEST)}function ge(t){t===void 0&&(t=e.TEXTURE0+j-1),F!==t&&(e.activeTexture(t),F=t)}function _e(t,n,r){r===void 0&&(r=F===null?e.TEXTURE0+j-1:F);let i=ee[r];i===void 0&&(i={type:void 0,texture:void 0},ee[r]=i),(i.type!==t||i.texture!==n)&&(F!==r&&(e.activeTexture(r),F=r),e.bindTexture(t,n||ae[t]),i.type=t,i.texture=n)}function ve(){let t=ee[F];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function ye(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function be(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function xe(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Se(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ce(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function we(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Te(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ke(t){ne.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ne.copy(t))}function Ae(t){re.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),re.copy(t))}function je(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Me(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Ne(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},F=null,ee={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new G(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,ne.set(0,0,e.canvas.width,e.canvas.height),re.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:oe,disable:se,bindFramebuffer:ce,drawBuffers:le,useProgram:ue,setBlending:fe,setMaterial:pe,setFlipSided:R,setCullFace:me,setLineWidth:z,setPolygonOffset:B,setScissorTest:he,activeTexture:ge,bindTexture:_e,unbindTexture:ve,compressedTexImage2D:ye,compressedTexImage3D:be,texImage2D:De,texImage3D:Oe,updateUBOMapping:je,uniformBlockBinding:Me,texStorage2D:Te,texStorage3D:Ee,texSubImage2D:xe,texSubImage3D:Se,compressedTexSubImage2D:Ce,compressedTexSubImage3D:we,scissor:ke,viewport:Ae,reset:Ne}}function sf(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new H,u=new WeakMap,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function m(e,t){return p?new OffscreenCanvas(e,t):Ni(`canvas`)}function h(e,t,n){let r=1,i=_e(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);d===void 0&&(d=m(n,a));let o=t?m(n,a):d;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function g(e){return e.generateMipmaps}function _(t){e.generateMipmap(t)}function v(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(s=e.R11F_G11F_B10F)),r===e.RGBA){let t=o?Xr:Vi.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function b(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function x(e,t){return g(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function S(e){let t=e.target;t.removeEventListener(`dispose`,S),w(t),t.isVideoTexture&&u.delete(t)}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),E(t)}function w(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=f.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&T(e),Object.keys(i).length===0&&f.delete(n)}r.remove(e)}function T(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=f.get(i);delete a[n.__cacheKey],o.memory.textures--}function E(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let D=0;function O(){D=0}function k(){let e=D;return e>=i.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),D+=1,e}function A(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function j(t,i){let a=r.get(t);if(t.isVideoTexture&&he(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{ae(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function M(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?ae(a,t,i):n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function N(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?ae(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function P(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?oe(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let F={[An]:e.REPEAT,[jn]:e.CLAMP_TO_EDGE,[Mn]:e.MIRRORED_REPEAT},ee={[Nn]:e.NEAREST,[Pn]:e.NEAREST_MIPMAP_NEAREST,[Fn]:e.NEAREST_MIPMAP_LINEAR,[In]:e.LINEAR,[Ln]:e.LINEAR_MIPMAP_NEAREST,[Rn]:e.LINEAR_MIPMAP_LINEAR},te={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function I(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,F[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,F[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,F[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,ee[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,ee[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,te[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function ne(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,S));let i=n.source,a=f.get(i);a===void 0&&(a={},f.set(i,a));let s=A(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&T(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function re(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ie(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=re(n.start,r.width,4),c=re(t.start,r.width,4);n.start<=i+1&&a===c&&re(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=e.getParameter(e.UNPACK_ROW_LENGTH),l=e.getParameter(e.UNPACK_SKIP_PIXELS),u=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;e.pixelStorei(e.UNPACK_SKIP_PIXELS,u),e.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,c),e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function ae(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=ne(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=Vi.getPrimaries(Vi.workingColorSpace),r=o.colorSpace===``?null:Vi.getPrimaries(o.colorSpace),f=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=h(o.image,!1,i.maxTextureSize);p=ge(o,p);let m=a.convert(o.format,o.colorSpace),v=a.convert(o.type),S=y(o.internalFormat,m,v,o.colorSpace,o.isVideoTexture);I(c,o);let C,w=o.mipmaps,T=o.isVideoTexture!==!0,E=d.__version===void 0||l===!0,D=u.dataReady,O=x(o,p);if(o.isDepthTexture)S=b(o.format===nr,o.type),E&&(T?n.texStorage2D(e.TEXTURE_2D,1,S,p.width,p.height):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,null));else if(o.isDataTexture){if(w.length>0){T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data);o.generateMipmaps=!1}else T?(E&&n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height),D&&ie(o,p,m,v)):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,p.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){T&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,w[0].width,w[0].height,p.depth);for(let t=0,r=w.length;t<r;t++)if(C=w[t],o.format!==1023){if(m!==null){if(T){if(D){if(o.layerUpdates.size>0){let r=pl(C.width,C.height,o.format,o.type);for(let i of o.layerUpdates){let a=C.data.subarray(i*r/C.data.BYTES_PER_ELEMENT,(i+1)*r/C.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,C.width,C.height,1,m,a)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,C.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,C.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else T?D&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,v,C.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,m,v,C.data)}else{T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data):m===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,C.data):n.compressedTexImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,C.data)}}else if(o.isDataArrayTexture){if(T){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,p.width,p.height,p.depth),D){if(o.layerUpdates.size>0){let t=pl(p.width,p.height,o.format,o.type);for(let r of o.layerUpdates){let i=p.data.subarray(r*t/p.data.BYTES_PER_ELEMENT,(r+1)*t/p.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,p.width,p.height,1,m,v,i)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,S,p.width,p.height,p.depth,0,m,v,p.data)}else if(o.isData3DTexture)T?(E&&n.texStorage3D(e.TEXTURE_3D,O,S,p.width,p.height,p.depth),D&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)):n.texImage3D(e.TEXTURE_3D,0,S,p.width,p.height,p.depth,0,m,v,p.data);else if(o.isFramebufferTexture){if(E){if(T)n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height);else{let t=p.width,r=p.height;for(let i=0;i<O;i++)n.texImage2D(e.TEXTURE_2D,i,S,t,r,0,m,v,null),t>>=1,r>>=1}}}else if(w.length>0){if(T&&E){let t=_e(w[0]);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m,v,C):n.texImage2D(e.TEXTURE_2D,t,S,m,v,C);o.generateMipmaps=!1}else if(T){if(E){let t=_e(p);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,m,v,p)}else n.texImage2D(e.TEXTURE_2D,0,S,m,v,p);g(o)&&_(c),d.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function oe(t,o,s){if(o.image.length!==6)return;let c=ne(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=Vi.getPrimaries(Vi.workingColorSpace),r=o.colorSpace===``?null:Vi.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=h(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=ge(o,m[e]);let v=m[0],b=a.convert(o.format,o.colorSpace),S=a.convert(o.type),C=y(o.internalFormat,b,S,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=x(o,v);I(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,v.width,v.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,b,S,i.data):b===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=_e(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,b,S,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,b,S,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,b,S,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,b,S,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,b,S,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,b,S,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,b,S,i.image[t])}}}g(o)&&_(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function se(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=y(o.internalFormat,d,f,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),B(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,z(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function ce(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=b(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=z(n);B(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=y(o.internalFormat,c,l,o.colorSpace),d=z(n);r&&B(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):B(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function le(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let a=r.get(i.depthTexture);a.__renderTarget=i,(!a.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),j(i.depthTexture,0);let o=a.__webglTexture,c=z(i);if(i.depthTexture.format===1026)B(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0);else if(i.depthTexture.format===1027)B(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0);else throw Error(`Unknown depthTexture format`)}function ue(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?le(i.__webglFramebuffer[0],t):le(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),ce(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),ce(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function L(t,n,i){let a=r.get(t);n!==void 0&&se(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&ue(t)}function de(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,C);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&B(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=y(r.internalFormat,i,o,r.colorSpace,t.isXRRenderTarget===!0),u=z(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),ce(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),I(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)se(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else se(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);g(i)&&_(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),I(c,a),se(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),g(a)&&_(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),I(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)se(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else se(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);g(i)&&_(r),n.unbindTexture()}t.depthBuffer&&ue(t)}function fe(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(g(a)){let t=v(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),_(t),n.unbindTexture()}}}let pe=[],R=[];function me(t){if(t.samples>0){if(B(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(pe.length=0,R.length=0,pe.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(pe.push(l),R.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,R)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,pe))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function z(e){return Math.min(i.maxSamples,e.samples)}function B(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function he(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function ge(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Vi.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function _e(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=O,this.setTexture2D=j,this.setTexture2DArray=M,this.setTexture3D=N,this.setTextureCube=P,this.rebindTextures=L,this.setupRenderTarget=de,this.updateRenderTargetMipmap=fe,this.updateMultisampleRenderTarget=me,this.setupDepthRenderbuffer=ue,this.setupFrameBufferTexture=se,this.useMultisampledRTT=B}function cf(e,t){function n(n,r=``){let i,a=Vi.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var lf=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,uf=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,df=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new xc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new us({vertexShader:lf,fragmentShader:uf,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new $o(new wc(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ff=class extends ti{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new df,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new H,C=null,w=new hs;w.viewport=new Qi;let T=new hs;T.viewport=new Qi;let E=[w,T],D=new $c,O=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new Cs,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new Cs,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new Cs,b[e]=t),t.getHandSpace()};function A(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function j(){r.removeEventListener(`select`,A),r.removeEventListener(`selectstart`,A),r.removeEventListener(`selectend`,A),r.removeEventListener(`squeeze`,A),r.removeEventListener(`squeezestart`,A),r.removeEventListener(`squeezeend`,A),r.removeEventListener(`end`,j),r.removeEventListener(`inputsourceschange`,M);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}O=null,k=null,h.reset();for(let e in g)delete g[e];e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,re.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,A),r.addEventListener(`selectstart`,A),r.addEventListener(`selectend`,A),r.addEventListener(`squeeze`,A),r.addEventListener(`squeezestart`,A),r.addEventListener(`squeezeend`,A),r.addEventListener(`end`,j),r.addEventListener(`inputsourceschange`,M),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?nr:tr,a=_.stencil?Yn:Wn);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new ea(d.textureWidth,d.textureHeight,{format:er,type:zn,depthTexture:new bc(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new ea(f.framebufferWidth,f.framebufferHeight,{format:er,type:zn,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),re.setContext(r),re.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function M(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let N=new U,P=new U;function F(e,t,n){N.setFromMatrixPosition(t.matrixWorld),P.setFromMatrixPosition(n.matrixWorld);let r=N.distanceTo(P),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ee(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),D.near=T.near=w.near=t,D.far=T.far=w.far=n,(O!==D.near||k!==D.far)&&(r.updateRenderState({depthNear:D.near,depthFar:D.far}),O=D.near,k=D.far),D.layers.mask=e.layers.mask|6,w.layers.mask=D.layers.mask&3,T.layers.mask=D.layers.mask&5;let i=e.parent,a=D.cameras;ee(D,i);for(let e=0;e<a.length;e++)ee(a[e],i);a.length===2?F(D,w,T):D.projectionMatrix.copy(w.projectionMatrix),te(e,D,i)};function te(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=ai*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(D)},this.getCameraTexture=function(e){return g[e]};let I=null;function ne(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==D.cameras.length&&(D.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=E[n];o===void 0&&(o=new hs,o.layers.enable(n),o.viewport=new Qi,E[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(D.matrix.copy(o.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),i===!0&&D.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new xc,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}I&&I(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let re=new hl;re.setAnimationLoop(ne),this.setAnimationLoop=function(e){I=e},this.dispose=function(){}}},pf=new Ba,mf=new Aa;function hf(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,os(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,pf.copy(o),pf.x*=-1,pf.y*=-1,pf.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(pf.y*=-1,pf.z*=-1),e.envMapRotation.value.setFromMatrix4(mf.makeRotationFromEuler(pf)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function gf(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var _f=class{constructor(e={}){let{canvas:t=Pi(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);f=n.getContextAttributes().alpha}else f=a;let p=new Uint32Array(4),m=new Int32Array(4),h=null,g=null,_=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,b=!1;this._outputColorSpace=Jr;let x=0,S=0,C=null,w=-1,T=null,E=new Qi,D=new Qi,O=null,k=new G(0),A=0,j=t.width,M=t.height,N=1,P=null,F=null,ee=new Qi(0,0,j,M),te=new Qi(0,0,j,M),I=!1,ne=new Qs,re=!1,ie=!1,ae=new Aa,oe=new U,se=new Qi,ce={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},le=!1;function ue(){return C===null?N:1}let L=n;function de(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,Fe,!1),t.addEventListener(`webglcontextrestored`,Ie,!1),t.addEventListener(`webglcontextcreationerror`,Le,!1),L===null){let t=`webgl2`;if(L=de(t,e),L===null)throw de(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let fe,pe,R,me,z,B,he,ge,_e,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me;function Ne(){fe=new Yl(L),fe.init(),Ae=new cf(L,fe),pe=new wl(L,fe,e,Ae),R=new of(L,fe),pe.reversedDepthBuffer&&d&&R.buffers.depth.setReversed(!0),me=new Ql(L),z=new Ud,B=new sf(L,fe,R,z,pe,Ae,me),he=new El(y),ge=new Jl(y),_e=new gl(L),je=new Sl(L,_e),ve=new Xl(L,_e,me,je),ye=new eu(L,ve,_e,me),De=new $l(L,pe,B),we=new Tl(z),be=new Hd(y,he,ge,fe,pe,je,we),xe=new hf(y,z),Se=new qd,Ce=new ef(fe),Ee=new xl(y,he,ge,R,ye,f,s),Te=new rf(y,ye,pe),Me=new gf(L,me,pe,R),Oe=new Cl(L,fe,me),ke=new Zl(L,fe,me),me.programs=be.programs,y.capabilities=pe,y.extensions=fe,y.properties=z,y.renderLists=Se,y.shadowMap=Te,y.state=R,y.info=me}Ne();let Pe=new ff(y,L);this.xr=Pe,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let e=fe.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=fe.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return N},this.setPixelRatio=function(e){e!==void 0&&(N=e,this.setSize(j,M,!1))},this.getSize=function(e){return e.set(j,M)},this.setSize=function(e,n,r=!0){Pe.isPresenting?console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`):(j=e,M=n,t.width=Math.floor(e*N),t.height=Math.floor(n*N),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(j*N,M*N).floor()},this.setDrawingBufferSize=function(e,n,r){j=e,M=n,N=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(E)},this.getViewport=function(e){return e.copy(ee)},this.setViewport=function(e,t,n,r){e.isVector4?ee.set(e.x,e.y,e.z,e.w):ee.set(e,t,n,r),R.viewport(E.copy(ee).multiplyScalar(N).round())},this.getScissor=function(e){return e.copy(te)},this.setScissor=function(e,t,n,r){e.isVector4?te.set(e.x,e.y,e.z,e.w):te.set(e,t,n,r),R.scissor(D.copy(te).multiplyScalar(N).round())},this.getScissorTest=function(){return I},this.setScissorTest=function(e){R.setScissorTest(I=e)},this.setOpaqueSort=function(e){P=e},this.setTransparentSort=function(e){F=e},this.getClearColor=function(e){return e.copy(Ee.getClearColor())},this.setClearColor=function(){Ee.setClearColor(...arguments)},this.getClearAlpha=function(){return Ee.getClearAlpha()},this.setClearAlpha=function(){Ee.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(C!==null){let t=C.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=C.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=Ee.getClearColor(),r=Ee.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(p[0]=i,p[1]=a,p[2]=o,p[3]=r,L.clearBufferuiv(L.COLOR,0,p)):(m[0]=i,m[1]=a,m[2]=o,m[3]=r,L.clearBufferiv(L.COLOR,0,m))}else r|=L.COLOR_BUFFER_BIT}t&&(r|=L.DEPTH_BUFFER_BIT),n&&(r|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Fe,!1),t.removeEventListener(`webglcontextrestored`,Ie,!1),t.removeEventListener(`webglcontextcreationerror`,Le,!1),Ee.dispose(),Se.dispose(),Ce.dispose(),z.dispose(),he.dispose(),ge.dispose(),ye.dispose(),je.dispose(),Me.dispose(),be.dispose(),Pe.dispose(),Pe.removeEventListener(`sessionstart`,We),Pe.removeEventListener(`sessionend`,Ge),Ke.stop()};function Fe(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),b=!0}function Ie(){console.log(`THREE.WebGLRenderer: Context Restored.`),b=!1;let e=me.autoReset,t=Te.enabled,n=Te.autoUpdate,r=Te.needsUpdate,i=Te.type;Ne(),me.autoReset=e,Te.enabled=t,Te.autoUpdate=n,Te.needsUpdate=r,Te.type=i}function Le(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Re(e){let t=e.target;t.removeEventListener(`dispose`,Re),ze(t)}function ze(e){Be(e),z.remove(e)}function Be(e){let t=z.get(e).programs;t!==void 0&&(t.forEach(function(e){be.releaseProgram(e)}),e.isShaderMaterial&&be.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=ce);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=tt(e,t,n,r,i);R.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=ve.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;je.setup(i,r,s,n,c);let h,g=Oe;if(c!==null&&(h=_e.get(c),g=ke,g.setIndex(h)),i.isMesh)r.wireframe===!0?(R.setLineWidth(r.wireframeLinewidth*ue()),g.setMode(L.LINES)):g.setMode(L.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),R.setLineWidth(e*ue()),i.isLineSegments?g.setMode(L.LINES):i.isLineLoop?g.setMode(L.LINE_LOOP):g.setMode(L.LINE_STRIP)}else i.isPoints?g.setMode(L.POINTS):i.isSprite&&g.setMode(L.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)Ii(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(fe.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?_e.get(c).bytesPerElement:1,o=z.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(L,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Ve(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Qe(e,t,n),e.side=0,e.needsUpdate=!0,Qe(e,t,n),e.side=2):Qe(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),g=Ce.get(n),g.init(t),v.push(g),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),g.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Ve(a,n,e),r.add(a)}else Ve(t,n,e),r.add(t)}}),g=v.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){z.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}fe.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let He=null;function Ue(e){He&&He(e)}function We(){Ke.stop()}function Ge(){Ke.start()}let Ke=new hl;Ke.setAnimationLoop(Ue),typeof self<`u`&&Ke.setContext(self),this.setAnimationLoop=function(e){He=e,Pe.setAnimationLoop(e),e===null?Ke.stop():Ke.start()},Pe.addEventListener(`sessionstart`,We),Pe.addEventListener(`sessionend`,Ge),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(b===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Pe.enabled===!0&&Pe.isPresenting===!0&&(Pe.cameraAutoUpdate===!0&&Pe.updateCamera(t),t=Pe.getCamera()),e.isScene===!0&&e.onBeforeRender(y,e,t,C),g=Ce.get(e,v.length),g.init(t),v.push(g),ae.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),ne.setFromProjectionMatrix(ae,ei,t.reversedDepth),ie=this.localClippingEnabled,re=we.init(this.clippingPlanes,ie),h=Se.get(e,_.length),h.init(),_.push(h),Pe.enabled===!0&&Pe.isPresenting===!0){let e=y.xr.getDepthSensingMesh();e!==null&&qe(e,t,-1/0,y.sortObjects)}qe(e,t,0,y.sortObjects),h.finish(),y.sortObjects===!0&&h.sort(P,F),le=Pe.enabled===!1||Pe.isPresenting===!1||Pe.hasDepthSensing()===!1,le&&Ee.addToRenderList(h,e),this.info.render.frame++,re===!0&&we.beginShadows();let n=g.state.shadowsArray;Te.render(n,e,t),re===!0&&we.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=h.opaque,i=h.transmissive;if(g.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];Ye(r,i,e,a)}le&&Ee.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];Je(h,e,r,r.viewport)}}else i.length>0&&Ye(r,i,e,t),le&&Ee.render(e),Je(h,e,t);C!==null&&S===0&&(B.updateMultisampleRenderTarget(C),B.updateRenderTargetMipmap(C)),e.isScene===!0&&e.onAfterRender(y,e,t),je.resetDefaultState(),w=-1,T=null,v.pop(),v.length>0?(g=v[v.length-1],re===!0&&we.setGlobalState(y.clippingPlanes,g.state.camera)):g=null,_.pop(),h=_.length>0?_[_.length-1]:null};function qe(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)g.pushLight(e),e.castShadow&&g.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||ne.intersectsSprite(e)){r&&se.setFromMatrixPosition(e.matrixWorld).applyMatrix4(ae);let t=ye.update(e),i=e.material;i.visible&&h.push(e,t,i,n,se.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||ne.intersectsObject(e))){let t=ye.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),se.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),se.copy(e.boundingSphere.center)),se.applyMatrix4(e.matrixWorld).applyMatrix4(ae)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&h.push(e,t,s,n,se.z,o)}}else i.visible&&h.push(e,t,i,n,se.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)qe(i[e],t,n,r)}function Je(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;g.setupLightsView(n),re===!0&&we.setGlobalState(y.clippingPlanes,n),r&&R.viewport(E.copy(r)),i.length>0&&Xe(i,t,n),a.length>0&&Xe(a,t,n),o.length>0&&Xe(o,t,n),R.buffers.depth.setTest(!0),R.buffers.depth.setMask(!0),R.buffers.color.setMask(!0),R.setPolygonOffset(!1)}function Ye(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[r.id]===void 0&&(g.state.transmissionRenderTarget[r.id]=new ea(1,1,{generateMipmaps:!0,type:fe.has(`EXT_color_buffer_half_float`)||fe.has(`EXT_color_buffer_float`)?Kn:zn,minFilter:Rn,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Vi.workingColorSpace}));let a=g.state.transmissionRenderTarget[r.id],o=r.viewport||E;a.setSize(o.z*y.transmissionResolutionScale,o.w*y.transmissionResolutionScale);let s=y.getRenderTarget(),c=y.getActiveCubeFace(),l=y.getActiveMipmapLevel();y.setRenderTarget(a),y.getClearColor(k),A=y.getClearAlpha(),A<1&&y.setClearColor(16777215,.5),y.clear(),le&&Ee.render(n);let u=y.toneMapping;y.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),g.setupLightsView(r),re===!0&&we.setGlobalState(y.clippingPlanes,r),Xe(e,n,r),B.updateMultisampleRenderTarget(a),B.updateRenderTargetMipmap(a),fe.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,Ze(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(B.updateMultisampleRenderTarget(a),B.updateRenderTargetMipmap(a))}y.setRenderTarget(s,c,l),y.setClearColor(k,A),d!==void 0&&(r.viewport=d),y.toneMapping=u}function Xe(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&Ze(o,t,n,s,l,c)}}function Ze(e,t,n,r,i,a){e.onBeforeRender(y,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(y,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=2):y.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(y,t,n,r,i,a)}function Qe(e,t,n){t.isScene!==!0&&(t=ce);let r=z.get(e),i=g.state.lights,a=g.state.shadowsArray,o=i.state.version,s=be.getParameters(e,i.state,a,t,n),c=be.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?ge:he).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Re),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return et(e,s),u}else s.uniforms=be.getUniforms(e),e.onBeforeCompile(s,y),u=be.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=we.uniform),et(e,s),r.needsLights=rt(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function $e(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=sd.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function et(e,t){let n=z.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function tt(e,t,n,r,i){t.isScene!==!0&&(t=ce),B.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=C===null?y.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:Yr,c=(r.isMeshStandardMaterial?ge:he).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(m=y.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=h===void 0?0:h.length,v=z.get(r),b=g.state.lights;if(re===!0&&(ie===!0||e!==T)){let t=e===T&&r.id===w;we.setState(r,e,t)}let x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version?x=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?x=!0:v.envMap===c?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==we.numPlanes||v.numIntersection!==we.numIntersection)?x=!0:v.vertexAlphas===l&&v.vertexTangents===u&&v.morphTargets===d&&v.morphNormals===f&&v.morphColors===p&&v.toneMapping===m?v.morphTargetsCount!==_&&(x=!0):x=!0:x=!0:x=!0:(x=!0,v.__version=r.version);let S=v.currentProgram;x===!0&&(S=Qe(r,t,i));let E=!1,D=!1,O=!1,k=S.getUniforms(),A=v.uniforms;if(R.useProgram(S.program)&&(E=!0,D=!0,O=!0),r.id!==w&&(w=r.id,D=!0),E||T!==e){R.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),k.setValue(L,`projectionMatrix`,e.projectionMatrix),k.setValue(L,`viewMatrix`,e.matrixWorldInverse);let t=k.map.cameraPosition;t!==void 0&&t.setValue(L,oe.setFromMatrixPosition(e.matrixWorld)),pe.logarithmicDepthBuffer&&k.setValue(L,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&k.setValue(L,`isOrthographic`,e.isOrthographicCamera===!0),T!==e&&(T=e,D=!0,O=!0)}if(i.isSkinnedMesh){k.setOptional(L,i,`bindMatrix`),k.setOptional(L,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),k.setValue(L,`boneTexture`,e.boneTexture,B))}i.isBatchedMesh&&(k.setOptional(L,i,`batchingTexture`),k.setValue(L,`batchingTexture`,i._matricesTexture,B),k.setOptional(L,i,`batchingIdTexture`),k.setValue(L,`batchingIdTexture`,i._indirectTexture,B),k.setOptional(L,i,`batchingColorTexture`),i._colorsTexture!==null&&k.setValue(L,`batchingColorTexture`,i._colorsTexture,B));let j=n.morphAttributes;if((j.position!==void 0||j.normal!==void 0||j.color!==void 0)&&De.update(i,n,S),(D||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,k.setValue(L,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(A.envMap.value=c,A.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),D&&(k.setValue(L,`toneMappingExposure`,y.toneMappingExposure),v.needsLights&&nt(A,O),a&&r.fog===!0&&xe.refreshFogUniforms(A,a),xe.refreshMaterialUniforms(A,r,N,M,g.state.transmissionRenderTarget[e.id]),sd.upload(L,$e(v),A,B)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(sd.upload(L,$e(v),A,B),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&k.setValue(L,`center`,i.center),k.setValue(L,`modelViewMatrix`,i.modelViewMatrix),k.setValue(L,`normalMatrix`,i.normalMatrix),k.setValue(L,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Me.update(n,S),Me.bind(n,S)}}return S}function nt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function rt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return x},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(e,t,n){let r=z.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),z.get(e.texture).__webglTexture=t,z.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=z.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let it=L.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){C=e,x=t,S=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=z.get(e);if(s.__useDefaultFramebuffer!==void 0)R.bindFramebuffer(L.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)B.setupRenderTarget(e);else if(s.__hasExternalTextures)B.rebindTextures(e,z.get(e.texture).__webglTexture,z.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&z.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);B.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=z.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&B.useMultisampledRTT(e)===!1?z.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,E.copy(e.viewport),D.copy(e.scissor),O=e.scissorTest}else E.copy(ee).multiplyScalar(N).floor(),D.copy(te).multiplyScalar(N).floor(),O=I;if(n!==0&&(i=it),R.bindFramebuffer(L.FRAMEBUFFER,i)&&r&&R.drawBuffers(e,i),R.viewport(E),R.scissor(D),R.setScissorTest(O),a){let r=z.get(e.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=z.get(e.textures[t]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=z.get(e.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,t.__webglTexture,n)}w=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=z.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){R.bindFramebuffer(L.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!pe.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!pe.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+s),L.readPixels(t,n,r,i,Ae.convert(c),Ae.convert(l),a))}finally{let e=C===null?null:z.get(C).__webglFramebuffer;R.bindFramebuffer(L.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=z.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){R.bindFramebuffer(L.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!pe.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!pe.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,d),L.bufferData(L.PIXEL_PACK_BUFFER,a.byteLength,L.STREAM_READ),e.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+s),L.readPixels(t,n,r,i,Ae.convert(l),Ae.convert(u),0);let f=C===null?null:z.get(C).__webglFramebuffer;R.bindFramebuffer(L.FRAMEBUFFER,f);let p=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Li(L,p,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,d),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,a),L.deleteBuffer(d),L.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;B.setTexture2D(e,0),L.copyTexSubImage2D(L.TEXTURE_2D,n,0,0,o,s,i,a),R.unbindTexture()};let at=L.createFramebuffer(),ot=L.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(Ii(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Ae.convert(t.format),_=Ae.convert(t.type),v;t.isData3DTexture?(B.setTexture3D(t,0),v=L.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(B.setTexture2DArray(t,0),v=L.TEXTURE_2D_ARRAY):(B.setTexture2D(t,0),v=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,t.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,t.unpackAlignment);let y=L.getParameter(L.UNPACK_ROW_LENGTH),b=L.getParameter(L.UNPACK_IMAGE_HEIGHT),x=L.getParameter(L.UNPACK_SKIP_PIXELS),S=L.getParameter(L.UNPACK_SKIP_ROWS),C=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,h.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,h.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,l),L.pixelStorei(L.UNPACK_SKIP_ROWS,u),L.pixelStorei(L.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=z.get(e),r=z.get(t),h=z.get(n.__renderTarget),g=z.get(r.__renderTarget);R.bindFramebuffer(L.READ_FRAMEBUFFER,h.__webglFramebuffer),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,z.get(e).__webglTexture,i,d+n),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,z.get(t).__webglTexture,a,m+n)),L.blitFramebuffer(l,u,o,s,f,p,o,s,L.DEPTH_BUFFER_BIT,L.NEAREST);R.bindFramebuffer(L.READ_FRAMEBUFFER,null),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||z.has(e)){let n=z.get(e),r=z.get(t);R.bindFramebuffer(L.READ_FRAMEBUFFER,at),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,ot);for(let e=0;e<c;e++)w?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,n.__webglTexture,i),T?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,r.__webglTexture,a),i===0?T?L.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):L.copyTexSubImage2D(v,a,f,p,l,u,o,s):L.blitFramebuffer(l,u,o,s,f,p,o,s,L.COLOR_BUFFER_BIT,L.NEAREST);R.bindFramebuffer(L.READ_FRAMEBUFFER,null),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?L.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?L.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):L.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):L.texSubImage2D(L.TEXTURE_2D,a,f,p,o,s,g,_,h);L.pixelStorei(L.UNPACK_ROW_LENGTH,y),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,b),L.pixelStorei(L.UNPACK_SKIP_PIXELS,x),L.pixelStorei(L.UNPACK_SKIP_ROWS,S),L.pixelStorei(L.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&L.generateMipmap(v),R.unbindTexture()},this.initRenderTarget=function(e){z.get(e).__webglFramebuffer===void 0&&B.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?B.setTextureCube(e,0):e.isData3DTexture?B.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?B.setTexture2DArray(e,0):B.setTexture2D(e,0),R.unbindTexture()},this.resetState=function(){x=0,S=0,C=null,R.reset(),je.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return ei}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Vi._getDrawingBufferColorSpace(e),t.unpackColorSpace=Vi._getUnpackColorSpace()}};function vf(e,t){let n=document.createElement(`canvas`);n.width=n.height=e,t(n.getContext(`2d`),e);let r=new yc(n);return r.colorSpace=Jr,r}function yf(){return vf(64,(e,t)=>{let n=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);n.addColorStop(0,`rgba(255,255,255,1)`),n.addColorStop(.25,`rgba(255,255,255,0.8)`),n.addColorStop(1,`rgba(255,255,255,0)`),e.fillStyle=n,e.fillRect(0,0,t,t)})}function bf(){return vf(128,(e,t)=>{e.translate(t/2,t/2),e.beginPath();for(let n=0;n<18;n++){let r=n%2==0?t*(.42+n*7%5*.012):t*.2,i=n/18*Math.PI*2;e.lineTo(Math.cos(i)*r,Math.sin(i)*r)}e.closePath(),e.lineJoin=`round`,e.lineWidth=7,e.strokeStyle=`#1a1a1a`,e.fillStyle=`#ffe14d`,e.fill(),e.stroke(),e.beginPath(),e.arc(0,0,t*.11,0,Math.PI*2),e.fillStyle=`#fff`,e.fill()})}function xf(){return vf(128,(e,t)=>{e.translate(t/2,t/2),e.lineWidth=9,e.strokeStyle=`#ffffff`,e.beginPath(),e.arc(0,0,t*.42,0,Math.PI*2),e.stroke(),e.lineWidth=2.5,e.strokeStyle=`#1a1a1a`;for(let n of[.38,.42+.04])e.beginPath(),e.arc(0,0,t*n,0,Math.PI*2),e.stroke()})}function Sf(){return vf(64,(e,t)=>{e.beginPath(),e.arc(t/2,t/2,t*.36,0,Math.PI*2),e.fillStyle=`#ffffff`,e.fill(),e.lineWidth=5,e.strokeStyle=`#1a1a1a`,e.stroke()})}function Cf(){return vf(128,(e,t)=>{e.translate(t/2,t/2);for(let n=0;n<10;n++)e.strokeStyle=`rgba(255,255,255,${.1+n*.09})`,e.lineWidth=3+n*1.2,e.beginPath(),e.arc(0,0,t*.38,-Math.PI*.75+n*.09,-Math.PI*.75+.9+n*.09),e.stroke()})}var wf=class{cap;ps=[];geo=new Vo;pos;col;siz;alp;points;mat;constructor(e,t,n=1500){this.cap=n,this.pos=new Float32Array(n*3),this.col=new Float32Array(n*3),this.siz=new Float32Array(n),this.alp=new Float32Array(n),this.geo.setAttribute(`position`,new Ao(this.pos,3)),this.geo.setAttribute(`color`,new Ao(this.col,3)),this.geo.setAttribute(`psize`,new Ao(this.siz,1)),this.geo.setAttribute(`alpha`,new Ao(this.alp,1)),this.mat=new us({uniforms:{map:{value:e},scale:{value:400}},vertexShader:`
        attribute float psize; attribute float alpha; attribute vec3 color;
        varying float vA; varying vec3 vC; uniform float scale;
        void main() {
          vA = alpha; vC = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = psize * scale / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,fragmentShader:`
        uniform sampler2D map; varying float vA; varying vec3 vC;
        void main() {
          vec4 t = texture2D(map, gl_PointCoord);
          if (t.a < 0.05) discard;
          gl_FragColor = vec4(vC * t.rgb, t.a * vA);
        }`,transparent:!0,depthWrite:!1,blending:t?2:1}),this.points=new _c(this.geo,this.mat),this.points.frustumCulled=!1}setScale(e){this.mat.uniforms.scale.value=e*.9}emit(e){let t=new G(e.color),n=e.spread??1,[r,i,a]=e.dir??[0,1,0];for(let o=0;o<e.count&&this.ps.length<this.cap;o++){let o=Math.random()*2-1,s=Math.random()*2-1,c=Math.random()*2-1,l=r*(1-n)+o*n,u=i*(1-n)+s*n,d=a*(1-n)+c*n,f=Math.hypot(l,u,d)||1,p=e.speed*(.5+Math.random()*.7);l=l/f*p,u=u/f*p+(e.up??0),d=d/f*p;let m=(e.life??.5)*(.6+Math.random()*.6);this.ps.push({x:e.x,y:e.y,z:e.z,vx:l,vy:u,vz:d,life:m,max:m,size:(e.size??.3)*(.7+Math.random()*.6),grow:e.grow??0,r:t.r,g:t.g,b:t.b,gravity:e.gravity??0,drag:e.drag??2})}}update(e){let t=0,n=[];for(let r of this.ps){if(r.life-=e,r.life<=0)continue;let i=Math.exp(-r.drag*e);r.vx*=i,r.vy=r.vy*i-r.gravity*e,r.vz*=i,r.x+=r.vx*e,r.y+=r.vy*e,r.z+=r.vz*e,r.y<.02&&(r.y=.02,r.vy=Math.abs(r.vy)*.3),r.size=Math.max(0,r.size+r.grow*e),n.push(r);let a=r.life/r.max;this.pos[t*3]=r.x,this.pos[t*3+1]=r.y,this.pos[t*3+2]=r.z,this.col[t*3]=r.r,this.col[t*3+1]=r.g,this.col[t*3+2]=r.b,this.siz[t]=r.size,this.alp[t]=Math.min(1,a*1.6),t++}this.ps=n,this.geo.setDrawRange(0,t);for(let e of[`position`,`color`,`psize`,`alpha`])this.geo.getAttribute(e).needsUpdate=!0}dispose(){this.geo.dispose(),this.mat.dispose()}},Tf=class{layer;items=[];constructor(e){this.layer=e}add(e,t,n){let r=document.createElement(`div`);r.className=`pop ${n}`,r.textContent=e,this.layer.appendChild(r),this.items.push({el:r,pos:t.clone(),t:0})}update(e,t,n,r){this.items=this.items.filter(i=>{if(i.t+=e,i.t>.9)return i.el.remove(),!1;let a=i.pos.clone().project(t);return i.el.style.transform=`translate(${(a.x+1)/2*n}px, ${(1-a.y)/2*r-i.t*60}px) translate(-50%, -50%)`,i.el.style.opacity=String(Math.min(1,(.9-i.t)*4)),!0})}clear(){for(let e of this.items)e.el.remove();this.items=[]}};function Ef(e,t){let n=document.createElement(`canvas`);n.width=n.height=e,t(n.getContext(`2d`),e);let r=new yc(n);return r.colorSpace=Jr,r}function Df(e){return Ef(128,(t,n)=>{let r=n*.42;t.translate(n/2,n/2),t.beginPath(),t.arc(0,0,r,0,Math.PI*2),t.fillStyle=e,t.fill(),t.lineWidth=7,t.strokeStyle=`#1a1a1a`,t.stroke(),t.beginPath(),t.ellipse(-r*.35,-r*.4,r*.28,r*.17,-.6,0,Math.PI*2),t.fillStyle=`rgba(255,255,255,0.85)`,t.fill(),t.fillStyle=`#1a1a1a`;for(let e of[-1,1])t.beginPath(),t.ellipse(e*r*.3,r*.05,r*.1,r*.16,0,0,Math.PI*2),t.fill(),t.lineWidth=6,t.beginPath(),t.moveTo(e*r*.52,-r*.22),t.lineTo(e*r*.12,-r*.08),t.stroke()})}function Of(){return Ef(128,(e,t)=>{e.translate(t/2,t/2),e.beginPath();for(let n=0;n<=28;n++){let r=n%2==0?t*.48:t*.38,i=n/28*Math.PI*2;e.lineTo(Math.cos(i)*r,Math.sin(i)*r)}e.arc(0,0,t*.3,0,Math.PI*2,!0),e.fillStyle=`#e9ecef`,e.fill(`evenodd`),e.lineWidth=4,e.strokeStyle=`#1a1a1a`,e.stroke()})}function kf(){return Ef(128,(e,t)=>{e.translate(t/2,t/2);for(let n=0;n<10;n++){let r=n/10*Math.PI*2;e.save(),e.rotate(r),e.translate(t*.4,0),e.rotate(n%2?0:Math.PI/2),e.beginPath(),e.ellipse(0,0,t*.085,t*.05,0,0,Math.PI*2),e.lineWidth=9,e.strokeStyle=`#1a1a1a`,e.stroke(),e.lineWidth=5,e.strokeStyle=`#ffd43b`,e.stroke(),e.restore()}})}function Af(){return Ef(128,(e,t)=>{e.translate(t/2,t/2),e.lineWidth=6,e.strokeStyle=`#ff3b3b`,e.setLineDash([12,8]),e.beginPath(),e.arc(0,0,t*.42,0,Math.PI*2),e.stroke(),e.setLineDash([]),e.beginPath(),e.arc(0,0,t*.2,0,Math.PI*2),e.stroke();for(let n=0;n<4;n++)e.rotate(Math.PI/2),e.beginPath(),e.moveTo(t*.26,0),e.lineTo(t*.48,0),e.stroke()})}var jf=class{balls;saw=Of();chain=kf();marker=Af();constructor(e){this.balls=e.map(e=>Df(e))}dispose(){for(let e of[...this.balls,this.saw,this.chain,this.marker])e.dispose()}},Mf=(e,t)=>e.spec.tags.includes(t),Nf=class{color;ownerSees;group=new xs;ball;halo;shadow;saws=[];chains=[];marker=null;mats=[];prev=new U;hue=Math.random();constructor(e,t,n,r,i,a){this.color=t,this.ownerSees=a;let o=new ks({map:n.balls[e.owner],transparent:!0,depthWrite:!1}),s=new ks({map:r,color:t,transparent:!0,depthWrite:!1,blending:2}),c=new Eo({color:0,transparent:!0,opacity:.25,depthWrite:!1});if(this.mats.push(o,s,c),this.ball=new Us(o),this.halo=new Us(s),this.shadow=new $o(i,c),this.shadow.rotation.x=-Math.PI/2,this.group.add(this.shadow,this.halo,this.ball),Mf(e,`multi`))for(let e=0;e<2;e++){let e=new ks({map:n.saw,transparent:!0,depthWrite:!1});this.mats.push(e);let t=new Us(e);this.saws.push(t),this.group.add(t)}if(Mf(e,`restrain`))for(let e=0;e<3;e++){let e=new ks({map:n.chain,transparent:!0,depthWrite:!1});this.mats.push(e);let t=new Us(e);this.chains.push(t),this.group.add(t)}if(e.spec.meteor){let e=new Eo({map:n.marker,transparent:!0,depthWrite:!1});this.mats.push(e),this.marker=new $o(new wc(1,1),e),this.marker.rotation.x=-Math.PI/2,this.marker.visible=!1,this.group.add(this.marker)}this.prev.set(e.x,e.h,e.z)}update(e,t,n,r,i){let a=e.spec,o=a.visible||this.ownerSees,s=!a.visible,c=new U(e.x,e.h,e.z),l=c.clone().sub(this.prev);if(this.prev.copy(c),this.group.visible=o,!o){this.marker&&(this.marker.visible=!1);return}let u=a.size,d=1+Math.sin(t*18+e.id)*.08;Mf(e,`giant`)&&(d+=Math.sin(t*5+e.id)*.06),this.ball.position.copy(c),this.halo.position.copy(c),this.ball.scale.setScalar(u*2.3*d),this.halo.scale.setScalar(u*(Mf(e,`tiny`)?9:5)*d);let f=this.ball.material;if(f.opacity=s?.3:1,this.halo.material.opacity=s?0:.9,f.rotation=Mf(e,`giant`)?Math.sin(t*3)*.3:Math.sin(t*9+e.id)*.15,Mf(e,`fast`)){let e=c.clone().project(n),t=c.clone().add(l).project(n);f.rotation=Math.atan2(t.y-e.y,t.x-e.x),this.ball.scale.x=u*2.3*1.8,this.ball.scale.y=u*2.3*.75}let p=Math.max(0,e.h);if(this.shadow.position.set(e.x,.016,e.z),this.shadow.scale.setScalar(u*Math.max(.5,1.2-p/10)),this.shadow.material.opacity=s?0:Math.max(.12,.35-p*.025),this.saws.forEach((e,n)=>{e.position.copy(c),e.scale.setScalar(u*(3.2+n*.7)),e.material.rotation=t*(n?-14:18),e.material.opacity=s?.2:1}),this.chains.forEach((n,r)=>{let i=t*4+r/3*Math.PI*2;n.position.set(e.x+Math.cos(i)*u*1.6,e.h+Math.sin(i*1.3)*u*.6,e.z+Math.sin(i)*u*1.6),n.scale.setScalar(u*1.4),n.material.rotation=i,n.material.opacity=s?.2:1}),this.marker){let n=e.age>=45;this.marker.visible=!s&&e.age>=30;let r=n?e.tx:e.x,i=n?e.tz:e.z;this.marker.position.set(r,.04,i),this.marker.scale.setScalar(u*2.5+1+Math.sin(t*14)*.15),this.marker.rotation.z=t*2}if(s)return;let m=new G(this.color);Mf(e,`homing`)&&(this.hue=(this.hue+.02)%1,m.setHSL(this.hue,.9,.6));let h=Mf(e,`tiny`)?3:Math.min(5,1+Math.round(u*2));if(r.emit({count:h,x:e.x,y:e.h,z:e.z,color:m,speed:.5,life:Mf(e,`tiny`)||Mf(e,`fast`)?.5:.35,size:Math.max(.25,u*1.8),grow:-u*3}),a.meteor){let t=e.age>45;r.emit({count:3,x:e.x,y:e.h,z:e.z,color:16738816,speed:1.5,dir:[0,t?1:-1,0],spread:.4,life:.5,size:u*2.2,grow:-u*2}),t&&i.emit({count:1,x:e.x,y:e.h,z:e.z,color:16766011,speed:2,dir:[0,1,0],spread:.6,life:.4,size:.18})}Mf(e,`giant`)&&e.h<1.2&&!a.meteor&&Math.random()<.5&&i.emit({count:1,x:e.x,y:.1,z:e.z,color:14206880,speed:1.5,up:1.5,life:.5,size:.35,grow:.4})}dispose(){for(let e of this.mats)e.dispose();this.marker?.geometry.dispose()}};function Pf(e,t,n={}){let r=e.width,i=e.height,a=n.maxCells??96,o=Math.max(2,Math.ceil(Math.max(r,i)/a)),c=Math.ceil(r/o),l=Math.ceil(i/o),u=e.getContext(`2d`).getImageData(0,0,r,i).data,d=Math.max(c,l)+2,f=new Uint8Array(d*d),p=new Float32Array(c*l*3),m=!1;for(let e=0;e<l;e++)for(let t=0;t<c;t++){let n=0,a=0,s=0,l=0,h=0;for(let c=e*o;c<Math.min(i,(e+1)*o);c++)for(let e=t*o;e<Math.min(r,(t+1)*o);e++){let t=(c*r+e)*4;h++,u[t+3]>100&&(n+=u[t],a+=u[t+1],s+=u[t+2],l++)}l*2>=h&&(f[(e+1)*d+t+1]=1,m=!0);let g=(e*c+t)*3;l&&(p[g]=(n/l/255)**2.2,p[g+1]=(a/l/255)**2.2,p[g+2]=(s/l/255)**2.2)}if(!m)return null;for(let e=0;e<(n.grow??1);e++){let e=[];for(let t=0;t<l;t++)for(let n=0;n<c;n++)if(!f[(t+1)*d+n+1])for(let[r,i]of[[1,0],[-1,0],[0,1],[0,-1]]){let a=n+r,o=t+i;if(a<0||o<0||a>=c||o>=l||!f[(o+1)*d+a+1])continue;let s=(t*c+n)*3,u=(o*c+a)*3;p[s]=p[u],p[s+1]=p[u+1],p[s+2]=p[u+2],e.push((t+1)*d+n+1);break}for(let t of e)f[t]=1}let h=new Uint8Array(d*d);for(let e=0;e<h.length;e++)h[e]=+!f[e];let g=s(h,d),_=n.maxRadius??10,v=n.depthScale??1,y=o*t,b=(e,t)=>{let n=(t+1)*d+e+1;if(e<0||t<0||e>=c||t>=l||!f[n])return-1;let r=Math.min(_,Math.sqrt(g[n])-.5);return Math.sqrt(Math.max(0,_*_-(_-r)*(_-r)))*y*.8*v+y*.15},x=c+1,S=l+1,C=new Int32Array(x*S).fill(-1),w=[],T=[],E=new Float32Array(x*S),D=r/2*t,O=i/2*t,k=0;for(let e=0;e<S;e++)for(let t=0;t<x;t++){let n=0,r=0,i=0,a=0,o=0,s=0;for(let[l,u]of[[t-1,e-1],[t,e-1],[t-1,e],[t,e]]){let e=b(l,u);if(e<0){i++;continue}n+=e,r++;let t=(u*c+l)*3;a+=p[t],o+=p[t+1],s+=p[t+2]}r&&(E[e*x+t]=i?0:n/r,C[e*x+t]=k++,w.push(t*y-D,O-e*y,0),T.push(a/r,o/r,s/r))}let A=e=>E[e]===0&&C[e]>=0;for(let e=0;e<(n.smooth??3);e++){let e=w.slice();for(let t=0;t<S;t++)for(let n=0;n<x;n++){let r=t*x+n;if(!A(r))continue;let i=0,a=0,o=0;for(let e=-1;e<=1;e++)for(let r=-1;r<=1;r++){if(!r&&!e)continue;let s=n+r,c=t+e;if(s<0||c<0||s>=x||c>=S)continue;let l=c*x+s;A(l)&&(i+=w[C[l]*3],a+=w[C[l]*3+1],o++)}if(o>=2){let t=C[r];e[t*3]=w[t*3]*.5+i/o*.5,e[t*3+1]=w[t*3+1]*.5+a/o*.5}}for(let t=0;t<w.length;t++)w[t]=e[t]}let j=k,M=new Float32Array(j*2*3),N=new Float32Array(j*2*3);for(let e=0;e<S;e++)for(let t=0;t<x;t++){let n=C[e*x+t];if(n<0)continue;let r=E[e*x+t];M.set([w[n*3],w[n*3+1],r],n*3),M.set([w[n*3],w[n*3+1],-r],(n+j)*3),N.set(T.slice(n*3,n*3+3),n*3),N.set(T.slice(n*3,n*3+3),(n+j)*3)}let P=[];for(let e=0;e<l;e++)for(let t=0;t<c;t++){if(!f[(e+1)*d+t+1])continue;let n=C[e*x+t],r=C[e*x+t+1],i=C[(e+1)*x+t],a=C[(e+1)*x+t+1];P.push(n,i,r,r,i,a),P.push(n+j,r+j,i+j,r+j,a+j,i+j)}let F=new Vo;return F.setAttribute(`position`,new Ao(M,3)),F.setAttribute(`color`,new Ao(N,3)),F.setIndex(P),F.computeVertexNormals(),F}var Ff=[`F`,`E`,`D`,`C`,`B`,`A`,`S`],If=e=>Ff.indexOf(e),Lf={F:{roll:[.7,.85],costMul:1.3,extras:0,color:`#8a8f98`,shards:1},E:{roll:[.8,.95],costMul:1.2,extras:0,color:`#5c940d`,shards:2},D:{roll:[.9,1],costMul:1.1,extras:0,color:`#1c7ed6`,shards:4},C:{roll:[.95,1.1],costMul:1,extras:0,color:`#0c8599`,shards:8},B:{roll:[1.05,1.2],costMul:.9,extras:.5,color:`#7048e8`,shards:16},A:{roll:[1.15,1.3],costMul:.8,extras:1,color:`#e8590c`,shards:32},S:{roll:[1.25,1.4],costMul:.7,extras:2,color:`#e03131`,shards:64}},Rf={power:{name:`威力アップ`,type:`both`,baseCost:4,desc:`必殺の威力が上がる`},pspeed:{name:`弾速アップ`,type:`ranged`,baseCost:3,desc:`弾が速くなる`},duration:{name:`効き目延長`,type:`both`,baseCost:3,desc:`拘束・グニャグニャ・足封じ・くしゃくしゃが長くなる`},windup:{name:`構え短縮`,type:`melee`,baseCost:3,desc:`近接必殺の構えが短くなる`},charge:{name:`発動ポイント−1`,type:`both`,baseCost:6,desc:`必殺に必要な命中が1回減る（2個目からは装備コスト2倍）`},bigger:{name:`大きさアップ`,type:`both`,baseCost:3,desc:`弾が大きく、近接は届く距離が少し長くなる`},lucky:{name:`ラッキー会心`,type:`both`,baseCost:4,desc:`ときどき必殺の威力が2倍になる`},carry:{name:`ゲージのこし`,type:`both`,baseCost:5,desc:`必殺を出してもゲージが少し残る（2個目からは装備コスト2倍）`},pierce:{name:`ガードやぶり`,type:`both`,baseCost:5,desc:`防御されても必殺のダメージが通りやすい`}},zf={"r:invisible":`弾が見えない`,"r:giant":`弾がとても大きい（少し遅い）`,"r:multi":`当たると何回も削る`,"r:restrain":`当たると動けなくなる`,"r:tiny":`小さいけど とても痛い`,"r:fast":`弾がとても速い`,"r:homing":`ゆらゆら追いかける`,"r:meteor":`空から落ちてくる`,"r:split":`とちゅうで3つに分かれる`,"r:bounce":`かべで はね返る`,"r:boomerang":`行って もどってくる`,"r:trap":`地面に置いて 踏むのを待つ`,"r:vacuum":`近くの相手を すいよせる`,"r:drain":`当てた分 体力が回復`,"r:freeze":`足元がこおって すべる`,"r:blast":`消える時に ばくはつ`,"m:giantHands":`手が大きくなって 遠くまで届く`,"m:rubber":`いちばん長い手が のびる`,"m:tornado":`回って まわりを何回も殴る`,"m:dash":`前へ走りぬける`,"m:slam":`跳んで地面をたたく（輪の内側は安全）`,"m:grab":`つかんで投げる（防御できない）`,"m:wobble":`相手の操作が グニャグニャ逆に`,"m:legbind":`相手の足が使えなくなる`,"m:crumple":`相手が紙くずになって転がる`,"m:magnet":`相手を手元へ引きよせる`,"m:vampire":`殴った分 体力が回復`,"m:ice":`相手の足元がこおって すべる`,"m:counter":`構え中に殴られたら 2倍で返す`,"m:mushroom":`しばらく大きく強くなる（本体は弱い）`,"m:bulldozer":`吹き飛ばさずに押しこむ（かべで追加ダメージ）`};function Bf(e){if(e.startsWith(`r:`)){let t=qe.find(t=>t.id===e.slice(2));return{name:`${t.name}(遠)`,type:`ranged`,baseCost:t.cost,desc:zf[e]??`遠距離の必殺に付ける効果`}}if(e.startsWith(`m:`)){let t=st.find(t=>t.id===e.slice(2));return{name:`${t.name}(近)`,type:`melee`,baseCost:t.cost,desc:zf[e]??`近接の必殺に付ける効果`}}return Rf[e]}var Vf={"r:invisible":`👻`,"r:giant":`🪨`,"r:multi":`💫`,"r:restrain":`⛓️`,"r:tiny":`🫘`,"r:fast":`⚡`,"r:homing":`🐝`,"r:meteor":`☄️`,"m:giantHands":`🖐️`,"m:rubber":`🥊`,"m:tornado":`🌪️`,"m:dash":`💨`,"m:slam":`🔨`,"m:grab":`🤲`,"m:wobble":`😵‍💫`,"m:legbind":`🦶`,"m:crumple":`📄`,"r:split":`🎆`,"r:bounce":`🏓`,"r:boomerang":`🪃`,"r:trap":`🪤`,"r:vacuum":`🌀`,"r:drain":`🧛`,"r:freeze":`🧊`,"r:blast":`💣`,"m:magnet":`🧲`,"m:vampire":`🦇`,"m:ice":`⛸️`,"m:counter":`🔄`,"m:mushroom":`🍄`,"m:bulldozer":`🚜`,bigger:`🎈`,lucky:`🍀`,carry:`🔁`,pierce:`🗡️`,power:`💪`,pspeed:`🏹`,duration:`⏳`,windup:`⏩`,charge:`🔋`},Hf=e=>Vf[e]??`✨`,Uf=[...qe.map(e=>`r:${e.id}`),...st.map(e=>`m:${e.id}`),...Object.keys(Rf)],Wf=e=>Uf.includes(e),Gf={power:.08,pspeed:.12,duration:.12,windup:1},Kf=Object.keys(Gf),qf=e=>Math.round(e*100)/100;function Jf(e,t,n,r=Yf(n)){let i=Lf[t],a=qf(i.roll[0]+(i.roll[1]-i.roll[0])*n()),o=Math.floor(n()*3)-1,s=Math.max(1,Math.round(Bf(e).baseCost*i.costMul)+o),c=i.extras>=1?i.extras:+(n()<i.extras),l=[];for(let e=0;e<c;e++){let e=Kf[Math.floor(n()*Kf.length)];l.push({stat:e,value:e===`windup`?1:qf(Gf[e]*(.75+n()*.5))})}return{id:r,kind:e,rarity:t,roll:a,cost:s,extras:l}}function Yf(e=Math.random){return Date.now().toString(36)+Math.floor(e()*1e9).toString(36)}function Xf(e){switch(e.kind){case`power`:return`必殺の威力 +${Math.round(25*e.roll)}%`;case`pspeed`:return`弾の速さ +${Math.round(30*e.roll)}%`;case`duration`:return`状態異常の時間 +${Math.round(30*e.roll)}%`;case`windup`:return`近接必殺の構え −${Math.max(1,Math.round(3*e.roll))}コマ`;case`charge`:return`必殺に必要な命中 −1回`;case`bigger`:return`大きさ +${Math.round(40*e.roll)}%`;case`lucky`:return`会心(威力2倍)の確率 +${Math.round(20*e.roll)}%`;case`carry`:return`撃った後のゲージ +${Math.round(e.roll*10)/10}`;case`pierce`:return`防御を貫く +${Math.round(40*e.roll)}%`;default:return`威力 ${Math.round(e.roll*100)}%`}}function Zf(e){switch(e.stat){case`power`:return`威力 +${Math.round(e.value*100)}%`;case`pspeed`:return`弾速 +${Math.round(e.value*100)}%`;case`duration`:return`時間 +${Math.round(e.value*100)}%`;case`windup`:return`構え −${e.value}`}}var Qf=(e,t)=>{let n=Bf(e.kind).type;return n===`both`||n===t};function $f(e){let t={charge:0,carry:0};return e.map(e=>(e.kind===`charge`||e.kind===`carry`)&&t[e.kind]++>0?e.cost*2:e.cost)}function ep(e,t){let n=e.filter(e=>Qf(e,t)),r={special:[],melee:[],mod:{power:1,speed:1,duration:1,windup:0,size:1,crit:0,carry:0,pierce:0},chargeDelta:0,cost:$f(n).reduce((e,t)=>e+t,0)};for(let e of n){e.kind.startsWith(`r:`)?(r.special.push(e.kind.slice(2)),r.mod.power+=e.roll-1):e.kind.startsWith(`m:`)?(r.melee.push(e.kind.slice(2)),r.mod.power+=e.roll-1):e.kind===`power`?r.mod.power+=.25*e.roll:e.kind===`pspeed`?r.mod.speed+=.3*e.roll:e.kind===`duration`?r.mod.duration+=.3*e.roll:e.kind===`windup`?r.mod.windup+=Math.max(1,Math.round(3*e.roll)):e.kind===`charge`?--r.chargeDelta:e.kind===`bigger`?r.mod.size+=.4*e.roll:e.kind===`lucky`?r.mod.crit+=.2*e.roll:e.kind===`carry`?r.mod.carry+=e.roll:e.kind===`pierce`&&(r.mod.pierce+=.4*e.roll);for(let t of e.extras)t.stat===`power`?r.mod.power+=t.value:t.stat===`pspeed`?r.mod.speed+=t.value:t.stat===`duration`?r.mod.duration+=t.value:r.mod.windup+=t.value}return r.mod={power:qf(r.mod.power),speed:qf(r.mod.speed),duration:qf(r.mod.duration),windup:r.mod.windup,size:qf(r.mod.size),crit:qf(r.mod.crit),carry:qf(r.mod.carry),pierce:qf(r.mod.pierce)},r}var tp=[[45,35,15,5,0,0,0],[20,35,30,12,3,0,0],[5,20,35,28,10,2,0],[0,8,25,35,24,7,1],[0,0,12,33,35,16,4]];function np(e,t){let n=tp[Math.max(0,Math.min(tp.length-1,e-1))],r=t()*100;for(let e=0;e<n.length;e++)if(r-=n[e],r<0)return Ff[e];return`C`}function rp(e){let t=e>>>0||1;return()=>(t^=t<<13,t>>>=0,t^=t>>17,t^=t<<5,t>>>=0,t/4294967296)}function ip(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return t>>>0}function ap(e,t){return e.length?`${e.map(e=>Hf(`${t?`m`:`r`}:${e}`)).join(``)} ${(e.length===1?(t?st:qe).find(t=>t.id===e[0])?.name:``)||`必殺`}!`:`必殺!`}var op=-.1,sp=[16742938,10181887],cp=16769162,lp=6080767,up=class{root=new xs;body=new xs;flip=new xs;spin=new xs;shadow;guard;rootRing;swing;aura;limbs=[];materials=[];flipCur=0;flipTarget=1;squash=0;koT=0;roll=0;dizzy;limbScale=1;crumpleK=0;rangeRing;statusIcons;statusCanvas=document.createElement(`canvas`);statusTex;statusKey=``;setGhost(e){for(let t of this.materials)t.transparent=e,t.opacity=e?.45:1,t.depthWrite=!e}constructor(e,t,n,r){let{parts:i,res:a,scale:o,originX:s}=e,c=i.bounds,l=Math.max(0,c.x0-4),u=Math.max(0,c.y0-4),d=Math.min(512,c.x1+4),f=Math.min(512,c.y1+4),p=d-l,m=f-u,h=(e,t)=>new U((e-s)*o,(c.y1-t)*o,0),g=h(l+p/2,u+m/2),_=e=>{let t=document.createElement(`canvas`);t.width=p+24,t.height=m+24,t.getContext(`2d`).drawImage(e,l,u,p,m,12,12,p,m);let n=new Dc({vertexColors:!0,roughness:.55,metalness:0,side:2});this.materials.push(n),r.push(n);let i=Pf(t,o,{maxCells:96,grow:1,smooth:3});if(!i)return new ro;r.push(i);let a=new $o(i,n);return a.castShadow=!0,a},v=_(i.canvases[0]);v.position.copy(g),this.flip.add(v);let y=512/a.size,b={hand:0,foot:0};a.limbs.forEach((e,t)=>{let n=new ro,r=h(e.pivot[0]*y,e.pivot[1]*y);n.position.copy(r),n.position.z=e.kind===`hand`?.004:-.004;let a=_(i.canvases[t+1]);a.position.copy(g).sub(r),n.add(a),this.flip.add(n),this.limbs.push({pivot:n,kind:e.kind,nth:b[e.kind]++,length:e.length})});let x=new Sc(.75,32),S=new Eo({color:5917306,transparent:!0,opacity:.1,depthWrite:!1});this.shadow=new $o(x,S),this.shadow.rotation.x=-Math.PI/2,this.shadow.position.y=.01,this.shadow.scale.set(1,.7,1);let C=new Tc(.62,.78,40),w=new Eo({color:t,transparent:!0,opacity:.85,depthWrite:!1}),T=new $o(C,w);T.rotation.x=-Math.PI/2,T.position.y=.012,T.scale.set(1,.7,1),this.shadow.add(T),T.rotation.x=0,T.position.set(0,0,.001),T.scale.set(1,1,1),r.push(C,w);let E=new Sc(1,6),D=new Eo({color:lp,transparent:!0,opacity:.3,depthWrite:!1,blending:2});this.guard=new $o(E,D),this.guard.position.set(0,.9,.3);let O=new wc(2,2),k=new Eo({map:n.ring,color:16766011,transparent:!0,depthWrite:!1,blending:2});this.rootRing=new $o(O,k),this.rootRing.rotation.x=-Math.PI/2,this.rootRing.position.y=.03;let A=new wc(1.6,1.6),j=new Eo({map:n.arc,color:16777215,transparent:!0,depthWrite:!1,blending:2,side:2});this.swing=new $o(A,j),this.swing.position.set(.55,.95,.05),this.swing.visible=!1,r.push(x,S,E,D,O,k,A,j);let M=document.createElement(`canvas`);M.width=128,M.height=64;let N=M.getContext(`2d`);N.font=`bold 44px sans-serif`,N.textAlign=`center`,N.textBaseline=`middle`,N.lineWidth=8,N.strokeStyle=`#1a1a1a`,N.strokeText(`@_@`,64,34),N.fillStyle=`#ffe14d`,N.fillText(`@_@`,64,34);let P=new yc(M);P.colorSpace=Jr;let F=new ks({map:P,transparent:!0,depthWrite:!1});this.dizzy=new Us(F),this.dizzy.scale.set(1,.5,1),this.dizzy.position.set(0,2.25,0),this.dizzy.visible=!1,r.push(P,F);let ee=new ks({map:n.glow,color:t,transparent:!0,depthWrite:!1,blending:2});this.aura=new Us(ee),this.aura.position.set(0,.95,-.05),this.aura.visible=!1,r.push(ee);let te=new Tc(.96,1,64),I=new Eo({color:t,transparent:!0,opacity:.55,depthWrite:!1,side:2});this.rangeRing=new $o(te,I),this.rangeRing.rotation.x=-Math.PI/2,this.rangeRing.position.y=.025,this.rangeRing.visible=!1,r.push(te,I),this.statusCanvas.width=256,this.statusCanvas.height=64,this.statusTex=new yc(this.statusCanvas),this.statusTex.colorSpace=Jr;let ne=new ks({map:this.statusTex,transparent:!0,depthWrite:!1});this.statusIcons=new Us(ne),this.statusIcons.scale.set(1.6,.4,1),this.statusIcons.position.set(0,2.55,0),this.statusIcons.visible=!1,r.push(this.statusTex,ne),this.root.add(this.statusIcons),this.body.rotation.x=op,this.root.add(this.aura,this.dizzy,this.rangeRing),this.flip.add(this.swing),this.spin.position.y=g.y,this.flip.position.y=-g.y,this.spin.add(this.flip),this.body.add(this.spin,this.guard),this.root.add(this.shadow,this.rootRing,this.body)}meleeReach=0;update(e,t,n){this.root.position.set(e.x,0,e.z),e.fx>.08?this.flipTarget=1:e.fx<-.08&&(this.flipTarget=-1);let r=this.flipTarget>0?0:Math.PI;this.flipCur+=(r-this.flipCur)*.22;let i=e.cfg.traits,a=i?.weight??1;this.squash=Math.max(0,this.squash-n*5);let o=Math.sin(this.squash*Math.PI)*.25*Math.min(1.5,a);this.flip.scale.set(1+o,1-o,1+o),this.flip.rotation.y=this.flipCur;let s=e.moving&&e.cfg.hasFeet&&e.stun===0,c=15-5*Math.min(1.6,i?.walk??1);this.body.position.y=s?Math.abs(Math.sin(t*c))*.08*Math.sqrt(a):0;let l=Math.hypot(e.vx,e.vz);if(!e.cfg.hasFeet&&e.hp>0){if(l>.6)this.roll-=(e.vx>=0?1:-1)*l*n/.9;else{let e=Math.round(this.roll/(Math.PI*2))*Math.PI*2;this.roll+=(e-this.roll)*Math.min(1,n*6)}}this.body.position.x=e.hitFlash>0?(Math.random()*2-1)*.07:0;let u=0;!e.cfg.hasHands&&e.attack===`active`?u=-.35:!e.cfg.hasFeet&&e.moving&&(u=-.12),e.stun>0&&!e.guardStun&&(u=.35),e.hp<=0&&(this.koT=Math.min(1,this.koT+n*2.5),u=1.45*this.koT,this.body.position.y=Math.sin(this.koT*Math.PI)*.6),this.body.rotation.z=u*this.flipTarget,this.spin.rotation.z=this.roll,e.cfg.hasFeet&&Math.hypot(e.kx,e.kz)>3&&a<.85&&(this.body.rotation.z+=Math.hypot(e.kx,e.kz)*.05*(e.kx>=0?-1:1));for(let n of this.limbs){let r;if(e.hp<=0)r=.6;else if(n.kind===`foot`)r=s?Math.sin(t*c+n.nth*Math.PI)*.45:0;else if(e.stun>0&&!e.guardStun)r=Math.sin(t*30+n.nth)*.5;else if(e.attack===`windup`)r=.8;else if(e.attack===`active`){let t=i?.hits??1,a=t>1?Math.floor(e.attackT/2)%t:0;r=t>1?n.nth%t===a?-1.4:.6:-1.4}else r=e.guarding?-.9:Math.sin(t*3+n.nth*1.7)*.15;n.pivot.rotation.z=r}this.swing.visible=e.attack===`active`&&e.cfg.hasHands,this.swing.visible&&(this.swing.rotation.z=-.4-e.attackT*.35);let d=e.hitFlash>0&&e.hitFlash%2==0;for(let e of this.materials)e.emissive.setRGB(d?.9:0,d?.1:0,d?.1:0);if(this.guard.visible=e.guarding,e.guarding&&(this.guard.rotation.z+=n*1.5,this.guard.material.opacity=.25+Math.sin(t*10)*.08),this.aura.visible=e.charge>=e.st.chargeNeed&&e.hp>0,this.aura.visible){let e=1+Math.sin(t*9)*.12;this.aura.scale.set(2.6*e,3.2*e,1),this.aura.material.opacity=.75+Math.sin(t*13)*.2}let f=e.ms,p=e.mspec,m=f.phase===`windup`||f.phase===`active`,h=m?p.limbScale:1;this.limbScale+=(h-this.limbScale)*Math.min(1,n*12);let g=-1,_=-1;this.limbs.forEach((e,t)=>{e.kind===`hand`&&e.length>_&&(_=e.length,g=t)}),this.limbs.forEach((e,t)=>{let n=m&&t===g?p.rubberScale:1,r=this.limbScale*(t===g?1+(n-1)*(f.phase===`active`?1:.3):1);e.pivot.scale.setScalar(r),m&&e.kind===`hand`&&(e.pivot.rotation.z=f.phase===`windup`?.9:-1.5)});let v=f.phase===`active`&&p.spinTicks>0;if(this.spin.rotation.y=v?f.spin:0,this.rangeRing.visible=v&&this.meleeReach>0,this.rangeRing.visible&&this.rangeRing.scale.setScalar(this.meleeReach-ht),p.slam&&f.phase===`windup`&&(this.body.position.y=Math.sin(Math.min(1,f.t/p.windup)*Math.PI)*1.2),this.crumpleK+=(+(e.crumple>0)-this.crumpleK)*Math.min(1,n*10),this.crumpleK>.01){let t=1-.5*this.crumpleK;this.spin.scale.set(t,t,1),this.spin.rotation.z+=Math.hypot(e.vx,e.vz)*n*3*(e.vx>=0?-1:1),this.roll=this.spin.rotation.z}else this.spin.scale.set(1,1,1);this.dizzy.visible=e.wobble>0||e.dizzy>0,this.dizzy.visible&&(this.dizzy.material.rotation=Math.sin(t*6)*.4,this.dizzy.position.x=Math.sin(t*3)*.2);let y=[e.wobble>0||e.dizzy>0?`😵`:``,e.legbind>0?`🦶`:``,e.crumple>0?`📄`:``,e.rooted>0?`⛓️`:``,e.ice>0?`🧊`:``,e.big>0?`🍄`:``].join(``);if(y!==this.statusKey){this.statusKey=y;let e=this.statusCanvas.getContext(`2d`);e.clearRect(0,0,256,64),y&&(e.font=`48px sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(y,128,34)),this.statusTex.needsUpdate=!0,this.statusIcons.visible=!!y}if(e.big>0&&this.flip.scale.multiplyScalar(1.3),e.legbind>0)for(let e of this.limbs)e.kind===`foot`&&(e.pivot.rotation.z=0);this.rootRing.visible=e.rooted>0||e.legbind>0,this.rootRing.material.color.set(e.legbind>0&&e.rooted===0?9198123:16766011),this.rootRing.visible&&(this.rootRing.rotation.z+=n*4,this.rootRing.scale.setScalar(.8+Math.sin(t*8)*.08))}},dp=class{container;viewer;renderer;scene=new Ts;camera=new hs(38,1,.1,100);overlay;fighters;tex={glow:yf(),star:bf(),ring:xf(),arc:Cf(),spark:Sf()};particles;sparks;popups;specialTex=new jf([`#ff9a3c`,`#b07cff`]);shadowGeo=new Sc(1,24);proj=new Map;combo=new Map;flashes=[];flashGeo=new wc(1,1);disposables=[];shake=0;lastT=0;camTarget=new U;camDist=12;camInit=!1;koZoom=0;sun;lookY=.9;wobK=0;wobT=0;constructor(e,t,n){this.container=e,this.viewer=n,this.renderer=new _f({antialias:!0}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),this.renderer.outputColorSpace=Jr,e.appendChild(this.renderer.domElement),this.overlay=document.createElement(`div`),this.overlay.className=`b-pops`,e.appendChild(this.overlay),this.popups=new Tf(this.overlay);let r=document.createElement(`canvas`);r.width=4,r.height=256;let i=r.getContext(`2d`),a=i.createLinearGradient(0,0,0,256);a.addColorStop(0,`#bfe0ff`),a.addColorStop(.55,`#f3ecff`),a.addColorStop(1,`#ffe9d6`),i.fillStyle=a,i.fillRect(0,0,4,256);let o=new yc(r);o.colorSpace=Jr,this.scene.background=o,this.scene.fog=new ws(15985919,28,70),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=2;let s=new Gc(16777215,14274542,1.25),c=new Qc(16777215,1.7);c.position.set(-5,12,7),c.castShadow=!0,c.shadow.mapSize.set(1024,1024),c.shadow.camera.left=-7,c.shadow.camera.right=7,c.shadow.camera.top=7,c.shadow.camera.bottom=-7,c.shadow.camera.near=1,c.shadow.camera.far=40,c.shadow.bias=-.0015,c.shadow.radius=4,this.sun=c,this.scene.add(s,c,c.target);let l=new $o(new Sc(9,96),new Dc({color:16774888,roughness:.9}));l.rotation.x=-Math.PI/2,l.receiveShadow=!0;let u=new $o(new Cc(9.35,9.55,.9,96,1,!0),new Dc({color:15902298,roughness:.7}));u.position.y=-.45;let d=new $o(new Ec(9.17,.2,12,96),new Dc({color:16747100,roughness:.5}));d.rotation.x=-Math.PI/2,d.position.y=.02;let f=new fl(18,18,15128258,15721170);f.position.y=.004,f.material.transparent=!0,f.material.opacity=.7;let p=new $o(new Tc(9,13.5,96),new Dc({color:16774888,roughness:.9}));p.rotation.x=-Math.PI/2,p.position.y=.006;let m=new $o(new Sc(49,48),new Dc({color:14280949,roughness:1}));m.rotation.x=-Math.PI/2,m.position.y=-.9,m.receiveShadow=!0,this.scene.add(m,u,l,f,p,d);for(let e of[l,u,d,p,m])this.disposables.push(e.geometry,e.material);this.disposables.push(f,o),this.fighters=t.map((e,t)=>new up(e,sp[t],this.tex,this.disposables));for(let e of this.fighters)this.scene.add(e.root);this.particles=new wf(this.tex.glow,!0),this.sparks=new wf(this.tex.spark,!1),this.scene.add(this.sparks.points,this.particles.points),this.disposables.push(this.specialTex,this.shadowGeo,this.flashGeo,this.particles,this.sparks,this.tex.glow,this.tex.star,this.tex.ring,this.tex.arc,this.tex.spark),this.resize()}resize(){let e=this.container.clientWidth||1,t=this.container.clientHeight||1;this.renderer.setSize(e,t),this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.particles.setScale(t),this.sparks.setScale(t)}updateCamera(e,t){let[n,r]=e.fighters,i=new U((n.x+r.x)/2,0,(n.z+r.z)/2),a=Math.hypot(n.x-r.x,n.z-r.z),o=Di.degToRad(this.camera.fov/2),s=Math.atan(Math.tan(o)*this.camera.aspect),c=Math.max(2,a/2+1.5),l=Math.max(5,c/Math.tan(s)),u=0;for(let t of e.projectiles)t.spec.meteor&&(t.spec.visible||t.owner===this.viewer)&&(u=Math.max(u,t.h+t.spec.size));l+=u*.9,this.lookY+=((u>1.5?u*.45:.9)-this.lookY)*.08,e.winner===-1?this.koZoom=0:(this.koZoom=Math.min(1,this.koZoom+t*1.5),l*=1-.15*this.koZoom),this.camInit||=(this.camTarget.copy(i),this.camDist=l,!0),this.camTarget.lerp(i,.12),this.camDist+=(l-this.camDist)*.06;let d=new U(0,7,12).normalize();this.camera.position.copy(this.camTarget).addScaledVector(d,this.camDist),this.camera.lookAt(this.camTarget.x,this.lookY,this.camTarget.z+.4),this.sun.position.set(this.camTarget.x-5,12,this.camTarget.z+7),this.sun.target.position.set(this.camTarget.x,0,this.camTarget.z);let f=this.viewer>=0?e.fighters[this.viewer]:null,p=f?Math.min(1,Math.max(f.wobble,f.dizzy*.6)/30):0;if(this.wobK+=(p-this.wobK)*Math.min(1,t*4),this.wobK>.01?(this.wobT+=t,this.camera.rotateZ(Math.sin(this.wobT*2.3)*.18*this.wobK),this.camera.fov=38+Math.sin(this.wobT*3.1)*6*this.wobK,this.camera.updateProjectionMatrix(),this.renderer.domElement.style.filter=`hue-rotate(${Math.sin(this.wobT*1.7)*60*this.wobK}deg) saturate(${1+.6*this.wobK}) blur(${.6*this.wobK}px)`):this.renderer.domElement.style.filter&&(this.renderer.domElement.style.filter=``,this.camera.fov=38,this.camera.updateProjectionMatrix()),this.shake>0){let e=this.shake*this.shake;this.camera.position.x+=(Math.random()*2-1)*e,this.camera.position.y+=(Math.random()*2-1)*e,this.shake=Math.max(0,this.shake-t*2.2)}}addFlash(e,t,n,r,i,a,o=!1,s=0){let c=new Eo({map:e,color:t,transparent:!0,depthWrite:!1,blending:e===this.tex.glow?2:1,side:2}),l=new $o(this.flashGeo,c);l.position.copy(n),o?l.rotation.x=-Math.PI/2:l.quaternion.copy(this.camera.quaternion),l.rotateZ(Math.random()*Math.PI),l.scale.setScalar(r),this.scene.add(l),this.flashes.push({mesh:l,life:a,max:a,from:r,to:i,spin:s})}onEvent(e){let t=new U(e.x,Math.max(.5,e.h),e.z),n=[e.dx,.35,e.dz];switch(e.kind){case`hit`:{let r=e.src===`special`,i=e.tags??[],a=r?sp[1-e.target]:cp,o=i.includes(`multi`),s=o&&e.pid?(this.combo.get(e.pid)??0)+1:1;o&&e.pid&&this.combo.set(e.pid,s);let c=o?.7:1;this.addFlash(this.tex.star,16777215,t,.6*c,(r?2.6+e.size:1.7)*c,.2),this.addFlash(this.tex.ring,a,t,.3,(r?3.2:1.8)*c,.3),this.sparks.emit({count:r?o?10:30:14,x:e.x,y:t.y,z:e.z,color:a,speed:r?9:7,spread:.55,dir:n,life:.45,size:r?.32:.26,gravity:9,drag:2.5}),this.particles.emit({count:8,x:e.x,y:t.y,z:e.z,color:16777215,speed:3,life:.25,size:.6,grow:-1.5}),r&&!o&&this.addFlash(this.tex.ring,a,new U(e.x,.05,e.z),.5,4+e.size*3,.45,!0),i.includes(`tiny`)&&r&&this.addFlash(this.tex.glow,16777215,t,.5,4,.15),this.shake=Math.max(this.shake,r?o?.3:.55+e.size*.2:.32),this.fighters[e.target].squash=1;let l=t.clone().setY(t.y+.9);this.popups.add(String(Math.max(1,Math.round(e.amount))),l.clone().add(new U((Math.random()-.5)*.6,0,0)),r?`big`:``),o&&s>=2&&this.popups.add(`${s} HIT!`,l.clone().setY(l.y+.7),`combo`),e.restrained&&this.popups.add(`拘束!`,l.clone().setY(l.y+.5),`bind`);break}case`guard`:this.addFlash(this.tex.ring,lp,t,.5,2,.25),this.sparks.emit({count:12,x:e.x,y:t.y,z:e.z,color:lp,speed:5,spread:.7,dir:[-e.dx,.3,-e.dz],life:.35,size:.22,drag:4}),this.shake=Math.max(this.shake,.15),this.popups.add(`ガード`,t.clone().setY(t.y+.9),`guard`),e.heal&&e.heal>.05&&this.popups.add(`+${e.heal.toFixed(1)}`,t.clone().setY(t.y+1.4),`heal`);break;case`shoot`:{let t=sp[e.target],n=new U(e.x+e.dx*.8,1,e.z+e.dz*.8);this.addFlash(this.tex.glow,t,n,.5,3+e.size*2,.3),this.addFlash(this.tex.star,16777215,n,.4,1.8+e.size,.18),this.addFlash(this.tex.ring,t,new U(e.x,.05,e.z),.4,4,.45,!0),this.particles.emit({count:30,x:n.x,y:1,z:n.z,color:t,speed:8,spread:1,life:.35,size:.25,drag:5}),this.sparks.emit({count:16,x:n.x,y:1,z:n.z,color:16777215,speed:6,spread:.6,dir:[e.dx,.3,e.dz],life:.4,size:.22}),this.shake=Math.max(this.shake,.35),this.fighters[e.target].squash=.6;let r=(e.tags??[]).includes(`invisible`);this.popups.add(r?`必殺…？`:ap(e.tags??[],!1),new U(e.x,2.7,e.z),`special`);break}case`mstart`:{let t=sp[e.target];this.addFlash(this.tex.glow,t,new U(e.x,1,e.z),.6,3.2,.3),this.addFlash(this.tex.ring,t,new U(e.x,.05,e.z),.4,3.5,.4,!0),this.particles.emit({count:26,x:e.x,y:1,z:e.z,color:t,speed:7,spread:1,life:.35,size:.25,drag:5}),this.shake=Math.max(this.shake,.3),this.popups.add(ap(e.tags??[],!0),new U(e.x,2.7,e.z),`special`);break}case`mactive`:{let t=e.tags??[];t.includes(`tornado`)&&this.popups.add(`ギュイーン!`,new U(e.x,2.9,e.z),`combo`),t.includes(`rubber`)&&this.popups.add(`ビヨーン!`,new U(e.x+e.dx,2.4,e.z+e.dz),`combo`),t.includes(`dash`)&&this.sparks.emit({count:12,x:e.x,y:.2,z:e.z,color:14206880,speed:4,dir:[-e.dx,.3,-e.dz],spread:.5,life:.4,size:.3});break}case`grab`:this.addFlash(this.tex.star,16777215,new U(e.x+e.dx,1.1,e.z+e.dz),.5,2,.2),this.popups.add(`ガシッ!`,new U(e.x+e.dx,2.4,e.z+e.dz),`bind`);break;case`whiff`:this.popups.add(`スカッ`,new U(e.x,2.3,e.z),`guard`);break;case`slam`:{let t=sp[e.target];this.addFlash(this.tex.ring,t,new U(e.x,.06,e.z),.8,9.6,.55,!0),this.addFlash(this.tex.ring,16777215,new U(e.x,.07,e.z),.6,8.6,.5,!0),this.sparks.emit({count:30,x:e.x,y:.1,z:e.z,color:14272416,speed:8,spread:1,dir:[0,.2,0],up:2,life:.6,size:.3,gravity:8}),this.shake=Math.max(this.shake,.7),this.popups.add(`ドゴン!`,new U(e.x,1.6,e.z),`thud big`);break}case`status`:{let t={wobble:`グニャ〜`,legbind:`足封じ!`,crumple:`クシャッ!`}[e.status??``]??`!?`;this.popups.add(t,new U(e.x,2.9,e.z),`bind`),e.status===`crumple`&&this.sparks.emit({count:14,x:e.x,y:1,z:e.z,color:16777215,speed:4,spread:1,life:.4,size:.25});break}case`shove`:this.addFlash(this.tex.ring,16777215,new U(e.x,1,e.z),.4,1.8,.2),this.sparks.emit({count:8,x:e.x,y:1,z:e.z,color:16777215,speed:5,spread:.5,dir:[e.dx,.2,e.dz],life:.3,size:.22}),this.fighters[e.target].squash=.6,this.shake=Math.max(this.shake,.2),this.popups.add(`ドンッ`,new U(e.x,2.2,e.z),`guard`);break;case`dodge`:this.sparks.emit({count:6,x:e.x,y:.1,z:e.z,color:14206880,speed:2,dir:[-e.dx,.4,-e.dz],spread:.5,life:.4,size:.3});break;case`evade`:this.popups.add(e.gap?`すり抜け`:`回避!`,new U(e.x,2.3,e.z),`evade`);break;case`recoil`:this.fighters[e.target].squash=.7,this.sparks.emit({count:8,x:e.x,y:1,z:e.z,color:16739179,speed:4,spread:.6,dir:[e.dx,.4,e.dz],life:.35,size:.22}),this.popups.add(`反動 ${Math.max(1,Math.round(e.amount))}`,new U(e.x,2.3,e.z),`recoil`);break;case`ready`:{let t=sp[e.target];this.addFlash(this.tex.glow,t,new U(e.x,1,e.z),1,4,.4),this.addFlash(this.tex.ring,t,new U(e.x,.05,e.z),.5,3.5,.5,!0),this.particles.emit({count:30,x:e.x,y:.2,z:e.z,color:t,speed:2,dir:[0,1,0],spread:.4,up:3,life:.8,size:.3}),this.popups.add(`必殺OK!`,new U(e.x,2.6,e.z),`ready`);break}case`land`:{let t=sp[e.target],n=1+e.size*1.5;this.addFlash(this.tex.ring,t,new U(e.x,.06,e.z),.5,(4+e.size*4)*1.2,.6,!0),this.addFlash(this.tex.ring,16777215,new U(e.x,.07,e.z),.3,(2.5+e.size*3)*1.2,.4,!0),this.addFlash(this.tex.glow,16777215,new U(e.x,.4,e.z),1,3+e.size*4,.25),this.addFlash(this.tex.star,16777215,new U(e.x,.6+e.size,e.z),.5,2+e.size*2,.25),this.sparks.emit({count:Math.round(16*n),x:e.x,y:.1,z:e.z,color:14272416,speed:6*n,spread:1,dir:[0,1,0],up:3,life:.7,size:.3+e.size*.1,gravity:6,drag:2}),this.sparks.emit({count:Math.round(8*n),x:e.x,y:.2,z:e.z,color:9203014,speed:4*n,spread:1,up:6,life:.9,size:.2,gravity:14,drag:.5}),this.particles.emit({count:20,x:e.x,y:.3,z:e.z,color:16738816,speed:5*n,spread:1,life:.5,size:.5}),this.shake=Math.min(1.2,Math.max(this.shake,.5+e.size*.5)),this.popups.add(`ドスン!`,new U(e.x,1.2+e.size*1.5,e.z),e.size>.6?`thud big`:`thud`);break}case`ko`:this.addFlash(this.tex.star,16777215,t,.6,2.4,.25),this.addFlash(this.tex.ring,16766011,new U(e.x,.06,e.z),.6,4,.5,!0),this.sparks.emit({count:16,x:e.x,y:1,z:e.z,color:16766011,speed:6,spread:.8,dir:[e.dx,.5,e.dz],life:.6,size:.26,gravity:6,drag:2}),this.shake=Math.max(this.shake,.4),this.popups.add(`KO!`,t.clone().setY(2.8),`ko`)}}render(e,t,n){let r=this.lastT?Math.min(.1,t-this.lastT):1/60;this.lastT=t;for(let e of n)this.onEvent(e);this.updateCamera(e,r),e.fighters.forEach((n,i)=>{if(this.fighters[i].meleeReach=bn(n.cfg,n.mspec,e.fighters[1-i].cfg),this.fighters[i].update(n,t,r),Math.hypot(n.kx,n.kz)>2&&this.sparks.emit({count:2,x:n.x,y:.1,z:n.z,color:14206880,speed:1,up:1,life:.5,size:.3,grow:.5}),n.stun>0&&!n.guardStun&&Math.random()<.5){let e=t*8;this.sparks.emit({count:1,x:n.x+Math.cos(e)*.5,y:2.1,z:n.z+Math.sin(e)*.5,color:16769357,speed:.1,life:.3,size:.22})}});let i=new Set;for(let n of e.projectiles){i.add(n.id);let e=this.proj.get(n.id);e||(e=new Nf(n,sp[n.owner],this.specialTex,this.tex.glow,this.shadowGeo,n.owner===this.viewer),this.scene.add(e.group),this.proj.set(n.id,e)),e.update(n,t,this.camera,this.particles,this.sparks)}for(let[e,t]of this.proj)i.has(e)||(this.scene.remove(t.group),t.dispose(),this.proj.delete(e),this.combo.delete(e));e.fighters.forEach((e,t)=>{e.dodgeT>0&&this.particles.emit({count:2,x:e.x,y:.9,z:e.z,color:sp[t],speed:.2,life:.25,size:1.1,grow:-3}),this.fighters[t].setGhost(e.dodgeT>0)}),e.fighters.forEach((e,t)=>{if(e.ms.phase===`active`){if(e.mspec.spinTicks>0){let n=e.ms.spin;for(let r=0;r<2;r++){let i=.9+r*.5;this.particles.emit({count:1,x:e.x+Math.cos(n+r*Math.PI)*i,y:.3+Math.random()*1.6,z:e.z+Math.sin(n+r*Math.PI)*i,color:r?16777215:sp[t],speed:1.5,up:1.5,life:.4,size:.35})}}e.mspec.dash>0&&e.ms.dashLeft>0&&this.particles.emit({count:3,x:e.x,y:.9,z:e.z,color:sp[t],speed:.3,life:.35,size:.9,grow:-2})}}),e.fighters.forEach((e,t)=>{if(e.charge>=e.st.chargeNeed&&e.hp>0&&Math.random()<.6){let n=Math.random()*Math.PI*2;this.particles.emit({count:1,x:e.x+Math.cos(n)*.55,y:.1,z:e.z+Math.sin(n)*.4,color:sp[t],speed:.3,up:2.2,life:.7,size:.28,drag:.5})}}),this.flashes=this.flashes.filter(e=>{e.life-=r;let t=1-Math.max(0,e.life)/e.max;return e.mesh.scale.setScalar(e.from+(e.to-e.from)*(1-(1-t)*(1-t))),e.mesh.material.opacity=Math.max(0,1-t),e.life>0||(this.scene.remove(e.mesh),e.mesh.material.dispose(),!1)}),this.particles.update(r),this.sparks.update(r),this.renderer.render(this.scene,this.camera),this.popups.update(r,this.camera,this.container.clientWidth,this.container.clientHeight)}reset(){this.popups.clear();for(let e of this.fighters)e.koT=0}dispose(){for(let e of this.disposables)e.dispose();for(let e of this.flashes)e.mesh.material.dispose();for(let e of this.proj.values())e.dispose();this.popups.clear(),this.renderer.dispose(),this.renderer.forceContextLoss(),this.renderer.domElement.remove(),this.overlay.remove()}},fp=e=>`<div class="b-charge" data-ch="${e}"></div>`,pp=`
  <div class="b-hud">
    <div class="b-side"><div class="b-name" data-n="0"></div><div class="b-bar"><i data-hp="0"></i><span data-hpn="0"></span></div><div class="b-bar thin"><i data-st="0"></i></div>${fp(0)}</div>
    <div class="b-time" data-time></div>
    <div class="b-side right"><div class="b-name" data-n="1"></div><div class="b-bar"><i data-hp="1"></i><span data-hpn="1"></span></div><div class="b-bar thin"><i data-st="1"></i></div>${fp(1)}</div>
  </div>
  <div class="b-view"></div>
  <div class="b-count" hidden></div>
  <div class="b-controls">
    <div class="b-stick"><div class="b-knob"></div></div>
    <div class="b-buttons">
      <button class="b-btn special" data-act="special" aria-label="必殺">✨</button>
      <button class="b-btn dodge" data-act="dodge" aria-label="回避">💨<br>よける</button>
      <button class="b-btn shove" data-act="shove" aria-label="突き飛ばし">🫸<br>おす</button>
      <button class="b-btn guard" data-act="guard" aria-label="防御">🛡️<br>まもる</button>
      <button class="b-btn attack" data-act="attack" aria-label="攻撃">👊<br>こうげき</button>
    </div>
  </div>
  <div class="b-result" hidden>
    <div class="b-result-text"></div>
    <div class="b-reward"></div>
    <table class="b-stats"></table>
    <div class="b-result-buttons"><button data-again>もう一回</button><button data-exit>必殺を変えて再戦</button></div>
  </div>
  <button class="b-mute" aria-label="音のオン・オフ"></button>
  <button class="b-close" data-exit aria-label="戦闘をやめる">×</button>
`,mp=()=>({dealt:0,melee:0,shots:0,specialHits:0,guards:0}),hp=2400;function gp(e){let{sfx:t}=e,n=document.createElement(`div`);n.className=`battle`,n.innerHTML=pp,document.body.appendChild(n),document.body.classList.add(`in-battle`);let r=e=>n.querySelector(e),i=cn(e.player.cfg,e.cpu.cfg,e.seed),a=[On(),On(e.cpuLevel)],o=[mp(),mp()],s=new dp(r(`.b-view`),[e.player,e.cpu],e.spectate?-1:0);e.exitLabel&&(r(`.b-result-buttons [data-exit]`).textContent=e.exitLabel);let c=()=>{if(!e.cpuLine)return;let t=document.createElement(`div`);t.className=`b-say`,t.textContent=`「${e.cpuLine}」`,n.appendChild(t),setTimeout(()=>t.remove(),4200)};c(),r(`[data-n='0']`).textContent=e.player.cfg.name,r(`[data-n='1']`).textContent=e.cpu.cfg.name,e.spectate&&r(`.b-controls`).classList.add(`spectate`);let l=r(`.b-mute`),u=()=>{l.textContent=t.muted?`🔇`:`🔊`};u(),l.addEventListener(`click`,()=>{t.unlock(),t.setMuted(!t.muted),u()});let d=1;if(e.fastButton){let e=document.createElement(`button`);e.className=`b-mute b-fast`,e.textContent=`▶▶ 2ばい`,e.addEventListener(`click`,()=>{d=d===1?2:1,e.textContent=d===1?`▶▶ 2ばい`:`▶ ふつう`}),n.appendChild(e)}let f={guard:!1},p={attack:!1,special:!1,shove:!1,dodge:!1},m={x:0,z:0},h=new Set,g=r(`.b-stick`),_=r(`.b-knob`),v=-1,y=0,b=0;g.addEventListener(`pointerdown`,e=>{v=e.pointerId,g.setPointerCapture(e.pointerId);let t=g.getBoundingClientRect();y=t.left+t.width/2,b=t.top+t.height/2,x(e)});let x=e=>{if(e.pointerId!==v)return;let t=e.clientX-y,n=e.clientY-b,r=Math.hypot(t,n);r>48&&(t*=48/r,n*=48/r),_.style.transform=`translate(${t}px, ${n}px)`,m.x=t/48,m.z=n/48};g.addEventListener(`pointermove`,x);let S=e=>{e.pointerId===v&&(v=-1,m.x=m.z=0,_.style.transform=``)};g.addEventListener(`pointerup`,S),g.addEventListener(`pointercancel`,S),n.querySelectorAll(`.b-btn`).forEach(e=>{let t=e.dataset.act;e.addEventListener(`pointerdown`,n=>{n.preventDefault(),e.setPointerCapture(n.pointerId),e.classList.add(`down`),t===`guard`?f.guard=!0:p[t]=!0});let n=()=>{e.classList.remove(`down`),t===`guard`&&(f.guard=!1)};e.addEventListener(`pointerup`,n),e.addEventListener(`pointercancel`,n)}),document.activeElement?.blur();let C=new Set([`w`,`a`,`s`,`d`,`j`,`k`,`l`,`h`,`i`,` `,`arrowup`,`arrowdown`,`arrowleft`,`arrowright`]),w=e=>{let t=e.key.toLowerCase();C.has(t)&&e.preventDefault(),e.type===`keydown`?(h.has(t)||(t===`j`&&(p.attack=!0),t===`l`&&(p.special=!0),t===`h`&&(p.shove=!0),(t===` `||t===`i`)&&(p.dodge=!0)),h.add(t)):h.delete(t)};window.addEventListener(`keydown`,w),window.addEventListener(`keyup`,w);let T=()=>{let e=m.x,t=m.z;(h.has(`a`)||h.has(`arrowleft`))&&--e,(h.has(`d`)||h.has(`arrowright`))&&(e+=1),(h.has(`w`)||h.has(`arrowup`))&&--t,(h.has(`s`)||h.has(`arrowdown`))&&(t+=1);let n={mx:e,mz:t,attack:p.attack,guard:f.guard||h.has(`k`),special:p.special,shove:p.shove,dodge:p.dodge};return p.attack=p.special=p.shove=p.dodge=!1,n},E=[r(`[data-hp='0']`),r(`[data-hp='1']`)],D=[r(`[data-hpn='0']`),r(`[data-hpn='1']`)],O=[r(`[data-st='0']`),r(`[data-st='1']`)],k=[r(`[data-ch='0']`),r(`[data-ch='1']`)];k.forEach((e,t)=>{e.innerHTML=`<i></i>`.repeat(i.fighters[t].st.chargeNeed)});let A=r(`[data-time]`),j=r(`.b-btn.special`),M=r(`.b-btn.attack`),N=r(`.b-btn.dodge`),P=r(`.b-btn.shove`),F=r(`.b-result`),ee=r(`.b-count`),te=()=>{i.fighters.forEach((e,t)=>{E[t].style.width=`${e.hp/e.maxHp*100}%`,D[t].textContent=`${Math.ceil(e.hp)}`,O[t].style.width=`${e.stamina/e.maxStamina*100}%`,O[t].parentElement.classList.toggle(`low`,e.stamina<pn(e.cfg)),k[t].querySelectorAll(`i`).forEach((t,n)=>{t.classList.toggle(`on`,n+1<=e.charge),t.classList.toggle(`half`,n<e.charge&&n+1>e.charge)}),k[t].classList.toggle(`full`,e.charge>=e.st.chargeNeed)}),A.textContent=String(Math.ceil((gt-i.tick)/30));let e=i.fighters[0],t=e.st.chargeNeed,n=e.charge>=t;j.textContent=n?`✨ひっさつ!`:`${e.charge}/${t}`,j.classList.toggle(`ready`,n),j.style.setProperty(`--cd`,String(1-e.charge/t)),M.classList.toggle(`low`,e.stamina<pn(e.cfg)),N.classList.toggle(`low`,e.stamina<e.st.dodgeCost),P.classList.toggle(`low`,e.shoveCd>0)},I=e=>{let n=1-e.target;switch(e.kind){case`hit`:o[n].dealt+=e.amount,e.src===`melee`?(o[n].melee++,t.punch()):(o[n].specialHits++,t.specialHit(e.size)),e.restrained&&t.bind();break;case`guard`:o[e.target].guards++,o[n].dealt+=e.amount,e.src===`melee`?o[n].melee++:o[n].specialHits++,t.guard();break;case`shoot`:o[e.target].shots++,t.shoot(e.size);break;case`land`:t.land(e.size);break;case`ready`:t.ready();break;case`ko`:t.ko();break;case`mstart`:o[e.target].shots++,t.shoot(.5);break;case`mactive`:{let n=e.tags??[];n.includes(`tornado`)&&t.spin(),n.includes(`rubber`)&&t.boing();break}case`grab`:t.grab();break;case`shove`:t.shove();break;case`dodge`:t.dodge();break;case`evade`:t.whiff();break;case`whiff`:t.whiff();break;case`slam`:t.land(1);break;case`status`:e.status===`crumple`?t.crumple():e.status===`wobble`?t.wah():t.bind()}},ne=document.createElement(`div`);ne.className=`b-err`,ne.hidden=!0,n.appendChild(ne);let re=new Set,ie=(e,t)=>{try{t()}catch(t){if(re.has(e))return;re.add(e),console.error(t);let n=t;ne.hidden=!1,ne.textContent+=`${ne.textContent?`
`:``}⚠ ${e}: ${n?.message??String(t)} ${(n?.stack??``).split(`
`).slice(0,2).join(` / `).slice(0,160)}`}},ae=performance.now(),oe=0,se=0,ce=!1,le=0,ue=0,L=-1,de=performance.now(),fe=e=>{ue=e+hp,L=-1,ee.hidden=!1};fe(de);let pe=n=>{se=requestAnimationFrame(pe);let c=Math.min(.25,(n-ae)/1e3);ae=n;let l=[];if(n<ue){let e=Math.ceil((ue-n)/(hp/3));e!==L&&(L=e,ee.textContent=String(e),ee.className=`b-count pop-in`,t.beep())}else L!==0&&(L=0,ee.textContent=`GO!`,ee.className=`b-count pop-in go`,t.beep(!0),setTimeout(()=>{ee.hidden=!0},600)),oe+=c*d,ie(`sim`,()=>{for(;oe>=mt;){oe-=mt;let t=e.spectate?kn(i,0,a[0]):T(),n=kn(i,1,a[1]);Tn(i,[t,n]),l.push(...i.events)}});if(ie(`sound`,()=>{for(let e of l)I(e)}),ie(`render`,()=>s.render(i,(n-de)/1e3,l)),ie(`hud`,te),i.winner!==-1&&!ce&&!le&&(le=n+1600),le&&n>=le&&!ce){ce=!0;let t=i.winner,n=t===2||t===-1?`引き分け`:e.spectate?`${i.fighters[t].cfg.name} の勝ち`:t===0?`勝ち！`:`負け…`;r(`.b-result-text`).textContent=n;let a=e=>i.fighters[e].cfg.name,s=(e,t)=>`<tr><td>${t(o[0])}</td><th>${e}</th><td>${t(o[1])}</td></tr>`;r(`.b-stats`).innerHTML=`<tr><td class="nm">${a(0)}</td><th></th><td class="nm">${a(1)}</td></tr>`+s(`与ダメージ`,e=>Math.round(e.dealt))+s(`通常攻撃 命中`,e=>e.melee)+s(`必殺 命中/発射`,e=>`${e.specialHits}/${e.shots}`)+s(`ガード`,e=>e.guards),F.hidden=!1;try{r(`.b-reward`).innerHTML=e.onResult?e.onResult(t===-1?2:t):``,e.onResultShown?.(r(`.b-reward`))}catch(e){ie(`reward`,()=>{throw e}),r(`.b-reward`).textContent=`ごほうびの けいさんで エラーが おきました（ごめんね）`}}};se=requestAnimationFrame(pe);let R=()=>s.resize();window.addEventListener(`resize`,R);let me=!1,z=()=>{me||(me=!0,cancelAnimationFrame(se),window.removeEventListener(`keydown`,w),window.removeEventListener(`keyup`,w),window.removeEventListener(`resize`,R),s.dispose(),n.remove(),document.body.classList.remove(`in-battle`),e.onExit())};return n.querySelectorAll(`[data-exit]`).forEach(e=>e.addEventListener(`click`,z)),r(`[data-again]`).addEventListener(`click`,()=>{t.unlock(),i=cn(e.player.cfg,e.cpu.cfg,e.seed=e.seed*1664525+1013904223>>>0),a=[On(),On(e.cpuLevel)],o=[mp(),mp()],ce=!1,le=0,oe=0,s.reset(),F.hidden=!0,fe(performance.now()),c()}),{close:z}}var _p=`doodle-arena:mute`,vp=class{ctx=null;master=null;noiseBuf=null;muted=!1;constructor(){try{this.muted=localStorage.getItem(_p)===`1`}catch{}}unlock(){if(this.ctx){this.ctx.resume();return}let e=window.AudioContext??window.webkitAudioContext;if(!e)return;this.ctx=new e,this.master=this.ctx.createGain(),this.master.gain.value=this.muted?0:.5,this.master.connect(this.ctx.destination);let t=this.ctx.sampleRate*.5;this.noiseBuf=this.ctx.createBuffer(1,t,this.ctx.sampleRate);let n=this.noiseBuf.getChannelData(0);for(let e=0;e<t;e++)n[e]=Math.random()*2-1}setMuted(e){this.muted=e,this.master&&(this.master.gain.value=e?0:.5);try{localStorage.setItem(_p,e?`1`:`0`)}catch{}}tone(e,t,n,r,i,a=0){let o=this.ctx,s=this.master;if(!o||!s)return;let c=o.currentTime+a,l=o.createOscillator(),u=o.createGain();l.type=e,l.frequency.setValueAtTime(t,c),l.frequency.exponentialRampToValueAtTime(Math.max(20,n),c+r),u.gain.setValueAtTime(i,c),u.gain.exponentialRampToValueAtTime(.001,c+r),l.connect(u).connect(s),l.start(c),l.stop(c+r+.02)}noise(e,t,n,r=1,i=0){let a=this.ctx,o=this.master;if(!a||!o||!this.noiseBuf)return;let s=a.currentTime+i,c=a.createBufferSource();c.buffer=this.noiseBuf;let l=a.createBiquadFilter();l.type=`bandpass`,l.frequency.value=n,l.Q.value=r;let u=a.createGain();u.gain.setValueAtTime(t,s),u.gain.exponentialRampToValueAtTime(.001,s+e),c.connect(l).connect(u).connect(o),c.start(s),c.stop(s+e+.02)}punch(){this.noise(.08,.9,1200,.8),this.tone(`sine`,180,60,.12,.8)}guard(){this.tone(`square`,1400,900,.08,.15),this.noise(.05,.3,4e3,2)}shoot(e){this.tone(`sawtooth`,300/(.5+e),1200,.25,.18),this.noise(.25,.4,2500,.7)}specialHit(e){this.noise(.25,1,600,.6),this.tone(`sine`,140/(.6+e*.5),40,.35,1)}land(e){this.noise(.5,1,250,.5),this.tone(`sine`,90/(.7+e*.5),30,.6,1.2)}ready(){[660,880,1320].forEach((e,t)=>this.tone(`triangle`,e,e,.12,.25,t*.07))}bind(){this.tone(`square`,500,250,.2,.15),this.tone(`square`,520,260,.2,.12,.08)}ko(){this.noise(.8,1,200,.4),this.tone(`sine`,120,30,1,1.2),[523,659,784].forEach(e=>this.tone(`triangle`,e,e,.8,.12,.35))}spin(){this.tone(`sawtooth`,200,900,.7,.12),this.noise(.7,.3,1500,.6)}boing(){this.tone(`sine`,220,660,.25,.5),this.tone(`sine`,660,330,.2,.3,.2)}grab(){this.noise(.06,.8,900,1),this.tone(`square`,300,200,.08,.15)}whiff(){this.noise(.15,.3,3e3,.5)}crumple(){for(let e=0;e<6;e++)this.noise(.04,.6,2500+e*300,3,e*.03)}wah(){this.tone(`triangle`,400,200,.3,.25),this.tone(`triangle`,300,450,.3,.2,.25)}shove(){this.noise(.1,.8,500,.7),this.tone(`sine`,120,70,.15,.6)}dodge(){this.noise(.18,.35,5e3,.4),this.tone(`sine`,900,1500,.12,.08)}beep(e=!1){this.tone(`square`,e?1046:523,e?1046:523,e?.35:.12,.2)}};function yp(e,t,n,i=r,a=[]){let o=h(t,i,a),s=N(t,o),c=s.bounds,l=et/Math.max(40,c.x1-c.x0,c.y1-c.y0),u=512/o.size,d=tt(o);return{res:o,parts:s,scale:l,originX:o.centroid[0]*u,features:d.features,marks:a,cfg:{name:e,reach:d.reach,hasHands:d.hasHands,hasFeet:d.hasFeet,special:n,traits:d.traits,hurt:it(t,o)}}}var bp=class{container;renderer=new _f({antialias:!0});scene=new Ts;camera=new hs(35,1,.1,50);stage=new xs;visual;fighter;disposables=[];raf=0;t0=performance.now();last=0;yaw=.35;drag=null;ro;constructor(e,t){this.container=e,this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.outputColorSpace=Jr,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=2,e.appendChild(this.renderer.domElement),this.scene.background=new G(15985919);let n=new Gc(16777215,14274542,1.3),r=new Qc(16777215,1.6);r.position.set(-3,8,6),r.castShadow=!0,r.shadow.mapSize.set(1024,1024),r.shadow.camera.left=-4,r.shadow.camera.right=4,r.shadow.camera.top=4,r.shadow.camera.bottom=-4,r.shadow.radius=4,this.scene.add(n,r);let i=new $o(new Sc(2.4,64),new Dc({color:16774888,roughness:.9}));i.rotation.x=-Math.PI/2,i.receiveShadow=!0;let a=new $o(new Cc(2.55,2.7,.5,64,1,!0),new Dc({color:15902298,roughness:.7}));a.position.y=-.25;let o=new $o(new Ec(2.48,.12,10,64),new Dc({color:16747100,roughness:.5}));o.rotation.x=-Math.PI/2,this.stage.add(i,a,o);for(let e of[i,a,o])this.disposables.push(e.geometry,e.material);let s={glow:yf(),ring:xf(),arc:Cf()};this.disposables.push(s.glow,s.ring,s.arc),this.visual=new up(t,16742938,s,this.disposables),this.stage.add(this.visual.root),this.scene.add(this.stage),this.fighter=cn(t.cfg,{...t.cfg,name:`x`},1).fighters[0],this.camera.position.set(0,2.4,5.6),this.camera.lookAt(0,.8,0);let c=this.renderer.domElement;c.style.touchAction=`none`,c.addEventListener(`pointerdown`,e=>{this.drag={x:e.clientX,yaw:this.yaw},c.setPointerCapture(e.pointerId)}),c.addEventListener(`pointermove`,e=>{this.drag&&(this.yaw=this.drag.yaw+(e.clientX-this.drag.x)*.01)});let l=()=>{this.drag=null};c.addEventListener(`pointerup`,l),c.addEventListener(`pointercancel`,l),this.ro=new ResizeObserver(()=>this.resize()),this.ro.observe(e),this.resize(),this.raf=requestAnimationFrame(this.frame)}resize(){let e=this.container.clientWidth||1,t=this.container.clientHeight||1;this.renderer.setSize(e,t),this.camera.aspect=e/t,this.camera.updateProjectionMatrix()}frame=e=>{let t=(e-this.t0)/1e3,n=Math.min(.05,this.last?(e-this.last)/1e3:0);this.last=e;let r=this.fighter,i=t%8,a=i>3.4&&i<4.2,o=Math.sin(t*.5)*.9,s=Math.cos(t*.5)*.45;if(r.x=o,r.z=0,r.vx=a?0:s,r.vz=0,r.fx=s>=0?1:-1,r.fz=0,r.moving=!a,a){let e=i-3.4;r.attack=e<.3?`windup`:e<.5?`active`:`recover`,r.attackT=Math.floor((e<.3?e:e-.3)*30)}else r.attack=`none`,r.attackT=0;this.visual.update(r,t,n),this.drag||(this.yaw+=n*.15),this.stage.rotation.y=this.yaw,this.renderer.render(this.scene,this.camera),this.raf=requestAnimationFrame(this.frame)};dispose(){cancelAnimationFrame(this.raf),this.ro.disconnect();for(let e of this.disposables)e.dispose();this.renderer.dispose(),this.renderer.forceContextLoss(),this.renderer.domElement.remove()}},xp=`doodle-arena:inventory`;function Sp(e){return typeof e?.id==`string`&&typeof e.kind==`string`&&Wf(e.kind)&&Ff.includes(e.rarity)&&typeof e.roll==`number`&&typeof e.cost==`number`&&Array.isArray(e.extras)}function Cp(){try{let e=localStorage.getItem(xp);if(!e)return null;let t=JSON.parse(e);return{v:1,parts:Array.isArray(t.parts)?t.parts.filter(Sp):[],shards:Math.max(0,Number(t.shards)||0),sinceA:Math.max(0,Number(t.sinceA)||0)}}catch{return null}}var wp=()=>Cp()??{v:1,parts:[],shards:0,sinceA:0};function Tp(e){try{return localStorage.setItem(xp,JSON.stringify(e)),!0}catch{return!1}}function Ep(e,t,n=Math.random,r=!1){let i=wp(),a={got:[],shardsInstead:0},o=t?2:1;for(let s=0;s<o;s++){let o=np(e,n);t&&s===0&&(o=Ff[Math.min(Ff.length-1,If(o)+1)]),r&&s===0&&(o=n()<.25?`S`:`A`),i.sinceA+1>=20&&If(o)<If(`A`)&&(o=`A`),i.sinceA=If(o)>=If(`A`)?0:i.sinceA+1;let c=new Set(i.parts.map(e=>e.kind)),l=Uf.flatMap(e=>c.has(e)?[e]:[e,e]),u=Jf(l[Math.floor(n()*l.length)],o,n);i.parts.length>=300?(i.shards+=Lf[o].shards,a.shardsInstead+=Lf[o].shards):(i.parts.push(u),a.got.push(u))}return Tp(i),a}function Dp(e){let t=wp(),n=t.parts.find(t=>t.id===e);return!n||n.locked?0:(t.parts=t.parts.filter(t=>t.id!==e),t.shards+=Lf[n.rarity].shards,Tp(t),Lf[n.rarity].shards)}var Op=e=>Lf[e].shards*2;function kp(e,t=Math.random){let n=wp(),r=n.parts.findIndex(t=>t.id===e);if(r<0||n.shards<Op(n.parts[r].rarity))return null;let i=n.parts[r];return n.shards-=Op(i.rarity),n.parts[r]={...Jf(i.kind,i.rarity,t,i.id),...i.locked?{locked:!0}:{}},Tp(n),n.parts[r]}var Ap=(e,t)=>!e.locked&&!t.has(e.id);function jp(e,t,n,r=Math.random){let i=wp(),a=i.parts.find(t=>t.id===e);if(!a||a.rarity===`S`||a.locked)return null;let o=[...new Set(t)].filter(t=>t!==e).map(e=>i.parts.find(t=>t.id===e));if(o.length!==4||o.some(e=>!e||e.kind!==a.kind||e.rarity!==a.rarity||!Ap(e,n)))return null;let s=new Set(t),c=Jf(a.kind,Ff[If(a.rarity)+1],r,a.id);return i.parts=i.parts.filter(e=>!s.has(e.id)).map(e=>e.id===a.id?c:e),Tp(i),c}function Mp(e,t,n={}){let r=new Map;for(let t of e){if(t.rarity===`S`||t.locked)continue;let e=`${t.kind}|${t.rarity}`;r.set(e,[...r.get(e)??[],t])}let i=[];for(let[e,a]of r){let r=new Set,o=[...a].sort((e,n)=>Number(t.has(n.id))-Number(t.has(e.id))||n.roll-e.roll),s=[...a].filter(e=>Ap(e,t)).sort((e,t)=>e.roll-t.roll),c=n[e]??[],l=e=>s.filter(t=>t.id!==e&&!r.has(t.id)).length>=4;for(let e=0;;e++){let t=o.filter(e=>!r.has(e.id)&&l(e.id)).map(e=>e.id);if(!t.length)break;let n=c[e]&&t.includes(c[e])?c[e]:t[0],u=s.filter(e=>e.id!==n&&!r.has(e.id)).slice(0,4);r.add(n),u.forEach(e=>r.add(e.id)),i.push({kind:a[0].kind,rarity:a[0].rarity,baseId:n,materialIds:u.map(e=>e.id),candidates:t})}}return i}function Np(e){let t=wp(),n=t.parts.find(t=>t.id===e);return n?(n.locked=!n.locked,Tp(t),!!n.locked):!1}function Pp(e){if(Cp())return null;let t=[...new Set([`r:homing`,`m:tornado`,...e])],n=new Map,r={v:1,parts:[],shards:0,sinceA:0};for(let e of t){let t=Jf(e,`C`,()=>.5);t.roll=1,t.id=`start-${e.replace(`:`,`-`)}`,r.parts.push(t),n.set(e,t.id)}return Tp(r),n}function Fp(e,t=Math.random){let n=wp(),r=new Set(n.parts.map(e=>e.kind)),i=Uf.flatMap(e=>r.has(e)?[e]:[e,e]),a=Jf(i[Math.floor(t()*i.length)],e,t);return n.parts.length>=300?(n.shards+=Lf[e].shards,Tp(n),{got:[],shardsInstead:Lf[e].shards}):(n.parts.push(a),Tp(n),{got:[a],shardsInstead:0})}function Ip(e){let t=wp();t.shards+=e,Tp(t)}var Lp=[{key:`atk`,label:`攻撃`,color:`#e8590c`,title:`こうげきマスター`,small:{name:`攻撃`,desc:`与えるダメージ +4%`,boost:{dealt:.04}},notable:{name:`パンチ名人`,desc:`通常攻撃の威力 +10%`,boost:{punch:.1}},forks:[{name:`ちから自慢`,desc:`通常攻撃の威力 +15%`,boost:{punch:.15}},{name:`するどい目`,desc:`与えるダメージ +6%・移動 +3%`,boost:{dealt:.06,speed:.03}}],keystone:{name:`重い拳`,desc:`通常攻撃の威力 +25%／代わりに構えが少し遅い`,boost:{punch:.25,windup:2}}},{key:`sp`,label:`必殺`,color:`#ae3ec9`,title:`ひっさつマスター`,small:{name:`必殺`,desc:`必殺の威力 +5%`,boost:{special:.05}},notable:{name:`必殺の練習`,desc:`必殺の威力 +8%`,boost:{special:.08}},forks:[{name:`ためこみ`,desc:`必殺の威力 +15%`,boost:{special:.15}},{name:`まもって ためる`,desc:`防御成功で溜まる必殺ゲージ +0.25・必殺の威力 +5%`,boost:{guardCharge:.25,special:.05}}],keystone:{name:`せっかち`,desc:`必殺に必要な命中 −1回／代わりに必殺の威力 −15%`,boost:{chargeNeed:-1,special:-.15}}},{key:`tec`,label:`技`,color:`#5c7cfa`,title:`わざマスター`,small:{name:`身のこなし`,desc:`回避のスタミナ −3`,boost:{dodgeCost:-3}},notable:{name:`受け身`,desc:`吹き飛ばされにくさ +10%`,boost:{knock:-.1}},forks:[{name:`みきり`,desc:`防御中のスタミナ消費 −40%・防御中の移動 +15%`,boost:{guardDrain:-.4,guardMove:.15}},{name:`すりぬけ`,desc:`回避のスタミナ −4・移動 +3%`,boost:{dodgeCost:-4,speed:.03}}],keystone:{name:`受け流し名人`,desc:`防御成功で溜まる必殺ゲージ +0.5→+1／代わりに防御中のスタミナ消費 2倍`,boost:{guardCharge:.5,guardDrain:1}}},{key:`spd`,label:`移動`,color:`#0c8599`,title:`かけっこマスター`,small:{name:`移動`,desc:`移動の速さ +5%`,boost:{speed:.05}},notable:{name:`身軽`,desc:`移動の速さ +5%`,boost:{speed:.05}},forks:[{name:`はやあし`,desc:`移動の速さ +8%`,boost:{speed:.08}},{name:`かるいステップ`,desc:`回避のスタミナ −5`,boost:{dodgeCost:-5}}],keystone:{name:`韋駄天`,desc:`移動の速さ +15%／代わりに吹き飛ばされやすさ +20%`,boost:{speed:.15,knock:.2}}},{key:`sta`,label:`スタミナ`,color:`#f59f00`,title:`スタミナマスター`,small:{name:`スタミナ`,desc:`スタミナ +5・回復 +4%`,boost:{stamina:5,regen:.04}},notable:{name:`スタミナ満タン`,desc:`スタミナ +8・回復 +5%`,boost:{stamina:8,regen:.05}},forks:[{name:`深呼吸`,desc:`スタミナ回復 +15%`,boost:{regen:.15}},{name:`おおきな肺`,desc:`スタミナ +20`,boost:{stamina:20}}],keystone:{name:`無尽蔵`,desc:`スタミナ回復 +30%／代わりに最大スタミナ −10`,boost:{regen:.3,stamina:-10}}},{key:`hp`,label:`体力`,color:`#2f9e44`,title:`たいりょくマスター`,small:{name:`体力`,desc:`体力 +5`,boost:{hp:5}},notable:{name:`げんき`,desc:`体力 +10`,boost:{hp:10}},forks:[{name:`でっかい体力`,desc:`体力 +20`,boost:{hp:20}},{name:`ふんばり`,desc:`吹き飛ばされにくさ +25%`,boost:{knock:-.25}}],keystone:{name:`どっしり`,desc:`体力 +20・吹き飛ばされにくさ +20%／代わりに移動 −5%`,boost:{hp:20,knock:-.2,speed:-.05}}},{key:`def`,label:`防御`,color:`#1c7ed6`,title:`まもりマスター`,small:{name:`防御`,desc:`受けるダメージ −4%`,boost:{taken:.04}},notable:{name:`かたい皮`,desc:`受けるダメージ −5%`,boost:{taken:.05}},forks:[{name:`てっぺき盾`,desc:`防御で減らす割合 +8%`,boost:{guardCut:.08}},{name:`ガードで げんき`,desc:`防御成功で溜まる必殺ゲージ +0.25・防御中のスタミナ消費 −30%`,boost:{guardCharge:.25,guardDrain:-.3}}],keystone:{name:`鉄壁`,desc:`防御で8割カット（標準7割）／代わりに防御中の移動がさらに遅い`,boost:{guardCut:.1,guardMove:-.2}}}],Rp=[{a:`atk`,b:`sp`,name:`らくがき大爆発`,desc:`与えるダメージ +5%・必殺の威力 +10%`,boost:{dealt:.05,special:.1}},{a:`sp`,b:`tec`,name:`ひらめき`,desc:`防御成功で溜まる必殺ゲージ +0.5`,boost:{guardCharge:.5}},{a:`tec`,b:`spd`,name:`ニンジャ`,desc:`回避のスタミナ −6・移動 +5%`,boost:{dodgeCost:-6,speed:.05}},{a:`spd`,b:`sta`,name:`マラソン`,desc:`スタミナ回復 +15%・移動 +5%`,boost:{regen:.15,speed:.05}},{a:`sta`,b:`hp`,name:`タフガイ`,desc:`体力 +15・スタミナ +10`,boost:{hp:15,stamina:10}},{a:`hp`,b:`def`,name:`かたいやつ`,desc:`受けるダメージ −6%・吹き飛ばされにくさ +15%`,boost:{taken:.06,knock:-.15}},{a:`def`,b:`atk`,name:`カウンターパンチ`,desc:`防御で減らす割合 +5%・通常攻撃の威力 +10%`,boost:{guardCut:.05,punch:.1}}],zp=[{id:`t-roll`,when:`noFeet`,name:`ころころ名人`,desc:`足がないキャラだけ: 移動の速さ +12%`,boost:{speed:.12}},{id:`t-tackle`,when:`noHands`,name:`体当たり番長`,desc:`手がないキャラだけ: 通常攻撃の威力 +20%・吹き飛ばされにくさ +10%`,boost:{punch:.2,knock:-.1}},{id:`t-many`,when:`multiHands`,name:`千手`,desc:`手がたくさんのキャラだけ: 通常攻撃の威力 +12%`,boost:{punch:.12}},{id:`t-long`,when:`longArms`,name:`のっぽの一撃`,desc:`手が長いキャラだけ: 与えるダメージ +6%`,boost:{dealt:.06}}],Bp=(e,t)=>`${e}-${t}`,Vp=[...Lp.flatMap(e=>{let t=t=>Bp(e.key,t),n=(n,r)=>({id:t(n),kind:`small`,branch:e.key,tier:n,name:`${e.small.name} ${n}`,desc:e.small.desc,cost:1,boost:e.small.boost,requires:[],...r});return[n(1,{}),n(2,{requires:[t(1)]}),{id:t(3),kind:`notable`,branch:e.key,tier:3,name:e.notable.name,desc:e.notable.desc,cost:2,boost:e.notable.boost,requires:[t(2)]},n(4,{requires:[t(3)]}),{id:t(`5a`),kind:`fork`,branch:e.key,tier:5,name:e.forks[0].name,desc:e.forks[0].desc,cost:2,boost:e.forks[0].boost,requires:[t(4)],excludes:t(`5b`)},{id:t(`5b`),kind:`fork`,branch:e.key,tier:5,name:e.forks[1].name,desc:e.forks[1].desc,cost:2,boost:e.forks[1].boost,requires:[t(4)],excludes:t(`5a`)},n(6,{requires:[],requiresAny:[t(`5a`),t(`5b`)]}),{id:t(7),kind:`keystone`,branch:e.key,tier:7,name:e.keystone.name,desc:e.keystone.desc,cost:3,boost:e.keystone.boost,requires:[t(6)]}]}),...Rp.map(e=>({id:`x-${e.a}-${e.b}`,kind:`bridge`,tier:3,name:e.name,desc:`${e.desc}（${Hp(e.a)}と${Hp(e.b)}の ★を とると ひらく）`,cost:3,boost:e.boost,requires:[Bp(e.a,3),Bp(e.b,3)],between:[e.a,e.b]})),...zp.map(e=>({id:e.id,kind:`talent`,tier:0,name:e.name,desc:e.desc,cost:1,boost:e.boost,requires:[],when:e.when}))];function Hp(e){return Lp.find(t=>t.key===e)?.label??e}var Up=new Map(Vp.map(e=>[e.id,e])),Wp=e=>Up.get(e),Gp=Vp.filter(e=>e.kind!==`fork`).reduce((e,t)=>e+t.cost,0)+Lp.length*2,Kp=()=>Vp.filter(e=>e.kind===`talent`),qp=()=>Vp.filter(e=>e.kind===`bridge`);function Jp(e,t){let n=Up.get(e);return!(!n||t.includes(e)||n.excludes&&t.includes(n.excludes)||!n.requires.every(e=>t.includes(e))||n.requiresAny&&!n.requiresAny.some(e=>t.includes(e)))}var Yp=e=>e.reduce((e,t)=>e+(Up.get(t)?.cost??0),0);function Xp(e){let t=e.match(/^(atk|def|hp|sta|spd|sp|tec)([1-6])$/);return t&&t[2]===`6`?3:1}function Zp(e,t){return e?t?e===`noFeet`?!t.hasFeet:e===`noHands`?!t.hasHands:e===`multiHands`?t.hasHands&&t.hits>1:t.hasHands&&t.reach>=.7:!1:!0}function Qp(e,t){return ut(e.map(e=>Up.get(e)).filter(e=>!!e&&Zp(e.when,t)).map(e=>e.boost))}function $p(e){if(new Set(e).size!==e.length)return!1;let t=[...e],n=[];for(;t.length;){let e=t.findIndex(e=>Jp(e,n));if(e<0)return!1;n.push(t.splice(e,1)[0])}return!0}function em(e){return Lp.filter(t=>e.includes(Bp(t.key,7)))}function tm(e,t){let n=[],r=Math.min(e,60);for(let e=0;e<300&&r>0;e++){let e=!1;for(let i of t){let t=Vp.find(e=>e.branch===i&&Jp(e.id,n))??qp().find(e=>e.between?.includes(i)&&Jp(e.id,n));if(t&&t.cost<=r&&(n.push(t.id),r-=t.cost,e=!0,r<=0))break}if(!e)break}return n}var nm=`doodle-arena:roster`,rm=`doodle-arena:draft`;function im(){try{let e=localStorage.getItem(nm),t=e?JSON.parse(e):[];return Array.isArray(t)?t.map(cm):[]}catch{return[]}}function am(e){try{return localStorage.setItem(nm,JSON.stringify(e)),!0}catch{return!1}}var om=e=>Array.isArray(e)?e.filter(e=>typeof e==`string`):[],sm=(e,t)=>t===`ranged`?e.partsR:e.partsM;function cm(e){let t={...pt,...e.stats??{}};for(let e of ft)t[e]=Math.max(0,Math.min(10,Math.round(Number(t[e])||0)));let n=ft.reduce((e,n)=>e+t[n],0);for(let e of ft)for(;n>20&&t[e]>0;)t[e]--,n--;return{id:e.id??lm(),name:(e.name??``).slice(0,16)||`名無し`,strokes:Array.isArray(e.strokes)?e.strokes:[],marks:Array.isArray(e.marks)?e.marks:[],stats:t,personality:e.personality??`aggressive`,specialType:e.specialType===`melee`?`melee`:`ranged`,special:e.special??[],melee:e.melee??[],partsR:om(e.partsR??e.parts),partsM:om(e.partsM??e.parts),thumb:e.thumb,savedAt:e.savedAt??Date.now(),shapeVersion:e.shapeVersion??1}}function lm(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}function um(e){let t=M(e),n=document.createElement(`canvas`);n.width=n.height=88;let r=n.getContext(`2d`);return r.fillStyle=`#fff`,r.fillRect(0,0,88,88),r.drawImage(t,0,0,88,88),n.toDataURL(`image/png`)}function dm(e){let t=im().filter(t=>t.id!==e.id);return t.unshift({...e,thumb:um(e.strokes),savedAt:Date.now(),shapeVersion:1}),am(t)}function fm(e){return am(im().filter(t=>t.id!==e))}function pm(){try{let e=localStorage.getItem(rm);return e?JSON.parse(e):null}catch{return null}}function mm(e){try{localStorage.setItem(rm,JSON.stringify(e))}catch{}}var hm=`doodle-arena:profile`,gm=`doodle-arena:story`,_m=e=>45+15*e;function vm(e){try{let t=localStorage.getItem(e);return t?JSON.parse(t):null}catch{return null}}function ym(e,t){try{return localStorage.setItem(e,JSON.stringify(t)),!0}catch{return!1}}function bm(){let e=vm(hm),t=(e,t)=>typeof e==`number`&&Number.isFinite(e)&&e>=0?e:t,n={v:1,level:Math.min(60,Math.max(1,Math.floor(t(e?.level,1)))),exp:t(e?.exp,0),points:Math.floor(t(e?.points,0)),nodes:[]},r=Array.isArray(e?.nodes)?e.nodes.filter(e=>typeof e==`string`):[];return $p(r)&&Yp(r)<=60?n.nodes=r:n.points+=r.reduce((e,t)=>e+(Wp(t)?.cost??Xp(t)),0),n}var xm=e=>e.points+Yp(e.nodes);function Sm(e){let t=bm(),n=Wp(e);return!n||!Jp(e,t.nodes)||t.points<n.cost||Yp(t.nodes)+n.cost>60?!1:(t.nodes.push(e),t.points-=n.cost,wm(t))}function Cm(){let e=bm();e.points+=Yp(e.nodes),e.nodes=[],wm(e)}var wm=e=>ym(hm,e);function Tm(){let e=vm(gm),t={};if(e?.cleared&&typeof e.cleared==`object`)for(let[n,r]of Object.entries(e.cleared))typeof r==`number`&&r>0&&(t[n]=r);return{v:1,cleared:t}}var Em=e=>ym(gm,e);function Dm(e,t,n,r){bm();let i=Tm(),a=40+12*e,o=r&&!i.cleared[t],s=r?o?a:Math.round(a/2):Math.round(a/4);r&&(i.cleared[t]=(i.cleared[t]??0)+1),Em(i);let c=Om(s,o&&n?1:0);return{exp:s,levelsUp:c.levelsUp,points:c.points,firstClear:o}}function Om(e,t=0){let n=bm(),r=t,i=0;for(n.exp+=Math.max(0,Math.round(e));n.level<60&&n.exp>=_m(n.level);)n.exp-=_m(n.level),n.level++,i++,r++;return n.level>=60&&(n.exp=0),n.points+=r,wm(n),{levelsUp:i,points:r}}function km(){let{cleared:e}=Tm(),t=1;for(let n of Object.keys(e)){let[e,r]=n.split(`-`).map(Number);e&&r&&(t=Math.max(t,(e-1)*6+r))}return t}var Am=`doodle-arena:`;function jm(e){let t=``;for(let n=0;n<e.length;n+=32768)t+=String.fromCharCode(...e.subarray(n,n+32768));return btoa(t)}function Mm(e){let t=atob(e),n=new Uint8Array(t.length);for(let e=0;e<t.length;e++)n[e]=t.charCodeAt(e);return n}async function Nm(e,t){let n=new Response(new Blob([e]).stream().pipeThrough(t));return new Uint8Array(await n.arrayBuffer())}var Pm=typeof CompressionStream<`u`&&typeof DecompressionStream<`u`;async function Fm(){let e={};for(let t=0;t<localStorage.length;t++){let n=localStorage.key(t);n&&n.startsWith(Am)&&(e[n]=localStorage.getItem(n)??``)}let t=new TextEncoder().encode(JSON.stringify(e));return Pm?`DA1:`+jm(await Nm(t,new CompressionStream(`gzip`))):`DA0:`+jm(t)}async function Im(e){let t=/DA[01]:[A-Za-z0-9+/=]+/.exec(e.replace(/\s+/g,``))?.[0]??``,n;if(t.startsWith(`DA1:`)){if(!Pm)throw Error(`このブラウザでは読み込めないコードです`);n=await Nm(Mm(t.slice(4)),new DecompressionStream(`gzip`))}else if(t.startsWith(`DA0:`))n=Mm(t.slice(4));else throw Error(`引き継ぎコードではありません`);let r=JSON.parse(new TextDecoder().decode(n)),i=Object.entries(r).filter(([e,t])=>e.startsWith(Am)&&typeof t==`string`);if(!i.length)throw Error(`中身が空のコードです`);let a=[];for(let e=0;e<localStorage.length;e++){let t=localStorage.key(e);t&&t.startsWith(Am)&&a.push(t)}for(let e of a)localStorage.removeItem(e);for(let[e,t]of i)localStorage.setItem(e,t);return i.length}function Lm(){try{navigator.storage?.persist?.()}catch{}}var J=(e,t=9,n=`#222222`)=>({color:n,width:t,points:e}),Rm=(e,t,n)=>({color:n,width:0,points:[e,t],fill:!0});function zm(e,t,n,r=9,i=`#222222`){let a=[];for(let r=0;r<=40;r++){let i=r/40*Math.PI*2;a.push(Math.round(e+Math.cos(i)*n),Math.round(t+Math.sin(i)*n))}return J(a,r,i)}function Bm(e,t,n,r,i=9,a=`#222222`){let o=[];for(let i=0;i<=48;i++){let a=i/48*Math.PI*2;o.push(Math.round(e+Math.cos(a)*n),Math.round(t+Math.sin(a)*r))}return J(o,i,a)}var Vm=(e,t,n,r=9)=>[zm(e,n,r,7),zm(t,n,r,7)],Hm={おにぎりゴロン:()=>[J([256,100,300,150,380,330,370,375,140,375,130,330,212,150,256,100],10,`#495057`),Rm(256,250,`#fffdf2`),J([205,300,307,300,307,375,205,375,205,300],8,`#1b1b1b`),Rm(256,340,`#1b1b1b`),...Vm(228,284,240,7),J([238,272,256,282,274,272],6)],ムカデせんせい:()=>{let e=[Bm(270,250,175,42,10,`#c92a2a`),Rm(270,250,`#ff8787`)];for(let t=0;t<7;t++){let n=145+t*40;e.push(J([n,285,n-8,345,n-18,370],9,`#862e9c`))}return e.push(zm(85,235,40,10,`#c92a2a`),Rm(85,235,`#ffc9c9`)),e.push(J([70,200,50,140,20,110],7,`#862e9c`),J([95,198,105,135,135,105],7,`#862e9c`)),e.push(zm(72,228,6,6),zm(98,228,6,6),J([100,160,75,165],5)),e},よこあるきガニ:()=>{let e=[Bm(256,270,150,72,10,`#e03131`),Rm(256,270,`#ffa8a8`)];e.push(J([150,225,95,150,80,100],13,`#e03131`),J([60,90,80,100,100,70],13,`#e03131`)),e.push(J([362,225,417,150,432,100],13,`#e03131`),J([412,70,432,100,452,90],13,`#e03131`));for(let[t,n]of[[160,-55],[200,-40],[235,-20],[277,20],[312,40],[352,55]])e.push(J([t,330,t+n*.6,375,t+n,420],10,`#e03131`));return e.push(J([220,200,215,170],6),J([292,200,297,170],6),zm(215,165,9,7),zm(297,165,9,7)),e},かさおばけ:()=>[J([96,230,120,150,180,95,256,75,332,95,392,150,416,230,376,222,336,230,296,222,256,230,216,222,176,230,136,222,96,230],10,`#5f3dc4`),Rm(256,160,`#b197fc`),zm(256,150,26,8),Rm(256,150,`#ffffff`),zm(262,152,8,6),J([256,232,256,440],12,`#795548`),J([226,450,286,450],14,`#795548`),J([250,190,262,215,254,230],10,`#f06595`)],ふわりおばけ:()=>[J([160,340,160,200,180,130,256,95,332,130,352,200,352,335,326,325,299,338,272,325,245,338,218,325,191,338,160,335],9,`#74c0fc`),Rm(256,220,`#e7f5ff`),...Vm(226,286,200,10),Bm(256,250,14,18,7),J([162,230,115,250,85,240],10,`#74c0fc`),J([350,230,397,250,427,240],10,`#74c0fc`)],どっしりトーフ:()=>[J([130,140,382,140,382,392,130,392,130,140],10,`#868e96`),Rm(256,266,`#fff3bf`),...Vm(205,307,240,10),J([225,300,256,320,287,300],8),J([145,280,175,285],8,`#ffa8a8`),J([337,285,367,280],8,`#ffa8a8`)],えんぴつナイト:()=>[zm(170,250,60,10,`#1971c2`),Rm(170,250,`#a5d8ff`),...Vm(150,190,240,7),J([228,245,440,175],20,`#fab005`),J([440,175,495,158],12,`#5c3d2e`),J([112,255,70,270],10,`#1971c2`),zm(55,275,22,9,`#495057`),J([150,305,135,400,115,415],10,`#1971c2`),J([192,305,205,400,225,415],10,`#1971c2`)],ハリネズミ:()=>{let e=[Bm(250,300,140,80,10,`#7f5539`),Rm(250,300,`#ddb892`)];for(let t=0;t<9;t++){let n=Math.PI*(1.05+t/8*.75);e.push(J([250+Math.cos(n)*130,300+Math.sin(n)*72,250+Math.cos(n)*205,300+Math.sin(n)*140],9,`#582f0e`))}for(let t of[175,220,285,330])e.push(J([t,375,t,410],14,`#7f5539`));return e.push(zm(345,290,8,7),zm(392,305,9,8,`#222222`)),e},ひょろグモ:()=>{let e=[zm(256,250,38,9,`#212529`),Rm(256,250,`#495057`),...Vm(242,270,245,6)];for(let[t,n,r]of[[232,190,106],[244,215,156],[268,297,356],[280,322,406]])e.push(J([t,282,n,330,r,450],6,`#212529`));return e.push(J([225,235,180,170,150,160],6,`#212529`),J([287,235,332,170,362,160],6,`#212529`)),e},がたごとでんしゃ:()=>[J([60,180,452,180,452,330,60,330,60,180],10,`#2b8a3e`),Rm(256,300,`#69db7c`),J([90,205,150,205,150,255,90,255,90,205],7,`#1864ab`),J([190,205,250,205,250,255,190,255,190,205],7,`#1864ab`),J([290,205,350,205,350,255,290,255,290,205],7,`#1864ab`),J([390,205,430,205,430,255,390,255,390,205],7,`#1864ab`),...[120,200,312,392].flatMap(e=>[zm(e,345,24,9,`#212529`),Rm(e,345,`#495057`)]),J([236,180,256,158,276,180],7,`#495057`),J([226,155,286,155],7,`#495057`)],ソフトクリン:()=>[J([180,290,332,290,256,475,180,290],10,`#e8590c`),Rm(256,340,`#ffc078`),J([215,320,290,390],6,`#d9480f`),J([297,320,222,390],6,`#d9480f`),Bm(256,265,105,40,9,`#f783ac`),Rm(256,265,`#fff0f6`),Bm(256,210,80,35,9,`#f783ac`),Rm(256,210,`#fff0f6`),Bm(256,162,52,28,9,`#f783ac`),Rm(256,162,`#fff0f6`),J([256,135,266,105,248,85],9,`#f783ac`),...Vm(232,280,205,7)],チョキチョキ:()=>[J([248,290,170,50],24,`#adb5bd`),J([264,290,342,50],24,`#adb5bd`),zm(256,285,14,8,`#495057`),zm(205,375,50,14,`#e03131`),zm(307,375,50,14,`#e03131`),J([236,320,250,300],14,`#e03131`),J([276,320,262,300],14,`#e03131`),...Vm(190,322,372,6)],"もじの「ん」":()=>[J([235,70,190,220,125,430],20,`#7048e8`),J([150,360,215,285,265,290,285,340,305,410,345,430,400,380],20,`#7048e8`),zm(215,270,42,9,`#7048e8`),Rm(215,270,`#d0bfff`),...Vm(200,232,262,6)],くるくるせんぷうき:()=>{let e=[];for(let t of[-90,30,150]){let n=t*Math.PI/180,r=e=>[Math.round(256+Math.cos(n)*e),Math.round(190+Math.sin(n)*e)];e.push(J([...r(40),...r(150)],26,`#1098ad`),J([...r(70),...r(140)],10,`#99e9f2`))}return e.push(zm(256,190,40,10,`#0b7285`),Rm(256,190,`#3bc9db`),...Vm(242,270,185,6)),e.push(J([256,232,256,440],14,`#495057`)),e},イソギンチャク:()=>{let e=[Bm(256,380,125,65,10,`#d6336c`),Rm(256,380,`#faa2c1`)];for(let t=0;t<9;t++){let n=156+t*25,r=[];for(let e=0;e<=10;e++)r.push(Math.round(n+(n-256)*e*.06+Math.sin(e*.9+t)*10),325-e*20);e.push(J(r,11,`#f06595`))}return e.push(...Vm(225,287,385,8)),e},にょろヘビ:()=>{let e=[];for(let t=0;t<=40;t++)e.push(Math.round(110+t*8),Math.round(330+Math.sin(t*.35)*55));return[J(e,34,`#37b24d`),zm(90,320,48,10,`#2b8a3e`),Rm(90,320,`#8ce99a`),zm(75,305,7,6),zm(105,305,7,6),J([45,340,15,350,5,340],5,`#e03131`)]}},Um={おにぎりゴロン:{intro:`三角だから転がり出しはのんびり。勢いがつくと止まらない`,personality:`aggressive`,specialType:`melee`,parts:[`m:dash`,`power`],prefer:[`spd`,`atk`,`hp`],catchphrase:`具は ひみつだよ！`},ムカデせんせい:{intro:`足がたくさんで押されても動じない。触角でつつく`,personality:`cautious`,specialType:`ranged`,parts:[`r:multi`,`r:homing`],prefer:[`def`,`hp`,`sta`],catchphrase:`はい、足の数を かぞえて！`},よこあるきガニ:{intro:`横に大きくて当たりやすいが、ハサミでつかんで投げる`,personality:`tricky`,specialType:`melee`,parts:[`m:grab`,`windup`],prefer:[`tec`,`def`,`hp`],catchphrase:`チョキで まけないカニ`},かさおばけ:{intro:`一本足でぴょんぴょん速い。手が無いのでベロごと体当たり`,personality:`tricky`,specialType:`melee`,parts:[`m:wobble`,`m:dash`],prefer:[`spd`,`tec`,`sp`],catchphrase:`うらめし〜 あめ〜`},ふわりおばけ:{intro:`足が無くてふわふわ転がる。見えない弾でいたずら`,personality:`sniper`,specialType:`ranged`,parts:[`r:invisible`,`r:homing`],prefer:[`sp`,`spd`,`tec`],catchphrase:`ばあっ！ …びっくりした？`},どっしりトーフ:{intro:`中までぎっしり。重くて飛ばされない、ぶつかると痛い`,personality:`cautious`,specialType:`melee`,parts:[`m:slam`,`power`],prefer:[`hp`,`def`,`atk`],catchphrase:`くずれないよ、もめんだから`},えんぴつナイト:{intro:`えんぴつの槍がとても長い。遠くからチクッと突く`,personality:`sniper`,specialType:`melee`,parts:[`m:rubber`,`windup`],prefer:[`tec`,`spd`,`sta`],catchphrase:`とがらせて きた！`},ハリネズミ:{intro:`背中のトゲが全部手＝3連打。短い足でのっしのっし`,personality:`aggressive`,specialType:`ranged`,parts:[`r:multi`,`r:fast`],prefer:[`atk`,`sta`,`spd`],catchphrase:`さわると チクチクだぞ`},ひょろグモ:{intro:`長い足でスタスタ速い。でも軽くてすぐ飛ばされる`,personality:`tricky`,specialType:`ranged`,parts:[`r:restrain`,`r:tiny`],prefer:[`spd`,`tec`,`sp`],catchphrase:`あみに かかったね`},がたごとでんしゃ:{intro:`横長の車体で走り出したら止まらない体当たり`,personality:`aggressive`,specialType:`melee`,parts:[`m:dash`,`m:legbind`],prefer:[`spd`,`hp`,`atk`],catchphrase:`発車しまーす！`},ソフトクリン:{intro:`コーンの先が1本足、てっぺんのクルンが手。冷たい弾が空から降る`,personality:`sniper`,specialType:`ranged`,parts:[`r:meteor`,`r:giant`],prefer:[`sp`,`sta`,`spd`],catchphrase:`とけるまえに かつ！`},チョキチョキ:{intro:`刃がとても長い。足が無いので転がって切りかかる`,personality:`aggressive`,specialType:`melee`,parts:[`m:crumple`,`windup`],prefer:[`atk`,`tec`,`spd`],catchphrase:`かみなら まかせて`},"もじの「ん」":{intro:`「ん」の線がそのまま長い手と足。しりとりで負けない`,personality:`tricky`,specialType:`ranged`,parts:[`r:fast`,`r:tiny`],prefer:[`tec`,`sp`,`spd`],catchphrase:`ん！（これで おわり）`},くるくるせんぷうき:{intro:`羽根3枚が手（2連打）。スタンドの1本足で意外とすばやい`,personality:`cautious`,specialType:`melee`,parts:[`m:tornado`,`duration`],prefer:[`sta`,`def`,`tec`],catchphrase:`強・中・弱、どれにする？`},イソギンチャク:{intro:`上向きの触手がいっぱい。転がりながら連打する`,personality:`cautious`,specialType:`ranged`,parts:[`r:restrain`,`r:multi`],prefer:[`def`,`sta`,`sp`],catchphrase:`ゆら〜り つかまえる`},にょろヘビ:{intro:`くねくねの長い体。どこが手になるかは絵しだい`,personality:`sniper`,specialType:`ranged`,parts:[`r:homing`,`pspeed`],prefer:[`sp`,`tec`,`sta`],catchphrase:`しゅるしゅる〜`}},Wm={boostPoints:0,prefer:[]},Y=(e,t=9,n=`#222222`)=>({color:n,width:t,points:e});function Gm(e,t,n,r=9,i=`#222222`){let a=[];for(let r=0;r<=40;r++){let i=r/40*Math.PI*2;a.push(Math.round(e+Math.cos(i)*n),Math.round(t+Math.sin(i)*n))}return Y(a,r,i)}var Km=(e,t,n)=>({color:n,width:0,points:[e,t],fill:!0});function qm(e,t,n,r,i=9,a=`#222222`){let o=[];for(let i=0;i<=48;i++){let a=i/48*Math.PI*2;o.push(Math.round(e+Math.cos(a)*n),Math.round(t+Math.sin(a)*r))}return Y(o,i,a)}var Jm=()=>[Gm(256,270,100,10,`#5f3dc4`),Km(256,300,`#b197fc`),Y([176,196,186,120,222,168,256,108,290,168,326,120,336,196],10,`#f2c200`),Gm(222,255,12,8,`#222222`),Gm(290,255,12,8,`#222222`),Y([226,310,256,328,286,310],8,`#222222`),Y([160,270,100,230,70,180],14,`#5f3dc4`),Gm(64,166,24,10,`#5f3dc4`),Y([352,270,412,230,442,180],14,`#5f3dc4`),Gm(448,166,24,10,`#5f3dc4`),Y([215,362,200,440,170,452],12,`#5f3dc4`),Y([297,362,312,440,342,452],12,`#5f3dc4`)],Ym=()=>[qm(240,290,140,62,10,`#2b8a3e`),Km(240,300,`#8ce99a`),Gm(392,222,48,10,`#2b8a3e`),Km(392,222,`#8ce99a`),Gm(408,210,8,7,`#222222`),Y([420,240,440,246],6,`#222222`),Y([140,240,160,192,185,234,210,186,235,232,260,184,285,232,305,190,325,238],9,`#2b8a3e`),Y([160,340,150,420],13,`#2b8a3e`),Y([215,350,210,430],13,`#2b8a3e`),Y([270,350,275,430],13,`#2b8a3e`),Y([325,340,335,420],13,`#2b8a3e`),Y([102,300,50,270,30,220],12,`#2b8a3e`)],Xm=()=>[Y([176,170,336,170,336,370,176,370,176,170],11,`#c2255c`),Km(256,270,`#fcc2d7`),Y([166,172,256,96,346,172],11,`#495057`),Km(256,145,`#adb5bd`),Gm(222,230,10,8,`#222222`),Gm(290,230,10,8,`#222222`),Y([220,290,292,290],9,`#222222`),Y([176,240,110,280,60,250,30,200],13,`#c2255c`),Y([336,240,402,280,452,250,482,200],13,`#c2255c`),Y([215,370,205,455],13,`#c2255c`),Y([297,370,307,455],13,`#c2255c`)],Zm=()=>[Y([186,170,256,40,326,170,186,170],10,`#5f3dc4`),Km(256,140,`#9775fa`),Gm(256,205,42,9,`#222222`),Km(256,205,`#ffe8cc`),Gm(240,200,6,6,`#222222`),Gm(272,200,6,6,`#222222`),Y([226,248,166,400,346,400,286,248,226,248],10,`#5f3dc4`),Km(256,340,`#b197fc`),Y([236,280,160,300,90,260],11,`#5f3dc4`),Y([60,230,120,290],8,`#a0522d`),Y([276,280,350,300,410,330],11,`#5f3dc4`),Y([226,400,220,460],11,`#5f3dc4`),Y([286,400,292,460],11,`#5f3dc4`)],Qm=()=>{let e=[];for(let t=0;t<=10;t++){let n=-Math.PI/2+t*Math.PI/5,r=t%2?70:165;e.push(Math.round(256+Math.cos(n)*r),Math.round(262+Math.sin(n)*r))}return[Y(e,12,`#212529`),Km(256,262,`#f8f9fa`),Gm(228,250,12,8,`#212529`),Gm(284,250,12,8,`#212529`),Y([232,300,256,286,280,300],8,`#212529`),Y([190,200,120,160],9,`#212529`),Y([322,200,392,160],9,`#212529`),Y([190,320,110,350],9,`#212529`),Y([322,320,402,350],9,`#212529`)]},$m={らくがき大王:Jm,インクの竜:Ym,消しゴム将軍:Xm,クレヨン魔女:Zm,白紙の王:Qm},eh={wait:[9,5],defend:.3},th={wait:[7,5],defend:.5},nh={wait:[5,5],defend:.7},rh={wait:[4,4],defend:.9},ih={wait:[3,4],defend:1},ah=[`atk`,`hp`,`spd`],oh=[`def`,`hp`,`sta`],sh=[`sp`,`sta`,`spd`],ch=[`tec`,`spd`,`sp`],lh=[{no:1,title:`らくがき町`,stages:[{id:`1-1`,no:1,title:`はじめの一歩`,enemy:`ぼうにんげん`,strokes:I.棒人間,personality:`aggressive`,specialType:`ranged`,parts:[],...Wm,hp:-30,ai:eh},{id:`1-2`,no:2,title:`うねうね`,enemy:`タコすけ`,strokes:I.タコ,personality:`tricky`,specialType:`ranged`,parts:[],...Wm,hp:-30,ai:eh},{id:`1-3`,no:3,title:`突進してくる`,enemy:`ずんぐり`,strokes:I.短足ずんぐり,personality:`aggressive`,specialType:`melee`,parts:[[`m:dash`,`F`]],...Wm,hp:-30,ai:eh},{id:`1-4`,no:4,title:`トゲの雨`,enemy:`トゲトゲ`,strokes:I.トゲトゲ,personality:`sniper`,specialType:`ranged`,parts:[[`r:multi`,`E`]],...Wm,hp:-30,ai:eh},{id:`1-5`,no:5,title:`ころころ注意`,enemy:`まんまる`,strokes:I[`まんまる（塗りつぶし）`],personality:`cautious`,specialType:`ranged`,parts:[[`r:homing`,`E`]],...Wm,hp:-30,ai:eh},{id:`1-6`,no:6,title:`らくがき大王`,enemy:`らくがき大王`,strokes:Jm,personality:`aggressive`,specialType:`melee`,parts:[[`m:giantHands`,`D`],[`m:slam`,`D`]],boostPoints:4,prefer:[`atk`,`hp`],hp:-15,ai:{wait:[8,5],defend:.5},boss:!0}]},{no:2,title:`インクの森`,stages:[{id:`2-1`,no:7,title:`はやい弾`,enemy:`ムカデせんせい`,strokes:Hm.ムカデせんせい,personality:`aggressive`,specialType:`ranged`,parts:[[`r:fast`,`E`]],boostPoints:3,prefer:ah,hp:-15,ai:th},{id:`2-2`,no:8,title:`グニャグニャ文字`,enemy:`もじの「ん」`,strokes:Hm[`もじの「ん」`],personality:`tricky`,specialType:`melee`,parts:[[`m:wobble`,`E`]],boostPoints:4,prefer:ch,hp:-15,ai:th},{id:`2-3`,no:9,title:`動けない`,enemy:`ノッポ`,strokes:I.胴長ノッポ,personality:`sniper`,specialType:`ranged`,parts:[[`r:restrain`,`D`]],boostPoints:5,prefer:sh,hp:-15,ai:th},{id:`2-4`,no:10,title:`のびる拳`,enemy:`かたてマン`,strokes:I.巨大な片手,personality:`aggressive`,specialType:`melee`,parts:[[`m:rubber`,`D`]],boostPoints:6,prefer:ah,hp:-15,ai:th},{id:`2-5`,no:11,title:`大きな墨`,enemy:`イソギンチャク`,strokes:Hm.イソギンチャク,personality:`cautious`,specialType:`ranged`,parts:[[`r:giant`,`D`],[`r:homing`,`E`]],boostPoints:7,prefer:oh,hp:-15,ai:th},{id:`2-6`,no:12,title:`インクの竜`,enemy:`インクの竜`,strokes:Ym,personality:`aggressive`,specialType:`melee`,parts:[[`m:tornado`,`C`],[`m:legbind`,`C`]],boostPoints:12,prefer:[`hp`,`atk`,`sta`],ai:{wait:[6,5],defend:.7},boss:!0}]},{no:3,title:`消しゴム砦`,stages:[{id:`3-1`,no:13,title:`トゲの嵐`,enemy:`トゲトゲ`,strokes:I.トゲトゲ,personality:`sniper`,specialType:`ranged`,parts:[[`r:multi`,`C`],[`r:fast`,`D`]],boostPoints:9,prefer:sh,ai:nh},{id:`3-2`,no:14,title:`つかまえた`,enemy:`よこあるきガニ`,strokes:Hm.よこあるきガニ,personality:`cautious`,specialType:`melee`,parts:[[`m:grab`,`C`],[`m:dash`,`D`]],boostPoints:10,prefer:oh,ai:nh},{id:`3-3`,no:15,title:`空から降る`,enemy:`まんまる`,strokes:I[`まんまる（塗りつぶし）`],personality:`tricky`,specialType:`ranged`,parts:[[`r:meteor`,`C`],[`r:giant`,`D`]],boostPoints:11,prefer:ch,ai:nh},{id:`3-4`,no:16,title:`くしゃくしゃ`,enemy:`チョキチョキ`,strokes:Hm.チョキチョキ,personality:`tricky`,specialType:`melee`,parts:[[`m:crumple`,`C`]],boostPoints:12,prefer:ch,ai:nh},{id:`3-5`,no:17,title:`見えない`,enemy:`ふわりおばけ`,strokes:Hm.ふわりおばけ,personality:`sniper`,specialType:`ranged`,parts:[[`r:invisible`,`D`]],boostPoints:13,prefer:sh,ai:nh},{id:`3-6`,no:18,title:`消しゴム将軍`,enemy:`消しゴム将軍`,strokes:Xm,personality:`cautious`,specialType:`melee`,parts:[[`m:giantHands`,`B`],[`m:grab`,`B`]],boostPoints:18,prefer:[`def`,`hp`,`atk`],ai:{wait:[4,5],defend:.9},boss:!0}]},{no:4,title:`クレヨン城`,stages:[{id:`4-1`,no:19,title:`大王ふたたび`,enemy:`らくがき大王`,strokes:Jm,personality:`aggressive`,specialType:`melee`,parts:[[`m:giantHands`,`B`],[`m:slam`,`B`]],boostPoints:15,prefer:[`atk`,`hp`],ai:rh},{id:`4-2`,no:20,title:`からめとる`,enemy:`タコすけ`,strokes:I.タコ,personality:`tricky`,specialType:`ranged`,parts:[[`r:multi`,`B`],[`r:restrain`,`C`]],boostPoints:16,prefer:ch,ai:rh},{id:`4-3`,no:21,title:`地ならし`,enemy:`かたてマン`,strokes:I.巨大な片手,personality:`cautious`,specialType:`melee`,parts:[[`m:slam`,`B`],[`m:legbind`,`C`]],boostPoints:17,prefer:oh,ai:rh},{id:`4-4`,no:22,title:`豆粒の文字`,enemy:`ひょろグモ`,strokes:Hm.ひょろグモ,personality:`sniper`,specialType:`ranged`,parts:[[`r:tiny`,`C`],[`r:homing`,`C`]],boostPoints:18,prefer:sh,ai:rh},{id:`4-5`,no:23,title:`ゴムのノッポ`,enemy:`えんぴつナイト`,strokes:Hm.えんぴつナイト,personality:`aggressive`,specialType:`melee`,parts:[[`m:rubber`,`C`],[`m:wobble`,`D`]],boostPoints:19,prefer:ah,ai:rh},{id:`4-6`,no:24,title:`クレヨン魔女`,enemy:`クレヨン魔女`,strokes:Zm,personality:`sniper`,specialType:`ranged`,parts:[[`r:meteor`,`B`],[`r:homing`,`A`]],boostPoints:18,prefer:[`sp`,`sta`,`def`],ai:{wait:[3,4],defend:1},boss:!0}]},{no:5,title:`白紙の果て`,stages:[{id:`5-1`,no:25,title:`トゲの光`,enemy:`ハリネズミ`,strokes:Hm.ハリネズミ,personality:`tricky`,specialType:`ranged`,parts:[[`r:multi`,`A`],[`r:fast`,`A`]],boostPoints:21,prefer:ch,ai:ih},{id:`5-2`,no:26,title:`最後の門番`,enemy:`がたごとでんしゃ`,strokes:Hm.がたごとでんしゃ,personality:`aggressive`,specialType:`melee`,parts:[[`m:crumple`,`A`],[`m:dash`,`B`]],boostPoints:22,prefer:ah,ai:ih},{id:`5-3`,no:27,title:`竜の竜巻`,enemy:`インクの竜`,strokes:Ym,personality:`aggressive`,specialType:`melee`,parts:[[`m:tornado`,`A`],[`m:legbind`,`B`]],boostPoints:23,prefer:ah,ai:ih},{id:`5-4`,no:28,title:`見えない隕石`,enemy:`クレヨン魔女`,strokes:Zm,personality:`sniper`,specialType:`ranged`,parts:[[`r:meteor`,`A`],[`r:invisible`,`B`]],boostPoints:24,prefer:sh,ai:ih},{id:`5-5`,no:29,title:`将軍の投げ`,enemy:`消しゴム将軍`,strokes:Xm,personality:`cautious`,specialType:`melee`,parts:[[`m:grab`,`C`],[`m:giantHands`,`B`]],boostPoints:25,prefer:oh,ai:ih},{id:`5-6`,no:30,title:`白紙の王`,enemy:`白紙の王`,strokes:Qm,personality:`aggressive`,specialType:`ranged`,parts:[[`r:invisible`,`S`],[`r:homing`,`A`]],boostPoints:28,prefer:[`hp`,`atk`,`sp`,`def`],ai:{wait:[2,4],defend:1.2},boss:!0,final:!0}]}],uh=[],dh=lh.flatMap(e=>e.stages);function fh(e,t){let n=dh.indexOf(e);return n<=0||!!t[dh[n-1].id]}var ph=e=>lh.find(t=>t.stages.includes(e))?.no??1;function mh(e){return e.parts.map(([t,n],r)=>Jf(t,n,rp(ip(`${e.id}#${r}`)),`${e.id}#${r}`))}var hh=[[`棒人間`,`ぼうにんげん`,`らくがき`,{intro:`線だけの体。軽くて素早い`,personality:`aggressive`,specialType:`ranged`,parts:[`r:homing`],prefer:[`atk`,`spd`],catchphrase:`ほそいけど まけないぞ`}],[`ふつうの生き物`,`ふつうのこ`,`らくがき`,{intro:`手が2本ずつ。なんでもそこそこ`,personality:`cautious`,specialType:`ranged`,parts:[`r:giant`,`r:homing`],prefer:[`def`,`hp`],catchphrase:`ふつうが いちばん`}],[`トゲトゲ`,`トゲトゲ`,`らくがき`,{intro:`トゲが全部手。連打が得意`,personality:`sniper`,specialType:`ranged`,parts:[`r:multi`,`r:fast`],prefer:[`sp`,`sta`],catchphrase:`チクチク いくよ`}],[`タコ`,`タコすけ`,`どうぶつ`,{intro:`足がいっぱい。うねうね揺さぶる`,personality:`tricky`,specialType:`ranged`,parts:[`r:restrain`,`r:homing`],prefer:[`tec`,`spd`],catchphrase:`すみを はくぞ〜`}],[`まんまる（塗りつぶし）`,`まんまる`,`らくがき`,{intro:`手も足も無い。転がって体当たり`,personality:`aggressive`,specialType:`melee`,parts:[`m:dash`,`power`],prefer:[`spd`,`hp`],catchphrase:`ころころ〜っと`}],[`巨大な片手`,`かたてマン`,`らくがき`,{intro:`片手だけがとても長い`,personality:`cautious`,specialType:`melee`,parts:[`m:rubber`,`m:slam`],prefer:[`atk`,`def`],catchphrase:`とどく とどく〜`}],[`胴長ノッポ`,`ノッポ`,`らくがき`,{intro:`ひょろっと背が高い`,personality:`sniper`,specialType:`ranged`,parts:[`r:meteor`,`r:homing`],prefer:[`sp`,`spd`],catchphrase:`うえから みてるよ`}],[`短足ずんぐり`,`ずんぐり`,`らくがき`,{intro:`足が短くて重い。押しても動かない`,personality:`cautious`,specialType:`melee`,parts:[`m:grab`,`power`],prefer:[`hp`,`def`],catchphrase:`どっこいしょ`}]],gh={おにぎりゴロン:`たべもの`,どっしりトーフ:`たべもの`,ソフトクリン:`たべもの`,ムカデせんせい:`どうぶつ`,よこあるきガニ:`どうぶつ`,ハリネズミ:`どうぶつ`,ひょろグモ:`どうぶつ`,イソギンチャク:`どうぶつ`,にょろヘビ:`どうぶつ`,かさおばけ:`おばけ`,ふわりおばけ:`おばけ`,えんぴつナイト:`どうぐ`,がたごとでんしゃ:`どうぐ`,チョキチョキ:`どうぐ`,くるくるせんぷうき:`どうぐ`,"もじの「ん」":`どうぐ`},_h=[[`1-6`,`らくがき大王`,{intro:`第1章のボス。王冠と大きな拳`,personality:`aggressive`,specialType:`melee`,parts:[`m:giantHands`,`m:slam`],prefer:[`atk`,`hp`],catchphrase:`わしが この町の 王じゃ！`}],[`2-6`,`インクの竜`,{intro:`第2章のボス。背中のトゲとしっぽ`,personality:`aggressive`,specialType:`melee`,parts:[`m:tornado`,`m:legbind`],prefer:[`hp`,`atk`,`sta`],catchphrase:`インクの うずに のまれろ`}],[`3-6`,`消しゴム将軍`,{intro:`第3章のボス。つかんで消しに来る`,personality:`cautious`,specialType:`melee`,parts:[`m:giantHands`,`m:grab`],prefer:[`def`,`hp`,`atk`],catchphrase:`まちがいは けしてやる`}],[`4-6`,`クレヨン魔女`,{intro:`第4章のボス。空から隕石を降らせる`,personality:`sniper`,specialType:`ranged`,parts:[`r:meteor`,`r:homing`],prefer:[`sp`,`sta`,`def`],catchphrase:`いろとりどりの のろいを`}],[`5-6`,`白紙の王`,{intro:`ラスボス。見えない弾が追いかけてくる`,personality:`aggressive`,specialType:`ranged`,parts:[`r:invisible`,`r:homing`],prefer:[`hp`,`atk`,`sp`,`def`],catchphrase:`すべてを まっしろに`}]],vh=[...hh.map(([e,t,n,r])=>({...r,id:`old:${e}`,name:t,group:n,strokes:I[e]})),...Object.entries(Um).map(([e,t])=>({...t,id:`new:${e}`,name:e,group:gh[e]??`らくがき`,strokes:Hm[e]})),..._h.map(([e,t,n])=>({...n,id:`boss:${e}`,name:t,group:`ボス`,strokes:$m[t],bossStage:e}))],yh=[`らくがき`,`どうぶつ`,`たべもの`,`どうぐ`,`おばけ`,`ボス`],bh=e=>vh.find(t=>t.id===e),xh=`https://doodle-arena-api.rakugaki000.workers.dev/api/v1`;function Sh(e){try{let t=localStorage.getItem(e);if(!t){let n=new Uint8Array(18);crypto.getRandomValues(n),t=[...n].map(e=>e.toString(16).padStart(2,`0`)).join(``),localStorage.setItem(e,t)}return t}catch{return`nostorage-`+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)}}var Ch=()=>Sh(`doodle-arena:device`),wh=()=>Sh(`doodle-arena:owner`);async function Th(e,t,n){let r=new AbortController,i=setTimeout(()=>r.abort(),8e3);try{let i=await fetch(xh+t,{method:e,headers:n===void 0?void 0:{"Content-Type":`text/plain;charset=UTF-8`},body:n===void 0?void 0:JSON.stringify(n),signal:r.signal}),a=await i.json().catch(()=>({}));if(!i.ok)throw new Eh(a.error??`エラー（${i.status}）`,i.status);return a}catch(e){throw e instanceof Eh?e:new Eh(`サーバーに つながりません（オフライン）`,0)}finally{clearTimeout(i)}}var Eh=class extends Error{status;constructor(e,t){super(e),this.status=t}},Dh={health:()=>Th(`GET`,`/health`),publish:e=>Th(`POST`,`/chars`,{owner:wh(),snap:e}),mine:()=>Th(`POST`,`/mine`,{owner:wh()}),candidates:(e,t)=>Th(`GET`,`/chars/random?tier=${e}&not=${encodeURIComponent(t.slice(0,30).join(`,`))}`),ranking:e=>Th(`GET`,`/ranking?tier=${e}`),get:e=>Th(`GET`,`/chars/${e}`),remove:e=>Th(`POST`,`/chars/${e}/delete`,{owner:wh()}),report:(e,t,n)=>Th(`POST`,`/matches`,{opponentId:e,result:t,challengerRating:n}),moveUp:e=>Th(`POST`,`/moves`,{code:e}),moveGet:e=>Th(`GET`,`/moves/${e}`),bad:e=>Th(`POST`,`/chars/${e}/bad`,{device:Ch()})};function Oh(e,t,n,r,i){let a=e.cfg;return{fmt:1,ver:{shape:1,detect:3,sim:1,tree:2},name:t,strokes:n.map(e=>({color:e.color,width:e.width,points:[...e.points],...e.fill?{fill:!0}:{},...e.img?{img:e.img,mask:e.mask,timg:e.timg}:{}})),...e.marks.length?{marks:e.marks.map(e=>({color:e.color,width:e.width,points:[...e.points]}))}:{},detectParams:{...r},personality:a.personality??`aggressive`,specialType:a.specialType??`ranged`,special:[...a.special],melee:[...a.melee??[]],specialMod:{...a.specialMod??{}},boost:{...a.boost??{}},growth:i,limbs:{reach:a.reach,hasHands:a.hasHands,hasFeet:a.hasFeet,traits:{...a.traits??Ye}}}}function kh(e){let t={...r,...e.detectParams},n=yp(e.name,e.strokes,[],t,e.marks??[]),i=n.cfg;return e.limbs&&(e.ver.detect!==3||e.ver.shape!==1)&&(i.reach=e.limbs.reach,i.hasHands=e.limbs.hasHands,i.hasFeet=e.limbs.hasFeet,i.traits={...Ye,...e.limbs.traits}),i.personality=e.personality,i.specialType=e.specialType,i.special=e.special,i.melee=e.melee,i.specialMod=e.specialMod,i.boost=e.boost,n}var Ah=e=>e.ver.sim>1||e.ver.detect>3||e.ver.shape>1,jh=[{name:`ルーキー`,min:0,color:`#69db7c`},{name:`ブロンズ`,min:9,color:`#e8a26a`},{name:`シルバー`,min:18,color:`#adb5bd`},{name:`ゴールド`,min:27,color:`#fcc419`},{name:`マスター`,min:36,color:`#b197fc`}];function Mh(e){let t=0;return jh.forEach((n,r)=>{e>=n.min&&(t=r)}),t}var Nh=[`D`,`C`,`B`,`B`,`A`],Ph=10,Fh=`doodle-arena:onlineRecent`,Ih=`doodle-arena:onlineDaily`,Lh=`doodle-arena:onlineSeen`,Rh=`doodle-arena:onlineMine`,zh=()=>Bh(Rh,[]),Bh=(e,t)=>{try{let n=localStorage.getItem(e);return n?JSON.parse(n):t}catch{return t}},Vh=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},Hh=()=>new Date().toISOString().slice(0,10);function Uh(){let e=Bh(Ih,{day:``,matches:0,partGiven:!1,shards:0});return e.day===Hh()?e:{day:Hh(),matches:0,partGiven:!1,shards:0}}var Wh=e=>e.replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);function Gh(e,t){let n=yp(e.name,e.strokes(),[],r),i=[];e.parts.forEach((n,r)=>{let a=Jf(n,Nh[t],rp(ip(`${e.id}#${t}#${r}`)),`${e.id}#${t}#${r}`);$f([...i,a]).reduce((e,t)=>e+t,0)<=20&&i.push(a)});let a=ep(i,e.specialType),o=Math.min(44,jh[t].min+4);return n.cfg.personality=e.personality,n.cfg.specialType=e.specialType,n.cfg.special=a.special,n.cfg.melee=a.melee,n.cfg.specialMod=a.mod,n.cfg.boost=ut([Qp(tm(o,e.prefer)),{chargeNeed:a.chargeDelta}]),n}var Kh=new Map;function qh(e,t,n){let r=Kh.get(t);if(r){e.src=r;return}let i=n();e.src=um(i),i.some(e=>e.img)?D(i).then(()=>{let n=um(i);Kh.set(t,n),e.src=n}):Kh.set(t,e.src)}var Jh=(e,t)=>t.kind===`human`?qh(e,`h:${t.c.id}`,()=>t.c.thumb):qh(e,`c:${t.c.id}`,t.c.strokes),Yh=e=>e.c.name;function Xh(e,t){let n=`fight`,r=`unknown`,i=``,a=[],o=-1,s=-1,c=!1;e.innerHTML=`
    <div class="ostatus" id="oStatus"></div>
    <div class="onews" id="oNews" hidden></div>
    <div class="seg otabs" role="tablist">
      <button type="button" data-otab="fight" class="on"><b>⚔️</b>たたかう</button>
      <button type="button" data-otab="rank"><b>🏆</b>ランキング</button>
      <button type="button" data-otab="watch"><b>👀</b>かんせん</button>
      <button type="button" data-otab="publish"><b>📮</b>こうかい</button>
      <button type="button" data-otab="rules"><b>📜</b>ルール</button>
    </div>
    <div id="oBody"></div>`;let l=e.querySelector(`#oBody`),u=e.querySelector(`#oStatus`),d=e.querySelector(`#oNews`);e.querySelectorAll(`[data-otab]`).forEach(t=>t.addEventListener(`click`,()=>{n=t.dataset.otab,e.querySelectorAll(`[data-otab]`).forEach(e=>e.classList.toggle(`on`,e===t)),M()}));let f=()=>Mh(xm(bm()));function p(){let e=f(),t=r===`on`?`🟢 オンライン`:r===`off`?`⚪ オフライン（門番と たたかえるよ）`:r===`stop`?`🟠 おやすみ中（門番と たたかえるよ）`:`…つないでいます`;u.innerHTML=`<span class="room" style="--tc:${jh[e].color}">${jh[e].name}の へや</span><small>${t}</small>`}async function m(){try{let{chars:e}=await Dh.mine();Vh(Rh,e.map(e=>e.id));let t=Bh(Lh,{}),n=[],r=0;for(let i of e){let e=t[i.id];if(e){let t=i.wins-e.w,a=i.losses-e.l;t+a>0&&n.push(`${Wh(i.name)}が るすのあいだに ${t+a}回 たたかったよ！ ${t}回 まもった！`),r+=Math.max(0,t)}t[i.id]={w:i.wins,l:i.losses},i.hidden&&n.push(`${Wh(i.name)}は 👎が多かったので かくれています`)}if(Vh(Lh,t),r>0){let e=Uh(),t=Math.min(r*2,20-e.shards);t>0&&(Ip(t),e.shards+=t,Vh(Ih,e),n.push(`まもったごほうびに かけら +${t}`))}d.hidden=!n.length,d.innerHTML=n.map(e=>`<div>📣 ${e}</div>`).join(``)}catch{}}async function h(){try{r=(await Dh.health()).stop?`stop`:`on`}catch{r=`off`}p()}async function g(){let e=Bh(Fh,[]),t=[];if(r===`on`)try{let{chars:n}=await Dh.candidates(f(),[...zh(),...e]);for(let e of n)t.push({kind:`human`,c:e})}catch(e){e instanceof Eh&&e.status===0&&(r=`off`)}let n=vh.filter(e=>!e.bossStage).sort(()=>Math.random()-.5);for(let e of n){if(t.length>=3)break;t.push({kind:`cpu`,c:e,tier:f()})}a=t}function _(e,t){let n=document.createElement(`button`);return n.type=`button`,n.className=`ocard`,n.innerHTML=`${e.kind===`cpu`?`<span class="tag cpu">門番</span>`:e.c.games<10?`<span class="tag new">おためし</span>`:``}<img alt=""><b></b><small>${e.kind===`human`?`★${e.c.rating}・${e.c.wins}勝${e.c.losses}敗`:`${jh[e.tier].name}の 門番`}</small>`,Jh(n.querySelector(`img`),e),n.querySelector(`b`).textContent=Yh(e),n.addEventListener(`click`,t),n}async function v(e){if(e.kind===`cpu`)return{build:Gh(e.c,e.tier)};let{char:t}=await Dh.get(e.c.id);if(Ah(t.snap))throw new Eh(`このキャラと たたかうには ゲームを さいしんに してね（ページを よみこみなおす）`,0);return await D(t.snap.strokes),{build:kh(t.snap),snap:t.snap}}async function y(e){t.unlockSound();let n;try{n=await v(e)}catch(e){S(e.message);return}e.kind===`human`&&Vh(Fh,[e.c.id,...Bh(Fh,[]).filter(t=>t!==e.c.id)].slice(0,10));let r=t.buildPlayer(i);t.runBattle({player:r,cpu:n.build,spectate:!1,seed:Math.random()*4294967295>>>0,exitLabel:`オンラインへ`,onResult:t=>b(e,t),onResultShown:t=>x(t,e)})}function b(e,n){let r=n===0,i=r?`win`:n===1?`lose`:`draw`;e.kind===`human`&&Dh.report(e.c.id,i,1e3).catch(()=>{});let a=Uh();a.matches++;let o=40+12*km(),s=``;if(a.matches<=Ph){let e=Math.round(r?o/4:o/16),t=Om(e);s+=`<div class="exp">経験値 +${e}</div>`,t.levelsUp&&(s+=`<div class="up">レベルアップ！ Lv ${bm().level}</div>`)}else s+=`<div>今日の ごほうびは おわり（また明日）</div>`;if(r&&!a.partGiven){a.partGiven=!0;let e=f(),n=Fp(e===4&&Math.random()<.25?`S`:Nh[e]);n.got.length&&(s+=`<div class="drop"><div>今日の はじめての勝利！ パーツを手に入れた</div>${n.got.map(t.partChipHtml).join(``)}</div>`)}return Vh(Ih,a),e.kind===`human`&&(s+=`<button type="button" class="badbtn" data-bad>👎 よくない絵・名前を しらせる</button>`),s}function x(e,t){let n=e.querySelector(`[data-bad]`);n&&t.kind===`human`&&n.addEventListener(`click`,async()=>{n.disabled=!0;try{await Dh.bad(t.c.id),n.textContent=`しらせたよ。ありがとう`}catch(e){n.textContent=e.message}})}function S(e){let t=l.querySelector(`.omsg`);t&&(t.textContent=e)}function C(){let e=document.createElement(`div`);e.className=`field`,e.innerHTML=`<label class="label" for="oChar">つかう キャラ</label><select id="oChar"></select>`;let n=e.querySelector(`select`);for(let e of t.choices())n.add(new Option(e.label,e.value));return[...n.options].some(e=>e.value===i)?n.value=i:i=n.value,n.addEventListener(`change`,()=>{i=n.value}),e}async function w(){l.innerHTML=``,l.appendChild(C());let e=document.createElement(`div`);e.className=`kidhint`,e.textContent=`あいてを えらんでね（同じへやか ひとつ上のへやの キャラ）`;let t=document.createElement(`div`);t.className=`ogrid`,t.textContent=`さがしています…`;let n=document.createElement(`button`);n.textContent=`🔄 ほかの あいて`;let i=document.createElement(`div`);i.className=`note omsg`,l.append(e,t,n,i);let o=async()=>{t.textContent=`さがしています…`,await g(),t.innerHTML=``;for(let e of a)t.appendChild(_(e,()=>y(e)));a.every(e=>e.kind===`cpu`)&&(i.textContent=r===`on`?`このへやには まだ だれも いないよ。門番と たたかって、じぶんのキャラも こうかいしてみよう！`:``)};n.addEventListener(`click`,o),await o()}function T(e,t){let n=document.createElement(`div`);return n.className=`seg rooms`,jh.forEach((r,i)=>{let a=document.createElement(`button`);a.type=`button`,a.textContent=r.name,a.style.setProperty(`--tc`,r.color),a.classList.toggle(`on`,i===e),a.addEventListener(`click`,()=>t(i)),n.appendChild(a)}),n}async function E(){o<0&&(o=f()),l.innerHTML=``,l.appendChild(T(o,e=>{o=e,E()}));let e=document.createElement(`div`);e.className=`olist`,e.textContent=`よみこみ中…`;let t=document.createElement(`div`);t.className=`note omsg`,l.append(e,t);let n=[];try{n=(await Dh.ranking(o)).chars}catch(t){e.textContent=t.message;return}if(e.innerHTML=``,!n.length){e.textContent=`まだ ランキングに のっている キャラが いないよ（こうかいして 24時間たつと のるよ）`;return}let r=o===f()||o===f()+1;n.forEach((n,i)=>{let a=document.createElement(`div`);a.className=`orow`,a.innerHTML=`<b class="no">${i+1}</b><img alt=""><span class="nm"></span><small>★${n.rating}・${n.wins}勝${n.losses}敗</small><span class="acts"></span>`,qh(a.querySelector(`img`),`h:${n.id}`,()=>n.thumb),a.querySelector(`.nm`).textContent=n.name;let o=a.querySelector(`.acts`),s={kind:`human`,c:n};if(zh().includes(n.id)){let e=document.createElement(`small`);e.textContent=`じぶん`,o.appendChild(e)}else if(r){let e=document.createElement(`button`);e.textContent=`たたかう`,e.addEventListener(`click`,()=>y(s)),o.appendChild(e)}let c=document.createElement(`button`);c.textContent=`👎`,c.title=`よくない絵・名前を しらせる`,c.addEventListener(`click`,async()=>{c.disabled=!0;try{await Dh.bad(n.id),t.textContent=`しらせたよ。ありがとう`}catch(e){t.textContent=e.message}}),o.appendChild(c),e.appendChild(a)}),r||(t.textContent=`たたかえるのは 自分のへやと ひとつ上のへや だけだよ`)}async function O(){s<0&&(s=f()),l.innerHTML=``,l.appendChild(T(s,e=>{s=e,O()}));let e=document.createElement(`div`);e.className=`owatch`,e.textContent=`よみこみ中…`;let t=document.createElement(`div`);t.className=`note omsg`,l.append(e,t);let n=[];try{let{chars:e}=await Dh.ranking(s);n=e.filter(e=>!zh().includes(e.id)).slice(0,2).map(e=>({kind:`human`,c:e}))}catch{}let r=vh.filter(e=>!e.bossStage).sort(()=>Math.random()-.5);for(;n.length<2;)n.push({kind:`cpu`,c:r[n.length],tier:s});e.innerHTML=`<div class="kidhint">${n.every(e=>e.kind===`human`)?`今日の 注目カード！`:`門番どうしの たたかい`}　どっちが かつ？</div><div class="ovs"></div>`;let i=e.querySelector(`.ovs`);n.forEach((e,t)=>{let r=_(e,()=>k(n,t));if(i.appendChild(r),t===0){let e=document.createElement(`b`);e.className=`vs`,e.textContent=`VS`,i.appendChild(e)}})}async function k(e,n){t.unlockSound();let r,i;try{r=(await v(e[0])).build,i=(await v(e[1])).build}catch(e){S(e.message);return}t.runBattle({player:r,cpu:i,spectate:!0,seed:Math.random()*4294967295>>>0,exitLabel:`オンラインへ`,fastButton:!0,onResult:e=>e===2?`<div>引き分け！ よそうは はずれ</div>`:e===n?(Om(10),`<div class="exp">よそう的中！ 経験値 +10</div>`):`<div>よそうは はずれ… つぎは あたるかも</div>`})}async function A(){l.innerHTML=`
      <div class="kcard warn">
        <div class="kh">📮 こうかいする まえに</div>
        <div>この絵と名前は、日本中の しらない人が 見るよ。</div>
        <ul class="traits">
          <li>名前・学校・住所・電話番号・顔は かかないでね</li>
          <li>いやな言葉・えっちな絵・ひとを悪く言う絵は ダメ</li>
          <li>ほかのアニメや ゲームの キャラは ダメ</li>
          <li>👎 が多いと かくれるよ。いつでも 取り下げられるよ</li>
        </ul>
        <label class="check"><input type="checkbox" id="oAgree"${c?` checked`:``}> わかった（<a href="#" data-rules>ルールを よむ</a>）</label>
      </div>
      <div class="kidhint">こうかいする キャラ（${jh[f()].name}の へやに 入るよ）</div>
      <div class="olist" id="oPubList"></div>
      <div class="note omsg"></div>
      <div class="kidhint">こうかい中の キャラ</div>
      <div class="olist" id="oMine">よみこみ中…</div>`;let n=l.querySelector(`#oAgree`);l.querySelector(`[data-rules]`).addEventListener(`click`,t=>{t.preventDefault(),e.querySelector(`[data-otab=rules]`).click()});let r=l.querySelector(`#oPubList`),i=l.querySelector(`.omsg`),a=[];for(let e of t.choices()){let n=t.strokesOf(e.value),o=document.createElement(`div`);o.className=`orow`,o.innerHTML=`<img alt=""><span class="nm"></span><span class="acts"></span>`,n&&qh(o.querySelector(`img`),`p:${e.value}:${n.strokes.length}`,()=>n.strokes),o.querySelector(`.nm`).textContent=e.label;let l=document.createElement(`button`);l.className=`primary inline`,l.textContent=`こうかい`,l.disabled=!c||!n,n||(l.title=`絵が ないよ`),l.addEventListener(`click`,async()=>{if(n){l.disabled=!0,i.textContent=`こうかい中…`;try{let r=Oh(t.buildPlayer(e.value),n.name,n.strokes,t.params(),xm(bm())),a=await Dh.publish(r);Vh(Rh,[...zh(),a.id]),i.textContent=`「${n.name}」を ${jh[a.tier].name}の へやに こうかいしたよ！ ほかの人が たたかうと ここに 結果が とどくよ`,s()}catch(e){i.textContent=e.message}l.disabled=!c}}),a.push(l),o.querySelector(`.acts`).appendChild(l),r.appendChild(o)}n.addEventListener(`change`,()=>{c=n.checked,a.forEach((e,n)=>{e.disabled=!c||!t.strokesOf(t.choices()[n].value)})});let o=l.querySelector(`#oMine`),s=async()=>{try{let{chars:e}=await Dh.mine();o.innerHTML=e.length?``:`まだ ないよ`;for(let t of e){let e=document.createElement(`div`);e.className=`orow`,e.innerHTML=`<img alt=""><span class="nm"></span><small></small><span class="acts"></span>`,qh(e.querySelector(`img`),`h:${t.id}`,()=>t.thumb),e.querySelector(`.nm`).textContent=t.name,e.querySelector(`small`).textContent=`${jh[t.tier].name}・★${t.rating}・${t.wins}勝${t.losses}敗${t.hidden?`・👎で かくれ中`:``}`;let n=document.createElement(`button`);n.textContent=`取り下げ`;let r=0;n.addEventListener(`click`,async()=>{if(!r)n.textContent=`ほんとに？`,r=window.setTimeout(()=>{r=0,n.textContent=`取り下げ`},2500);else{clearTimeout(r);try{await Dh.remove(t.id),s()}catch(e){i.textContent=e.message}}}),e.querySelector(`.acts`).appendChild(n),o.appendChild(e)}}catch(e){o.textContent=e.message}};s()}function j(){l.innerHTML=`
      <div class="kcard">
        <div class="kh">📜 みんなで あそぶ ルール</div>
        <div>みんなが 見るよ。名前・学校・住所・電話番号・顔は かかないでね。いやな言葉、えっちな絵、ひとを悪く言う絵、ほかのアニメやゲームのキャラは ダメ。いやな絵を 見たら 👎 を おしてね。消したくなったら「こうかい」から 取り下げられるよ。お金は かからないよ。</div>
      </div>
      <div class="kcard rules">
        <div class="kh">保護者の方へ（利用規約・プライバシー）</div>
        <ol>
          <li>このゲームは個人が無料で運営しています。広告や課金はありません。</li>
          <li>サーバーに預かるのは、公開したキャラの線データ・名前・性格と技の数値・対戦の勝敗、端末ごとのランダムな番号（ハッシュ化して保存）だけです。氏名・メールアドレス・位置情報などの個人情報は預かりません。ゲームの進み具合は端末の中だけに保存されます。</li>
          <li>IP アドレスは、秘密の乱数を混ぜた元に戻せない形（ハッシュ）にし、回数制限と 👎 の重複防止のためだけに使います。回数制限の記録はその日のうちに使い終え、順次消します。</li>
          <li>保存先は Cloudflare, Inc.（米国）の Cloudflare Workers と D1 です。ゲームの画面は GitHub Pages（GitHub, Inc.）から配信し、文字の形は Google Fonts から読み込みます。</li>
          <li>個人情報、性的・暴力的・差別的な内容、他の作品のキャラクター、悪口などは禁止です。</li>
          <li>👎 が別々の3人から付くと自動で非表示になります。運営者の判断で、予告なく非表示・削除することがあります。</li>
          <li>削除の依頼・問い合わせは <a href="https://github.com/second1214/doodle-arena/issues" target="_blank" rel="noopener">GitHub の Issues</a> へ。キャラの名前と、おおよその公開日を書いてください。個人情報は書かないでください。</li>
          <li>サービスは予告なく変更・停止・終了することがあり、内容の保証はしません。</li>
          <li>このルールを変える時は、このページでお知らせします。</li>
        </ol>
      </div>`}async function M(){p(),n===`fight`?await w():n===`rank`?await E():n===`watch`?await O():n===`publish`?await A():j()}return{async open(){p(),await h(),m(),await M()}}}var Zh=class{view;label;scene=null;world=null;ais=[];raf=0;running=!1;acc=0;last=0;endAt=0;t0=0;reduced=typeof matchMedia==`function`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches;constructor(e,t){this.view=e,this.label=t,new ResizeObserver(()=>this.scene?.resize()).observe(e),document.addEventListener(`visibilitychange`,()=>{document.hidden?this.pause():this.wanted&&this.start()})}wanted=!1;newMatch(){this.scene?.dispose();let e=vh.filter(e=>!e.bossStage),t=e[Math.floor(Math.random()*e.length)],n=e[Math.floor(Math.random()*e.length)];n===t&&(n=e[(e.indexOf(t)+1)%e.length]);let r=Math.floor(Math.random()*3);try{let e=Gh(t,r),i=Gh(n,r);this.world=cn(e.cfg,i.cfg,Math.random()*4294967295>>>0),this.ais=[On(),On()],this.scene=new dp(this.view,[e,i],-1),this.label.textContent=`${t.name} VS ${n.name}`}catch{this.scene=null,this.world=null,this.view.classList.add(`nogl`)}this.acc=0,this.endAt=0,this.t0=performance.now()}start(){this.wanted=!0,!this.running&&(this.world||this.newMatch(),this.world&&(this.running=!0,this.last=performance.now(),this.scene?.resize(),this.raf=requestAnimationFrame(this.frame)))}stop(){this.wanted=!1,this.pause()}pause(){this.running=!1,cancelAnimationFrame(this.raf)}frame=e=>{if(!this.running||!this.world||!this.scene)return;let t=this.world,n=Math.min(.1,(e-this.last)/1e3);this.last=e;let r=[];if(!this.reduced)for(this.acc+=n;this.acc>=.03333333333333333&&t.winner===-1;)this.acc-=mt,Tn(t,[kn(t,0,this.ais[0]),kn(t,1,this.ais[1])]),r.push(...t.events);this.scene.render(t,(e-this.t0)/1e3,r),t.winner!==-1&&!this.endAt&&(this.endAt=e+2200),this.endAt&&e>=this.endAt&&this.newMatch(),this.raf=requestAnimationFrame(this.frame)}},Qh=`doodle-arena:proto1`,$h=[`#222222`,`#ffffff`,`#868e96`,`#8b5a2b`,`#f5c6a0`,`#e03131`,`#f783ac`,`#f08c00`,`#f2c200`,`#94d82d`,`#2f9e44`,`#4dabf7`,`#1c7ed6`,`#ae3ec9`],eg=[`#e8590c`,`#f76707`,`#d9480f`,`#fd7e14`,`#c2255c`],tg=[`#1c7ed6`,`#1971c2`,`#3b5bdb`,`#0c8599`,`#5f3dc4`],ng=`#9aa0a6`,rg=document.getElementById(`view`),X=rg.getContext(`2d`),ig=document.getElementById(`result`),ag=document.getElementById(`legend`),og=document.getElementById(`drawTools`),sg=document.querySelector(`.stage`),cg=document.getElementById(`battleSetup`),lg=document.getElementById(`charSetup`),Z=Mg(),ug=`doodle-arena:proto1-marks`,dg=`doodle-arena:assist`,fg=bg(ug,[]),pg=`draw`,mg=`hand`,hg=30,gg={hand:`#ff7a1a`,foot:`#228be6`},_g={smooth:!0,mirror:!1,shape:!0,...bg(dg,{})},vg={draw:[],limb:[]},yg=null;function bg(e,t){try{let n=localStorage.getItem(e);return n?JSON.parse(n):t}catch{return t}}var xg={...r},Sg=$h[0],Cg=9,wg=!1,Tg=!1,Eg=document.createElement(`canvas`),Dg=null,Og=-1,kg=`draw`,Ag=null,jg=null;function Mg(){try{let e=localStorage.getItem(Qh);return e?JSON.parse(e):[]}catch{return[]}}function Ng(){try{localStorage.setItem(Qh,JSON.stringify(Z)),localStorage.setItem(ug,JSON.stringify(fg))}catch{}Tv()}function Pg(e,t){let n=document.createElement(`canvas`);n.width=n.height=512;let r=n.getContext(`2d`);return r.drawImage(e,0,0),r.globalCompositeOperation=`source-in`,r.fillStyle=t,r.fillRect(0,0,512,512),n}var Fg=``;function Ig(){let e=h(Z,xg,fg);jg={res:e,parts:N(Z,e).canvases};let t=e.limbs.filter(e=>e.kind===`hand`).length,n=e.limbs.filter(e=>e.kind===`foot`).length,r=[];Z.length&&t===0&&r.push(`手なし→体当たりで攻撃`),Z.length&&n===0&&r.push(`足なし→転がって移動`),Fg=Z.length?`${fg.some(e=>e.color!==`erase`)?`🖐 ぬった手足: `:``}手 ${t}本・足 ${n}本${r.length?`（`+r.join(`／`)+`）`:``}`:`まだ何も描かれていません`,ig.textContent=Fg}function Lg(e,t){let n=e.limbs[t],r=e.limbs.slice(0,t).filter(e=>e.kind===n.kind).length;return n.kind===`hand`?eg[r%eg.length]:tg[r%tg.length]}function Rg(){if(kg===`battle`||kg===`char`)return;if(X.clearRect(0,0,512,512),kg===`draw`){if(Q&&m_(),A_())return;(Dg!==Z||Og!==Z.length)&&(Eg=M(Z),Dg=Z,Og=Z.length),pg===`limb`?(X.globalAlpha=.55,X.drawImage(Eg,0,0),X.globalAlpha=.5,X.drawImage(zg(Ag?[...fg,Ag,..._g.mirror?[xe(Ag)]:[]]:fg),0,0),X.globalAlpha=1):(X.drawImage(Eg,0,0),Ag&&(j(X,Ag),_g.mirror&&j(X,xe(Ag)))),_g.mirror&&(X.save(),X.strokeStyle=`rgba(120,120,160,.45)`,X.setLineDash([8,8]),X.beginPath(),X.moveTo(256,0),X.lineTo(256,512),X.stroke(),X.restore());return}if(!jg)return;let{res:e,parts:t}=jg,n=512/e.size;if(kg===`detect`){let r=new ImageData(e.size,e.size);for(let t=0;t<e.silhouette.length;t++){if(!e.silhouette[t])continue;let n=e.core[t];r.data.set(n?[190,215,240,110]:[200,200,200,90],t*4)}let i=document.createElement(`canvas`);i.width=i.height=e.size,i.getContext(`2d`).putImageData(r,0,0),X.imageSmoothingEnabled=!1,X.drawImage(i,0,0,512,512),X.drawImage(Pg(t[0],ng),0,0),e.limbs.forEach((r,i)=>{let a=Lg(e,i);X.drawImage(Pg(t[i+1],a),0,0),X.strokeStyle=a,X.lineWidth=2,X.setLineDash([6,5]),X.beginPath(),X.moveTo(r.pivot[0]*n,r.pivot[1]*n),X.lineTo(r.tip[0]*n,r.tip[1]*n),X.stroke(),X.setLineDash([]),X.fillStyle=a,X.beginPath(),X.arc(r.pivot[0]*n,r.pivot[1]*n,7,0,Math.PI*2),X.fill(),X.strokeStyle=`#fff`,X.lineWidth=2,X.stroke(),X.beginPath(),X.arc(r.tip[0]*n,r.tip[1]*n,3.5,0,Math.PI*2),X.fill()})}}function zg(e){return M(e.map(e=>e.color===`erase`?e:{...e,color:gg[e.color]??`#888888`}))}var Bg=document.getElementById(`preview3d`),Vg=null;function Hg(){Vg?.dispose(),Vg=null}function Ug(){Hg();let e=Z.length?Z:I.棒人間();try{Vg=new bp(Bg,yp($.name||`あなた`,e,[],xg,Z.length?fg:[])),ig.textContent=Fg+`　👆 指でなぞると くるっと 回せるよ`}catch{ig.textContent=`立体の表示に失敗しました（この端末では 3D が使えない可能性があります）`}}function Wg(e){kg=e,rg.hidden=e===`anim`,Bg.hidden=e!==`anim`,e!==`anim`&&Hg(),document.querySelectorAll(`.tabs button`).forEach(t=>t.classList.toggle(`on`,t.dataset.view===e)),m_(),ag.hidden=e!==`detect`,sg.hidden=e===`battle`||e===`char`,cg.hidden=e!==`battle`,lg.hidden=e!==`char`,e===`char`?(ig.textContent=Z.length?``:`まだ絵が ないので「棒人間」で 見せているよ（「かく」で 描いてね）`,av(),Iv()):e===`battle`?(ig.textContent=Z.length?``:`絵がまだ無いので、あなたのキャラは「棒人間」で戦います`,document.getElementById(`myCharName`).textContent=`${$.name||`名無し`}（${En[$.personality].label}・${$.specialType===`melee`?`近接`:`遠距離`}必殺）`,Vv()):(e===`draw`?ig.textContent=``:(Ig(),e===`anim`&&Ug()),Rg())}function Gg(e){let t=rg.getBoundingClientRect();return[(e.clientX-t.left)/t.width*512,(e.clientY-t.top)/t.height*512]}var Kg=[0,0],qg=[0,0],Jg=[],Yg=null,Xg=0,Zg=450;function Qg(){clearTimeout(Xg),Ag&&pg===`draw`&&_g.shape&&Ag.color!==`erase`&&(Xg=window.setTimeout(()=>{if(!Ag||Yg)return;let e=Ce([...Jg,...qg]);e&&(Ag.points=e.points,Yg={at:[...qg]},ig.textContent=e.kind===`line`?`📏 まっすぐに したよ`:e.kind===`circle`?`⭕ まるに したよ`:`⬭ だ円に したよ`,Rg())},Zg))}function $g(e){let t=pg===`limb`?fg:Z;t.push(e),_g.mirror&&t.push(xe(e)),vg[pg].push(_g.mirror?2:1),pg===`draw`&&(yg=null),G_(),Ng(),Rg(),pg===`limb`&&Ig()}var e_=!1;rg.addEventListener(`pointerdown`,e=>{if(kg!==`draw`)return;let[t,n]=Gg(e);if(s_&&pg===`draw`&&!(Q&&Q.phase!==`done`)){u_(t,n);return}if(Q&&Q.phase!==`done`){rg.setPointerCapture(e.pointerId),e_=!0,M_(`down`,t,n);return}if(Tg&&pg===`draw`){$g({color:Sg,width:0,points:[Math.round(t),Math.round(n)],fill:!0});return}rg.setPointerCapture(e.pointerId);let r=[Math.round(t),Math.round(n)];Kg=[t,n],qg=[t,n],Jg=[...r],Yg=null,Ag=pg===`limb`?{color:mg,width:mg===`erase`?hg*1.3:hg,points:r}:{color:wg?`erase`:Sg,width:wg?Cg*2:Cg,points:r},Qg(),Rg()}),rg.addEventListener(`pointermove`,e=>{if(e_){let[t,n]=Gg(e);M_(`move`,t,n);return}if(!Ag)return;let[t,n]=Gg(e);if(Yg){if(Math.hypot(t-Yg.at[0],n-Yg.at[1])<12)return;Ag.points=[...Jg],Yg=null,ig.textContent=``}if(Math.hypot(t-qg[0],n-qg[1])<2)return;qg=[t,n],Jg.push(Math.round(t),Math.round(n));let r=_g.smooth&&pg===`draw`;r&&(Kg=be(Kg,[t,n]));let[i,a]=r?Kg:[t,n],o=Ag.points;Math.hypot(i-o[o.length-2],a-o[o.length-1])>=1.5&&o.push(Math.round(i),Math.round(a)),Qg(),Rg()});var t_=()=>{if(!Ag)return;clearTimeout(Xg);let e=Ag;if(Ag=null,!Yg&&_g.smooth&&pg===`draw`&&e.points.length>=2){let t=e.points.length;(e.points[t-2]!==Math.round(qg[0])||e.points[t-1]!==Math.round(qg[1]))&&e.points.push(Math.round(qg[0]),Math.round(qg[1]))}$g(e)},n_=e=>{if(!e_)return;e_=!1;let[t,n]=Gg(e);M_(`up`,t,n)};rg.addEventListener(`pointerup`,n_),rg.addEventListener(`pointercancel`,n_),rg.addEventListener(`pointerup`,t_),rg.addEventListener(`pointercancel`,t_),document.querySelectorAll(`.tabs button`).forEach(e=>e.addEventListener(`click`,()=>{Q&&e.dataset.view!==`draw`?gy(`📷 しゃしんの とりこみを おわらせてね（✅ これで OK か ↩ やめる）`):Wg(e.dataset.view)}));var r_=document.getElementById(`palette`),i_=document.getElementById(`eraser`),a_=`doodle-arena:recentColors`,o_=bg(a_,[]).filter(e=>/^#[0-9a-f]{6}$/i.test(e)).slice(0,8),s_=!1;function c_(e,t=!1){if(Sg=e.toLowerCase(),wg=!1,i_.classList.remove(`on`),t&&!$h.includes(Sg)){o_=[Sg,...o_.filter(e=>e!==Sg)].slice(0,8);try{localStorage.setItem(a_,JSON.stringify(o_))}catch{}}l_()}function l_(){r_.innerHTML=``;let e=e=>{let t=document.createElement(`button`);t.type=`button`,t.className=`swatch`+(e===Sg&&!wg?` on`:``),t.style.background=e,t.setAttribute(`aria-label`,e),t.addEventListener(`click`,()=>c_(e)),r_.appendChild(t)};for(let t of $h)e(t);for(let t of o_)e(t);let t=document.createElement(`label`);t.className=`swatch any`+(!$h.includes(Sg)&&!wg?` on`:``),t.title=`すきな色`,t.style.setProperty(`--cur`,Sg),t.innerHTML=`<span>🌈</span><input type="color" aria-label="すきな色">`;let n=t.querySelector(`input`);n.value=/^#[0-9a-f]{6}$/i.test(Sg)?Sg:`#222222`,n.addEventListener(`change`,()=>c_(n.value,!0)),r_.appendChild(t);let r=document.createElement(`button`);r.type=`button`,r.className=`swatch pick`+(s_?` on`:``),r.title=`スポイト: 絵や写真の 色を とる`,r.textContent=`💧`,r.addEventListener(`click`,()=>{s_=!s_,l_(),ig.textContent=s_?`💧 色を とりたい所を タップしてね`:``}),r_.appendChild(r)}l_();function u_(e,t){let n=M(Z).getContext(`2d`).getImageData(Math.max(0,Math.min(511,Math.round(e))),Math.max(0,Math.min(511,Math.round(t))),1,1).data;if(s_=!1,n[3]<20){l_(),ig.textContent=`そこには 色が ないよ`;return}let r=e=>e.toString(16).padStart(2,`0`);c_(`#${r(n[0])}${r(n[1])}${r(n[2])}`,!0),ig.textContent=`💧 色を とったよ`}document.querySelectorAll(`[data-width]`).forEach(e=>e.addEventListener(`click`,()=>{Cg=Number(e.dataset.width),document.querySelectorAll(`[data-width]`).forEach(t=>t.classList.toggle(`on`,t===e))}));var d_=document.getElementById(`fillTool`);d_.addEventListener(`click`,()=>{Tg=!Tg,Tg&&(wg=!1,i_.classList.remove(`on`)),d_.classList.toggle(`on`,Tg)}),i_.addEventListener(`click`,()=>{Tg=!1,d_.classList.remove(`on`),wg=!wg,i_.classList.toggle(`on`,wg),l_()}),document.getElementById(`undo`).addEventListener(`click`,()=>{let e=pg===`limb`?fg:Z,t=Math.min(e.length,vg[pg].pop()??1);e.splice(e.length-t,t),pg===`draw`&&(yg=null),G_(),Ng(),Rg(),pg===`limb`&&Ig()});var f_=document.getElementById(`photoPanel`),p_=document.getElementById(`photoBar`);function m_(){let e=!!Q&&kg===`draw`&&ay===`make`;if(og.hidden=kg!==`draw`||!!Q,f_.hidden=!e,p_.hidden=!e,document.body.classList.toggle(`photo-on`,e),e&&Q){let e=Q.phase;document.getElementById(`pbarStep`).textContent=e===`box`?`① 指で 四角く かこんでね`:e===`fix`?`② きりぬきを なおす`:`③ できあがり`;let t=document.getElementById(`pbarNext`);t.hidden=e===`box`,t.textContent=e===`fix`?`▶ 絵に する`:`✅ これで OK`}}var h_=document.getElementById(`photoSens`),g_=document.getElementById(`photoBg`),__=document.getElementById(`photoNext`),v_=document.getElementById(`photoBack`),Q=null,y_=`photo`,b_=`add`,x_=e=>{let t=512/Math.max(e.naturalWidth,e.naturalHeight);return{s:t,ox:(512-e.naturalWidth*t)/2,oy:(512-e.naturalHeight*t)/2}};function S_(e,t,n){let r=document.createElement(`canvas`);r.width=r.height=256;let i=r.getContext(`2d`,{willReadFrequently:!0}),a=256/Math.max(t.w,t.h),o=(256-t.w*a)/2,s=(256-t.h*a)/2;if(i.drawImage(e,t.x,t.y,t.w,t.h,o,s,t.w*a,t.h*a),!n){let e=i.getImageData(0,0,256,256),n=Math.ceil(o)+2,r=Math.floor(o+t.w*a)-3,c=Math.ceil(s)+2,l=Math.floor(s+t.h*a)-3,u=0,d=0,f=0;for(let[t,i]of[[n,c],[r,c],[n,l],[r,l]]){let n=(i*256+t)*4;u+=e.data[n],d+=e.data[n+1],f+=e.data[n+2]}i.globalCompositeOperation=`destination-over`,i.fillStyle=`rgb(${u/4},${d/4},${f/4})`,i.fillRect(0,0,256,256)}return i.getImageData(0,0,256,256)}var C_=e=>{let t=document.createElement(`canvas`);return t.width=t.height=e.width,t.getContext(`2d`).putImageData(e,0,0),t},w_={box:[`① とりこみたい ものを 指で 四角く かこんでね`,`まわりを 少し あけて、ねこや キャラが ぜんぶ 入るように かこむと きれいに とれるよ。`],fix:[`② きりぬきを なおしてね`,`明るく 見える所が とりこむ所。足りない所は ➕たす、よけいな所は ➖けす で 指で ぬってね。`],done:[`③ できあがり！`,``]};function T_(){if(!Q)return;let e=Q.phase;document.getElementById(`pmPhoto`).classList.toggle(`on`,y_===`photo`),document.getElementById(`pmColor`).classList.toggle(`on`,y_===`color`),document.getElementById(`pmLine`).classList.toggle(`on`,y_===`line`),document.getElementById(`photoStep`).textContent=w_[e][0],document.getElementById(`photoHint`).textContent=e===`done`?y_===`photo`?`しゃしんを そのまま 貼ったよ。上から ペンで かきたしても いいよ。形を なおしたい時は「✏️ きりぬきを なおす」。`:y_===`color`?`色の こまかさを かえられるよ。形を なおしたい時は「✏️ きりぬきを なおす」。`:`白い紙に こい線で かいた絵 むけ。うすい線が 消えたら 右へ。ゴミが 多かったら 左へ。`:w_[e][1],document.getElementById(`photoBrushRow`).hidden=e!==`fix`,document.getElementById(`photoAllRow`).hidden=e!==`box`,document.getElementById(`photoBgRow`).hidden=e!==`fix`,document.getElementById(`photoSensRow`).hidden=e!==`done`||y_===`photo`,document.getElementById(`photoSensName`).textContent=y_===`color`?`こまかさ`:`うすい線も ひろう`,document.getElementById(`pbAdd`).classList.toggle(`on`,b_===`add`),document.getElementById(`pbDel`).classList.toggle(`on`,b_===`del`),__.hidden=e===`box`,__.textContent=e===`fix`?`▶ 絵に する`:`✅ これで OK`,v_.hidden=e===`box`,v_.textContent=e===`done`&&y_!==`line`?`✏️ きりぬきを なおす`:`🔄 かこみなおす`,document.getElementById(`photoSensVal`).textContent=`${Math.round(Number(h_.value)*100)}`,document.getElementById(`photoBgVal`).textContent=`${Math.round(Number(g_.value)*100)}`}function E_(e){Q&&(Q.phase=e,m_(),Tv(),e===`box`&&(Q.rect=null,Q.px=null,Q.mask=null,ig.textContent=`👆 指で なぞって 四角く かこんでね`),e===`fix`&&Q.rect&&(Q.px=S_(Q.img,Q.rect,!0),Q.mask||(Q.mask=ze(Q.px,Number(g_.value))),ig.textContent=`明るい所が とりこむ所だよ`),e===`done`&&D_(),T_(),Rg())}function D_(){if(Q?.rect){if(y_===`photo`){Q.px||(Q.px=S_(Q.img,Q.rect,!0)),Q.mask||(Q.mask=ze(Q.px,Number(g_.value)));let e=O_(Q.img,Q.rect,Q.px.width,Q.mask);Z=e?[e]:[],ig.textContent=e?`📷 しゃしんを そのまま 貼ったよ`:`うまく とれなかったよ。かこみなおすか、きりぬきを なおしてね`}else y_===`color`?(Q.px||(Q.px=S_(Q.img,Q.rect,!0)),Z=Ve(Q.px,Number(h_.value),Number(g_.value),Q.mask??void 0)):Z=De(Pe(S_(Q.img,Q.rect,!1),Number(h_.value))),ig.textContent=Z.length?`📷 線を ${Z.length}本 つくったよ`:`うまく とれなかったよ。かこみなおすか、きりぬきを なおしてね`}}function O_(e,t,n,r){let i=k_(r,n),a=n,o=n,s=-1,c=-1;for(let e=0;e<n*n;e++)if(i[e]){let t=e%n,r=(e-t)/n;a=Math.min(a,t),s=Math.max(s,t),o=Math.min(o,r),c=Math.max(c,r)}if(s<0)return null;let l=s-a+1,u=c-o+1,d=n/Math.max(t.w,t.h),f=(n-t.w*d)/2,p=(n-t.h*d)/2,m=t.x+(a-f)/d,h=t.y+(o-p)/d,g=l/d,_=u/d,v=300/Math.max(g,_),y=document.createElement(`canvas`);y.width=Math.max(1,Math.round(g*v)),y.height=Math.max(1,Math.round(_*v)),y.getContext(`2d`).drawImage(e,m,h,g,_,0,0,y.width,y.height);let b=new Uint8Array(l*u);for(let e=0;e<u;e++)for(let t=0;t<l;t++)b[e*l+t]=i[(e+o)*n+t+a];let x=432/Math.max(l,u),S=l*x,C=u*x;return k(y,b,l,u,[(512-S)/2,(512-C)/2,S,C])}function k_(e,t){let n=new Uint8Array(t*t),r=[];for(let i=0;i<t;i++)for(let a of[i,(t-1)*t+i,i*t,i*t+t-1])!e[a]&&!n[a]&&(n[a]=1,r.push(a));for(;r.length;){let i=r.pop(),a=i%t,o=(i-a)/t;for(let s of[a>0?i-1:-1,a<t-1?i+1:-1,o>0?i-t:-1,o<t-1?i+t:-1])s>=0&&!e[s]&&!n[s]&&(n[s]=1,r.push(s))}let i=new Uint8Array(t*t);for(let e=0;e<t*t;e++)i[e]=+!n[e];return i}function A_(){if(!Q||Q.phase===`done`)return!1;if(X.fillStyle=`#fff`,X.fillRect(0,0,512,512),Q.phase===`box`){X.drawImage(Q.full,0,0);let e=Q.drag;if(e){let t=Math.min(e.x0,e.x1),n=Math.min(e.y0,e.y1),r=Math.abs(e.x1-e.x0),i=Math.abs(e.y1-e.y0);X.fillStyle=`rgba(0,0,0,.35)`,X.fillRect(0,0,512,n),X.fillRect(0,n+i,512,512-n-i),X.fillRect(0,n,t,i),X.fillRect(t+r,n,512-t-r,i),X.strokeStyle=`#ff7a59`,X.lineWidth=4,X.setLineDash([10,8]),X.strokeRect(t,n,r,i),X.setLineDash([])}return!0}let e=Q.px,t=Q.mask,n=e.width,r=new ImageData(n,n);for(let i=0;i<n*n;i++)e.data[i*4+3]!==0&&(t[i]||r.data.set([20,20,40,170],i*4));let i=document.createElement(`canvas`);return i.width=i.height=n,i.getContext(`2d`).putImageData(r,0,0),X.imageSmoothingEnabled=!0,X.drawImage(C_(e),0,0,512,512),X.drawImage(i,0,0,512,512),!0}var j_=7;function M_(e,t,n){if(Q){if(Q.phase===`box`){if(e===`down`?Q.drag={x0:t,y0:n,x1:t,y1:n}:Q.drag&&(Q.drag.x1=t,Q.drag.y1=n),e===`up`&&Q.drag){let e=Q.drag;Q.drag=null;let{s:t,ox:n,oy:r}=x_(Q.img),i=Q.img.naturalWidth,a=Q.img.naturalHeight,o=Math.max(0,(Math.min(e.x0,e.x1)-n)/t),s=Math.max(0,(Math.min(e.y0,e.y1)-r)/t),c=Math.min(i,(Math.max(e.x0,e.x1)-n)/t),l=Math.min(a,(Math.max(e.y0,e.y1)-r)/t);if(c-o<20/t||l-s<20/t){ig.textContent=`もう少し 大きく かこんでね`,Rg();return}Q.rect={x:o,y:s,w:c-o,h:l-s},Q.mask=null,E_(y_===`line`?`done`:`fix`);return}Rg()}else if(Q.phase===`fix`&&e!==`up`&&Q.px&&Q.mask){let e=Q.px.width,r=e/512,i=t*r,a=n*r;for(let t=Math.floor(a-j_);t<=a+j_;t++)for(let n=Math.floor(i-j_);n<=i+j_;n++){if(n<0||t<0||n>=e||t>=e||(n-i)**2+(t-a)**2>j_**2)continue;let r=t*e+n;Q.px.data[r*4+3]&&(Q.mask[r]=+(b_===`add`))}Rg()}}}function N_(e){Q&&(e?(ig.textContent=`📷 とりこんだよ！「🖐 手足を きめる」で 手足も なおせるよ`,Q.before.length&&(Ov={strokes:Q.before,marks:Q.beforeMarks,editor:{...$},editId:nv},kv())):(Z=Q.before,fg=Q.beforeMarks,ig.textContent=`もとに もどしたよ`),Q=null,m_(),Nv(),Ng(),Rg())}for(let[e,t]of[[`pmPhoto`,`photo`],[`pmColor`,`color`],[`pmLine`,`line`]])document.getElementById(e).addEventListener(`click`,()=>{y_=t,Q&&(Q.rect?E_(t===`line`||Q.mask?`done`:`fix`):T_())});document.getElementById(`pbAdd`).addEventListener(`click`,()=>{b_=`add`,T_()}),document.getElementById(`pbDel`).addEventListener(`click`,()=>{b_=`del`,T_()}),document.getElementById(`pbAuto`).addEventListener(`click`,()=>{Q?.px&&(Q.mask=ze(Q.px,Number(g_.value)),Rg())}),document.getElementById(`pbRect`).addEventListener(`click`,()=>{if(!Q?.px)return;let e=Q.px.width,t=new Uint8Array(e*e);for(let n=0;n<e*e;n++)t[n]=+!!Q.px.data[n*4+3];Q.mask=t,Rg()}),document.getElementById(`photoAll`).addEventListener(`click`,()=>{Q&&(Q.rect={x:0,y:0,w:Q.img.naturalWidth,h:Q.img.naturalHeight},Q.mask=null,E_(y_===`line`?`done`:`fix`))});var P_=()=>{Q?.phase===`fix`?E_(`done`):N_(!0)};__.addEventListener(`click`,P_),document.getElementById(`pbarNext`).addEventListener(`click`,P_),document.getElementById(`pbarCancel`).addEventListener(`click`,()=>N_(!1)),v_.addEventListener(`click`,()=>{Q&&(Q.phase===`done`&&y_!==`line`?E_(`fix`):E_(`box`))}),document.getElementById(`photoCancel`).addEventListener(`click`,()=>N_(!1)),document.getElementById(`photoInput`).addEventListener(`change`,e=>{let t=e.target,n=t.files?.[0];if(t.value=``,!n)return;let r=new Image,i=URL.createObjectURL(n);r.onload=()=>{URL.revokeObjectURL(i);let e=document.createElement(`canvas`);e.width=e.height=512;let{s:t,ox:n,oy:a}=x_(r);e.getContext(`2d`).drawImage(r,n,a,r.naturalWidth*t,r.naturalHeight*t),Q={img:r,full:e,rect:null,drag:null,px:null,mask:null,phase:`box`,before:Q?.before??Z,beforeMarks:Q?.beforeMarks??fg},fg=[],B_(`draw`),m_(),E_(`box`),setTimeout(()=>rg.scrollIntoView({block:`start`}),400)},r.onerror=()=>{URL.revokeObjectURL(i),ig.textContent=`その写真は ひらけなかったよ`},r.src=i});var F_=0;h_.addEventListener(`input`,()=>{clearTimeout(F_),F_=window.setTimeout(()=>{Q?.phase===`done`&&(D_(),Rg()),T_()},150)}),g_.addEventListener(`input`,()=>{clearTimeout(F_),F_=window.setTimeout(()=>{Q?.px&&Q.phase===`fix`&&(Q.mask=ze(Q.px,Number(g_.value)),Rg()),T_()},150)});var I_=document.getElementById(`layerDraw`),L_=document.getElementById(`layerLimb`),R_=document.getElementById(`paintTools`),z_=document.getElementById(`limbTools`);function B_(e){pg=e,I_.classList.toggle(`on`,e===`draw`),L_.classList.toggle(`on`,e===`limb`),R_.hidden=e!==`draw`,z_.hidden=e!==`limb`,K_.textContent=e===`limb`?`手足を全部消す`:`全部消す`,e===`limb`?Z.length?Ig():ig.textContent=`先に「絵を かく」で 絵を 描いてね`:ig.textContent=``,Rg()}I_.addEventListener(`click`,()=>B_(`draw`)),L_.addEventListener(`click`,()=>B_(`limb`));var V_={hand:document.getElementById(`mHand`),foot:document.getElementById(`mFoot`),erase:document.getElementById(`mErase`)};for(let e of Object.keys(V_))V_[e].addEventListener(`click`,()=>{mg=e;for(let t of Object.keys(V_))V_[t].classList.toggle(`on`,t===e)});document.getElementById(`mAuto`).addEventListener(`click`,()=>{fg=[],vg.limb=[],Ng(),Rg(),Ig(),ig.textContent=`🤖 自動で 見つけるように もどしたよ　`+Fg});var H_={smooth:document.getElementById(`aSmooth`),mirror:document.getElementById(`aMirror`),shape:document.getElementById(`aShape`)},U_=()=>{for(let e of Object.keys(H_))H_[e].classList.toggle(`on`,_g[e])};for(let e of Object.keys(H_))H_[e].addEventListener(`click`,()=>{_g[e]=!_g[e],U_();try{localStorage.setItem(dg,JSON.stringify(_g))}catch{}Rg()});U_();var W_=document.getElementById(`beautify`);function G_(){W_.textContent=yg?`↩ もとに もどす`:`✨ きれいにする`}W_.addEventListener(`click`,()=>{yg?(Z=yg,yg=null,ig.textContent=`もとに もどしたよ`):Z.length&&(yg=Z,Z=De(Z),ig.textContent=`✨ 線を なめらかにして、すき間を つないだよ（もう一度 おすと もとに もどる）`),vg.draw=[],G_(),Ng(),Rg()});var K_=document.getElementById(`clear`),q_=0;K_.addEventListener(`click`,()=>{(pg===`limb`?fg:Z).length&&!q_?(K_.textContent=`もう一度押すと消えます`,q_=window.setTimeout(()=>{q_=0,K_.textContent=pg===`limb`?`手足を全部消す`:`全部消す`},2500)):(clearTimeout(q_),q_=0,pg===`limb`?(K_.textContent=`手足を全部消す`,fg=[],vg.limb=[],Ng(),Rg(),Ig()):(K_.textContent=`全部消す`,Z.length&&(Ov={strokes:Z,marks:fg,editor:{...$},editId:nv},kv(),gy(`🗑 けしたよ。「↩ さっきの 絵に もどす」で もどせるよ`)),Z=[],fg=[],vg.draw=[],vg.limb=[],yg=null,G_(),Ng(),Rg()))});var J_=document.getElementById(`sample`);for(let e of Object.keys(I))J_.add(new Option(e,e));J_.addEventListener(`change`,()=>{let e=I[J_.value];e&&(Z.length&&(Ov={strokes:Z,marks:fg,editor:{...$},editId:nv},kv()),Z=e(),fg=[],vg.draw=[],vg.limb=[],yg=null,G_(),Ng(),Rg()),J_.value=``});var Y_=[{key:`closeRadius`,label:`線の隙間をどこまで埋めるか`,min:0,max:8,step:1,fmt:e=>`${e}`},{key:`alpha`,label:`胴体とみなす太さ（小さいほど胴体が大きい）`,min:.15,max:.85,step:.05,fmt:e=>e.toFixed(2)},{key:`minAreaRatio`,label:`手足とみなす最小の大きさ`,min:.001,max:.03,step:.001,fmt:e=>`${(e*100).toFixed(1)}%`},{key:`minAspect`,label:`手足とみなす細長さ`,min:1,max:3,step:.1,fmt:e=>e.toFixed(1)},{key:`footAngleDeg`,label:`足とみなす角度（真下から）`,min:10,max:90,step:5,fmt:e=>`${e}°`}],X_=document.getElementById(`sliders`),Z_=[];for(let e of Y_){let t=document.createElement(`label`);t.className=`slider`;let n=document.createElement(`span`);n.textContent=e.label;let r=document.createElement(`span`),i=document.createElement(`input`);i.type=`range`,i.min=String(e.min),i.max=String(e.max),i.step=String(e.step);let a=()=>{i.value=String(xg[e.key]),r.textContent=e.fmt(xg[e.key])};a(),i.addEventListener(`input`,()=>{xg={...xg,[e.key]:Number(i.value)},r.textContent=e.fmt(xg[e.key]),$_()}),i.sync=a,Z_.push(i),t.append(n,r,i),X_.appendChild(t)}var Q_=0;function $_(){kg!==`draw`&&(clearTimeout(Q_),Q_=window.setTimeout(()=>{Ig(),kg===`detect`&&Rg(),kg===`anim`&&Ug()},120))}document.getElementById(`resetParams`).addEventListener(`click`,()=>{xg={...r};for(let e of Z_)e.sync?.();$_()}),(()=>{let e=im(),t=pm(),n=e=>[...(e.special??[]).map(e=>`r:${e}`),...(e.melee??[]).map(e=>`m:${e}`)],r=Pp([...e.flatMap(n),...t?n(t):[]]);if(!r)return;let i=e=>[...new Set(n(e))].map(e=>r.get(e)).filter(e=>!!e),a=(e,t)=>e.length?e:i(t);am(e.map(e=>({...e,partsR:a(e.partsR,e),partsM:a(e.partsM,e)})));let o=cm(t??{}),s=t??{special:[`homing`],melee:[`tornado`]};mm({...t??{},parts:void 0,partsR:a(o.partsR,s),partsM:a(o.partsM,s)})})();var ev=()=>[`start-r-homing`,`start-m-tornado`].filter(e=>wp().parts.some(t=>t.id===e)),tv=pm(),$=cm({...tv??{},name:tv?.name??``,special:tv?.special??[`homing`],melee:tv?.melee??[`tornado`]}),nv=tv?.id&&im().some(e=>e.id===tv.id)?tv.id:null,rv=()=>{mm({...$,id:nv??void 0,strokes:[],marks:[]}),Tv()},iv=document.getElementById(`charName`);iv.value=$.name===`名無し`?``:$.name,iv.addEventListener(`input`,()=>{$.name=iv.value.slice(0,16),rv()});function av(){let e=Z.length?Z:I.棒人間(),t=document.getElementById(`myTraits`);t.innerHTML=``;for(let[n,r]of nt(tt(h(e,xg,Z.length?fg:[])))){let e=document.createElement(`span`),i=document.createElement(`b`);i.textContent=n,e.append(i,r),t.appendChild(e)}}var ov={aggressive:[`🔥`,`ぐいぐい`,`どんどん前に出て なぐる`],cautious:[`🛡️`,`しんちょう`,`まもって はんげき`],sniper:[`🎯`,`とおくから`,`なぐったら はなれて ひっさつ`],tricky:[`🌀`,`トリッキー`,`よこに ゆさぶって かわす`]},sv=document.getElementById(`persCards`);for(let e of Object.keys(En)){let[t,n,r]=ov[e],i=document.createElement(`button`);i.type=`button`,i.dataset.pers=e,i.setAttribute(`role`,`radio`),i.innerHTML=`<b></b><span></span><small></small>`,i.querySelector(`b`).textContent=t,i.querySelector(`span`).textContent=n,i.querySelector(`small`).textContent=r,i.addEventListener(`click`,()=>{$.personality=e,cv(),rv()}),sv.appendChild(i)}function cv(){sv.querySelectorAll(`button`).forEach(e=>{let t=e.dataset.pers===$.personality;e.classList.toggle(`on`,t),e.setAttribute(`aria-checked`,String(t))})}var lv=document.getElementById(`stypeTabs`),uv=document.getElementById(`effects`);function dv(e,t=e.cost,n=``){let r=document.createElement(`span`);r.className=`pc`,r.style.setProperty(`--rc`,Lf[e.rarity].color);let i=document.createElement(`b`);i.className=`rk`,i.textContent=e.rarity;let a=document.createElement(`span`);a.className=`pn`,a.textContent=`${Hf(e.kind)} ${Bf(e.kind).name}`;let o=document.createElement(`small`);o.textContent=[Xf(e),...e.extras.map(Zf)].join(`・`)+(n?`（${n}）`:``);let s=document.createElement(`span`);return s.className=`pcost`,s.textContent=`${t}`,s.title=`装備コスト`,r.append(i,a,o,s),r}function fv(e,t,n=``){let r=document.createElement(`button`);r.type=`button`,r.className=`ptile`,r.style.setProperty(`--rc`,Lf[e.rarity].color);let i=Bf(e.kind).name;r.innerHTML=`<span class="rk"></span><span class="ct"></span><span class="ic"></span><span class="nm"></span><span class="pw"></span>`,r.querySelector(`.rk`).textContent=e.rarity,r.querySelector(`.ct`).textContent=`${t}`,r.querySelector(`.ic`).textContent=Hf(e.kind),r.querySelector(`.nm`).textContent=i;let a=e.kind.includes(`:`)?Bf(e.kind).desc:Xf(e);return r.querySelector(`.pw`).textContent=n||a+(e.extras.length?` ＋${e.extras.length}`:``),r.title=`${i}・${[Xf(e),...e.extras.map(Zf)].join(`・`)}・コスト${t}`,r}var pv=e=>{let t=wp();return e.map(e=>t.parts.find(t=>t.id===e)).filter(e=>!!e)};function mv(e,t){let n=[];for(let r of e.filter(e=>Qf(e,t)))$f([...n,r]).reduce((e,t)=>e+t,0)<=20&&n.push(r);return n}function hv(e,t){let n=[`威力 ×${e.mod.power.toFixed(2)}`];return t===`ranged`&&e.mod.speed!==1&&n.push(`弾の速さ ×${e.mod.speed.toFixed(2)}`),e.mod.duration!==1&&n.push(`状態異常の時間 ×${e.mod.duration.toFixed(2)}`),t===`melee`&&e.mod.windup&&n.push(`構え −${e.mod.windup}`),e.chargeDelta&&n.push(`必殺に必要な命中 ${e.chargeDelta}回`),n.join(`・`)}var gv={ranged:[`🎯`,`とおくの ひっさつ`],melee:[`👊`,`ちかくの ひっさつ`]},_v=(e,t)=>{e===`ranged`?$.partsR=t:$.partsM=t};function vv(){let e=wp(),t=t=>n=>{let r=e.parts.find(e=>e.id===n);return!!r&&Qf(r,t)};$.partsR=$.partsR.filter(t(`ranged`)),$.partsM=$.partsM.filter(t(`melee`));let n=$.specialType,r=e=>$f(mv(pv(sm($,e)),e)).reduce((e,t)=>e+t,0);lv.innerHTML=``;for(let e of[`ranged`,`melee`]){let t=document.createElement(`button`);t.type=`button`,t.className=`stab${e===n?` on`:``}`,t.setAttribute(`role`,`radio`),t.setAttribute(`aria-checked`,String(e===n)),t.innerHTML=`<b></b><span></span><small></small>`,t.querySelector(`b`).textContent=gv[e][0],t.querySelector(`span`).textContent=gv[e][1],t.querySelector(`small`).textContent=`⚡ ${r(e)} / 20${e===n?`　⭐ つかう`:``}`,t.addEventListener(`click`,()=>{$.specialType=e,vv(),rv()}),lv.appendChild(t)}let i=sm($,n),a=pv(i),o=mv(a,n),s=$f(o),c=s.reduce((e,t)=>e+t,0),l=new Set(sm($,n===`ranged`?`melee`:`ranged`));uv.innerHTML=``;let u=(e,t,n=uv)=>{let r=document.createElement(`div`);return r.className=e,r.textContent=t,n.appendChild(r),r};u(`kidhint`,`⭐ たたかいでは ${gv[n][0]} ${gv[n][1]}を つかうよ`);let d=document.createElement(`div`);d.className=`pips`,d.setAttribute(`aria-label`,`ポイント ${c} / 20`);let f=0;for(o.forEach((e,t)=>{for(let n=0;n<s[t]&&f<20;n++,f++){let t=document.createElement(`i`);t.style.background=Lf[e.rarity].color,d.appendChild(t)}});f<20;f++)d.appendChild(document.createElement(`i`));let p=document.createElement(`b`);p.textContent=`のこり ⚡${20-c}`,d.appendChild(p),uv.appendChild(d);let m=(e,t)=>{let n=document.createElement(`div`);n.className=`pbox`,u(`kidhint`,e,n);let r=document.createElement(`div`);return r.className=`tgrid`,n.appendChild(r),uv.appendChild(n),t&&u(`empty`,t,r),r},h=m(`🎒 つけている（タップで はずす）`,a.length?``:`まだ なにも ついていないよ。下の パーツを タップしてね`);for(let e of a){let t=o.indexOf(e),r=fv(e,t>=0?s[t]:e.cost,t<0?`⚡が たりなくて きいてない`:``);r.classList.add(`equipped`),t<0&&r.classList.add(`off`),r.insertAdjacentHTML(`beforeend`,`<span class="badge x">✖</span>`),r.addEventListener(`click`,()=>{_v(n,i.filter(t=>t!==e.id)),vv(),rv()}),h.appendChild(r)}let g=e.parts.filter(e=>Qf(e,n)&&!i.includes(e.id)).sort((e,t)=>If(t.rarity)-If(e.rarity)||Bf(e.kind).name.localeCompare(Bf(t.kind).name)),_=m(`🧰 もっている パーツ（タップで つける）`,g.length?``:`つけられる パーツが ないよ。ストーリーで かつと もらえる！`);for(let e of g){let t=$f([...o,e]).at(-1),r=c+t>20,a=Bf(e.kind).type===`both`,s=fv(e,t,r?`⚡が ${c+t-20} たりない`:``);s.disabled=r,s.insertAdjacentHTML(`beforeend`,`<span class="badge plus">＋</span>`),a&&s.insertAdjacentHTML(`beforeend`,`<span class="tag">${l.has(e.id)?`${gv[n===`ranged`?`melee`:`ranged`][0]}にも つけてる`:`🔁 どっちにも つかえる`}</span>`),s.addEventListener(`click`,()=>{_v(n,[...i,e.id]),vv(),rv()}),_.appendChild(s)}u(`ksub`,`右上の ⚡は つけるのに いる ポイント。🎯と👊で べつべつに 20ずつ つけられるよ。🔁の パーツは 1こで 両方に つけられる。おなじ パーツを かさねると こうかも かさなる！（いまの ひっさつ: ${hv(ep(o,n),n)}）`)}function yv(){iv.value=$.name===`名無し`?``:$.name,cv(),vv()}yv();var bv=document.getElementById(`saveMsg`);function xv(){if(!Z.length)return bv.textContent=`まだ絵が ないよ。「かく」で 描いてから ほぞんしてね`,gy(`まだ絵が ないよ`),!1;let e=nv??cm({}).id,t=dm({...$,id:e,name:$.name||`名無し`,strokes:Z.map(e=>({...e,points:[...e.points]})),marks:fg.map(e=>({...e,points:[...e.points]}))});return nv=e,rv(),bv.textContent=t?`「${$.name||`名無し`}」を ほぞんしたよ！`:`ほぞんできなかった…（ブラウザの設定で保存が禁止されているかもしれません）`,gy(t?`💾「${$.name||`名無し`}」を ほぞんしたよ`:`ほぞんできなかった…`),Iv(),t}document.getElementById(`saveChar`).addEventListener(`click`,()=>xv()),document.getElementById(`ebSave`).addEventListener(`click`,()=>xv());var Sv=e=>JSON.stringify([e.strokes,e.marks??[],e.name,e.personality,e.specialType,e.partsR,e.partsM]);function Cv(){let e=nv?im().find(e=>e.id===nv):void 0;return e?Sv({...$,strokes:Z,marks:fg})!==Sv({...e,name:e.name}):Z.length>0}var wv=0;function Tv(){cancelAnimationFrame(wv),wv=requestAnimationFrame(Ev)}function Ev(){let e=document.getElementById(`ebThumb`);if(!e)return;e.src=um(Z),document.getElementById(`ebName`).textContent=`✏️ ${$.name||`名無し`}`;let t=document.getElementById(`ebState`),n=Cv();t.className=n?`dirty`:`clean`,t.textContent=Q?`📷 しゃしんを とりこみ中`:Z.length?n?`● まだ ほぞんしていない`:`✔ ほぞんずみ`:`まだ 絵が ないよ`}function Dv(e,t){if(!Cv()){t();return}let n=document.createElement(`div`);n.className=`modal`,n.setAttribute(`role`,`dialog`),n.setAttribute(`aria-modal`,`true`);let r=document.createElement(`div`);r.className=`modal-box`;let i=()=>n.remove();n.addEventListener(`click`,e=>{e.target===n&&i()});let a=document.createElement(`div`);a.className=`kidhint`,a.textContent=`「${$.name||`名無し`}」は まだ ほぞんしていないよ`;let o=document.createElement(`div`);o.className=`pv`;let s=document.createElement(`img`);s.src=um(Z),s.alt=``;let c=document.createElement(`div`);c.className=`note`,c.textContent=`${e}と、いまの 絵は 画面から きえるよ。ほぞんしておけば「ほぞんした キャラ」から いつでも よびだせるよ。`,o.append(s,c);let l=document.createElement(`div`);l.className=`col`;let u=(e,t,n)=>{let r=document.createElement(`button`);r.type=`button`,r.className=t,r.textContent=e,r.addEventListener(`click`,()=>{i(),n()}),l.appendChild(r)};u(`💾 ほぞんしてから ${e}`,`primary`,()=>{xv()&&t()}),u(`🗑 ほぞんしないで ${e}`,``,()=>{Ov={strokes:Z,marks:fg,editor:{...$},editId:nv},t(),gy(`「↩ さっきの絵に もどす」で もどせるよ`),kv()}),u(`やめる（いまの 絵の まま）`,``,()=>{}),r.append(a,o,l),n.appendChild(r),document.body.appendChild(n)}var Ov=null;function kv(){let e=document.getElementById(`restoreBtn`);e&&(e.hidden=!Ov)}function Av(){nv=null,Object.assign($,cm({name:``,parts:ev()})),$.name=``,Z=[],fg=[],Nv(),Ng(),yv(),av(),Iv(),rv(),Rg(),bv.textContent=`あたらしい キャラを つくろう！「かく」で 絵を 描いてね`,gy(`✏️ あたらしい キャラを つくるよ`)}var jv=()=>Dv(`あたらしく つくる`,Av);document.getElementById(`newChar`).addEventListener(`click`,jv),document.getElementById(`ebNew`).addEventListener(`click`,jv),document.getElementById(`restoreBtn`)?.addEventListener(`click`,()=>{if(!Ov)return;let e=Ov;Dv(`さっきの 絵に もどす`,()=>Mv(e))});function Mv(e){Ov===e&&(Ov=null),Z=e.strokes,fg=e.marks,Object.assign($,e.editor),nv=e.editId,Nv(),Ng(),yv(),av(),Iv(),rv(),Rg(),kv(),gy(`↩ さっきの 絵に もどしたよ`)}function Nv(){vg.draw=[],vg.limb=[],yg=null,G_()}function Pv(e){nv=e.id,Object.assign($,cm(e)),Z=e.strokes.map(e=>({...e,points:[...e.points]})),fg=(e.marks??[]).map(e=>({...e,points:[...e.points]})),Nv(),Ng(),yv(),av(),Iv(),rv(),bv.textContent=`「${e.name}」を よびだしたよ`}var Fv=document.getElementById(`roster`);function Iv(){let e=im();if(Fv.innerHTML=``,!e.length){let e=document.createElement(`div`);e.className=`empty`,e.textContent=`まだ ないよ。絵を描いて「ほぞんする」を おすと ここに ならぶ`,Fv.appendChild(e)}else for(let t of e){let e=document.createElement(`div`);e.classList.toggle(`on`,t.id===nv);let n=document.createElement(`img`);t.thumb&&(n.src=t.thumb),n.alt=``;let r=document.createElement(`span`);r.className=`nm`,r.textContent=t.name;let i=document.createElement(`div`);i.className=`row`;let a=document.createElement(`button`);a.textContent=`なおす`,a.addEventListener(`click`,()=>Dv(`「${t.name}」を よびだす`,()=>Pv(t)));let o=document.createElement(`button`);o.textContent=`けす`;let s=0;o.addEventListener(`click`,()=>{s?(clearTimeout(s),fm(t.id),nv===t.id&&(nv=null),Iv()):(o.textContent=`ほんとに？`,s=window.setTimeout(()=>{s=0,o.textContent=`けす`},2500))}),i.append(a,o),e.append(n,r,i),Fv.appendChild(e)}}var Lv=``,Rv=new Map;function zv(e,t){return Rv.has(e)||Rv.set(e,um(t())),Rv.get(e)}var Bv=e=>!e.bossStage||!!Tm().cleared[e.bossStage];function Vv(){let e=document.getElementById(`cpuGrid`);e.innerHTML=``;let t=im();Lv.startsWith(`saved:`)&&!t.some(e=>`saved:${e.id}`===Lv)&&(Lv=``);let n=(e,t,n,r=!1)=>{let i=document.createElement(`button`);i.type=`button`,i.classList.toggle(`on`,e===Lv),i.disabled=r;let a=n?Object.assign(document.createElement(`img`),{src:n,alt:``}):Object.assign(document.createElement(`b`),{className:`dice`,textContent:`🎲`}),o=document.createElement(`span`);return o.textContent=r?`？？？`:t,i.append(a,o),i.addEventListener(`click`,()=>{Lv=e,Vv()}),i},r=t=>{let n=document.createElement(`div`);n.className=`cgroup`,n.textContent=t;let r=document.createElement(`div`);return r.className=`cgrid`,e.append(n,r),r};r(`おまかせ`).appendChild(n(``,`おまかせ`,null));for(let e of yh){let t=vh.filter(t=>t.group===e);if(!t.length)continue;let i=r(e===`ボス`?`ボス（ストーリーで たおすと えらべる）`:e);for(let e of t)i.appendChild(n(e.id,e.name,zv(e.id,e.strokes),!Bv(e)))}if(t.length){let e=r(`じぶんの キャラ`);for(let r of t)e.appendChild(n(`saved:${r.id}`,r.name,r.thumb??null))}let i=document.getElementById(`cpuPick`);i.innerHTML=``;let a=bh(Lv),o=t.find(e=>`saved:${e.id}`===Lv),s=a?Object.assign(document.createElement(`img`),{src:zv(a.id,a.strokes),alt:``}):o?.thumb?Object.assign(document.createElement(`img`),{src:o.thumb,alt:``}):Object.assign(document.createElement(`span`),{className:`dice`,textContent:`🎲`}),c=document.createElement(`b`),l=document.createElement(`small`);a?(c.textContent=a.name,l.textContent=`${a.intro}（${ov[a.personality][0]} ${ov[a.personality][1]}・${a.parts.map(e=>Hf(e)).join(``)}）`):o?(c.textContent=o.name,l.textContent=`じぶんで つくった キャラ`):(c.textContent=`おまかせ`,l.textContent=`だれが でてくるかは おたのしみ`),i.append(s,c,l)}function Hv(e){let t=yp(e.name,e.strokes(),[],r);return Uv(t,e,e.parts.map((t,n)=>Jf(t,`C`,rp(ip(`${e.id}#${n}`)),`${e.id}#${n}`)),Qp(tm(xm(bm()),e.prefer))),t}Object.keys(En);function Uv(e,t,n,r){let i=ep(mv(n,t.specialType),t.specialType);e.cfg.boost=i.chargeDelta?ut([r,{chargeNeed:i.chargeDelta}]):r,e.cfg.personality=t.personality,e.cfg.specialType=t.specialType,e.cfg.special=i.special,e.cfg.melee=i.melee,e.cfg.specialMod=i.mod}var Wv=e=>({hasFeet:e.cfg.hasFeet,hasHands:e.cfg.hasHands,hits:e.cfg.traits?.hits??1,reach:e.cfg.reach}),Gv=e=>Qp(bm().nodes,Wv(e));function Kv(e){let t=e.startsWith(`saved:`)?im().find(t=>t.id===e.slice(6)):void 0;if(t){let e=yp(t.name,t.strokes,[],xg,t.marks);return Uv(e,t,pv(sm(t,t.specialType)),Gv(e)),e}let n=Z.length?Z:I.棒人間(),r=yp($.name||`あなた`,n,[],xg,Z.length?fg:[]);return Uv(r,$,pv(sm($,$.specialType)),Gv(r)),r}var qv=new vp;document.getElementById(`startBattle`).addEventListener(`click`,()=>{qv.unlock();let e=Kv(``),t=Lv;if(!t){let e=vh.filter(Bv);t=e[Math.floor(Math.random()*e.length)].id}let n,r,i=t.startsWith(`saved:`)?im().find(e=>`saved:${e.id}`===t):void 0;if(i)n=yp(i.name,i.strokes,[],xg,i.marks),Uv(n,i,pv(sm(i,i.specialType)),Gv(n));else{let e=bh(t);n=Hv(e),r=e.catchphrase}dy({player:e,cpu:n,spectate:document.getElementById(`spectate`).checked,seed:Math.random()*4294967295>>>0,sfx:qv,cpuLine:r})});var Jv={home:``,story:`📖 ストーリー`,make:`✏️ キャラを つくる`,free:`⚔️ じゆうバトル`,transfer:`📦 ひきつぎ`,tree:`🌳 スキルツリー`,parts:`🧩 ひっさつパーツ`,online:`🌐 オンライン`},Yv=document.getElementById(`onlineScreen`),Xv=document.getElementById(`partsScreen`),Zv=document.getElementById(`treeScreen`),Qv=document.getElementById(`home`),$v=document.getElementById(`storyScreen`),ey=document.getElementById(`transferScreen`),ty=document.getElementById(`workspace`),ny=document.getElementById(`topbar`),ry=document.getElementById(`screenTitle`),iy=document.getElementById(`makeTabs`),ay=`home`,oy=new Zh(document.getElementById(`heroView`),document.getElementById(`heroLabel`)),sy=0,cy=null;function ly(e){Q&&e!==`make`&&(N_(!1),gy(`📷 しゃしんの とりこみは やめたよ`)),ay=e,Qv.hidden=e!==`home`,$v.hidden=e!==`story`,ey.hidden=e!==`transfer`,Zv.hidden=e!==`tree`,Xv.hidden=e!==`parts`,Yv.hidden=e!==`online`,ty.hidden=e!==`make`&&e!==`free`,ny.hidden=e===`home`,ry.textContent=Jv[e],iy.hidden=e!==`make`,e!==`make`&&Hg(),e===`home`?oy.start():oy.stop(),e===`home`?fy():e===`story`?Yy():e===`tree`?Dy():e===`parts`?Hy():e===`online`?$y.open():e===`make`?Wg(kg===`battle`?`draw`:kg):e===`free`&&Wg(`battle`),window.scrollTo(0,0)}function uy(e){try{history.pushState({screen:e},``),sy++}catch{}ly(e)}window.addEventListener(`popstate`,e=>{if(sy=Math.max(0,sy-1),cy){let e=cy;cy=null,e.close()}else ly(e.state?.screen??`home`)}),document.getElementById(`backBtn`).addEventListener(`click`,()=>{sy>0?history.back():ly(`home`)}),document.querySelectorAll(`[data-go]`).forEach(e=>e.addEventListener(`click`,()=>uy(e.dataset.go)));function dy(e){try{history.pushState({screen:ay,battle:!0},``),sy++}catch{}cy=gp({...e,onExit:()=>{cy&&(cy=null,sy>0)?history.back():ly(ay)}})}function fy(){let e=bm();document.getElementById(`pLevel`).textContent=String(e.level);let t=_m(e.level),n=e.level>=60;document.getElementById(`pExpBar`).style.width=n?`100%`:`${(100*e.exp/t).toFixed(1)}%`,document.getElementById(`pExp`).textContent=n?`最大レベル`:`経験値 ${e.exp} / ${t}（次のレベルまで ${t-e.exp}）`,document.getElementById(`pPoints`).textContent=String(e.points);let r=Math.min(e.points,60-Yp(e.nodes));document.getElementById(`treeHint`).textContent=r>0?`ポイント ${r} を使えます`:Yp(e.nodes)>=60?`上限まで育った！`:`ポイントで強くなる`}function py(){let e=bm(),t=wp().parts,n=t.reduce((e,t)=>!e||If(t.rarity)>If(e.rarity)?t:e,null);return he({level:e.level,spent:Yp(e.nodes),cap:60,titles:em(e.nodes).map(e=>e.title),cleared:Tm().cleared,chapters:lh,partCount:t.length,bestPart:n?`${n.rarity} ${Hf(n.kind)}${Bf(n.kind).name}`:void 0,charName:Z.length&&$.name?$.name:void 0})}var my=document.getElementById(`toast`),hy=0;function gy(e){my.textContent=e,my.hidden=!1,clearTimeout(hy),hy=window.setTimeout(()=>{my.hidden=!0},2600)}var _y=null;function vy(){if(_y)return;let e=``;try{e=py()}catch(t){e=`文を つくれなかったよ（${t.message}）`}let t=document.createElement(`div`);t.className=`modal`,t.setAttribute(`role`,`dialog`),t.setAttribute(`aria-modal`,`true`),_y=t;let n=()=>{t.remove(),_y=null};t.addEventListener(`click`,e=>{e.target===t&&n()});let r=document.createElement(`div`);r.className=`modal-box`,r.setAttribute(`data-noruby`,``);let i=document.createElement(`div`);i.className=`kidhint`,i.textContent=`📣 SNSよう じまんの ぶん`;let a=document.createElement(`div`);a.className=`note`,a.textContent=`①「📋 コピー」を おす → ② X・LINE・インスタ などを ひらく → ③ はりつける（文は なおしても いいよ）`;let o=document.createElement(`textarea`);o.className=`sharetext`,o.rows=8,o.value=e;let s=document.createElement(`div`);s.className=`sharemsg`,s.hidden=!0;let c=document.createElement(`div`);c.className=`row`;let l=document.createElement(`button`);l.type=`button`,l.className=`primary inline`,l.textContent=`📋 コピー`;let u=(e,t)=>{s.hidden=!1,s.className=`sharemsg${e?``:` ng`}`,s.textContent=t,o.classList.toggle(`copied`,e),e&&(l.textContent=`✅ コピーしたよ！`),gy(t)};if(l.addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(o.value)}catch{if(o.focus(),o.select(),o.setSelectionRange(0,o.value.length),!document.execCommand(`copy`)){u(!1,`コピー できなかったよ。文を ながおしして「コピー」を えらんでね`);return}}u(!0,`📋 クリップボードに コピーしたよ！ SNS に はりつけてね`)}),c.appendChild(l),typeof navigator.share==`function`){let e=document.createElement(`button`);e.type=`button`,e.textContent=`📤 おくる`,e.addEventListener(`click`,()=>{navigator.share({text:o.value}).catch(()=>{})}),c.appendChild(e)}let d=document.createElement(`button`);d.type=`button`,d.textContent=`とじる`,d.addEventListener(`click`,n),c.appendChild(d),r.append(i,a,o,c,s),t.appendChild(r),document.body.appendChild(t)}document.getElementById(`shareBtn`).addEventListener(`click`,vy);var yy=`http://www.w3.org/2000/svg`,by=document.getElementById(`treeSvg`),xy=document.getElementById(`nodeInfo`),Sy=null,Cy=e=>`${e>0?`+`:`−`}${Math.round(Math.abs(e)*100)}%`,wy=e=>`${e>0?`+`:`−`}${Math.abs(e)}`,Ty=[[`dealt`,e=>`与えるダメージ ${Cy(e)}`],[`taken`,e=>`受けるダメージ ${Cy(-e)}`],[`hp`,e=>`体力 ${wy(e)}`],[`stamina`,e=>`最大スタミナ ${wy(e)}`],[`regen`,e=>`スタミナ回復 ${Cy(e)}`],[`speed`,e=>`移動の速さ ${Cy(e)}`],[`special`,e=>`必殺の威力 ${Cy(e)}`],[`chargeNeed`,e=>`必殺に必要な命中 ${wy(e)}回`],[`punch`,e=>`通常攻撃の威力 ${Cy(e)}`],[`windup`,e=>`通常攻撃の構え ${wy(e)}コマ（遅くなる）`],[`dodgeCost`,e=>`回避のスタミナ ${wy(e)}`],[`guardCut`,e=>`防御で減らす割合 ${Cy(e)}`],[`guardMove`,e=>`防御中の移動 ${Cy(e/.5)}`],[`knock`,e=>`吹き飛ばされやすさ ${Cy(e)}`],[`guardCharge`,e=>`防御成功で溜まるゲージ ${wy(e)}`],[`guardDrain`,e=>`防御中のスタミナ消費 ${Cy(e)}`]];function Ey(e){return Ty.filter(([t])=>Math.abs(e[t]??0)>1e-9).map(([t,n])=>n(+e[t].toFixed(4)))}function Dy(){let e=bm();document.getElementById(`tPoints`).textContent=String(e.points),document.getElementById(`tSpent`).textContent=`使用 ${Yp(e.nodes)} ／ 上限 60（全部で ${Gp}・ぜんぶは取れないよ）`,by.innerHTML=``;let t=(e,t,n=by)=>{let r=document.createElementNS(yy,e);for(let[e,n]of Object.entries(t))r.setAttribute(e,String(n));return n.appendChild(r),r},n=[0,50,76,104,130,158,184,214],r=t(`g`,{}),i=t(`g`,{}),a=e=>-Math.PI/2+e*Math.PI*2/Lp.length,o=new Map;Lp.forEach((e,r)=>{let s=a(r),c=(e,t=0)=>[Math.cos(s)*e-Math.sin(s)*t,Math.sin(s)*e+Math.cos(s)*t];for(let t=1;t<=7;t++)t===5?(o.set(Bp(e.key,`5a`),c(n[5],-15)),o.set(Bp(e.key,`5b`),c(n[5],15))):o.set(Bp(e.key,t),c(n[t]));let[l,u]=c(n[7]+30);t(`text`,{x:l,y:u,style:`fill:${e.color}`},i).textContent=e.label});for(let e of qp()){let[t,n]=e.between,r=Lp.findIndex(e=>e.key===t),i=Lp.findIndex(e=>e.key===n),s=(a(r)+a(i))/2;Math.abs(a(r)-a(i))>Math.PI&&(s+=Math.PI),o.set(e.id,[Math.cos(s)*128,Math.sin(s)*128])}let s=e=>Lp.find(t=>t.key===Wp(e)?.branch)?.color??`#f08c00`;for(let[n,[i,a]]of o){let c=Wp(n),l=[...c.requires,...c.requiresAny??[]],u=e.nodes.includes(n);if(l.length)for(let d of l){let l=o.get(d);if(!l)continue;let f=t(`line`,{x1:l[0],y1:l[1],x2:i,y2:a,class:c.kind===`bridge`?`lnk bridge`:`lnk`},r);u&&e.nodes.includes(d)&&f.setAttribute(`style`,`stroke:${s(n)}`)}else{let e=t(`line`,{x1:0,y1:0,x2:i,y2:a,class:`lnk`},r);u&&e.setAttribute(`style`,`stroke:${s(n)}`)}}for(let[n,[r,a]]of o){let o=Wp(n),c=e.nodes.includes(n),l=Jp(n,e.nodes),u=s(n),d=o.kind===`keystone`?17:o.kind===`notable`||o.kind===`bridge`?13:o.kind===`fork`?11:9,f=o.kind===`fork`&&o.excludes&&e.nodes.includes(o.excludes),p=o.kind===`bridge`?t(`rect`,{x:r-d,y:a-d,width:d*2,height:d*2,rx:4,transform:`rotate(45 ${r} ${a})`,class:`nd ${c?`own`:l?`can`:`lock`}${Sy===n?` sel`:``}`},i):t(`circle`,{cx:r,cy:a,r:d,class:`nd ${c?`own`:l?`can`:`lock`}${Sy===n?` sel`:``}${f?` off`:``}`},i);c?p.setAttribute(`style`,`fill:${u};stroke:${u}`):l&&p.setAttribute(`style`,`stroke:${u}`);let m=o.kind===`keystone`?`◆`:o.kind===`notable`?`★`:o.kind===`bridge`?`✦`:o.kind===`fork`?`⑂`:``;m&&(t(`text`,{x:r,y:a,class:`mk${c?` on`:``}`},i).textContent=m);let h=t(`circle`,{cx:r,cy:a,r:d+4,class:`hit`,role:`button`,tabindex:0,"aria-label":`${o.name}（${o.desc}）${c?`取得済み`:``}`},i),g=()=>{Sy=n,Dy()};h.addEventListener(`click`,g),h.addEventListener(`keydown`,e=>{e.key===`Enter`&&g()})}t(`circle`,{cx:0,cy:0,r:26,class:`core`},i),t(`text`,{x:0,y:0,class:`core-t`},i).textContent=`Lv${e.level}`;let c=document.getElementById(`talents`);c.innerHTML=``;for(let t of Kp()){let n=e.nodes.includes(t.id),r=document.createElement(`button`);r.type=`button`,r.className=`talent${n?` own`:``}${Sy===t.id?` sel`:``}`,r.innerHTML=`<b></b><small></small>`,r.querySelector(`b`).textContent=`${n?`✔ `:``}${t.name}`,r.querySelector(`small`).textContent=t.desc.split(`:`)[0],r.addEventListener(`click`,()=>{Sy=t.id,Dy()}),c.appendChild(r)}if(xy.innerHTML=``,Sy){let t=Wp(Sy),n=e.nodes.includes(t.id),r=Jp(t.id,e.nodes),i={small:``,notable:`★ 山場`,fork:`⑂ 分かれ道（どちらか1つ）`,keystone:`◆ 大技`,bridge:`✦ 組み合わせ技`,talent:`🎨 らくがき才能`}[t.kind],a=document.createElement(`div`);a.innerHTML=`<b></b>　<span class="cost"></span><div></div>`,a.querySelector(`b`).textContent=t.name,a.querySelector(`.cost`).textContent=`${t.cost} ポイント${i?`・${i}`:``}`,a.querySelector(`div`).textContent=t.desc,xy.appendChild(a);let o=document.createElement(`div`);if(o.className=`row`,n)o.textContent=`取得済み`;else if(t.excludes&&e.nodes.includes(t.excludes))o.textContent=`もう片方を えらんだよ（振り直しで えらびなおせる）`;else if(!r)o.textContent=t.kind===`bridge`?`となりの枝の ★を 両方 とると ひらくよ`:`1つ内側を先に取ってください`;else if(Yp(e.nodes)+t.cost>60)o.textContent=`上限（60）を こえるので 取れません。振り直して ほかの組み合わせも ためしてね`;else{let n=document.createElement(`button`);n.className=`primary inline`,n.textContent=e.points>=t.cost?`取得する`:`ポイントが足りません（あと ${t.cost-e.points}）`,n.disabled=e.points<t.cost,n.addEventListener(`click`,()=>{Sm(t.id)&&Dy()}),o.appendChild(n)}xy.appendChild(o)}else xy.textContent=`丸をタップすると説明が出ます。中心から外へ順に取れます。★は山場、⑂は2つから1つえらぶ分かれ道、◆は強いけど損もある大技、✦は となりの枝の★を両方とると ひらく組み合わせ技。振り直しは無料なので、全部 見て ためしてね。`;let l=em(e.nodes);document.getElementById(`treeTitles`).textContent=l.length?`🏅 称号: ${l.map(e=>e.title).join(`・`)}`:`🏅 枝を ぜんぶ とると 称号が もらえるよ`;let u=document.getElementById(`treeTotal`);u.innerHTML=``;let d=Ey(Qp(e.nodes));for(let e of d.length?d:[`まだ何も取っていません（ストーリーで勝つとポイントがもらえます）`]){let t=document.createElement(`li`);t.textContent=e,u.appendChild(t)}for(let t of Kp().filter(t=>e.nodes.includes(t.id))){let e=document.createElement(`li`);e.textContent=`🎨 ${t.desc}`,u.appendChild(e)}}var Oy=document.getElementById(`treeReset`),ky=0;Oy.addEventListener(`click`,()=>{bm().nodes.length&&(ky?(clearTimeout(ky),ky=0,Oy.textContent=`振り直し`,Cm(),Sy=null,Dy()):(Oy.textContent=`もう一度で全部戻す`,ky=window.setTimeout(()=>{ky=0,Oy.textContent=`振り直し`},2500)))});var Ay=`all`,jy=null,My=`doodle-arena:partSort`,Ny=document.getElementById(`partSort`);try{Ny.value=localStorage.getItem(My)||`kind`}catch{}Ny.addEventListener(`change`,()=>{try{localStorage.setItem(My,Ny.value)}catch{}Hy()});var Py=document.getElementById(`equipChar`);Py.addEventListener(`change`,()=>Hy()),document.querySelectorAll(`[data-pf]`).forEach(e=>e.addEventListener(`click`,()=>{Ay=e.dataset.pf,document.querySelectorAll(`[data-pf]`).forEach(t=>t.classList.toggle(`on`,t===e)),Hy()}));var Fy=()=>new Set([$,...im()].flatMap(e=>[...e.partsR,...e.partsM]));function Iy(e){return e?im().find(t=>`saved:${t.id}`===e):{name:$.name||`編集中のキャラ`,partsR:$.partsR,partsM:$.partsM}}function Ly(e,t,n){let r=t===`ranged`?`partsR`:`partsM`,i=e.startsWith(`saved:`)?e.slice(6):null;i&&am(im().map(e=>e.id===i?{...e,[r]:n}:e)),(!i||i===nv)&&(_v(t,n),rv(),vv())}function Ry(){let e=Py.value;Py.innerHTML=``,Py.add(new Option(`編集中のキャラ（${$.name||`名無し`}）`,``));for(let e of im())e.id!==nv&&Py.add(new Option(e.name,`saved:${e.id}`));Py.value=[...Py.options].some(t=>t.value===e)?e:``}var zy={ranged:0,melee:1,both:2};function By(e,t,n){let r=e=>Bf(e.kind).name,i=(e,t)=>If(t.rarity)-If(e.rarity)||t.roll-e.roll;return t===`rare`?e.sort((e,t)=>i(e,t)||r(e).localeCompare(r(t))):t===`cost`?e.sort((e,t)=>e.cost-t.cost||i(e,t)):t===`new`?e.sort((e,t)=>n.indexOf(t)-n.indexOf(e)):e.sort((e,t)=>zy[Bf(e.kind).type]-zy[Bf(t.kind).type]||r(e).localeCompare(r(t))||i(e,t))}var Vy=(e,t)=>[e.locked?`🔒`:``,t.has(e.id)?`装備中`:``].filter(Boolean).join(`・`);function Hy(){Ry();let e=wp();document.getElementById(`invCount`).textContent=String(e.parts.length),document.getElementById(`invCap`).textContent=`300`,document.getElementById(`shards`).textContent=String(e.shards);let t=Fy(),n=Mp(e.parts,t),r=document.getElementById(`bulkCombine`);r.disabled=!n.length,r.textContent=n.length?`🔨 まとめて ごうせい（${n.length}）`:`🔨 まとめて ごうせい`,r.title=n.length?``:`同じ しゅるい・同じ レア度が 5こ（材料4こ＋ベース）そろうと できるよ`;let i=document.getElementById(`partList`);i.innerHTML=``;let a=By(e.parts.filter(e=>Ay===`all`||Bf(e.kind).type===Ay),Ny.value,e.parts);a.length||(i.textContent=`ありません。ストーリーで勝つと手に入ります。`);let o=``;for(let e of a){let n=Bf(e.kind).type;if(Ny.value===`kind`&&n!==o){o=n;let e=document.createElement(`div`);e.className=`kidhint`,e.textContent=n===`ranged`?`🎯 とおくの ひっさつ`:n===`melee`?`👊 ちかくの ひっさつ`:`🔁 どっちにも つかえる`,i.appendChild(e)}let r=document.createElement(`button`);r.type=`button`,r.classList.toggle(`sel`,e.id===jy),r.appendChild(dv(e,e.cost,Vy(e,t))),r.addEventListener(`click`,()=>{jy=e.id,Hy()}),i.appendChild(r)}let s=document.getElementById(`partInfo`);s.innerHTML=``;let c=e.parts.find(e=>e.id===jy);if(!c){s.textContent=`パーツを タップすると、キャラに つける・はずす・🔒鍵・振り直し・分解・合成が できます。`;return}s.appendChild(dv(c,c.cost,Vy(c,t)));let l=document.createElement(`div`);l.className=`note`,l.textContent=Bf(c.kind).desc,s.appendChild(l);let u=Py.value,d=Iy(u),f=[$,...im().filter(e=>e.id!==nv)].flatMap(e=>[...e.partsR.includes(c.id)?[`${e.name||`編集中`}🎯`]:[],...e.partsM.includes(c.id)?[`${e.name||`編集中`}👊`]:[]]);if(d){let e=document.createElement(`div`);e.className=`row`;for(let t of[`ranged`,`melee`]){if(!Qf(c,t))continue;let n=t===`ranged`?d.partsR:d.partsM,r=n.includes(c.id),i=mv(pv(n),t),a=$f(i).reduce((e,t)=>e+t,0),o=$f([...i,c]).at(-1),s=document.createElement(`button`);s.className=r?``:`primary inline`;let l=t===`ranged`?`🎯`:`👊`;s.textContent=r?`${l} はずす（⚡${a}/20）`:a+o>20?`${l} ⚡が たりない（${a}+${o}/20）`:`${l} つける（⚡${a}+${o}/20）`,s.disabled=!r&&a+o>20,s.addEventListener(`click`,()=>{Ly(u,t,r?n.filter(e=>e!==c.id):[...n,c.id]),Hy()}),e.appendChild(s)}let t=document.createElement(`div`);t.className=`note`,t.textContent=`「${d.name||`名無し`}」に つける・はずす（上の「つけかえる キャラ」で かえられる）${f.length?`　いま つけている: ${f.join(`・`)}`:``}`,s.append(t,e)}let p=document.createElement(`div`);p.className=`row`;let m=document.createElement(`div`);m.className=`note`;let h=document.createElement(`button`);h.textContent=c.locked?`🔓 鍵を はずす`:`🔒 鍵を かける`,h.addEventListener(`click`,()=>{Np(c.id),Hy()});let g=document.createElement(`button`);g.textContent=`振り直し（かけら ${Op(c.rarity)}）`,g.disabled=e.shards<Op(c.rarity),g.addEventListener(`click`,()=>{kp(c.id)&&Hy()});let _=document.createElement(`button`);_.textContent=`分解（かけら +${Lf[c.rarity].shards}）`,_.disabled=t.has(c.id)||!!c.locked;let v=0;_.addEventListener(`click`,()=>{v?(clearTimeout(v),Dp(c.id),jy=null,Hy()):(_.textContent=`もう一度で分解`,v=window.setTimeout(()=>{v=0,Hy()},2500))});let y=`${c.kind}|${c.rarity}`,b=e.parts.filter(e=>e.kind===c.kind&&e.rarity===c.rarity&&e.id!==c.id&&Ap(e,t)).length,x=document.createElement(`button`);x.textContent=c.rarity===`S`?`合成（S は最高）`:`🔨 これを ベースに 合成（材料 ${b}/4）`,x.disabled=c.rarity===`S`||!!c.locked||b<4,x.addEventListener(`click`,()=>Wy(y,{[y]:[c.id]})),p.append(h,g,_,x),s.append(p,m);let S=[];c.locked&&S.push(`🔒 鍵つき: 分解・合成（材料にも ベースにも）しません。`),t.has(c.id)&&S.push(`装備中: 分解・合成の材料には 使いません（ベースには できます）。`),m.textContent=S.join(``)}var Uy=null;function Wy(e,t={}){Uy?.remove();let n=new Set,r=document.createElement(`div`);r.className=`modal`,r.setAttribute(`role`,`dialog`),r.setAttribute(`aria-modal`,`true`),Uy=r;let i=()=>{r.remove(),Uy=null};r.addEventListener(`click`,e=>{e.target===r&&i()});let a=document.createElement(`div`);a.className=`modal-box`,r.appendChild(a),document.body.appendChild(r);let o=()=>{let r=wp(),s=Fy(),c=new Map(r.parts.map(e=>[e.id,e])),l=Mp(r.parts,s,t).filter(t=>!e||`${t.kind}|${t.rarity}`===e);a.innerHTML=``;let u=document.createElement(`div`);u.className=`kidhint`,u.textContent=e?`🔨 合成の かくにん`:`🔨 まとめて ごうせい（${l.length}組）`;let d=document.createElement(`div`);if(d.className=`warn`,d.textContent=`⚠ ベース いがいの 材料4こは なくなるよ。ベースは 1段上の レア度に なって 数値が 引き直しに なる。装備中と 🔒の パーツは 材料に しないよ。おなじ パーツを かさねて つけている時は、ベースと 材料を よく みてね。`,a.append(u,d),!l.length){let e=document.createElement(`div`);e.className=`note`,e.textContent=`合成できる 組が ないよ。`,a.appendChild(e)}l.forEach((e,r)=>{let i=`${e.kind}|${e.rarity}`,u=l.slice(0,r).filter(e=>`${e.kind}|${e.rarity}`===i).length,d=c.get(e.baseId),f=document.createElement(`div`);f.className=`cplan${n.has(r)?` off`:``}`;let p=document.createElement(`label`);p.className=`head`;let m=document.createElement(`input`);m.type=`checkbox`,m.checked=!n.has(r),m.addEventListener(`change`,()=>{m.checked?n.delete(r):n.add(r),o()});let h=Ff[If(e.rarity)+1];p.append(m,`${Hf(e.kind)} ${Bf(e.kind).name}　${e.rarity} ×5 → ${h}`);let g=document.createElement(`select`);for(let t of e.candidates){let e=c.get(t),n=new Option(`ベース: 出来 ${Math.round(e.roll*100)}%・⚡${e.cost}${e.extras.length?`・おまけ${e.extras.length}`:``}${s.has(t)?`・装備中`:``}`,t);g.add(n)}g.value=e.baseId,g.addEventListener(`change`,()=>{let e=[...t[i]??[]];e[u]=g.value,t[i]=e,o()});let _=document.createElement(`div`);_.className=`mats`,_.textContent=`なくなる 材料: ${e.materialIds.map(e=>{let t=c.get(e);return`出来${Math.round(t.roll*100)}%${t.extras.length?`+${t.extras.length}`:``}`}).join(`・`)}`,f.append(p,dv(d,d.cost,s.has(d.id)?`ベース・装備中`:`ベース`),g,_),a.appendChild(f)});let f=l.filter((e,t)=>!n.has(t)),p=document.createElement(`div`);p.className=`row`;let m=document.createElement(`button`);m.className=`primary inline`,m.textContent=`🔨 ${f.length}組 合成する`,m.disabled=!f.length,m.addEventListener(`click`,()=>{let e=Fy(),t=f.map(t=>jp(t.baseId,t.materialIds,e)).filter(e=>!!e);i(),t.length&&(jy=t[0].id,gy(`🔨 ${t.map(e=>`${e.rarity} ${Hf(e.kind)}`).join(` `)} が できたよ！`)),Hy()});let h=document.createElement(`button`);h.textContent=`やめる`,h.addEventListener(`click`,i),p.append(m,h),a.appendChild(p)};o()}document.getElementById(`bulkCombine`).addEventListener(`click`,()=>Wy());var Gy=document.getElementById(`storyChar`),Ky=document.getElementById(`chapters`),qy=new Map;function Jy(){let e=Gy.value;Gy.innerHTML=``,Gy.add(new Option(`編集中のキャラ（${$.name||(Z.length?`名無し`:`棒人間`)}）`,``));for(let e of im())Gy.add(new Option(e.name,`saved:${e.id}`));Gy.value=[...Gy.options].some(t=>t.value===e)?e:``}function Yy(){Jy();let{cleared:e}=Tm();Ky.innerHTML=``;for(let t of lh){let n=document.createElement(`div`);n.className=`chapter`;let r=document.createElement(`h2`);r.textContent=`第${t.no}章　${t.title}`;let i=document.createElement(`div`);i.className=`stages`,t.stages.forEach((n,r)=>{let a=document.createElement(`button`);a.className=n.boss?`boss`:``,a.disabled=!fh(n,e),qy.has(n.id)||qy.set(n.id,um(n.strokes()));let o=document.createElement(`img`);o.src=qy.get(n.id),o.alt=``;let s=document.createElement(`span`);s.className=`no`,s.textContent=`${t.no}-${r+1}${n.boss?` ボス`:``}`;let c=document.createElement(`span`);if(c.textContent=a.disabled?`？？？`:n.enemy,a.append(o,s,c),e[n.id]){let e=document.createElement(`span`);e.className=`clear`,e.textContent=`★`,e.setAttribute(`aria-label`,`クリア済み`),a.appendChild(e)}a.addEventListener(`click`,()=>Zy(n)),i.appendChild(a)}),n.append(r,i),Ky.appendChild(n)}for(let e of uh){let t=document.createElement(`div`);t.className=`chapter locked`,t.innerHTML=`<h2>${e}　準備中</h2>`,Ky.appendChild(t)}}function Xy(e,t,n){let r=bm(),i=`<div class="exp">経験値 +${e.exp}</div>`;if(e.levelsUp&&(i+=`<div class="up">レベルアップ！ Lv ${r.level}</div>`),e.points&&(i+=`<div>スキルポイント +${e.points}（メイン画面の「スキルツリー」で使えます）</div>`),e.firstClear){let e=dh[dh.indexOf(t)+1];i+=`<div>${e?`次のステージ「${e.enemy}」が開きました`:`ここまでクリア！ 続きの章は準備中です`}</div>`}return n?.got.length&&(i+=`<div class="drop"><div>パーツを手に入れた！</div>${n.got.map(e=>dv(e).outerHTML).join(``)}</div>`),n?.shardsInstead&&(i+=`<div>持ち物がいっぱいなので、かけら +${n.shardsInstead}</div>`),i}function Zy(e){qv.unlock();let t=Kv(Gy.value),n=yp(e.enemy,e.strokes(),[],r);Uv(n,e,mh(e),ut([Qp(tm(e.boostPoints,e.prefer)),{hp:e.hp??0}])),dy({player:t,cpu:n,spectate:!1,seed:Math.random()*4294967295>>>0,sfx:qv,cpuLevel:e.ai,exitLabel:`ステージ選択へ`,onResult:t=>Xy(Dm(e.no,e.id,!!e.boss,t===0),e,t===0?Ep(ph(e),!!e.boss,Math.random,!!e.final):null)})}function Qy(){return[{value:``,label:`編集中のキャラ（${$.name||(Z.length?`名無し`:`棒人間`)}）`},...im().map(e=>({value:`saved:${e.id}`,label:e.name}))]}var $y=Xh(Yv,{choices:Qy,buildPlayer:Kv,strokesOf:e=>{let t=e.startsWith(`saved:`)?im().find(t=>t.id===e.slice(6)):void 0;return t?t.strokes.length?{name:t.name,strokes:t.strokes}:null:Z.length?{name:$.name||`名無し`,strokes:Z}:null},params:()=>xg,runBattle:e=>dy({...e,sfx:qv}),partChipHtml:e=>dv(e).outerHTML,unlockSound:()=>qv.unlock()}),eb=document.getElementById(`transferMsg`),tb=document.getElementById(`importCode`);document.getElementById(`moveKeyBtn`).addEventListener(`click`,async()=>{let e=document.getElementById(`moveKeyShow`);eb.textContent=`番号を つくっているよ…`;try{e.textContent=sb(await lb()),e.hidden=!1,eb.textContent=`🔢 この 8文字を、うつした先の「② うけとる」に 入れてね（1回だけ・24時間で 消えるよ）`}catch(t){e.hidden=!0,eb.textContent=`番号を つくれなかったよ（${t.message}）。インターネットに つないで もう一度 おしてね`}});var nb=document.getElementById(`importBtn`),rb=0;nb.addEventListener(`click`,async()=>{if(!tb.value.trim())eb.textContent=`ひっこし番号（8文字）を 入れてね`;else if(!rb)nb.textContent=`もう一度 おすと 今の データと 入れかわるよ`,rb=window.setTimeout(()=>{rb=0,nb.textContent=`🚚 うけとる`},3e3);else{clearTimeout(rb),rb=0,nb.textContent=`🚚 うけとる`;try{eb.textContent=`読み込みました（${await cb(tb.value)} 件）。画面を読み込み直します…`,setTimeout(()=>location.reload(),900)}catch(e){eb.textContent=`読み込めませんでした: ${e.message||`コードが壊れています`}`}}}),Lm();try{history.replaceState({screen:`home`},``)}catch{}ly(`home`),O(()=>{Dg=null,Rg(),Tv()}),D([...Z,...im().flatMap(e=>e.strokes)]),Tv();var ib=`https://rakugaki-arena.pages.dev`,ab=`https://second1214.github.io`,ob=e=>{let t=e.toUpperCase().replace(/[^A-Z0-9]/g,``);return/^[A-HJ-NP-Z2-9]{8}$/.test(t)?t:null},sb=e=>`${e.slice(0,4)}-${e.slice(4)}`;async function cb(e){let t=ob(e);return t&&!/DA[01]:/.test(e)?Im((await Dh.moveGet(t)).code):Im(e)}async function lb(){return(await Dh.moveUp(await Fm())).key}function ub(){let e=document.getElementById(`moveBar`),t=(e,t,n)=>{let r=document.createElement(`button`);return r.type=`button`,r.className=t,r.textContent=e,r.addEventListener(`click`,n),r};if(location.origin===ab){let n=document.createElement(`div`);n.textContent=`🏠 らくがきアリーナは あたらしい アドレスに ひっこしたよ: rakugaki-arena.pages.dev`,e.append(n,t(`🚚 データを もって ひっこす（ひっこし番号）`,`primary`,async()=>{let e=Fm();try{let t=(await Dh.moveUp(await e)).key;gy(`🚚 ひっこし番号 ${sb(t)}（あたらしい アドレスで 自動で うけとるよ）`),setTimeout(()=>{location.href=`${ib}/#movekey=${t}`},1500)}catch(e){gy(`ひっこし番号を つくれなかったよ（${e.message}）。インターネットに つないで もう一度 おしてね`)}})),e.hidden=!1;return}let n=!im().length&&bm().level<=1&&!Object.keys(Tm().cleared).length;if(location.hash.startsWith(`#move=`)||location.hash.startsWith(`#movekey=`)){let e=location.hash.startsWith(`#movekey=`),r=decodeURIComponent(location.hash.slice(e?9:6));history.replaceState(null,``,location.pathname+location.search);let i=async()=>{try{gy(`🚚 ${e?await cb(r):await Im(r)}こ うつしたよ！`),setTimeout(()=>location.reload(),900)}catch(e){gy(`うつせなかったよ（${e.message}）`)}};if(n){i();return}let a=document.createElement(`div`);a.className=`modal`;let o=document.createElement(`div`);o.className=`modal-box`;let s=document.createElement(`div`);s.className=`kidhint`,s.textContent=`🚚 前の アドレスの データを うつす？`;let c=document.createElement(`div`);c.className=`note`,c.textContent=`ここに もう データが あるよ。うつすと、ここの データは 前の アドレスの データに いれかわるよ。`;let l=document.createElement(`div`);l.className=`col`,l.append(t(`🚚 うつす（いれかえる）`,`primary`,()=>{a.remove(),i()}),t(`やめる（ここの データの まま）`,``,()=>a.remove())),o.append(s,c,l),a.appendChild(o),document.body.appendChild(a)}else if(location.origin===ib&&(n||new URLSearchParams(location.search).has(`from`))){let n=document.createElement(`div`);n.textContent=`🚚 前の アドレス（github.io）で あそんでいた？ そこで「データを もって ひっこす」を おすと 出る 8文字の「ひっこし番号」を ここに 入れてね`;let r=document.createElement(`input`);r.className=`text big`,r.maxLength=12,r.autocomplete=`off`,r.placeholder=`れい: K7QM-3XPA`,e.append(n,r,t(`🚚 データを うつす`,`primary`,async()=>{try{gy(`🚚 ${await cb(r.value)}こ うつしたよ！`),setTimeout(()=>{location.href=`${ib}/`},900)}catch(e){gy(e.message===`引き継ぎコードではありません`?`8文字の ひっこし番号を 入れてね（前の アドレスで「🚚 データを もって ひっこす」を おすと 出るよ）`:`うつせなかったよ（${e.message}）`)}}),t(`とじる`,``,()=>{e.hidden=!0})),e.hidden=!1}}ub();var db=`2026-10-11 10:15 68c8da7`;document.getElementById(`buildInfo`).textContent=`ばん: ${db}`;async function fb(){if(location.protocol!==`file:`)try{let e=await fetch(`./version.json?t=${Date.now()}`,{cache:`no-store`});if(!e.ok)return;let{build:t}=await e.json();if(!t||t===db)return;if(sessionStorage.getItem(`doodle-arena:reloadFor`)===t){gy(`あたらしい ばん（${t}）が あるよ。アプリを とじて ひらきなおしてね`);return}sessionStorage.setItem(`doodle-arena:reloadFor`,t),location.reload()}catch{}}fb(),document.addEventListener(`visibilitychange`,()=>{document.hidden||fb()}),window.addEventListener(`error`,e=>gy(`⚠ エラー: ${e.message??``}`.slice(0,120))),window.addEventListener(`unhandledrejection`,e=>gy(`⚠ エラー: ${String(e.reason??``)}`.slice(0,120))),document.addEventListener(`touchstart`,()=>{},{passive:!0}),R();var pb=document.getElementById(`furigana`);pb.textContent=le()?`あ ふりがな: あり`:`あ ふりがな: なし`,pb.addEventListener(`click`,()=>{ue(!le()),location.reload()}),Rg();