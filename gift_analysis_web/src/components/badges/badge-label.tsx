import { resolveBadgeIconPath } from '../../lib/badge-assets';

interface BadgeLabelProps {
  label: string;
  code?: string | null;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
}

function joinClassNames(...classNames: Array<string | undefined | null | false>) {
  return classNames.filter(Boolean).join(' ');
}

export function BadgeLabel({ label, code, className, textClassName, iconClassName }: BadgeLabelProps) {
  const iconPath = resolveBadgeIconPath({ code, label });

  return (
    <span className={joinClassNames('inline-flex items-center gap-1.5 align-middle', className)}>
      {iconPath ? <img src={iconPath} alt="" aria-hidden="true" className={joinClassNames('h-3.5 w-3.5 shrink-0 object-contain', iconClassName)} /> : null}
      <span className={textClassName}>{label}</span>
    </span>
  );
}
