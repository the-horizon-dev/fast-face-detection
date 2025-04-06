# @the-horizon-dev/fast-face-detection

Um pacote leve para detecção facial e landmarks usando os modelos oficiais MediaPipe do TensorFlow.js.

## Características

- Detecção facial usando o modelo MediaPipe Face Detector (BlazeFace)
- Reconhecimento de pontos faciais usando MediaPipe Face Mesh
- Estrutura orientada a objetos com classes reutilizáveis
- API simplificada e API avançada para mais controle
- Utilitários para manipulação de imagens e visualização
- Suporte completo a TypeScript
- Testes unitários e de integração
- Performance otimizada para aplicações web e mobile

## Instalação

```bash
npm install @the-horizon-dev/fast-face-detection
```

## Uso Básico

Para uso rápido, use a API simplificada:

```typescript
import { mediapipeFace } from '@the-horizon-dev/fast-face-detection';

// Detectar apenas faces
const img = document.getElementById('myImage') as HTMLImageElement;
const detections = await mediapipeFace.detectFaces(img);

// OU detectar faces com landmarks
const facesWithLandmarks = await mediapipeFace.detectFacesWithLandmarks(img, {
  maxFaces: 3, // Opcional: definir número máximo de faces
  scoreThreshold: 0.7 // Opcional: ajustar limiar de confiança
});

// Processar os resultados
facesWithLandmarks.forEach(detection => {
  const { box, score } = detection.detection;
  const { positions } = detection.landmarks;
  
  console.log('Face detectada:', {
    box: { x: box.x, y: box.y, width: box.width, height: box.height },
    score,
    landmarks: positions
  });
});
```

## Uso Avançado

Para mais controle, use as classes diretamente:

```typescript
import { FaceAPI, ImageUtils, FacialLandmarkGroup, FACIAL_LANDMARK_INDICES_BY_GROUP } from '@the-horizon-dev/fast-face-detection';

// Criar instância da API com configurações personalizadas
const faceAPI = new FaceAPI({
  maxFaces: 5,
  scoreThreshold: 0.7,
  enableTracking: true
});

// Processar uma imagem
const img = document.getElementById('myImage') as HTMLImageElement;
const canvas = ImageUtils.elementToCanvas(img);

// Detectar faces com landmarks
const facesWithLandmarks = await faceAPI.detectFacesWithLandmarks(img);

// Visualizar resultados
facesWithLandmarks.forEach(face => {
  // Desenhar caixa delimitadora
  ImageUtils.drawBox(canvas, face.detection.box);
  
  // Desenhar apenas os pontos dos olhos
  const eyePoints = face.landmarks.positions.filter((_, i) => 
    FACIAL_LANDMARK_INDICES_BY_GROUP[FacialLandmarkGroup.EYES].includes(i)
  );
  ImageUtils.drawLandmarks(canvas, eyePoints, 'rgba(0, 0, 255, 0.8)', 3);
});
```

## API

### API Simplificada

#### mediapipeFace.detectFaces(input, options?)

Detecta faces em uma imagem ou vídeo usando o modelo MediaPipe Face Detector.

#### mediapipeFace.detectFacesWithLandmarks(input, options?)

Detecta faces e seus landmarks em uma imagem ou vídeo usando MediaPipe Face Mesh.

### Classes

#### FaceAPI

Classe principal que integra detecção facial e landmarks.

```typescript
class FaceAPI {
  constructor(options?: DetectionOptions);
  detectFaces(input: MediaElement, options?: DetectionOptions): Promise<FaceDetection[]>;
  detectFacesWithLandmarks(input: MediaElement, options?: DetectionOptions): Promise<FaceDetectionWithLandmarks[]>;
  updateOptions(options: DetectionOptions): void;
  getOptions(): DetectionOptions;
}
```

#### FaceDetector

Classe responsável pela detecção facial.

```typescript
class FaceDetector {
  constructor(options?: DetectionOptions);
  detectFaces(input: MediaElement): Promise<FaceDetection[]>;
  updateOptions(options: DetectionOptions): void;
}
```

#### LandmarkDetector

Classe responsável pela detecção de landmarks faciais.

```typescript
class LandmarkDetector {
  constructor(options?: DetectionOptions);
  detectLandmarks(input: MediaElement): Promise<Array<{ positions: Point[] }>>;
  updateOptions(options: DetectionOptions): void;
}
```

#### ImageUtils

Classe utilitária para manipulação de imagens e visualização.

```typescript
class ImageUtils {
  static cropFace(canvas: HTMLCanvasElement, box: Box, margin?: number): HTMLCanvasElement;
  static drawLandmarks(canvas: HTMLCanvasElement, points: Point[], color?: string, size?: number): void;
  static drawBox(canvas: HTMLCanvasElement, box: Box, color?: string, lineWidth?: number): void;
  static elementToCanvas(element: MediaElement): HTMLCanvasElement;
}
```

### Constantes

#### FacialLandmarkGroup

Enumeração dos grupos de landmarks faciais.

```typescript
enum FacialLandmarkGroup {
  JAW_LINE = 'jawline',
  EYEBROWS = 'eyebrows',
  NOSE = 'nose',
  EYES = 'eyes',
  MOUTH = 'mouth'
}
```

#### FACIAL_LANDMARK_INDICES_BY_GROUP

Mapeamento dos índices dos pontos faciais por grupo.

#### FACIAL_LANDMARK_INDICES

Lista completa de índices de landmarks faciais (união de todos os grupos).

### Tipos

#### DetectionOptions

```typescript
interface DetectionOptions {
  // Limiar de confiança para a detecção (valores de 0 a 1)
  scoreThreshold?: number;
  // Número máximo de faces a serem detectadas
  maxFaces?: number;
  // Habilitar rastreamento entre frames (para vídeo)
  enableTracking?: boolean;
}
```

#### FaceDetection, FaceDetectionWithLandmarks, Box, FaceLandmarks

Interfaces para os resultados das detecções.

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar testes
npm test

# Executar testes com cobertura
npm run test:coverage

# Compilar
npm run build
```

## Licença

MIT 