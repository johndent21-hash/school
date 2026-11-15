// Year 7 chemistry, Lessons 1–8: states of matter, the particle model, changes of state, heating water, the properties
// of water and density. NSW Science 7–10 Syllabus (2023), Stage 4 focus area Solutions and mixtures (SC4-SOL-01):
// "Properties of matter" and "Properties of water"; Working scientifically SC4-WS-03, SC4-WS-04, SC4-WS-06.
// The questions are written for this site (no textbook); data are rounded values such as those in the NESA Data Book.
import type { Skill } from '@/lib/maths/types'
import { chance, int, pick, sample, shuffle } from '../helpers'
import { type Box, type Entry, LETTERS, b, bank, fourBoxes, heatingCurve, m, mk, nf, particleBox } from './kit'

export const SOL = 'SC4-SOL-01'

const WATER_FORMS: [string, 'solid' | 'liquid' | 'gas'][] = [
  ['ice on a frozen lake', 'solid'],
  ['snow on a mountain', 'solid'],
  ['a glacier', 'solid'],
  ['hail', 'solid'],
  ['rain', 'liquid'],
  ['the ocean', 'liquid'],
  ['a river', 'liquid'],
  ['dew on grass in the morning', 'liquid'],
  ['water vapour in the air', 'gas'],
  ['steam from a boiling kettle (before it turns to mist)', 'gas'],
  ['the invisible water vapour breathed out', 'gas'],
]
const THINGS: [string, 'solid' | 'liquid' | 'gas'][] = [
  ['a brick', 'solid'],
  ['a copper coin', 'solid'],
  ['sand grains', 'solid'],
  ['an ice cube', 'solid'],
  ['olive oil', 'liquid'],
  ['milk', 'liquid'],
  ['honey', 'liquid'],
  ['mercury in an old thermometer', 'liquid'],
  ['the helium in a balloon', 'gas'],
  ['carbon dioxide in a soft-drink bubble', 'gas'],
  ['the oxygen we breathe', 'gas'],
  ['neon in a sign', 'gas'],
]
const STATE_FACTS: Record<'solid' | 'liquid' | 'gas', { shape: string; volume: string; flow: string }> = {
  solid: { shape: 'a fixed shape', volume: 'a fixed volume', flow: 'cannot flow' },
  liquid: { shape: 'takes the shape of its container', volume: 'a fixed volume', flow: 'can flow' },
  gas: { shape: 'takes the shape of its container', volume: 'spreads out to fill its whole container', flow: 'can flow' },
}

// ================================================================== Lesson 1 States of matter

const statesEntries: Entry[] = [
  mk(1, () => {
    const [thing, state] = pick(WATER_FORMS)
    return { t: 'water', q: `What state of matter is the water in ${b(thing)}?`, a: state, w: ['solid', 'liquid', 'gas'].filter((s) => s !== state).concat(['plasma']), why: `${thing[0].toUpperCase() + thing.slice(1)} is water as a ${state}.` }
  }),
  mk(1, () => {
    const [thing, state] = pick(THINGS)
    return { t: 'thing', q: `At room temperature, what state of matter is ${b(thing)}?`, a: state, w: ['solid', 'liquid', 'gas'].filter((s) => s !== state).concat(['a mixture of all three']), why: `${thing[0].toUpperCase() + thing.slice(1)} is a ${state} at room temperature.` }
  }),
  m(1, 'three', 'What are the three main states of matter?', 'solid, liquid and gas', ['solid, liquid and water', 'ice, water and steam only', 'hot, warm and cold', 'metal, wood and plastic'], 'The three main states of matter are solid, liquid and gas.'),
  m(1, 'fixedShape', 'Which state of matter has a fixed shape?', 'solid', ['liquid', 'gas', 'all three states'], 'Only a solid keeps its own shape; liquids and gases take the shape of their container.'),
  m(1, 'fills', 'Which state of matter spreads out to fill the whole of any container it is in?', 'gas', ['solid', 'liquid', 'none of them'], 'A gas has no fixed volume: it spreads to fill its container.'),
  m(1, 'flow', 'Which states of matter can flow?', 'liquids and gases', ['solids only', 'liquids only', 'solids and liquids'], 'Liquids and gases can flow; solids cannot.'),
  m(1, 'waterNames', 'Water can be a solid, a liquid or a gas. What are the everyday names for these?', 'ice, water and water vapour (steam)', ['snow, rain and cloud', 'ice, steam and mist', 'frost, dew and fog'], 'Solid water is ice, liquid water is water, and water as a gas is water vapour (steam).'),
  m(1, 'cloud', 'The white cloud you see above a boiling kettle is mostly…', 'tiny droplets of liquid water', ['water vapour (a gas)', 'smoke', 'air from inside the kettle'], 'Water vapour is invisible. The white cloud is water vapour that has cooled and condensed into tiny liquid droplets.'),
  mk(2, () => {
    const s = pick(['solid', 'liquid', 'gas'] as const)
    const fct = STATE_FACTS[s]
    return {
      t: 'describe',
      q: `Which description fits a ${b(s)}?`,
      a: `${fct.shape}; ${fct.volume}; ${fct.flow}`,
      w: (['solid', 'liquid', 'gas'] as const)
        .filter((x) => x !== s)
        .map((x) => `${STATE_FACTS[x].shape}; ${STATE_FACTS[x].volume}; ${STATE_FACTS[x].flow}`)
        .concat([`a fixed shape; spreads out to fill its whole container; can flow`]),
      why: `A ${s}: ${fct.shape}, ${fct.volume}, and it ${fct.flow}.`,
    }
  }),
  m(2, 'squash', 'A syringe is sealed at the end. Which can you squash (compress) into a smaller space by pushing the plunger?', 'air (a gas)', ['water (a liquid)', 'sand packed tightly (a solid)', 'all of them equally'], 'Gas particles are far apart, so a gas can be compressed. Liquids and solids hardly compress at all.'),
  m(2, 'cycle', 'In the water cycle, water evaporates from the ocean. What state is it in just after it evaporates?', 'gas (water vapour)', ['liquid', 'solid', 'a mixture of salt and water'], 'Evaporation turns liquid water into water vapour, a gas.'),
  m(2, 'cycle2', 'Water vapour high in the sky cools and forms clouds. What change of state happens?', 'condensation: gas to liquid', ['evaporation: liquid to gas', 'melting: solid to liquid', 'freezing: liquid to solid'], 'Clouds are tiny droplets of liquid water formed when water vapour cools and condenses.'),
  m(2, 'sand', 'Sand can be poured like a liquid. Why is sand still a solid?', 'each grain keeps its own shape and volume', ['it is heavy', 'it is found on beaches', 'it can be wet'], 'Sand pours because it is many small grains, but each grain is a solid with a fixed shape and volume.'),
  m(2, 'perfume', 'Someone sprays perfume in one corner of a room. Soon it can be smelled across the room. This shows that gases…', 'spread out to fill the space they are in', ['have a fixed volume', 'cannot flow', 'are heavier than air'], 'Gas particles move freely and spread out (diffuse) to fill the room.'),
  m(2, 'honey', 'Honey and water are both liquids. Honey flows more slowly. Which statement is true?', 'both take the shape of their container but honey is more viscous', ['honey is a solid because it is thick', 'water is a gas because it flows quickly', 'honey has no fixed volume'], 'Both are liquids. A thick, slow-flowing liquid is called viscous; it is still a liquid.'),
  m(3, 'jelly', 'A student says “toothpaste is a liquid because it flows when squeezed”. What is the best response?', 'it flows only when pushed and keeps its shape on the brush, so it does not fit neatly into one state', ['she is right: anything that moves is a liquid', 'toothpaste is a gas because it has bubbles', 'toothpaste is a solid because it is white'], 'Some substances, like toothpaste, gels and foams, have properties of more than one state. Scientists use the properties to decide.'),
  m(3, 'balloon', 'A balloon is filled with air in a warm room and taken outside on a cold night. It gets smaller. Why?', 'the air particles move more slowly and take up less space', ['air leaks out of all balloons at night', 'the air turns into a liquid', 'the rubber gets bigger'], 'Cooling a gas slows its particles, so it presses less on the balloon and the balloon shrinks.'),
  m(3, 'classify', 'A substance has a fixed volume but takes the shape of any container it is poured into. What state is it in, and how do you know?', 'liquid, because liquids have a fixed volume but no fixed shape', ['gas, because it takes the container’s shape', 'solid, because it has a fixed volume', 'it cannot be decided'], 'A fixed volume rules out a gas; no fixed shape rules out a solid. So it is a liquid.'),
  m(3, 'gasMass', 'An empty basketball is weighed, then pumped full of air and weighed again. What will the second reading show?', 'a little more, because air has mass', ['exactly the same, because air weighs nothing', 'less, because air makes things float', 'it cannot be measured'], 'Air is matter: it has mass and takes up space, so the pumped ball is slightly heavier.'),
  m(3, 'matter', 'Which of these is NOT matter?', 'light from a torch', ['air', 'steam', 'a grain of salt'], 'Matter has mass and takes up space. Light is a form of energy, not matter.'),
  m(3, 'glass', 'A scientist says glass is a solid even though very old window panes are sometimes thicker at the bottom. Which property best supports calling glass a solid?', 'it keeps its own shape and volume and does not flow at room temperature over a human lifetime', ['it is see-through', 'it is made from sand', 'it breaks easily'], 'A solid keeps a fixed shape and volume; the thicker bottoms came from how old glass was made, not from flowing.'),
  m(3, 'syringeWater', 'A sealed syringe full of water cannot be pushed in, but a sealed syringe full of air can. What does this show about the states?', 'gases can be compressed but liquids cannot (or hardly)', ['water is a solid', 'air has no mass', 'liquids are always compressible'], 'Only a gas has large spaces between particles to squash.'),
  m(3, 'mercury', 'Mercury is a metal that flows and takes the shape of its container but keeps the same volume. What state is it at room temperature?', 'liquid', ['solid, because it is a metal', 'gas, because it flows', 'it has no state'], 'Fixed volume, no fixed shape and able to flow: a liquid.'),
  m(3, 'steamInvisible', 'Just above the spout of a boiling kettle there is a small clear gap before the white cloud starts. What is in the clear gap?', 'invisible water vapour (a gas)', ['nothing at all', 'air only', 'ice crystals'], 'Water vapour is invisible; it condenses into the visible cloud of droplets a little further out.'),
]

// ================================================================== Lesson 2 The particle model

const PARTICLE_DESC: Record<'solid' | 'liquid' | 'gas', { arr: string; move: string; force: string }> = {
  solid: { arr: 'packed closely in a regular arrangement', move: 'vibrate on the spot', force: 'very strong' },
  liquid: { arr: 'close together but not in a regular arrangement', move: 'move around and slide past each other', force: 'weaker than in a solid' },
  gas: { arr: 'far apart with lots of space between them', move: 'move quickly in all directions', force: 'very weak' },
}
const particleEntries: Entry[] = [
  mk(1, () => {
    const s = pick(['solid', 'liquid', 'gas'] as const)
    return { t: 'drawn', q: 'Which state of matter does this particle diagram show?', d: particleBox(s, `Particles of a ${s}`), a: s, w: ['solid', 'liquid', 'gas'].filter((x) => x !== s).concat(['a mixture']), why: `The particles are ${PARTICLE_DESC[s].arr}: a ${s}.` }
  }),
  mk(1, () => {
    const s = pick(['solid', 'liquid', 'gas'] as const)
    return { t: 'arrangement', q: `How are the particles arranged in a ${b(s)}?`, a: PARTICLE_DESC[s].arr, w: (['solid', 'liquid', 'gas'] as const).filter((x) => x !== s).map((x) => PARTICLE_DESC[x].arr).concat(['there are no particles in it']), why: `In a ${s}, the particles are ${PARTICLE_DESC[s].arr}.` }
  }),
  mk(1, () => {
    const s = pick(['solid', 'liquid', 'gas'] as const)
    return { t: 'movement', q: `How do the particles move in a ${b(s)}?`, a: `they ${PARTICLE_DESC[s].move}`, w: (['solid', 'liquid', 'gas'] as const).filter((x) => x !== s).map((x) => `they ${PARTICLE_DESC[x].move}`).concat(['they do not move at all']), why: `In a ${s}, the particles ${PARTICLE_DESC[s].move}.` }
  }),
  m(1, 'matterMade', 'According to the particle model, all matter is made of…', 'tiny particles that are always moving', ['tiny particles that never move', 'one solid piece with no gaps', 'water'], 'The particle model says all matter is made of tiny particles that are always moving.'),
  m(1, 'between', 'What is between the particles of a gas?', 'empty space', ['air', 'water', 'more particles packed tightly'], 'There is nothing (empty space) between gas particles. Air is itself a gas made of particles.'),
  m(1, 'fastest', 'In which state do the particles move fastest?', 'gas', ['solid', 'liquid', 'they all move at the same speed'], 'Gas particles have the most energy and move fastest.'),
  mk(2, () => {
    const s = pick(['solid', 'liquid', 'gas'] as const)
    return { t: 'force', q: `How strong are the forces of attraction between the particles in a ${b(s)}?`, a: PARTICLE_DESC[s].force, w: (['solid', 'liquid', 'gas'] as const).filter((x) => x !== s).map((x) => PARTICLE_DESC[x].force).concat(['there are no forces between particles']), why: `The forces of attraction in a ${s} are ${PARTICLE_DESC[s].force}.` }
  }),
  m(2, 'whyShape', 'Why does a solid keep its shape?', 'strong attractive forces hold its particles in fixed positions', ['its particles do not move at all', 'its particles are bigger than other particles', 'it has no particles'], 'Strong forces hold the particles in place; they can only vibrate, so the shape stays the same.'),
  m(2, 'whyFlow', 'Why can a liquid flow?', 'its particles can slide past each other', ['its particles are far apart', 'its particles are held in fixed positions', 'its particles are wet'], 'Liquid particles are close together but can move past each other, so liquids flow.'),
  m(2, 'whyCompress', 'Why can a gas be compressed but a liquid hardly at all?', 'gas particles have large spaces between them; liquid particles are already close together', ['gas particles are smaller', 'liquid particles do not move', 'gases have no mass'], 'Compressing pushes particles closer. Only gases have big spaces to close up.'),
  m(2, 'heatEffect', 'What happens to the particles of a substance when it is heated?', 'they gain energy and move faster', ['they get bigger', 'they lose energy and slow down', 'they disappear'], 'Heating gives particles more energy, so they move (or vibrate) faster. The particles themselves do not get bigger.'),
  m(2, 'expand', 'A metal ring is heated and gets slightly bigger. What does the particle model say about this?', 'the particles vibrate more and take up more space', ['each particle grows bigger', 'new particles are made', 'the particles stop moving'], 'Faster-vibrating particles push a little further apart, so the solid expands. The particles stay the same size.'),
  m(2, 'smell', 'You can smell a cake baking from another room. Which part of the particle model explains this?', 'gas particles move and spread out through the air', ['solid particles vibrate', 'particles get bigger when heated', 'liquids have a fixed volume'], 'Particles from the cake escape as a gas and move through the air to your nose (diffusion).'),
  mk(3, () => {
    const kinds = shuffle(['solid', 'liquid', 'gas', 'liquid'] as Box[])
    // ask about a state that appears exactly once
    const target = pick(['solid', 'gas'] as const)
    const ans = LETTERS[kinds.indexOf(target)]
    return { t: 'pick', q: `Which box shows the particles of a ${b(target)}?`, d: fourBoxes(kinds), a: ans, w: LETTERS.filter((l) => l !== ans), fixed: LETTERS, why: `Box ${ans}: the particles are ${PARTICLE_DESC[target].arr}.`, meta: { kinds, target } }
  }),
  m(3, 'diffuseHot', 'A drop of food colouring spreads faster through hot water than through cold water. Why?', 'the water particles move faster in hot water, so the colouring mixes faster', ['hot water has bigger particles', 'cold water has no particles', 'food colouring only dissolves in hot water'], 'Higher temperature means faster-moving particles, so diffusion is faster.'),
  m(3, 'model', 'The particle model is a scientific model. What does that mean?', 'it is a simplified way of explaining and predicting how matter behaves', ['it is a plastic copy of an atom', 'it has been proved to be exactly what matter looks like', 'it is a guess with no evidence'], 'Models simplify reality to explain observations and make predictions; they can be improved with new evidence.'),
  m(3, 'meltForce', 'Compared with ice, the particles in liquid water…', 'have weaker attractions and can move past each other', ['have stronger attractions and stay still', 'are further apart than in steam', 'are a different substance'], 'Melting gives the particles enough energy to partly overcome the attractions, so they can move past each other.'),
  m(3, 'gasPressure', 'Using the particle model, why does a gas push on the walls of its container?', 'its fast-moving particles keep hitting the walls', ['its particles stick to the walls', 'gases are heavier than the container', 'the particles grow bigger'], 'Countless collisions of moving particles with the walls produce gas pressure.'),
  m(3, 'meltingForces', 'Butter melts in a warm kitchen but steel does not. What does the particle model suggest about the forces between their particles?', 'the forces between steel particles are much stronger', ['butter particles are bigger', 'steel particles do not vibrate', 'butter has no particles'], 'Stronger attractive forces need more energy (a higher temperature) to overcome.'),
  m(3, 'compareSpeed', 'Which list puts the states in order from the weakest attractive forces between particles to the strongest?', 'gas, liquid, solid', ['solid, liquid, gas', 'liquid, gas, solid', 'gas, solid, liquid'], 'Gas particles hardly attract; solid particles attract strongly.'),
  m(3, 'nothing', 'A student draws air particles with smaller “air” particles in the gaps between them. What is wrong with the drawing?', 'the gaps between gas particles are empty space, not air', ['air has no particles', 'the particles should be touching', 'nothing is wrong'], 'Air is the particles themselves; between them is empty space.'),
]

// ================================================================== Lesson 3 Changes of state

const CHANGES: [string, string, string, 'heat' | 'cool'][] = [
  ['melting', 'solid', 'liquid', 'heat'],
  ['freezing', 'liquid', 'solid', 'cool'],
  ['evaporation (boiling)', 'liquid', 'gas', 'heat'],
  ['condensation', 'gas', 'liquid', 'cool'],
  ['sublimation', 'solid', 'gas', 'heat'],
  ['deposition', 'gas', 'solid', 'cool'],
]
const EVERYDAY: [string, string][] = [
  ['butter softening and running in a hot pan', 'melting'],
  ['ice blocks forming in the freezer', 'freezing'],
  ['a puddle drying up on a sunny day', 'evaporation (boiling)'],
  ['drops of water forming on the outside of a cold drink can', 'condensation'],
  ['the bathroom mirror fogging up after a hot shower', 'condensation'],
  ['dry ice (solid carbon dioxide) turning straight into a gas', 'sublimation'],
  ['frost forming directly from water vapour on a cold windscreen', 'deposition'],
  ['candle wax dripping down the side of a candle', 'melting'],
  ['wet clothes drying on a line', 'evaporation (boiling)'],
  ['molten lava cooling into rock', 'freezing'],
  ['mothballs slowly disappearing in a cupboard without forming a liquid', 'sublimation'],
]
const changeEntries: Entry[] = [
  mk(1, () => {
    const [name, from, to] = pick(CHANGES)
    return { t: 'name', q: `What is the change of state from ${b(from)} to ${b(to)} called?`, a: name, w: CHANGES.map((c) => c[0]).filter((c) => c !== name), why: `${from[0].toUpperCase() + from.slice(1)} → ${to} is ${name}.` }
  }),
  mk(1, () => {
    const [what, change] = pick(EVERYDAY)
    return { t: 'everyday', q: `Which change of state is happening? ${b(what[0].toUpperCase() + what.slice(1))}.`, a: change, w: CHANGES.map((c) => c[0]).filter((c) => c !== change), why: `${what[0].toUpperCase() + what.slice(1)}: ${change}.` }
  }),
  mk(1, () => {
    const [name, from, to, hc] = pick(CHANGES)
    return { t: 'heatCool', q: `To make ${b(name.replace(' (boiling)', ''))} happen (${from} → ${to}), is energy added or removed?`, a: hc === 'heat' ? 'added (heating)' : 'removed (cooling)', w: [hc === 'heat' ? 'removed (cooling)' : 'added (heating)', 'neither: no energy is involved', 'it depends on the colour of the substance'], why: hc === 'heat' ? `${name} needs energy, so the substance is heated.` : `${name} happens when energy is removed, so the substance is cooled.` }
  }),
  m(1, 'melts', 'At what temperature does pure ice melt (at normal air pressure)?', '0 °C', ['100 °C', '−10 °C', '37 °C'], 'Pure ice melts at 0 °C and pure water freezes at 0 °C.'),
  m(1, 'boils', 'At what temperature does pure water boil (at sea level)?', '100 °C', ['0 °C', '50 °C', '212 °C'], 'Pure water boils at 100 °C at normal (sea-level) air pressure.'),
  mk(2, () => {
    const [name, from, to, hc] = pick(CHANGES.slice(0, 4))
    const desc = hc === 'heat' ? 'gain energy, move faster and break away from the strong attractions holding them' : 'lose energy, slow down and are pulled closer together by attractive forces'
    return { t: 'particles', q: `During ${b(name.replace(' (boiling)', ''))}, what happens to the particles?`, a: `they ${desc}`, w: [`they ${hc === 'heat' ? 'lose energy, slow down and are pulled closer together by attractive forces' : 'gain energy, move faster and break away from the strong attractions holding them'}`, 'they change into a different substance', 'they get bigger or smaller'], why: `${name[0].toUpperCase() + name.slice(1)} (${from} → ${to}): the particles ${desc}.` }
  }),
  m(2, 'evapBoil', 'What is the difference between evaporation and boiling?', 'evaporation happens only at the surface and at any temperature; boiling happens throughout the liquid at the boiling point', ['they are exactly the same', 'boiling happens at the surface only', 'evaporation only happens at 100 °C'], 'Both turn liquid into gas. Evaporation is slow, from the surface, below the boiling point; boiling is fast, with bubbles of gas forming throughout the liquid.'),
  m(2, 'sweat', 'Sweating cools you down on a hot day. Why?', 'the sweat evaporates, taking energy from your skin', ['sweat is colder than blood', 'sweat freezes on your skin', 'sweat blocks the sun'], 'Evaporation needs energy. The fastest particles escape, taking energy away and cooling the skin.'),
  m(2, 'reversible', 'Changes of state are physical changes. What does that mean?', 'no new substance is made, and the change can be reversed', ['a new substance is always made', 'the change can never be reversed', 'the substance loses mass'], 'Ice, water and steam are all water. Changing state does not make a new substance.'),
  m(2, 'mass', '50 g of ice melts completely in a sealed bag. What is the mass of the water?', '50 g', ['less than 50 g, because liquids are lighter', 'more than 50 g', '0 g'], 'Mass is conserved in a change of state: the same particles are there, just arranged differently.'),
  m(2, 'condenseWhere', 'Where does the water on the outside of a cold glass come from?', 'water vapour in the air condenses on the cold glass', ['it leaks through the glass', 'the ice inside sweats', 'the glass melts'], 'Water vapour in the air touches the cold glass, cools and condenses into liquid drops.'),
  m(3, 'mountains', 'Water boils at about 90 °C at the top of a very high mountain. What does this show?', 'the boiling point depends on the air pressure', ['the water is not pure water', 'thermometers do not work on mountains', 'water cannot boil on mountains'], 'Lower air pressure at altitude lowers the boiling point.'),
  m(3, 'salt', 'Salt is spread on icy roads in cold countries. What does the salt do?', 'it lowers the freezing point of water, so ice melts below 0 °C', ['it heats the road', 'it raises the freezing point', 'it makes ice harder'], 'Dissolved salt makes water freeze at a lower temperature, so ice melts even when it is below 0 °C.'),
  m(3, 'fastDry', 'Which would make wet washing dry fastest?', 'a warm, windy day', ['a cold, still day', 'a warm, still, humid day', 'a cold, foggy day'], 'Warmth gives particles more energy and wind carries water vapour away, both speeding up evaporation.'),
  m(3, 'gallium', 'Gallium is a metal that melts at about 30 °C. What happens if you hold a piece in your hand (about 37 °C)?', 'it melts, because your hand is above its melting point', ['nothing, because metals never melt', 'it boils', 'it freezes'], 'A substance melts when its temperature rises above its melting point; 37 °C is above 30 °C.'),
  m(3, 'iodine', 'When iodine crystals are warmed gently they turn straight into a purple gas, and the gas forms crystals again on a cold surface. Which two changes are these?', 'sublimation, then deposition', ['melting, then freezing', 'boiling, then condensation', 'evaporation, then melting'], 'Solid to gas is sublimation; gas to solid is deposition.'),
  m(3, 'pressureCooker', 'A pressure cooker cooks food faster because the water inside boils above 100 °C. Why does it boil at a higher temperature?', 'the higher pressure inside raises the boiling point', ['the food heats the water', 'the lid makes the water purer', 'steam is colder than water'], 'Higher pressure raises the boiling point, so the water and food get hotter.'),
  m(3, 'freezeEnergy', 'Freezing water gives out energy to the surroundings. Which statement explains this?', 'as attractive forces pull the particles into fixed positions, energy is released', ['particles gain energy when they freeze', 'ice is hotter than water', 'freezing makes new particles'], 'Energy is released when particles are pulled together; the same energy is needed to separate them again.'),
  m(3, 'dewNight', 'Dew forms on grass on clear, cold nights. Which explanation is best?', 'the grass cools below the temperature at which water vapour in the air condenses', ['rain falls without clouds', 'grass sweats at night', 'the soil boils'], 'Water vapour condenses on surfaces that are cold enough.'),
]

// ================================================================== Lesson 4 Heating water: the heating curve

function curve(): { ends: number[]; d: string } {
  for (;;) {
    const a = int(1, 2) * 2 // even numbers so the boundaries sit on labelled ticks
    const bb = a + int(1, 2) * 2
    const c = bb + int(2, 3) * 2
    const dd = c + int(2, 3) * 2
    const e = dd + 2
    if (e <= 20) return { ends: [a, bb, c, dd, e], d: heatingCurve({ ends: [a, bb, c, dd, e] }) }
  }
}
const SECTION = [
  { what: 'ice warming up', state: 'solid' },
  { what: 'ice melting', state: 'solid and liquid together' },
  { what: 'liquid water warming up', state: 'liquid' },
  { what: 'water boiling', state: 'liquid and gas together' },
  { what: 'steam (water vapour) warming up', state: 'gas' },
]
const L5 = ['A', 'B', 'C', 'D', 'E']
const curveEntries: Entry[] = [
  mk(1, () => {
    const { d, ends } = curve()
    const k = int(0, 4)
    return { t: 'section', q: `Ice at −20 °C is heated steadily. In which section of the graph is the water ${b(SECTION[k].what)}?`, d, a: L5[k], w: L5.filter((x) => x !== L5[k]), why: `Section ${L5[k]}: ${SECTION[k].what}.`, meta: { ends, k } }
  }),
  mk(1, () => {
    const { d, ends } = curve()
    const k = pick([0, 2, 4])
    return { t: 'state', q: `What state is the water in during section ${b(L5[k])}?`, d, a: SECTION[k].state, w: SECTION.map((s) => s.state).filter((s) => s !== SECTION[k].state), why: `Section ${L5[k]} is ${SECTION[k].what}, so the water is ${SECTION[k].state}.`, meta: { ends, k } }
  }),
  mk(1, () => {
    const { d, ends } = curve()
    const melt = chance()
    return { t: 'flatTemp', q: `The graph is flat during section ${b(melt ? 'B' : 'D')}. What is the temperature there?`, d, a: melt ? '0 °C' : '100 °C', w: melt ? ['100 °C', '−20 °C', '20 °C'] : ['0 °C', '120 °C', '80 °C'], why: `Section ${melt ? 'B' : 'D'} is ${melt ? 'melting, at 0 °C' : 'boiling, at 100 °C'}.`, meta: { ends } }
  }),
  m(1, 'axes', 'On a heating curve, what is usually on the horizontal axis?', 'time', ['temperature', 'mass', 'volume'], 'Time goes on the horizontal axis and temperature on the vertical axis.'),
  m(1, 'tool', 'Which instrument measures the temperature of the water during the experiment?', 'a thermometer (or a temperature probe and data logger)', ['a measuring cylinder', 'an electronic balance', 'a ruler'], 'Temperature is measured with a thermometer or a temperature probe connected to a data logger.'),
  mk(2, () => {
    const { d, ends } = curve()
    return { t: 'boilStart', q: 'At what time (in minutes) does the water start to boil?', d, n: ends[2], unit: 'minutes', why: [`Boiling is the flat section at 100 °C (section D). It starts at ${ends[2]} minutes.`], meta: { ends } }
  }),
  mk(2, () => {
    const { d, ends } = curve()
    return { t: 'meltLength', q: 'How many minutes does the ice take to melt (section B)?', d, n: ends[1] - ends[0], unit: 'minutes', why: [`Section B runs from ${ends[0]} to ${ends[1]} minutes: ${ends[1]} − ${ends[0]} = ${ends[1] - ends[0]} minutes.`], meta: { ends } }
  }),
  m(2, 'flatWhy', 'During boiling, the water is still being heated but its temperature stays at 100 °C. Where does the energy go?', 'into overcoming the forces between particles so they can escape as gas', ['it is lost because thermometers stop working', 'into making the particles bigger', 'into making a new substance'], 'At a change of state, the energy breaks the attractions between particles instead of raising the temperature.'),
  m(2, 'datalogger', 'Why might a data logger be better than reading a thermometer by eye every minute?', 'it records more often, more accurately and without reading errors', ['it makes the water boil faster', 'it changes the boiling point', 'it does not need electricity'], 'A data logger takes frequent, precise readings automatically and avoids parallax and timing errors.'),
  m(2, 'safety', 'Which is the most important safety step when heating water with a Bunsen burner?', 'wear safety glasses and keep hair, sleeves and paper away from the flame', ['hold the beaker while it heats', 'heat the water with the lid tightly sealed', 'use the hottest flame and leave it unattended'], 'Eye protection and keeping flammable things clear of the flame prevent burns and fires. Never seal a container you are heating.'),
  mk(3, () => {
    const { d, ends } = curve()
    const t = pick([ends[0] / 2, (ends[0] + ends[1]) / 2, (ends[1] + ends[2]) / 2, (ends[2] + ends[3]) / 2].filter((x) => Number.isInteger(x)))
    const k = t < ends[0] ? 0 : t < ends[1] ? 1 : t < ends[2] ? 2 : 3
    return { t: 'atTime', q: `What is happening to the water at ${b(`${t} minutes`)}?`, d, a: SECTION[k].what, w: SECTION.map((s) => s.what).filter((s) => s !== SECTION[k].what), why: `${t} minutes is in section ${L5[k]}: ${SECTION[k].what}.`, meta: { ends, t, k } }
  }),
  m(3, 'salty', 'A student repeats the experiment with salty water. The boiling section is at about 102 °C instead of 100 °C. What is the best conclusion?', 'dissolving salt raises the boiling point of water', ['the thermometer is broken', 'salty water cannot boil', 'salt makes water a gas'], 'Dissolved substances raise the boiling point (and lower the freezing point) of water.'),
  m(3, 'fair', 'Two students heat different amounts of ice with the same burner. Why should they not compare how long the melting took?', 'the amount of ice is a variable that was not kept the same, so it is not a fair test', ['melting always takes the same time', 'ice cannot be weighed', 'burners are always unfair'], 'In a fair test only one variable is changed. More ice takes longer to melt.'),
  m(3, 'steepest', 'In which section does the temperature rise fastest, and why?', 'section E (steam), because a gas needs less energy than liquid water to warm up by each degree', ['section B, because ice melts quickly', 'section D, because boiling is fast', 'all sections rise at the same rate'], 'Water vapour heats up faster than liquid water for the same energy, so its line is steeper.'),
]

// ================================================================== Lesson 5 Properties of water

const waterEntries: Entry[] = [
  m(1, 'density', 'What is the density of pure water (at about 4 °C)?', '1 g/cm³ (1 g/mL)', ['10 g/cm³', '0.1 g/cm³', '100 g/cm³'], 'Pure water has a density of 1 g/cm³: each 1 cm³ has a mass of 1 g.'),
  m(1, 'mL', 'How much mass does 1 mL of water have?', 'about 1 g', ['about 1 kg', 'about 10 g', 'about 0.1 g'], 'Water’s density is 1 g/mL, so 1 mL of water has a mass of about 1 g.'),
  m(1, 'tension', 'Some insects, like pond skaters, can walk on water. Which property of water allows this?', 'surface tension', ['buoyancy', 'high boiling point', 'evaporation'], 'The particles at the surface of water pull together strongly, forming a “skin”: surface tension.'),
  m(1, 'buoyancy', 'What is the upward push that water gives to an object in it called?', 'buoyancy (the buoyant force)', ['gravity', 'friction', 'surface tension'], 'Water pushes up on objects in it; this upward force is buoyancy.'),
  m(1, 'iceFloats', 'Why does ice float on water?', 'ice is less dense than liquid water', ['ice is heavier than water', 'ice has air bubbles in every piece', 'cold things always float'], 'Ice (about 0.92 g/cm³) is less dense than water (1 g/cm³), so it floats.'),
  m(1, 'dropRound', 'Why are small water drops on a leaf nearly round?', 'surface tension pulls the surface of the drop inwards', ['water is a solid', 'buoyancy pushes the drop up', 'the leaf is round'], 'Surface tension pulls the water surface as small as possible, which makes a rounded drop.'),
  m(2, 'ship', 'A steel ship floats even though steel is denser than water. Why?', 'the ship’s hollow shape holds lots of air, so the ship overall is less dense than water', ['steel floats in sea water', 'the engine pushes it up', 'ships are made of wood'], 'Average density counts the air inside. The whole ship has a lower average density than water.'),
  m(2, 'paperclip', 'A steel paperclip placed gently on water can rest on the surface. If a drop of detergent is added, it sinks. Why?', 'detergent weakens surface tension', ['detergent makes the paperclip heavier', 'detergent makes water denser', 'detergent dissolves steel'], 'Detergent reduces the attraction between water particles at the surface, weakening surface tension.'),
  m(2, 'sea', 'Swimmers float more easily in the sea than in a pool. Why?', 'sea water is denser than fresh water, so it gives more buoyancy', ['sea water is warmer', 'pools have chlorine', 'waves push swimmers up'], 'Dissolved salt makes sea water (about 1.03 g/cm³) denser, so it pushes up more strongly.'),
  m(2, 'icebergs', 'About how much of an iceberg is below the water line?', 'about 90% (most of it)', ['about 10%', 'none of it', 'exactly half'], 'Ice is about 92% as dense as sea water, so about nine-tenths of an iceberg is underwater.'),
  m(2, 'fishLakes', 'Lakes freeze from the top down, so fish survive under the ice. Which property of water explains this?', 'ice is less dense than liquid water, so it forms on top', ['water has high surface tension', 'water boils at 100 °C', 'ice sinks to the bottom'], 'Because ice floats, it forms a layer on top that insulates the water below.'),
  m(2, 'bottle', 'A glass bottle full of water cracks when left in the freezer. Why?', 'water expands when it freezes', ['water shrinks when it freezes', 'glass melts in the freezer', 'cold air is heavier'], 'Unlike most substances, water expands when it freezes into ice, which can crack the bottle.'),
  m(3, 'layers', 'Honey (1.4 g/cm³), water (1.0 g/cm³) and vegetable oil (0.92 g/cm³) are poured into a glass. In what order do they settle, from the bottom?', 'honey, then water, then oil', ['oil, then water, then honey', 'water, then honey, then oil', 'they all mix together evenly'], 'The densest liquid sinks to the bottom and the least dense floats on top.'),
  m(3, 'egg', 'An egg sinks in tap water but floats when lots of salt is dissolved in the water. What is the best explanation?', 'the salt water is denser than the egg, but tap water is less dense than the egg', ['salt makes the egg lighter', 'the egg absorbs the salt', 'salt water has more surface tension'], 'An object floats in a liquid that is denser than it is.'),
  m(3, 'float', 'An object has a density of 0.7 g/cm³. What will it do in water?', 'float, because 0.7 g/cm³ is less than 1 g/cm³', ['sink, because 0.7 is a small number', 'sink, because all objects sink', 'dissolve'], 'Objects less dense than the liquid float; water is 1 g/cm³.'),
  m(3, 'hotCold', 'Coloured hot water is gently released at the bottom of a tank of cold water. What happens, and why?', 'it rises, because hot water is less dense than cold water', ['it stays at the bottom, because hot water is denser', 'it freezes', 'it turns into steam immediately'], 'Heating makes water expand slightly, so hot water is less dense and rises.'),
  m(1, 'floatOrSink', 'A material is denser than water. What will a piece of it do in water?', 'sink', ['float', 'dissolve', 'evaporate'], 'Objects denser than water (1 g/cm³) sink.'),
  m(1, 'mass1L', 'What is the mass of 1 L (1000 mL) of water?', 'about 1 kg (1000 g)', ['about 1 g', 'about 100 g', 'about 10 kg'], '1 g for each mL, so 1000 mL has a mass of about 1000 g = 1 kg.'),
  m(2, 'needle', 'A sewing needle laid gently on water floats, but dropped point-first it sinks. Why?', 'laid flat, surface tension supports it; point-first it breaks through the surface', ['steel is less dense than water', 'the point makes it heavier', 'needles are hollow'], 'Steel is denser than water; only surface tension holds the flat needle up.'),
  m(2, 'lifejacket', 'Why does a life jacket help a person float?', 'it is full of low-density material, lowering the average density of the person and jacket', ['it makes the water denser', 'it pushes the water away', 'it is heavier than water'], 'Adding a lot of volume with little mass lowers the overall density.'),
  m(3, 'deadSea', 'People float very easily in the Dead Sea. What does this suggest about its water?', 'it is much denser than ordinary water because it contains a lot of dissolved salt', ['it is less dense than fresh water', 'it has no surface tension', 'it is warmer than other seas'], 'More dissolved salt makes the water denser, so it gives more buoyancy.'),
  m(3, 'icePack', 'Why do water pipes sometimes burst in very cold weather?', 'water expands when it freezes and pushes on the pipe', ['ice is denser than water', 'cold metal shrinks and breaks', 'the water boils'], 'Ice takes up more space than the liquid water it came from.'),
  m(3, 'tensionTest', 'A student counts how many drops of water fit on a 10-cent coin before it spills, then repeats with soapy water. What does the investigation test?', 'how detergent affects surface tension', ['the density of the coin', 'the boiling point of water', 'the mass of soap'], 'Fewer drops fit with soapy water because detergent weakens surface tension.'),
  m(3, 'buoyMeasure', 'A rock weighs less when held underwater on a spring balance. Why?', 'the water pushes up on it (buoyancy)', ['the rock loses mass underwater', 'water dissolves part of the rock', 'gravity is weaker underwater'], 'The buoyant force supports part of the rock’s weight.'),
]

// ================================================================== Lesson 6 Density

const MATERIALS: [string, number][] = [
  ['aluminium', 2.7],
  ['iron', 7.9],
  ['copper', 9.0],
  ['lead', 11.3],
  ['gold', 19.3],
  ['ice', 0.92],
  ['cork', 0.24],
  ['pine wood', 0.5],
  ['glass', 2.5],
  ['olive oil', 0.92],
  ['ethanol', 0.79],
]
/** a mass and volume giving a tidy density */
function mv(): { mass: number; vol: number; rho: number } {
  const rho = pick([0.5, 0.8, 1.5, 2, 2.5, 2.7, 3, 4, 7.9, 8, 9, 11.3])
  const vol = pick([2, 4, 5, 10, 20, 25, 40, 50, 100])
  return { mass: Math.round(rho * vol * 100) / 100, vol, rho }
}
const densityEntries: Entry[] = [
  m(1, 'formula', 'Which formula is used to calculate density?', 'density = mass ÷ volume (ρ = m/V)', ['density = mass × volume', 'density = volume ÷ mass', 'density = mass + volume'], 'Density is mass per unit volume: ρ = m ÷ V.'),
  m(1, 'unit', 'Which is a unit of density?', 'g/cm³', ['cm³', 'g', 'kg/m'], 'Density is mass ÷ volume, so its units are like g/cm³ (or g/mL, kg/m³).'),
  m(1, 'meaning', 'What does it mean if a material has a high density?', 'a lot of mass is packed into each unit of volume', ['it is very large', 'it is very hot', 'it floats easily'], 'Density measures how much mass is in a given volume.'),
  mk(1, () => {
    const { mass, vol, rho } = mv()
    return { t: 'calc', calc: true, q: `A block has a mass of ${b(`${nf(mass)} g`)} and a volume of ${b(`${vol} cm³`)}. What is its density?`, n: rho, dp: 2, unit: 'g/cm³', why: [`ρ = m ÷ V = ${nf(mass)} ÷ ${vol} = ${nf(rho)} g/cm³`], meta: { mass, vol } }
  }),
  mk(2, () => {
    const { mass, vol, rho } = mv()
    return { t: 'mass', calc: true, q: `A metal has a density of ${b(`${nf(rho)} g/cm³`)}. What is the mass of ${b(`${vol} cm³`)} of it?`, n: mass, dp: 2, unit: 'g', why: [`m = ρ × V = ${nf(rho)} × ${vol} = ${nf(mass)} g`], meta: { rho, vol } }
  }),
  mk(2, () => {
    const { mass, vol, rho } = mv()
    return { t: 'volume', calc: true, q: `A sample of a substance with density ${b(`${nf(rho)} g/cm³`)} has a mass of ${b(`${nf(mass)} g`)}. What is its volume?`, n: vol, dp: 2, unit: 'cm³', why: [`V = m ÷ ρ = ${nf(mass)} ÷ ${nf(rho)} = ${vol} cm³`], meta: { rho, mass } }
  }),
  mk(2, () => {
    const [name, rho] = pick(MATERIALS)
    return { t: 'floatSink', q: `${name[0].toUpperCase() + name.slice(1)} has a density of ${b(`${rho} g/cm³`)}. Will a solid piece (or a drop) of it float or sink in water?`, a: rho < 1 ? 'float' : 'sink', w: [rho < 1 ? 'sink' : 'float', 'it depends only on the size of the piece', 'it will hover exactly halfway down'], why: `Water is 1 g/cm³. ${rho} g/cm³ is ${rho < 1 ? 'less' : 'more'} than 1, so it ${rho < 1 ? 'floats' : 'sinks'}.`, meta: { rho } }
  }),
  mk(2, () => {
    const pair = sample(MATERIALS.filter((x) => x[0] !== 'olive oil' && x[0] !== 'ice'), 2)
    const [hi, lo] = pair[0][1] > pair[1][1] ? pair : [pair[1], pair[0]]
    return { t: 'compare', q: `Cubes of ${b(hi[0])} (${hi[1]} g/cm³) and ${b(lo[0])} (${lo[1]} g/cm³) are exactly the same size. Which has the greater mass?`, a: hi[0], w: [lo[0], 'they have the same mass', 'it cannot be worked out'], why: `Same volume, so the denser one, ${hi[0]}, has more mass.`, meta: { hi: hi[1], lo: lo[1] } }
  }),
  mk(3, () => {
    // a real material from the table; its mass and volume are made to match
    const [name, rho] = pick(MATERIALS.filter((x) => ['aluminium', 'iron', 'copper', 'lead', 'gold', 'glass'].includes(x[0])))
    const vol = pick([5, 10, 20, 50])
    const mass = Math.round(rho * vol * 100) / 100
    const others = MATERIALS.filter((x) => x[0] !== name && Math.abs(x[1] - rho) > 0.15)
    return { t: 'identify', q: `A block has a mass of ${b(`${nf(mass)} g`)} and a volume of ${b(`${vol} cm³`)}. Using the densities aluminium 2.7, glass 2.5, iron 7.9, copper 9.0, lead 11.3 and gold 19.3 g/cm³, which material is it most likely to be?`, a: name, w: sample(others, 3).map((x) => x[0]), why: `ρ = ${nf(mass)} ÷ ${vol} = ${nf(rho)} g/cm³, which matches ${name}.`, meta: { mass, vol } }
  }),
  mk(3, () => {
    const kg = pick([2, 3, 5, 8])
    const rho = pick([0.5, 2.5, 4])
    return { t: 'units', calc: true, q: `A ${b(`${kg} kg`)} object has a volume of ${b(`${kg * 1000 / rho} cm³`)}. What is its density in g/cm³?`, n: rho, dp: 2, unit: 'g/cm³', why: [`${kg} kg = ${kg * 1000} g`, `ρ = ${kg * 1000} ÷ ${kg * 1000 / rho} = ${rho} g/cm³`], meta: { kg, vol: (kg * 1000) / rho } }
  }),
  m(3, 'cut', 'A block of wood is cut in half. What happens to the density of each half?', 'it stays the same', ['it halves', 'it doubles', 'it becomes zero'], 'Density is a property of the material: mass and volume both halve, so their ratio is unchanged.'),
  m(3, 'gold', 'A “gold” ring has a density of 10.5 g/cm³. Pure gold is 19.3 g/cm³. What can you conclude?', 'the ring is not pure gold', ['the ring is pure gold', 'the ring is hollow and pure gold', 'density cannot help'], 'A different density means a different material: the ring is mostly another metal (silver is about 10.5 g/cm³).'),
]

// ================================================================== Lesson 7 Measuring density

const measureEntries: Entry[] = [
  m(1, 'massTool', 'Which equipment measures the mass of an object?', 'an electronic balance (scales)', ['a measuring cylinder', 'a ruler', 'a thermometer'], 'Mass is measured on a balance, in grams or kilograms.'),
  m(1, 'volTool', 'Which equipment measures the volume of a liquid most accurately?', 'a measuring cylinder', ['a beaker', 'a balance', 'a test tube'], 'A measuring cylinder has a finer scale than a beaker.'),
  m(1, 'meniscus', 'How should you read the volume in a measuring cylinder?', 'at eye level, from the bottom of the curved surface (meniscus)', ['from above, at the top of the curve', 'from below the bench', 'at the highest drop on the side'], 'Read at eye level from the bottom of the meniscus to avoid parallax error.'),
  m(1, 'mLcm3', 'How many cm³ is 1 mL?', '1 cm³', ['10 cm³', '1000 cm³', '0.1 cm³'], '1 mL = 1 cm³.'),
  mk(1, () => {
    const l = int(2, 6)
    const w = int(2, 5)
    const h = int(1, 4)
    return { t: 'box', q: `A rectangular block is ${b(`${l} cm`)} long, ${b(`${w} cm`)} wide and ${b(`${h} cm`)} high. What is its volume?`, n: l * w * h, unit: 'cm³', why: [`V = l × w × h = ${l} × ${w} × ${h} = ${l * w * h} cm³`], meta: { l, w, h } }
  }),
  mk(2, () => {
    const start = pick([40, 50, 60, 70])
    const rise = pick([8, 12, 15, 20, 25])
    return { t: 'displace', q: `A measuring cylinder holds ${b(`${start} mL`)} of water. A stone is lowered in and the level rises to ${b(`${start + rise} mL`)}. What is the volume of the stone?`, n: rise, unit: 'cm³', why: [`Volume of stone = ${start + rise} − ${start} = ${rise} mL = ${rise} cm³`], meta: { start, rise } }
  }),
  mk(2, () => {
    const start = pick([30, 40, 50])
    const rise = pick([5, 10, 20])
    const rho = pick([2, 2.5, 3, 4])
    const mass = rise * rho
    return { t: 'stoneDensity', calc: true, q: `A rock of mass ${b(`${nf(mass)} g`)} raises the water in a measuring cylinder from ${b(`${start} mL`)} to ${b(`${start + rise} mL`)}. What is the density of the rock?`, n: rho, dp: 2, unit: 'g/cm³', why: [`V = ${start + rise} − ${start} = ${rise} cm³`, `ρ = ${nf(mass)} ÷ ${rise} = ${rho} g/cm³`], meta: { mass, rise } }
  }),
  m(2, 'irregular', 'Why can’t you find the volume of a key with a ruler?', 'it has an irregular shape, so use water displacement instead', ['keys have no volume', 'keys are too heavy', 'rulers only measure liquids'], 'Irregular objects are measured by the volume of water they push aside (displacement).'),
  m(2, 'overflow', 'An object is too big for a measuring cylinder. How can its volume be measured?', 'lower it into a full displacement (overflow) can and measure the water that overflows', ['estimate it by eye', 'weigh it twice', 'melt it'], 'The water pushed out of a full displacement can has the same volume as the object.'),
  m(2, 'liquidDensity', 'To find the density of a liquid, a student weighs an empty measuring cylinder, adds 50 mL of the liquid and weighs again. What else is needed?', 'nothing: mass = second reading − first reading, and V = 50 mL', ['the temperature of the room', 'the height of the cylinder', 'the colour of the liquid'], 'Subtract to get the liquid’s mass, then divide by 50 mL.'),
  m(3, 'floater', 'A cork floats, so it can’t be pushed under in the measuring cylinder by itself. How can you still find its volume?', 'push it under with a thin wire (or tie it to a sinker and subtract the sinker’s volume)', ['cut it into small pieces until they sink', 'measure the cork’s shadow', 'it is impossible'], 'Hold it completely underwater with a thin wire, or sink it with a weight whose volume is measured separately.'),
  m(3, 'repeat', 'Why should a density measurement be repeated and an average taken?', 'to reduce the effect of random errors and make the result more reliable', ['so that the answer is bigger', 'because the first result is always wrong', 'to make the test unfair'], 'Repeating and averaging makes results more reliable.'),
  m(3, 'bubble', 'An air bubble stays stuck to a stone in the measuring cylinder. How does this affect the calculated density?', 'the volume reads too high, so the density comes out too low', ['the density comes out too high', 'it makes no difference', 'the mass reads too high'], 'The bubble adds to the measured volume; dividing by a larger volume gives a smaller density.'),
  mk(3, () => {
    const empty = pick([60, 72, 85, 90])
    const vol = pick([50, 100])
    const rho = pick([0.8, 1.2, 1.4])
    const full = Math.round((empty + vol * rho) * 10) / 10
    return { t: 'liquidCalc', calc: true, q: `An empty measuring cylinder has a mass of ${b(`${empty} g`)}. With ${b(`${vol} mL`)} of a liquid in it, the mass is ${b(`${nf(full)} g`)}. What is the density of the liquid?`, n: rho, dp: 2, unit: 'g/mL', why: [`Mass of liquid = ${nf(full)} − ${empty} = ${nf(full - empty)} g`, `ρ = ${nf(full - empty)} ÷ ${vol} = ${rho} g/mL`], meta: { empty, full, vol } }
  }),
]

const HINTS = {
  states: 'Think about shape, volume and whether it can flow.',
  particles: 'Think about how close the particles are, how they move and how strongly they attract each other.',
  change: 'Name the starting state and the final state, and whether energy is added or taken away.',
  curve: 'Flat parts of the graph are changes of state: 0 °C is melting, 100 °C is boiling.',
  water: 'Water has a density of 1 g/cm³; things less dense float on it.',
  density: 'Density = mass ÷ volume. Rearrange: mass = density × volume, volume = mass ÷ density.',
  measure: 'Mass from a balance; volume from a ruler (regular shapes) or water displacement (irregular shapes).',
}

export const MATTER_SKILLS: Skill[] = [
  {
    id: 'sci7-states',
    lessonNo: 1,
    title: 'States of matter',
    outcomes: [SOL],
    summary: 'Solids, liquids and gases, and water in all three states on Earth.',
    learn: {
      intro: `<p>Everything around us is <b>matter</b>: anything that has mass and takes up space. Matter usually exists in one of three <b>states</b>: <b>solid</b>, <b>liquid</b> or <b>gas</b>.</p><p>Water is the only common substance found naturally in all three states on Earth: ice and snow (solid), oceans, rivers and rain (liquid), and water vapour in the air (gas). As water moves through the water cycle it keeps changing state.</p>`,
      keyPoints: ['A <b>solid</b> has a fixed shape and a fixed volume, and cannot flow.', 'A <b>liquid</b> has a fixed volume but takes the shape of its container, and can flow.', 'A <b>gas</b> spreads out to fill its whole container (no fixed shape or volume), and can flow and be compressed.', 'Water vapour is invisible; the “steam” cloud above a kettle is tiny drops of liquid water.'],
      vocab: [
        ['matter', 'anything that has mass and takes up space'],
        ['state of matter', 'the form a substance is in: solid, liquid or gas'],
        ['water vapour', 'water in the gas state'],
      ],
    },
    gen: bank(HINTS.states, statesEntries),
    levels: { 1: 'Naming the state of everyday things and of water', 2: 'Describing and explaining the properties of each state', 3: 'Deciding the state from properties; matter and mass' },
  },
  {
    id: 'sci7-particles',
    lessonNo: 2,
    title: 'The particle model',
    outcomes: [SOL],
    summary: 'How particles are arranged, how they move and how strongly they attract in solids, liquids and gases.',
    learn: {
      intro: `<p>The <b>particle model</b> (particle theory) says all matter is made of tiny particles that are always moving. The particles attract each other. How close they are, how they move and how strongly they attract explains the properties of each state.</p>${particleBox('solid', 'Solid particles')} ${particleBox('liquid', 'Liquid particles')} ${particleBox('gas', 'Gas particles')}<p>Solid, liquid and gas (left to right).</p>`,
      keyPoints: [
        '<b>Solid:</b> particles packed closely in a regular pattern; they vibrate on the spot; very strong attractive forces.',
        '<b>Liquid:</b> particles close together but jumbled; they slide past each other; weaker attractive forces.',
        '<b>Gas:</b> particles far apart; they move quickly in all directions; very weak attractive forces.',
        'Heating gives particles more energy, so they move faster. The particles themselves do not get bigger.',
      ],
      vocab: [
        ['particle', 'a tiny piece of matter (an atom or a group of atoms)'],
        ['attractive force', 'the pull between particles that holds them together'],
        ['diffusion', 'particles spreading out from where there are many to where there are few'],
      ],
    },
    gen: bank(HINTS.particles, particleEntries),
    levels: { 1: 'Recognising each state from a particle diagram; arrangement and movement', 2: 'Attractive forces; explaining shape, flow, compression and expansion', 3: 'Choosing diagrams; diffusion and temperature; what a model is' },
  },
  {
    id: 'sci7-changes',
    lessonNo: 3,
    title: 'Changes of state',
    outcomes: [SOL],
    summary: 'Melting, freezing, evaporation, boiling, condensation, sublimation and deposition, in terms of particles.',
    learn: {
      intro: `<p>A substance changes state when energy is added (heating) or removed (cooling). The particles stay the same; only their arrangement and movement change, so a change of state is a <b>physical change</b> and no new substance is made.</p><ul><li>Heating: <b>melting</b> (solid → liquid), <b>evaporation</b> and <b>boiling</b> (liquid → gas), <b>sublimation</b> (solid → gas).</li><li>Cooling: <b>freezing</b> (liquid → solid), <b>condensation</b> (gas → liquid), <b>deposition</b> (gas → solid).</li></ul>`,
      keyPoints: ['Pure water melts (and freezes) at 0 °C and boils at 100 °C at sea level.', 'Evaporation happens at the surface at any temperature; boiling happens throughout the liquid at the boiling point.', 'Mass stays the same when a substance changes state.', 'Evaporation cools: the fastest particles escape and take energy with them.'],
      vocab: [
        ['melting point', 'the temperature at which a solid melts'],
        ['boiling point', 'the temperature at which a liquid boils'],
        ['sublimation', 'a solid changing straight into a gas'],
        ['deposition', 'a gas changing straight into a solid'],
      ],
    },
    gen: bank(HINTS.change, changeEntries),
    levels: { 1: 'Naming changes of state and spotting them in everyday life', 2: 'Explaining changes with particles; evaporation and boiling; conservation of mass', 3: 'Effects of pressure, salt and conditions on changes of state' },
  },
  {
    id: 'sci7-heating-curve',
    lessonNo: 4,
    title: 'Heating water: the heating curve',
    outcomes: [SOL, 'SC4-WS-04', 'SC4-WS-06'],
    summary: 'Read a temperature–time graph of ice heated to steam and explain the flat sections.',
    learn: {
      intro: `<p>In a classic investigation, crushed ice is heated steadily and its temperature is recorded every minute (or with a data logger). Graphing temperature against time gives a <b>heating curve</b>.</p>${heatingCurve({ ends: [2, 6, 12, 18, 20] })}<p>The temperature rises while the water is in one state (A, C, E), but stays flat while it changes state: at 0 °C as the ice melts (B) and at 100 °C as the water boils (D). During the flat sections the energy goes into overcoming the attractions between particles rather than raising the temperature.</p>`,
      keyPoints: ['Time goes on the horizontal axis, temperature on the vertical axis.', 'Flat sections are changes of state: melting at 0 °C, boiling at 100 °C.', 'During a change of state, two states are present together.', 'Work safely: safety glasses, a stable tripod, never heat a sealed container, and let equipment cool before touching.'],
      vocab: [
        ['heating curve', 'a graph of temperature against time as a substance is heated'],
        ['data logger', 'a device that records measurements automatically'],
        ['fair test', 'an investigation where only one variable is changed'],
      ],
    },
    gen: bank(HINTS.curve, curveEntries),
    levels: { 1: 'Reading sections and temperatures on a heating curve', 2: 'Reading times; explaining flat sections; equipment and safety', 3: 'Interpreting the graph at a given time; fair tests and conclusions' },
  },
  {
    id: 'sci7-water',
    lessonNo: 5,
    title: 'Properties of water',
    outcomes: [SOL],
    summary: 'Density, buoyancy and surface tension, and why ice floats.',
    learn: {
      intro: `<p>Water has some unusual and important physical properties.</p><ul><li><b>Density:</b> pure water has a density of 1 g/cm³ (1 g for every mL). Substances less dense than water float on it; denser ones sink.</li><li><b>Buoyancy:</b> water pushes up on objects in it. Sea water, with dissolved salt, is denser and pushes up more.</li><li><b>Surface tension:</b> water particles at the surface pull strongly on each other, forming a “skin” that lets small insects walk on water and makes drops round.</li><li>Unlike most substances, water <b>expands when it freezes</b>, so ice (0.92 g/cm³) floats.</li></ul>`,
      keyPoints: ['Water: 1 g/cm³. Less dense than water → floats; denser → sinks.', 'Ice floats, so lakes freeze from the top and life survives below.', 'Detergent weakens surface tension.', 'Hollow objects such as ships float because their average density (including the air inside) is less than water.'],
      vocab: [
        ['buoyancy', 'the upward push of a liquid or gas on an object in it'],
        ['surface tension', 'the pull between particles at a liquid’s surface that makes it act like a stretched skin'],
      ],
    },
    gen: bank(HINTS.water, waterEntries),
    levels: { 1: 'Density of water, buoyancy, surface tension and floating ice', 2: 'Explaining floating ships, sea water, icebergs and freezing', 3: 'Predicting layers and floating from densities' },
  },
  {
    id: 'sci7-density',
    lessonNo: 6,
    title: 'Density',
    outcomes: [SOL],
    summary: 'Calculate density with ρ = m/V, and use it to compare materials and predict floating.',
    learn: {
      intro: `<p><b>Density</b> tells us how much mass is packed into a certain volume. It is calculated with</p><p class="big">ρ = m ÷ V</p><p>where ρ (the Greek letter rho) is density, m is mass and V is volume. With mass in grams and volume in cm³, density is in g/cm³.</p><p>Example: a 54 g block of aluminium has a volume of 20 cm³. ρ = 54 ÷ 20 = 2.7 g/cm³.</p>`,
      keyPoints: ['ρ = m ÷ V, so m = ρ × V and V = m ÷ ρ.', 'Density is a property of a material: cutting a piece in half doesn’t change it.', 'Every pure substance has its own density, so density helps identify materials.', 'Some densities (g/cm³): water 1.0, ice 0.92, aluminium 2.7, iron 7.9, copper 9.0, lead 11.3, gold 19.3.'],
      vocab: [
        ['density', 'mass per unit volume, ρ = m/V'],
        ['mass', 'the amount of matter in an object, in g or kg'],
        ['volume', 'the amount of space an object takes up, in cm³ or mL'],
      ],
    },
    gen: bank(HINTS.density, densityEntries),
    levels: { 1: 'The density formula and unit; calculating density', 2: 'Rearranging for mass or volume; float or sink; comparing materials', 3: 'Identifying materials; unit conversions; density as a property' },
  },
  {
    id: 'sci7-measure-density',
    lessonNo: 7,
    title: 'Measuring density',
    outcomes: [SOL, 'SC4-WS-04'],
    summary: 'Measure mass and volume of regular and irregular objects and of liquids to find their density.',
    learn: {
      intro: `<p>To measure density you need a <b>mass</b> (from an electronic balance) and a <b>volume</b>.</p><ul><li><b>Regular shapes:</b> measure with a ruler and calculate, e.g. V = length × width × height for a block.</li><li><b>Irregular shapes:</b> use <b>water displacement</b>. Lower the object into a measuring cylinder: the rise in water level is its volume (1 mL = 1 cm³). Big objects go in a displacement (overflow) can.</li><li><b>Liquids:</b> weigh an empty measuring cylinder, add a measured volume of liquid, weigh again and subtract.</li></ul>`,
      keyPoints: ['Read a measuring cylinder at eye level, at the bottom of the meniscus.', '1 mL = 1 cm³.', 'Repeat measurements and average them to make results more reliable.', 'Compare your calculated densities with the values in a data book.'],
      vocab: [
        ['displacement', 'the water pushed aside by an object, equal to the object’s volume'],
        ['meniscus', 'the curved surface of a liquid in a narrow container'],
      ],
    },
    gen: bank(HINTS.measure, measureEntries),
    levels: { 1: 'Equipment, reading a measuring cylinder, volume of a block', 2: 'Water displacement; density of a rock; method for a liquid', 3: 'Floating objects, errors and calculations for liquids' },
  },
]
