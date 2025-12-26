// client/src/App.jsx
import {
    createBrowserRouter,
    RouterProvider,
    Outlet,
    Navigate,
} from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register";
import {useContext, useEffect} from "react";
import { AuthContext } from "./context/AuthContext";
import Feed from "./pages/Feed.jsx";
import Header from "./components/Header.jsx";
import CreateSub from "./components/CreateSub.jsx";
import SubHome from "./pages/SubHome.jsx";
import User from "./pages/User.jsx";
import NotFound from "./pages/NotFound.jsx";
import CreatePost from "./components/CreatePost.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import Aside from "./components/Aside.jsx"; // Import Aside
import Settings from "./pages/Settings.jsx"; // Import Settings

function App() {
    const { currentUser, loading } = useContext(AuthContext);
    localStorage.removeItem("error");
    useEffect(() => {

    },[])

    const ProtectedRoute = ({ children }) => {
        if (loading) return <div className="p-10">Loading app...</div>;
        if (!currentUser){

            localStorage.setItem("error","You have to login to see this page");

            return (<Navigate to="/" replace />);
        }
        return children;
    };

    const PublicOnlyRoute = ({ children }) => {
        if (loading) return <div className="p-10">Loading app...</div>;
        if (currentUser) return <Navigate to="/app" replace />;
        return children;
    };

    const Layout = () => (
        <div className="app" style={{ backgroundColor: "#030303", minHeight: "100vh", color: "#d7dadc" }}>
            <Header/>
            <div className="app-container">
                <div className="content-wrapper">
                    {/* Left Sidebar (Navigation) */}
                    <div className="main-aside">
                        <Aside />
                    </div>

                    {/* Main Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );

    const router = createBrowserRouter([
        // Public Home (landing)
        {
            path: "/",
            element: (
                <Layout />
            ),
            children: [
                { index: true, element: <Feed /> },

            ],
        },

        // Private Home (feed)
        {
            path: "/app",
            element: (
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            ),
            children: [
                { index: true, element: <Feed /> },
                { path: "create-community", element: <CreateSub /> },
                { path: "new-post", element: <CreatePost /> },
                { path: "settings", element: <Settings /> }, // Add Settings route
                { path: "p/:postId", element: <PostDetail /> },

                // 2. Uzun/Güzel yol (Asıl gösterilecek olan)
                { path: "w/:subName/:postId", element: <PostDetail /> },
                { path: "w/:subName", element: <SubHome /> },
                { path: "u/:username", element: <User /> },
            ],
        },

        // Auth pages (only when logged out)
        {
            path: "/login",
            element: (
                <PublicOnlyRoute>
                    <Login />
                </PublicOnlyRoute>
            ),
        },
        {
            path: "/register",
            element: (
                <PublicOnlyRoute>
                    <Register />
                </PublicOnlyRoute>
            ),
        },
        {
            path: "*",
            element: (
                <NotFound/>
            ),
        },
    ]);

    return <RouterProvider router={router} />;
}

export default App;
