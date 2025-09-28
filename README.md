# Sports Venue Booking App

A modern, production-ready sports venue booking web application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Frontend
- **Modern Design**: Responsive design with glassmorphism effects and smooth animations
- **Animated Carousel**: Hero section with sports venue images (tennis, basketball, cricket)
- **Mobile-First**: Optimized for all device sizes
- **Real-time Updates**: Live booking availability using Supabase real-time subscriptions

### Authentication
- **Supabase Auth**: Email/password and Google OAuth integration
- **Role-based Access**: User and Admin roles with appropriate permissions
- **Password Reset**: Secure password recovery functionality

### Court Management
- **Multiple Sports**: Tennis, Basketball, Cricket, Badminton, Football courts
- **Dynamic Pricing**: Peak/off-peak hours with flexible duration options (1h, 1.5h, 2h)
- **Rich Media**: Court images, amenities, and detailed descriptions
- **Availability Calendar**: Real-time booking calendar with conflict prevention

### Booking System
- **Interactive Calendar**: Easy date and time selection
- **Real-time Availability**: Live updates to prevent double bookings
- **Booking Flow**: Streamlined process from selection to confirmation
- **Email Notifications**: Automated confirmations via Supabase Edge Functions

### User Dashboard
- **My Bookings**: View upcoming, past, and cancelled bookings
- **Filters & Search**: Easy booking management with filtering options
- **Cancel/Reschedule**: Flexible booking modifications
- **Profile Management**: Update personal information and preferences

### Admin Panel
- **Analytics Dashboard**: Booking statistics and revenue charts
- **Booking Management**: View, approve, cancel, and manage all bookings
- **Court Management**: CRUD operations for courts with image uploads
- **User Management**: Admin tools for user oversight and reports

### Additional Features
- **Contact System**: Contact form with Google Maps integration
- **Email Integration**: Automated responses and admin notifications
- **Payment Ready**: Placeholder for payment integration
- **SEO Optimized**: Meta tags and structured data

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Real-time**: Supabase subscriptions
- **Email**: Supabase Edge Functions + SendGrid/Resend
- **Deployment**: Vercel/Netlify ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sports-venue-booking-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SENDGRID_API_KEY=your_sendgrid_api_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Enable Google OAuth in Supabase Auth settings

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses the following main tables:

- **users**: User profiles with role-based access
- **courts**: Sports venue information with images and amenities
- **pricing_rules**: Dynamic pricing based on time and duration
- **bookings**: Booking records with conflict prevention
- **contact_messages**: Contact form submissions
- **blocked_slots**: Maintenance and blocked time slots

## 🔐 Authentication Setup

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs in Supabase Auth settings

### Supabase Auth Configuration
1. Enable Google provider in Supabase Auth
2. Add Google Client ID and Secret
3. Configure redirect URLs
4. Set up email templates

## 📧 Email Configuration

### Using SendGrid
1. Create SendGrid account
2. Generate API key
3. Set up email templates
4. Configure Supabase Edge Functions

### Using Resend (Alternative)
1. Create Resend account
2. Generate API key
3. Set up email templates

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify Deployment
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when implemented)
npm test
```

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🔒 Security Features

- Row Level Security (RLS) policies
- Input validation and sanitization
- CSRF protection
- Secure authentication flows
- Environment variable protection

## 🎨 Design System

- **Colors**: Blue and green gradient theme
- **Typography**: Inter font family
- **Components**: Reusable UI components
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React icon library

## 📈 Performance Optimization

- Next.js 14 App Router for optimal performance
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Efficient database queries with proper indexing
- Real-time subscriptions for live updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: info@sportvenue.com
- Documentation: [Project Wiki](link-to-wiki)

## 🔄 Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Tournament management
- [ ] Equipment rental system
