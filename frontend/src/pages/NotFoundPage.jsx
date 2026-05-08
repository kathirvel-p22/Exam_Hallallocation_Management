// src/pages/NotFoundPage.jsx
import { useNavigate } from 'react-router-dom';
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-[120px] font-bold text-gold/20 leading-none">404</div>
        <h2 className="font-display text-3xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-white/40 mb-8">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn btn-gold">← Go Home</button>
      </div>
    </div>
  );
}
