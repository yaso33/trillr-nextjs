
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePost } from "@/hooks/usePosts";
import { uploadMedia } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Clapperboard, Image as ImageIcon, Loader2, Send, Wand2, X } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useDropzone, type FileWithPath } from "react-dropzone";

interface Media {
  file: File | null;
  preview: string;
  type: "image" | "video";
}

export default function CreatePage() {
  const { user } = useAuth();
  const [media, setMedia] = useState<Media | null>(null);
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const createPostMutation = useCreatePost();

  const onDrop = useCallback(async (acceptedFiles: FileWithPath[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const type = file.type.startsWith("image") ? "image" : "video";
    const preview = URL.createObjectURL(file);
    setMedia({ file, preview, type });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [] },
    multiple: false,
    noClick: true,
    disabled: !!media,
  });

  const handleClearMedia = () => {
    if (media?.preview) {
      URL.revokeObjectURL(media.preview);
    }
    setMedia(null);
    setContent("");
  };

  const handlePublish = async () => {
    if (!media?.file || !user) return;

    setIsUploading(true);
    try {
      const { url } = await uploadMedia(media.file, user.id);
      await createPostMutation.mutateAsync({
        content,
        imageUrl: url,
      });
      handleClearMedia(); // Clear state on success
    } catch (error) {
      console.error("Publishing error:", error);
      // Optionally show a toast notification to the user
    } finally {
      setIsUploading(false);
    }
  };

  const charCount = content.length;
  const maxChars = 280;
  const charIndicatorColor = charCount > maxChars ? "text-red-500" : charCount > maxChars - 20 ? "text-yellow-500" : "text-foreground/40";

  return (
    <div {...getRootProps()} className="h-full w-full bg-background text-foreground font-sans antialiased overflow-hidden relative flex flex-col items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-background" />
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <AnimatePresence>
        {media ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl h-full flex flex-col md:flex-row gap-6 p-4 md:p-8"
          >
            {/* Left Side - Media Preview */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative flex items-center justify-center">
              <div className="absolute top-0 left-0">
                <Button variant="ghost" size="icon" onClick={handleClearMedia} className="rounded-full hover:bg-white/10">
                  <ArrowLeft size={20}/>
                </Button>
              </div>
              {media.type === "image" ? (
                <img src={media.preview} alt="Preview" className="max-h-full w-auto object-contain rounded-2xl shadow-2xl shadow-black/50" />
              ) : (
                <video src={media.preview} controls autoPlay loop className="max-h-full w-auto object-contain rounded-2xl shadow-2xl shadow-black/50" />
              )}
            </div>

            {/* Right Side - Editor */}
            <div className="w-full md:w-1/2 flex flex-col justify-between">
                <div>
                    <div className="relative">
                        <Textarea
                        placeholder="Add a caption..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={maxChars + 50} // allow some overflow before hard limit
                        className="w-full h-48 bg-white/5 backdrop-blur-sm border border-white/10 focus:ring-2 focus:ring-primary/50 focus:border-primary rounded-2xl text-base p-4 resize-none"
                        />
                        <div className={`absolute bottom-3 right-4 text-xs font-mono ${charIndicatorColor}`}>
                            {charCount}/{maxChars}
                        </div>
                    </div>
                    {/* Placeholder for future tools */}
                     <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" className="rounded-full border-white/20 bg-white/10 hover:bg-white/20 gap-2"><Wand2 size={16}/> Filters</Button>
                    </div>
                </div>

                <div className="mt-auto">
                    <Button
                        size="lg"
                        onClick={handlePublish}
                        disabled={isUploading || !content.trim() || createPostMutation.isPending}
                        className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary/80 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all duration-300 disabled:opacity-50"
                    >
                        {isUploading || createPostMutation.isPending ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publishing...</>
                        ) : (
                        <><Send className="mr-2 h-5 w-5" /> Publish</>
                        )}
                    </Button>
                </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "w-full max-w-2xl h-96 border-4 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center transition-colors duration-300",
              isDragActive && "border-primary/50 bg-primary/10"
            )}
          >
            <input {...getInputProps()} />
            <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-6">
              <ImageIcon size={40} className="text-foreground/70" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Drag & Drop Media</h2>
            <p className="text-foreground/50 mt-2">or click to browse</p>
             <Button variant="outline" className="mt-6 rounded-full border-white/20 bg-white/10 hover:bg-white/20" onClick={() => document.querySelector('input[type="file"]')?.click()}>
                Select File
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
