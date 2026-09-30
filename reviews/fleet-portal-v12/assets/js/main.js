(function(){
  const header = document.getElementById('siteHeader');
  const nav = document.getElementById('mainNav');
  const menu = document.getElementById('menuBtn');
  const glow = document.querySelector('.cursor-glow');
  const fmtEUR = new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0});
  const fmtNum = new Intl.NumberFormat('es-ES',{maximumFractionDigits:0});

  function updateHeader(){
    if(!header) return;
    header.classList.toggle('scrolled', window.scrollY > 20);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive:true});

  if(menu && nav){
    menu.addEventListener('click',()=>nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
  }

  if(glow && window.matchMedia('(pointer:fine)').matches){
    window.addEventListener('pointermove', e=>{
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, {passive:true});
  }

  const io = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.14});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  const fleet = document.getElementById('fleet');
  const incident = document.getElementById('incident');
  const hour = document.getElementById('hour');
  const delay = document.getElementById('delay');

  function n(el){ return parseFloat(el && el.value || '0') || 0; }
  function calc(){
    if(!fleet) return;
    const f = n(fleet);
    const r = n(incident) / 100;
    const h = n(hour);
    const d = n(delay);
    const events = f * r;
    const current = events * h * d + events * 62 + events * 120;
    const connected = current * .52;
    const saving = Math.max(0, current - connected);
    document.getElementById('fleetOut').textContent = fmtNum.format(f);
    document.getElementById('incidentOut').textContent = Math.round(r*100) + '%';
    document.getElementById('hourOut').textContent = fmtEUR.format(h).replace(',00','');
    document.getElementById('delayOut').textContent = d.toLocaleString('es-ES',{maximumFractionDigits:1}) + ' h';
    document.getElementById('savingOut').textContent = fmtEUR.format(saving);
    document.getElementById('eventsOut').textContent = fmtNum.format(events);
    let payback = '8-14 meses';
    if(saving > 850000) payback = '4-8 meses';
    if(saving < 90000) payback = '12-18 meses';
    document.getElementById('paybackOut').textContent = payback;
  }
  [fleet,incident,hour,delay].forEach(el=>el && el.addEventListener('input', calc));
  calc();

  const form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', event=>{
      event.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const company = document.getElementById('contactCompany').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();
      const subject = encodeURIComponent('Solicitud Momentum Systems — ' + company);
      const body = encodeURIComponent([
        'Nombre: ' + name,
        'Empresa: ' + company,
        'Email: ' + email,
        '',
        'Mensaje:',
        message || 'Quiero evaluar Instaflash V16 Operativa y el gateway operativo para movilidad conectada.'
      ].join('\n'));
      const status = document.getElementById('contactStatus');
      status.textContent = 'Se ha preparado el email de solicitud en su cliente de correo.';
      window.location.href = 'mailto:info@momentumsystems.es?subject=' + subject + '&body=' + body;
    });
  }
})();