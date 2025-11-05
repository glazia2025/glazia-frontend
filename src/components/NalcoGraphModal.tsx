"use client";

import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3, RefreshCw } from 'lucide-react';
import { nalcoApiService, NalcoDataPoint } from '@/services/nalcoApi';

interface NalcoGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NalcoGraphModal({ isOpen, onClose }: NalcoGraphModalProps) {
  const [graphData, setGraphData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    if (isOpen) {
      fetchGraphData();
    }
  }, [isOpen]);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await nalcoApiService.getNalcoGraphData();
      
      if (response) {
        setGraphData(response);
      } else {
        setError(response || 'Failed to fetch NALCO graph data');
      }
    } catch (err) {
      setError('Failed to fetch NALCO graph data');
      console.error('Error fetching NALCO graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    if (!graphData.length) return [];
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (selectedPeriod) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return graphData;
    }
    
    return graphData.filter(point => new Date(point.date) >= cutoffDate);
  };

  const getStats = () => {
    const filteredData = getFilteredData();
    if (!filteredData.length) return null;
    
    const prices = filteredData.map(point => point.nalcoPrice);
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[0];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, nalcoPrice) => sum + (nalcoPrice / 1000), 0) / prices.length;
    
    const change = currentPrice - previousPrice;
    const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
    
    return {
      current: currentPrice,
      change,
      changePercent,
      min: minPrice,
      max: maxPrice,
      avg: avgPrice,
    };
  };

  const renderSimpleChart = () => {
    const filteredData = getFilteredData();
    if (!filteredData.length) return null;
    
    const prices = filteredData.map(point => point.nalcoPrice / 1000);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    if (priceRange === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <span>No nalcoPrice variation in selected period</span>
        </div>
      );
    }
    
    return (
      <div className="h-64 relative bg-gray-50 rounded-lg p-4 pl-16">
        <svg className="w-full h-full" viewBox="0 0 800 200">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 50}
              x2="800"
              y2={i * 50}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Price line */}
          <polyline
            fill="none"
            stroke="#124657"
            strokeWidth="2"
            points={filteredData.map((point, index) => {
              const x = (index / (filteredData.length - 1)) * 800;
              const y = 200 - (((point.nalcoPrice / 1000) - minPrice) / priceRange) * 200;
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* Data points */}
          {filteredData.map((point, index) => {
            const x = (index / (filteredData.length - 1)) * 800;
            const y = 200 - (((point.nalcoPrice / 1000) - minPrice) / priceRange) * 200;
            return (
              <circle
                key={point.id}
                cx={x}
                cy={y}
                r="3"
                fill="#124657"
                className="hover:r-5 transition-all cursor-pointer"
                title={`${nalcoApiService.formatPrice((point.nalcoPrice / 1000))} on ${nalcoApiService.formatDate(point.date)}`}
              />
            );
          })}
        </svg>

        {/* Y-axis labels - showing rate values with Indian Rupees symbol */}
        <div className="absolute left-2 top-4 h-56 flex flex-col justify-between text-xs text-gray-600 font-medium">
          <span className="bg-white px-1 rounded">₹{maxPrice.toFixed(0)}</span>
          <span className="bg-white px-1 rounded">₹{((maxPrice + minPrice) / 2).toFixed(0)}</span>
          <span className="bg-white px-1 rounded">₹{minPrice.toFixed(0)}</span>
        </div>
      </div>
    );
  };

  const stats = getStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000033] bg-opacity-50 flex items-center justify-center z-[10001] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-[#124657]" />
            <h2 className="text-xl font-semibold text-gray-900">NALCO Price Chart</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchGraphData}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-[#124657] transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-[#124657] animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Loading NALCO nalcoPrice data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <button
                  onClick={fetchGraphData}
                  className="px-4 py-2 bg-[#124657] text-white rounded-lg hover:bg-[#0f3a4a] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Period Selection */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  {[
                    { key: '7d', label: '7 Days' },
                    { key: '30d', label: '30 Days' },
                    { key: '90d', label: '90 Days' },
                    { key: 'all', label: 'Year To Date' },
                  ].map(period => (
                    <button
                      key={period.key}
                      onClick={() => setSelectedPeriod(period.key as any)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedPeriod === period.key
                          ? 'bg-[#124657] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-gray-600">Current</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {nalcoApiService.formatPrice(stats.current / 1000)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      {stats.change >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-600">Change</span>
                    </div>
                    <p className={`text-lg font-semibold ${stats.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.change >= 0 ? '+' : ''}{nalcoApiService.formatPrice(stats.change / 1000)}
                      <span className="text-sm ml-1">
                        ({stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%)
                      </span>
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-gray-600">High</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {nalcoApiService.formatPrice(stats.max / 1000)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-gray-600">Low</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {nalcoApiService.formatPrice(stats.min / 1000)}
                    </p>
                  </div>
                </div>
              )}

              {/* Chart */}
              {renderSimpleChart()}

              {/* Data Table */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Last 10 Days</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredData().slice(-10).reverse().map((point, index, array) => {
                        const prevPoint = array[index + 1];
                        const change = prevPoint ? (point.nalcoPrice / 1000) - (prevPoint.nalcoPrice / 1000) : 0;
                        const changePercent = prevPoint && prevPoint.nalcoPrice !== 0 ? (change / (prevPoint.nalcoPrice / 1000)) * 100 : 0;
                        
                        return (
                          <tr key={point.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {nalcoApiService.formatDate(point.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {nalcoApiService.formatPrice((point.nalcoPrice / 1000))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {prevPoint ? (
                                <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {change >= 0 ? '+' : ''}{nalcoApiService.formatPrice(change)}
                                  <span className="text-xs ml-1">
                                    ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                                  </span>
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
