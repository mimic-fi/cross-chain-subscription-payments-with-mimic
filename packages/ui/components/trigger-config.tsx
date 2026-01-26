"use client"

import { Button } from "@/components/ui/button"

interface TriggerConfigProps {
  cronSchedule: string
  delta: string
  onCronChange: (value: string) => void
  onDeltaChange: (value: string) => void
}

export function TriggerConfig({ 
  cronSchedule, 
  delta,
  onCronChange, 
  onDeltaChange
}: TriggerConfigProps) {
  const presets = [
    { label: "Every minute", cron: "0/1 * * * *", delta: "1" },
    { label: "Every 5 minutes", cron: "0/5 * * * *", delta: "5" },
    { label: "Every 10 minutes", cron: "0/10 * * * *", delta: "10" },
    { label: "Hourly", cron: "0 * * * *", delta: "60" },
    { label: "Daily", cron: "0 0 * * *", delta: "1440" },
    { label: "Weekly", cron: "0 0 * * 0", delta: "10080" },
  ]

  const handlePresetClick = (cron: string) => {
    console.log("[v0] Preset clicked - cron:", cron)
    onCronChange(cron)
  }

  const isSelected = (cron: string) => cronSchedule === cron

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      <h3 className="font-semibold">Frequency</h3>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant={isSelected(preset.cron) ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(preset.cron)}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
