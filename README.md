# Brown Eggs Shop

Welcome to the [browneggs.shop](https://browneggs.shop) application. This project is a modern, responsive web application for an online store that sells premium brown eggs. The application is built using the latest web technologies and provides a seamless user experience.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Building the Project](#building-the-project)
- [Running the Project](#running-the-project)
- [Deploying the Project](#deploying-the-project)
- [License](#license)

## Features

- **Responsive Design**: The application is fully responsive and works on all devices.
- **Dark Mode**: Supports dark mode for better user experience in low-light environments.
- **Animations**: Smooth animations and transitions for a modern look and feel.
- **Contact Form**: Users can contact the store via a contact form integrated with EmailJS.
- **Product Listings**: Display of various products with detailed descriptions and prices.
- **Customer Reviews**: Section for customer reviews to build trust and credibility.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Linting**: ESLint
- **Deployment**: GitHub Pages
- **Email Service**: EmailJS

## Getting Started

To get a local copy up and running, follow these steps:

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/browneggs.shop.git
   cd browneggs.shop
   ```
2. Install the dependencies::
   ```sh
   npm install
   ```

## Building the Project

To build the project, run the following command:
```sh
npm run build
```
This will create a `dist` directory with the production build of the application.

## Running the Project

To run the project locally, use the following command:
```sh
npm run dev
```
This will start a development server, and you can view the application by navigating to [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying the Project

The project is configured to be deployed on GitHub Pages and tunelled to our custom domain. To deploy the project, follow these steps:

1. Build the project:
   ```sh
   npm run build
   ```
2. Deploy to GitHub Pages:
   ```sh
   npm run deploy
   ```
This will build the project and deploy the contents of the `dist` directory to the `gh-pages` branch of your repository.

## License

## License

This project is licensed under the MIT License. See the LICENSE file for details.

Made with ❤️ by [browneggs.shop](https://browneggs.shop)


## Supabase Free Tier Limits

| Feature              | Limit |
|----------------------|-------------------------------|
| **Projects**        | Up to **2 free projects** per organization |
| **Database**        | **500 MB** storage (read-only mode if exceeded) |
| **Backups**         | Not included in the free tier |
| **File Storage**    | **1 GB** total, **50 MB** per file max |
| **Data Transfer**   | **2 GB** per month |
| **Authentication**  | Up to **50,000** Monthly Active Users (MAUs) |
| **OAuth Providers** | Included |
| **Multi-Factor Authentication (MFA)** | Not included |
| **Edge Functions**  | **500,000** invocations per month |
| **Realtime Features** | **2 million** messages per month, **200** peak connections |
| **Log Retention**   | **1 day** |
| **Project Inactivity** | Paused after **1 week** of inactivity |

💡 *Monitor usage in the Supabase Dashboard to avoid disruptions. Upgrade to a Pro plan if needed.*  


