import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, ExternalLink, Users, MessageSquare, TrendingUp, Clock, RefreshCw, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Suggestion, Feedback, QuizSettings } from '@/types/database';
import { SubmissionDetailModal } from './SubmissionDetailModal';
import { AIInsightsPanel } from './AIInsightsPanel';
import { useToast } from '@/hooks/use-toast';

export const AdminDashboard = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);
  const { toast } = useToast();

  const submitUrl = `${window.location.origin}/submit`;

  useEffect(() => {
    fetchData();
    fetchQuizSettings();
    
    // Subscribe to real-time updates
    const suggestionChannel = supabase
      .channel('suggestions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suggestions'
        },
        () => fetchData()
      )
      .subscribe();

    const feedbackChannel = supabase
      .channel('feedback-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback'
        },
        () => fetchData()
      )
      .subscribe();

    const quizChannel = supabase
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
      supabase.removeChannel(suggestionChannel);
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(quizChannel);
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

  const toggleQuiz = async (isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('quiz_settings')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', quizSettings?.id);

      if (error) throw error;

      toast({
        title: "Quiz settings updated",
        description: `Quiz is now ${isActive ? 'active' : 'inactive'}`
      });
    } catch (error) {
      console.error('Error updating quiz settings:', error);
      toast({
        title: "Error",
        description: "Failed to update quiz settings",
        variant: "destructive"
      });
    }
  };

  const copyLink = () => {
    const submitUrl = `${window.location.origin}/submit`;
    navigator.clipboard.writeText(submitUrl);
    toast({
      title: "Link copied!",
      description: "Submission link has been copied to clipboard"
    });
  };

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch suggestions, feedback, and users
      const [suggestionsResult, feedbackResult, usersResult] = await Promise.all([
        supabase.from('suggestions').select('*').order('created_at', { ascending: false }),
        supabase.from('feedback').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('id')
      ]);

      if (suggestionsResult.data) setSuggestions(suggestionsResult.data);
      if (feedbackResult.data) setFeedback(feedbackResult.data);
      
      setTotalUsers(usersResult.data?.length || 0);

      // Calculate today's submissions
      const todaySubmissions = [
        ...(suggestionsResult.data || []),
        ...(feedbackResult.data || [])
      ].filter(item => item.created_at.startsWith(today));
      
      setTodayCount(todaySubmissions.length);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmissionClick = (submission: any) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  // Combine and sort all submissions by date
  const allSubmissions = [
    ...suggestions.map(s => ({ ...s, type: 'suggestion' as const })),
    ...feedback.map(f => ({ ...f, type: 'feedback' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor submissions and generate insights in real-time
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Suggestions</p>
                <p className="text-3xl font-bold">{suggestions.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-3xl font-bold">{feedback.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Activity</p>
                <p className="text-3xl font-bold">{todayCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - QR Code */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={submitUrl} size={200} />
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Scan to access submission form
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={copyLink}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="outline" onClick={() => window.open(submitUrl, '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Tabbed Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="submissions" className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="submissions">Live Submissions</TabsTrigger>
                    <TabsTrigger value="insights">AI Insights</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="submissions" className="px-6 pb-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Live Feed</h3>
                      <Button variant="outline" size="sm" onClick={fetchData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {allSubmissions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No submissions yet</p>
                        </div>
                      ) : (
                        allSubmissions.map((submission) => (
                          <div
                            key={submission.id}
                            className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => handleSubmissionClick(submission)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={('title' in submission) ? 'default' : 'secondary'}>
                                  {('title' in submission) ? 'Suggestion' : 'Feedback'}
                                </Badge>
                                {('title' in submission) && submission.title && (
                                  <span className="font-medium">{submission.title}</span>
                                )}
                                {('category' in submission) && submission.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {submission.category}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(submission.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {submission.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="px-6 pb-6">
                  <AIInsightsPanel />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quiz Settings */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quiz Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="quiz-toggle">Quiz Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Control whether the value proposition quiz is visible to users
              </p>
            </div>
            <Switch
              id="quiz-toggle"
              checked={quizSettings?.is_active || false}
              onCheckedChange={toggleQuiz}
            />
          </div>
        </CardContent>
      </Card>

      <SubmissionDetailModal
        submission={selectedSubmission}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};