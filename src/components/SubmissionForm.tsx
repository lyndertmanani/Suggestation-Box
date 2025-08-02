import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubmissionLimits } from '@/hooks/useSubmissionLimits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FEEDBACK_CATEGORIES, QuizSettings } from '@/types/database';
import { QuizSection } from './QuizSection';

export const SubmissionForm = () => {
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionContent, setSuggestionContent] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);
  
  const { 
    userId, 
    suggestionCount, 
    feedbackCount, 
    canSubmitSuggestion, 
    canSubmitFeedback, 
    loading, 
    refreshCounts 
  } = useSubmissionLimits();
  
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizSettings();
    
    // Subscribe to quiz settings changes
    const channel = supabase
      .channel('quiz-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_settings'
        },
        () => fetchQuizSettings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQuizSettings = async () => {
    try {
      const { data } = await supabase
        .from('quiz_settings')
        .select('*')
        .single();
      
      setQuizSettings(data);
    } catch (error) {
      console.error('Error fetching quiz settings:', error);
    }
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User not initialized. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    if (!canSubmitSuggestion) {
      toast({
        title: "Limit reached",
        description: "You have already submitted your maximum suggestions.",
        variant: "destructive"
      });
      return;
    }

    if (!suggestionTitle.trim() || !suggestionContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('suggestions')
        .insert({
          user_id: userId,
          title: suggestionTitle.trim(),
          content: suggestionContent.trim()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your suggestion has been submitted successfully!"
      });

      setSuggestionTitle('');
      setSuggestionContent('');
      refreshCounts();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to submit suggestion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User not initialized. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    if (!canSubmitFeedback) {
      toast({
        title: "Limit reached",
        description: "You have already submitted your maximum feedback.",
        variant: "destructive"
      });
      return;
    }

    if (!feedbackContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter your feedback.",
        variant: "destructive"
      });
      return;
    }

    if (!feedbackCategory) {
      toast({
        title: "Error",
        description: "Please select a feedback category.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: userId,
          content: feedbackContent.trim(),
          category: feedbackCategory
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your feedback has been submitted successfully!"
      });

      setFeedbackContent('');
      setFeedbackCategory('');
      refreshCounts();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Share Your Input</h1>
        <p className="text-muted-foreground">
          Help us improve by sharing your suggestions and feedback
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p>Loading...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="suggestions" className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="suggestions" className="px-6 pb-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Your Suggestions</h3>
                      <span className="text-sm text-muted-foreground">
                        {suggestionCount}/3 used
                      </span>
                    </div>
                    
                    {n ? (
                      <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="suggestion-title">Title</Label>
                          <Input
                            id="suggestion-title"
                            value={suggestionTitle}
                            onChange={(e) => setSuggestionTitle(e.target.value)}
                            placeholder="Brief title for your suggestion"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="suggestion-content">Your Suggestion</Label>
                          <Textarea
                            id="suggestion-content"
                            value={suggestionContent}
                            onChange={(e) => setSuggestionContent(e.target.value)}
                            placeholder="Describe your suggestion in detail..."
                            rows={4}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                          {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          You've reached your suggestion limit (3/3). Thank you for participating!
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="feedback" className="px-6 pb-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Your Feedback</h3>
                      <span className="text-sm text-muted-foreground">
                        {feedbackCount}/3 used
                      </span>
                    </div>
                    
                    {canSubmitFeedback ? (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="feedback-category">Category</Label>
                          <Select value={feedbackCategory} onValueChange={setFeedbackCategory} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select feedback category" />
                            </SelectTrigger>
                            <SelectContent>
                              {FEEDBACK_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="feedback-content">Your Feedback</Label>
                          <Textarea
                            id="feedback-content"
                            value={feedbackContent}
                            onChange={(e) => setFeedbackContent(e.target.value)}
                            placeholder="Share your thoughts, experience, or comments..."
                            rows={4}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          You've reached your feedback limit (3/3). Thank you for participating!
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Optional Email */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Optional: Provide your email if you'd like us to follow up
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Section */}
          {quizSettings && (
            <QuizSection isActive={quizSettings.is_active} />
          )}
        </div>
      )}
    </div>
  );
};