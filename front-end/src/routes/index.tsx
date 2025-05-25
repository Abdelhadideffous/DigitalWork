import {
    Route,
    createBrowserRouter,
    createRoutesFromElements,
} from "react-router-dom";
import Team from '../pages/team/Team';
import Projet from '../pages/project/Projet';
import Task from '../pages/task/Task';
import FinalEdb from '../pages/edb/FinalEdb';
import Home from '../pages/login/Home';
import Login from '../pages/login/Login';
import CreateUser from '../pages/users/create-user';
import Profile from '../pages/profile/profile';
import DashboardAdmin from '../pages/dashboard/DashboardAdmin';
import DashboardManager from '../pages/dashboard/DashboardManager';
import DashboardEmployee from '../pages/dashboard/DashboardEmployee';
import NotificationsPage from "../pages/notification/NotificationsPage";
import FirstDirection from "../pages/dashboard/FirstDirection";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<Home />} />
            <Route path="login" element={<Login />} /> 
            <Route path="dashboard" element={<FirstDirection />} /> 
            <Route path="dashboard/admin" element={<DashboardAdmin/>} />
            <Route path="dashboard/manager" element={<DashboardManager/>} />
            <Route path="dashboard/employee" element={<DashboardEmployee/>} />
            <Route path="2" element={<Projet />} />
            <Route path="3" element={<FinalEdb />} />
            <Route path="4" element={<Task />} />
            <Route path="5" element={<Team />} />
            <Route path="6" element={<CreateUser />} />
            <Route path="7" element={<Profile/>} /> 
            <Route path="8" element={<NotificationsPage/>} />


        </>
    )
);
