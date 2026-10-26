'use strict';
const $ = id => document.getElementById(id);
const ar = n => Number(n).toLocaleString('ar-EG');
const slides = [...document.querySelectorAll('.slide')];
let cur = 0;
slides.forEach((slide, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot';
  dot.setAttribute('aria-label', slide.dataset.title);
  dot.addEventListener('click', () => go(i));
  $('dots').append(dot);
});
function go(n) {
  if (n < 0 || n >= slides.length) return;
  const focusWasInSlide = slides.some(s => s.contains(document.activeElement));
  cur = n;
  slides.forEach((s, i) => { s.classList.toggle('active', i === n); s.inert = i !== n; s.setAttribute('aria-hidden', i !== n); });
  [...$('dots').children].forEach((d, i) => { d.classList.toggle('on', i === n); if (i === n) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
  $('counter').textContent = `${ar(n + 1)} / ${ar(slides.length)}`;
  $('progress').style.width = `${(n + 1) / slides.length * 100}%`;
  $('prev').disabled = n === 0;
  $('next').disabled = n === slides.length - 1;
  if (focusWasInSlide) { const title = slides[n].querySelector('h1, h2'); title.tabIndex = -1; title.focus({preventScroll:true}); }
  slides[n].scrollTop = 0;
}
$('prev').addEventListener('click', () => go(cur - 1));
$('next').addEventListener('click', () => go(cur + 1));
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(+b.dataset.go)));
document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); go(0); });
document.addEventListener('keydown', e => {
  if (e.target.closest('input, select, textarea, button, [role="tablist"], summary') || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur + 1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); go(cur - 1); }
});
let touchStart;
$('deck').addEventListener('touchstart', e => {
  touchStart = e.target.closest('input, select, textarea, button') ? null : {x:e.touches[0].clientX, y:e.touches[0].clientY};
}, {passive:true});
$('deck').addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x, dy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx > 0 ? 1 : -1));
  touchStart = null;
}, {passive:true});
const phases = [
  {title:'التحضير',purpose:'الاستعداد للحوادث قبل وقوعها.',action:'إنشاء إجراءات وهياكل استجابة مسبقًا، وتحديد المسؤوليات وتجهيز وسائل التواصل.',example:'مثال: إعداد خطة تحدد من يتلقى البلاغ وكيف يتصرف الفريق.'},
  {title:'الاكتشاف',purpose:'اكتشاف وقوع حادث وتأكيده.',action:'فحص التنبيهات والبلاغات للتحقق من أن ما حدث حادث أمني.',example:'مثال: التحقق من بلاغ عن ملفات مشفّرة وظهور برمجية خبيثة.'},
  {title:'الاحتواء',purpose:'تحديد نطاق التأثير ومنع انتشار الضرر أكثر.',action:'عزل الجزء المتأثر أو تقييد أثره بالطريقة المناسبة.',example:'مثال: عزل جهاز مصاب عن الشبكة للحد من انتقال العدوى.'},
  {title:'إزالة التهديد (الاستئصال)',purpose:'إزالة التهديد ومسبباته.',action:'حذف البرمجيات الخبيثة ومعالجة الثغرة المستغلة.',example:'مثال: إزالة البرمجية وتحديث البرنامج الذي استُغلت ثغرته.'},
  {title:'الاستعادة',purpose:'إعادة الأنظمة والخدمات إلى حالة تشغيل آمنة وطبيعية.',action:'إعادة تشغيل الخدمة بأمان والتحقق من سلامتها؛ وقد تشمل الاستعادة من نسخة احتياطية سليمة.',example:'مثال: استعادة ملفات سليمة بعد معالجة التهديد وفحص الخدمة.'},
  {title:'الدروس المستفادة والتحسين',purpose:'تقليل احتمال تكرار الحادث وأثره.',action:'تحليل ما حدث، وتوثيق الدروس، وتحسين الضوابط.',example:'مثال: تحسين التحديثات والتوعية وإجراءات النسخ الاحتياطي بناءً على سبب الحادث.'}
];
phases.forEach((p,i) => {
  const b = document.createElement('button'); b.className = 'phase-tab'; b.id = `phase-${i}`; b.setAttribute('role','tab'); b.setAttribute('aria-controls','phaseDetail');
  b.innerHTML = `<b>${ar(i+1)}</b>${p.title}`;
  b.addEventListener('click', () => showPhase(i));
  b.addEventListener('keydown', e => {
    let next;
    if(e.key === 'ArrowLeft') next = (i+1)%6;
    if(e.key === 'ArrowRight') next = (i+5)%6;
    if(e.key === 'Home') next = 0;
    if(e.key === 'End') next = 5;
    if(next !== undefined){e.preventDefault();showPhase(next);$('phase-'+next).focus();}
  });
  $('phaseTabs').append(b);
});
function showPhase(i){
  [...$('phaseTabs').children].forEach((b,j) => {b.setAttribute('aria-selected',i===j);b.tabIndex=i===j?0:-1;});
  const p=phases[i]; $('phaseDetail').setAttribute('aria-labelledby',`phase-${i}`);
  $('phaseDetail').innerHTML=`<div class="phase-number" aria-hidden="true">${ar(i+1)}</div><div><h3>${p.title}</h3><p class="purpose">${p.purpose}</p><p>${p.action}</p><div class="example">${p.example}</div></div>`;
}
$('revealReason').addEventListener('click', () => {
  const isOpen = $('containReason').hidden;
  $('containReason').hidden = !isOpen;
  $('revealReason').setAttribute('aria-expanded',isOpen);
  $('revealReason').textContent = isOpen ? 'أخفِ التفسير' : 'أظهر التفسير';
});
let picked=0;
function initOrder(){
  picked=0;$('orderPool').replaceChildren();$('orderOut').replaceChildren();$('orderMsg').textContent='';
  // Shuffle using Fisher–Yates; prevent the solved order from appearing initially.
  const indices=[0,1,2,3,4,5];
  for(let i=5;i>0;i--){const j=Math.floor(Math.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}
  if(indices.every((n,i)=>n===i)) indices.reverse();
  indices.forEach(i=>{
    const b=document.createElement('button');b.className='btn';b.textContent=phases[i].title;
    b.addEventListener('click',()=>{
      if(i!==picked){$('orderMsg').classList.add('error');$('orderMsg').textContent=`حاول مجددًا: ${picked===0?'نبدأ بالاستعداد قبل وقوع الحادث.':`ما المرحلة التي تأتي بعد ${phases[picked-1].title}؟`}`;return;}
      b.disabled=true;b.classList.add('correct');picked++;
      const step=document.createElement('span');step.className='ordered-step';step.textContent=`${ar(picked)}. ${phases[i].title}`;$('orderOut').append(step);
      $('orderMsg').classList.remove('error');$('orderMsg').textContent=picked===6?'أحسنت! رتّبت المراحل الست. تذكّر أن الأنشطة قد تتداخل أو تتكرر.':`صحيح. أكملت ${ar(picked)} من ٦ مراحل.`;
    });$('orderPool').append(b);
  });
}
$('resetOrder').addEventListener('click',initOrder);
const levelNames=['','منخفض','متوسط','عالٍ'];
for(let l=3;l>=1;l--){
  const label=document.createElement('span');label.className='matrix-label';label.textContent=ar(l);$('matrix').append(label);
  for(let i=1;i<=3;i++){
    const b=document.createElement('button');const score=i*l;b.className=`cell ${score>=6?'high':score>=3?'medium':'low'}`;b.textContent=ar(score);b.dataset.i=i;b.dataset.l=l;
    b.setAttribute('aria-label',`التأثير ${ar(i)}، الاحتمالية ${ar(l)}، درجة الخطر ${ar(score)}`);
    b.addEventListener('click',()=>{$('impact').value=i;$('likelihood').value=l;updateRisk();});$('matrix').append(b);
  }
}
const empty=document.createElement('span');$('matrix').append(empty);
for(let i=1;i<=3;i++){const s=document.createElement('span');s.className='matrix-label';s.textContent=ar(i);$('matrix').append(s);}
function updateRisk(){
  const i=+$('impact').value,l=+$('likelihood').value;
  $('iv').textContent=ar(i);$('lv').textContent=ar(l);$('it').textContent=levelNames[i];$('lt').textContent=levelNames[l];
  $('riskResult').textContent=`${ar(i)} × ${ar(l)} = ${ar(i*l)}${i*l===9?' — من أعلى الأولويات':''}`;
  document.querySelectorAll('.cell').forEach(b=>{const on=+b.dataset.i===i&&+b.dataset.l===l;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});
}
$('impact').addEventListener('input',updateRisk);$('likelihood').addEventListener('input',updateRisk);
$('priorityChoices').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const good=b.dataset.answer==='correct';$('priorityFeedback').classList.toggle('error',!good);
  $('priorityFeedback').textContent=good?'صحيح: ٣ × ٣ = ٩، وهي أعلى درجة في الحالات المعطاة؛ لذلك نبدأ بخطر تسرب بيانات الطلاب.':'قارن حاصل التأثير × الاحتمالية: الدرجة الأعلى هنا هي ٩. حاول مرة أخرى.';
});
$('responseForm').addEventListener('submit',e=>{
  e.preventDefault();
  const mistakes=[];
  if($('containSelect').value!=='good')mistakes.push('ابدأ باحتواء الانتشار بعزل الجهاز المتأثر.');
  if($('removeSelect').value!=='good')mistakes.push('أزل البرمجية وعالج الثغرة؛ إعادة التوصيل وحدها لا تزيل التهديد.');
  if($('recoverSelect').value!=='good')mistakes.push('استعد من نسخة سليمة بعد معالجة التهديد، ثم تحقق من التشغيل الآمن.');
  const controls={updates:'التحديثات ترتبط بمعالجة الثغرة وتقلّل احتمال استغلالها مجددًا.',training:'التوعية مناسبة إذا كان الدخول عبر مرفق مشبوه؛ اشرح هذه الفرضية في تبريرك.',permissions:'تقييد الصلاحيات يحدّ من انتشار الضرر والوصول غير المصرح به.'};
  $('responseFeedback').classList.toggle('error',mistakes.length>0);
  $('responseFeedback').textContent=mistakes.length?mistakes.join(' '):`إجراءاتك توافق التسلسل العام. ${controls[$('controlSelect').value]} للمراجعة الذاتية: هل أوضحت في تبريرك كيف يمنع العزل الانتشار، وكيف يرتبط الضابط بسبب الحادث أو أثره؟ قارن إجابتك بالنموذج أدناه؛ النصوص الحرة تحتاج إلى مناقشة مع المعلم.`;
});
const questions=[
  {q:'ما الغرض الأساسي من مرحلة الاكتشاف؟',opts:['إعادة الأنظمة إلى التشغيل الطبيعي','اكتشاف وقوع حادث وتأكيده','إزالة البرمجية الخبيثة'],answer:1,why:'الاكتشاف يؤكد وقوع الحادث؛ إعادة التشغيل الآمن غرض الاستعادة، وإزالة البرمجية من الاستئصال.'},
  {q:'كشفت الاستعادة بقايا تهديد. ماذا نفعل؟',opts:['نعود إلى الاحتواء أو إزالة التهديد بحسب الحاجة','نتجاهلها لأن الاستعادة هي المرحلة الخامسة','نكتفي بكتابة تقرير نهائي'],answer:0,why:'المراحل تسلسل عام؛ قد تتداخل الأنشطة أو تتكرر بحسب طبيعة الحادث.'},
  {q:'خطر تأثيره ٣ واحتماليته ٢. ما درجته؟',opts:['٥','٩','٦'],answer:2,why:'درجة الخطر = التأثير × الاحتمالية؛ ٣ × ٢ = ٦ في مقياس التدريب.'},
  {q:'أي إجراء يربط الدروس المستفادة بضابط مناسب؟',opts:['إعادة خدمة دون معالجة سبب الحادث','تحديث البرنامج لمعالجة الثغرة المستغلة وتقليل التكرار','عزل الجهاز إلى الأبد دون تحليل'],answer:1,why:'عندما يكون السبب ثغرة مستغلة، تعالجها التحديثات وتقلّل احتمال تكرار الحادث.'}
];
const answered=new Map();
questions.forEach((q,idx)=>{
  const item=document.createElement('article');item.className='quiz-item';
  const title=document.createElement('h3');title.textContent=`${ar(idx+1)}. ${q.q}`;item.append(title);
  const opts=document.createElement('div');opts.className='quiz-options';
  const feedback=document.createElement('p');feedback.className='feedback';feedback.setAttribute('aria-live','polite');
  q.opts.forEach((txt,j)=>{
    const b=document.createElement('button');b.className='btn';b.textContent=txt;
    b.addEventListener('click',()=>{
      if(answered.has(idx))return;
      const good=j===q.answer;answered.set(idx,good);
      [...opts.children].forEach((option,k)=>{option.disabled=true;if(k===q.answer)option.classList.add('correct');});
      if(!good)b.classList.add('incorrect');feedback.textContent=(good?'صحيح. ':'راجع السبب: ')+q.why;
      const correct=[...answered.values()].filter(Boolean).length;
      $('quizScore').textContent=`أجبت عن ${ar(answered.size)} من ${ar(questions.length)} — الإجابات الصحيحة: ${ar(correct)}.${answered.size===questions.length?' راجع التفسيرات، ثم انتقل إلى بطاقة الخروج.':''}`;
    });opts.append(b);
  });item.append(opts,feedback);$('quiz').append(item);
});
phases.forEach((p,i)=>{const s=document.createElement('span');s.textContent=`${ar(i+1)} / ${p.title}`;$('summaryPath').append(s);});
showPhase(0);initOrder();updateRisk();go(0);
