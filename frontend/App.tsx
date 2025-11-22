import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DroneAnalysis } from './components/DroneAnalysis';
import { ModelEvaluation } from './components/ModelEvaluation';

type Page = 'analysis' | 'evaluation';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('analysis');

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="pt-16">
        {currentPage === 'analysis' ? <DroneAnalysis /> : <ModelEvaluation />}
      </main>
    </div>
  );
}