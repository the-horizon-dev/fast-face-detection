import Header from './components/Header';
import Footer from './components/Footer';
import Controls from './components/Controls';
import VideoDisplay from './components/VideoDisplay';
import ResultsPanel from './components/ResultsPanel';
import { FaceDetectionProvider } from './context/FaceDetectionContext';

function App() {
  return (
    <FaceDetectionProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <Controls />
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <VideoDisplay />
            </div>
            
            <div className="lg:col-span-1">
              <ResultsPanel />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </FaceDetectionProvider>
  );
}

export default App; 