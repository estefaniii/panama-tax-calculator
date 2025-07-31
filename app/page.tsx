"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalculatorForm } from "@/components/CalculatorForm";
import HistoryList from "@/components/HistoryList";
import { Calculator, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-lime-50">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-8"
        >
          <div className="bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 rounded-2xl p-8 mx-auto max-w-4xl shadow-lg border border-purple-300">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-800">Calculadora de Impuestos</h1>
            </div>
            <p className="text-xl text-gray-600">República de Panamá - Impuesto sobre la Renta Personal</p>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto bg-purple-100 rounded-lg p-1 gap-1">
              <TabsTrigger value="calculator" className="flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5" />
                <span>Calculadora</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Historial</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator">
              <CalculatorForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
            </TabsContent>

            <TabsContent value="history">
              <div className="max-w-4xl mx-auto">
                <HistoryList key={refreshKey} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}