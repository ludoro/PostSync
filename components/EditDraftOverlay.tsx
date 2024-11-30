'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

// Define the type for draft posts
interface Post {
    id: string
    title: string
    content: string
    scheduledAt: string // Keep this as a string since it's JSON-parsed
    image_url?: string[]
    video_url?: string[]
}


interface EditDraftOverlayProps {
  post: Post
  isOpen: boolean
  onClose: () => void
  onSave: (updatedPost: Post) => Promise<void>
}

export const EditDraftOverlay: React.FC<EditDraftOverlayProps> = ({ 
  post, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)
  const [isSaving, setIsSaving] = useState(false)

  // Reset form when post changes
  useEffect(() => {
    setTitle(post.title)
    setContent(post.content)
  }, [post])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave({
        ...post,
        title,
        content
      })
      onClose()
    } catch (error) {
      console.error('Failed to save draft', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Draft</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input 
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea 
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t flex justify-end space-x-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}