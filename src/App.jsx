import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import { AnnouncementBar } from './Components/layout/AnnouncementBar';
import { Header } from './Components/layout/Header';
import { Footer } from './Components/layout/Footer';
import { Home } from './Pages/Home';
import { Register } from './Pages/Register';
import { Login } from './Pages/Login';
import { Apply } from './Pages/Apply';
import { Payment } from './Pages/Payment';
import { Status } from './Pages/Status';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <AnnouncementBar />
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/application-form" element={<Apply />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/profile" element={<Status />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
