import { BrowserRouter, Routes, Route } from "react-router-dom";
import Upload from "./upload";
import Tables from "./tables";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/tables" element={<Tables />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
