import { Router as WouterRouter } from "wouter";
import WebGIS from "@/pages/WebGIS goc";
function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <WebGIS />
    </WouterRouter>
  );
}

export default App;
