import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const summaryData = [
  {
    title: 'In Progress',
    count: 12,
    total: 18,
    percentage: 67,
    icon: Clock,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Completed',
    count: 45,
    total: 50,
    percentage: 90,
    icon: CheckCircle2,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Needs Attention',
    count: 3,
    total: 18,
    percentage: 17,
    icon: AlertCircle,
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export function SummaryCards() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-900">Project Summary</h2>
        <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryData.map((item, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-600 mb-1">{item.title}</p>
                <p className="text-slate-900">
                  {item.count} <span className="text-slate-500">/ {item.total}</span>
                </p>
              </div>
              <div className={`${item.bgColor} ${item.iconColor} p-3 rounded-lg`}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <Progress value={item.percentage} className="h-2" />
            <p className="text-slate-600 mt-2">{item.percentage}% Complete</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
