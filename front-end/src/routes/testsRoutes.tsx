import { Route } from 'react-router-dom';
// import Mypagetest1 from '../test/1';
import Teambadi from '../test/1/Teambadi';
import TestTeam from '../test/1/TestTeam';

export const testsRoutes = (
    <>
        <Route path="/test">
            <Route path="1" element={<Teambadi />} />
            <Route path="2" element={<TestTeam />} />
        </Route>
    </>
);
