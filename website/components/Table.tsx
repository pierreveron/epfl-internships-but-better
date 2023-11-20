import {
  asideAtom,
  companyAtom,
  filteredOffersAtom,
  formatAtom,
  formattingOffersAtom,
  lengthAtom,
  locationsAtom,
  minimumSalaryAtom,
  nbCitiesSelectedAtom,
  pageAtom,
  showOnlyFavoritesAtom,
  showOnlyPositionsNotYetCompletedAtom,
  sortStatusAtom,
} from "@/atoms";
import { formatSalary, formatToLabel } from "@/utils/format";
import { useFavoriteOffers, useHiddenOffers } from "@/utils/hooks";
import { usePrevious } from "@mantine/hooks";
import classNames from "classnames";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { DataTable } from "mantine-datatable";
import { useEffect, useMemo, useRef, useState } from "react";
import { Offer } from "../../types";
import HeartIcon from "./HeartIcon";

export const PAGE_SIZE = 15;

const NOT_SPECIFIED = "Not specified";

const sortBy = (data: Offer[], columnAccessor: string) => {
  let dataSorted = data;
  if (columnAccessor === "company") {
    dataSorted = data.sort((a, b) => {
      return a.company.localeCompare(b.company);
    });
  } else if (columnAccessor === "creationDate") {
    dataSorted = data.sort((a, b) => {
      return (
        new Date(a.creationDate.split(".").reverse().join("-")).getTime() -
        new Date(b.creationDate.split(".").reverse().join("-")).getTime()
      );
    });
  } else if (columnAccessor === "salary") {
    dataSorted = data.sort((a, b) => {
      // Check if salary is a string
      if (typeof a.salary === "string" || typeof b.salary === "string") {
        return 0;
      }

      if (a.salary === null) {
        return 1;
      }
      if (b.salary === null) {
        return -1;
      }
      return a.salary - b.salary;
    });
  }

  return dataSorted;
};

export type TableRecord = Offer & { favorite: boolean };

export default function Table({ data }: { data: Offer[] }) {
  const isFormatingOffers = useAtomValue(formattingOffersAtom);
  const nbCitiesSelected = useAtomValue(nbCitiesSelectedAtom);
  const selectableFormats = useAtomValue(formatAtom);
  const selectableLengths = useAtomValue(lengthAtom);
  const selectableLocations = useAtomValue(locationsAtom);
  const selectedCompany = useAtomValue(companyAtom);
  const showOnlyPositionsNotYetCompleted = useAtomValue(
    showOnlyPositionsNotYetCompletedAtom
  );
  const showOnlyFavorites = useAtomValue(showOnlyFavoritesAtom);
  const minimumSalary = useAtomValue(minimumSalaryAtom);
  const [{ offer }, setAside] = useAtom(asideAtom);
  const setFilteredOffers = useSetAtom(filteredOffersAtom);

  const { favoriteOffers, isOfferFavorite, toggleFavoriteOffer } =
    useFavoriteOffers();

  const { hiddenOffers, isOfferHidden } = useHiddenOffers();

  const viewport = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    viewport.current!.scrollTo({
      top: viewport.current!.scrollHeight,
      behavior: "smooth",
    });

  const scrollToTop = () =>
    viewport.current!.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  const [page, setPage] = useAtom(pageAtom);
  const [sortStatus, setSortStatus] = useAtom(sortStatusAtom);

  const previousPage = usePrevious(page);

  useEffect(() => {
    if (previousPage === undefined) return;
    if (previousPage < page) {
      setTimeout(() => {
        scrollToTop();
      }, 100);
    }
    if (previousPage > page) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [
    sortStatus,
    selectableLocations,
    selectableFormats,
    selectableLengths,
    selectedCompany,
    showOnlyPositionsNotYetCompleted,
    showOnlyFavorites,
    minimumSalary,
  ]);

  const sortedData = useMemo(() => {
    return sortBy(data, sortStatus.columnAccessor);
  }, [sortStatus.columnAccessor, data]);

  const [records, setRecords] = useState<TableRecord[]>(
    sortedData.slice(0, PAGE_SIZE).map((d) => {
      return {
        ...d,
        favorite: isOfferFavorite(d),
      };
    })
  );

  // filter sorted data on the registered column
  const filteredData = useMemo(() => {
    let data = sortedData;

    if (selectableFormats.some((f) => f.selected)) {
      data = data.filter((d) => {
        return (
          d.format.filter((f) => {
            return selectableFormats.find((sf) => sf.name === f)?.selected;
          }).length > 0
        );
      });
    }

    if (minimumSalary !== undefined) {
      data = data.filter((d) => {
        return (
          d.salary !== null &&
          typeof d.salary !== "string" &&
          d.salary >= minimumSalary
        );
      });
    }

    if (selectableLengths.some((f) => f.selected)) {
      data = data.filter((d) => {
        return selectableLengths.find((sf) => sf.name === d.length)?.selected;
      });
    }

    if (selectedCompany) {
      data = data.filter((d) => d.company === selectedCompany);
    }

    if (showOnlyFavorites) {
      data = data.filter((d) => isOfferFavorite(d));
    }

    if (nbCitiesSelected !== 0) {
      data = data.filter((d) => {
        return (
          d.location.filter((l) => {
            return (
              selectableLocations[l.country ?? NOT_SPECIFIED]?.find(
                (c) => c.name === l.city
              )?.selected || false
            );
          }).length > 0
        );
      });
    }

    if (showOnlyPositionsNotYetCompleted) {
      data = data.filter((d) => d.registered < d.positions);
    }

    setFilteredOffers(data);

    return data;
  }, [
    sortedData,
    showOnlyFavorites,
    showOnlyPositionsNotYetCompleted,
    selectableLocations,
    nbCitiesSelected,
    selectableFormats,
    minimumSalary,
    selectableLengths,
    selectedCompany,
  ]);

  useEffect(() => {
    let d = filteredData;

    if (sortStatus.direction === "desc") {
      d = d.slice().reverse();
    }

    setAside((aside) => {
      if (aside.open && aside.offer && isOfferHidden(aside.offer)) {
        // Find the next offer after the current one
        d = d.filter(
          (offer) =>
            offer.number === aside.offer!.number || !isOfferHidden(offer)
        );

        const hiddenOfferIndex = d.findIndex(
          (o) => o.number === aside.offer!.number
        );

        console.log("hiddenOfferIndex", hiddenOfferIndex);

        let nextOfferIndex;
        if (hiddenOfferIndex === d.length - 1) {
          nextOfferIndex = hiddenOfferIndex - 1;
        } else {
          nextOfferIndex = hiddenOfferIndex + 1;
        }

        if (nextOfferIndex < 0) {
          return {
            open: false,
            offer: null,
          };
        }

        console.log("nextOfferIndex", nextOfferIndex);
        const nextOffer = d[nextOfferIndex];

        const newPage = Math.floor(nextOfferIndex / PAGE_SIZE) + 1;
        console.log("newPage", newPage);
        setPage(newPage);

        return {
          open: true,
          offer: {
            ...nextOffer,
            favorite: isOfferFavorite(nextOffer),
          },
        };
      }
      return aside;
    });
  }, [hiddenOffers]);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    let d = filteredData;

    d = d.filter((offer) => !isOfferHidden(offer));

    if (sortStatus.direction === "desc") {
      d = d.slice().reverse();
    }

    d = d.slice(from, to);

    // add favorite property if present in favoriteInternships
    const records = d.map((d) => {
      return {
        ...d,
        favorite: isOfferFavorite(d),
      };
    });

    setRecords(records);
  }, [page, filteredData, sortStatus.direction, favoriteOffers, hiddenOffers]);

  return (
    <DataTable
      withTableBorder
      highlightOnHover
      highlightOnHoverColor="var(--mantine-color-red-1)"
      fetching={isFormatingOffers}
      loadingText="Processing the offers... (it should take less than 3 minutes)"
      records={records}
      rowBackgroundColor={({ number }) => {
        if (offer && offer.number === number) {
          return "var(--mantine-color-red-2)";
        }
        return undefined;
      }}
      columns={[
        {
          accessor: "favorite",
          render: (record) => (
            <HeartIcon
              checked={record.favorite}
              onClick={(event) => {
                // Prevent the row click event to be triggered
                event.stopPropagation();

                toggleFavoriteOffer(record);
              }}
            />
          ),
        },
        {
          accessor: "title",
          title: "Offer",
          width: "20%",
        },
        { accessor: "company", sortable: true, width: "15%" },
        {
          accessor: "location",
          render: ({ location }) => (
            <ul className="tw-list-none tw-space-y-1">
              {location.map((loc, index) => (
                <li key={index}>
                  {loc.city}
                  {loc.country && `, ${loc.country}`}
                </li>
              ))}
            </ul>
          ),
        },
        { accessor: "number" },
        {
          accessor: "format",
          render: ({ format }) => {
            const someFormatsSelected = selectableFormats.some(
              (f) => f.selected
            );
            return (
              <ul className="tw-list-none tw-space-y-1">
                {format.map((f) => {
                  const selected =
                    someFormatsSelected &&
                    !selectableFormats.find((sf) => sf.name === f)?.selected;

                  return (
                    <li key={f}>
                      <p
                        className={classNames(
                          "tw-text-sm tw-py-1 tw-px-2  tw-rounded-md tw-whitespace-nowrap tw-w-fit",
                          !selected
                            ? "tw-bg-gray-200 tw-text-gray-600"
                            : "tw-bg-gray-50 tw-text-gray-300"
                        )}
                      >
                        {formatToLabel(f)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            );
          },
        },
        // {
        //   accessor: "registered",
        //   textAlign: "center",
        //   title: "Candidates",
        // },
        // { accessor: "positions", textAlign: "center", title: "Places" },
        {
          accessor: "professor",
          render: ({ professor, format }) => {
            if (format.includes("project") && professor === null) {
              return "To find (if project)";
            }
            return professor;
          },
        },
        { accessor: "creationDate", sortable: true },
        { accessor: "length" },
        {
          accessor: "salary",
          sortable: true,
          render: ({ salary }) => formatSalary(salary),
        },
      ]}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      totalRecords={
        filteredData.filter((offer) => !isOfferHidden(offer)).length
      }
      recordsPerPage={PAGE_SIZE}
      page={page}
      onPageChange={(p) => setPage(p)}
      onRowClick={({ record }) => {
        setAside({
          open: true,
          offer: record,
        });
      }}
      scrollViewportRef={viewport}
    />
  );
}
