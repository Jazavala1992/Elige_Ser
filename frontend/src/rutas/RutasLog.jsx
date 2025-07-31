import { Route, Routes } from 'react-router';
import App from '../App';
import SignUp from '../paginas/SingUp';
import Home from '../paginas/Home';
import Pacientes from '../paginas/Pacientes';
import Consultas from '../paginas/Consultas';

function Rutas() {
return (
<Routes>
          <Route path="/" element={<App></App>} />
          <Route path="/signup" element={<SignUp></SignUp>} />
          <Route path="/home" element={<Home></Home>} />
          <Route path="/pacientes" element={<Pacientes></Pacientes>} />
          <Route path="/consultas" element={<Consultas></Consultas>} />
          <Route path="/consultas/:id" element={<Consultas></Consultas>} />     
</Routes>
);
}
export default Rutas;
