(() => {
  'use strict';

  const API_BASE = String(window.UNION_CONFIG?.API_BASE || '').replace(/\/$/, '');

  function getAccessToken() {
    return localStorage.getItem('union_access_token') ||
      sessionStorage.getItem('union_access_token') || '';
  }

  function collectFormData(form) {
    const data = {};
    for (const field of form.querySelectorAll('[name]')) {
      if (field.disabled) continue;
      if (field.type === 'checkbox') {
        data[field.name] = field.checked;
      } else if (field.type === 'radio') {
        if (field.checked) data[field.name] = field.value;
      } else {
        data[field.name] = String(field.value ?? '').trim();
      }
    }
    return data;
  }

  function calculateProgress(form) {
    const required = [...form.querySelectorAll('[required]')];
    if (!required.length) return 100;
    const complete = required.filter(field => {
      if (field.type === 'checkbox' || field.type === 'radio') return field.checked;
      return String(field.value || '').trim() !== '';
    }).length;
    return Math.round((complete / required.length) * 100);
  }

  function showMessage(message, kind, html) {
    if (!message) return;
    message.hidden = false;
    message.className = `form-message ${kind}`;
    message.innerHTML = html;
  }

  async function submitWhitelist(form) {
    const message = document.getElementById('whitelist-form-message');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent || 'Submit Application';

    if (!form.checkValidity()) {
      form.reportValidity();
      showMessage(message, 'error', '<strong>Please complete every required field before submitting your application.</strong>');
      return;
    }

    if (!API_BASE) {
      showMessage(message, 'error', '<strong>The website API address is missing.</strong> Please contact management.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      showMessage(message, 'error', '<strong>Your Discord login session is missing or expired.</strong> Please log out and log back in.');
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
    }
    if (message) message.hidden = true;

    try {
      const response = await fetch(`${API_BASE}/api/applications/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          application_type: 'Whitelist Application',
          progress: calculateProgress(form),
          data: collectFormData(form)
        })
      });

      const result = await response.json().catch(() => ({
        success: false,
        error: `The server returned an invalid response (${response.status}).`
      }));

      if (!response.ok || result.success === false) {
        throw new Error(result.error || `Application submission failed (${response.status}).`);
      }

      const application = result.application || {};
      const reference = application.reference || application.application_id || application.id || '';
      const referenceLine = reference ? `<br><strong>Reference:</strong> ${String(reference)}` : '';

      showMessage(
        message,
        'success',
        `<strong>Your application has been submitted successfully.</strong>${referenceLine}<br>It is now available in your Player Portal and the Staff Panel.`
      );

      form.dataset.submitted = 'true';
      form.querySelectorAll('input, textarea, select').forEach(field => { field.disabled = true; });
      if (submitButton) submitButton.textContent = 'Application Submitted';
      window.scrollTo({ top: form.offsetTop - 120, behavior: 'smooth' });
    } catch (error) {
      console.error('Whitelist submission failed:', error);
      showMessage(
        message,
        'error',
        `<strong>Your application was not submitted.</strong><br>${String(error?.message || error)}`
      );
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  }

  // Capture the event before the old demo handler in main.js can show a fake success message.
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== 'whitelist-form') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    submitWhitelist(form);
  }, true);
})();
