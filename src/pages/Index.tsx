import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { QrCode, BarChart3, MessageCircle, Lightbulb } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Suggestion & Feedback System
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time submission tracking with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-6 w-6 text-blue-500" />
                User Submission Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Mobile-optimized form for users to submit suggestions and feedback with built-in submission limits.
              </p>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Max 2 suggestions per user</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">1 feedback per user</span>
                </div>
              </div>
              <Link to="/submit">
                <Button className="w-full">
                  Go to Submission Form
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-purple-500" />
                Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Real-time monitoring dashboard with QR code access and AI-powered analytics.
              </p>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-green-500" />
                  <span className="text-sm">QR code for easy access</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">AI-powered insights</span>
                </div>
              </div>
              <Link to="/admin">
                <Button variant="secondary" className="w-full">
                  View Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-semibold">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold">QR Code Access</h4>
                  <p className="text-muted-foreground">Easy mobile access via QR code scanning</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold">Real-time Updates</h4>
                  <p className="text-muted-foreground">Live dashboard with instant submission tracking</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold">Smart Limits</h4>
                  <p className="text-muted-foreground">Automatic submission limits per user</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
