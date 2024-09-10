import { Format } from '../../../../types'

export function formatToLabel(format: Format) {
  switch (format) {
    case 'internship':
      return 'Internship'
    case 'project':
      return 'Master Project'
  }
}

export function formatSalary(salary: string | number | null) {
  if (salary === null) {
    return 'Unspecified'
  }

  if (salary === 0) {
    return 'Unpaid'
  }

  return `${salary} CHF`
}
