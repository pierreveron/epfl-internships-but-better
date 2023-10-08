import { parse, HTMLElement } from 'node-html-parser'
import { PageData } from './types'

// const labels = [
//   'STAGE_LABEL_FORMAT',
//   'STAGE_LABEL_NBPLACES',
//   'STAGE_LABEL_DUREEND1',
//   'STAGE_LABEL_ENTRMERE',
//   'STAGE_LABEL_ADRESSE',
//   'STAGE_LABEL_URL',
//   'STAGE_LABEL_LOC',
//   'STAGE_LABEL_TITRE2',
//   'STAGE_LABEL_MOBILE2',
//   'STAGE_LABEL_EMAIL',
//   'STAGE_LABEL_TELPROF2',
//   'STAGE_LABEL_DESCRIPTION',
//   'STAGE_LABEL_PLAN_TRAVAIL',
//   'STAGE_LABEL_CONN_REQU',
//   'STAGE_LABEL_LANGUES_REQUISES',
//   'STAGE_LABEL_LOCALISATION',
//   'STAGE_LABEL_SALAIRE',
//   'STAGE_LABEL_BENEF',
//   'STAGE_LABEL_FICHIER',
//   'STAGE_LABEL_RESPONSABLE',
//   'STAGE_LABEL_RMQ',
//   'STAGE_LABEL_CONDINSCR',
//   'STAGE_LABEL_DESCRIPTIONTRAVAIL',
//   'STAGE_LABEL_RESP',
//   'STAGE_LABEL_CADRETRAVAIL',
//   'STAGE_LABEL_FONCTIONS',
//   'STAGE_LABEL_COMP',
//   'STAGE_LABEL_TITRE',
//   'STAGE_LABEL_MOBILE',
//   'STAGE_LABEL_TELPROF',
//   'STAGE_LABEL_FAX2',
//   'STAGE_LABEL_EMAIL2',
//   'STAGE_LABEL_TYPETRAVAIL',
//   'STAGE_LABEL_ETUEPFL',
//   'STAGE_LABEL_OBJ',
//   'STAGE_LABEL_RENOUV',
//   'STAGE_LABEL_DUREE',
//   'STAGE_LABEL_DEBUT',
//   'STAGE_LABEL_FIN',
// ]

export function extractData(xml: string): PageData {
  const parsed = parse(xml)

  const length = extractDataFromDetail(parsed, 'STAGE_LABEL_DUREEND1')

  const hiringTime = getHiringTime(parsed)

  const salary = extractDataFromDetail(parsed, 'STAGE_LABEL_SALAIRE')

  const benefits = extractDataFromDetail(parsed, 'STAGE_LABEL_BENEF')

  const description = extractDataFromDetail(parsed, 'STAGE_LABEL_DESCRIPTION')

  const requiredSkills = extractDataFromDetail(parsed, 'STAGE_LABEL_CONN_REQU')

  const remarks = extractDataFromDetail(parsed, 'STAGE_LABEL_RMQ')

  const languages = getLanguages(parsed)

  const relatedMasters = getRelatedMasters(parsed)

  return {
    length,
    hiringTime,
    salary,
    benefits,
    description,
    requiredSkills,
    remarks,
    languages,
    relatedMasters,
  }
}

function extractDataFromDetail(parsed: HTMLElement, model: string) {
  return parsed.querySelector(`detail[c_detailmodele="${model}"]`)!.nextElementSibling.childNodes[1].text
}

function getHiringTime(parsed: HTMLElement): string {
  let hiringTime = null
  for (let i = 1; i < 4; i++) {
    const value = parsed.querySelector(`detail[c_detailmodele="DETSTAGE_CHK_P${i}"]`)!
    const text = value.childNodes[1].textContent
    // console.log(text)
    if (text) {
      hiringTime = text
      break
    }
  }
  return hiringTime!
}

function getLanguages(parsed: HTMLElement) {
  const french = parsed.querySelector(`detail[c_detailmodele="STAGE_ETIQ_LANGUEFRANCAIS"]`)!.childNodes[1].text
  const english = parsed.querySelector(`detail[c_detailmodele="STAGE_ETIQ_LANGUEANGLAIS"]`)!.childNodes[1].text
  const german = parsed.querySelector(`detail[c_detailmodele="STAGE_ETIQ_LANGUEALLEMAND"]`)!.childNodes[1].text
  //   const others =
  return {
    french,
    english,
    german,
  }
}

function getRelatedMasters(parsed: HTMLElement) {
  const start = parsed.querySelector(`detail[c_detailmodele="DET_STAGE_LAB_SECTIONS"]`)!
  let next = start.nextElementSibling
  const relatedMasters = []

  while (next?.getAttribute('c_detailmodele') !== 'CODE21916719') {
    if (next.childNodes[1] && next.childNodes[1].text) relatedMasters.push(next.childNodes[1].text)
    next = next.nextElementSibling
  }

  return relatedMasters
}
