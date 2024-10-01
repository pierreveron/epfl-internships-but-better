import { HTMLElement, parse } from 'node-html-parser'
import { extractData } from './pageData-helpers'
import {
  FormattedPortalCellRowData,
  Format as OfferFormat,
  OfferToBeFormatted,
  OriginalPortalCellRowData,
} from '../../types'

const HEADERS = [
  'title',
  'company',
  'location',
  'sustainabilityLabel',
  'number',
  'format',
  'registered',
  'positions',
  'professor',
  'creationDate',
]

const BASE_URL = 'https://isa.epfl.ch/imoniteur_ISAP/!PORTAL14S.portalCell?ww_k_cell=2742535167&ww_i_stageview='

const zip = (a: string[], b: string[]) => a.map((k, i) => ({ [k]: b[i] }))

function allProgress(proms: Promise<OfferToBeFormatted>[], progress_cb: (p: number) => void) {
  let d = 0
  progress_cb(0)
  for (const p of proms) {
    p.then(() => {
      progress_cb(++d)
    })
  }
  return Promise.all(proms)
}

function fetchAndDecode(url: string) {
  return fetch(url)
    .then(function (response) {
      return response.arrayBuffer()
    })
    .then(function (buffer) {
      const decoder = new TextDecoder('iso-8859-15')
      return decoder.decode(buffer)
    })
}

export async function fetchPortalCell() {
  const url = 'https://isa.epfl.ch/imoniteur_ISAP/!PORTAL14S.portalCell?ww_k_cell=308197177'
  const data = await fetchAndDecode(url)
  return parse(data)
}

function extractDataFromPortalCell(portalCell: HTMLElement, id: string): FormattedPortalCellRowData {
  const row = portalCell.querySelector(`tr[id='${id}']`)!
  const content = Array.from(row.querySelectorAll('td')).map((e) => e.text)
  const rowData = zip(HEADERS, content).reduce((acc, curr) => ({ ...acc, ...curr }), {}) as OriginalPortalCellRowData

  let format: OfferFormat[] = []
  if (rowData.format === 'PDM ou Stage' || rowData.format === 'master project or Internship') {
    format = ['internship', 'project']
  } else if (rowData.format === 'Stage' || rowData.format === 'Internship') {
    format = ['internship']
  } else if (rowData.format === 'PDM coordonné' || rowData.format === 'PDM' || rowData.format === 'master project') {
    format = ['project']
  }

  let professor: string | null = rowData.professor
  if (professor === 'à trouver (si PDM)' || professor === 'To find (if master project)') {
    professor = null
  }

  rowData.title = rowData.title.trim()

  rowData.company = rowData.company.trim()

  rowData.location = rowData.location.trim()

  return { ...rowData, format, professor, registered: Number(rowData.registered), positions: Number(rowData.positions) }
}

async function extractDataFromPage(id: string) {
  const url = BASE_URL + id
  const data = await fetchAndDecode(url)

  return extractData(data)
}

async function fetchAndExtract(portalCell: HTMLElement, id: string): Promise<OfferToBeFormatted> {
  const portalCellData = extractDataFromPortalCell(portalCell, id)
  const pageData = await extractDataFromPage(id)

  return { id, ...portalCellData, ...pageData }
}

export async function detectNewJobs(existingOffers: string[], portalCell?: HTMLElement): Promise<string[]> {
  if (!portalCell) {
    portalCell = await fetchPortalCell()
  }

  const jobsIds = portalCell
    .querySelectorAll('tr')
    .slice(1)
    .map((e) => e.id)

  if (jobsIds.length === 0) {
    throw new Error('No jobs found')
  }

  return jobsIds.filter((id) => !existingOffers.includes(id))
}

export async function scrapeJobs(
  existingOffers: string[],
  callback: (offersCount: number, offersLoaded: number) => void,
): Promise<OfferToBeFormatted[]> {
  const portalCell = await fetchPortalCell()
  const jobsIds = await detectNewJobs(existingOffers, portalCell)

  const jobs = jobsIds.map((id) => fetchAndExtract(portalCell, id))

  return allProgress(jobs, (offersLoaded) => {
    callback(jobsIds.length, offersLoaded)
  })
}
