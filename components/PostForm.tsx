import * as React from 'react'
import { Calendar, Image, Video, Clock, X, Linkedin, Twitter } from 'lucide-react'
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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import confetti from 'canvas-confetti';

interface PostFormProps {
  date?: Date;
  setDate: (date?: Date) => void;
  time: string;
  setTime: (time: string) => void;
  content: string;
  setContent: (content: string) => void;
  image_url?: string;
  video_url?: string;
}

type PostStatus = 'draft' | 'scheduled' | 'published';

type FilePreview = {
  file: File
  preview: string
  type: 'image' | 'video'
}


export default function PostForm({date, setDate, time, setTime, content, setContent, image_url, video_url}: PostFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [postToLinkedIn, setPostToLinkedIn] = React.useState(false)
  const [postToTwitter, setPostToTwitter] = React.useState(false)
  const [linkedinContent, setLinkedInContent] = React.useState('')
  const [twitterContent, setTwitterContent] = React.useState('')

  const [files, setFiles] = React.useState<FilePreview[]>(() => {
    const initialFiles: FilePreview[] = [];
  
    // Add image URLs
    if (image_url && image_url.length > 0) {
      const imageFile = {
        file: new File([], image_url[0].split('/').pop() || 'image.jpg', { type: 'image/jpeg' }),
        preview: `https://ghjciaynkxnhbgxnkbwp.supabase.co/storage/v1/object/public/schedule_stuff_bucket/files/${image_url.split('/').slice(-1)[0]}`,
        type: 'image' as const,
      };
      initialFiles.push(imageFile);
    }
  
    // Add video URL (only one video allowed)
    if (video_url && video_url.length > 0) {
      const videoFile = {
        file: new File([], video_url[0].split('/').pop() || 'video.mp4', { type: 'video/mp4' }),
        preview: `https://ghjciaynkxnhbgxnkbwp.supabase.co/storage/v1/object/public/schedule_stuff_bucket/files/${video_url[0].split('/').slice(-1)[0]}`,
        type: 'video' as const,
      };
      initialFiles.push(videoFile);
    }
  
    return initialFiles;
  });


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
    setIsSubmitting(true)
    if ( (!linkedinContent.trim() && !twitterContent.trim()) && files.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Post content cannot be empty"
      })
      return
    }
    // Validate date and time
    if (date && (!time || time === '-99:00')) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select a time when a date is chosen"
        });
        setIsSubmitting(false);
        return;
    }

        // Validate platform-specific content
        if (postToLinkedIn && !linkedinContent.trim()) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "LinkedIn post content cannot be empty"
          })
          setIsSubmitting(false)
          return
        }
    
        if (postToTwitter && !twitterContent.trim()) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Twitter post content cannot be empty"
          })
          setIsSubmitting(false)
          return
        }

    let scheduledAt: Date | null = null;

    try {
      if (status === 'scheduled') {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (date) {
          // Use selected date and time
          const [hours, minutes] = time.split(':')
          scheduledAt = new Date(date)
          scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)

          // Convert to UTC
          const utcYear = scheduledAt.getUTCFullYear();
          const utcMonth = scheduledAt.getUTCMonth();
          const utcDate = scheduledAt.getUTCDate();
          const utcHours = scheduledAt.getUTCHours();
          const utcMinutes = scheduledAt.getUTCMinutes();
          const utcSeconds = scheduledAt.getUTCSeconds();

          scheduledAt = new Date(Date.UTC(utcYear, utcMonth, utcDate, utcHours, utcMinutes, utcSeconds));


        } else {
          // Use next 15-minute interval
          scheduledAt = getNextFifteenMinuteInterval();
          scheduledAt = new Date(scheduledAt.toISOString());

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
      const response = await fetch('/api/schedule_post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedinContent,
          twitterContent,
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

      triggerConfetti()
      toast({
        title: "🎉 Success!",
        description: `Your post has been scheduled for ${scheduledAt!.toLocaleDateString()} at ${formatTimeForSelect(scheduledAt!)}`,
        className: "bg-green-50 border-green-200",
      })

      setContent('')
      resetSchedule()
      resetFiles()
      router.push('/dashboard')
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error saving post:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save post. Please try again."
      })
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid w-full gap-4">
              {/* Platform Selection Toggles */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
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

                {/* LinkedIn Content Textarea */}
                {postToLinkedIn && (
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="linkedin-content">LinkedIn Post Content</Label>
                    <Textarea 
                      id="linkedin-content" 
                      placeholder="Write your LinkedIn-specific content here" 
                      value={linkedinContent}
                      onChange={(e) => setLinkedInContent(e.target.value)}
                    />
                    <p className="text-sm text-gray-500 text-right">{linkedinContent.length} characters</p>
                  </div>
                )}

                {/* Twitter Content Textarea */}
                {postToTwitter && (
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="twitter-content">Twitter Post Content</Label>
                    <Textarea 
                      id="twitter-content" 
                      placeholder="Write your Twitter-specific content here (280 characters max)" 
                      value={twitterContent}
                      onChange={(e) => setTwitterContent(e.target.value)}
                      maxLength={280}
                    />
                    <p className="text-sm text-gray-500 text-right">{twitterContent.length}/280 characters</p>
                  </div>
                )}
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
                    Add Images (only one per post)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Add Video (only one per post)
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
          >
            {isSubmitting ? "Saving..." : date ? "Schedule Post" : "Publish as soon as possible"}
          </Button>
        </CardFooter>
        <Toaster/>
      </Card>
    </>
  );
}