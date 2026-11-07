(() => {
  'use strict';

  const DATA = Array.isArray(window.STRATEGIES) ? window.STRATEGIES : [];
  const V = window.AL101_VISUALS;
  const CATEGORIES = window.STRATEGY_CATEGORIES || {};
  const colorStyle = s => {const c = V.category(s); return `--cat-color:${c.color};--cat-soft:${c.light};`;};
  const FAV_KEY = 'active-learning-favs-v2';
  const THEME_KEY = 'active-learning-theme-v2';
  const SHARE_KEY = 'active-learning-share-sections-v1';

  const state = {
    onlyFavorites: false,
    favorites: new Set(safeJSON(safeRead(FAV_KEY), [])),
    currentId: null,
    shareStrategyId: null,
    shareSelection: safeJSON(safeRead(SHARE_KEY), { idea:true, steps:true, example:true, tools:false, details:false, tip:false, source:false })
  };

  const el = {
    search: byId('searchInput'),
    goal: byId('goalFilter'),
    category: byId('categoryFilter'),
    time: byId('timeFilter'),
    stage: byId('stageFilter'),
    grid: byId('strategyGrid'),
    info: byId('resultsInfo'),
    empty: byId('emptyState'),
    all: byId('allTab'),
    favs: byId('favTab'),
    dialog: byId('strategyDialog'),
    content: byId('dialogContent'),
    theme: byId('themeBtn')
  };

  function byId(id) { return document.getElementById(id); }
  function safeJSON(text, fallback) {
    try { return text ? JSON.parse(text) : fallback; } catch { return fallback; }
  }
  function save(key, value) { try { localStorage.setItem(key, value); } catch {} }
  function safeRead(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function norm(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[ىئ]/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/[\u064B-\u0652]/g, '')
      .trim();
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  }
  function timeGroup(minutes) {
    if (minutes <= 10) return 'short';
    if (minutes <= 20) return 'medium';
    return 'long';
  }
  function timeLabel(minutes) {
    return timeGroup(minutes) === 'short' ? 'سريعة ومباشرة' : timeGroup(minutes) === 'medium' ? 'متوسطة' : 'نشاط ممتد';
  }

  const TOOL_LIBRARY = [
    { match: ['ورق', 'ورقة', 'أوراق'], icon: '📄', label: 'ورقة عمل', hint: 'جهّز ورقة واضحة تتضمن المطلوب أو مساحة لتدوين الأفكار.', note: 'تنظيم' },
    { match: ['بطاقات', 'بطاقة', 'كروت'], icon: '🗂️', label: 'بطاقات', hint: 'استخدم بطاقات قصيرة ليسهل السحب والتصنيف والمناقشة.', note: 'ترتيب' },
    { match: ['سبورة'], icon: '🧑‍🏫', label: 'سبورة', hint: 'اكتب السؤال أو التعليمات الرئيسية أمام الجميع.', note: 'عرض' },
    { match: ['أقلام', 'قلم', 'ماركر'], icon: '🖍️', label: 'أقلام', hint: 'وفر أقلامًا للكتابة أو التمييز أو رسم الروابط.', note: 'تدوين' },
    { match: ['مؤقت', 'ساعة'], icon: '⏱️', label: 'مؤقت', hint: 'اضبط الزمن لكل مرحلة حتى يحافظ النشاط على إيقاعه.', note: 'ضبط الوقت' },
    { match: ['ملصقات', 'لاصقة', 'ستيكر'], icon: '🏷️', label: 'ملصقات', hint: 'تساعد في الترميز البصري والتجميع السريع.', note: 'ترميز' },
    { match: ['جهاز', 'حاسوب', 'هاتف', 'تابلت'], icon: '💻', label: 'جهاز', hint: 'استخدمه للعرض أو التفاعل أو التوثيق السريع.', note: 'تقنية' },
    { match: ['عرض', 'شاشة', 'بروجكتر', 'شريحة'], icon: '📽️', label: 'عرض مرئي', hint: 'اعرض السؤال أو النماذج أو التعليمات بصريًا.', note: 'إيضاح' },
    { match: ['صورة', 'صور'], icon: '🖼️', label: 'صور', hint: 'الصور تختصر الفكرة وتثير النقاش وتدعم الفهم.', note: 'إثارة' },
    { match: ['نص', 'قراءة', 'مقال'], icon: '📚', label: 'نص/قراءة', hint: 'اختر نصًا مناسبًا لمستوى الطلاب ومباشر الهدف.', note: 'محتوى' },
    { match: ['جدول', 'منظم'], icon: '📋', label: 'منظم بصري', hint: 'يساعد في تقسيم الأفكار أو المقارنة أو التلخيص.', note: 'تنظيم' },
    { match: ['كرة', 'مجسم'], icon: '🔵', label: 'أداة حركية', hint: 'استخدمها لكسر الجمود وتحريك المشاركة.', note: 'حركة' },
    { match: ['سؤال'], icon: '❓', label: 'سؤال محفز', hint: 'ابدأ بسؤال يفتح التفكير ولا يقتصر على إجابة واحدة.', note: 'إطلاق' },
    { match: ['ملف', 'مغلف', 'صندوق'], icon: '📦', label: 'حاوية نشاط', hint: 'ضع فيها البطاقات أو المهمات أو الأدلة.', note: 'تجهيز' },
    { match: ['لوحة', 'جدارية'], icon: '🧱', label: 'لوحة عرض', hint: 'تعرض نتائج المجموعات وتُسهل المقارنة.', note: 'إبراز' }
  ];

  const GOAL_META = [
    { match: ['تفكير', 'حل المشكلات'], icon: '🧠', text: 'تنشّط التفكير العميق وتمنح الطالب فرصة للتأمل.' },
    { match: ['مناقشة', 'تواصل'], icon: '🗣️', text: 'تعتمد على الحوار وتبادل الرأي بصورة آمنة وموجَّهة.' },
    { match: ['تعاون', 'مجموعات'], icon: '🤝', text: 'تعزز العمل الجماعي وتقاسم الأدوار والمسؤولية.' },
    { match: ['تقويم', 'تغذية'], icon: '✅', text: 'تفيد في التحقق السريع من الفهم وتقديم تغذية راجعة.' },
    { match: ['إبداع', 'ابتكار'], icon: '✨', text: 'تفتح المجال للأفكار الجديدة والتعبير بطرائق متنوعة.' },
    { match: ['استرجاع', 'مراجعة'], icon: '🔁', text: 'ممتازة للمراجعة واستدعاء المعلومات وتثبيت التعلم.' }
  ];

  function unique(list) { return [...new Set(list.filter(Boolean))]; }
  function getToolMeta(rawTool) {
    const tool = String(rawTool || '').trim();
    const hit = TOOL_LIBRARY.find(item => item.match.some(keyword => tool.includes(keyword)));
    return hit ? { ...hit, raw: tool } : { icon: '🧰', label: tool, hint: 'أداة مساندة تسهّل تنفيذ الاستراتيجية داخل الصف.', note: 'تطبيق', raw: tool };
  }
  function getGoalMeta(goal) {
    const hit = GOAL_META.find(item => item.match.some(keyword => String(goal || '').includes(keyword)));
    return hit || { icon: '🎯', text: 'استراتيجية عملية تساعد المعلم على إدارة المشاركة وتحقيق هدف الدرس.' };
  }
  function stageTone(stages) {
    const list = stages || [];
    if (list.length === 3) return 'مرنة لمختلف المراحل';
    if (list.includes('ابتدائي') && !list.includes('ثانوي')) return 'مناسبة لبدايات التعلم';
    if (list.includes('ثانوي') && !list.includes('ابتدائي')) return 'تلائم النقاش الأعمق';
    return 'قابلة للتكييف';
  }
  function inferRole(title, desc, index) {
    const source = `${title} ${desc}`;
    if (/اطرح|وزع|وجه|حدد|اشرح|اعرض|اطلب|قسم|اختر/.test(source)) return 'المعلم يقود';
    if (/ناقش|فكر|اكتب|شارك|تحاور|بادل|اعرضوا|لخص|رتب|استنتج/.test(source)) return 'الطلاب ينجزون';
    if (index === 0) return 'تهيئة النشاط';
    if (index === 1) return 'انطلاق التفاعل';
    return 'تطبيق ومتابعة';
  }
  function stepSignal(title, desc) {
    const source = `${title} ${desc}`;
    if (/فكر|استنتج|حلل/.test(source)) return ['🧠', 'فكر'];
    if (/ناقش|تحاور|تبادل|شارك/.test(source)) return ['💬', 'ناقش'];
    if (/اكتب|سجل|دون|لخص/.test(source)) return ['✍️', 'دوّن'];
    if (/اعرض|قدم|شارك الصف/.test(source)) return ['📣', 'اعرض'];
    if (/رتب|صنف|جمع/.test(source)) return ['🧩', 'نظم'];
    return ['✨', 'نفّذ'];
  }
  function shorten(text, max = 96) {
    const t = String(text || '');
    return t.length > max ? `${t.slice(0, max - 1)}…` : t;
  }
  function titleToFlowLabel(text) {
    const t = String(text || '');
    if (t.length <= 14) return t;
    const parts = t.split(/\s+/);
    return parts.slice(0, 2).join(' ');
  }

  function strategyPreviewTags(strategy) {
    const meta = getGoalMeta(strategy.goal);
    return unique([
      `${meta.icon} ${timeLabel(strategy.minutes)}`,
      `👥 ${stageTone(strategy.stages)}`,
      `🧰 ${Math.min(strategy.tools.length, 5)} أدوات تقريبًا`
    ]);
  }

  function createIllustration(strategy, large = false) {
    return V.diagram(strategy, { large });
  }

  function favoriteButton(strategy) {
    const fav = state.favorites.has(strategy.id);
    return `<button class="fav-btn ${fav ? 'is-fav' : ''}" type="button" data-fav="${strategy.id}" aria-label="${fav ? 'إزالة من' : 'إضافة إلى'} المفضلة: ${escapeHTML(strategy.name)}" aria-pressed="${fav}" title="${fav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}">${fav ? '♥' : '♡'}</button>`;
  }

  function strategyCardVisual(strategy) {
    return `<div class="diagram-wrap">${createIllustration(strategy)}</div>`;
  }

  function categoryLegend() {
    const all = Object.entries(CATEGORIES);
    const counts = Object.fromEntries(all.map(([key]) => [key, DATA.filter(s => s.visual?.category === key).length]));
    const container = byId('categoryLegend');
    if (!container) return;
    container.innerHTML = `<span class="legend-label">دليل الألوان:</span>` + all.map(([key, c]) => `
      <button class="legend-chip ${el.category.value === key ? 'selected' : ''}" type="button" data-category="${key}" style="--cat-color:${c.color};--cat-soft:${c.light};" aria-pressed="${el.category.value===key}"><span class="legend-dot"></span>${escapeHTML(c.label)} <small>${counts[key]}</small></button>`).join('');
  }

  function render() {
    const query = norm(el.search.value);
    const filtered = DATA.filter(strategy => {
      const haystack = norm([
        strategy.name,
        strategy.english,
        strategy.summary,
        strategy.goal,
        strategy.visual?.example?.subject,
        strategy.visual?.example?.context,
        strategy.visual?.example?.grade,
        strategy.visual?.example?.topic,
        strategy.visual?.example?.prompt,
        strategy.visual?.example?.procedure,
        strategy.tools.join(' '),
        strategy.steps.flat().join(' ')
      ].join(' '));
      return (!state.onlyFavorites || state.favorites.has(strategy.id)) &&
        (!el.goal.value || strategy.goal === el.goal.value) &&
        (!el.category.value || strategy.visual?.category === el.category.value) &&
        (!el.time.value || timeGroup(strategy.minutes) === el.time.value) &&
        (!el.stage.value || strategy.stages.includes(el.stage.value)) &&
        (!query || haystack.includes(query));
    });

    el.grid.innerHTML = filtered.map(strategy => `
      <article class="strategy-card" style="${colorStyle(strategy)}" tabindex="0" data-card="${strategy.id}" aria-label="فتح دليل ${escapeHTML(strategy.name)}">
        <div class="card-top">
          <span class="card-num">الاستراتيجية ${strategy.id}</span>
          ${favoriteButton(strategy)}
        </div>
        <div class="card-visual">${strategyCardVisual(strategy)}</div>
        <span class="category-ribbon"><span class="category-bullet"></span>${escapeHTML(V.category(strategy).label)}</span>
        <h3>${escapeHTML(strategy.name)}</h3>
        <p class="en-name" lang="en">${escapeHTML(strategy.english)}</p>
        <p class="summary">${escapeHTML(strategy.summary)}</p>
        <p class="card-example"><strong>مثال توضيحي:</strong> ${escapeHTML(strategy.visual?.example?.subject || '')} • ${escapeHTML(strategy.visual?.example?.grade || '')} — ${escapeHTML(strategy.visual?.example?.topic || '')}</p>
        <div class="card-meta">
          <span class="chip">⏱ ${strategy.minutes} دقائق</span>
          <span class="chip">${escapeHTML(strategy.goal)}</span>
        </div>
        <div class="card-bottom">
          <span>${escapeHTML(strategy.stages.join(' • '))}</span>
          <button class="open-btn" type="button" data-open="${strategy.id}" aria-label="عرض دليل ${escapeHTML(strategy.name)}">استكشف الدليل ←</button>
        </div>
      </article>
    `).join('');

    el.info.textContent = `نعرض ${filtered.length} من أصل ${DATA.length} استراتيجية متاحة`;
    el.empty.hidden = filtered.length !== 0;
    syncCounts();
    categoryLegend();
  }

  function syncCounts() {
    const favCount = state.favorites.size;
    byId('favCount').textContent = favCount;
    byId('favTabCount').textContent = favCount;
    byId('loadedCount').textContent = DATA.length;
    byId('stepsCount').textContent = DATA.reduce((sum, item) => sum + item.steps.length, 0);
  }

  function toggleFavorite(id) {
    if (!DATA.some(item => item.id === id)) return;
    if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
    save(FAV_KEY, JSON.stringify([...state.favorites]));
    render();
    if (state.currentId === id && el.dialog.open) openGuide(id, false);
  }

  function buildFactCards(strategy) {
    const meta = getGoalMeta(strategy.goal);
    const toolCount = Math.min(strategy.tools.length, 5);
    return [
      { icon: '🎯', title: 'جوهر الاستراتيجية', value: meta.text },
      { icon: '⏱️', title: 'إيقاع التنفيذ', value: `${strategy.minutes} دقائق — ${timeLabel(strategy.minutes)}` },
      { icon: '👥', title: 'المراحل المناسبة', value: `${strategy.stages.join(' • ')} — ${stageTone(strategy.stages)}` },
      { icon: '🧰', title: 'الأدوات المحورية', value: `${toolCount} عناصر أساسية لبدء التطبيق بسرعة.` }
    ].map(card => `
      <div class="fact-card">
        <div class="fact-icon">${card.icon}</div>
        <strong>${escapeHTML(card.title)}</strong>
        <span>${escapeHTML(card.value)}</span>
      </div>
    `).join('');
  }

  function buildToolsGallery(strategy) {
    const tools = strategy.tools.length ? strategy.tools.map(getToolMeta) : [{ icon: '🧰', label: 'أدوات بسيطة', hint: 'يمكن تنفيذها بأدوات صفية اعتيادية.', note: 'مرونة' }];
    return tools.map(tool => `
      <article class="tool-card">
        <div class="tool-icon" aria-hidden="true">${tool.icon}</div>
        <strong>${escapeHTML(tool.raw || tool.label)}</strong>
        <p>${escapeHTML(tool.hint)}</p>
        <span class="tool-mini-note">${escapeHTML(tool.note)}</span>
      </article>
    `).join('');
  }

  function buildVisualFlow(strategy) {
    return strategy.steps.slice(0, 4).map(([title, desc], index) => {
      const signal = stepSignal(title, desc);
      return `
        <article class="flow-box">
          <span class="flow-index">${index + 1}</span>
          <h4>${escapeHTML(titleToFlowLabel(title))}</h4>
          <p>${escapeHTML(shorten(desc, 76))}</p>
          <div class="step-helpers" style="margin-top:10px"><span class="helper-chip">${signal[0]} ${signal[1]}</span></div>
        </article>
      `;
    }).join('');
  }

  function buildStepList(strategy) {
    return strategy.steps.map(([title, desc], index) => {
      const role = inferRole(title, desc, index);
      const signal = stepSignal(title, desc);
      return `
        <article class="step-card">
          <div class="step-marker">
            <div class="step-index">${index + 1}</div>
            <span class="role-badge">${escapeHTML(role)}</span>
          </div>
          <div>
            <strong>${escapeHTML(title)}</strong>
            <p>${escapeHTML(desc)}</p>
            <div class="step-helpers">
              <span class="helper-chip">${signal[0]} ${signal[1]}</span>
              <span class="helper-chip">⏳ ${escapeHTML(index === 0 ? 'بدء النشاط' : index === strategy.steps.length - 1 ? 'إغلاق ومشاركة' : 'متابعة التنفيذ')}</span>
              <span class="helper-chip">👀 ${escapeHTML(index % 2 === 0 ? 'ملاحظة ومتابعة' : 'تفاعل ومشاركة')}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function buildPrepList(strategy) {
    const mainTools = strategy.tools.slice(0, 4).map(tool => `
      <div class="prep-item">
        <span>🧰</span>
        <div><strong>${escapeHTML(tool)}</strong><div>${escapeHTML(getToolMeta(tool).hint)}</div></div>
      </div>`);
    const extra = [
      `<div class="prep-item"><span>🎯</span><div><strong>حدد ناتجًا بسيطًا</strong><div>حدّد ماذا تريد من الطلاب في النهاية: فكرة، إجابة، بطاقة، تلخيص، أو مشاركة شفوية.</div></div></div>`,
      `<div class="prep-item"><span>⏱️</span><div><strong>قسّم الزمن بوضوح</strong><div>ضع لكل جزء من النشاط وقتًا مناسبًا حتى لا يطغى جزء على آخر.</div></div></div>`
    ];
    return [...mainTools, ...extra].join('');
  }

  function buildTeacherNotes(strategy) {
    const noteA = strategy.minutes <= 10 ? 'اجعل التعليمات مختصرة وابدأ بسرعة حتى تحافظ على الحماس.' : 'هيّئ الطلاب أولًا ووزّع الأدوار قبل البدء لتضمن انسياب التنفيذ.';
    const noteB = strategy.stages.includes('ابتدائي') ? 'استخدم مثالًا محسوسًا أو صورة مساعدة خصوصًا مع الصفوف الأولى.' : 'شجّع على التبرير والتفسير لا مجرد الإجابة السريعة.';
    const noteC = strategy.goal.includes('تقويم') ? 'دوّن ملاحظاتك أثناء التطبيق لأن هذه الاستراتيجية مفيدة للتغذية الراجعة الفورية.' : 'راقب التفاعل بين الطلاب، وادعم الخجولين بأسئلة صغيرة أو أدوار واضحة.';
    return [noteA, noteB, noteC].map((note, i) => `
      <div class="note-item">
        <span>${['💡', '👂', '📌'][i]}</span>
        <div>${escapeHTML(note)}</div>
      </div>
    `).join('');
  }

  const SHARE_OPTIONS = [
    { key:'idea', label:'الفكرة المختصرة', icon:'💡', description:'نبذة الاستراتيجية' },
    { key:'steps', label:'خطوات التنفيذ', icon:'🪜', description:'الخطوات مرقمة مع الشرح' },
    { key:'tools', label:'الأدوات المطلوبة', icon:'🧰', description:'قائمة أدوات التجهيز' },
    { key:'example', label:'مثال توضيحي', icon:'📘', description:'المادة والصف والموقف والسؤال والتطبيق والناتج' },
    { key:'details', label:'الهدف والوقت والمراحل', icon:'🎯', description:'معلومات التخطيط السريع' },
    { key:'tip', label:'النصيحة الذهبية', icon:'✨', description:'إرشاد عملي للمعلم' },
    { key:'source', label:'مرجع الاستراتيجيات', icon:'📚', description:'إسناد الكتاب ومصدر المناهج' }
  ];

  function shareText(strategy, selected=state.shareSelection) {
    const ex=strategy.visual?.example;
    const parts=[`🌟 *${strategy.name}*`, `📚 من تطبيق 101 استراتيجية في التعلم النشط`];
    if(selected.idea) parts.push(`💡 *الفكرة:* ${strategy.summary}`);
    if(selected.steps) parts.push(`🪜 *خطوات التنفيذ:*\n${strategy.steps.map(([title, desc],i)=>`${i+1}. *${title}:* ${desc}`).join('\n')}`);
    if(selected.tools) parts.push(`🧰 *الأدوات:* ${strategy.tools.join('، ')||'أدوات صفية بسيطة'}`);
    if(selected.example && ex) parts.push(`📘 *مثال توضيحي:*\n📘 المادة: ${ex.subject} | ${ex.grade}\n📌 الموضوع: ${ex.topic}\n🏫 الموقف: ${ex.context}\n❓ السؤال: ${ex.prompt}\n👩‍🏫 آلية التنفيذ: ${ex.procedure}\n✅ الناتج: ${ex.outcome}`);
    if(selected.details) parts.push(`🎯 *الهدف:* ${strategy.goal}\n⏱ *الوقت المقترح:* ${strategy.minutes} دقائق\n👥 *المراحل:* ${strategy.stages.join(' • ')}`);
    if(selected.tip) parts.push(`✨ *نصيحة للمعلم:* ${strategy.tip}`);
    if(selected.source) parts.push(`📖 *المرجع:* كتاب «101 استراتيجية في التعلم النشط» — تأليف ماشي بن محمد الشمري.`);
    parts.push('إشراف الأحياء بتعليمية البريمي\nإعداد\nد. سمية بنت سالم بن محمد النعيمي\nأ. محمد سيد عبد الستار سليم');
    return parts.join('\n\n');
  }

  function openShareOptions(strategyId) {
    const strategy=DATA.find(s=>s.id===strategyId);
    const dlg=byId('shareDialog');
    if(!strategy||!dlg) return;
    state.shareStrategyId=strategyId;
    byId('shareStrategyName').textContent=strategy.name;
    const opts=byId('shareSections');
    opts.innerHTML=SHARE_OPTIONS.map(opt=>`<label class="share-choice"><input type="checkbox" data-share-key="${opt.key}" ${state.shareSelection[opt.key]?'checked':''}><span class="share-choice-icon">${opt.icon}</span><span class="share-choice-content"><strong>${opt.label}</strong><small>${opt.description}</small></span></label>`).join('');
    updateSharePreview();
    if(!dlg.open)dlg.showModal();
    byId('shareSections').querySelector('input')?.focus();
  }

  function updateSharePreview(){
    const strategy=DATA.find(s=>s.id===state.shareStrategyId);
    if(!strategy)return;
    state.shareSelection=Object.fromEntries(SHARE_OPTIONS.map(opt=>[opt.key,Boolean(byId('shareSections').querySelector(`[data-share-key="${opt.key}"]`)?.checked)]));
    save(SHARE_KEY,JSON.stringify(state.shareSelection));
    const content=shareText(strategy,state.shareSelection);
    byId('sharePreview').value=content;
    const total=SHARE_OPTIONS.filter(opt=>state.shareSelection[opt.key]).length;
    byId('shareSelectionCount').textContent=`اخترت ${total} من ${SHARE_OPTIONS.length} أقسام`;
    byId('shareWaSend').disabled=total===0;
    byId('shareNative').disabled=total===0;
    byId('shareCopy').disabled=total===0;
    byId('shareWarning').hidden=total!==0;
  }

  function setupShare(){
    const dlg=byId('shareDialog');
    if(!dlg)return;
    byId('shareSections').addEventListener('change',updateSharePreview);
    byId('selectAllShare').addEventListener('click',()=>{dlg.querySelectorAll('[data-share-key]').forEach(x=>x.checked=true);updateSharePreview()});
    byId('selectNoneShare').addEventListener('click',()=>{dlg.querySelectorAll('[data-share-key]').forEach(x=>x.checked=false);updateSharePreview()});
    byId('closeShare').addEventListener('click',()=>dlg.close());
    byId('shareCancel').addEventListener('click',()=>dlg.close());
    dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
    byId('shareWaSend').addEventListener('click',()=>{
      const strategy=DATA.find(s=>s.id===state.shareStrategyId);if(!strategy)return;
      const text=shareText(strategy,state.shareSelection);
      window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');
    });
    byId('shareNative').addEventListener('click',async()=>{
      const strategy=DATA.find(s=>s.id===state.shareStrategyId);if(!strategy)return;
      if(!navigator.share){byId('shareStatus').textContent='المشاركة من الجهاز غير متاحة هنا؛ استخدم واتساب أو نسخ النص.';return}
      try{await navigator.share({title:strategy.name,text:shareText(strategy,state.shareSelection)});byId('shareStatus').textContent='تم فتح قائمة المشاركة.';}
      catch(e){if(e.name!=='AbortError')byId('shareStatus').textContent='لم تكتمل المشاركة، جرّب خيار النسخ.'}
    });
    byId('shareCopy').addEventListener('click',async()=>{
      const text=byId('sharePreview').value;
      try{await navigator.clipboard.writeText(text);byId('shareStatus').textContent='✓ تم نسخ الأقسام المحددة';}
      catch{const area=byId('sharePreview');area.focus();area.select();try{document.execCommand('copy');byId('shareStatus').textContent='✓ تم نسخ الأقسام المحددة';}catch{byId('shareStatus').textContent='تعذر النسخ؛ يمكنك تحديد النص ونسخه يدويًا.'}}
    });
  }

  function classroomExample(strategy) {
    const ex = strategy.visual?.example;
    if (!ex) return '';
    return `<section class="example-panel panel" aria-label="مثال توضيحي">
      <div class="example-head"><div><span class="example-kicker">تطبيق فوري قابل للتكييف</span><h3>مثال توضيحي</h3></div><span class="example-badge">نشاط مقترح</span></div>
      <div class="example-subject"><span>📚 ${escapeHTML(ex.subject)}</span><span>🎓 ${escapeHTML(ex.grade||'صف مقترح')}</span><span>📌 ${escapeHTML(ex.topic)}</span></div>
      <p class="oman-context"><strong>🏫 الموقف:</strong> ${escapeHTML(ex.context||'نشاط تطبيقي مرتبط بموضوع الدرس.')}</p>
      <div class="example-prompts">
        <div class="example-unit"><span class="example-number">01</span><div><strong>السؤال أو الموقف</strong><p>${escapeHTML(ex.prompt)}</p></div></div>
        <div class="example-unit"><span class="example-number">02</span><div><strong>هكذا ينفّذها المعلم مع الطلاب</strong><p>${escapeHTML(ex.procedure)}</p></div></div>
        <div class="example-unit"><span class="example-number">03</span><div><strong>الأثر الذي نتحقق منه</strong><p>${escapeHTML(ex.outcome)}</p></div></div>
      </div>
      <p class="example-disclaimer">مثال توضيحي مقترح؛ يمكن تكييف الموقف والصف والموضوع بما يلائم أهداف الدرس، ولا يمثل نقلًا حرفيًا من كتاب مدرسي.</p>
    </section>`;
  }

  function openGuide(id, show = true) {
    const strategy = DATA.find(item => item.id === id);
    if (!strategy) return;
    state.currentId = id;
    const fav = state.favorites.has(id);
    const previewTags = strategyPreviewTags(strategy);

    el.content.innerHTML = `
      <div class="category-banner" style="${colorStyle(strategy)}"><span class="category-bullet"></span> ${escapeHTML(V.category(strategy).label)} <span class="category-banner-number">دليل رقم ${strategy.id}</span></div>
      <section class="dialog-hero" style="${colorStyle(strategy)}">
        <div class="hero-panel">
          <span class="chip">الاستراتيجية رقم ${strategy.id}</span>
          <h2 id="dialogTitle">${escapeHTML(strategy.name)}</h2>
          <p lang="en" dir="ltr" style="text-align:right;color:var(--primary);font-weight:700">${escapeHTML(strategy.english)}</p>
          <p>${escapeHTML(strategy.summary)}</p>
          <div class="dialog-badges" style="margin-top:14px">
            <span class="chip">🎯 ${escapeHTML(strategy.goal)}</span>
            <span class="chip">⏱ ${strategy.minutes} دقائق</span>
            <span class="chip">👥 ${escapeHTML(strategy.stages.join(' • '))}</span>
          </div>
        </div>
        <div class="hero-preview">
          <div class="large-illustration">${createIllustration(strategy, true)}</div>
          <div class="preview-tags">${previewTags.map(tag => `<span class="preview-tag">${escapeHTML(tag)}</span>`).join('')}</div>
          <p class="preview-note">مخطط متجهي خاص بآلية الاستراتيجية؛ يوضح شكل التفاعل وتسلسل الخطوات.</p>
        </div>
      </section>

      <section class="panel" style="margin-top:18px">
        <div class="panel-head">
          <div>
            <h3>الفكرة في لقطة واحدة</h3>
            <p>بطاقات مرئية تختصر الهدف والإيقاع والفئة المناسبة للتطبيق.</p>
          </div>
        </div>
        <div class="infographic-strip">${buildFactCards(strategy)}</div>
      </section>

      ${classroomExample(strategy)}

      <section class="dialog-grid">
        <div class="info-stack">
          <article class="panel">
            <div class="panel-head">
              <div>
                <h3>الأدوات المصوّرة</h3>
                <p>ماذا أحتاج قبل أن أبدأ؟</p>
              </div>
            </div>
            <div class="tool-gallery">${buildToolsGallery(strategy)}</div>
          </article>

          <article class="panel">
            <div class="panel-head">
              <div>
                <h3>آلية الاستخدام السريعة</h3>
                <p>مسار بصري يوضح حركة الاستراتيجية من البداية إلى النهاية.</p>
              </div>
            </div>
            <div class="visual-flow">${buildVisualFlow(strategy)}</div>
          </article>

          <article class="panel">
            <div class="panel-head">
              <div>
                <h3>خطوات التنفيذ التفصيلية</h3>
                <p>عرض مرتب يبيّن دور المعلم والطلاب في كل مرحلة.</p>
              </div>
            </div>
            <div class="step-list">${buildStepList(strategy)}</div>
          </article>
        </div>

        <div class="side-stack">
          <article class="panel">
            <div class="panel-head">
              <div>
                <h3>قبل أن تبدأ</h3>
                <p>تجهيزات بسيطة تجعل التنفيذ أسلس داخل الحصة.</p>
              </div>
            </div>
            <div class="prep-list">${buildPrepList(strategy)}</div>
          </article>

          <article class="panel">
            <div class="panel-head">
              <div>
                <h3>إرشادات تطبيق للمعلم</h3>
                <p>ملحوظات تربوية قصيرة ترفع فاعلية التنفيذ.</p>
              </div>
            </div>
            <div class="teacher-notes">${buildTeacherNotes(strategy)}</div>
          </article>

          <article class="tip-card">
            <div class="tip-mark">✨</div>
            <div>
              <strong>نصيحة ذهبية للمعلم</strong>
              <p>${escapeHTML(strategy.tip)}</p>
            </div>
          </article>
        </div>
      </section>

      <div class="dialog-actions">
        <button id="shareWhatsApp" class="btn primary" type="button">◉ اختر ما تريد مشاركته</button>
        <button id="modalFav" class="btn secondary" type="button" aria-pressed="${fav}">${fav ? '♥ إزالة من المفضلة' : '♡ أضف إلى المفضلة'}</button>
        <button id="copySummary" class="btn secondary" type="button">تحديد أقسام للنسخ</button>
      </div>
      <p class="dialog-note">المصدر الأساسي: كتاب «101 استراتيجية في التعلم النشط»، صفحات PDF ${strategy.sourcePages.join('، ')}. أما المثال التوضيحي والتصنيف والوقت والمرحلة والأدوات التكميلية والرسوم فهي اقتراحات تحريرية من إعداد التطبيق.</p>
    `;

    byId('modalFav').addEventListener('click', () => toggleFavorite(id));
    byId('shareWhatsApp').addEventListener('click',()=>openShareOptions(id));
    byId('copySummary').addEventListener('click',()=>openShareOptions(id));

    if (show && !el.dialog.open) {
      el.dialog.showModal();
      byId('closeDialog').focus();
    }
  }

  function resetFilters() {
    el.search.value = '';
    el.goal.value = '';
    el.category.value = '';
    el.time.value = '';
    el.stage.value = '';
    state.onlyFavorites = false;
    updateTabs();
    render();
  }

  function updateTabs() {
    el.all.classList.toggle('active', !state.onlyFavorites);
    el.favs.classList.toggle('active', state.onlyFavorites);
    el.all.setAttribute('aria-pressed', String(!state.onlyFavorites));
    el.favs.setAttribute('aria-pressed', String(state.onlyFavorites));
  }

  function applyTheme(mode) {
    document.body.classList.toggle('dark', mode === 'dark');
    el.theme.textContent = mode === 'dark' ? '☀' : '☾';
    el.theme.setAttribute('aria-label', mode === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي');
    save(THEME_KEY, mode);
  }

  function setupFilters() {
    const goals = [...new Set(DATA.map(item => item.goal))].sort((a, b) => a.localeCompare(b, 'ar'));
    goals.forEach(goal => {
      const option = document.createElement('option');
      option.value = goal;
      option.textContent = goal;
      el.goal.append(option);
    });

    Object.entries(CATEGORIES).forEach(([key, c]) => { const opt = document.createElement('option'); opt.value = key; opt.textContent = c.label; el.category.append(opt); });

    [el.search, el.goal, el.category, el.time, el.stage].forEach(control => {
      control.addEventListener(control === el.search ? 'input' : 'change', render);
    });

    byId('categoryLegend').addEventListener('click', event => {
      const target = event.target.closest('[data-category]');
      if (!target) return;
      el.category.value = el.category.value === target.dataset.category ? '' : target.dataset.category;
      render();
      el.grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    el.grid.addEventListener('click', event => {
      const fav = event.target.closest('[data-fav]');
      const open = event.target.closest('[data-open]');
      if (fav) toggleFavorite(Number(fav.dataset.fav));
      else if (open) openGuide(Number(open.dataset.open));
      else {
        const card = event.target.closest('[data-card]');
        if (card) openGuide(Number(card.dataset.card));
      }
    });

    el.grid.addEventListener('keydown', event => {
      if (event.target.matches('[data-card]') && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        openGuide(Number(event.target.dataset.card));
      }
    });

    el.all.addEventListener('click', () => { state.onlyFavorites = false; updateTabs(); render(); });
    el.favs.addEventListener('click', () => { state.onlyFavorites = true; updateTabs(); render(); });
    byId('resetBtn').addEventListener('click', resetFilters);
    byId('emptyReset').addEventListener('click', resetFilters);
  }

  function setupDialog() {
    byId('closeDialog').addEventListener('click', () => el.dialog.close());
    el.dialog.addEventListener('click', event => { if (event.target === el.dialog) el.dialog.close(); });
    el.dialog.addEventListener('close', () => { state.currentId = null; });
  }

  function setupThemeAndInstall() {
    applyTheme(safeRead(THEME_KEY) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    el.theme.addEventListener('click', () => applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));

    const installBtn = byId('installBtn');
    const installDialog = byId('installDialog');
    const installNowBtn = byId('installNowBtn');
    const installState = byId('installState');
    let pendingInstallPrompt = null;
    let serviceReady = false;
    const connectionBadge = byId('connectivityStatus');
    function refreshConnection() {
      if (!connectionBadge) return;
      const online = navigator.onLine;
      connectionBadge.textContent = online ? '● متصل' : '● دون إنترنت';
      connectionBadge.classList.toggle('is-offline', !online);
      connectionBadge.title = online ? 'الاتصال متاح' : 'يمكن استخدام المحتوى المحفوظ دون إنترنت';
    }
    window.addEventListener('online', refreshConnection);
    window.addEventListener('offline', refreshConnection);
    refreshConnection();

    const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const hasSecureOrigin = () => window.isSecureContext && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname));

    function refreshInstallStatus() {
      const isLocalFile=location.protocol==='file:';
      const isApple=/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
      const secure=hasSecureOrigin();
      const hasWorker='serviceWorker' in navigator;
      let message='';
      if(isStandalone()){
        message='✓ التطبيق مفتوح في وضع التثبيت بالفعل.';
        installBtn.textContent='✓ التطبيق مثبت';
        installNowBtn.hidden=true;
      }else if(isLocalFile){
        message='⚠ الملف المحلي يسمح بالمعاينة فقط، ولا يمكن تثبيته كتطبيق. ارفع ملفات المشروع إلى GitHub Pages ثم افتح رابط الموقع HTTPS.';
        installNowBtn.hidden=true;
      }else if(!secure){
        message='⚠ التثبيت يحتاج رابطًا آمنًا HTTPS أو بيئة اختبار localhost.';
        installNowBtn.hidden=true;
      }else if(isApple){
        message='📱 على iPhone وiPad: افتح الموقع من Safari ثم اضغط مشاركة ← إضافة إلى الشاشة الرئيسية.';
        installNowBtn.hidden=true;
      }else if(pendingInstallPrompt){
        message='✓ هذا المتصفح أتاح التثبيت المباشر. اضغط «تثبيت الآن».';
        installNowBtn.hidden=false;
      }else{
        message='التطبيق جاهز للعمل كموقع. إن لم يظهر خيار «تثبيت الآن»، افتح قائمة Chrome أو Edge واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».';
        installNowBtn.hidden=true;
      }
      installState.textContent=message;
      const checks=[
        `${secure?'✅':'⚠️'} اتصال آمن: ${secure?'نعم':'مطلوب HTTPS للاستضافة'}`,
        `${serviceReady?'✅':hasWorker?'ℹ️':'⚠️'} تخزين للاستخدام دون إنترنت: ${serviceReady?'جاهز':hasWorker?'يتفعّل بعد التحميل الأول':'غير متاح'}`,
        `${isStandalone()?'✅':'ℹ️'} حالة التثبيت: ${isStandalone()?'مثبت':'لم يتم تأكيد التثبيت'}`
      ];
      const check=byId('installCheck');
      if(check)check.replaceChildren(...checks.map(msg=>{const line=document.createElement('span');line.textContent=msg;return line;}));
    }

    installBtn.addEventListener('click', () => { refreshInstallStatus(); installDialog.showModal(); });
    byId('closeInstall').addEventListener('click', () => installDialog.close());
    byId('dismissInstall').addEventListener('click', () => installDialog.close());
    installDialog.addEventListener('click', event => { if (event.target === installDialog) installDialog.close(); });

    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      pendingInstallPrompt = event;
      refreshInstallStatus();
    });

    window.addEventListener('appinstalled', () => {
      pendingInstallPrompt = null;
      refreshInstallStatus();
      installDialog.close();
    });

    installNowBtn.addEventListener('click', async () => {
      if (!pendingInstallPrompt) return;
      const prompt = pendingInstallPrompt;
      pendingInstallPrompt = null;
      installNowBtn.hidden = true;
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        installState.textContent = choice.outcome === 'accepted'
          ? 'تمت الموافقة على التثبيت. ابحث عن أيقونة التطبيق على جهازك.'
          : 'يمكنك تثبيت التطبيق لاحقًا من قائمة المتصفح.';
      } catch {
        installState.textContent = 'لم يبدأ التثبيت. جرّب التثبيت من قائمة المتصفح.';
      }
    });

    refreshInstallStatus();

    if ('serviceWorker' in navigator && hasSecureOrigin()) {
      navigator.serviceWorker.addEventListener('controllerchange',()=>{serviceReady=true;refreshInstallStatus();});
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js', { scope: './' }).then(registration => {
          const check=byId('installCheck');
          if(check){const line=document.createElement('span');line.textContent='✅ ملفات العمل دون إنترنت: تم تسجيلها';check.append(line);}
          registration.update().catch(()=>{});
          navigator.serviceWorker.ready.then(()=>{serviceReady=true;refreshInstallStatus();}).catch(()=>{});
        }).catch(error => {
          installState.textContent='يمكن تصفح التطبيق، لكن تشغيله دون إنترنت لم يتفعّل. تأكد من وجود ملف sw.js ومن فتح الرابط عبر HTTPS.';
          console.warn('تعذر تفعيل العمل دون اتصال:', error);
        });
      });
    }
  }

  setupFilters();
  setupDialog();
  setupShare();
  setupThemeAndInstall();
  updateTabs();
  render();
})();
