import { Construction, Code2, Play, Cable, GitBranch, List, GraduationCap, FileText } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Code2, Play, Cable, GitBranch, List, GraduationCap, FileText, Construction,
};

interface ComingSoonPageProps {
  title: string;
  description?: string;
  icon?: string;
}

export default function ComingSoonPage({ title, description, icon }: ComingSoonPageProps) {
  const Icon = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : Construction;

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full w-full bg-surface min-h-0 p-8">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center shadow-inner">
          <Icon className="w-10 h-10 text-evoly-500/70" />
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            {description ?? 'This module is being built. Check back soon.'}
          </p>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-950/40 border border-amber-700/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-amber-400 font-medium">Under Construction</span>
        </div>
      </div>
    </div>
  );
}
