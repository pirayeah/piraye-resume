document.getElementById('year').textContent = new Date().getFullYear();

(() => {
  const endpoint = window.RESUME_TRACKING_ENDPOINT;

  if (!endpoint || endpoint.includes('YOUR_N8N')) return;

  const params = new URLSearchParams(window.location.search);

  const getSessionId = () => {
    const key = 'resume_session_id';
    let id = sessionStorage.getItem(key);

    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem(key, id);
    }

    return id;
  };

  const buildEvent = (eventName) => ({
    event: eventName,
    timestamp: new Date().toISOString(),
    page: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer || 'direct',
    source: params.get('utm_source') || 'direct',
    medium: params.get('utm_medium') || 'none',
    campaign: params.get('utm_campaign') || 'none',
    language: navigator.language,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    session_id: getSessionId()
  });

  const sendEvent = (eventName) => {
    const body = new URLSearchParams(buildEvent(eventName));

    if (navigator.sendBeacon?.(endpoint, body)) return;

    fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body
    }).catch(() => {});
  };

  sendEvent('resume_page_view');

  document.querySelectorAll('[data-track-event]').forEach((element) => {
    element.addEventListener('click', () => sendEvent(element.dataset.trackEvent));
  });
})();
