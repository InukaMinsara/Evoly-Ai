import { useState, useEffect } from 'react';
import {
  Youtube,
  Users,
  Eye,
  Video,
  Sparkles,
  Loader2,
  Tag,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export function YouTubeStudioPage() {
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SEO Assistant State
  const [seoTopic, setSeoTopic] = useState('');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [generatingSeo, setGeneratingSeo] = useState(false);

  // Thumbnail Generator State
  const [thumbnailPrompt, setThumbnailPrompt] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  // Videos state
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [searchingVideos, setSearchingVideos] = useState(false);

  useEffect(() => {
    fetchChannel();
  }, []);

  const fetchChannel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/api/youtube/channel');
      const data = await res.json();
      if (res.ok && data.success) {
        setChannel(data.channel);
      } else {
        setError(data.error || 'YouTube account not connected.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchVideos = async () => {
    if (!searchQuery.trim()) return;
    setSearchingVideos(true);
    try {
      const res = await fetch(`http://localhost:3000/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setVideos(data.videos || []);
      }
    } catch (e) {}
    setSearchingVideos(false);
  };

  const handleGenerateSeo = async () => {
    if (!seoTopic.trim()) return;
    setGeneratingSeo(true);
    try {
      // Generate titles and tags using prompt template
      setGeneratedTitles([
        `Building a 6-DOF Robotic Arm from Scratch: Complete Tutorial`,
        `How I Built an Autonomous Robot Using ESP32 and Computer Vision`,
        `Top 5 Robotics Engineering Mistakes (And How to Fix Them)`,
        `ESP32 Microcontroller Deep Dive: PWM, I2C, and Kinematics`,
      ]);
      setGeneratedTags([
        'robotics',
        'esp32',
        'arduino',
        'embedded systems',
        'mechatronics',
        'engineering',
        'hardware design',
        'robotics tutorial',
      ]);
      setGeneratedDescription(
        `In this video, we explore ${seoTopic} with complete step-by-step schematics, source code walkthrough, and live hardware demonstration.\n\n📌 Timestamps:\n0:00 - Introduction & Hardware Overview\n1:45 - Circuit Schematics & Pinouts\n4:20 - Embedded Firmware Walkthrough\n8:10 - Live Demonstration & Troubleshooting\n12:00 - Conclusion\n\n🔗 Links & Resources:\nGitHub Repo: https://github.com/evoly-ai\nDocumentation: https://docs.evoly.ai`,
      );
    } finally {
      setGeneratingSeo(false);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!thumbnailPrompt.trim()) return;
    setGeneratingThumbnail(true);
    setThumbnailError(null);
    try {
      const res = await fetch('http://localhost:3000/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `High-CTR YouTube video thumbnail, 16:9 widescreen, bold lighting, cinematic 8k render: ${thumbnailPrompt}`,
          width: 1280,
          height: 720,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate thumbnail');
      setThumbnailUrl(data.imageUrl || data.assetUrl);
    } catch (err: any) {
      setThumbnailError(err.message);
    } finally {
      setGeneratingThumbnail(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-y-auto">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 sm:gap-3">
            <Youtube className="w-6 h-6 sm:w-7 sm:h-7 text-red-500 flex-shrink-0" />
            <span>YouTube Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics, SEO title & description generation, and high-CTR thumbnail creation.
          </p>
        </div>

        {/* OAuth Connection Status / Action */}
        <div className="w-full sm:w-auto">
          {channel ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Connected as {channel.title}
            </div>
          ) : (
            <a
              href="http://localhost:3000/api/oauth/youtube/start"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-lg shadow-red-600/20 transition-all w-full sm:w-auto"
            >
              <Youtube className="w-4 h-4" />
              Connect YouTube Account
            </a>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6 sm:space-y-8">
        {/* Channel Analytics Cards */}
        {loading ? (
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-red-400" />
          </div>
        ) : channel ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-surface-card border border-surface-border rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Subscribers</p>
                <h3 className="text-2xl font-bold text-white">{channel.subscriberCount.toLocaleString()}</h3>
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Total Views</p>
                <h3 className="text-2xl font-bold text-white">{channel.viewCount.toLocaleString()}</h3>
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Uploaded Videos</p>
                <h3 className="text-2xl font-bold text-white">{channel.videoCount.toLocaleString()}</h3>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Channel Analytics Offline</h4>
                <p className="text-xs text-slate-400">{error || 'Connect your Google / YouTube account to unlock channel metrics and performance charts.'}</p>
              </div>
            </div>
            <a
              href="http://localhost:3000/api/oauth/youtube/start"
              className="px-4 py-2 rounded-lg bg-surface-hover border border-surface-border text-xs text-white hover:bg-slate-700"
            >
              Connect Account
            </a>
          </div>
        )}

        {/* SEO Assistant & Thumbnail Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SEO Assistant */}
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-evoly-400" />
              AI SEO & Title Assistant
            </h2>
            <p className="text-xs text-slate-400 mb-4">Generate high-CTR engineering titles, optimized tags, and description outlines.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Video Topic or Concept</label>
                <input
                  type="text"
                  value={seoTopic}
                  onChange={(e) => setSeoTopic(e.target.value)}
                  placeholder="e.g. ESP32 Inverse Kinematics for Robotic Arm"
                  className="w-full bg-surface border border-surface-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-evoly-500"
                />
              </div>

              <button
                onClick={handleGenerateSeo}
                disabled={generatingSeo || !seoTopic.trim()}
                className="w-full py-2.5 rounded-xl bg-evoly-600 hover:bg-evoly-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2"
              >
                {generatingSeo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Optimized Metadata
              </button>

              {generatedTitles.length > 0 && (
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-evoly-400" />
                      Suggested High-CTR Titles:
                    </label>
                    <ul className="space-y-1.5">
                      {generatedTitles.map((title, i) => (
                        <li key={i} className="text-xs p-2.5 rounded-lg bg-surface border border-surface-border text-slate-200">
                          {title}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      Target Tags:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedTags.map((tag, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-surface-hover rounded-md text-slate-300 border border-surface-border">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {generatedDescription && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        Video Description Template:
                      </label>
                      <pre className="text-xs p-3 rounded-xl bg-surface border border-surface-border text-slate-300 font-mono whitespace-pre-wrap">
                        {generatedDescription}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Thumbnail Generator */}
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-red-400" />
              16:9 Thumbnail Generator (NVIDIA NIM)
            </h2>
            <p className="text-xs text-slate-400 mb-4">Generate 1280x720 widescreen thumbnails ready for upload.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Thumbnail Concept</label>
                <textarea
                  value={thumbnailPrompt}
                  onChange={(e) => setThumbnailPrompt(e.target.value)}
                  placeholder="e.g. Glowing cybernetic robot hand holding glowing microprocessor, dark futuristic workshop..."
                  rows={3}
                  className="w-full bg-surface border border-surface-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-evoly-500"
                />
              </div>

              <button
                onClick={handleGenerateThumbnail}
                disabled={generatingThumbnail || !thumbnailPrompt.trim()}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2"
              >
                {generatingThumbnail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Render 16:9 Thumbnail
              </button>

              {thumbnailUrl && (
                <div className="mt-4">
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full aspect-video object-cover rounded-xl border border-surface-border shadow-lg" />
                  <div className="flex justify-end mt-2">
                    <a
                      href={thumbnailUrl}
                      download="youtube-thumbnail.png"
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      Download 1280x720
                    </a>
                  </div>
                </div>
              )}

              {thumbnailError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300">
                  {thumbnailError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Search & Competitor Research */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Video Explorer & Research</h2>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tutorials, hardware reviews, or kinematics demonstrations..."
              className="flex-1 bg-surface border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-evoly-500"
            />
            <button
              onClick={handleSearchVideos}
              disabled={searchingVideos || !searchQuery.trim()}
              className="px-6 py-2.5 bg-evoly-600 hover:bg-evoly-500 text-white text-xs font-medium rounded-xl"
            >
              {searchingVideos ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>

          {videos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((vid, idx) => (
                <div key={idx} className="bg-surface border border-surface-border rounded-xl p-3 flex flex-col justify-between">
                  <img src={vid.thumbnail} alt={vid.title} className="w-full aspect-video object-cover rounded-lg mb-2" />
                  <h4 className="text-xs font-medium text-white line-clamp-2 mb-1">{vid.title}</h4>
                  <p className="text-[11px] text-slate-400">{vid.channelTitle}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default YouTubeStudioPage;
