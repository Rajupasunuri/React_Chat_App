import React, { Fragment, useEffect, useState } from "react";
import Icon from "../Components/Icon";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdPlayCircle,
  MdSave,
} from "react-icons/md";
import { db } from "../Backend/Firebase";
import { toastErr, toastSucc } from "../utils/toast";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "@firebase/firestore";
import { ListLoader } from "../Components/Loaders";
import FlipMove from "react-flip-move";
import ReactPlayer from 'react-player/lazy'
import { Transition, Dialog } from "@headlessui/react";
type Props = {};

function SectionVideos({ }: Props) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [loading, setLoading] = useState(false);
  const [qv, setQv] = useState(false);
  const [videos, setVideos] = useState([]);
  const [thisvideo, setThisvideo] = useState('');
  const [thisvideoid, setThisvideoid] = useState('');
  const [homeTitle, setHomeTitle] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addTaskLoading, setAddTaskLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [catName, setCatName] = useState(localStorage.getItem("catName"));
  const [secName, setSecName] = useState(localStorage.getItem("secName"));
  const [catid, setCatid] = useState<any>(localStorage.getItem("catid"));
  const [secid, setSecid] = useState<any>(localStorage.getItem("secid"));
  const [modal, setmodal] = useState(false);
  const [emodal, setEmodal] = useState(false);
  const [playv, setPlayv] = useState(false);
  const [playingv, setPlayingv] = useState('');
  const [url, setUrl] = useState("");


  useEffect(() => {
    getAllVideosList();

  }, []);
  useEffect(() => {
    getAllVideosList();

  }, [qv]);
  const getAllVideosList = async () => {
    console.log("getAllVideosList");
    const videosSnapshot = await getDocs(collection(db, 'taskList', catid, 'tasks', secid, 'videos'));
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
  };


  const handleSaveTaskListTitle = () => {

  };



  const handleDelete = async (id: string) => {



    const taskRef = doc(db, 'taskList', catid, 'tasks', secid, 'videos', id);
    try {
      await deleteDoc(taskRef);

      setQv(!qv);
      toastSucc("Video Deleted successfully");

    } catch (err) {
      toastErr("Video Delete Failled!");
    }

  };

  const playVideoNow = (video: string) => {
    setPlayv(true);
    setEmodal(false);
    setmodal(false);
    setPlayingv(video);
  };

  const handleAddTask = () => {
    setmodal(true);
    setEmodal(false);
    setPlayv(false);
  };

  const handleEditvideo = (video: string, id: string) => {
    setThisvideo(video);
    setThisvideoid(id);
    setEmodal(true);
    setmodal(true);
    setPlayv(false);
  };

  const handleEdit = async (e: any) => {
    e.preventDefault();
    if (url != '') {
      let video = thisvideo;
      let id = thisvideoid;
      const taskRef = doc(db, 'taskList', catid, 'tasks', secid, 'videos', id);
      try {
        await updateDoc(taskRef, { video });
        setThisvideo('');
        setThisvideoid('');
        setmodal(false);
        setEmodal(false);
        setQv(!qv);
        toastSucc("Video Edited successfully");

      } catch (err) {
        toastErr("Video Editing Failled!");
      }
    }
  };


  const handlesubmit = async (e: any) => {
    e.preventDefault();
    if (url != '') {
      let video = url;
      const addvideo = await addDoc(collection(db, 'taskList', catid, 'tasks', secid, 'videos'), {
        video,
      });
      if (addvideo.path) {
        setmodal(false);
        setUrl('');
        setQv(!qv);
        toastSucc("Video Added successfully");
      } else {
        toastErr("Video Adding Failled!");
      }
    }
  };

  return (
    <>
      <Transition appear show={playv} as={Fragment}>
        <Dialog
          as="div"
          open={playv}
          onClose={() => setPlayv(false)}
          className="w-full h-full"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" />
          </Transition.Child>
          <div
            id="slideIn_down_modal"
            className="fixed inset-0 z-[999] overflow-y-auto bg-black/20"
          >
            <div className="flex min-h-screen items-start justify-center">
              <Dialog.Panel className="panel animate__animated animate__slideInDown my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                <div className="flex flex-col bg-white px-2 py-3 dark:bg-white border-b">
                  <div className="flex items-center justify-between bg-white px-2 py-3 dark:bg-white border-b">
                    <button
                      onClick={() => setPlayv(false)}
                      type="button"
                      className="text-white-dark hover:text-dark"
                    >
                      &times;
                    </button>
                  </div>
                  <div>
                    <ReactPlayer
                      width="100%"
                      height="100%"
                      controls
                      playing={false}
                      url={playingv} />
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
      <div className="p-2">
        {loading ? (
          <ListLoader />
        ) : videos.length === 0 ? (
          <h1 className="text-3xl text-center text-gray-500 mt-10">
            IN {catName} / {secName}  No Videos added {currentUser.userLevel === 1 ? (
              <>", add some!" <Icon
                onClick={handleAddTask}
                IconName={MdAdd}
                className="absolute -mt-10  p-3 drop-shadow-lg"
                reduceOpacityOnHover={false}
                loading={addTaskLoading}
              />
              </>
            ) : null}
          </h1>
        ) : (
          <>
            <h1 className="text-3xl text-center text-gray-500 mt-10">
              {catName} / {secName} Videos {currentUser.userLevel === 1 ? (
                <Icon
                  onClick={handleAddTask}
                  IconName={MdAdd}
                  className="absolute -mt-10  p-3 drop-shadow-lg"
                  reduceOpacityOnHover={false}
                  loading={addTaskLoading}
                />
              ) : null}
            </h1>
            <FlipMove className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {videos.map((video: any, index) => (
                <div key={index} className="relative">
                  <div className="bg-[#d3f0f9] w-full  drop-shadow-md rounded-md overflow-hidden">
                    <div className="flex flex-wrap justify-end md:gap-10 bg-gradient-to-tr from-myBlue to-myBlue bg-opacity-70 p-3 text-white">


                      <>
                        <Icon
                          IconName={MdPlayCircle}
                          onClick={() => playVideoNow(video.video)}
                          size={32}
                        />
                        {currentUser.userLevel === 1 ? (
                          <>
                            <Icon
                              IconName={video.editMode ? MdSave : MdEdit}
                              onClick={() => handleEditvideo(video.video, video.id)}
                            />
                            <Icon
                              onClick={() => handleDelete(video.id)}
                              IconName={MdDelete}
                            />
                          </>
                        ) : null}
                      </>

                    </div>
                    {/* <ReactPlayer
                      width="100%"
                      height="100%"
                      controls
                      playing={false}
                      url={video.video} /> */}
                  </div>


                </div>
              ))}
            </FlipMove>
          </>
        )}
      </div>
      <Transition appear show={modal} as={Fragment}>
        <Dialog
          as="div"
          open={modal}
          onClose={() => setmodal(false)}
          className="sm:w-[300px] w-[100px]"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" />
          </Transition.Child>
          <div
            id="slideIn_down_modal"
            className="fixed inset-0 z-[999] overflow-y-auto bg-black/20"
          >
            <div className="flex min-h-screen items-start justify-center px-4">
              <Dialog.Panel className="panel animate__animated animate__slideInDown my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                <div className="flex flex-col bg-white px-5 py-3 dark:bg-white border-b">
                  <div className="flex items-center justify-between bg-white px-5 py-3 dark:bg-white border-b">
                    <h5 className="text-lg font-bold">{emodal ? "Edit " : "Add "} Video Url</h5>
                    <button
                      onClick={() => setmodal(false)}
                      type="button"
                      className="text-white-dark hover:text-dark"
                    >
                      &times;
                    </button>
                  </div>
                  <div>
                    {emodal ? (
                      <form className="flex flex-col  ">
                        <input
                          type="url"
                          name="video"
                          onChange={(e) => setThisvideo(e.target.value)}
                          placeholder="Vimeo or Youtube url...."
                          className="border border-1 rounded-md m-2 p-1 border-gray-500"
                          value={thisvideo}
                          required
                        />
                        <button
                          type="submit"
                          onClick={(e: any) => handleEdit(e)}
                          className="border border-1 border-gray-500 rounded-md p-2 mt-6 mx-2 hover:bg-gray-100"
                        >
                          Edit Video
                        </button>
                      </form>
                    ) : (
                      <form className="flex flex-col  ">
                        <input
                          type="url"
                          name="video"
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="Vimeo or Youtube url...."
                          className="border border-1 rounded-md m-2 p-1 border-gray-500"
                          value={url}
                          required
                        />
                        <button
                          type="submit"
                          onClick={(e: any) => handlesubmit(e)}
                          className="border border-1 border-gray-500 rounded-md p-2 mt-6 mx-2 hover:bg-gray-100"
                        >
                          Add Video
                        </button>
                      </form>
                    )}

                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

    </>
  );
}

export default SectionVideos;
