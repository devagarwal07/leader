import { GraduationCap } from 'lucide-react';

export const AppLogo = ({ className }: { className?: string }) => (
  <GraduationCap className={`h-8 w-8 text-primary ${className || ''}`} />
);
