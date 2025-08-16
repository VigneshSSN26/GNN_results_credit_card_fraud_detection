// File: frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { FaChartLine, FaBullseye, FaBalanceScale, FaCheckCircle } from 'react-icons/fa';

function App() {
  const [metrics, setMetrics] = useState(null);
  const [prData, setPrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This function fetches the data from the /public/data folder
    const fetchData = async () => {
      try {
        // Fetch performance metrics
        const metricsResponse = await fetch('/data/performance_metrics.json');
        if (!metricsResponse.ok) throw new Error("Metrics file not found.");
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);

        // Fetch P-R curve data
        const prResponse = await fetch('/data/pr_curve_data.json');
        if (!prResponse.ok) throw new Error("P-R curve data file not found.");
        const rawPrData = await prResponse.json();
        
        // Combine the two arrays into an array of objects for Recharts
        const formattedPrData = rawPrData.recall.map((rec, index) => ({
          recall: rec,
          precision: rawPrData.precision[index],
        })).sort((a, b) => a.recall - b.recall); // Sort data for a clean line
        setPrData(formattedPrData);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch model results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // The empty array ensures this runs only once when the component mounts

  if (loading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <p>Loading model results...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="bg-gray-900 text-red-400 min-h-screen flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold mb-4">Failed to Load Dashboard Data</h2>
            <p className="text-center mb-2">Error: {error}</p>
            <p className="text-center text-gray-400">Please make sure you have run the Python backend scripts and copied the generated JSON files into the `frontend/public/data/` directory.</p>
        </div>
    );
  }


  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400">GNN Fraud Detection Dashboard</h1>
          <p className="text-gray-400 mt-1">Analysis of the Predictive Model Performance</p>
        </header>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard title="Optimal Threshold" value={metrics.best_threshold.toFixed(2)} icon={<FaBullseye />} />
          <StatCard title="Fraud Recall" value={`${(metrics.recall * 100).toFixed(1)}%`} icon={<FaChartLine />} />
          <StatCard title="Fraud Precision" value={`${(metrics.precision * 100).toFixed(1)}%`} icon={<FaCheckCircle />} />
          <StatCard title="Fraud F1-Score" value={metrics.f1_score.toFixed(2)} icon={<FaBalanceScale />} />
        </motion.div>

        <motion.div 
          className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">Precision-Recall Curve</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={prData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis dataKey="recall" stroke="#A0AEC0" type="number" domain={[0, 1]} tickFormatter={(val) => val.toFixed(1)}
                     label={{ value: 'Recall', position: 'insideBottom', offset: -15, fill: '#A0AEC0' }} />
              <YAxis stroke="#A0AEC0" type="number" domain={[0, 1]} tickFormatter={(val) => val.toFixed(1)}
                     label={{ value: 'Precision', angle: -90, position: 'insideLeft', offset: 0, fill: '#A0AEC0' }}/>
              <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
              <Legend wrapperStyle={{ color: '#A0AEC0' }} />
              <Line type="monotone" dataKey="precision" name="Precision" stroke="#4FD1C5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon }) => (
  <motion.div 
    className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center"
    whileHover={{ scale: 1.05, backgroundColor: '#2D3748' }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="text-3xl text-cyan-400 mr-4">{icon}</div>
    <div>
      <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  </motion.div>
);

export default App;