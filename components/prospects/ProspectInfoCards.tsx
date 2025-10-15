import { Building2, Mail, Phone, User, Calendar } from "lucide-react";

interface Workspace {
  businessName?: string | null;
  businessEmail?: string | null;
  businessPhone?: string | null;
  name: string;
}

interface ProspectInfoCardsProps {
  prospectEmail: string;
  prospectName?: string | null;
  companyName?: string | null;
  contactPhone?: string | null;
  createdAt: Date;
  workspace: Workspace;
}

function formatDateFriendly(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "today";
  } else if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

export function ProspectInfoCards({
  prospectEmail,
  prospectName,
  companyName,
  contactPhone,
  createdAt,
  workspace,
}: ProspectInfoCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Agency Details */}
      <div className="ring-foreground/10 bg-card rounded-xl border-transparent p-6 shadow-sm ring-1">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Agency Details</h3>
              <p className="text-xs text-muted-foreground">
                Your website partner
              </p>
            </div>
          </div>

          <div className="space-y-3 pl-11">
            <div>
              <p className="font-medium text-sm">
                {workspace.businessName || workspace.name}
              </p>
            </div>

            {workspace.businessEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <a
                  href={`mailto:${workspace.businessEmail}`}
                  className="text-primary hover:underline"
                >
                  {workspace.businessEmail}
                </a>
              </div>
            )}

            {workspace.businessPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <a
                  href={`tel:${workspace.businessPhone}`}
                  className="text-primary hover:underline"
                >
                  {workspace.businessPhone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Your Information */}
      <div className="ring-foreground/10 bg-card rounded-xl border-transparent p-6 shadow-sm ring-1">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Your Information</h3>
              <p className="text-xs text-muted-foreground">
                Review recipient
              </p>
            </div>
          </div>

          <div className="space-y-3 pl-11">
            {prospectName && (
              <div>
                <p className="font-medium text-sm">{prospectName}</p>
                {companyName && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {companyName}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{prospectEmail}</span>
            </div>

            {contactPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{contactPhone}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                Created {formatDateFriendly(createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
