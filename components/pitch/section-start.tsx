export function SectionStart() {
  return (
    <div className="min-h-screen">
      <span className="absolute right-4 md:right-8 top-4 text-lg">
        Pitch/2025
      </span>

      <div className="container min-h-screen relative">
        <div className="absolute bottom-auto mt-[150px] -ml-[35px] md:ml-0 md:mt-0 md:bottom-[650px] scale-50 md:scale-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={193}
            height={193}
            fill="none"
            viewBox="0 0 193 193"
          >
            <path
              fill="#fff"
              fillRule="evenodd"
              d="M96.5 0C43.218 0 0 43.218 0 96.5S43.218 193 96.5 193 193 149.782 193 96.5 149.782 0 96.5 0Zm0 20c-42.216 0-76.5 34.284-76.5 76.5s34.284 76.5 76.5 76.5 76.5-34.284 76.5-76.5S138.716 20 96.5 20Zm0 30c-25.681 0-46.5 20.819-46.5 46.5s20.819 46.5 46.5 46.5 46.5-20.819 46.5-46.5S122.181 50 96.5 50Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-[110px] bottom-[250px] left-2 md:text-[426px] absolute md:right-0 md:bottom-8 md:left-auto font-bold leading-none">
          Social<br />Forge
        </h1>
      </div>
    </div>
  );
}
