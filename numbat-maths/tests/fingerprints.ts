// Prints a fingerprint of a game for every exercise, so a change that should not alter any question can be checked.
import { ALL_GAME_SETS } from '../src/content/games'
import { buildGame, gameCheck } from '../src/lib/game/build'
for (const set of ALL_GAME_SETS) for (const seed of [1, 77, 4242]) console.log(set.id, seed, gameCheck(buildGame(set, seed, 10, true)))
