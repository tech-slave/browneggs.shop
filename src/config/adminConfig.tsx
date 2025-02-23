export const ADMIN_EMAILS = [
    'injamanilchowdary@gmail.com',
    'hemanthreddy72@gmail.com',
    // Add other admin emails here
  ];
  
  export const isAdminemails = (email: string | undefined) => {
    return email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false;
  };