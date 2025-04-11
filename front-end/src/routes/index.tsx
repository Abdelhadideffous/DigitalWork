import {
    Route,
    createBrowserRouter,
    createRoutesFromElements,
} from "react-router-dom";
import App from "../pages/App";
import { testsRoutes } from "./testsRoutes";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<App />} />
            {testsRoutes}
        </>
    )
);
