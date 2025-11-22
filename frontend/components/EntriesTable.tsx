import { Card } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const entries = [
  {
    id: 'PRJ-001',
    name: 'Website Redesign',
    client: 'Acme Corp',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2025-11-15',
    progress: 75,
  },
  {
    id: 'PRJ-002',
    name: 'Mobile App Development',
    client: 'TechStart Inc',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: '2025-11-20',
    progress: 45,
  },
  {
    id: 'PRJ-003',
    name: 'Brand Identity',
    client: 'Creative Studios',
    status: 'Completed',
    priority: 'Low',
    dueDate: '2025-11-05',
    progress: 100,
  },
  {
    id: 'PRJ-004',
    name: 'E-commerce Platform',
    client: 'Retail Group',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2025-11-18',
    progress: 60,
  },
  {
    id: 'PRJ-005',
    name: 'Marketing Campaign',
    client: 'Global Brands',
    status: 'Review',
    priority: 'Medium',
    dueDate: '2025-11-12',
    progress: 85,
  },
  {
    id: 'PRJ-006',
    name: 'Database Migration',
    client: 'Enterprise Co',
    status: 'On Hold',
    priority: 'High',
    dueDate: '2025-11-25',
    progress: 30,
  },
  {
    id: 'PRJ-007',
    name: 'SEO Optimization',
    client: 'Digital Media',
    status: 'Completed',
    priority: 'Low',
    dueDate: '2025-11-03',
    progress: 100,
  },
  {
    id: 'PRJ-008',
    name: 'Cloud Infrastructure',
    client: 'CloudTech',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2025-11-22',
    progress: 55,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'Review':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
    case 'On Hold':
      return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    default:
      return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'Medium':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
    case 'Low':
      return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    default:
      return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
  }
};

export function EntriesTable() {
  return (
    <Card>
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 mb-1">Recent Projects</h2>
            <p className="text-slate-600">A list of all your recent project entries</p>
          </div>
          <Button variant="outline">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-slate-900">{entry.id}</TableCell>
                <TableCell className="text-slate-900">{entry.name}</TableCell>
                <TableCell className="text-slate-600">{entry.client}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(entry.status)}>
                    {entry.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(entry.priority)}>
                    {entry.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600">{entry.dueDate}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${entry.progress}%` }}
                      />
                    </div>
                    <span className="text-slate-600">{entry.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
