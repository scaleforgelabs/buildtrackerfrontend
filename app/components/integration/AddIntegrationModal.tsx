'use client'

import React, { useState } from 'react'
import { X, Plus, Globe, Shield, MessageSquare, Database, Link2 } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/Select"
import FormField from "@/app/components/ui/FormField"
import IconSelectionModal from "../quick-links/modal/IconSelectionModal"

interface AddIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (integration: any) => Promise<void>;
}

const CATEGORIES = [
  { value: "Communication", icon: MessageSquare, color: "blue" },
  { value: "Security", icon: Shield, color: "purple" },
  { value: "Storage", icon: Database, color: "green" },
  { value: "Productivity", icon: Globe, color: "orange" },
  { value: "Development", icon: Plus, color: "red" },
]

const AddIntegrationModal = ({ isOpen, onClose, onAdd }: AddIntegrationModalProps) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<{
    id: string;
    name: string;
    icon: string;
    color?: string;
  } | null>(null);
  const [iconModalOpen, setIconModalOpen] = useState(false);

  const handleIconSelect = (icon: { id: string; name: string; icon: string; color?: string }) => {
    setSelectedIcon(icon);
    if (!name) setName(icon.name);
  };

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onAdd({
        name,
        category,
        url,
        description,
        icon: selectedIcon?.icon || "",
        is_visible: true
      })
      setName('')
      setUrl('')
      setDescription('')
      setSelectedIcon(null)
      onClose()
    } catch (error) {
      console.error("Failed to add integration:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 h-screen">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-card px-6 py-7 shadow-xl sm:px-8 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Add New Integration
              </h2>
              <p className="text-sm text-muted-foreground">
                Connect external services and tools to your workspace
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Icon Preview and Change Button */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Icon Preview</label>
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
                {selectedIcon ? (
                  <img
                    src={selectedIcon.icon}
                    alt={selectedIcon.name}
                    width={40}
                    height={40}
                    className="h-10 w-10"
                  />
                ) : (
                  <Link2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-foreground">Service Icon</label>
              <button
                type="button"
                onClick={() => setIconModalOpen(true)}
                className="rounded-lg border border-input px-4 py-2.5 text-sm w-fit font-medium text-foreground hover:bg-muted transition text-left"
              >
                {selectedIcon ? `${selectedIcon.name} Icon` : "Choose Icon"}
              </button>
            </div>
          </div>

          <FormField label="Integration Name">
            <Input
              type="text"
              placeholder="e.g. Slack, Discord, Google Drive"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-lg"
            />
          </FormField>

          <FormField label="Category">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-4 w-4" />
                      {cat.value}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="URL (Optional)">
            <Input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-lg"
            />
          </FormField>

          <FormField label="Description (Optional)">
            <Textarea
              placeholder="How will this integration be used?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg min-h-[80px] resize-none"
            />
          </FormField>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-input px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 shadow-sm"
            >
              {loading ? "Adding..." : "Add Integration"}
            </button>
          </div>
        </form>
      </div>

      <IconSelectionModal
        open={iconModalOpen}
        onClose={() => setIconModalOpen(false)}
        onSelect={handleIconSelect}
        selectedIcon={selectedIcon?.id}
      />
    </div>
  )
}

export default AddIntegrationModal
