import React from "react";
import Task from "./Task";
import { taskType } from "../Types";
import FlipMove from "react-flip-move";

type TasksType = {
  tasks: taskType[];
  listId: string;
  catName: string;
};

function Tasks({ tasks, listId, catName }: TasksType) {
  return (
    <div className="p-3 pb-5">
      <FlipMove>
        {tasks?.map((t) => (
          <Task key={t.id} task={t} listId={listId} catName={catName} />
        ))}
      </FlipMove>
      {tasks.length === 0 && <p className="text-center">No Section added yet!</p>}
    </div>
  );
}

export default Tasks;
