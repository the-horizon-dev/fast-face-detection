# Fast Face Detection

Um pacote poderoso e fácil de usar para detecção facial e landmarks usando os modelos MediaPipe.

## Características

- ✅ Detecção facial rápida e precisa
- ✅ Detecção de landmarks faciais
- ✅ Rastreamento de faces (tracking)
- ✅ Funciona em navegadores, Node.js e React Native
- ✅ API simples e fácil de usar
- ✅ Tipagem completa em TypeScript
- ✅ Tratamento robusto de erros
- ✅ Métricas de performance
- ✅ Sem necessidade de conhecimento de TensorFlow

## Instalação

```bash
npm install @the-horizon-dev/fast-face-detection
```

### Dependências para Ambientes Específicos

O pacote carrega automaticamente apenas as dependências necessárias para cada ambiente:

#### Aplicações Web (navegadores)
```bash
# O pacote principal já inclui tudo que você precisa para navegadores
npm install @the-horizon-dev/fast-face-detection
```

#### React Native
```bash
# Para React Native, é necessário instalar uma dependência adicional:
npm install @the-horizon-dev/fast-face-detection @tensorflow/tfjs-react-native
```

#### Node.js
```bash
# Para Node.js, você precisará do módulo canvas:
npm install @the-horizon-dev/fast-face-detection canvas

# Para melhor performance em Node.js, recomendamos instalar o backend nativo:
npm install @tensorflow/tfjs-node
```

## Uso Básico

```typescript
import { mediapipeFace } from '@the-horizon-dev/fast-face-detection';

// Detectar faces em uma imagem
async function detectFaces(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
  // Detectar faces
  const faces = await mediapipeFace.detectFaces(imageElement);
  
  console.log(`Encontradas ${faces.length} faces!`);
  
  // Acessar informações de cada face
  faces.forEach(face => {
    const { x, y, width, height } = face.detection.box;
    const score = face.detection.score;
    console.log(`Face em (${x}, ${y}) com tamanho ${width}x${height}, confiança: ${score}`);
  });
}

// Detectar faces com landmarks
async function detectLandmarks(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
  // Detectar faces com landmarks
  const facesWithLandmarks = await mediapipeFace.detectFacesWithLandmarks(imageElement);
  
  // Acessar landmarks de cada face
  facesWithLandmarks.forEach(face => {
    // Pontos faciais (olhos, boca, etc.)
    const landmarks = face.landmarks.positions;
    
    // Fazer algo com os landmarks...
    landmarks.forEach((point, index) => {
      console.log(`Landmark ${index}: (${point.x}, ${point.y})`);
    });
  });
}

// Lembre-se de liberar recursos quando terminar
function cleanUp() {
  mediapipeFace.dispose();
}
```

## Obter Métricas de Performance

A biblioteca agora oferece métricas de performance para ajudar a otimizar sua aplicação:

```typescript
import { mediapipeFace } from '@the-horizon-dev/fast-face-detection';

async function detectWithMetrics(imageElement) {
  // O terceiro parâmetro como 'true' retorna métricas de performance
  const result = await mediapipeFace.detectFaces(imageElement, {}, true);
  
  // Acesse as faces detectadas
  const faces = result.faces;
  console.log(`Detectadas ${faces.length} faces`);
  
  // Acesse as métricas de performance
  const timing = result.timing;
  console.log(`Tempo total: ${timing.total.toFixed(2)}ms`);
  console.log(`Pré-processamento: ${timing.preprocessing.toFixed(2)}ms`);
  console.log(`Inferência: ${timing.inference.toFixed(2)}ms`);
  console.log(`Pós-processamento: ${timing.postprocessing.toFixed(2)}ms`);
}
```

## Tratamento de Erros Robusto

A biblioteca agora fornece erros detalhados com códigos específicos para um tratamento mais preciso:

```typescript
import { mediapipeFace, FaceDetection } from '@the-horizon-dev/fast-face-detection';

async function detectFacesWithErrorHandling(imageElement) {
  try {
    const faces = await mediapipeFace.detectFaces(imageElement);
    // Processar faces
  } catch (error) {
    if (error instanceof FaceDetection.FaceDetectionError) {
      // Acesse o código de erro
      const errorCode = error.code;
      
      switch (errorCode) {
        case FaceDetection.ErrorCode.MODEL_LOAD_FAILED:
          console.error('Falha ao carregar o modelo. Verifique sua conexão.');
          break;
        case FaceDetection.ErrorCode.INVALID_INPUT:
          console.error('Entrada inválida. Verifique se a imagem/vídeo é válido.');
          break;
        case FaceDetection.ErrorCode.DETECTION_FAILED:
          console.error('Falha na detecção. Tente novamente com outra imagem.');
          break;
        // outros códigos de erro...
        default:
          console.error('Erro desconhecido:', error.message);
      }
      
      // Também pode acessar o erro original
      if (error.originalError) {
        console.error('Erro original:', error.originalError);
      }
    } else {
      console.error('Erro não relacionado à detecção facial:', error);
    }
  }
}
```

## Opções Avançadas

```typescript
import { DetectionOptions, ModelType } from '@the-horizon-dev/fast-face-detection';

// Configurações personalizadas com tipagem completa
const options: DetectionOptions = {
  scoreThreshold: 0.7,      // Limite de confiança (0-1)
  maxFaces: 5,              // Número máximo de faces a detectar
  enableTracking: true,     // Ativar rastreamento de faces entre frames
  modelType: ModelType.SHORT, // Modelo mais leve e rápido
  runtime: 'tfjs'           // Runtime do TensorFlow
};

// Uso com opções personalizadas
const faces = await mediapipeFace.detectFaces(imageElement, options);
```

## Otimização de Performance

### Pré-carregamento de Modelos

Para aplicações onde você precisa iniciar rapidamente:

```typescript
// Pré-carregar modelos na inicialização da aplicação
async function initApp() {
  // Retorna o ambiente detectado ('browser', 'node' ou 'react-native')
  const environment = await mediapipeFace.initialize();
  console.log(`Modelos carregados para ambiente ${environment}!`);
}
```

### Controle de Log

A biblioteca permite controlar o nível de log para depuração:

```typescript
import { utils } from '@the-horizon-dev/fast-face-detection';

// Configurar nível de log
utils.setLogLevel('debug'); // Valores possíveis: 'debug', 'info', 'warn', 'error', 'none'
```

### Carregamento de Recursos

A biblioteca carrega automaticamente apenas os recursos necessários para o ambiente detectado:

- Em navegadores: usa WebGL por padrão, com fallback para CPU
- Em React Native: usa o backend otimizado para React Native
- Em Node.js: usa o backend TensorFlow.js Node nativo se disponível, com fallback para CPU

## Uso Avançado com TypeScript

A biblioteca fornece tipagem TypeScript completa:

```typescript
import { 
  mediapipeFace, 
  PossiblyTrackedFace, 
  TrackedFace, 
  isTrackedFace,
  Box,
  Point,
  DetectionResult
} from '@the-horizon-dev/fast-face-detection';

// Detectar faces com verificação de rastreamento
async function processTrackedFaces(videoElement: HTMLVideoElement) {
  const faces = await mediapipeFace.detectFaces(videoElement, { enableTracking: true });
  
  faces.forEach(face => {
    // Verificar se a face possui ID de rastreamento
    if (isTrackedFace(face)) {
      // face tem trackingID
      console.log(`Face #${face.trackingID} em posição:`, face.detection.box);
    } else {
      // face é uma detecção normal sem trackingID
      console.log('Face sem rastreamento em posição:', face.detection.box);
    }
  });
}

// Função tipada para processar uma caixa delimitadora
function processBox(box: Box) {
  const area = box.width * box.height;
  return area;
}

// Função tipada para trabalhar com resultado completo
async function analyzeDetectionPerformance(imageElement: HTMLImageElement): Promise<number> {
  const result: DetectionResult<PossiblyTrackedFace> = 
    await mediapipeFace.detectFaces(imageElement, {}, true);
    
  console.log(`Tempo de detecção: ${result.timing.total}ms`);
  return result.timing.total;
}
```

## Notas de Performance

- A primeira detecção pode ser mais lenta devido ao carregamento do modelo
- Use `initialize()` para pré-carregar modelos
- Para streams de vídeo, use uma taxa de quadros mais baixa para economizar CPU/GPU
- Em dispositivos móveis, considere usar modelos mais leves

## Solução de Problemas

### WebGL em Headless

Se estiver executando em um ambiente headless (como um servidor Node.js), a biblioteca automaticamente usará o backend CPU.

### React Native

Certifique-se de que sua aplicação React Native está configurada corretamente para uso com TensorFlow.js. Consulte a [documentação oficial](https://www.tensorflow.org/js/tutorials/react_native) para mais detalhes.

## Exemplos

Consulte a pasta `/examples` para exemplos completos de:
- Detecção facial em imagens
- Detecção em streams de vídeo
- Uso com React e React Native
- Utilização de landmarks para filtros faciais

## Licença

MIT 

## Testes

A biblioteca inclui testes unitários e de integração. Os testes de integração utilizam imagens reais para verificar o funcionamento correto da detecção facial.

### Executar testes

```bash
# Executar todos os testes
npm test

# Executar apenas testes unitários
npm run test:unit

# Executar apenas testes de integração
npm run test:integration
```

### Resultados visuais

Os testes de integração com imagens reais geram resultados visuais que são salvos no diretório `tests/output/`. Estes resultados mostram as faces detectadas e os pontos faciais (landmarks).

### Requisitos para testes

Para executar os testes de integração, você precisará instalar a biblioteca `canvas`:

```bash
npm install canvas
```

Em alguns sistemas, pode ser necessário instalar dependências adicionais. Consulte a [documentação do node-canvas](https://github.com/Automattic/node-canvas#compiling) para mais informações.

## Testing

The package includes unit tests for core functionality. To run the tests:

```bash
npm test
```

### Testing Limitations

Due to the dependency on TensorFlow.js and browser APIs, some tests may not run correctly in a Node.js environment. 

- Unit tests for services and utility functions run well in Node.js
- Integration tests requiring actual face detection need a browser environment

When developing this package, it's recommended to focus on unit testing the non-browser-dependent code.

For full integration testing, consider using a browser-based test environment like Playwright or Cypress. 