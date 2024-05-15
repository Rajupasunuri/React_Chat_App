import React, { forwardRef, useState, useEffect } from "react";
import Icon from "./Icon";
import { MdDelete, MdEdit, MdSave, MdPlayCircle } from "react-icons/md";
import { taskType } from "../Types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Redux/store";
import { collapseTask, taskSwitchEditMode } from "../Redux/taskListSlice";
import { BE_deleteTask, BE_saveTask } from "../Backend/Queries";
import { useNavigate } from "react-router-dom";
import { db } from "../Backend/Firebase";
import {
  collection,
  getDocs,
} from "@firebase/firestore";
type TaskType = {
  task: taskType;
  listId: string;
  catName: string;
};

const Task = forwardRef(
  (
    { task, listId, catName }: TaskType,
    ref: React.LegacyRef<HTMLDivElement> | undefined
  ) => {
    const currentUser = useSelector((state: RootState) => state.user.currentUser);
    const { id, title, description, editMode, collapsed } = task;
    const [homeTitle, setHomeTitle] = useState(title);
    const [taskid, setTaskid] = useState(id);
    const [videocnt, setVideocnt] = useState(0);
    const [homeDescription, setHomeDescription] = useState(description);
    const [saveLoading, setSaveLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const [videos, setVideos] = useState([]);

    useEffect(() => {
      getAllVideosList(taskid);

    }, []);

    const getAllVideosList = async (taskid: any) => {
      console.log("getAllVideosList");
      const videosSnapshot = await getDocs(collection(db, 'taskList', listId, 'tasks', taskid, 'videos'));
      console.log("videosSnapshot", videosSnapshot);
      let videolist: any = [];
      await videosSnapshot.forEach((doc) => {
        const { video } = doc.data();
        console.log("video", video);
        videolist.push({
          id: doc.id,
          video,
        });
      });
      console.log("videolist", videolist);
      setVideos(videolist);
      setVideocnt(videolist.length);
    };


    const handleSave = () => {
      const taskData: taskType = {
        id,
        title: homeTitle,
        description: homeDescription,
      };
      console.log(taskData);
      // save func
      BE_saveTask(dispatch, listId, taskData, setSaveLoading);
    };
    const goTo = useNavigate();
    const taketovideos = ({ catName, title, listId, id }: any) => {
      localStorage.setItem("superhero-page", 'section_videos');
      localStorage.setItem("catName", catName);
      localStorage.setItem("secName", title);
      localStorage.setItem("catid", listId);
      localStorage.setItem("secid", id);
      goTo("/dashboard/section_videos");
      // console.log("secName", title);
    };

    const handleDelete = () => {
      if (id) BE_deleteTask(listId, id, dispatch, setDeleteLoading);
    };

    return (
      <div
        ref={ref}
        className="p-2 mb-2 bg-white rounded-md drop-shadow-sm hover:drop-shadow-md"
      >
        <div>
          {editMode && currentUser.userLevel === 1 ? (
            <input
              value={homeTitle}
              onChange={(e) => setHomeTitle(e.target.value)}
              className="border-2 px-2 border-myBlue rounded-sm mb-1"
              placeholder="Section title"
            />
          ) : (

            <div onClick={() => dispatch(collapseTask({ listId, id }))}
              className="flex cursor-pointer py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50">
              {title}
              <span className="inline-flex items-center py-0.5 px-1.5 rounded-full text-xs font-medium bg-red-500 text-white">{videocnt}</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <div>
            <hr />
            <div>
              {editMode && currentUser.userLevel === 1 ? (
                <textarea
                  onChange={(e) => setHomeDescription(e.target.value)}
                  value={homeDescription}
                  placeholder="Section description"
                  className="w-full px-3 border-2 border-myBlue rounded-md mt-2"
                />
              ) : (
                <p className="p-2 text-justify">{description}</p>
              )}

              <div className="flex justify-end">
                <Icon
                  onClick={() => taketovideos({ catName, title, listId, id })
                  }
                  IconName={MdPlayCircle}
                  size={32}
                />
                {currentUser.userLevel === 1 ? (
                  <>
                    <Icon
                      onClick={() =>
                        editMode
                          ? handleSave()
                          : dispatch(taskSwitchEditMode({ listId, id }))
                      }
                      IconName={editMode ? MdSave : MdEdit}
                      loading={editMode && saveLoading}
                      size={16}
                    />
                    <Icon
                      onClick={handleDelete}
                      IconName={MdDelete}
                      loading={deleteLoading}
                      size={16}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default Task;
