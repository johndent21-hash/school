// Builds the Year 7 Data Analysis booklet (Lesson 1) and its answer key.
// Usage: node build.js   ->  writes booklet.html, answers.html and the matching PDFs.
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const LESSON = 'Lesson 1 · Mean, median and mode';

// ---------- small building blocks ----------
const dots = (n) => '<span class="lvl-dots">' + '<i></i>'.repeat(n) + '</span>';

const LEVELS = {
  1: { name: 'Level 1 · Getting started', dots: 1 },
  2: { name: 'Level 2 · Building up', dots: 2 },
  3: { name: 'Level 3 · Challenge', dots: 3 },
  4: { name: 'Extension · Stretch yourself', dots: 4 },
};

const banner = (lvl, instruction) => `
  <div class="banner lvl${lvl}">
    ${dots(LEVELS[lvl].dots)}<span class="banner-title">${LEVELS[lvl].name}</span>
  </div>
  ${instruction ? `<p class="instruction">${instruction}</p>` : ''}`;

const teacherTag = `<span class="tag teacher">Teacher example: copy the working as your teacher shows you</span>`;
const yourTurnTag = (txt) => `<span class="tag you">Your turn: ${txt}</span>`;

// A question with a lined working box that fills whatever space its container gives it.
const q = (label, text, opts = {}) => `
  <div class="q ${opts.cls || ''}">
    <div class="q-head"><span class="q-num">${label}</span><span class="q-text">${text}</span></div>
    <div class="work"></div>
    ${opts.answerHtml || '<div class="answer-line"><span>Answer:</span><i></i></div>'}
  </div>`;

const teacherExample = (label, text) => `
  <div class="q example">
    <div class="q-head"><span class="q-num ex">${label}</span><span class="q-text">${text}</span></div>
    <div class="work"></div>
  </div>`;

// A fully worked example (for extension + summary sections).
const worked = (label, lvl, question, steps, answer) => `
  <div class="worked lvl${lvl}">
    <div class="worked-head">${dots(LEVELS[lvl].dots)}<b>${label}</b></div>
    <p class="worked-q">${question}</p>
    <ol class="steps">${steps.map((s) => `<li>${s}</li>`).join('')}</ol>
    <p class="worked-a">${answer}</p>
  </div>`;

// ---------- page shell ----------
let pageNo = 0;
const page = (section, body, extraCls = '') => {
  pageNo += 1;
  return `
<section class="page ${extraCls}">
  <div class="art-strip"></div>
  <header class="page-head"><span>Data Analysis · ${LESSON}</span><span class="sec">${section}</span></header>
  <div class="content">${body}</div>
  <footer class="page-foot">
    <span>Artwork © Marni Tuala</span><span class="pn">${pageNo}</span><span>Kingscliff High School · Year 7 Mathematics</span>
  </footer>
</section>`;
};

// ---------- pages ----------
const pages = [];

// 1. Cover
pageNo += 1;
pages.push(`
<section class="page cover">
  <div class="cover-art"></div>
  <div class="cover-panel">
    <img class="logo" src="assets/kingscliff-logo.png" alt="Kingscliff High School">
    <p class="cover-stage">Stage 4 · Year 7 Mathematics</p>
    <h1>Data Analysis</h1>
    <p class="cover-lesson">${LESSON}</p>
    <div class="cover-fields">
      <div><span>Name</span><i></i></div>
      <div><span>Class</span><i></i></div>
      <div><span>Teacher</span><i></i></div>
    </div>
  </div>
  <p class="cover-credit">Cover and theme artwork by <b>Marni Tuala</b></p>
</section>`);

// 2. Inside cover: how to use + syllabus + acknowledgements
pages.push(page('About this booklet', `
  <h2>How to use this booklet</h2>
  <p class="lead">Each lesson follows the same steps. Work through them in order and write everything in this booklet.</p>
  <div class="howto">
    <div><span class="tag teacher">Teacher example</span><p>Your teacher works through the question on the board. Copy the working into the box.</p></div>
    <div><span class="tag you">Your turn</span><p>Answer the questions yourself. Show your working in the box and write your final answer on the line.</p></div>
    <div><span class="howto-dots">${dots(1)}${dots(2)}${dots(3)}</span><p>The dots show the level. One dot is getting started, two is building up and three is a challenge.</p></div>
    <div><span class="howto-dots">${dots(4)}</span><p>Extension questions stretch your thinking further. Read the worked example first.</p></div>
    <div><span class="tag summary">Summary</span><p>Missed a lesson? The summary pages have a fully worked example for every level.</p></div>
    <div><span class="tag exit">Exit ticket</span><p>Choose one question to show off your skill, then tear it off and hand it to your teacher.</p></div>
  </div>

  <h2>What we are learning</h2>
  <div class="syllabus">
    <p class="syl-label">NSW Mathematics K–10 Syllabus (2022) · Stage 4 · Statistics · Data analysis</p>
    <p><b>MA4-DAT-C-02</b>: analyses simple datasets using measures of centre, range and shape of the data</p>
    <p class="syl-label">Content focus for this lesson</p>
    <ul>
      <li>Calculate the mean, median and mode for sets of data and interpret them in the context of the data</li>
      <li>Investigate the effect of individual data values, including outliers, on the mean and median</li>
    </ul>
  </div>

  <div class="acknowledge grow">
    <div class="ack-art"></div>
    <div>
      <h3>Acknowledgement of artwork</h3>
      <p>The artwork used throughout this booklet was created by <b>Marni Tuala</b>. We thank Marni for sharing this artwork with our school community.</p>
      <h3>Acknowledgement of Country</h3>
      <p>We acknowledge the Bundjalung people, the Traditional Custodians of the land on which Kingscliff High School stands, and pay our respects to Elders past and present.</p>
    </div>
  </div>
`));

// 3. Learning intentions, success criteria, key terms
pages.push(page('Start here', `
  <div class="li-sc">
    <div class="card">
      <h3>Learning intentions</h3>
      <p class="card-sub">Today we are learning to:</p>
      <ul>
        <li>understand what a <b>measure of centre</b> is and why we use one</li>
        <li>calculate the <b>mean</b>, <b>median</b> and <b>mode</b> of a set of data</li>
        <li>use these measures to solve problems about real data</li>
      </ul>
    </div>
    <div class="card">
      <h3>Success criteria</h3>
      <p class="card-sub">I can:</p>
      <ul class="ticks">
        <li>find the <b>mean</b> by adding the values and dividing by how many there are</li>
        <li>find the <b>median</b> by ordering the data and finding the middle value</li>
        <li>find the <b>mode</b>, and tell when there is no mode or more than one</li>
        <li>work backwards from the mean to find a missing value</li>
      </ul>
    </div>
  </div>

  <h2>Key terms</h2>
  <p class="instruction">Write the definition as your teacher explains it.</p>
  <div class="terms grow">
    ${['Mean', 'Median', 'Mode'].map((t) => `
      <div class="term">
        <div class="term-name">${t}</div>
        <div class="term-lines"><i></i><i></i><i></i></div>
      </div>`).join('')}
  </div>
`));

// 4. Notes
pages.push(page('Notes', `
  <h2>My notes</h2>
  <p class="instruction">Write notes, diagrams and reminders from the lesson here.</p>
  <div class="work notes grow"></div>
`));

// 5. Level 1 teacher examples
pages.push(page('Level 1', `
  ${banner(1, '')}
  ${teacherTag}
  <div class="stack grow">
    ${teacherExample('Example 1', 'Find the <b>mean</b> of these numbers:&nbsp; 4, 7, 5, 8, 6')}
    ${teacherExample('Example 2', 'Find the <b>median</b> and the <b>mode</b> of these numbers:&nbsp; 3, 9, 4, 7, 4, 8, 5')}
  </div>
`));

// 6. Level 1 Set A
const setA = [
  '2, 4, 6', '5, 7, 9', '1, 3, 5, 7', '10, 20, 30', '3, 5, 4, 8',
  '6, 6, 9, 3', '2, 8, 5, 7, 3', '12, 15, 18', '4, 9, 2, 5, 10', '7, 11, 9, 13',
];
pages.push(page('Level 1 · Set A', `
  ${banner(1, '')}
  ${yourTurnTag('Set A. Find the <b>mean</b> of each set of numbers.')}
  <div class="grid10 grow">${setA.map((s, i) => q(`${i + 1}`, s)).join('')}</div>
`));

// 7. Level 1 Set B
const setB = [
  '2, 3, 3, 5, 8', '1, 4, 4, 6, 9', '7, 2, 5, 2, 9', '6, 1, 8, 6, 3', '10, 12, 11, 10, 15',
  '4, 9, 7, 9, 2, 5, 9', '15, 13, 14, 13, 18', '8, 3, 6, 3, 1, 5, 3', '20, 25, 22, 25, 21', '5, 7, 6, 7, 9, 4, 8',
];
pages.push(page('Level 1 · Set B', `
  ${banner(1, '')}
  ${yourTurnTag('Set B. Find the <b>median</b> and the <b>mode</b> of each set. Order the numbers first!')}
  <div class="grid10 grow">${setB.map((s, i) => q(`${i + 1}`, s, { answerHtml: '<div class="answer-line"><span>Median:</span><i></i><span>Mode:</span><i></i></div>' })).join('')}</div>
`));

// 8. Level 2 teacher examples
pages.push(page('Level 2', `
  ${banner(2, '')}
  ${teacherTag}
  <div class="stack grow">
    ${teacherExample('Example 3', 'Find the <b>median</b> of:&nbsp; 8, 3, 10, 5, 7, 12')}
    ${teacherExample('Example 4', 'A basketball player scored 12, 15, 9, 18, 11 and 13 points in six games. Find the <b>mean</b>, <b>median</b> and <b>mode</b> of her scores.')}
  </div>
`));

// 9–11. Level 2 Set C
const setC = [
  'Find the <b>median</b> of:&nbsp; 4, 9, 2, 7',
  'Find the <b>median</b> of:&nbsp; 11, 15, 12, 18, 14, 20',
  'Find the <b>mean</b> of:&nbsp; 3, 8, 5, 6',
  'Find the <b>mean</b> of:&nbsp; 2.5, 3.5, 4, 6',
  'Find the <b>mode</b> of:&nbsp; 6, 2, 8, 2, 6, 5',
  'The heights of six students (in cm) are 150, 145, 160, 155, 148 and 152. Find the <b>median</b> height.',
  'The maximum temperatures (°C) for a week were 21, 24, 19, 24, 22, 23, 21. Find the <b>mean</b>, <b>median</b> and <b>mode</b>.',
  'A soccer team scored 2, 0, 3, 1, 2, 4, 2, 2 goals in eight games. Find the <b>mean</b>, <b>median</b> and <b>mode</b>.',
  'Find the <b>mean</b> of:&nbsp; 7, 9, 10, 12, 14',
  'Six friends get $15, $20, $10, $25, $20 and $30 pocket money each week. Find the <b>mean</b>, <b>median</b> and <b>mode</b>.',
];
const practicePages = (title, lvl, setName, qs, split) => {
  let start = 0;
  split.forEach((n, pi) => {
    const chunk = qs.slice(start, start + n);
    const first = start;
    pages.push(page(title, `
  ${pi === 0 ? banner(lvl, '') : ''}
  ${yourTurnTag(pi === 0 ? `${setName}. Show your working in each box.` : `${setName} continued.`)}
  <div class="grid-stack grow" style="grid-template-rows: repeat(${n}, 1fr)">${chunk.map((t, i) => q(`${first + i + 1}`, t)).join('')}</div>
`));
    start += n;
  });
};
practicePages('Level 2 · Set C', 2, 'Set C', setC, [4, 3, 3]);

// 12. Level 3 teacher examples
pages.push(page('Level 3', `
  ${banner(3, '')}
  ${teacherTag}
  <div class="stack grow">
    ${teacherExample('Example 5', 'The mean of five numbers is 8. Four of the numbers are 6, 9, 5 and 10. Find the <b>fifth number</b>.')}
    ${teacherExample('Example 6', 'The ages of six people at a party are 11, 12, 12, 13, 12 and 44. Find the <b>mean</b> and <b>median</b> age. Which one better describes a typical age at the party? Explain why.')}
  </div>
`));

// 13–15. Level 3 Set D
const setD = [
  'The mean of four numbers is 6. Three of the numbers are 4, 7 and 8. Find the fourth number.',
  'The mean of five test scores is 72. Four of the scores are 68, 75, 70 and 80. Find the fifth score.',
  'Write a set of five numbers that has a mean of 6, a median of 5 and a mode of 4.',
  'For the data 3, 5, 6, 6, 40, find the mean and the median. Which is the better measure of centre? Explain why.',
  'The number 20 is added to the data set 4, 6, 7, 8, 10. How do the mean and the median change?',
  'Mia scored 7, 8, 6 and 9 on four quizzes. What does she need to score on her fifth quiz to have a mean of 8?',
  'Three whole numbers have a mean of 10 and a median of 9. The smallest number is 5. Find the largest number.',
  'The mean of six numbers is 15. When one number is removed, the mean of the other five is 14. Which number was removed?',
  'A shoe shop sold these sizes today: 7, 8, 8, 9, 10, 8, 11. The owner wants to know which size to order the most of. Should she use the mean, median or mode? Explain.',
  'Class A scored 12, 15, 15, 18, 20 and Class B scored 10, 14, 16, 19, 21 on a quiz. Compare the two classes using the mean and the median.',
];
practicePages('Level 3 · Set D', 3, 'Set D', setD, [3, 3, 4]);

// 16–17. Extension
pages.push(page('Extension', `
  ${banner(4, 'Read the worked example carefully, then try the extension questions.')}
  ${worked('Worked example', 4,
    'The mean age of four friends is 13. When a fifth friend joins the group, the mean age becomes 14. How old is the fifth friend?',
    [
      'Find the total of the four ages: &nbsp;4 × 13 = 52',
      'Find the total of all five ages: &nbsp;5 × 14 = 70',
      'The difference is the new friend’s age: &nbsp;70 − 52 = 18',
      'Check: &nbsp;(52 + 18) ÷ 5 = 70 ÷ 5 = 14 ✓',
    ],
    '<b>Answer:</b> the fifth friend is 18 years old.')}
  <p class="tip"><b>Key idea:</b> mean × number of values = total. Working with totals makes “missing value” questions much easier.</p>
  <div class="stack grow">
    ${q('E1', 'The mean mark of 10 students on a test is 65. The teacher re-marks one test and adds 15 marks to it. What is the new mean?')}
  </div>
`));
pages.push(page('Extension', `
  ${yourTurnTag('Extension continued.')}
  <div class="stack grow">
    ${q('E2', 'A list of five positive whole numbers has a mean of 7, a median of 8 and only one mode, which is 9. Find <b>all</b> the possible lists.')}
    ${q('E3', 'The mean of three consecutive whole numbers is 17. (a)&nbsp;What are the numbers? (b)&nbsp;Explain why the mean of any three consecutive whole numbers is always the middle number.')}
  </div>
`));

// 18–20. Summary
const chips = (vals, mid) => `<span class="chips">${vals.map((v, i) =>
  `<span class="chip ${mid.includes(i) ? 'mid' : 'out'}">${v}</span>`).join('')}</span>`;

pages.push(page('Summary', `
  <div class="banner summary"><span class="banner-title">Lesson summary</span></div>
  <p class="instruction">Missed the lesson? Start here. These pages show you everything you need, step by step.</p>
  <div class="key-ideas">
    <div class="idea">
      <h3>Mean</h3>
      <p>The <b>average</b>. Add up all the values, then divide by how many values there are.</p>
      <p class="formula">mean = total of the values ÷ number of values</p>
    </div>
    <div class="idea">
      <h3>Median</h3>
      <p>The <b>middle value</b> when the data is written in order from smallest to largest.</p>
      <p class="formula">Two middle values? The median is halfway between them.</p>
    </div>
    <div class="idea">
      <h3>Mode</h3>
      <p>The value that appears <b>most often</b>.</p>
      <p class="formula">There can be no mode, or more than one mode.</p>
    </div>
  </div>
  <div class="card median-trick">
    <h3>Finding the median: cross off from both ends</h3>
    <p class="card-sub">Put the data in order, then cross off one value from each end until you reach the middle.</p>
    <div class="trick-row">
      <div class="trick-label"><b>Odd</b> number of values<br><span>one middle value</span></div>
      ${chips([3, 5, 5, 7, 10], [2])}
      <div class="trick-result">median = <b>5</b></div>
    </div>
    <div class="trick-row">
      <div class="trick-label"><b>Even</b> number of values<br><span>two middle values</span></div>
      ${chips([4, 6, 7, 9, 10, 12], [2, 3])}
      <div class="trick-result">median = (7 + 9) ÷ 2 = <b>8</b></div>
    </div>
  </div>
  <div class="card which grow">
    <h3>Which measure should I use?</h3>
    <table>
      <tr><td><b>Mean</b></td><td>Uses every value. Best when there are no unusually large or small values.<span class="eg">e.g. quiz scores 6, 7, 8, 9: mean = 7.5</span></td></tr>
      <tr><td><b>Median</b></td><td>Not pulled around by an <b>outlier</b> (a value much bigger or smaller than the rest). Best when the data has an outlier.<span class="eg">e.g. ages 11, 12, 12, 13, 44: median = 12, but the mean is 18.4</span></td></tr>
      <tr><td><b>Mode</b></td><td>Shows the most common value. Best for finding the most popular choice, like a shoe size or favourite colour.<span class="eg">e.g. shoe sizes sold 7, 8, 8, 9, 8: mode = size 8</span></td></tr>
    </table>
  </div>
`));

pages.push(page('Summary', `
  <div class="stack grow">
  ${worked('Level 1 worked example', 1,
    'Find the mean, median and mode of:&nbsp; 3, 5, 7, 5, 10',
    [
      '<b>Mean:</b> add up the values: &nbsp;3 + 5 + 7 + 5 + 10 = 30',
      'Count the values: there are <b>5</b> values',
      'Divide the total by the count: &nbsp;30 ÷ 5 = <b>6</b>',
      '<b>Median:</b> write the values in order: &nbsp;3, 5, 5, 7, 10',
      'Cross off from both ends. The middle (3rd) value is <b>5</b>',
      '<b>Mode:</b> 5 appears twice. Every other value appears once, so the mode is <b>5</b>',
    ],
    '<b>Answer:</b> mean = 6, median = 5, mode = 5')}
  ${worked('Level 2 worked example', 2,
    'Find the mean, median and mode of:&nbsp; 9, 4, 12, 6, 10, 7',
    [
      '<b>Mean:</b> add up the values: &nbsp;9 + 4 + 12 + 6 + 10 + 7 = 48',
      'There are 6 values, so the mean is &nbsp;48 ÷ 6 = <b>8</b>',
      '<b>Median:</b> write the values in order: &nbsp;4, 6, 7, 9, 10, 12',
      'There are 6 values (an even number), so there are <b>two</b> middle values: 7 and 9',
      'Find halfway between them: &nbsp;(7 + 9) ÷ 2 = 16 ÷ 2 = <b>8</b>',
      '<b>Mode:</b> every value appears only once, so there is <b>no mode</b>',
    ],
    '<b>Answer:</b> mean = 8, median = 8, no mode')}
  </div>
`));

pages.push(page('Summary', `
  <div class="stack grow">
  ${worked('Level 3 worked example', 3,
    'The mean of four test scores is 15. Three of the scores are 12, 18 and 14. Find the fourth score.',
    [
      '<b>Total of all four scores:</b> mean × number of scores = 15 × 4 = 60',
      '<b>Total of the three known scores:</b> 12 + 18 + 14 = 44',
      '<b>Missing score:</b> 60 − 44 = 16',
      '<b>Check:</b> (12 + 18 + 14 + 16) ÷ 4 = 60 ÷ 4 = 15 ✓',
    ],
    '<b>Answer:</b> the fourth score is 16')}
  ${worked('Extension worked example', 4,
    'The mean of five numbers is 10. A sixth number is added and the mean becomes 12. What number was added?',
    [
      '<b>Total of the five numbers:</b> 5 × 10 = 50',
      '<b>Total of the six numbers:</b> 6 × 12 = 72',
      '<b>Number added:</b> 72 − 50 = 22',
      '<b>Check:</b> 72 ÷ 6 = 12 ✓',
    ],
    '<b>Answer:</b> the number added was 22')}
  <div class="card checklist">
    <h3>Common mistakes to avoid</h3>
    <ul>
      <li>Forgetting to <b>put the data in order</b> before finding the median.</li>
      <li>Dividing by the wrong number when finding the mean. <b>Count the values carefully.</b></li>
      <li>Giving the <b>position</b> of the median (e.g. “the 3rd value”) instead of the value itself.</li>
      <li>Thinking there must always be one mode. There can be <b>none</b>, or <b>more than one</b>.</li>
      <li>An <b>outlier</b> pulls the mean towards it. The median is not affected as much.</li>
    </ul>
  </div>
  </div>
`));

if ((pages.length + 1) % 2 === 0) throw new Error('Exit ticket must be on an odd (right-hand) page');
// 21. Exit ticket (odd page, so its back is page 22 when printed double-sided)
const selfCheck = [
  'find the mean of a data set',
  'find the median, including when there are two middle values',
  'find the mode, and tell when there is no mode or more than one',
  'work backwards from the mean to find a missing value',
];
pages.push(page('Exit ticket', `
  <div class="card selfcheck">
    <h3>Before you go: how did you go today?</h3>
    <p class="card-sub">Tick one box for each success criterion.</p>
    <table>
      <tr><th>I can…</th><th>Not yet</th><th>Nearly</th><th>Got it!</th></tr>
      ${selfCheck.map((s) => `<tr><td>${s}</td><td><i class="tick"></i></td><td><i class="tick"></i></td><td><i class="tick"></i></td></tr>`).join('')}
    </table>
  </div>
  <div class="tear-zone">
    <div class="cut-line"><span>✂ Tear or cut along this line and hand the bottom part to your teacher ✂</span></div>
    <div class="exit">
      <div class="exit-head">
        <div><h2>Show off your skill</h2><p>Choose <b>ONE</b> question and circle the level you chose. Show your working.</p></div>
        <div class="exit-name"><span>Name</span><i></i><span>Class</span><i class="short"></i></div>
      </div>
      <div class="exit-cols">
        ${q(`${dots(1)} Level 1`, 'Find the <b>mean</b> of:<br>4, 6, 8, 10, 12', { cls: 'exit-q' })}
        ${q(`${dots(2)} Level 2`, 'Find the <b>median</b> and <b>mode</b> of:<br>9, 3, 7, 3, 11, 6', { cls: 'exit-q' })}
        ${q(`${dots(3)} Level 3`, 'The mean of four numbers is 9. Three of them are 7, 12 and 5. Find the <b>fourth number</b>.', { cls: 'exit-q' })}
      </div>
    </div>
  </div>
`));

// 22. Back of the exit ticket: top half is used, bottom half stays blank so it can be torn off.
pages.push(page('Reflection', `
  <h2>Questions I still have</h2>
  <p class="instruction">Write anything you are still unsure about. Ask your teacher about it next lesson.</p>
  <div class="work notes reflect"></div>
  <div class="tear-zone back">
    <div class="cut-line"><span>✂</span></div>
    <div class="blank-note">This space is left blank on purpose.<br>It is the back of your exit ticket.</div>
  </div>
`));

// ---------- answers (teacher copy) ----------
const answers = {
  'Level 1 · Set A (mean)': ['4', '7', '4', '20', '5', '6', '5', '15', '6', '10'],
  'Level 1 · Set B (median, mode)': ['3, 3', '4, 4', '5, 2', '6, 6', '11, 10', '7, 9', '14, 13', '3, 3', '22, 25', '7, 7'],
  'Level 2 · Set C': ['5.5', '14.5', '5.5', '4', '2 and 6', '151 cm', 'mean 22, median 22, modes 21 and 24', 'mean 2, median 2, mode 2', '10.4', 'mean $20, median $20, mode $20'],
  'Level 3 · Set D': [
    '24 − 19 = 5', '360 − 293 = 67', 'e.g. 4, 4, 5, 8, 9 (many answers possible)',
    'mean 12, median 6. The median is better because 40 is an outlier that pulls the mean up.',
    'mean goes from 7 to about 9.17 (up by about 2.17); median goes from 7 to 7.5',
    '40 − 30 = 10', '30 − 5 − 9 = 16', '90 − 70 = 20',
    'Mode (size 8). It shows which size sells most often.',
    'Both have a mean of 16. Class B has a higher median (16 vs 15).',
  ],
  'Extension': [
    'Total 650 → 665, new mean 66.5',
    '2, 7, 8, 9, 9 &nbsp;·&nbsp; 3, 6, 8, 9, 9 &nbsp;·&nbsp; 4, 5, 8, 9, 9 (the two smallest must be different, less than 8 and add to 9)',
    '(a) 16, 17, 18 &nbsp;(b) n − 1, n, n + 1 add to 3n, and 3n ÷ 3 = n, the middle number',
  ],
  'Teacher examples': ['Ex 1: 6', 'Ex 2: median 5, mode 4', 'Ex 3: 7.5', 'Ex 4: mean 13, median 12.5, no mode', 'Ex 5: 40 − 30 = 10', 'Ex 6: mean ≈ 17.3, median 12. The median is better (44 is an outlier).'],
  'Exit ticket': ['Level 1: 8', 'Level 2: median 6.5, mode 3', 'Level 3: 36 − 24 = 12'],
};
const answerBody = Object.entries(answers).map(([k, v]) => `
  <div class="ans-block"><h3>${k}</h3><ol>${v.map((a) => `<li>${a}</li>`).join('')}</ol></div>`).join('');

// ---------- write files ----------
const css = fs.readFileSync(path.join(OUT, 'booklet.css'), 'utf8');
const doc = (title, body) => `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8"><title>${title}</title>
<style>${css}</style></head><body>${body}</body></html>`;

fs.writeFileSync(path.join(OUT, 'booklet.html'), doc('Data Analysis Booklet', pages.join('\n')));

pageNo = 0;
fs.writeFileSync(path.join(OUT, 'answers.html'), doc('Data Analysis Answers', page('Teacher answers', `
  <h2>Answers (teacher copy)</h2>
  <div class="answers">${answerBody}</div>`)));

(async () => {
  const { chromium } = require(require.resolve('playwright', { paths: [require('child_process').execSync('npm root -g').toString().trim()] }));
  const browser = await chromium.launch();
  const pg = await browser.newPage();
  for (const name of ['booklet', 'answers']) {
    await pg.goto('file://' + path.join(OUT, `${name}.html`));
    await pg.evaluate(() => document.fonts.ready);
    // Report any page whose content overflows its box so layout problems are caught at build time.
    const overflow = await pg.evaluate(() => [...document.querySelectorAll('.page')]
      .map((pg, i) => { const c = pg.querySelector('.content'); return c && !c.querySelector('.tear-zone') && c.scrollHeight > c.clientHeight + 1 ? i + 1 : 0; }).filter(Boolean));
    if (overflow.length) console.warn(`${name}: content overflows on page(s) ${overflow.join(', ')}`);
    await pg.pdf({ path: path.join(OUT, `Year7-Data-Analysis-Lesson1${name === 'answers' ? '-Answers' : ''}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(`${name}: done`);
  }
  await browser.close();
})();
