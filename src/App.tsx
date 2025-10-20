import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Questionnaire from './pages/Questionnaire';
import DistanceConverter from './pages/DistanceConverter';
import DataProcessor from './pages/DataProcessor';
import AsteroidFinder from './pages/AsteroidFinder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/distance-converter" element={<DistanceConverter />} />
        <Route path="/data-processor" element={<DataProcessor />} />
        <Route path="/asteroid-finder" element={<AsteroidFinder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
