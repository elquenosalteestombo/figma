// Password show/hide toggle for inputs with .password-toggle wrapper
(function(){
  function toggleFor(container){
    const input = container.querySelector('input[type="password"], input[type="text"]');
    const btn = container.querySelector('.toggle-password');
    if(!input || !btn) return;

    function setHidden(hidden){
      if(hidden){
        input.type = 'password';
        btn.setAttribute('aria-label','Mostrar contraseña');
        btn.title = 'Mostrar contraseña';
        // set eye icon (default)
        btn.innerHTML = `\n          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#333" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>\n            <circle cx="12" cy="12" r="3" stroke="#333" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>\n          </svg>`;
      } else {
        input.type = 'text';
        btn.setAttribute('aria-label','Ocultar contraseña');
        btn.title = 'Ocultar contraseña';
        // set eye-off icon
        btn.innerHTML = `\n          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6 0-10-7-10-7a22.8 22.8 0 0 1 5.61-5.94" stroke="#333" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>\n            <path d="M1 1l22 22" stroke="#333" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>\n          </svg>`;
      }
    }

    // initialize with hidden
    setHidden(true);

    btn.addEventListener('click', function(e){
      e.preventDefault();
      const isHidden = input.type === 'password';
      setHidden(!isHidden);
      // keep focus on input
      input.focus();
    });

    // allow toggle via keyboard (Enter/Space)
    btn.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        btn.click();
      }
    });
  }

  // Attach to all password-toggle containers on DOMContentLoaded
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      document.querySelectorAll('.password-toggle').forEach(toggleFor);
    });
  } else {
    document.querySelectorAll('.password-toggle').forEach(toggleFor);
  }
})();
