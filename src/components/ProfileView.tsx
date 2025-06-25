
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit } from "lucide-react";

interface ProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  company_website?: string;
  company_logo?: string;
  position?: string;
  bio?: string;
  avatar_url?: string;
}

export function ProfileView({ 
  profile = {}, 
  onEdit 
}: { 
  profile?: ProfileData;
  onEdit: () => void;
}) {
  // Ensure profile is always an object, even if undefined is passed
  const safeProfile = profile || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={safeProfile.avatar_url || ''} alt={safeProfile.full_name || 'Profile'} />
            <AvatarFallback>{safeProfile.full_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{safeProfile.full_name || 'No Name'}</h2>
            <p className="text-muted-foreground">{safeProfile.position || 'No Position'}</p>
          </div>
        </div>
        <Button onClick={onEdit} variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-4">
        {safeProfile.bio && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Bio</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{safeProfile.bio}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <dl className="grid gap-2">
              <div className="grid grid-cols-3">
                <dt className="font-medium text-muted-foreground">Email</dt>
                <dd className="col-span-2">{safeProfile.email || 'No Email'}</dd>
              </div>
              {safeProfile.phone && (
                <div className="grid grid-cols-3">
                  <dt className="font-medium text-muted-foreground">Phone</dt>
                  <dd className="col-span-2">{safeProfile.phone}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {(safeProfile.company_name || safeProfile.company_website || safeProfile.company_logo) && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Company Information</h3>
              <dl className="grid gap-4">
                {safeProfile.company_name && (
                  <div className="grid grid-cols-3">
                    <dt className="font-medium text-muted-foreground">Company</dt>
                    <dd className="col-span-2">{safeProfile.company_name}</dd>
                  </div>
                )}
                {safeProfile.company_website && (
                  <div className="grid grid-cols-3">
                    <dt className="font-medium text-muted-foreground">Website</dt>
                    <dd className="col-span-2">
                      <a href={safeProfile.company_website} target="_blank" rel="noopener noreferrer" 
                         className="text-primary hover:underline">
                        {safeProfile.company_website}
                      </a>
                    </dd>
                  </div>
                )}
                {safeProfile.company_logo && (
                  <div className="grid grid-cols-3">
                    <dt className="font-medium text-muted-foreground">Logo</dt>
                    <dd className="col-span-2">
                      <div className="space-y-2">
                        <img 
                          src={safeProfile.company_logo} 
                          alt="Company logo" 
                          className="max-h-20 object-contain rounded-md border"
                        />
                        <a href={safeProfile.company_logo} target="_blank" rel="noopener noreferrer" 
                           className="text-sm text-primary hover:underline block">
                          View full size
                        </a>
                      </div>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
