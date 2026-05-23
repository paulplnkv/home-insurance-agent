export function buildMailto({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}): string {
  // RFC 6068: mailto: query fields use percent-encoding (spaces → %20).
  // URLSearchParams encodes spaces as `+`, which mail clients render literally.
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `mailto:${encodeURIComponent(to)}?${query}`;
}
