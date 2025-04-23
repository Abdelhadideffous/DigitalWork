import { Route } from 'react-router-dom';
// import Mypagetest1 from '../test/1';
// import Mypagetest1 from '../test/1';
import ProjetDetail from '../test/1/ProjetDetail';
import TaskOverview from '../test/1/TaskOverview';
import Teambadi from '../test/1/Teambadi';
import TestTeam from '../test/1/TestTeam';
import Projet from '../test/2/Projet';
import Login from '../test/Login/Login';
import PdfExport from '../test/PdfExport';
import FinalEdb from '../test/edb/FinalEdb';

export const testsRoutes = (
    <Route path="/test">
        {/* <Route path="1" element={<Mypagetest1 />} /> */}
        <Route path="1" element={<Teambadi />} />
        <Route path="2" element={<TestTeam />} />
        <Route path="3" element={<Projet />} />
        <Route path="3/:id" element={<ProjetDetail />} />
        <Route path="4" element={<TaskOverview />} />
        <Route path="5" element={<Login />} />
        <Route path="6" element={<PdfExport edbId={1} />} />
        <Route path="7" element={<FinalEdb />} />
    </Route>
);
