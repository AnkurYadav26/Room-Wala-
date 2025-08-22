// dropdown toggle shared
(function(){
  const btn = document.getElementById('profileBtn');
  const dd = document.getElementById('dropdown');
  if (btn && dd){
    btn.addEventListener('click', ()=> dd.classList.toggle('show'));
    window.addEventListener('click', (e)=>{
      if (!e.target.closest('.profile')) dd.classList.remove('show');
    });
  }
})();
