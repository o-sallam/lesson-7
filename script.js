/* ---------- Navigation ---------- */
const slides=[...document.querySelectorAll('.slide')];
let cur=0;
const dots=document.getElementById('dots');
slides.forEach((_,i)=>{const d=document.createElement('button');d.className='dot';d.onclick=()=>go(i);d.setAttribute('aria-label','شريحة '+(i+1));dots.appendChild(d);});
function go(n){
  if(n<0||n>=slides.length)return;
  slides.forEach((s,i)=>{s.classList.toggle('active',i===n);s.classList.toggle('prev',i<n);});
  cur=n;
  document.getElementById('counter').textContent=(n+1)+' / '+slides.length;
  document.getElementById('progress').style.width=((n+1)/slides.length*100)+'%';
  [...dots.children].forEach((d,i)=>d.classList.toggle('on',i===n));
}
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'||e.key===' ')go(cur+1);
  if(e.key==='ArrowRight')go(cur-1);
});
let tx=null;
document.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
document.addEventListener('touchend',e=>{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>60)go(dx>0?cur+1:cur-1);tx=null;});
go(0);

/* ---------- Lifecycle ---------- */
const phases=[
 {t:'التحضير',items:['إعداد سياسة وخطة الاستجابة للحوادث','تشكيل فريق CSIRT وتحديد الأدوار وقنوات التواصل','تجهيز الأدوات: أنظمة المراقبة SIEM، مضاد الفيروسات، النسخ الاحتياطي','تدريب الموظفين وإجراء تمارين محاكاة']},
 {t:'الكشف والتحليل',items:['رصد المؤشرات: تنبيهات، سجلات، بلاغات المستخدمين','التحقق: هل هو حادثة حقيقية أم إنذار كاذب؟','تحديد النطاق والأنظمة المتأثرة','تصنيف الخطورة وتوثيق كل شيء وإبلاغ المعنيين']},
 {t:'الاحتواء والاستئصال والتعافي',items:['الاحتواء: عزل الأجهزة المصابة عن الشبكة، تعطيل الحسابات المخترقة','جمع الأدلة الرقمية والحفاظ عليها قبل المسح','الاستئصال: إزالة البرمجيات الخبيثة وسد الثغرات وتغيير كلمات المرور','التعافي: الاستعادة من نسخ احتياطية نظيفة ومراقبة الأنظمة بعد إعادتها']},
 {t:'ما بعد الحادثة',items:['اجتماع "الدروس المستفادة" خلال أيام من انتهاء الحادثة','تحليل السبب الجذري: كيف دخل المهاجم؟ ولماذا لم نكتشفه أسرع؟','كتابة التقرير النهائي','تحديث الخطط والضوابط ← العودة لمرحلة التحضير']}
];
function showPhase(i){
  document.querySelectorAll('.phase').forEach(p=>p.classList.toggle('on',+p.dataset.p===i));
  const p=phases[i];
  document.getElementById('phaseDetail').innerHTML='<h3>'+(i+1)+'. '+p.t+'</h3><ul>'+p.items.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
}
document.querySelectorAll('.phase').forEach(p=>p.onclick=()=>showPhase(+p.dataset.p));
showPhase(0);

/* ---------- Classify activities ---------- */
const sets={
 '1':[
  ['موظف سجّل دخوله صباحاً',"event"],['تحديث تلقائي لنظام التشغيل',"event"],['طابعة نفدت أوراقها',"event"],
  ['تسريب ملف درجات الطلاب على الإنترنت',"incident"],['تشفير الملفات وطلب فدية',"incident"],['دخول غير مصرح لحساب المدير',"incident"],['تعطيل موقع المدرسة بهجوم DDoS',"incident"]],
 '2':[
  ['شراء تأمين سيبراني',"transfer"],['تفعيل التحقق الثنائي',"mitigate"],['إيقاف استخدام برنامج قديم لا يُحدَّث',"avoid"],
  ['قبول خطر منخفض على جهاز عرض بلا بيانات',"accept"],['تركيب جدار حماية',"mitigate"],['الاستعانة بمزود سحابي مسؤول عن الخوادم',"transfer"],['إلغاء نشر بيانات الطلاب على الموقع',"avoid"]]
};
const state={};
function shuffle(a){return a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);}
function initSet(k){
  state[k]={sel:null,right:0,tries:0};
  const pool=document.getElementById('pool'+k);pool.innerHTML='';
  shuffle(sets[k]).forEach(([txt,ans])=>{
    const c=document.createElement('span');c.className='chip';c.textContent=txt;c.dataset.ans=ans;
    c.onclick=()=>{pool.querySelectorAll('.chip').forEach(x=>x.classList.remove('sel'));c.classList.add('sel');state[k].sel=c;};
    pool.appendChild(c);
  });
  document.querySelectorAll('#pool'+k).forEach(()=>{});
}
function dropIn(bin,k){
  const s=state[k];if(!s.sel)return;
  const c=s.sel;s.tries++;
  if(c.dataset.ans===bin.dataset.bin){
    c.classList.remove('sel');c.classList.add('right');c.onclick=null;bin.appendChild(c);s.right++;s.sel=null;
  }else{
    c.classList.add('wrong');setTimeout(()=>c.classList.remove('wrong'),500);
  }
  const total=sets[k].length;
  document.getElementById('score'+k).textContent= s.right===total
    ? '<i class="fa-solid fa-trophy"></i> ممتاز! أنجزت التصنيف بـ '+s.tries+' محاولة.'
    : 'الصحيح: '+s.right+' من '+total;
}
initSet('1');initSet('2');

/* ---------- Ordering ---------- */
const steps=['التحضير','التعرّف','الاحتواء','الاستئصال','التعافي','الدروس المستفادة'];
let picked=[];
function initOrder(){
  picked=[];document.getElementById('orderOut').textContent='';document.getElementById('orderMsg').textContent='';
  const pool=document.getElementById('orderPool');pool.innerHTML='';
  shuffle(steps).forEach(s=>{
    const c=document.createElement('span');c.className='chip';c.textContent=s;
    c.onclick=()=>{
      if(c.classList.contains('right'))return;
      if(s===steps[picked.length]){c.classList.add('right');picked.push(s);document.getElementById('orderOut').textContent=picked.join(' ← ');
        if(picked.length===steps.length)document.getElementById('orderMsg').textContent='<i class="fa-solid fa-trophy"></i> ترتيب صحيح تماماً!';}
      else{c.classList.add('wrong');setTimeout(()=>c.classList.remove('wrong'),500);document.getElementById('orderMsg').textContent='ليست هذه الخطوة التالية، حاول مرة أخرى.';}
    };
    pool.appendChild(c);
  });
}
initOrder();

/* ---------- Risk calculator ---------- */
const L=['','نادر','غير مرجح','ممكن','مرجح','شبه مؤكد'];
const I=['','ضئيل','بسيط','متوسط','كبير','كارثي'];
function level(s){
  if(s>=15)return{t:'خطر حرج',c:'var(--crit)',a:'يتطلب معالجة فورية وإبلاغ الإدارة العليا.'};
  if(s>=10)return{t:'خطر عالٍ',c:'var(--bad)',a:'يجب وضع خطة معالجة عاجلة بضوابط واضحة.'};
  if(s>=5)return{t:'خطر متوسط',c:'var(--warn)',a:'يعالج ضمن الخطة الدورية ويُراقَب باستمرار.'};
  return{t:'خطر منخفض',c:'var(--ok)',a:'يمكن قبوله مع التوثيق والمراقبة.'};
}
const mx=document.getElementById('matrix');
for(let l=5;l>=1;l--){
  const lb=document.createElement('div');lb.className='lbl';lb.textContent=l;mx.appendChild(lb);
  for(let i=1;i<=5;i++){
    const d=document.createElement('div');d.className='cell';const s=l*i;d.textContent=s;
    d.style.background=level(s).c;d.style.color='#fff';d.dataset.l=l;d.dataset.i=i;d.style.cursor='pointer';
    d.onclick=()=>{lk.value=l;im.value=i;upd();};
    mx.appendChild(d);
  }
}
mx.appendChild(Object.assign(document.createElement('div'),{className:'lbl'}));
for(let i=1;i<=5;i++){const lb=document.createElement('div');lb.className='lbl';lb.textContent=i;mx.appendChild(lb);}
const lk=document.getElementById('likelihood'),im=document.getElementById('impact');
function upd(){
  const l=+lk.value,i=+im.value,s=l*i,lv=level(s);
  document.getElementById('lv').textContent=l;document.getElementById('lt').textContent=L[l];
  document.getElementById('iv').textContent=i;document.getElementById('it').textContent=I[i];
  const r=document.getElementById('riskResult');r.textContent=l+' × '+i+' = '+s+' — '+lv.t;r.style.background=lv.c;
  document.getElementById('riskAdvice').textContent=lv.a;
  mx.querySelectorAll('.cell').forEach(c=>c.classList.toggle('sel',+c.dataset.l===l&&+c.dataset.i===i));
}
lk.oninput=upd;im.oninput=upd;upd();

/* ---------- Scenario ---------- */
const scenario=[
 {s:'<i class="fa-solid fa-clock"></i> الساعة 8:10 صباحاً: معلمون يبلغون أن ملفاتهم أصبحت بامتداد غريب وظهرت رسالة تطلب فدية بالعملات الرقمية. ما أول إجراء؟',
  o:[['عزل الأجهزة المصابة فوراً عن الشبكة',1,'صحيح! الاحتواء السريع يمنع انتشار الفدية إلى أجهزة وخوادم أخرى.'],
     ['إعادة تشغيل كل الأجهزة',0,'إعادة التشغيل قد تمسح أدلة من الذاكرة ولا توقف الانتشار.'],
     ['دفع الفدية فوراً لاستعادة الملفات',0,'الدفع لا يضمن استعادة البيانات ويشجع المهاجمين، وهو قرار للإدارة بعد استشارة قانونية.']]},
 {s:'<i class="fa-solid fa-magnifying-glass"></i> تم عزل 12 جهازاً. ما الخطوة التالية للفريق؟',
  o:[['مسح الأجهزة فوراً وإعادة تثبيت النظام',0,'التسرع في المسح يضيّع الأدلة التي نحتاجها لمعرفة طريقة الدخول.'],
     ['تحديد النطاق وجمع الأدلة ومعرفة نقطة الدخول',1,'ممتاز! التحليل يكشف الثغرة التي يجب سدها، وإلا سيعود المهاجم.'],
     ['انتظار انتهاء اليوم الدراسي',0,'التأخير يمنح المهاجم وقتاً إضافياً.']]},
 {s:'<i class="fa-solid fa-bug"></i> اتضح أن المهاجم دخل عبر بريد تصيد سرق كلمة مرور ولا يوجد تحقق ثنائي. ماذا تفعل؟',
  o:[['إزالة البرمجية، إعادة تعيين كلمات المرور، وتفعيل التحقق الثنائي',1,'هذا هو الاستئصال الصحيح: إزالة السبب وسد الثغرة.'],
     ['حذف بريد التصيد فقط',0,'الحساب ما زال مخترقاً والثغرة ما زالت مفتوحة.'],
     ['تغيير كلمة مرور المستخدم المصاب فقط',0,'قد تكون حسابات أخرى مخترقة، والثغرة الأساسية (غياب MFA) ما زالت قائمة.']]},
 {s:'<i class="fa-solid fa-database"></i> حان وقت إعادة الأنظمة. من أين تستعيد البيانات؟',
  o:[['من آخر نسخة احتياطية معزولة تم التحقق من سلامتها',1,'صحيح! النسخة المعزولة والنظيفة هي أساس التعافي الآمن.'],
     ['من النسخة الاحتياطية المتصلة دائماً بالشبكة دون فحص',0,'قد تكون مشفّرة أو مصابة هي أيضاً.'],
     ['لا داعي للاستعادة، نبدأ من الصفر',0,'خسارة غير ضرورية للبيانات مع وجود نسخ احتياطية.']]},
 {s:'<i class="fa-solid fa-pen"></i> عادت الأنظمة للعمل. ماذا الآن؟',
  o:[['إغلاق الملف ونسيان الأمر',0,'بدون دروس مستفادة ستتكرر الحادثة.'],
     ['عقد اجتماع الدروس المستفادة وتحديث الخطط وتدريب الموظفين على التصيد',1,'رائع! هكذا تكتمل الدورة وتعود لتقوية مرحلة التحضير.'],
     ['معاقبة المعلم الذي فتح البريد فقط',0,'اللوم وحده لا يعالج السبب؛ المطلوب تحسين الضوابط والتوعية.']]}
];
let sc=0,scPts=0;
function renderScene(){
  const el=document.getElementById('scene');
  if(sc>=scenario.length){
    el.innerHTML='<h3><i class="fa-solid fa-flag-checkered"></i> انتهت المحاكاة</h3><p>نتيجتك: <span class="score">'+scPts+' / '+scenario.length+'</span></p><p>'+(scPts===scenario.length?'قائد استجابة محترف! <i class="fa-solid fa-trophy"></i>':'راجع مراحل الاستجابة وحاول مرة أخرى.')+'</p><br><button class="btn primary" onclick="sc=0;scPts=0;renderScene()">إعادة المحاكاة ↺</button>';
    return;
  }
  const q=scenario[sc];
  el.innerHTML='<span class="tag">الموقف '+(sc+1)+' من '+scenario.length+'</span><p style="margin-top:10px;font-size:1.15rem">'+q.s+'</p><div class="choices"></div><div class="fb" id="fb"></div>';
  const ch=el.querySelector('.choices');
  q.o.forEach(([t,ok,f])=>{
    const b=document.createElement('button');b.className='btn choice';b.textContent=t;
    b.onclick=()=>{
      ch.querySelectorAll('button').forEach(x=>x.disabled=true);
      b.classList.add(ok?'opt':'opt');b.classList.add(ok?'correct':'incorrect');
      if(ok)scPts++;
      const fb=document.getElementById('fb');fb.className='fb show '+(ok?'good':'badf');
      fb.innerHTML=(ok?'<i class="fa-solid fa-check"></i> ':'<i class="fa-solid fa-xmark"></i> ')+f+'<br><br><button class="btn primary" onclick="sc++;renderScene()">التالي ←</button>';
    };
    ch.appendChild(b);
  });
}
renderScene();

/* ---------- Quiz ---------- */
const quiz=[
 ['ما المرحلة الأولى في دورة الاستجابة للحوادث وفق NIST؟',['الكشف والتحليل','التحضير','الاحتواء','الدروس المستفادة'],1],
 ['عزل جهاز مصاب عن الشبكة يُعد من مرحلة:',['الاستئصال','التعافي','الاحتواء','التحضير'],2],
 ['احتمالية الخطر 4 وأثره 5، فقيمته:',['9','20','1','45'],1],
 ['شراء تأمين سيبراني مثال على استراتيجية:',['التجنب','القبول','النقل','التخفيف'],2],
 ['أقصى كمية بيانات يمكن خسارتها مقاسة بالزمن هي:',['RTO','RPO','BCP','ALE'],1],
 ['هجوم DDoS يستهدف بشكل رئيسي ركن:',['السرية','السلامة','التوفر','الخصوصية'],2]
];
let qScore=0,qDone=0;
const qz=document.getElementById('quiz');
quiz.forEach(([q,opts,ans],qi)=>{
  const d=document.createElement('div');d.className='q card';
  d.innerHTML='<b>'+(qi+1)+'. '+q+'</b><div class="opts"></div>';
  const o=d.querySelector('.opts');
  opts.forEach((t,oi)=>{
    const b=document.createElement('button');b.className='btn opt';b.textContent=t;
    b.onclick=()=>{
      o.querySelectorAll('button').forEach(x=>x.disabled=true);
      o.children[ans].classList.add('correct');
      if(oi===ans)qScore++;else b.classList.add('incorrect');
      qDone++;
      document.getElementById('quizScore').textContent='النتيجة: '+qScore+' / '+quiz.length+(qDone===quiz.length?(qScore>=5?'  <i class="fa-solid fa-star"></i> ممتاز!':'  — راجع الشرائح وحاول مجدداً'):'');
    };
    o.appendChild(b);
  });
  qz.appendChild(d);
});
