import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTarget, FiCheckCircle, FiAlertTriangle, FiGithub, FiGrid, FiBarChart3, FiTrendingUp, FiShield, FiActivity } from 'react-icons/fi';

// Mock data for demonstration
const mockMetrics = {
  best_threshold: 0.75,
  recall: 0.87,
  precision: 0.92,
  f1_score: 0.89
};

const mockPrData = [
  { recall: 0.0, precision: 1.0 },
  { recall: 0.1, precision: 0.98 },
  { recall: 0.2, precision: 0.95 },
  { recall: 0.3, precision: 0.93 },
  { recall: 0.4, precision: 0.90 },
  { recall: 0.5, precision: 0.88 },
  { recall: 0.6, precision: 0.85 },
  { recall: 0.7, precision: 0.82 },
  { recall: 0.8, precision: 0.78 },
  { recall: 0.9, precision: 0.70 },
  { recall: 1.0, precision: 0.45 }
];

// Main Dashboard Component
const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [prData, setPrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch real data first
        const metricsResponse = await fetch('/performance_metrics.json');
        const prResponse = await fetch('/pr_curve_data.json');
        
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
          // Use mock data if files don't exist
          setMetrics(mockMetrics);
          setPrData(mockPrData);
        }
      } catch (err) {
        // Use mock data on error
        setMetrics(mockMetrics);
        setPrData(mockPrData);
      } finally {
        setLoading(false);
      }
    };
    
    // Simulate loading delay
    setTimeout(fetchData, 1000);
  }, []);

  if (loading) {
    return <StatusDisplay message="Loading model results..." />;
  }

  if (error) {
    return <StatusDisplay isError={true} message={error} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <Header />
          <div className="space-y-8">
            <StatCards metrics={metrics} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <PRCurveChart data={prData} />
              </div>
              <div className="space-y-6">
                <ModelInfoCard />
                <RecentActivity />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Components ---

const Sidebar = () => (
  <nav className="hidden lg:block w-64 bg-slate-800 border-r border-slate-700 flex-shrink-0">
    <div className="p-6">
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center mr-3">
          <FiShield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">FraudShield</h1>
          <p className="text-xs text-slate-400">AI Detection</p>
        </div>
      </div>
      
      <ul className="space-y-2">
        <NavItem icon={<FiGrid className="w-5 h-5" />} text="Dashboard" active />
        <NavItem icon={<FiBarChart3 className="w-5 h-5" />} text="Analytics" />
        <NavItem icon={<FiTarget className="w-5 h-5" />} text="Predictions" />
        <NavItem icon={<FiActivity className="w-5 h-5" />} text="Monitoring" />
      </ul>
      
      <div className="absolute bottom-6 left-6">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
           className="flex items-center text-sm text-slate-400 hover:text-white transition-colors">
          <FiGithub className="w-4 h-4 mr-2" />
          GitHub
        </a>
      </div>
    </div>
  </nav>
);

const NavItem = ({ icon, text, active = false }) => (
  <li className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
    active 
      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
  }`}>
    {icon}
    <span className="ml-3 font-medium">{text}</span>
  </li>
);

const Header = () => (
  <header className="mb-8">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Model Performance Dashboard</h2>
        <p className="text-slate-400">Real-time fraud detection analytics and insights</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm border border-green-500/20">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Model Active
        </div>
      </div>
    </div>
  </header>
);

const StatCards = ({ metrics }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard 
      title="Optimal Threshold" 
      value={metrics.best_threshold.toFixed(2)} 
      icon={<FiTarget className="w-6 h-6" />}
      trend="+2.3%"
      trendUp={true}
      gradient="from-purple-500 to-purple-600"
    />
    <StatCard 
      title="Fraud Recall" 
      value={`${(metrics.recall * 100).toFixed(1)}%`} 
      icon={<FiAlertTriangle className="w-6 h-6" />}
      trend="+5.1%"
      trendUp={true}
      gradient="from-orange-500 to-red-500"
    />
    <StatCard 
      title="Fraud Precision" 
      value={`${(metrics.precision * 100).toFixed(1)}%`} 
      icon={<FiCheckCircle className="w-6 h-6" />}
      trend="+1.8%"
      trendUp={true}
      gradient="from-green-500 to-emerald-500"
    />
    <StatCard 
      title="F1-Score" 
      value={metrics.f1_score.toFixed(3)} 
      icon={<FiTrendingUp className="w-6 h-6" />}
      trend="+3.4%"
      trendUp={true}
      gradient="from-blue-500 to-cyan-500"
    />
  </div>
);

const StatCard = ({ title, value, icon, trend, trendUp, gradient }) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden group hover:border-slate-600 transition-colors">
    <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">{title}</p>
        <p className="text-2xl lg:text-3xl font-bold text-white mb-1">{value}</p>
        {trend && (
          <div className={`flex items-center text-sm ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            <FiTrendingUp className={`w-4 h-4 mr-1 ${!trendUp ? 'rotate-180' : ''}`} />
            {trend}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient}`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
    </div>
  </div>
);

const PRCurveChart = ({ data }) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-white mb-2">Precision-Recall Curve</h3>
      <p className="text-slate-400 text-sm">Model performance across different threshold values</p>
    </div>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorPrecision" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="recall" 
            stroke="#9CA3AF" 
            type="number" 
            domain={[0, 1]} 
            tickFormatter={(val) => val.toFixed(1)}
            label={{ value: 'Recall', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF" 
            type="number" 
            domain={[0, 1]} 
            tickFormatter={(val) => val.toFixed(1)}
            label={{ value: 'Precision', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151', 
              borderRadius: '8px',
              color: '#F9FAFB' 
            }}
            labelStyle={{ color: '#F9FAFB' }}
            formatter={(value, name) => [value.toFixed(3), name]}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Area 
            type="monotone" 
            dataKey="precision" 
            name="Precision" 
            stroke="#3B82F6" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorPrecision)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ModelInfoCard = () => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
    <h3 className="text-lg font-semibold text-white mb-4">Model Information</h3>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-slate-400">Algorithm</span>
        <span className="text-white font-medium">Graph Neural Network</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Training Data</span>
        <span className="text-white font-medium">1.2M Transactions</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Last Updated</span>
        <span className="text-white font-medium">2 hours ago</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Version</span>
        <span className="text-white font-medium">v2.1.0</span>
      </div>
    </div>
  </div>
);

const RecentActivity = () => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
    <div className="space-y-4">
      <ActivityItem 
        type="detection"
        message="Fraud detected in transaction #TX789"
        time="5 min ago"
        severity="high"
      />
      <ActivityItem 
        type="model"
        message="Model retrained successfully"
        time="2 hours ago"
        severity="success"
      />
      <ActivityItem 
        type="alert"
        message="Threshold adjustment recommended"
        time="1 day ago"
        severity="warning"
      />
    </div>
  </div>
);

const ActivityItem = ({ type, message, time, severity }) => {
  const getIcon = () => {
    switch(type) {
      case 'detection': return <FiAlertTriangle className="w-4 h-4" />;
      case 'model': return <FiCheckCircle className="w-4 h-4" />;
      case 'alert': return <FiAlertTriangle className="w-4 h-4" />;
      default: return <FiActivity className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    switch(severity) {
      case 'high': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <div className={`mt-1 ${getColor()}`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-white text-sm">{message}</p>
        <p className="text-slate-400 text-xs mt-1">{time}</p>
      </div>
    </div>
  );
};

const StatusDisplay = ({ isError = false, message }) => (
  <div className={`bg-slate-900 min-h-screen flex flex-col items-center justify-center p-4 text-center`}>
    <div className="max-w-md">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
        isError ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
      }`}>
        {isError ? <FiAlertTriangle className="w-8 h-8" /> : <FiActivity className="w-8 h-8 animate-spin" />}
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">
        {isError ? "Failed to Load Dashboard Data" : "Loading Dashboard..."}
      </h2>
      <p className="text-slate-400 mb-4">{message}</p>
      {isError && (
        <p className="text-sm text-slate-500">
          Using demo data for visualization. Please ensure the backend scripts have run successfully.
        </p>
      )}
    </div>
  </div>
);

export default Dashboard;
