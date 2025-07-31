"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTaxHistory } from "@/hooks/useTaxHistory";

interface CalculatorFormProps {
  onSuccess?: () => void;
}

export function CalculatorForm({ onSuccess }: CalculatorFormProps) {
  const [income, setIncome] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [taxResult, setTaxResult] = useState<number | null>(null);
  const { toast } = useToast();
  const { saveCalculation } = useTaxHistory();

  const calculateTax = (incomeValue: number): number => {
    if (incomeValue <= 11000) return 0;
    if (incomeValue <= 50000) return (incomeValue - 11000) * 0.15;
    return 5850 + (incomeValue - 50000) * 0.25;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTaxResult(null);

    const num = Number.parseFloat(income.replace(/,/g, ""));

    if (isNaN(num) || num < 0) {
      setError("Por favor ingrese un número válido mayor o igual a 0");
      toast({
        title: "Error de validación",
        description: "Por favor ingrese un número válido mayor o igual a 0",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (num > 10000000) {
      setError("El ingreso no puede ser mayor a $10,000,000");
      toast({
        title: "Error de validación",
        description: "El ingreso no puede ser mayor a $10,000,000",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    setError("");

    try {
      const tax = calculateTax(num);
      setTaxResult(tax);
      await saveCalculation(num, tax);
      toast({
        title: "Cálculo guardado",
        description: "El cálculo ha sido guardado en tu historial"
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el cálculo en el historial",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/,/g, "");
    if (isNaN(Number.parseFloat(num))) return value;
    return Number.parseFloat(num).toLocaleString("en-US");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setIncome(value);
      setError("");
    }
  };

  return (
    <Card className="w-full border-purple-200 bg-gradient-to-br from-purple-50 to-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" />
          Ingreso Anual
        </CardTitle>
        <CardDescription>Ingrese su ingreso anual bruto en dólares estadounidenses (USD)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="income">Ingreso Anual (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="income"
                type="text"
                value={formatNumber(income)}
                onChange={handleInputChange}
                placeholder="0.00"
                className="pl-10 text-lg border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                disabled={isLoading}
              />
            </div>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-600 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </div>

          <Button type="submit" className="w-full text-lg py-6 bg-purple-600 hover:bg-purple-700 text-white" disabled={!income || isLoading}>
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              "Calcular Impuesto"
            )}
          </Button>
        </form>

        {taxResult !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="w-5 h-5" />
              <h3 className="font-semibold">Resultado del Cálculo</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ingreso:</span>
                <span className="font-medium">${Number(income).toLocaleString("en-US")}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuesto calculado:</span>
                <span className="font-medium">${taxResult.toLocaleString("en-US")}</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Tabla de Impuestos - Panamá</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>• Hasta $11,000: 0%</div>
            <div>• $11,000.01 - $50,000: 15% sobre el excedente</div>
            <div>• Más de $50,000: $5,850 + 25% sobre el excedente</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}