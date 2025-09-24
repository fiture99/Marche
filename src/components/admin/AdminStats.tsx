import React from 'react';
import { motion } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';



interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  color: string;
}

interface AdminStatsProps {
  stats: {
    totalVendors: number;
    pendingApplications: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    monthlyGrowth: {
      vendors: number;
      orders: number;
      revenue: number;
      products: number;
    };
  };
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  const statCards: StatCard[] = [
    {
      title: 'Total Vendors',
       value: stats.totalVendors.toLocaleString(),
      change: stats.monthlyGrowth.vendors,
      changeType: stats.monthlyGrowth.vendors >= 0 ? 'increase' : 'decrease',
      icon: BuildingStorefrontIcon,
      color: 'blue',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      change: 0,
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'yellow',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      change: stats.monthlyGrowth.products,
      changeType: stats.monthlyGrowth.products >= 0 ? 'increase' : 'decrease',
      icon: ShoppingBagIcon,
      color: 'green',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: stats.monthlyGrowth.orders,
      changeType: stats.monthlyGrowth.orders >= 0 ? 'increase' : 'decrease',
      icon: CurrencyDollarIcon,
      color: 'purple',
    },
    {
      title: 'Total Revenue',
      value: `GMD ${stats.totalRevenue.toLocaleString()}`,
      change: stats.monthlyGrowth.revenue,
      changeType: stats.monthlyGrowth.revenue >= 0 ? 'increase' : 'decrease',
      icon: ChartBarIcon,
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                {stat.change !== 0 && (
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminStats;