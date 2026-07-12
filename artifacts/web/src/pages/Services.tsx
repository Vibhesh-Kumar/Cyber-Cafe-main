import { useState, useMemo } from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/PageHeader";
import { LoadingPage } from "@/components/LoadingState";
import { useListServices, useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Services() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: services, isLoading: servicesLoading } = useListServices();
  const { data: categories, isLoading: categoriesLoading } = useListCategories();

  const filteredServices = useMemo(() => {
    if (!services) return [];
    return services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) || 
                            service.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? service.categorySlug === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="All Services" 
        description="Browse and apply for government services, certificates, and more."
      />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 shrink-0 space-y-6">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search services..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="font-bold text-secondary mb-3">Categories</h3>
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[1,2,3,4].map(i => <div key={i} className="h-8 bg-muted rounded animate-pulse"></div>)}
                </div>
              ) : (
                <div className="space-y-1">
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === null ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Categories
                  </button>
                  {categories?.map(category => (
                    <button
                      key={category.id}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.slug ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                      onClick={() => setSelectedCategory(category.slug)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Service Grid */}
          <div className="flex-1">
            {servicesLoading ? (
              <LoadingPage />
            ) : filteredServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-muted/20">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">No services found</h3>
                <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => { setSearch(""); setSelectedCategory(null); }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Link key={service.id} href={`/services/${service.id}`}>
                    <div className="group h-full rounded-2xl border bg-card p-6 shadow-sm hover-elevate transition-all flex flex-col cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="bg-muted/50">{service.categoryName}</Badge>
                      </div>
                      <h3 className="font-bold text-secondary mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Fee</span>
                          <span className="text-sm font-semibold">₹{service.price}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Time</span>
                          <span className="text-sm font-semibold">{service.estimatedDays} Days</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
