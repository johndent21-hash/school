// Blended booklet, Chapter 6 Geometrical figures. Six pages a lesson: grids and shapes need the room.
const blend = require('../../lib/blend');

const D = (text, pairs, hw, cols = 3) => ({ text, cols, items: pairs.map((p) => p[0]), ans: pairs.map((p) => p[1]), hw });

module.exports = blend(require('../../year7/ch06-geometrical-figures/chapter.js'), {
  fileName: 'Year7-Ch06-Geometrical-figures-Lessons', pages: 6,
  more: {
    '6.01': { stems: ['Reflect, then translate the shape.', 'Rotate the shape about O.', 'Reflect, then rotate the shape.'],
      drill: D('Quick drill: a point is at (3, 2) on a grid. Where is it after the translation?', [['2 right', '(5, 2)'], ['3 up', '(3, 5)'], ['1 left, 2 down', '(2, 0)'], ['4 right, 1 up', '(7, 3)'], ['3 left, 2 up', '(0, 4)'], ['5 right, 2 down', '(8, 0)']], ['2 left, 4 up', '(1, 6)', 'A point at (3, 2) is translated. Where is it now?']) },
    '6.02': { stems: ['Do both transformations in order.', 'Do both transformations, then compare.', 'Do all three transformations, then describe a combination.'],
      drill: D('Quick drill: name the single transformation.', [['a flip', 'reflection'], ['a slide', 'translation'], ['a turn', 'rotation'], ['a mirror image', 'reflection'], ['moves every point 3 right', 'translation'], ['turns about a point', 'rotation']], ['a slide 4 units up', 'translation', 'Name the transformation.']) },
    '6.03': { stems: ['Draw every axis of symmetry.', 'How many axes of symmetry?', 'How many axes of symmetry?'],
      drill: D('Quick drill: how many axes of symmetry?', [['square', '4'], ['rectangle', '2'], ['equilateral triangle', '3'], ['isosceles triangle', '1'], ['regular hexagon', '6'], ['parallelogram', '0'], ['kite', '1'], ['circle', 'infinitely many'], ['regular pentagon', '5']], ['rhombus', '2', 'How many axes of symmetry?']) },
    '6.04': { stems: ['Give the order of rotational symmetry.', 'Give the order of rotational symmetry.', 'Give the order, then find the angle.'],
      drill: D('Quick drill: order of rotational symmetry (write 1 for none).', [['square', '4'], ['rectangle', '2'], ['equilateral triangle', '3'], ['kite', '1'], ['regular hexagon', '6'], ['parallelogram', '2'], ['letter S', '2'], ['letter A', '1'], ['regular octagon', '8']], ['rhombus', '2', 'Give the order of rotational symmetry.']) },
    '6.05': { stems: ['Classify each triangle by its sides and by its angles.', 'Classify the triangle, then find the equal angles.', 'Classify each triangle from its description.'],
      drill: D('Quick drill: classify by angles (acute, right or obtuse).', [['60°, 60°, 60°', 'acute'], ['90°, 45°, 45°', 'right'], ['120°, 30°, 30°', 'obtuse'], ['50°, 60°, 70°', 'acute'], ['100°, 40°, 40°', 'obtuse'], ['30°, 60°, 90°', 'right']], ['25°, 35°, 120°', 'obtuse', 'Classify the triangle by its angles.']) },
    '6.06': { stems: ['Find the unknown angle. Angles in a triangle add to 180°.', 'Find the unknown angles.', 'Find the unknown angles in the isosceles triangles.'],
      drill: D('Quick drill: two angles of a triangle are given. Find the third.', [['50° and 60°', '70°'], ['90° and 35°', '55°'], ['45° and 45°', '90°'], ['100° and 30°', '50°'], ['72° and 72°', '36°'], ['25° and 115°', '40°']], ['38° and 97°', '45°', 'Two angles of a triangle are given. Find the third.']) },
    '6.07': { stems: ['Find the exterior angle.', 'Find the unknown interior angle.', 'Find both unknowns, then explain.'],
      drill: D('Quick drill: interior opposite angles are given. Find the exterior angle.', [['40° and 70°', '110°'], ['55° and 65°', '120°'], ['30° and 90°', '120°'], ['62° and 58°', '120°'], ['25° and 45°', '70°'], ['80° and 35°', '115°']], ['47° and 68°', '115°', 'The interior opposite angles are given. Find the exterior angle.']) },
    '6.08': { stems: ['Convex or non-convex? Name the quadrilateral.', 'Name each quadrilateral.', 'Give the definitions.'],
      drill: D('Quick drill: name the quadrilateral.', [['4 equal sides, 4 right angles', 'square'], ['both pairs of opposite sides parallel', 'parallelogram'], ['one pair of parallel sides', 'trapezium'], ['parallelogram with 4 equal sides', 'rhombus'], ['parallelogram with a right angle', 'rectangle'], ['two pairs of equal adjacent sides', 'kite']], ['a rectangle with 4 equal sides', 'square', 'Name the quadrilateral.'], 2) },
    '6.09': { stems: ['Find the unknown angle. Angles in a quadrilateral add to 360°.', 'Find the unknown angle.', 'Explain, then find the angles.'],
      drill: D('Quick drill: three angles of a quadrilateral are given. Find the fourth.', [['90°, 90°, 90°', '90°'], ['100°, 80°, 100°', '80°'], ['70°, 110°, 95°', '85°'], ['120°, 60°, 60°', '120°'], ['85°, 85°, 100°', '90°'], ['45°, 135°, 90°', '90°']], ['110°, 75°, 105°', '70°', 'Three angles of a quadrilateral are given. Find the fourth.']) },
    '6.10': { stems: ['Use the properties of a parallelogram.', 'Name all the quadrilaterals that fit.', 'Name all the quadrilaterals that fit.'],
      drill: D('Quick drill: true or false?', [['A square is a rectangle.', 'true'], ['A rectangle is a square.', 'false'], ['A rhombus is a parallelogram.', 'true'], ['A kite has parallel sides.', 'false'], ['A square is a rhombus.', 'true'], ['A trapezium is a parallelogram.', 'false']], ['A rectangle is a parallelogram.', 'true', 'True or false?'], 2) },
  },
});
