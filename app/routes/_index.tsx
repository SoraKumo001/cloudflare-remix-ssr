import { Link } from "@remix-run/react";
import { RemixHead } from "remix-head";

export default function Index() {
  const codes = { 120000: "千葉", 130000: "東京", 140000: "神奈川" } as const;
  return (
    <div className="p-2">
      <RemixHead>
        <title>天気予報</title>
      </RemixHead>
      <a href="https://github.com/SoraKumo001/cloudflare-remix-ssr">
        Source Code
      </a>
      <hr />
      <div className="flex flex-col">
        {Object.entries(codes).map(([key, value]) => (
          <Link key={key} to={`/weather/${key}`} className="underline">
            {value}の天気
          </Link>
        ))}
      </div>
    </div>
  );
}
