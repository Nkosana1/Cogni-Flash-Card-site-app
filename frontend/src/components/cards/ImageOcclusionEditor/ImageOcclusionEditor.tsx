import React, { useState, useRef } from 'react';
import { ImageOcclusionRegion } from '@/types';
import { Button } from '@/components/ui/Button';

export interface ImageOcclusionEditorProps {
  cardData: Record<string, any>;
  onDataChange: (data: Record<string, any>) => void;
  className?: string;
}

export const ImageOcclusionEditor: React.FC<ImageOcclusionEditorProps> = ({
  cardData,
  onDataChange,
  className,
}) => {
  const [imageUrl, setImageUrl] = useState(cardData?.image?.url || '');
  const [regions, setRegions] = useState<ImageOcclusionRegion[]>(
    cardData?.regions || []
  );
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImageUrl(url);
      
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        onDataChange({
          ...cardData,
          image: {
            url,
            width: img.width,
            height: img.height,
          },
          regions,
        });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const addRegion = () => {
    const newRegion: ImageOcclusionRegion = {
      id: regions.length + 1,
      x: 0.2,
      y: 0.2,
      width: 0.3,
      height: 0.3,
      label: `Region ${regions.length + 1}`,
    };
    const updatedRegions = [...regions, newRegion];
    setRegions(updatedRegions);
    updateCardData(updatedRegions);
  };

  const updateRegion = (id: number, updates: Partial<ImageOcclusionRegion>) => {
    const updatedRegions = regions.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    setRegions(updatedRegions);
    updateCardData(updatedRegions);
  };

  const deleteRegion = (id: number) => {
    const updatedRegions = regions.filter((r) => r.id !== id);
    setRegions(updatedRegions);
    updateCardData(updatedRegions);
  };

  const updateCardData = (updatedRegions: ImageOcclusionRegion[]) => {
    onDataChange({
      ...cardData,
      image: cardData?.image || { url: imageUrl },
      regions: updatedRegions,
    });
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Occlusion image"
              className="mt-2 max-w-full h-auto border border-gray-300 rounded-lg"
            />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Occlusion Regions
            </label>
            <Button size="sm" onClick={addRegion}>
              Add Region
            </Button>
          </div>

          <div className="space-y-2">
            {regions.map((region) => (
              <div
                key={region.id}
                className={`p-3 border rounded-lg ${
                  selectedRegion === region.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedRegion(region.id)}
              >
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Label</label>
                    <input
                      type="text"
                      value={region.label}
                      onChange={(e) =>
                        updateRegion(region.id, { label: e.target.value })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hint (optional)</label>
                    <input
                      type="text"
                      value={region.hint || ''}
                      onChange={(e) =>
                        updateRegion(region.id, { hint: e.target.value })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">X</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={region.x}
                      onChange={(e) =>
                        updateRegion(region.id, { x: parseFloat(e.target.value) })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Y</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={region.y}
                      onChange={(e) =>
                        updateRegion(region.id, { y: parseFloat(e.target.value) })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Width</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={region.width}
                      onChange={(e) =>
                        updateRegion(region.id, { width: parseFloat(e.target.value) })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Height</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={region.height}
                      onChange={(e) =>
                        updateRegion(region.id, { height: parseFloat(e.target.value) })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteRegion(region.id)}
                  className="mt-2 text-xs text-red-600 hover:text-red-700"
                >
                  Delete Region
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

