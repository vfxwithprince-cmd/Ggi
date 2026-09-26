import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  QrCode,
  ExternalLink,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Laptop
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { generateAndroidProjectZip } from '../lib/androidProjectGenerator';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'instant' | 'apk' | 'source'>('instant');
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const currentOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : appUrl || 'https://ais-pre-h7gwmc2iwe3wyh74z57tdd-350675427110.asia-east1.run.app';

  const liveUrlToUse = appUrl || currentOrigin;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrlToUse);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      setTimeout(() => onClose(), 1500);
    }
  };

  const handleDownloadAndroidProject = async () => {
    try {
      setIsGeneratingZip(true);
      const blob = await generateAndroidProjectZip(liveUrlToUse);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'HindiTTS-Android-Studio-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error('Failed to create Android project zip', e);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  // QR Code URL using Google Chart API / QR generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    liveUrlToUse
  )}&bgcolor=ffffff&color=1e293b&margin=1`;

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(
    liveUrlToUse
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Android App & APK Setup</h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-400/30 text-emerald-100 rounded-full border border-emerald-300/40">
                  Android 8.0+
                </span>
              </div>
              <p className="text-xs text-orange-100 mt-0.5">
                Install as a native Android app (WebAPK) or build a standalone APK package
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 text-white/90 flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === 'instant'
                ? 'bg-white text-orange-600 border-orange-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>1. Instant Install (WebAPK)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              Recommended
            </span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === 'apk'
                ? 'bg-white text-orange-600 border-orange-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>2. Cloud APK Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('source')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === 'source'
                ? 'bg-white text-orange-600 border-orange-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>3. Android Studio Project (.zip)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: Instant Android Install (WebAPK) */}
          {activeTab === 'instant' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    How Android WebAPK works
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Google Chrome and Android OS automatically convert this app into a verified <strong>native Android APK</strong> upon installation. It requires <strong>no sideloading, no security warnings</strong>, and appears directly in your Android App Drawer with its own icon and full-screen window!
                  </p>
                </div>
              </div>

              {/* Action based on device */}
              {isAndroid ? (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-600 text-white shadow-md">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      You are using an Android phone!
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                      Tap the button below to install Hindi Text to Speech directly onto your home screen and app drawer.
                    </p>
                  </div>

                  {isInstalled ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      App is already installed on your device!
                    </div>
                  ) : isInstallable ? (
                    <button
                      onClick={handleDirectInstall}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all transform active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      Install Hindi TTS App on Android
                    </button>
                  ) : (
                    <div className="text-xs text-slate-600 bg-white/80 p-3 rounded-lg border border-orange-100 max-w-sm mx-auto">
                      <p className="font-semibold text-slate-800">To install manually in Chrome:</p>
                      <p className="mt-1">
                        1. Tap the three dots (<strong>⋮</strong>) in the top-right of your browser.<br />
                        2. Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Desktop/Other view: Scan QR code or copy URL to Android phone */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-orange-600" />
                      Scan with your Android phone
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Point your Android camera or QR code scanner at this code to open the app on your phone, then tap <strong>&quot;Install App&quot;</strong> for the instant APK experience.
                    </p>

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        App Link for Android Phone
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={liveUrlToUse}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-700 select-all"
                        />
                        <button
                          onClick={handleCopy}
                          className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
                        >
                          {copiedUrl ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Card */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                      <img
                        src={qrCodeUrl}
                        alt="Android App Install QR Code"
                        className="w-44 h-44 object-contain rounded-lg"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 mt-2">
                      Open Android Camera & Scan
                    </span>
                  </div>
                </div>
              )}

              {/* Instructions steps */}
              <div className="border-t border-slate-200 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Step-by-step Android Installation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <h5 className="text-xs font-bold text-slate-800">Open on Phone</h5>
                    <p className="text-[11px] text-slate-600">
                      Open this URL in Google Chrome on your Android smartphone.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <h5 className="text-xs font-bold text-slate-800">Tap &quot;Install App&quot;</h5>
                    <p className="text-[11px] text-slate-600">
                      Tap the install banner or browser menu (⋮) &gt; &quot;Install App&quot;.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <h5 className="text-xs font-bold text-slate-800">Native Android App</h5>
                    <p className="text-[11px] text-slate-600">
                      The app appears on your phone&apos;s home screen with the app icon and full Devanagari voice support!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Cloud APK Builder (PWABuilder) */}
          {activeTab === 'apk' && (
            <div className="space-y-6">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-950">
                    Build a Standalone .APK File Online (Free &amp; Official)
                  </h4>
                  <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                    You can generate a signed or unsigned <strong>.apk</strong> / <strong>.aab</strong> package ready for Android sideloading or Google Play Store submission using <strong>PWABuilder</strong> (an open-source project by Microsoft).
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Generate APK via PWABuilder
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Reads your live PWA manifest, configures Android package ID, and compiles an APK in ~30 seconds.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href={pwaBuilderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all transform active:scale-95"
                    >
                      <span>Package APK on PWABuilder</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="text-xs font-bold text-slate-800">How to use PWABuilder:</h5>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
                    <li>Click the <strong>&quot;Package APK on PWABuilder&quot;</strong> button above.</li>
                    <li>PWABuilder will automatically validate the PWA manifest and icons.</li>
                    <li>Click <strong>&quot;Package for Android&quot;</strong>.</li>
                    <li>Select <strong>&quot;Generate APK&quot;</strong> and download the ready-to-install <strong>.apk</strong> file.</li>
                    <li>Transfer the APK to your Android phone and tap to install!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Android Studio Source Project */}
          {activeTab === 'source' && (
            <div className="space-y-6">
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-950">
                    Full Android Studio Java/Gradle Source Code (.zip)
                  </h4>
                  <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                    Download a complete, pre-configured Android Studio project. It includes <code className="bg-purple-100/80 px-1 py-0.5 rounded font-mono text-[11px]">MainActivity.java</code>, <code className="bg-purple-100/80 px-1 py-0.5 rounded font-mono text-[11px]">AndroidManifest.xml</code>, Gradle build scripts, Android WebView with audio support, and file download listeners.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      HindiTTS-Android-Studio-Project.zip
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ready to build with Android Studio or <code className="bg-slate-200 px-1 rounded font-mono text-[11px]">./gradlew assembleDebug</code>
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadAndroidProject}
                    disabled={isGeneratingZip}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-bold shadow-md transition-all transform active:scale-95 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    {isGeneratingZip ? 'Generating ZIP...' : 'Download Android Project (.zip)'}
                  </button>
                </div>

                {downloadSuccess && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Downloaded! Extract and open in Android Studio to build your APK.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Building the APK in Android Studio:
                </h5>
                <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-200 space-y-2 border border-slate-800">
                  <div className="text-slate-400"># 1. Extract the downloaded ZIP</div>
                  <div className="text-amber-400">unzip HindiTTS-Android-Studio-Project.zip</div>
                  <div className="text-slate-400 pt-2"># 2. Open in Android Studio or build APK directly:</div>
                  <div className="text-emerald-400">./gradlew assembleDebug</div>
                  <div className="text-slate-400 pt-2"># 3. Output APK location:</div>
                  <div className="text-white">app/build/outputs/apk/debug/app-debug.apk</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Includes 10 authentic Hindi voices &amp; speech synthesis</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
