(function(){
  window.abrirModal=function(){ window.location.href='client-area.html'; };
  document.addEventListener('DOMContentLoaded',function(){
    var menu=document.querySelector('.menu-hamb');
    var nav=document.querySelector('.nav');
    if(menu&&nav) menu.addEventListener('click',function(){nav.classList.toggle('activo-mobile');});
    document.querySelectorAll('form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();});});
  });
})();