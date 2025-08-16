// File: frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiTarget, FiCheckCircle, FiAlertTriangle, FiGithub } from 'react-icons/fi';

// Main Dashboard Component
const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [prData, setPrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metricsResponse = await fetch('/performance_metrics.json');
        if (!metricsResponse.ok) throw new Error("Metrics file not found in /public/data/");
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);

        const prResponse = await fetch('/pr_curve_data.json');
        if (!prResponse.ok) throw new Error("P-R curve data file not found in /public/data/");
        const rawPrData = await prResponse.json();
        
        const formattedPrData = rawPrData.recall.map((rec, index) => ({
          recall: rec,
          precision: rawPrData.precision[index],
        })).sort((a, b) => a.recall - b.recall);
        setPrData(formattedPrData);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch model results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <StatusDisplay message="Loading model results..." />;
  }

  if (error) {
    return <StatusDisplay isError={true} message={error} />;
  }

  return (
    <div className="flex min-h-screen bg-brand-dark font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8">
        <Header />
        <motion.div initial="hidden" animate="visible">
          <StatCards metrics={metrics} />
          <PRCurveChart data={prData} />
        </motion.div>
      </main>
    </div>
  );
};

// --- Components ---

const Sidebar = () => (
  <nav className="hidden md:block w-64 bg-brand-light-dark border-r border-brand-border p-5">
    <div className="text-2xl font-bold text-white mb-10 flex items-center">
      <FiAlertTriangle className="text-brand-blue mr-2" />
      <span>GNN Fraud AI</span>
    </div>
    <ul>
      <NavItem icon={<FiGrid />} text="Dashboard" active />
      <NavItem icon={<FiTarget />} text="Live Predictions" />
    </ul>
    <div className="absolute bottom-5">
      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
        <FiGithub className="mr-2" />
        View on GitHub
      </a>
    </div>
  </nav>
);

const NavItem = ({ icon, text, active = false }) => (
  <li className={`flex items-center p-3 my-2 rounded-lg cursor-pointer transition-all duration-200 ${active ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-400 hover:bg-brand-border'}`}>
    {icon}
    <span className="ml-4">{text}</span>
  </li>
);

const Header = () => (
  <header className="mb-8">
    <h1 className="text-4xl font-bold text-white">Dashboard</h1>
    <p className="text-gray-400">Model Performance Overview</p>
  </header>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const StatCards = ({ metrics }) => (
  <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" variants={containerVariants}>
    <StatCard title="Optimal Threshold" value={metrics.best_threshold.toFixed(2)} icon={<FiTarget />} />
    <StatCard title="Fraud Recall" value={`${(metrics.recall * 100).toFixed(1)}%`} icon={<FiAlertTriangle />} />
    <StatCard title="Fraud Precision" value={`${(metrics.precision * 100).toFixed(1)}%`} icon={<FiCheckCircle />} />
    <StatCard title="Fraud F1-Score" value={metrics.f1_score.toFixed(2)} icon={<FiBalanceScale />} />
  </motion.div>
);

const StatCard = ({ title, value, icon }) => (
  <motion.div variants={itemVariants} className="bg-brand-light-dark p-5 rounded-lg border border-brand-border relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan to-brand-blue opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
    <div className="flex items-center">
      <div className="text-3xl text-brand-blue mr-4">{icon}</div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  </motion.div>
);

const PRCurveChart = ({ data }) => (
  <motion.div className="bg-brand-light-dark p-4 sm:p-6 rounded-lg border border-brand-border" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
    <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">Precision-Recall Curve</h2>
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
        <defs><linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2F81F7" stopOpacity={0.4}/><stop offset="95%" stopColor="#2F81F7" stopOpacity={0}/></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
        <XAxis dataKey="recall" stroke="#8B949E" type="number" domain={[0, 1]} tickFormatter={(val) => val.toFixed(1)} label={{ value: 'Recall', position: 'insideBottom', offset: -15, fill: '#8B949E' }} />
        <YAxis stroke="#8B949E" type="number" domain={[0, 1]} tickFormatter={(val) => val.toFixed(1)} label={{ value: 'Precision', angle: -90, position: 'insideLeft', offset: 0, fill: '#8B949E' }}/>
        <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid #30363D', color: '#E6EDF3' }} labelStyle={{ color: '#E6EDF3' }} />
        <Legend wrapperStyle={{ color: '#8B949E' }} />
        <Area type="monotone" dataKey="precision" name="Precision" stroke="#2F81F7" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);

const StatusDisplay = ({ isError = false, message }) => (
    <div className={`bg-brand-dark min-h-screen flex flex-col items-center justify-center p-4 text-center ${isError ? 'text-red-400' : 'text-gray-400'}`}>
        <h2 className="text-2xl font-bold mb-4">{isError ? "Failed to Load Dashboard Data" : "Loading..."}</h2>
        <p className="max-w-md">{message}</p>
        {isError && <p className="mt-4 text-sm text-gray-500">Please ensure the backend scripts have run successfully and the result files are in `frontend/public/data/`.</p>}
    </div>
);

export default Dashboard;
