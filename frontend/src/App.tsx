import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { ChatInterface } from './components/chat/ChatInterface';
import { AgentPipelineGraph } from './components/pipeline/AgentPipelineGraph';
import { TicketList } from './components/tickets/TicketList';
import { KnowledgeExplorer } from './components/knowledge/KnowledgeExplorer';
import { CustomerProfileView } from './components/customer/CustomerProfileView';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { TicketProvider, useTicket } from './context/TicketContext';
import { AuthProvider } from './context/AuthContext';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  const { tickets } = useTicket();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface />;
      case 'pipeline':
        return <AgentPipelineGraph />;
      case 'tickets':
        return <TicketList />;
      case 'knowledge':
        return <KnowledgeExplorer />;
      case 'customers':
        return <CustomerProfileView />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F19] text-slate-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          ticketCount={tickets.length || 2}
        />
        <main className="flex-1 flex overflow-hidden">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <TicketProvider>
        <MainAppContent />
      </TicketProvider>
    </AuthProvider>
  );
};

export default App;
