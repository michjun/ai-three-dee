import { useState, useEffect } from "react";

export default function CreationList({
  reload,
  selectedCreationId,
  onCreationSelected,
}) {
  const [creations, setCreations] = useState([]);
  const selectedStyle = "bg-gray-600";

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/creations");
      const data = (await response.json()).data;
      setCreations(data.reverse());
    };

    fetchData();
  }, [reload]);

  function onCreationClick(event, creation) {
    event.preventDefault();
    onCreationSelected(creation);
  }

  return (
    <ul className="list-none m-0 p-0">
      {creations.map((creation) => (
        <li
          key={creation._id}
          className={`text-white cursor-pointer border-b border-neutral-300 ${
            creation._id === selectedCreationId ? selectedStyle : ""
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
