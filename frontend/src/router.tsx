import { Navigate, Route, Routes } from 'react-router-dom';

import App from './App';
import { MatchDetailPage } from './pages/MatchDetailPage';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/matches/:id" element={<MatchDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
