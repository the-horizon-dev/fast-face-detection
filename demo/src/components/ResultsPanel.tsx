import React from 'react';
import { useFaceDetection } from '../context/FaceDetectionContext';

const ResultsPanel = () => {
  const { facesDetected, processingTime } = useFaceDetection();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full">
      <div className="flex justify-between mb-4 pb-4 border-b">
        <div className="font-medium">Faces detectadas: <span className="font-bold">{facesDetected.length}</span></div>
        <div className="font-medium">Tempo: <span className="font-bold">{processingTime}</span> ms</div>
      </div>
      
      <div className="overflow-y-auto max-h-[400px]">
        {facesDetected.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500 italic text-center">
            <p>Nenhum rosto detectado</p>
          </div>
        ) : (
          facesDetected.map((face, index) => {
            const { score } = face.detection;
            const hasLandmarks = face.landmarks && face.landmarks.positions.length > 0;
            
            return (
              <div key={index} className="face-result">
                <h3 className="text-lg font-medium mb-2">Face #{index + 1}</h3>
                <p className="mb-1">
                  Confiança: <span className="text-success font-medium">{Math.round(score * 100)}%</span>
                </p>
                <p>
                  Landmarks: {hasLandmarks 
                    ? <span>{face.landmarks?.positions.length} pontos</span> 
                    : <span className="text-gray-500">Não detectados</span>
                  }
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Posição: x={Math.round(face.detection.box.x)}, y={Math.round(face.detection.box.y)}</p>
                  <p>Tamanho: {Math.round(face.detection.box.width)}x{Math.round(face.detection.box.height)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ResultsPanel; 