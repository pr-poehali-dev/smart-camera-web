import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedPhoto, setDetectedPhoto] = useState<number | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const photos = [
    {
      id: 1,
      image: '/img/429a7a77-4f78-4e04-86b9-4758558f386d.jpg',
      title: 'Архитектура',
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      keywords: ['building', 'architecture', 'geometric', 'facade']
    },
    {
      id: 2,
      image: '/img/bb86fae5-df9b-4614-91a1-0b3168740abb.jpg',
      title: 'Городская среда',
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      keywords: ['street', 'city', 'urban', 'glass']
    }
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setCameraPermission('granted');
        startDetection();
      }
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
      setCameraPermission('denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsDetecting(false);
    setDetectedPhoto(null);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
    }
  };

  // Простая система обнаружения на основе анализа цветов и яркости
  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Устанавливаем размеры canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Рисуем текущий кадр на canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Получаем данные пикселей
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Анализируем характеристики изображения
    let totalBrightness = 0;
    let bluePixels = 0;
    let geometricPatterns = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Яркость пикселя
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      
      // Подсчет синих оттенков (для городской среды)
      if (b > r && b > g && b > 120) {
        bluePixels++;
      }
      
      // Простое обнаружение геометрических паттернов
      if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
        geometricPatterns++;
      }
    }
    
    const pixelCount = data.length / 4;
    const avgBrightness = totalBrightness / pixelCount;
    const blueRatio = bluePixels / pixelCount;
    const geometricRatio = geometricPatterns / pixelCount;
    
    // Определяем тип объекта в кадре
    let detectedIndex = null;
    
    if (geometricRatio > 0.3 && avgBrightness > 100) {
      // Возможно архитектурное здание
      detectedIndex = 0;
    } else if (blueRatio > 0.1 && avgBrightness > 80) {
      // Возможно городская среда с стеклянными зданиями
      detectedIndex = 1;
    }
    
    if (detectedIndex !== null && detectedIndex !== detectedPhoto) {
      setDetectedPhoto(detectedIndex);
      // Запускаем соответствующее видео
      if (previewVideoRef.current) {
        previewVideoRef.current.src = photos[detectedIndex].video;
        previewVideoRef.current.play().catch(console.error);
      }
    } else if (detectedIndex === null && detectedPhoto !== null) {
      setDetectedPhoto(null);
      if (previewVideoRef.current) {
        previewVideoRef.current.pause();
      }
    }
  }, [detectedPhoto, photos]);

  const startDetection = () => {
    setIsDetecting(true);
    detectionIntervalRef.current = setInterval(analyzeFrame, 500); // Анализ каждые 500ms
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
            <div className={`w-3 h-3 rounded-full ${
              isCameraActive ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className="text-sm text-gray-600">
              {isCameraActive ? 'Активна' : 'Неактивна'}
            </span>
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
              Наведите камеру на фотографию для автоматического воспроизведения видео
            </p>
          </div>

          {/* Camera Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Camera Feed */}
            <Card className="relative aspect-[4/3] overflow-hidden bg-black shadow-2xl">
              {!isCameraActive ? (
                <div className="flex flex-col items-center justify-center h-full text-white">
                  <Icon name="Camera" size={64} className="mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Камера не активна</h3>
                  <p className="text-gray-300 text-center mb-6 px-4">
                    Разрешите доступ к камере для начала работы
                  </p>
                  <Button 
                    onClick={startCamera}
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                    disabled={cameraPermission === 'denied'}
                  >
                    <Icon name="Play" size={20} className="mr-2" />
                    Включить камеру
                  </Button>
                  {cameraPermission === 'denied' && (
                    <p className="text-red-400 text-sm mt-4">
                      Доступ к камере запрещен
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  
                  {/* Detection Status */}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isDetecting ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                      }`} />
                      <span className="text-white text-sm">
                        {detectedPhoto !== null 
                          ? `Обнаружено: ${photos[detectedPhoto].title}` 
                          : 'Поиск объектов...'}
                      </span>
                    </div>
                  </div>

                  {/* Camera Controls */}
                  <div className="absolute bottom-4 right-4">
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      size="sm"
                      className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                    >
                      <Icon name="Camera" size={16} className="mr-2" />
                      Остановить
                    </Button>
                  </div>
                </>
              )}
            </Card>

            {/* Video Preview */}
            <Card className="relative aspect-[4/3] overflow-hidden bg-black shadow-2xl">
              {detectedPhoto !== null ? (
                <>
                  <video
                    ref={previewVideoRef}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-medium text-lg">
                      {photos[detectedPhoto].title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      Видео воспроизводится автоматически
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white">
                  <Icon name="Monitor" size={64} className="mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Видео-превью</h3>
                  <p className="text-gray-300 text-center px-4">
                    Наведите камеру на фотографию для автоматического воспроизведения видео
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Reference Photos */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-black mb-6 text-center">
              Эталонные фотографии
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {photos.map((photo, index) => (
                <Card key={photo.id} className="overflow-hidden shadow-lg">
                  <div className="relative">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="w-full h-48 object-cover"
                    />
                    {detectedPhoto === index && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                        Обнаружено
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-black">{photo.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Покажите эту фотографию камере
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;