import { useState } from "react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { propertyTypes, priceRanges } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { FilterIcon } from "lucide-react";

const formSchema = z.object({
  location: z.string().optional(),
  type: z.string().optional(),
  priceRange: z.string().optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  amenities: z.array(z.number()).optional(),
});

type SearchFiltersProps = {
  onSearch: (values: z.infer<typeof formSchema>) => void;
  initialValues?: z.infer<typeof formSchema>;
  compact?: boolean;
};

export function SearchFilters({ onSearch, initialValues, compact = false }: SearchFiltersProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      location: "",
      type: "any",
      priceRange: "any",
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
    },
  });

  // Fetch amenities
  const { data: amenities } = useQuery({
    queryKey: ["/api/amenities"],
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSearch(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className={`grid grid-cols-1 gap-y-4 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} sm:gap-x-4`}>
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Any location" 
                      className="pl-10" 
                      {...field} 
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          
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
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priceRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Range</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Any price" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.id} value={range.id}>
                        {range.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="text-primary-600 hover:text-primary-500 font-medium text-sm flex items-center"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
          >
            <FilterIcon className="h-4 w-4 mr-1" />
            {showMoreFilters ? 'Less filters' : 'More filters'}
          </Button>
          
          <Button type="submit">
            Search
          </Button>
        </div>
        
        {showMoreFilters && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="bedrooms-bathrooms">
              <AccordionTrigger>Bedrooms & Bathrooms</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms (Min: {field.value})</FormLabel>
                        <FormControl>
                          <Slider
                            defaultValue={[field.value || 0]}
                            min={0}
                            max={5}
                            step={1}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms (Min: {field.value})</FormLabel>
                        <FormControl>
                          <Slider
                            defaultValue={[field.value || 0]}
                            min={0}
                            max={4}
                            step={0.5}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {amenities && amenities.length > 0 && (
              <AccordionItem value="amenities">
                <AccordionTrigger>Amenities</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 py-2">
                          {amenities.map((amenity: any) => (
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
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </form>
    </Form>
  );
}
