
import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart,
  Bar,
  Legend, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for the charts
const monthlyData = [
  { name: 'Jan', conferences: 65, participants: 124, duration: 32 },
  { name: 'Feb', conferences: 59, participants: 98, duration: 37 },
  { name: 'Mar', conferences: 80, participants: 142, duration: 45 },
  { name: 'Apr', conferences: 81, participants: 158, duration: 39 },
  { name: 'May', conferences: 56, participants: 103, duration: 28 },
  { name: 'Jun', conferences: 55, participants: 85, duration: 27 },
  { name: 'Jul', conferences: 40, participants: 78, duration: 22 },
];

const departmentData = [
  { name: 'Operations', value: 32, color: '#0ea5e9' },
  { name: 'Finance', value: 28, color: '#8b5cf6' },
  { name: 'Management', value: 22, color: '#f97316' },
  { name: 'Administration', value: 18, color: '#d946ef' },
];

const DashboardChart = () => {
  const [chartType, setChartType] = useState<'trends' | 'departments' | 'participation'>('trends');
  
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Conference Analytics</CardTitle>
        <CardDescription>Visual analysis of conference data</CardDescription>
        <Tabs 
          value={chartType} 
          onValueChange={(value) => setChartType(value as 'trends' | 'departments' | 'participation')}
          className="mt-2"
        >
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="departments">Department Distribution</TabsTrigger>
            <TabsTrigger value="participation">Participation Metrics</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <TabsContent value="trends" className="h-full mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorConferences" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="conferences" 
                  stroke="#f97316" 
                  fillOpacity={1} 
                  fill="url(#colorConferences)" 
                  name="Conferences"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="departments" className="h-full mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="participation" className="h-full mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="participants" name="Participants" fill="#8b5cf6" />
                <Bar dataKey="duration" name="Duration (hours)" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardChart;
