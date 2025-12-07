import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import SkillGraph from './components/SkillGraph';
import { USER_PROFILE, INITIAL_GRAPH_DATA } from './constants';
import { SkillNode, NodeType } from './types';

const App: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Sidebar Width State
  const [leftWidth, setLeftWidth] = useState(288); // Default 72 * 4 = 288px
  const [rightWidth, setRightWidth] = useState(380); // Default 380px
  
  // Dragging State
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  // Find full node object based on ID
  const selectedNode = INITIAL_GRAPH_DATA.nodes.find(n => n.id === selectedNodeId) || null;

  // Filter core nodes for navigation
  const coreNodes = INITIAL_GRAPH_DATA.nodes.filter(n => n.type === NodeType.CORE);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleGraphNodeClick = (node: SkillNode) => {
    setSelectedNodeId(node.id);
  };

  // Global Drag Events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        // Limit left sidebar width between 200px and 500px
        const newWidth = Math.max(200, Math.min(500, e.clientX));
        setLeftWidth(newWidth);
      } else if (isResizingRight) {
        // Limit right sidebar width between 300px and 600px
        const newWidth = Math.max(300, Math.min(600, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
      document.body.style.cursor = 'default';
      // Remove text selection prevention
      document.body.style.userSelect = 'auto';
    };

    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight]);

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white overflow-hidden font-sans">
      
      {/* Top Header */}
      <Header user={USER_PROFILE} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <SidebarLeft 
          width={leftWidth}
          user={USER_PROFILE} 
          coreNodes={coreNodes}
          onSelectNode={handleNodeSelect}
          selectedNodeId={selectedNodeId}
        />

        {/* Resizer Left */}
        <div 
          className={`w-1 bg-slate-900 hover:bg-blue-500 cursor-col-resize transition-colors z-30 flex items-center justify-center group ${isResizingLeft ? 'bg-blue-600' : ''}`}
          onMouseDown={() => setIsResizingLeft(true)}
        >
          <div className="h-8 w-0.5 bg-slate-700 group-hover:bg-white rounded-full transition-colors"></div>
        </div>

        {/* Center Canvas (D3 Graph) */}
        <main className="flex-1 relative bg-slate-950 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] z-0 min-w-[300px]">
          <SkillGraph 
            data={INITIAL_GRAPH_DATA} 
            selectedNodeId={selectedNodeId}
            onNodeClick={handleGraphNodeClick}
          />
        </main>

        {/* Resizer Right */}
        <div 
          className={`w-1 bg-slate-900 hover:bg-blue-500 cursor-col-resize transition-colors z-30 flex items-center justify-center group ${isResizingRight ? 'bg-blue-600' : ''}`}
          onMouseDown={() => setIsResizingRight(true)}
        >
          <div className="h-8 w-0.5 bg-slate-700 group-hover:bg-white rounded-full transition-colors"></div>
        </div>

        {/* Right Sidebar */}
        <SidebarRight 
          width={rightWidth}
          activeNode={selectedNode} 
        />
        
      </div>
    </div>
  );
};

export default App;