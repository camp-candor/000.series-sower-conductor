import { CharacterModel } from '../character.model.js';
import CharacterBit from '../fce/character.bit.js';
import State from '../../99.core/state.js';

export const initCharacter = (cpy: CharacterModel, bal: CharacterBit, _ste: State) => {
  if (bal.slv) bal.slv({ characterBit: { idx: 'init-character', val: 1 } });
  return cpy;
};

export const updateCharacter = (cpy: CharacterModel, bal: CharacterBit, _ste: State) => {
  if (bal.slv) bal.slv({ characterBit: { idx: 'update-character', val: 1 } });
  return cpy;
};

