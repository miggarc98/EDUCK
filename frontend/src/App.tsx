import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardView from './features/analytics/DashboardView';

// Vistas placeholder para demostrar la navegación
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex h-[60vh] items-center justify-center glass rounded-2xl">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-surface-900 mb-2">{title}</h2>
      <p className="text-surface-500">Módulo en construcción...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardView />} />
          <Route path="convivencia" element={<PlaceholderView title="Módulo de Convivencia" />} />
          <Route path="comunicaciones" element={<PlaceholderView title="Canal de Comunicación" />} />
          <Route path="academico" element={<PlaceholderView title="Gestión Académica" />} />
          <Route path="estudiantes" element={<PlaceholderView title="Directorio de Estudiantes" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
