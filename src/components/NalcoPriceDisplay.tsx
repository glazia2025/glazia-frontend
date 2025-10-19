"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { nalcoApiService, NalcoCurrentData } from '@/services/nalcoApi';

interface NalcoPriceDisplayProps {
  onClick: () => void;
  className?: string;
}

export default function NalcoPriceDisplay({ onClick, className = '' }: NalcoPriceDisplayProps) {
  const [currentData, setCurrentData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    fetchCurrentPrice();
    // Set up polling to refresh price every 5 minutes
    const interval = setInterval(fetchCurrentPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && currentData?.nalcoPrice !== undefined) {
      // Ensure nalcoPrice is stored as a string representation of the number
      window.localStorage.setItem('nalcoPrice', currentData.nalcoPrice.toString());
      console.log('NALCO Price stored in localStorage:', currentData.nalcoPrice);
    }
  }, [currentData])

  const fetchCurrentPrice = async () => {
    try {
      setLoading(true);
      const response = await nalcoApiService.getCurrentNalcoData();

      console.log(response);
      
      if (response) {
        // Store previous price to determine trend
        const previousPrice = currentData?.nalcoPrice;
        setCurrentData(response);
        
        // Determine trend if we have previous data
        if (previousPrice !== undefined) {
          if (response.nalcoPrice > previousPrice) {
            setTrend('up');
          } else if (response.nalcoPrice < previousPrice) {
            setTrend('down');
          } else {
            setTrend('neutral');
          }
        }
        
        setError(null);
      } else {
        setError(response || 'Failed to fetch NALCO price');
      }
    } catch (err) {
      setError('Failed to fetch NALCO price');
      console.error('Error fetching NALCO price:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <BarChart3 className="w-4 h-4 text-white/70" />
        <div className="flex flex-col">
          <span className="text-xs text-white/70">NALCO</span>
          <div className="w-16 h-3 bg-white/20 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !currentData) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <BarChart3 className="w-4 h-4 text-white/70" />
        <div className="flex flex-col">
          <span className="text-xs text-white/70">NALCO</span>
          <span className="text-xs text-red-400">Error</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 hover:bg-white/10 px-2 py-1 rounded transition-colors group ${className}`}
      title="Click to view NALCO price chart"
    >
      <BarChart3 className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
      <div className="flex flex-col items-start">
        <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors">
          NALCO
        </span>
        <div className="flex items-center space-x-1">
          <span className={`text-sm font-semibold ${getTrendColor()} group-hover:text-white transition-colors`}>
            {nalcoApiService.formatPrice(currentData.nalcoPrice/1000)}/Kg
          </span>
          {getTrendIcon()}
        </div>
      </div>
    </button>
  );
}
