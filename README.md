# 🚀 Portfolio — Tomás Fernández

Modern, responsive developer portfolio built with **Angular 21** and **SCSS**. Features a dark, premium UI with glassmorphism effects, smooth animations, and a fully interactive experience.

## ✨ Features

- **Hero Section** — Animated landing with mobile hamburger menu and fullscreen overlay
- **Projects Grid** — Responsive CSS Grid layout showcasing 5 projects with hover effects
- **Experience Timeline** — Vertical timeline with an interactive terminal that displays `skills.json` on hover/click
- **Contact Form** — Reactive form with validation and **EmailJS** integration for sending emails
- **Fully Responsive** — Optimized for desktop, tablet, and mobile

## 🛠️ Tech Stack

| Category  | Technology                           |
| --------- | ------------------------------------ |
| Framework | Angular 21 (Standalone Components)   |
| Language  | TypeScript                           |
| Styling   | SCSS + CSS Variables                 |
| State     | Angular Signals                      |
| Forms     | Reactive Forms + Validators          |
| Email     | EmailJS                              |
| Env Vars  | @ngx-env/builder (`import.meta.env`) |
| Build     | Angular CLI + Vite                   |

## 📦 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone https://github.com/TomasFernandez123/Portfolio-modern.git
cd Portfolio-modern
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NG_APP_EMAILJS_PUBLIC_KEY=your_public_key
NG_APP_EMAILJS_SERVICE_ID=your_service_id
NG_APP_EMAILJS_TEMPLATE_ID=your_template_id
```

### Development

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200).

### Production Build

```bash
npm run build
```

## 📁 Project Structure

```
src/app/
├── components/
│   ├── hero/          # Landing section + mobile nav
│   ├── projects/      # Projects grid
│   ├── experience/    # Timeline + interactive terminal
│   └── contact/       # Contact form + social links
├── app.ts             # Root component
├── app.html           # Main template
└── app.config.ts      # App configuration
```

## 📄 License

MIT
