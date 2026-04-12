import React from 'react';

// Detect video type from URL and return appropriate embed
function getEmbedUrl(url) {
  if (!url) return null;

  // Loom
  if (url.includes('loom.com')) {
    const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (match) return `https://www.loom.com/embed/${match[1]}`;
    // Already an embed URL
    if (url.includes('/embed/')) return url;
  }

  // Tella
  if (url.includes('tella.tv') || url.includes('tella.video')) {
    const match = url.match(/tella\.(?:tv|video)\/video\/([a-zA-Z0-9-]+)/);
    if (match) return `https://www.tella.tv/video/${match[1]}/embed`;
    if (url.includes('/embed')) return url;
  }

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;
  }

  // Fallback — try as-is
  return url;
}

export default function VideoPlayer({ url, title }) {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="w-full aspect-video bg-gray-800/50 rounded-2xl flex items-center justify-center border border-gray-700/50">
        <p className="text-gray-500 text-sm">No video for this lesson</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-gray-700/50 bg-black">
      <iframe
        src={embedUrl}
        title={title || 'Lesson Video'}
        className="w-full h-full"
        style={{ border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
