import {
  companyAtom,
  formatAtom,
  formattingOffersAtom,
  lengthAtom,
  locationsAtom,
  minimumSalaryAtom,
  nbCitiesSelectedAtom,
  showOnlyFavoritesAtom,
  showOnlyPositionsNotYetCompletedAtom,
  asideAtom,
} from "@/atoms";
import { formatToLabel } from "@/utils/format";
import { Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useAtom, useAtomValue } from "jotai";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useMemo, useState } from "react";
import { Offer } from "../../types";
import HeartIcon from "./HeartIcon";
import { useHiddenOffers } from "@/utils/hooks";

const PAGE_SIZE = 15;

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

  const [favoriteInternships, setFavoriteInternships] = useLocalStorage({
    key: "favorite-internships",
    getInitialValueInEffect: false,
    defaultValue: [] as string[],
  });

  const { hiddenOffers, isOfferHidden } = useHiddenOffers();

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<
    DataTableSortStatus<TableRecord>
  >({
    columnAccessor: "creationDate",
    direction: "desc",
  });

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
        favorite: favoriteInternships.includes(d.number),
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
      data = data.filter((d) => favoriteInternships.includes(d.number));
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

        console.log("nextOfferIndex", nextOfferIndex);
        const nextOffer = d[nextOfferIndex];

        const newPage = Math.floor(nextOfferIndex / PAGE_SIZE) + 1;
        console.log("newPage", newPage);

        setPage(Math.floor(nextOfferIndex / PAGE_SIZE) + 1);

        return {
          open: true,
          offer: {
            ...nextOffer,
            favorite: favoriteInternships.includes(nextOffer.number),
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
        favorite: favoriteInternships.includes(d.number),
      };
    });

    setRecords(records);
  }, [
    page,
    filteredData,
    sortStatus.direction,
    favoriteInternships,
    hiddenOffers,
  ]);

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
          render: ({ favorite, number }) => (
            <HeartIcon
              checked={favorite}
              onClick={(event) => {
                event.stopPropagation();
                let checked = !favorite;
                setFavoriteInternships((favorites) => {
                  if (checked) {
                    if (!favorites.includes(number)) {
                      return [...favorites, number];
                    }
                    return favorites;
                  } else {
                    return favorites.filter((f) => f !== number);
                  }
                });
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
            <ul style={{ listStyle: "none" }}>
              {location.map((loc) => (
                <li key={`${loc.city}_${loc.country}`}>
                  {loc.city}, {loc.country ?? NOT_SPECIFIED}
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
              <ul style={{ listStyle: "none" }}>
                {format.map((f) => {
                  let color: string | undefined;
                  if (
                    someFormatsSelected &&
                    !selectableFormats.find((sf) => sf.name === f)?.selected
                  ) {
                    color = "dimmed";
                  }

                  return (
                    <li key={f}>
                      <Text c={color} style={{ whiteSpace: "nowrap" }}>
                        {formatToLabel(f)}
                      </Text>
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
          render: ({ salary }) => {
            if (salary === null) {
              return "Unspecified";
            }

            if (salary === 0) {
              return "Unpaid";
            }

            return `${salary} CHF`;
          },
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
    />
  );
}
