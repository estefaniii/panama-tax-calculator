"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useTaxHistory } from '@/hooks/useTaxHistory';
import { useToast } from "@/components/ui/use-toast";


interface Calculation {
  id: number;
  income: number;
  tax: number;
  calculation_date: string;
}

export default function HistoryList() {
  const {
    history,
    loading,
    error,
    fetchHistory,
    clearError
  } = useTaxHistory();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRetry = () => {
    clearError();
    fetchHistory();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        {/* Spinner usando animación CSS pura */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4">
        <Alert variant="destructive">
          <AlertTitle>Error al cargar el historial</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={handleRetry}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="my-4 space-y-4">
      <h3 className="text-2xl font-bold text-gray-800">Historial de Cálculos</h3>
      
      {history.length === 0 ? (
        <Alert variant="default">
          <AlertTitle>No hay cálculos registrados</AlertTitle>
          <AlertDescription>
            Realiza tu primer cálculo para verlo aparecer aquí.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impuesto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.calculation_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${item.income.toLocaleString('en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${item.tax.toLocaleString('en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}