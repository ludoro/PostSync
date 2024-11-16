// components/MainSidebar.tsx
'use client'

import * as React from 'react'
import { format } from 'date-fns'

import {
  Card,
  CardContent,
} from "@/components/ui/card"


interface PostPreviewProps {
    date?: Date;
    time: string;
    content: string;
  }
  
  export default function PostReview({ date, time, content }: PostPreviewProps) {
    return (
      <aside className="border-l p-6">
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-2">
              {date ? `Scheduled for ${format(date, "MMMM d, yyyy")} at ${time}` : "Will be published immediately"}
            </p>
            <div className="prose prose-sm">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p className="text-gray-400">Your post preview will appear here...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </aside>
    );
  }