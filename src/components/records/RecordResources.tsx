
import { Video, Link2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecordResourcesProps {
  videoLink: string;
}

const RecordResources = ({ videoLink }: RecordResourcesProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {videoLink && (
          <div>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href={videoLink} target="_blank" rel="noopener noreferrer">
                <Video className="mr-2 h-4 w-4 text-gold" />
                Watch Recording
              </a>
            </Button>
          </div>
        )}
        <div>
          <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
            <Link2 className="mr-2 h-4 w-4 text-teal" />
            Share Record
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordResources;
