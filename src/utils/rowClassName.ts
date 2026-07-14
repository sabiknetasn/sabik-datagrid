export function buildRowClassName(
  isSelected: boolean,
  striped: boolean,
  hoverable: boolean,
  index?: number
): string {
  const classes = ['sdg__tr'];
  if (striped) {
    // Prefer data-index parity for virtualized tables (nth-child breaks with spacer rows).
    if (typeof index === 'number') {
      classes.push(index % 2 === 1 ? 'sdg__tr--zebra-odd' : 'sdg__tr--zebra-even');
    } else {
      classes.push('sdg__tr--zebra');
    }
  }
  if (hoverable) classes.push('sdg__tr--hoverable');
  if (isSelected) classes.push('sdg__tr--selected');
  return classes.join(' ');
}
