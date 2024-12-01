import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Linkedin, Twitter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

// Define the type for draft posts
interface Post {
    id: string
    linkedin_content?: string
    twitter_content?: string
    scheduledAt: string
    image_url?: string
    video_url?: string
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
    const [linkedin_content, setLinkedinContent] = useState(post.linkedin_content || '')
    const [twitter_content, setTwitterContent] = useState(post.twitter_content || '')
    const [postToLinkedIn, setPostToLinkedIn] = useState(!!post.linkedin_content)
    const [postToTwitter, setPostToTwitter] = useState(!!post.twitter_content)

    const [date, setDate] = useState<Date | undefined>(
        post.scheduledAt ? new Date(post.scheduledAt) : undefined
    )
    const [time, setTime] = useState<string>(
        post.scheduledAt 
            ? new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''
    )
    const [isSaving, setIsSaving] = useState(false)

    // Generate time options (every 15 minutes)
    const timeOptions = Array.from({ length: 96 }, (_, i) => {
        const hour = Math.floor(i / 4)
        const minute = ['00', '15', '30', '45'][i % 4]
        return `${hour.toString().padStart(2, '0')}:${minute}`
    })

    // Reset form when post changes
    useEffect(() => {
        setLinkedinContent(post.linkedin_content || '')
        setTwitterContent(post.twitter_content || '')
        setPostToLinkedIn(!!post.linkedin_content)
        setPostToTwitter(!!post.twitter_content)
        setDate(post.scheduledAt ? new Date(post.scheduledAt) : undefined)
        setTime(
            post.scheduledAt 
                ? new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''
        )
    }, [post])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Combine date and time
            const scheduledAt = date ? new Date(date) : null
            if (scheduledAt && time) {
                const [hours, minutes] = time.split(':')
                scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)
            }

            await onSave({
                ...post,
                linkedin_content: postToLinkedIn ? linkedin_content : undefined,
                twitter_content: postToTwitter ? twitter_content : undefined,
                scheduledAt: scheduledAt ? scheduledAt.toISOString() : post.scheduledAt
            })
            onClose()
        } catch (error) {
            console.error('EditDraftOverlay: Failed to save draft', error)
        } finally {
            setIsSaving(false)
        }
    }

    const resetSchedule = () => {
        setDate(undefined)
        setTime('')
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

                    {/* Platform Selection */}
                    <div className="flex items-center space-x-4 mt-4">
                        <div className="flex items-center space-x-2">
                            <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                            <Switch
                                id="linkedin-toggle"
                                checked={postToLinkedIn}
                                onCheckedChange={setPostToLinkedIn}
                            />
                            <Label htmlFor="linkedin-toggle">Post to LinkedIn</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                            <Switch
                                id="twitter-toggle"
                                checked={postToTwitter}
                                onCheckedChange={setPostToTwitter}
                            />
                            <Label htmlFor="twitter-toggle">Post to Twitter</Label>
                        </div>
                    </div>

                    {/* LinkedIn Content */}
                    {postToLinkedIn && (
                        <div className="mt-4">
                            <label htmlFor="linkedin-content" className="block text-sm font-medium text-gray-700 mb-2">
                                LinkedIn Post Content
                            </label>
                            <textarea
                                id="linkedin-content"
                                value={linkedin_content}
                                onChange={(e) => setLinkedinContent(e.target.value)}
                                rows={4}
                                placeholder="Write your LinkedIn-specific content here"
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <p className="text-sm text-gray-500 text-right mt-1">{linkedin_content.length} characters</p>
                        </div>
                    )}

                    {/* Twitter Content */}
                    {postToTwitter && (
                        <div className="mt-4">
                            <label htmlFor="twitter-content" className="block text-sm font-medium text-gray-700 mb-2">
                                Twitter Post Content
                            </label>
                            <textarea
                                id="twitter-content"
                                value={twitter_content}
                                onChange={(e) => setTwitterContent(e.target.value)}
                                rows={4}
                                maxLength={280}
                                placeholder="Write your Twitter-specific content here (280 characters max)"
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <p className="text-sm text-gray-500 text-right mt-1">{twitter_content.length}/280 characters</p>
                        </div>
                    )}

                    {/* Scheduling Section */}
                    <div className="mt-4 flex items-center space-x-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[200px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {date ? date.toLocaleDateString() : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                    mode="single"
                                    selected={date}
                                    onSelect={(selectedDate) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        if (selectedDate && selectedDate >= today) {
                                            setDate(selectedDate);
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Select value={time} onValueChange={setTime}>
                            <SelectTrigger className="w-[130px]">
                                <Clock className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeOptions.map((timeOption) => (
                                    <SelectItem key={timeOption} value={timeOption}>
                                        {timeOption}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {date && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={resetSchedule}
                                className="text-gray-500"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t flex justify-end space-x-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    )
}