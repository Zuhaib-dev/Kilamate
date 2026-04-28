import React, { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ShareButtonProps {
  snapshotRef: React.RefObject<HTMLDivElement>;
  cityName: string;
  lat?: number;
  lon?: number;
}

export function ShareButton({ snapshotRef, cityName, lat, lon }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  // Build canonical city-page URL
  const shareUrl = lat && lon
    ? `https://kilamate.netlify.app/city/${encodeURIComponent(cityName)}?lat=${lat}&lon=${lon}`
    : `https://kilamate.netlify.app`;

  const handleShare = async () => {
    if (!snapshotRef.current) return;

    try {
      setIsSharing(true);
      toast.loading("Generating snapshot…", { id: "share-toast" });

      // Capture the hidden snapshot at 2× for retina quality
      const canvas = await html2canvas(snapshotRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      // Convert canvas → blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png", 1.0);
      });

      if (!blob) throw new Error("Failed to generate image blob");

      const safeName = cityName.toLowerCase().replace(/\s+/g, "-");
      const file = new File([blob], `kilamate-${safeName}-weather.png`, {
        type: "image/png",
      });

      toast.dismiss("share-toast");

      // ── Native Web Share (mobile) ──
      if (navigator.share) {
        const shareData: ShareData = {
          title: `${cityName} Weather on Kilamate`,
          text: `📍 Check out the current weather in ${cityName}! View the full forecast here:`,
          url: shareUrl,
        };

        // Attach image only if the browser supports file sharing
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          (shareData as any).files = [file];
        }

        await navigator.share(shareData);
        toast.success("Shared successfully!");
        return;
      }

      // ── Desktop fallback: download image + copy link ──
      const objUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = file.name;
      link.href = objUrl;
      link.click();
      URL.revokeObjectURL(objUrl);

      // Also copy the link to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Image downloaded & link copied to clipboard!");
      } catch {
        toast.success("Snapshot downloaded!");
      }
    } catch (error: any) {
      // User dismissed the native share sheet — not a real error
      if (error?.name === "AbortError") return;
      console.error("Share error:", error);
      toast.error("Failed to share. Please try again.", { id: "share-toast" });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            disabled={isSharing}
            className={`transition-all duration-300 ${
              isSharing
                ? "opacity-70"
                : "hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            }`}
          >
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share weather snapshot + link</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
