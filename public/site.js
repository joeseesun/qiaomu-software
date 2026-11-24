async function copy(text, button) {
  if (button.dataset.busy) return;
  button.dataset.busy = '1';
  const original = button.innerHTML;
  const width = button.offsetWidth;
  button.style.minWidth = width + 'px';
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = '已复制';
  } catch {
    button.textContent = '请手动复制';
  }
  setTimeout(() => {
    button.innerHTML = original;
    button.style.minWidth = '';
    delete button.dataset.busy;
  }, 1600);
}
for (const button of document.querySelectorAll('button[data-copy]')) {
  button.addEventListener('click', () => copy(document.getElementById(button.dataset.copy).textContent, button));
}
for (const button of document.querySelectorAll('button[data-copy-url]')) {
  button.addEventListener('click', () => copy(location.href, button));
}
const headerSearch = document.getElementById('header-q');
document.addEventListener('keydown', event => {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || !headerSearch) return;
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
  if (document.querySelector('dialog[open]')) return;
  event.preventDefault();
  const pageSearch = document.querySelector('main input[type="search"]');
  const field = pageSearch && pageSearch.offsetParent !== null ? pageSearch : headerSearch;
  field.focus();
  field.select();
});

for (const form of document.querySelectorAll('form[data-report]')) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('output');
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      const response = await fetch(form.dataset.report, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({ reason: new FormData(form).get('reason') }),
      });
      if (!response.ok) throw Error((await response.json()).error);
      form.reset();
      status.textContent = '已收到反馈。';
    } catch (error) {
      status.textContent = error.message || '暂时无法提交。';
    } finally { button.disabled = false; }
  });
}

for (const button of document.querySelectorAll('[data-dialog]')) {
  const dialog = document.getElementById(button.dataset.dialog);
  button.addEventListener('click', () => dialog.showModal());
  if (!('closedBy' in dialog)) {
    const outside = (event) => {
      const frame = dialog.getBoundingClientRect();
      return event.clientX < frame.left || event.clientX > frame.right ||
        event.clientY < frame.top || event.clientY > frame.bottom;
    };
    let beganOutside = false;
    dialog.addEventListener('pointerdown', event => { beganOutside = outside(event); });
    dialog.addEventListener('pointerup', event => { if (beganOutside && outside(event)) dialog.close(); });
  }
}
