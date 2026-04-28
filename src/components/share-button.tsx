import React, { useState } from "react";
import { Share2, Loader2, Download } from "lucide-react";
import { Button } from "./ui/button";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ShareButtonProps {
  snapshotRef: React.RefObject<HTMLDivElement>;
  cityName: string;
}

export function ShareButton({ snapshotRef, cityName }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!snapshotRef.current) return;

    try {
      setIsSharing(true);
      toast.loading("Generating snapshot...", { id: "share-toast" });

      // Generate canvas
      const canvas = await html2canvas(snapshotRef.current, {
        scale: 2, // High quality
        useCORS: true, // Allow external images (like weather icons)
        backgroundColor: null, // Transparent to keep gradient
        logging: false,
      });

      // Convert to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png", 1.0);
      });

      if (!blob) {
        throw new Error("Failed to generate image blob");
      }

      const file = new File([blob], `kilamate-${cityName.toLowerCase().replace(/\\s+/g, '-')}-weather.png`, {
        type: "image/png",
      });

      toast.dismiss("share-toast");

      // Check native share support
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${cityName} Weather`,
          text: `Current weather in ${cityName} via Kilamate`,
          files: [file],
        });
        toast.success("Shared successfully!");
      } else {
        // Fallback to download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = file.name;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Snapshot downloaded!");
      }
    } catch (error) {
      console.error("Error sharing snapshot:", error);
      toast.error("Failed to share snapshot. Please try again.", { id: "share-toast" });
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
            className={`transition-all duration-300 ${isSharing ? "opacity-70" : "hover:border-primary/50 hover:bg-primary/5 hover:text-primary"}`}
          >
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share Weather Snapshot</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
