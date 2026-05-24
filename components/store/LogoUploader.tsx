import { useState, useRef, ChangeEvent } from 'react';
import { Camera, X } from 'lucide-react';

interface LogoUploaderProps {
  logoUrl: string | null;
  onUpload: (file: File) => void;
  onClear: () => void;
}

export function LogoUploader({ logoUrl, onUpload, onClear }: LogoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative group">
      <div
        className={`w-24 h-24 rounded-full bg-sage-100 flex items-center justify-center border-2 transition-colors ${
          isDragging ? 'border-sage-500 bg-sage-50' : 'border-sage-200'
        } overflow-hidden cursor-pointer`}
        onClick={handleClick}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo Toko"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-2">
            <Camera className="w-8 h-8 text-sage-400 mb-1" />
            <span className="text-xs text-sage-500">Upload</span>
          </div>
        )}
      </div>

      {logoUrl && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
          aria-label="Hapus logo"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
}
