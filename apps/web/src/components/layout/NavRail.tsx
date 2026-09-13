import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  FolderOpen,
  Code2,
  Play,
  Cable,
  GitBranch,
  Cpu,
  CircuitBoard,
  BookOpen,
  HardDrive,
  Terminal,
  Bug,
  List,
  GraduationCap,
  FileText,
  Settings,
  Sparkles,
  Search,
  Youtube,
  Globe,
  Github,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',        icon: LayoutDashboard, path: '/' },
  { label: 'AI Assistant',     icon: MessageSquare,   path: '/ai' },
  { label: 'Media Studio',     icon: Sparkles,        path: '/media' },
  { label: 'Web Research',     icon: Search,          path: '/research' },
  { label: 'YouTube Studio',   icon: Youtube,         path: '/youtube' },
  { label: 'Search Console',   icon: Globe,           path: '/search-console' },
  { label: 'GitHub',           icon: Github,          path: '/github' },
  { label: 'Projects',         icon: FolderOpen,      path: '/projects' },
  { label: 'Code Lab',         icon: Code2,           path: '/code' },
  { label: 'Simulator',        icon: Play,            path: '/simulator' },
  { label: 'Wiring Lab',       icon: Cable,           path: '/wiring' },
  { label: 'Diagram Maker',    icon: GitBranch,       path: '/diagram' },
  { label: 'Components',       icon: Cpu,             path: '/components' },
  { label: 'Board Manager',    icon: CircuitBoard,    path: '/boards' },
  { label: 'Library Manager',  icon: BookOpen,        path: '/libraries' },
  { label: 'Hardware',         icon: HardDrive,       path: '/hardware' },
  { label: 'Serial Monitor',   icon: Terminal,        path: '/serial' },
  { label: 'AI Debugger',      icon: Bug,             path: '/debugger' },
  { label: 'BOM',              icon: List,            path: '/bom' },
  { label: 'Learning',         icon: GraduationCap,   path: '/learning' },
  { label: 'Documentation',    icon: FileText,        path: '/docs' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Settings', icon: Settings, path: '/settings' },
];

interface NavRailProps {
  activePath?: string;
}

export function NavRail({ activePath }: NavRailProps) {
  const location = useLocation();
  const currentPath = activePath ?? location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const NavButton = ({ item }: { item: NavItem }) => {
    const active = isActive(item.path);
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        title={item.label}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150',
          active
            ? 'bg-evoly-600 text-white shadow-lg shadow-evoly-600/25'
            : 'text-slate-500 hover:text-slate-200 hover:bg-surface-hover',
        )}
      >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" />

        {/* Tooltip */}
        <span
          className={cn(
            'absolute left-full ml-3 z-50 whitespace-nowrap',
            'px-2.5 py-1.5 rounded-lg text-xs font-medium',
            'bg-surface-card border border-surface-border text-white shadow-xl',
            'opacity-0 pointer-events-none translate-x-0',
            'group-hover:opacity-100 group-hover:translate-x-0',
            'transition-opacity duration-150',
          )}
        >
          {item.label}
          {/* Arrow */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-surface-border" />
        </span>
      </Link>
    );
  };

  return (
    <nav
      className="w-16 h-screen bg-surface-card border-r border-surface-border flex flex-col items-center py-3 gap-1 flex-shrink-0 z-30"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link
        to="/"
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-evoly-500 to-evoly-700 flex items-center justify-center mb-3 flex-shrink-0 hover:from-evoly-400 hover:to-evoly-600 transition-all shadow-lg shadow-evoly-600/20"
        aria-label="EVOLY AI — Home"
        title="EVOLY AI"
      >
        <span className="text-[11px] font-bold text-white tracking-tight select-none">EV</span>
      </Link>

      {/* Divider */}
      <div className="w-8 h-px bg-surface-border mb-2 flex-shrink-0" />

      {/* Main nav items — scrollable */}
      <div className="flex-1 flex flex-col items-center gap-1 overflow-y-auto w-full px-3 custom-scrollbar">
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.path} item={item} />
        ))}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-surface-border mt-2 mb-2 flex-shrink-0" />

      {/* Bottom items */}
      <div className="flex flex-col items-center gap-1 px-3 flex-shrink-0">
        {BOTTOM_ITEMS.map((item) => (
          <NavButton key={item.path} item={item} />
        ))}
      </div>
    </nav>
  );
}
