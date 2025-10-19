import {
  MdChevronLeft,
  MdChevronRight,
  MdEditCalendar,
  MdIosShare,
  MdOutlineContentCopy,
  MdOutlineVisibility,
} from "react-icons/md";

export const PitchIcons = {
  Copy: MdOutlineContentCopy,
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={17}
      fill="none"
      {...props}
    >
      <path
        fill="currentColor"
        d="m14 5.167-8 8L2.333 9.5l.94-.94L6 11.28l7.06-7.053.94.94Z"
      />
    </svg>
  ),
  Visibility: MdOutlineVisibility,
  Share: MdIosShare,
  Calendar: MdEditCalendar,
  ChevronRight: MdChevronRight,
  ChevronLeft: MdChevronLeft,
};
