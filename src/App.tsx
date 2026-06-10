import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ListPage from "@/pages/ListPage";
import GamePage from "@/pages/GamePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/game/:id" element={<GamePage />} />
      </Routes>
    </Router>
  );
}
