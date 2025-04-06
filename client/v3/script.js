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

  document.querySelectorAll('.heart-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const icon = this.querySelector('i');
      this.classList.toggle('active');
      icon.classList.toggle('fas');
      icon.classList.toggle('far');
      icon.style.color = this.classList.contains('active') ? 'red' : '#3A7BD5';
    });
  });

  initTheme();
});
  