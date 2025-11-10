import PropTypes from 'prop-types';
import { useMemo } from 'react';

const VideoPlayer = ({ videoUrl, title, fallback }) => {
  const isYouTube = useMemo(() => videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be'), [videoUrl]);

  if (!videoUrl) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-dashed border-purple-200 bg-purple-50 text-sm font-medium text-purple-500 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-200">
        {fallback || 'Video content coming soon'}
      </div>
    );
  }

  if (isYouTube) {
    const embedUrl = videoUrl
      .replace('watch?v=', 'embed/')
      .replace('youtu.be/', 'youtube.com/embed/');

    return (
      <iframe
        className="aspect-video w-full rounded-3xl border border-slate-200 shadow-lg dark:border-slate-800"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video
      controls
      className="w-full rounded-3xl border border-slate-200 shadow-lg dark:border-slate-800"
      title={title}
    >
      <source src={videoUrl} />
      Your browser does not support the video tag.
    </video>
  );
};

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string,
  title: PropTypes.string,
  fallback: PropTypes.node
};

VideoPlayer.defaultProps = {
  videoUrl: '',
  title: 'Course video',
  fallback: null
};

export default VideoPlayer;

