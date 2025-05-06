import { useState } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PropertyImage } from "@shared/schema";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-200 rounded-lg w-full">
        <AspectRatio ratio={4/3}>
          <div className="h-full w-full flex items-center justify-center text-gray-500">
            No images available
          </div>
        </AspectRatio>
      </div>
    );
  }

  // Find primary image first, then use that as the first image
  const primaryIndex = images.findIndex(img => img.isPrimary);
  const sortedImages = [...images];
  if (primaryIndex > 0) {
    const primaryImage = sortedImages.splice(primaryIndex, 1)[0];
    sortedImages.unshift(primaryImage);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <AspectRatio ratio={16/9}>
          <img 
            src={sortedImages[currentImage].url} 
            alt={`${title} - Image ${currentImage + 1}`} 
            className="object-cover w-full h-full"
          />
        </AspectRatio>
      </div>

      <Carousel className="w-full">
        <CarouselContent>
          {sortedImages.map((image, index) => (
            <CarouselItem key={image.id} className="basis-1/4 md:basis-1/5 lg:basis-1/6">
              <div 
                className={`overflow-hidden rounded-md border-2 cursor-pointer ${index === currentImage ? 'border-primary-600' : 'border-transparent'}`}
                onClick={() => setCurrentImage(index)}
              >
                <AspectRatio ratio={1}>
                  <img 
                    src={image.url} 
                    alt={`${title} - Thumbnail ${index + 1}`} 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
}
