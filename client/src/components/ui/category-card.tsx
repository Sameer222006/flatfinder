import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  className?: string;
}

export function CategoryCard({ title, description, imageUrl, href, className }: CategoryCardProps) {
  return (
    <Link href={href}>
      <a className={cn("relative rounded-xl overflow-hidden h-64 group block", className)}>
        <img 
          src={imageUrl} 
          alt={title} 
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-bold text-white text-xl">{title}</h3>
          <p className="text-gray-200 mt-1">{description}</p>
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors">
              Browse <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </a>
    </Link>
  );
}
