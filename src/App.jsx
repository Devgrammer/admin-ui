import { useState, useEffect } from "react";
import "./App.css";
import { MdDeleteSweep } from "react-icons/md";
import { MdOutlineLayersClear } from "react-icons/md";
import { IoSave } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
} from "react-icons/fa6";
function App() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userEditedName, setUserEditedName] = useState("");
  const [userEditedEmail, setUserEditedEmail] = useState("");
  const [userEditedRole, setUserEditedRole] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetch(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  useEffect(() => {
    if (!searchInput) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((user) => {
      return (
        user.id.toLowerCase().includes(searchInput.toLowerCase()) ||
        user.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        user.email.toLowerCase().includes(searchInput.toLowerCase()) ||
        user.role.toLowerCase().includes(searchInput.toLowerCase())
      );
    });

    setFilteredUsers(filtered);
  }, [searchInput, users]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const renderPageNumbers = pageNumbers.map((number) => (
    <button
      className={`${
        currentPage === number ? "bg-green-400" : "bg-white"
      } text-black font-semibold w-12 p-2 shadow-lg cursor-pointer border-none hover:shadow-none
`}
      key={number}
      onClick={() => handlePageChange(number)}
    >
      {number}
    </button>
  ));

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentUsers = filteredUsers.slice(firstIndex, lastIndex);

  const handleEdit = (id) => {
    const updatedUsers = users.map((user) => {
      if (user.id === id) {
        return { ...user, isEditing: true };
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput.toLowerCase().trim());
  };

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => {
        return (
          user.id.toLowerCase().includes(searchQuery) ||
          user.name.toLowerCase().includes(searchQuery) ||
          user.email.toLowerCase().includes(searchQuery) ||
          user.role.toLowerCase().includes(searchQuery)
        );
      });
      setFilteredUsers(filtered);
    }
  };

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevents default behavior of the Enter key
      handleSearch();
    }
  };

  const handleSave = (id) => {
    const updatedUsers = users.map((user) => {
      if (user.id === id) {
        return {
          ...user,
          isEditing: false,
          name: userEditedName || user.name,
          email: userEditedEmail || user.email,
          role: userEditedRole || user.role,
        };
      }
      return user;
    });
    setUsers(updatedUsers);
    toast.success(`Updates saved successfully!`);
  };

  const handleDelete = (id) => {
    if (id) {
      const updatedUsers = users.filter((user) => user.id !== id);
      setUsers(updatedUsers);
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      const updatedUsers = users.filter(
        (user) => !selectedRows.includes(user.id)
      );
      setUsers(updatedUsers);
      setSelectedRows([]);
      toast.success(`Row deleted successfully!`);
    }
  };

  const handleSelectedDelete = () => {
    let updatedUsers = [...users];
    const remainingUsers = updatedUsers.filter(
      (user) => !selectedRows.includes(user.id)
    );

    setUsers(remainingUsers);
    setSelectedRows([]);
    toast.success(`Selected
        ${selectedRows?.length>1?'Candidates':'Candidate'} deleted successfully!`
    );
  };

  const handleSelectAll = () => {
    const allIds = currentUsers.map((user) => user.id);
    const newSelectedRows =
      selectedRows.length === itemsPerPage
        ? []
        : allIds.filter((id) => !selectedRows.includes(id));
    setSelectedRows(newSelectedRows);
     
  };

  const handleRowCheckboxChange = (id) => {
    const newSelectedRows = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelectedRows);
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
    toast.success(`All selection are removed!`);
  };

  return (
    <div className="App flex flex-col gap-y-8 ">
      <p className="text-5xl font-bold text-gray-600">Admin Dashboard</p>
      <div className="search-bar-wrapper shadow-md w-fit mx-auto box-border focus:outline-2 ">
        <input
          type="text"
          className="bg-white p-4 w-[400px] rounded-md rounded-r-none text-gray-600 focus:border-none focus:outline-none"
          placeholder="Search user, role, emails..."
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
        <button
          className="search-icon bg-white font-semibold text-slate-700 p-4 rounded-l-none hover:bg-blue-300 hover:text-black"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      <div className="btn-group-wrapper flex gap-x-2 justify-end ">
        <button
          className={`delete-selected w-fit flex gap-x-2 items-center ${
            selectedRows.length > 0
              ? "bg-red-300 text-black"
              : "bg-gray-300 text-black"
          } p-2 font-semibold`}
          onClick={handleSelectedDelete}
        >
          Delete Selected <MdDeleteSweep size={22} />
        </button>
        <button
          className={`clear-selected w-fit flex gap-x-2 items-center ${
            selectedRows.length > 0
              ? "bg-red-300 text-black"
              : "bg-gray-300 text-black"
          } p-2 font-semibold`}
          onClick={handleClearSelection}
        >
          Clear Selection
          <MdOutlineLayersClear size={22} />
        </button>
      </div>
      <table className="border-none rounded-xl shadow-md ">
        <thead>
          <tr>
            <th className="text-center">
              <input
                type="checkbox"
                checked={
                  selectedRows.length === currentUsers.length &&
                  currentUsers.length > 0
                }
                onChange={handleSelectAll}
              />
            </th>
            <th className="text-left">ID</th>
            <th className="text-left">Name</th>
            <th className="text-left">Email</th>
            <th className="text-left">Role</th>
            <th className="text-left ">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr
              key={user.id}
              className={`border-b-2 h-14 text-left ${
                selectedRows.includes(user.id) ? "bg-gray-200" : ""
              }`}
            >
              <td className="mx-auto w-12 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(user.id)}
                  className="px-2 bg-transparent border border-gray-500 rounded-md focus:outline-none focus:border-blue-500  focus:border-2"
                  onChange={() => handleRowCheckboxChange(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td className="text-left ">
                {user.isEditing ? (
                  <input
                    type="text"
                    className="px-2 bg-transparent border border-gray-500 rounded-md focus:outline-none focus:border-blue-500  focus:border-2"
                    defaultValue={user.name}
                    onChange={(e) => setUserEditedName(e.target.value)}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td className="text-left">
                {user.isEditing ? (
                  <input
                    type="text"
                    className="px-2 bg-transparent border border-gray-500 rounded-md focus:outline-none focus:border-blue-500  focus:border-2"
                    defaultValue={user.email}
                    onChange={(e) => setUserEditedEmail(e.target.value)}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {user.isEditing ? (
                  <input
                    type="text"
                    className="px-2 bg-transparent border border-gray-500 rounded-md focus:outline-none focus:border-blue-500  focus:border-2"
                    defaultValue={user.role}
                    onChange={(e) => setUserEditedRole(e.target.value)}
                  />
                ) : (
                  user.role
                )}
              </td>
              <td>
                {user.isEditing ? (
                  <button
                    className="save flex"
                    onClick={() => handleSave(user.id)}
                  >
                    <IoSave
                      size={22}
                      title={"Save"}
                      className="text-green-600 hover:text-green-800"
                    />
                  </button>
                ) : (
                  <div div className="flex items-center gap-x-2">
                    <button
                      className="edit"
                      onClick={() => handleEdit(user.id)}
                    >
                      <FaEdit
                        title={"Edit"}
                        size={22}
                        className="text-blue-500 hover:text-blue-800"
                      />
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDelete(user.id)}
                    >
                      <MdDeleteForever
                        size={26}
                        title={"Delete"}
                        className="text-red-500 hover:text-red-800"
                      />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination component */}
      <div className="footer-wrapper flex items-center justify-between w-full">
        <div className="footer text-slate-600 font-semibold">
          {/* Display count of selected rows */}
          <p>{`${selectedRows.length} of ${filteredUsers.length} ${
            selectedRows.length > 0 ? "rows" : "row"
          } selected.`}</p>
        </div>
        <div className="pagination flex gap-x-2 items-center  float-left w-fit">
          <div className="pag-info text-slate-600 font-semibold mr-4">
            {" "}
            {"Page " + currentPage + " of " + totalPages}
          </div>
          <button
            className={`${
              currentPage === 1 ? "bg-gray-400" : "bg-white"
            } text-black font-semibold w-fit p-2 shadow-lg cursor-pointer border-none hover:shadow-none
`}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <FaAnglesLeft size={24} />
          </button>
          <button
            className={`${
              currentPage === 1 ? "bg-gray-400" : "bg-white"
            } text-black font-semibold w-fit p-2 shadow-lg cursor-pointer border-none hover:shadow-none
`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaAngleLeft size={24} />
          </button>
          {renderPageNumbers}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className={`${
              currentPage === totalPages ? "bg-gray-400" : "bg-white"
            } text-black font-semibold w-fit p-2 shadow-lg cursor-pointer border-none hover:shadow-none
`}
            disabled={currentPage === totalPages}
          >
            <FaAngleRight size={24} />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`${
              currentPage === totalPages ? "bg-gray-400" : "bg-white"
            } text-black font-semibold w-fit p-2 shadow-lg cursor-pointer border-none hover:shadow-none
`}
          >
            <FaAnglesRight size={24} />
          </button>
        </div>
        <div>
          <Toaster className='w-max' />
        </div>
      </div>
    </div>
  );
}

export default App;
