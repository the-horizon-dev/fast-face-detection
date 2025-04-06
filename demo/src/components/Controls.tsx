import React, { ChangeEvent } from 'react';
import { useFaceDetection } from '../context/FaceDetectionContext';

const Controls = () => {
  const { 
    mediaStream, 
    detectionOptions, 
    setDetectionOptions,
    showLandmarks,
    setShowLandmarks,
    toggleCamera,
    takePhoto,
    handleImageUpload
  } = useFaceDetection();

  const handleScoreThresholdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setDetectionOptions({ ...detectionOptions, scoreThreshold: value });
  };

  const handleMaxFacesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setDetectionOptions({ ...detectionOptions, maxFaces: value });
  };

  const handleShowLandmarksChange = (e: ChangeEvent<HTMLInputElement>) => {
    setShowLandmarks(e.target.checked);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={toggleCamera}
          className="btn btn-primary"
        >
          {mediaStream ? 'Parar Câmera' : 'Iniciar Câmera'}
        </button>
        
        <button 
          onClick={takePhoto}
          className="btn btn-secondary"
          disabled={!mediaStream}
        >
          Tirar Foto
        </button>
        
        <label className="btn btn-primary cursor-pointer relative overflow-hidden">
          <span>Carregar Imagem</span>
          <input 
            type="file" 
            className="absolute opacity-0 inset-0 cursor-pointer" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <label htmlFor="scoreThreshold" className="text-sm font-medium text-gray-700 mb-1">
              Precisão Mínima:
            </label>
            <span className="text-sm font-medium text-gray-900">
              {detectionOptions.scoreThreshold?.toFixed(2)}
            </span>
          </div>
          <input 
            type="range" 
            id="scoreThreshold" 
            min="0" 
            max="1" 
            step="0.05" 
            value={detectionOptions.scoreThreshold} 
            onChange={handleScoreThresholdChange}
            className="input-range"
          />
        </div>
        
        <div className="flex flex-col">
          <div className="flex justify-between">
            <label htmlFor="maxFaces" className="text-sm font-medium text-gray-700 mb-1">
              Máximo de Faces:
            </label>
            <span className="text-sm font-medium text-gray-900">
              {detectionOptions.maxFaces}
            </span>
          </div>
          <input 
            type="range" 
            id="maxFaces" 
            min="1" 
            max="10" 
            step="1" 
            value={detectionOptions.maxFaces} 
            onChange={handleMaxFacesChange}
            className="input-range"
          />
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="showLandmarks" 
            checked={showLandmarks} 
            onChange={handleShowLandmarksChange}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="showLandmarks" className="ml-2 text-sm font-medium text-gray-700">
            Mostrar Landmarks
          </label>
        </div>
      </div>
    </div>
  );
};

export default Controls; 