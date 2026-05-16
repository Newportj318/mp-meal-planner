import { Check, X } from 'lucide-react';
import type { MetabolicProfile } from '../../db/models';

interface MetabolicBadgeProps {
  profile: MetabolicProfile;
  compact?: boolean;
}

export default function MetabolicBadge({ profile, compact = false }: MetabolicBadgeProps) {
  const score = [
    profile.hasFirstClassProtein,
    profile.hasCarbSource,
    profile.hasOmega3,
  ].filter(Boolean).length;

  const color =
    score === 3
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : score >= 2
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-red-100 text-red-700 border-red-200';

  if (compact) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
        MP {score}/3
      </span>
    );
  }

  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <p className="text-xs font-semibold mb-2">Metabolic Precision</p>
      <div className="space-y-1">
        <MetabolicRow
          label="First Class Protein"
          detail={profile.proteinSource}
          met={profile.hasFirstClassProtein}
        />
        <MetabolicRow
          label="Carb Source"
          detail={profile.carbType}
          met={profile.hasCarbSource}
        />
        <MetabolicRow
          label="Omega-3"
          detail={profile.omega3Source}
          met={profile.hasOmega3}
        />
      </div>
    </div>
  );
}

function MetabolicRow({
  label,
  detail,
  met,
}: {
  label: string;
  detail?: string;
  met: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check size={14} className="text-emerald-600 shrink-0" />
      ) : (
        <X size={14} className="text-red-500 shrink-0" />
      )}
      <span>
        {label}
        {detail && <span className="opacity-70"> ({detail})</span>}
      </span>
    </div>
  );
}
