import {
  formatAtom,
  locationsAtom,
  nbCitiesSelectedAtom,
  showOnlyPositionsNotYetCompletedAtom,
} from "@/atoms";
import { RowData } from "@/types";
import { useAtomValue } from "jotai";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

const NOT_SPECIFIED = "Not specified";

const sortBy = (data: RowData[], columnAccessor: string) => {
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

export default function Table({ data }: { data: RowData[] }) {
  const nbCitiesSelected = useAtomValue(nbCitiesSelectedAtom);
  const selectableFormats = useAtomValue(formatAtom);
  const selectableLocations = useAtomValue(locationsAtom);
  const showOnlyPositionsNotYetCompleted = useAtomValue(
    showOnlyPositionsNotYetCompletedAtom
  );

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "creationDate",
    direction: "desc",
  });

  useEffect(() => {
    setPage(1);
  }, [sortStatus]);

  const sortedData = useMemo(() => {
    return sortBy(data, sortStatus.columnAccessor);
  }, [sortStatus.columnAccessor, data]);

  const [records, setRecords] = useState(sortedData.slice(0, PAGE_SIZE));

  // filter sorted data on the registered column
  const filteredData = useMemo(() => {
    let data = sortedData;

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

    if (selectableFormats.some((f) => f.selected)) {
      data = data.filter((d) => {
        return (
          selectableFormats.find((f) => f.name === d.format)?.selected || false
        );
      });
    }

    if (showOnlyPositionsNotYetCompleted) {
      return data.filter((d) => d.registered < d.positions);
    }

    return data;
  }, [
    sortedData,
    showOnlyPositionsNotYetCompleted,
    selectableLocations,
    nbCitiesSelected,
    selectableFormats,
  ]);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    let d = filteredData;

    if (sortStatus.direction === "desc") {
      d = d.slice().reverse();
    }

    setRecords(d.slice(from, to));
  }, [page, filteredData, sortStatus.direction]);

  return (
    <DataTable
      withBorder
      highlightOnHover
      records={records}
      columns={[
        { accessor: "name", width: "20%" },
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
        { accessor: "format" },
        {
          accessor: "registered",
          textAlignment: "center",
          title: "Candidates",
        },
        { accessor: "positions", textAlignment: "center" },
        { accessor: "professor" },
        { accessor: "creationDate", sortable: true, width: 150 },
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
