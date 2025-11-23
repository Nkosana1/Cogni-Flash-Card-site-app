import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface ProgressChartProps {
  data: Array<{
    date: string;
    reviewed: number;
    correct: number;
    accuracy: number;
  }>;
  className?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data, className }) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="reviewed"
            stroke="#3b82f6"
            name="Cards Reviewed"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="correct"
            stroke="#10b981"
            name="Correct"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#f59e0b"
            name="Accuracy %"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

