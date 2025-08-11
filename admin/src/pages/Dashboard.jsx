import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import {
  Home,
  Activity,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  AlertCircle,
  Loader,
} from "lucide-react";
import { backendurl } from "../App";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalViews: 0,
    pendingAppointments: 0,
    recentActivity: [],
    viewsData: {},
    loading: true,
    error: null,
  });
  const [viewsOverTime, setViewsOverTime] = useState({});
  const [completedTransactions, setCompletedTransactions] = useState(0);
  const [propertyStatusData, setPropertyStatusData] = useState({});

  // Helper function to process multilingual content
  const processMultilingualContent = (content) => {
    if (typeof content === 'string') {
      return content;
    }
    
    if (typeof content === 'object' && content !== null) {
      const currentLang = i18n.language;
      // Try to get content in current language, fallback to English, then to first available language
      return content[currentLang] || content['en'] || content['ar'] || Object.values(content)[0] || String(content);
    }
    
    return String(content);
  };

  // Helper function to process activity descriptions
  const processActivityDescription = (description) => {
    if (typeof description === 'string') {
      // Handle cases where the description contains JSON-like structures
      if (description.includes('{') && description.includes('}')) {
        try {
          // Extract the JSON part and replace it with translated content
          const parts = description.split(/(\{[^}]+\})/);
          const processedParts = parts.map(part => {
            if (part.startsWith('{') && part.endsWith('}')) {
              try {
                // Handle the specific format: { en: 'Villa 2', ar: 'فيلا 2' }
                // First replace single quotes with double quotes, then add quotes around property names
                let cleanPart = part.replace(/'/g, '"'); // Replace single quotes with double quotes
                cleanPart = cleanPart.replace(/(\w+):/g, '"$1":'); // Add quotes around property names
                const jsonContent = JSON.parse(cleanPart);
                const currentLang = i18n.language;
                const result = jsonContent[currentLang] || jsonContent['en'] || jsonContent['ar'] || Object.values(jsonContent)[0];
                return result;
              } catch (error) {
                // Fallback to regex parsing if JSON parsing fails
                try {
                  // Use regex to extract language values directly
                  const langMatch = part.match(/ar:\s*'([^']+)'/);
                  const enMatch = part.match(/en:\s*'([^']+)'/);
                  const currentLang = i18n.language;
                  
                  if (currentLang === 'ar' && langMatch) {
                    return langMatch[1];
                  } else if (currentLang === 'en' && enMatch) {
                    return enMatch[1];
                  } else if (enMatch) {
                    return enMatch[1]; // fallback to English
                  } else if (langMatch) {
                    return langMatch[1]; // fallback to Arabic
                  }
                } catch (regexError) {
                  // If all parsing methods fail, return the original part
                }
                return part;
              }
            }
            return part;
          });
          
          // Now translate the static parts of the message
          const fullMessage = processedParts.join('');
          
          // Translate common activity message patterns
          if (fullMessage.includes('Client scheduled viewing for')) {
            return fullMessage.replace('Client scheduled viewing for', t('dashboard.activity.clientScheduledViewing'));
          }
          if (fullMessage.includes('New property listed:')) {
            return fullMessage.replace('New property listed:', t('dashboard.activity.newPropertyListed') + ':');
          }
          if (fullMessage.includes('Property added:')) {
            return fullMessage.replace('Property added:', t('dashboard.activity.propertyAdded') + ':');
          }
          if (fullMessage.includes('Property updated:')) {
            return fullMessage.replace('Property updated:', t('dashboard.activity.propertyUpdated') + ':');
          }
          if (fullMessage.includes('Property deleted:')) {
            return fullMessage.replace('Property deleted:', t('dashboard.activity.propertyDeleted') + ':');
          }
          if (fullMessage.includes('Appointment confirmed:')) {
            return fullMessage.replace('Appointment confirmed:', t('dashboard.activity.appointmentConfirmed') + ':');
          }
          if (fullMessage.includes('Appointment cancelled:')) {
            return fullMessage.replace('Appointment cancelled:', t('dashboard.activity.appointmentCancelled') + ':');
          }
          if (fullMessage.includes('Transaction completed:')) {
            return fullMessage.replace('Transaction completed:', t('dashboard.activity.transactionCompleted') + ':');
          }
          
          return fullMessage;
        } catch {
          return description;
        }
      }
      return description;
    }
    
    return processMultilingualContent(description);
  };

  // Enhanced Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Tajawal, Inter, sans-serif',
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: t('dashboard.charts.propertyViewsTitle'),
        font: {
          family: 'Tajawal, Inter, sans-serif',
          size: 16,
          weight: 'bold'
        },
        color: '#374151'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          family: 'Tajawal, Inter, sans-serif',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Tajawal, Inter, sans-serif',
          size: 12
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          stepSize: 1,
          precision: 0,
          font: {
            family: 'Tajawal, Inter, sans-serif',
            size: 11
          },
          color: '#6B7280'
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            family: 'Tajawal, Inter, sans-serif',
            size: 11
          },
          color: '#6B7280'
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      point: {
        radius: 6,
        hoverRadius: 8,
        backgroundColor: '#6366f1',
        borderColor: '#ffffff',
        borderWidth: 2
      }
    }
  };

  const fetchStats = async () => {
    try {
      const [adminStatsRes, viewsRes] = await Promise.all([
        axios.get(`${backendurl}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`${backendurl}/api/products/total-views`)
      ]);
      let totalViews = 0;
      if (viewsRes.data.success) {
        totalViews = viewsRes.data.totalViews;
      }
      if (adminStatsRes.data.success) {
        setStats((prev) => ({
          ...prev,
          ...adminStatsRes.data.stats,
          totalViews,
          loading: false,
          error: null,
        }));
      } else {
        throw new Error(adminStatsRes.data.message || "Failed to fetch stats");
      }
    } catch (error) {
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch dashboard data",
      }));
      console.error("Error fetching stats:", error);
    }
  };

  const fetchViewsOverTime = async () => {
    try {
      const response = await axios.get(`${backendurl}/api/products/views-over-time`);
      if (response.data.success) {
        setViewsOverTime(response.data.views);
      }
    } catch (error) {
      console.error('Error fetching views over time:', error);
    }
  };

  const fetchCompletedTransactions = async () => {
    try {
      const response = await axios.get(`${backendurl}/api/transactions/count/completed`);
      if (response.data.success) {
        setCompletedTransactions(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching completed transactions:', error);
    }
  };

  const fetchPropertyStatusData = async () => {
    try {
      const response = await axios.get(`${backendurl}/api/products/status-distribution`);
      if (response.data.success) {
        setPropertyStatusData(response.data.distribution);
      }
    } catch (error) {
      console.error('Error fetching property status distribution:', error);
      // Set default data if API fails
      setPropertyStatusData({
        'Available': 0,
        'Sold': 0,
        'Rented': 0
      });
    }
  };

  useEffect(() => {
    fetchStats();
    fetchViewsOverTime();
    fetchCompletedTransactions();
    fetchPropertyStatusData();
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchStats();
      fetchViewsOverTime();
      fetchCompletedTransactions();
      fetchPropertyStatusData();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // Prepare chart data from viewsOverTime
  const chartLabels = Object.keys(viewsOverTime);
  const chartData = Object.values(viewsOverTime).map(v => Math.floor(v));
  const propertyViewsChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t('dashboard.stats.totalViews'),
        data: chartData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.15)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Prepare property status distribution chart data
  const statusLabels = Object.keys(propertyStatusData);
  const statusData = Object.values(propertyStatusData);
  
  // Map status labels to translated versions
  const translatedLabels = statusLabels.map(label => {
    const statusKey = label.toLowerCase();
    return t(`dashboard.propertyStatus.${statusKey}`);
  });
  
  const propertyStatusChartData = {
    labels: translatedLabels,
    datasets: [
      {
        data: statusData,
        backgroundColor: [
          '#3B82F6', // Blue - Available
          '#8B5CF6', // Purple - Sold
          '#86EFAC', // Pastel Green - Rented
        ],
        borderColor: [
          '#2563EB', // Darker blue
          '#7C3AED', // Darker purple
          '#4ADE80', // Darker pastel green
        ],
        borderWidth: 3,
        hoverBackgroundColor: [
          '#2563EB', // Darker blue on hover
          '#7C3AED', // Darker purple on hover
          '#4ADE80', // Darker pastel green on hover
        ],
        hoverBorderColor: [
          '#1D4ED8', // Even darker blue
          '#6D28D9', // Even darker purple
          '#22C55E', // Even darker pastel green
        ],
        hoverBorderWidth: 4,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            family: 'Tajawal, Inter, sans-serif',
            size: 13,
            weight: '500'
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${value})`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: t('dashboard.charts.propertyStatusTitle'),
        font: {
          family: 'Tajawal, Inter, sans-serif',
          size: 16,
          weight: 'bold'
        },
        color: '#374151'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'Tajawal, Inter, sans-serif',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Tajawal, Inter, sans-serif',
          size: 12
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  const statCards = [
    {
      title: t('dashboard.stats.totalProperties'),
      value: stats.totalProperties,
      icon: Home,
      color: "bg-blue-500",
      description: t('dashboard.stats.totalPropertiesDesc'),
    },
    {
      title: t('dashboard.stats.completedTransactions'),
      value: completedTransactions,
      icon: Activity,
      color: "bg-green-500",
      description: t('dashboard.stats.completedTransactionsDesc'),
    },
    {
      title: t('dashboard.stats.totalViews'),
      value: Math.floor(stats.totalViews),
      icon: Eye,
      color: "bg-purple-500",
      description: t('dashboard.stats.totalViewsDesc'),
    },
    {
      title: t('dashboard.stats.pendingAppointments'),
      value: stats.pendingAppointments,
      icon: Calendar,
      color: "bg-orange-500",
      description: t('dashboard.stats.pendingAppointmentsDesc'),
    },
  ];

    if (stats.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('dashboard.loadingTitle')}</h3>
          <p className="text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('dashboard.error.title')}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">{stats.error}</p>
          <button
            onClick={fetchStats}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 
              transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <TrendingUp className="w-5 h-5" />
            {t('dashboard.error.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-32 px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-600 text-lg">{t('dashboard.subtitle')}</p>
          </div>
          <button
            onClick={fetchStats}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 
              transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <TrendingUp className="w-5 h-5" />
            {t('dashboard.refreshData')}
          </button>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-blue-200/50 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-xl ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{stat.title}</h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Status Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {t('dashboard.charts.propertyStatusTitle')}
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500">{t('dashboard.charts.inventoryStatus')}</span>
              </div>
            </div>
            <div className="h-[400px]">
              {Object.keys(propertyStatusData).length > 0 && Object.values(propertyStatusData).some(value => value > 0) ? (
                <Pie data={propertyStatusChartData} options={pieChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Home className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">{t('dashboard.charts.noStatusData')}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {t('dashboard.recentActivity.title')}
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">{t('dashboard.activity.realTime')}</span>
              </div>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {stats.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl 
                      transition-all duration-300 border border-transparent hover:border-blue-200/50"
                  >
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {processActivityDescription(activity.description)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">{t('dashboard.recentActivity.noActivity')}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;