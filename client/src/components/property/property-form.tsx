import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { propertyTypes } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Property } from "@shared/schema";
import { Loader2, Upload } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.string().min(1, "Please select a property type"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  price: z.coerce.number().positive("Price must be positive"),
  bedrooms: z.coerce.number().min(0, "Bedrooms cannot be negative"),
  bathrooms: z.coerce.number().min(0, "Bathrooms cannot be negative"),
  area: z.coerce.number().positive("Area must be positive"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  amenities: z.array(z.number()).optional(),
});

type PropertyFormProps = {
  initialData?: Property;
  onSuccess?: (property: Property) => void;
};

export function PropertyForm({ initialData, onSuccess }: PropertyFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images?.map(img => img.url) || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isAddingImage, setIsAddingImage] = useState(false);

  // Fetch amenities
  const { data: amenities } = useQuery({
    queryKey: ["/api/amenities"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      price: Number(initialData.price),
      bedrooms: initialData.bedrooms,
      bathrooms: Number(initialData.bathrooms),
      area: initialData.area,
      latitude: Number(initialData.latitude),
      longitude: Number(initialData.longitude),
      amenities: initialData.amenities?.map(a => a.id) || [],
    } : {
      title: "",
      description: "",
      type: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      latitude: 0,
      longitude: 0,
      amenities: [],
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/properties", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/properties"] });
      toast({
        title: "Success",
        description: "Property created successfully",
      });

      // Handle image uploads if there are any
      if (imageUrls.length > 0) {
        uploadImages(data.id);
      } else if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("PUT", `/api/properties/${initialData?.id}`, data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/properties"] });
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${initialData?.id}`] });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ propertyId, url, isPrimary }: { propertyId: number; url: string; isPrimary: boolean }) => {
      const res = await apiRequest("POST", `/api/properties/${propertyId}/images`, { url, isPrimary });
      return res.json();
    },
  });

  const addImage = () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    setImageUrls([...imageUrls, newImageUrl]);
    setNewImageUrl("");
    setIsAddingImage(false);
  };

  const removeImage = (index: number) => {
    const newImages = [...imageUrls];
    newImages.splice(index, 1);
    setImageUrls(newImages);
  };

  const uploadImages = async (propertyId: number) => {
    try {
      // Upload images one by one
      for (let i = 0; i < imageUrls.length; i++) {
        await uploadImageMutation.mutateAsync({
          propertyId,
          url: imageUrls[i],
          isPrimary: i === 0, // Make first image the primary one
        });
      }

      if (onSuccess) {
        // Get the updated property with images
        const res = await fetch(`/api/properties/${propertyId}`);
        const updatedProperty = await res.json();
        onSuccess(updatedProperty);
      }
    } catch (error) {
      toast({
        title: "Warning",
        description: "Property was created but there was an issue uploading images",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!user || user.role !== 'owner') {
      toast({
        title: "Error",
        description: "Only property owners can create listings",
        variant: "destructive",
      });
      return;
    }

    if (initialData) {
      updatePropertyMutation.mutate(data);
    } else {
      createPropertyMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Modern Apartment in Downtown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your property..." 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include details about features, nearby amenities, and what makes this property special.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {propertyTypes.filter(type => type.id !== 'any').map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Rent ($)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Zip Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bedrooms</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bathrooms</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area (sq.ft)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.000001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use Google Maps to find coordinates
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.000001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {amenities?.map((amenity: any) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`amenity-${amenity.id}`}
                          checked={field.value?.includes(amenity.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), amenity.id]);
                            } else {
                              field.onChange(field.value?.filter(id => id !== amenity.id) || []);
                            }
                          }}
                        />
                        <label 
                          htmlFor={`amenity-${amenity.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {amenity.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Property Images</h3>
                {!isAddingImage && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddingImage(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                )}
              </div>

              {isAddingImage && (
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    placeholder="Image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <Button type="button" onClick={addImage} size="sm">
                    Add
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsAddingImage(false);
                      setNewImageUrl("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {imageUrls.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Property image ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-md text-gray-500">
                  No images added yet. Add at least one image.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => onSuccess?.(initialData as Property)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}
          >
            {(createPropertyMutation.isPending || updatePropertyMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData ? 'Update Property' : 'Create Property'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
