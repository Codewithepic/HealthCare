import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const DatabaseCheckButton = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to="/debug/database" className="fixed bottom-4 right-4 z-50">
          <Button className="flex items-center gap-2 shadow-lg" variant="default">
            <Database className="h-4 w-4" />
            Check Database
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p className="text-sm">Diagnose database connection issues and setup database tables</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default DatabaseCheckButton;
