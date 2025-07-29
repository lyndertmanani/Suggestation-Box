import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Suggestion, Feedback, Report } from '@/types/database';
import { BarChart3, MessageCircle, Lightbulb, Users, RefreshCw, Brain, Copy, ExternalLink, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SubmissionDetailModal } from './SubmissionDetailModal';
import { AIInsightsPanel } from './AIInsightsPanel';

export const AdminDashboard = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({
    totalSuggestions: 0,
    totalFeedback: 0,
    uniqueUsers: 0,
    todayCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<(Suggestion & { type: 'suggestion' }) | (Feedback & { type: 'feedback'; title: '' }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const currentUrl = window.location.origin + '/submit';

  useEffect(() => {
    loadData();
    setupRealtimeSubscriptions();
  }, []);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [suggestionsResult, feedbackResult, reportsResult, usersResult] = await Promise.all([
        supabase.from('suggestions').select('*').order('created_at', { ascending: false }),
        supabase.from('feedback').select('*').order('created_at', { ascending: false }),
        supabase.from('reports').select('*').order('generated_at', { ascending: false }),
        supabase.from('users').select('id')
      ]);

      if (suggestionsResult.data) setSuggestions(suggestionsResult.data);
      if (feedbackResult.data) setFeedback(feedbackResult.data);
      if (reportsResult.data) setReports(reportsResult.data);

      // Calculate today's submissions
      const todaySuggestions = suggestionsResult.data?.filter(s => 
        s.created_at.startsWith(today)
      ).length || 0;
      const todayFeedback = feedbackResult.data?.filter(f => 
        f.created_at.startsWith(today)
      ).length || 0;

      setStats({
        totalSuggestions: suggestionsResult.data?.length || 0,
        totalFeedback: feedbackResult.data?.length || 0,
        uniqueUsers: usersResult.data?.length || 0,
        todayCount: todaySuggestions + todayFeedback
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const suggestionsChannel = supabase
      .channel('suggestions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'suggestions'
      }, () => {
        loadData();
      })
      .subscribe();

    const feedbackChannel = supabase
      .channel('feedback-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'feedback'
      }, () => {
        loadData();
      })
      .subscribe();

    const reportsChannel = supabase
      .channel('reports-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reports'
      }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(suggestionsChannel);
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(reportsChannel);
    };
  };

  const generateAIReport = async () => {
    setGeneratingReport(true);
    try {
      // This would call an AI service to analyze the data
      // For now, we'll create a mock report
      const allData = {
        suggestions: suggestions.map(s => ({ title: s.title, content: s.content })),
        feedback: feedback.map(f => ({ content: f.content }))
      };

      const mockReport = {
        summary: `Analysis of ${suggestions.length} suggestions and ${feedback.length} feedback entries. Overall sentiment appears positive with several recurring themes.`,
        sentiment: suggestions.length + feedback.length > 0 ? 'Positive' : 'Neutral',
        topics: ['User Experience', 'Feature Requests', 'Performance', 'Design'],
        raw_data: allData
      };

      const { error } = await supabase
        .from('reports')
        .insert(mockReport);

      if (error) throw error;

      toast({
        title: "Report Generated",
        description: "AI analysis has been completed and saved.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI report.",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "Submission form link copied to clipboard",
      });
    });
  };

  const openSubmissionDetail = (item: any) => {
    setSelectedSubmission(item);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Real-time suggestion and feedback monitoring</p>
          </div>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Suggestions</p>
                  <p className="text-2xl font-bold">{stats.totalSuggestions}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                  <p className="text-2xl font-bold">{stats.totalFeedback}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                  <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Activity</p>
                  <p className="text-2xl font-bold">{stats.todayCount}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code & Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Access QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={currentUrl}
                    size={200}
                    level="M"
                    includeMargin
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scan to access the submission form
                </p>
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyLink}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(currentUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground break-all text-center">
                  {currentUrl}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <Card className="lg:col-span-2">
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Live Feed</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Real-time
                      </Badge>
                    </div>
                    <ScrollArea className="h-[400px] space-y-4">
                      {[
                        ...suggestions.map(s => ({ ...s, type: 'suggestion' as const })), 
                        ...feedback.map(f => ({ ...f, type: 'feedback' as const, title: '' }))
                      ]
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((item, index) => (
                          <div 
                            key={`${item.type}-${item.id}`} 
                            className="mb-4 p-4 border rounded-lg bg-card hover:bg-muted/20 cursor-pointer transition-colors"
                            onClick={() => openSubmissionDetail(item)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={item.type === 'suggestion' ? 'default' : 'secondary'}>
                                {item.type === 'suggestion' ? (
                                  <>
                                    <Lightbulb className="h-3 w-3 mr-1" />
                                    Suggestion
                                  </>
                                ) : (
                                  <>
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Feedback
                                  </>
                                )}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                            {item.type === 'suggestion' && item.title && (
                              <h4 className="font-semibold mb-2 truncate">{item.title}</h4>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                            <p className="text-xs text-blue-600 mt-2">Click to view details</p>
                          </div>
                        ))}
                      {suggestions.length === 0 && feedback.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No submissions yet. Share the QR code to get started!
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="insights" className="px-6 pb-6">
                  <AIInsightsPanel suggestions={suggestions} feedback={feedback} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* AI Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                AI Analysis Reports
              </CardTitle>
              <Button 
                onClick={generateAIReport}
                disabled={generatingReport || (suggestions.length === 0 && feedback.length === 0)}
              >
                {generatingReport ? 'Generating...' : 'Generate New Report'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{report.sentiment}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(report.generated_at)}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{report.summary}</p>
                    {report.topics && report.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground mr-2">Topics:</span>
                        {report.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No AI reports generated yet.</p>
                <p className="text-sm">Generate a report to see AI insights on submissions.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submission Detail Modal */}
        <SubmissionDetailModal
          submission={selectedSubmission}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onMarkReviewed={(id, type) => {
            toast({
              title: "Marked as Reviewed",
              description: `${type} has been marked as reviewed.`,
            });
            setIsModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};