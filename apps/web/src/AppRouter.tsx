import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavRail } from './components/layout/NavRail';
import DashboardPage from './pages/DashboardPage';
import AIAssistantPage from './pages/AIAssistantPage';
import ComingSoonPage from './pages/ComingSoonPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CodeLabPage } from './pages/CodeLabPage';
import { BoardManagerPage } from './pages/BoardManagerPage';
import { LibraryManagerPage } from './pages/LibraryManagerPage';
import { HardwarePage } from './pages/HardwarePage';
import { SerialMonitorPage } from './pages/SerialMonitorPage';
import { AIDebuggerPage } from './pages/AIDebuggerPage';
import { ComponentsPage } from './pages/ComponentsPage';
import { SettingsPage } from './pages/SettingsPage';
import MediaStudioPage from './pages/MediaStudioPage';
import WebResearchPage from './pages/WebResearchPage';
import YouTubeStudioPage from './pages/YouTubeStudioPage';
import SearchConsolePage from './pages/SearchConsolePage';
import GitHubPage from './pages/GitHubPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <div className="flex flex-col md:flex-row h-screen h-[100dvh] w-full max-w-[100vw] bg-surface overflow-hidden">
        {/* Persistent navigation: mobile header + desktop sidebar */}
        <NavRail />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/ai" element={<AIAssistantPage />} />
            <Route path="/media" element={<MediaStudioPage />} />
            <Route path="/research" element={<WebResearchPage />} />
            <Route path="/youtube" element={<YouTubeStudioPage />} />
            <Route path="/search-console" element={<SearchConsolePage />} />
            <Route path="/github" element={<GitHubPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/code" element={<CodeLabPage />} />
            <Route path="/components" element={<ComponentsPage />} />
            <Route path="/boards" element={<BoardManagerPage />} />
            <Route path="/libraries" element={<LibraryManagerPage />} />
            <Route path="/hardware" element={<HardwarePage />} />
            <Route path="/serial" element={<SerialMonitorPage />} />
            <Route path="/debugger" element={<AIDebuggerPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Phase 2+ modules — coming soon */}
            <Route path="/simulator" element={<ComingSoonPage title="Simulator" description="Wokwi integration for real-time hardware simulation without physical devices." />} />
            <Route path="/wiring" element={<ComingSoonPage title="Wiring Lab" description="Interactive breadboard and circuit wiring interface with component drag-and-drop." />} />
            <Route path="/diagram" element={<ComingSoonPage title="Diagram Maker" description="AI-generated schematic layout and block diagram engine." />} />
            <Route path="/bom" element={<ComingSoonPage title="Bill of Materials" description="Automatically generated part lists with pricing from your schematics." />} />
            <Route path="/learning" element={<ComingSoonPage title="Learning" description="Guided engineering tutorials, courses, and interactive lessons." />} />
            <Route path="/docs" element={<ComingSoonPage title="Documentation" description="Auto-generated technical documentation from your code and projects." />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
