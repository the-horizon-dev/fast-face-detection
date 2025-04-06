/**
 * Enumeração dos grupos de landmarks faciais
 */
export enum FacialLandmarkGroup {
  JAW_LINE = 'jawline',
  EYEBROWS = 'eyebrows',
  NOSE = 'nose',
  EYES = 'eyes',
  MOUTH = 'mouth'
}

/**
 * Mapeamento dos índices dos pontos faciais por grupo no modelo MediaPipe Face Mesh
 */
export const FACIAL_LANDMARK_INDICES_BY_GROUP: Record<FacialLandmarkGroup, number[]> = {
  [FacialLandmarkGroup.JAW_LINE]: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  [FacialLandmarkGroup.EYEBROWS]: [336, 296, 334, 293, 300, 276, 283, 282, 295, 285],
  [FacialLandmarkGroup.NOSE]: [168, 6, 197, 195, 5, 4, 1, 19, 94, 2],
  [FacialLandmarkGroup.EYES]: [382, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 2],
  [FacialLandmarkGroup.MOUTH]: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]
};

/**
 * Lista completa de índices de landmarks faciais (união de todos os grupos)
 */
export const FACIAL_LANDMARK_INDICES: number[] = Object.values(FACIAL_LANDMARK_INDICES_BY_GROUP).flat(); 