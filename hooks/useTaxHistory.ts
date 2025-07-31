import { useState, useCallback } from 'react';

interface Calculation {
  id: number;
  income: number;
  tax: number;
  calculation_date: string;
}

export function useTaxHistory() {
  const [history, setHistory] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/history');
      if (!response.ok) throw new Error('Error al cargar el historial');
      const { data } = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCalculation = async (income: number, tax: number) => {
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, tax }),
      });

      if (!response.ok) throw new Error('Error al guardar');
      const result = await response.json();
      setHistory(prev => [result.data, ...prev]);
      return result;
    } catch (err) {
      throw err;
    }
  };
  
  const clearError = () => setError(null);


  return { history, loading, error, fetchHistory, saveCalculation, clearError };
}