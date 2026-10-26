import type { AnimationClip } from "three";

/**
 * glTF can contain "animations" that only describe a single static pose.
 * Such clips have a duration of ~1/30 s and make the progress thumb race
 * around even though the model never moves. Don't present them as playback.
 *
 * We also reject multi-key tracks whose values never change, as exporters
 * sometimes repeat an identical pose at several timestamps.
 */
export function isPlayableClip(clip: AnimationClip): boolean {
  if (!Number.isFinite(clip.duration) || clip.duration <= 0) return false;

  return clip.tracks.some((track) => {
    const { times, values } = track;
    if (times.length < 2 || times[times.length - 1]! <= times[0]!) {
      return false;
    }

    const stride = track.getValueSize();
    if (stride <= 0) return false;

    // A changing keyframe value is required to produce actual movement.
    for (let frame = 1; frame < times.length; frame++) {
      for (let component = 0; component < stride; component++) {
        if (Math.abs(values[frame * stride + component]! - values[component]!) > 1e-6) {
          return true;
        }
      }
    }
    return false;
  });
}

export function clampAnimationTime(time: number, duration: number): number {
  if (!Number.isFinite(time) || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(time, duration));
}
