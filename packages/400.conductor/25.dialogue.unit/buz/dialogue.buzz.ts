import { DialogueModel } from '../dialogue.model.js';
import DialogueBit from '../fce/dialogue.bit.js';
import State from '../../99.core/state.js';

export const initDialogue = (cpy: DialogueModel, bal: DialogueBit, _ste: State) => {
  if (bal.slv) bal.slv({ dialogueBit: { idx: 'init-dialogue', val: 1 } });
  return cpy;
};

export const updateDialogue = (cpy: DialogueModel, bal: DialogueBit, _ste: State) => {
  if (bal.slv) bal.slv({ dialogueBit: { idx: 'update-dialogue', val: 1 } });
  return cpy;
};
