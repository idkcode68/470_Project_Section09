import { SearchIcon } from "@chakra-ui/icons";
import { Avatar, Box, Button, Flex, Input, Skeleton, SkeletonCircle, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { GiConversation } from "react-icons/gi";
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import Conversation from "../components/Conversation";
import MessageContainer from "../components/MessageContainer";
import { useSocket } from "../context/SocketContext";
import useShowToast from "../hooks/useShowToast";

const ChatPage = () => {
  const [searchingUser, setSearchingUser] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const currentUser = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const { socket, onlineUsers } = useSocket();

  // Fetch conversations and users
  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setConversations(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingConversations(false);
      }
    };

    const fetchAllUsers = async () => {
      try {
        const res = await fetch("/api/users/suggested");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setAllUsers(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingUsers(false);
      }
    };

    getConversations();
    fetchAllUsers();
  }, [showToast, setConversations]);

  // Handle search input changes and suggestions
  const handleInputChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
    if (!text) return setSearchSuggestions([]);

    const regex = new RegExp(text, 'i');
    const filtered = allUsers.filter((u) => regex.test(u.username)).slice(0, 5);
    setSearchSuggestions(filtered);
  };

  // On search submit
  const handleConversationSearch = async (eOrUsername) => {
    let username = typeof eOrUsername === "string" ? eOrUsername : searchText;
    if (typeof eOrUsername !== "string") {
      eOrUsername.preventDefault();
    }
    if (!username) return;
    setSearchingUser(true);
    try {
      const res = await fetch(`/api/users/profile/${username}`);
      const user = await res.json();
      if (user.error) throw new Error(user.error);
      if (user._id === currentUser._id) {
        showToast("Error", "You cannot message yourself", "error");
        return;
      }
      const exists = conversations.find((c) => c.participants[0]._id === user._id);
      if (exists) {
        setSelectedConversation({
          _id: exists._id,
          userId: user._id,
          username: user.username,
          userProfilePic: user.profilePic,
        });
      } else {
        setConversations((prev) => [
          ...prev,
          { mock: true, _id: Date.now(), participants: [{ _id: user._id, username: user.username, profilePic: user.profilePic }], lastMessage: { text: "", sender: "" } },
        ]);
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setSearchingUser(false);
      setSearchSuggestions([]);
    }
  };

    // Handle delete conversation
    const handleDeleteConversation = async (conversationId) => {
      if (!window.confirm("Are you sure you want to delete this chat?")) return;
      try {
        const res = await fetch(`/api/messages/conversations/${conversationId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok) {
          setConversations((prev) =>
            prev.filter((conv) => conv._id !== conversationId)
          );
          showToast("Success", "Chat deleted", "success");
        } else {
          showToast("Error", data.error || "Failed to delete chat", "error");
        }
      } catch (err) {
        showToast("Error", err.message, "error");
      }
    };
  
    // Colors
    const panelBg = useColorModeValue('white', 'gray.800');
    const inputBg = useColorModeValue('gray.100', 'gray.700');
    const suggestionBg = useColorModeValue('white', 'gray.700');

  return (
    <Box position="absolute" top={4} left="50%" transform="translateX(-50%)" w={{ base: '100%', md: '80%', lg: '900px' }} p={4}>
      <Flex gap={6} flexDirection={{ base: 'column', md: 'row' }}>
        {/* Sidebar */}
        <VStack spacing={4} align="stretch" flex={30} bg={panelBg} p={4} borderRadius="xl" boxShadow="md">
          <Text fontSize="lg" fontWeight="bold">Your Conversations</Text>
          <Box as="form" onSubmit={handleConversationSearch}>
            <Flex align="center" gap={2}>
              <Input
                placeholder="Search users..."
                value={searchText}
                onChange={handleInputChange}
                bg={inputBg}
                borderRadius="full"
                _focus={{ boxShadow: 'outline' }}
              />
              <Button
                size="sm"
                borderRadius="full"
                onClick={handleConversationSearch}
                isLoading={searchingUser}
              >
                <SearchIcon />
              </Button>
            </Flex>
          </Box>

          {/* Suggestions */}
          {searchSuggestions.length > 0 && (
            <Box bg={suggestionBg} borderRadius="md" boxShadow="sm" overflow="hidden">
              {searchSuggestions.map((u) => (
                <Flex
                  key={u._id}
                  p={2}
                  align="center"
                  cursor="pointer"
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.600') }}
                  onClick={() => {
                    setSearchText(u.username);
                    handleConversationSearch(u.username);
                  }}
                >
                  <Avatar size="sm" src={u.profilePic || undefined} mr={3} name={u.username} />
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">{u.username}</Text>
                    <Text fontSize="xs" color="gray.500">{u.name}</Text>
                  </Box>
                </Flex>
              ))}
            </Box>
          )}

          {/* Conversations List */}
          <Box flex={1} overflowY="auto" pt={2}>
            {loadingConversations ? (
              [...Array(5)].map((_, i) => (
                <Flex key={i} align="center" gap={3} p={2}>
                  <SkeletonCircle size="10" />
                  <Box flex={1}>
                    <Skeleton h="10px" w="80%" mb={1} />
                    <Skeleton h="8px" w="60%" />
                  </Box>
                </Flex>
              ))
            ) : (
              conversations.map((conv) => (
                <Conversation
                  key={conv._id}
                  conversation={conv}
                  isOnline={onlineUsers.includes(conv.participants[0]._id)}
                  onDelete={() => handleDeleteConversation(conv._id)}
                />
              ))
            )}
          </Box>
        </VStack>

        {/* Message Area */}
        {selectedConversation._id ? (
          <Box flex={70} bg={panelBg} p={4} borderRadius="xl" boxShadow="md" overflow="hidden">
            <MessageContainer />
          </Box>
        ) : (
          <Flex
            flex={70}
            bg={panelBg}
            p={8}
            borderRadius="xl"
            boxShadow="md"
            align="center"
            justify="center"
            flexDir="column"
          >
            <GiConversation size={80} color={useColorModeValue('#A0AEC0', '#4A5568')} />
            <Text mt={4} fontSize="xl" color="gray.500">Select a conversation to start messaging</Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default ChatPage;
