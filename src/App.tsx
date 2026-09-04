import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";

function calculateScore(baseIntel: number, k: number, toolMultiplier: number, contamination: number, judgeLeniency: number) {
  let pSingle = (baseIntel * toolMultiplier) + contamination;
  pSingle = Math.min(1.0, pSingle);
  const passAtK = 1.0 - Math.pow(1.0 - pSingle, k);
  const falsePositives = (1.0 - passAtK) * judgeLeniency;
  const finalScore = passAtK + falsePositives;
  return Math.min(1.0, finalScore) * 100.0;
}

export default function App() {
  const [retries, setRetries] = useState([1]);
  const [useTools, setUseTools] = useState(false);
  const [leniency, setLeniency] = useState([0]);
  const [contamination, setContamination] = useState([0]);

  const baseIntel = 0.62;
  const toolMultiplier = useTools ? 1.1613 : 1.0;

  const currentScore = calculateScore(
    baseIntel,
    retries[0],
    toolMultiplier,
    contamination[0] / 100,
    leniency[0] / 100
  );

  const chartData = useMemo(() => {
    const data = [];
    for (let k = 1; k <= 10; k++) {
      data.push({
        k,
        score: calculateScore(baseIntel, k, toolMultiplier, contamination[0] / 100, leniency[0] / 100),
      });
    }
    return data;
  }, [toolMultiplier, contamination, leniency]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] p-8 font-sans text-neutral-900 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls Panel */}
        <Card className="col-span-1 rounded-none border-2 border-neutral-200 shadow-none bg-white">
          <CardHeader className="border-b-2 border-neutral-100 pb-4 mb-6">
            <CardTitle className="text-xs font-bold tracking-widest uppercase text-neutral-500">
              Inflation Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Retries (k)</Label>
                <span className="font-mono text-xs text-neutral-500">{retries[0]}</span>
              </div>
              <Slider 
                value={retries} 
                onValueChange={setRetries} 
                min={1} 
                max={10} 
                step={1} 
                className="[&_[role=slider]]:bg-neutral-900 [&_.bg-primary]:bg-neutral-900"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Data Contamination</Label>
                <span className="font-mono text-xs text-neutral-500">{contamination[0]}%</span>
              </div>
              <Slider 
                value={contamination} 
                onValueChange={setContamination} 
                min={0} 
                max={30} 
                step={1}
                className="[&_[role=slider]]:bg-neutral-900 [&_.bg-primary]:bg-neutral-900"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Judge Leniency</Label>
                <span className="font-mono text-xs text-neutral-500">{leniency[0]}%</span>
              </div>
              <Slider 
                value={leniency} 
                onValueChange={setLeniency} 
                min={0} 
                max={100} 
                step={1}
                className="[&_[role=slider]]:bg-neutral-900 [&_.bg-primary]:bg-neutral-900"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t-2 border-neutral-100">
              <Label className="text-sm font-medium flex flex-col">
                Custom Tool Access
              </Label>
              <Switch checked={useTools} onCheckedChange={setUseTools} className="data-[state=checked]:bg-neutral-900" />
            </div>

          </CardContent>
        </Card>

        {/* Visualization Panel */}
        <Card className="col-span-1 lg:col-span-2 rounded-none border-2 border-neutral-200 shadow-none bg-white">
          <CardHeader className="border-b-2 border-neutral-100 pb-4 mb-6 flex flex-row items-end justify-between">
            <CardTitle className="text-xs font-bold tracking-widest uppercase text-neutral-500">
              Headline Score
            </CardTitle>
            <motion.div 
              key={currentScore}
              initial={{ y: -2, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-5xl font-medium tracking-tight text-neutral-900 font-mono"
            >
              {currentScore.toFixed(1)}%
            </motion.div>
          </CardHeader>
          <CardContent className="flex flex-col pt-2 pb-6 px-6">
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                  <XAxis 
                    dataKey="k" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fill: "#737373", fontSize: 12}} 
                    label={{ value: 'Attempts (k)', position: 'insideBottom', offset: -15, fill: '#737373', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[50, 100]} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fill: "#737373", fontSize: 12}} 
                    label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', offset: 15, fill: '#737373', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "0px", border: "1px solid #E5E5E5", boxShadow: "none", fontSize: "12px", fontFamily: "monospace" }}
                    formatter={(val: number) => [val.toFixed(1) + "%", "Score"]}
                    labelFormatter={(val) => `k = ${val}`}
                  />
                  <Area 
                    type="step" 
                    dataKey="score" 
                    stroke="#171717" 
                    strokeWidth={2}
                    fillOpacity={0.03} 
                    fill="#171717" 
                    activeDot={{ r: 4, strokeWidth: 0, fill: "#171717" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
