r.WebSocket=function(e){this._url=e,this._connectionAttempts=0,this.on({"message:refresh":this._onRefresh},this)},_.extend(r.WebSocket.prototype,Backbone.Events,{_backoffTime:2e3,_maximumRetries:9,_retryJitterAmount:3e3,start:function(){var e="WebSocket"in window;e&&this._connect()},_connect:function(){r.debug("websocket: connecting"),this.trigger("connecting"),this._connectionStart=Date.now(),this._socket=new WebSocket(this._url),this._socket.onopen=_.bind(this._onOpen,this),this._socket.onmessage=_.bind(this._onMessage,this),this._socket.onclose=_.bind(this._onClose,this),this._connectionAttempts+=1},_sendStats:function(e){if(!r.config.stats_domain)return;$.ajax({type:"POST",url:r.config.stats_domain,data:JSON.stringify(e),contentType:"application/json; charset=utf-8"})},_onOpen:function(e){r.debug("websocket: connected"),this.trigger("connected"),this._connectionAttempts=0,this._sendStats({websocketPerformance:{connectionTiming:Date.now()-this._connectionStart}})},_onMessage:function(e){var t=JSON.parse(e.data);r.debug('websocket: received "'+t.type+'" message'),this.trigger("message message:"+t.type,t.payload)},_onRefresh:function(){var e=Math.random()*300*1e3;setTimeout(function(){location.reload()},e)},_onClose:function(e){if(this._connectionAttempts<this._maximumRetries){var t=this._backoffTime*Math.pow(2,this._connectionAttempts),n=Math.random()*this._retryJitterAmount-this._retryJitterAmount/2,i=Math.round(t+n);r.debug("websocket: connection lost ("+e.code+"), reconnecting in "+i+"ms"),r.debug("(can't connect? Make sure you've allowed https access in your browser.)"),this.trigger("reconnecting",i),setTimeout(_.bind(this._connect,this),i)}else r.debug("websocket: maximum retries exceeded. bailing out"),this.trigger("disconnected");this._sendStats({websocketError:{error:1}})},_verifyLocalStorage:function(e){var t="__synced_local_storage_%(keyname)s__".format({keyname:e});try{store.safeSet(t,store.safeGet(t)||"")}catch(n){return!1}return!0},startPerBrowser:function(e,t,n,r){if(!this._verifyLocalStorage(e))return!1;var i=new Date,s=store.safeGet(e)||"";if(!s||i-new Date(s)>15e3)this.on(n),this.start(),store.safeSet(e+"-websocketUrl",t);this._keepTrackOfHeartbeat(e,n,t),window.addEventListener("storage",r)},_writeHeartbeat:function(e,t,n){store.safeSet(e,new Date);var r=setInterval(function(){var i=new Date,s=store.safeGet(e);store.safeGet(e+"-websocketUrl")!==n&&!!s&&i-new Date(s)<5e3&&(this._maximumRetries=0,this._socket.close(),clearInterval(r),this._watchHeartbeat(e,t,n)),store.safeSet(e,new Date)}.bind(this),5e3)},_watchHeartbeat:function(e,t,n){var r=setInterval(function(){var i=new Date,s=store.safeGet(e)||"";if(!s||i-new Date(s)>15e3)this.on(t),this.start(),store.safeSet(e+"-websocketUrl",n),clearInterval(r),this._writeHeartbeat(e,t,n)}.bind(this),15e3)},_keepTrackOfHeartbeat:function(e,t,n){store.safeGet(e+"-websocketUrl")===n?this._writeHeartbeat(e,t,n):this._watchHeartbeat(e,t,n)}}),function(e,t,n){"use strict";function h(n){if(n.origin!==location.origin&&!u.test(n.origin)&&n.origin!=="null")return;try{var r=JSON.parse(n.data),i=r.type;if(!f.test(i))return;var s=i.split(".",2)[1];if(l[s]){var o=l[s];for(var a=0;a<o.targets.length;a++)e.frames.postMessage(o.targets[a],i,r.data,r.options)}var c=new CustomEvent(i,{detail:r.data});c.source=n.source,c.options=r.options,t.dispatchEvent(c);var h=new CustomEvent("*."+s,{detail:r.data});h.source=n.source,h.options=r.options,h.originalType=i,t.dispatchEvent(h)}catch(p){}}function p(e,n,r){"addEventListener"in t?t.addEventListener(e,n,r):"attachEvent"in t&&t.attachEvent("on"+e,n)}function d(e,n,r){"removeEventListener"in t?t.removeEventListener(e,n):"detachEvent"in t&&t.attachEvent("on"+e,n)}function v(e){return new RegExp("^http(s)?:\\/\\/"+e.join("|")+"$","i")}function m(e){return new RegExp("\\.(?:"+e.join("|")+")$")}function g(e){return/\*/.test(e)}var r=".*",i=".postMessage",s={targetOrigin:"*"},o=[r],u=v(o),a=[i],f=m(a),l={},c=!1,y=e.frames={postMessage:function(e,t,n,r){/\..+$/.test(t)||(t+=i),r=r||{};for(var o in s)r.hasOwnProperty(o)||(r[o]=s[o]);e.postMessage(JSON.stringify({type:t,data:n,options:r}),r.targetOrigin)},receiveMessage:function(e,t,n,r){typeof e=="string"&&(r=n,n=t,t=e,e=null),r=r||this;var i=function(t){if(e&&e!==t.source&&e.contentWindow!==t.source)return;n.apply(r,arguments)};return p(t,i),{off:function(){d(t,i)}}},proxy:function(e,t){this.listen(e),Object.prototype.toString.call(t)!=="[object Array]"&&(t=[t]);var n=l[e];n?n.targets=[].concat(n.targets,target):n={targets:t},l[e]=n},receiveMessageOnce:function(e,t,n,r){var i=y.receiveMessage(e,t,function(){n&&n.apply(this,arguments),i.off()},r);return i},addPostMessageOrigin:function(e){g(e)?o=[r]:o.indexOf(e)===-1&&(y.removePostMessageOrigin(r),o.push(e),u=v(o))},removePostMessageOrigin:function(e){var t=o.indexOf(e);t!==-1&&(o.splice(t,1),u=v(o))},listen:function(e){a.indexOf(e)===-1&&(a.push(e),f=m(a)),c||(p("message",h),c=!0)},stopListening:function(e){var t=a.indexOf(e);t!==-1&&(a.splice(t,1),a.length?f=m(a):(d("message",h),c=!1))}}}(this.r=this.r||{},this),!function(e,t,n){function f(e){a&&a(e)}var i,s,o,u,a;r.chatWebsockets=r.chatWebsockets||{},r.chatWebsockets.setup=function(e){if(!r.config.user_websocket_url)return;var t="{t2_"+r.config.user_id.toString(36)+"}";s=t+"-websocket",o=t+"-chat",u=r.config.user_websocket_url,a=e;var n=new r.WebSocket(u);n.startPerBrowser(s,u,l,c)};var l={"chat:request":function(e){f(e)},"chat:message":function(e){f(e)}},c=function(e){if(e.key!==o)return}}(r,this),!function(e,t,n){function u(t,n){e.frames.postMessage(i.contentWindow,t,n,{targetOrigin:s})}function a(e,t){var n=document.createElement("iframe");return n.src=e,t.id&&n.setAttribute("id",t.id),t.cssClass&&n.setAttribute("class",t.cssClass),n.classList.add(r),n}function f(){e.frames.stopListening("chat"),document.body.removeChild(i)}function l(e){i.classList.add("active"),i.style.width=e.width+"px",i.style.height=e.height+"px"}function c(e){function i(t){return['<a target="chat-app" id="chat-count" data-message-type="expand.chat" class="message-count" href="'+e.config.chat_url+'">',t,"</a>"].join("")}var t="#chat",n="#chat-count",r="active";return{isSelf:function(e){return $(e.target).is(t+", "+n)},onSetUnreadCount:function(e){e=Number(e);var s=$(n);s.length?e>0?($(t).addClass(r),s.text(e)):($(t).removeClass(r),s.remove()):e>0&&($(t).addClass(r),$(i(e)).insertAfter(t))}}}var r="pinned-to-bottom",i,s,o;e.chat=e.chat||{},e.chat.setup=function(){o=new c(e);if(i)return;var t=e.config.chat_initial_url;i=a(t,{id:"chat-app"}),s=e.utils.getUrlOrigin(t),e.chatWebsockets&&e.chatWebsockets.setup(function(e){u("websocket.chat",e)}),e.frames.listen("chat"),e.frames.receiveMessage(i,"resize.chat",function(e){l(e.detail.dimensions||e.detail)}),e.frames.receiveMessage(i,"unreadCount.chat",function(e){o.onSetUnreadCount(e.detail.count)}),e.frames.receiveMessage(i,"close.chat",function(e){f()}),document.body.appendChild(i),$(document.body).on("click",'a[target="chat-app"]',function(t){if(!e.utils.isSimpleClickEvent(t))return;t.preventDefault();const n=$(t.currentTarget).data("message-type");switch(n){case"expand.chat":u(n,{telemetry:{action:"click",noun:"chat",source:"nav"}});break;case"navigate.chat":u("navigate.chat",{href:t.currentTarget.href})}})}}(r,this),$(function(){if(!r.config.logged||!r.config.chat_url)return;r.chat.setup()});