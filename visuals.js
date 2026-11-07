/* رسوم SVG خاصة بنوع حركة كل استراتيجية. جميع الرسوم متجهية، لا تعتمد على الإنترنت. */
(() => {
  'use strict';
  const cats = window.STRATEGY_CATEGORIES || {};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const short = (s, n = 14) => String(s ?? '').length > n ? String(s).slice(0, n - 1) + '…' : String(s ?? '');
  const category = s => cats[s.visual?.category] || cats.collab || { label:'التعلم النشط', color:'#087c77', light:'#e0f6f0', icon:'✦' };

  function diagram(strategy, options = {}) {
    const v = strategy.visual || {};
    const palette = category(strategy);
    const c = palette.color;
    const pale = palette.light;
    const k = v.layout || 'flow';
    const steps = (strategy.steps || []).slice(0, 4).map(x => short(x[0], 15));
    const name = strategy.name || '';
    const id = Number(strategy.id) || 0;
    const uid = `d${id}${options.print ? 'p' : 'w'}`;
    const border = '#d6e2e9';
    const dark = '#234556';
    const ink = '#244b5c';
    const faint = '#edf3f6';
    const fill = '#ffffff';

    const R = (x,y,w,h,rr=14,fc=fill,sc=border,sw=1.6)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rr}" fill="${fc}" stroke="${sc}" stroke-width="${sw}"/>`;
    const C = (x,y,r,fc=pale,sc=c,sw=2)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fc}" stroke="${sc}" stroke-width="${sw}"/>`;
    const E = (x,y,rx,ry,fc=fill,sc=border)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fc}" stroke="${sc}" stroke-width="2"/>`;
    const L = (x1,y1,x2,y2,color=c,dash=false,sw=3)=>`<path d="M${x1},${y1} L${x2},${y2}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" ${dash?'stroke-dasharray="6 7"':''}/>`;
    const A = (x1,y1,x2,y2)=> `${L(x1,y1,x2,y2)}<polygon points="${x2},${y2} ${x2+((x1-x2)*0.14)+(y2-y1)*0.16},${y2+((y1-y2)*0.14)+(x1-x2)*0.16} ${x2+((x1-x2)*0.14)-(y2-y1)*0.16},${y2+((y1-y2)*0.14)-(x1-x2)*0.16}" fill="${c}"/>`;
    const T = (x,y,text,size=17,color=ink,weight=700)=>`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-family="Noto Sans Arabic, Arial, sans-serif">${esc(text)}</text>`;
    const B = (x,y,w,h,text,fc=fill)=>`${R(x,y,w,h,14,fc)}${T(x+w/2,y+h/2+6,short(text,13),16)}`;
    const N = (x,y,text,fc=pale)=>`${C(x,y,23,fc)}${T(x,y+6,short(text,11),15)}`;
    const P = (x,y,label='',scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><circle cx="0" cy="-23" r="13" fill="${pale}" stroke="${c}" stroke-width="2"/><path d="M-21,30 Q-22,-3 0,-3 Q22,-3 21,30" fill="${pale}" stroke="${c}" stroke-width="2"/></g>${label?T(x,y+47,label,13):''}`;
    const SEAT = (x,y,label='')=>`${R(x-29,y-14,58,30,10,pale,c)}${C(x,y-28,13,fill,c)}${label?T(x,y+38,label,13):''}`;
    const BOOK = (x,y,w=90)=>`<path d="M${x},${y} q${w/4},-18 ${w/2},2 q${w/4},-17 ${w/2},-2 v58 q-${w/4},-14 -${w/2},2 q-${w/4},-15 -${w/2},-2Z" fill="${pale}" stroke="${c}" stroke-width="3"/>${L(x+w/2,y+2,x+w/2,y+62,c,false,2)}`;
    const Q = (x,y)=>`${C(x,y,28,pale,c)}${T(x,y+9,'؟',33,c,800)}`;
    const dots = (coords,labels)=>coords.map((p,i)=>N(p[0],p[1],labels?.[i]||String(i+1))).join('');
    const ring = (cx,cy,rx,ry,count=6,prefix='')=>Array.from({length:count},(_,i)=>{const a=(i/count)*Math.PI*2-Math.PI/2; const x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry; return `${C(x,y,16,fill,c,2)}${T(x,y+5,prefix||i+1,12)}`;}).join('');
    const row = (labels,y=115,x=38,gap=16,w=110)=>labels.map((a,i)=>B(x+i*(w+gap),y,w,57,a,i%2?pale:fill)).join('');
    const stack = (labels,x=170,y=45)=>labels.map((a,i)=>B(x,y+i*49,220,40,a,i%2?pale:fill)).join('');
    const diamond = (x,y,w,h)=>`<path d="M${x},${y-h/2} L${x+w/2},${y} L${x},${y+h/2} L${x-w/2},${y} Z" fill="${pale}" stroke="${c}" stroke-width="3"/>`;
    const card = (x,y,rot,n)=>`<g transform="rotate(${rot} ${x} ${y})">${R(x-36,y-50,72,100,10,fill,c,2)}${T(x,y+6,n,32,c,800)}</g>`;
    let body = '';

    switch(k) {
      case 'thinkpair': body = `${P(94,113,'أفكر')}${A(130,109,206,109)}${P(235,106,'نتحاور',.75)}${P(267,106,'',.75)}${A(306,109,385,109)}${SEAT(420,114,'نشارك')}${SEAT(485,114)}`; break;
      case 'groups': body = `${P(130,88,'',.8)}${P(195,88,'',.8)}${P(130,160,'',.8)}${P(195,160,'',.8)}${B(140,116,55,29,'فكرة',pale)}${A(244,127,354,127)}${B(365,84,135,86,'قرار الفريق',pale)}`; break;
      case 'writing': body = `${Q(90,115)}${A(123,115,195,115)}${B(195,85,125,64,'أكتب ✎',pale)}${A(324,115,392,115)}${P(446,118,'أناقش')}`; break;
      case 'triangle': body = `${L(280,48,165,186)}${L(165,186,395,186)}${L(395,186,280,48)}${SEAT(280,68,'السائل')}${SEAT(165,168,'المجيب')}${SEAT(395,168,'الملاحظ')}`; break;
      case 'cards': body = `${card(194,125,-17,'؟')}${card(263,124,0,'✓')}${card(335,125,17,'!')}${T(280,204,'كشف الإجابات في اللحظة نفسها',16,c)}`; break;
      case 'relay': body = `${P(145,117,'الأول')}${P(412,117,'الثاني')}${A(190,96,365,96)}${A(369,154,193,154)}${B(236,110,90,40,'تبادل',pale)}`; break;
      case 'circle': case 'roundtable': case 'socratic': body = `${E(285,126,158,91,pale,c)}${ring(285,126,160,94,6)}${B(231,99,108,55,k==='roundtable'?'ورقة واحدة':'نقاش جماعي',fill)}`; break;
      case 'coach': body = `${P(159,122,'يحل الطالب')}${P(407,122,'يساند الزميل')}${B(238,62,88,43,'توجيه',pale)}${A(364,115,208,115)}${T(280,200,'ثم يتبادل الطرفان الدور',16,c)}`; break;
      case 'detective': body = `${B(62,73,175,93,'عبارة خاطئة')}${C(302,114,51,fill,c,5)}${T(302,125,'!',47,c,900)}${L(336,145,382,190,c,false,10)}${A(390,115,470,115)}${B(451,78,90,75,'تصحيح',pale)}`; break;
      case 'messenger': body = `${row(['فريق أ','المراسل','فريق ب'],102,52,28,132)}${A(190,160,262,160)}${A(337,184,413,184)}${T(284,205,'عودة بمعلومة جديدة',16,c)}`; break;
      case 'random': body = `${Array.from({length:5},(_,i)=>`<g transform="rotate(${(i-2)*17} 275 176)">${R(263,45,24,132,8,i%2?pale:fill,c,2)}${T(275,81,String(i+1),14)}</g>`).join('')}${T(280,222,'سحب عشوائي يمنح الجميع فرصًا عادلة',15,c)}`; break;
      case 'fishbowl': body = `${E(280,126,180,88,'none',c)}${E(280,126,88,48,pale,c)}${ring(280,126,102,62,4)}${ring(280,126,189,99,7)}${T(280,132,'حوار',17,c)}`; break;
      case 'jigsaw': case 'puzzle': body = `${[0,1,2,3].map((i)=>{const x=174+(i%2)*108,y=50+Math.floor(i/2)*86;return `${R(x,y,102,78,16,i%2?pale:fill,c,2.3)}${C(x+102,y+39,10,fill,c,2)}${T(x+51,y+46,['خبير ١','خبير ٢','خبير ٣','تركيب'][i],15)}`;}).join('')}`; break;
      case 'movement': case 'circles': body = `${E(188,120,91,68,pale,c)}${E(378,120,91,68,fill,c)}${ring(188,120,88,70,4)}${ring(378,120,88,70,4)}${A(240,117,324,117)}`; break;
      case 'reading': case 'markup': case 'active': body = `${BOOK(190,76,185)}${L(228,130,271,130,c)}${L(290,130,333,130,c)}${B(223,161,132,39,k==='markup'?'تحديد الشواهد':'قراءة نشطة',pale)}`; break;
      case 'hotseat': body = `${SEAT(279,123,'صاحب الكرسي')}${Q(144,106)}${Q(424,97)}${A(180,107,234,107)}${A(392,107,341,107)}${T(285,215,'سؤال ← إجابة ← سؤال أعمق',15,c)}`; break;
      case 'minute': body = `${C(184,124,72,fill,c,4)}${L(184,124,184,73,c,false,4)}${L(184,124,217,124,c,false,3)}${R(322,81,125,108,12,pale,c)}${L(339,117,426,117)}${L(339,142,417,142)}${L(339,167,397,167)}${T(184,217,'٦٠ ثانية',16,c)}`; break;
      case 'whoami': body = `${P(262,123,'من أنا؟')}${R(232,35,62,45,10,pale,c)}${T(264,66,'؟',24,c)}${Q(110,126)}${Q(450,126)}`; break;
      case 'comic': body = `${[110,278,446].map((x,i)=>`${R(x-60,57,120,94,26,i%2?pale:fill,c,2)}${T(x,105,['رأي ١','رأي ٢','رأي ٣'][i],18)}${L(x-8,151,x+4,166,c,false,2)}`).join('')}${T(280,209,'أقارن التفسيرات بالأدلة',16,c)}`; break;
      case 'gap': body = `${B(52,73,195,115,'معلومة أ',pale)}${B(315,73,195,115,'معلومة ب',fill)}${A(249,127,308,127)}${T(279,218,'لا تكتمل المهمة إلا بالتبادل',16,c)}`; break;
      case 'hand': body = `${[0,1,2,3,4].map((i)=>`${L(280,166,95+i*92,74)}${C(95+i*92,74,29,fill,c)}${T(95+i*92,80,String(i+1),17)}`).join('')}${B(229,144,100,56,'أفكاري',pale)}`; break;
      case 'snowball': body = `${C(280,126,100,'none',c,3)}${C(280,126,72,'none',c,3)}${C(280,126,43,pale,c,3)}${T(280,133,'فرد',17)}${T(280,71,'ثنائي',16,c)}${T(280,214,'مجموعة',16,c)}`; break;
      case 'sketch': case 'visualize': body = `${R(125,45,310,155,22,fill,c,3)}${L(164,170,220,91)}${L(220,91,281,147)}${L(281,147,342,80)}${C(345,79,15,pale,c)}${B(219,178,121,34,'أرسم وأشرح',pale)}`; break;
      case 'why': body = `${[0,1,2,3,4].map((i)=>`${B(185+i*20,41+i*35,210-i*17,32,'لماذا؟',i%2?pale:fill)}${i<4?A(280+i*10,74+i*35,287+i*10,77+i*35):''}`).join('')}`; break;
      case 'case': body = `${R(170,43,220,154,17,fill,c,3)}${T(280,78,'حالة واقعية',20,c)}${L(200,104,354,104)}${L(200,124,340,124)}${L(200,144,330,144)}${B(218,167,124,33,'قرار مبرر',pale)}`; break;
      case 'roles': case 'roleplay': body = `${R(95,53,370,142,20,fill,c,2)}${L(116,185,445,185,c,false,5)}${P(183,109,'الدور أ')}${P(280,109,'الدور ب')}${P(378,109,'المراقب')}`; break;
      case 'sage': body = `${C(280,120,55,pale,c,3)}${T(280,125,'خبير',20,c)}${ring(280,120,150,90,6)}${L(280,177,280,211,c,true,2)}`; break;
      case 'exchange': body = `${B(81,82,168,89,'أُعطي فكرة',pale)}${B(315,82,168,89,'آخذ فكرة',fill)}${A(254,103,308,103)}${A(306,153,255,153)}`; break;
      case 'cube': body = `<path d="M280 48 L380 94 L380 187 L280 229 L180 187 L180 94 Z M180 94 L280 141 L380 94 M280 141 L280 229" fill="${pale}" stroke="${c}" stroke-width="3"/>${T(279,111,'صف',18)}${T(234,180,'قارن',18)}${T(332,180,'حلّل',18)}`; break;
      case 'peer': body = `${R(116,71,132,112,12,fill,c)}${R(317,71,132,112,12,pale,c)}${L(145,107,213,107)}${L(145,130,205,130)}${L(343,107,411,107)}${T(388,158,'✓',27,c)}${A(250,120,312,120)}`; break;
      case 'center': body = `${[0,1,2,3].map(i=>{const x=116+(i%2)*178,y=48+Math.floor(i/2)*86;return `${B(x,y,156,76,`رأي ${i+1}`,i%2?pale:fill)}`;}).join('')}${B(232,104,104,55,'إجماع',pale)}`; break;
      case 'funnel': body = `${[0,1,2].map(i=>{const w=320-i*86;return `${R(280-w/2,46+i*56,w,46,12,i%2?pale:fill,c)}${T(280,76+i*56,['٤ أفكار','فكرتان','فكرة واحدة'][i],18)}`;}).join('')}`; break;
      case 'partners': body = `${[130,290,450].map((x,i)=>`${P(x-23,123,'',.8)}${P(x+24,123,'',.8)}${T(x,202,`ثنائي ${i+1}`,14,c)}`).join('')}`; break;
      case 'draw': body = `${R(70,73,172,115,13,pale,c)}${T(156,111,'وصف شفهي',16)}${Q(155,148)}${A(244,126,322,126)}${R(335,73,150,115,13,fill,c)}${L(357,159,398,95)}${L(398,95,460,145)}`; break;
      case 'thinkaloud': body = `${P(176,115,'أفكر')}${R(273,44,188,99,36,pale,c)}${T(367,86,'لماذا اخترت؟',18)}${T(367,114,'ما الخطوة التالية؟',16)}${A(256,114,272,114)}`; break;
      case 'twocol': case 'notes': body = `${R(127,47,310,160,10,fill,c,3)}${L(282,47,282,207,c,false,2)}${T(206,83,k==='notes'?'معلومة':'اقتباس',18)}${T(357,83,k==='notes'?'تفسير':'تأمل',18)}${L(151,121,254,121)}${L(311,121,410,121)}${L(151,150,247,150)}${L(311,150,396,150)}`; break;
      case 'investigation': body = `${BOOK(113,82,150)}${C(355,117,48,fill,c,4)}${L(392,155,445,197,c,false,10)}${T(355,124,'دليل',17,c)}${B(208,177,120,39,'نتائج البحث',pale)}`; break;
      case 'list': body = `${[0,1,2,3].map(i=>`${C(135,70+i*39,13,pale,c)}${T(135,75+i*39,'✓',16,c)}${R(166,57+i*39,275-i*23,25,7,fill,c,1)}`).join('')}`; break;
      case 'envelope': body = `${R(102,84,133,86,10,fill,c,2)}${L(102,86,168,135)}${L(235,86,168,135)}${A(238,130,318,130)}${R(326,84,133,86,10,pale,c,2)}${L(326,86,393,135)}${L(459,86,393,135)}`; break;
      case 'corners': body = `${[[62,43],[348,43],[62,159],[348,159]].map(([x,y],i)=>B(x,y,155,68,['رأي أ','رأي ب','رأي ج','رأي د'][i],i%2?pale:fill)).join('')}`; break;
      case 'burst': body = `${C(280,124,56,pale,c,4)}${T(280,131,'فكرة',22,c)}${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;const x=280+Math.cos(a)*120,y=124+Math.sin(a)*87;return `${L(280+Math.cos(a)*58,124+Math.sin(a)*58,x,y,c,false,2)}${C(x,y,11,fill,c,2)}`}).join('')}`; break;
      case 'numbered': body = `${ring(280,122,140,75,4)}${B(212,101,137,52,'يتشاور الفريق',pale)}`; break;
      case 'feedback': body = `${B(108,80,155,102,'المسودة',fill)}${B(310,80,155,102,'تعليقات',pale)}${A(265,114,304,114)}${A(305,161,266,161)}`; break;
      case 'timeline': body = `${L(76,136,498,136,c,false,5)}${[95,205,315,425].map((x,i)=>`${C(x,136,16,i%2?pale:fill,c,3)}${T(x,105,`حدث ${i+1}`,15)}`).join('')}`; break;
      case 'gallery': body = `${[72,232,392].map((x,i)=>`${R(x,51,124,107,9,i%2?pale:fill,c,2)}${C(x+63,97,22,pale,c)}${T(x+62,180,`لوحة ${i+1}`,15)}`).join('')}`; break;
      case 'back2back': body = `${P(186,118,'',1)}${P(384,118,'',1)}${A(262,103,324,103)}${T(282,194,'وصف دون مشاهدة',17,c)}`; break;
      case 'observe': body = `${E(250,117,118,71,pale,c)}${C(250,118,45,fill,c,3)}${C(250,118,19,c,c)}${R(400,72,107,99,10,fill,c)}${L(415,110,487,110)}${L(415,137,469,137)}`; break;
      case 'match': body = `${[0,1,2].map(i=>`${B(71,51+i*58,145,44,`مفهوم ${i+1}`,fill)}${B(352,51+i*58,145,44,`تعريف ${3-i}`,pale)}${L(216,73+i*58,352,73+(2-i)*58,c,true,2)}`).join('')}`; break;
      case 'mindmap': case 'network': case 'cluster': body = `${C(281,123,57,pale,c,3)}${T(281,128,'المفهوم',18)}${[[110,63],[449,63],[110,189],[449,189]].map(([x,y],i)=>`${L(280,124,x,y,c,true)}${N(x,y,`فرع ${i+1}`)}`).join('')}`; break;
      case 'frayer': body = `${R(109,46,340,174,18,fill,c,3)}${L(279,47,279,217,c,false,2)}${L(110,132,447,132,c,false,2)}${['التعريف','الخصائص','الأمثلة','لا أمثلة'].map((x,i)=>T(193+(i%2)*173,87+Math.floor(i/2)*89,x,17)).join('')}`; break;
      case 'clock': body = `${C(280,124,98,fill,c,4)}${L(280,123,280,69,c,false,4)}${L(280,123,325,123,c,false,3)}${ring(280,124,126,111,4)}${T(280,218,'موعد لكل شريك',15,c)}`; break;
      case 'kwl': body = `${['أعرف','أريد أن أعرف','تعلمت'].map((x,i)=>`${B(70+i*150,60,135,130,x,i===1?pale:fill)}${L(87+i*150,137,187+i*150,137)}${L(87+i*150,162,178+i*150,162)}`).join('')}`; break;
      case 'vocab': body = `${C(280,126,57,pale,c,3)}${T(280,131,'كلمة',19,c)}${[[110,70],[447,70],[110,180],[447,180]].map(([x,y],i)=>`${L(280,126,x,y,c,true)}${B(x-51,y-20,100,40,['المعنى','السياق','المرادف','مثال'][i])}`).join('')}`; break;
      case 'predict': body = `${B(78,64,185,126,'قبل القراءة',fill)}${B(308,64,185,126,'بعد القراءة',pale)}${A(268,127,303,127)}${T(280,220,'أتوقع ثم أتحقق من الدليل',16,c)}`; break;
      case 'tiered': body = `${B(186,38,188,48,'مهمة بدعم كبير',pale)}${B(144,96,272,48,'مهمة بدعم متوسط',fill)}${B(104,156,352,48,'مهمة أكثر استقلالًا',pale)}`; break;
      case 'boards': body = `${[0,1,2,3].map(i=>`${R(66+i*126,53,106,121,12,i%2?pale:fill,c,2)}${T(119+i*126,119,['✓','؟','٧ × ٨','!'][i],22,c)}`).join('')}`; break;
      case 'talk': case 'qa': body = `${R(81,72,180,94,29,fill,c)}${R(299,72,180,94,29,pale,c)}${T(171,124,k==='qa'?'سؤال':'استنتاج',18)}${T(389,124,k==='qa'?'دليل':'رد الزميل',18)}${A(263,119,291,119)}`; break;
      case 'choice': body = `${[0,1,2,3,4,5,6,7,8].map(i=>`${R(128+(i%3)*104,39+Math.floor(i/3)*62,86,51,10,i%2?pale:fill,c,1.8)}${T(171+(i%3)*104,70+Math.floor(i/3)*62,i===4?'اختيار':'مهمة',14)}`).join('')}`; break;
      case 'raft': body = `${['الدور','الجمهور','الشكل','الموضوع'].map((x,i)=>`${B(35+i*132,69,122,124,x,i%2?pale:fill)}${T(95+i*132,155,String(i+1),25,c)}`).join('')}`; break;
      case 'sticky': body = `${[0,1,2,3].map(i=>`${R(84+i*106,58+(i%2)*42,95,97,8,i%2?pale:fill,c,1.8)}${T(132+i*106,112+(i%2)*42,['سؤال','فكرة','دليل','تعليق'][i],16)}`).join('')}`; break;
      case 'rotate': body = `${C(280,123,79,'none',c,3)}${ring(280,123,130,90,4)}${B(229,102,103,44,'تبادل أدوار',pale)}`; break;
      case 'story': body = `${L(75,174,490,174,c,false,4)}${[110,200,290,380,470].map((x,i)=>`${C(x,174,16,i%2?pale:fill,c,3)}${T(x,135,['بداية','حدث','عقدة','حل','نهاية'][i],15)}`).join('')}`; break;
      case 'organizer': body = `${B(185,49,198,48,'الفكرة الأساسية',pale)}${A(280,102,280,124)}${B(66,133,176,61,'سبب',fill)}${B(324,133,176,61,'نتيجة',fill)}${L(280,124,154,132)}${L(280,124,413,132)}`; break;
      case 'author': body = `${BOOK(155,61,160)}${Q(375,113)}${T(287,215,'لماذا اختار الكاتب هذا؟',16,c)}`; break;
      case 'matrix': body = `${[0,1,2,3].map(i=>L(116,59+i*41,454,59+i*41,i===0?c:border,false,2)).join('')}${[0,1,2,3,4].map(i=>L(116+i*85,59,116+i*85,182,i===0?c:border,false,2)).join('')}${T(281,218,'مقارنة السمات بدقة',16,c)}`; break;
      case 'listening': body = `${Q(148,119)}${BOOK(239,68,142)}${A(182,119,238,119)}${B(374,89,129,73,'ناقش',pale)}`; break;
      case 'sort': body = `${[0,1,2].map(i=>`${R(89+i*138,135,113,64,13,i%2?pale:fill,c,2)}${T(144+i*138,174,`فئة ${i+1}`,16)}`).join('')}${[0,1,2,3,4].map(i=>`${R(117+i*69,55,48,44,9,fill,c,2)}${T(141+i*69,84,`م${i+1}`,14)}`).join('')}`; break;
      case 'fill': body = `${R(117,62,345,124,14,fill,c)}${[0,1,2].map(i=>`${L(145,100+i*29,214,100+i*29)}${R(241,88+i*29,110,20,7,pale,c)}${L(372,100+i*29,432,100+i*29)}`).join('')}`; break;
      case 'cause': body = `${B(75,77,129,88,'سبب',fill)}${B(226,77,129,88,'تغيّر',pale)}${B(377,77,129,88,'نتيجة',fill)}${A(205,121,221,121)}${A(355,121,372,121)}`; break;
      case 'venn': body = `${C(230,126,87,'rgba(20,156,178,.14)',c,3)}${C(332,126,87,'rgba(229,173,66,.18)','#c58c29',3)}${T(197,130,'أ',22)}${T(365,130,'ب',22)}${T(280,130,'مشترك',16,c)}`; break;
      case 'rules': body = `${[0,1,2].map(i=>`${R(90,61+i*51,132,38,11,i%2?pale:fill,c)}${T(156,85+i*51,['أحذف','أعمّم','ألخّص'][i],16)}`).join('')}${A(235,130,315,130)}${B(327,84,145,91,'ملخص مركز',pale)}`; break;
      case 'groupnotes': body = `${[0,1,2].map(i=>`${R(73+i*135,57,112,89,12,i%2?pale:fill,c)}${T(129+i*135,106,`مسودة ${i+1}`,15)}`).join('')}${B(209,175,145,42,'ملخص جماعي',pale)}`; break;
      case 'magnet': body = `<path d="M220 73 L220 150 Q220 208 282 208 Q344 208 344 150 L344 73" fill="none" stroke="${c}" stroke-width="28" stroke-linecap="round"/>${R(202,64,36,32,7,fill,c)}${R(326,64,36,32,7,fill,c)}${T(279,130,'كلمات مهمة',18)}${[0,1,2].map(i=>B(72+i*152,35,128,32,'كلمة '+(i+1),pale)).join('')}`; break;
      case 'gist': body = `${R(95,51,370,164,20,fill,c,3)}${[0,1,2].map(i=>L(128,96+i*29,432,96+i*29,i===1?c:border,false,i===1?6:2)).join('')}${T(280,199,'الخلاصة في جملة دقيقة',16,c)}`; break;
      case 'seasons': body = `${['شتاء','ربيع','صيف','خريف'].map((x,i)=>{const ang=i*Math.PI/2-Math.PI/2;const px=280+Math.cos(ang)*130,py=130+Math.sin(ang)*81;return `${L(280,130,px,py)}${N(px,py,x)}`;}).join('')}${B(236,107,89,45,'شراكة',fill)}`; break;
      case 'menu': body = `${[0,1,2].map(i=>`${R(60+i*174,52,159,152,17,i%2?pale:fill,c,2)}${T(139+i*174,85,['أساسي','اختياري','إثرائي'][i],18)}${L(91+i*174,111,185+i*174,111)}${L(91+i*174,136,185+i*174,136)}${L(91+i*174,161,160+i*174,161)}`).join('')}`; break;
      default: body = `${row(steps.slice(0,3),103,70,20,134)}${A(221,194,341,194)}`;
    }

    const bottom = steps.slice(0,4).map((title,i)=>`${R(18+i*139,233,132,35,11,i===0?pale:fill,border,1)}${T(84+i*139,255,`${i+1}. ${short(title,10)}`,12)}`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 278" class="strategy-diagram" role="img" aria-label="رسم يوضح ترتيب العمل في استراتيجية ${esc(name)}">
      <defs><pattern id="dots-${uid}" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="${border}"/></pattern></defs>
      <rect x="1" y="1" width="578" height="276" rx="22" fill="#fbfdff" stroke="${border}"/>
      <rect x="1" y="1" width="578" height="276" rx="22" fill="url(#dots-${uid})" opacity=".36"/>
      <path d="M0,0 L116,0 L0,116Z" fill="${pale}" opacity=".65"/>
      ${R(15,11,174,28,14,pale,c,1)}${T(102,31,palette.label,12,c)}
      ${body}${bottom}
    </svg>`;
  }

  window.AL101_VISUALS = { category, diagram, esc, short };
})();
