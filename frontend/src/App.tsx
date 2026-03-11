import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import UploadPage from './pages/UploadPage';
import ReviewPage from './pages/ReviewPage';
import JobInputPage from './pages/JobInputPage';
import ComparisonPage from './pages/ComparisonPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/job" element={<JobInputPage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
