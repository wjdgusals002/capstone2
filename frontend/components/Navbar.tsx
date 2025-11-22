import { Drone, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';

type Page = 'analysis' | 'evaluation';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Drone className="h-8 w-8 text-blue-600" />
              <span className="text-slate-900">드론 부품 분석 시스템</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={currentPage === 'analysis' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('analysis')}
                className={currentPage === 'analysis' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Drone className="h-4 w-4 mr-2" />
                드론 분석
              </Button>
              <Button
                variant={currentPage === 'evaluation' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('evaluation')}
                className={currentPage === 'evaluation' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                모델 평가
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
