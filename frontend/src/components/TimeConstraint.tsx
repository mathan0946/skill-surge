import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import { Clock, Calendar, Zap, Coffee, Target } from 'lucide-react';

interface TimeConstraintProps {
  onTimeSelected: (constraint: TimeConstraint) => void;
  selectedConstraint?: TimeConstraint;
}

export interface TimeConstraint {
  weeks: number;
  hoursPerDay: number;
  intensity: 'relaxed' | 'moderate' | 'intensive';
  label: string;
}

const timeOptions: TimeConstraint[] = [
  { 
    weeks: 8, 
    hoursPerDay: 3, 
    intensity: 'intensive',
    label: '2 Months (Intensive)' 
  },
  { 
    weeks: 12, 
    hoursPerDay: 2, 
    intensity: 'moderate',
    label: '3 Months (Moderate)' 
  },
  { 
    weeks: 16, 
    hoursPerDay: 1.5, 
    intensity: 'moderate',
    label: '4 Months (Balanced)' 
  },
  { 
    weeks: 24, 
    hoursPerDay: 1, 
    intensity: 'relaxed',
    label: '6 Months (Relaxed)' 
  },
];

const intensityIcons = {
  intensive: <Zap className="w-5 h-5" />,
  moderate: <Target className="w-5 h-5" />,
  relaxed: <Coffee className="w-5 h-5" />,
};

const intensityColors = {
  intensive: 'from-red-500 to-orange-500',
  moderate: 'from-blue-500 to-purple-500',
  relaxed: 'from-green-500 to-teal-500',
};

export function TimeConstraint({ onTimeSelected, selectedConstraint }: TimeConstraintProps) {
  const [selected, setSelected] = useState<TimeConstraint | null>(selectedConstraint || null);
  const [customHours, setCustomHours] = useState(2);

  const handleSelect = (option: TimeConstraint) => {
    setSelected(option);
    onTimeSelected(option);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-400">
          How much time can you dedicate to interview preparation?
        </p>
      </div>

      {/* Time Options */}
      <div className="grid gap-4 md:grid-cols-2">
        {timeOptions.map((option, index) => (
          <motion.div
            key={option.weeks}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:border-blue-500/50 ${
                selected?.weeks === option.weeks 
                  ? 'border-blue-500 ring-2 ring-blue-500/30' 
                  : ''
              }`}
              onClick={() => handleSelect(option)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${intensityColors[option.intensity]}`}>
                    {intensityIcons[option.intensity]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {option.label}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{option.hoursPerDay} hours/day recommended</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{option.weeks} weeks total</span>
                      </div>
                    </div>
                    
                    {/* Intensity indicator */}
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Intensity:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-4 rounded-sm ${
                                (option.intensity === 'intensive' && level <= 3) ||
                                (option.intensity === 'moderate' && level <= 2) ||
                                (option.intensity === 'relaxed' && level <= 1)
                                  ? `bg-gradient-to-t ${intensityColors[option.intensity]}`
                                  : 'bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-xs capitalize ${
                          option.intensity === 'intensive' ? 'text-orange-400' :
                          option.intensity === 'moderate' ? 'text-blue-400' : 'text-green-400'
                        }`}>
                          {option.intensity}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selected?.weeks === option.weeks 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-600'
                  }`}>
                    {selected?.weeks === option.weeks && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Daily hours slider */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">Daily study hours:</span>
                <span className="text-2xl font-bold text-blue-400">{customHours}h</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6"
                step="0.5"
                value={customHours}
                onChange={(e) => {
                  const hours = parseFloat(e.target.value);
                  setCustomHours(hours);
                  if (selected) {
                    onTimeSelected({ ...selected, hoursPerDay: hours });
                  }
                }}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>30 min</span>
                <span>3 hrs</span>
                <span>6 hrs</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* What to expect */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700"
        >
          <h4 className="text-white font-medium mb-2">What to expect:</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• {Math.round(selected.weeks * 5)} coding problems (DSA & System Design)</li>
            <li>• {Math.round(selected.weeks * 2)} mock interviews</li>
            <li>• Comprehensive subject coverage across all required topics</li>
            <li>• Weekly progress checkpoints</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}
