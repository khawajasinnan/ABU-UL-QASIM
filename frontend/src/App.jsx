import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import DonateBlood from './pages/DonateBlood';
import Volunteer from './pages/Volunteer';
import About from './pages/About';
import OurTeam from './pages/OurTeam';
import PatientTracker from './pages/PatientTracker';
import MedicineDrive from './pages/MedicineDrive';
import HelpChild from './pages/HelpChild';
import Gallery from './pages/Gallery';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter basename="/ABU-UL-QASIM">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="donate-blood" element={<DonateBlood />} />
          <Route path="volunteer" element={<Volunteer />} />
          <Route path="about" element={<About />} />
          <Route path="our-team" element={<OurTeam />} />
          <Route path="patient-tracker" element={<PatientTracker />} />
          <Route path="medicine-drive" element={<MedicineDrive />} />
          <Route path="help-child" element={<HelpChild />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
