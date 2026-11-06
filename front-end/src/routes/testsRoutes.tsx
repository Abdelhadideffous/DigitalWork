import { Route } from 'react-router-dom';
import TestPage from '../test/1/TestPage';

export const testsRoutes = (
    <Route path="/test">
        <Route path="1" element={<TestPage/>} />
    </Route>
);
