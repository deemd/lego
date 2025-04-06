document.addEventListener('DOMContentLoaded', function() {
  const toggleTheme = document.getElementById('toggle-theme');
  const body = document.body;
  const themeIcon = document.querySelector('.theme-icon');
  
  function initTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'true' || (!savedTheme && systemDark)) {
      body.classList.add('dark-mode');
      toggleTheme.checked = true;
      themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
  }

  toggleTheme.addEventListener('change', function() {
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', this.checked);
    
    if (body.classList.contains('dark-mode')) {
      themeIcon.classList.replace('fa-sun', 'fa-moon');
    } else {
      themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
  });

  const maxPriceSlider = document.getElementById('max-price');
  const maxPriceValue = document.getElementById('max-price-value');

  if (maxPriceSlider && maxPriceValue) {
    maxPriceSlider.addEventListener('input', function() {
      maxPriceValue.textContent = `€${this.value}`;
      localStorage.setItem("maxPrice", this.value);
    });
  }

  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.heart-btn');
    if (!btn) return;
  
    const icon = btn.querySelector('i');
    btn.classList.toggle('active');
    icon.classList.toggle('fas');
    icon.classList.toggle('far');
    icon.style.color = btn.classList.contains('active') ? 'red' : '#3A7BD5';
  
    const dealId = btn.dataset.id;
    console.log("❤️ Click sur le coeur :", dealId);
  
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites.includes(dealId)) {
      favorites = favorites.filter(id => id !== dealId);
    } else {
      favorites.push(dealId);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
  });
  

  initTheme();
});
  