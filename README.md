# 🍽️ PlatePal

A modern, AI-powered restaurant finder that helps you discover restaurants matching your dietary preferences and location.

## ✨ Features

- **AI-Powered Recommendations**: Uses Google's Gemini AI to find restaurants based on your dietary preferences
- **Modern Design**: Professional pastel/neutral color palette with Google Fonts
- **Responsive Layout**: Mobile-first design that works on all devices
- **Smart Location**: GPS location detection with automatic zipcode filling
- **Dietary Preferences**: Auto-complete suggestions for common dietary restrictions
- **Professional UI**: Clean, modern interface with backdrop blur effects

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Inter + Playfair Display (Google Fonts)
- **AI**: Google Gemini API
- **Animations**: Framer Motion
- **Icons**: Heroicons (SVG)

## 🛠️ Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd platepal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Get a Gemini API key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

1. **Enter Dietary Preferences**: Type or select from common dietary restrictions (vegan, gluten-free, halal, etc.)
2. **Set Location**: Enter a zipcode or use the GPS location button
3. **Search**: Click the search button to find restaurants
4. **Explore**: View recommendations and open them in Google Maps

## 🎨 Design Features

- **Color Palette**: Professional pastel/neutral colors (violet, slate, stone)
- **Typography**: Inter for body text, Playfair Display for headings
- **Layout**: Centered content (50-70% width on larger screens)
- **Effects**: Backdrop blur, shadows, smooth animations
- **Icons**: Professional SVG icons throughout

## 🔧 API Endpoints

- `POST /api/platepal` - Main API endpoint for restaurant recommendations

## 📦 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── platepal/
│   │       └── route.ts          # Gemini API integration
│   ├── globals.css               # Global styles and font setup
│   ├── layout.tsx                # Root layout with fonts
│   └── page.tsx                  # Main application page
├── public/                       # Static assets
└── ...
```

## 🌟 Key Features

### Smart Location Detection
- GPS location with automatic zipcode filling
- Fallback to manual zipcode entry
- Reverse geocoding for better accuracy

### Dietary Preferences
- Auto-complete suggestions
- Quick selection buttons
- Active preference tags with remove functionality

### AI Integration
- Google Gemini 2.5 Flash model
- Structured JSON responses
- Error handling and logging

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interface

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `GEMINI_API_KEY` environment variable
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for restaurant recommendations
- Tailwind CSS for styling
- Framer Motion for animations
- Heroicons for SVG icons
- Google Fonts for typography

---

**PlatePal** - Find your perfect meal with AI-powered recommendations! 🍽️✨