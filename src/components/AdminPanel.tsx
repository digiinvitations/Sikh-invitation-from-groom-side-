import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  getWeddingData, 
  saveWeddingData, 
  getEnvironmentDocId, 
  isOfficialInstance,
  setCustomSlotId,
  getLocalCachedWeddingData,
  copyFromEarlierWeddingData,
  copyFromParentWebsiteData,
  EARLIER_ORIGINAL_DOC_ID,
  CURRENT_WEBSITE_DOC_ID,
  UPCOMING_REMIX_DOC_ID,
  CANONICAL_DOC_ID 
} from "../services/db";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { WeddingData } from "../types";
import { 
  Save, 
  Image as ImageIcon, 
  ArrowLeft, 
  Download, 
  Upload, 
  FileJson, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Music, 
  Video, 
  Database,
  RefreshCw,
  UploadCloud,
  FileUp,
  FileCheck,
  AlertCircle,
  X
} from "lucide-react";

export function AdminPanel() {
  const [data, setData] = useState<WeddingData>(getLocalCachedWeddingData);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [currentSlot, setCurrentSlot] = useState<string>("");
  const [isOfficial, setIsOfficial] = useState<boolean>(true);
  const [customSlotInput, setCustomSlotInput] = useState<string>("");
  const [showSlotSettings, setShowSlotSettings] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneFileInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop import states
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    data: WeddingData;
    fileName: string;
    fileSize: string;
    exportTimestamp?: string;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedExportJson, setCopiedExportJson] = useState(false);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    async function loadData() {
      const dbData = await getWeddingData();
      setData(dbData);
      setCurrentSlot(getEnvironmentDocId());
      setIsOfficial(isOfficialInstance());
    }
    loadData();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-blush-main flex items-center justify-center p-4 font-serif">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-pink-border max-w-sm w-full text-center">
          <h2 className="text-2xl font-script text-wine-dark mb-4">Admin Login</h2>
          <input 
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (password === "4260") setIsAuthenticated(true);
                else alert("Incorrect password");
              }
            }}
            className="w-full border border-pink-border rounded-md px-4 py-2 mb-4 text-center focus:outline-none focus:border-pink-accent"
          />
          <button 
            onClick={() => {
              if (password === "4260") setIsAuthenticated(true);
              else alert("Incorrect password");
            }}
            className="w-full bg-burgundy text-white py-2 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-wine-dark transition-colors"
          >
            Enter
          </button>
          <Link to="/" className="block mt-4 text-sm text-wine-dark/70 hover:text-wine-dark underline">
            Return to Website
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 font-serif">Loading Admin Panel...</div>;

  const handleChange = (path: string, value: any) => {
    setData((prev: any) => {
      if (!prev) return prev;
      const updated = { ...prev };
      const keys = path.split('.');
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!current[k] || typeof current[k] !== 'object') {
          current[k] = {};
        } else {
          current[k] = Array.isArray(current[k]) ? [...current[k]] : { ...current[k] };
        }
        current = current[k];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setData((prev: any) => {
        const newGallery = [...prev.gallery];
        newGallery[index] = base64String;
        return { ...prev, gallery: newGallery };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      handleChange(field, base64String);
    };
    reader.readAsDataURL(file);
  };

  const addImage = () => {
    setData((prev: any) => ({
      ...prev,
      gallery: [...prev.gallery, ""]
    }));
  };

  const removeImage = (index: number) => {
    setData((prev: any) => {
      const newGallery = [...prev.gallery];
      newGallery.splice(index, 1);
      return { ...prev, gallery: newGallery };
    });
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      await saveWeddingData(data);
      setSaveStatus({
        type: 'success',
        message: 'All changes & media saved permanently! Storage and website updated.'
      });
      setTimeout(() => {
        setSaveStatus((curr) => curr?.type === 'success' ? null : curr);
      }, 5000);
    } catch (error) {
      console.error(error);
      setSaveStatus({
        type: 'error',
        message: 'Failed to save changes. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  // EXPORT: Download complete JSON package containing all wedding data & files
  const handleExport = () => {
    if (!data) return;
    try {
      const exportPayload = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        databaseSlot: getEnvironmentDocId(),
        couple: `${data.bride?.name || "Bride"} & ${data.groom?.name || "Groom"}`,
        data: data
      };
      const jsonString = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeCouple = `${data.bride?.name || "wedding"}_and_${data.groom?.name || "invitation"}`
        .toLowerCase()
        .replace(/[^a-z0-9_-]/gi, "_");
      link.href = url;
      link.download = `wedding_backup_${safeCouple}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleCopyExportJson = () => {
    if (!data) return;
    try {
      const exportPayload = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        databaseSlot: currentSlot,
        couple: `${data.bride?.name || "Bride"} & ${data.groom?.name || "Groom"}`,
        data: data
      };
      navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
      setCopiedExportJson(true);
      setTimeout(() => setCopiedExportJson(false), 2500);
    } catch (err) {
      console.error("Copy JSON error:", err);
    }
  };

  // CORE IMPORT PROCESSOR: Supports both drag-and-drop and file input selection
  const processImportFile = (file: File) => {
    if (!file) return;
    setImportError(null);
    setImportSuccessMessage(null);

    // Basic file validation
    const isJsonExt = file.name.toLowerCase().endsWith(".json");
    const isJsonType = file.type && (file.type.includes("json") || file.type === "text/plain");

    if (!isJsonExt && !isJsonType) {
      setImportError(`The selected file "${file.name}" does not appear to be a JSON file. Please provide a valid .json wedding backup.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content || !content.trim()) {
          throw new Error("The file is empty.");
        }

        const parsed = JSON.parse(content);

        // Support both wrapped export format { data: WeddingData } and raw WeddingData
        const importedData: WeddingData = parsed.data && typeof parsed.data === "object" ? parsed.data : parsed;

        if (!importedData || typeof importedData !== "object") {
          throw new Error("Invalid file format. Please provide a valid JSON backup containing wedding data.");
        }
        if (!importedData.groom || !importedData.bride) {
          throw new Error("Missing groom or bride information. Please ensure this is a wedding backup JSON.");
        }

        // Safety defaults for nested structures
        if (!Array.isArray(importedData.events)) importedData.events = [];
        if (!Array.isArray(importedData.timeline)) importedData.timeline = [];
        if (!Array.isArray(importedData.gallery)) importedData.gallery = [];
        if (!importedData.venue) {
          importedData.venue = { name: "", addressLine1: "", addressLine2: "", mapUrl: "" };
        }

        const sizeInKb = (file.size / 1024).toFixed(1);
        setImportPreview({
          data: importedData,
          fileName: file.name,
          fileSize: `${sizeInKb} KB`,
          exportTimestamp: parsed.exportedAt || undefined,
        });
      } catch (err: any) {
        console.error("Import processing error:", err);
        setImportError("Failed to parse file: " + (err.message || "Invalid JSON structure"));
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (dropzoneFileInputRef.current) dropzoneFileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      setImportError("Error reading the file from your computer.");
    };

    reader.readAsText(file);
  };

  // IMPORT: Import complete JSON package from file input
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImportFile(file);
    }
  };

  const handleApplyAndSave = async () => {
    if (!importPreview) return;
    const targetData = importPreview.data;
    setSaving(true);
    try {
      setData(targetData);
      await saveWeddingData(targetData);
      setImportSuccessMessage(`Data successfully imported and saved to cloud for ${targetData.bride?.name || "Bride"} & ${targetData.groom?.name || "Groom"}!`);
      setImportPreview(null);
      setImportError(null);
    } catch (err: any) {
      console.error(err);
      setImportError("Failed to save to database: " + (err.message || "Network error"));
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToEditorOnly = () => {
    if (!importPreview) return;
    setData(importPreview.data);
    setImportSuccessMessage(`Backup loaded into Admin Panel for ${importPreview.data.bride?.name || "Bride"} & ${importPreview.data.groom?.name || "Groom"}! Review details below and click 'Save Changes' whenever you are ready.`);
    setImportPreview(null);
    setImportError(null);
  };

  const handleCancelImport = () => {
    setImportPreview(null);
    setImportError(null);
  };

  // Drag-and-drop event handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      setIsDraggingOver(false);
      dragCounterRef.current = 0;
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImportFile(files[0]);
    }
  };

  // DOWNLOAD ASSET HELPER: Allows downloading individual media files (videos, mp3, images)
  const handleDownloadAsset = async (url: string, filename: string) => {
    if (!url) return;
    try {
      if (url.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // Fetch blob to prompt download
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback if CORS prevents blob download
      window.open(url, "_blank");
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // List of all media files currently configured in this wedding
  const mediaFilesList = [
    { label: "Opening Thumbnail", url: data.openingThumbnailUrl, type: "image", filename: "opening_thumbnail.png" },
    { label: "Hero Waheguru Logo / Icon", url: data.heroLogoUrl, type: "image", filename: "hero_waheguru_logo.png" },
    { label: "Opening Video", url: data.openingVideoUrl, type: "video", filename: "opening_video.mp4" },
    { label: "Opening Quote Page Background", url: data.openingQuoteBgUrl, type: "image", filename: "opening_quote_bg.jpg" },
    { label: "Hero Section Video", url: data.heroVideoUrl, type: "video", filename: "hero_video.mp4" },
    { label: "Opening Background Music", url: data.openingMusicUrl, type: "audio", filename: "opening_music.mp3" },
    { label: "Background Music", url: data.musicUrl, type: "audio", filename: "background_music.mp3" },
    { label: "OG Social Image", url: data.ogImageUrl, type: "image", filename: "social_og_image.jpg" },
    ...(data.events || []).map((ev, i) => ({
      label: `Event ${i + 1} Video (${ev.title || "Untitled"})`,
      url: ev.videoUrl,
      type: "video",
      filename: `event_${i + 1}_video.mp4`
    })),
    ...(data.gallery || []).map((img, i) => ({
      label: `Gallery Image ${i + 1}`,
      url: img,
      type: "image",
      filename: `gallery_${i + 1}.jpg`
    }))
  ].filter(item => Boolean(item.url));

  const handleDownloadAllLinksTxt = () => {
    if (!data) return;
    const lines: string[] = [
      `================================================`,
      `WEDDING ASSET & MEDIA URL BACKUP`,
      `Couple: ${data.bride?.name} & ${data.groom?.name}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Database Slot: ${currentSlot}`,
      `================================================`,
      ``,
      `[OPENING THUMBNAIL]`,
      data.openingThumbnailUrl || "(None)",
      ``,
      `[HERO RELIGIOUS LOGO / WAHEGURU ICON]`,
      data.heroLogoUrl || "(None)",
      ``,
      `[OPENING VIDEO]`,
      data.openingVideoUrl || "(None)",
      ``,
      `[HERO BACKGROUND VIDEO]`,
      data.heroVideoUrl || "(None)",
      ``,
      `[BACKGROUND MUSIC TRACK]`,
      data.musicUrl || "(None)",
      ``,
      `[OG SOCIAL SHARE IMAGE]`,
      data.ogImageUrl || "(None)",
      ``,
      `[EVENTS]`,
      ...(data.events || []).map((ev, i) => 
        `Event ${i + 1}: ${ev.title} (${ev.date || 'No date'})\n  Video: ${ev.videoUrl || 'None'}\n  Map: ${ev.mapUrl || 'None'}`
      ),
      ``,
      `[GALLERY IMAGES]`,
      ...(data.gallery || []).map((img, i) => `Photo ${i + 1}: ${img.startsWith('data:') ? '[Base64 Uploaded Image]' : img}`)
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding_media_links_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdateCustomSlot = async () => {
    const raw = customSlotInput.trim();
    if (!raw) {
      setCustomSlotId("");
      alert("Reset to automatic isolated slot identification.");
      window.location.reload();
      return;
    }
    const cleanSlot = raw.replace(/[\/\s#?\[\]]/g, "_");
    setCustomSlotId(cleanSlot);
    if (data) {
      try {
        setSaving(true);
        await saveWeddingData(data);
      } catch (e) {
        console.warn("Could not save to new slot immediately:", e);
      } finally {
        setSaving(false);
      }
    }
    alert(`Database slot updated to: ${cleanSlot}\nThis website will now store all data and RSVPs in this isolated slot.`);
    window.location.reload();
  };

  const handleResetToTemplate = async () => {
    if (!window.confirm("Load master template into this slot? This will copy all default Sikh wedding invitation events, texts, and media into this remix.")) return;
    try {
      setSaving(true);
      const canonicalRef = doc(db, "weddingConfig", CANONICAL_DOC_ID);
      const canonicalSnap = await getDoc(canonicalRef);
      if (canonicalSnap.exists()) {
        const fresh = canonicalSnap.data() as WeddingData;
        setData(fresh);
        await saveWeddingData(fresh);
        alert("Template successfully loaded and saved into your remix slot!");
      }
    } catch (e) {
      console.error("Error loading template:", e);
      alert("Failed to load template. Please check your network connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyFromEarlierOriginal = async () => {
    if (!window.confirm(`Copy full website data from '${EARLIER_ORIGINAL_DOC_ID}' into this website slot (${currentSlot})?\n\nThis will safely clone all couple details, ceremonies, gallery photos, and media links. The original '${EARLIER_ORIGINAL_DOC_ID}' will NOT be modified or overlapped.`)) return;

    try {
      setSaving(true);
      const copied = await copyFromEarlierWeddingData();
      setData(copied);
      setImportSuccessMessage(`Successfully copied full website data from '${EARLIER_ORIGINAL_DOC_ID}' into slot (${currentSlot})! Zero overlap guaranteed.`);
      alert(`Full website data copied successfully into '${currentSlot}'!\nOriginal '${EARLIER_ORIGINAL_DOC_ID}' is intact.`);
    } catch (e: any) {
      console.error("Error copying earlier data:", e);
      setImportError("Failed to copy from earlier data: " + (e.message || "Unknown error"));
      alert("Error copying data: " + (e.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleCopyFromParentWebsite = async () => {
    if (!window.confirm(`Copy full website data from '${CURRENT_WEBSITE_DOC_ID}' into this website slot (${currentSlot})?\n\nThis will safely copy all bride & groom details, ceremonies, gallery photos, and audio/video links from this website. The source document '${CURRENT_WEBSITE_DOC_ID}' will NOT be altered or overlapped.`)) return;

    try {
      setSaving(true);
      const copied = await copyFromParentWebsiteData();
      setData(copied);
      setImportSuccessMessage(`Successfully copied full website data from '${CURRENT_WEBSITE_DOC_ID}' into slot (${currentSlot})! Zero overlap guaranteed.`);
      alert(`Full website data copied successfully into '${currentSlot}'!\nSource '${CURRENT_WEBSITE_DOC_ID}' remains intact.`);
    } catch (e: any) {
      console.error("Error copying parent data:", e);
      setImportError("Failed to copy from parent website: " + (e.message || "Unknown error"));
      alert("Error copying data: " + (e.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-blush-main p-4 md:p-8 font-serif text-text-body">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-10 border border-pink-border">
        
        {/* Top Header with Navigation & Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-pink-border pb-6 gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-wine-dark hover:text-burgundy bg-blush-light px-3 py-1.5 rounded-full border border-pink-border/50 transition-colors text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Link>
            <div>
              <h1 className="text-3xl font-script text-wine-dark">Admin Panel</h1>
              <p className="text-xs text-text-body/70 font-sans mt-0.5">Manage wedding details, media files, and backups</p>
            </div>
          </div>

          {/* Action Bar: Export, Import, Save */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Hidden JSON file input */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
            />

            <button 
              onClick={handleExport}
              type="button"
              id="admin-top-export-btn"
              className="flex items-center gap-1.5 bg-white text-wine-dark border border-pink-border px-3.5 py-2 rounded-md hover:bg-blush-light transition-colors text-xs font-bold uppercase tracking-wider shadow-sm"
              title="Download full wedding data & media as a JSON file"
            >
              <Download className="w-4 h-4 text-wine-dark" />
              Export
            </button>

            <button 
              onClick={() => {
                fileInputRef.current?.click();
                document.getElementById("admin-import-column")?.scrollIntoView({ behavior: "smooth" });
              }}
              type="button"
              id="admin-top-import-btn"
              className="flex items-center gap-1.5 bg-white text-wine-dark border border-pink-border px-3.5 py-2 rounded-md hover:bg-blush-light transition-colors text-xs font-bold uppercase tracking-wider shadow-sm"
              title="Upload and load a wedding JSON backup file"
            >
              <Upload className="w-4 h-4 text-wine-dark" />
              Import
            </button>

            <button 
              onClick={handleSave}
              disabled={saving}
              id="admin-top-save-btn"
              className="flex items-center gap-2 bg-burgundy text-white px-5 py-2 rounded-md hover:bg-wine-dark transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wider shadow-sm ml-auto md:ml-0"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-3 shadow-xs ${
            saveStatus.type === 'success' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <div className="flex items-center gap-2.5">
              {saveStatus.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="text-sm font-semibold">{saveStatus.message}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setSaveStatus(null)}
              className="p-1 hover:opacity-70 text-xs uppercase font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <div className="space-y-8">

          {/* HOSTING & ISOLATED DATABASE STATUS BANNER */}
          <div className="bg-gradient-to-r from-pink-50 via-blush-light to-amber-50/40 rounded-xl p-5 border border-pink-border/70 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg border border-pink-border/60 text-wine-dark shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-wine-dark text-sm">
                      {currentSlot === UPCOMING_REMIX_DOC_ID 
                        ? "Dedicated Storage Slot" 
                        : "Parent Website Dedicated Storage"}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-800 border-emerald-300">
                      Isolated Storage • Zero Overlap
                    </span>
                  </div>
                  <p className="text-xs text-text-body/80 mt-1 font-sans">
                    Active Storage Document: <code className="bg-white px-1.5 py-0.5 rounded border border-pink-border/50 text-wine-dark font-mono text-[11px] font-bold">{currentSlot}</code>
                    <span className="ml-2 text-[11px] text-emerald-700 font-sans font-medium">✓ Protected against cross-website overlap</span>
                  </p>
                  <p className="text-xs text-text-body/70 mt-0.5 font-sans max-w-xl">
                    {currentSlot === UPCOMING_REMIX_DOC_ID
                      ? "This is the isolated storage for this invitation. Edits saved here will NOT show on or overlap with the parent website."
                      : `This parent website is stored in ${CURRENT_WEBSITE_DOC_ID}. When you remix this website, the upcoming remix will automatically save to its own separate document (${UPCOMING_REMIX_DOC_ID}) with zero overlap.`
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyFromParentWebsite}
                  disabled={saving}
                  className="bg-wine-dark hover:bg-burgundy text-white text-xs px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 font-sans"
                  title={`Copy full data from ${CURRENT_WEBSITE_DOC_ID} into active slot`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy from Parent
                </button>
                <button 
                  type="button"
                  onClick={() => setShowSlotSettings(!showSlotSettings)}
                  className="text-xs text-wine-dark underline hover:text-burgundy font-sans"
                >
                  {showSlotSettings ? "Hide Options" : "Slot Settings"}
                </button>
              </div>
            </div>

            {showSlotSettings && (
              <div className="mt-4 pt-4 border-t border-pink-border/40 font-sans text-xs space-y-3">
                <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-pink-border/30">
                  <span className="text-text-body/80 font-medium">Quick Slot Switcher:</span>
                  <button
                    type="button"
                    onClick={() => { setCustomSlotId(CURRENT_WEBSITE_DOC_ID); window.location.reload(); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                      currentSlot === CURRENT_WEBSITE_DOC_ID 
                        ? "bg-wine-dark text-white border-wine-dark" 
                        : "bg-white text-wine-dark border-pink-border hover:bg-pink-50"
                    }`}
                  >
                    Parent Slot ({CURRENT_WEBSITE_DOC_ID})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCustomSlotId(UPCOMING_REMIX_DOC_ID); window.location.reload(); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                      currentSlot === UPCOMING_REMIX_DOC_ID 
                        ? "bg-wine-dark text-white border-wine-dark" 
                        : "bg-white text-wine-dark border-pink-border hover:bg-pink-50"
                    }`}
                  >
                    Dedicated Remix Slot ({UPCOMING_REMIX_DOC_ID})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCustomSlotId(""); window.location.reload(); }}
                    className="px-2.5 py-1 rounded text-[11px] text-text-body/70 hover:text-wine-dark underline"
                  >
                    Reset Auto
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <span className="text-text-body/80 font-medium whitespace-nowrap">Custom Slot Name:</span>
                  <input 
                    type="text"
                    placeholder="e.g. wedding_custom_slot_id"
                    value={customSlotInput}
                    onChange={(e) => setCustomSlotInput(e.target.value)}
                    className="bg-white border border-pink-border rounded px-2.5 py-1.5 text-xs flex-1 max-w-xs focus:outline-none focus:border-pink-accent"
                  />
                  <button
                    type="button"
                    onClick={handleUpdateCustomSlot}
                    className="bg-wine-dark text-white px-3 py-1.5 rounded text-xs hover:bg-burgundy transition-colors font-medium"
                  >
                    Apply & Save Current Data
                  </button>
                </div>

                <div className="pt-2 border-t border-pink-border/30 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-text-body/70 text-[11px]">
                    Need to clone default template text and assets?
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToTemplate}
                    disabled={saving}
                    className="bg-white border border-pink-border text-wine-dark hover:bg-pink-50 px-2.5 py-1 rounded text-xs transition-colors"
                  >
                    Clone Master Template
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BACKUP, IMPORT & EXPORT CENTER */}
          <section id="admin-backup-section" className="bg-white rounded-xl p-5 md:p-6 border border-pink-border/80 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <FileJson className="w-5 h-5 text-wine-dark" />
              <h2 className="text-lg font-bold text-wine-dark">Data Backup & Migration (Import / Export)</h2>
            </div>
            <p className="text-xs text-text-body/75 font-sans mb-5">
              Export and download all wedding details, ceremony events, and media links as a portable backup file, 
              or drag and drop a backup file to import existing wedding data directly into this admin panel.
            </p>

            {/* Global Notifications for Import */}
            {importSuccessMessage && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-start justify-between gap-2 text-emerald-800 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccessMessage}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setImportSuccessMessage(null)}
                  className="text-emerald-700 hover:text-emerald-900 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {importError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-300 rounded-lg flex items-start justify-between gap-2 text-rose-800 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setImportError(null)}
                  className="text-rose-700 hover:text-rose-900 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 2-Column Grid: Left is Export, Right is Drag & Drop Import Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              
              {/* COLUMN 1: EXPORT */}
              <div id="admin-export-column" className="bg-blush-light/50 rounded-xl p-4 md:p-5 border border-pink-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-wine-dark flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Export Data
                    </span>
                    <span className="text-[11px] font-mono text-text-body/60 bg-white px-2 py-0.5 rounded border border-pink-border/50">
                      .json format
                    </span>
                  </div>
                  <h3 className="font-bold text-wine-dark text-sm mb-1">Download Wedding Backup</h3>
                  <p className="text-xs text-text-body/75 font-sans mb-3 leading-relaxed">
                    Create a complete JSON export of all couple bios, ceremonies, photos, and music links.
                  </p>

                  {/* Summary Details */}
                  <div className="bg-white/80 rounded-lg p-2.5 border border-pink-border/40 text-xs font-sans space-y-1 mb-4 text-text-body/80">
                    <div className="flex justify-between">
                      <span className="text-text-body/60">Couple:</span>
                      <span className="font-semibold text-wine-dark truncate max-w-[170px]">{data.bride?.name || "Bride"} & {data.groom?.name || "Groom"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-body/60">Events Scheduled:</span>
                      <span className="font-medium text-wine-dark">{data.events?.length || 0} Events</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-body/60">Gallery Photos:</span>
                      <span className="font-medium text-wine-dark">{data.gallery?.length || 0} Photos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-body/60">Media Files & Links:</span>
                      <span className="font-medium text-wine-dark">{mediaFilesList.length} Files</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleExport}
                    id="admin-export-download-btn"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-burgundy hover:bg-wine-dark text-white rounded-lg font-sans font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full Backup (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyExportJson}
                    id="admin-export-copy-btn"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-pink-50 border border-pink-border rounded-lg text-wine-dark font-sans text-xs transition-colors"
                  >
                    {copiedExportJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">JSON Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-wine-dark" />
                        <span>Copy JSON to Clipboard</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* COLUMN 2: DRAG & DROP IMPORT COLUMN */}
              <div id="admin-import-column" className="bg-blush-light/50 rounded-xl p-4 md:p-5 border border-pink-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-wine-dark flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-wine-dark" /> Import Data
                    </span>
                    <span className="text-[11px] font-mono text-text-body/60 bg-white px-2 py-0.5 rounded border border-pink-border/50">
                      Drag & Drop
                    </span>
                  </div>
                  <h3 className="font-bold text-wine-dark text-sm mb-1">Import & Restore Backup</h3>
                  <p className="text-xs text-text-body/75 font-sans mb-3 leading-relaxed">
                    Drag and drop your wedding JSON backup file into the box below or click to browse files.
                  </p>

                  {/* Hidden file input for drag & drop zone */}
                  <input
                    ref={dropzoneFileInputRef}
                    id="admin-dropzone-file-input"
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImport}
                    className="hidden"
                  />

                  {/* Drag and Drop Zone */}
                  <div
                    id="admin-drag-drop-zone"
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => dropzoneFileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        dropzoneFileInputRef.current?.click();
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Drag and drop JSON backup file here or click to browse"
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 outline-none select-none ${
                      isDraggingOver
                        ? "border-burgundy bg-pink-100/90 scale-[1.01] shadow-inner ring-4 ring-pink-accent/20"
                        : "border-pink-border hover:border-pink-accent bg-white/70 hover:bg-white hover:shadow-xs"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className={`p-3 rounded-full transition-transform duration-200 ${
                        isDraggingOver 
                          ? "bg-burgundy text-white scale-110 animate-pulse" 
                          : "bg-blush-light text-wine-dark"
                      }`}>
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-wine-dark font-sans">
                          {isDraggingOver ? "Drop your backup JSON file now!" : "Drag & drop your backup .json file here"}
                        </p>
                        <p className="text-[11px] text-text-body/65 font-sans mt-0.5">
                          or <span className="text-burgundy underline font-medium">browse files</span> from your computer
                        </p>
                      </div>
                      <span className="inline-block mt-1 text-[10px] text-text-body/60 font-mono bg-blush-light px-2 py-0.5 rounded border border-pink-border/40">
                        Supports all wedding backups (.json)
                      </span>
                    </div>
                  </div>

                  {/* IMPORT PREVIEW CARD (When a file has been parsed and is waiting for user confirmation) */}
                  {importPreview && (
                    <div id="admin-import-preview-card" className="mt-3 bg-white p-3.5 rounded-lg border border-pink-border shadow-xs text-xs font-sans space-y-2.5">
                      <div className="flex items-center justify-between border-b border-pink-border/40 pb-2">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-wine-dark text-xs truncate max-w-[160px]">{importPreview.fileName}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-blush-light text-wine-dark px-1.5 py-0.5 rounded border border-pink-border/40">
                          {importPreview.fileSize}
                        </span>
                      </div>

                      <div className="space-y-1 text-text-body/80 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-text-body/60">Couple in Backup:</span>
                          <span className="font-bold text-wine-dark">{importPreview.data.bride?.name || "Bride"} & {importPreview.data.groom?.name || "Groom"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-body/60">Events Included:</span>
                          <span className="font-medium text-wine-dark">{importPreview.data.events?.length || 0} Events</span>
                        </div>
                        {importPreview.data.weddingDateFormatted && (
                          <div className="flex justify-between">
                            <span className="text-text-body/60">Date:</span>
                            <span className="text-text-body/80">{importPreview.data.weddingDateFormatted}</span>
                          </div>
                        )}
                        {importPreview.exportTimestamp && (
                          <div className="flex justify-between">
                            <span className="text-text-body/60">Exported:</span>
                            <span className="text-text-body/70">{new Date(importPreview.exportTimestamp).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-pink-border/40 flex flex-col sm:flex-row items-stretch gap-1.5">
                        <button
                          type="button"
                          onClick={handleApplyAndSave}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-burgundy hover:bg-wine-dark text-white rounded font-medium text-[11px] transition-colors shadow-2xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{saving ? "Saving..." : "Apply & Save to Cloud"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyToEditorOnly}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-white hover:bg-pink-50 border border-pink-border text-wine-dark rounded font-medium text-[11px] transition-colors"
                        >
                          <FileUp className="w-3.5 h-3.5" />
                          <span>Load to Form</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelImport}
                          className="p-1.5 text-text-body/60 hover:text-wine-dark hover:bg-pink-50 rounded border border-transparent hover:border-pink-border transition-colors self-center sm:self-auto"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* 1-CLICK CLONE FROM PARENT WEBSITE (ZERO OVERLAP) */}
            <div className="mb-4 p-4 bg-gradient-to-r from-pink-50/50 to-white rounded-xl border border-pink-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <RefreshCw className="w-4 h-4 text-wine-dark" />
                  <h4 className="font-bold text-wine-dark text-xs uppercase tracking-wider">
                    Copy Full Data from Parent Website ({CURRENT_WEBSITE_DOC_ID})
                  </h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                    Parent Website Clone • Zero Overlap
                  </span>
                </div>
                <p className="text-xs text-text-body/75 font-sans leading-relaxed max-w-xl">
                  Clone all current couple information, timings, events, gallery, and media links from the parent website <code className="font-mono text-[11px] bg-pink-50 px-1 py-0.5 rounded border border-pink-border/40">{CURRENT_WEBSITE_DOC_ID}</code> into this active slot (<code className="font-mono text-[11px] font-bold text-wine-dark">{currentSlot}</code>). The parent document remains completely untouched.
                </p>
              </div>
              <button
                type="button"
                id="admin-copy-parent-btn"
                onClick={handleCopyFromParentWebsite}
                disabled={saving}
                className="shrink-0 flex items-center gap-2 bg-wine-dark hover:bg-burgundy text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{saving ? "Copying..." : "Copy Parent Data"}</span>
              </button>
            </div>

            {/* 1-CLICK CLONE FROM EARLIER ORIGINAL WEDDING (ZERO OVERLAP) */}
            <div className="mb-5 p-4 bg-white rounded-xl border border-pink-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <RefreshCw className="w-4 h-4 text-wine-dark" />
                  <h4 className="font-bold text-wine-dark text-xs uppercase tracking-wider">
                    Copy Full Data from Earlier Original ({EARLIER_ORIGINAL_DOC_ID})
                  </h4>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                    Safe Clone • Zero Overlap
                  </span>
                </div>
                <p className="text-xs text-text-body/75 font-sans leading-relaxed max-w-xl">
                  Clone all wedding details, bride & groom profiles, events, and gallery items directly from the earlier <code className="font-mono text-[11px] bg-pink-50 px-1 py-0.5 rounded border border-pink-border/40">{EARLIER_ORIGINAL_DOC_ID}</code> document into this new slot (<code className="font-mono text-[11px] font-bold text-wine-dark">{currentSlot}</code>). The original document is strictly protected and never modified.
                </p>
              </div>
              <button
                type="button"
                id="admin-copy-earlier-btn"
                onClick={handleCopyFromEarlierOriginal}
                disabled={saving}
                className="shrink-0 flex items-center gap-2 bg-wine-dark hover:bg-burgundy text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{saving ? "Copying..." : "Copy Data to New Slot"}</span>
              </button>
            </div>

            {/* Uploaded Files & Media List */}
            <div className="mt-4 pt-4 border-t border-pink-border/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-wine-dark">Uploaded Media & Files ({mediaFilesList.length})</h3>
                  <p className="text-[11px] text-text-body/70 font-sans">
                    All media files and videos uploaded to this wedding website. Click to download or copy direct links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadAllLinksTxt}
                  className="flex items-center gap-1.5 text-xs text-wine-dark hover:text-burgundy bg-blush-light px-2.5 py-1 rounded border border-pink-border font-sans font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Links (.txt)</span>
                </button>
              </div>

              {mediaFilesList.length === 0 ? (
                <p className="text-xs text-text-body/60 italic font-sans py-2">No media files currently uploaded.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {mediaFilesList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-blush-light/50 rounded-lg border border-pink-border/40 text-xs font-sans gap-2">
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                        {item.type === "video" ? (
                          <Video className="w-3.5 h-3.5 text-wine-dark shrink-0" />
                        ) : item.type === "audio" ? (
                          <Music className="w-3.5 h-3.5 text-wine-dark shrink-0" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-wine-dark shrink-0" />
                        )}
                        <span className="font-semibold text-wine-dark shrink-0">{item.label}:</span>
                        <span className="truncate text-text-body/70 text-[11px]">{item.url}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.url || "", idx)}
                          className="p-1 text-wine-dark hover:bg-white rounded transition-colors"
                          title="Copy Link"
                        >
                          {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadAsset(item.url || "", item.filename)}
                          className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-blush-light border border-pink-border/60 rounded text-[11px] font-medium text-wine-dark transition-colors"
                          title="Download File"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Couple Details */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Couple Details (Bride & Groom)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
                <h3 className="font-bold text-burgundy">Bride Details</h3>
                <Input label="Name" value={data.bride.name} onChange={(v) => handleChange("bride.name", v)} />
                <Input label="Parents" value={data.bride.parents} onChange={(v) => handleChange("bride.parents", v)} />
                <Input label="Education" value={data.bride.education} onChange={(v) => handleChange("bride.education", v)} />
                <Input label="Profession" value={data.bride.profession} onChange={(v) => handleChange("bride.profession", v)} />
              </div>
              <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
                <h3 className="font-bold text-wine-dark">Groom Details</h3>
                <Input label="Name" value={data.groom.name} onChange={(v) => handleChange("groom.name", v)} />
                <Input label="Parents" value={data.groom.parents} onChange={(v) => handleChange("groom.parents", v)} />
                <Input label="Education" value={data.groom.education} onChange={(v) => handleChange("groom.education", v)} />
                <Input label="Profession" value={data.groom.profession} onChange={(v) => handleChange("groom.profession", v)} />
              </div>
            </div>
          </section>

          {/* Event Details */}
          <section>
             <h2 className="text-xl font-bold text-wine-dark mb-4">Event Date & Time</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Target Date (Countdown ISO)" value={data.weddingDate} onChange={(v) => handleChange("weddingDate", v)} type="datetime-local" />
                <Input label="Formatted Date" value={data.weddingDateFormatted} onChange={(v) => handleChange("weddingDateFormatted", v)} />
                <Input label="Formatted Time" value={data.weddingTimeFormatted} onChange={(v) => handleChange("weddingTimeFormatted", v)} />
                <Input label="Day of Week" value={data.weddingDayFormatted} onChange={(v) => handleChange("weddingDayFormatted", v)} />
             </div>
          </section>

          {/* Messages */}
          <section>
             <h2 className="text-xl font-bold text-wine-dark mb-4">Messages &amp; Text</h2>
             <div className="space-y-4">
               <Input label="Elder Invitation By (e.g. Grandmother Sdn. Jasmer Kaur)" value={data.invitedBy || ""} onChange={(v) => handleChange("invitedBy", v)} />
               <TextArea label="Hero Message" value={data.heroMessage} onChange={(v) => handleChange("heroMessage", v)} />
               <TextArea label="Invitation Message" value={data.invitationMessage} onChange={(v) => handleChange("invitationMessage", v)} />
               <Input label="Family Regards (e.g. Bhusari Family)" value={data.familyRegards || ""} onChange={(v) => handleChange("familyRegards", v)} />
               <TextArea label="Transportation Details" value={data.transportation} onChange={(v) => handleChange("transportation", v)} />
               <Input label="Dress Code" value={data.dressCode} onChange={(v) => handleChange("dressCode", v)} />
               <TextArea label="Closing Message" value={data.closingMessage} onChange={(v) => handleChange("closingMessage", v)} />
             </div>
          </section>

          {/* Family Blessings & Twinkle Stars */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Family Blessings &amp; Twinkle Stars</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Dada Ji (Grandfather)" 
                  value={data.familyDetails?.groomSide?.grandfather || ""} 
                  onChange={(v) => handleChange("familyDetails.groomSide.grandfather", v)} 
                />
                <Input 
                  label="Dadi Ji (Grandmother)" 
                  value={data.familyDetails?.groomSide?.grandmother || ""} 
                  onChange={(v) => handleChange("familyDetails.groomSide.grandmother", v)} 
                />
                <Input 
                  label="Grand Uncle" 
                  value={data.familyDetails?.groomSide?.grandUncle || ""} 
                  onChange={(v) => handleChange("familyDetails.groomSide.grandUncle", v)} 
                />
                <Input 
                  label="✨ Twinkle Stars of Family (Children)" 
                  value={data.familyDetails?.groomSide?.TwinkleStars || (data.familyDetails?.groomSide as any)?.twinkleStars || ""} 
                  onChange={(v) => {
                    handleChange("familyDetails.groomSide.TwinkleStars", v);
                    handleChange("familyDetails.specialInvitation", v);
                  }} 
                />
                <Input 
                  label="Respected Father (Groom Side)" 
                  value={data.familyDetails?.groomSide?.father || ""} 
                  onChange={(v) => handleChange("familyDetails.groomSide.father", v)} 
                />
                <Input 
                  label="Respected Mother (Groom Side)" 
                  value={data.familyDetails?.groomSide?.mother || ""} 
                  onChange={(v) => handleChange("familyDetails.groomSide.mother", v)} 
                />
                <Input 
                  label="Brother" 
                  value={data.familyDetails?.groomSide?.brother || ""} 
                  onChange={(v) => handleChange("familyDetails.groomSide.brother", v)} 
                />
                <Input 
                  label="Sister-in-Law (Bhabhi)" 
                  value={data.familyDetails?.groomSide?.brotherWife || ""} 
                  onChange={(v) => handleChange("familyDetails.groomSide.brotherWife", v)} 
                />
                <Input 
                  label="Taya Ji" 
                  value={data.familyDetails?.groomSide?.tayaJi || ""} 
                  onChange={(v) => handleChange("familyDetails.groomSide.tayaJi", v)} 
                />
                <Input 
                  label="Tayi Ji" 
                  value={data.familyDetails?.groomSide?.tayiJi || ""} 
                  onChange={(v) => handleChange("familyDetails.groomSide.tayiJi", v)} 
                />
                <Input 
                  label="Bride's Father" 
                  value={data.familyDetails?.brideSide?.father || ""} 
                  onChange={(v) => handleChange("familyDetails.brideSide.father", v)} 
                />
                <Input 
                  label="Bride's Mother" 
                  value={data.familyDetails?.brideSide?.mother || ""} 
                  onChange={(v) => handleChange("familyDetails.brideSide.mother", v)} 
                />
              </div>
            </div>
          </section>

          {/* RSVP & Contact Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">RSVP &amp; Contact Details</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              <Input 
                label="RSVP Address / Shop Venue" 
                value={data.rsvpAddress || ""} 
                onChange={(v) => handleChange("rsvpAddress", v)} 
              />
              <Input 
                label="RSVP Phone 1 (e.g. 7754845678)" 
                value={data.rsvpPhones?.[0] || ""} 
                onChange={(v) => {
                  const phones = [...(data.rsvpPhones || ["", ""])];
                  phones[0] = v;
                  handleChange("rsvpPhones", phones);
                }} 
              />
              <Input 
                label="RSVP Phone 2 (e.g. 7755045678)" 
                value={data.rsvpPhones?.[1] || ""} 
                onChange={(v) => {
                  const phones = [...(data.rsvpPhones || ["", ""])];
                  phones[1] = v;
                  handleChange("rsvpPhones", phones);
                }} 
              />
            </div>
          </section>

          {/* Events */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Events</h2>
            <div className="space-y-4">
              {data.events.map((event, idx) => (
                <div key={event.id || idx} className="bg-blush-light p-4 rounded-lg border border-pink-border/50 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-wine-dark">Event {idx + 1}</h3>
                    <button onClick={() => {
                      const newEvents = [...data.events];
                      newEvents.splice(idx, 1);
                      handleChange("events", newEvents);
                    }} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm">Remove</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Event Title" value={event.title} onChange={(v) => handleChange(`events.${idx}.title`, v)} />
                    <Input label="Date" value={event.date} type="date" onChange={(v) => handleChange(`events.${idx}.date`, v)} />
                    <Input label="Time (e.g., 7:00 PM)" value={event.time} onChange={(v) => handleChange(`events.${idx}.time`, v)} />
                    <Input label="Location Name" value={event.location} onChange={(v) => handleChange(`events.${idx}.location`, v)} />
                    <Input label="Timeline Message" value={event.description || ""} onChange={(v) => handleChange(`events.${idx}.description`, v)} />
                    <Input label="Sacred Quote / Gurmukhi Tuk" value={event.quote || ""} onChange={(v) => handleChange(`events.${idx}.quote`, v)} />
                    <Input label="Video URL (.mp4)" value={event.videoUrl || ""} onChange={(v) => handleChange(`events.${idx}.videoUrl`, v)} />
                    <Input label="Map Link (URL)" value={event.mapUrl || ""} onChange={(v) => handleChange(`events.${idx}.mapUrl`, v)} />
                  </div>
                </div>
              ))}
              <button onClick={() => {
                const newEvent = {
                  id: Date.now().toString(),
                  title: "New Event",
                  date: "",
                  time: "",
                  location: "",
                  videoUrl: "",
                  mapUrl: ""
                };
                handleChange("events", [...data.events, newEvent]);
              }} className="text-wine-dark hover:bg-blush-light px-4 py-2 rounded-md border border-pink-border w-full text-center">
                + Add Event
              </button>
            </div>
          </section>

          {/* Media Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Media Settings</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              
              <div className="flex flex-col gap-2">
                <h3 className="font-bold">Opening Thumbnail (Click to Enter)</h3>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleSingleImageUpload(e, 'openingThumbnailUrl')}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer"
                />
                <Input label="Or Thumbnail URL" value={data.openingThumbnailUrl || ""} onChange={(v) => handleChange("openingThumbnailUrl", v)} />
                {data.openingThumbnailUrl && <img src={data.openingThumbnailUrl} className="w-24 h-24 object-cover rounded-md mt-2 border border-pink-border" alt="Thumbnail Preview" />}
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Hero Religious Icon / Waheguru Logo (Background-Removed)</h3>
                  {data.heroLogoUrl && (
                    <button 
                      type="button" 
                      onClick={() => handleChange("heroLogoUrl", "")}
                      className="text-xs text-red-600 hover:underline font-sans"
                    >
                      Clear / Reset to Text ੴ
                    </button>
                  )}
                </div>
                <p className="text-xs opacity-75 font-sans">
                  Upload or link a transparent, background-removed image (.png, .webp, or .svg) to replace the symbol above the couple's names in the Hero section.
                </p>
                
                <input 
                  type="file" 
                  accept="image/png,image/webp,image/svg+xml,image/*"
                  onChange={(e) => handleSingleImageUpload(e, 'heroLogoUrl')}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer"
                />
                <Input 
                  label="Or Logo Image URL (.png / .svg with transparent background)" 
                  value={data.heroLogoUrl || ""} 
                  onChange={(v) => handleChange("heroLogoUrl", v)} 
                />

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-wine-dark font-sans">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleChange("heroLogoUrl", "/ikonkar-gold.svg")}
                    className="text-xs bg-white border border-pink-border px-2.5 py-1 rounded hover:bg-blush-light text-wine-dark font-sans transition-colors"
                  >
                    ੴ Golden Ik Onkar (SVG)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("heroLogoUrl", "/khanda-gold.svg")}
                    className="text-xs bg-white border border-pink-border px-2.5 py-1 rounded hover:bg-blush-light text-wine-dark font-sans transition-colors"
                  >
                    ⚔️ Golden Khanda Sahib (SVG)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("heroLogoUrl", "")}
                    className="text-xs bg-white border border-pink-border px-2.5 py-1 rounded hover:bg-blush-light text-wine-dark font-sans transition-colors"
                  >
                    Typographic ੴ
                  </button>
                </div>

                {/* Transparency Preview Container */}
                <div className="mt-2 p-3 bg-white rounded-lg border border-pink-border/80 flex items-center justify-center gap-4 shadow-2xs">
                  <div className="text-center">
                    <p className="text-[10px] text-wine-dark/75 uppercase tracking-widest font-sans mb-1.5 font-semibold">
                      Hero Preview (White Shade Background)
                    </p>
                    {data.heroLogoUrl ? (
                      <img 
                        src={data.heroLogoUrl} 
                        className="h-16 w-auto max-w-[150px] object-contain drop-shadow-sm mx-auto" 
                        alt="Hero Logo Preview" 
                      />
                    ) : (
                      <span className="text-4xl text-wine-dark font-serif font-bold drop-shadow-sm">
                        ੴ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Opening Video</h3>
                <p className="text-xs opacity-70">Plays immediately after clicking the thumbnail. Must be a direct URL (e.g., .mp4).</p>
                <Input label="Video URL" value={data.openingVideoUrl || ""} onChange={(v) => handleChange("openingVideoUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Opening Quote Page Background Image</h3>
                <p className="text-xs opacity-70">Optional background image for the sacred quote page that appears after the opening video. Direct image URL.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input label="Quote Page Background Image URL" value={data.openingQuoteBgUrl || ""} onChange={(v) => handleChange("openingQuoteBgUrl", v)} />
                  </div>
                  {data.openingQuoteBgUrl && (
                    <div className="w-16 h-16 rounded border border-pink-border overflow-hidden flex-shrink-0 bg-white shadow-2xs">
                      <img src={data.openingQuoteBgUrl} alt="Quote Background Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">OG Image URL (Social Sharing Preview)</h3>
                <p className="text-xs opacity-70">Image shown when sharing the link on WhatsApp, Facebook, etc. Direct URL.</p>
                <Input label="OG Image URL" value={data.ogImageUrl || ""} onChange={(v) => handleChange("ogImageUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Hero Section Video</h3>
                <p className="text-xs opacity-70">Background video for the first section. Must be a direct URL (e.g., .mp4).</p>
                <Input label="Hero Video URL" value={data.heroVideoUrl || ""} onChange={(v) => handleChange("heroVideoUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Opening Background Music</h3>
                <p className="text-xs opacity-70">Plays during the opening video and quote reveal interlude. Direct link to .mp3 file.</p>
                <Input label="Opening Music URL" value={data.openingMusicUrl || ""} onChange={(v) => handleChange("openingMusicUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Website Background Music</h3>
                <p className="text-xs opacity-70">Direct link to an audio file (e.g., .mp3) to play across the main website.</p>
                <Input label="Music URL" value={data.musicUrl || ""} onChange={(v) => handleChange("musicUrl", v)} />
              </div>
            </div>
          </section>

          {/* Venue Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Venue Details</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              <Input label="Venue Name" value={data.venue.name} onChange={(v) => handleChange("venue.name", v)} />
              <Input label="Address Line 1" value={data.venue.addressLine1} onChange={(v) => handleChange("venue.addressLine1", v)} />
              <Input label="Address Line 2" value={data.venue.addressLine2} onChange={(v) => handleChange("venue.addressLine2", v)} />
              <Input label="Google Maps URL" value={data.venue.mapUrl} onChange={(v) => handleChange("venue.mapUrl", v)} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</label>
      <textarea 
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent resize-y"
      />
    </div>
  );
}
