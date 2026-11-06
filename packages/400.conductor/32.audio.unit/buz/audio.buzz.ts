// packages/400.conductor/32.audio.unit/buz/audio.buzz.ts
import { AudioModel } from '../audio.model.js';
import AudioBit from '../fce/audio.bit.js';
import {
  ExposureSheetDocument,
  ExposureSheetReceipt,
  ExposureSheetShotTrack,
} from '../fce/audio.interface.js';
import { ExposureSheetDocumentSchema } from '../val/audio.val.js';
import {
  computeMultiWindowDuckingCurve,
  calculateDuckedVolume,
} from './duckingCalculator.buzz.js';
import State from '../../99.core/state.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

export const assembleExposureSheetDocument = (
  seriesId: string,
  sceneId: string,
  windows: any[],
  foleyEvents: any[],
  ambientLoopPath = 'audio/ambient/machinery_bed.wav',
  baseVolume = 0.4,
): ExposureSheetDocument => {
  const lastWindow = windows[windows.length - 1];
  const totalFrames = lastWindow ? lastWindow.to_frame + 1 : 24;
  const totalDurationMs = Math.round((totalFrames / 24) * 1000);
  const duckedVolume = calculateDuckedVolume(baseVolume);
  const duckingKeyframes = computeMultiWindowDuckingCurve(windows, totalFrames, baseVolume);

  const track1: ExposureSheetShotTrack[] = windows.map((w) => ({
    shot_id: w.shot_id,
    from_frame: w.from_frame,
    to_frame: w.to_frame,
    target_frames: w.to_frame - w.from_frame + 1,
    dialogue_stem: w.stem_path,
    dialogue_sha256: w.sha256 || '0000000000000000000000000000000000000000000000000000000000000000',
    foley_events: foleyEvents.filter((f) => f.shot_id === w.shot_id),
  }));

  return {
    schema_version: '1.0.0',
    series_id: seriesId,
    scene_id: sceneId,
    total_frames: totalFrames,
    total_duration_ms: totalDurationMs,
    tracks: {
      track1_dialogue: track1,
      track2_foley: foleyEvents,
      track3_ambient: {
        ambient_loop_path: ambientLoopPath,
        base_volume: baseVolume,
        ducked_volume: duckedVolume,
        ducking_keyframes: duckingKeyframes,
      },
    },
  };
};

export const initAudio = (cpy: AudioModel, bal: AudioBit, ste: State) => {
  if (bal.slv != null) bal.slv({ audBit: { idx: 'init-audio', val: 1 } });
  return cpy;
};

export const updateAudio = (cpy: AudioModel, bal: AudioBit, ste: State) => {
  if (bal.slv != null) bal.slv({ audBit: { idx: 'update-audio' } });
  return cpy;
};

export const assembleAcousticExposureSheet = (cpy: AudioModel, bal: AudioBit, ste: State) => {
  cpy.isAssembling = true;
  try {
    const sceneId = bal.dat?.scene_id || 'ep01_sc01';
    const seriesId = bal.dat?.series_id || 'under-the-floorboards';
    const windows = bal.dat?.dialogue_windows || [];
    const foleyCues = bal.dat?.foley_cues || [];
    const ambientLoop = bal.dat?.ambient_loop_path || 'audio/ambient/machinery_bed.wav';

    const doc = assembleExposureSheetDocument(seriesId, sceneId, windows, foleyCues, ambientLoop);
    ExposureSheetDocumentSchema.parse(doc);

    const draftsDir = path.resolve('drafts');
    if (!fs.existsSync(draftsDir)) {
      fs.mkdirSync(draftsDir, { recursive: true });
    }

    const finalPath = path.join(draftsDir, 'exposure_sheet.json');
    const stagingPath = `${finalPath}.tmp`;

    const serialized = JSON.stringify(doc, null, 2);
    fs.writeFileSync(stagingPath, serialized, 'utf8');
    fs.renameSync(stagingPath, finalPath);

    const sha256 = crypto.createHash('sha256').update(serialized).digest('hex');

    const receipt: ExposureSheetReceipt = {
      ok: true,
      scene_id: sceneId,
      total_frames: doc.total_frames,
      manifest_path: finalPath,
      ducking_point_count: doc.tracks.track3_ambient.ducking_keyframes.length,
      foley_event_count: foleyCues.length,
      sha256,
    };

    cpy.lastExposureSheet = doc;
    cpy.lastReceipt = receipt;
    cpy.isAssembling = false;

    if (global.LIBRARY) {
      global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [EXPOSURE-SHEET] [OK] Compiled [${sceneId}]: ${doc.total_frames} frames | DuckingKeyframes=${receipt.ducking_point_count} | Foley=${receipt.foley_event_count}`,
      });
      global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [EXPOSURE-SHEET] Committed to drafts/exposure_sheet.json (SHA: ${sha256.substring(0, 12)}...)`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        audBit: {
          idx: 'assemble-acoustic-exposure-sheet-success',
          dat: { receipt, exposureSheet: doc },
        },
      });
    }
  } catch (err: any) {
    cpy.isAssembling = false;
    const errorMsg = err.message || String(err);
    if (global.LIBRARY) {
      global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `:: [EXPOSURE-SHEET] [FAIL] Exposure sheet assembly faulted: ${errorMsg}`,
      });
    }
    if (bal.slv != null) {
      bal.slv({
        audBit: {
          idx: 'assemble-acoustic-exposure-sheet-error',
          src: errorMsg,
        },
      });
    }
  }

  return cpy;
};

