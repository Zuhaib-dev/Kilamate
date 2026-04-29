import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useWeatherNews } from "@/hooks/use-weather-news";
import { formatDistanceToNow } from "date-fns";
import { Newspaper, ExternalLink, Clock, Radio, RefreshCw, ImageOff } from "lucide-react";
import { memo, useState } from "react";

interface WeatherNewsFeedProps {
  locationName: string;
}

function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="flex gap-3 p-3 rounded-xl border border-border/40 bg-muted/20 animate-pulse"
    >
      <div className="w-20 h-16 shrink-0 rounded-lg bg-muted" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-muted rounded-full w-3/4" />
        <div className="h-3 bg-muted rounded-full w-full" />
        <div className="h-2 bg-muted rounded-full w-1/3" />
      </div>
    </motion.div>
  );
}

export const WeatherNewsFeed = memo(function WeatherNewsFeed({ locationName }: WeatherNewsFeedProps) {
  const { data: articles, isLoading, isError, refetch, isFetching } = useWeatherNews(locationName);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const displayed = articles?.slice(0, 6) ?? [];

  return (
    <motion.div
      whileHover={{ scale: 1.003, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-card/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2.5 text-base font-bold tracking-tight">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="p-1.5 rounded-xl bg-rose-500/15 relative"
              >
                <Newspaper className="h-4 w-4 text-rose-500" />
                {/* Live dot */}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500">
                  <motion.span
                    className="absolute inset-0 rounded-full bg-rose-400"
                    animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </span>
              </motion.div>
              Live Weather News
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                <Radio className="h-2.5 w-2.5" />
                Live
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => refetch()}
                className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground transition-colors"
                title="Refresh news"
              >
                <motion.div animate={isFetching ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.8, repeat: isFetching ? Infinity : 0, ease: "linear" }}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </motion.div>
              </motion.button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest weather & climate news for <span className="font-semibold text-foreground">{locationName}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-2 pt-0">
          {/* Loading skeletons */}
          {isLoading && (
            <div className="space-y-2">
              {[0, 1, 2, 3].map(i => <SkeletonCard key={i} delay={i * 0.07} />)}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center py-10 text-muted-foreground">
              <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Couldn't load news right now.</p>
              <button
                onClick={() => refetch()}
                className="mt-3 text-xs font-bold text-primary underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && displayed.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No news found for this location.</p>
            </div>
          )}

          {/* News articles */}
          <AnimatePresence>
            {displayed.map((article, i) => {
              const isExp = expanded === i;
              const hasImg = !!article.image && !imgErrors.has(i);

              return (
                <motion.article
                  key={article.url}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 26 }}
                  layout
                  className={`group relative rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
                    ${isExp
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border/70"
                    }`}
                  onClick={() => setExpanded(isExp ? null : i)}
                >
                  {/* Accent line on hover/expand */}
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-rose-500"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: isExp ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  />

                  <div className="flex gap-3 p-3">
                    {/* Thumbnail */}
                    <div className="shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {hasImg ? (
                        <img
                          src={article.image!}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={() => setImgErrors(prev => new Set(prev).add(i))}
                          loading="lazy"
                        />
                      ) : (
                        <ImageOff className="h-5 w-5 text-muted-foreground/30" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className={`text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors ${isExp ? "text-primary line-clamp-none" : ""}`}>
                        {article.title}
                      </p>

                      {/* Source + Time */}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-bold uppercase tracking-wide truncate max-w-[100px]">
                          {article.source.name}
                        </span>
                        <span>·</span>
                        <Clock className="h-2.5 w-2.5 shrink-0" />
                        <span className="shrink-0">{timeAgo(article.publishedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded description */}
                  <AnimatePresence>
                    {isExp && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-3 border-t border-border/30 pt-3">
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                            {article.description || article.content?.slice(0, 200)}
                          </p>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline underline-offset-2"
                          >
                            Read full article
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </AnimatePresence>

          {/* Footer */}
          {displayed.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-[10px] text-muted-foreground/50 pt-2 font-medium"
            >
              Powered by GNews · Updated every 30 min
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
