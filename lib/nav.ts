/**
 * Returns the href of the most specific nav link that matches the current
 * pathname, or undefined when nothing matches.
 *
 * Plain prefix matching marks `/admin` as active on `/admin/users`, and
 * `/business` as active on `/business/profile`. Choosing the longest match
 * keeps only one item highlighted.
 */
export function getActiveHref(
  pathname: string,
  hrefs: string[],
): string | undefined {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}
