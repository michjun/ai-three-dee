import { useState, useEffect } from "react";
import CreationData from "@/models/CreationData";

export default function CreationList({
  refresh,
  getCreationItem,
  onRefreshComplete,
  className,
}) {
  const [creations, setCreations] = useState([]);

  useEffect(() => {
    if (refresh) {
      const fetchData = async () => {
        const response = await fetch("/api/creations");
        const data = (await response.json()).data;
        setCreations(
          data.reverse().map((creation) => new CreationData(creation))
        );
        if (onRefreshComplete) {
          onRefreshComplete();
        }
      };

      fetchData();
    }
  }, [refresh]);

  return (
    <ul className={`list-none m-0 p-0 ${className}`}>
      {creations.map((creation) => getCreationItem(creation))}
    </ul>
  );
}
