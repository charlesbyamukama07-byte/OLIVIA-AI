import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Download,
  X,
  FileArchive,
  CheckCircle2,
  FolderGit2,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface ProjectZipExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectZipExporterModal: React.FC<ProjectZipExporterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isBundling, setIsBundling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedGitCode, setCopiedGitCode] = useState(false);
  const [fileList, setFileList] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsBundling(true);
    setProgress(5);
    setDownloadSuccess(false);

    try {
      // 1. Fetch file tree from server
      const res = await fetch('/api/project-files');
      const data = await res.json();
      if (!data.ok || !data.files) {
        throw new Error(data.message || 'Failed to retrieve project files from server');
      }

      setProgress(25);
      const files: Record<string, string> = data.files;
      setFileList(Object.keys(files));

      // 2. Initialize client-side JSZip
      const zip = new JSZip();

      // Add each file to the zip archive
      Object.entries(files).forEach(([relPath, content]) => {
        zip.file(relPath, content);
      });

      // Ensure .gitignore is present
      if (!files['.gitignore']) {
        zip.file(
          '.gitignore',
          'node_modules\ndist\n.env\n.DS_Store\n*.local\n'
        );
      }

      setProgress(50);

      // 3. Generate ZIP binary in browser
      const blob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          setProgress(50 + Math.round(metadata.percent / 2));
        }
      );

      setProgress(100);

      // 4. Trigger download in browser
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'OLIVIA-AI-main.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err: any) {
      console.error('JSZip generation error:', err);
      alert('Error generating ZIP bundle: ' + (err.message || 'Unknown error'));
    } finally {
      setIsBundling(false);
    }
  };

  const gitPushScript = `# 1. Extract the downloaded ZIP bundle
unzip OLIVIA-AI-main.zip -d OLIVIA-AI
cd OLIVIA-AI

# 2. Push directly to your GitHub repository
git init
git add .
git commit -m "Initial commit: Olivia AI Institutional Sniper Terminal"
git branch -M main
git remote add origin https://github.com/charlesbyamukama07-byte/OLIVIA-AI.git
git push -u origin main`;

  const handleCopyGitCommands = () => {
    navigator.clipboard.writeText(gitPushScript);
    setCopiedGitCode(true);
    setTimeout(() => setCopiedGitCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>Client-Side JSZip Project Bundler</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Ready to Deploy
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Package all source code into an instant GitHub deployment bundle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="space-y-4 my-4 overflow-y-auto pr-1 flex-1 text-xs">
          {/* Action Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-sky-400" />
                <span>OLIVIA-AI-main.zip</span>
              </h4>
              <p className="text-slate-400 mt-1">
                Includes all TypeScript sources, React SMC components, Tailwind styling, Express server, and documentation.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isBundling}
              className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold font-mono transition-all shadow-lg shadow-sky-500/20 cursor-pointer disabled:opacity-50"
            >
              {isBundling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Bundling ({progress}%)...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ZIP Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Project ZIP</span>
                </>
              )}
            </button>
          </div>

          {/* Progress bar if bundling */}
          {isBundling && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Compressing source code with JSZip...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Target GitHub Repository info */}
          <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-300 font-mono">
              <FolderGit2 className="w-4 h-4 text-sky-400" />
              <span>Target Repo: <strong>charlesbyamukama07-byte/OLIVIA-AI</strong></span>
            </div>
            <a
              href="https://github.com/charlesbyamukama07-byte/OLIVIA-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-sky-400 hover:underline font-mono"
            >
              <span>Open on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Git Terminal Instructions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Quick Deploy to GitHub (Run on your terminal)
              </span>
              <button
                type="button"
                onClick={handleCopyGitCommands}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors cursor-pointer"
              >
                {copiedGitCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Commands</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed selection:bg-sky-500 selection:text-slate-950">
              {gitPushScript}
            </pre>
          </div>

          {/* Alternative upload method */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-[11px]">
            <strong className="text-slate-200">Web Upload Alternative:</strong> You can also extract the ZIP and drag the files directly into your GitHub web interface at{' '}
            <span className="text-sky-400 font-mono">github.com/charlesbyamukama07-byte/OLIVIA-AI</span> using <em>&quot;Add file &gt; Upload files&quot;</em>.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
