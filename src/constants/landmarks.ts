/**
 * Facial landmark definitions for the MediaPipe face mesh model
 */

/**
 * Enumeration of facial landmark groups
 */
export enum FacialLandmarkGroup {
  JAW_LINE = 'jawline',
  EYEBROWS = 'eyebrows',
  NOSE = 'nose',
  EYES = 'eyes',
  MOUTH = 'mouth',
  FACE_OVAL = 'face_oval',
  LEFT_EYE = 'left_eye',
  RIGHT_EYE = 'right_eye',
  LIPS = 'lips',
  LEFT_EYEBROW = 'left_eyebrow',
  RIGHT_EYEBROW = 'right_eyebrow',
  FOREHEAD = 'forehead',
  CHEEKS = 'cheeks',
  EYE_CORNERS = 'eye_corners'
}

/**
 * Indexes of facial points by group in the MediaPipe Face Mesh model
 * These indices match the TensorFlow.js face-landmarks-detection model
 */
const LANDMARK_INDEXES = {
  FACE_OVAL: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
  LEFT_EYE: [263, 249, 390, 373, 374, 380, 381, 382, 362, 466, 388, 387, 386, 385, 384, 398],
  RIGHT_EYE: [33, 7, 163, 144, 145, 153, 154, 155, 133, 246, 161, 160, 159, 158, 157, 173],
  LIPS: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 185, 40, 39, 37, 0, 267, 269, 270, 409, 78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 191, 80, 81, 82, 13, 312, 311, 310, 415],
  LEFT_EYEBROW: [276, 283, 282, 295, 285, 300, 293, 334, 296, 336],
  RIGHT_EYEBROW: [46, 53, 52, 65, 55, 70, 63, 105, 66, 107],
  NOSE: [168, 6, 197, 195, 5, 4, 1, 19, 94, 2],
  MOUTH: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146],
  FOREHEAD: [10, 8, 7, 55, 193, 122, 9, 151, 109, 108, 69, 67, 103, 104, 54, 68],
  CHEEKS: [342, 207, 206, 216, 215, 138, 135, 210, 212, 150, 149, 176, 152, 377, 400, 378],
  EYE_CORNERS: [33, 133, 173, 157, 158, 159, 160, 161, 246, 163, 144, 145, 153, 154, 155, 133]
};

/**
 * Mapping of facial point indexes by group
 */
export const FACIAL_LANDMARK_INDEXES_BY_GROUP: Record<FacialLandmarkGroup, number[]> = {
  [FacialLandmarkGroup.JAW_LINE]: LANDMARK_INDEXES.FACE_OVAL,
  [FacialLandmarkGroup.EYEBROWS]: [...LANDMARK_INDEXES.LEFT_EYEBROW, ...LANDMARK_INDEXES.RIGHT_EYEBROW],
  [FacialLandmarkGroup.NOSE]: LANDMARK_INDEXES.NOSE,
  [FacialLandmarkGroup.EYES]: [...LANDMARK_INDEXES.LEFT_EYE, ...LANDMARK_INDEXES.RIGHT_EYE],
  [FacialLandmarkGroup.MOUTH]: LANDMARK_INDEXES.MOUTH,
  [FacialLandmarkGroup.FACE_OVAL]: LANDMARK_INDEXES.FACE_OVAL,
  [FacialLandmarkGroup.LEFT_EYE]: LANDMARK_INDEXES.LEFT_EYE,
  [FacialLandmarkGroup.RIGHT_EYE]: LANDMARK_INDEXES.RIGHT_EYE,
  [FacialLandmarkGroup.LIPS]: LANDMARK_INDEXES.LIPS,
  [FacialLandmarkGroup.LEFT_EYEBROW]: LANDMARK_INDEXES.LEFT_EYEBROW,
  [FacialLandmarkGroup.RIGHT_EYEBROW]: LANDMARK_INDEXES.RIGHT_EYEBROW,
  [FacialLandmarkGroup.FOREHEAD]: LANDMARK_INDEXES.FOREHEAD,
  [FacialLandmarkGroup.CHEEKS]: LANDMARK_INDEXES.CHEEKS,
  [FacialLandmarkGroup.EYE_CORNERS]: LANDMARK_INDEXES.EYE_CORNERS
};

/**
 * Complete list of facial landmark indexes
 */
export const FACIAL_LANDMARK_INDEXES: number[] = Array.from(new Set(Object.values(FACIAL_LANDMARK_INDEXES_BY_GROUP).flat()));

/**
 * Maps TensorFlow.js model feature extraction to our feature groups
 */
export const TENSORFLOW_FEATURE_MAPPING = {
  leftEyebrow: FacialLandmarkGroup.LEFT_EYEBROW,
  rightEyebrow: FacialLandmarkGroup.RIGHT_EYEBROW,
  leftEye: FacialLandmarkGroup.LEFT_EYE,
  rightEye: FacialLandmarkGroup.RIGHT_EYE,
  lips: FacialLandmarkGroup.LIPS,
  faceOval: FacialLandmarkGroup.FACE_OVAL
}; 