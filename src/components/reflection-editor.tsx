'use client'

import { useState, ChangeEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { updateReflection } from '@/lib/services/reflection'
import { PushToTalk } from '@/components/push-to-talk'
import type { PushReflection } from '@/types'

interface ReflectionEditorProps {
  reflection: PushReflection
  onSave: (updatedReflection: PushReflection) => void
  onCancel: () => void
}

export function ReflectionEditor({ reflection, onSave, onCancel }: ReflectionEditorProps) {
  const [content, setContent] = useState(reflection.reflection)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      const id = reflection.id
      if (!id) {
        throw new Error('Reflection ID is missing')
      }
      await updateReflection(id, content)
      onSave({
        ...reflection,
        reflection: content,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error saving reflection:', error)
      setError('Failed to save reflection. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceInput = (text: string) => {
    // Append the transcribed text to the existing content
    setContent(prev => {
      const separator = prev.trim().length > 0 ? ' ' : ''
      return prev.trim() + separator + text.trim()
    })
  }

  const handleVoiceError = (error: Error) => {
    console.error('Voice input error:', error)
    setError('Failed to process voice input. Please try again or use text input.')
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          placeholder="Write your reflection here..."
          className="min-h-[200px] bg-white/[0.08] text-white placeholder:text-white/50 border-white/20 focus:border-white/30 focus:bg-white/[0.12] pr-12"
          disabled={loading}
          autoFocus
        />
        <div className="absolute right-3 top-3">
          <PushToTalk
            onMessage={handleVoiceInput}
            onError={handleVoiceError}
            className="hover:bg-white/[0.12]"
          />
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || !content.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Reflection'
          )}
        </Button>
      </div>
    </div>
  )
} 