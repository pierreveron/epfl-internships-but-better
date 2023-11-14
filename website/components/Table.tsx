import {
  companyAtom,
  formatAtom,
  formattingOffersAtom,
  lengthAtom,
  locationsAtom,
  nbCitiesSelectedAtom,
  showOnlyFavoritesAtom,
  showOnlyPositionsNotYetCompletedAtom,
} from "@/atoms";
import { formatToLabel } from "@/utils/format";
import { Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useAtomValue } from "jotai";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useMemo, useState } from "react";
import { Offer } from "../../types";
import HeartIcon from "./HeartIcon";

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
  }

  return dataSorted;
};

type TableRecord = Offer & { favorite: boolean };

export default function Table({ data }: { data: Offer[] }) {
  const isFormatingLocations = useAtomValue(formattingOffersAtom);
  const nbCitiesSelected = useAtomValue(nbCitiesSelectedAtom);
  const selectableFormats = useAtomValue(formatAtom);
  const selectableLengths = useAtomValue(lengthAtom);
  const selectableLocations = useAtomValue(locationsAtom);
  const selectedCompany = useAtomValue(companyAtom);
  const showOnlyPositionsNotYetCompleted = useAtomValue(
    showOnlyPositionsNotYetCompletedAtom
  );
  const showOnlyFavorites = useAtomValue(showOnlyFavoritesAtom);

  const [favoriteInternships, setFavoriteInternships] = useLocalStorage({
    key: "favorite-internships",
    getInitialValueInEffect: false,
    defaultValue: [] as string[],
  });

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
    selectableLengths,
    selectedCompany,
  ]);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    let d = filteredData;

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
  }, [page, filteredData, sortStatus.direction, favoriteInternships]);

  return (
    <DataTable
      withTableBorder
      highlightOnHover
      fetching={isFormatingLocations}
      loadingText="Processing the locations of the offers... (it should take less than 3 minutes)"
      records={records}
      columns={[
        {
          accessor: "favorite",
          render: ({ favorite, number }) => (
            <HeartIcon
              checked={favorite}
              onClick={() => {
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
          render: () => <div></div>,
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
                      <Text color={color} style={{ whiteSpace: "nowrap" }}>
                        {formatToLabel(f)}
                      </Text>
                    </li>
                  );
                })}
              </ul>
            );
          },
        },
        {
          accessor: "registered",
          textAlign: "center",
          title: "Candidates",
        },
        { accessor: "positions", textAlign: "center", title: "Places" },
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
      ]}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      totalRecords={filteredData.length}
      recordsPerPage={PAGE_SIZE}
      page={page}
      onPageChange={(p) => setPage(p)}
    />
  );
}
