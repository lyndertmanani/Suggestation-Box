import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, MessageSquare, Users, Brain, Download, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InsightsData {
  sentiment: Array<{ name: string; value: number; color: string }>;
  themes: Array<{ theme: string; count: number }>;
  keywords: Array<{ word: string; score: number }>;
  summary: string;
  recommendations: string[];
  totalSuggestions?: number;
  totalFeedback?: number;
  categorizedFeedback?: { [key: string]: number };
}

export const AIInsightsPanel = () => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      // Fetch actual data from database
      const [suggestionsResult, feedbackResult] = await Promise.all([
        supabase.from('suggestions').select('*'),
        supabase.from('feedback').select('*')
      ]);

      const suggestions = suggestionsResult.data || [];
      const feedback = feedbackResult.data || [];
      
      // Analyze the content using basic sentiment analysis and categorization
      const allContent = [
        ...suggestions.map(s => ({ content: s.content, type: 'suggestion', title: s.title, category: 'General' })),
        ...feedback.map(f => ({ content: f.content, type: 'feedback', category: f.category || 'General' }))
      ];

      // Mock sentiment analysis (in real app, use AI service)
      const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
      allContent.forEach(item => {
        const content = item.content.toLowerCase();
        if (content.includes('good') || content.includes('great') || content.includes('excellent') || content.includes('love')) {
          sentimentCounts.positive++;
        } else if (content.includes('bad') || content.includes('terrible') || content.includes('awful') || content.includes('hate')) {
          sentimentCounts.negative++;
        } else {
          sentimentCounts.neutral++;
        }
      });

      const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
      
      // Theme analysis by feedback categories
      const categoryCount: { [key: string]: number } = {};
      feedback.forEach(f => {
        const category = f.category || 'General';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      // Keyword extraction (basic implementation)
      const wordCount: { [key: string]: number } = {};
      allContent.forEach(item => {
        const words = item.content.toLowerCase().match(/\b\w+\b/g) || [];
        words.forEach(word => {
          if (word.length > 3) {
            wordCount[word] = (wordCount[word] || 0) + 1;
          }
        });
      });

      const topKeywords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word, count]) => ({ word, score: Math.min(100, count * 10) }));

      const insightsData = {
        sentiment: [
          { name: 'Positive', value: Math.round((sentimentCounts.positive / total) * 100) || 0, color: '#22c55e' },
          { name: 'Neutral', value: Math.round((sentimentCounts.neutral / total) * 100) || 0, color: '#6b7280' },
          { name: 'Negative', value: Math.round((sentimentCounts.negative / total) * 100) || 0, color: '#ef4444' }
        ],
        themes: Object.entries(categoryCount).map(([theme, count]) => ({ theme, count })),
        keywords: topKeywords,
        summary: `Analysis of ${total} submissions shows ${sentimentCounts.positive > sentimentCounts.negative ? 'generally positive' : 'mixed'} sentiment. Most feedback relates to ${Object.keys(categoryCount)[0] || 'various topics'}.`,
        recommendations: [
          `${suggestions.length} suggestions received - prioritize implementation based on frequency`,
          `${Object.keys(categoryCount).length} feedback categories identified - focus on top concerns`,
          sentimentCounts.negative > 0 ? "Address negative feedback promptly" : "Maintain current positive experience",
          "Continue collecting feedback to identify trends"
        ],
        totalSuggestions: suggestions.length,
        totalFeedback: feedback.length,
        categorizedFeedback: categoryCount
      };
      
      setInsights(insightsData);
      
      // Store report in database
      await supabase.from('reports').insert({
        summary: insightsData.summary,
        sentiment: `Positive: ${sentimentCounts.positive}, Neutral: ${sentimentCounts.neutral}, Negative: ${sentimentCounts.negative}`,
        topics: Object.keys(categoryCount),
        raw_data: insightsData
      });
      
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!insights) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    
    // Title
    pdf.setFontSize(20);
    pdf.text('Feedback & Suggestions Report', pageWidth / 2, 20, { align: 'center' });
    
    // Date
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    
    let yPos = 50;
    
    // Summary
    pdf.setFontSize(16);
    pdf.text('Executive Summary', 20, yPos);
    yPos += 10;
    pdf.setFontSize(12);
    const summaryLines = pdf.splitTextToSize(insights.summary, pageWidth - 40);
    pdf.text(summaryLines, 20, yPos);
    yPos += summaryLines.length * 7 + 10;
    
    // Statistics
    pdf.setFontSize(16);
    pdf.text('Key Statistics', 20, yPos);
    yPos += 10;
    pdf.setFontSize(12);
    pdf.text(`Total Suggestions: ${insights.totalSuggestions || 0}`, 20, yPos);
    yPos += 7;
    pdf.text(`Total Feedback: ${insights.totalFeedback || 0}`, 20, yPos);
    yPos += 15;
    
    // Sentiment Analysis
    pdf.setFontSize(16);
    pdf.text('Sentiment Analysis', 20, yPos);
    yPos += 10;
    pdf.setFontSize(12);
    insights.sentiment.forEach(item => {
      pdf.text(`${item.name}: ${item.value}%`, 20, yPos);
      yPos += 7;
    });
    yPos += 10;
    
    // Themes
    if (insights.themes.length > 0) {
      pdf.setFontSize(16);
      pdf.text('Top Themes', 20, yPos);
      yPos += 10;
      pdf.setFontSize(12);
      insights.themes.forEach(theme => {
        pdf.text(`${theme.theme}: ${theme.count} mentions`, 20, yPos);
        yPos += 7;
      });
      yPos += 10;
    }
    
    // Recommendations
    pdf.setFontSize(16);
    pdf.text('Recommendations', 20, yPos);
    yPos += 10;
    pdf.setFontSize(12);
    insights.recommendations.forEach((rec, index) => {
      const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
      pdf.text(lines, 20, yPos);
      yPos += lines.length * 7;
    });
    
    pdf.save('feedback-report.pdf');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights Dashboard
            </div>
            {insights && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportToPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!insights ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Generate AI-powered insights from your submissions
              </p>
              <Button onClick={generateInsights} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Generate Insights'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6" id="insights-content">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{insights.summary}</p>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{insights.totalSuggestions || 0}</div>
                      <div className="text-sm text-muted-foreground">Suggestions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{insights.totalFeedback || 0}</div>
                      <div className="text-sm text-muted-foreground">Feedback</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Object.keys(insights.categorizedFeedback || {}).length}</div>
                      <div className="text-sm text-muted-foreground">Categories</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={insights.sentiment}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {insights.sentiment.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {insights.sentiment.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">
                          {item.name}: {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Categories */}
              {insights.themes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Feedback by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={insights.themes}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="theme" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Keywords */}
              {insights.keywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {insights.keywords.map((keyword) => (
                        <Badge key={keyword.word} variant="secondary">
                          {keyword.word} ({keyword.score})
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actionable Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {insights.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button onClick={generateInsights} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    'Refresh Analysis'
                  )}
                </Button>
                <Button variant="outline" onClick={exportToPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};