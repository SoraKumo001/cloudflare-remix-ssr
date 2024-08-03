import { Link, useParams } from "@remix-run/react";
import { useSSR } from "next-ssr";
import { RemixHead } from "remix-head";

export interface WeatherType {
  publishingOffice: string;
  reportDatetime: string;
  targetArea: string;
  headlineText: string;
  text: string;
}

/**
 * Data obtained from the JMA website.
 */

/**
 * Components for displaying weather information
 */
const Weather = ({ code }: { code: number }) => {
  const { data, reload, isLoading } = useSSR<WeatherType>(
    () =>
      fetch(
        `https://www.jma.go.jp/bosai/forecast/data/overview_forecast/${code}.json`
      )
        .then((r) => r.json<WeatherType>())
        .then(
          // Additional weights (500 ms)
          (r) => new Promise((resolve) => setTimeout(() => resolve(r), 500))
        ),
    { key: code }
  );
  if (!data) return <div>loading</div>;
  const { targetArea, reportDatetime, headlineText, text } = data;
  return (
    <>
      <div>
        <Link to="..">戻る</Link>
      </div>
      <div className={`mt-4${isLoading ? " bg-gray-500 relative" : ""}`}>
        {isLoading && (
          <div className="absolute text-white top-1/2 left-1/2">loading</div>
        )}
        <RemixHead>
          <title>{`${targetArea}の天気`}</title>
        </RemixHead>
        <h1 className="flex text-4xl font-extrabold leading-none items-center gap-2">
          {targetArea}
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={reload}
          >
            Reload
          </button>
        </h1>

        <div>
          {new Date(reportDatetime).toLocaleString("ja-JP", {
            timeZone: "JST",
          })}
        </div>
        <div>{headlineText}</div>
        <div style={{ whiteSpace: "pre-wrap" }}>{text}</div>
      </div>
    </>
  );
};

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <Weather code={Number(id)} />;
}
