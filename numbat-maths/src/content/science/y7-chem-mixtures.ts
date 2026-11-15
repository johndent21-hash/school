// Year 7 chemistry, Lessons 8–16: solutions, solubility, concentration, pure substances and mixtures, and separating
// mixtures. NSW Science 7–10 Syllabus (2023), Stage 4 focus area Solutions and mixtures (SC4-SOL-01): "Solutions" and
// "Separating mixtures"; Working scientifically SC4-WS-03, SC4-WS-04, SC4-WS-07.
// Solubility data are rounded published values (grams that dissolve in 100 g of water).
import type { Skill } from '@/lib/maths/types'
import { int, pick, sample, shuffle } from '../helpers'
import { type Box, type Entry, LETTERS, b, bank, fourBoxes, m, mk, nf, particleBox } from './kit'
import { SOL } from './y7-chem-matter'

const SOLUTIONS: [string, string, string][] = [
  // solution, solute, solvent
  ['salt water', 'salt', 'water'],
  ['sugar dissolved in tea', 'sugar', 'water'],
  ['cordial made from syrup and water', 'the syrup', 'water'],
  ['instant coffee dissolved in hot water', 'the coffee powder', 'water'],
  ['sea water', 'salt (and other minerals)', 'water'],
  ['soft drink', 'sugar and carbon dioxide', 'water'],
]
const SOLUBLE = ['table salt', 'sugar', 'instant coffee', 'copper sulfate', 'food colouring', 'Epsom salts', 'stock powder']
const INSOLUBLE = ['sand', 'chalk', 'flour', 'pepper', 'cooking oil', 'iron filings', 'plastic beads', 'pebbles']

// ================================================================== Lesson 8 Solutions

const solEntries: Entry[] = [
  mk(1, () => {
    const [sol, solute, solvent] = pick(SOLUTIONS)
    return { t: 'solute', q: `In ${b(sol)}, what is the ${b('solute')}?`, a: solute, w: [solvent, sol, 'the cup', 'the air'], why: `The solute is the substance that dissolves (${solute}); the solvent is the ${solvent} it dissolves in.` }
  }),
  mk(1, () => {
    const [sol, solute, solvent] = pick(SOLUTIONS)
    return { t: 'solvent', q: `In ${b(sol)}, what is the ${b('solvent')}?`, a: solvent, w: [solute, sol, 'the spoon', 'there is no solvent'], why: `The solvent is the liquid that does the dissolving: ${solvent}.` }
  }),
  mk(1, () => {
    const s = pick(SOLUBLE)
    const i = pick(INSOLUBLE)
    const askSol = int(0, 1) === 1
    return { t: 'which', q: `Which of these is ${b(askSol ? 'soluble' : 'insoluble')} in water?`, a: askSol ? s : i, w: askSol ? sample(INSOLUBLE, 3) : sample(SOLUBLE, 3), why: askSol ? `${s[0].toUpperCase() + s.slice(1)} dissolves in water: it is soluble.` : `${i[0].toUpperCase() + i.slice(1)} does not dissolve in water: it is insoluble.` }
  }),
  m(1, 'define', 'What is a solution?', 'a mixture in which a solute is dissolved evenly in a solvent', ['any liquid', 'a solid that has melted', 'an answer to a maths problem'], 'A solution is a solute dissolved evenly through a solvent.'),
  m(1, 'soluble', 'What does “soluble” mean?', 'able to dissolve', ['able to melt', 'able to float', 'unable to dissolve'], 'A soluble substance can dissolve in a solvent.'),
  m(1, 'universal', 'Why is water called the “universal solvent”?', 'more substances dissolve in water than in any other common liquid', ['it dissolves everything', 'it is found everywhere in the universe', 'it never evaporates'], 'Water dissolves a huge range of substances, though not everything (oil, sand and plastic don’t dissolve in it).'),
  m(1, 'clear', 'Sugar is stirred into water and disappears. Where has the sugar gone?', 'it has dissolved: its particles are spread through the water', ['it has been destroyed', 'it has evaporated', 'it has turned into water'], 'The sugar is still there (the water tastes sweet); its particles are spread among the water particles.'),
  m(2, 'see', 'How can you tell a solution from a mixture such as sand in water?', 'a solution is clear (see-through) and does not settle; the sand settles and can be filtered out', ['a solution is always colourless', 'sand in water is a solution if stirred', 'they cannot be told apart'], 'Solutions are see-through (they may be coloured) and the solute never settles out.'),
  m(2, 'otherSolvent', 'Nail polish does not dissolve in water but does dissolve in acetone. What does this show?', 'whether a substance dissolves depends on the solvent', ['nail polish is insoluble in everything', 'acetone is a solute', 'water is not a solvent'], 'A substance can be insoluble in one solvent and soluble in another.'),
  m(2, 'gasSolute', 'In soft drink, which solute is a gas?', 'carbon dioxide', ['sugar', 'water', 'oxygen'], 'Carbon dioxide gas is dissolved under pressure; it bubbles out when the bottle is opened.'),
  m(2, 'mass', '100 g of water and 10 g of salt are mixed until all the salt dissolves. What is the mass of the solution?', '110 g', ['100 g', '90 g', '10 g'], 'Mass is conserved when dissolving: 100 + 10 = 110 g.'),
  m(2, 'investigate', 'A student tests whether 5 substances dissolve in water. Which should be kept the same for a fair test?', 'the amount of water, the amount of each substance, the temperature and the stirring', ['the substance being tested', 'nothing: just add things', 'the result'], 'Only the substance (independent variable) changes; everything else is controlled.'),
  m(2, 'insolDefine', 'What happens when an insoluble substance is stirred into water?', 'it stays as separate particles and eventually settles or floats', ['it dissolves completely', 'it disappears', 'it turns the water into a gas'], 'Insoluble substances do not dissolve; they form a mixture that can usually be separated by filtering.'),
  m(3, 'alloy', 'Brass is a solid mixture of copper and zinc. Why can brass be called a solution?', 'zinc is spread evenly through the copper, so it is a uniform (homogeneous) mixture', ['it is a liquid', 'it dissolves in water', 'it is a pure element'], 'A solution is any uniform mixture; solids (alloys) and gases (air) can be solutions too.'),
  m(3, 'air', 'Air is mostly nitrogen with oxygen and small amounts of other gases. Which is the solvent?', 'nitrogen, because there is most of it', ['oxygen, because we breathe it', 'carbon dioxide', 'air has no solvent'], 'In a solution, the substance present in the greatest amount is usually the solvent.'),
  m(3, 'prove', 'How could you show that salt water still contains salt without tasting it?', 'evaporate the water and look for salt crystals left behind', ['filter it through filter paper', 'freeze it', 'look at it under a torch'], 'Dissolved salt passes through filter paper but is left behind when the water evaporates.'),
  m(2, 'colouredClear', 'Copper sulfate solution is blue. Is it still a solution?', 'yes: a solution can be coloured as long as it is clear (see-through)', ['no: solutions must be colourless', 'no: it is a solid', 'only if it is boiled'], 'Clear means see-through, not colourless.'),
  m(2, 'oilWater', 'Oil is shaken with water and then left. It forms a layer on top. Why is this not a solution?', 'oil is insoluble in water, so the two separate', ['oil is a gas', 'oil dissolves completely', 'water floats on oil'], 'Insoluble liquids separate into layers instead of mixing evenly.'),
  m(3, 'sugarTemp', 'Two students each dissolve sugar in 100 mL of water, one at 20 °C and one at 60 °C. Which question are they most likely testing?', 'Does temperature affect how much sugar dissolves?', ['Does stirring make sugar sweeter?', 'Is sugar a solvent?', 'Does sugar float?'], 'Changing only the temperature tests its effect on solubility.'),
  m(3, 'safetyTaste', 'Why should you never taste substances in a science lab, even to test for sugar or salt?', 'lab substances and equipment may be contaminated or toxic', ['tasting is not accurate', 'sugar is dangerous', 'it wastes the substances'], 'Never taste or eat anything in a lab; use other tests such as evaporation.'),
  m(3, 'saltPure', 'A student filters salty, sandy water. The filtrate is clear but still salty. What should she do to get the salt?', 'evaporate the water from the filtrate', ['filter it again', 'add more sand', 'freeze it'], 'Filtering removed the insoluble sand; evaporation leaves the dissolved salt.'),
]

// ================================================================== Lesson 9 Solubility and temperature

// grams that dissolve in 100 g of water at each temperature (°C)
const KNO3: [number, number][] = [
  [0, 13],
  [20, 32],
  [40, 64],
  [60, 110],
  [80, 169],
]
const NACL: [number, number][] = [
  [0, 36],
  [20, 36],
  [40, 36],
  [60, 37],
  [80, 38],
]
const table = (rows: [number, number][], name: string) =>
  `<div class="tablewrap"><table class="dtable"><caption>${name}: grams that dissolve in 100 g of water</caption><thead><tr><th>Temperature (°C)</th>${rows.map((r) => `<th>${r[0]}</th>`).join('')}</tr></thead><tbody><tr><th>Mass dissolved (g)</th>${rows.map((r) => `<td>${r[1]}</td>`).join('')}</tr></tbody></table></div>`
const solubilityEntries: Entry[] = [
  m(1, 'define', 'What is solubility?', 'the greatest amount of a solute that can dissolve in a certain amount of solvent at a given temperature', ['how fast a solute dissolves', 'how much solvent there is', 'whether a substance melts'], 'Solubility is the maximum mass of solute that dissolves (often per 100 g of water) at that temperature.'),
  m(1, 'tea', 'Why does sugar dissolve better in hot tea than in iced tea?', 'most solids are more soluble in hotter water', ['hot water has less water in it', 'sugar melts in hot tea', 'iced tea is not a solvent'], 'For most solids, solubility increases as temperature rises.'),
  mk(1, () => {
    const [T, g] = pick(KNO3)
    return { t: 'readKNO3', q: `${table(KNO3, 'Potassium nitrate')}How many grams of potassium nitrate dissolve in 100 g of water at ${b(`${T} °C`)}?`, n: g, unit: 'g', why: [`Read the table at ${T} °C: ${g} g.`], meta: { T } }
  }),
  m(1, 'faster', 'Which of these makes sugar dissolve faster (but does not change how much can dissolve)?', 'stirring', ['using less water', 'adding more sugar', 'using a bigger spoon'], 'Stirring brings fresh solvent to the solute, so it dissolves faster, but the solubility is unchanged.'),
  m(1, 'crush', 'Why does a sugar cube dissolve more slowly than the same amount of loose sugar?', 'the loose sugar has a larger surface area touching the water', ['sugar cubes are insoluble', 'cubes have less sugar', 'cubes are colder'], 'Smaller pieces have more surface area, so more particles meet the water at once.'),
  mk(2, () => {
    const i = int(0, 3)
    const [T1, g1] = KNO3[i]
    const [T2, g2] = KNO3[i + 1]
    return { t: 'diff', q: `${table(KNO3, 'Potassium nitrate')}How much more potassium nitrate dissolves in 100 g of water at ${b(`${T2} °C`)} than at ${b(`${T1} °C`)}?`, n: g2 - g1, unit: 'g', why: [`${g2} − ${g1} = ${g2 - g1} g`], meta: { i } }
  }),
  m(2, 'trend', `${table(KNO3, 'Potassium nitrate')}What is the trend in the table?`, 'as temperature increases, more potassium nitrate dissolves', ['as temperature increases, less dissolves', 'the amount stays the same', 'there is no pattern'], 'The mass dissolved rises from 13 g at 0 °C to 169 g at 80 °C.'),
  m(2, 'compareSalt', `${table(NACL, 'Sodium chloride (salt)')}How does temperature affect the solubility of salt?`, 'it hardly changes: salt’s solubility increases only slightly', ['it increases greatly', 'it decreases greatly', 'salt is insoluble'], 'From 0 °C to 80 °C, salt’s solubility only goes from 36 g to 38 g.'),
  m(2, 'variables', 'A student investigates how temperature affects the solubility of sugar. What is the independent variable?', 'the temperature of the water', ['the mass of sugar that dissolves', 'the amount of water', 'the type of spoon'], 'The independent variable is the one the student changes on purpose: temperature.'),
  m(2, 'dependent', 'In the same investigation, what is the dependent variable?', 'the mass of sugar that dissolves', ['the temperature of the water', 'the volume of water used', 'the stirring time'], 'The dependent variable is what is measured: the mass that dissolves.'),
  m(2, 'gas', 'A warm can of soft drink goes flat faster than a cold one. Why?', 'gases are less soluble in warmer water, so the carbon dioxide escapes', ['warm drinks have no gas', 'gases are more soluble in warm water', 'cans leak when warm'], 'Unlike most solids, gases are less soluble as temperature rises.'),
  mk(3, () => {
    const [T, g] = pick(KNO3.slice(1, 4))
    const added = g + pick([-10, 10, 20])
    const all = added <= g
    return { t: 'saturated', q: `${table(KNO3, 'Potassium nitrate')}${b(`${added} g`)} of potassium nitrate is stirred into 100 g of water at ${b(`${T} °C`)}. What happens?`, a: all ? 'it all dissolves, and the solution is not saturated' : `only ${g} g dissolves; ${added - g} g is left undissolved and the solution is saturated`, w: all ? [`only ${g - 10} g dissolves`, 'none of it dissolves', 'it all dissolves and the solution is saturated'] : ['it all dissolves', `only ${added - g} g dissolves`, 'none of it dissolves'], why: `At ${T} °C, up to ${g} g dissolves. ${added} g is ${all ? 'less than that, so it all dissolves' : `more, so ${added - g} g is left over`}.`, meta: { T, added } }
  }),
  mk(3, () => {
    const water = pick([50, 200])
    const [T, g] = pick(KNO3.slice(1))
    return { t: 'scale', calc: true, q: `${table(KNO3, 'Potassium nitrate')}How many grams of potassium nitrate can dissolve in ${b(`${water} g`)} of water at ${b(`${T} °C`)}?`, n: (g * water) / 100, dp: 1, unit: 'g', why: [`${g} g per 100 g of water`, `${water} g of water: ${g} × ${water} ÷ 100 = ${nf((g * water) / 100, 1)} g`], meta: { T, water } }
  }),
  m(3, 'crystals', 'A saturated solution of potassium nitrate at 60 °C is cooled to 20 °C. What will you see?', 'crystals form, because less can stay dissolved at the lower temperature', ['nothing happens', 'the solution starts boiling', 'more solid dissolves'], 'At 60 °C, 110 g is dissolved, but only 32 g can stay dissolved at 20 °C, so the rest crystallises.'),
]

// ================================================================== Lesson 10 Dissolving and the particle model

const dissolveEntries: Entry[] = [
  m(1, 'what', 'When salt dissolves in water, what happens to the salt particles?', 'they separate and spread out between the water particles', ['they disappear', 'they turn into water particles', 'they sink to the bottom'], 'The solute particles break away from each other and mix evenly among the solvent particles.'),
  m(1, 'still', 'Is the salt still there after it dissolves?', 'yes: its particles are spread through the water (the water tastes salty)', ['no: it has been destroyed', 'no: it has evaporated', 'only if the water is hot'], 'Dissolving is a physical change; the salt can be recovered by evaporation.'),
  m(1, 'spaces', 'According to the particle model, where do the solute particles go when they dissolve?', 'into the spaces between the solvent particles', ['inside the solvent particles', 'out of the container', 'to the top of the liquid'], 'Solute particles fit in the gaps between solvent particles.'),
  m(1, 'evenly', 'A drop of food colouring is added to still water. After a while the colour is the same throughout. Why?', 'the moving particles spread out evenly (diffusion)', ['the water was stirred', 'food colouring is a gas', 'the colour particles grew'], 'Particles keep moving and spread from where they are crowded to where there are fewer.'),
  m(2, 'volume', '50 mL of water and 50 mL of ethanol are mixed. The total volume is a little less than 100 mL. How does the particle model explain this?', 'smaller particles fit into the gaps between larger ones', ['some liquid was destroyed', 'the particles shrank', 'the measuring cylinder was wrong'], 'When the particles mix, some fit into the spaces between others, so the total volume is slightly less.'),
  m(2, 'attraction', 'Why does sugar dissolve in water?', 'water particles attract the sugar particles strongly enough to pull them apart and surround them', ['sugar melts in water', 'sugar is a liquid', 'water pushes the sugar away'], 'Dissolving happens when the attraction between solute and solvent particles is strong enough to separate the solute particles.'),
  m(2, 'insoluble', 'Why doesn’t sand dissolve in water?', 'the particles in sand attract each other more strongly than water can pull them apart', ['sand particles are too big to see', 'sand floats', 'sand is already a solution'], 'If the solute’s particles hold together more strongly than the solvent can pull them apart, it is insoluble.'),
  m(2, 'hotFaster', 'Using the particle model, why does a solute dissolve faster in hot water?', 'hot solvent particles move faster and hit the solute more often and harder', ['hot water has bigger gaps', 'hot water has more particles', 'heat melts the solute'], 'Faster-moving solvent particles break the solute apart more quickly.'),
  mk(2, () => {
    const kinds = shuffle(['solid', 'gas', 'mixElements', 'liquid'] as Box[])
    const ans = LETTERS[kinds.indexOf('mixElements')]
    return { t: 'diagram', q: 'Which box could represent two different substances mixed evenly together, like a solution?', d: fourBoxes(kinds), a: ans, w: LETTERS.filter((l) => l !== ans), fixed: LETTERS, why: `Box ${ans} has two kinds of particle mixed evenly together.`, meta: { kinds } }
  }),
  m(3, 'mass', 'A student finds that 200 g of water plus 20 g of sugar makes 220 g of solution. What does this show about dissolving?', 'no particles are lost or gained: mass is conserved', ['sugar has no mass once dissolved', 'water gains extra mass from the air', 'the balance is broken'], 'All the particles are still there, so the total mass stays the same.'),
  m(3, 'saturatedParticles', 'In a saturated solution, why does extra solute stay undissolved?', 'the solvent particles cannot hold any more solute particles at that temperature', ['the solute particles stop moving', 'the solvent turns solid', 'the solute becomes insoluble forever'], 'At saturation, as many particles dissolve as come out of solution; no more can stay dissolved.'),
  m(3, 'model', 'A teacher models dissolving with marbles (sugar) poured into a jar of rice (water). What is one limitation of this model?', 'the real particles are always moving, but the marbles and rice are still', ['marbles are too colourful', 'rice is not a solid', 'there is no limitation'], 'Every model has limits; this one doesn’t show the constant motion of particles.'),
  m(1, 'cupTea', 'A spoonful of sugar dissolves in tea. Which is true?', 'the sugar particles are spread out between the water particles', ['the sugar is destroyed', 'the sugar turns into tea', 'the sugar sinks to the bottom'], 'The sugar is still there, spread through the tea.'),
  m(1, 'see', 'Why can’t you see salt once it has dissolved?', 'its particles are spread out and far too small to see', ['it has evaporated', 'it has turned into water', 'it has floated away'], 'Individual particles are far too small to see.'),
  m(1, 'evap', 'How can you get dissolved salt back from salt water?', 'evaporate the water', ['filter it', 'stir it', 'add more water'], 'The water evaporates and the salt is left behind.'),
  m(1, 'mixEvenly', 'After dissolving, are the solute particles spread evenly or in clumps?', 'evenly through the solution', ['in clumps at the bottom', 'only at the top', 'only in the middle'], 'Moving particles spread out evenly, so every part of a solution is the same.'),
  m(2, 'stirParticles', 'Using the particle model, why does stirring help sugar dissolve faster?', 'it moves fresh solvent particles next to the sugar', ['it makes the sugar particles smaller', 'it heats the sugar a lot', 'it creates new water particles'], 'Stirring brings more solvent particles into contact with the solute.'),
  m(2, 'surface', 'Using the particle model, why does powdered sugar dissolve faster than a sugar cube?', 'more sugar particles are exposed to the water at once', ['powdered sugar is a different substance', 'cubes contain no sugar particles', 'powder is hotter'], 'Breaking it up exposes more particles at the surface.'),
  m(2, 'stillThere', 'How could you show that dissolved copper sulfate is still in a solution?', 'the solution stays blue, and blue crystals are left if the water evaporates', ['the solution becomes colourless', 'the copper sulfate sinks', 'it cannot be shown'], 'The colour and the solid left after evaporation show the solute is still there.'),
  m(3, 'gasDissolve', 'Fish breathe oxygen dissolved in water. Using the particle model, what happens to oxygen when it dissolves?', 'oxygen particles spread out between the water particles', ['oxygen turns into water', 'oxygen becomes a solid', 'oxygen particles join the water particles to make a new substance'], 'Gas particles dissolve the same way: they spread between the solvent particles.'),
  m(3, 'warmFish', 'Fish can struggle in warm water in summer. Why?', 'less oxygen can dissolve in warmer water', ['warm water has more oxygen', 'fish cannot swim in warm water', 'warm water is denser'], 'Gases are less soluble in warmer water.'),
  m(3, 'whyMass', 'Why does a solution weigh the same as the solute plus solvent, even though its volume may be slightly less?', 'no particles are lost; they just fit closer together', ['some particles are destroyed', 'mass and volume are always equal', 'the solute has no mass'], 'Mass depends on the number of particles; volume depends on how they pack.'),
]

// ================================================================== Lesson 11 Concentrated, dilute, saturated and supersaturated

const concWordEntries: Entry[] = [
  m(1, 'dilute', 'What is a dilute solution?', 'one with a small amount of solute in the solvent', ['one with a large amount of solute', 'one with no solvent', 'one that is hot'], 'Dilute means a small amount of solute for the amount of solvent.'),
  m(1, 'concentrated', 'What is a concentrated solution?', 'one with a large amount of solute in the solvent', ['one with very little solute', 'one that is very cold', 'one with no solute'], 'Concentrated means a lot of solute for the amount of solvent.'),
  m(1, 'saturated', 'What is a saturated solution?', 'one that cannot dissolve any more solute at that temperature', ['one that is very wet', 'one with no solute', 'one that has just been stirred'], 'A saturated solution holds the maximum amount of solute at that temperature.'),
  m(1, 'dilute2', 'How can you make a cordial drink more dilute?', 'add more water', ['add more cordial', 'heat it', 'let some water evaporate'], 'Adding solvent spreads the same solute through more liquid, making it more dilute.'),
  m(1, 'colour', 'Two cups of cordial: one is pale and one is dark. Which is more concentrated?', 'the dark one', ['the pale one', 'they are the same', 'it is impossible to tell'], 'More solute in the same volume gives a stronger colour.'),
  m(2, 'concentrate', 'How can you make a salt solution more concentrated?', 'dissolve more salt in it or evaporate some of the water', ['add more water', 'pour half of it away', 'put it in a bigger beaker'], 'More solute, or less solvent, increases the concentration.'),
  m(2, 'testSat', 'How can you test whether a solution is saturated?', 'add a little more solute: if it won’t dissolve, the solution is saturated', ['taste it', 'look at the colour', 'measure its temperature'], 'A saturated solution can’t dissolve any more solute at that temperature.'),
  m(2, 'super', 'What is a supersaturated solution?', 'a solution holding more dissolved solute than it normally could at that temperature', ['a saturated solution that has been diluted', 'a very cold solvent', 'any concentrated solution'], 'Supersaturated solutions are usually made by cooling a hot saturated solution carefully; they are unstable.'),
  m(2, 'superCrystal', 'A seed crystal dropped into a supersaturated solution makes crystals quickly grow. Why?', 'the extra dissolved solute comes out of solution onto the crystal', ['the crystal melts', 'the solution boils', 'the crystal dissolves'], 'A supersaturated solution is unstable; a seed crystal triggers the extra solute to crystallise.'),
  mk(2, () => {
    const order = shuffle(['dilute', 'concentrated', 'saturated', 'supersaturated'])
    return { t: 'order', q: 'Which list goes from the least solute dissolved to the most (for the same water at the same temperature)?', a: 'dilute, concentrated, saturated, supersaturated', w: ['supersaturated, saturated, concentrated, dilute', 'concentrated, dilute, saturated, supersaturated', order.join(', ') === 'dilute, concentrated, saturated, supersaturated' ? 'dilute, saturated, concentrated, supersaturated' : order.join(', '), 'saturated, dilute, supersaturated, concentrated'], why: 'Dilute has little solute, concentrated more, saturated the most it normally can, and supersaturated even more than that.' }
  }),
  m(3, 'safe', 'Why are concentrated acids diluted before being used in school science labs?', 'dilute solutions are less hazardous', ['dilute acids react faster', 'concentrated acids are not acids', 'water makes acids stronger'], 'Diluting reduces how much harmful substance is in each mL, making it safer to use.'),
  m(3, 'dilution', 'A teacher makes a series of dilutions of a dark food colouring. Each time she takes 10 mL and adds 90 mL of water. What happens to the colour each time?', 'it gets paler, because the concentration drops to one-tenth', ['it gets darker', 'it stays the same', 'it changes to a different colour'], 'Each step has one-tenth the concentration of the one before, so the colour fades.'),
  m(3, 'concentratedVsSat', 'Can a dilute solution also be saturated?', 'yes, if the solute is only slightly soluble, a saturated solution can still be dilute', ['no, saturated always means concentrated', 'only if it is boiling', 'only for gases'], 'Concentrated/dilute describe how much solute; saturated means no more can dissolve. Chalk-like substances saturate at tiny concentrations.'),
  m(1, 'strongTea', 'Strong black tea is a more ___ solution than weak tea.', 'concentrated', ['dilute', 'insoluble', 'pure'], 'More solute in the same volume means more concentrated.'),
  m(1, 'weakCordial', 'Cordial with lots of water and only a little syrup is…', 'dilute', ['concentrated', 'saturated', 'supersaturated'], 'A small amount of solute: dilute.'),
  m(1, 'leftover', 'Sugar keeps settling at the bottom of a glass of water however long you stir. The solution is…', 'saturated', ['dilute', 'pure', 'evaporated'], 'No more sugar can dissolve at that temperature, so the solution is saturated.'),
  m(3, 'heatSat', 'A saturated sugar solution with undissolved sugar at the bottom is heated. What happens to the extra sugar?', 'more of it dissolves, because sugar is more soluble when hot', ['nothing', 'it turns to gas', 'more sugar comes out of solution'], 'Higher temperature raises the solubility of most solids.'),
  m(3, 'honey', 'Honey is a concentrated, nearly saturated sugar solution. Old honey sometimes forms sugar crystals. Why?', 'some dissolved sugar slowly comes out of solution as crystals', ['bacteria make crystals', 'the water freezes', 'honey is a pure substance'], 'A very concentrated solution can slowly crystallise, especially when cool.'),
  m(3, 'compareColour', 'How could you compare the concentrations of two blue copper sulfate solutions without tasting or measuring mass?', 'compare the intensity of their colour against each other (or a set of known dilutions)', ['compare their temperatures', 'compare how much they weigh', 'compare their smells'], 'Deeper colour means a higher concentration of the coloured solute.'),
  m(3, 'saturatedCooled', 'A hot saturated solution is cooled carefully with no crystals forming. It now holds more solute than normal at the lower temperature. It is…', 'supersaturated', ['dilute', 'unsaturated', 'pure'], 'Holding more solute than the solubility allows makes it supersaturated (and unstable).'),
]

// ================================================================== Lesson 12 Calculating concentration

const concCalcEntries: Entry[] = [
  m(1, 'unit', 'What does the unit g/L mean for a concentration?', 'grams of solute in each litre of solution', ['grams of solution per litre of solute', 'litres of solute per gram', 'grams of water in a litre'], 'g/L tells you how many grams of solute are dissolved in each litre of solution.'),
  m(1, 'mLL', 'How many millilitres are in 1 litre?', '1000 mL', ['100 mL', '10 mL', '10 000 mL'], '1 L = 1000 mL.'),
  mk(1, () => {
    const L = pick([1, 2, 4, 5])
    const c = pick([5, 10, 20, 25, 50])
    return { t: 'gL', calc: true, q: `${b(`${c * L} g`)} of salt is dissolved to make ${b(`${L} L`)} of solution. What is the concentration in g/L?`, n: c, unit: 'g/L', why: [`concentration = mass ÷ volume = ${c * L} ÷ ${L} = ${c} g/L`], meta: { g: c * L, L } }
  }),
  mk(2, () => {
    const mL = pick([200, 250, 500])
    const c = pick([4, 8, 10, 20, 40])
    const g = (c * mL) / 1000
    return { t: 'gLmL', calc: true, q: `${b(`${nf(g)} g`)} of sugar is dissolved to make ${b(`${mL} mL`)} of solution. What is the concentration in g/L?`, n: c, unit: 'g/L', why: [`${mL} mL = ${nf(mL / 1000)} L`, `concentration = ${nf(g)} ÷ ${nf(mL / 1000)} = ${c} g/L`], meta: { g, mL } }
  }),
  mk(2, () => {
    const c = pick([5, 10, 20, 30])
    const L = pick([2, 3, 0.5])
    return { t: 'gNeeded', calc: true, q: `How many grams of salt are needed to make ${b(`${nf(L)} L`)} of a ${b(`${c} g/L`)} salt solution?`, n: c * L, unit: 'g', why: [`mass = concentration × volume = ${c} × ${nf(L)} = ${nf(c * L)} g`], meta: { c, L } }
  }),
  mk(2, () => {
    const total = pick([100, 200, 250, 500])
    const pct = pick([5, 10, 20, 40])
    return { t: 'vv', calc: true, q: `A cordial drink is made with ${b(`${(pct * total) / 100} mL`)} of syrup in ${b(`${total} mL`)} of drink. What is its concentration as a percentage by volume (% v/v)?`, n: pct, unit: '% v/v', why: [`% v/v = volume of solute ÷ volume of solution × 100 = ${(pct * total) / 100} ÷ ${total} × 100 = ${pct}%`], meta: { v: (pct * total) / 100, total } }
  }),
  mk(3, () => {
    const total = pick([200, 250, 500, 1000])
    const pct = pick([2, 4, 12, 15])
    return { t: 'vvNeeded', calc: true, q: `How many millilitres of pure juice are needed to make ${b(`${total} mL`)} of a ${b(`${pct}% v/v`)} juice drink?`, n: (pct * total) / 100, unit: 'mL', why: [`${pct}% of ${total} mL = ${pct} ÷ 100 × ${total} = ${nf((pct * total) / 100)} mL`], meta: { pct, total } }
  }),
  mk(3, () => {
    const c1 = pick([40, 60, 80, 100])
    const k = pick([2, 4, 5])
    return { t: 'diluteCalc', calc: true, q: `100 mL of a ${b(`${c1} g/L`)} sugar solution is diluted with water to a total of ${b(`${100 * k} mL`)}. What is the new concentration?`, n: c1 / k, dp: 1, unit: 'g/L', why: [`The same sugar is spread through ${k} times the volume`, `${c1} ÷ ${k} = ${nf(c1 / k, 1)} g/L`], meta: { c1, k } }
  }),
  m(3, 'compare', 'Solution A has 30 g of salt in 1 L. Solution B has 20 g of salt in 500 mL. Which is more concentrated?', 'B (40 g/L compared with 30 g/L)', ['A, because it has more salt', 'they are the same', 'it cannot be worked out'], 'B: 20 g ÷ 0.5 L = 40 g/L, which is more than A’s 30 g/L.'),
  m(1, 'percent', 'A label says “12% v/v alcohol”. What does this mean?', '12 mL of alcohol in every 100 mL of the drink', ['12 g of alcohol in every litre', '12 mL of drink in every 100 mL of alcohol', 'the drink is 12 years old'], '% v/v is the volume of solute in 100 mL of solution.'),
  m(2, 'twice', 'If you dissolve twice as much solute in the same volume of solution, what happens to the concentration?', 'it doubles', ['it halves', 'it stays the same', 'it becomes zero'], 'Concentration = mass ÷ volume, so doubling the mass doubles the concentration.'),
]

// ================================================================== Lesson 13 Elements, compounds and mixtures

const KIND_TEXT: Record<string, string> = {
  element: 'an element (one kind of atom)',
  elementMolecules: 'an element made of molecules (one kind of atom, joined in pairs)',
  compound: 'a compound (two kinds of atom chemically joined)',
  mixElements: 'a mixture of two elements',
  mixElementCompound: 'a mixture of an element and a compound',
  mixCompounds: 'a mixture of two compounds',
}
const PURE = ['pure water', 'oxygen gas', 'table salt (sodium chloride)', 'copper wire', 'carbon dioxide gas', 'distilled water', 'gold']
const MIXTURES = ['sea water', 'air', 'soil', 'milk', 'orange juice', 'concrete', 'a fruit salad', 'muddy water', 'soft drink']
const ELEMENTS_EX = ['oxygen', 'gold', 'carbon', 'iron', 'helium', 'copper', 'nitrogen', 'aluminium']
const COMPOUNDS_EX = ['water (H₂O)', 'carbon dioxide (CO₂)', 'table salt (sodium chloride)', 'methane (CH₄)', 'sugar (sucrose)', 'rust (iron oxide)']
const HOMO = ['salt water', 'air', 'clear apple juice', 'brass (an alloy)', 'vinegar']
const HETERO = ['sand and water', 'a fruit salad', 'soil', 'oil and vinegar salad dressing', 'muesli', 'granite rock']
const classifyEntries: Entry[] = [
  mk(1, () => {
    const pure = int(0, 1) === 1
    return { t: 'pure', q: `Which of these is a ${b(pure ? 'pure substance' : 'mixture')}?`, a: pure ? pick(PURE) : pick(MIXTURES), w: pure ? sample(MIXTURES, 3) : sample(PURE, 3), why: pure ? 'A pure substance contains only one kind of particle.' : 'A mixture contains two or more substances that are not chemically joined.' }
  }),
  mk(1, () => {
    const isEl = int(0, 1) === 1
    return { t: 'elComp', q: `Which of these is ${b(isEl ? 'an element' : 'a compound')}?`, a: isEl ? pick(ELEMENTS_EX) : pick(COMPOUNDS_EX), w: isEl ? sample(COMPOUNDS_EX, 3) : sample(ELEMENTS_EX, 3), why: isEl ? 'An element is made of only one kind of atom.' : 'A compound is two or more kinds of atom chemically joined.' }
  }),
  m(1, 'element', 'What is an element?', 'a substance made of only one kind of atom', ['a substance made of two kinds of atom joined together', 'any mixture', 'anything found in nature'], 'An element contains only one kind of atom and can’t be broken down into simpler substances.'),
  m(1, 'compound', 'What is a compound?', 'a substance made of two or more different kinds of atom chemically joined', ['two substances mixed but not joined', 'a substance with one kind of atom', 'any liquid'], 'In a compound, different atoms are chemically bonded in a fixed ratio.'),
  m(1, 'atom', 'What is an atom?', 'the smallest particle of an element', ['a kind of mixture', 'a cell', 'a type of solution'], 'Atoms are the tiny building blocks of all elements.'),
  mk(2, () => {
    // one element, one compound and two different mixtures, so only one box fits each description
    const kinds = shuffle([pick(['element', 'elementMolecules'] as Box[]), 'compound' as Box, ...sample(['mixElements', 'mixElementCompound', 'mixCompounds'] as Box[], 2)])
    const target = pick(kinds)
    const ans = LETTERS[kinds.indexOf(target)]
    return { t: 'boxes', q: `Which box shows ${b(KIND_TEXT[target])}? (Each colour is a different kind of atom.)`, d: fourBoxes(kinds), a: ans, w: LETTERS.filter((l) => l !== ans), fixed: LETTERS, why: `Box ${ans} shows ${KIND_TEXT[target]}.`, meta: { kinds, target } }
  }),
  mk(2, () => {
    const k = pick(['element', 'compound', 'mixElements', 'mixElementCompound'] as Box[])
    const name = { element: 'an element', compound: 'a compound', mixElements: 'a mixture', mixElementCompound: 'a mixture' }[k as 'element']
    return { t: 'oneBox', q: 'This box shows particles of a substance. Is it an element, a compound or a mixture? (Each colour is a different kind of atom.)', d: particleBox(k, 'A box of particles'), a: name, w: ['an element', 'a compound', 'a mixture', 'a solution of two compounds'].filter((x) => x !== name), why: `It shows ${KIND_TEXT[k]}.`, meta: { k } }
  }),
  mk(2, () => {
    const homo = int(0, 1) === 1
    return { t: 'homo', q: `Which mixture is ${b(homo ? 'homogeneous (the same all the way through)' : 'heterogeneous (you can see different parts)')}?`, a: homo ? pick(HOMO) : pick(HETERO), w: homo ? sample(HETERO, 3) : sample(HOMO, 3), why: homo ? 'Homogeneous mixtures, such as solutions, look the same throughout.' : 'Heterogeneous mixtures have parts you can see or that separate.' }
  }),
  m(2, 'iron', 'Iron filings and sulfur powder are mixed. A magnet pulls the iron out. If they are heated, they form iron sulfide, which is not attracted by a magnet. Why?', 'heating made a compound with new properties; the mixture kept the properties of iron and sulfur', ['magnets stop working when hot', 'the iron melted away', 'sulfur is magnetic'], 'In a mixture each substance keeps its properties; a compound is a new substance with different properties.'),
  m(2, 'separate', 'Which can be separated by physical methods such as filtering or evaporating?', 'mixtures', ['compounds', 'elements', 'atoms'], 'Mixtures are separated physically; compounds need chemical reactions to break them down.'),
  m(3, 'ratio', 'Water is always H₂O, but salt water can contain different amounts of salt. What does this show?', 'compounds have a fixed ratio of atoms; mixtures can have any proportions', ['water is a mixture', 'salt water is a compound', 'both are elements'], 'A compound’s composition is fixed; a mixture’s is not.'),
  m(3, 'airMix', 'Air contains oxygen (O₂), nitrogen (N₂) and carbon dioxide (CO₂). Which is the best description of air?', 'a mixture of elements and a compound', ['a pure compound', 'a single element', 'a mixture of compounds only'], 'O₂ and N₂ are elements (one kind of atom); CO₂ is a compound; together they form a mixture.'),
  m(3, 'pureMilk', 'An advertisement says “pure milk”. Is milk a pure substance in science?', 'no: milk is a mixture of water, fats, proteins, sugars and more', ['yes: it comes straight from a cow', 'yes: it is white all through', 'no: milk is an element'], '“Pure” in science means one substance only; milk contains many.'),
  m(3, 'electrolysis', 'Passing electricity through water produces hydrogen gas and oxygen gas. What does this tell you about water?', 'water is a compound of hydrogen and oxygen', ['water is an element', 'water is a mixture of two gases', 'water contains no atoms'], 'A compound can be broken down into its elements by a chemical change.'),
  m(3, 'separateCompound', 'Why can’t salt (sodium chloride) be separated into sodium and chlorine by filtering or evaporating?', 'it is a compound: its atoms are chemically joined', ['salt is an element', 'salt is insoluble', 'filtering only works on gases'], 'Physical methods separate mixtures; compounds need chemical reactions.'),
  m(3, 'steelMix', 'Steel is iron with a little carbon. Why is steel classed as a mixture (an alloy)?', 'the carbon is spread through the iron without a fixed ratio', ['it is a pure element', 'it is a compound with a fixed formula', 'it contains water'], 'The amount of carbon varies between steels; there is no fixed formula.'),
  m(3, 'boilingPure', 'Pure water boils at exactly 100 °C, but sea water boils at a slightly higher temperature. How does this help scientists?', 'a pure substance has a fixed boiling point, so a different value suggests a mixture', ['it shows sea water is an element', 'it shows thermometers are wrong', 'it does not help'], 'Fixed melting and boiling points are a test for purity.'),
  m(3, 'oneParticle', 'A sample contains only molecules each made of one carbon atom and two oxygen atoms. How should it be classified?', 'a pure substance: a compound', ['a mixture of carbon and oxygen', 'an element', 'a solution'], 'All the particles are the same (CO₂), so it is pure; different atoms are joined, so it is a compound.'),
]

// ================================================================== Lesson 14 Separating by particle size and density

const TECH14: [string, string][] = [
  ['sand from water', 'filtration'],
  ['tea leaves from tea', 'filtration'],
  ['gravel from sand', 'sieving'],
  ['lumps from flour', 'sieving'],
  ['water from settled mud (pouring the water off)', 'decantation'],
  ['red blood cells from blood plasma', 'centrifugation'],
  ['cream from milk quickly', 'centrifugation'],
  ['iron filings from sand', 'using a magnet'],
  ['oil from water (letting it settle and pouring off the top layer)', 'decantation'],
]
const sizeEntries: Entry[] = [
  mk(1, () => {
    const [mix, tech] = pick(TECH14)
    return { t: 'choose', q: `Which technique separates ${b(mix)}?`, a: tech, w: ['filtration', 'sieving', 'decantation', 'centrifugation', 'using a magnet', 'evaporation'].filter((x) => x !== tech), why: `${mix[0].toUpperCase() + mix.slice(1)}: ${tech}.` }
  }),
  m(1, 'filtrate', 'In filtration, what is the liquid that passes through the filter paper called?', 'the filtrate', ['the residue', 'the solute', 'the sediment'], 'The liquid that passes through is the filtrate; the solid left on the paper is the residue.'),
  m(1, 'residue', 'In filtration, what is the solid left on the filter paper called?', 'the residue', ['the filtrate', 'the solvent', 'the solution'], 'The residue is the insoluble solid trapped by the filter paper.'),
  m(1, 'property', 'Filtration and sieving separate substances by which property?', 'particle size', ['colour', 'boiling point', 'magnetism'], 'Small particles pass through the holes; larger particles are trapped.'),
  m(2, 'saltFilter', 'Can filtering separate salt from salt water?', 'no: dissolved salt particles are small enough to pass through filter paper', ['yes: the salt stays on the paper', 'yes, if the paper is thick', 'only if the water is cold'], 'Filtration only removes insoluble solids. Dissolved salt needs evaporation.'),
  m(2, 'centrifuge', 'How does a centrifuge separate a mixture?', 'it spins the mixture very fast so denser parts move to the bottom of the tube', ['it heats the mixture', 'it uses a magnet', 'it filters the mixture through paper'], 'Spinning makes denser particles settle much faster than gravity alone.'),
  m(2, 'decant', 'Why does decantation work for muddy water?', 'the denser mud settles to the bottom, so the water can be poured off', ['mud floats on water', 'mud dissolves', 'water is denser than mud'], 'Decantation uses differences in density: let it settle, then pour off the top layer.'),
  m(2, 'funnel', 'Which equipment is needed for filtration?', 'a filter funnel, filter paper and a beaker or flask', ['a Bunsen burner and evaporating basin', 'a condenser and thermometer', 'a magnet and a sieve'], 'The mixture is poured through filter paper in a funnel, collecting the filtrate below.'),
  m(2, 'washMagnet', 'Why does a magnet separate iron filings from sand?', 'iron is magnetic but sand is not', ['sand is magnetic but iron is not', 'iron is denser', 'iron dissolves'], 'Magnetic separation uses the magnetic property of iron, nickel and cobalt.'),
  m(3, 'order', 'A mixture contains sand, salt and iron filings. Which order of steps separates all three?', 'magnet to remove iron; add water and filter to remove sand; evaporate the filtrate to get salt', ['evaporate; filter; magnet', 'filter first, then use the magnet on the salt water', 'add water and evaporate only'], 'Remove the magnetic iron, dissolve the salt so the sand can be filtered off, then evaporate the water.'),
  m(3, 'blood', 'Blood tests often use a centrifuge. Why not just let the blood stand?', 'the cells would take a very long time to settle; spinning separates them in minutes', ['blood cannot settle', 'blood is a solution', 'centrifuges make new cells'], 'Centrifuging speeds up the settling of the denser blood cells.'),
  m(3, 'clogged', 'Filtering very muddy water is slow because the paper clogs. What would help?', 'let the mud settle and decant the water first, then filter it', ['use hotter water', 'filter it twice through the same paper', 'stir it harder'], 'Decanting first removes most of the solid so the filter paper doesn’t clog.'),
  m(2, 'gold', 'Gold panners swirl gravel and water in a pan. Why does gold stay in the pan while lighter gravel washes out?', 'gold is much denser, so it sinks to the bottom', ['gold is magnetic', 'gold dissolves', 'gold floats'], 'Panning separates by density.'),
  m(2, 'coffee', 'A coffee filter lets coffee through but keeps the grounds. Which technique is this?', 'filtration', ['distillation', 'sieving of a gas', 'evaporation'], 'The paper filter traps the insoluble grounds.'),
  m(2, 'flour', 'Why do bakers sieve flour?', 'to remove lumps and larger particles', ['to dissolve it', 'to make it heavier', 'to remove the colour'], 'Sieving separates by particle size.'),
  m(3, 'filterPaperSize', 'Why does a filter paper hold back sand but not water or dissolved salt?', 'its holes are bigger than water and salt particles but smaller than sand grains', ['sand is magnetic', 'water and salt are gases', 'sand dissolves the paper'], 'Filtration separates by particle size.'),
  m(3, 'oilSpill', 'After an oil spill on the sea, why can oil be skimmed off the surface?', 'oil is less dense than water and insoluble, so it floats as a layer', ['oil sinks', 'oil dissolves in sea water', 'oil is magnetic'], 'Differences in density and solubility let the oil be separated from the top.'),
  m(3, 'centrifugeBalance', 'Why must tubes in a centrifuge be balanced (opposite tubes with equal amounts)?', 'an unbalanced rotor vibrates dangerously at high speed', ['so the mixture dissolves', 'to make it quieter only', 'it does not matter'], 'Safety: unbalanced loads can damage the machine or cause injury.'),
  m(3, 'muddyChoose', 'Which is the quickest way to get most of the clear water off a beaker of muddy water that has settled overnight?', 'decanting', ['distilling', 'chromatography', 'crystallising'], 'Pour off the clear water, leaving the settled mud.'),
  m(3, 'beachSand', 'A mixture contains pebbles, sand and salt. Which order separates the pebbles first?', 'sieve out the pebbles, add water and filter out the sand, evaporate to get the salt', ['evaporate, sieve, filter', 'filter, distil, sieve', 'magnet, sieve, chromatography'], 'Sieving removes the largest particles first; then filter and evaporate.'),
]

// ================================================================== Lesson 15 Evaporation, crystallisation, distillation and chromatography

const TECH15: [string, string][] = [
  ['salt from sea water', 'evaporation'],
  ['large copper sulfate crystals from a solution', 'crystallisation'],
  ['pure water from sea water', 'distillation'],
  ['the coloured dyes in black ink', 'chromatography'],
  ['drinkable water from salty water on a ship', 'distillation'],
  ['the colours in a food dye', 'chromatography'],
  ['sugar crystals from a sugar solution', 'crystallisation'],
]
const heatEntries: Entry[] = [
  mk(1, () => {
    const [mix, tech] = pick(TECH15)
    return { t: 'choose', q: `Which technique is best for getting ${b(mix)}?`, a: tech, w: ['evaporation', 'crystallisation', 'distillation', 'chromatography', 'filtration'].filter((x) => x !== tech), why: `${mix[0].toUpperCase() + mix.slice(1)}: ${tech}.` }
  }),
  m(1, 'evap', 'In evaporation, what is collected?', 'the dissolved solid that is left behind', ['the pure solvent', 'the insoluble solid', 'the gas'], 'Evaporation removes the solvent as a gas, leaving the dissolved solid behind.'),
  m(1, 'distil', 'In distillation, what is collected?', 'the solvent, which is boiled and then condensed', ['only the solid left in the flask', 'the filter paper', 'the steam that escapes into the room'], 'Distillation boils the liquid and condenses the vapour back into a pure liquid (the distillate).'),
  m(1, 'condenser', 'What does the condenser do in distillation?', 'cools the vapour so it turns back into a liquid', ['heats the mixture', 'filters out solids', 'stirs the solution'], 'Cold water flowing around the condenser cools the vapour so it condenses.'),
  m(1, 'chromProperty', 'In paper chromatography, why do different dyes travel different distances up the paper?', 'they dissolve in the solvent and stick to the paper by different amounts', ['they have different temperatures', 'some are magnetic', 'heavier dyes always travel further'], 'More soluble dyes that stick less to the paper are carried further by the solvent.'),
  m(2, 'volatility', 'Distillation separates liquids by which property?', 'their boiling points (volatility)', ['their particle size', 'their colour', 'their magnetism'], 'The liquid with the lower boiling point evaporates first and is collected.'),
  m(2, 'crystalsBig', 'How can you grow large crystals from a solution?', 'let the solvent evaporate slowly', ['boil the solution dry quickly', 'filter the solution', 'add more solvent'], 'Slow evaporation (crystallisation) gives the particles time to arrange into large crystals.'),
  m(2, 'line', 'In paper chromatography, why is the starting line drawn in pencil, not pen?', 'pencil does not dissolve in the solvent, so it won’t run up the paper', ['pencil is easier to see', 'pen is too dark', 'pencil makes the dyes move faster'], 'Ink from a pen would separate too and spoil the result.'),
  m(2, 'below', 'Why must the solvent level start below the ink spot in chromatography?', 'otherwise the ink dissolves into the solvent in the beaker instead of travelling up the paper', ['so the paper does not get wet', 'to keep the beaker cool', 'it doesn’t matter'], 'The solvent must soak up through the paper and carry the dyes with it.'),
  m(2, 'whichDistillate', 'Sea water is distilled. What is left in the flask, and what is the distillate?', 'salt is left in the flask; the distillate is pure water', ['water is left; the distillate is salt', 'both stay in the flask', 'both are collected as distillate'], 'Water boils and condenses as the distillate; salt has a very high boiling point and stays behind.'),
  mk(3, () => {
    const n = int(2, 4)
    const spots = Array.from({ length: n }, (_, i) => i)
    return { t: 'chromCount', q: `A black ink is tested with paper chromatography and separates into ${b(`${n} spots`)} of different colours. What can you conclude?`, a: `the ink is a mixture of at least ${n} dyes`, w: ['the ink is a pure substance', `the ink is made of ${n + 1} elements`, 'the ink has dissolved the paper'], why: `${n} separate spots means at least ${n} different dyes.`, meta: { n, spots } }
  }),
  m(3, 'match', 'A suspect’s pen gives spots at the same heights as the ink on a forged note; another pen does not. What can be concluded?', 'the note was probably written with the suspect’s pen ink (or the same kind)', ['the suspect definitely wrote the note', 'the other pen wrote the note', 'chromatography cannot compare inks'], 'Matching chromatograms show the same mixture of dyes, which is evidence but not proof.'),
  m(3, 'pureCheck', 'How can chromatography show whether a food dye is pure?', 'a pure dye gives only one spot', ['a pure dye gives no spots', 'a pure dye gives many spots', 'a pure dye turns the paper white'], 'A single substance produces one spot; a mixture produces several.'),
  m(3, 'ethanol', 'Ethanol boils at 78 °C and water at 100 °C. A mixture is heated in a distillation set-up to 80 °C. What collects first?', 'mostly ethanol, because it has the lower boiling point', ['mostly water', 'nothing until 100 °C', 'a solid'], 'The more volatile liquid (lower boiling point) evaporates and condenses first.'),
  m(2, 'basin', 'Which piece of equipment is used to evaporate a solution on a Bunsen burner?', 'an evaporating basin', ['a filter funnel', 'a measuring cylinder', 'a condenser'], 'A shallow evaporating basin gives a large surface for the solvent to evaporate.'),
  m(2, 'saltPan', 'Sea salt is made in shallow ponds by the sea. Which technique do the salt pans use?', 'evaporation, using the Sun’s energy', ['distillation', 'filtration', 'chromatography'], 'The Sun evaporates the water and salt is left behind.'),
  m(2, 'waterIn', 'In a Liebig condenser, cold water flows in at the bottom and out at the top. Why?', 'it keeps the condenser full of cold water so it cools the vapour well', ['it makes the water boil', 'it filters the vapour', 'it is the only way the tubes fit'], 'Filling from the bottom avoids air pockets, so the whole condenser stays cold.'),
  m(3, 'boilDry', 'Why are crystals often grown by slow evaporation rather than by boiling the solution dry?', 'boiling dry gives tiny crystals and can spit and decompose the solid', ['boiling makes the solid vanish', 'slow evaporation is faster', 'crystals only form in the dark'], 'Slow evaporation gives larger, purer crystals and is safer.'),
  m(3, 'spotsHeight', 'In a chromatogram, dye X travels further up the paper than dye Y. What does this tell you?', 'X is more soluble in the solvent or less attracted to the paper than Y', ['X is heavier than Y', 'Y is more soluble', 'X is a pure element'], 'Dyes that dissolve better and stick less to the paper are carried further.'),
]

// ================================================================== Lesson 16 Separation in industry and on Country

const contextEntries: Entry[] = [
  m(1, 'winnowing', 'Winnowing is used by Aboriginal Peoples to separate seeds from husks. How does it work?', 'the mixture is tossed in the air (or a coolamon is shaken) so the wind or movement carries away the lighter husks', ['the seeds are dissolved in water', 'the mixture is heated until the husks melt', 'a magnet pulls out the seeds'], 'Winnowing separates by mass and density: light husks are blown or shaken away from heavier seeds.'),
  m(1, 'yandying', 'Yandying uses a shallow wooden dish (a coolamon) with a rocking motion. What does it separate?', 'heavier seeds or grit from lighter material, using differences in mass and density', ['salt from water', 'dyes in ink', 'water from oil by boiling'], 'Rocking the dish makes heavier particles move differently from lighter ones, so they separate.'),
  m(1, 'waterSteps', 'Which step in a water treatment plant removes small solid particles by passing water through layers of sand and gravel?', 'filtration', ['distillation', 'chromatography', 'crystallisation'], 'Sand and gravel filters trap small particles left after settling.'),
  m(1, 'recycleMagnet', 'At a recycling centre, how are steel cans separated from aluminium cans?', 'with large magnets, because steel is magnetic', ['by boiling them', 'by dissolving them', 'by colour only'], 'Steel (mostly iron) is attracted by magnets; aluminium is not.'),
  m(1, 'sedimentation', 'In water treatment, chemicals are added to make small particles clump together and sink. What is this step called?', 'flocculation and sedimentation', ['distillation', 'crystallisation', 'chromatography'], 'Clumped particles (flocs) are heavy enough to settle out as sediment.'),
  m(2, 'chlorine', 'Why is chlorine added near the end of water treatment?', 'to kill harmful microorganisms', ['to remove salt', 'to make the water clear', 'to separate oil'], 'Disinfection with chlorine kills bacteria and other microbes; it is not a separation step.'),
  m(2, 'desal', 'The Sydney Desalination Plant makes drinking water from sea water by pushing it through very fine membranes. What property is used?', 'particle size: water particles pass through, but dissolved salt does not', ['magnetism', 'colour', 'boiling point'], 'Reverse osmosis uses membranes with tiny pores that let water through but hold back salt.'),
  m(2, 'eddy', 'Recycling plants use an “eddy current” separator to throw aluminium off a conveyor belt. Why are such machines needed?', 'aluminium is not magnetic, so ordinary magnets won’t separate it', ['aluminium is too heavy to lift', 'aluminium dissolves', 'aluminium is a gas'], 'Different techniques suit different properties; aluminium needs a special non-magnetic method.'),
  m(2, 'steamDist', 'Aboriginal Peoples have long used crushed tea tree and eucalyptus leaves as medicine. Which separation technique is used commercially today to extract the oils from these leaves?', 'steam distillation', ['sieving', 'magnetic separation', 'chromatography'], 'Steam carries the plant oils out; they are condensed and separated from the water.'),
  m(2, 'sieveFlour', 'Aboriginal Peoples traditionally ground seeds into flour on grinding stones. Which technique would separate fine flour from coarse pieces?', 'sieving', ['distillation', 'evaporation', 'centrifugation'], 'Sieving separates by particle size.'),
  m(3, 'design', 'A community needs to make muddy, salty river water drinkable. Which sequence would work?', 'let the mud settle and decant, filter out the fine particles, then distil (or use reverse osmosis) to remove the salt', ['filter only', 'evaporate the water and keep the salt', 'add chlorine only'], 'Each step removes a different part: settling and filtering for solids, distillation or membranes for dissolved salt.'),
  m(3, 'property', 'When choosing a separation technique, what should you consider first?', 'the property that differs between the substances (size, density, solubility, boiling point, magnetism)', ['the colour of the equipment', 'how expensive the beaker is', 'the time of day'], 'Every technique uses a difference in a physical property.'),
  m(3, 'respect', 'Why is it important to recognise Aboriginal and Torres Strait Islander separation techniques?', 'they are tested methods developed over tens of thousands of years that use the same science', ['they are only stories', 'they are not scientific', 'they no longer work'], 'Traditional techniques such as winnowing and yandying rely on the same physical properties studied in science.'),
  m(3, 'waste', 'Why do recycling plants first separate mixed waste into different materials?', 'each material can then be reprocessed by the method that suits its properties', ['mixtures are illegal', 'sorting makes the materials lighter', 'it changes the materials into elements'], 'Separating materials (paper, glass, metals, plastics) lets each be recycled efficiently.'),
  m(1, 'sieveCountry', 'Which simple technique, used for thousands of years, separates fine seeds from larger pieces using a mesh or woven tray?', 'sieving', ['distillation', 'chromatography', 'centrifugation'], 'Sieving separates by particle size.'),
  m(1, 'handpick', 'What is the simplest way to separate a few large stones from a pile of seeds?', 'hand-picking', ['distillation', 'evaporation', 'chromatography'], 'Large, visible pieces can simply be picked out.'),
  m(1, 'screening', 'What is the first step at a water treatment plant, where large objects like sticks are removed?', 'screening (passing the water through screens)', ['chlorination', 'distillation', 'evaporation'], 'Screens remove large rubbish by size, like a sieve.'),
  m(2, 'glassRecycle', 'At a recycling plant, broken glass is crushed and sorted by colour. Which property is used to sort it?', 'colour (using optical sensors)', ['magnetism', 'boiling point', 'solubility'], 'Optical sorters detect colour so clear, green and brown glass can be recycled separately.'),
  m(2, 'plasticFloat', 'Shredded plastics are put in water: some float and some sink. Which property separates them?', 'density', ['magnetism', 'colour', 'electrical conductivity'], 'Plastics less dense than water float; denser ones sink.'),
  m(2, 'coldPress', 'Olive oil can be extracted by cold pressing. What does this technique do?', 'squeezes the oil out of the crushed fruit without heating', ['boils the olives', 'dissolves the olives in water', 'uses a magnet'], 'Cold pressing is a physical way to separate oil from plant material.'),
  m(3, 'sedimentWhy', 'Why is sedimentation done before filtration at a water treatment plant?', 'removing most solids first stops the filters clogging quickly', ['filtration must always come last', 'sedimentation kills bacteria', 'filters work only on clean water'], 'Each step makes the next one work better.'),
  m(3, 'desalEnergy', 'Desalination plants use a lot of energy. Why might a coastal city still build one?', 'it provides a reliable water supply that doesn’t depend on rainfall', ['sea water is cheaper to drink', 'it makes water saltier', 'it needs no energy'], 'Societies weigh costs (energy) against benefits (reliable water).'),
]

const HINTS = {
  sol: 'The solute dissolves; the solvent does the dissolving; together they make a solution.',
  solubility: 'Solubility is the most that can dissolve. Read tables carefully at the right temperature.',
  particles: 'Use the particle model: particles are always moving and have spaces between them.',
  words: 'Dilute: little solute. Concentrated: lots. Saturated: no more can dissolve.',
  conc: 'g/L = grams ÷ litres (convert mL to L first). % v/v = volume of solute ÷ volume of solution × 100.',
  classify: 'One kind of atom: element. Different atoms joined: compound. Substances not joined: mixture.',
  size: 'Which property is different: particle size, density or magnetism?',
  heat: 'Evaporation keeps the solid; distillation keeps the liquid; chromatography separates dyes.',
  context: 'Every technique uses a difference in a physical property.',
}

export const MIXTURE_SKILLS: Skill[] = [
  {
    id: 'sci7-solutions',
    lessonNo: 8,
    title: 'Solutions',
    outcomes: [SOL],
    summary: 'Solute, solvent, solution, soluble and insoluble.',
    learn: {
      intro: `<p>When sugar is stirred into water it seems to disappear: it <b>dissolves</b>. The result is a <b>solution</b>.</p><ul><li>The <b>solute</b> is the substance that dissolves (sugar).</li><li>The <b>solvent</b> is the substance it dissolves in (water).</li><li>The <b>solution</b> is the mixture formed (sugar water).</li></ul><p>Substances that dissolve are <b>soluble</b>; those that don’t, such as sand or oil in water, are <b>insoluble</b>. Water dissolves so many substances it is called the universal solvent.</p>`,
      keyPoints: ['Solute + solvent → solution.', 'A solution is clear (see-through, though it can be coloured) and does not settle.', 'Mass is conserved: the solution’s mass equals the solute plus the solvent.', 'Whether something dissolves depends on the solvent too.'],
      vocab: [
        ['solute', 'the substance that dissolves'],
        ['solvent', 'the substance (usually a liquid) that does the dissolving'],
        ['solution', 'a solute evenly dissolved in a solvent'],
        ['insoluble', 'does not dissolve'],
      ],
    },
    gen: bank(HINTS.sol, solEntries),
    levels: { 1: 'Naming solute and solvent; soluble or insoluble', 2: 'Telling solutions from other mixtures; fair testing; conservation of mass', 3: 'Solid and gas solutions; recovering a solute' },
  },
  {
    id: 'sci7-solubility',
    lessonNo: 9,
    title: 'Solubility and temperature',
    outcomes: [SOL, 'SC4-WS-03'],
    summary: 'How much dissolves, how temperature affects it, and reading solubility data.',
    learn: {
      intro: `<p><b>Solubility</b> is the greatest mass of a solute that can dissolve in a certain amount of solvent (often 100 g of water) at a given temperature.</p>${table(KNO3, 'Potassium nitrate')}<p>For most solids, solubility increases as temperature rises: hot water can dissolve more sugar than cold water. Salt is unusual: its solubility hardly changes. Gases are the opposite: they dissolve better in cold water.</p><p>Stirring and crushing make a solute dissolve <i>faster</i> but don’t change how much can dissolve.</p>`,
      keyPoints: ['Most solids: more soluble when hotter. Gases: less soluble when hotter.', 'In a solubility investigation the independent variable is temperature; the dependent variable is the mass that dissolves.', 'Keep the amount of water and the stirring the same for a fair test.', 'Cooling a hot saturated solution makes crystals form.'],
      vocab: [
        ['solubility', 'the maximum mass of solute that dissolves in a given amount of solvent at a given temperature'],
        ['independent variable', 'the variable you change on purpose'],
        ['dependent variable', 'the variable you measure'],
      ],
    },
    gen: bank(HINTS.solubility, solubilityEntries),
    levels: { 1: 'Defining solubility; reading a table; dissolving faster', 2: 'Trends and differences in data; variables; gases', 3: 'Saturated or not; scaling to other masses of water; crystals on cooling' },
  },
  {
    id: 'sci7-dissolving',
    lessonNo: 10,
    title: 'Dissolving and the particle model',
    outcomes: [SOL],
    summary: 'Use particle theory to explain how and why substances dissolve.',
    learn: {
      intro: `<p>The particle model explains dissolving. The solvent particles attract the solute particles and pull them away from each other. The solute particles then spread out evenly into the spaces between the solvent particles.</p>${particleBox('mixElements', 'Two kinds of particle evenly mixed')}<p>The solute particles are still there, just spread out, so the mass is conserved. A substance is insoluble when its particles hold together more strongly than the solvent can pull them apart.</p>`,
      keyPoints: ['Dissolving is a physical change: the solute can be recovered.', 'Solute particles fit into the spaces between solvent particles.', 'Hot solvent particles move faster, so dissolving is faster.', 'Models (like marbles and rice) help explain but have limitations.'],
      vocab: [
        ['dissolve', 'to spread out evenly as separate particles through a solvent'],
        ['diffusion', 'the spreading of particles from crowded areas to less crowded areas'],
      ],
    },
    gen: bank(HINTS.particles, dissolveEntries),
    levels: { 1: 'What happens to particles when something dissolves', 2: 'Attractions, insoluble substances, temperature and diagrams', 3: 'Conservation of mass, saturation and limitations of models' },
  },
  {
    id: 'sci7-concentration',
    lessonNo: 11,
    title: 'Dilute, concentrated and saturated',
    outcomes: [SOL],
    summary: 'Compare dilute, concentrated, saturated and supersaturated solutions.',
    learn: {
      intro: `<p>Solutions can have different amounts of solute in them.</p><ul><li><b>Dilute:</b> a small amount of solute in the solvent (pale cordial).</li><li><b>Concentrated:</b> a large amount of solute (strong cordial).</li><li><b>Saturated:</b> no more solute can dissolve at that temperature.</li><li><b>Supersaturated:</b> more is dissolved than should be possible; usually made by slowly cooling a hot saturated solution. Adding a seed crystal makes the extra solute crystallise.</li></ul><p>A coloured solution can be diluted in steps: each dilution is paler than the one before.</p>`,
      keyPoints: ['Add solvent to dilute; add solute or evaporate solvent to concentrate.', 'Test for saturation by adding a little more solute.', 'Dilute solutions are safer to handle in the lab.'],
      vocab: [
        ['dilute', 'containing a small amount of solute'],
        ['concentrated', 'containing a large amount of solute'],
        ['saturated', 'holding as much solute as can dissolve at that temperature'],
        ['supersaturated', 'holding more dissolved solute than normally possible; unstable'],
      ],
    },
    gen: bank(HINTS.words, concWordEntries),
    levels: { 1: 'Meaning of dilute, concentrated and saturated', 2: 'Changing concentration; testing saturation; supersaturated solutions', 3: 'Dilution series, safety and how the terms relate' },
  },
  {
    id: 'sci7-conc-calc',
    lessonNo: 12,
    title: 'Calculating concentration',
    outcomes: [SOL],
    summary: 'Concentration in grams per litre (g/L) and percentage volume per volume (% v/v).',
    learn: {
      intro: `<p>Concentration can be calculated.</p><p class="big">concentration (g/L) = mass of solute (g) ÷ volume of solution (L)</p><p>Example: 15 g of salt in 500 mL. 500 mL = 0.5 L, so the concentration is 15 ÷ 0.5 = 30 g/L.</p><p>When a liquid is dissolved in a liquid, <b>percentage volume per volume</b> is often used:</p><p class="big">% v/v = volume of solute ÷ volume of solution × 100</p><p>Example: 25 mL of juice in 250 mL of drink is 25 ÷ 250 × 100 = 10% v/v.</p>`,
      keyPoints: ['Convert mL to L by dividing by 1000.', 'mass of solute = concentration × volume.', 'Diluting to k times the volume divides the concentration by k.'],
      vocab: [
        ['g/L', 'grams of solute per litre of solution'],
        ['% v/v', 'millilitres of solute in every 100 mL of solution'],
      ],
    },
    gen: bank(HINTS.conc, concCalcEntries),
    levels: { 1: 'Meaning of g/L and % v/v; simple g/L calculations', 2: 'Volumes in mL; mass needed; % v/v', 3: 'Volume of solute needed; dilution; comparing solutions' },
  },
  {
    id: 'sci7-classify',
    lessonNo: 13,
    title: 'Elements, compounds and mixtures',
    outcomes: [SOL],
    summary: 'Classify matter as pure substances (elements, compounds) or mixtures, using particle diagrams.',
    learn: {
      intro: `<p>Matter can be <b>pure</b> (one substance) or <b>impure</b> (a mixture).</p><ul><li>An <b>element</b> is made of only one kind of atom (oxygen, gold, carbon).</li><li>A <b>compound</b> is two or more kinds of atom chemically joined in a fixed ratio (water, H₂O; carbon dioxide, CO₂). It has new properties.</li><li>A <b>mixture</b> is two or more substances together but not chemically joined. Each keeps its own properties, and mixtures can be separated physically.</li></ul>${particleBox('element', 'An element')} ${particleBox('compound', 'A compound')} ${particleBox('mixElements', 'A mixture')}<p>Element, compound, mixture (left to right). Each colour is a different kind of atom.</p><p>Mixtures can be <b>homogeneous</b> (the same throughout, like salt water) or <b>heterogeneous</b> (with visible parts, like soil).</p>`,
      keyPoints: ['Element: one kind of atom. Compound: different atoms joined. Mixture: substances not joined.', 'A compound has a fixed composition; a mixture can vary.', 'Mixtures are separated physically; compounds need chemical reactions.'],
      vocab: [
        ['element', 'a pure substance made of one kind of atom'],
        ['compound', 'a pure substance of two or more kinds of atom chemically joined'],
        ['mixture', 'two or more substances together but not chemically joined'],
        ['homogeneous', 'the same composition all the way through'],
      ],
    },
    gen: bank(HINTS.classify, classifyEntries),
    levels: { 1: 'Pure or mixture; element or compound', 2: 'Particle diagrams; homogeneous and heterogeneous; mixture or compound properties', 3: 'Fixed composition; classifying air and everyday “pure” things' },
  },
  {
    id: 'sci7-separate-size',
    lessonNo: 14,
    title: 'Separating by size and density',
    outcomes: [SOL, 'SC4-WS-04'],
    summary: 'Sieving, filtration, decantation, centrifugation and magnetic separation.',
    learn: {
      intro: `<p>Mixtures can be separated because their parts have different physical properties.</p><ul><li><b>Sieving</b> separates solids of different particle sizes (gravel from sand).</li><li><b>Filtration</b> separates an insoluble solid from a liquid. The solid left on the paper is the <b>residue</b>; the liquid that passes through is the <b>filtrate</b>.</li><li><b>Decantation</b>: let the denser part settle, then pour off the liquid.</li><li><b>Centrifugation</b> spins a mixture fast so the denser parts collect at the bottom (blood cells from plasma).</li><li><b>Magnetic separation</b> pulls out magnetic metals such as iron.</li></ul>`,
      keyPoints: ['Particle size: sieving, filtration. Density: decantation, centrifugation. Magnetism: magnets.', 'Filtration can’t remove dissolved substances.', 'Several steps can be combined to separate complex mixtures.'],
      vocab: [
        ['filtrate', 'the liquid that passes through a filter'],
        ['residue', 'the solid left in the filter'],
        ['decant', 'to pour off a liquid, leaving a settled solid behind'],
      ],
    },
    gen: bank(HINTS.size, sizeEntries),
    levels: { 1: 'Choosing techniques; filtrate and residue', 2: 'How filtration, decantation and centrifuges work', 3: 'Separating a three-part mixture; practical problems' },
  },
  {
    id: 'sci7-separate-heat',
    lessonNo: 15,
    title: 'Evaporation, distillation and chromatography',
    outcomes: [SOL, 'SC4-WS-04'],
    summary: 'Separate dissolved substances and liquids using evaporation, crystallisation, distillation and chromatography.',
    learn: {
      intro: `<ul><li><b>Evaporation:</b> heat a solution so the solvent evaporates, leaving the dissolved solid (salt from sea water).</li><li><b>Crystallisation:</b> evaporate slowly or cool a hot saturated solution so crystals form.</li><li><b>Distillation:</b> boil the liquid and cool the vapour in a <b>condenser</b> to collect the pure liquid (the distillate). It separates by boiling point (volatility).</li><li><b>Paper chromatography:</b> a spot of ink on a pencil line is placed above a solvent; as the solvent soaks up the paper, the dyes travel different distances, separating the mixture.</li></ul>`,
      keyPoints: ['Evaporation keeps the solid; distillation collects the liquid.', 'The liquid with the lower boiling point distils over first.', 'A pure dye gives one spot in chromatography; a mixture gives several.', 'Use pencil for the start line and keep the solvent below the spot.'],
      vocab: [
        ['distillate', 'the liquid collected after distillation'],
        ['volatile', 'evaporating easily (a low boiling point)'],
        ['chromatogram', 'the paper with the separated spots'],
      ],
    },
    gen: bank(HINTS.heat, heatEntries),
    levels: { 1: 'Choosing a technique; what each one collects', 2: 'Boiling points, crystal growth and chromatography method', 3: 'Interpreting chromatograms and distillation of two liquids' },
  },
  {
    id: 'sci7-separate-context',
    lessonNo: 16,
    title: 'Separating mixtures in industry and on Country',
    outcomes: [SOL, 'SC4-WS-07'],
    summary: 'Aboriginal and Torres Strait Islander techniques, water treatment, desalination and recycling.',
    learn: {
      intro: `<p>Separating mixtures is part of everyday life and industry.</p><ul><li><b>Aboriginal and Torres Strait Islander Peoples</b> have long used techniques such as <b>winnowing</b> (tossing or shaking seeds so the light husks blow away), <b>yandying</b> (rocking seeds and grit in a coolamon), hand-picking, sieving and filtering, and extracting plant oils. These use differences in size, mass and density.</li><li><b>Water treatment:</b> screening, flocculation and sedimentation (clumping and settling), filtration through sand and gravel, then disinfection with chlorine.</li><li><b>Desalination:</b> sea water is pushed through very fine membranes (reverse osmosis) or distilled.</li><li><b>Recycling:</b> magnets remove steel; eddy-current separators remove aluminium; materials are sorted by density and size.</li></ul>`,
      keyPoints: ['Choose a technique by asking which physical property differs.', 'Real problems often need several steps in order.', 'Traditional techniques use the same science as modern ones.'],
      vocab: [
        ['winnowing', 'separating light husks from heavier seeds using moving air'],
        ['yandying', 'separating by rocking a mixture in a coolamon'],
        ['desalination', 'removing salt from sea water'],
      ],
    },
    gen: bank(HINTS.context, contextEntries),
    levels: { 1: 'Traditional techniques; filtration and magnets in industry', 2: 'Desalination, disinfection and recycling', 3: 'Designing a sequence of separations' },
  },
]
