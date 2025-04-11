
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-cream text-gray mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-lg font-semibold text-terracotta">Relax Hotel Group</h2>
            <p className="mt-1 text-sm">Virtual Conference Records Management</p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-sm">
            <Link to="/" className="hover:text-terracotta text-center md:text-left">
              Home
            </Link>
            <Link to="/about" className="hover:text-terracotta text-center md:text-left">
              About
            </Link>
            <Link to="/contact" className="hover:text-terracotta text-center md:text-left">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-center">
          <p>&copy; {currentYear} Relax Hotel Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
