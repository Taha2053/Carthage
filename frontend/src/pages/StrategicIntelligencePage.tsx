import { useState, useEffect } from 'react'
import { useStrategyAgent } from '@/components/strategy/useStrategyAgent'
import StrategyDashboard from '@/components/strategy/StrategyDashboard'
import StrategyChat from '@/components/strategy/StrategyChat'

export default function StrategicIntelligencePage() {
  const [activeView, setActiveView] = useState('classements')
  const { 
    messages, 
    dashboard, 
    loadingChat, 
    loadingDashboard, 
    sendChatMessage, 
    fetchOpportunities,
    selectOpportunity,
    resetToList
  } = useStrategyAgent()

  // Initial fetch on mount
  useEffect(() => {
    fetchOpportunities('classements')
  }, [fetchOpportunities])

  const handleViewChange = (view: string) => {
    setActiveView(view)
    fetchOpportunities(view)
  }

  return (
    <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100vh-60px)]">
      <div className="flex-1 min-h-0 bg-paper rounded-xl shadow-sm border border-rule overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left Panel: Dashboard (40%) */}
        <div className="w-full md:w-[40%] xl:w-[35%] p-5 md:p-6 flex flex-col h-full overflow-hidden">
          <StrategyDashboard 
            dashboard={dashboard}
            activeView={activeView}
            onViewChange={handleViewChange}
            loadingDashboard={loadingDashboard}
            onSelectOpportunity={selectOpportunity}
            onBackToList={resetToList}
          />
        </div>

        {/* Right Panel: AI Chat (60%) */}
        <div className="w-full md:w-[60%] xl:w-[65%] p-5 md:p-6 bg-paper/50 flex flex-col h-full overflow-hidden">
          <StrategyChat 
            messages={messages}
            loading={loadingChat}
            onSendMessage={sendChatMessage}
            dashboardMode={dashboard.mode}
            selectedCategory={dashboard.selectedCategory}
          />
        </div>

      </div>
    </div>
  )
}
