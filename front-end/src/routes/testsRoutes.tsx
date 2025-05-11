import { Route } from 'react-router-dom';
import Team from '../test/1/Team';
import Projet from '../test/2/Projet';
import Task from '../test/3/Task';
import FinalEdb from '../test/5/FinalEdb';
import Pagecalendrier from '../test/6/Pagecalendrier';
import PageRapport from '../test/7/PageRapport';
import Pagemesage from '../test/8/Pagemesage';
import Parametres from '../test/9/Parametres';
import Home from '../test/login/Home';
import Login from '../test/login/Login';
import Register from '../test/login/Register';
import DashboardAdmin from '../test/4/DashboardAdmin';

export const testsRoutes = (
    <Route path="/test">
        <Route path="1" element={<DashboardAdmin/>} />
        <Route path="2" element={<Projet />} />
        <Route path="3" element={<FinalEdb />} />
        <Route path="4" element={<Task />} />
        <Route path="5" element={<Team />} />
        {/* <Route path="6" element={<Pagecalendrier />} /> */}
        <Route path="7" element={<PageRapport />} />
        <Route path="8" element={<Pagemesage />} />
        <Route path="9" element={<Parametres />} />
        <Route path="0" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="000" element={<Register />} />
    </Route>
);
