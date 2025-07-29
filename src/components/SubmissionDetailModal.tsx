import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Suggestion, Feedback } from '@/types/database';
import { Lightbulb, MessageCircle, Calendar, User } from 'lucide-react';

interface SubmissionDetailModalProps {
  submission: (Suggestion & { type: 'suggestion' }) | (Feedback & { type: 'feedback'; title: '' }) | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkReviewed?: (id: string, type: 'suggestion' | 'feedback') => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  isOpen,
  onClose,
  onMarkReviewed
}) => {
  if (!submission) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSentimentColor = (content: string) => {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'awesome', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'poor', 'disappointing'];
    
    const lowercaseContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowercaseContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowercaseContent.includes(word)).length;
    
    if (positiveCount > negativeCount) return { color: 'bg-green-100 text-green-800', emoji: '🟢', label: 'Positive' };
    if (negativeCount > positiveCount) return { color: 'bg-red-100 text-red-800', emoji: '🔴', label: 'Negative' };
    return { color: 'bg-yellow-100 text-yellow-800', emoji: '🟡', label: 'Neutral' };
  };

  const sentiment = getSentimentColor(submission.content);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {submission.type === 'suggestion' ? (
              <>
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Suggestion Details
              </>
            ) : (
              <>
                <MessageCircle className="h-5 w-5 text-blue-500" />
                Feedback Details
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Title (for suggestions) */}
          {submission.type === 'suggestion' && submission.title && (
            <div>
              <h3 className="font-semibold text-lg mb-2">{submission.title}</h3>
            </div>
          )}
          
          {/* Content */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Content</label>
            <div className="mt-1 p- bg-muted/20 rounded-lg">
              <p className="text-md">{submission.content}</p>
            </div>
          </div>
          
          {/* Metadata */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="text-sm">{formatDate(submission.created_at)}</p>
              </div>
            </div> */}
            
            {/* <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="text-sm font-mono">{submission.user_id?.slice(0, 8)}...</p>
              </div>
            </div> */}
            
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Sentiment</p>
                <Badge variant="secondary" className={sentiment.color}>
                  {sentiment.emoji} {sentiment.label}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Mark as Reviewed */}
          {onMarkReviewed && (
            <div className="flex items-center space-x-2 pt-4 border-t">
              <Checkbox 
                id="reviewed" 
                onCheckedChange={(checked) => {
                  if (checked) {
                    onMarkReviewed(submission.id, submission.type);
                  }
                }}
              />
              <label htmlFor="reviewed" className="text-sm font-medium">
                Mark as reviewed
              </label>
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};