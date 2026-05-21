import { PHOTO_MANIFEST } from '@/lib/scenario/photos';

type LegendRow = {
  icon: string;
  label: string;
  desc: string;
};

const LEGEND: ReadonlyArray<LegendRow> = [
  {
    icon: '✅',
    label: 'Relevant',
    desc: 'Directly shows damage to a covered component',
  },
  {
    icon: '🔁',
    label: 'Duplicate',
    desc: 'Near-identical to another photo in the set',
  },
  {
    icon: '❌',
    label: 'Out of scope',
    desc: 'Shows property not part of this dwelling claim',
  },
  {
    icon: '📏',
    label: 'Scale reference',
    desc: 'Reference object placed to indicate impact size',
  },
];

export function DamageScaffold() {
  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-md border bg-card px-3 py-2 text-sm">
        <span aria-hidden className="mr-1.5">
          📷
        </span>
        {PHOTO_MANIFEST.length} photos staged and ready for classification
      </p>
      <ul className="flex flex-col divide-y rounded-md border bg-card">
        {LEGEND.map((row) => (
          <li
            key={row.label}
            className="flex flex-wrap items-center gap-3 px-3 py-2.5"
          >
            <span aria-hidden className="text-base leading-none">
              {row.icon}
            </span>
            <span className="text-sm font-medium">{row.label}</span>
            <span className="text-xs text-muted-foreground">— {row.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
