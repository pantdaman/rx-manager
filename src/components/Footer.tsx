import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-gray-900 mb-2">PrescriptAI</h3>
            <p className="text-sm text-gray-600">
              Your AI Powered Prescrition Companion
            </p>
          </div>

          {/* Legal Links */}
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Legal</h3>
            <div className="flex flex-col space-y-1">
              <Link href="/privacy-policy" className="text-sm text-gray-900 hover:text-blue-600">
                Privacy Policy
              </Link>
              <Link href="/ai-disclaimer" className="text-sm text-gray-900 hover:text-blue-600">
                AI Disclaimer
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right">
            <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
            <a href="mailto:contact.prescriptai@gmail.com" className="text-sm text-gray-900 hover:text-blue-600">
             contact.prescriptai@gmail.com
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-center text-gray-600">
            © {new Date().getFullYear()} PrescriptAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 