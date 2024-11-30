import * as React from 'react'
import { Calendar, Image, Video, Clock, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import confetti from 'canvas-confetti';

interface PostFormProps {
  existingPostId: string | null | undefined;
  date?: Date;
  setDate: (date?: Date) => void;
  time: string;
  setTime: (time: string) => void;
  content: string;
  setContent: (content: string) => void;
}

type PostStatus = 'draft' | 'scheduled';
type FilePreview = {
  file: File
  preview: string
  type: 'image' | 'video'
}

export default function PostForm({ existingPostId, date, setDate, time, setTime, content, setContent }: PostFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [files, setFiles] = React.useState<FilePreview[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const videoInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (type === 'video' && selectedFiles.length > 0) {
      // Remove existing video if any
      setFiles(prev => prev.filter(f => f.type === 'image'))
    }
    
    const newFiles = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type
    }))

    setFiles(prev => {
      const combined = [...prev, ...newFiles]
      // Ensure only one video maximum
      if (type === 'video') {
        return [...prev.filter(f => f.type === 'image'), newFiles[0]]
      }
      return combined
    })

    // Clear the file input after selection, so users can upload again an image.
    if (e.target) {
      e.target.value = '';
    }
  }

  const removeFile = (preview: string) => {
    setFiles(prev => prev.filter(f => f.preview !== preview))
    URL.revokeObjectURL(preview)
  }

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const timeOptions = React.useMemo(() => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of ['00', '15', '30', '45']) {
        const hourStr = hour.toString().padStart(2, '0');
        times.push(`${hourStr}:${minute}`);
      }
    }
    return times;
  }, []);
  
  const filteredTimeOptions = React.useMemo(() => {
    if (!date) return timeOptions;
  
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time component from today
  
    if (date.getTime() !== today.getTime()) {
      return timeOptions; // If not today, show all options
    }
  
    // Current time in user's timezone
    const now = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZone: userTimezone 
    });
  
    return timeOptions.filter((timeOption) => timeOption >= now);
  }, [date, timeOptions, userTimezone]);
  

  const getNextFifteenMinuteInterval = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const remainder = minutes % 15;
    const minutesToAdd = remainder === 0 ? 15 : 15 - remainder;
    
    now.setMinutes(minutes + minutesToAdd);
    now.setSeconds(0);
    now.setMilliseconds(0);
    
    return now;
  };

  const formatTimeForSelect = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 150);
  };

  const resetSchedule = () => {
    setDate(undefined);
    setTime('-99:00');
  };

  const resetFiles = () => {
    setFiles([]);
  };

  const handleSubmit = async (status: PostStatus) => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("Starting handlen submit")
    console.log(userTimezone);
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Post content cannot be empty"
      })
      return
    }

    let scheduledAt: Date | null = null;
    console.log(time)
    if (status === 'scheduled') {
      if ((!time || time === '-99:00')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Time of scheduling cannot be empty"
        })
        return
      }
      if (!scheduledAt && !(!time || time === '00:00') ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Date of scheduling cannot be empty"
        })
        return
      }
    }

    setIsSubmitting(true)
    try {
      
      if (status === 'scheduled') {
        if (date) {
          // Use selected date and time
          const [hours, minutes] = time.split(':')
          scheduledAt = new Date(date)
          scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        } else {
          // Use next 15-minute interval
          scheduledAt = getNextFifteenMinuteInterval();
        }
      }

        // Convert files to base64
        const filePromises = files.map(async (filePreview) => {
          console.log("File preview:", filePreview);
          console.log("File object:", filePreview.file);
          console.log("File type:", filePreview.type);
        
          return new Promise<{ base64: string, type: 'image' | 'video' }>((resolve, reject) => {
            if (!(filePreview.file instanceof File)) {
              reject(new Error("Not a File object"));
              return;
            }
        
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                base64: reader.result as string,
                type: filePreview.type
              });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(filePreview.file);
          });
        });
        

      const processedFiles = await Promise.all(filePromises);
      console.log("Before scheduling post")
      console.log(existingPostId)
      const response = await fetch('/api/schedule_post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          existing_id: existingPostId, // Changed from existingPostId to existing_id
          content,
          scheduledAt,
          status,
          files: processedFiles.map(f => f.base64),
          fileTypes: processedFiles.map(f => f.type),
          user_time_zone: userTimezone
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save post')
      }

      if (status === 'scheduled') {
        triggerConfetti()
      }

      toast({
        title: status === 'scheduled' ? "🎉 Success!" : "✓ Saved",
        description: status === 'scheduled' 
          ? `Your post has been scheduled for ${scheduledAt!.toLocaleDateString()} at ${formatTimeForSelect(scheduledAt!)}`
          : "Your post has been saved as a draft",
        className: status === 'scheduled' ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200",
      })

      setContent('')
      if (status === 'scheduled') {
        resetSchedule()
        resetFiles()
      }
      // Create a toast with a clear message about redirection
      const redirectToast = toast({
        title: "✨ Success!",
        description: status === 'scheduled' 
          ? `Post scheduled for ${scheduledAt!.toLocaleDateString()} at ${formatTimeForSelect(scheduledAt!)}. Redirecting to dashboard...`
          : "Draft saved. Redirecting to dashboard...",
        duration: 2000, // Show for 2 seconds
        className: "bg-green-50 border-green-200"
      })

      // Wait for the toast to be visible
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Close the toast and redirect
      redirectToast.dismiss()
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving post:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save post. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid w-full gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="content">Content</Label>
                <Textarea 
                  id="content" 
                  placeholder="Write your post content here" 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <p className="text-sm text-gray-500 text-right">{content.length} characters</p>
              </div>
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e, 'image')}
                  />
                  <input
                    type="file"
                    ref={videoInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={(e) => handleFileSelect(e, 'video')}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Add Images
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Add Video
                  </Button>
                </div>

                {files.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {files.map((file) => (
                      <div key={file.preview} className="relative group">
                        {file.type === 'image' ? (
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="w-full h-24 object-cover rounded"
                          />
                        ) : (
                          <video
                            src={file.preview}
                            className="w-full h-24 object-cover rounded"
                          />
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(file.preview)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              <div className="flex flex-col space-y-4">
                <div className="space-y-2">
                  <Label>Publishing Schedule</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    {!date ? "Post will be scheduled for the next available 15-minute interval if no date is set." 
                          : `Scheduled for ${date.toLocaleDateString()} at ${time}`}
                  </p>
                  <div className="flex space-x-2">
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
                            today.setHours(0, 0, 0, 0); // Strip the time from "today"
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
                        {filteredTimeOptions.map((timeOption) => (
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
                        onClick={() => { resetSchedule(); resetFiles(); }}
                        className="text-gray-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => handleSubmit('scheduled')}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : date ? "Schedule Post" : "Publish as soon as possible"}
          </Button>

          <Button 
            className="bg-gray-500 hover:bg-gray-600 text-white"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save as draft"}
          </Button>
        </CardFooter>
      </Card>
      <Toaster />
    </>
  );
}