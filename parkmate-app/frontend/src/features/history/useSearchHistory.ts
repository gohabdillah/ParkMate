import { useState, useEffect, useCallback } from 'react';
import { searchHistoryService } from './historyService';
import { SearchHistoryItem } from './historyTypes';

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [recentHistory, setRecentHistory] = useState<SearchHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = useCallback(() => {
    const allHistory = searchHistoryService.getHistory();
    const recent = searchHistoryService.getRecentHistory(5);
    setHistory(allHistory);
    setRecentHistory(recent);
  }, []);

  const addToHistory = useCallback((carpark: {
    id: string;
    externalId: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    searchHistoryService.addToHistory(carpark);
    loadHistory();
  }, [loadHistory]);

  const removeFromHistory = useCallback((id: string) => {
    searchHistoryService.removeItem(id);
    loadHistory();
  }, [loadHistory]);

  const clearAllHistory = useCallback(() => {
    searchHistoryService.clearHistory();
    loadHistory();
  }, [loadHistory]);

  const isInHistory = useCallback((carparkId: string): boolean => {
    return searchHistoryService.isInHistory(carparkId);
  }, []);

  const formatRelativeTime = useCallback((timestamp: number): string => {
    return searchHistoryService.formatRelativeTime(timestamp);
  }, []);

  return {
    history,
    recentHistory,
    historyCount: history.length,
    addToHistory,
    removeFromHistory,
    clearAllHistory,
    isInHistory,
    formatRelativeTime,
    refreshHistory: loadHistory,
  };
};
