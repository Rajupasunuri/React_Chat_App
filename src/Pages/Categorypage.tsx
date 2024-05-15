import React, { Fragment, useEffect, useState } from "react";
import Input from "../Components/Input";
import Button from "../Components/Button";
import DataTable from "react-data-table-component";

import { Transition, Dialog } from "@headlessui/react";

import { useDispatch } from "react-redux";
import { AppDispatch } from "../Redux/store";
import {
  BE_addCategoryList,
  BE_getCategoryList,
  BE_addSubCat,
  BE_getSubCategoryList,
  BE_formdata,
  BE_EDITCAT,
  BE_EDITSUBCAT,
  BE_getVideoDlts,
} from "../Backend/Queries";
import { formDataType } from "../Types";
import { Link } from "react-router-dom";

interface RowData {
  id: any;
  category: string;
}
interface RowDatasub {
  id: any;
  subcategory: string;
}

const Category = () => {
  const [catgy, setCatgy] = useState("");
  const [title, settitle] = useState("");
  const [url, seturl] = useState("");
  const [description, setdescription] = useState("");
  const [togglecats, setTogglecats] = useState(false);
  const [subcatgy, setSubCatgy] = useState("");
  const [catid, setCatId] = useState("");
  const [subcatid, setSubCatId] = useState("");
  const [catshow, setCatShow] = useState(true);
  const [catLoading, setcatLoading] = useState(false);
  const [data, setData] = useState<RowData[]>([]);
  const [filter, setFilter] = useState<any>([]);
  const [filtersub, setFilterSub] = useState<any>([]);
  const [modal, setmodal] = useState(false);
  const [editBox, setEditBox] = useState(false);
  const [catEdit, setCatEdit] = useState("");
  const [subcatEdit, setSubCatEdit] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  const columns: any = [
    {
      name: "#",
      selector: (row: RowData, index: number) => index + 1,
    },
    {
      name: "Category",
      selector: (row: RowData) => row.category,
    },

    {
      name: "Action",
      cell: (row: any) => (
        <div className="space-x-2">
          <button
            className="border border-blue-400 bg-blue-400 p-2 text-white rounded-md"
            onClick={() => handleAdd(row)}
          >
            Add
          </button>
          <button
            className="border border-blue-400 bg-blue-400 p-2 text-white rounded-md"
            onClick={() => handlecatedit(row)}
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  const columnsub: any = [
    {
      name: "#",
      selector: (row: RowDatasub, index: number) => index + 1,
    },
    {
      name: "Sub Category",
      selector: (row: RowDatasub) => row.subcategory,
    },

    {
      name: "Action",
      cell: (row: any) => (
        <div className=" space-x-2">
          <button
            className="border border-blue-400 bg-blue-400 p-2 text-white rounded-md"
            onClick={() => handlesubcat(row)}
          >
            Add
          </button>
          <button
            className="border border-blue-400 bg-blue-400 p-2 text-white rounded-md"
            onClick={() => handleEditsubcat(row)}
          >
            Edit
          </button>
          <button
            className="border border-blue-400 bg-blue-400 p-2 text-white rounded-md"
            onClick={() => handleview(row)}
          >
            <Link to="/dashboard/videos">View</Link>
          </button>
        </div>
      ),
    },
  ];

  const handleCategory = () => {
    BE_addCategoryList(dispatch, setcatLoading, catgy);
    BE_getCategoryList(dispatch, setcatLoading);
    setTogglecats(!togglecats);
  };

  const handleAddSubCat = () => {
    BE_addSubCat(dispatch, catid, setcatLoading, subcatgy);
    setTogglecats(!togglecats);
  };

  const handlecatedit = (row: any) => {
    setCatEdit(row.category);
    setEditBox(true);
    setCatId(row.id);
  };

  const handleEditsubcat = (row: any) => {
    setSubCatEdit(row.subcategory);
    setEditBox(true);
    setSubCatId(row.id);
  };

  const handleview = async (row: any) => {
    handleEditsubcat(row);
    // const res = await BE_getVideoDlts(dispatch, catid, subcatid, setcatLoading);
    // setTogglecats(!togglecats);
    // console.log("videos", res);
    // <VideoDlts
    //   catid={catid}
    //   subcatid={subcatid}
    //   load={setcatLoading}
    // ></VideoDlts>;
  };

  useEffect(() => {
    //const res =await BE_getCategoryList(dispatch, setcatLoading);

    const fetchCategories = async () => {
      try {
        const res = await BE_getCategoryList(dispatch, setcatLoading);
        console.log("result", res);
        setFilter(res);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
    //setFilter(res);
  }, [togglecats]);

  useEffect(() => {
    //const res =await BE_getCategoryList(dispatch, setcatLoading);

    const fetchsubCategories = async () => {
      try {
        const res = await BE_getSubCategoryList(dispatch, catid, setcatLoading);
        console.log("subresult", res);
        setFilterSub(res);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchsubCategories();
    //setFilter(res);
  }, [togglecats]);
  const tableHeaderstyle = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "#ccc",
      },
    },
  };

  const handleAdd = async (row: any) => {
    // setModalContent({ title: row.title, notice: row.notice });
    // setmodalNotice(true);
    setCatShow(false);
    setCatId(row.id);
    setTogglecats(!togglecats);
  };
  const handlesubcat = async (row: any) => {
    // setModalContent({ title: row.title, notice: row.notice });
    // setmodalNotice(true);
    setSubCatId(row.id);
    setTogglecats(!togglecats);
    setmodal(true);
  };

  const handlesubmit = (e: any) => {
    e.preventDefault();
    const formData: formDataType = {
      title: title,
      description: description,
      Video_url: url,
    };
    console.log(formData);
    BE_formdata(dispatch, subcatid, catid, formData, setcatLoading);
    // save func
    // BE_saveTask(dispatch, listId, taskData, setSaveLoading);
  };

  const handleCategoryEdit = () => {
    BE_EDITCAT(dispatch, setcatLoading, catid, catEdit);
    setEditBox(false);
    setTogglecats(!togglecats);
  };
  const handleSubCategoryEdit = () => {
    BE_EDITSUBCAT(dispatch, catid, subcatid, subcatEdit, setcatLoading);
    setEditBox(false);
    setTogglecats(!togglecats);
  };
  return (
    <>
      {catshow ? (
        <div className="relative rounded-md bg-white p-5 shadow dark:bg-black">
          <div className="flex  m-auto ">
            {!editBox ? (
              <>
                <Input
                  name="address"
                  type="text"
                  value={catgy}
                  onChange={(e) => setCatgy(e.target.value)}
                />
                <Button
                  text="Add Category"
                  onClick={handleCategory}
                  secondary
                // loading={catLoading}
                />
              </>
            ) : (
              <>
                <Input
                  name="address"
                  type="text"
                  value={catEdit}
                  onChange={(e) => setCatEdit(e.target.value)}
                />
                <Button
                  text="Edit"
                  onClick={handleCategoryEdit}
                  secondary
                // loading={catLoading}
                />
              </>
            )}
          </div>
          <div className="datatables">
            <DataTable
              customStyles={tableHeaderstyle}
              columns={columns}
              data={filter}
              pagination
              fixedHeader
              selectableRowsHighlight
              highlightOnHover
              subHeader
              striped
            />
          </div>
        </div>
      ) : (
        <div className="relative rounded-md bg-white p-5 shadow dark:bg-black">
          <div className="flex m-auto">
            {!editBox ? (
              <>
                <Input
                  name="address"
                  type="text"
                  value={subcatgy}
                  onChange={(e) => setSubCatgy(e.target.value)}
                />
                <Button
                  text="Add Sub Category"
                  onClick={handleAddSubCat}
                  secondary
                // loading={catLoading}
                />
              </>
            ) : (
              <>
                <Input
                  name="address"
                  type="text"
                  value={subcatEdit}
                  onChange={(e) => setSubCatEdit(e.target.value)}
                />
                <Button
                  text="Edit"
                  onClick={handleSubCategoryEdit}
                  secondary
                // loading={catLoading}
                />
              </>
            )}
          </div>
          <div className="datatables">
            <DataTable
              customStyles={tableHeaderstyle}
              columns={columnsub}
              data={filtersub}
              pagination
              fixedHeader
              selectableRowsHighlight
              highlightOnHover
              subHeader
              striped
            />
          </div>
        </div>
      )}

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
                    <h5 className="text-lg font-bold">Video Upload Details</h5>
                    <button
                      onClick={() => setmodal(false)}
                      type="button"
                      className="text-white-dark hover:text-dark"
                    >
                      &times;
                    </button>
                  </div>
                  <div>
                    <form className="flex flex-col  ">
                      <input
                        name="title"
                        type="text"
                        placeholder="Some Text..."
                        className=" border border-1 rounded-md m-2 p-1 border-gray-500"
                        value={title}
                        onChange={(e) => settitle(e.target.value)}
                        required
                      />
                      <input
                        name="description"
                        type="text"
                        onChange={(e) => setdescription(e.target.value)}
                        placeholder="Some Text..."
                        className="border border-1 rounded-md m-2 p-1 border-gray-500"
                        value={description}
                        required
                      />
                      <input
                        type="text"
                        name="video"
                        onChange={(e) => seturl(e.target.value)}
                        placeholder="Some Text..."
                        className="border border-1 rounded-md m-2 p-1 border-gray-500"
                        value={url}
                        required
                      />
                      <button
                        type="submit"
                        onClick={(e: any) => handlesubmit(e)}
                        className="border border-1 border-gray-500 rounded-md p-2 mt-6 mx-2 hover:bg-gray-100"
                      >
                        Submit
                      </button>
                      {/* <Button
                        text="Submit"
                        onClick={(e: any) => handlesubmit(e)}
                        secondary
                      /> */}
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Category;
