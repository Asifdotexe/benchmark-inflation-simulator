import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceDot } from "recharts";
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
  const [retries, setRetries] = useState([10]);
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-neutral-900">
      
      {/* Left Sidebar: Controls */}
      <div className="w-full lg:w-96 border-r border-neutral-200 bg-[#F9F9F9] p-8 lg:p-12 flex flex-col gap-12">
        <div>
          <h1 className="text-xl font-medium tracking-tight">Benchmark Simulator</h1>
          <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
            Adjust the environmental variables to observe score inflation in real-time.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <Label className="text-sm font-medium">Retries (k)</Label>
              <span className="font-mono text-xs text-neutral-500">{retries[0]}</span>
            </div>
            <Slider 
              value={retries} 
              onValueChange={setRetries} 
              min={1} 
              max={10} 
              step={1} 
              className="[&_[role=slider]]:bg-neutral-900 [&_.bg-primary]:bg-neutral-900 cursor-grab active:cursor-grabbing"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <Label className="text-sm font-medium">Data Contamination</Label>
              <span className="font-mono text-xs text-neutral-500">{contamination[0]}%</span>
            </div>
            <Slider 
              value={contamination} 
              onValueChange={setContamination} 
              min={0} 
              max={30} 
              step={1}
              className="[&_[role=slider]]:bg-neutral-900 [&_.bg-primary]:bg-neutral-900 cursor-grab active:cursor-grabbing"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <Label className="text-sm font-medium">Judge Leniency</Label>
              <span className="font-mono text-xs text-neutral-500">{leniency[0]}%</span>
            </div>
            <Slider 
              value={leniency} 
              onValueChange={setLeniency} 
              min={0} 
              max={100} 
              step={1}
              className="[&_[role=slider]]:bg-neutral-900 [&_.bg-primary]:bg-neutral-900 cursor-grab active:cursor-grabbing"
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Custom Tool Access</Label>
              <span className="text-xs text-neutral-500">Enable compile-error feedback</span>
            </div>
            <Switch 
              checked={useTools} 
              onCheckedChange={setUseTools} 
              className="data-[state=checked]:bg-neutral-900" 
            />
          </div>
        </div>
      </div>

      {/* Right Main Area: Visualization */}
      <div className="flex-1 p-8 lg:p-24 flex flex-col justify-center max-w-6xl mx-auto w-full">
        <div className="flex flex-col gap-12">
          
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400">
              Headline Score
            </h2>
            <motion.div 
              key={currentScore}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-7xl lg:text-9xl font-semibold tracking-tighter text-neutral-900"
            >
              {currentScore.toFixed(1)}<span className="text-4xl lg:text-5xl text-neutral-300 font-normal">%</span>
            </motion.div>
          </div>

          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 20 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E5E5" />
                <XAxis 
                  dataKey="k" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: "#A3A3A3", fontSize: 12}} 
                  tickMargin={12}
                  label={{ value: 'Attempts (k)', position: 'insideBottom', offset: -15, fill: '#A3A3A3', fontSize: 12 }}
                />
                <YAxis 
                  domain={[50, 100]} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: "#A3A3A3", fontSize: 12}}
                  tickMargin={12}
                  label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', offset: 20, fill: '#A3A3A3', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "6px", 
                    border: "1px solid #E5E5E5", 
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)", 
                    fontSize: "12px", 
                    fontFamily: "monospace",
                    backgroundColor: "white",
                    padding: "8px 12px"
                  }}
                  itemStyle={{ color: "#171717" }}
                  formatter={(val: any) => [Number(val).toFixed(1) + "%", "Score"]}
                  labelFormatter={(val) => `k = ${val}`}
                  cursor={{ stroke: '#171717', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#171717" 
                  strokeWidth={2.5}
                  fillOpacity={0.02} 
                  fill="#171717" 
                  activeDot={{ r: 5, strokeWidth: 0, fill: "#171717" }}
                  isAnimationActive={false}
                />
                <ReferenceDot 
                  x={retries[0]} 
                  y={currentScore} 
                  r={8} 
                  fill="#171717" 
                  stroke="#FFFFFF" 
                  strokeWidth={2.5} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>

    </div>
  );
}
