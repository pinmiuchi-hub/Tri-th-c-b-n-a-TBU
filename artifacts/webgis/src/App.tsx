import { Router as WouterRouter } from "wouter";
import WebGIS from "@/pages/WebGIS goc";
import SyncGate from "@/components/SyncGate";

function App() {
  return (
    <SyncGate>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <WebGIS />
      </WouterRouter>
    </SyncGate>
  );
}

export default App;
