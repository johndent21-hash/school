// Extra content used only when a lesson is printed as its own booklet:
// what students need, the syllabus outcome, and a warm-up on the skills the lesson builds on.
// warmup: [question, answer] pairs. Keep answers short; they go in the lesson's answer key.
const OUT = {
  C01: 'MA4-DAT-C-01: classifies and displays data using a variety of graphical representations',
  C02: 'MA4-DAT-C-02: analyses simple datasets using measures of centre, range and shape of the data',
};

module.exports = {
  '10.01': {
    outcome: OUT.C01,
    need: ['Pencil', 'Ruler', 'Calculator'],
    warmup: [['½ of 80', '40'], ['¼ of 60', '15'], ['10% of 300', '30'], ['20 out of 100 as a percentage', '20%']],
  },
  '10.02': {
    outcome: OUT.C01,
    need: ['Pencil', 'Ruler'],
    warmup: [['64 − 58', '6'], ['6 ÷ 2', '3'], ['2 × 2', '4'], ['What should every graph have at the top?', 'A title']],
  },
  '10.03': {
    outcome: OUT.C01,
    need: ['Pencil', 'Ruler'],
    warmup: [['Order: 7, 3, 9, 3, 5', '3, 3, 5, 7, 9'], ['How many 4s: 4, 1, 4, 6, 4', '3'], ['6 out of 30 as a simplified fraction', '1/5'],
      ['Which value is far from the rest: 5, 6, 5, 7, 21', '21']],
  },
  '10.04': {
    outcome: OUT.C01,
    need: ['Pencil', 'Ruler'],
    warmup: [['Tens digit of 47', '4'], ['Units digit of 63', '3'], ['Order: 8, 2, 6, 1', '1, 2, 6, 8'], ['How many tenths in 0.7?', '7']],
  },
  '10.05': {
    outcome: OUT.C02,
    need: ['Pencil', 'Calculator'],
    warmup: [['4 + 7 + 5 + 8 + 6', '30'], ['30 ÷ 5', '6'], ['52 ÷ 7 to 2 decimal places', '7.43'], ['Most common value: 2, 5, 5, 8, 5, 1', '5']],
  },
  '10.06': {
    outcome: OUT.C02,
    need: ['Pencil', 'Calculator'],
    warmup: [['Order: 9, 2, 7, 4, 6', '2, 4, 6, 7, 9'], ['Halfway between 7 and 9', '8'], ['20 − 5', '15'], ['8 − (−3)', '11']],
  },
  '10.07': {
    outcome: OUT.C02,
    need: ['Pencil', 'Ruler', 'Calculator'],
    warmup: [['Mean of 2, 4, 6', '4'], ['Median of 3, 1, 8, 5', '4'], ['0×3 + 1×5 + 2×4', '13'], ['Range of 12, 30, 21', '18']],
  },
  '10.08': {
    outcome: OUT.C02,
    need: ['Pencil', 'Ruler', 'Calculator'],
    warmup: [['Median of 11, 14, 12, 18, 15', '14'], ['Range: lowest 145, highest 175', '30'], ['Mean of 5 and 15', '10'],
      ['A bigger range means the data is more …', 'spread out']],
  },
};
