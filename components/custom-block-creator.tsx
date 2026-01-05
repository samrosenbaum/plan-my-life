"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { ActivityBlock, RoutineStep } from "@/lib/types"
import { Plus, X, List } from "lucide-react"
import { ActivityIcon } from "./activity-icon"

interface CustomBlockCreatorProps {
  onAddBlock: (block: ActivityBlock) => void
  onUpdateBlock?: (block: ActivityBlock) => void
  editingActivity?: ActivityBlock | null
  onCancelEdit?: () => void
  compact?: boolean // Added compact prop for inline header usage
}

const presetColors = [
  "#5B6EE1", // Blue (default)
  "#7C5CE0", // Purple
  "#E15B8C", // Pink
  "#5BB8E1", // Cyan
  "#5BE17C", // Green
  "#E1B85B", // Yellow
  "#E17C5B", // Orange
]

const presetIcons = ["star", "heart", "book", "coffee", "music", "sun", "moon", "zap"]

export function CustomBlockCreator({ onAddBlock, onUpdateBlock, editingActivity, onCancelEdit, compact }: CustomBlockCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [selectedColor, setSelectedColor] = useState(presetColors[0])
  const [selectedIcon, setSelectedIcon] = useState(presetIcons[0])
  const [isRoutine, setIsRoutine] = useState(false)
  const [steps, setSteps] = useState<RoutineStep[]>([])
  const [newStepLabel, setNewStepLabel] = useState("")

  // Populate form when editing
  useEffect(() => {
    if (editingActivity) {
      setLabel(editingActivity.label)
      setSelectedColor(editingActivity.color)
      setSelectedIcon(editingActivity.icon)
      setIsRoutine(!!editingActivity.steps && editingActivity.steps.length > 0)
      setSteps(editingActivity.steps || [])
      setIsOpen(true)
    }
  }, [editingActivity])

  const addStep = () => {
    if (!newStepLabel.trim()) return
    const newStep: RoutineStep = {
      id: `step-${Date.now()}`,
      label: newStepLabel.trim(),
    }
    setSteps([...steps, newStep])
    setNewStepLabel("")
  }

  const removeStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return

    if (editingActivity && onUpdateBlock) {
      // Update existing activity
      const updatedBlock: ActivityBlock = {
        ...editingActivity,
        label: label.trim(),
        icon: selectedIcon,
        color: selectedColor,
        steps: isRoutine && steps.length > 0 ? steps : undefined,
      }
      onUpdateBlock(updatedBlock)
    } else {
      // Create new activity
      const newBlock: ActivityBlock = {
        id: `custom-${Date.now()}`,
        label: label.trim(),
        icon: selectedIcon,
        color: selectedColor,
        steps: isRoutine && steps.length > 0 ? steps : undefined,
      }
      onAddBlock(newBlock)
    }

    resetForm()
  }

  const resetForm = () => {
    setLabel("")
    setSelectedColor(presetColors[0])
    setSelectedIcon(presetIcons[0])
    setIsRoutine(false)
    setSteps([])
    setNewStepLabel("")
    setIsOpen(false)
  }

  const handleCancel = () => {
    resetForm()
    if (onCancelEdit) onCancelEdit()
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 rounded-full border-2 border-dashed px-3 py-1.5 font-mono text-xs transition-all ${
            editingActivity
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-secondary text-muted-foreground hover:border-primary hover:text-foreground"
          }`}
        >
          <Plus className="h-3 w-3" />
          {editingActivity ? "editing" : "custom"}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl bg-card p-4 shadow-lg border border-border">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block font-mono text-xs text-muted-foreground">
                  {editingActivity ? "edit activity" : "new activity"}
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Activity name..."
                  className="w-full rounded-xl border-2 border-dashed border-border bg-secondary px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex gap-1.5">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-6 w-6 rounded-full transition-all ${selectedColor === color ? "ring-2 ring-offset-1 ring-primary scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {presetIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 border-dashed transition-all ${selectedIcon === icon ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-primary/50"}`}
                  >
                    <ActivityIcon icon={icon} color={selectedColor} className="h-4 w-4" />
                  </button>
                ))}
              </div>

              {/* Routine Toggle */}
              <button
                type="button"
                onClick={() => setIsRoutine(!isRoutine)}
                className={`flex w-full items-center gap-2 rounded-lg border-2 border-dashed px-3 py-2 font-mono text-xs transition-all ${
                  isRoutine ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                {isRoutine ? "routine with steps" : "make it a routine"}
              </button>

              {/* Routine Steps */}
              {isRoutine && (
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newStepLabel}
                      onChange={(e) => setNewStepLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStep())}
                      placeholder="Add a step..."
                      className="flex-1 rounded-lg border border-border bg-secondary px-2 py-1.5 font-mono text-xs placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addStep}
                      disabled={!newStepLabel.trim()}
                      className="rounded-lg bg-primary px-2 py-1.5 text-primary-foreground disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  {steps.length > 0 && (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-2 rounded-lg bg-secondary px-2 py-1.5">
                          <span className="font-mono text-xs text-muted-foreground">{idx + 1}.</span>
                          <span className="flex-1 font-mono text-xs text-foreground truncate">{step.label}</span>
                          <button type="button" onClick={() => removeStep(step.id)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-lg border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={!label.trim()}
                  className="flex-1 rounded-lg bg-primary px-3 py-1.5 font-mono text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {editingActivity ? "update" : "add"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SketchPencilIcon className="h-5 w-5 text-primary" />
        <h2 className="font-mono text-sm tracking-wide text-foreground">create custom</h2>
      </div>

      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/50 px-4 py-3 font-mono text-xs text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-secondary hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          add new activity
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label Input */}
          <div>
            <label className="mb-1.5 block font-mono text-xs text-muted-foreground">label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Morning Yoga"
              className="w-full rounded-xl border-2 border-dashed border-border bg-secondary px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="mb-1.5 block font-mono text-xs text-muted-foreground">color</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    h-8 w-8 rounded-full transition-all duration-200
                    ${selectedColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="mb-1.5 block font-mono text-xs text-muted-foreground">icon</label>
            <div className="flex flex-wrap gap-2">
              {presetIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed
                    transition-all duration-200
                    ${
                      selectedIcon === icon
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary hover:border-primary/50"
                    }
                  `}
                >
                  <ActivityIcon icon={icon} color={selectedColor} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Routine Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setIsRoutine(!isRoutine)}
              className={`flex w-full items-center gap-2 rounded-xl border-2 border-dashed px-4 py-2.5 font-mono text-xs transition-all ${
                isRoutine ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
              }`}
            >
              <List className="h-4 w-4" />
              {isRoutine ? "this is a routine with steps" : "make it a routine (add steps)"}
            </button>
          </div>

          {/* Routine Steps */}
          {isRoutine && (
            <div className="space-y-3">
              <label className="block font-mono text-xs text-muted-foreground">routine steps</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStepLabel}
                  onChange={(e) => setNewStepLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStep())}
                  placeholder="e.g., Brush teeth, Shower..."
                  className="flex-1 rounded-xl border-2 border-dashed border-border bg-secondary px-3 py-2 font-mono text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addStep}
                  disabled={!newStepLabel.trim()}
                  className="rounded-xl bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {steps.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
                      <span className="font-mono text-xs text-muted-foreground">{idx + 1}.</span>
                      <span className="flex-1 font-mono text-sm text-foreground">{step.label}</span>
                      <button type="button" onClick={() => removeStep(step.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {steps.length === 0 && (
                <p className="font-mono text-xs text-muted-foreground/60 italic">Add steps to your routine above</p>
              )}
            </div>
          )}

          {/* Preview */}
          <div>
            <label className="mb-1.5 block font-mono text-xs text-muted-foreground">preview</label>
            <div
              className="rounded-2xl border-2 border-dashed bg-secondary px-3 py-2.5"
              style={{ borderColor: selectedColor }}
            >
              <div className="flex items-center gap-2">
                <ActivityIcon icon={selectedIcon} color={selectedColor} className="h-5 w-5" />
                <span className="font-mono text-xs text-foreground">{label || "Your activity"}</span>
                {isRoutine && steps.length > 0 && (
                  <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
                    {steps.length} steps
                  </span>
                )}
              </div>
              {isRoutine && steps.length > 0 && (
                <div className="mt-2 space-y-1 border-t border-border/50 pt-2">
                  {steps.slice(0, 3).map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-sm border border-current" />
                      <span>{step.label}</span>
                    </div>
                  ))}
                  {steps.length > 3 && (
                    <div className="font-mono text-[10px] text-muted-foreground/60">+{steps.length - 3} more...</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-xl border-2 border-dashed border-border bg-secondary px-4 py-2 font-mono text-xs text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={!label.trim()}
              className="flex-1 rounded-xl bg-primary px-4 py-2 font-mono text-xs text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              create
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function SketchPencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 5l4 4" strokeLinecap="round" />
    </svg>
  )
}
