import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function BuilderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Website Builder</h1>
                <p className="text-muted-foreground">Build websites with AI assistance</p>
              </div>
            </div>
          </div>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-xl">Builder Currently Unavailable</CardTitle>
              <CardDescription>
                The AI Website Builder has been temporarily disabled. This is a mock implementation
                showing how the builder interface would appear.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6">
                <p className="text-sm text-muted-foreground">
                  In a full implementation, you would be able to:
                </p>
                <ul className="mt-3 text-sm text-left space-y-1">
                  <li>• Describe your website in natural language</li>
                  <li>• Generate code with AI assistance</li>
                  <li>• Preview changes in real-time</li>
                  <li>• Deploy directly to production</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/projects">
                    View Projects
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
