 # Enhanced Suggestion & Feedback System

A comprehensive web application for collecting user suggestions and feedback with AI-powered analytics, admin dashboard, and interactive quiz functionality.
> ⚠️ **Note**: This project uses the **free plan of Supabase**. The database might be **paused due to inactivity**. If the app appears unresponsive for preview, you can [contact me](mailto:hello@ericlyndert.com).

---

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

---

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

---

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ with npm
- Supabase account

### 1. Clone and Install
```bash
git clone git@github.com:lyndertmanani/Suggestation-Box.git
cd Suggestation-Box
npm install
```

### 2. Supabase Configuration

This project uses Supabase for backend services. The connection is pre-configured with:
- **Project URL**: `https://mriequrpcemmdxcqiyki.supabase.co`
- **Anon Key**: Already configured in `src/integrations/supabase/client.ts`

> **Important**: Since we are using a **free-tier Supabase instance**, the database may be **paused during inactivity**. It may take a few seconds to resume when accessed.

---

## 📦 Database Schema

```sql
-- Users
users (
  id UUID PRIMARY KEY,
  session_id TEXT,
  email TEXT,
  created_at TIMESTAMP
)

-- Suggestions
suggestions (
  id UUID PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP
)

-- Feedback
feedback (
  id UUID PRIMARY KEY,
  user_id UUID,
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP
)

-- AI Reports
reports (
  id UUID PRIMARY KEY,
  summary TEXT,
  sentiment TEXT,
  topics TEXT[],
  raw_data JSONB,
  generated_at TIMESTAMP
)

-- Quiz Settings
quiz_settings (
  id UUID PRIMARY KEY,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Quiz Responses
quiz_responses (
  id UUID PRIMARY KEY,
  user_id UUID,
  answers JSONB NOT NULL,
  score INTEGER,
  completed_at TIMESTAMP
)
```

### Row Level Security (RLS) Policies
- Public read access on relevant tables
- Per-user creation permission
- Admin-level control for special operations

---

## 📱 Usage Guide

### Users
- Submit up to 3 suggestions and 3 categorized feedback items
- Take a value proposition quiz when enabled
- Provide optional email for follow-up

### Admins
- View and manage submissions in real-time
- Access AI analytics and export reports
- Toggle quiz visibility
- Use QR codes for access links

---

## 🧠 AI Features

- **Sentiment Analysis**: Auto-label feedback (Positive/Neutral/Negative)
- **Theme Extraction**: Detect top issues per category
- **Keyword Frequency**: Common words cloud
- **PDF Export**: Download reports for sharing

---

## 🧩 API Endpoints

- `GET/POST /suggestions`
- `GET/POST /feedback`
- `GET/PUT /quiz_settings`
- `POST /quiz_responses`

---

## 🛠 Development

### Codebase Overview
```
src/
├── components/
│   ├── AdminDashboard.tsx
│   ├── SubmissionForm.tsx
│   ├── AIInsightsPanel.tsx
│   ├── QuizSection.tsx
│   └── SubmissionDetailModal.tsx
├── hooks/
│   ├── useSubmissionLimits.ts
│   └── useSessionId.ts
└── integrations/supabase/
    ├── client.ts
    └── types.ts
```

---

## 📝 License

Open-source project maintained by [@lyndertmanani](https://github.com/lyndertmanani)