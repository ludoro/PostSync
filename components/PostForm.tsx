import * as React from 'react'
import { Calendar, Image, Clock, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface PostFormProps {
  date?: Date;
  setDate: (date?: Date) => void;
  time: string;
  setTime: (time: string) => void;
  content: string;
  setContent: (content: string) => void;
}

export default function PostForm({ date, setDate, time, setTime, content, setContent }: PostFormProps) {
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

  const resetSchedule = () => {
    setDate(undefined);
    setTime('00:00');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
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
                        : `Scheduled for ${format(date, "PPP")} at ${time}`}
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
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
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
        {date ? (
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Schedule Post
          </Button>
        ) : (
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Publish Immediately
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}