import { Code } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-gray-50 border-t border-gray-200 py-4 px-6 ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>© 2025 Sistema Escolar Objetivo</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Desenvolvido por</span>
          <div className="flex items-center space-x-1">
            <Code className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-700 hover:text-blue-800 transition-colors">
              Rafael L. Haddad
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;