import { useState } from 'react';
import {
  Image as ImageIcon,
  Video,
  Mic,
  Volume2,
  Sparkles,
  Loader2,
  Download,
  Upload,
  Play,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function MediaStudioPage() {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'voice'>('image');

  // ─── Image State ──────────────────────────────────────────────────
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageModel, setImageModel] = useState('qwen-image');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState<any>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [sourceImageBase64, setSourceImageBase64] = useState<string | null>(null);

  // ─── Video State ──────────────────────────────────────────────────
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoProvider, setVideoProvider] = useState<'kaggle' | 'nvidia'>('kaggle');
  const [videoDuration, setVideoDuration] = useState(4);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<any>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // ─── Voice State ──────────────────────────────────────────────────
  const [ttsText, setTtsText] = useState('');
  const [ttsProvider, setTtsProvider] = useState('elevenlabs');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const [sttFile, setSttFile] = useState<File | null>(null);
  const [sttLoading, setSttLoading] = useState(false);
  const [sttTranscript, setSttTranscript] = useState<string | null>(null);
  const [sttError, setSttError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ─── Actions ──────────────────────────────────────────────────────
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setImageError(null);

    try {
      if (isEditMode && sourceImageBase64) {
        const res = await fetch('/api/ai/image/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: imagePrompt,
            image: sourceImageBase64,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || 'Edit failed');
        setImageResult(data.data ?? data);
      } else {
        const res = await fetch('/api/ai/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: imagePrompt,
            model: imageModel,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || 'Generation failed');
        setImageResult(data.data ?? data);
      }
    } catch (err: any) {
      setImageError(err.message);
    } finally {
      setImageLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setVideoLoading(true);
    setVideoError(null);

    try {
      const payload = {
        prompt: videoPrompt,
        provider: videoProvider,
        durationSeconds: videoDuration,
      };

      let res: Response;
      try {
        res = await fetch('/api/media/video/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok && res.status === 404) throw new Error('404');
      } catch {
        try {
          res = await fetch('http://localhost:3000/api/media/video/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {
          res = await fetch('http://127.0.0.1:3000/api/media/video/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
      }

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Video generation failed');
      setVideoResult(data);
    } catch (err: any) {
      setVideoError(err.message);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleSynthesizeSpeech = async () => {
    if (!ttsText.trim()) return;
    setTtsLoading(true);
    setTtsError(null);

    try {
      const res = await fetch('http://localhost:3000/api/media/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText,
          provider: ttsProvider,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'TTS synthesis failed');
      setTtsAudioUrl(data.audioUrl);
    } catch (err: any) {
      setTtsError(err.message);
    } finally {
      setTtsLoading(false);
    }
  };

  const handleTranscribeAudio = async () => {
    if (!sttFile) return;
    setSttLoading(true);
    setSttError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const res = await fetch('http://localhost:3000/api/media/voice/stt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64,
              mimeType: sttFile.type || 'audio/wav',
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || 'Transcription failed');
          setSttTranscript(data.transcript);
        } catch (e: any) {
          setSttError(e.message);
        } finally {
          setSttLoading(false);
        }
      };
      reader.readAsDataURL(sttFile);
    } catch (err: any) {
      setSttError(err.message);
      setSttLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-y-auto">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 sm:gap-3">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-evoly-400" />
            Media Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Production-grade generative AI for robotics concepts, animations, and voice synthesis.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-surface-card border border-surface-border rounded-xl p-1 gap-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('image')}
            className={cn(
              'flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-initial',
              activeTab === 'image'
                ? 'bg-evoly-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-surface-hover',
            )}
          >
            <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Image Studio
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={cn(
              'flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-initial',
              activeTab === 'video'
                ? 'bg-evoly-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-surface-hover',
            )}
          >
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Video Studio
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={cn(
              'flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-initial',
              activeTab === 'voice'
                ? 'bg-evoly-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-surface-hover',
            )}
          >
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Voice Studio
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
        {/* ─── TAB 1: IMAGE STUDIO ─────────────────────────────────── */}
        {activeTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white">Visual Synthesis (NVIDIA NIM)</h2>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-md font-medium border transition-colors',
                      isEditMode
                        ? 'border-evoly-500 bg-evoly-500/20 text-evoly-300'
                        : 'border-surface-border text-slate-400 hover:text-white',
                    )}
                  >
                    {isEditMode ? 'Edit Mode Active' : 'Switch to Image Edit'}
                  </button>
                </div>

                {isEditMode && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-400 mb-2">Upload Source Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setSourceImageBase64(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-hover file:text-white hover:file:bg-slate-700"
                    />
                    {sourceImageBase64 && (
                      <img src={sourceImageBase64} alt="Source" className="mt-3 w-28 h-28 object-cover rounded-lg border border-surface-border" />
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Prompt</label>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder={isEditMode ? 'Specify changes to the source image...' : 'Describe robotics concept, robotic arm, PCB 3D render...'}
                      rows={4}
                      className="w-full bg-surface border border-surface-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-evoly-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Model</label>
                    <select
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value)}
                      className="w-full bg-surface border border-surface-border rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-evoly-500"
                    >
                      <option value="qwen-image">qwen-image (NVIDIA NIM Default)</option>
                      <option value="stable-diffusion-xl">stable-diffusion-xl</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateImage}
                    disabled={imageLoading || !imagePrompt.trim()}
                    className="w-full mt-2 py-3 rounded-xl bg-evoly-600 hover:bg-evoly-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-evoly-600/20 transition-all"
                  >
                    {imageLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating via NVIDIA NIM...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {isEditMode ? 'Apply Image Edit' : 'Generate Image'}
                      </>
                    )}
                  </button>
                </div>

                {imageError && (
                  <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{imageError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Image Preview Canvas */}
            <div className="lg:col-span-7">
              <div className="bg-surface-card border border-surface-border rounded-2xl p-6 min-h-[460px] flex flex-col items-center justify-center">
                {imageResult ? (
                  <div className="w-full flex flex-col items-center gap-4">
                    <img
                      src={imageResult.imageUrl || imageResult.assetUrl}
                      alt="Generated"
                      className="max-h-[420px] w-auto rounded-xl border border-surface-border object-contain shadow-2xl"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">Provider: NVIDIA NIM</span>
                      <a
                        href={imageResult.imageUrl || imageResult.assetUrl}
                        download="evoly-render.png"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-hover border border-surface-border text-xs rounded-lg text-white hover:bg-slate-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">No image generated yet</p>
                    <p className="text-xs text-slate-600 mt-1">Configure your prompt and trigger NVIDIA NIM generation</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: VIDEO STUDIO ─────────────────────────────────── */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
                <h2 className="text-base font-semibold text-white mb-4">Video Generation (Kaggle & NVIDIA)</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Prompt</label>
                    <textarea
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="Describe the robot motion, joint kinematic action, or camera flight..."
                      rows={4}
                      className="w-full bg-surface border border-surface-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-evoly-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Execution Provider</label>
                      <select
                        value={videoProvider}
                        onChange={(e) => setVideoProvider(e.target.value as any)}
                        className="w-full bg-surface border border-surface-border rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-evoly-500"
                      >
                        <option value="kaggle">Kaggle Cloud GPU (Active & Authenticated)</option>
                        <option value="nvidia">NVIDIA Video (with Kaggle GPU Fallback)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Duration (Seconds)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(parseInt(e.target.value, 10))}
                        className="w-full bg-surface border border-surface-border rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-evoly-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateVideo}
                    disabled={videoLoading || !videoPrompt.trim()}
                    className="w-full mt-2 py-3 rounded-xl bg-evoly-600 hover:bg-evoly-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-evoly-600/20"
                  >
                    {videoLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting Job to {videoProvider.toUpperCase()}...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Launch Video Job
                      </>
                    )}
                  </button>
                </div>

                {videoError && (
                  <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{videoError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Video Preview & Status */}
            <div className="lg:col-span-7">
              <div className="bg-surface-card border border-surface-border rounded-2xl p-6 min-h-[460px] flex flex-col items-center justify-center">
                {videoResult ? (
                  <div className="w-full flex flex-col items-center gap-4">
                    <div className="w-full p-4 rounded-xl bg-surface border border-surface-border flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Job ID: {videoResult.id}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-sm font-medium text-white capitalize">{videoResult.status}</span>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-surface-hover rounded-md text-slate-300 font-mono">
                        {videoResult.provider}
                      </span>
                    </div>

                    {videoResult.videoUrl && (videoResult.videoUrl.endsWith('.mp4') || videoResult.videoUrl.endsWith('.webm')) ? (
                      <video src={videoResult.videoUrl} controls autoPlay loop className="max-h-[360px] w-full rounded-xl border border-surface-border" />
                    ) : (videoResult.thumbnailUrl || videoResult.videoUrl) ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-surface-border bg-black group">
                        <img
                          src={videoResult.thumbnailUrl || videoResult.videoUrl}
                          alt="Video Motion Frame"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 p-4 flex flex-col justify-between">
                          <span className="self-start px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-md text-[11px] text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Motion Keyframe Rendered
                          </span>
                          <div>
                            <p className="text-xs text-white line-clamp-1 font-semibold">{videoPrompt}</p>
                            <p className="text-[11px] text-slate-300 mt-0.5">GPU job running in cloud worker pipeline</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-400">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-evoly-400" />
                        <p className="text-sm">Job queued on Kaggle GPU worker.</p>
                        <p className="text-xs text-slate-500 mt-1">Check Kaggle kernels or output once completed.</p>
                      </div>
                    )}

                    {videoResult.metadata?.url && (
                      <a
                        href={videoResult.metadata.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-evoly-600 hover:bg-evoly-500 text-white font-medium text-xs shadow-lg shadow-evoly-600/20 transition-all mt-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open GPU Kernel & Logs on Kaggle
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">No video job launched</p>
                    <p className="text-xs text-slate-600 mt-1">Supports authenticated Kaggle workflows and NVIDIA Video</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: VOICE STUDIO ─────────────────────────────────── */}
        {activeTab === 'voice' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Text to Speech */}
            <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-evoly-400" />
                Text to Speech (TTS)
              </h2>
              <p className="text-xs text-slate-400 mb-4">ElevenLabs, Deepgram Aura, Cartesia</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Provider</label>
                  <select
                    value={ttsProvider}
                    onChange={(e) => setTtsProvider(e.target.value)}
                    className="w-full bg-surface border border-surface-border rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-evoly-500"
                  >
                    <option value="elevenlabs">ElevenLabs Multilingual v2</option>
                    <option value="deepgram">Deepgram Aura</option>
                    <option value="cartesia">Cartesia Sonic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Text Content</label>
                  <textarea
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Enter speech script or alert voice prompt..."
                    rows={4}
                    className="w-full bg-surface border border-surface-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-evoly-500"
                  />
                </div>

                <button
                  onClick={handleSynthesizeSpeech}
                  disabled={ttsLoading || !ttsText.trim()}
                  className="w-full py-3 rounded-xl bg-evoly-600 hover:bg-evoly-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-evoly-600/20"
                >
                  {ttsLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Synthesizing Voice...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Synthesize Audio
                    </>
                  )}
                </button>

                {ttsAudioUrl && (
                  <div className="mt-4 p-4 rounded-xl bg-surface border border-surface-border">
                    <p className="text-xs text-slate-400 mb-2 font-medium">Preview Output:</p>
                    <audio src={ttsAudioUrl} controls className="w-full" />
                  </div>
                )}

                {ttsError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300">
                    {ttsError}
                  </div>
                )}
              </div>
            </div>

            {/* Speech to Text */}
            <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-400" />
                Speech to Text (STT)
              </h2>
              <p className="text-xs text-slate-400 mb-4">Deepgram Nova-2, AssemblyAI</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Upload Audio File</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setSttFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-hover file:text-white hover:file:bg-slate-700 w-full"
                  />
                </div>

                <button
                  onClick={handleTranscribeAudio}
                  disabled={sttLoading || !sttFile}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {sttLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Transcribing Audio...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Transcribe Audio File
                    </>
                  )}
                </button>

                {sttTranscript && (
                  <div className="mt-4 p-4 rounded-xl bg-surface border border-surface-border relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-400">Transcript:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sttTranscript);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{sttTranscript}</p>
                  </div>
                )}

                {sttError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300">
                    {sttError}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MediaStudioPage;
