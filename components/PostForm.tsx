import * as React from 'react'
import { Calendar, Image, Clock, X } from 'lucide-react'
import { cn } from "@/lib/utils"
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
  date?: Date;
  setDate: (date?: Date) => void;
  time: string;
  setTime: (time: string) => void;
  content: string;
  setContent: (content: string) => void;
}

export default function PostForm({ date, setDate, time, setTime, content, setContent }: PostFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()

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


  const triggerConfetti = () => {
    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Second burst after a slight delay
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
    setTime('00:00');
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Post content cannot be empty"
      })
      return
    }

    setIsSubmitting(true)
    try {
      let scheduledAt = null
      if (date) {
        // Combine date and time into a single timestamp
        const [hours, minutes] = time.split(':')
        scheduledAt = new Date(date)
        scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }

      const response = await fetch('/api/schedule_post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          scheduledAt,
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save post')
      }

      triggerConfetti()
      toast({
        title: "🎉 Success!",
        description: scheduledAt 
          ? `Your post has been scheduled for ${scheduledAt.toLocaleDateString()} at ${time}`
          : "Your post has been published! Time to celebrate! 🚀",
        className: "bg-green-50 border-green-200",
      })

      // Reset form
      setContent('')
      resetSchedule()
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
              <div>
                <Button variant="outline" className="w-[280px]">
                  <Image className="mr-2 h-4 w-4" />
                  Add Images / Videos
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Publishing Schedule</Label>
                <p className="text-sm text-gray-500 mb-2">
                  {!date ? "Set a date and time to schedule for later. If not, the post will be published immediately." 
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
                          if (selectedDate && selectedDate > new Date()) {
                            setDate(selectedDate);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Select
                    value={time}
                    onValueChange={setTime}
                  >
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
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : date ? "Schedule Post" : "Publish Immediately"}
        </Button>

        <Button 
          className="bg-gray-500 hover:bg-gray-600 text-white"
          onClick={handleSubmit}
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