
(function(){
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const state={requests:[],company:'Cliente Demo'};
  const toast=(msg)=>{const el=qs('#msToast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3800)};
  const showView=(key)=>{qsa('.ms-view').forEach(v=>v.classList.toggle('active',v.dataset.viewPanel===key));qsa('[data-view]').forEach(a=>a.classList.toggle('active',a.dataset.view===key));window.scrollTo({top:0,behavior:'smooth'});history.replaceState(null,'','#'+key)};
  document.addEventListener('click',e=>{const a=e.target.closest('[data-view]');if(a){e.preventDefault();showView(a.dataset.view)}});
  const initial=(location.hash||'#overview').slice(1);if(qs('[data-view-panel="'+initial+'"]'))showView(initial);

  qsa('.ms-channel').forEach(btn=>btn.addEventListener('click',()=>{qsa('.ms-channel').forEach(x=>x.classList.remove('active'));btn.classList.add('active');qs('#chatTitle').textContent=btn.dataset.channel;}));
  qs('#sendMessage')?.addEventListener('click',()=>{const ta=qs('#messageDraft');const body=ta.value.trim();if(!body)return;const wrap=document.createElement('div');wrap.className='ms-msg mine';wrap.innerHTML='<div class="ms-bubble"><b>Usted</b><br>'+body.replace(/[<>]/g,'')+'<small>just now</small></div>';qs('#messagesArea').appendChild(wrap);ta.value='';qs('#messagesArea').scrollTop=qs('#messagesArea').scrollHeight});

  const updateRequests=()=>{qs('#requestCount').textContent=state.requests.length;qs('#pendingLabel').textContent=state.requests.length+' open';const box=qs('#pendingRequests');if(!box)return;if(!state.requests.length){box.innerHTML='<div class="ms-empty"><i class="bi bi-inbox fs-2 d-block mb-2"></i>No pending requests.</div>';return;}box.innerHTML=state.requests.map(r=>'<div class="ms-doc-row"><div class="ms-file-icon"><i class="bi bi-hourglass-split"></i></div><div><h3>'+r.title+'</h3><p>Requested now · controlled disclosure</p></div><span class="ms-status yellow">processing</span><span></span></div>').join('')};
  qsa('.resource-request').forEach(btn=>btn.addEventListener('click',()=>{const title=btn.dataset.title;if(state.requests.some(x=>x.title===title))return;state.requests.push({title});btn.disabled=true;btn.textContent='Petición en curso';updateRequests();toast('Petición en curso. Verás el documento solicitado en tu contenedor de Documentos recibidos.')}));
  qs('#resourceSearch')?.addEventListener('input',e=>{const q=e.target.value.toLowerCase();qsa('.ms-resource[data-title]').forEach(card=>card.style.display=card.textContent.toLowerCase().includes(q)?'':'none')});
  qs('#globalSearch')?.addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();if(q.length<3)return;const match=qsa('.ms-view').find(v=>v.textContent.toLowerCase().includes(q));if(match)showView(match.dataset.viewPanel)});

  const onboardData=localStorage.getItem('momentum_appdashboard_onboarding');
  const legalData=localStorage.getItem('momentum_appdashboard_legal');
  const onboardingModal=new bootstrap.Modal(qs('#onboardingModal'));
  const legalModal=new bootstrap.Modal(qs('#legalModal'));
  if(onboardData){try{const d=JSON.parse(onboardData);state.company=d.company||state.company;qs('#headerCompany').textContent=state.company;qs('#ndaCompany').textContent=state.company;if(!legalData)setTimeout(()=>legalModal.show(),250)}catch(e){setTimeout(()=>onboardingModal.show(),250)}}else{setTimeout(()=>onboardingModal.show(),250)}
  qs('#createWorkspace')?.addEventListener('click',()=>{const company=qs('#onboardingCompany').value.trim();if(!company){toast('Indica la empresa para crear el workspace.');return}const d={company,name:qs('#onboardingName').value.trim(),title:qs('#onboardingTitle').value.trim(),createdAt:new Date().toISOString()};localStorage.setItem('momentum_appdashboard_onboarding',JSON.stringify(d));state.company=company;qs('#headerCompany').textContent=company;qs('#ndaCompany').textContent=company;onboardingModal.hide();setTimeout(()=>legalModal.show(),350)});
  qs('#acceptLegal')?.addEventListener('click',()=>{if(!qs('#privacyCheck').checked||!qs('#ndaCheck').checked){toast('Debes aceptar ambas declaraciones para continuar.');return}localStorage.setItem('momentum_appdashboard_legal',JSON.stringify({company:state.company,acceptedAt:new Date().toISOString(),version:'MS-PORTAL-2026.10'}));legalModal.hide();toast('Acceso habilitado. NDA y declaración de privacidad registrados en modo demo.')});

  updateRequests();
})();
