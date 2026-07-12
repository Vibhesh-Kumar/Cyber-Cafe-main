import { useRoute } from "wouter";
import { Link } from "wouter";
import { useListBlogs, useGetBlog } from "@workspace/api-client-react";
import { PageHeader } from "@/components/PageHeader";
import { LoadingPage } from "@/components/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { ArrowLeft, ArrowRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BlogList() {
  const { data: blogs, isLoading } = useListBlogs();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="News & Updates" 
        description="Stay informed about new government services, deadlines, and digital initiatives."
      />
      
      <div className="container mx-auto px-4 py-12 flex-1">
        {isLoading ? (
          <LoadingPage />
        ) : !blogs || blogs.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border">
            <h3 className="text-xl font-bold text-secondary mb-2">No articles yet</h3>
            <p className="text-muted-foreground">Check back later for news and updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}>
                <Card className="h-full overflow-hidden hover-elevate transition-all group cursor-pointer border-0 shadow-md">
                  {blog.coverImageUrl ? (
                    <div className="h-48 w-full overflow-hidden bg-muted">
                      <img src={blog.coverImageUrl} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-4xl opacity-20 font-serif">BC</span>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col h-[calc(100%-12rem)]">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(blog.publishedAt)}</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {blog.authorName}</span>
                    </div>
                    <h3 className="text-xl font-bold font-serif text-secondary mb-3 group-hover:text-primary transition-colors line-clamp-2">{blog.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">{blog.excerpt}</p>
                    <div className="mt-auto pt-4 flex items-center text-primary font-semibold text-sm">
                      Read full article <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function BlogDetail() {
  const [, params] = useRoute("/blog/:slug");
  const { data: blog, isLoading } = useGetBlog(params?.slug || "");

  if (isLoading) return <LoadingPage />;
  if (!blog) return <div className="text-center py-20 text-2xl font-bold">Article not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {blog.coverImageUrl && (
        <div className="w-full h-[40vh] min-h-[300px] bg-muted relative">
          <img src={blog.coverImageUrl} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>
      )}
      
      <div className={`container mx-auto px-4 ${blog.coverImageUrl ? '-mt-32 relative z-10' : 'py-12'}`}>
        <div className="max-w-3xl mx-auto bg-card rounded-2xl shadow-xl border p-8 md:p-12">
          <Link href="/blog">
            <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-secondary">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
            </Button>
          </Link>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-secondary leading-tight mb-6">{blog.title}</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-10 pb-10 border-b">
            <span className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {blog.authorName.charAt(0)}
              </div>
              {blog.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {formatDate(blog.publishedAt)}
            </span>
          </div>
          
          <div className="prose prose-lg prose-blue max-w-none text-secondary-foreground/80 leading-relaxed whitespace-pre-wrap">
            {blog.content}
          </div>
        </div>
      </div>
    </div>
  );
}
