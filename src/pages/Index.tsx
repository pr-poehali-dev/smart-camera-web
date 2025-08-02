import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const photos = [
    {
      id: 1,
      image: '/img/429a7a77-4f78-4e04-86b9-4758558f386d.jpg',
      title: 'Архитектура',
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 2,
      image: '/img/bb86fae5-df9b-4614-91a1-0b3168740abb.jpg',
      title: 'Городская среда',
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    }
  ];

  const handlePhotoHover = (enter: boolean) => {
    setIsHovering(enter);
    if (videoRef.current) {
      if (enter) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  };

  const switchPhoto = (index: number) => {
    setCurrentPhoto(index);
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div className="min-h-screen bg-white font-['Helvetica',sans-serif]">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Camera" size={24} className="text-[#3B82F6]" />
            <h1 className="text-xl font-bold text-black">SMART CAMERA</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-black hover:bg-gray-50">
              <Icon name="Menu" size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-black mb-4 tracking-tight">
              УМНАЯ КАМЕРА
            </h2>
            <p className="text-lg text-gray-600 font-['Arial',sans-serif] max-w-2xl mx-auto">
              Наведите курсор на фотографию для воспроизведения видео
            </p>
          </div>

          {/* Camera Interface */}
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
            {/* Photo Preview */}
            <Card className="relative w-full max-w-md aspect-[4/3] overflow-hidden bg-black group shadow-2xl">
              <div
                className="relative w-full h-full cursor-pointer"
                onMouseEnter={() => handlePhotoHover(true)}
                onMouseLeave={() => handlePhotoHover(false)}
              >
                {/* Photo */}
                <img
                  src={photos[currentPhoto].image}
                  alt={photos[currentPhoto].title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    isHovering ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                
                {/* Video */}
                <video
                  ref={videoRef}
                  src={photos[currentPhoto].video}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    isHovering ? 'opacity-100' : 'opacity-0'
                  }`}
                  muted
                  loop
                  playsInline
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                
                {/* Play Icon Indicator */}
                <div className={`absolute top-4 right-4 transition-all duration-300 ${
                  isHovering ? 'opacity-100 scale-110' : 'opacity-60 scale-100'
                }`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <Icon name={isHovering ? "Pause" : "Play"} size={20} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Photo Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white font-medium font-['Arial',sans-serif]">
                  {photos[currentPhoto].title}
                </h3>
                <p className="text-white/80 text-sm">
                  Фото {currentPhoto + 1} из {photos.length}
                </p>
              </div>
            </Card>

            {/* Controls */}
            <div className="flex flex-col space-y-6">
              {/* Photo Selector */}
              <div className="flex flex-col space-y-3">
                <h3 className="text-lg font-medium text-black mb-2">Выберите фото:</h3>
                {photos.map((photo, index) => (
                  <Button
                    key={photo.id}
                    variant={currentPhoto === index ? "default" : "outline"}
                    onClick={() => switchPhoto(index)}
                    className={`justify-start text-left h-auto p-4 ${
                      currentPhoto === index 
                        ? 'bg-[#3B82F6] text-white border-[#3B82F6]' 
                        : 'text-black border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 rounded overflow-hidden bg-gray-100">
                        <img
                          src={photo.image}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-['Arial',sans-serif]">{photo.title}</span>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Instructions */}
              <Card className="p-4 bg-gray-50 border-gray-200">
                <div className="flex items-start space-x-3">
                  <Icon name="Info" size={20} className="text-[#3B82F6] mt-0.5" />
                  <div>
                    <h4 className="font-medium text-black mb-1">Как использовать:</h4>
                    <p className="text-sm text-gray-600 font-['Arial',sans-serif]">
                      Наведите курсор на фотографию для автоматического воспроизведения видео
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;