# Enhanced Suggestion & Feedback System

A comprehensive web application for collecting user suggestions and feedback with AI-powered analytics, admin dashboard, and interactive quiz functionality.

## 🚀 Features

### User Features
- **Submission System**: Submit up to 3 suggestions and 3 feedback entries per user
- **Categorized Feedback**: Organized feedback categories (NYCOM Members, Food, Location, Sessions/trainings)
- **Interactive Quiz**: 15-question Value Proposition Quiz (admin-controlled visibility)
- **Mobile-First Design**: Responsive UI optimized for QR code access
- **Real-time Validation**: Live submission limit tracking and form validation

### Admin Features
- **Live Dashboard**: Real-time submissions feed with click-to-preview modals
- **QR Code Generator**: Direct link to submission page with copy/regenerate options
- **Statistics Overview**: Total suggestions, feedback, users, and daily activity
- **AI Analytics Panel**: 
  - Sentiment analysis with visual charts
  - Theme extraction by feedback categories
  - Keyword frequency analysis
  - Actionable insights and recommendations
  - PDF report export functionality
- **Quiz Management**: Toggle quiz visibility for users
- **Submission Management**: Mark submissions as reviewed

## 🏗️ System Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **Recharts** for data visualization
- **jsPDF** for report generation

### Backend Stack
- **Supabase** for backend services
- **PostgreSQL** database with Row Level Security (RLS)
- **Real-time subscriptions** for live updates
- **Edge Functions** for AI processing

### Key Components
```
src/
├── components/
│   ├── AdminDashboard.tsx          # Main admin interface
│   ├── SubmissionForm.tsx          # User submission interface
│   ├── AIInsightsPanel.tsx         # AI analytics and reports
│   ├── QuizSection.tsx             # Interactive quiz component
│   └── SubmissionDetailModal.tsx   # Preview modal for submissions
├── hooks/
│   ├── useSubmissionLimits.ts      # User limit tracking
│   └── useSessionId.ts             # Session management
└── integrations/supabase/
    ├── client.ts                   # Supabase client configuration
    └── types.ts                    # Database type definitions
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ with npm
- Supabase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd <project-name>
npm install
```

### 2. Supabase Configuration

This project uses Supabase for backend services. The connection is pre-configured with:
- **Project URL**: `https://mriequrpcemmdxcqiyki.supabase.co`
- **Anon Key**: Already configured in `src/integrations/supabase/client.ts`

> **Note**: Lovable projects don't use `.env` files. All configuration is handled directly in the codebase.

### 3. Database Setup

The database schema includes the following tables:

#### Core Tables
```sql
-- Users table for session tracking
users (
  id: UUID PRIMARY KEY,
  session_id: TEXT,
  email: TEXT,
  created_at: TIMESTAMP
)

-- Suggestions table
suggestions (
  id: UUID PRIMARY KEY,
  user_id: UUID,
  title: TEXT NOT NULL,
  content: TEXT NOT NULL,
  created_at: TIMESTAMP
)

-- Feedback table with categories
feedback (
  id: UUID PRIMARY KEY,
  user_id: UUID,
  content: TEXT NOT NULL,
  category: TEXT, -- 'NYCOM Members', 'Food', 'Location', 'Sessions/trainings'
  created_at: TIMESTAMP
)

-- AI-generated reports
reports (
  id: UUID PRIMARY KEY,
  summary: TEXT,
  sentiment: TEXT,
  topics: TEXT[],
  raw_data: JSONB,
  generated_at: TIMESTAMP
)

-- Quiz management
quiz_settings (
  id: UUID PRIMARY KEY,
  is_active: BOOLEAN DEFAULT false,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)

-- Quiz responses
quiz_responses (
  id: UUID PRIMARY KEY,
  user_id: UUID,
  answers: JSONB NOT NULL,
  score: INTEGER,
  completed_at: TIMESTAMP
)
```

#### Row Level Security (RLS) Policies
- **Public Read Access**: All tables allow public SELECT operations
- **User Creation**: Users can create their own records
- **Service Operations**: Admin operations handled via service role

### 4. Run the Application
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Usage Guide

### For Users (via `/submit`)
1. **Access**: Scan QR code or visit `/submit`
2. **Submit Suggestions**: Use the "Suggestions" tab (max 3 per user)
3. **Provide Feedback**: Use the "Feedback" tab with category selection (max 3 per user)
4. **Take Quiz**: Complete the Value Proposition Quiz when available
5. **Optional Email**: Provide contact information for follow-up

### For Admins (via `/admin`)
1. **Dashboard Overview**: View real-time statistics and activity
2. **Live Feed**: Monitor incoming submissions with click-to-preview
3. **QR Code**: Generate and share submission links
4. **AI Insights**: 
   - View sentiment analysis and trends
   - Export detailed PDF reports
   - Get actionable recommendations
5. **Quiz Control**: Toggle quiz visibility for users

## 🤖 AI Analytics Features

### Sentiment Analysis
- Automatic categorization of feedback as Positive/Neutral/Negative
- Visual pie charts and trend analysis
- Category-based sentiment breakdown

### Theme Extraction
- Identifies common topics and concerns
- Groups feedback by categories (NYCOM Members, Food, Location, Sessions/trainings)
- Frequency analysis of key themes

### Report Generation
- Comprehensive PDF reports with charts and insights
- Actionable recommendations based on user feedback
- Exportable summary data for stakeholders

## 🔧 API Endpoints

### Supabase Tables
- `GET /suggestions` - Retrieve all suggestions
- `POST /suggestions` - Create new suggestion
- `GET /feedback` - Retrieve all feedback
- `POST /feedback` - Create new feedback
- `GET /quiz_settings` - Get quiz configuration
- `PUT /quiz_settings` - Update quiz settings (admin)
- `POST /quiz_responses` - Submit quiz response

### Real-time Subscriptions
- Live updates for new submissions
- Quiz settings changes
- Report generation notifications

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **Session-based user tracking** (no authentication required)
- **Input validation** and sanitization
- **Rate limiting** via submission limits
- **Public read access** for transparency

## 🚀 Deployment

### Lovable Platform
1. Click "Publish" in the Lovable editor
2. Your app will be available at `https://yourproject.lovable.app`

### Custom Domain
1. Navigate to Project > Settings > Domains
2. Connect your custom domain
3. Requires paid Lovable plan

## 📊 Monitoring & Analytics

### Built-in Analytics
- User submission tracking
- Daily activity metrics
- Category-wise feedback analysis
- Quiz completion rates

### Database Monitoring
- Real-time submission feed
- User engagement metrics
- System performance tracking

## 🛠️ Development

### Code Structure
- **Component-based architecture** with reusable UI components
- **Custom hooks** for state management and API calls
- **TypeScript** for type safety
- **Tailwind CSS** with semantic design tokens

### Contributing
1. Follow the existing code structure
2. Use TypeScript for all new components
3. Implement proper error handling
4. Add appropriate loading states
5. Follow the design system guidelines

## 📝 License

This project is built with Lovable and follows their terms of service.

## 🔗 Useful Links

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Project URL](https://lovable.dev/projects/f8920afa-89b4-4a96-9e1b-69de681953a1)

---

For technical support or questions, refer to the [Lovable Discord community](https://discord.com/channels/1119885301872070706/1280461670979993613) or check the project documentation.