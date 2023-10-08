import { parse, HTMLElement } from 'node-html-parser'
import { PageData } from './types'
export function extractData(xml: string): PageData {
  const parsed = parse(xml)

  const length = extractDataFromDetail(parsed, 'STAGE_LABEL_DUREEND1')

  const hiringTime = getHiringTime(parsed)
  //   console.log(hiringTime)

  const salary = extractDataFromDetail(parsed, 'STAGE_LABEL_SALAIRE')
  //   console.log(salary)

  const benefits = extractDataFromDetail(parsed, 'STAGE_LABEL_BENEF')
  //   console.log(benefits)

  const description = extractDataFromDetail(parsed, 'STAGE_LABEL_DESCRIPTION')
  //   console.log(description)

  const requiredSkills = extractDataFromDetail(parsed, 'STAGE_LABEL_CONN_REQU')
  //   console.log(requiredSkills)

  const remarks = extractDataFromDetail(parsed, 'STAGE_LABEL_RMQ')
  //   console.log(remarks)

  const languages = getLanguages(parsed)
  //   console.log('Languages', languages)

  const relatedMasters = getRelatedMasters(parsed)
  //   console.log('Related masters', relatedMasters)

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
