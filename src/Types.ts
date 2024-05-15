export type setLoadingType = React.Dispatch<React.SetStateAction<boolean>>;
export type authDataType = {
  email: string;
  password: string;
  confirmPassword?: string;
};

export type userType = {
  id: string;
  username: string;
  email: string;
  isOnline: boolean;
  img: string;
  creationTime?: string;
  lastSeen?: string;
  bio?: string;
  userLevel: number;
};

export type taskListType = {
  id?: string;
  title: string;
  editMode?: boolean;
  tasks?: taskType[];
};

export type videoListType = {
  id?: string;
  video: string;
  editMode?: boolean;
};

export type taskType = {
  id?: string;
  title: string;
  description: string;
  editMode?: boolean;
  collapsed?: boolean;
};

export type chatType = {
  senderId: string;
  recieverId: string;
  id?: string;
  lastMsg?: string;
  senderToRecieverNewMsgCount?: number;
  recieverToSenderNewMsgCount?: number;
  updatedAt?: string;
};

export type messageType = {
  senderId: string;
  content: string;
  createdAt?: string;
  id?: string;
};

export type categoryListType = {
  id?: string;
  category: string;
};
export type subcategoryListType = {
  id?: string;
  subcategory: string;
};

export type formDataType = {
  id?: string;
  title: string;
  description: string;
  Video_url: string;
};
export type videoType = {
  id?: string;
  title: string;
  description: string;
  Video_url: string;
};
