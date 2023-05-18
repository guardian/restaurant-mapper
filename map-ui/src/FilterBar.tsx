export interface FilterBarProps {
    yearOptions: string[];
    selectedYear: string;
    setSelectedYear: (year: string) => any;
}

export function FilterBar(props: FilterBarProps) {
    return <div className="filterBar">
        <label>Year: </label>
        <select value={props.selectedYear} onChange={(e) => props.setSelectedYear(e.target.value)}>
            {
                props.yearOptions.map((year) => <option value={year}>{year}</option>)
            }
        </select>
    </div>
}