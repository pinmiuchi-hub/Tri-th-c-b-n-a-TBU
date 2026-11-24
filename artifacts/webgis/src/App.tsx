import { Router as WouterRouter, Route } from "wouter";
import WebGIS from "@/pages/WebGIS goc";
import EthnicDetail from "@/pages/EthnicDetail";
import SourcesPage from "@/pages/SourcesPage";
import SyncGate from "@/components/SyncGate";

function App() {
  return (
    <SyncGate>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        {/* WebGIS luôn được giữ mounted để bản đồ + trạng thái không mất khi mở trang dân tộc */}
        <WebGIS />
        <Route path="/dan-toc/:id">
          {params => <EthnicDetail ethnicId={decodeURIComponent(params.id ?? "")} />}
        </Route>
        <Route path="/nguon-du-lieu">
          <SourcesPage />
        </Route>
      </WouterRouter>
    </SyncGate>
  );
}

export default App;
