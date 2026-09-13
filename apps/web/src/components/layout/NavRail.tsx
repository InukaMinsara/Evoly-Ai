import { useState, useEffect } from 'react';
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
  Shield,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core AI',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'AI Assistant', icon: MessageSquare, path: '/ai' },
      { label: 'Media Studio', icon: Sparkles, path: '/media' },
      { label: 'Web Research', icon: Search, path: '/research' },
    ],
  },
  {
    title: 'Engineering Lab',
    items: [
      { label: 'Projects', icon: FolderOpen, path: '/projects' },
      { label: 'Code Lab', icon: Code2, path: '/code' },
      { label: 'Simulator', icon: Play, path: '/simulator' },
      { label: 'Wiring Lab', icon: Cable, path: '/wiring' },
      { label: 'Diagram Maker', icon: GitBranch, path: '/diagram' },
      { label: 'Components', icon: Cpu, path: '/components' },
      { label: 'Board Manager', icon: CircuitBoard, path: '/boards' },
      { label: 'Library Manager', icon: BookOpen, path: '/libraries' },
      { label: 'Hardware', icon: HardDrive, path: '/hardware' },
      { label: 'Serial Monitor', icon: Terminal, path: '/serial' },
      { label: 'AI Debugger', icon: Bug, path: '/debugger' },
      { label: 'BOM Parts', icon: List, path: '/bom' },
      { label: 'Learning', icon: GraduationCap, path: '/learning' },
      { label: 'Documentation', icon: FileText, path: '/docs' },
    ],
  },
  {
    title: 'Studios & Tools',
    items: [
      { label: 'YouTube Studio', icon: Youtube, path: '/youtube' },
      { label: 'Search Console', icon: Globe, path: '/search-console' },
      { label: 'GitHub', icon: Github, path: '/github' },
    ],
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Privacy Policy', icon: Shield, path: '/privacy' },
  { label: 'Terms of Service', icon: FileText, path: '/terms' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

interface NavRailProps {
  activePath?: string;
}

export function NavRail({ activePath }: NavRailProps) {
  const location = useLocation();
  const currentPath = activePath ?? location.pathname;

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('evoly_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('evoly_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* ── Mobile Top Header Bar (< md) ── */}
      <div className="md:hidden w-full h-14 bg-surface-card border-b border-surface-border flex items-center justify-between px-4 z-40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-evoly-500 to-evoly-700 flex items-center justify-center shadow-md shadow-evoly-600/20">
              <span className="text-[10px] font-bold text-white select-none">EV</span>
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">EvolyAI</span>
          </Link>
        </div>

        <Link
          to="/ai"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-evoly-600 text-white hover:bg-evoly-500 transition-colors shadow-sm shadow-evoly-600/30"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>AI Chat</span>
        </Link>
      </div>

      {/* ── Mobile Drawer Overlay (< md) ── */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <aside
            className="relative w-72 max-w-[85vw] h-full bg-surface-card border-r border-surface-border flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-200"
            aria-label="Mobile navigation drawer"
          >
            {/* Drawer Header */}
            <div className="h-14 px-4 border-b border-surface-border flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setIsMobileOpen(false)}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-evoly-500 to-evoly-700 flex items-center justify-center shadow-md shadow-evoly-600/20">
                  <span className="text-xs font-bold text-white select-none">EV</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-white tracking-tight block">EVOLY AI</span>
                  <span className="text-[10px] text-slate-500 block -mt-0.5">Robotics Engineering</span>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1">
                  <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {section.title}
                  </p>
                  {section.items.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs transition-colors',
                          active
                            ? 'bg-evoly-600/20 text-evoly-400 font-medium'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                        )}
                      >
                        <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-evoly-400' : 'text-slate-400')} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-surface-border bg-surface-card/60 space-y-1">
              {BOTTOM_ITEMS.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-xs transition-colors',
                      active
                        ? 'bg-evoly-600/20 text-evoly-400 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-evoly-400' : 'text-slate-400')} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* ── Desktop & Tablet Sidebar (>= md) ── */}
      <aside
        className={cn(
          'hidden md:flex h-screen bg-surface-card border-r border-surface-border flex-col flex-shrink-0 z-30 transition-all duration-200 ease-in-out select-none',
          isCollapsed ? 'w-16' : 'w-56 lg:w-60'
        )}
        aria-label="Main navigation"
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-surface-border flex items-center justify-between px-3.5 flex-shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 overflow-hidden group"
            title="EVOLY AI Dashboard"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-evoly-500 to-evoly-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-evoly-600/20 group-hover:from-evoly-400 group-hover:to-evoly-600 transition-all">
              <span className="text-[11px] font-bold text-white select-none">EV</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 transition-opacity duration-150">
                <span className="text-xs font-bold text-white tracking-tight truncate">EVOLY AI</span>
                <span className="text-[10px] text-slate-500 truncate -mt-0.5">Engineering Platform</span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-surface-hover transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 custom-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed ? (
                <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  {section.title}
                </p>
              ) : (
                <div className="w-6 h-px bg-surface-border mx-auto my-1.5" />
              )}

              {section.items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center rounded-lg transition-colors',
                      isCollapsed
                        ? 'justify-center w-10 h-10 mx-auto my-0.5'
                        : 'gap-3 px-2.5 py-2 w-full',
                      active
                        ? isCollapsed
                          ? 'bg-evoly-600 text-white shadow-md shadow-evoly-600/25'
                          : 'bg-evoly-600/15 text-evoly-400 font-medium border-l-2 border-evoly-500 rounded-l-none'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                    )}
                  >
                    <Icon className={cn('flex-shrink-0', isCollapsed ? 'w-[18px] h-[18px]' : 'w-4 h-4', active && !isCollapsed ? 'text-evoly-400' : '')} />

                    {!isCollapsed && (
                      <span className="text-xs truncate">{item.label}</span>
                    )}

                    {/* Collapsed Tooltip on Hover */}
                    {isCollapsed && (
                      <span className="absolute left-full ml-3 z-50 whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-medium bg-surface-card border border-surface-border text-white shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="p-2 border-t border-surface-border bg-surface-card/40 space-y-0.5 flex-shrink-0">
          {BOTTOM_ITEMS.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center rounded-lg transition-colors',
                  isCollapsed
                    ? 'justify-center w-10 h-9 mx-auto'
                    : 'gap-3 px-2.5 py-1.5 w-full',
                  active
                    ? isCollapsed
                      ? 'bg-evoly-600 text-white'
                      : 'bg-evoly-600/15 text-evoly-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                )}
              >
                <Icon className={cn('flex-shrink-0', isCollapsed ? 'w-4 h-4' : 'w-3.5 h-3.5')} />

                {!isCollapsed && (
                  <span className="text-xs truncate">{item.label}</span>
                )}

                {/* Tooltip */}
                {isCollapsed && (
                  <span className="absolute left-full ml-3 z-50 whitespace-nowrap px-2 py-1 rounded-md text-xs font-medium bg-surface-card border border-surface-border text-white shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Toggle Expand Button when Collapsed */}
          {isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="w-10 h-8 mx-auto flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-surface-hover transition-colors mt-1"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
