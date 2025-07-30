"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaxBrackets } from "./TaxBrackets"
import { Receipt, TrendingUp, Percent } from "lucide-react"

interface ResultDisplayProps {
  result: {
    totalTax: number
    effectiveRate: number
    afterTaxIncome: number
    breakdown: Array<{
      bracket: {
        min: number
        max?: number
        rate: number
        fixedAmount?: number
      }
      taxableAmount: number
      tax: number
    }>
    income: number
  }
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Resumen Principal */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800 font-bold">
            <Receipt className="w-5 h-5" />
            Resultado del Cálculo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="text-xs sm:text-sm text-gray-700 font-medium mb-1">Ingreso Anual</div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{formatCurrency(result.income)}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-2 sm:p-3 bg-red-50 rounded-lg shadow-sm border border-red-200"
            >
              <div className="text-xs sm:text-sm text-red-700 font-medium mb-1 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                Impuesto a Pagar
              </div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-red-700">{formatCurrency(result.totalTax)}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg shadow-sm sm:col-span-2 lg:col-span-1 border border-purple-200"
            >
              <div className="text-xs sm:text-sm text-purple-700 font-medium mb-1">Ingreso Neto</div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-purple-700">{formatCurrency(result.afterTaxIncome)}</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 p-2 sm:p-3 bg-yellow-100 rounded-lg border border-yellow-300"
          >
            <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-700" />
            <span className="text-sm sm:text-base text-yellow-800 font-medium">
              Tasa Efectiva: <strong className="text-yellow-900">{formatPercentage(result.effectiveRate)}</strong>
            </span>
          </motion.div>
        </CardContent>
      </Card>

      {/* Desglose por Tramos */}
      <TaxBrackets breakdown={result.breakdown} />
    </motion.div>
  )
}
