import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Star, Code, Database, Server, Cloud, Palette, Settings } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  connections?: string[];
}

interface SkillProficiencyProps {
  skills: Skill[];
  onSkillsRated: (ratedSkills: Skill[]) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Languages': <Code className="w-4 h-4" />,
  'Frontend': <Palette className="w-4 h-4" />,
  'Backend': <Server className="w-4 h-4" />,
  'Database': <Database className="w-4 h-4" />,
  'DevOps': <Cloud className="w-4 h-4" />,
  'Tools': <Settings className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  'Languages': 'from-blue-500 to-blue-600',
  'Frontend': 'from-purple-500 to-purple-600',
  'Backend': 'from-green-500 to-green-600',
  'Database': 'from-orange-500 to-orange-600',
  'DevOps': 'from-cyan-500 to-cyan-600',
  'Tools': 'from-gray-500 to-gray-600',
};

const proficiencyLabels = [
  { value: 1, label: 'Beginner', description: 'Just started learning' },
  { value: 2, label: 'Basic', description: 'Can do simple tasks' },
  { value: 3, label: 'Intermediate', description: 'Comfortable with most tasks' },
  { value: 4, label: 'Advanced', description: 'Can handle complex problems' },
  { value: 5, label: 'Expert', description: 'Deep expertise, can mentor others' },
];

export function SkillProficiency({ skills, onSkillsRated }: SkillProficiencyProps) {
  const [ratedSkills, setRatedSkills] = useState<Skill[]>(
    skills.map(s => ({ ...s, level: Math.round(s.level / 20) || 3 })) // Convert 0-100 to 1-5
  );

  const handleRatingChange = (skillId: string, newLevel: number) => {
    const updated = ratedSkills.map(s => 
      s.id === skillId ? { ...s, level: newLevel } : s
    );
    setRatedSkills(updated);
    // Convert back to 0-100 scale for the parent
    onSkillsRated(updated.map(s => ({ ...s, level: s.level * 20 })));
  };

  // Group skills by category
  const groupedSkills = ratedSkills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-gray-400">
          Rate your proficiency in each skill (1 = Beginner, 5 = Expert)
        </p>
      </div>

      {/* Proficiency Legend */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {proficiencyLabels.map(({ value, label }) => (
          <div key={value} className="flex items-center gap-1 text-xs text-gray-400">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                />
              ))}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Skills by Category */}
      <div className="grid gap-6">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColors[category] || 'from-gray-500 to-gray-600'}`}>
                    {categoryIcons[category] || <Code className="w-4 h-4" />}
                  </div>
                  {category}
                  <span className="text-sm font-normal text-gray-400">
                    ({categorySkills.length} skills)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                    >
                      <span className="font-medium text-white">{skill.name}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => handleRatingChange(skill.id, level)}
                            className="p-1 transition-transform hover:scale-110"
                            title={proficiencyLabels[level - 1].description}
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                level <= skill.level
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-600 hover:text-gray-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <p className="text-sm text-blue-400">
          <strong>Tip:</strong> Be honest about your skill levels. This helps us create a realistic 
          roadmap that fills your knowledge gaps effectively.
        </p>
      </div>
    </div>
  );
}
