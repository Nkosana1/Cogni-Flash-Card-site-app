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

export interface RetentionGraphProps {
  data: Array<{
    date: string;
    retention: number;
    ease_factor: number;
  }>;
  className?: string;
}

export const RetentionGraph: React.FC<RetentionGraphProps> = ({ data, className }) => {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">Retention Rate</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="retention"
            stroke="#10b981"
            name="Retention %"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="ease_factor"
            stroke="#3b82f6"
            name="Avg Ease Factor"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

