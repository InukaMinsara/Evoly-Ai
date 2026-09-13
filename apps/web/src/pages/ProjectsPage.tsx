import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Clock, Cpu, Trash2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  board: string;
  updatedAt: string;
  fileCount: number;
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectBoard, setNewProjectBoard] = useState('arduino:avr:uno');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('evoly_projects');
    if (saved) {
      try { setProjects(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem('evoly_projects', JSON.stringify(newProjects));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: newProjectName.trim(),
      board: newProjectBoard,
      updatedAt: new Date().toISOString(),
      fileCount: 1
    };
    
    saveProjects([newProject, ...projects]);
    setIsModalOpen(false);
    setNewProjectName('');
    navigate(`/code?project=${newProject.id}`);
  };

  const handleDelete = (id: string) => {
    saveProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden">
      <div className="min-h-16 px-4 sm:px-6 py-3 sm:py-0 border-b border-surface-border flex items-center justify-between gap-3 bg-surface-card/50 flex-shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <FolderOpen className="w-5 h-5 text-evoly-500 flex-shrink-0" />
          <h1 className="text-base sm:text-lg font-semibold text-slate-200">Projects</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-evoly-600 hover:bg-evoly-500 rounded-lg text-xs sm:text-sm font-medium text-white shadow-lg shadow-evoly-900/20 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <FolderOpen className="w-16 h-16 text-slate-700 mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No projects yet</h2>
            <p className="text-slate-500 max-w-md mb-6">
              Create your first robotics project to start coding, simulating, and building with EVOLY AI.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-evoly-600/20 text-evoly-300 hover:bg-evoly-600/30 rounded-lg text-sm font-medium transition-colors"
            >
              Create New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {projects.map(project => (
              <div key={project.id} className="bg-surface-card border border-surface-border rounded-xl p-4 sm:p-5 group flex flex-col hover:border-evoly-600/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-slate-200 text-base sm:text-lg">{project.name}</h3>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(project.id); }}
                    className="text-slate-500 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Cpu className="w-4 h-4" />
                    <span className="font-mono text-xs">{project.board}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <Link
                    to={`/code?project=${project.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-evoly-600/10 hover:bg-evoly-600/20 text-evoly-400 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Open Lab <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md p-6 animate-fade-in shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">Create New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-evoly-500"
                    placeholder="e.g. Obstacle Avoidance Robot"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Target Board</label>
                  <select
                    value={newProjectBoard}
                    onChange={e => setNewProjectBoard(e.target.value)}
                    className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-evoly-500"
                  >
                    <option value="arduino:avr:uno">Arduino UNO</option>
                    <option value="arduino:avr:nano">Arduino Nano</option>
                    <option value="arduino:avr:mega2560">Arduino Mega 2560</option>
                    <option value="esp32:esp32:esp32">ESP32 Dev Module</option>
                    <option value="esp8266:esp8266:nodemcuv2">NodeMCU ESP8266</option>
                    <option value="rp2040:rp2040:rpipico">Raspberry Pi Pico</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="px-4 py-2 bg-evoly-600 hover:bg-evoly-500 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
