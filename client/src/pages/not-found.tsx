import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto border-2 border-border/60 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-6 sm:p-8 text-center flex flex-col items-center">
          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5 shrink-0">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2 tracking-tight break-words">
            404 Page Not Found
          </h1>

          {/* Subtext */}
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs break-words">
            Did you forget to add the page to the router?
          </p>

          {/* Call to Action Button */}
          <div className="w-full pt-2">
            <Link href="/">
              <a className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-xs sm:text-sm rounded-full hover:bg-primary/90 transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30">
                <Home className="h-4 w-4 shrink-0" />
                Return to Home
              </a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}