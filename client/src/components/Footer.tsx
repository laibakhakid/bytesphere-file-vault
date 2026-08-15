import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { Shield, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="border-t border-[#E5E7EB] bg-[#FAF8F5] text-[#4B5563] text-sm font-serif py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Small Tagline */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#F5C6EC] p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#FAF8F5] rounded-[10px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#7C3AED]" />
            </div>
          </div>
          <span className="font-bold text-base text-[#1E1B4B]">
            {siteConfig.name}
          </span>
        </div>

        {/* Small Contact Email & Support */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1.5 text-[#374151]">
            <Mail className="w-4 h-4 text-[#7C3AED]" />
            <span>Contact:</span>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-[#7C3AED] font-semibold hover:underline"
            >
              {siteConfig.contact.email}
            </a>
          </div>
        </div>

        {/* Minimal Copyright */}
        <div className="text-xs text-[#6B7280]">
          © {new Date().getFullYear()} {siteConfig.shortName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
