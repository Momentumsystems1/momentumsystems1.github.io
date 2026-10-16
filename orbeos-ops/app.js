/* ORBEOS NEXT · visual-functional preview. No secrets in frontend. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nfmt = (n) => Number(n || 0).toLocaleString('es-ES');
  const nowText = (d) => new Intl.DateTimeFormat('es-ES',{hour:'2-digit',minute:'2-digit'}).format(d);
  const DEFAULT_API = 'https://command-center-backend-40az.onrender.com';
  const BRAND = ['#369aff','#be6cff','#ffb343','#ff5978','#42e2a1'];
  const demoFleet = [
    {name:'Alpha-01',person:'Luis',color:BRAND[0],point:[2.0853,41.4018]},
    {name:'Bravo-02',person:'Sofía',color:BRAND[1],point:[2.1358,41.3573]},
    {name:'Charlie-03',person:'Javier',color:BRAND[2],point:[2.1996,41.3992]},
    {name:'Delta-04',person:'María',color:BRAND[3],point:[2.1524,41.4339]},
    {name:'Echo-05',person:'Carlos',color:BRAND[4],point:[2.2105,41.3743]},
  ];
  const state = {
    apiBase: localStorage.getItem('orbeosNextApi') || DEFAULT_API,
    demo: localStorage.getItem('orbeosNextDemo') !== 'false',
    view:'inicio', panel:'actividad', map:null, mapReady:false,
    center:[2.1686,41.3874], zoom:11.8, style:'dark',
    layers:{incidents:true,parking:true,bikes:false,traffic:false,pmr:false},
    status:{backend:'loading',incidents:'loading',parking:'loading',bikes:'loading',azure:'loading',traffic:'unconfigured',fleet:'demo'},
    events:[], parking:[], bikes:[], hasRealEvents:false,
    markers:{incidents:[],parking:[],bikes:[],pmr:[],origin:[],destination:[],multi:[]},
    pick:null, origin:null,destination:null,route:null,multiRoute:null,
    originText:'', destinationText:'', loadingRoute:false,
    selectedOrb:0, orbExpanded:true, orbMini:false, selectedPoint:null, pointPopup:null,
    immersive:false, immersiveTimer:null, currentTrafficTest:0, lastChecked:null,
    activityDemo:[
      {title:'Obras en la calzada',description:'Ejemplo de incidencia · no corresponde a un evento confirmado',road:'Zona de ejemplo',severity:'warning',source:'DEMO',kind:'obras',lat:41.394,lon:2.153},
      {title:'Congestión de tráfico',description:'Dato de muestra para validar la representación',road:'Zona de ejemplo',severity:'warning',source:'DEMO',kind:'trafico',lat:41.405,lon:2.188},
      {title:'Vehículo detenido',description:'Evento simulado, no recibido desde la DGT',road:'Zona de ejemplo',severity:'critical',source:'DEMO',kind:'averia',lat:41.376,lon:2.175},
    ],
  };
  const orbitActions = [
    {id:'inicio',label:'Vista',icon:'▦'},
    {id:'navegador',label:'Navegar',icon:'↗'},
    {id:'capas',label:'Capas',icon:'▱'},
    {id:'actividad',label:'Incidencias',icon:'⚠'},
    {id:'multi',label:'Multi',icon:'⇶'},
    {id:'sistemas',label:'Sistemas',icon:'◉'},
    {id:'mapa',label:'Mapa',icon:'⌖'},
  ];
  const mapStyles = {
    dark: {version:8,name:'ORBEOS Dark',sources:{base:{type:'raster',tiles:['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png','https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],tileSize:256,attribution:'© OpenStreetMap © CARTO',maxzoom:19}},layers:[{id:'dark-bg',type:'background',paint:{'background-color':'#081632'}},{id:'base',type:'raster',source:'base',paint:{'raster-opacity':.95}}]},
    satellite:{version:8,name:'ORBEOS Satellite',sources:{base:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,attribution:'© Esri, Maxar, Earthstar Geographics',maxzoom:19},labels:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19}},layers:[{id:'sat-bg',type:'background',paint:{'background-color':'#07102b'}},{id:'base',type:'raster',source:'base'},{id:'labels',type:'raster',source:'labels',paint:{'raster-opacity':.8}}]}
  };
  const statuses = {real:'REAL',demo:'DEMO',empty:'SIN DATOS',error:'ERROR',loading:'CARGANDO',unconfigured:'NO CONFIG.',configured:'CONFIG.',verifying:'VERIFICANDO'};
  const sourceTitle = {backend:'Backend API',incidents:'DGT / SCT',parking:'OpenStreetMap',bikes:'CityBikes',azure:'Azure Maps',traffic:'Tráfico Azure',fleet:'Flota Momentum'};
  function setText(id, value){const e=$(id);if(e) e.textContent=value;}
  function badge(id, status){const el=$(id);if(!el)return;el.className=`data-badge ${status==='real'?'real':status==='demo'?'demo':status==='error'?'off':''}`;el.textContent=statuses[status]||String(status).toUpperCase();}
  function message(text){setText('mapNotice',text);}
  async function getJson(path,timeoutMs=22000){
    const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeoutMs);
    try{const r=await fetch(`${state.apiBase.replace(/\/$/,'')}/api${path}`,{signal:ctrl.signal,headers:{Accept:'application/json'}});if(!r.ok)throw Error(`HTTP ${r.status}`);return await r.json();}
    finally{clearTimeout(timer)}
  }
  function getCenter(){const c=state.map?state.map.getCenter():{lng:state.center[0],lat:state.center[1]};return [c.lng,c.lat]}
  function coordsText(c){return c?`${c[1].toFixed(5)}, ${c[0].toFixed(5)}`:''}
  function refreshClock(){setText('headerClock',new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date()));}
  function renderOrb(){
    const orbit=$('orbeOrbit');orbit.innerHTML='';
    const n=orbitActions.length;
    orbitActions.forEach((action,i)=>{
      const shift=(i-state.selectedOrb+n)%n;
      const angle=(-90+shift*360/n)*Math.PI/180;
      const btn=document.createElement('button');
      btn.className='orb-btn'+(i===state.selectedOrb?' selected':'');
      btn.style.left=`${170+140*Math.cos(angle)}px`;
      btn.style.top=`${170+140*Math.sin(angle)}px`;
      btn.setAttribute('aria-label',action.label);
      btn.title=action.label;
      btn.appendChild(document.createTextNode(action.icon));
      const tag=document.createElement('span');tag.className='orb-label';tag.textContent=action.label;btn.appendChild(tag);
      btn.addEventListener('click',()=>selectOrb(i));orbit.appendChild(btn);
    });
    setText('orbCaption',`Modo: ${orbitActions[state.selectedOrb].label}`);
    syncOrbState();
  }
  function syncOrbState(){
    const wrap=$('orbeWrap');
    wrap.classList.toggle('orb-mini',state.orbMini);
    wrap.classList.toggle('orb-collapsed',!state.orbExpanded);
    const core=$('orbCore');
    core.setAttribute('aria-expanded',String(state.orbExpanded&&!state.orbMini));
    core.setAttribute('aria-label',state.orbMini?'Restaurar orbe (clic o doble clic)':state.orbExpanded?'Cerrar comandos (doble clic para minimizar)':'Abrir comandos (doble clic para minimizar)');
    core.title=state.orbMini?'Clic para restaurar':'Clic: abrir/cerrar · Doble clic: reducir · Arrastra para mover';
  }
  function selectOrb(i){
    state.selectedOrb=i;
    state.orbMini=false;state.orbExpanded=true;syncOrbState();
    // Keep existing DOM buttons: CSS animates their new mathematically spaced positions.
    Array.from($('orbeOrbit').children).forEach((b,j)=>{
      const shift=(j-i+orbitActions.length)%orbitActions.length;
      const a=(-90+shift*360/orbitActions.length)*Math.PI/180;
      b.style.left=`${170+140*Math.cos(a)}px`;b.style.top=`${170+140*Math.sin(a)}px`;
      b.classList.toggle('selected',j===i);
    });
    setText('orbCaption',`Modo: ${orbitActions[i].label}`);
    const mode=orbitActions[i].id;
    if(mode==='actividad'&&!state.layers.incidents){state.layers.incidents=true;drawMarkers();}
    openView(mode);
    if(mode==='mapa')message('Mapa listo: arrastra para pantalla completa temporal · clic en un punto para acciones');
  }
  function openView(view){
    if(view==='mapa'){state.view='mapa';state.panel='actividad'}
    else if(view==='inicio'){state.view='inicio';state.panel='actividad'}
    else if(view==='actividad'){state.view='inicio';state.panel='actividad'}
    else if(view==='sistemas'){state.view='sistemas';state.panel='sistemas'}
    else{state.view=view;state.panel=view}
    document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));
    const titles={inicio:['Vista general','Movilidad operativa · datos reales donde existan'],mapa:['Mapa de movilidad','Geolocalización, incidentes y capas verificadas'],navegador:['Navegador','Origen y destino · rutas por vías públicas'],multi:['Operaciones multi-ruta','Coordinación · vehículos y posiciones DEMO'],capas:['Capas del mapa','Activación independiente y procedencia visible'],sistemas:['Fuentes conectadas','Conectividad, procedencia y fallos']};
    setText('pageTitle',(titles[state.view]||titles.inicio)[0]);setText('pageSubtitle',(titles[state.view]||titles.inicio)[1]);
    document.querySelectorAll('.right-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.panel===state.panel));
    drawPanel();
  }
  function sourceStatus(id, kind){state.status[id]=kind;renderSourceSummary();drawKpis()}
  function drawKpis(){
    setText('kpiVehicles',state.demo?'5':'—');badge('kpiVehiclesMode',state.demo?'demo':'empty');
    setText('kpiRoutes',state.demo?'5':'—');badge('kpiRoutesMode',state.demo?'demo':'empty');
    setText('kpiIncidents',state.hasRealEvents?nfmt(state.events.length):state.demo?nfmt(state.activityDemo.length):'—');badge('kpiIncidentsMode',state.hasRealEvents?'real':state.demo?'demo':'empty');
    setText('kpiParking',state.status.parking==='real'?nfmt(state.parking.length):'—');badge('kpiParkingMode',state.status.parking==='real'?'real':state.status.parking);
    setText('kpiBikes',state.status.bikes==='real'?nfmt(state.bikes.length):'—');badge('kpiBikesMode',state.status.bikes==='real'?'real':state.status.bikes);
    setText('routesActive',state.demo?'5':'—');setText('eventsKnown',state.hasRealEvents?String(state.events.length):'—');
    const num=Object.values(state.status).filter(x=>x==='real').length;setText('sourcesActive',String(num));
    const strip=$('routeStrip');strip.innerHTML=state.demo?BRAND.map(x=>`<span style="background:${x}"></span>`).join(''):'<span style="background:#294477"></span>';
    setText('modeChip',state.status.backend==='real'?'● API disponible · origen verificado por capa':'● Preview / disponibilidad limitada');
    drawIncidentBars();
  }
  function renderSourceSummary(){
    const ids=['backend','incidents','parking','bikes','azure','traffic','fleet'];
    $('sourceSummary').innerHTML=ids.map(id=>`<div class="source-tile"><span>${esc(sourceTitle[id])}</span><span class="status ${state.status[id]==='real'?'good':state.status[id]==='demo'?'demo':['error','unconfigured'].includes(state.status[id])?'error':''}">${esc(statuses[state.status[id]]||'—')}</span></div>`).join('');
    setText('sourcesActive',String(Object.values(state.status).filter(x=>x==='real').length));
  }
  function eventsToShow(){return state.hasRealEvents?state.events:state.demo?state.activityDemo:[]}
  function drawIncidentBars(){
    const ev=eventsToShow();const groups={Accidentes:0,Congestión:0,Obras:0,Averías:0,Otros:0};
    ev.forEach(e=>{const s=((e.kind||'')+' '+(e.title||'')).toLowerCase();
      if(/accident|colisi|choque/.test(s))groups.Accidentes++;
      else if(/tr[aá]fic|congest|retenci/.test(s))groups.Congestión++;
      else if(/obra/.test(s))groups.Obras++;
      else if(/aver[ií]|veh[ií]culo detenido/.test(s))groups.Averías++;else groups.Otros++;
    });
    const max=Math.max(1,...Object.values(groups)); const colors=['#ff5a77','#ffab42','#f5d555','#3e9dff','#9678de'];
    $('incidentBars').innerHTML=Object.entries(groups).map(([key,val],i)=>`<div class="bar-line"><label>${key}</label><b>${val}</b><div class="bar-track"><div class="bar-fill" style="width:${val/max*100}%;background:${colors[i]}"></div></div></div>`).join('');
    badge('incidentSummaryMode',state.hasRealEvents?'real':state.demo?'demo':'empty');
  }
  function markerEl(icon,title,subtitle='',cls=''){
    const root=document.createElement('div');root.className=`map-marker ${cls}`;const dot=document.createElement('span');dot.className='map-dot';dot.textContent=icon;
    root.appendChild(dot);if(title){const label=document.createElement('div');label.className='map-text';const b=document.createElement('b');b.textContent=title;label.appendChild(b);if(subtitle){const s=document.createElement('small');s.textContent=subtitle;label.appendChild(s)}root.appendChild(label)}return root;
  }
  function addMarker(layer,point,element,anchor='left'){
    if(!state.map||!Number.isFinite(Number(point[0]))||!Number.isFinite(Number(point[1])))return null;
    const marker=new maplibregl.Marker({element,anchor}).setLngLat(point).addTo(state.map);
    element.addEventListener('click',ev=>{
      ev.preventDefault();ev.stopPropagation();
      handlePointSelection(point,{label:element.querySelector('.map-text b')?.textContent||'Punto en mapa',detail:element.querySelector('.map-text small')?.textContent||'',kind:layer});
    });
    state.markers[layer].push(marker);return marker;
  }
  function clearLayer(layer){state.markers[layer]?.forEach(marker=>marker.remove());state.markers[layer]=[]}
  function drawMarkers(){
    ['incidents','parking','bikes','pmr'].forEach(clearLayer);
    if(state.layers.incidents){eventsToShow().slice(0,35).forEach(e=>{
      if(!Number.isFinite(+e.lon)||!Number.isFinite(+e.lat))return;
      const isDemo=e.source==='DEMO';const el=markerEl('!',(e.road||e.title||'Incidencia').slice(0,26),isDemo?'DEMO · ejemplo':`${e.source||'Fuente pública'}`,`incident ${isDemo?'demo':''}`);
      el.title=(e.description||'')+' · '+(e.source||'');addMarker('incidents',[+e.lon,+e.lat],el);
    })}
    if(state.layers.parking){state.parking.slice(0,35).forEach(f=>{const el=markerEl('P',f.name||'Aparcamiento','OSM · ocupación desconocida','parking');addMarker('parking',[+f.lon,+f.lat],el)})}
    if(state.layers.bikes){state.bikes.slice(0,30).forEach(f=>{const p=stationCoords(f);if(!p)return;const el=markerEl('♧',f.name||'Estación bici','CityBikes · ubicación','bike');addMarker('bikes',p,el)})}
    if(state.layers.pmr&&state.demo){const c=getCenter();[[.016,-.006],[-.014,.008],[.004,.018]].forEach((xy,i)=>{const el=markerEl('♿',`Punto PMR ${i+1}`,'DEMO · sin evaluación técnica','demo bike');addMarker('pmr',[c[0]+xy[0],c[1]+xy[1]],el)})}
    drawEndpoints();
  }
  // A map click always yields a real coordinate. A source marker may add sourced metadata.
  // Never infer parking availability, PMR suitability, traffic or an ETA from the coordinate.
  function handlePointSelection(point,info={}){
    if(state.pick){
      const target=state.pick;
      setPick(null);setRoutePoint(target,point,info.label||coordsText(point));
      state.map?.flyTo({center:point,zoom:Math.max(14,state.map.getZoom()),duration:700});
      drawPanel();message(`Punto ${target==='origin'?'de inicio':'de destino'} marcado en el mapa`);
      return;
    }
    if(!state.map)return;
    state.selectedPoint={point:[...point],label:info.label||'Punto seleccionado',detail:info.detail||'',kind:info.kind||'mapa'};
    state.map.flyTo({center:point,zoom:Math.max(15,state.map.getZoom()),duration:900,essential:true});
    showPointOptions();
    message(`Punto seleccionado · ${coordsText(point)} · menú contextual abierto`);
  }
  function dismissPoint(){state.pointPopup?.remove();state.pointPopup=null;state.selectedPoint=null;}
  function showPointOptions(){
    if(!state.map||!state.selectedPoint)return;
    state.pointPopup?.remove();
    const {point,label,detail,kind}=state.selectedPoint;
    const wrap=document.createElement('div');wrap.className='point-actions';
    const head=document.createElement('div');head.className='point-actions-heading';
    const name=document.createElement('strong');name.textContent=label;
    const sub=document.createElement('small');sub.textContent=`${coordsText(point)} · ${detail|| (kind==='mapa'?'Coordenadas del mapa':'Origen: '+kind)}`;
    head.append(name,sub);wrap.appendChild(head);
    const menu=document.createElement('div');menu.className='point-actions-grid';
    const opts=[
      ['origin','◎','Marcar inicio'],['destination','⚑','Marcar destino'],
      ['parking','P','Parking cerca'],['bikes','♧','Bicis cerca'],
      ['incidents','⚠','Incidencias'],['copy','⧉','Copiar coordenadas']
    ];
    opts.forEach(([action,icon,title])=>{
      const b=document.createElement('button');b.type='button';b.dataset.pointAction=action;
      const i=document.createElement('span');i.textContent=icon;const t=document.createElement('span');t.textContent=title;
      b.append(i,t);b.addEventListener('click',ev=>{ev.stopPropagation();void executePointAction(action)});menu.appendChild(b);
    });
    wrap.appendChild(menu);
    const popup=new maplibregl.Popup({closeButton:true,closeOnClick:false,offset:28,maxWidth:'325px',className:'orbe-point-popup',focusAfterOpen:false})
      .setLngLat(point).setDOMContent(wrap).addTo(state.map);
    popup.on('close',()=>{if(state.pointPopup===popup){state.pointPopup=null;state.selectedPoint=null}});
    state.pointPopup=popup;
  }
  async function executePointAction(action){
    const selection=state.selectedPoint;if(!selection)return;
    const p=[...selection.point];const label=selection.label==='Punto seleccionado'?coordsText(p):selection.label;
    if(action==='origin'||action==='destination'){
      setRoutePoint(action,p,label);dismissPoint();openView('navegador');
      message((action==='origin'?'Inicio':'Destino')+' fijado: '+label);return;
    }
    if(action==='copy'){
      try{await navigator.clipboard.writeText(coordsText(p));message('Coordenadas copiadas: '+coordsText(p))}
      catch{message('Coordenadas: '+coordsText(p)+' · selecciónalas en el menú si necesitas copiarlas')}
      return;
    }
    if(['parking','bikes','incidents'].includes(action)){
      state.layers[action]=true;drawMarkers();openView('capas');
      dismissPoint();
      message('Consultando '+(action==='parking'?'aparcamientos':action==='bikes'?'bicicletas':'incidencias')+' cerca del punto seleccionado…');
      await refreshAll(p);return;
    }
  }
  function setImmersiveMap(enabled){
    if(state.immersive===enabled)return;
    clearTimeout(state.immersiveTimer);state.immersive=enabled;
    document.body.classList.toggle('map-immersive',enabled);
    const resize=()=>{try{state.map?.resize()}catch{}};
    requestAnimationFrame(resize);
    state.immersiveTimer=setTimeout(resize,enabled?360:390);
  }
  function stationCoords(f){const lat=f.lat??f.latitude??f.location?.latitude;const lon=f.lon??f.lng??f.longitude??f.location?.longitude;return Number.isFinite(+lat)&&Number.isFinite(+lon)?[+lon,+lat]:null}
  function drawEndpoints(){
    ['origin','destination'].forEach(clearLayer);
    if(state.origin){addMarker('origin',state.origin,markerEl('◎','Punto 1 · Inicio',state.originText||coordsText(state.origin),'origin'))}
    if(state.destination){addMarker('destination',state.destination,markerEl('⚑','Punto 2 · Destino',state.destinationText||coordsText(state.destination),'end'))}
  }
  function drawGeoLine(id,features,paint,layout={}){
    if(!state.map||!state.map.isStyleLoaded())return;
    const geo={type:'FeatureCollection',features};
    if(state.map.getSource(id))state.map.getSource(id).setData(geo);
    else {state.map.addSource(id,{type:'geojson',data:geo});state.map.addLayer({id,source:id,type:'line',layout:{'line-join':'round','line-cap':'round',...layout},paint})}
  }
  function redrawLines(){
    if(state.route?.geometry?.coordinates?.length>1){const data=[{type:'Feature',geometry:state.route.geometry,properties:{}}];drawGeoLine('next-route',data,{'line-color':state.route.real?'#47b7ff':'#ffbd62','line-width':5,'line-opacity':.96,'line-dasharray':state.route.real?[1,0]:[2,1]})}
    if(state.multiRoute?.length){const data=state.multiRoute.map(x=>({type:'Feature',geometry:{type:'LineString',coordinates:[x.point,x.dest]},properties:{color:x.color}}));drawGeoLine('next-multi',data,{'line-color':['get','color'],'line-width':3,'line-opacity':.92,'line-dasharray':[2,1]})}
  }
  function syncTraffic(){
    const id='azure-flow';if(!state.map||!state.map.isStyleLoaded())return;
    if(state.map.getLayer(id))state.map.removeLayer(id);if(state.map.getSource(id))state.map.removeSource(id);
    if(!state.layers.traffic||state.status.traffic!=='real')return;
    const url=state.apiBase.replace(/\/$/,'')+'/api/azure/tile/flow/{z}/{x}/{y}';
    state.map.addSource(id,{type:'raster',tiles:[url],tileSize:256});state.map.addLayer({id,source:id,type:'raster',paint:{'raster-opacity':.85}});
  }
  function setMapStyle(name){state.style=name;document.querySelectorAll('#styleStreet,#styleSatellite').forEach(b=>b.classList.remove('selected'));$(name==='dark'?'styleStreet':'styleSatellite').classList.add('selected');if(state.map)state.map.setStyle(mapStyles[name]);message(name==='dark'?'Cartografía CARTO / OpenStreetMap':'Satélite Esri · imágenes de terceros')}
  function initMap(){
    if(typeof maplibregl==='undefined'){$('mapUnavailable').classList.remove('hidden');sourceStatus('backend','error');return}
    try{
      state.map=new maplibregl.Map({container:'map',style:mapStyles.dark,center:state.center,zoom:state.zoom,pitch:0,maxZoom:18,attributionControl:true});
      state.map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-left');
      state.map.on('load',()=>{state.mapReady=true;message('Mapa CARTO / OSM · conectado a teselas públicas');drawMarkers();redrawLines();syncTraffic()});
      state.map.on('style.load',()=>{redrawLines();syncTraffic()});
      state.map.on('click',e=>handlePointSelection([e.lngLat.lng,e.lngLat.lat]));
      state.map.on('dragstart',()=>{dismissPoint();setImmersiveMap(true)});
      state.map.on('dragend',()=>{setImmersiveMap(false)});
      state.map.on('moveend',()=>{const c=getCenter();state.center=c;setText('areaCoords',`${c[1].toFixed(3)}°, ${c[0].toFixed(3)}°`)});
      let tileErrorCount=0;
      state.map.on('error',e=>{if(!e?.error)return;if(++tileErrorCount<=2)message('El proveedor del mapa ha notificado un error de tesela. Puedes alternar a satélite.')});
      setTimeout(()=>{if(!state.mapReady){message('El mapa está tardando en responder · comprueba las teselas')}},10000);
    }catch(e){$('mapUnavailable').classList.remove('hidden');message('Error al inicializar MapLibre: '+e.message)}
  }
  function setPick(mode){state.pick=mode;$('pickBanner').classList.toggle('hidden',!mode);$('pickBanner').textContent=mode===null?'':`Haz clic en el mapa para elegir ${mode==='origin'?'INICIO (Punto 1)':'DESTINO (Punto 2)'} · ESC para cancelar`;
    if(state.map?.getCanvas())state.map.getCanvas().style.cursor=mode?'crosshair':'';
  }
  function clearRouteLine(){
    if(state.map?.getLayer('next-route'))state.map.removeLayer('next-route');
    if(state.map?.getSource('next-route'))state.map.removeSource('next-route');
    state.route=null;
  }
  function setRoutePoint(target,point,label){clearRouteLine();state[target]=point;state[target+'Text']=label;drawEndpoints()}
  async function geocodeQuery(query){
    const q=query.trim();if(!q)throw Error('Introduce una ubicación');
    const match=q.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if(match){const lat=Number(match[1]),lon=Number(match[2]);if(Math.abs(lat)>90||Math.abs(lon)>180)throw Error('Coordenadas fuera de rango');return{point:[lon,lat],name:q,source:'coordinates'}}
    try{const data=await getJson('/geocode?q='+encodeURIComponent(q),10000);if(Number.isFinite(+data.lat)&&Number.isFinite(+data.lon))return{point:[+data.lon,+data.lat],name:data.display_name||q,source:'backend'}}catch(e){}
    const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),10000);
    try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,{signal:ctl.signal});if(!r.ok)throw Error('Geocodificación no disponible');const a=await r.json();if(!a.length)throw Error('Ubicación no encontrada');return{point:[+a[0].lon,+a[0].lat],name:a[0].display_name||q,source:'Nominatim'}}finally{clearTimeout(t)}
  }
  function fitLine(coords){if(!state.map||!coords?.length)return;const bounds=new maplibregl.LngLatBounds(coords[0],coords[0]);coords.forEach(p=>bounds.extend(p));state.map.fitBounds(bounds,{padding:{top:90,bottom:75,left:65,right:65},maxZoom:13,duration:900})}
  async function calculateRoute(){
    const from=$('routeFrom')?.value?.trim()||state.originText;const to=$('routeTo')?.value?.trim()||state.destinationText;
    if(!from&&!state.origin){message('Marca un inicio o escribe una dirección');return}
    if(!to&&!state.destination){message('Marca un destino o escribe una dirección');return}
    state.loadingRoute=true;drawPanel();message('Consultando geocodificación y motor de rutas…');
    try{
      const a=state.origin&&(!from||from===state.originText)?{point:state.origin,name:state.originText}:await geocodeQuery(from);
      const b=state.destination&&(!to||to===state.destinationText)?{point:state.destination,name:state.destinationText}:await geocodeQuery(to);
      setRoutePoint('origin',a.point,a.name);setRoutePoint('destination',b.point,b.name);
      let resp=null;
      try{resp=await getJson(`/route?from=${encodeURIComponent(coordsText(a.point))}&to=${encodeURIComponent(coordsText(b.point))}&mode=car`,25000)}catch(e){
        // The public routing service may be reachable even when the backend is asleep.
        const url=`https://router.project-osrm.org/route/v1/driving/${a.point.join(',')};${b.point.join(',')}?overview=full&geometries=geojson`;
        const r=await fetch(url);if(r.ok){const json=await r.json();if(json.code==='Ok'&&json.routes?.[0])resp={geometry:json.routes[0].geometry,distance_km:json.routes[0].distance/1000,duration_min:json.routes[0].duration/60,source:'OSRM public'}}
      }
      if(resp?.geometry?.coordinates?.length>1){const real=/osrm/i.test(resp.source||'');state.route={geometry:resp.geometry,real,distanceKm:resp.distance_km,durationMin:resp.duration_min,source:resp.source};message(real?'Ruta calculada con OSRM · trazado por vías':'Trayecto indicativo, no navegable · proveedor de rutas no disponible')}
      else{state.route={geometry:{type:'LineString',coordinates:[a.point,b.point]},real:false,source:'indicativa'};message('Ruta INDICATIVA: sin motor disponible, no usar para conducir')}
      redrawLines();fitLine(state.route.geometry.coordinates);
    }catch(e){message('No se pudo generar la ruta: '+e.message)}finally{state.loadingRoute=false;drawPanel()}
  }
  function loadSampleMulti(){
    if(!state.demo){message('Habilita el modo DEMO para visualizar los vehículos de muestra');return}
    state.multiRoute=demoFleet.map(f=>({...f,dest:[2.173,41.385]}));
    clearLayer('multi');state.multiRoute.forEach(f=>addMarker('multi',f.point,markerEl('◈',f.name,`${f.person} · DEMO`,'demo')));
    redrawLines();fitLine(state.multiRoute.flatMap(f=>[f.point,f.dest]));message('Multi-ruta DEMO · líneas indicativas, sin localización ni ETA real');drawPanel();
  }
  function clearMulti(){state.multiRoute=null;clearLayer('multi');if(state.map?.getLayer('next-multi'))state.map.removeLayer('next-multi');if(state.map?.getSource('next-multi'))state.map.removeSource('next-multi');drawPanel()}
  function renderActivity(){
    const items=eventsToShow(); const live=state.hasRealEvents;
    if(!items.length)return `<div class="empty-box">${state.status.incidents==='real'?'No se han recibido incidencias para esta zona.':state.demo?'No hay registros de ejemplo.':'Sin datos confirmados del servicio de incidencias.'}</div>`;
    return `<p class="panel-help">${live?'Eventos devueltos por DGT/SCT/Madrid; revisar fecha real del origen.':'Eventos ilustrativos claramente identificados · no proceden de un feed real.'}</p>`+items.slice(0,22).map((e,i)=>`<div class="feed-item"><div class="feed-icon ${e.severity==='critical'?'critical':e.severity==='warning'?'warning':''}">${e.severity==='critical'?'!':'△'}</div><div class="feed-copy"><strong>${esc(e.title||'Incidencia')} <span class="data-badge ${live?'real':'demo'}">${live?'FUENTE':'DEMO'}</span></strong><small>${esc(e.road||'')} · ${esc(e.description||'')}</small><small>Origen: ${esc(e.source||'sin especificar')}</small></div><span class="feed-time">${live?'FEED':'EJ.'}</span></div>`).join('');
  }
  function renderNavigator(){return `<p class="panel-help">Escribe direcciones reales o utiliza el mapa para marcar el inicio y el destino. La ruta solo es navegable si la calcula OSRM.</p><label class="form-label" for="routeFrom">◎ Inicio · Punto 1</label><div class="form-row"><input id="routeFrom" class="text-field" placeholder="Dirección o lat, lon" value="${esc(state.originText)}"/><button class="pick-btn" data-action="pick-origin" title="Marcar inicio en mapa">⌖</button></div><label class="form-label" for="routeTo">⚑ Destino · Punto 2</label><div class="form-row"><input id="routeTo" class="text-field" placeholder="Dirección o lat, lon" value="${esc(state.destinationText)}"/><button class="pick-btn" data-action="pick-destination" title="Marcar destino en mapa">⚑</button></div><div class="form-row" style="margin-top:9px"><button class="ghost-btn" data-action="use-location">◎ Usar mi ubicación</button><button class="ghost-btn" data-action="swap-points">⇄ Intercambiar</button></div><button class="primary-btn" data-action="route" ${state.loadingRoute?'disabled':''}>${state.loadingRoute?'Calculando…':'↗ Calcular ruta'}</button>${state.route?`<div class="route-result"><strong>${state.route.distanceKm?state.route.distanceKm.toFixed(1)+' km':'Trazado indicativo'}</strong><small>${state.route.durationMin?Math.round(state.route.durationMin)+' minutos estimados':''}</small><small>Proveedor: ${esc(state.route.source||'desconocido')}</small><span class="data-badge ${state.route.real?'real':'demo'}">${state.route.real?'RUTA OSRM REAL':'NO NAVEGABLE · INDICATIVA'}</span></div>`:''}`}
  function renderLayers(){
    const rows=[['incidents','⚠','Incidencias DGT / SCT','Marcadores geográficos o ejemplos'],['parking','P','Aparcamientos OSM','Ubicación real · ocupación desconocida'],['bikes','♧','Bicicletas','Estaciones CityBikes'],['traffic','≋','Tráfico Azure','Solo si la tesela responde'],['pmr','♿','Accesibilidad PMR','DEMO visual · sin certificación de rutas']];
    return `<p class="panel-help">Puedes superponer capas. Cada fuente mantiene su propio estado y no se declara operativa por activar un botón.</p>`+rows.map(([id,icon,title,subtitle])=>`<div class="stack-row"><span><b style="color:#7db9ff;margin-right:8px">${icon}</b><b>${title}</b><small>${subtitle} ${id==='traffic'?'<span class="state-note">('+esc(statuses[state.status.traffic]||'')+')</span>':''}</small></span><button class="toggle ${state.layers[id]?'on':''}" role="switch" aria-checked="${state.layers[id]}" aria-label="Activar ${title}" data-layer-toggle="${id}"></button></div>`).join('')+`<div class="route-result" style="font-size:11px">El satélite utiliza imágenes Esri. Los datos de parking proceden de OSM, pero <b>no conocemos sus plazas libres</b> sin una fuente de ocupación autorizada.</div>`;
  }
  function renderMulti(){return `<p class="panel-help">Prueba funcional con cinco salidas hacia un destino común. Hasta integrar GPS autorizado, las posiciones y los trayectos son ejemplos.</p><div class="route-result"><b>Destino común · Barcelona centro</b><small>41.3850, 2.1730 · Coordenadas de la demostración</small><span class="data-badge demo">MULTI-RUTA DEMO</span></div>`+demoFleet.map((f,i)=>`<div class="stack-row"><span><span style="color:${f.color};margin-right:9px">●</span><b>${esc(f.name)}</b><small>${esc(f.person)} · posición de muestra</small></span><span class="data-badge demo">DEMO</span></div>`).join('')+`<button class="primary-btn" data-action="multi">⇶ Mostrar las cinco rutas</button><button class="ghost-btn" data-action="clear-multi" style="width:100%;margin-top:8px">Borrar rutas DEMO</button>`}
  function renderSystems(){return `<p class="panel-help">Un proveedor configurado no equivale a un servicio operativo. La disponibilidad aparece solamente tras recibir una respuesta utilizable. Última consulta: ${state.lastChecked?nowText(state.lastChecked):'pendiente'}.</p>`+Object.entries(sourceTitle).map(([id,title])=>`<div class="status-row"><div><b>${title}</b><small>${id==='fleet'?'Pendiente: registro de dispositivos, consentimiento y telemetría':id==='parking'?'OpenStreetMap · geometría; no ocupación real':id==='traffic'?'Proxy Azure · prueba de imagen válida':id==='incidents'?'Parser de DGT/SCT/Madrid · respuesta del backend':id==='azure'?'Estado de configuración; cada servicio requiere verificación':'Integración preexistente del backend'}</small></div><span class="data-badge ${state.status[id]==='real'?'real':state.status[id]==='demo'?'demo':state.status[id]==='error'?'off':''}">${esc(statuses[state.status[id]]||'—')}</span></div>`).join('')+`<button class="primary-btn" data-action="refresh">↻ Revalidar fuentes para esta zona</button>`}
  function drawPanel(){
    const p=state.panel;const title={actividad:'Actividad y eventos',navegador:'Planificar ruta',capas:'Capas del mapa',multi:'Coordinación multi-ruta',sistemas:'Fuentes conectadas'};
    setText('panelTitle',title[p]||title.actividad);setText('panelSubtitle',p==='actividad'?'Datos reales o muestras identificadas':p==='navegador'?'Pick point y ruta OSRM':p==='capas'?'Fuentes independientes':p==='multi'?'Posiciones DEMO hasta conectar dispositivos':'Diagnóstico de conectividad');
    badge('panelMode',p==='actividad'?(state.hasRealEvents?'real':state.demo?'demo':'empty'):p==='multi'?'demo':p==='navegador'?(state.route?.real?'real':'demo'):'configured');
    $('panelBody').innerHTML=p==='actividad'?renderActivity():p==='navegador'?renderNavigator():p==='capas'?renderLayers():p==='multi'?renderMulti():renderSystems();
  }
  async function testAzureTile(){
    if(state.status.azure!=='configured'&&state.status.azure!=='real'){state.status.traffic='unconfigured';renderSourceSummary();drawPanel();return false}
    state.status.traffic='verifying';renderSourceSummary();drawPanel();
    const [lng,lat]=getCenter(),z=11;const x=Math.floor((lng+180)/360*2**z);const rad=lat*Math.PI/180;const y=Math.floor((1-Math.asinh(Math.tan(rad))/Math.PI)/2*2**z);
    try{const url=`${state.apiBase}/api/azure/tile/flow/${z}/${x}/${y}`;const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),11000);
      let r;try{r=await fetch(url,{signal:ctrl.signal})}finally{clearTimeout(timer)}
      const blob=r.ok?await r.blob():null;
      if(!r.ok||!blob||!blob.type.includes('image')||blob.size<25)throw Error('Tesela no válida');
      state.status.traffic='real';renderSourceSummary();return true;
    }catch(e){state.status.traffic='error';state.layers.traffic=false;renderSourceSummary();message('Tráfico Azure no disponible · capa desactivada');drawPanel();return false}
  }
  async function toggleLayer(layer){
    state.layers[layer]=!state.layers[layer];
    if(layer==='traffic'&&state.layers.traffic){const ok=await testAzureTile();if(ok)syncTraffic()}
    else if(layer==='traffic')syncTraffic();
    else {drawMarkers()}
    if(state.layers.parking&&state.status.parking!=='real'&&layer==='parking')message('Parking: sin fuente verificada. No se muestra disponibilidad inventada.');
    if(layer==='pmr'&&state.layers.pmr)message('Capa PMR DEMO. No representa rutas accesibles certificadas.');
    drawPanel();
  }
  async function refreshAll(atPoint=null){
    const [lon,lat]=Array.isArray(atPoint)?atPoint:getCenter();
    message('Consultando fuentes públicas…');
    state.status.backend='loading';state.status.incidents='loading';state.status.parking='loading';state.status.bikes='loading';state.status.azure='loading';renderSourceSummary();
    // Parallel requests; one failing provider never blocks others.
    const results=await Promise.allSettled([
      getJson(`/events?city=${encodeURIComponent(state.opsCity||'barcelona')}&lat=${lat}&lon=${lon}&radius_km=35`,28000),
      getJson(`/parking?lat=${lat}&lon=${lon}&radius=2500`,18000),
      getJson(`/mobility/stations?lat=${lat}&lon=${lon}&radius_km=4&country=ES`,18000),
      getJson('/azure/status',12000),
    ]);
    if(results.some(r=>r.status==='fulfilled'))state.status.backend='real';else state.status.backend='error';
    if(results[0].status==='fulfilled'&&Array.isArray(results[0].value.features)){
      const e=results[0].value;const good=Object.values(e.sources||{}).some(x=>x==='OK');
      if(good){state.events=e.features.filter(f=>Number.isFinite(+f.lat)&&Number.isFinite(+f.lon));state.status.incidents='real';state.hasRealEvents=true}
      else{state.events=[];state.status.incidents='error';state.hasRealEvents=false}
    }else{state.events=[];state.status.incidents='error';state.hasRealEvents=false}
    if(results[1].status==='fulfilled'&&results[1].value.status==='OK'&&Array.isArray(results[1].value.features)){
      // Never consume available_estimate from the legacy endpoint: it is pseudorandom.
      state.parking=results[1].value.features.map(({available_estimate, ...rest})=>rest);state.status.parking='real';
    }else{state.parking=[];state.status.parking='error'}
    if(results[2].status==='fulfilled'&&Array.isArray(results[2].value.stations)){state.bikes=results[2].value.stations;state.status.bikes='real'}else{state.bikes=[];state.status.bikes='error'}
    if(results[3].status==='fulfilled'){state.status.azure=results[3].value.enabled?'configured':'unconfigured';if(!results[3].value.enabled)state.status.traffic='unconfigured'}else{state.status.azure='error';state.status.traffic='unconfigured'}
    if(state.layers.traffic){if(await testAzureTile())syncTraffic();else syncTraffic()}
    state.lastChecked=new Date();
    drawMarkers();drawKpis();renderSourceSummary();drawPanel();
    const real=Object.values(state.status).filter(x=>x==='real').length;
    message(`Consulta terminada · ${real} fuentes/servicios con respuesta verificable · ${state.hasRealEvents?'Incidencias FEED':'Incidencias sin feed válido'} · ${nowText(new Date())}`);
  }
  async function locate(){
    if(!navigator.geolocation){message('Geolocalización no disponible en este navegador');return}
    message('Solicitando permiso de geolocalización…');
    navigator.geolocation.getCurrentPosition(pos=>{
      const p=[pos.coords.longitude,pos.coords.latitude];state.map?.flyTo({center:p,zoom:13});setRoutePoint('origin',p,'Mi ubicación · GPS navegador');openView('navegador');message('Punto 1 marcado según GPS del dispositivo');
    },err=>message('No fue posible obtener la ubicación: '+err.message),{enableHighAccuracy:false,timeout:12000,maximumAge:15000});
  }
  function enableOrbDrag(){
    const core=$('orbCore');const wrap=$('orbeWrap');const stage=$('map').parentElement;
    let down=null;let suppressClick=false;
    core.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;
      down={x:e.clientX,y:e.clientY,left:wrap.offsetLeft,top:wrap.offsetTop,moved:false};
      core.setPointerCapture?.(e.pointerId);
    });
    core.addEventListener('pointermove',e=>{
      if(!down)return;
      const dx=e.clientX-down.x,dy=e.clientY-down.y;
      if(!down.moved&&Math.hypot(dx,dy)<7)return;
      down.moved=true;
      const rect=stage.getBoundingClientRect();
      // Keep the center of the draggable orb within the map canvas.
      const x=Math.max(38,Math.min(rect.width-38,down.left+dx));
      const y=Math.max(38,Math.min(rect.height-38,down.top+dy));
      wrap.style.left=x+'px';wrap.style.top=y+'px';
    });
    function endDrag(){if(down?.moved)suppressClick=true;down=null}
    core.addEventListener('pointerup',endDrag);
    core.addEventListener('pointercancel',endDrag);
    core.addEventListener('click',e=>{
      if(suppressClick){suppressClick=false;e.stopImmediatePropagation();e.preventDefault()}
    },true);
  }
  function wireEvents(){
    document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>openView(el.dataset.view)));
    document.querySelectorAll('[data-layer]').forEach(el=>el.addEventListener('click',async()=>{await toggleLayer(el.dataset.layer);openView('capas')}));
    $('refreshBtn').onclick=refreshAll;$('locateBtn').onclick=locate;$('panelRefresh').onclick=refreshAll;
    $('styleStreet').onclick=()=>setMapStyle('dark');$('styleSatellite').onclick=()=>setMapStyle('satellite');
    $('pickHelp').onclick=()=>{openView('navegador');setPick(state.origin?'destination':'origin')};
    $('mapFullscreen').onclick=()=>{const e=$('map').parentElement;if(!document.fullscreenElement)e.requestFullscreen?.().then(()=>state.map?.resize());else document.exitFullscreen?.()};
    document.addEventListener('fullscreenchange',()=>setTimeout(()=>state.map?.resize(),150));
    $('orbeOrbit').addEventListener('mousedown',e=>e.stopPropagation());
    const core=$('orbCore');let singleTimer=null;
    core.addEventListener('click',()=>{
      clearTimeout(singleTimer);
      singleTimer=setTimeout(()=>{
        if(state.orbMini){state.orbMini=false;state.orbExpanded=true;}
        else state.orbExpanded=!state.orbExpanded;
        syncOrbState();
      },260);
    });
    core.addEventListener('dblclick',e=>{
      clearTimeout(singleTimer);e.preventDefault();e.stopPropagation();
      state.orbMini=!state.orbMini;state.orbExpanded=!state.orbMini;syncOrbState();
      message(state.orbMini?'Orbe minimizado · clic para restaurar':'Orbe restaurado');
    });
    enableOrbDrag();
    document.querySelectorAll('.right-tabs button').forEach(b=>b.onclick=()=>{state.panel=b.dataset.panel;document.querySelectorAll('.right-tabs button').forEach(x=>x.classList.toggle('active',x===b));drawPanel()});
    $('panelBody').addEventListener('click',async e=>{
      const button=e.target.closest('[data-action],[data-layer-toggle]');if(!button)return;
      if(button.dataset.layerToggle){await toggleLayer(button.dataset.layerToggle);return}
      const action=button.dataset.action;
      if(action==='pick-origin')setPick('origin');
      else if(action==='pick-destination')setPick('destination');
      else if(action==='use-location')locate();
      else if(action==='swap-points'){clearRouteLine();const a=state.origin,b=state.destination,at=state.originText,bt=state.destinationText;state.origin=b;state.destination=a;state.originText=bt;state.destinationText=at;drawEndpoints();drawPanel()}
      else if(action==='route')calculateRoute();
      else if(action==='multi')loadSampleMulti();
      else if(action==='clear-multi')clearMulti();
      else if(action==='refresh')refreshAll();
    });
    $('searchPlace').onclick=async()=>{const q=$('globalSearch').value.trim();if(!q)return;message('Buscando '+q);try{const a=await geocodeQuery(q);state.map?.flyTo({center:a.point,zoom:12.5});setText('areaName',a.name.split(',').slice(0,2).join(','));message('Ubicación: '+a.name)}catch(e){message('Búsqueda: '+e.message)}};
    $('globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter')$('searchPlace').click()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){setPick(null);dismissPoint();setImmersiveMap(false)}});
    $('settingsBtn').onclick=()=>{$('apiBaseInput').value=state.apiBase;$('allowDemo').checked=state.demo;$('settingsModal').classList.remove('hidden')};
    $('closeSettings').onclick=()=>{$('settingsModal').classList.add('hidden')};
    $('settingsModal').addEventListener('click',e=>{if(e.target.id==='settingsModal')$('closeSettings').click()});
    $('saveSettings').onclick=()=>{const v=$('apiBaseInput').value.trim().replace(/\/$/,'');if(!/^https?:\/\//.test(v)){alert('Introduce una URL pública HTTP(S) válida');return}state.apiBase=v;state.demo=$('allowDemo').checked;if(!state.demo)clearMulti();localStorage.setItem('orbeosNextApi',v);localStorage.setItem('orbeosNextDemo',String(state.demo));$('settingsModal').classList.add('hidden');refreshAll()};
  }
  window.ORBEOS_OPS_BRIDGE={focus:(id,lon,lat,name)=>{state.opsCity=id;state.map?.flyTo({center:[lon,lat],zoom:12,duration:700});state.center=[lon,lat];setText('areaName',name);void refreshAll([lon,lat]);},openView,locate,setPick,calculateRoute,setMapStyle,toggleLayer,refresh:()=>refreshAll(),getMap:()=>state.map,getApi:()=>state.apiBase};
  function start(){refreshClock();setInterval(refreshClock,30000);renderOrb();drawKpis();renderSourceSummary();drawPanel();wireEvents();initMap();refreshAll()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();