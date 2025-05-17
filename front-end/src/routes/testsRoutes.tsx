import { Route } from 'react-router-dom';
import Team from '../test/1/Team';
import Projet from '../test/2/Projet';
import Task from '../test/3/Task';
import FinalEdb from '../test/5/FinalEdb';
import PageRapport from '../test/7/PageRapport';
import Parametres from '../test/9/Parametres';
import Home from '../test/login/Home';
import Login from '../test/login/Login';
import DashboardAdmin from '../test/4/DashboardAdmin';
import NotificationsPage from '../test/0/NotificationsPage';
import CreateUser from '../test/10/create-user';
import Profile from '../test/11/profile';

export const testsRoutes = (
    <Route path="/test">
        <Route path="11" element={<NotificationsPage/>} />
        <Route path="1" element={<DashboardAdmin/>} />
        <Route path="2" element={<Projet />} />
        <Route path="3" element={<FinalEdb />} />
        <Route path="4" element={<Task />} />
        <Route path="5" element={<Team />} />
        <Route path="7" element={<PageRapport />} />
        <Route path="9" element={<Parametres />} />
        <Route path="0" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="12" element={<CreateUser />} />
        <Route path="13" element={<Profile/>} />
       
    </Route>
);