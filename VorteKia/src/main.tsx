import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import RootLayout from "./layouts/root-layout";
import "./App.css";
import HomePage from "./pages/home";
import AboutPage from "./pages/about";
import LoginPage from "./pages/login";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<RootLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="login" element={<LoginPage />} />
            </Route>
        </Routes>
    </BrowserRouter>
);

