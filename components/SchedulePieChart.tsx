import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ScheduleItem } from '../types';

interface SchedulePieChartProps {
  schedule: ScheduleItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const duration = (percent * 24).toFixed(1);

  if (percent < 0.05) return null; // Don't render label for small slices

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium pointer-events-none">
      {`${name} (${duration}h)`}
    </text>
  );
};

const SchedulePieChart: React.FC<SchedulePieChartProps> = ({ schedule, selectedItemId, onSelectItem }) => {

  const chartData = useMemo(() => {
    return schedule.map(item => ({
      ...item,
      duration: item.end - item.start,
    })).sort((a,b) => a.start - b.start);
  }, [schedule]);

  const formatTime = (hour: number) => {
    const h = Math.floor(hour) % 24;
    const m = Math.round((hour % 1) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-700 p-2 border border-slate-600 rounded-md shadow-lg text-sm">
          <p className="font-bold" style={{ color: data.color }}>{data.name}</p>
          <p>{`時間: ${formatTime(data.start)} - ${formatTime(data.end)}`}</p>
          <p>{`時間: ${data.duration.toFixed(2)} 時間`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius="80%"
          innerRadius="40%"
          fill="#8884d8"
          dataKey="duration"
          nameKey="name"
          startAngle={90}
          endAngle={-270}
          onClick={(data) => onSelectItem(data.id === selectedItemId ? null : data.id)}
        >
          {chartData.map((entry) => (
            <Cell 
              key={`cell-${entry.id}`} 
              fill={entry.color} 
              stroke={entry.id === selectedItemId ? '#3B82F6' : entry.color}
              strokeWidth={entry.id === selectedItemId ? 4 : 1}
              className="transition-all duration-300 cursor-pointer"
            />
          ))}
        </Pie>
        <Legend
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: '12px', padding: '10px 0' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SchedulePieChart;