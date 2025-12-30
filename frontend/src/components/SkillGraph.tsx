import { useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  connections: string[];
}

interface SkillGraphProps {
  skills: Skill[];
}

const categoryColors: Record<string, { bg: string; glow: string; text: string }> = {
  Frontend: { bg: '#3B82F6', glow: '#3B82F640', text: 'Frontend' },
  Backend: { bg: '#10B981', glow: '#10B98140', text: 'Backend' },
  Database: { bg: '#F59E0B', glow: '#F59E0B40', text: 'Database' },
  DevOps: { bg: '#8B5CF6', glow: '#8B5CF640', text: 'DevOps' },
  Languages: { bg: '#EC4899', glow: '#EC489940', text: 'Languages' },
  Tools: { bg: '#6366F1', glow: '#6366F140', text: 'Tools' },
  AI: { bg: '#F43F5E', glow: '#F43F5E40', text: 'AI' },
  Mobile: { bg: '#14B8A6', glow: '#14B8A640', text: 'Mobile' },
  default: { bg: '#6B7280', glow: '#6B728040', text: 'Other' },
};

const CustomNode = ({ data }: { data: { label: string; level: number; category: string } }) => {
  const colors = categoryColors[data.category] || categoryColors.default;
  const size = 50 + (data.level / 100) * 30;
  
  // Determine proficiency label
  const getProficiencyLabel = (level: number) => {
    if (level >= 80) return 'Expert';
    if (level >= 60) return 'Advanced';
    if (level >= 40) return 'Intermediate';
    return 'Beginner';
  };
  
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.15, zIndex: 100 }}
      className="relative flex items-center justify-center rounded-full text-white font-medium shadow-2xl cursor-pointer"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}CC 100%)`,
        boxShadow: `0 0 30px ${colors.glow}, 0 4px 20px rgba(0,0,0,0.3)`,
        border: `2px solid ${colors.bg}`,
      }}
    >
      <div className="text-center p-1">
        <div className="truncate max-w-[70px] text-xs font-semibold">{data.label}</div>
        <div className="text-[10px] opacity-80">{data.level}%</div>
      </div>
      
      {/* Proficiency ring */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${colors.bg} ${data.level}%, transparent ${data.level}%)`,
          opacity: 0.2,
        }}
      />
      
      {/* Tooltip on hover */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-gray-900 text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-gray-700">
        <div className="font-semibold text-white">{data.label}</div>
        <div className="text-gray-400">{getProficiencyLabel(data.level)} • {data.category}</div>
      </div>
    </motion.div>
  );
};

const nodeTypes = {
  skill: CustomNode,
};

export function SkillGraph({ skills }: SkillGraphProps) {
  const [_selectedCategory, _setSelectedCategory] = useState<string | null>(null);
  
  const initialNodes: Node[] = useMemo(() => {
    const categories = [...new Set(skills.map(s => s.category))];
    const categoryAngles: Record<string, number> = {};
    categories.forEach((cat, i) => {
      categoryAngles[cat] = (i * 360) / categories.length;
    });

    return skills.map((skill) => {
      const skillsInCategory = skills.filter(s => s.category === skill.category);
      const categoryIndex = skillsInCategory.indexOf(skill);
      const baseAngle = categoryAngles[skill.category] || 0;
      const spreadAngle = 40;
      const angleOffset = (categoryIndex - (skillsInCategory.length - 1) / 2) * spreadAngle;
      const angle = ((baseAngle + angleOffset) * Math.PI) / 180;
      const radius = 180 + (categoryIndex % 2) * 60;

      return {
        id: skill.id,
        type: 'skill',
        position: {
          x: 400 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius,
        },
        data: {
          label: skill.name,
          level: skill.level,
          category: skill.category,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [skills]);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    const addedEdges = new Set<string>();
    
    skills.forEach(skill => {
      skill.connections.forEach(targetId => {
        const edgeKey = [skill.id, targetId].sort().join('-');
        if (!addedEdges.has(edgeKey) && skills.find(s => s.id === targetId)) {
          addedEdges.add(edgeKey);
          const sourceSkill = skill;
          const targetSkill = skills.find(s => s.id === targetId);
          const sameCategory = sourceSkill.category === targetSkill?.category;
          
          edges.push({
            id: `e-${skill.id}-${targetId}`,
            source: skill.id,
            target: targetId,
            animated: true,
            style: { 
              stroke: sameCategory 
                ? categoryColors[sourceSkill.category]?.bg || '#6B7280'
                : '#4B556390', 
              strokeWidth: sameCategory ? 2 : 1,
            },
          });
        }
      });
    });
    return edges;
  }, [skills]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Get unique categories for legend
  const categories = useMemo(() => {
    return [...new Set(skills.map(s => s.category))];
  }, [skills]);

  return (
    <div className="relative w-full h-[550px] rounded-xl overflow-hidden border border-gray-700 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        minZoom={0.5}
        maxZoom={2}
      >
        <Background color="#374151" gap={20} size={1} />
        <Controls className="bg-gray-800 border-gray-700 rounded-lg [&>button]:bg-gray-800 [&>button]:border-gray-700 [&>button]:text-white [&>button:hover]:bg-gray-700" />
        <MiniMap 
          nodeColor={(node) => categoryColors[node.data.category]?.bg || '#6B7280'}
          maskColor="rgba(0,0,0,0.8)"
          className="bg-gray-900 border border-gray-700 rounded-lg"
        />
      </ReactFlow>
      
      {/* Legend */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-4 right-4 bg-gray-900/95 backdrop-blur-sm p-4 rounded-xl border border-gray-700 shadow-xl"
      >
        <p className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider">Skill Categories</p>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => {
            const colors = categoryColors[category] || categoryColors.default;
            const skillCount = skills.filter(s => s.category === category).length;
            return (
              <div 
                key={category} 
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <div 
                  className="w-3 h-3 rounded-full ring-2 ring-offset-1 ring-offset-gray-900" 
                  style={{ backgroundColor: colors.bg, borderColor: colors.bg }} 
                />
                <span className="text-xs text-gray-300">{category}</span>
                <span className="text-[10px] text-gray-500">({skillCount})</span>
              </div>
            );
          })}
        </div>
      </motion.div>
      
      {/* Stats overlay */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur-sm p-4 rounded-xl border border-gray-700 shadow-xl"
      >
        <p className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Graph Stats</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-gray-400">Total Skills</span>
            <span className="text-white font-semibold">{skills.length}</span>
          </div>
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-gray-400">Categories</span>
            <span className="text-white font-semibold">{categories.length}</span>
          </div>
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-gray-400">Avg Level</span>
            <span className="text-white font-semibold">
              {Math.round(skills.reduce((acc, s) => acc + s.level, 0) / skills.length)}%
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
