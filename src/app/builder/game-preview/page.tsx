import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";

export default function GamePreviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Game Preview</h1>
        <p className="text-sm text-gray-600">
          Preview the game client with current builder settings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Embed or launch the preview here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button aria-label="Open Preview">Open Preview</Button>
        </CardContent>
      </Card>
    </div>
  );
}
