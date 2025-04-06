# Fast Face Detection - Demo React

Esta é uma versão React com Tailwind CSS da demonstração para o pacote `@the-horizon-dev/fast-face-detection`, que permite detectar rostos e pontos de referência facial com TensorFlow.js.

## Recursos

- Interface moderna construída com React e Tailwind CSS
- Detecção em tempo real usando a webcam
- Upload de imagens para detecção
- Controle de parâmetros de detecção
- Visualização de pontos de referência facial
- Estatísticas de performance
- Design responsivo

## Instalação Rápida

Para uma configuração fácil e rápida, utilize o script de setup:

```bash
# No diretório demo
npm run setup
```

Este script:
1. Verifica e compila o pacote principal se necessário
2. Instala todas as dependências
3. Compila a aplicação React

Após a configuração, você pode iniciar a aplicação:

```bash
npm run dev
```

## Desenvolvimento Local Detalhado

### Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn

### Instalação Manual

1. Clone o repositório:
   ```bash
   git clone https://github.com/thehorizon-dev/fast-face-rekognition.git
   cd fast-face-rekognition/projects/fast-face-detection-package
   ```

2. Compile o pacote principal:
   ```bash
   npm install
   npm run build
   ```

3. Configure a demonstração React:
   ```bash
   cd demo

   npm install
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse `http://localhost:5173` no seu navegador.

## Solução de Problemas

Se você encontrar problemas ao executar a demonstração:

### Problemas de TensorFlow.js

- **Erro "WebGL não suportado"**: Verifique se seu navegador suporta WebGL em [get.webgl.org](https://get.webgl.org/).
- **Baixo desempenho**: Reduza o parâmetro "Máximo de Faces" para melhorar a performance.
- **Detecção lenta**: Algumas máquinas podem enfrentar problemas de desempenho. Tente utilizar um dispositivo mais potente.

### Problemas de Câmera

- **Câmera não inicializa**: Verifique se você concedeu permissões de câmera ao navegador.
- **Erros de acesso**: Utilize HTTPS ou localhost para acessar recursos de câmera.

### Outros Problemas

Se você encontrar outros problemas:

1. Verifique o console do navegador para mensagens de erro
2. Tente limpar o cache do navegador
3. Reinstale as dependências com `npm run setup`

## Implantação no GitHub Pages

Para publicar a demonstração no GitHub Pages:

```bash
npm run build
npm run deploy
```

## Comparação com a Versão Vanilla JS

Esta versão React oferece as mesmas funcionalidades da versão original em Vanilla JS, mas com as seguintes melhorias:

- Código mais organizado usando componentes
- Gerenciamento de estado centralizado com Context API
- Tipagem estrita com TypeScript
- Estilos mais consistentes com Tailwind CSS
- Interface mais moderna e responsiva

## Licença

MIT 