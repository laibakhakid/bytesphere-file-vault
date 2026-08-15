/**
 * Site Configuration File
 * Easily update brand names, contact email, and links here.
 */

export const siteConfig = {
  name: 'ByteSphere File Vault',
  shortName: 'ByteSphere',
  tagline: 'Simple, Private & Secure File Storage',
  description:
    'A safe place to store, protect, and share your important files. Every file is automatically locked with bank-grade encryption so only you and the people you share with can open them.',

  // Contact Information (Easily editable by you anytime)
  contact: {
    email: 'contact@byte-sphere.net',
    supportEmail: 'support@byte-sphere.net',
    phone: '+1 (800) 555-8285',
    address: 'San Francisco, CA',
  },

  // Social & Community Links
  social: {
    github: 'https://github.com/bytesphere-vault',
    twitter: 'https://twitter.com/bytesphere',
  },

  // Easy-to-understand features
  features: [
    {
      title: 'Automatic File Lock (AES-256)',
      desc: 'Your files are locked with the highest security standard before they are saved. Nobody else can read them.',
    },
    {
      title: 'Private & Isolated Keys',
      desc: 'Each file has its own unique digital key, keeping your documents completely private.',
    },
    {
      title: 'Easy & Fast Download',
      desc: 'Unlock and download your original files instantly on any computer, phone, or tablet.',
    },
    {
      title: 'Safe Sharing Links',
      desc: 'Send a link to anyone with an optional password. Set links to expire automatically after download.',
    },
    {
      title: 'Smart Document Summary',
      desc: 'Get an instant overview and privacy check of your documents automatically.',
    },
    {
      title: 'Activity & History Log',
      desc: 'Easily see when your files were uploaded, downloaded, or shared.',
    },
  ],

  // Header Navigation Links
  navLinks: [
    { label: 'Overview', href: '/#overview' },
    { label: 'How It Works', href: '/#features' },
    { label: 'Try File Lock', href: '/#demo' },
    { label: 'Contact', href: '/#contact' },
  ],
};
