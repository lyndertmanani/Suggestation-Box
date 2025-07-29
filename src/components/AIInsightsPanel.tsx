import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Suggestion, Feedback } from '@/types/database';
import { Brain, TrendingUp, MessageSquare, Target, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface AIInsightsPanelProps {
  suggestions: Suggestion[];
  feedback: Feedback[];
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  suggestions,
  feedback
}) => {
  const [analyzing, setAnalyzing] = useState(false);

  // Combine all content for analysis
  const allContent = useMemo(() => {
    return [
      ...suggestions.map(s => ({ text: `${s.title} ${s.content}`, type: 'suggestion' })),
      ...feedback.map(f => ({ text: f.content, type: 'feedback' }))
    ];
  }, [suggestions, feedback]);

  // Simple sentiment analysis
  const sentimentAnalysis = useMemo(() => {
    const results = { positive: 0, negative: 0, neutral: 0 };
    
    allContent.forEach(item => {
      const text = item.text.toLowerCase();
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'awesome', 'fantastic', 'perfect', 'wonderful'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'poor', 'disappointing', 'worst', 'horrible', 'useless'];
      
      const positiveCount = positiveWords.filter(word => text.includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.includes(word)).length;
      
      if (positiveCount > negativeCount) results.positive++;
      else if (negativeCount > positiveCount) results.negative++;
      else results.neutral++;
    });
    
    return [
      { name: 'Positive', value: results.positive, color: '#22c55e' },
      { name: 'Neutral', value: results.neutral, color: '#eab308' },
      { name: 'Negative', value: results.negative, color: '#ef4444' }
    ];
  }, [allContent]);

  // Extract keywords and themes
  const keywordAnalysis = useMemo(() => {
    const wordCounts: { [key: string]: number } = {};
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'a', 'an', 'this', 'that', 'these', 'those']);
    
    allContent.forEach(item => {
      const words = item.text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.has(word));
      
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });
    
    return Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word, count]) => ({ word, count }));
  }, [allContent]);

  // Generate actionable insights
  const actionableInsights = useMemo(() => {
    const insights = [];
    
    if (allContent.length === 0) {
      return ['No submissions yet. Encourage users to share their thoughts!'];
    }
    
    const totalSubmissions = allContent.length;
    const suggestionCount = suggestions.length;
    const feedbackCount = feedback.length;
    
    if (suggestionCount > feedbackCount * 2) {
      insights.push('Users are very engaged with suggestions. Consider creating a suggestion voting system.');
    }
    
    if (sentimentAnalysis[2].value > sentimentAnalysis[0].value) {
      insights.push('There are concerning negative sentiments. Review recent submissions for urgent issues.');
    } else if (sentimentAnalysis[0].value > totalSubmissions * 0.7) {
      insights.push('Overwhelmingly positive feedback! Consider highlighting success stories.');
    }
    
    if (keywordAnalysis.length > 0) {
      const topKeyword = keywordAnalysis[0];
      insights.push(`"${topKeyword.word}" appears frequently (${topKeyword.count} times). This seems to be a key concern.`);
    }
    
    if (totalSubmissions > 10) {
      insights.push('Great engagement! Consider implementing user authentication for better tracking.');
    }
    
    return insights.length > 0 ? insights : ['Keep monitoring submissions for emerging patterns.'];
  }, [allContent, suggestions, feedback, sentimentAnalysis, keywordAnalysis]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnalyzing(false);
  };

  if (allContent.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No data available for analysis</p>
              <p className="text-sm text-muted-foreground mt-2">
                AI insights will appear once users submit suggestions and feedback
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">AI-Powered Analytics</h3>
        </div>
        <Button 
          onClick={runAnalysis} 
          disabled={analyzing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      {/* Sentiment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentAnalysis}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {sentimentAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {sentimentAnalysis.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <Badge variant="secondary">{item.value}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyword Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            Top Keywords & Themes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={keywordAnalysis}>
                <XAxis dataKey="word" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Actionable Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Actionable Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actionableInsights.map((insight, index) => (
              <div key={index} className="p-3 bg-muted/20 rounded-lg border-l-4 border-orange-500">
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};