import React, { useEffect, useState } from "react";
import SingleTaskList from "../Components/SingleTaskList";
import { BE_getTaskList } from "../Backend/Queries";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Redux/store";
import { ListLoader } from "../Components/Loaders";
import FlipMove from "react-flip-move";

type Props = {};

function ListPage({ }: Props) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const taskList = useSelector(
    (state: RootState) => state.taskList.currentTaskList
  );

  useEffect(() => {
    BE_getTaskList(dispatch, setLoading);
  }, [dispatch]);

  return (
    <div className="p-2">
      {loading ? (
        <ListLoader />
      ) : taskList.length === 0 ? (
        <h1 className="text-3xl text-center text-gray-500 mt-10">
          No Videos added, add some!
        </h1>
      ) : (
        <FlipMove className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {taskList.map((t) => (
            <SingleTaskList key={t.id} singleTaskList={t} />
          ))}
        </FlipMove>
      )}
    </div>
  );
}

export default ListPage;
