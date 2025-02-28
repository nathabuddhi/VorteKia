import ReactDOM from "react-dom/client";
import Home from "./Home";
import { Route, BrowserRouter, Navigate, Routes } from "react-router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/login" element={<LoginHome />} /> */}
            {/* <Route path="/unknown" element={<NotFound />} /> */}
            <Route path="*" element={<Navigate to="/unknown" />} />
        </Routes>
    </BrowserRouter>
);
