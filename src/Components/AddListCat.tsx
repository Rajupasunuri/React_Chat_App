import React, { useState } from "react";
import Button from "./Button";
import Icon from "./Icon";
import { MdAdd } from "react-icons/md";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../Redux/store";
import { useNavigate } from "react-router-dom";
import { BE_addTaskList } from "../Backend/Queries";

const AddListBoard = () => {
  const [addLoading, setAddLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const goTo = useNavigate();
  const handleGoToPage = (page: string) => {
    goTo("/dashboard/" + page);
    setCurrentPage(page);
  };

  const setCurrentPage = (page: string) => {
    localStorage.setItem("superhero-page", page);
  };


  return (
    <>
      <Button
        text="Add New Category"
        onClick={() => handleGoToPage("category")}
        className="hidden md:flex"
        loading={addLoading}
      />
      <Icon
        onClick={() => handleGoToPage("category")}
        IconName={MdAdd}
        className="block md:hidden"
        loading={addLoading}
        reduceOpacityOnHover={false}
      />
    </>
  );
};

export default AddListBoard;
