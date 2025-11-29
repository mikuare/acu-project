import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 ${className}`}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon className="h-3 w-3 sm:h-5 sm:w-5" />
      ) : (
        <Sun className="h-3 w-3 sm:h-5 sm:w-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;

