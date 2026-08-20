import { useEffect, useRef, useState } from "react";

const agents = [
  {
    id: "support",
    icon: "✦",
    title: "Клиентский эксперт",
    label: "Поддержка 24/7",
    description:
      "Помогает клиентам, помнит контекст и отвечает в голосе вашего бренда.",
    gradient: "violet",
    prompt: "Здравствуйте! Подскажите, какой у вас график работы?",
    answer:
      "Здравствуйте! Мы на связи каждый день с 09:00 до 21:00. Если хотите, я помогу выбрать удобное время или отвечу на другой вопрос.",
  },
  {
    id: "knowledge",
    icon: "⌘",
    title: "Навигатор знаний",
    label: "PDF · База знаний",
    description:
      "Находит точный ответ в ваших документах и показывает, откуда он взят.",
    gradient: "cyan",
    prompt: "Какие документы нужны для подачи заявки?",
    answer:
      "Для подачи заявки понадобятся удостоверение личности и заполненная форма. В правилах также указано: документы принимаются до 18:00 в рабочие дни.",
  },
  {
    id: "career",
    icon: "↗",
    title: "Карьерный тренер",
    label: "HR · Обучение",
    description:
      "Проводит интервью, оценивает ответы и помогает подготовиться к новой роли.",
    gradient: "coral",
    prompt: "Начнём тренировочное интервью на frontend-разработчика.",
    answer:
      "Отлично. Представьте, что ваш интерфейс стал медленно загружаться после релиза. С чего вы начнёте диагностику и почему?",
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    caption: "Попробовать идею",
    bots: "1 AI-бот",
    messages: "30 диалогов / мес.",
  },
  {
    name: "Studio",
    price: "4 900",
    caption: "Для первого запуска",
    bots: "3 AI-бота",
    messages: "1 000 диалогов / мес.",
    featured: true,
  },
  {
    name: "Scale",
    price: "12 900",
    caption: "Для растущей команды",
    bots: "10 AI-ботов",
    messages: "10 000 диалогов / мес.",
  },
];

const energyColors = {
  violet: "#937cff",
  cyan: "#64d7ef",
  coral: "#fb978b",
  lime: "#a3df89",
};

const widgetScenes = [
  {
    id: "store",
    label: "Магазин",
    title: "Подберём технику",
    question: "Нужны наушники для работы. Что посоветуете?",
    answer: "Подберу три модели и сравню их по микрофону, автономности и цене.",
    accent: "violet",
  },
  {
    id: "course",
    label: "Онлайн-курс",
    title: "Навигатор курса",
    question: "Где найти задание второго модуля?",
    answer: "Оно откроется после урока 2.3. Я подготовил прямую ссылку.",
    accent: "cyan",
  },
  {
    id: "studio",
    label: "Студия",
    title: "Запись в студию",
    question: "Есть свободное окно в субботу?",
    answer: "Да, есть два времени. Подсказать ближайшего мастера?",
    accent: "coral",
  },
];

const solutions = [
  {
    icon: "◈",
    tag: "E-COMMERCE",
    title: "Консультант магазина",
    text: "Подбирает товар, отвечает про доставку и собирает заявку без очереди.",
    template: "support",
    prompt: "Подберите наушники для работы и звонков.",
  },
  {
    icon: "✦",
    tag: "BEAUTY",
    title: "Администратор салона",
    text: "Помогает выбрать услугу, время записи и заботливо напоминает о визите.",
    template: "support",
    prompt: "Хочу записаться на стрижку в выходные.",
  },
  {
    icon: "⌘",
    tag: "EDTECH",
    title: "Навигатор курса",
    text: "Находит ответ в программе, материалах уроков и правилах обучения.",
    template: "knowledge",
    prompt: "Где найти домашнее задание второго модуля?",
  },
  {
    icon: "↗",
    tag: "HR",
    title: "Карьерный помощник",
    text: "Проводит первое интервью и готовит кандидата к следующему этапу.",
    template: "career",
    prompt: "Помогите подготовиться к собеседованию.",
  },
  {
    icon: "◌",
    tag: "REAL ESTATE",
    title: "Гид по объектам",
    text: "Сравнивает планировки, отвечает об инфраструктуре и записывает на просмотр.",
    template: "support",
    prompt: "Нужна квартира с двумя спальнями рядом с парком.",
  },
  {
    icon: "✚",
    tag: "CLINIC",
    title: "Помощник клиники",
    text: "Объясняет подготовку к приёму и направляет к нужному специалисту.",
    template: "knowledge",
    prompt: "Как подготовиться к первому приёму?",
  },
];

const capabilities = [
  ["⌘", "База знаний", "PDF, TXT и MD превращаются в понятные ответы."],
  ["∞", "Помнит диалог", "Учитывает контекст и не заставляет повторяться."],
  ["◉", "Всегда онлайн", "Помогает клиентам, пока команда занята."],
  ["</>", "Одна строка кода", "Виджет встраивается на сайт за минуту."],
  ["⌁", "Голосовой ввод", "Пользователь может говорить, а не печатать."],
];

const faq = [
  [
    "Нужно ли уметь программировать?",
    "Нет. Роль, характер и база знаний настраиваются в конструкторе. Для сайта вы получите готовую строку виджета.",
  ],
  [
    "Какие материалы можно загрузить?",
    "PDF, TXT и MD-файлы до 5 МБ. Бот использует их как подключённую базу знаний.",
  ],
  [
    "Можно ли изменить бота после запуска?",
    "Да. Имя, стиль общения, знания и внешний вид можно обновлять в личном кабинете.",
  ],
  [
    "Как AI появляется на моём сайте?",
    "Скопируйте код виджета из кабинета и вставьте его перед закрывающим тегом body вашего сайта.",
  ],
];

const journal = [
  [
    "01",
    "Как подготовить базу знаний",
    "Какие документы помогают AI отвечать точно и не выдумывать факты.",
  ],
  [
    "02",
    "Как задать характер ассистента",
    "Короткая формула тона общения, которая делает ответы узнаваемыми.",
  ],
  [
    "03",
    "Как запустить виджет на сайте",
    "Три шага от созданного бота до первого диалога с посетителем.",
  ],
];

function AuroraCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext("2d");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame;
    let size = { width: 0, height: 0 };

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      size = { width: rect.width, height: rect.height };
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const drawRibbon = (time, index, color) => {
      const { width, height } = size;
      const baseline = height * (0.18 + index * 0.105);
      const amplitude = 54 + index * 13;
      context.beginPath();
      for (let x = -60; x <= width + 60; x += 14) {
        const y =
          baseline +
          Math.sin(x * 0.006 + time * 0.00033 + index * 1.8) * amplitude +
          Math.sin(x * 0.014 - time * 0.00018 + index) * (amplitude * 0.35);
        if (x === -60) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = color;
      context.lineWidth = 1.1 + index * 0.2;
      context.shadowBlur = 20 + index * 4;
      context.shadowColor = color;
      context.stroke();
    };
    const render = (time) => {
      context.clearRect(0, 0, size.width, size.height);
      context.globalCompositeOperation = "screen";
      drawRibbon(time, 0, "rgba(114, 108, 255, .35)");
      drawRibbon(time, 1, "rgba(73, 211, 255, .24)");
      drawRibbon(time, 2, "rgba(192, 108, 255, .24)");
      drawRibbon(time, 3, "rgba(94, 138, 255, .20)");
      context.shadowBlur = 0;
      context.globalCompositeOperation = "source-over";
      if (!media.matches) frame = requestAnimationFrame(render);
    };
    setup();
    render(0);
    window.addEventListener("resize", setup);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", setup);
    };
  }, []);

  return <canvas ref={ref} className="aurora-canvas" aria-hidden="true" />;
}

function PlasmaCursor() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext("2d");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const target = {
      x: -100,
      y: -100,
      previousX: -100,
      previousY: -100,
      hover: false,
      typing: false,
    };
    const position = { x: -100, y: -100 };
    const trail = [];
    const bursts = [];
    let frame;
    let size = { width: 0, height: 0 };
    const setup = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      size = { width: window.innerWidth, height: window.innerHeight };
      canvas.width = size.width * ratio;
      canvas.height = size.height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const move = (event) => {
      target.previousX = target.x;
      target.previousY = target.y;
      target.x = event.clientX;
      target.y = event.clientY;
      target.hover = Boolean(
        event.target?.closest?.(
          'button, a, input, select, label, [role="button"]',
        ),
      );
      target.typing = Boolean(
        event.target?.closest?.('input, textarea, [contenteditable="true"]'),
      );
    };
    const burst = () => {
      if (target.x > 0)
        bursts.push({ x: target.x, y: target.y, time: performance.now() });
    };
    const render = (time) => {
      context.clearRect(0, 0, size.width, size.height);
      if (target.typing) {
        position.x = target.x;
        position.y = target.y;
        trail.length = 0;
        bursts.length = 0;
        if (!media.matches) frame = requestAnimationFrame(render);
        return;
      }
      const speed = Math.min(
        36,
        Math.hypot(target.x - target.previousX, target.y - target.previousY),
      );
      position.x += (target.x - position.x) * 0.26;
      position.y += (target.y - position.y) * 0.26;
      trail.push({ x: position.x, y: position.y, time });
      while (trail.length > 16) trail.shift();
      context.globalCompositeOperation = "lighter";
      for (let index = 0; index < trail.length; index += 4) {
        const point = trail[index];
        const age = (index + 1) / trail.length;
        context.fillStyle = `rgba(151, 127, 255, ${age * 0.24})`;
        context.beginPath();
        context.arc(point.x, point.y, Math.max(0.7, age * 1.7), 0, Math.PI * 2);
        context.fill();
      }
      const radius = (target.hover ? 15 : 11) + Math.min(3, speed * 0.06);
      const pulse = 1 + Math.sin(time * 0.006) * 0.07;
      context.save();
      context.translate(position.x, position.y);
      const halo = context.createRadialGradient(0, 0, 1, 0, 0, radius * 3.4);
      halo.addColorStop(0, "rgba(232, 222, 255, .58)");
      halo.addColorStop(0.3, "rgba(102, 216, 255, .25)");
      halo.addColorStop(1, "rgba(106, 76, 255, 0)");
      context.fillStyle = halo;
      context.beginPath();
      context.arc(0, 0, radius * 3.4, 0, Math.PI * 2);
      context.fill();
      context.rotate(time * 0.00065);
      context.scale(pulse, pulse);
      const star = context.createLinearGradient(
        -radius,
        -radius,
        radius,
        radius,
      );
      star.addColorStop(0, "rgba(119, 241, 255, .96)");
      star.addColorStop(0.46, "rgba(245, 240, 255, 1)");
      star.addColorStop(1, "rgba(202, 116, 255, .96)");
      context.fillStyle = star;
      context.shadowBlur = 16;
      context.shadowColor = "rgba(115, 194, 255, .88)";
      context.beginPath();
      context.moveTo(0, -radius * 1.62);
      context.lineTo(radius * 0.31, -radius * 0.31);
      context.lineTo(radius * 1.62, 0);
      context.lineTo(radius * 0.31, radius * 0.31);
      context.lineTo(0, radius * 1.62);
      context.lineTo(-radius * 0.31, radius * 0.31);
      context.lineTo(-radius * 1.62, 0);
      context.lineTo(-radius * 0.31, -radius * 0.31);
      context.closePath();
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = "rgba(255,255,255,.84)";
      context.stroke();
      context.restore();
      context.save();
      context.translate(position.x, position.y);
      context.rotate(-time * 0.0012);
      context.scale(1, 0.42);
      context.beginPath();
      context.strokeStyle = "rgba(137, 196, 255, .38)";
      context.lineWidth = 0.75;
      context.arc(0, 0, radius * 2.26, 0, Math.PI * 2);
      context.stroke();
      context.restore();
      for (let index = 0; index < 3; index += 1) {
        const orbit = time * 0.0024 + index * ((Math.PI * 2) / 3);
        const distance = radius * 2.26;
        const x = position.x + Math.cos(orbit) * distance;
        const y = position.y + Math.sin(orbit) * distance * 0.42;
        context.fillStyle =
          index === 1 ? "rgba(100, 235, 255, .92)" : "rgba(225, 159, 255, .9)";
        context.shadowBlur = 10;
        context.shadowColor = context.fillStyle;
        context.beginPath();
        context.arc(x, y, index === 0 ? 1.8 : 1.25, 0, Math.PI * 2);
        context.fill();
      }
      while (bursts.length && time - bursts[0].time > 560) bursts.shift();
      bursts.forEach((item) => {
        const age = (time - item.time) / 560;
        context.beginPath();
        context.strokeStyle = `rgba(160, 138, 255, ${(1 - age) * 0.48})`;
        context.lineWidth = Math.max(0.6, 2 - age);
        context.arc(item.x, item.y, 10 + age * 46, 0, Math.PI * 2);
        context.stroke();
      });
      context.shadowBlur = 0;
      context.globalCompositeOperation = "source-over";
      if (!media.matches) frame = requestAnimationFrame(render);
    };
    setup();
    render(0);
    window.addEventListener("resize", setup);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", burst, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", setup);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", burst);
    };
  }, []);

  return <canvas ref={ref} className="plasma-cursor" aria-hidden="true" />;
}

function PublicBotPage({ botId }) {
  const [bot, setBot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    fetch(`/api/public/bots/${botId}`).then((response) => response.json()).then((data) => {
      setBot(data.bot || null);
      if (data.bot?.greeting) setMessages([{ from: "bot", text: data.bot.greeting }]);
    }).catch(() => setBot(null));
  }, [botId]);
  const send = async (event) => {
    event.preventDefault(); const text = draft.trim(); if (!text || sending) return;
    setMessages((current) => [...current, { from: "user", text }]); setDraft(""); setSending(true);
    try { const response = await fetch(`/api/public/bots/${botId}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setMessages((current) => [...current, { from: "bot", text: data.answer }]); } catch (error) { setMessages((current) => [...current, { from: "bot", text: error.message || "Не удалось получить ответ." }]); } finally { setSending(false); }
  };
  if (!bot) return <main className="public-bot-page"><PlasmaCursor /><div className="public-loading">Neurova AI загружается…</div></main>;
  return <main className={`public-bot-page avatar-theme-${bot.avatar || "crystal"}`}><PlasmaCursor /><div className="public-aurora" /><header><a href="/">✦ neurova.</a><span>POWERED BY NEUROVA</span></header><section><div className="public-copy"><span className={`avatar-mark ${bot.avatar || "crystal"}`}>✦</span><small>AI-ASSISTANT ONLINE</small><h1>{bot.name}</h1><p>{bot.tone}. Задайте вопрос — ассистент ответит на основе подключённых знаний.</p><div className="public-badges"><span>✦ Умный контекст</span><span>◌ 24/7</span></div></div><div className="public-chat"><header><span className={`avatar-mark ${bot.avatar || "crystal"}`}>✦</span><div><b>{bot.name}</b><small><i /> Сейчас онлайн</small></div></header><div className="public-messages">{messages.map((message, index) => <p key={`${index}-${message.text}`} className={message.from}>{message.text}</p>)}{sending && <p className="bot">AI думает…</p>}</div><form onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Напишите сообщение…"/><button>↑</button></form></div></section></main>;
}

function BrandMark() {
  return (
    <span className="brand-mark">
      <i />
      <i />
      <i />
    </span>
  );
}

function App() {
  const [activeAgent, setActiveAgent] = useState(agents[0]);
  const [chat, setChat] = useState([{ from: "bot", text: agents[0].answer }]);
  const [draft, setDraft] = useState("");
  const [demoReplying, setDemoReplying] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [token, setToken] = useState("");
  const [userPlan, setUserPlan] = useState("Free");
  const [authMode, setAuthMode] = useState("register");
  const [authOpen, setAuthOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState("bots");
  const [profileName, setProfileName] = useState("");
  const [telegramLinks, setTelegramLinks] = useState([]);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [petOpen, setPetOpen] = useState(false);
  const [petMood, setPetMood] = useState("calm");
  const [petText, setPetText] = useState(
    "Привет! Я Numi. Могу подсказать, где создать бота, подключить знания или открыть кабинет.",
  );
  const [bots, setBots] = useState([]);
  const [analytics, setAnalytics] = useState({
    bots: 0,
    dialogs: 0,
    knowledgeSources: 0,
    limit: 1,
  });
  const [botsLoading, setBotsLoading] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [botMessages, setBotMessages] = useState([]);
  const [botDraft, setBotDraft] = useState("");
  const [botReplying, setBotReplying] = useState(false);
  const [builderStep, setBuilderStep] = useState(1);
  const [chosenPlan, setChosenPlan] = useState("Studio");
  const [botName, setBotName] = useState("Nova");
  const [botTone, setBotTone] = useState("Дружелюбный эксперт");
  const [knowledgeText, setKnowledgeText] = useState("");
  const [knowledgeFileName, setKnowledgeFileName] = useState("");
  const [knowledgeUpload, setKnowledgeUpload] = useState(null);
  const [knowledgeScanning, setKnowledgeScanning] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [caseMode, setCaseMode] = useState("before");
  const [toast, setToast] = useState("");
  const [authError, setAuthError] = useState("");
  const [saving, setSaving] = useState(false);
  const [booting, setBooting] = useState(true);
  const [voiceActive, setVoiceActive] = useState(false);
  const [botColor, setBotColor] = useState("violet");
  const [presentationMode, setPresentationMode] = useState(false);
  const [widgetScene, setWidgetScene] = useState(widgetScenes[0].id);
  const [launchReport, setLaunchReport] = useState(null);
  const [activeSection, setActiveSection] = useState("top");
  const [focusMode, setFocusMode] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboarding, setOnboarding] = useState({ audience: "Клиенты бизнеса", channel: "Сайт", tone: "Дружелюбный эксперт" });
  const [botAvatar, setBotAvatar] = useState("crystal");
  const [generatedGreeting, setGeneratedGreeting] = useState("");
  const [widgetReplies, setWidgetReplies] = useState([]);
  const [greetingBusy, setGreetingBusy] = useState(false);
  const [scenarioSteps, setScenarioSteps] = useState(["Понять вопрос клиента", "Дать точный ответ", "Предложить следующее действие", "Собрать заявку"]);
  const [comparison, setComparison] = useState(54);
  const [easterActive, setEasterActive] = useState(false);
  const easterTimer = useRef(null);

  const loadBots = async (sessionToken = token) => {
    if (!sessionToken) return;
    setBotsLoading(true);
    try {
      const [response, analyticsResponse] = await Promise.all([
        fetch("/api/bots", {
          headers: { Authorization: `Bearer ${sessionToken}` },
        }),
        fetch("/api/analytics", {
          headers: { Authorization: `Bearer ${sessionToken}` },
        }),
      ]);
      const [data, analyticsData] = await Promise.all([
        response.json(),
        analyticsResponse.json(),
      ]);
      if (!response.ok) throw new Error(data.error);
      setBots(data.bots);
      if (analyticsResponse.ok) setAnalytics({ ...analyticsData.usage, daily: analyticsData.daily || [], recent: analyticsData.recent || [], events: analyticsData.events || [] });
    } catch (error) {
      setToast(error.message || "Не удалось загрузить ваших AI-ботов.");
    } finally {
      setBotsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 1450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const magneticButtons = [
      ...document.querySelectorAll(
        ".primary-button, .header-cta, .plan-card button, .build-ribbon button",
      ),
    ];
    const tiltingCards = [
      ...document.querySelectorAll(
        ".agent-card, .workflow-grid article, .plan-card, .solution-card, .signature-step",
      ),
    ];
    const cleanups = [];
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return undefined;

    magneticButtons.forEach((button) => {
      button.classList.add("magnetic");
      const move = (event) => {
        const box = button.getBoundingClientRect();
        button.style.setProperty(
          "--magnetic-x",
          `${(event.clientX - box.left - box.width / 2) * 0.13}px`,
        );
        button.style.setProperty(
          "--magnetic-y",
          `${(event.clientY - box.top - box.height / 2) * 0.18}px`,
        );
      };
      const leave = () => {
        button.style.setProperty("--magnetic-x", "0px");
        button.style.setProperty("--magnetic-y", "0px");
      };
      button.addEventListener("pointermove", move);
      button.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        button.removeEventListener("pointermove", move);
        button.removeEventListener("pointerleave", leave);
        button.classList.remove("magnetic");
      });
    });

    tiltingCards.forEach((card) => {
      card.classList.add("tilt-card");
      const move = (event) => {
        const box = card.getBoundingClientRect();
        card.style.setProperty(
          "--tilt-x",
          `${((event.clientY - box.top) / box.height - 0.5) * -5}deg`,
        );
        card.style.setProperty(
          "--tilt-y",
          `${((event.clientX - box.left) / box.width - 0.5) * 6}deg`,
        );
        card.style.setProperty("--lift", "-7px");
      };
      const leave = () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.style.setProperty("--lift", "0px");
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
        card.classList.remove("tilt-card");
      });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("neurova-token");
    if (!savedToken) return;
    fetch("/api/me", { headers: { Authorization: `Bearer ${savedToken}` } })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        setToken(savedToken);
        setRegistered(true);
        setUserPlan(data.user.plan);
        loadBots(savedToken);
      })
      .catch(() => window.localStorage.removeItem("neurova-token"));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (builderOpen) {
      setPetMood("creative");
      setPetText("Я слежу за сборкой. Выберите характер и знания — так AI станет заметно точнее.");
    } else if (dashboardOpen) {
      setPetMood("focus");
      setPetText(bots.length ? "В кабинете можно тестировать AI, открыть его публичную страницу или посмотреть аналитику." : "Ваш кабинет готов. Создадим первого ассистента и оживим эту панель?");
    } else if (!bots.length && registered) {
      setPetMood("curious");
      setPetText("Кажется, у вас пока нет AI. Я могу провести вас через создание за пару минут.");
    } else {
      setPetMood("calm");
    }
  }, [builderOpen, dashboardOpen, bots.length, registered]);

  useEffect(() => {
    const sectionIds = ["top", "experience", "agents", "how", "widget-gallery", "plans"];
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-34% 0px -52% 0px", threshold: [0.01, 0.2, 0.48] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nodes = [...document.querySelectorAll("main > section:not(.hero):not(.intro-strip)")];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );
    nodes.forEach((node) => {
      node.classList.add("reveal-section");
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  const chooseAgent = (agent) => {
    setActiveAgent(agent);
    setChat([{ from: "bot", text: agent.answer }]);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || demoReplying) return;
    setChat((previous) => [...previous, { from: "user", text }]);
    setDraft("");
    setDemoReplying(true);
    try {
      const response = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: activeAgent.id, message: text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setChat((previous) => [...previous, { from: "bot", text: data.answer }]);
    } catch {
      setChat((previous) => [
        ...previous,
        { from: "bot", text: activeAgent.answer },
      ]);
    } finally {
      setDemoReplying(false);
    }
  };

  const startVoiceInput = () => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setToast("Голосовой ввод доступен в Chrome или Edge.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "ru-RU";
    recognition.interimResults = true;
    recognition.continuous = false;
    setVoiceActive(true);
    recognition.onresult = (event) =>
      setDraft(
        [...event.results].map((result) => result[0].transcript).join(""),
      );
    recognition.onerror = () =>
      setToast("Не удалось распознать голос. Проверьте доступ к микрофону.");
    recognition.onend = () => setVoiceActive(false);
    recognition.start();
  };

  const openBuilder = (template = activeAgent) => {
    setActiveAgent(template);
    if (!registered) {
      setAuthError("");
      setAuthMode("register");
      setAuthOpen(true);
      return;
    }
    setBuilderStep(1);
    setBuilderOpen(true);
  };

  const finishOnboarding = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(onboarding),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const template = agents.find((agent) => agent.id === data.templateId) || agents[0];
      chooseAgent(template);
      setBotTone(data.tone || onboarding.tone);
      setOnboardingOpen(false);
      setOnboardingStep(1);
      setBuilderStep(1);
      setBuilderOpen(true);
      setToast("Ваш персональный сценарий готов. Осталось собрать AI.");
    } catch (error) {
      setToast(error.message || "Не удалось сохранить ответы онбординга.");
    } finally {
      setSaving(false);
    }
  };

  const generateGreeting = async () => {
    const business = knowledgeText || `Мы помогаем ${onboarding.audience.toLowerCase()} через ${onboarding.channel.toLowerCase()}.`;
    setGreetingBusy(true);
    try {
      const response = await fetch("/api/greeting", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ business, templateId: activeAgent.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setGeneratedGreeting(data.greeting || "");
      setWidgetReplies(data.replies || []);
      if (data.tone) setBotTone(data.tone);
    } catch (error) {
      setToast(error.message || "Не удалось сгенерировать приветствие.");
    } finally {
      setGreetingBusy(false);
    }
  };

  const register = async (event) => {
    event.preventDefault();
    setSaving(true);
    setAuthError("");
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch(
        `/api/auth/${authMode === "login" ? "login" : "register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: fields.get("email"),
            password: fields.get("password"),
            plan: chosenPlan,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Не удалось создать аккаунт.");
      window.localStorage.setItem("neurova-token", data.token);
      setToken(data.token);
      setRegistered(true);
      setUserPlan(data.user.plan);
      loadBots(data.token);
      setAuthOpen(false);
      if (authMode === "login") {
        setBuilderStep(1);
        setBuilderOpen(true);
      } else {
        setOnboardingStep(1);
        setOnboardingOpen(true);
      }
      setToast(
        authMode === "login"
          ? "С возвращением в Neurova."
          : "Аккаунт создан. Добро пожаловать в Neurova.",
      );
    } catch (error) {
      setAuthError(error.message || "Не удалось подключиться к серверу.");
    } finally {
      setSaving(false);
    }
  };

  const publishBot = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/bots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: botName || "Nova",
          templateId: activeAgent.id,
          tone: botTone,
          avatar: botAvatar,
          greeting: generatedGreeting,
          scenario: scenarioSteps,
          knowledge: knowledgeText,
          knowledgeUpload,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Не удалось создать AI-ассистента.");
      setBuilderOpen(false);
      loadBots(token);
      setLaunchReport({
        ...data.bot,
        widget: data.widget,
        hasKnowledge: Boolean(knowledgeText || knowledgeUpload),
      });
      setToast(`«${data.bot.name}» создан. Код виджета готов к публикации.`);
    } catch (error) {
      setToast(error.message || "Не удалось подключиться к серверу.");
    } finally {
      setSaving(false);
    }
  };

  const scrollTo = (id) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const copyWidgetCode = async (botId) => {
    const snippet = `<script src="${window.location.origin}/widget.js" data-bot-id="${botId}"><\/script>`;
    try {
      await navigator.clipboard?.writeText(snippet);
      setToast("Рабочий код виджета скопирован в буфер обмена.");
    } catch {
      setToast("Не удалось скопировать код автоматически.");
    }
  };

  const deleteBot = async (bot) => {
    if (!window.confirm(`Удалить AI «${bot.name}»? Диалоги, Telegram-ссылки и код этого ассистента будут удалены без возможности восстановления.`)) return;
    try {
      const response = await fetch(`/api/bots/${bot.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setBots((current) => current.filter((item) => item.id !== bot.id));
      setSelectedBot(null);
      setTelegramLinks((current) => current.filter((item) => item.botId !== bot.id));
      setToast(`AI «${bot.name}» удалён.`);
      loadBots();
    } catch (error) {
      setToast(error.message || "Не удалось удалить AI-ассистента.");
    }
  };

  const openDashboard = () => {
    if (!registered) {
      setAuthMode("login");
      setAuthError("");
      setAuthOpen(true);
      return;
    }
    setDashboardTab("bots");
    setSelectedBot(null);
    setDashboardOpen(true);
    loadBots();
    fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data) => setProfileName(data.user?.displayName || ""))
      .catch(() => {});
    fetch("/api/telegram", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data) => {
        setTelegramLinks(data.links || []);
        setTelegramEnabled(Boolean(data.enabled));
      })
      .catch(() => {});
  };

  const switchDashboardTab = (tab) => {
    setDashboardTab(tab);
    setSelectedBot(null);
    if (tab === "analytics") {
      loadBots();
      return;
    }
    if (tab === "settings") {
      fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((data) => setProfileName(data.user?.displayName || ""))
        .catch(() => setToast("Не удалось загрузить настройки профиля."));
      return;
    }
    if (tab === "telegram") {
      fetch("/api/telegram", { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((data) => {
          setTelegramLinks(data.links || []);
          setTelegramEnabled(Boolean(data.enabled));
        })
        .catch(() => setToast("Не удалось загрузить настройки Telegram."));
    }
  };

  const saveProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName: profileName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProfileName(data.user?.displayName || "");
      setToast("Настройки профиля сохранены.");
    } catch (error) {
      setToast(error.message || "Не удалось сохранить настройки профиля.");
    }
  };

  const createTelegramLink = async (botId) => {
    const response = await fetch("/api/telegram/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ botId }),
    });
    const data = await response.json();
    if (!response.ok)
      return setToast(data.error || "Не удалось создать Telegram-ссылку.");
    if (!data.enabled || !data.url)
      return setToast(
        "Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_BOT_USERNAME в server/.env, затем перезапустите API.",
      );
    await navigator.clipboard?.writeText(data.url);
    setToast("Telegram-ссылка скопирована. Откройте её и нажмите Start.");
    setTelegramLinks((links) => [
      { botId, botName: data.bot.name, code: data.code, connectedAt: null },
      ...links,
    ]);
  };

  const changePlan = async (plan) => {
    try {
      const response = await fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ plan }) });
      const data = await response.json();
      if (!response.ok) return setToast(data.error || 'Не удалось изменить тариф.');
      setUserPlan(data.user?.plan || plan);
      setAnalytics((current) => ({ ...current, ...(data.usage || {}) }));
      setToast(`Тариф ${data.user?.plan || plan} активирован в учебном режиме.`);
      loadBots();
    } catch (error) {
      setToast(error.message || 'Не удалось подключиться к серверу тарифов.');
    }
  };

  const selectPlanAndBuild = async (plan) => {
    setChosenPlan(plan);
    if (registered) {
      try {
        const response = await fetch("/api/plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plan }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setUserPlan(data.user.plan);
        setAnalytics((current) => ({ ...current, limit: data.limit }));
      } catch (error) {
        setToast(error.message || "Не удалось изменить тариф.");
        return;
      }
    }
    openBuilder();
  };

  const chooseBot = (bot) => {
    setSelectedBot(bot);
    setBotMessages([
      {
        from: "bot",
        text: `Здравствуйте! Я ${bot.name}. Я готов помочь — задайте вопрос по моей базе знаний.`,
      },
    ]);
    setBotDraft("");
  };

  const sendBotMessage = async (event) => {
    event.preventDefault();
    const question = botDraft.trim();
    if (!question || !selectedBot || botReplying) return;
    setBotMessages((messages) => [
      ...messages,
      { from: "user", text: question },
    ]);
    setBotDraft("");
    setBotReplying(true);
    try {
      const response = await fetch(`/api/bots/${selectedBot.id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: question }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setBotMessages((messages) => [
        ...messages,
        { from: "bot", text: data.answer, source: data.source },
      ]);
    } catch (error) {
      setBotMessages((messages) => [
        ...messages,
        { from: "bot", text: error.message || "Не удалось получить ответ." },
      ]);
    } finally {
      setBotReplying(false);
    }
  };

  const attachKnowledge = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) {
      setToast("Выберите файл до 5 МБ.");
      return;
    }
    setKnowledgeScanning(true);
    try {
      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        for (let index = 0; index < bytes.length; index += 0x8000)
          binary += String.fromCharCode(
            ...bytes.subarray(index, index + 0x8000),
          );
        setKnowledgeUpload({ kind: "pdf", data: window.btoa(binary) });
        setKnowledgeText("");
      } else {
        setKnowledgeText(await file.text());
        setKnowledgeUpload(null);
      }
      setKnowledgeFileName(file.name);
      await new Promise((resolve) => window.setTimeout(resolve, 720));
    } catch {
      setToast("Не удалось прочитать этот файл.");
    } finally {
      setKnowledgeScanning(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem("neurova-token");
    setToken("");
    setRegistered(false);
    setUserPlan("Free");
    setBots([]);
    setDashboardOpen(false);
    setToast("Вы вышли из аккаунта.");
  };

  const publicBotMatch = window.location.pathname.match(/^\/bot\/(\d+)$/);
  if (publicBotMatch) return <PublicBotPage botId={publicBotMatch[1]} />;

  return (
    <div className={`app-shell theme-${activeAgent.gradient} ${focusMode ? "focus-mode" : ""} ${lightMode ? "pearl-mode" : ""} ${easterActive ? "galaxy-unlocked" : ""}`}>
      {booting && (
        <div className="boot-screen" aria-label="Загрузка Neurova">
          <div className="boot-orbit">
            <i />
            <i />
            <b>✦</b>
          </div>
          <span>NEUROVA / AI STUDIO</span>
          <small>Инициализация интеллекта…</small>
          <div className="boot-progress">
            <i />
          </div>
        </div>
      )}
      <div className="global-atmosphere" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="film-grain" aria-hidden="true" />
      <div className="constellation" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <PlasmaCursor />
      <aside className="section-rail" aria-label="Навигация по странице">
        {[
          ["top", "Начало"],
          ["experience", "Сигнал"],
          ["agents", "AI Lab"],
          ["how", "Путь"],
          ["widget-gallery", "Виджеты"],
          ["plans", "Тарифы"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={activeSection === id ? "active" : ""}
            onClick={() => scrollTo(id)}
            aria-label={label}
          >
            <i />
            <span>{label}</span>
          </button>
        ))}
      </aside>

      <header className="site-header">
        <button
          className="brand"
          onClick={() => scrollTo("top")}
          aria-label="Neurova: на главную"
        >
          <BrandMark />
          <span>
            neurova<span className="brand-dot">.</span>
          </span>
        </button>
        <nav aria-label="Главная навигация">
          <button onClick={() => scrollTo("agents")}>Агенты</button>
          <button onClick={() => scrollTo("how")}>Как работает</button>
          <button onClick={() => scrollTo("plans")}>Тарифы</button>
        </nav>
        <div className="header-actions">
          <button
            className="demo-mode-button"
            onClick={() => setPresentationMode(true)}
            title="Режим презентации для защиты проекта"
          >
            <span>✦</span> Демо
          </button>
          <button
            className={`focus-toggle ${focusMode ? "on" : ""}`}
            onClick={() => setFocusMode((value) => !value)}
            title="Переключить спокойный focus-режим"
            aria-pressed={focusMode}
          >
            ◌ <span>Focus</span>
          </button>
          <button className="theme-toggle" onClick={() => setLightMode((value) => !value)} title="Сменить тему">
            {lightMode ? "☾" : "☼"}
          </button>
          <button className="text-button" onClick={openDashboard}>
            {registered ? "Кабинет" : "Войти"}
          </button>
          <button className="header-cta" onClick={() => openBuilder()}>
            Создать AI
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <AuroraCanvas />
          <div className="liquid-lens lens-one" />
          <div className="liquid-lens lens-two" />
          <div className="aurora-beam beam-one" />
          <div className="aurora-beam beam-two" />
          <div className="aurora-ribbon ribbon-one" />
          <div className="aurora-ribbon ribbon-two" />
          <div className="aurora-ribbon ribbon-three" />
          <div className="hero-vignette" />
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="hero-grid" />
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="pulse-dot" /> Новый способ создавать AI
            </div>
            <h1>
              Ваш AI.
              <br />
              <em>Ваши правила.</em>
            </h1>
            <p>
              Создавайте умных ассистентов, которые понимают ваш бизнес, говорят
              в вашем стиле и готовы работать уже сегодня.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => openBuilder()}>
                Создать своего AI <span>→</span>
              </button>
              <button
                className="ghost-button"
                onClick={() => scrollTo("agents")}
              >
                <span className="play-icon">▶</span> Попробовать в действии
              </button>
            </div>
            <div className="trusted-row">
              <div className="avatars">
                <span>А</span>
                <span>М</span>
                <span>И</span>
                <span>+2K</span>
              </div>
              <p>
                <strong>2 400+ создателей</strong>
                <br />
                уже запустили свой AI
              </p>
            </div>
          </div>
          <div
            className="hero-showcase"
            aria-label="Предпросмотр AI-ассистента"
          >
            <div className="neural-core" aria-hidden="true">
              <span className="neural-halo halo-one" />
              <span className="neural-halo halo-two" />
              <span className="neural-nucleus">✦</span>
              <i />
              <i />
              <i />
            </div>
            <button
              className="easter-trigger"
              aria-label="Секрет Neurova"
              onPointerDown={() => { easterTimer.current = window.setTimeout(() => { setEasterActive(true); setPetText("Вы нашли мини-галактику Neurova. Она появляется только у любопытных создателей ✦"); }, 1100); }}
              onPointerUp={() => window.clearTimeout(easterTimer.current)}
              onPointerLeave={() => window.clearTimeout(easterTimer.current)}
            />
            <div className="showcase-glow" />
            <div className="assistant-window">
              <div className="window-top">
                <span className="window-logo">N</span>
                <div>
                  <b>Nova</b>
                  <small>
                    <i /> В сети
                  </small>
                </div>
                <button aria-label="Дополнительные действия">•••</button>
              </div>
              <div className="window-chat">
                <div className="bubble bot">
                  Привет! Я Nova — ваш цифровой ассистент. С чего начнём?
                </div>
                <div className="quick-chips">
                  <button>Расскажите о продукте</button>
                  <button>Помогите выбрать</button>
                </div>
                <div className="typing">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="window-input">
                <span>Напишите сообщение...</span>
                <b>↑</b>
              </div>
            </div>
            <div className="float-card card-message">
              <span>✦</span>
              <div>
                <b>98.4%</b>
                <small>довольных диалогов</small>
              </div>
            </div>
            <div className="float-card card-live">
              <i /> AI отвечает прямо сейчас
            </div>
            <div className="showcase-personas" aria-label="Быстрый выбор демо-ассистента">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  className={activeAgent.id === agent.id ? "active" : ""}
                  onClick={() => {
                    chooseAgent(agent);
                    setToast(`Витрина настроена на роль: ${agent.title}`);
                  }}
                  title={agent.title}
                >
                  {agent.icon}
                </button>
              ))}
            </div>
          </div>
          <div className="scroll-cue">
            <span /> Листайте, чтобы исследовать
          </div>
        </section>

        <section className="intro-strip">
          <p>
            Создан для <span>амбиций.</span> Настроен под <span>ваш мир.</span>
          </p>
          <div className="strip-logos">
            <b>⌁</b>
            <b>qore</b>
            <b>◉ altitude</b>
            <b>METRIC</b>
            <b>nōva</b>
          </div>
        </section>

        <section id="experience" className="signature-section section-wrap">
          <div className="signature-copy">
            <span className="section-kicker">NEUROVA / SIGNAL FLOW</span>
            <h2>
              Не чат-бот.<br />
              <em>Ваш цифровой характер.</em>
            </h2>
            <p>
              Соберите помощника, который помнит контекст, говорит в вашем стиле
              и появляется именно там, где его ждёт клиент.
            </p>
            <button className="ghost-button" onClick={() => setPresentationMode(true)}>
              <span className="play-icon">▶</span> Посмотреть сценарий запуска
            </button>
          </div>
          <div className="signature-path">
            <div className="signature-orbit" aria-hidden="true">
              <span className="orbit-ring ring-a" />
              <span className="orbit-ring ring-b" />
              <b>✦</b>
              <i />
              <i />
              <i />
            </div>
            <div className="signature-steps">
              {[
                ["01", "Роль", "Выберите основу для поведения AI"],
                ["02", "Знания", "Добавьте FAQ, PDF или документы"],
                ["03", "Запуск", "Сайт, Telegram и личный кабинет"],
              ].map(([number, title, text], index) => (
                <button
                  className="signature-step"
                  key={title}
                  onClick={() => {
                    if (index === 0) {
                      scrollTo("agents");
                    } else if (index === 1) {
                      openBuilder(activeAgent);
                    } else {
                      openDashboard();
                    }
                  }}
                >
                  <span>{number}</span>
                  <div>
                    <b>{title}</b>
                    <small>{text}</small>
                  </div>
                  <i>→</i>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="comparison-section section-wrap">
          <div className="comparison-head"><span className="section-kicker">THE DIFFERENCE / LIVE</span><h2>Один вопрос.<br /><em>Два сценария.</em></h2><p>Проведите ползунок и покажите на защите, зачем бизнесу нужен AI.</p></div>
          <div className="comparison-stage" style={{ "--split": `${comparison}%` }}>
            <article className="without-ai"><small>БЕЗ AI</small><h3>Очередь растёт</h3><p>Клиент ждёт ответ, команда переключается между задачами.</p><div className="queue-lines"><i /><i /><i /><i /></div></article>
            <article className="with-ai"><small>С NEUROVA</small><h3>Ответ уже здесь</h3><p>AI помнит контекст, находит знания и ведёт диалог дальше.</p><div className="mini-answer"><span className={`avatar-mark ${botAvatar}`}>✦</span><b>Помогу прямо сейчас</b><i>✓</i></div></article>
            <input aria-label="Сравнение без AI и с AI" type="range" min="8" max="92" value={comparison} onChange={(event) => setComparison(event.target.value)} />
            <span className="comparison-handle">↔</span>
          </div>
        </section>

        <section id="agents" className="agents-section section-wrap">
          <div className="section-heading">
            <div>
              <span className="section-kicker">01 / AI LAB</span>
              <h2>
                Сначала попробуйте.
                <br />
                <em>Потом создавайте.</em>
              </h2>
            </div>
            <p>
              Не уверены, какой ассистент вам нужен? Познакомьтесь с готовыми
              сценариями и проверьте их в реальном диалоге.
            </p>
          </div>
          <div className="lab-layout">
            <div className="agent-list">
              {agents.map((agent, index) => (
                <button
                  key={agent.id}
                  className={`agent-card ${activeAgent.id === agent.id ? "selected" : ""}`}
                  onClick={() => chooseAgent(agent)}
                >
                  <span className={`agent-icon ${agent.gradient}`}>
                    {agent.icon}
                  </span>
                  <span className="agent-text">
                    <small>{agent.label}</small>
                    <b>{agent.title}</b>
                    <em>{agent.description}</em>
                  </span>
                  <span className="agent-arrow">↗</span>
                  <span className="agent-index">0{index + 1}</span>
                </button>
              ))}
            </div>
            <div className="lab-chat">
              <div className="lab-chat-head">
                <div>
                  <span className={`agent-icon small ${activeAgent.gradient}`}>
                    {activeAgent.icon}
                  </span>
                  <span>
                    <b>{activeAgent.title}</b>
                    <small>Демо-режим · отвечает мгновенно</small>
                  </span>
                </div>
                <div className="demo-actions">
                  <button
                    className={`voice-button ${voiceActive ? "listening" : ""}`}
                    onClick={startVoiceInput}
                    aria-label="Сказать сообщение голосом"
                    title="Голосовой ввод"
                  >
                    <span>⌁</span>
                    <i />
                  </button>
                  <span className="demo-chip">Попробуйте</span>
                </div>
              </div>
              <div className="chat-body">
                <div className="chat-intro">
                  Это безопасная демонстрация. Задайте любой вопрос или
                  используйте пример ниже.
                </div>
                <div className="suggestion-row">
                  <button onClick={() => setDraft(activeAgent.prompt)}>
                    {activeAgent.prompt}
                  </button>
                </div>
                {chat.map((message, index) => (
                  <div
                    className={`message ${message.from}`}
                    key={`${message.text}-${index}`}
                  >
                    {message.text}
                  </div>
                ))}
                {demoReplying && (
                  <div className="message bot demo-typing">
                    <i />
                    <i />
                    <i />
                  </div>
                )}
              </div>
              <form className="chat-form" onSubmit={sendMessage}>
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Попробуйте спросить…"
                />
                <button type="submit" aria-label="Отправить">
                  ↑
                </button>
              </form>
              <div className="chat-foot">
                Neurova AI может ошибаться. Проверяйте важную информацию.
              </div>
            </div>
          </div>
          <div className="build-ribbon">
            <div>
              <span>Ваш сценарий — уникален?</span>
              <b>Соберите AI под него за 3 минуты.</b>
            </div>
            <button onClick={() => openBuilder(activeAgent)}>
              Открыть конструктор <span>→</span>
            </button>
          </div>
        </section>

        <section className="solutions-section section-wrap">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">01.5 / STARTER SCENARIOS</span>
              <h2>
                Не с нуля.
                <br />
                <em>С правильной роли.</em>
              </h2>
            </div>
            <p>
              Выберите готовый сценарий и посмотрите, как AI может работать в
              конкретной сфере уже сегодня.
            </p>
          </div>
          <div className="solutions-grid">
            {solutions.map((solution) => (
              <article className="solution-card" key={solution.title}>
                <div>
                  <span className="solution-icon">{solution.icon}</span>
                  <small>{solution.tag}</small>
                </div>
                <h3>{solution.title}</h3>
                <p>{solution.text}</p>
                <blockquote>«{solution.prompt}»</blockquote>
                <button
                  onClick={() => {
                    chooseAgent(
                      agents.find((agent) => agent.id === solution.template) ||
                        agents[0],
                    );
                    scrollTo("agents");
                    setToast(`Открыт сценарий: ${solution.title}`);
                  }}
                >
                  Открыть демо <span>↗</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="capabilities-section section-wrap">
          <div className="capabilities-copy">
            <span className="section-kicker">02 / CAPABILITIES</span>
            <h2>
              Выглядит красиво.
              <br />
              <em>Работает по делу.</em>
            </h2>
            <p>
              Neurova — не просто окно чата. Это слой интеллекта между вашим
              контентом, командой и посетителем сайта.
            </p>
            <button className="ghost-button" onClick={() => openBuilder()}>
              <span className="play-icon">✦</span> Собрать своего AI
            </button>
          </div>
          <div className="capabilities-list">
            {capabilities.map(([icon, title, text], index) => (
              <article key={title}>
                <span>{icon}</span>
                <div>
                  <small>0{index + 1}</small>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <i>→</i>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="workflow-section section-wrap">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">02 / WORKFLOW</span>
              <h2>
                От мысли
                <br />
                <em>до запуска.</em>
              </h2>
            </div>
            <p>
              Никакого кода. Только ясные шаги, полный контроль и ваш стиль
              общения.
            </p>
          </div>
          <div className="workflow-grid">
            <article>
              <span>01</span>
              <div className="workflow-visual choose">
                <i>✦</i>
                <i>⌘</i>
                <i>↗</i>
              </div>
              <h3>Выберите роль</h3>
              <p>Начните с готового сценария или с чистого листа.</p>
            </article>
            <article>
              <span>02</span>
              <div className="workflow-visual knowledge">
                <div />
                <div />
                <div />
                <b>+ PDF</b>
              </div>
              <h3>Добавьте знания</h3>
              <p>Загрузите документы, FAQ и ссылки — AI разберётся.</p>
            </article>
            <article>
              <span>03</span>
              <div className="workflow-visual launch">
                <div className="launch-orb">N</div>
                <i>✦</i>
              </div>
              <h3>Запустите в мир</h3>
              <p>Виджет сайта, Telegram или персональный launcher.</p>
            </article>
          </div>
          <div className="ai-flow" aria-label="Путь от документа до AI-виджета">
            <div className="flow-line">
              <i />
            </div>
            <div className="flow-node document">
              <span>PDF</span>
              <small>Знания</small>
            </div>
            <div className="flow-node memory">
              <span>⌘</span>
              <small>Память</small>
            </div>
            <div className="flow-node brain">
              <span>✦</span>
              <small>AI-ядро</small>
            </div>
            <div className="flow-node widget">
              <span>&lt;/&gt;</span>
              <small>Виджет</small>
            </div>
          </div>
        </section>

        <section className="integrations-section section-wrap">
          <div>
            <span className="section-kicker">CONNECTED WHERE YOU WORK</span>
            <h2>
              Один интеллект.
              <br />
              <em>Все точки контакта.</em>
            </h2>
          </div>
          <div className="integrations-orbit">
            {[
              "Сайт",
              "Telegram",
              "WhatsApp",
              "Notion",
              "Google Drive",
              "CRM",
            ].map((item, index) => (
              <button
                key={item}
                className={index < 2 ? "ready" : ""}
                onClick={() =>
                  setToast(
                    index < 2
                      ? `${item}: сценарий готов к подключению.`
                      : `${item}: в дорожной карте Neurova.`,
                  )
                }
              >
                <span>{index < 2 ? "●" : "◌"}</span>
                {item}
                <small>{index < 2 ? "Готово" : "Скоро"}</small>
              </button>
            ))}
          </div>
        </section>

        <section id="widget-gallery" className="widget-gallery section-wrap">
          <div className="widget-gallery-copy">
            <span className="section-kicker">WIDGET GALLERY / LIVE SKIN</span>
            <h2>
              AI выглядит своим<br />
              <em>в любом продукте.</em>
            </h2>
            <p>
              Выберите среду и посмотрите, как виджет адаптируется к сайту.
              После создания код установки остаётся одним и тем же.
            </p>
            <div className="widget-scene-tabs" role="tablist" aria-label="Варианты виджета">
              {widgetScenes.map((scene) => (
                <button
                  key={scene.id}
                  role="tab"
                  aria-selected={widgetScene === scene.id}
                  className={widgetScene === scene.id ? "active" : ""}
                  onClick={() => setWidgetScene(scene.id)}
                >
                  {scene.label}
                </button>
              ))}
            </div>
            <button className="ghost-button" onClick={() => {
              chooseAgent(agents[0]);
              scrollTo("agents");
            }}>
              <span className="play-icon">▶</span> Проверить реальный диалог
            </button>
          </div>
          <div className="site-preview-shell">
            <div className="site-preview-bar"><i /><i /><i /><span>your-product.site</span></div>
            {widgetScenes.filter((scene) => scene.id === widgetScene).map((scene) => (
              <div className={`site-preview ${scene.accent}`} key={scene.id}>
                <div className="preview-site-copy">
                  <small>NEUROVA PARTNER EXPERIENCE</small>
                  <h3>{scene.title}</h3>
                  <p>Ваш продукт — понятнее. Клиенты — ближе. AI уже на странице.</p>
                  <i />
                  <i />
                </div>
                <div className="embedded-widget">
                  <div className="embedded-widget-head"><span>✦</span><b>Nova AI</b><small><i /> онлайн</small></div>
                  <div className="embedded-widget-chat">
                    <p className="visitor">{scene.question}</p>
                    <p>{scene.answer}</p>
                  </div>
                  <div className="embedded-widget-input">Написать сообщение <b>↑</b></div>
                </div>
              </div>
            ))}
            <div className="widget-code-label"><span>&lt;/&gt;</span> Установка одной строкой · готово</div>
          </div>
        </section>

        <section id="plans" className="plans-section section-wrap">
          <div className="plans-backdrop" />
          <div className="plans-intro">
            <span className="section-kicker">03 / PLANS</span>
            <h2>
              Начните сейчас.
              <br />
              <em>Масштабируйтесь потом.</em>
            </h2>
          </div>
          <div className="plans-grid">
            {plans.map((plan) => (
              <article
                className={`plan-card ${plan.featured ? "featured" : ""}`}
                key={plan.name}
              >
                {plan.featured && (
                  <span className="popular">Самый популярный</span>
                )}
                <div>
                  <h3>{plan.name}</h3>
                  <p>{plan.caption}</p>
                </div>
                <strong>
                  {plan.price === "0" ? (
                    "Бесплатно"
                  ) : (
                    <>
                      <small>₸</small>
                      {plan.price}
                      <em>/ мес.</em>
                    </>
                  )}
                </strong>
                <ul>
                  <li>{plan.bots}</li>
                  <li>{plan.messages}</li>
                  <li>База знаний и история</li>
                  {plan.featured && <li>Виджет для сайта</li>}
                </ul>
                <button onClick={() => selectPlanAndBuild(plan.name)}>
                  {plan.featured ? "Выбрать Studio" : `Выбрать ${plan.name}`}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="case-section section-wrap">
          <div className="case-head">
            <div>
              <span className="section-kicker">
                MODEL SCENARIO / NOT REAL METRICS
              </span>
              <h2>
                Один вопрос.
                <br />
                <em>Два разных пути.</em>
              </h2>
            </div>
            <div className="case-switch">
              <button
                className={caseMode === "before" ? "active" : ""}
                onClick={() => setCaseMode("before")}
              >
                До AI
              </button>
              <button
                className={caseMode === "after" ? "active" : ""}
                onClick={() => setCaseMode("after")}
              >
                С Neurova
              </button>
            </div>
          </div>
          <div className={`case-stage ${caseMode}`}>
            <div className="case-signal">
              <span>{caseMode === "before" ? "⌛" : "✦"}</span>
              <i />
            </div>
            <div>
              <small>
                {caseMode === "before" ? "ОБЫЧНЫЙ СЦЕНАРИЙ" : "AI-СЦЕНАРИЙ"}
              </small>
              <h3>
                {caseMode === "before"
                  ? "Сообщение ждёт свободного менеджера."
                  : "AI отвечает сразу и передаёт менеджеру только важный контекст."}
              </h3>
              <p>
                {caseMode === "before"
                  ? "Посетитель ищет ответ сам, повторяет вопрос в нескольких каналах и может уйти."
                  : "Посетитель получает понятный следующий шаг, а команда видит готовое резюме диалога."}
              </p>
            </div>
            <ul>
              <li>
                <b>{caseMode === "before" ? "1–3 часа" : "Сразу"}</b>
                <span>ориентир ответа</span>
              </li>
              <li>
                <b>{caseMode === "before" ? "Ручной FAQ" : "База знаний"}</b>
                <span>источник ответа</span>
              </li>
              <li>
                <b>
                  {caseMode === "before"
                    ? "Потеря контекста"
                    : "Резюме диалога"}
                </b>
                <span>для команды</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="knowledge-hub section-wrap">
          <div className="faq-block">
            <span className="section-kicker">FAQ / FIRST LAUNCH</span>
            <h2>
              Вопросы, которые
              <br />
              <em>возникают первыми.</em>
            </h2>
            <div>
              {faq.map(([question, answer], index) => (
                <button
                  className={openFaq === index ? "faq-item open" : "faq-item"}
                  key={question}
                  onClick={() => setOpenFaq(index)}
                >
                  <span>{question}</span>
                  <i>{openFaq === index ? "−" : "+"}</i>
                  <p>{answer}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="journal-block">
            <span className="section-kicker">NEUROVA JOURNAL</span>
            <h2>
              Первые шаги
              <br />
              <em>без хаоса.</em>
            </h2>
            {journal.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <button
                  onClick={() =>
                    setToast(
                      `Материал «${title}» будет доступен в полной версии журнала.`,
                    )
                  }
                >
                  ↗
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="final-cta section-wrap">
          <div className="final-noise" />
          <div className="portal-orbit" aria-hidden="true">
            <i />
            <i />
            <b />
          </div>
          <div className="earth-system" aria-hidden="true">
            <span className="earth-orbit orbit-a" />
            <span className="earth-orbit orbit-b" />
            <span className="earth-orbit orbit-c" />
            <div className="earth-globe">
              <i className="earth-land land-one" />
              <i className="earth-land land-two" />
              <i className="earth-land land-three" />
              <i className="earth-cloud cloud-one" />
              <i className="earth-cloud cloud-two" />
              <b className="earth-shade" />
            </div>
            <span className="earth-satellite satellite-one"><i />✦</span>
            <span className="earth-satellite satellite-two"><i />◌</span>
            <span className="earth-signal signal-one" />
            <span className="earth-signal signal-two" />
          </div>
          <span className="section-kicker">ГОТОВЫ СОЗДАТЬ СВОЁ?</span>
          <h2>
            Следующий сильный
            <br />
            AI — <em>ваш.</em>
          </h2>
          <p>Соберите первого ассистента бесплатно. Без карты и без кода.</p>
          <button className="primary-button" onClick={() => openBuilder()}>
            Создать AI бесплатно <span>→</span>
          </button>
        </section>
      </main>

      <footer>
        <div className="brand">
          <BrandMark />
          <span>
            neurova<span className="brand-dot">.</span>
          </span>
        </div>
        <span>© 2026 Neurova AI Studio</span>
        <div>
          <button>Политика конфиденциальности</button>
          <button>Контакты</button>
        </div>
      </footer>

      {onboardingOpen && (
        <div className="overlay onboarding-overlay" role="dialog" aria-modal="true" aria-label="Первичная настройка AI">
          <div className="onboarding-card">
            <span className="section-kicker">NEUROVA / FIRST SIGNAL</span><div className="onboarding-count">0{onboardingStep} <i /> 03</div>
            {onboardingStep === 1 && <><h2>Для кого<br /><em>создаём AI?</em></h2><p>Это поможет подобрать готовую роль ассистента.</p><div className="onboarding-options">{["Клиенты бизнеса", "Ученики и студенты", "Команда и кандидаты"].map((item) => <button key={item} className={onboarding.audience === item ? "active" : ""} onClick={() => setOnboarding((current) => ({ ...current, audience: item }))}>{item}</button>)}</div></>}
            {onboardingStep === 2 && <><h2>Где он будет<br /><em>работать?</em></h2><p>Каналы можно расширить позже в кабинете.</p><div className="onboarding-options channels">{["Сайт", "Telegram", "Сайт и Telegram"].map((item) => <button key={item} className={onboarding.channel === item ? "active" : ""} onClick={() => setOnboarding((current) => ({ ...current, channel: item }))}>◌ {item}</button>)}</div></>}
            {onboardingStep === 3 && <><h2>Какой у него<br /><em>характер?</em></h2><p>Тон будет применён к первому AI, но его можно изменить.</p><div className="onboarding-options">{["Дружелюбный эксперт", "Краткий профессионал", "Заботливый наставник"].map((item) => <button key={item} className={onboarding.tone === item ? "active" : ""} onClick={() => setOnboarding((current) => ({ ...current, tone: item }))}>{item}</button>)}</div></>}
            <div className="onboarding-actions">{onboardingStep > 1 && <button onClick={() => setOnboardingStep((step) => step - 1)}>← Назад</button>}<button className="primary-button" disabled={saving} onClick={() => onboardingStep < 3 ? setOnboardingStep((step) => step + 1) : finishOnboarding()}>{onboardingStep === 3 ? "Собрать мой AI" : "Продолжить"} <span>→</span></button></div>
          </div>
        </div>
      )}

      {authOpen && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Вход или регистрация в Neurova"
        >
          <button
            className="overlay-backdrop"
            onClick={() => setAuthOpen(false)}
            aria-label="Закрыть"
          />
          <form className="auth-card" onSubmit={register}>
            <button
              className="modal-close"
              type="button"
              onClick={() => setAuthOpen(false)}
            >
              ×
            </button>
            <BrandMark />
            <span className="section-kicker">NEUROVA ID</span>
            <h2>
              {authMode === "login" ? (
                <>
                  С возвращением
                  <br />
                  <em>в Neurova.</em>
                </>
              ) : (
                <>
                  Создайте
                  <br />
                  <em>свой AI.</em>
                </>
              )}
            </h2>
            <p>
              {authMode === "login"
                ? "Войдите, чтобы продолжить работу со своими AI-ассистентами."
                : "Зарегистрируйтесь, чтобы сохранять агентов, подключать знания и публиковать их."}
            </p>
            <label>
              Рабочий email
              <input
                required
                name="email"
                type="email"
                placeholder="you@company.com"
              />
            </label>
            <label>
              Пароль
              <input
                required
                name="password"
                type="password"
                minLength="6"
                placeholder="Минимум 6 символов"
              />
            </label>
            {authError && <div className="form-error">{authError}</div>}
            <button className="primary-button" disabled={saving} type="submit">
              {saving
                ? "Подключаем…"
                : authMode === "login"
                  ? "Войти"
                  : "Продолжить"}{" "}
              <span>→</span>
            </button>
            <button
              className="auth-switch"
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setAuthError("");
              }}
            >
              {authMode === "login"
                ? "Нет аккаунта? Создать бесплатно"
                : "Уже есть аккаунт? Войти"}
            </button>
            <small>
              Продолжая, вы соглашаетесь с условиями использования Neurova.
            </small>
          </form>
        </div>
      )}

      {presentationMode && (
        <div
          className="overlay presentation-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Демо-режим Neurova"
        >
          <button
            className="overlay-backdrop"
            onClick={() => setPresentationMode(false)}
            aria-label="Закрыть демо-режим"
          />
          <section className="presentation-card">
            <button
              className="modal-close"
              onClick={() => setPresentationMode(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <div className="presentation-head">
              <span className="section-kicker">NEUROVA / DEMO MODE</span>
              <h2>Готово к <em>защите.</em></h2>
              <p>
                Интерактивная презентация показывает путь пользователя от идеи до
                работающего AI-ассистента и его аналитики.
              </p>
            </div>
            <div className="presentation-metrics">
              <article><b>3 мин</b><small>до первого AI</small></article>
              <article><b>24/7</b><small>на связи с клиентом</small></article>
              <article><b>1 код</b><small>для установки на сайт</small></article>
            </div>
            <div className="presentation-scenarios">
              {agents.map((agent, index) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    chooseAgent(agent);
                    setPresentationMode(false);
                    scrollTo("agents");
                    setToast(`Открыт демо-сценарий ${index + 1}: ${agent.title}`);
                  }}
                >
                  <span className={`agent-icon ${agent.gradient}`}>{agent.icon}</span>
                  <span><b>{agent.title}</b><small>{agent.description}</small></span>
                  <i>Открыть →</i>
                </button>
              ))}
            </div>
            <div className="presentation-footer">
              <span><i /> live preview включён</span>
              <button className="primary-button" onClick={() => {
                setPresentationMode(false);
                openBuilder();
              }}>Создать своего AI <span>→</span></button>
            </div>
          </section>
        </div>
      )}

      {launchReport && (
        <div className="overlay launch-overlay" role="dialog" aria-modal="true" aria-label="AI успешно запущен">
          <button className="overlay-backdrop" onClick={() => setLaunchReport(null)} aria-label="Закрыть" />
          <section className="launch-terminal-card">
            <button className="modal-close" onClick={() => setLaunchReport(null)} aria-label="Закрыть">×</button>
            <div className="launch-terminal-top">
              <span className="section-kicker">NEUROVA DEPLOYMENT</span>
              <span className="terminal-live"><i /> LIVE</span>
            </div>
            <div className="launch-success-orb" aria-hidden="true"><i /><b>✦</b></div>
            <h2><em>{launchReport.name}</em> уже в сети.</h2>
            <p>Ваш AI создан и готов отвечать. Ниже — реальные шаги, выполненные при запуске.</p>
            <div className="terminal-lines" aria-label="Результат запуска">
              <p><i>✓</i><span>persona.configured</span><b>{launchReport.tone}</b></p>
              <p><i>✓</i><span>knowledge.indexed</span><b>{launchReport.hasKnowledge ? "источник подключён" : "можно добавить позже"}</b></p>
              <p><i>✓</i><span>assistant.deployed</span><b>бот #{launchReport.id}</b></p>
              <p><i>✓</i><span>widget.generated</span><b>код готов</b></p>
            </div>
            <div className="launch-code"><span>&lt;/&gt;</span><code>{launchReport.widget || "Виджет готов к подключению"}</code></div>
            <div className="launch-actions">
              <button className="ghost-button" onClick={() => copyWidgetCode(launchReport.id)}><span className="play-icon">&lt;/&gt;</span> Скопировать код</button>
              <button className="primary-button" onClick={() => {
                setLaunchReport(null);
                openDashboard();
              }}>Открыть кабинет <span>→</span></button>
            </div>
          </section>
        </div>
      )}

      {builderOpen && (
        <div
          className="overlay builder-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Конструктор AI-бота"
        >
          <button
            className="overlay-backdrop"
            onClick={() => setBuilderOpen(false)}
            aria-label="Закрыть"
          />
          <section className="builder-modal">
            <header>
              <div className="brand">
                <BrandMark />
                <span>
                  neurova<span className="brand-dot">.</span>
                </span>
              </div>
              <div className="builder-steps">
                <span className={builderStep >= 1 ? "on" : ""}>01 Роль</span>
                <i />
                <span className={builderStep >= 2 ? "on" : ""}>
                  02 Личность
                </span>
                <i />
                <span className={builderStep >= 3 ? "on" : ""}>03 Запуск</span>
              </div>
              {builderStep === 3 && (
                <button
                  className="builder-header-publish"
                  disabled={saving}
                  onClick={publishBot}
                >
                  {saving ? "Создаём…" : "Создать AI"} <span>→</span>
                </button>
              )}
              <button
                className="modal-close"
                onClick={() => setBuilderOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="builder-content">
              <div className="builder-form">
                {builderStep === 1 && (
                  <>
                    <span className="section-kicker">ШАГ 01</span>
                    <h2>
                      Кого вы
                      <br />
                      <em>создаёте?</em>
                    </h2>
                    <p>Выберите основу — всё остальное можно изменить позже.</p>
                    <div className="template-options">
                      {agents.map((agent) => (
                        <button
                          className={
                            activeAgent.id === agent.id
                              ? "template active"
                              : "template"
                          }
                          key={agent.id}
                          onClick={() => chooseAgent(agent)}
                        >
                          <span
                            className={`agent-icon small ${agent.gradient}`}
                          >
                            {agent.icon}
                          </span>
                          <span>
                            <b>{agent.title}</b>
                            <small>{agent.label}</small>
                          </span>
                          <i>✓</i>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {builderStep === 2 && (
                  <>
                    <span className="section-kicker">ШАГ 02</span>
                    <h2>
                      Добавьте
                      <br />
                      <em>характер.</em>
                    </h2>
                    <p>
                      Задайте имя, тон общения и визуальный стиль будущего
                      ассистента.
                    </p>
                    <label className="builder-label">
                      Имя ассистента
                      <input
                        value={botName}
                        onChange={(event) => setBotName(event.target.value)}
                        placeholder="Например, Nova"
                      />
                    </label>
                    <label className="builder-label">
                      Стиль общения
                      <select
                        value={botTone}
                        onChange={(event) => setBotTone(event.target.value)}
                      >
                        <option>Дружелюбный эксперт</option>
                        <option>Лаконичный профессионал</option>
                        <option>Энергичный креатор</option>
                        <option>Заботливый наставник</option>
                      </select>
                    </label>
                    <div className="color-picks">
                      <span>Цвет энергии</span>
                      {Object.keys(energyColors).map((color) => (
                        <button
                          type="button"
                          aria-label={`Цвет ${color}`}
                          className={`pick ${color} ${botColor === color ? "active" : ""}`}
                          key={color}
                          onClick={() => setBotColor(color)}
                        />
                      ))}
                    </div>
                    <div className="avatar-picks">
                      <span>AI-аватар</span>
                      {[['crystal', '✦', 'Кристалл'], ['orbit', '◎', 'Орбита'], ['mascot', '◕', 'Маскот'], ['neon', '◈', 'Неон']].map(([id, icon, label]) => (
                        <button key={id} type="button" className={botAvatar === id ? "active" : ""} onClick={() => setBotAvatar(id)}>
                          <b className={`avatar-mark ${id}`}>{icon}</b><small>{label}</small>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {builderStep === 3 && (
                  <>
                    <span className="section-kicker">ШАГ 03</span>
                    <h2>
                      Почти
                      <br />
                      <em>готово.</em>
                    </h2>
                    <p>
                      Ваш AI будет создан в плане <b>{chosenPlan}</b>. В
                      демо-версии вы получите готовый код виджета для сайта.
                    </p>
                    <div className="launch-preview">
                      <span className={`agent-icon ${activeAgent.gradient}`}>
                        {activeAgent.icon}
                      </span>
                      <div>
                        <b>{botName || "Ваш AI"}</b>
                        <small>{botTone}</small>
                      </div>
                      <i>● Online</i>
                    </div>
                    <label
                      className={`knowledge-drop ${knowledgeScanning ? "scanning" : ""}`}
                    >
                      <span>⌘</span>
                      <div>
                        <b>{knowledgeFileName || "База знаний"}</b>
                        <small>
                          {knowledgeScanning
                            ? "AI индексирует документ и строит базу знаний…"
                            : knowledgeFileName
                              ? "Документ подключён к AI-боту"
                              : "Добавьте PDF, TXT или MD-файл до 5 МБ"}
                        </small>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
                        onChange={attachKnowledge}
                      />
                      <i>{knowledgeScanning ? "⌁" : "+"}</i>
                      <em className="knowledge-scan" aria-hidden="true" />
                    </label>
                    <div className="greeting-lab">
                      <div><span>GEMINI WELCOME LAB</span><b>Приветствие и быстрые вопросы</b></div>
                      <button type="button" onClick={generateGreeting} disabled={greetingBusy}>{greetingBusy ? "Генерируем…" : "✦ Сгенерировать"}</button>
                      {generatedGreeting && <p>{generatedGreeting}</p>}
                      {widgetReplies.length > 0 && <div>{widgetReplies.map((item) => <small key={item}>{item}</small>)}</div>}
                    </div>
                    <div className="scenario-builder">
                      <span>СЦЕНАРИЙ ДИАЛОГА</span>
                      <div>{scenarioSteps.map((step, index) => <button type="button" key={step} onClick={() => setScenarioSteps((steps) => [...steps.slice(0, index), ...steps.slice(index + 1), step])}><i>0{index + 1}</i><b>{step}</b><em>→</em></button>)}</div>
                    </div>
                  </>
                )}
                <div className="builder-actions">
                  {builderStep > 1 && (
                    <button
                      className="back-button"
                      onClick={() => setBuilderStep((step) => step - 1)}
                    >
                      ← Назад
                    </button>
                  )}
                  <button
                    className="primary-button"
                    disabled={saving}
                    onClick={() =>
                      builderStep < 3
                        ? setBuilderStep((step) => step + 1)
                        : publishBot()
                    }
                  >
                    {saving
                      ? "Создаём…"
                      : builderStep < 3
                        ? "Продолжить"
                        : "Создать AI"}{" "}
                    <span>→</span>
                  </button>
                </div>
              </div>
              <aside
                className="live-preview"
                style={{ "--bot-accent": energyColors[botColor] }}
              >
                <span className="preview-label">ПРЕДПРОСМОТР · LIVE</span>
                <div className="preview-chat">
                  <div className={`preview-head ${activeAgent.gradient}`}>
                    <span>{activeAgent.icon}</span>
                    <div>
                      <b>{botName || "Nova"}</b>
                      <small>
                        <i /> Сейчас в сети
                      </small>
                    </div>
                    <em>● LIVE</em>
                  </div>
                  <div className="preview-body">
                    <p>Здравствуйте! Я {botName || "Nova"}.</p>
                    <p>Я ваш {botTone.toLowerCase()}. Чем могу помочь?</p>
                  </div>
                  <div className="preview-input">
                    Напишите сообщение <b>↑</b>
                  </div>
                </div>
                <p>Имя, тон и цвет применяются мгновенно</p>
              </aside>
            </div>
          </section>
        </div>
      )}

      {dashboardOpen && (
        <div
          className="overlay dashboard-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Личный кабинет"
        >
          <button
            className="overlay-backdrop"
            onClick={() => setDashboardOpen(false)}
            aria-label="Закрыть"
          />
          <section className="dashboard-modal">
            <aside className="dashboard-sidebar">
              <div className="brand">
                <BrandMark />
                <span>
                  neurova<span className="brand-dot">.</span>
                </span>
              </div>
              <div className="dashboard-nav">
                <button
                  className={dashboardTab === "bots" ? "active" : ""}
                  onClick={() => switchDashboardTab("bots")}
                >
                  <span>⌂</span> Мои AI
                </button>
                <button
                  className={dashboardTab === "analytics" ? "active" : ""}
                  onClick={() => switchDashboardTab("analytics")}
                >
                  <span>⌁</span> Аналитика
                </button>
                <button
                  className={dashboardTab === "settings" ? "active" : ""}
                  onClick={() => switchDashboardTab("settings")}
                >
                  <span>⚙</span> Настройки
                </button>
                <button
                  className={dashboardTab === "telegram" ? "active" : ""}
                  onClick={() => switchDashboardTab("telegram")}
                >
                  <span>✈</span> Telegram
                </button>
              </div>
              <div className="plan-mini">
                <span>ТЕКУЩИЙ ПЛАН</span>
                <b>{userPlan}</b>
                <small>
                  {analytics.bots} из {analytics.limit} AI-ботов
                </small>
                <button
                  onClick={() => {
                    setDashboardOpen(false);
                    scrollTo("plans");
                  }}
                >
                  Улучшить план →
                </button>
              </div>
              <button className="logout-button" onClick={logout}>
                Выйти из аккаунта
              </button>
            </aside>
            <div className="dashboard-main">
              <header className="dashboard-head">
                <div>
                  <span className="section-kicker">AI WORKSPACE</span>
                  <h2>
                    {selectedBot ? selectedBot.name : "Ваши AI-ассистенты"}
                  </h2>
                </div>
                <div>
                  <button
                    className="dashboard-close"
                    onClick={() => setDashboardOpen(false)}
                  >
                    ×
                  </button>
                  {!selectedBot && (
                    <button
                      className="dashboard-create"
                      onClick={() => {
                        setDashboardOpen(false);
                        openBuilder();
                      }}
                    >
                      + Создать AI
                    </button>
                  )}
                </div>
              </header>
              {dashboardTab === 'analytics' && <section className="workspace-panel"><span className="section-kicker">LIVE ANALYTICS</span><h3>Использование AI</h3><div className="workspace-metrics"><b>{analytics.usedMessages || analytics.dialogs || 0}<small>сообщений в этом месяце</small></b><b>{analytics.messages || '—'}<small>лимит тарифа</small></b><b>{analytics.bots}<small>активных ботов</small></b></div><div className="usage-bars">{(analytics.daily?.length ? analytics.daily : [{ day: 'Сегодня', total: analytics.dialogs || 0 }]).map((item) => <div key={item.day}><i style={{ height: `${Math.max(12, Math.min(100, item.total * 18))}%` }} /><small>{String(item.day).slice(-2)}</small></div>)}</div><p className="panel-note">Данные строятся из реальных сообщений, сохранённых в SQLite.</p></section>}
              {dashboardTab === 'analytics' && <section className="analytics-story"><div className="journey-line"><span>Посетитель</span><i>→</i><span>Вопрос</span><i>→</i><span>Ответ AI</span><i>→</i><span>Заявка</span></div><div className="event-feed"><div><span className="section-kicker">ACTIVITY STREAM</span><h3>Лента событий</h3></div>{(analytics.events?.length ? analytics.events : [{ type: 'ready', detail: 'AI-пространство готово к первому событию' }]).map((event, index) => <article key={`${event.detail}-${index}`}><i>{event.type === 'dialog' ? '◌' : event.type === 'bot' ? '✦' : event.type === 'telegram' ? '✈' : '✓'}</i><div><b>{event.detail}</b><small>{event.createdAt ? new Date(`${event.createdAt}Z`).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : 'сейчас'}</small></div></article>)}</div></section>}
              {dashboardTab === 'settings' && <section className="workspace-panel"><span className="section-kicker">PROFILE & BILLING</span><h3>Профиль и тариф</h3><label className="workspace-field">Отображаемое имя<input value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Как вас называть?" /></label><button className="workspace-save" onClick={saveProfile}>Сохранить профиль</button><div className="plan-picker">{['Free', 'Studio', 'Scale'].map((plan) => <button key={plan} className={userPlan === plan ? 'active' : ''} onClick={() => changePlan(plan)}><b>{plan}</b><small>{plan === 'Free' ? '1 бот · 30 сообщений' : plan === 'Studio' ? '3 бота · 1 000 сообщений' : '10 ботов · 10 000 сообщений'}</small></button>)}</div><p className="panel-note">Смена тарифа работает в учебном режиме; платёжный шлюз для дипломной версии не требуется.</p></section>}
              {dashboardTab === 'telegram' && <section className="workspace-panel"><span className="section-kicker">TELEGRAM CHANNEL</span><h3>Подключите AI к Telegram</h3><p className="panel-note">{telegramEnabled ? 'Выберите бота: ссылка будет скопирована, а пользователь подключит чат через Start.' : 'Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_BOT_USERNAME в server/.env, затем перезапустите API.'}</p><div className="telegram-bots">{bots.map((bot) => <button key={bot.id} onClick={() => createTelegramLink(bot.id)}><span>✦</span><b>{bot.name}</b><small>Создать ссылку подключения →</small></button>)}</div>{telegramLinks.length > 0 && <div className="telegram-status">{telegramLinks.map((link) => <p key={link.code}><i className={link.connectedAt ? 'on' : ''} /> {link.botName}: {link.connectedAt ? 'чат подключён' : 'ожидает Start'}</p>)}</div>}</section>}
              {dashboardTab === 'bots' && (selectedBot ? (
                <section className="bot-console">
                  <button
                    className="console-back"
                    onClick={() => setSelectedBot(null)}
                  >
                    ← Все AI-ассистенты
                  </button>
                  <div className="console-grid">
                    <div className="console-chat">
                      <div className="console-chat-head">
                        <span className="console-avatar">
                          {agents.find(
                            (item) =>
                              item.id ===
                              (selectedBot.templateId ||
                                selectedBot.template_id),
                          )?.icon || "✦"}
                        </span>
                        <div>
                          <b>{selectedBot.name}</b>
                          <small>
                            <i /> Тестовый режим
                          </small>
                        </div>
                        <span>Работает</span>
                      </div>
                      <div className="console-messages">
                        {botMessages.map((message, index) => (
                          <div
                            className={`console-message ${message.from}`}
                            key={`${message.text}-${index}`}
                          >
                            {message.text}
                            {message.source && (
                              <small>⌘ Источник: {message.source}</small>
                            )}
                          </div>
                        ))}
                        {botReplying && (
                          <div className="console-message bot typing-message">
                            <i />
                            <i />
                            <i />
                          </div>
                        )}
                      </div>
                      <form onSubmit={sendBotMessage} className="console-form">
                        <input
                          value={botDraft}
                          onChange={(event) => setBotDraft(event.target.value)}
                          placeholder="Спросите вашего AI…"
                        />
                        <button type="submit">↑</button>
                      </form>
                    </div>
                    <aside className="console-info">
                      <span className="section-kicker">НАСТРОЙКИ</span>
                      <h3>{selectedBot.tone}</h3>
                      <p>
                        Бот отвечает по загруженной базе знаний и сохраняет
                        историю диалога.
                      </p>
                      <button onClick={() => copyWidgetCode(selectedBot.id)}>
                        Скопировать код виджета
                      </button>
                      <section className="quality-card" aria-label="Оценка готовности AI">
                        <div className="quality-card-head">
                          <span>AI READINESS</span>
                          <b>{selectedBot.hasKnowledge ? 92 : 68}<small>/ 100</small></b>
                        </div>
                        <p>Оценка строится по реальным настройкам этого ассистента.</p>
                        <div className="quality-list">
                          <div><span>Роль и характер</span><i style={{ "--quality": "100%" }} /></div>
                          <div><span>База знаний</span><i style={{ "--quality": selectedBot.hasKnowledge ? "100%" : "28%" }} /></div>
                          <div><span>Виджет для сайта</span><i style={{ "--quality": "78%" }} /></div>
                        </div>
                        {!selectedBot.hasKnowledge && <button className="quality-tip" onClick={() => setToast("Добавьте PDF, TXT или MD при создании следующего AI — это заметно повысит качество ответов.")}>Как повысить оценку →</button>}
                      </section>
                    </aside>
                  </div>
                </section>
              ) : (
                <>
                  <section className="dashboard-stats">
                    <article>
                      <span>АКТИВНЫЕ AI</span>
                      <b>{analytics.bots}</b>
                      <small>из {analytics.limit} доступных</small>
                    </article>
                    <article>
                      <span>ДИАЛОГИ</span>
                      <b>{analytics.dialogs}</b>
                      <small>сообщений пользователей</small>
                    </article>
                    <article>
                      <span>БАЗА ЗНАНИЙ</span>
                      <b>{analytics.knowledgeSources}</b>
                      <small>источников подключено</small>
                    </article>
                  </section>
                  <section className="bots-area">
                    <div className="bots-area-head">
                      <div>
                        <h3>Мои ассистенты</h3>
                        <p>
                          Протестируйте бота или откройте код для вставки на
                          сайт.
                        </p>
                      </div>
                    </div>
                    {botsLoading ? (
                      <div className="empty-bots">
                        Загружаем ваших AI-ассистентов…
                      </div>
                    ) : bots.length === 0 ? (
                      <div className="empty-bots">
                        <div className="empty-orbit" aria-hidden="true">
                          <i />
                          <i />
                          <span>✦</span>
                        </div>
                        <span className="empty-kicker">ПРОСТРАНСТВО ДЛЯ ИДЕИ</span>
                        <b>Ваш первый AI ждёт форму.</b>
                        <p>
                          Выберите роль, стиль общения и добавьте знания — это
                          займёт пару минут.
                        </p>
                        <div className="empty-ideas" aria-hidden="true">
                          <span>Поддержка</span><span>Продажи</span><span>Обучение</span>
                        </div>
                        <button
                          onClick={() => {
                            setDashboardOpen(false);
                            openBuilder();
                          }}
                        >
                          Создать первого AI →
                        </button>
                      </div>
                    ) : (
                      <div className="saved-bots">
                        {bots.map((bot) => {
                          const template =
                            agents.find(
                              (item) =>
                                item.id === (bot.templateId || bot.template_id),
                            ) || agents[0];
                          return (
                            <article key={bot.id} className="saved-bot">
                              <span
                                className={`agent-icon ${template.gradient}`}
                              >
                                {template.icon}
                              </span>
                              <div className="saved-bot-name">
                                <small>{template.label}</small>
                                <h3>{bot.name}</h3>
                                <p>{bot.tone}</p>
                              </div>
                              <span className="online-state">
                                <i /> Online
                              </span>
                              <div className="saved-bot-actions">
                                <button onClick={() => chooseBot(bot)}>
                                  Тестировать
                                </button>
                                <button onClick={() => copyWidgetCode(bot.id)}>
                                  Код ↗
                                </button>
                                <button onClick={() => {
                                  navigator.clipboard?.writeText(`${window.location.origin}/bot/${bot.id}`);
                                  setToast("Ссылка на публичную страницу AI скопирована.");
                                }}>
                                  Страница ↗
                                </button>
                                <button className="delete-bot-button" onClick={() => deleteBot(bot)}>
                                  Удалить
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className={`numi ${petOpen ? "open" : ""} mood-${petMood}`}>
        <button
          className="numi-orb"
          onClick={() => setPetOpen((value) => {
            if (!value) {
              const phrases = ["Я вижу потенциал в этом AI. Добавьте знания — и он станет точнее.", "Маленький секрет: качественная база знаний важнее длинного промпта.", "Хотите эффект на защите? Откройте Демо-режим и покажите живой чат.", "Я Numi. Мне нравятся боты с характером и хорошими вопросами ✦"];
              setPetText(phrases[Math.floor(Math.random() * phrases.length)]);
            }
            return !value;
          })}
          aria-label="Открыть помощника Numi"
        >
          <i />
          <i className="numi-orbit orbit-two" />
          <span><em>◕</em><em>◕</em></span>
          <b>✦</b>
          <strong>✦</strong>
        </button>
        {petOpen && (
          <aside className="numi-card">
            <button className="numi-close" onClick={() => setPetOpen(false)}>
              ×
            </button>
            <small>NUMI / ВАШ AI-СПУТНИК</small>
            <span className="numi-status"><i /> {petMood === "creative" ? "думает о сценарии" : petMood === "focus" ? "изучает кабинет" : petMood === "curious" ? "ждёт вашу идею" : "рядом и готов помочь"}</span>
            <h3>Чем помочь в Neurova?</h3>
            <p>{petText}</p>
            <div>
              <button
                onClick={() => {
                  setPetText(
                    "Чтобы создать бота: нажмите «Создать AI», выберите роль, укажите стиль и добавьте знания.",
                  );
                  scrollTo("top");
                }}
              >
                Создать AI
              </button>
              <button
                onClick={() => {
                  setPetText(
                    "Кабинет открывается кнопкой «Кабинет» в верхнем меню. Там доступны тесты ботов и код виджета.",
                  );
                  openDashboard();
                }}
              >
                Открыть кабинет
              </button>
              <button
                onClick={() => {
                  setPetText(
                    "Для Telegram создайте бота в @BotFather, добавьте токен в server/.env и сгенерируйте персональную ссылку в кабинете.",
                  );
                  setDashboardTab("telegram");
                  openDashboard();
                }}
              >
                Подключить Telegram
              </button>
            </div>
          </aside>
        )}
      </div>
      {toast && (
        <div className="toast">
          <span>✦</span>
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
