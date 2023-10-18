import { Dialog, Transition } from '@headlessui/react'
import { ArrowLongRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment, useEffect, useState } from 'react'
import styles from '../styles/index.css?inline'
import loadingStyle from '../styles/loading-dots.css?inline'

export default function Content() {
  const [offersCount, setOffersCount] = useState<number | null>(null)
  const [offersLoaded, setOffersLoaded] = useState<number>(0)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (request) {
      if (request.offersCount) {
        setOffersCount(request.offersCount)
      }

      if (request.offersLoaded) {
        setOffersLoaded(request.offersLoaded)
      }
    })
  }, [])

  useEffect(() => {
    if (open) {
      const root = window.document.getElementById('headlessui-portal-root')!
      const shadow = root.attachShadow({ mode: 'open' })

      const style = document.createElement('style')
      style.innerHTML = styles

      const sheetTailwind = new CSSStyleSheet()
      sheetTailwind.replaceSync(styles)
      const sheetLoading = new CSSStyleSheet()
      sheetLoading.replaceSync(loadingStyle)
      shadow.adoptedStyleSheets = [sheetTailwind, sheetLoading]

      // Move root to shadow DOM
      root.shadowRoot!.appendChild(root.childNodes[0]!)
    }
  }, [open])

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="tw-relative tw-z-[1000] tw-font-sans" onClose={setOpen} open={open}>
          <Transition.Child
            as={Fragment}
            enter="tw-ease-out tw-duration-300"
            enterFrom="tw-opacity-0"
            enterTo="tw-opacity-100"
            leave="tw-ease-in tw-duration-200"
            leaveFrom="tw-opacity-100"
            leaveTo="tw-opacity-0"
          >
            <div className="tw-fixed tw-inset-0 tw-bg-gray-500 tw-bg-opacity-75 tw-transition-opacity" />
          </Transition.Child>

          <div className="tw-fixed tw-inset-0 tw-bg-gray-500 tw-bg-opacity-75 tw-transition-opacity" />

          <div className="tw-fixed tw-inset-0 tw-z-10 tw-w-screen tw-overflow-y-auto">
            <div className="tw-flex tw-min-h-full tw-items-end tw-justify-center tw-p-4 tw-text-center sm:tw-items-center sm:tw-p-0">
              <Transition.Child
                as={Fragment}
                enter="tw-ease-out tw-duration-300"
                enterFrom="tw-opacity-0 tw-translate-y-4 sm:tw-translate-y-0 sm:tw-scale-95"
                enterTo="tw-opacity-100 tw-translate-y-0 sm:tw-scale-100"
                leave="tw-ease-in tw-duration-200"
                leaveFrom="tw-opacity-100 tw-translate-y-0 sm:tw-scale-100"
                leaveTo="tw-opacity-0 tw-translate-y-4 sm:tw-translate-y-0 sm:tw-scale-95"
              >
                <Dialog.Panel className="tw-relative tw-transform tw-overflow-hidden tw-rounded-lg tw-bg-white tw-px-4 tw-pb-4 tw-pt-5 tw-text-left tw-shadow-xl tw-transition-all sm:tw-my-8 sm:tw-w-full sm:tw-max-w-lg sm:tw-p-6">
                  <div className="tw-absolute tw-right-0 tw-top-0 tw-hidden tw-pr-4 tw-pt-4 sm:tw-block">
                    <button
                      type="button"
                      className="tw-rounded-md tw-bg-white tw-text-gray-400 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
                      onClick={() => setOpen(false)}
                    >
                      <span className="tw-sr-only">Close</span>
                      <XMarkIcon className="tw-h-6 tw-w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="tw-mt-3 tw-text-center sm:tw-ml-4 sm:tw-mt-0 sm:tw-text-left">
                    <Dialog.Title as="h3" className="tw-text-base tw-font-semibold tw-leading-6 tw-text-gray-900">
                      Exporting offers
                    </Dialog.Title>
                    <div className="tw-mt-2">
                      {offersCount ? (
                        <p className="tw-text-sm tw-text-gray-500">{`${offersLoaded}/${offersCount}`}</p>
                      ) : (
                        <div className="dot-flashing tw-ml-4"></div>
                      )}
                    </div>
                  </div>
                  <div className="tw-mt-5 sm:tw-mt-4 sm:tw-flex sm:tw-flex-row-reverse">
                    <button
                      type="button"
                      className="tw-inline-flex tw-w-full tw-justify-center tw-items-center tw-rounded-md tw-bg-red-600 tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-bg-red-500 sm:tw-ml-3 sm:tw-w-auto"
                      onClick={() => setOpen(false)}
                    >
                      Go
                      <ArrowLongRightIcon className="tw-h-6 tw-w-6 tw-text-white" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="tw-mt-3 tw-inline-flex tw-w-full tw-justify-center tw-items-center tw-rounded-md tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 hover:tw-bg-gray-50 sm:tw-mt-0 sm:tw-w-auto"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )

  return (
    <div
      className="tw-fixed tw-inset-0 tw-bg-gray-500 tw-bg-opacity-75 tw-transition-opacity tw-z-[1000]"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <p className="tw-text-4xl tw-text-white">{offersCount ? `${offersLoaded}/${offersCount}` : 'Waiting...'}</p>
    </div>
  )
}
