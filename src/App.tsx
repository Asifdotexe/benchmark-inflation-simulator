import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
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
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls Panel */}
        <Card className="col-span-1 border-none shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Inflation Controls
            </CardTitle>
            <p className="text-sm text-slate-500">Adjust the parameters to see how the benchmark score inflates.</p>
          </CardHeader>
          <CardContent className="space-y-8">
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Number of Retries (k)</Label>
                <span className="font-mono text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{retries[0]}</span>
              </div>
              <Slider 
                value={retries} 
                onValueChange={setRetries} 
                min={1} 
                max={10} 
                step={1} 
                className="[&_[role=slider]]:bg-blue-600"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Data Contamination (%)</Label>
                <span className="font-mono text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-md">{contamination[0]}%</span>
              </div>
              <Slider 
                value={contamination} 
                onValueChange={setContamination} 
                min={0} 
                max={30} 
                step={1}
                className="[&_[role=slider]]:bg-purple-600"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Judge Leniency (%)</Label>
                <span className="font-mono text-sm bg-rose-100 text-rose-700 px-2 py-1 rounded-md">{leniency[0]}%</span>
              </div>
              <Slider 
                value={leniency} 
                onValueChange={setLeniency} 
                min={0} 
                max={100} 
                step={1}
                className="[&_[role=slider]]:bg-rose-600"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Label className="text-base font-semibold flex flex-col">
                Custom Tool Access
                <span className="text-xs font-normal text-slate-500">Agent loop with compile feedback</span>
              </Label>
              <Switch checked={useTools} onCheckedChange={setUseTools} />
            </div>

          </CardContent>
        </Card>

        {/* Visualization Panel */}
        <Card className="col-span-1 lg:col-span-2 border-none shadow-xl bg-white overflow-hidden relative">
          <CardHeader>
            <CardTitle className="text-xl text-slate-700">Headline Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4">
            
            <motion.div 
              key={currentScore}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-black tracking-tighter text-slate-800 mb-8"
            >
              {currentScore.toFixed(1)}<span className="text-4xl text-slate-400">%</span>
            </motion.div>

            <div className="w-full h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="k" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fill: "#64748b"}} 
                    label={{ value: 'Number of Retries (k)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 14 }}
                  />
                  <YAxis 
                    domain={[50, 100]} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fill: "#64748b"}} 
                    label={{ value: 'Headline Score (%)', angle: -90, position: 'insideLeft', offset: -5, fill: '#64748b', fontSize: 14 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    formatter={(val: number) => [val.toFixed(1) + "%", "Score"]}
                    labelFormatter={(val) => `Retries: ${val}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4f46e5" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
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

