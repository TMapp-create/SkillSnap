# SkillSnap

A Strava-inspired skills report card platform for students that runs alongside their academic transcript. Track activities, earn XP, unlock badges, and showcase your non-academic achievements.

## Features

### 8 Core Components

1. **ActivityFeed** - Infinite-scroll timeline of logged activities
   - Card format with category icons, title, date, duration, XP earned
   - Photo uploads and proof links
   - Kudos system for peer recognition
   - Filter by category or date range

2. **LogActivityModal** - Floating modal for logging new activities
   - 8 skill categories: Music, STEM, Tools & Trades, Volunteer Work, Youth Mission, Driver's Ed, Occupational Ed, Athletics & Fitness
   - Auto-calculates XP based on category and duration
   - Photo and proof link uploads
   - Real-time XP estimation

3. **SkillsReportCard** - Visual dashboard with progress rings
   - 8 progress rings showing completion toward goals
   - Total XP, level, and streak counter
   - Export to PDF functionality
   - Beautiful animations

4. **CategoryDetail** - Deep-dive into each skill category
   - Sub-skills tree view
   - Badge gallery (earned/unlocked)
   - Category leaderboard
   - Personal stats tracking

5. **ProfileHeader** - Student profile showcase
   - Avatar, name, school, graduation year
   - Shareable link and QR code
   - Privacy toggle (public/private)
   - Level and streak display

6. **KudosSystem** - Social engagement features
   - Like/kudos on activities with animations
   - Weekly kudos leaderboard
   - Real-time updates

7. **GoalSetter** - Custom goal tracking
   - Set semester, year, or custom period goals
   - Visual progress tracking
   - Confetti animation on completion
   - Category-specific targets

8. **AdminVerificationPanel** - Teacher/coach dashboard
   - Approve/deny pending activities
   - Award official badges
   - Activity proof verification
   - Admin-only access

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PDF Export**: jsPDF + html2canvas
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great)

### Environment Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

The database schema is automatically created via Supabase migrations. It includes:

- User profiles with XP, levels, and streaks
- 8 pre-populated skill categories
- Activities with approval workflow
- Badge system with achievements
- Goals tracking
- Kudos (likes) system
- Sub-skills for each category

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage

### For Students

1. **Sign Up**: Create an account with your email
2. **Complete Profile**: Add your school and graduation year
3. **Log Activities**: Click the + button to log new activities
4. **Track Progress**: View your XP, level, and progress rings
5. **Set Goals**: Create custom goals for each category
6. **Earn Badges**: Unlock achievements as you progress
7. **Share**: Export your Skills Report Card as a PDF

### For Admins/Teachers

1. **Enable Admin Access**: Have your admin flag set in the database
2. **Access Admin Panel**: Click the shield icon in the header
3. **Review Activities**: Approve or deny pending student activities
4. **Award Badges**: Give official badges to deserving students

## XP System

XP is calculated based on:
- **Base XP**: 50 XP per hour
- **Category Multiplier**: Each category has a different multiplier
  - STEM: 1.2x
  - Tools & Trades: 1.1x
  - Occupational Ed: 1.1x
  - Others: 1.0x or 0.8-0.9x

**Level Formula**: Level = (Total XP / 1000) + 1

## Features in Detail

### Dark Mode
Toggle between light and dark themes using the moon/sun icon in the header.

### Progress Rings
Each category shows:
- Percentage complete toward 50-hour goal
- Total hours logged
- Total XP earned
- Visual progress ring with category color

### Leaderboards
- Global leaderboard on dashboard
- Category-specific leaderboards
- Ranking based on total XP earned

### Multi-User Support
- Public/private profile settings
- View other students' public profiles
- Kudos system for peer encouragement

## Folder Structure

```
src/
├── components/          # 8 core reusable components
│   ├── ActivityFeed.tsx
│   ├── AdminVerificationPanel.tsx
│   ├── CategoryDetail.tsx
│   ├── GoalSetter.tsx
│   ├── LogActivityModal.tsx
│   ├── ProfileHeader.tsx
│   └── SkillsReportCard.tsx
├── contexts/            # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/                 # Utilities
│   └── supabase.ts
├── pages/              # Route pages
│   ├── CategoryDetailPage.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── Signup.tsx
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx             # Main app with routing
└── main.tsx           # Entry point
```

## Security

- Row Level Security (RLS) enabled on all tables
- Private activities only visible to owner
- Admin actions restricted to admin users
- Secure authentication via Supabase Auth

## Future Enhancements

- Mobile app (React Native)
- Real-time notifications
- Activity comments
- Team/club features
- Integration with school systems
- AI-powered activity suggestions
- Blockchain-verified achievements

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

Built with Bolt.new
