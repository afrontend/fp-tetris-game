(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{15:function(e,t,a){e.exports=a(36)},20:function(e,t,a){},22:function(e,t,a){},36:function(e,t,a){"use strict";a.r(t);var n=a(0),o=a.n(n),l=a(8),r=a.n(l),c=(a(20),a(9)),i=a(10),s=a(13),u=a(11),m=a(14),d=a(12),y=a(1),w=a.n(y),v=(a(22),a(2)),p=a.n(v),f=function(e){var t,a,n={},o="";try{for(t in o=void 0===e?window.location.search.split("?")[1].split("&"):e.split("?")[1].split("#")[0].split("&"))o.hasOwnProperty(t)&&(console.log("prop: "+t+" value: "+o[t]),n[(a=o[t].split("="))[0]]=a[1])}catch(l){console.log("Error getArgs window.location.search("+window.location.search+")")}return console.log(JSON.stringify(n)),n}(),k=function(e){return o.a.createElement("div",{className:"block",style:{backgroundColor:e.color}},e.children)},h=function(e){return e.window.map(function(e,t){return o.a.createElement(k,{color:e.color,key:t},e.count)})},b=[{keyValue:32,keySymbol:"space"},{keyValue:37,keySymbol:"left"},{keyValue:38,keySymbol:"up"},{keyValue:39,keySymbol:"right"},{keyValue:40,keySymbol:"down"},{keyValue:83,keySymbol:"save"},{keyValue:82,keySymbol:"reload"}],E=function(e){var t=w.a.find(b,function(t){return t.keyValue===e});return t?t.keySymbol:null},g=function(e){function t(e){var a;return Object(c.a)(this,t),(a=Object(s.a)(this,Object(u.a)(t).call(this,e))).savedState=null,a.state=p.a.init({rows:17,columns:12}),a.state.timer=setInterval(function(){a.setState(function(e){return p.a.tick(e)})},700),d.a(function(e){setTimeout(function(){a.setState(function(t){var n=E(e.which);return"save"===n?(console.log("save"),a.savedState=w.a.cloneDeep(t),t):"reload"===n?(console.log("reload"),a.savedState?a.savedState:t):n?p.a.key(n,t):t})})}),a}return Object(m.a)(t,e),Object(i.a)(t,[{key:"render",value:function(){return f.debug?o.a.createElement("div",{style:{columns:"400px 3"}},o.a.createElement("div",{className:"container"},o.a.createElement("div",{className:"App"},o.a.createElement(h,{window:w.a.flatten(p.a.toArray(this.state)[0])}))),o.a.createElement("div",{className:"container"},o.a.createElement("div",{className:"App"},o.a.createElement(h,{window:w.a.flatten(p.a.toArray(this.state)[1])}))),o.a.createElement("div",{className:"container"},o.a.createElement("div",{className:"App"},o.a.createElement(h,{window:w.a.flatten(p.a.join(this.state))})))):o.a.createElement("div",{className:"container"},o.a.createElement("div",{className:"App"},o.a.createElement(h,{window:w.a.flatten(p.a.join(this.state))})))}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(o.a.createElement(g,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[15,2,1]]]);
//# sourceMappingURL=main.115d008f.chunk.js.map