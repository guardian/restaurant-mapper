import graceRoundel from './reviewerImages/grace_roundel1.png';
import jayRoundel from './reviewerImages/jay_roundel1.png';

export interface FilterBarProps {
    yearOptions: string[];
    selectedYear: string;
    setSelectedYear: (year: string) => any;
    selectedReviewer?: Reviewer;
    setSelectedReviewer?: (reviewer: string) => any;
}

export interface Reviewer {
    name: string;
    profileImage?: string;
    seriesUri?: string;
}

export const REVIEWERS: Reviewer[] = [
    {
        name: "Jay Rayner",
        profileImage: jayRoundel
    },
    {
        name: "Grace Dent",
        profileImage: graceRoundel
    }
];

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