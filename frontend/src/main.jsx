import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import SignUp from './paginas/SingUp.jsx';
import Home from './paginas/Home.jsx';
import Pacientes from './paginas/Pacientes.jsx';
import Consultas from './paginas/Consultas.jsx';
import { UsuarioProvider } from './context/UsuarioContext';
import './index.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UsuarioProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/consultas/:idPaciente" element={<Consultas />} /> 
        </Routes>
      </BrowserRouter>
    </UsuarioProvider>
  </StrictMode>
);