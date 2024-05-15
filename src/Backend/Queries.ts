import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
} from "@firebase/auth";
import { auth, db } from "./Firebase";
import { toastErr, toastSucc } from "../utils/toast";
import CatchErr from "../utils/catchErr";
import {
  authDataType,
  categoryListType,
  chatType,
  messageType,
  setLoadingType,
  taskListType,
  taskType,
  userType,
  subcategoryListType,
  formDataType,
  videoType,
} from "../Types";
import { NavigateFunction } from "react-router";
import {
  addDoc,
  and,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  or,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "@firebase/firestore";
import {
  defaultUser,
  setAlertProps,
  setUser,
  setUsers,
  userStorageName,
} from "../Redux/userSlice";
import { AppDispatch } from "../Redux/store";
import ConvertTime from "../utils/ConvertTime";
import AvatarGenerator from "../utils/avatarGenerator";
import {
  addTask,
  addTaskList,
  defaultTask,
  defaultTaskList,
  deleteTask,
  deleteTaskList,
  saveTask,
  saveTaskListTitle,
  setTaskList,
  setTaskListTasks,
} from "../Redux/taskListSlice";
import { setChats, setCurrentMessages } from "../Redux/chatsSlice";

// collection names
const usersColl = "users";
const tasksColl = "tasks";
const taskListColl = "taskList";
const chatsColl = "chats";
const messagesColl = "messages";
const categoryColl = "categoryList";
const subCategory = "subCategoryList";
const subcatvideo = "video";

// register or signup a user
export const BE_signUp = (
  data: authDataType,
  setLoading: setLoadingType,
  reset: () => void,
  goTo: NavigateFunction,
  dispatch: AppDispatch
) => {
  const { email, password, confirmPassword } = data;

  // loading true
  setLoading(true);

  if (email && password) {
    if (password === confirmPassword) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(async ({ user: user }) => {
          // generate user avatar with username
          console.log("users", user);
          //goTo("/dashboard");
          const imgLink = AvatarGenerator(user.email?.split("@")[0]);

          const userInfo = await addUserToCollection(
            user.uid,
            user.email || "",
            user.email?.split("@")[0] || "",
            imgLink,
            2
          );
          console.log("User Added", userInfo);
          // set user in store
          dispatch(setUser(userInfo));

          setLoading(false);
          reset();
          goTo("/dashboard");
        })
        .catch((err) => {
          CatchErr(err);
          setLoading(false);
        });
    } else toastErr("Passwords must match!", setLoading);
  } else toastErr("Fields shouldn't be left empty!", setLoading);
};

// sign in a user
export const BE_signIn = (
  data: authDataType,
  setLoading: setLoadingType,
  reset: () => void,
  goTo: NavigateFunction,
  dispatch: AppDispatch
) => {
  const { email, password } = data;

  // loading true
  setLoading(true);

  signInWithEmailAndPassword(auth, email, password)
    .then(async ({ user }) => {
      //update user isOnline to true
      await updateUserInfo({ id: user.uid, isOnline: true });

      // get user info
      const userInfo = await getUserInfo(user.uid);
      console.log('userInfo', userInfo);
      // set user in store
      dispatch(setUser(userInfo));

      setLoading(false);
      reset();
      goTo("/dashboard");
    })
    .catch((err) => {
      CatchErr(err);
      setLoading(false);
    });
};

// signout
export const BE_signOut = (
  dispatch: AppDispatch,
  goTo: NavigateFunction,
  setLoading: setLoadingType,
  deleteAcc?: boolean
) => {
  setLoading(true);
  // logout in firebase
  signOut(auth)
    .then(async () => {
      // set user offline
      if (!deleteAcc) await updateUserInfo({ isOffline: true });

      // set currentSelected user to empty user
      dispatch(setUser(defaultUser));

      // remove from local storage
      localStorage.removeItem(userStorageName);

      // route to auth page
      goTo("/auth");

      setLoading(false);
    })
    .catch((err) => CatchErr(err));
};

// get user from local storage
export const getStorageUser = () => {
  const usr = localStorage.getItem(userStorageName);
  if (usr) return JSON.parse(usr);
  else return "";
};

// save user profile
export const BE_saveProfile = async (
  dispatch: AppDispatch,
  data: { email: string; username: string; password: string; img: string },
  setLoading: setLoadingType
) => {
  setLoading(true);

  const { email, username, password, img } = data;
  const id = getStorageUser().id;

  if (id) {
    // update email if present
    if (email && auth.currentUser) {
      updateEmail(auth.currentUser, email)
        .then(() => {
          toastSucc("Email updated successfully!");
        })
        .catch((err) => CatchErr(err));
    }

    // update passsword if present
    if (password && auth.currentUser) {
      updatePassword(auth.currentUser, password)
        .then(() => {
          toastSucc("Password updated successfully!");
        })
        .catch((err) => CatchErr(err));
    }

    // update user collection only if username or img is present
    if (username || img) {
      await updateUserInfo({ username, img });
      toastSucc("Updated profile successfully!");
    }

    // get user latest info
    const userInfo = await getUserInfo(id);

    // update user in state or store
    dispatch(setUser(userInfo));
    setLoading(false);
  } else toastErr("BE_saveProfile: id not found");
};

// delete account
export const BE_deleteAccount = async (
  dispatch: AppDispatch,
  goTo: NavigateFunction,
  setLoading: setLoadingType
) => {
  setLoading(true);

  if (getStorageUser().id) {
    // get all taskList
    const userTaskList = await getAllTaskList();

    // loop through user tasklist and delete each
    if (userTaskList.length > 0) {
      userTaskList.forEach(async (tL) => {
        if (tL.id && tL.tasks)
          await BE_deleteTaskList(tL.id, tL.tasks, dispatch);
      });
    }

    // delete the user info from collection
    await deleteDoc(doc(db, usersColl, getStorageUser().id));

    // finally delete user account
    const user = auth.currentUser;

    console.log("USER TO BE DELETED", user);

    if (user) {
      deleteUser(user)
        .then(async () => {
          BE_signOut(dispatch, goTo, setLoading, true);
          //window.location.reload();
        })
        .catch((err) => CatchErr(err));
    }
  }
};

// get all users
export const BE_getAllUsers = async (
  dispatch: AppDispatch,
  setLoading: setLoadingType
) => {
  setLoading(true);

  // get all users except the current signin one, those online ontop
  const q = query(collection(db, usersColl), orderBy("isOnline", "desc"));
  onSnapshot(q, (usersSnapshot) => {
    let users: userType[] = [];

    usersSnapshot.forEach((user) => {
      const { img, isOnline, username, email, bio, creationTime, lastSeen, userLevel } =
        user.data();
      users.push({
        id: user.id,
        img,
        isOnline,
        username,
        email,
        bio,
        creationTime: creationTime
          ? ConvertTime(creationTime.toDate())
          : "no date yet: all users creation time",
        lastSeen: lastSeen
          ? ConvertTime(lastSeen.toDate())
          : "no date yet: all users lastseen",
        userLevel
      });
    });

    // take out the current user
    const id = getStorageUser().id;
    if (id) {
      dispatch(setUsers(users.filter((u) => u.id !== id)));
    }
    setLoading(false);
  });
};

// get user information
export const getUserInfo = async (
  id: string,
  setLoading?: setLoadingType
): Promise<userType> => {
  if (setLoading) setLoading(true);
  const userRef = doc(db, usersColl, id);
  const user = await getDoc(userRef);

  if (user.exists()) {
    const { img, isOnline, username, email, bio, creationTime, lastSeen, userLevel } =
      user.data();

    if (setLoading) setLoading(false);

    return {
      id: user.id,
      img,
      isOnline,
      username,
      email,
      bio,
      creationTime: creationTime
        ? ConvertTime(creationTime.toDate())
        : "no date yet: userinfo",
      lastSeen: lastSeen
        ? ConvertTime(lastSeen.toDate())
        : "no date yet: userinfo",
      userLevel
    };
  } else {
    if (setLoading) setLoading(false);
    toastErr("getUserInfo: user not found");
    return defaultUser;
  }
};

// add user to collection
const addUserToCollection = async (
  id: string,
  email: string,
  username: string,
  img: string,
  userLevel: number
) => {
  // create user with userId
  await setDoc(doc(db, usersColl, id), {
    isOnline: true,
    img,
    userLevel,
    username,
    email,
    creationTime: serverTimestamp(),
    lastSeen: serverTimestamp(),
    bio: `Hi! my name is ${username}, thanks to Desmond I understand React and Typescript now, and I'm confortable working with them. I can also build beautiful user interfaces`,
  });

  return getUserInfo(id);
};

// update user info
const updateUserInfo = async ({
  id,
  username,
  img,
  isOnline,
  isOffline,
}: {
  id?: string;
  username?: string;
  img?: string;
  isOnline?: boolean;
  isOffline?: boolean;
}) => {
  if (!id) {
    id = getStorageUser().id;
  }

  // {username} // ...{username} = username
  // username ? {username} : null
  // username && {username}

  if (id) {
    await updateDoc(doc(db, usersColl, id), {
      ...(username && { username }),
      ...(isOnline && { isOnline }),
      ...(isOffline && { isOnline: false }),
      ...(img && { img }), // img:"someimage"
      lastSeen: serverTimestamp(),
    });
  }
};

// -------------------------- FOR Task list ----------------------

// add a single task list
export const BE_addTaskList = async (
  dispatch: AppDispatch,
  setLoading: setLoadingType
) => {
  setLoading(true);
  let { title } = defaultTaskList;
  const catRef = collection(db, taskListColl);
  const tasklist = await getDocs(collection(db, taskListColl));
  const tasklistcnt = tasklist.size + 1;
  title = title + "" + tasklistcnt;

  const q = query(catRef, where("title", "==", title));

  const existing = await getDocs(q);
  if (!existing.empty) {
    toastErr("Category Already Exist!");
    setLoading(false);
  } else {
    // toastErr(title);
    const list = await addDoc(collection(db, taskListColl), {
      title,
      userId: getStorageUser().id,
    });

    const newDocSnap = await getDoc(doc(db, list.path));

    if (newDocSnap.exists()) {
      const newlyAddedDoc: taskListType = {
        id: newDocSnap.id,
        title: newDocSnap.data().title,
      };

      dispatch(addTaskList(newlyAddedDoc));
      setLoading(false);
    } else {
      toastErr("No such Category!");
      setLoading(false);
    }

  }



};

// get all task list
export const BE_getTaskList = async (
  dispatch: AppDispatch,
  setLoading: setLoadingType
) => {
  setLoading(true);

  if (getStorageUser().id) {
    // get user task list
    const taskList = await getAllTaskList();

    dispatch(setTaskList(taskList));
    setLoading(false);
  }
};

// save task list title
export const BE_saveTaskList = async (
  dispatch: AppDispatch,
  setLoading: setLoadingType,
  listId: string,
  title: string
) => {
  setLoading(true);
  // toastErr(title);
  const catRef = collection(db, taskListColl);
  const q = query(catRef, where("title", "==", title));

  const existing = await getDocs(q);



  if (!existing.empty) {
    console.log(existing.docs[0].data());
    console.log(existing.docs[0].id);
    console.log(existing.docs.length);
    console.log(existing.docs[0].data().userId);
    console.log(listId);
    if (existing.docs.length == 1) {
      if (existing.docs[0].id == listId) {
        await updateDoc(doc(db, taskListColl, listId), { title });

        const updatedTaskList = await getDoc(doc(db, taskListColl, listId));

        setLoading(false);
        toastSucc("Category Saved");
        // dispatch to save task list
        dispatch(
          saveTaskListTitle({ id: updatedTaskList.id, ...updatedTaskList.data() })
        );
      } else {
        toastErr("Category Already Exist!");
        setLoading(false);
      }
    } else {
      toastErr("Category Already Exist!");
      setLoading(false);
    }

  } else {

    await updateDoc(doc(db, taskListColl, listId), { title });

    const updatedTaskList = await getDoc(doc(db, taskListColl, listId));

    setLoading(false);
    toastSucc("Category Saved");
    // dispatch to save task list
    dispatch(
      saveTaskListTitle({ id: updatedTaskList.id, ...updatedTaskList.data() })
    );

  }

};

// delete task list
export const BE_deleteTaskList = async (
  listId: string,
  tasks: taskType[],
  dispatch: AppDispatch,
  setLoading?: setLoadingType
) => {
  if (setLoading) setLoading(true);

  // looping through tasks and deleting each
  if (tasks.length > 0) {
    for (let i = 0; i < tasks.length; i++) {
      const { id } = tasks[i];
      if (id) BE_deleteTask(listId, id, dispatch);
    }
  }

  // delete task list board
  const listRef = doc(db, taskListColl, listId);
  await deleteDoc(listRef);

  const deletedTaskList = await getDoc(listRef);

  if (!deletedTaskList.exists()) {
    if (setLoading) setLoading(false);
    // update state
    dispatch(deleteTaskList(listId));
  }
};

// get all users taskList
const getAllTaskList = async () => {
  const id = getStorageUser().id;
  const q = query(collection(db, taskListColl), orderBy('title', 'asc'));

  const taskListSnapshot = await getDocs(q);
  const taskList: taskListType[] = [];

  taskListSnapshot.forEach((doc) => {
    const { title } = doc.data();
    taskList.push({
      id: doc.id,
      title,
      editMode: false,
      tasks: [],
    });
  });

  return taskList;
};

// -------------------------------- FOR TASK -------------------------------

// delete task
export const BE_deleteTask = async (
  listId: string,
  id: string,
  dispatch: AppDispatch,
  setLoading?: setLoadingType
) => {
  if (setLoading) setLoading(true);

  // delete doc
  const taskRef = doc(db, taskListColl, listId, tasksColl, id);
  await deleteDoc(taskRef);

  const deletedTask = await getDoc(taskRef);

  if (!deletedTask.exists()) {
    if (setLoading) setLoading(false);
    dispatch(deleteTask({ listId, id }));
  }
};

// add task
export const BE_addTask = async (
  dispatch: AppDispatch,
  listId: string,
  setLoading: setLoadingType
) => {
  setLoading(true);
  let taskDtls = { title: 'Section Name ', description: 'Description Here' };
  console.log('add task', taskDtls.title);
  let task_title = taskDtls.title;

  const taskk = await getDocs(collection(db, taskListColl, listId, tasksColl));
  const taskkcnt = taskk.size + 1;
  task_title = task_title + "" + taskkcnt;
  taskDtls['title'] = task_title;
  console.log('add taskk', taskk);
  console.log('taskkcnt', taskkcnt);

  const secRef = collection(db, taskListColl, listId, tasksColl);
  const q = query(secRef, where("title", "==", task_title));

  const existing = await getDocs(q);

  console.log('task_title', task_title);
  // console.log('taskkcnt', taskkcnt);
  // console.log('taskk existing', existing); 


  if (!existing.empty) {

    console.log(existing.docs.length);
    console.log(listId);
    let istask = 0;
    await existing.forEach((task) => {
      const { title, description } = task.data();
      if (task_title == title) {
        istask++;
      }
      console.log("title task", title);
    });

    if (istask == 0) {
      const task = await addDoc(collection(db, taskListColl, listId, tasksColl), {
        ...taskDtls,
      });
      const newTaskSnapShot = await getDoc(doc(db, task.path));
      if (newTaskSnapShot.exists()) {
        const { title, description } = newTaskSnapShot.data();
        const newTask: taskType = {
          id: newTaskSnapShot.id,
          title,
          description,
        };
        // add in store
        dispatch(addTask({ listId, newTask }));
        setLoading(false);


      } else {
        toastErr("BE_addTask: No such document");
        setLoading(false);
      }
    } else {
      toastErr("Section Already Exist!");
      setLoading(false);
    }

  } else {
    const task = await addDoc(collection(db, taskListColl, listId, tasksColl), {
      ...taskDtls,
    });
    const newTaskSnapShot = await getDoc(doc(db, task.path));
    if (newTaskSnapShot.exists()) {
      const { title, description } = newTaskSnapShot.data();
      const newTask: taskType = {
        id: newTaskSnapShot.id,
        title,
        description,
      };
      // add in store
      dispatch(addTask({ listId, newTask }));
      setLoading(false);


    } else {
      toastErr("BE_addTask: No such document");
      setLoading(false);
    }
  }
};

// update task
export const BE_saveTask = async (
  dispatch: AppDispatch,
  listId: string,
  data: taskType,
  setLoading: setLoadingType
) => {
  setLoading(true);
  let { id, title, description } = data;
  console.log('start');
  if (id) {
    console.log('if id is already');
    ////////////////Start////////////////


    const taskk = await getDocs(collection(db, taskListColl, listId, tasksColl));
    const taskkcnt = taskk.size + 1;

    console.log('taskkcnt', taskkcnt);

    const secRef = collection(db, taskListColl, listId, tasksColl);
    const q = query(secRef, where("title", "==", title));

    const existing = await getDocs(q);

    console.log('task_title', title);

    if (!existing.empty) {
      console.log('has tasks', existing.docs.length);
      console.log(existing.docs.length);
      console.log(listId);
      let istask = 0;
      let task_title = title;
      await existing.forEach((task) => {
        const { title, description } = task.data();
        if (task_title == title && id != task.id) {
          istask++;
        }
        console.log("title task", title);
        console.log('in the loop');
      });

      if (istask == 0) {
        console.log('task not matched');
        const taskRef = doc(db, taskListColl, listId, tasksColl, id);
        await updateDoc(taskRef, { title, description });

        const updatedTask = await getDoc(taskRef);
        console.log('updatedTask ', updatedTask);

        if (updatedTask.exists()) {
          console.log('updated Section ');
          setLoading(false);
          toastSucc("Updated Section");
          // dispatch
          dispatch(saveTask({ listId, id: updatedTask.id, ...updatedTask.data() }));
        } else toastErr("updated Section not found");
      } else {
        toastErr("Section Already Exist!");
        setLoading(false);
      }

    } else {
      const taskRef = doc(db, taskListColl, listId, tasksColl, id);
      await updateDoc(taskRef, { title, description });

      const updatedTask = await getDoc(taskRef);
      console.log('updatedTask ', updatedTask);

      if (updatedTask.exists()) {
        console.log('updated Section ');
        setLoading(false);
        // dispatch
        dispatch(saveTask({ listId, id: updatedTask.id, ...updatedTask.data() }));
      } else {
        setLoading(false);
        toastErr("updated Section not found");
      }
    }
    ////////////////end////////////////


  } else {
    console.log('no id available');
    toastErr("id not found");
    setLoading(false);
  }
};

// get tasks for task list
export const getTasksForTaskList = async (
  dispatch: AppDispatch,
  listId: string,
  setLoading: setLoadingType
) => {
  setLoading(true);

  // get tasks in a single task list
  const taskRef = collection(db, taskListColl, listId, tasksColl);
  const q = query(taskRef, orderBy('title', 'asc'));
  const tasksSnapshot = await getDocs(q);
  const tasks: taskType[] = [];

  // if the tasks snap shot is not empty then do foreach
  if (!tasksSnapshot.empty) {
    tasksSnapshot.forEach((task) => {
      const { title, description } = task.data();
      tasks.push({
        id: task.id,
        title,
        description,
        editMode: false,
        collapsed: true,
      });
    });
  }

  dispatch(setTaskListTasks({ listId, tasks }));
  setLoading(false);
};

// -------------------------------- FOR CHATS -------------------------------

// start a chat
export const BE_startChat = async (
  dispatch: AppDispatch,
  rId: string,
  rName: string,
  setLoading: setLoadingType
) => {
  const sId = getStorageUser().id;
  setLoading(true);

  // check if chat exists first
  const q = query(
    collection(db, chatsColl),
    or(
      and(where("senderId", "==", sId), where("recieverId", "==", rId)),
      and(where("senderId", "==", rId), where("recieverId", "==", sId))
    )
  );
  const res = await getDocs(q);

  // if you find no chat with this two ids then create one
  if (res.empty) {
    const newChat = await addDoc(collection(db, chatsColl), {
      senderId: sId,
      recieverId: rId,
      lastMsg: "",
      updatedAt: serverTimestamp(),
      senderToRecieverNewMsgCount: 0,
      recieverToSenderNewMsgCount: 0,
    });

    const newChatSnapshot = await getDoc(doc(db, newChat.path));

    if (!newChatSnapshot.exists()) {
      toastErr("BE_startChat: No such document");
    }
    setLoading(false);
    dispatch(setAlertProps({ open: false }));
  } else {
    toastErr("You already started chatting with " + rName);
    setLoading(false);
    dispatch(setAlertProps({ open: false }));
  }
};

// get users chats
export const BE_getChats = async (dispatch: AppDispatch) => {
  const id = getStorageUser().id;

  const q = query(
    collection(db, chatsColl),
    or(where("senderId", "==", id), where("recieverId", "==", id)),
    orderBy("updatedAt", "desc")
  );

  onSnapshot(q, (chatSnapshot) => {
    const chats: chatType[] = [];

    chatSnapshot.forEach((chat) => {
      const {
        senderId,
        recieverId,
        lastMsg,
        updatedAt,
        recieverToSenderNewMsgCount,
        senderToRecieverNewMsgCount,
      } = chat.data();

      chats.push({
        id: chat.id,
        senderId,
        recieverId,
        lastMsg,
        updatedAt: updatedAt
          ? ConvertTime(updatedAt.toDate())
          : "no date yet: all messages",
        recieverToSenderNewMsgCount,
        senderToRecieverNewMsgCount,
      });
    });

    console.log("CHATS", chats);
    dispatch(setChats(chats));
  });
};

// get users messages
export const BE_getMsgs = async (
  dispatch: AppDispatch,
  chatId: string,
  setLoading: setLoadingType
) => {
  setLoading(true);

  const q = query(
    collection(db, chatsColl, chatId, messagesColl),
    orderBy("createdAt", "asc")
  );

  onSnapshot(q, (messagesSnapshot) => {
    let msgs: messageType[] = [];

    messagesSnapshot.forEach((msg) => {
      const { senderId, content, createdAt } = msg.data();
      msgs.push({
        id: msg.id,
        senderId,
        content,
        createdAt: createdAt
          ? ConvertTime(createdAt.toDate())
          : "no date yet: all messages",
      });
    });

    dispatch(setCurrentMessages(msgs));
    setLoading(false);
  });
};

// get users messages
export const BE_sendMsgs = async (
  chatId: string,
  data: messageType,
  setLoading: setLoadingType
) => {
  setLoading(true);

  const res = await addDoc(collection(db, chatsColl, chatId, messagesColl), {
    ...data,
    createdAt: serverTimestamp(),
  });

  const newMsg = await getDoc(doc(db, res.path));
  if (newMsg.exists()) {
    setLoading(false);
    // reset new message count
    await updateNewMsgCount(chatId, true);
    await updateLastMsg(chatId, newMsg.data().content);
    await updateUserInfo({}); // update last seen
  }
};

// function to check if I created a chat
export const iCreatedChat = (senderId: string) => {
  const myId = getStorageUser().id;
  return myId === senderId;
};

// updat new message count for user
export const updateNewMsgCount = async (chatId: string, reset?: boolean) => {
  const chat = await getDoc(doc(db, chatsColl, chatId));

  let senderToRecieverNewMsgCount = chat.data()?.senderToRecieverNewMsgCount;
  let recieverToSenderNewMsgCount = chat.data()?.recieverToSenderNewMsgCount;

  if (iCreatedChat(chat.data()?.senderId)) {
    if (reset) recieverToSenderNewMsgCount = 0;
    else senderToRecieverNewMsgCount++;
  } else {
    if (reset) senderToRecieverNewMsgCount = 0;
    else recieverToSenderNewMsgCount++;
  }

  await updateDoc(doc(db, chatsColl, chatId), {
    updatedAt: serverTimestamp(),
    senderToRecieverNewMsgCount,
    recieverToSenderNewMsgCount,
  });
};

// update last message
const updateLastMsg = async (chatId: string, lastMsg: string) => {
  await updateNewMsgCount(chatId);
  // await message count here
  await updateDoc(doc(db, chatsColl, chatId), {
    lastMsg,
    updatedAt: serverTimestamp(),
  });
};

export const BE_addCategoryList = async (
  dispatch: AppDispatch,
  setLoading: setLoadingType,
  category: string
) => {
  setLoading(true);
  //const { title } = defaultTaskList;
  const list = await addDoc(collection(db, categoryColl), {
    category,
    // userId: getStorageUser().id,
  });

  const newDocSnap = await getDoc(doc(db, list.path));
  setLoading(false);
  if (newDocSnap.exists()) {
    const newlyAddedDoc: categoryListType = {
      id: newDocSnap.id,
      category: newDocSnap.data().category,
    };
    console.log("categoryadded", newlyAddedDoc);
    // dispatch(addTaskList(newlyAddedDoc));
    setLoading(false);
  } else {
    toastErr("BE_addTaskList:No such doc");
    setLoading(false);
  }
};

export const BE_getCategoryList = async (
  dispatch: AppDispatch,
  setLoading: setLoadingType
) => {
  setLoading(true);

  if (getStorageUser().id) {
    // get user task list
    const catList = await getAllCategoryList();

    console.log("getcatlist", catList);

    //dispatch(setTaskList(taskList));
    setLoading(false);
    return catList;
  }
};

//sub category

export const BE_addSubCat = async (
  dispatch: AppDispatch,
  listId: string,
  setLoading: setLoadingType,
  subcategory: string
) => {
  setLoading(true);

  const task = await addDoc(collection(db, categoryColl, listId, subCategory), {
    subcategory,
  });

  const newTaskSnapShot = await getDoc(doc(db, task.path));

  if (newTaskSnapShot.exists()) {
    const { subcategory } = newTaskSnapShot.data();
    const newTask: subcategoryListType = {
      id: newTaskSnapShot.id,
      subcategory,
    };

    console.log("subcategoryadded", newTask);
    // add in store
    //  dispatch(addTask({ listId, newTask }));
    setLoading(false);
  } else {
    toastErr("BE_addTask: No such document");
    setLoading(false);
  }
};

//get all sub cat

// export const BE_getSubCategoryList = async (
//   dispatch: AppDispatch,
//   setLoading: setLoadingType,
//   listId:string
// ) => {
//   setLoading(true);

//   if (getStorageUser().id) {
//     // get user task list
//     const subcatList = await getAllSubCategoryList();

//     console.log("subgetcatlist", subcatList);

//     //dispatch(setTaskList(taskList));
//     setLoading(false);
//     return subcatList;
//   }
// };

///
export const BE_getSubCategoryList = async (
  dispatch: AppDispatch,
  listId: string,
  setLoading: setLoadingType
) => {
  setLoading(true);

  // get tasks in a single task list
  const taskRef = collection(db, categoryColl, listId, subCategory);
  const tasksSnapshot = await getDocs(taskRef);
  const tasks: subcategoryListType[] = [];

  // if the tasks snap shot is not empty then do foreach
  if (!tasksSnapshot.empty) {
    tasksSnapshot.forEach((task) => {
      const { subcategory } = task.data();
      tasks.push({
        id: task.id,
        subcategory,
      });
    });
  }

  //dispatch(setTaskListTasks({ listId, tasks }));
  setLoading(false);

  return tasks;
};

////

const getAllCategoryList = async () => {
  const id = getStorageUser().id;
  const q = query(collection(db, categoryColl));

  const taskListSnapshot = await getDocs(q);
  const categoryList: categoryListType[] = [];

  taskListSnapshot.forEach((doc) => {
    const { category } = doc.data();
    categoryList.push({
      id: doc.id,
      category,
    });
  });

  return categoryList;
};

const getAllSubCategoryList = async () => {
  const id = getStorageUser().id;
  const q = query(collection(db, subCategory));

  const subCatListSnapshot = await getDocs(q);
  const subcategoryList: subcategoryListType[] = [];

  subCatListSnapshot.forEach((doc) => {
    const { subcategory } = doc.data();
    subcategoryList.push({
      id: doc.id,
      subcategory,
    });
  });

  return subcategoryList;
};

export const BE_formdata = async (
  dispatch: AppDispatch,
  listId: string,
  catid: string,
  data: formDataType,
  setLoading: setLoadingType
) => {
  setLoading(true);
  const { title, description, Video_url } = data;

  const subCategoryRef = doc(db, categoryColl, catid, subCategory, listId);

  // Use the 'addDoc' function to add a document to the 'subcatvideo' subcollection within 'subCategory'
  //const newSubcatvideoDocRef = await addDoc(collection(subCategoryRef, "subcatvideo")
  const task = await addDoc(collection(subCategoryRef, subcatvideo), {
    title,
    description,
    Video_url,
  });

  const newTaskSnapShot = await getDoc(doc(db, task.path));
  if (newTaskSnapShot.exists()) {
    const { title, description, Video_url } = newTaskSnapShot.data();
    const newTask: formDataType = {
      id: newTaskSnapShot.id,
      title,
      description,
      Video_url,
    };

    console.log("formdata submited", newTask);
    // add in store
    //  dispatch(addTask({ listId, newTask }));
    setLoading(false);
  } else {
    toastErr("BE_addTask: No such document");
    setLoading(false);
  }
};

//Edit Category
export const BE_EDITCAT = async (
  dispatch: AppDispatch,
  setLoading: setLoadingType,
  catid: string,
  category: string
) => {
  setLoading(true);

  await updateDoc(doc(db, categoryColl, catid), { category });

  const updatedTaskList = await getDoc(doc(db, categoryColl, catid));

  setLoading(false);

  // dispatch to save task list
  // dispatch(
  //   saveTaskListTitle({ id: updatedTaskList.id, ...updatedTaskList.data() })
  // );
};

//Edit SubCategory
export const BE_EDITSUBCAT = async (
  dispatch: AppDispatch,
  catid: string,
  subcatid: string,
  subcategory: string,
  setLoading: setLoadingType
) => {
  setLoading(true);

  if (catid) {
    const taskRef = doc(db, categoryColl, catid, subCategory, subcatid);
    await updateDoc(taskRef, { subcategory });

    const updatedTask = await getDoc(taskRef);

    setLoading(false);
    // dispatch
  } else toastErr("BE_saveTask: id not found");
};

//get video details
export const BE_getVideoDlts = async (
  //dispatch: AppDispatch,
  catid: string,
  subcatid: string,
  setLoading: setLoadingType
) => {
  setLoading(true);

  // get tasks in a single task list
  const videoRef = collection(
    db,
    categoryColl,
    catid,
    subCategory,
    subcatid,
    subcatvideo
  );
  const videosSnapshot = await getDocs(videoRef);

  const videos: videoType[] = [];

  // if the tasks snap shot is not empty then do foreach
  if (!videosSnapshot.empty) {
    videosSnapshot.forEach((task) => {
      console.log("back video", task.data());
      const { title, description, Video_url } = task.data();
      videos.push({
        id: task.id,
        title,
        description,
        Video_url,
      });
    });
  }

  //dispatch(setTaskListTasks({ listId, tasks }));
  setLoading(false);

  return videos;
};
