import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = "Terjadi Kesalahan",
    message,
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <Card className="border-destructive">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-destructive/10 p-4 mb-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-destructive">
                        {title}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">{message}</p>
                    {onRetry && (
                        <Button onClick={onRetry} variant="default">
                            Coba Lagi
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
