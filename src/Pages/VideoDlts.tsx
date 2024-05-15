import { useEffect, useState } from "react";
import { setLoadingType } from "../Types";
import { BE_getVideoDlts } from "../Backend/Queries";

type ChildComponentProps = {
  catid: string;
  subcatid: string;
  load: setLoadingType;
};
const VideoDlts = ({ catid, subcatid, load }: ChildComponentProps) => {
  useEffect(() => {
    const handle = async () => {
      try {
        const res = await BE_getVideoDlts(catid, subcatid, load);
        console.log("newpage", res);
      } catch (error) {
        console.error("Error fetching video details:", error);
      }
    };

    handle();
  }, [catid, subcatid]);

  return (
    <div>
      <p>hello video</p>
    </div>
  );
};
export default VideoDlts;
