import { Route, Routes } from "react-router-dom";
import { useLenis } from "./hooks/useLenis.js";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import RotateNotice from "./components/RotateNotice.jsx";

export default function App() {
  useLenis();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <RotateNotice />
    </>
  );
}
