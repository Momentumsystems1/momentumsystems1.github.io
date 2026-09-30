(function(){
  const fmtEUR = new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0});
  const fmtNum = new Intl.NumberFormat('es-ES',{maximumFractionDigits:0});
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const now = new Date();
  const today = document.getElementById('todayLabel');
  if(today){
    today.textContent = days[now.getDay()] + ' ' + now.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'});
  }

  try{
    const auth = JSON.parse(localStorage.getItem('momentumPortalAuth') || '{}');
    const client = auth.company || auth.name || 'Nombre cliente';
    document.getElementById('topClientName').textContent = client;
  }catch(e){}

  function n(id){ return parseFloat(document.getElementById(id)?.value || '0') || 0; }
  function set(id, value){ const el = document.getElementById(id); if(el) el.textContent = value; }

  function calcOperational(){
    const kwh = n('kwh');
    const energy = n('energy');
    const eff = n('eff');
    const maint = n('maint');
    const monthlyCost = kwh * energy;
    const energySaving = monthlyCost * 12 * (eff/100);
    const maintenanceSaving = monthlyCost * 12 * .32 * (maint/100);
    const saving = energySaving + maintenanceSaving;
    set('kwhOut', fmtNum.format(kwh));
    set('energyOut', energy.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}));
    set('effOut', Math.round(eff) + ' %');
    set('maintOut', Math.round(maint) + ' %');
    set('annualSaving', fmtEUR.format(saving));
    set('benefitOut', fmtNum.format(saving));
    const benefit = document.getElementById('benefit');
    if(benefit) benefit.value = Math.min(Number(benefit.max), Math.max(Number(benefit.min), Math.round(saving/500)*500));
    set('effNote', Math.round(eff) + '%');
    calcRoi();
  }

  function calcRoi(){
    const investment = n('investment');
    const life = n('life');
    const benefit = n('benefit');
    const discount = n('discount');
    let npv = 0;
    for(let y=1;y<=life;y++) npv += benefit / Math.pow(1 + discount/100, y);
    const roi = investment > 0 ? ((npv - investment) / investment) * 100 : 0;
    const payback = benefit > 0 ? investment / benefit : 0;
    set('investmentOut', fmtNum.format(investment));
    set('lifeOut', fmtNum.format(life));
    set('benefitOut', fmtNum.format(benefit));
    set('discountOut', Math.round(discount) + ' %');
    set('roiOut', Math.round(roi) + '%');
    set('paybackOut', payback.toLocaleString('es-ES',{maximumFractionDigits:1}) + ' años');
  }

  ['kwh','energy','eff','maint'].forEach(id=>document.getElementById(id)?.addEventListener('input', calcOperational));
  ['investment','life','benefit','discount'].forEach(id=>document.getElementById(id)?.addEventListener('input', calcRoi));
  calcOperational();

  document.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      btn.animate([{transform:'scale(1)'},{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:180,easing:'ease-out'});
    });
  });
})();