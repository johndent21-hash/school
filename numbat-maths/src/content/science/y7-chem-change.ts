// Year 7 chemistry, Lessons 27–30: chemical change. NSW Science 7–10 Syllabus (2023), Stage 4 focus area Change
// (SC4-CHG-01), the "Chemical change" content only (energy transfers and geological change are physics and earth
// science); Working scientifically SC4-WS-01, SC4-WS-03, SC4-WS-04.
import type { Skill } from '@/lib/maths/types'
import { int, pick, sample } from '../helpers'
import { b, bank, cap, type Entry, m, mk } from './kit'

export const CHG = 'SC4-CHG-01'

const CHEMICAL = ['rusting of an iron nail', 'burning a candle wick', 'cooking an egg', 'baking a cake', 'milk going sour', 'a firework exploding', 'fruit rotting', 'baking soda fizzing in vinegar', 'toast burning', 'a silver spoon tarnishing']
const PHYSICAL = ['melting chocolate', 'dissolving sugar in tea', 'boiling water', 'tearing paper', 'freezing juice into an ice block', 'crushing a can', 'chopping vegetables', 'water evaporating from a puddle', 'bending a wire', 'breaking a glass']
const SIGNS = ['a colour change', 'bubbles of gas forming', 'light or a flame given out', 'a temperature change', 'a new solid (precipitate) forming in a liquid', 'a new smell']

// ================================================================== Lesson 27 Physical and chemical change

const changeEntries: Entry[] = [
  mk(1, () => {
    const chem = int(0, 1) === 1
    return { t: 'which', q: `Which of these is a ${b(chem ? 'chemical change' : 'physical change')}?`, a: chem ? pick(CHEMICAL) : pick(PHYSICAL), w: chem ? sample(PHYSICAL, 3) : sample(CHEMICAL, 3), why: chem ? 'In a chemical change a new substance is made.' : 'In a physical change no new substance is made; it is often easily reversed.' }
  }),
  mk(1, () => {
    const x = pick([...CHEMICAL.map((c) => [c, 'chemical'] as const), ...PHYSICAL.map((c) => [c, 'physical'] as const)])
    return { t: 'classify', q: `Is ${b(x[0])} a physical or a chemical change?`, a: `${x[1]} change`, w: [`${x[1] === 'chemical' ? 'physical' : 'chemical'} change`, 'not a change at all', 'both at once'], why: x[1] === 'chemical' ? `${cap(x[0])} makes a new substance.` : `${cap(x[0])} makes no new substance.` }
  }),
  mk(1, () => {
    const sign = pick(SIGNS)
    return { t: 'sign', q: 'Which observation is a sign that a chemical reaction may have happened?', a: sign, w: ['the substance changes shape', 'the substance is cut into pieces', 'the substance melts', 'the substance is poured into a beaker'], why: `${cap(sign)} is an indicator of a chemical change.` }
  }),
  m(1, 'define', 'What is a chemical change?', 'a change in which one or more new substances are made', ['a change of state', 'a change in shape or size', 'mixing two substances'], 'Chemical changes (chemical reactions) produce new substances.'),
  m(1, 'reverse', 'Which kind of change is usually easy to reverse?', 'a physical change', ['a chemical change', 'neither', 'both equally'], 'Physical changes, like melting and freezing, are usually easy to reverse; chemical changes are not.'),
  m(2, 'dissolveTrap', 'Sugar disappears when stirred into water. A student says this is a chemical change because the sugar “vanishes”. What is wrong?', 'dissolving is physical: no new substance forms and the sugar can be recovered by evaporation', ['nothing: it is a chemical change', 'the sugar has turned into water', 'dissolving makes a gas'], 'The sugar particles are still there, spread through the water.'),
  m(2, 'bubblesBoil', 'Bubbles form when water boils and when baking soda is added to vinegar. Why is only one of these a chemical change?', 'boiling just makes water vapour; the baking soda reaction makes a new gas, carbon dioxide', ['both are chemical', 'boiling is chemical, the fizzing is physical', 'bubbles are never a sign of reaction'], 'An indicator suggests a reaction, but you must check whether a new substance formed.'),
  m(2, 'tools', 'Which tool helps you detect a small temperature change during a reaction?', 'a thermometer or temperature probe with a data logger', ['a measuring cylinder', 'a ruler', 'a funnel'], 'Thermometers and data loggers let you observe changes you cannot feel or see.'),
  m(2, 'rust', 'Why is rusting a chemical change?', 'iron reacts with oxygen and water to make a new substance, iron oxide', ['iron changes colour from paint', 'iron melts', 'iron dissolves in rain'], 'Rust is a new substance with different properties from iron.'),
  m(2, 'candle', 'When a candle burns, the wax melts and also burns. Which part is the chemical change?', 'the burning, which makes carbon dioxide and water vapour', ['the melting', 'both are physical', 'neither'], 'Melting wax is physical; burning wax vapour makes new substances.'),
  m(3, 'evidence', 'Two clear liquids are mixed and the mixture turns cloudy yellow. What is the best conclusion?', 'a new insoluble solid (a precipitate) has probably formed: a chemical reaction', ['the liquids are dirty', 'nothing has changed', 'the liquids have frozen'], 'A precipitate forming from two solutions is evidence of a chemical change.'),
  m(3, 'mass', 'Steel wool is heated in air on a balance and becomes heavier. Why?', 'iron joins with oxygen from the air, forming iron oxide', ['heat has mass', 'the steel wool absorbs the flame', 'the balance is affected by heat only'], 'The product includes oxygen atoms from the air, so it has more mass.'),
  m(3, 'egg', 'A boiled egg can’t be “unboiled”. What does this suggest?', 'cooking changes the egg’s substances (proteins) into new forms: a chemical change', ['it is a physical change', 'the egg has frozen', 'the egg lost all its water'], 'Changes that make new substances are usually hard to reverse.'),
  m(2, 'tarnish', 'A shiny copper roof slowly turns green. Is this physical or chemical?', 'chemical: the copper reacts with air and water to make a new green substance', ['physical: it is just dirt', 'physical: copper changes state', 'neither'], 'The green coating (verdigris) is a new substance.'),
  m(2, 'glowSteel', 'A steel bar glows red-hot when heated and returns to normal when cooled. Physical or chemical?', 'physical: no new substance forms', ['chemical, because light is given out', 'chemical, because it gets hot', 'neither'], 'Glowing from heat alone is physical; light is an indicator, not proof.'),
  m(2, 'iceFizz', 'A tablet fizzes in water and the gas turns limewater milky. What does the limewater test show?', 'a new gas, carbon dioxide, was made: a chemical change', ['the water is boiling', 'the tablet melted', 'the gas is oxygen'], 'Identifying a new substance confirms a chemical change.'),
  m(3, 'leaves', 'Leaves change colour in autumn. A student says it’s a physical change. What evidence would show it is chemical?', 'new coloured substances form as green chlorophyll breaks down', ['the leaves fall', 'the leaves get colder', 'the leaves get bigger'], 'The colour change comes from chemicals breaking down and new ones being revealed or made.'),
  m(3, 'reverseChem', 'Can any chemical change be reversed?', 'some can, but usually only by another chemical reaction, not simply by cooling or drying', ['no chemical change can ever be reversed', 'all can be reversed by freezing', 'all can be reversed by filtering'], 'Recharging a battery reverses a chemical reaction, using electricity.'),
  m(3, 'dataLogger', 'Two liquids are mixed and nothing can be seen, but a data logger shows the temperature rising by 6 °C. What is the best conclusion?', 'a chemical reaction has probably occurred, releasing energy', ['nothing happened', 'the data logger is broken', 'the liquids froze'], 'Instruments can detect indicators that our senses miss.'),
  m(3, 'fairObserve', 'To decide whether mixing two powders causes a reaction, what should be done first?', 'observe and record each powder’s properties before mixing', ['mix them in the dark', 'heat them strongly', 'taste them'], 'You need “before” observations to compare with “after”.'),
]

// ================================================================== Lesson 28 Word equations

const REACTIONS: { r: string[]; p: string[]; note: string }[] = [
  { r: ['magnesium', 'oxygen'], p: ['magnesium oxide'], note: 'Magnesium burns with a brilliant white light, forming a white powder.' },
  { r: ['carbon', 'oxygen'], p: ['carbon dioxide'], note: 'Charcoal (carbon) burns in oxygen.' },
  { r: ['methane', 'oxygen'], p: ['carbon dioxide', 'water'], note: 'Natural gas (methane) burns in a gas stove.' },
  { r: ['iron', 'oxygen', 'water'], p: ['hydrated iron oxide (rust)'], note: 'Iron rusts in damp air.' },
  { r: ['magnesium', 'hydrochloric acid'], p: ['magnesium chloride', 'hydrogen'], note: 'Magnesium fizzes in acid, giving off hydrogen.' },
  { r: ['zinc', 'sulfuric acid'], p: ['zinc sulfate', 'hydrogen'], note: 'Zinc reacts with acid, giving off hydrogen.' },
  { r: ['sodium hydrogen carbonate', 'acetic acid'], p: ['sodium acetate', 'water', 'carbon dioxide'], note: 'Baking soda fizzes in vinegar (acetic acid).' },
  { r: ['calcium carbonate', 'hydrochloric acid'], p: ['calcium chloride', 'water', 'carbon dioxide'], note: 'Marble chips (calcium carbonate) fizz in acid.' },
  { r: ['copper carbonate'], p: ['copper oxide', 'carbon dioxide'], note: 'Green copper carbonate turns black when heated.' },
  { r: ['hydrogen', 'oxygen'], p: ['water'], note: 'Hydrogen burns with a pop to make water.' },
]
const eq = (x: { r: string[]; p: string[] }) => `${x.r.join(' + ')} → ${x.p.join(' + ')}`
const wordEntries: Entry[] = [
  m(1, 'reactants', 'In a word equation, what are the substances on the left of the arrow called?', 'reactants', ['products', 'solvents', 'elements'], 'Reactants are what you start with; products are what is made.'),
  m(1, 'products', 'In a word equation, what are the substances on the right of the arrow called?', 'products', ['reactants', 'solutes', 'mixtures'], 'Products are the new substances made.'),
  m(1, 'arrow', 'What does the arrow (→) in a word equation mean?', '“reacts to form” or “produces”', ['“equals”', '“is mixed with”', '“is heated to”'], 'The arrow shows reactants changing into products.'),
  mk(1, () => {
    const x = pick(REACTIONS)
    const p = pick(x.p)
    return { t: 'pickProduct', q: `${x.note} The word equation is ${b(eq(x))}. Which is a ${b('product')}?`, a: p, w: [...x.r, ...sample(['oxygen', 'nitrogen', 'salt', 'sugar', 'helium'].filter((y) => !x.p.includes(y) && !x.r.includes(y)), 3)], why: `Products are on the right: ${x.p.join(', ')}.` }
  }),
  mk(2, () => {
    const x = pick(REACTIONS)
    const right = eq(x)
    const swapped = `${x.p.join(' + ')} → ${x.r.join(' + ')}`
    const others = sample(REACTIONS.filter((y) => y !== x), 2).map(eq)
    return { t: 'chooseEq', q: `${x.note} Which word equation is correct?`, a: right, w: [swapped, ...others], why: `${right}`, meta: { right } }
  }),
  mk(2, () => {
    const x = pick(REACTIONS.filter((y) => y.r.length >= 2))
    const missing = pick(x.r)
    const shown = `${x.r.map((y) => (y === missing ? '____' : y)).join(' + ')} → ${x.p.join(' + ')}`
    return { t: 'missingReactant', q: `Complete the word equation: ${b(shown)}`, a: missing, w: sample(['hydrogen', 'nitrogen', 'water', 'carbon dioxide', 'sodium chloride', 'oxygen', 'iron'].filter((y) => y !== missing && !x.r.includes(y)), 3), why: eq(x) }
  }),
  m(2, 'burnMg', 'Magnesium ribbon burns with a brilliant white light and leaves a white powder. Which observations show a chemical change?', 'the light given out and the new white powder', ['the ribbon is silver', 'the ribbon is long and thin', 'the ribbon bends'], 'Light and a new substance with different properties are indicators of a chemical reaction.'),
  m(2, 'combustion', 'Burning is a reaction with which gas?', 'oxygen', ['nitrogen', 'carbon dioxide', 'hydrogen'], 'Combustion is a reaction with oxygen that releases heat and light.'),
  m(3, 'mass', '2.4 g of magnesium burns completely to make 4.0 g of magnesium oxide. What mass of oxygen reacted?', '1.6 g', ['6.4 g', '2.4 g', '0 g'], 'Mass is conserved: 4.0 − 2.4 = 1.6 g of oxygen joined with the magnesium.'),
  m(3, 'openFlask', 'Marble chips react with acid in an open flask on a balance. The mass goes down. Does this break the law of conservation of mass?', 'no: carbon dioxide gas escapes into the air, so it isn’t weighed', ['yes: mass is destroyed in reactions', 'yes: acid has no mass', 'no: the balance is broken'], 'In a closed container the mass would stay the same.'),
  mk(3, () => {
    const x = pick(REACTIONS.filter((y) => y.p.length >= 2))
    return { t: 'countProducts', q: `How many different products are there in the reaction ${b(eq(x))}?`, n: x.p.length, why: [`Products (after the arrow): ${x.p.join(', ')}: ${x.p.length}.`], meta: { p: x.p } }
  }),
  m(3, 'decomposition', 'Copper carbonate → copper oxide + carbon dioxide. What kind of reaction is this?', 'a decomposition: one substance breaks down into two or more', ['a combustion with oxygen', 'a physical change', 'dissolving'], 'One reactant breaking into several products is a decomposition reaction; this one needs heat.'),
  m(3, 'balanceClosed', 'Vinegar and baking soda react inside a sealed bag on a balance. What happens to the reading?', 'it stays the same, because the gas cannot escape', ['it goes down', 'it goes up', 'it drops to zero'], 'In a closed system, mass is conserved.'),
  m(3, 'atomsRearranged', 'In a chemical reaction, what happens to the atoms?', 'they are rearranged into new substances; none are created or destroyed', ['they are destroyed', 'new atoms are created', 'they turn into energy'], 'That is why mass is conserved.'),
]

// ================================================================== Lesson 29 Energy in chemical reactions

const EXO = ['burning wood', 'a hand warmer heating up', 'respiration in cells', 'a gas stove flame', 'magnesium reacting with acid', 'a firework']
const ENDO = ['photosynthesis', 'baking soda reacting with vinegar (it gets colder)', 'an instant cold pack', 'thermal decomposition of copper carbonate', 'cooking an egg']
const energyEntries: Entry[] = [
  m(1, 'exo', 'What is an exothermic reaction?', 'a reaction that releases energy, so the surroundings get warmer', ['a reaction that takes in energy and gets colder', 'a reaction with no energy change', 'a change of state'], '“Exo” means out: energy goes out to the surroundings.'),
  m(1, 'endo', 'What is an endothermic reaction?', 'a reaction that takes in energy, so the surroundings get colder', ['a reaction that releases heat and light', 'a reaction that makes water', 'a physical change'], '“Endo” means in: energy is taken in from the surroundings.'),
  mk(1, () => {
    const exo = int(0, 1) === 1
    return { t: 'which', q: `Which of these is ${b(exo ? 'exothermic (releases energy)' : 'endothermic (takes in energy)')}?`, a: exo ? pick(EXO) : pick(ENDO), w: exo ? sample(ENDO, 3) : sample(EXO, 3), why: exo ? 'Exothermic reactions release energy, often as heat and light.' : 'Endothermic reactions take in energy from the surroundings.' }
  }),
  mk(1, () => {
    const start = int(18, 24)
    const rise = int(3, 25) * (int(0, 1) ? 1 : -1)
    return { t: 'classifyTemp', q: `The temperature of a reaction mixture changes from ${b(`${start} °C`)} to ${b(`${start + rise} °C`)}. Is the reaction exothermic or endothermic?`, a: rise > 0 ? 'exothermic' : 'endothermic', w: [rise > 0 ? 'endothermic' : 'exothermic', 'neither: the temperature always changes', 'it is a physical change'], why: rise > 0 ? 'The temperature rose, so energy was released: exothermic.' : 'The temperature fell, so energy was taken in: endothermic.', meta: { start, rise } }
  }),
  mk(2, () => {
    const start = int(18, 24)
    const end = start + int(4, 30)
    return { t: 'deltaT', q: `During a reaction the temperature rises from ${b(`${start} °C`)} to ${b(`${end} °C`)}. What is the temperature change?`, n: end - start, unit: '°C', why: [`${end} − ${start} = ${end - start} °C (a rise, so exothermic)`], meta: { start, end } }
  }),
  m(2, 'chemicalEnergy', 'Where is the energy released by burning fuel stored before it burns?', 'as chemical energy (potential energy) in the substances', ['as kinetic energy in the flame', 'as light inside the fuel', 'nowhere: energy is created'], 'Fuels store chemical potential energy, which is released as heat and light when they burn.'),
  m(2, 'conservation', 'In a hand warmer, where does the heat come from?', 'chemical energy stored in the substances is changed into thermal energy', ['energy is created by the reaction', 'the heat of your hand', 'the air outside'], 'Energy is not created or destroyed; it changes form (law of conservation of energy).'),
  m(2, 'coldPack', 'Why do instant cold packs feel cold?', 'the process inside takes in energy from the surroundings, including your skin', ['they contain ice', 'they release cold energy', 'they are stored in a freezer'], 'An endothermic process absorbs thermal energy, so the pack and your skin cool down.'),
  m(2, 'fair', 'To compare the temperature change of two reactions fairly, what should be kept the same?', 'the volumes and starting temperatures of the reactants and the type of container', ['the type of reaction', 'the final temperature', 'nothing'], 'Controlled variables make the comparison fair; only the reaction is changed.'),
  m(3, 'insulate', 'Why is a polystyrene cup with a lid used for measuring temperature changes in reactions?', 'it insulates, so less heat is lost to or gained from the surroundings', ['it makes the reaction faster', 'it dissolves the reactants', 'it is heavier'], 'Insulating reduces heat transfer, so the measured change is more accurate.'),
  mk(3, () => {
    const a = int(6, 15)
    const bb = int(16, 30)
    return { t: 'compare', q: `Reaction X raises the temperature by ${b(`${a} °C`)}; reaction Y raises it by ${b(`${bb} °C`)} (same amounts and containers). Which releases more energy?`, a: 'Y', w: ['X', 'they release the same', 'neither releases energy'], why: `A larger temperature rise (${bb} °C > ${a} °C) means more energy released.`, meta: { a, b: bb } }
  }),
  m(3, 'activation', 'A match must be struck before it burns, even though burning releases energy. Why?', 'reactions need some energy to get started (activation energy)', ['burning is endothermic', 'matches are cold', 'friction makes oxygen'], 'Many exothermic reactions still need a small input of energy to start.'),
]

// ================================================================== Lesson 30 Respiration and photosynthesis

const lifeEntries: Entry[] = [
  m(1, 'photoEq', 'Which word equation shows photosynthesis?', 'carbon dioxide + water → glucose + oxygen (using light energy)', ['glucose + oxygen → carbon dioxide + water', 'oxygen + water → glucose + carbon dioxide', 'glucose → oxygen + water'], 'Plants use light energy to make glucose and oxygen from carbon dioxide and water.'),
  m(1, 'respEq', 'Which word equation shows cellular respiration?', 'glucose + oxygen → carbon dioxide + water (+ energy)', ['carbon dioxide + water → glucose + oxygen', 'glucose + water → oxygen', 'oxygen → carbon dioxide'], 'Cells release energy from glucose using oxygen.'),
  m(1, 'whoPhoto', 'Which living things carry out photosynthesis?', 'plants (and algae)', ['all animals', 'only fungi', 'only humans'], 'Plants and algae have chlorophyll to capture light energy.'),
  m(1, 'whoResp', 'Which living things carry out respiration?', 'all living things, including plants', ['only animals', 'only plants', 'only bacteria'], 'Every living cell respires to release energy, plants included.'),
  m(1, 'light', 'What energy does photosynthesis need?', 'light energy from the Sun', ['sound energy', 'chemical energy from the soil', 'electrical energy'], 'Light energy, captured by chlorophyll, drives photosynthesis.'),
  mk(2, () => {
    const photo = int(0, 1) === 1
    const parts = photo ? ['carbon dioxide', 'water'] : ['glucose', 'oxygen']
    return { t: 'reactants', q: `What are the reactants of ${b(photo ? 'photosynthesis' : 'respiration')}?`, a: parts.join(' and '), w: [photo ? 'glucose and oxygen' : 'carbon dioxide and water', 'nitrogen and water', 'glucose and carbon dioxide'], why: photo ? 'Photosynthesis: carbon dioxide + water → glucose + oxygen.' : 'Respiration: glucose + oxygen → carbon dioxide + water.' }
  }),
  m(2, 'opposite', 'How are photosynthesis and respiration related?', 'the products of one are the reactants of the other', ['they are the same reaction', 'they both need light', 'they both make glucose'], 'Photosynthesis stores energy in glucose; respiration releases it, swapping reactants and products.'),
  m(2, 'exoEndo', 'Which is endothermic and which is exothermic?', 'photosynthesis takes in energy (endothermic); respiration releases energy (exothermic)', ['both are exothermic', 'both are endothermic', 'photosynthesis is exothermic; respiration is endothermic'], 'Light energy is taken in to make glucose; respiration releases that stored chemical energy.'),
  m(2, 'yeast', 'Yeast, sugar and warm water are put in a bottle with a balloon on top. The balloon inflates. Which gas fills it, and why?', 'carbon dioxide, made by the yeast respiring', ['oxygen, made by photosynthesis', 'hydrogen from the sugar', 'air from the water'], 'Yeast respires the sugar, producing carbon dioxide.'),
  m(2, 'elodea', 'A pondweed in water under a lamp gives off small bubbles. Which gas is in the bubbles?', 'oxygen, from photosynthesis', ['carbon dioxide, from respiration', 'nitrogen', 'water vapour'], 'In light, photosynthesis is faster than respiration, so the plant releases oxygen.'),
  mk(3, () => {
    const d = pick([10, 20, 30, 40])
    const counts = [36, 24, 15, 9]
    const i = [10, 20, 30, 40].indexOf(d)
    return { t: 'lamp', q: `A pondweed experiment counts bubbles per minute with a lamp at different distances: 10 cm: 36, 20 cm: 24, 30 cm: 15, 40 cm: 9. What happens to the rate of photosynthesis as the lamp moves further away, and what was the count at ${b(`${d} cm`)}?`, a: `it decreases; ${counts[i]} bubbles per minute`, w: [`it increases; ${counts[i]} bubbles per minute`, `it decreases; ${counts[(i + 1) % 4]} bubbles per minute`, `it stays the same; ${counts[i]} bubbles per minute`], why: `Less light reaches the plant further away, so fewer bubbles: ${counts[i]} per minute at ${d} cm.`, meta: { d } }
  }),
  m(3, 'limewater', 'Limewater is used to show that we breathe out carbon dioxide from respiration. What would you observe?', 'the limewater turns milky (cloudy)', ['the limewater turns blue', 'the limewater boils', 'nothing happens'], 'Carbon dioxide turns limewater milky.'),
  m(3, 'variable', 'In the pondweed experiment, what is the independent variable?', 'the distance of the lamp (light intensity)', ['the number of bubbles', 'the type of plant', 'the water temperature'], 'The variable changed on purpose is the light intensity; bubbles are the dependent variable.'),
  m(3, 'night', 'At night, does a plant photosynthesise, respire, or both?', 'it only respires, because there is no light for photosynthesis', ['it only photosynthesises', 'both, at the same rate', 'neither'], 'Respiration happens all the time; photosynthesis needs light.'),
  m(1, 'chlorophyll', 'Which green substance in plants absorbs light for photosynthesis?', 'chlorophyll', ['glucose', 'oxygen', 'starch'], 'Chlorophyll in the chloroplasts captures light energy.'),
  m(1, 'oxygenFrom', 'Which gas do plants release during photosynthesis?', 'oxygen', ['carbon dioxide', 'nitrogen', 'hydrogen'], 'Oxygen is a product of photosynthesis.'),
  m(1, 'breatheOut', 'Which gas do we breathe out more of, as a product of respiration?', 'carbon dioxide', ['oxygen', 'nitrogen', 'hydrogen'], 'Respiration produces carbon dioxide, which we breathe out.'),
  m(2, 'energyUse', 'What is the energy released by respiration used for?', 'movement, growth, keeping warm and other life processes', ['making light only', 'making carbon dioxide only', 'nothing'], 'Cells use this energy for all their activities.'),
  m(2, 'glucoseUse', 'What do plants do with the glucose made in photosynthesis?', 'use it for respiration and growth, or store it as starch', ['release it into the air', 'turn it into oxygen', 'nothing'], 'Glucose provides energy and building materials; extra is stored as starch.'),
  m(3, 'balloonControl', 'In the yeast balloon experiment, a second bottle has yeast and warm water but no sugar. Why?', 'it is a control: it shows the sugar is needed for the gas to be produced', ['to make more gas', 'to kill the yeast', 'to cool the first bottle'], 'A control lets you compare and be sure the result is caused by the variable tested.'),
]

const HINTS = {
  change: 'Is a new substance made? Look for signs: colour change, gas, light, temperature change, a precipitate.',
  words: 'Reactants → products. Mass is conserved in a closed system.',
  energy: 'Exothermic: temperature rises (energy out). Endothermic: temperature falls (energy in).',
  life: 'Photosynthesis: carbon dioxide + water → glucose + oxygen. Respiration is the reverse.',
}

export const CHANGE_SKILLS: Skill[] = [
  {
    id: 'sci7-chem-change',
    lessonNo: 27,
    title: 'Physical and chemical change',
    outcomes: [CHG, 'SC4-WS-01'],
    summary: 'Tell physical and chemical changes apart, using the indicators of a chemical reaction.',
    learn: {
      intro: `<p>In a <b>physical change</b> no new substance is made: melting, freezing, dissolving, cutting and boiling. Physical changes are usually easy to reverse.</p><p>In a <b>chemical change</b> (a chemical reaction) one or more <b>new substances</b> are made: burning, rusting, cooking, rotting. Chemical changes are usually hard to reverse.</p><p>Indicators that a chemical change has happened include:</p><ul>${SIGNS.map((s) => `<li>${s}</li>`).join('')}</ul><p>Indicators are clues, not proof: boiling water also makes bubbles. Data loggers and thermometers help observe changes you can’t see.</p>`,
      keyPoints: ['Ask: is a new substance made?', 'Look for colour change, gas, light, temperature change, precipitate or smell.', 'Changes of state and dissolving are physical.'],
      vocab: [
        ['physical change', 'a change in which no new substance is made'],
        ['chemical change', 'a change in which new substances are made'],
        ['precipitate', 'an insoluble solid that forms when two solutions react'],
      ],
    },
    gen: bank(HINTS.change, changeEntries),
    levels: { 1: 'Classifying changes; signs of a chemical reaction', 2: 'Tricky cases: dissolving, bubbles, rusting, candles', 3: 'Interpreting observations; mass changes' },
  },
  {
    id: 'sci7-word-equations',
    lessonNo: 28,
    title: 'Word equations',
    outcomes: [CHG],
    summary: 'Write and read word equations, with reactants and products, for familiar reactions.',
    learn: {
      intro: `<p>A <b>word equation</b> summarises a chemical reaction. The <b>reactants</b> (starting substances) are on the left; the <b>products</b> (new substances) are on the right; the arrow means “reacts to form”.</p><p class="big">magnesium + oxygen → magnesium oxide</p><p>Burning silvery magnesium gives a brilliant white light and leaves a white powder, magnesium oxide. More examples:</p><ul><li>methane + oxygen → carbon dioxide + water</li><li>magnesium + hydrochloric acid → magnesium chloride + hydrogen</li><li>copper carbonate → copper oxide + carbon dioxide</li></ul><p>Atoms are rearranged, not created or destroyed, so the total mass stays the same in a closed system.</p>`,
      keyPoints: ['Reactants → products.', 'Use “+” between substances, never “=”.', 'Mass is conserved; in an open container gases may escape.'],
      vocab: [
        ['reactant', 'a substance present at the start of a reaction'],
        ['product', 'a new substance made in a reaction'],
        ['combustion', 'burning: a reaction with oxygen that releases heat and light'],
      ],
    },
    gen: bank(HINTS.words, wordEntries),
    levels: { 1: 'Reactants, products and the arrow', 2: 'Choosing and completing word equations', 3: 'Conservation of mass; types of reaction' },
  },
  {
    id: 'sci7-reaction-energy',
    lessonNo: 29,
    title: 'Energy in chemical reactions',
    outcomes: [CHG, 'SC4-WS-04'],
    summary: 'Exothermic and endothermic reactions and measuring temperature change.',
    learn: {
      intro: `<p>Chemical reactions involve energy changes.</p><ul><li><b>Exothermic</b> reactions release energy to the surroundings, so the temperature rises: burning, respiration, hand warmers.</li><li><b>Endothermic</b> reactions take in energy from the surroundings, so the temperature falls: photosynthesis, baking soda with vinegar, cooking.</li></ul><p>Substances store <b>chemical potential energy</b>. In a reaction it is transformed into other forms such as thermal energy and light; energy is never created or destroyed.</p><p>To measure the energy change, record the temperature before and after in an insulated container: temperature change = final − initial.</p>`,
      keyPoints: ['Temperature up → exothermic. Temperature down → endothermic.', 'Use the same volumes, starting temperature and container for a fair comparison.', 'Many reactions need a little energy to start.'],
      vocab: [
        ['exothermic', 'releasing energy to the surroundings'],
        ['endothermic', 'taking in energy from the surroundings'],
        ['chemical energy', 'energy stored in substances'],
      ],
    },
    gen: bank(HINTS.energy, energyEntries),
    levels: { 1: 'Exothermic or endothermic from examples and temperature', 2: 'Temperature change; energy transformation; fair tests', 3: 'Insulation, comparing reactions, activation energy' },
  },
  {
    id: 'sci7-respiration',
    lessonNo: 30,
    title: 'Respiration and photosynthesis',
    outcomes: [CHG, 'SC4-WS-04'],
    summary: 'The chemical reactions of photosynthesis and respiration, and investigating them.',
    learn: {
      intro: `<p>Two chemical reactions keep living things going.</p><p class="big">Photosynthesis: carbon dioxide + water → glucose + oxygen</p><p>Plants and algae use <b>light energy</b>, captured by chlorophyll, to make glucose. It is endothermic.</p><p class="big">Respiration: glucose + oxygen → carbon dioxide + water (+ energy)</p><p>All living cells, including plant cells, respire to release energy from glucose. It is exothermic.</p><p>Simple investigations model these processes: yeast respiring sugar inflates a balloon with carbon dioxide; pondweed under a lamp gives off bubbles of oxygen, more when the lamp is closer.</p>`,
      keyPoints: ['The products of one reaction are the reactants of the other.', 'Plants respire all the time; they photosynthesise only in light.', 'Limewater turns milky with carbon dioxide.'],
      vocab: [
        ['photosynthesis', 'plants making glucose and oxygen from carbon dioxide and water using light energy'],
        ['respiration', 'cells releasing energy from glucose using oxygen'],
        ['glucose', 'a sugar that stores chemical energy'],
      ],
    },
    gen: bank(HINTS.life, lifeEntries),
    levels: { 1: 'Word equations and who does each process', 2: 'Reactants, the link between the processes, and simple investigations', 3: 'Interpreting data and variables; plants at night' },
  },
]
