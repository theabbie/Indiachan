document.addEventListener('DOMContentLoaded', function() {
  const siteKey = document.querySelector('script[src*="recaptcha"]')?.src.match(/render=([^&]+)/)?.[1];
  if (!siteKey) return;

  const forms = document.querySelectorAll('form.form-post');
  forms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      const captchaInput = form.querySelector('#captcha-token');
      if (captchaInput && !captchaInput.value) {
        e.preventDefault();
        try {
          const token = await grecaptcha.execute(siteKey, { action: 'submit' });
          captchaInput.value = token;
          form.submit();
        } catch (err) {
          console.error('reCAPTCHA error:', err);
        }
      }
    });
  });
});
