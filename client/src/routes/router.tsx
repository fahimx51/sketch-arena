import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Join from "../pages/Join";
import Room from "../pages/Room";

const router = createBrowserRouter([
    {
        path: "/",
        Component: MainLayout,
        children: [
            {
                index: true,
                Component: Home
            },
            {
                path: "join",
                Component: Join
            },
            {
                path: "room/:roomId",
                Component: Room
            }
        ]
    },
]);

export default router;