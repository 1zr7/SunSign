/// <reference lib="webworker" />
import { normalizeLandmarks } from '../utils/landmarkNormalizer';

/**
 * Preprocess Worker
 * =================
 * This script runs in the background. It takes raw MediaPipe Holistic data
 * and builds the exact 144-dimensional feature array needed by the Dual LSTM.
 */

const normalizedBuffer: number[][] = [];
const mirroredBuffer: number[][] = [];
const MAX_BUFFER_SIZE = 20;

let lastPushTime = 0;
const TIME_BETWEEN_FRAMES_MS = 60; // We only save a frame every 60ms to keep it smooth

const BODY_FEATURES = 9;
const HAND_FEATURES = 63;
const SINGLE_HAND = HAND_FEATURES + BODY_FEATURES;

function computeBodyContext(handLandmarks: any[], poseLandmarks: any[] | undefined): number[] {
  if (!poseLandmarks || poseLandmarks.length < 25 || !handLandmarks || handLandmarks.length === 0) {
    return Array(BODY_FEATURES).fill(0.0);
  }

  const nose = poseLandmarks[0];
  const l_shoulder = poseLandmarks[11];
  const r_shoulder = poseLandmarks[12];
  const l_elbow    = poseLandmarks[13];
  const r_elbow    = poseLandmarks[14];
  const l_wrist_p  = poseLandmarks[15];
  const r_wrist_p  = poseLandmarks[16];
  const l_hip      = poseLandmarks[23];
  const r_hip      = poseLandmarks[24];

  const sh_mid_x = (l_shoulder.x + r_shoulder.x) / 2;
  const sh_mid_y = (l_shoulder.y + r_shoulder.y) / 2;
  const sh_mid_z = (l_shoulder.z + r_shoulder.z) / 2;

  let shoulder_width = Math.sqrt(
    Math.pow(l_shoulder.x - r_shoulder.x, 2) +
    Math.pow(l_shoulder.y - r_shoulder.y, 2) +
    Math.pow(l_shoulder.z - r_shoulder.z, 2)
  );
  if (shoulder_width < 1e-6) shoulder_width = 1.0;

  const hand_wrist = handLandmarks[0];

  const wrist_nose_dx = (hand_wrist.x - nose.x) / shoulder_width;
  const wrist_nose_dy = (hand_wrist.y - nose.y) / shoulder_width;
  const wrist_nose_dz = (hand_wrist.z - nose.z) / shoulder_width;

  const wrist_sh_dx = (hand_wrist.x - sh_mid_x) / shoulder_width;
  const wrist_sh_dy = (hand_wrist.y - sh_mid_y) / shoulder_width;
  const wrist_sh_dz = (hand_wrist.z - sh_mid_z) / shoulder_width;

  const hip_mid_y = (l_hip.y + r_hip.y) / 2;
  let body_height = Math.abs(nose.y - hip_mid_y);
  if (body_height < 1e-6) body_height = 1.0;
  
  let hand_height = 1.0 - (hand_wrist.y - nose.y) / body_height;
  hand_height = Math.max(0.0, Math.min(2.0, hand_height));

  const hand_lateral = (hand_wrist.x - sh_mid_x) / shoulder_width;

  const dist_to_left = Math.abs(hand_wrist.x - l_wrist_p.x) + Math.abs(hand_wrist.y - l_wrist_p.y);
  const dist_to_right = Math.abs(hand_wrist.x - r_wrist_p.x) + Math.abs(hand_wrist.y - r_wrist_p.y);

  let shoulder = r_shoulder, elbow = r_elbow, wrist = r_wrist_p;
  if (dist_to_left < dist_to_right) {
      shoulder = l_shoulder; elbow = l_elbow; wrist = l_wrist_p;
  }

  const v1 = [shoulder.x - elbow.x, shoulder.y - elbow.y, shoulder.z - elbow.z];
  const v2 = [wrist.x - elbow.x, wrist.y - elbow.y, wrist.z - elbow.z];
  
  const dot = v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
  const mag1 = Math.sqrt(v1[0]*v1[0] + v1[1]*v1[1] + v1[2]*v1[2]);
  const mag2 = Math.sqrt(v2[0]*v2[0] + v2[1]*v2[1] + v2[2]*v2[2]);
  const cos_angle = dot / (mag1 * mag2 + 1e-8);
  const elbow_angle = Math.acos(Math.max(-1.0, Math.min(1.0, cos_angle))) / Math.PI;

  return [
      wrist_nose_dx, wrist_nose_dy, wrist_nose_dz,
      wrist_sh_dx,   wrist_sh_dy,   wrist_sh_dz,
      hand_height,   hand_lateral,   elbow_angle
  ];
}

self.onmessage = (e: MessageEvent) => {
  const res = e.data;
  
  const rawLM = res.multiHandLandmarks || [];
  const rawHed = res.multiHandedness || [];

  if (rawLM.length > 0) {
    const hands = rawLM.map((hand: any, i: number) => {
      const mpLabel: string = rawHed?.[i]?.label ?? 'Left';
      const isRight = mpLabel === 'Left'; 
      return {
        normalized: normalizeLandmarks(hand, false),
        mirrored:   normalizeLandmarks(hand, true),
        isRight,
      };
    });
    
    const now = Date.now();
    if (now - lastPushTime >= TIME_BETWEEN_FRAMES_MS) {
      lastPushTime = now;
      
      // Build Dual 144 Vector
      let leftHandFeatures = Array(SINGLE_HAND).fill(0.0);
      let rightHandFeatures = Array(SINGLE_HAND).fill(0.0);

      // In Holistic, 'Left' means Image-Left which usually is the right hand.
      if (res.leftHandLandmarks) {
         const norm = normalizeLandmarks(res.leftHandLandmarks, false);
         const context = computeBodyContext(res.leftHandLandmarks, res.poseLandmarks);
         leftHandFeatures = [...norm, ...context];
      }
      
      if (res.rightHandLandmarks) {
         const norm = normalizeLandmarks(res.rightHandLandmarks, false);
         const context = computeBodyContext(res.rightHandLandmarks, res.poseLandmarks);
         // Note: The Python script builds left+right, we just append them.
         rightHandFeatures = [...norm, ...context];
      }
      
      // Left hand (72) + Right hand (72)
      let combined = [...leftHandFeatures, ...rightHandFeatures];

      // Build mirrored 144 vector if needed (legacy, or dual_lstm if it wants mirrored)
      // Our Python extraction natively swaps left and right blocks for horizontal flip.
      // Easiest "mirrored" sequence is to swap Left and Right completely, and flip X coords.
      let mirroredLeft = [...leftHandFeatures];
      let mirroredRight = [...rightHandFeatures];
      
      for(let i = 0; i<63; i+=3) { mirroredLeft[i] *= -1; mirroredRight[i] *= -1; }
      mirroredLeft[63] *= -1; mirroredLeft[66] *= -1; mirroredLeft[70] *= -1;
      mirroredRight[63] *= -1; mirroredRight[66] *= -1; mirroredRight[70] *= -1;
      let combinedMirrored = [...mirroredRight, ...mirroredLeft];

      normalizedBuffer.push(combined);
      mirroredBuffer.push(combinedMirrored);
      
      if (normalizedBuffer.length > MAX_BUFFER_SIZE) {
        normalizedBuffer.shift();
        mirroredBuffer.shift();
      }
    }
    
    self.postMessage({ 
      hands,
      lstmSequence: normalizedBuffer.length === MAX_BUFFER_SIZE ? {
        normalized: [...normalizedBuffer],
        mirrored: [...mirroredBuffer]
      } : null
    });
  } else {
    normalizedBuffer.length = 0;
    mirroredBuffer.length = 0;
    self.postMessage({ hands: [], lstmSequence: null });
  }
};
