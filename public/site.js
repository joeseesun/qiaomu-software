async function copy(text, button) {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = '已复制';
  } catch {
    button.textContent = '请手动复制';
  }
  setTimeout(() => { button.textContent = original; }, 1600);
}
for (const button of document.querySelectorAll('button[data-copy]')) {
  button.addEventListener('click', () => copy(document.getElementById(button.dataset.copy).textContent, button));
}
for (const button of document.querySelectorAll('button[data-copy-url]')) {
  button.addEventListener('click', () => copy(location.href, button));
}
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
