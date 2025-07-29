import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSubmissionLimits } from '@/hooks/useSubmissionLimits';
import { useToast } from '@/components/ui/use-toast';
import { Lightbulb, MessageCircle, CheckCircle } from 'lucide-react';

const suggestionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(500, 'Content must be less than 500 characters'),
});

const feedbackSchema = z.object({
  content: z.string().min(10, 'Feedback must be at least 10 characters').max(1000, 'Feedback must be less than 1000 characters'),
});

export const SubmissionForm = () => {
  const { userId, suggestionCount, feedbackCount, canSubmitSuggestion, canSubmitFeedback, loading, refreshCounts } = useSubmissionLimits();
  const { toast } = useToast();
  const [submittingType, setSubmittingType] = useState<'suggestion' | 'feedback' | null>(null);

  const suggestionForm = useForm<z.infer<typeof suggestionSchema>>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const feedbackForm = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmitSuggestion = async (values: z.infer<typeof suggestionSchema>) => {
    if (!userId || !canSubmitSuggestion) return;

    setSubmittingType('suggestion');
    try {
      const { error } = await supabase
        .from('suggestions')
        .insert({
          user_id: userId,
          title: values.title,
          content: values.content,
        });

      if (error) throw error;

      toast({
        title: "Suggestion submitted!",
        description: "Thank you for your suggestion.",
      });

      suggestionForm.reset();
      await refreshCounts();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to submit suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingType(null);
    }
  };

  const onSubmitFeedback = async (values: z.infer<typeof feedbackSchema>) => {
    if (!userId || !canSubmitFeedback) return;

    setSubmittingType('feedback');
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: userId,
          content: values.content,
        });

      if (error) throw error;

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback.",
      });

      feedbackForm.reset();
      await refreshCounts();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingType(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Suggestion Box</h1>
          <p className="text-muted-foreground">
            You can submit up to 3 suggestions and 3 feedback entries per session.
          </p>
        </div>

        {/* Suggestions Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Suggestions
              <Badge variant="secondary">
                {suggestionCount}/3 submitted
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {canSubmitSuggestion ? (
              <Form {...suggestionForm}>
                <form onSubmit={suggestionForm.handleSubmit(onSubmitSuggestion)} className="space-y-4">
                  <FormField
                    control={suggestionForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suggestion Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief title for your suggestion..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={suggestionForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suggestion Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your suggestion in detail..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={submittingType === 'suggestion'}
                    className="w-full"
                  >
                    {submittingType === 'suggestion' ? 'Submitting...' : 'Submit Suggestion'}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Suggestion Limit Reached</h3>
                <p className="text-muted-foreground">
                  You've reached your maximum of 3 suggestions. Thank you for participating!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              Feedback
              <Badge variant="secondary">
                {feedbackCount}/3 submitted
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {canSubmitFeedback ? (
              <Form {...feedbackForm}>
                <form onSubmit={feedbackForm.handleSubmit(onSubmitFeedback)} className="space-y-4">
                  <FormField
                    control={feedbackForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Feedback</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your thoughts, experiences, or suggestions for improvement..." 
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={submittingType === 'feedback'}
                    className="w-full"
                  >
                    {submittingType === 'feedback' ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Feedback Limit Reached</h3>
                <p className="text-muted-foreground">
                  You've reached your maximum of 3 feedback entries. Thank you for participating!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {!canSubmitSuggestion && !canSubmitFeedback && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                  All Done!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  You've submitted all your allowed entries. Thank you for your participation!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};