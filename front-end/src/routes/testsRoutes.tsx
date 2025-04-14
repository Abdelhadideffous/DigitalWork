import { Route } from 'react-router-dom';
// import Mypagetest1 from '../test/1';
// import Mypagetest1 from '../test/1';
import Projet from '../test/1/Projet';
import ProjetDetail from '../test/1/ProjetDetail';
import Teambadi from '../test/1/Teambadi';
import TestTeam from '../test/1/TestTeam';
import TaskOverview from '../test/1/TaskOverview';

export const testsRoutes = (
    <Route path="/test">
        {/* <Route path="1" element={<Mypagetest1 />} /> */}
        <Route path="1" element={<Teambadi />} />
        <Route path="2" element={<TestTeam />} />
        <Route path="3" element={<Projet />} />
        <Route path="3/:id" element={<ProjetDetail />} />
        <Route path="4" element={<TaskOverview />} />

    </Route>
);
