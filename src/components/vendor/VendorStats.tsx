import React from 'react';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface VendorStatsProps {
  stats: Stats;
}

const VendorStats: React.FC<VendorStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: ChartBarIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorStats;