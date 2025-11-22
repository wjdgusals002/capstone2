import { Card } from './ui/card';
import { TrendingUp, Users, Target, Award } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jan', value: 4000, projects: 24 },
  { name: 'Feb', value: 3000, projects: 18 },
  { name: 'Mar', value: 5000, projects: 32 },
  { name: 'Apr', value: 4500, projects: 28 },
  { name: 'May', value: 6000, projects: 42 },
  { name: 'Jun', value: 5500, projects: 38 },
];

const achievements = [
  { icon: TrendingUp, label: 'Revenue', value: '$45,231', change: '+20.1%', color: 'text-blue-600' },
  { icon: Users, label: 'Active Users', value: '2,345', change: '+15.3%', color: 'text-green-600' },
  { icon: Target, label: 'Completion Rate', value: '94.2%', change: '+2.4%', color: 'text-purple-600' },
  { icon: Award, label: 'Projects Done', value: '182', change: '+12.5%', color: 'text-orange-600' },
];

export function HeroPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">Welcome back, John!</h1>
        <p className="text-slate-600">Here's what's happening with your projects today.</p>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((achievement, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 mb-1">{achievement.label}</p>
                <p className="text-slate-900 mb-1">{achievement.value}</p>
                <p className={`${achievement.color}`}>{achievement.change}</p>
              </div>
              <div className={`${achievement.color} bg-slate-50 p-3 rounded-lg`}>
                <achievement.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Project Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="projects" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
