import { useState, useEffect } from "react";
import CreationData from "@/models/CreationData";

export default function CreationList({
  refresh,
  selectedCreationId,
  onCreationSelected,
  onRefreshComplete,
}) {
  const [creations, setCreations] = useState([]);
  const selectedStyle = "bg-amber-500";

  useEffect(() => {
    if (refresh) {
      const fetchData = async () => {
        const response = await fetch("/api/creations");
        const data = (await response.json()).data;
        setCreations(
          data
            .reverse()
            .map(
              (creation) =>
                new CreationData(
                  creation.title,
                  creation.content,
                  creation.chatThread,
                  0,
                  creation._id
                )
            )
        );
        onRefreshComplete();
      };

      fetchData();
    }
  }, [refresh]);

  function onCreationClick(event, creation) {
    event.preventDefault();
    onCreationSelected(creation);
  }

  return (
    <ul className="list-none m-0 p-0">
      {creations.map((creation) => (
        <li
          key={creation.id}
          className={`text-white cursor-pointer border-b border-neutral-300 ${
            creation.id === selectedCreationId ? selectedStyle : ""
          }`}
        >
          <a
            className="block w-full p-2.5"
            onClick={(e) => onCreationClick(e, creation)}
          >
            {creation.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
