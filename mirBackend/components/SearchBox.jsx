import { Button, Flex, Input } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import useShowToast from "../hooks/useShowToast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SuggestedUser from "./SuggestedUser";

const SearchBox = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchingUser, setSearchingUser] = useState(false);
  const [searchText, setSearchText] = useState("");
  const showToast = useShowToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch("/api/users/allusers");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setAllUsers(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchAllUsers();
  }, []);

  useEffect(() => {
    // Run every time searchText changes
    if (searchText.trim() === "") {
      setSearchSuggestions([]);
      return;
    }

    const regex = new RegExp(`^${searchText}`, "i");
    const filtered = allUsers.filter((user) =>
      regex.test(user.username)
    ).slice(0, 5);
    setSearchSuggestions(filtered);
  }, [searchText, allUsers]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);

    if (searchText.trim() === "") {
      setSearchingUser(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const searchedUser = await res.json();

      if (searchedUser.error) {
        showToast("Error", searchedUser.error, "error");
        return;
      }

      navigate(`/${searchedUser.username}`);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setSearchingUser(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSearch}>
        <Flex alignItems={"center"} gap={2}>
          <Input
            placeholder="Search for a user"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button size={"sm"} type="submit" isLoading={searchingUser}>
            <SearchIcon />
          </Button>
        </Flex>
      </form>

      {searchSuggestions.length > 0 && (
        <Flex direction={"column"} gap={2} mt={2} px={2}>
          {searchSuggestions.map((user) => (
            <SuggestedUser key={user._id} user={user} />
          ))}
        </Flex>
      )}
    </>
  );
};

export default SearchBox;
