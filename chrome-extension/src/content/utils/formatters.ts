export function formatLengthLabel(label: string) {
  switch (label) {
    case '4 - 6 mois':
      return '4 - 6 months'
    case '2 - 3 mois':
      return '2 - 3 months'
    case 'Indifférent':
      return 'No preference'
    default:
      return label
  }
}
