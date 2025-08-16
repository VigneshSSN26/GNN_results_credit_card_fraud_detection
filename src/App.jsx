// File: frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiCheckCircle, FiAlertTriangle, FiGithub, FiGrid, FiBarChart, FiTrendingUp, FiShield, FiActivity } from 'react-icons/fi';

// --- Mock Data ---
// This data is used as a fallback if your local JSON files are not found.
// It ensures the dashboard always looks complete for a presentation.
const mockMetrics = {
  best_threshold: 0.40,
  recall: 0.54,
  precision: 0.54,
  f1_score: 0.542
};

const mockPrData = [
  { recall: 0.0, precision: 1.0 }, { recall: 0.1, precision: 0.99 },
  { recall: 0.2, precision: 0.97 }, { recall: 0.3, precision: 0.94 },
  { recall: 0.4, precision: 0.89 }, { recall: 0.5, precision: 0.82 },
  { recall: 0.6, precision: 0.75 }, { recall: 0.7, precision: 0.68 },
  { recall: 0.8, precision: 0.61 }, { recall: 0.9, precision: 0.55 },
  { recall: 1.0, precision: 0.45 }
].sort((a,b) => a.recall - b.recall);


// --- Main Dashboard Component ---
const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [prData, setPrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch real data from the /public/data folder
        const metricsResponse = await fetch('/data/performance_metrics.json');
        const prResponse = await fetch('/data/pr_curve_data.json');
        
        if (metricsResponse.ok && prResponse.ok) {
          const metricsData = await metricsResponse.json();
          const rawPrData = await prResponse.json();
          
          setMetrics(metricsData);
          const formattedPrData = rawPrData.recall.map((rec, index) => ({
            recall: rec,
            precision: rawPrData.precision[index],
          })).sort((a, b) => a.recall - b.recall);
          setPrData(formattedPrData);
        } else {
           throw new Error("Real data not found. Displaying mock data for demonstration.");
        }
      } catch (err) {
        console.warn(err.message);
        setError(err.message);
        // Use mock data as a fallback if fetching fails
        setMetrics(mockMetrics);
        setPrData(mockPrData);
      } finally {
        // Simulate a loading delay for a smoother user experience
        setTimeout(() => setLoading(false), 500);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <StatusDisplay message="Initializing AI Core..." />;
  }

  return (
    <div className="flex min-h-screen bg-brand-dark text-gray-300 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <Header />
          <AnimatePresence>
            <motion.div 
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {error && <ErrorMessage message={error} />}
              <StatCards metrics={metrics} />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                  <PRCurveChart data={prData} />
                </div>
                <div className="space-y-8">
                  <ModelInfoCard />
                  <RecentActivity />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- Reusable Components ---

const Sidebar = () => (
  <nav className="hidden md:flex w-64 bg-brand-light-dark border-r border-brand-border flex-col flex-shrink-0">
    <div className="p-6 flex-grow">
      <div className="flex items-center mb-10">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-cyan rounded-lg flex items-center justify-center mr-3 shadow-lg">
          <FiShield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">FraudShield</h1>
          <p className="text-xs text-gray-400">GNN Predictive AI</p>
        </div>
      </div>
      
      <ul className="space-y-2">
        <NavItem icon={<FiGrid className="w-5 h-5" />} text="Dashboard" active />
        <NavItem icon={<FiBarChart className="w-5 h-5" />} text="Analytics" />
        <NavItem icon={<FiTarget className="w-5 h-5" />} text="Live Predictions" />
        <NavItem icon={<FiActivity className="w-5 h-5" />} text="Monitoring" />
      </ul>
    </div>
    <div className="p-6">
      <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
         className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
        <FiGithub className="w-4 h-4 mr-2" />
        View on GitHub
      </a>
    </div>
  </nav>
);

const NavItem = ({ icon, text, active = false }) => (
  <li className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
    active 
      ? 'bg-gradient-to-r from-brand-blue to-cyan-500 text-white shadow-lg' 
      : 'text-gray-400 hover:bg-brand-border hover:text-white'
  }`}>
    {icon}
    <span className="ml-3 font-medium">{text}</span>
  </li>
);

const Header = () => (
  <header className="mb-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold text-white mb-1">Model Performance Dashboard</h2>
        <p className="text-gray-400">Real-time fraud detection analytics and insights</p>
      </div>
      <div className="flex items-center px-3 py-1 bg-green-500 bg-opacity-10 text-green-400 rounded-full text-sm border border-green-500 border-opacity-20">
        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
        Model Active
      </div>
    </div>
  </header>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const StatCards = ({ metrics }) => (
  <motion.div 
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    variants={containerVariants}
  >
    <StatCard title="Optimal Threshold" value={metrics.best_threshold.toFixed(2)} icon={<FiTarget />} gradient="from-purple-500 to-indigo-500" />
    <StatCard title="Fraud Recall" value={`${(metrics.recall * 100).toFixed(1)}%`} icon={<FiAlertTriangle />} gradient="from-red-500 to-orange-500" />
    <StatCard title="Fraud Precision" value={`${(metrics.precision * 100).toFixed(1)}%`} icon={<FiCheckCircle />} gradient="from-emerald-500 to-green-500" />
    <StatCard title="F1-Score" value={metrics.f1_score.toFixed(3)} icon={<FiTrendingUp />} gradient="from-cyan-500 to-blue-500" />
  </motion.div>
);

const StatCard = ({ title, value, icon, gradient }) => (
  <motion.div 
    variants={itemVariants}
    className="bg-brand-light-dark p-6 rounded-xl border border-brand-border relative overflow-hidden group hover:border-gray-600 transition-colors duration-300"
  >
    <div className={`absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br ${gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500`}></div>
    <div className="flex items-start justify-between relative z-10">
      <div className="flex-1">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{title}</p>
        <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-gray-900 border border-brand-border`}>
        <div className="text-white">{icon}</div>
      </div>
    </div>
  </motion.div>
);

const PRCurveChart = ({ data }) => (
  <motion.div 
    variants={itemVariants}
    className="bg-brand-light-dark p-6 rounded-xl border border-brand-border h-full"
  >
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-white">Precision-Recall Curve</h3>
      <p className="text-gray-400 text-sm">Model performance across different thresholds</p>
    </div>
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
        <defs>
          <linearGradient id="colorPrecision" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2F81F7" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#2F81F7" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
        <XAxis dataKey="recall" stroke="#8B949E" type="number" domain={[0, 1]} tickFormatter={(val) => val.toFixed(1)} label={{ value: 'Recall', position: 'insideBottom', offset: -15, fill: '#8B949E' }} />
        <YAxis stroke="#8B949E" type="number" domain={[0, 1]} tickFormatter={(val) => val.toFixed(1)} label={{ value: 'Precision', angle: -90, position: 'insideLeft', offset: 10, fill: '#8B949E' }}/>
        <Tooltip contentStyle={{ backgroundColor: '#0D1117', border: '1px solid #30363D', borderRadius: '8px', color: '#E6EDF3' }} labelStyle={{ color: '#E6EDF3' }} formatter={(value) => value.toFixed(3)} />
        <Legend wrapperStyle={{ color: '#8B949E' }} />
        <Area type="monotone" dataKey="precision" name="Precision" stroke="#2F81F7" strokeWidth={2} fillOpacity={1} fill="url(#colorPrecision)" />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);

const ModelInfoCard = () => (
  <motion.div 
    variants={itemVariants}
    className="bg-brand-light-dark p-6 rounded-xl border border-brand-border"
  >
    <h3 className="text-lg font-semibold text-white mb-4">Model Information</h3>
    <div className="space-y-3 text-sm">
      <InfoRow label="Algorithm" value="Graph Attention Network (GAT)" />
      <InfoRow label="Features" value="5 (incl. Txn Distance)" />
      <InfoRow label="Training Data" value="2,058 Txns (Balanced)" />
      <InfoRow label="Last Updated" value="Aug 17, 2025" />
    </div>
  </motion.div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-400">{label}</span>
    <span className="text-white font-medium">{value}</span>
  </div>
);

const RecentActivity = () => (
  <motion.div 
    variants={itemVariants}
    className="bg-brand-light-dark p-6 rounded-xl border border-brand-border"
  >
    <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
    <div className="space-y-4">
      <ActivityItem message="High-risk transaction #TX789 flagged" time="5 min ago" severity="high" />
      <ActivityItem message="Model retraining completed successfully" time="2 hours ago" severity="success" />
      <ActivityItem message="Unusual activity spike from merchant M12" time="1 day ago" severity="warning" />
    </div>
  </motion.div>
);

const ActivityItem = ({ message, time, severity }) => {
  const severityStyles = {
    high: { icon: <FiAlertTriangle />, color: 'text-red-400' },
    success: { icon: <FiCheckCircle />, color: 'text-green-400' },
    warning: { icon: <FiAlertTriangle />, color: 'text-yellow-400' },
  };
  const { icon, color } = severityStyles[severity] || {};

  return (
    <div className="flex items-start space-x-3">
      <div className={`mt-1 ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-white text-sm">{message}</p>
        <p className="text-gray-500 text-xs mt-1">{time}</p>
      </div>
    </div>
  );
};

const StatusDisplay = ({ isError = false, message }) => (
  <div className="bg-brand-dark min-h-screen flex flex-col items-center justify-center p-4 text-center">
    <div className="max-w-md">
      <motion.div 
        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isError ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}
        animate={!isError ? { rotate: 360 } : {}}
        transition={!isError ? { loop: Infinity, ease: "linear", duration: 2 } : {}}
      >
        {isError ? <FiAlertTriangle className="w-8 h-8" /> : <FiShield className="w-8 h-8" />}
      </motion.div>
      <h2 className="text-2xl font-bold mb-4 text-white">{isError ? "Failed to Load Data" : message}</h2>
      {isError && <p className="text-gray-400">{message}</p>}
    </div>
  </div>
);

const ErrorMessage = ({ message }) => (
    <motion.div 
        className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-4 py-3 rounded-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
    >
        <p className="font-semibold">Data Warning</p>
        <p classNam
