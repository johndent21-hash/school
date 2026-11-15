// Year 7 chemistry, Lessons 17–26: elements, metals and non-metals, atoms, the periodic table and compounds.
// NSW Science 7–10 Syllabus (2023), Stage 4 focus area Periodic table and atomic structure (SC4-PRT-01):
// "Classification of matter", "Atomic structure" and "Periodic table"; Working scientifically SC4-WS-05, SC4-WS-06.
import type { Skill } from '@/lib/maths/types'
import { int, pick, sample } from '../helpers'
import { ELEMENTS, FIRST20, b, bank, bohr, cap, chem, type Entry, el, m, mk, shells } from './kit'

export const PRT = 'SC4-PRT-01'

const USES: [string, string, string][] = [
  // object, element, reason
  ['soft-drink cans', 'aluminium', 'light, does not corrode and is easily shaped'],
  ['the “lead” in pencils (graphite)', 'carbon', 'soft and leaves a dark mark'],
  ['electrical wires', 'copper', 'conducts electricity very well and can be drawn into wires'],
  ['jewellery', 'gold', 'shiny and does not tarnish'],
  ['computer chips', 'silicon', 'a semiconductor: it conducts electricity under some conditions'],
  ['old incandescent light-bulb filaments', 'tungsten', 'has a very high melting point'],
  ['party balloons that float', 'helium', 'less dense than air and unreactive'],
  ['glowing advertising signs', 'neon', 'glows brightly when electricity passes through it'],
  ['water pipes and roofs (as galvanising on steel)', 'zinc', 'protects steel from rusting'],
  ['old thermometers', 'mercury', 'a liquid metal that expands evenly when heated'],
  ['killing germs in swimming pools', 'chlorine', 'kills microorganisms'],
]
const NOT_ELEMENTS = ['water', 'steel', 'air', 'salt', 'glass', 'plastic', 'brass', 'wood']

// ================================================================== Lesson 17 Elements around us

const aroundEntries: Entry[] = [
  mk(1, () => {
    const [obj, e, why] = pick(USES)
    return { t: 'inObject', q: `Which element is used to make ${b(obj)}?`, a: e, w: sample(USES.filter((u) => u[1] !== e).map((u) => u[1]), 3), why: `${cap(e)} is used for ${obj}: it is ${why}.` }
  }),
  mk(1, () => {
    const e = pick(ELEMENTS.filter((x) => x.z <= 30 || ['Au', 'Ag', 'Sn', 'Pb'].includes(x.sym)))
    return { t: 'isElement', q: 'Which of these is an element?', a: e.name, w: sample(NOT_ELEMENTS, 3), why: `${cap(e.name)} is an element: it is made of only one kind of atom and appears on the periodic table.` }
  }),
  m(1, 'count', 'About how many elements are known today?', 'about 118', ['about 12', 'about 1000', 'exactly 50'], 'There are 118 known elements; about 90 occur naturally.'),
  m(1, 'table', 'Where can you find a list of all the known elements?', 'the periodic table', ['a dictionary', 'a food label', 'a map'], 'The periodic table arranges all the known elements.'),
  m(1, 'body', 'Which element makes up most of the mass of the human body?', 'oxygen (mostly in water)', ['iron', 'gold', 'helium'], 'About two-thirds of your mass is oxygen, mostly as part of water.'),
  mk(2, () => {
    const [obj, e, why] = pick(USES)
    return { t: 'whyUse', q: `Why is ${b(e)} used for ${obj}?`, a: `it is ${why}`, w: sample(USES.filter((u) => u[1] !== e).map((u) => `it is ${u[2]}`), 3), why: `${cap(e)}: ${why}.` }
  }),
  m(2, 'air', 'Air contains the elements nitrogen, oxygen and argon. Is air an element?', 'no: air is a mixture of elements and compounds', ['yes, because it contains elements', 'yes, because it is a gas', 'no: air is a single compound'], 'Air is a mixture; each gas in it keeps its own properties.'),
  m(2, 'crust', 'Which two elements are most common in the Earth’s crust?', 'oxygen and silicon', ['gold and silver', 'hydrogen and helium', 'iron and carbon'], 'Most rocks are compounds of oxygen and silicon (silicates).'),
  m(2, 'native', 'Gold is often found as nuggets of the pure metal, but iron is usually found joined with oxygen in rocks. Why?', 'gold is very unreactive, but iron reacts with oxygen', ['gold is heavier', 'iron is rarer', 'gold is a non-metal'], 'Unreactive elements can be found uncombined; reactive ones are found in compounds.'),
  m(3, 'universe', 'Which element is the most common in the whole universe?', 'hydrogen', ['oxygen', 'iron', 'carbon'], 'Hydrogen makes up about three-quarters of the ordinary matter in the universe (stars are mostly hydrogen and helium).'),
  m(3, 'diamond', 'Diamond and graphite are both pure carbon but have very different properties. Why?', 'their carbon atoms are arranged differently', ['diamond contains other elements', 'graphite is a compound', 'they are different elements'], 'The same element can have different structures with different properties.'),
  m(3, 'phone', 'A mobile phone contains more than 30 different elements. Why are so many needed?', 'each part needs materials with particular properties', ['elements are cheap', 'phones are mixtures of water', 'manufacturers like variety'], 'Conductors, semiconductors, magnets, glass and batteries all need elements with different properties.'),
  m(3, 'synthetic', 'Some elements, such as technetium and the elements above uranium, are made by scientists rather than found in nature. How are they detected?', 'with special instruments, because they are often radioactive and exist only briefly', ['by tasting them', 'they are visible to the naked eye', 'they cannot be detected'], 'New elements are made in reactors and accelerators and identified with sensitive instruments.'),
  m(3, 'oxygenFree', 'Oxygen exists in the air as an element (O₂) but in rocks it is joined to other elements. Which statement explains this?', 'an element can exist on its own or combined in compounds', ['oxygen in rocks is a different element', 'rocks have no oxygen', 'oxygen is only found in air'], 'The same element can appear uncombined or in many different compounds.'),
  m(3, 'whichNotElement', 'A student lists “gold, oxygen, water, iron” as elements. Which one is wrong, and why?', 'water: it is a compound of hydrogen and oxygen', ['gold: it is a mixture', 'oxygen: it is a compound', 'iron: it is an alloy'], 'Water (H₂O) contains two kinds of atom chemically joined.'),
  m(3, 'scarce', 'Lithium is needed for rechargeable batteries. Why do scientists research recycling lithium from old batteries?', 'lithium is limited and mining it has environmental costs', ['lithium is a gas', 'used lithium turns into another element', 'batteries contain no lithium'], 'Availability and environmental impact affect how elements are used and reused.'),
  m(3, 'carbonLife', 'Which element is found in every living thing and in fuels such as coal, petrol and natural gas?', 'carbon', ['helium', 'gold', 'neon'], 'Carbon compounds make up living things and fossil fuels.'),
]

// ================================================================== Lesson 18 Metals, non-metals and metalloids

const METAL_PROPS = ['shiny (lustrous)', 'good conductors of heat and electricity', 'malleable (can be hammered into shape)', 'ductile (can be drawn into wires)', 'mostly solids with high melting points']
const NONMETAL_PROPS = ['dull (not shiny)', 'poor conductors of heat and electricity (insulators)', 'brittle if solid', 'often gases at room temperature', 'mostly low melting and boiling points']
const kindEntries: Entry[] = [
  mk(1, () => {
    const e = pick(ELEMENTS)
    return { t: 'kind', q: `Is ${b(e.name)} a metal, a non-metal or a metalloid?`, a: e.kind, w: ['metal', 'non-metal', 'metalloid', 'a compound'].filter((x) => x !== e.kind), why: `${cap(e.name)} is a ${e.kind}.`, meta: { sym: e.sym } }
  }),
  mk(1, () => {
    const p = pick(METAL_PROPS)
    return { t: 'metalProp', q: 'Which is a typical property of metals?', a: p, w: sample(NONMETAL_PROPS, 3), why: `Metals are usually ${METAL_PROPS.slice(0, 3).join(', ')}.` }
  }),
  mk(1, () => {
    const p = pick(NONMETAL_PROPS)
    return { t: 'nonmetalProp', q: 'Which is a typical property of non-metals?', a: p, w: sample(METAL_PROPS, 3), why: 'Non-metals are usually dull, brittle insulators, and many are gases.' }
  }),
  m(1, 'malleable', 'What does “malleable” mean?', 'can be hammered or pressed into shape without breaking', ['can be drawn into wires', 'shiny', 'breaks easily'], 'Malleable materials, like aluminium foil, can be bent and hammered into shape.'),
  m(1, 'ductile', 'What does “ductile” mean?', 'can be drawn out into a wire', ['can be hammered flat', 'conducts heat', 'dissolves in water'], 'Copper is very ductile, which is why it is used for wires.'),
  m(1, 'liquidMetal', 'Which metal is a liquid at room temperature?', 'mercury', ['iron', 'aluminium', 'sodium'], 'Mercury is the only metal that is liquid at room temperature.'),
  m(2, 'test', 'A student tests an unknown solid element. It is shiny, conducts electricity and bends without breaking. What is it most likely to be?', 'a metal', ['a non-metal', 'a metalloid', 'a compound'], 'Lustre, conductivity and malleability are metal properties.'),
  m(2, 'test2', 'An unknown yellow solid is dull, shatters when hit and does not conduct electricity. What is it most likely to be?', 'a non-metal (it could be sulfur)', ['a metal', 'a metalloid', 'an alloy'], 'Dull, brittle and non-conducting are non-metal properties. Sulfur is a yellow non-metal.'),
  m(2, 'metalloid', 'What is a metalloid?', 'an element with some properties of metals and some of non-metals', ['a mixture of metals', 'a very small metal', 'a metal that is a gas'], 'Metalloids such as silicon and boron are in between; silicon is shiny but brittle and a semiconductor.'),
  m(2, 'graphite', 'Carbon is a non-metal, but graphite conducts electricity. What does this show?', 'there are exceptions to the general properties', ['graphite is a metal', 'carbon is a metalloid', 'graphite is a compound'], 'General rules have exceptions: graphite is a non-metal that conducts.'),
  m(2, 'where', 'Where are the metals found on the periodic table?', 'on the left and in the middle, with non-metals on the right', ['only in the top row', 'on the right-hand side', 'only at the bottom'], 'A zigzag (staircase) line separates metals on the left from non-metals on the right; metalloids sit along it.'),
  m(3, 'fairConductor', 'To compare how well metals conduct heat, a student puts wax beads on rods of different metals and heats one end. What must be kept the same?', 'the length and thickness of the rods, the heat source and the distance of each bead', ['the type of metal', 'nothing', 'the time the beads fall'], 'Only the metal is changed; everything else is controlled so the comparison is fair.'),
  m(3, 'pans', 'Saucepans are made of metal but have plastic or wooden handles. Why?', 'metals conduct heat well, so a non-conducting handle stops your hand getting burnt', ['plastic is shinier', 'metals are too heavy to hold', 'wood conducts heat better'], 'The metal pan conducts heat to the food; the insulating handle stays cool.'),
  m(3, 'luminescence', 'White phosphorus glows faintly in the dark. Which property describes giving out light without being hot?', 'luminescence', ['malleability', 'ductility', 'conductivity'], 'Luminescence is light given out without heat; it is one of the properties compared in the syllabus.'),
  m(2, 'conductTest', 'How could you test whether a solid element conducts electricity?', 'connect it into a circuit with a battery and a globe and see if the globe lights', ['heat it in a flame', 'drop it in water', 'weigh it'], 'A simple circuit tests electrical conductivity.'),
  m(2, 'brittleTest', 'When a lump of an element is hit with a hammer it shatters into powder. Which kind of element is it likely to be?', 'a non-metal (or a metalloid)', ['a metal', 'an alloy', 'a liquid metal'], 'Metals bend or flatten; brittle solids are non-metals or metalloids.'),
  m(2, 'gasNonmetal', 'Most elements that are gases at room temperature are…', 'non-metals', ['metals', 'metalloids', 'alloys'], 'Hydrogen, nitrogen, oxygen, fluorine, chlorine and the noble gases are all non-metal gases.'),
  m(3, 'siliconChip', 'Silicon is used in computer chips. Which property, typical of metalloids, makes it useful?', 'it is a semiconductor: its conductivity can be controlled', ['it is a perfect insulator', 'it is very malleable', 'it is a liquid'], 'Semiconductors conduct under some conditions, which makes switches and chips possible.'),
  m(3, 'meltingPoints', 'Tungsten melts at 3422 °C; sulfur melts at 115 °C. What does this suggest?', 'tungsten is a metal with very strong forces between its particles; sulfur is a non-metal with weaker forces', ['sulfur is a metal', 'tungsten is a gas', 'melting point is unrelated to type'], 'Most metals have high melting points; many non-metals have low ones.'),
  m(3, 'copperKettle', 'Why would copper make a good base for a saucepan?', 'it conducts heat very well and spreads it evenly', ['it is an insulator', 'it is brittle', 'it has a low melting point'], 'Good thermal conductivity spreads the heat across the pan.'),
  m(3, 'unknownTable', 'Element Q: dull grey, brittle, conducts electricity a little, melting point 1414 °C. Element R: shiny, bends, conducts well. What are Q and R most likely to be?', 'Q is a metalloid; R is a metal', ['Q is a metal; R is a non-metal', 'both are non-metals', 'both are metalloids'], 'Q has mixed properties (a metalloid, like silicon); R has typical metal properties.'),
]

// ================================================================== Lesson 19 Properties and uses

const ALLOYS: [string, string, string][] = [
  ['bronze', 'copper and tin', 'statues and medals: harder than copper and resists corrosion'],
  ['brass', 'copper and zinc', 'musical instruments and taps: does not corrode and looks golden'],
  ['steel', 'iron and carbon', 'buildings and bridges: much stronger than pure iron'],
  ['stainless steel', 'iron, chromium and nickel', 'cutlery and sinks: does not rust'],
  ['solder', 'mainly tin (with silver or copper)', 'joining electrical components: low melting point'],
]
const usesEntries: Entry[] = [
  mk(1, () => {
    const [name, made] = pick(ALLOYS)
    return { t: 'alloyMade', q: `Which elements is ${b(name)} mainly made from?`, a: made, w: sample(ALLOYS.filter((x) => x[0] !== name).map((x) => x[1]), 3), why: `${cap(name)} is an alloy of ${made}.` }
  }),
  m(1, 'alloy', 'What is an alloy?', 'a mixture of a metal with other elements, usually other metals', ['a pure element', 'a compound of two non-metals', 'a type of plastic'], 'Alloys are mixtures designed to have better properties than the pure metal.'),
  m(1, 'aluminiumPlane', 'Why is aluminium used to build aeroplanes?', 'it is strong for its mass (low density) and does not corrode', ['it is the heaviest metal', 'it is magnetic', 'it is a liquid'], 'Aluminium’s low density and corrosion resistance suit aircraft.'),
  m(1, 'copperPipe', 'Why is copper used for water pipes?', 'it does not rust and is easy to bend and join', ['it is the cheapest metal', 'it dissolves in water', 'it is a non-metal'], 'Copper resists corrosion and is malleable.'),
  mk(2, () => {
    const [name, , use] = pick(ALLOYS)
    const [u, why] = use.split(': ')
    return { t: 'alloyUse', q: `${cap(name)} is used for ${b(u)}. Why?`, a: why, w: sample(ALLOYS.filter((x) => x[0] !== name).map((x) => x[2].split(': ')[1]), 3), why: `${cap(name)}: ${why}.` }
  }),
  m(2, 'whyAlloy', 'Pure gold is too soft for most jewellery. What is done about this?', 'it is mixed with other metals such as copper or silver to make a harder alloy', ['it is heated until it becomes a gas', 'it is painted', 'nothing: jewellery is pure gold'], '18-carat gold is 75% gold mixed with other metals to make it harder.'),
  m(2, 'compoundUse', 'Sodium is a reactive metal and chlorine is a poisonous gas. Why is the compound sodium chloride safe to eat?', 'a compound has different properties from the elements it is made from', ['it isn’t: salt is poisonous', 'the sodium and chlorine are kept separate', 'cooking removes the chlorine'], 'Compounds are new substances with their own properties.'),
  m(2, 'titanium', 'Titanium is used for hip replacements. Which properties make it suitable?', 'strong, light, does not corrode and is not rejected by the body', ['magnetic and heavy', 'soft and liquid', 'it dissolves slowly'], 'Uses depend on properties: titanium is strong, light, corrosion-resistant and biocompatible.'),
  m(2, 'silver', 'Silver conducts electricity better than copper. Why is copper still used for household wiring?', 'copper is much cheaper and more available', ['silver is a non-metal', 'copper conducts better', 'silver is not ductile'], 'Availability and cost also influence which material is used.'),
  m(3, 'leadPaint', 'Lead was once used in paint and petrol. Why is it no longer used in them?', 'scientists discovered lead is toxic and harms health', ['lead became too expensive', 'lead stopped being a metal', 'lead is a gas'], 'New scientific understanding of a substance’s properties (its toxicity) changed how it is used.'),
  m(3, 'choose', 'Engineers need a material for a bridge that is strong and doesn’t rust in sea air. Which is the best choice?', 'stainless steel or galvanised steel', ['pure iron', 'pure aluminium foil', 'copper wire'], 'Steel is strong; stainless or galvanised (zinc-coated) steel resists rusting.'),
  m(3, 'recycle', 'Why is aluminium recycled so much?', 'recycling uses about 5% of the energy needed to extract new aluminium from its ore', ['aluminium cannot be made any other way', 'recycled aluminium is a different element', 'aluminium is rare in the Earth’s crust'], 'Extracting aluminium uses a lot of electricity; recycling saves most of it.'),
  m(3, 'galvanise', 'Steel roofing is coated with zinc (galvanised). Why?', 'zinc protects the steel from rusting', ['zinc makes it magnetic', 'zinc makes the roof lighter', 'zinc conducts heat away'], 'The zinc coating corrodes instead of the iron, protecting it.'),
  m(3, 'mercuryTherm', 'Mercury thermometers are being replaced. Why?', 'mercury is toxic, so a broken thermometer is a health hazard', ['mercury does not expand', 'mercury is a gas', 'mercury is too cheap'], 'Understanding mercury’s toxicity changed how it is used.'),
  m(3, 'helium', 'Helium replaced hydrogen in airships. Why?', 'helium is unreactive, but hydrogen is flammable', ['helium is denser than air', 'hydrogen is too heavy', 'helium is cheaper than all gases'], 'Hydrogen fires (such as the Hindenburg disaster) showed the danger; helium does not burn.'),
  m(3, 'aluminiumOre', 'Aluminium is the most common metal in the Earth’s crust but was once more valuable than gold. Why?', 'it was very hard to extract from its ore until electricity made it possible', ['it was found only on the Moon', 'it was a non-metal then', 'it did not exist before 1900'], 'Availability depends on extraction technology, not just how much exists.'),
  m(3, 'solderLow', 'Why is solder, rather than pure copper, used to join wires in electronics?', 'solder has a low melting point, so it can be melted without damaging the parts', ['solder is an insulator', 'copper does not conduct', 'solder is magnetic'], 'Solder melts at a low temperature yet still conducts electricity.'),
]

// ================================================================== Lesson 20 Atoms and subatomic particles

const PARTS: Record<'proton' | 'neutron' | 'electron', { where: string; charge: string; mass: string }> = {
  proton: { where: 'in the nucleus', charge: 'positive (+1)', mass: '1' },
  neutron: { where: 'in the nucleus', charge: 'no charge (0)', mass: '1' },
  electron: { where: 'moving around the nucleus in shells', charge: 'negative (−1)', mass: 'almost 0 (about 1/1840)' },
}
const subEntries: Entry[] = [
  mk(1, () => {
    const p = pick(['proton', 'neutron', 'electron'] as const)
    return { t: 'charge', q: `What is the charge of a ${b(p)}?`, a: PARTS[p].charge, w: ['positive (+1)', 'no charge (0)', 'negative (−1)', 'positive (+2)'].filter((x) => x !== PARTS[p].charge), why: `A ${p} has ${PARTS[p].charge} charge.` }
  }),
  mk(1, () => {
    const p = pick(['proton', 'neutron', 'electron'] as const)
    return { t: 'where', q: `Where is a ${b(p)} found in an atom?`, a: PARTS[p].where, w: [p === 'electron' ? 'in the nucleus' : 'moving around the nucleus in shells', 'outside the atom altogether', 'only in metals', 'in the spaces between atoms'], why: `${cap(p)}s are ${PARTS[p].where}.` }
  }),
  m(1, 'atom', 'What is an atom?', 'the smallest unit of an element that still has the properties of that element', ['a tiny cell', 'a molecule of water', 'a type of mixture'], 'An atom is the smallest particle of an element that keeps its properties.'),
  m(1, 'nucleus', 'What is in the nucleus of an atom?', 'protons and neutrons', ['electrons only', 'protons and electrons', 'nothing'], 'The nucleus contains protons and neutrons; electrons are outside it.'),
  m(1, 'three', 'What are the three subatomic particles?', 'protons, neutrons and electrons', ['atoms, molecules and cells', 'solids, liquids and gases', 'protons, nuclei and shells'], 'Atoms are made of protons, neutrons and electrons.'),
  mk(2, () => {
    const p = pick(['proton', 'neutron', 'electron'] as const)
    return { t: 'mass', q: `What is the relative mass of a ${b(p)} (compared with a proton)?`, a: PARTS[p].mass, w: ['1', 'almost 0 (about 1/1840)', '2', '1840'].filter((x) => x !== PARTS[p].mass), why: `Protons and neutrons each have a relative mass of 1; an electron is about 1/1840 of that.` }
  }),
  m(2, 'neutral', 'An atom has no overall charge. Why?', 'it has the same number of protons (+) as electrons (−)', ['it has no protons', 'neutrons cancel the electrons', 'it has more neutrons than protons'], 'Equal numbers of positive protons and negative electrons cancel out.'),
  m(2, 'massWhere', 'Where is almost all the mass of an atom?', 'in the nucleus', ['in the electron shells', 'spread evenly through the atom', 'in the empty space'], 'Protons and neutrons are nearly 2000 times heavier than electrons, and they are in the nucleus.'),
  m(2, 'space', 'Most of the volume of an atom is…', 'empty space', ['the nucleus', 'protons', 'neutrons'], 'The nucleus is tiny compared with the whole atom; electrons move in a large region around it.'),
  mk(2, () => {
    const e = pick(FIRST20.filter((x) => x.sym !== 'Cl'))
    return { t: 'fromDiagram', q: 'How many electrons does this atom have?', d: bohr(e.z, e.mass - e.z, `A model of an atom with ${e.z} protons`), n: e.z, why: [`It has ${e.z} protons, and a neutral atom has the same number of electrons: ${e.z}. (Count the dots on the shells: ${shells(e.z).join(' + ')} = ${e.z}.)`], meta: { z: e.z } }
  }),
  m(3, 'scale', 'If an atom were the size of a football stadium, the nucleus would be about the size of…', 'a pea in the centre', ['the whole pitch', 'a car', 'the grandstand'], 'The nucleus is about 100 000 times smaller across than the atom.'),
  m(3, 'opposite', 'What keeps the electrons near the nucleus?', 'the attraction between the negative electrons and the positive protons', ['gravity from the neutrons', 'the electrons are glued on', 'magnetism of the shells'], 'Opposite charges attract.'),
  mk(3, () => {
    const e = pick(FIRST20.filter((x) => x.sym !== 'Cl'))
    return { t: 'chargeCount', q: `An atom has ${b(`${e.z} protons`)}, ${b(`${e.mass - e.z} neutrons`)} and ${b(`${e.z} electrons`)}. What is its overall charge?`, a: '0 (neutral)', w: [`+${e.z}`, `−${e.z}`, `+${e.mass}`, `−${e.mass}`, '+1', '+2', '−2'], why: `${e.z} positive protons and ${e.z} negative electrons cancel; neutrons have no charge. The atom is neutral.`, meta: { z: e.z } }
  }),
]

// ================================================================== Lesson 21 Models of the atom

const MODELS: [string, string, string][] = [
  ['Dalton (1803)', 'atoms are tiny solid spheres that cannot be divided', 'solid sphere model'],
  ['Thomson (1897–1904)', 'discovered the electron; atoms are a positive sphere with electrons dotted through it', 'plum pudding model'],
  ['Rutherford (1911)', 'a tiny, dense, positive nucleus with electrons around it and mostly empty space', 'nuclear model'],
  ['Bohr (1913)', 'electrons travel in fixed shells (energy levels) around the nucleus', 'planetary (shell) model'],
  ['Chadwick (1932)', 'discovered the neutron in the nucleus', 'the neutron'],
]
const modelEntries: Entry[] = [
  mk(1, () => {
    const [who, idea] = pick(MODELS)
    return { t: 'who', q: `Which scientist’s idea was this: ${b(idea)}?`, a: who, w: sample(MODELS.filter((x) => x[0] !== who).map((x) => x[0]), 3), why: `${who}: ${idea}.` }
  }),
  mk(1, () => {
    const [who, , name] = pick(MODELS.slice(0, 4))
    return { t: 'name', q: `What is ${b(who.split(' ')[0])}’s model of the atom called?`, a: `the ${name}`, w: sample(MODELS.slice(0, 4).filter((x) => x[0] !== who).map((x) => `the ${x[2]}`).concat(['the electron cloud model']), 3), why: `${who}: the ${name}.` }
  }),
  m(1, 'change', 'Why have models of the atom changed over time?', 'new experiments and technologies gave new evidence', ['scientists liked new pictures', 'atoms have changed', 'old scientists were careless'], 'Models are updated when new evidence doesn’t fit the old model.'),
  m(1, 'order', 'Which is the correct order of atomic models, from oldest to newest?', 'Dalton, Thomson, Rutherford, Bohr', ['Bohr, Rutherford, Thomson, Dalton', 'Thomson, Dalton, Bohr, Rutherford', 'Rutherford, Dalton, Bohr, Thomson'], 'Dalton (1803), Thomson (1904), Rutherford (1911), Bohr (1913).'),
  m(2, 'goldFoil', 'In Rutherford’s gold foil experiment, most positively charged alpha particles went straight through the foil. What did this show?', 'atoms are mostly empty space', ['atoms are solid spheres', 'gold has no atoms', 'alpha particles have no mass'], 'If most particles pass straight through, most of the atom must be empty.'),
  m(2, 'bounce', 'In the same experiment, a few alpha particles bounced back. What did this show?', 'there is a tiny, dense, positive nucleus', ['electrons are very heavy', 'the foil was too thick', 'atoms are negatively charged'], 'Only a small, dense, positive centre could repel the positive alpha particles so strongly.'),
  m(2, 'thomsonWrong', 'Which observation did Thomson’s plum pudding model fail to explain?', 'some alpha particles bouncing back from gold foil', ['atoms having electrons', 'atoms being neutral', 'atoms being very small'], 'A spread-out positive “pudding” couldn’t bounce particles back; a concentrated nucleus could.'),
  m(2, 'tech', 'Which technology allowed scientists to produce images of individual atoms in the 1980s?', 'the scanning tunnelling microscope', ['the magnifying glass', 'the telescope', 'the light microscope'], 'Light microscopes can’t see atoms; scanning tunnelling microscopes can image surfaces atom by atom.'),
  m(2, 'cathode', 'Thomson discovered the electron using which equipment?', 'a cathode ray tube', ['a gold foil', 'a telescope', 'a Bunsen burner'], 'Cathode rays were bent by electric and magnetic fields, showing they were tiny negative particles.'),
  m(3, 'current', 'Today, electrons are thought of as moving in regions of probability rather than neat orbits. Why do schools still use Bohr’s model?', 'it is simple and explains many patterns, such as the arrangement of electrons in shells', ['it is completely correct', 'the newer model is wrong', 'it is the only model'], 'A simpler model is useful when it explains what we need, even if more detailed models exist.'),
  m(3, 'evidence', 'A scientist proposes a new atomic model. What would make other scientists accept it?', 'it explains more of the experimental evidence than older models and makes testable predictions', ['it is drawn neatly', 'the scientist is famous', 'it agrees with the oldest model'], 'Scientific models are accepted when they fit evidence and predictions are confirmed.'),
  m(3, 'neutronLate', 'Why was the neutron discovered after the proton and electron?', 'it has no charge, so it isn’t deflected by electric or magnetic fields and is harder to detect', ['it is the biggest particle', 'it is outside the atom', 'there are very few neutrons'], 'Charged particles are easy to detect with fields; neutral neutrons needed cleverer experiments.'),
  m(2, 'daltonWrong', 'Which part of Dalton’s model was later shown to be wrong?', 'that atoms cannot be divided: they contain smaller particles', ['that elements are made of atoms', 'that atoms of one element are alike', 'that compounds contain atoms'], 'The discovery of electrons, protons and neutrons showed atoms can be divided.'),
  m(2, 'plum', 'In Thomson’s “plum pudding” model, what are the “plums”?', 'electrons', ['protons', 'neutrons', 'nuclei'], 'Electrons were dotted through a positive sphere like plums in a pudding.'),
  m(2, 'bohrShells', 'What did Bohr add to Rutherford’s model?', 'electrons travel in fixed shells (energy levels) around the nucleus', ['a solid sphere', 'the neutron', 'the plum pudding'], 'Bohr’s shells explained why atoms give out light of particular colours.'),
  m(3, 'colours', 'Bohr’s model helped explain why heated elements give out particular colours of light. How?', 'electrons jump between shells and give out set amounts of energy as light', ['protons glow when heated', 'the nucleus changes colour', 'atoms burn'], 'Each jump between fixed energy levels releases a particular colour, as in flame tests.'),
  m(3, 'mostlyEmpty', 'Which observation from Rutherford’s experiment would Dalton’s solid-sphere model fail to explain?', 'most alpha particles passing straight through the gold foil', ['gold being shiny', 'alpha particles being positive', 'foil being thin'], 'Solid spheres would block the particles; they passed through because atoms are mostly empty space.'),
  m(3, 'collab', 'The model of the atom was developed by many scientists over more than 100 years. What does this show about science?', 'scientific knowledge builds on and corrects earlier work', ['scientists never agree', 'the first idea is always right', 'models never change'], 'Science is collaborative and self-correcting.'),
  m(3, 'predictTest', 'Rutherford predicted the neutron in 1920, and Chadwick found it in 1932. Why was it predicted?', 'atoms had more mass than their protons alone could explain', ['electrons were too heavy', 'the gold foil was missing atoms', 'neutrons glow'], 'Extra mass in the nucleus suggested a neutral particle.'),
  m(3, 'whichEvidence', 'Which new technology at the start of the 1900s let scientists probe inside atoms?', 'radioactive sources that give off fast alpha particles', ['the telephone', 'the light bulb', 'the microscope slide'], 'Alpha particles from radioactive elements made Rutherford’s experiment possible.'),
]

// ================================================================== Lesson 22 Element symbols

const LATIN: [string, string, string][] = [
  ['Fe', 'iron', 'ferrum'],
  ['Na', 'sodium', 'natrium'],
  ['K', 'potassium', 'kalium'],
  ['Cu', 'copper', 'cuprum'],
  ['Ag', 'silver', 'argentum'],
  ['Au', 'gold', 'aurum'],
  ['Pb', 'lead', 'plumbum'],
  ['Sn', 'tin', 'stannum'],
  ['Hg', 'mercury', 'hydrargyrum'],
  ['W', 'tungsten', 'wolfram'],
]
const symbolEntries: Entry[] = [
  mk(1, () => {
    const e = pick(ELEMENTS.filter((x) => x.z <= 20))
    const others = sample(ELEMENTS.filter((x) => x.sym !== e.sym), 3)
    return { t: 'symbol', q: `What is the chemical symbol for ${b(e.name)}?`, a: e.sym, w: others.map((x) => x.sym).concat([e.name.slice(0, 2).replace(/^./, (c) => c.toUpperCase())]).filter((x) => x !== e.sym), why: `The symbol for ${e.name} is ${e.sym}.` }
  }),
  mk(1, () => {
    const e = pick(ELEMENTS.filter((x) => x.z <= 20))
    return { t: 'name', q: `Which element has the symbol ${b(e.sym)}?`, a: e.name, w: sample(ELEMENTS.filter((x) => x.sym !== e.sym && x.z <= 30), 3).map((x) => x.name), why: `${e.sym} is ${e.name}.` }
  }),
  m(1, 'capital', 'Which is the correct way to write the symbol for magnesium?', 'Mg', ['MG', 'mg', 'mG'], 'The first letter is a capital and any second letter is lower case: Mg.'),
  m(1, 'universal', 'Why do scientists use chemical symbols?', 'they are understood by scientists everywhere, whatever language they speak', ['they are secret codes', 'they are shorter names for compounds only', 'they show the colour of the element'], 'Symbols are an international shorthand for the elements.'),
  mk(2, () => {
    const [sym, name, latin] = pick(LATIN)
    return { t: 'latin', q: `The symbol for ${b(name)} is ${b(sym)}. Where does this symbol come from?`, a: `its older name, ${latin}`, w: sample(LATIN.filter((x) => x[0] !== sym).map((x) => `its older name, ${x[2]}`), 2).concat(['the first two letters of its English name']), why: `${sym} comes from ${latin}, the Latin (or older) name for ${name}.` }
  }),
  mk(2, () => {
    const [sym, name] = pick(LATIN)
    return { t: 'latinSymbol', q: `What is the symbol for ${b(name)}?`, a: sym, w: sample(LATIN.filter((x) => x[0] !== sym).map((x) => x[0]), 2).concat([cap(name.slice(0, 2))].filter((x) => x !== sym)).concat([cap(name[0]) + name[name.length - 1]]).filter((x, i, arr) => x !== sym && arr.indexOf(x) === i), why: `${cap(name)} is ${sym}.` }
  }),
  m(2, 'CoCO', 'What is the difference between Co and CO?', 'Co is the element cobalt; CO is carbon monoxide, a compound of carbon and oxygen', ['there is no difference', 'CO is cobalt and Co is a compound', 'both are compounds'], 'Capital letters start a new element symbol: CO is C and O together.'),
  m(2, 'helium', 'Why is the symbol for helium He and not H?', 'H is already the symbol for hydrogen, so a second letter is added', ['helium is a metal', 'H stands for heat', 'it is a mistake'], 'When two elements start with the same letter, a second letter tells them apart.'),
  m(3, 'count', 'How many different elements are in the formula NaHCO₃ (baking soda)?', '4 (sodium, hydrogen, carbon and oxygen)', ['3', '6', '1'], 'Count the capital letters: Na, H, C, O.'),
  m(3, 'whichElements', 'Which elements are in KMnO₄?', 'potassium, manganese and oxygen', ['krypton, magnesium and oxygen', 'potassium, magnesium and nitrogen', 'kalium and mercury'], 'K = potassium, Mn = manganese, O = oxygen.'),
  m(3, 'invent', 'A new element was named tennessine in 2016 with the symbol Ts. Who decides element names and symbols?', 'IUPAC, an international organisation of chemists', ['the person who finds it, with no rules', 'each country separately', 'nobody: they are random'], 'IUPAC (the International Union of Pure and Applied Chemistry) approves names and symbols.'),
  m(3, 'formulaRead', 'In the formula CaCO₃, which elements are present?', 'calcium, carbon and oxygen', ['carbon, cobalt and oxygen', 'calcium and cobalt', 'carbon only'], 'Ca = calcium, C = carbon, O = oxygen.'),
  m(3, 'tricky', 'Which symbol is NOT the first one or two letters of the element’s English name?', 'Pb (lead)', ['Ca (calcium)', 'Ne (neon)', 'Al (aluminium)'], 'Pb comes from plumbum, the Latin for lead.'),
  m(3, 'plumber', 'The word “plumber” comes from the same Latin word as the symbol Pb. Why?', 'water pipes used to be made of lead (plumbum)', ['plumbers use gold', 'Pb means water', 'it is a coincidence'], 'Lead pipes were once common, so pipe workers were named after lead.'),
  m(3, 'NaCl', 'Which elements are in NaCl?', 'sodium and chlorine', ['nitrogen and carbon', 'sodium and calcium', 'nickel and chlorine'], 'Na = sodium, Cl = chlorine.'),
  m(3, 'AgNO3', 'Which elements are in AgNO₃ (silver nitrate)?', 'silver, nitrogen and oxygen', ['argon, nitrogen and oxygen', 'gold, nitrogen and oxygen', 'silver and neon'], 'Ag = silver (argentum), N = nitrogen, O = oxygen.'),
]

// ================================================================== Lesson 23 The periodic table: groups, periods and patterns

const GROUPS: [number, string, string][] = [
  [1, 'alkali metals', 'very reactive soft metals that react with water'],
  [2, 'alkaline earth metals', 'reactive metals, less reactive than group 1'],
  [17, 'halogens', 'reactive non-metals that form salts'],
  [18, 'noble gases', 'very unreactive gases'],
]
const tableEntries: Entry[] = [
  m(1, 'period', 'What is a row of the periodic table called?', 'a period', ['a group', 'a family', 'a column'], 'Rows are periods; columns are groups.'),
  m(1, 'group', 'What is a column of the periodic table called?', 'a group', ['a period', 'a row', 'a shell'], 'Columns are groups. Elements in a group have similar properties.'),
  m(1, 'order', 'In what order are the elements arranged in the modern periodic table?', 'by increasing atomic number (number of protons)', ['alphabetically', 'by the date they were discovered', 'by colour'], 'Each element has one more proton than the one before it.'),
  mk(1, () => {
    const [g, name] = pick(GROUPS)
    return { t: 'groupName', q: `What are the elements in group ${b(String(g))} called?`, a: name, w: sample(GROUPS.filter((x) => x[0] !== g).map((x) => x[1]), 2).concat(['transition metals']), why: `Group ${g} elements are the ${name}.` }
  }),
  mk(2, () => {
    // (hydrogen sits above group 1 but is a non-metal gas, not like the alkali metals, so it is left out)
    const e = pick(FIRST20.filter((x) => x.sym !== 'H'))
    return { t: 'whichGroup', q: `${cap(e.name)} (${e.sym}) is in group ${b(String(e.group))}. Which other element has similar properties?`, a: pick(ELEMENTS.filter((x) => x.group === e.group && x.sym !== e.sym && x.sym !== 'H')).name, w: sample(ELEMENTS.filter((x) => x.group !== e.group && x.sym !== 'H'), 3).map((x) => x.name), why: `Elements in the same group (group ${e.group}) have similar properties.`, meta: { sym: e.sym } }
  }),
  mk(2, () => {
    const e = pick(FIRST20)
    return { t: 'periodOf', q: `${cap(e.name)} has ${shells(e.z).length} electron ${shells(e.z).length === 1 ? 'shell' : 'shells'}. Which period is it in?`, n: e.period, why: [`The period number equals the number of electron shells: ${shells(e.z).length}.`], meta: { z: e.z } }
  }),
  m(2, 'noble', 'Why are the noble gases (group 18) so unreactive?', 'their outer electron shell is full', ['they have no electrons', 'they are too heavy', 'they are metals'], 'A full outer shell makes atoms stable, so noble gases rarely react.'),
  m(2, 'reactive1', 'How does the reactivity of the alkali metals (group 1) change down the group?', 'it increases: potassium reacts more violently with water than sodium, and sodium more than lithium', ['it decreases', 'it stays the same', 'they don’t react with water'], 'Going down group 1, the metals become more reactive.'),
  m(2, 'storeOil', 'Why is sodium stored under oil?', 'it reacts quickly with oxygen and water in the air', ['it melts at room temperature', 'it is a gas', 'oil makes it shiny'], 'Alkali metals are so reactive that they must be kept away from air and moisture.'),
  m(3, 'predict', 'Molybdenum (Mo) is in the middle of the periodic table among the metals. What can you predict about it?', 'it is shiny, conducts electricity and is a solid at room temperature', ['it is a gas', 'it is a dull, brittle insulator', 'it is a noble gas'], 'Its position among the metals predicts metallic properties.'),
  m(3, 'predictReact', 'Rubidium is below potassium in group 1. How would you expect it to react with water?', 'even more violently than potassium', ['it would not react', 'more slowly than lithium', 'it would dissolve without reacting'], 'Reactivity increases down group 1, so rubidium is more reactive than potassium.'),
  m(3, 'halogens', 'Fluorine, chlorine, bromine and iodine are in group 17. At room temperature, fluorine and chlorine are gases, bromine is a liquid and iodine is a solid. What pattern does this show?', 'melting and boiling points increase down the group', ['melting points decrease down the group', 'there is no pattern', 'they are all metals'], 'Going down group 17, the boiling points increase, so the state changes from gas to liquid to solid.'),
  m(3, 'heliumGroup', 'Helium has only 2 electrons but is placed in group 18 with neon and argon. Why?', 'like them, its outer shell is full and it is very unreactive', ['it has 18 electrons', 'it is a metal', 'there was no room elsewhere'], 'Helium’s single shell is full with 2 electrons, so it behaves like the other noble gases.'),
  m(3, 'acrossPeriod', 'Going across period 3 from sodium to argon, what is the general pattern?', 'from metals on the left to non-metals on the right', ['from non-metals to metals', 'all are metals', 'all are gases'], 'Each period changes from metallic to non-metallic going left to right.'),
  m(3, 'predictAstatine', 'Astatine is below iodine in group 17. Iodine is a dark solid. What would you predict about astatine?', 'it is a dark solid with a higher melting point than iodine', ['it is a colourless gas', 'it is a shiny metal like sodium', 'it is a noble gas'], 'Melting points increase down group 17, so astatine should be solid.'),
  m(3, 'whyTable', 'Why is the periodic table so useful to scientists?', 'it organises the elements so that properties can be predicted from position', ['it lists elements alphabetically', 'it shows the price of each element', 'it only lists metals'], 'Patterns in the table allow predictions about elements and their compounds.'),
  m(3, 'groupReact', 'Lithium, sodium and potassium are added to water. Potassium reacts most violently. What pattern does this support?', 'reactivity increases down group 1', ['reactivity decreases down group 1', 'all group 1 metals react the same', 'potassium is a noble gas'], 'Going down group 1, the metals become more reactive.'),
]

// ================================================================== Lesson 24 Atomic number, mass number and electron shells

const shellEntries: Entry[] = [
  mk(1, () => {
    const e = pick(FIRST20)
    return { t: 'protons', q: `${cap(e.name)} has atomic number ${b(String(e.z))}. How many protons does an atom of ${e.name} have?`, n: e.z, why: [`The atomic number is the number of protons: ${e.z}.`], meta: { z: e.z } }
  }),
  mk(1, () => {
    const e = pick(FIRST20)
    return { t: 'electrons', q: `How many electrons are in a neutral atom of ${b(e.name)} (atomic number ${e.z})?`, n: e.z, why: [`A neutral atom has as many electrons as protons: ${e.z}.`], meta: { z: e.z } }
  }),
  m(1, 'define', 'What is the atomic number of an element?', 'the number of protons in each atom', ['the number of neutrons', 'the total number of particles', 'the number of shells'], 'The atomic number is the number of protons; it identifies the element.'),
  m(1, 'massNumber', 'What is the mass number of an atom?', 'the number of protons plus neutrons', ['the number of electrons', 'the number of protons only', 'the mass in grams'], 'Mass number = protons + neutrons (the particles in the nucleus).'),
  mk(2, () => {
    const e = pick(FIRST20.filter((x) => x.sym !== 'Cl'))
    return { t: 'neutrons', q: `An atom of ${b(e.name)} has atomic number ${b(String(e.z))} and mass number ${b(String(e.mass))}. How many neutrons does it have?`, n: e.mass - e.z, why: [`neutrons = mass number − atomic number = ${e.mass} − ${e.z} = ${e.mass - e.z}`], meta: { z: e.z, mass: e.mass } }
  }),
  mk(2, () => {
    const e = pick(FIRST20.filter((x) => x.z > 2 && x.z <= 18))
    const right = shells(e.z).join(', ')
    const wrong = [[e.z], [Math.min(e.z, 8), ...(e.z > 8 ? [e.z - 8] : [])], [2, e.z - 2], [1, ...shells(e.z - 1)], [e.z - 1, 1], [1, e.z - 1], [4, e.z - 4], [1, 1, e.z - 2], [3, e.z - 3]]
      .filter((x) => x.every((k) => k > 0))
      .map((x) => x.join(', '))
      .filter((x) => x !== right)
    return { t: 'arrangement', q: `What is the electron arrangement of ${b(e.name)} (atomic number ${e.z})?`, a: right, w: [...new Set(wrong)], why: `Fill shells in order: up to 2 in the first, 8 in the second, 8 in the third: ${right}.`, meta: { z: e.z } }
  }),
  mk(2, () => {
    const e = pick(FIRST20.filter((x) => x.z <= 18 && x.sym !== 'Cl'))
    return { t: 'identify', q: 'Which element is shown in this model?', d: bohr(e.z, e.mass - e.z, 'A model of an atom'), a: e.name, w: sample(FIRST20.filter((x) => Math.abs(x.z - e.z) >= 1 && x.sym !== e.sym), 3).map((x) => x.name), why: `It has ${e.z} protons, so the atomic number is ${e.z}: ${e.name}.`, meta: { z: e.z } }
  }),
  m(2, 'shellMax', 'How many electrons can the first shell hold?', '2', ['8', '18', '1'], 'The first shell holds up to 2 electrons; the next holds up to 8.'),
  mk(3, () => {
    const e = pick(FIRST20.filter((x) => x.z <= 18))
    const outer = shells(e.z)[shells(e.z).length - 1]
    return { t: 'outer', q: `How many electrons are in the outer shell of ${b(e.name)} (atomic number ${e.z})?`, n: outer, why: [`Arrangement ${shells(e.z).join(', ')}: ${outer} in the outer shell.`], meta: { z: e.z } }
  }),
  mk(3, () => {
    const e = pick(FIRST20.filter((x) => x.z > 2 && x.z <= 18 && x.group !== 18))
    const outer = shells(e.z)[shells(e.z).length - 1]
    const same = ELEMENTS.find((x) => x.z <= 18 && x.sym !== e.sym && x.group === e.group)
    const outerOf = (z: number) => shells(z)[shells(z).length - 1]
    return { t: 'groupLink', q: `${cap(e.name)} has the electron arrangement ${b(shells(e.z).join(', '))}. Which element also has ${outer} electron${outer === 1 ? '' : 's'} in its outer shell?`, a: same ? same.name : 'none', w: sample(FIRST20.filter((x) => x.z <= 18 && outerOf(x.z) !== outer), 3).map((x) => x.name), why: `Elements in the same group (group ${e.group}) have the same number of outer electrons.`, meta: { z: e.z } }
  }),
  m(3, 'isotope', 'Two atoms of carbon have 6 neutrons and 8 neutrons. What stays the same?', 'the number of protons (6), so both are carbon', ['the mass number', 'the number of neutrons', 'nothing'], 'Atoms of the same element always have the same number of protons; different neutron numbers make isotopes.'),
]

// ================================================================== Lesson 25 Elements in compounds

const COMPOUNDS: { name: string; f: string; els: string[]; atoms: number }[] = [
  { name: 'water', f: 'H2O', els: ['hydrogen', 'oxygen'], atoms: 3 },
  { name: 'carbon dioxide', f: 'CO2', els: ['carbon', 'oxygen'], atoms: 3 },
  { name: 'methane', f: 'CH4', els: ['carbon', 'hydrogen'], atoms: 5 },
  { name: 'ammonia', f: 'NH3', els: ['nitrogen', 'hydrogen'], atoms: 4 },
  { name: 'sodium chloride (table salt)', f: 'NaCl', els: ['sodium', 'chlorine'], atoms: 2 },
  { name: 'calcium carbonate (chalk)', f: 'CaCO3', els: ['calcium', 'carbon', 'oxygen'], atoms: 5 },
  { name: 'glucose', f: 'C6H12O6', els: ['carbon', 'hydrogen', 'oxygen'], atoms: 24 },
  { name: 'sulfuric acid', f: 'H2SO4', els: ['hydrogen', 'sulfur', 'oxygen'], atoms: 7 },
  { name: 'magnesium oxide', f: 'MgO', els: ['magnesium', 'oxygen'], atoms: 2 },
  { name: 'iron oxide (rust)', f: 'Fe2O3', els: ['iron', 'oxygen'], atoms: 5 },
]
const compoundEntries: Entry[] = [
  mk(1, () => {
    const c = pick(COMPOUNDS)
    const wrongSets = [['hydrogen', 'helium'], ['carbon', 'nitrogen'], ['oxygen', 'osmium'], ['sodium', 'sulfur'], ['calcium', 'chlorine'], ['nitrogen', 'oxygen']].map((x) => x.join(' and '))
    return { t: 'elements', q: `Which elements make up ${b(c.name)}, ${chem(c.f)}?`, a: c.els.length === 2 ? c.els.join(' and ') : `${c.els[0]}, ${c.els[1]} and ${c.els[2]}`, w: wrongSets.filter((x) => x !== c.els.join(' and ')), why: `${chem(c.f)} contains ${c.els.join(', ')}.`, meta: { f: c.f } }
  }),
  m(1, 'formula', 'What does a chemical formula show?', 'which elements are in a substance and how many atoms of each', ['the colour of a substance', 'how to make a substance', 'the state of a substance'], 'For example, H₂O has 2 hydrogen atoms and 1 oxygen atom.'),
  m(1, 'subscript', 'In H₂O, what does the small 2 mean?', 'there are 2 hydrogen atoms', ['there are 2 oxygen atoms', 'there are 2 molecules', 'the water is at 2 °C'], 'The subscript after a symbol gives the number of atoms of that element.'),
  m(1, 'oneAtom', 'In CO₂, how many carbon atoms are there?', '1', ['2', '3', '0'], 'No number after C means one carbon atom.'),
  mk(2, () => {
    const c = pick(COMPOUNDS)
    return { t: 'totalAtoms', q: `How many atoms altogether are in one molecule (or formula unit) of ${b(chem(c.f))}?`, n: c.atoms, why: [`Add the numbers of atoms of each element in ${chem(c.f)}: ${c.atoms}.`], meta: { f: c.f } }
  }),
  mk(2, () => {
    const c = pick(COMPOUNDS.filter((x) => /\d/.test(x.f)))
    const parts = [...c.f.matchAll(/([A-Z][a-z]?)(\d*)/g)].map((mm) => [mm[1], Number(mm[2] || '1')] as [string, number])
    const [sym, n] = pick(parts)
    return { t: 'countOne', q: `How many ${b(el(sym)?.name ?? sym)} atoms are in ${b(chem(c.f))}?`, n, why: [`In ${chem(c.f)}, ${sym} is followed by ${n === 1 ? 'no number, meaning 1' : n}.`], meta: { f: c.f, sym } }
  }),
  m(2, 'elementOrCompound', 'Which of these formulas represents an element, not a compound?', 'O₂', ['CO₂', 'H₂O', 'NaCl'], 'O₂ contains only oxygen atoms, so it is an element (made of molecules).'),
  m(2, 'twoO', 'CO is carbon monoxide and CO₂ is carbon dioxide. Why are they different substances?', 'they have different numbers of oxygen atoms, so they are different compounds with different properties', ['they are the same substance', 'one is an element', 'they contain different elements'], 'Changing the number of atoms makes a different compound: CO is poisonous, CO₂ is breathed out.'),
  mk(3, () => {
    const n = int(2, 5)
    return { t: 'manyMolecules', q: `How many hydrogen atoms are in ${b(`${n} molecules of water (H₂O)`)}?`, n: 2 * n, why: [`Each H₂O has 2 hydrogen atoms; ${n} × 2 = ${2 * n}.`], meta: { n } }
  }),
  m(3, 'sucrose', 'Table sugar is C₁₂H₂₂O₁₁. How many atoms are in one molecule?', '45', ['3', '35', '12'], '12 + 22 + 11 = 45 atoms.'),
  m(3, 'ratio', 'In methane, CH₄, what is the ratio of carbon atoms to hydrogen atoms?', '1 : 4', ['4 : 1', '1 : 1', '1 : 5'], 'One carbon atom for every four hydrogen atoms.'),
  m(3, 'CO_CO2', 'How many more oxygen atoms are in one molecule of CO₂ than in one molecule of CO?', '1', ['2', '0', '3'], 'CO₂ has 2 oxygen atoms; CO has 1.'),
  m(3, 'glucoseH', 'How many hydrogen atoms are in one molecule of glucose, C₆H₁₂O₆?', '12', ['6', '24', '1'], 'The subscript after H is 12.'),
]

// ================================================================== Lesson 26 Identifying elements and the history of the periodic table

const FLAMES: [string, string][] = [
  ['sodium', 'yellow-orange'],
  ['potassium', 'lilac (light purple)'],
  ['lithium', 'red (crimson)'],
  ['copper', 'blue-green'],
  ['calcium', 'orange-red'],
]
const testEntries: Entry[] = [
  mk(1, () => {
    const [metal, colour] = pick(FLAMES)
    return { t: 'flame', q: `What colour flame does a compound of ${b(metal)} give in a flame test?`, a: colour, w: sample(FLAMES.filter((x) => x[0] !== metal).map((x) => x[1]), 3), why: `${cap(metal)} compounds give a ${colour} flame.` }
  }),
  mk(1, () => {
    const [metal, colour] = pick(FLAMES)
    return { t: 'flameBack', q: `A compound gives a ${b(colour)} flame. Which metal does it contain?`, a: metal, w: sample(FLAMES.filter((x) => x[0] !== metal).map((x) => x[0]), 3), why: `A ${colour} flame shows ${metal}.` }
  }),
  m(1, 'pop', 'A lit splint held at the mouth of a test tube of gas makes a squeaky “pop”. Which gas is present?', 'hydrogen', ['oxygen', 'carbon dioxide', 'nitrogen'], 'Hydrogen burns with a squeaky pop.'),
  m(1, 'glowing', 'A glowing splint bursts back into flame in a test tube of gas. Which gas is it?', 'oxygen', ['hydrogen', 'carbon dioxide', 'helium'], 'Oxygen relights a glowing splint.'),
  m(1, 'mendeleev', 'Who is usually credited with creating the first useful periodic table, in 1869?', 'Dmitri Mendeleev', ['Isaac Newton', 'Marie Curie', 'John Dalton'], 'Mendeleev arranged the 63 elements then known into a table.'),
  m(2, 'fireworks', 'How do fireworks get their different colours?', 'they contain compounds of different metals, which give different flame colours', ['they are painted', 'the paper burns in colours', 'the sky changes their colour'], 'Fireworks use the same idea as flame tests: strontium for red, copper for blue-green, sodium for yellow.'),
  m(2, 'gaps', 'Mendeleev left gaps in his table. Why?', 'he predicted there were elements not yet discovered that would fit there', ['he made mistakes', 'he ran out of room', 'the gaps were for gases'], 'He trusted the patterns and left spaces for undiscovered elements.'),
  m(2, 'predictions', 'Gallium and germanium were discovered after Mendeleev predicted their properties. Why was this important?', 'their properties matched his predictions, which was strong evidence that his table was right', ['it proved elements can be invented', 'it showed his table was wrong', 'it was not important'], 'Successful predictions are powerful evidence for a scientific idea.'),
  m(2, 'cleanWire', 'Why must the wire loop be cleaned between flame tests?', 'so traces of the last compound don’t affect the next flame colour', ['to make it hotter', 'so it doesn’t melt', 'to make the colour brighter'], 'Contamination from the previous sample would give a mixed or wrong colour.'),
  m(3, 'modern', 'Mendeleev ordered elements mostly by atomic mass. What is the modern table ordered by, and who showed this?', 'atomic number (protons), shown by Henry Moseley in 1913', ['atomic mass, by Rutherford', 'date of discovery, by Bohr', 'alphabetical order, by IUPAC'], 'Moseley’s X-ray experiments showed atomic number is the true basis of the table.'),
  m(3, 'swap', 'Mendeleev put iodine after tellurium even though iodine has a smaller atomic mass. Why?', 'iodine’s properties matched the group with chlorine and bromine', ['he made a mistake', 'tellurium is a gas', 'iodine was discovered later'], 'He placed elements by their properties, which later fitted atomic number order.'),
  m(3, 'limewater', 'A gas turns limewater milky. Which gas is it?', 'carbon dioxide', ['oxygen', 'hydrogen', 'nitrogen'], 'Carbon dioxide reacts with limewater to make tiny particles of chalk, turning it milky.'),
  m(2, 'strontium', 'Red fireworks often contain compounds of strontium. Which test would identify strontium in a lab?', 'a flame test (strontium gives a red flame)', ['the pop test', 'the limewater test', 'the glowing splint test'], 'Flame tests identify many metals by colour.'),
  m(2, 'popWhy', 'Why does hydrogen make a pop when lit?', 'it burns quickly with oxygen in the air, making water', ['it explodes into nothing', 'it freezes', 'it turns into helium'], 'Hydrogen + oxygen → water; the fast reaction makes the pop.'),
  m(2, 'splintMethod', 'How do you do the glowing splint test?', 'light a splint, blow it out so it glows, then put it into the test tube of gas', ['put a lit splint under water', 'heat the test tube until it glows', 'add limewater to the splint'], 'If the glowing splint relights, the gas is oxygen.'),
  m(2, 'mendeleevOrder', 'How did Mendeleev mainly order the elements?', 'by atomic mass, grouping elements with similar properties', ['alphabetically', 'by colour', 'by the date of discovery'], 'He ordered by atomic mass but put similar elements into the same columns.'),
  m(3, 'mixedFlame', 'A flame test gives a yellow-orange flame that hides any other colour. Why can sodium be a problem in flame tests?', 'sodium’s strong colour can mask other metals, and sodium is a common contaminant', ['sodium does not give a colour', 'sodium puts the flame out', 'sodium makes every flame blue'], 'Tiny traces of sodium (even from fingers) give a strong yellow.'),
  m(3, 'noble', 'The noble gases weren’t in Mendeleev’s first table. What happened when they were discovered?', 'a whole new group was added, and it fitted the pattern of the table', ['the table was thrown away', 'they were put with the metals', 'they were not counted as elements'], 'The table was flexible enough to add group 18.'),
  m(3, 'spectroscope', 'Astronomers know which elements are in the Sun even though no one has visited it. How?', 'each element gives out or absorbs its own colours of light, which can be analysed', ['they collected a sample', 'the Sun is made of one element', 'by its temperature only'], 'Like flame tests, light from stars shows which elements are present (helium was discovered this way).'),
  m(3, 'gaPredict', 'Mendeleev predicted that “eka-aluminium” would be a metal with a low melting point. Gallium melts in your hand. What does this show?', 'his prediction, based on the table’s patterns, was confirmed', ['his table was wrong', 'gallium is not an element', 'predictions are guesses'], 'Confirmed predictions supported the periodic table.'),
]

const HINTS = {
  around: 'Think about where you have seen the element and which property makes it useful.',
  kind: 'Metals: shiny, conduct, malleable. Non-metals: dull, insulators, brittle. Metalloids: in between.',
  uses: 'Uses depend on properties (strength, density, corrosion, conductivity) and on cost and availability.',
  sub: 'Protons (+) and neutrons (0) are in the nucleus; electrons (−) move around it.',
  models: 'Dalton → Thomson → Rutherford → Bohr; each change came from new evidence.',
  symbols: 'One or two letters; the first is a capital. Some come from Latin names.',
  table: 'Rows are periods, columns are groups. Groups have similar properties.',
  shells: 'Atomic number = protons = electrons (neutral atom). Neutrons = mass number − atomic number. Shells hold 2, 8, 8.',
  compounds: 'Each capital letter starts a new element; a small number after a symbol counts its atoms.',
  tests: 'Flame colours identify metals; pop for hydrogen; glowing splint for oxygen; limewater for carbon dioxide.',
}

export const ATOM_SKILLS: Skill[] = [
  {
    id: 'sci7-elements-around',
    lessonNo: 17,
    title: 'Elements around us',
    outcomes: [PRT],
    summary: 'Common elements in everyday objects and why they are used.',
    learn: {
      intro: `<p>An <b>element</b> is a pure substance made of only one kind of atom. There are 118 known elements, and everything around us is made from them, either alone or combined.</p><ul><li>Aluminium: soft-drink cans and foil</li><li>Carbon (graphite): the “lead” in pencils</li><li>Copper: electrical wires</li><li>Gold: jewellery</li><li>Silicon: computer chips</li><li>Tungsten: old light-bulb filaments</li><li>Helium: floating balloons</li></ul>`,
      keyPoints: ['Every element appears once on the periodic table.', 'Each element is used because of its properties.', 'Unreactive elements such as gold can be found pure; reactive ones are found in compounds.'],
      vocab: [
        ['element', 'a pure substance made of one kind of atom'],
        ['property', 'a feature of a substance, such as colour, conductivity or melting point'],
      ],
    },
    gen: bank(HINTS.around, aroundEntries),
    levels: { 1: 'Elements in everyday objects; recognising elements', 2: 'Why elements are used; elements in air and rocks', 3: 'Abundance, structure and why many elements are needed' },
  },
  {
    id: 'sci7-metals',
    lessonNo: 18,
    title: 'Metals, non-metals and metalloids',
    outcomes: [PRT, 'SC4-WS-06'],
    summary: 'Compare the physical properties of metals, non-metals and metalloids.',
    learn: {
      intro: `<p>Elements can be grouped by their physical properties.</p><ul><li><b>Metals</b> (e.g. iron, copper, aluminium) are shiny (lustrous), good conductors of heat and electricity, <b>malleable</b> and <b>ductile</b>, and mostly solids with high melting points (mercury is a liquid).</li><li><b>Non-metals</b> (e.g. oxygen, sulfur, carbon) are dull, poor conductors (insulators), brittle when solid, and many are gases.</li><li><b>Metalloids</b> (e.g. boron, silicon) have some properties of each; silicon is a semiconductor.</li></ul><p>On the periodic table, metals are on the left and in the middle, non-metals on the right, and metalloids along the staircase line between them.</p>`,
      keyPoints: ['Test for lustre, conductivity, malleability and melting point to classify an element.', 'There are exceptions: graphite (carbon) conducts electricity.', 'Most elements are metals.'],
      vocab: [
        ['lustre', 'shininess'],
        ['malleable', 'can be hammered into shape'],
        ['ductile', 'can be drawn into a wire'],
        ['conductor', 'lets heat or electricity pass through easily'],
      ],
    },
    gen: bank(HINTS.kind, kindEntries),
    levels: { 1: 'Classifying elements and naming typical properties', 2: 'Identifying unknown elements from test results; metalloids', 3: 'Planning fair comparisons; using properties to explain designs' },
  },
  {
    id: 'sci7-uses',
    lessonNo: 19,
    title: 'Properties and uses of materials',
    outcomes: [PRT],
    summary: 'How the properties of elements, compounds and alloys decide their uses.',
    learn: {
      intro: `<p>We choose materials for their properties. Aluminium is light, soft, malleable and does not corrode, so it is used in cans, utensils and aircraft. Copper conducts electricity and is ductile, so it is used for wires.</p><p>An <b>alloy</b> is a mixture of a metal with other elements, made to improve its properties: steel (iron and carbon) is stronger than iron; bronze (copper and tin) is harder than copper; stainless steel (iron, chromium, nickel) does not rust.</p><p>Uses also change as scientists learn more: lead was removed from paint and petrol once its toxicity was understood. Cost and availability matter too.</p>`,
      keyPoints: ['Use = properties + cost + availability + safety.', 'Alloys usually have better properties than the pure metal.', 'A compound’s properties differ from those of its elements.'],
      vocab: [
        ['alloy', 'a mixture of a metal with other elements'],
        ['corrosion', 'the slow wearing away of a metal by reaction, such as rusting'],
      ],
    },
    gen: bank(HINTS.uses, usesEntries),
    levels: { 1: 'Alloys and simple uses', 2: 'Explaining choices of material; compounds vs elements', 3: 'Choosing materials; how new understanding changes uses' },
  },
  {
    id: 'sci7-atoms',
    lessonNo: 20,
    title: 'Atoms and subatomic particles',
    outcomes: [PRT],
    summary: 'Protons, neutrons and electrons: where they are, their charge and their mass.',
    learn: {
      intro: `<p>An <b>atom</b> is the smallest unit of an element that keeps the properties of that element. Atoms are made of three <b>subatomic particles</b>:</p><div class="tablewrap"><table class="dtable"><thead><tr><th>Particle</th><th>Where</th><th>Charge</th><th>Relative mass</th></tr></thead><tbody><tr><th>Proton</th><td>nucleus</td><td>+1</td><td>1</td></tr><tr><th>Neutron</th><td>nucleus</td><td>0</td><td>1</td></tr><tr><th>Electron</th><td>shells around the nucleus</td><td>−1</td><td>about 1/1840</td></tr></tbody></table></div>${bohr(6, 6, 'A model of a carbon atom')}<p>In the planetary model, the tiny nucleus holds almost all the mass and the electrons move around it in shells. Most of an atom is empty space. A neutral atom has equal numbers of protons and electrons.</p>`,
      keyPoints: ['Protons +, electrons −, neutrons no charge.', 'Protons and neutrons are in the nucleus; electrons are in shells around it.', 'Equal protons and electrons → no overall charge.'],
      vocab: [
        ['nucleus', 'the tiny, dense centre of an atom'],
        ['proton', 'a positive particle in the nucleus'],
        ['neutron', 'a particle with no charge in the nucleus'],
        ['electron', 'a tiny negative particle that moves around the nucleus'],
      ],
    },
    gen: bank(HINTS.sub, subEntries),
    levels: { 1: 'Charge and location of each particle', 2: 'Relative mass; neutral atoms; counting electrons in a model', 3: 'Scale of the atom; attraction; overall charge' },
  },
  {
    id: 'sci7-atom-models',
    lessonNo: 21,
    title: 'Models of the atom',
    outcomes: [PRT],
    summary: 'How models of the atom changed from Dalton to Bohr as new evidence and technologies appeared.',
    learn: {
      intro: `<ul><li><b>Dalton (1803):</b> atoms are tiny solid spheres that can’t be divided.</li><li><b>Thomson (1897–1904):</b> discovered the electron with a cathode ray tube; proposed the “plum pudding” model, electrons dotted through a positive sphere.</li><li><b>Rutherford (1911):</b> fired alpha particles at gold foil. Most went straight through (mostly empty space); a few bounced back (a tiny, dense, positive nucleus).</li><li><b>Bohr (1913):</b> electrons travel in fixed shells (energy levels) around the nucleus: the planetary model.</li><li><b>Chadwick (1932):</b> discovered the neutron.</li></ul><p>Each model changed because new experiments and technologies gave evidence the old model could not explain. Today scientists use an electron-cloud model, and scanning tunnelling microscopes can image individual atoms.</p>`,
      keyPoints: ['Dalton → Thomson → Rutherford → Bohr → Chadwick.', 'Models change when new evidence doesn’t fit.', 'A simpler model is still useful when it explains what we need.'],
      vocab: [
        ['model', 'a simplified representation used to explain and predict'],
        ['alpha particle', 'a small, positive particle given off by some radioactive substances'],
      ],
    },
    gen: bank(HINTS.models, modelEntries),
    levels: { 1: 'Matching scientists, models and dates', 2: 'Interpreting the gold foil experiment; technologies', 3: 'Why models are accepted, kept or replaced' },
  },
  {
    id: 'sci7-symbols',
    lessonNo: 22,
    title: 'Element symbols',
    outcomes: [PRT],
    summary: 'The symbols of common elements, including those from Latin names.',
    learn: {
      intro: `<p>Every element has a one- or two-letter <b>symbol</b> used by scientists around the world. The first letter is always a capital and any second letter is lower case: C is carbon, Ca is calcium, Mg is magnesium.</p><p>Some symbols come from older (often Latin) names:</p><div class="tablewrap"><table class="dtable"><thead><tr><th>Element</th><th>Symbol</th><th>From</th></tr></thead><tbody>${LATIN.map(([s, n, l]) => `<tr><td>${n}</td><td>${s}</td><td>${l}</td></tr>`).join('')}</tbody></table></div>`,
      keyPoints: ['Capital then lower case: Co is cobalt, but CO is carbon monoxide.', 'A capital letter always starts a new element in a formula.', 'Learn the symbols of the first 20 elements.'],
      vocab: [['chemical symbol', 'the one- or two-letter abbreviation for an element']],
    },
    gen: bank(HINTS.symbols, symbolEntries),
    levels: { 1: 'Symbols and names of the first 20 elements', 2: 'Latin-based symbols; reading symbols correctly', 3: 'Elements in formulas; how names are decided' },
  },
  {
    id: 'sci7-periodic-table',
    lessonNo: 23,
    title: 'The periodic table',
    outcomes: [PRT, 'SC4-WS-06'],
    summary: 'Groups, periods and patterns, including reactivity, and predicting properties.',
    learn: {
      intro: `<p>The <b>periodic table</b> arranges the elements in order of increasing atomic number. Rows are <b>periods</b>; columns are <b>groups</b>. Elements in the same group have similar properties.</p><ul><li>Group 1, the <b>alkali metals</b> (lithium, sodium, potassium): soft, very reactive metals; reactivity increases down the group.</li><li>Group 2, the <b>alkaline earth metals</b> (magnesium, calcium).</li><li>Group 17, the <b>halogens</b> (fluorine, chlorine, bromine, iodine): reactive non-metals.</li><li>Group 18, the <b>noble gases</b> (helium, neon, argon): very unreactive.</li></ul><p>Because of these patterns, an element’s position lets us predict its properties.</p>`,
      keyPoints: ['Period number = number of electron shells.', 'Same group → similar properties (same number of outer electrons).', 'Metals on the left, non-metals on the right.'],
      vocab: [
        ['period', 'a row of the periodic table'],
        ['group', 'a column of the periodic table'],
        ['reactivity', 'how easily a substance takes part in chemical reactions'],
      ],
    },
    gen: bank(HINTS.table, tableEntries),
    levels: { 1: 'Groups, periods and order of the table; group names', 2: 'Similar elements, periods and reactivity of groups 1 and 18', 3: 'Predicting properties from position and trends' },
  },
  {
    id: 'sci7-shells',
    lessonNo: 24,
    title: 'Atomic number and electron shells',
    outcomes: [PRT, 'SC4-WS-05'],
    summary: 'Use atomic and mass numbers, and model the electron arrangement of the first 18 elements.',
    learn: {
      intro: `<ul><li><b>Atomic number</b> = number of protons (= number of electrons in a neutral atom).</li><li><b>Mass number</b> = protons + neutrons, so neutrons = mass number − atomic number.</li><li>Electrons fill shells from the inside out: up to <b>2</b> in the first shell, <b>8</b> in the second and <b>8</b> in the third (for the first 18 elements).</li></ul>${bohr(11, 12, 'A model of a sodium atom')}<p>Sodium (atomic number 11, mass number 23): 11 protons, 23 − 11 = 12 neutrons, 11 electrons arranged 2, 8, 1.</p>`,
      keyPoints: ['The number of shells is the period number.', 'The number of outer electrons links to the group (1 outer electron for group 1).', 'Atomic structure changes in a regular way as atomic number increases.'],
      vocab: [
        ['atomic number', 'the number of protons in an atom'],
        ['mass number', 'the number of protons plus neutrons'],
        ['electron shell', 'an energy level that electrons occupy around the nucleus'],
      ],
    },
    gen: bank(HINTS.shells, shellEntries),
    levels: { 1: 'Protons and electrons from the atomic number', 2: 'Neutrons; electron arrangements; identifying an atom from a model', 3: 'Outer electrons, groups and isotopes' },
  },
  {
    id: 'sci7-compounds',
    lessonNo: 25,
    title: 'Elements in compounds',
    outcomes: [PRT],
    summary: 'Use the periodic table and formulas to identify the elements and atoms in common compounds.',
    learn: {
      intro: `<p>A <b>chemical formula</b> shows which elements are in a substance and how many atoms of each.</p><ul><li>Water, H₂O: 2 hydrogen atoms and 1 oxygen atom.</li><li>Methane, CH₄: 1 carbon atom and 4 hydrogen atoms.</li><li>Carbon dioxide, CO₂: 1 carbon atom and 2 oxygen atoms.</li></ul><p>Each capital letter starts a new element. A small number after a symbol (a subscript) is the number of atoms of that element; no number means one.</p>`,
      keyPoints: ['Count capital letters to count elements.', 'Add the subscripts (1 if none) to count atoms.', 'Changing the numbers changes the substance: CO and CO₂ are different compounds.'],
      vocab: [
        ['chemical formula', 'symbols and numbers showing the atoms in a substance'],
        ['molecule', 'a group of atoms joined together'],
        ['subscript', 'a small number written below the line'],
      ],
    },
    gen: bank(HINTS.compounds, compoundEntries),
    levels: { 1: 'Elements in common compounds; reading subscripts', 2: 'Counting atoms; elements versus compounds in formulas', 3: 'Atoms in several molecules; large formulas; ratios' },
  },
  {
    id: 'sci7-tests-history',
    lessonNo: 26,
    title: 'Identifying elements and the history of the periodic table',
    outcomes: [PRT],
    summary: 'Flame tests and gas tests, and how Mendeleev built the periodic table.',
    learn: {
      intro: `<p><b>Tests for elements:</b> in a <b>flame test</b>, a clean wire loop with a compound is held in a hot flame; some metals give a characteristic colour (sodium yellow-orange, potassium lilac, lithium red, copper blue-green, calcium orange-red). Hydrogen burns with a squeaky <b>pop</b>; oxygen relights a <b>glowing splint</b>; carbon dioxide turns <b>limewater</b> milky.</p><p><b>History:</b> in 1869 <b>Dmitri Mendeleev</b> arranged the known elements by atomic mass and properties. He left gaps for undiscovered elements and predicted their properties; when gallium and germanium were found and matched, his table was accepted. In 1913 Henry Moseley showed the elements are best ordered by atomic number.</p>`,
      keyPoints: ['Flame colours identify some metals.', 'Pop: hydrogen. Glowing splint relights: oxygen. Limewater milky: carbon dioxide.', 'Successful predictions are strong evidence for a scientific idea.'],
      vocab: [
        ['flame test', 'identifying a metal by the colour it gives a flame'],
        ['limewater', 'a solution that turns milky with carbon dioxide'],
      ],
    },
    gen: bank(HINTS.tests, testEntries),
    levels: { 1: 'Flame colours; tests for gases; Mendeleev', 2: 'Fireworks; Mendeleev’s gaps and predictions; method', 3: 'Atomic number order, Moseley and limewater' },
  },
]
