'use client';

interface VideoPlayerProps {
  videoUrl: string;
  fileName: string;
}

export default function VideoPlayer({ videoUrl, fileName }: VideoPlayerProps) {
  // Base64データかURLかを判定
  const isBase64 = videoUrl.startsWith('data:');

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      {isBase64 ? (
        <video
          controls
          className="w-full h-auto"
          preload="metadata"
          src={videoUrl}
        >
          お使いのブラウザは動画タグをサポートしていません。
        </video>
      ) : (
        <video
          controls
          className="w-full h-auto"
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/quicktime" />
          <source src={videoUrl} type="video/x-msvideo" />
          お使いのブラウザは動画タグをサポートしていません。
        </video>
      )}
      <div className="bg-gray-800 px-4 py-2">
        <p className="text-white text-sm">{fileName}</p>
      </div>
    </div>
  );
}
