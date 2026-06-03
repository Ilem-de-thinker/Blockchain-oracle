import React, { useMemo } from 'react';

interface VideoPlayerProps {
  url: string;
  onReady: () => void;
}

const getEmbedUrl = (url: string) => {
  const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1].split('&')[0];
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
  }
  const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url;
};

function isEmbedUrl(url: string) {
  return url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/');
}

export default function VideoPlayer({ url, onReady }: VideoPlayerProps) {
  const embedUrl = useMemo(() => getEmbedUrl(url), [url]);
  const isEmbed = isEmbedUrl(embedUrl);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="w-full bg-bg-secondary shadow-xl overflow-hidden md:rounded-2xl ring-1 ring-border shrink-0 border border-border">
        <div className="relative aspect-video group">
          {isEmbed ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={onReady}
            />
          ) : (
            <video
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              controls
              onEnded={onReady}
            />
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-text">Lesson Transcript & Notes</h3>
          <div className="prose prose-base max-w-4xl font-medium leading-relaxed text-text
            prose-headings:text-text prose-p:text-text prose-strong:text-text
            prose-li:text-text prose-li:leading-relaxed prose-a:text-primary dark:prose-invert">
            <p>
              In this video session, we dive deep into the core mechanics of interactive state management.
              We'll explore how <strong>React hooks</strong> drive UI transitions and how to optimize re-renders for mobile viewports.
            </p>
            <ul>
              <li>Understanding the Lifecycle of a User Interaction</li>
              <li>Implementing Smooth Hardware-Accelerated Transitions</li>
              <li>Managing Focus and Accessibility in Custom Components</li>
            </ul>
            <p>
              Remember to take notes on the visual feedback patterns discussed around the 5-minute mark,
              as these are crucial for achieving the "polish" expected in high-end applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
