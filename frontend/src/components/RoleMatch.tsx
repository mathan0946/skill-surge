import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Progress } from './ui/Progress';
import { Check, Target, TrendingUp } from 'lucide-react';

interface Role {
  id: string;
  title: string;
  company?: string;
  matchPercentage: number;
  requiredSkills: string[];
  missingSkills: string[];
  salary?: string;
}

interface RoleMatchProps {
  roles: Role[];
  onSelectRole: (role: Role) => void;
  selectedRoleId?: string;
}

export function RoleMatch({ roles, onSelectRole, selectedRoleId }: RoleMatchProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">
        <Target className="inline-block w-6 h-6 mr-2 text-blue-500" />
        Recommended Roles
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:border-blue-500 ${
                selectedRoleId === role.id ? 'border-blue-500 ring-2 ring-blue-500/20' : ''
              }`}
              onClick={() => onSelectRole(role)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                  {selectedRoleId === role.id && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>
                {role.company && (
                  <p className="text-sm text-gray-400">{role.company}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Match Percentage */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Match Score</span>
                      <span className={`font-medium ${
                        role.matchPercentage >= 70 ? 'text-green-500' :
                        role.matchPercentage >= 50 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {role.matchPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={role.matchPercentage}
                      indicatorClassName={
                        role.matchPercentage >= 70 ? 'bg-green-500' :
                        role.matchPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Your Matching Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {role.requiredSkills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400"
                        >
                          {skill}
                        </span>
                      ))}
                      {role.requiredSkills.length > 4 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-400">
                          +{role.requiredSkills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {role.missingSkills.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Skills to Learn</p>
                      <div className="flex flex-wrap gap-1">
                        {role.missingSkills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-400"
                          >
                            {skill}
                          </span>
                        ))}
                        {role.missingSkills.length > 3 && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-400">
                            +{role.missingSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Salary */}
                  {role.salary && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">{role.salary}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
