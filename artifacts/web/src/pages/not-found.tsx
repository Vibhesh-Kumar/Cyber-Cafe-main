import { Link } from "wouter";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md mx-auto border-0 shadow-xl overflow-hidden">
        <div className="h-2 bg-primary w-full"></div>
        <CardContent className="p-8 text-center">
          <div className="mx-auto h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold font-serif text-secondary mb-2">
            Page Not Found
          </h1>
          
          <p className="text-muted-foreground mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <Link href="/">
            <Button size="lg" className="w-full gap-2">
              <Home className="h-4 w-4" /> Return to Homepage
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
