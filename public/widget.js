(() => {
  const script = document.currentScript || document.querySelector('script[data-bot-id]')
  const botId = script?.dataset.botId
  if (!botId || document.querySelector(`[data-neurova-widget="${botId}"]`)) return

  const baseUrl = new URL(script.src, window.location.href).origin
  const root = document.createElement('div')
  root.dataset.neurovaWidget = botId
  root.innerHTML = `
    <style>
      [data-neurova-widget] { --nv: #987fff; font-family: Inter, Arial, sans-serif; position: fixed; z-index: 2147483000; right: 22px; bottom: 22px; color: #f6f4ff; }
      .nv-trigger { width: 56px; height: 56px; float: right; border: 0; border-radius: 18px; color: white; background: radial-gradient(circle at 30% 20%, #d0c7ff, #9576ff 43%, #6348d2); box-shadow: 0 16px 38px rgba(80,57,179,.43); cursor: pointer; font-size: 24px; transition: transform .2s; }
      .nv-trigger:hover { transform: translateY(-3px) scale(1.03); }.nv-panel { width: min(360px, calc(100vw - 32px)); height: 470px; display: none; flex-direction: column; overflow: hidden; margin-bottom: 13px; border: 1px solid rgba(184,170,255,.37); border-radius: 17px; background: #17152a; box-shadow: 0 25px 75px rgba(15,10,35,.43); }.nv-panel.nv-open { display: flex; }.nv-head { display: flex; align-items: center; gap: 10px; padding: 15px; border-bottom: 1px solid rgba(210,202,255,.12); background: linear-gradient(130deg, #30245d, #19182e); }.nv-logo { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: rgba(225,219,255,.17); color: #e9e4ff; font-family: Georgia, serif; font-weight: bold; }.nv-title { display: grid; gap: 2px; }.nv-title b { font-size: 12px; }.nv-title small { color: #aaa2c0; font-size: 9px; }.nv-title small i { display: inline-block; width: 5px; height: 5px; margin-right: 3px; border-radius: 50%; background: #66e3a7; }.nv-close { margin-left: auto; border: 0; background: transparent; color: #c3bbdb; font-size: 21px; cursor: pointer; }.nv-messages { flex: 1; overflow-y: auto; padding: 15px; background: radial-gradient(circle at 100% 0%, rgba(123,97,244,.13), transparent 42%), #12111f; }.nv-message { max-width: 85%; margin: 8px 0; padding: 10px; border-radius: 5px 11px 11px; background: rgba(140,118,244,.17); color: #e8e3f4; font-size: 12px; line-height: 1.55; }.nv-message.user { margin-left: auto; border-radius: 11px 5px 11px 11px; background: #36304f; }.nv-form { display: flex; gap: 7px; padding: 10px; border-top: 1px solid rgba(210,202,255,.10); background: #17152a; }.nv-form input { min-width: 0; flex: 1; padding: 10px; border: 1px solid rgba(203,193,255,.16); border-radius: 8px; outline: 0; color: #eeeaff; background: rgba(255,255,255,.04); font-size: 11px; }.nv-form button { width: 37px; border: 0; border-radius: 8px; color: white; background: #9379f7; cursor: pointer; font-size: 18px; }
    </style>
    <div class="nv-panel"><div class="nv-head"><span class="nv-logo">N</span><span class="nv-title"><b>AI-ассистент</b><small><i></i>Сейчас в сети</small></span><button class="nv-close" aria-label="Закрыть">×</button></div><div class="nv-messages"></div><form class="nv-form"><input placeholder="Напишите сообщение…" /><button aria-label="Отправить">↑</button></form></div>
    <button class="nv-trigger" aria-label="Открыть чат">✦</button>`
  document.body.appendChild(root)

  const panel = root.querySelector('.nv-panel')
  const messages = root.querySelector('.nv-messages')
  const title = root.querySelector('.nv-title b')
  const add = (text, role = 'bot') => { const item = document.createElement('div'); item.className = `nv-message ${role}`; item.textContent = text; messages.appendChild(item); messages.scrollTop = messages.scrollHeight; return item }
  const toggle = () => panel.classList.toggle('nv-open')
  root.querySelector('.nv-trigger').addEventListener('click', toggle)
  root.querySelector('.nv-close').addEventListener('click', toggle)

  fetch(`${baseUrl}/api/public/bots/${botId}`).then((response) => response.ok ? response.json() : Promise.reject()).then(({ bot }) => {
    title.textContent = bot.name
    add(`Здравствуйте! Я ${bot.name}. Чем могу помочь?`)
  }).catch(() => add('Не удалось подключиться к AI-ассистенту.'))

  root.querySelector('.nv-form').addEventListener('submit', async (event) => {
    event.preventDefault()
    const input = root.querySelector('.nv-form input')
    const question = input.value.trim()
    if (!question) return
    input.value = ''
    add(question, 'user')
    const waiting = add('Печатаю…')
    try {
      const response = await fetch(`${baseUrl}/api/public/bots/${botId}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question }) })
      const data = await response.json()
      waiting.remove()
      add(response.ok ? data.answer : (data.error || 'Не удалось получить ответ.'))
    } catch { waiting.remove(); add('Сервис временно недоступен. Попробуйте позже.') }
  })
})()
