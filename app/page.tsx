"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CalculatorForm } from "@/components/CalculatorForm"
import { ResultDisplay } from "@/components/ResultDisplay"
import { HistoryList } from "@/components/HistoryList"
import { calculateTax } from "@/lib/taxCalculations"
import { Calculator, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [result, setResult] = useState<any>(null)
  const [refreshHistory, setRefreshHistory] = useState(0)
  const { toast } = useToast()

  const handleCalculate = async (income: number) => {
    const taxResult = calculateTax(income)
    setResult(taxResult)

    // Guardar en la base de datos (con manejo de errores)
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          income,
          tax: taxResult.totalTax,
        }),
      })

      if (response.ok) {
        // Refresh history only if save was successful
        setRefreshHistory((prev) => prev + 1)
        toast({
          title: "✅ Cálculo guardado",
          description: "El cálculo se ha guardado exitosamente en el historial.",
        })
      } else {
        console.warn("Could not save calculation to history")
        toast({
          title: "⚠️ Error al guardar",
          description: "No se pudo guardar el cálculo en el historial.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.warn("History feature unavailable:", error)
      toast({
        title: "⚠️ Error de conexión",
        description: "No se pudo conectar con la base de datos. El cálculo se realizó correctamente.",
        variant: "destructive",
      })
      // App continues to work without history
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-lime-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-12 xl:py-16 2xl:py-20">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 sm:mb-8 lg:mb-12 xl:mb-16 2xl:mb-20">
          <div className="bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 rounded-2xl p-6 sm:p-8 lg:p-10 xl:p-12 2xl:p-16 mx-auto max-w-4xl xl:max-w-5xl 2xl:max-w-6xl shadow-lg border border-purple-300">
            <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 xl:gap-5 mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
              <Calculator className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 text-purple-600" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-800">Calculadora de Impuestos</h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-600 max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto">República de Panamá - Impuesto sobre la Renta Personal</p>
          </div>
        </motion.div>

        <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-8xl mx-auto">
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 lg:mb-10 xl:mb-12 2xl:mb-16 max-w-md xl:max-w-lg 2xl:max-w-xl mx-auto bg-purple-100 rounded-lg p-0.5 gap-0.5">
              <TabsTrigger value="calculator" className="flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md transition-all duration-300 ease-in-out h-10 xl:h-12 2xl:h-14 m-0">
                <Calculator className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                <span className="hidden sm:inline">Calculadora</span>
                <span className="sm:hidden">Calc</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md transition-all duration-300 ease-in-out h-10 xl:h-12 2xl:h-14 m-0">
                <FileText className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 2xl:gap-20">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.2 }}
                  className="order-2 lg:order-1"
                >
                  <CalculatorForm onCalculate={handleCalculate} />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.4 }}
                  className="order-1 lg:order-2"
                >
                  {result && <ResultDisplay result={result} />}
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">
                <HistoryList key={refreshHistory} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
