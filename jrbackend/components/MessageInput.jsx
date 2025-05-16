import {
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Box,
  Spinner,
  useColorModeValue,
  Fade,
  Text,
  Tooltip,
  Avatar,
  HStack,
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { IoSendSharp } from "react-icons/io5";
import { BsFillImageFill } from "react-icons/bs";
import { FaSmile, FaTimes } from "react-icons/fa";
import { MdGif } from "react-icons/md";
import { BiEditAlt } from "react-icons/bi";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import axios from "axios";
import useShowToast from "../hooks/useShowToast";
import usePreviewImg from "../hooks/usePreviewImg";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import { motion } from "framer-motion";

const GIPHY_API_KEY = "Zw9zakbhpWaYecQahY8R8YErOkxMTHdd";

const MessageInput = ({
  setMessages,
  replyingTo,
  setReplyingTo,
  editingMessage,
  setEditingMessage,
}) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifResults, setGifResults] = useState([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);

  const imageInputRef = useRef(null);
  const textInputRef = useRef(null);

  // Theme colors for consistent styling
  const bgColor = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const iconDefaultColor = useColorModeValue("gray.500", "gray.400");
  const iconActiveColor = useColorModeValue("blue.500", "blue.300");
  const replyBg = useColorModeValue("blue.50", "blue.900");
  const editBg = useColorModeValue("yellow.50", "yellow.900");

  const showToast = useShowToast();
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();

  // Set input content and focus when editing a message
  useEffect(() => {
    if (editingMessage && textInputRef.current) {
      setMessageText(editingMessage.text || "");
      textInputRef.current.focus();
    }
  }, [editingMessage]);

  // Auto-focus input when replying to a message
  useEffect(() => {
    if (replyingTo && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [replyingTo]);

  // Send or edit message handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    if ((!messageText.trim() && !imgUrl) || isSending) return;

    if (!selectedConversation?.userId) {
      showToast("Error", "Please select a conversation first", "error");
      return;
    }

    setIsSending(true);

    try {
      if (editingMessage) {
        // Edit existing message
        const response = await fetch(`/api/messages/${editingMessage._id}/edit`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: messageText.trim() }),
        });

        const result = await response.json();

        if (result.error) {
          showToast("Error", result.error, "error");
          return;
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === editingMessage._id ? { ...msg, text: messageText.trim() } : msg
          )
        );

        showToast("Success", "Message updated successfully", "success");
      } else {
        // Send new message
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: selectedConversation.userId,
            text: messageText.trim(),
            img: imgUrl,
            type: imgUrl?.includes("giphy") ? "gif" : imgUrl ? "image" : "text",
            replyTo: replyingTo?._id || null,
          }),
        });

        const result = await response.json();

        if (result.error) {
          showToast("Error", result.error, "error");
          return;
        }

        setMessages((prev) => [...prev, result]);

        // Update last message preview in conversations list
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv._id === selectedConversation._id
              ? {
                  ...conv,
                  lastMessage: {
                    text: messageText.trim() || "Sent an image",
                    sender: result.sender,
                    createdAt: new Date().toISOString(),
                  },
                }
              : conv
          )
        );
      }

      // Reset input and state after sending
      setMessageText("");
      setImgUrl("");
      setReplyingTo(null);
      setEditingMessage(null);
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  // Fetch GIF results from Giphy API
  const handleGifSearch = async (query) => {
    if (!query.trim()) {
      setGifResults([]);
      return;
    }

    setIsLoadingGifs(true);
    try {
      const { data } = await axios.get("https://api.giphy.com/v1/gifs/search", {
        params: {
          api_key: GIPHY_API_KEY,
          q: query.trim(),
          limit: 8,
          rating: "g",
        },
      });
      setGifResults(data.data);
    } catch {
      showToast("Error", "Failed to load GIFs", "error");
    } finally {
      setIsLoadingGifs(false);
    }
  };

  // Keyboard shortcuts handler for emoji picker and closing popups
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "e") {
      e.preventDefault();
      setShowEmojiPicker((prev) => !prev);
      setShowGifPicker(false);
    }

    if (e.key === "Escape") {
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    }
  };

  return (
    <Box position="relative" width="100%">
      {/* Replying to Message Preview */}
      {replyingTo && (
        <Fade in={!!replyingTo}>
          <HStack
            position="absolute"
            top="-65px"
            bg={replyBg}
            p={3}
            borderRadius="md"
            width="100%"
            boxShadow="sm"
            borderLeft="4px solid"
            borderColor="blue.400"
            spacing={3}
            alignItems="center"
          >
            <Avatar size="xs" src={replyingTo.sender?.profilePic} name={replyingTo.sender?.username} />
            <Box flex="1">
              <Text fontWeight="bold" fontSize="xs" color="blue.600">
                Replying to {replyingTo.sender?.username}
              </Text>
              <Text fontSize="sm" noOfLines={1}>
                {replyingTo.text || (replyingTo.img ? "Image message" : "Message")}
              </Text>
            </Box>
            <IconButton
              icon={<FaTimes />}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              aria-label="Cancel reply"
              onClick={() => setReplyingTo(null)}
            />
          </HStack>
        </Fade>
      )}

      {/* Editing Message Preview */}
      {editingMessage && (
        <Fade in={!!editingMessage}>
          <HStack
            position="absolute"
            top="-65px"
            bg={editBg}
            p={3}
            borderRadius="md"
            width="100%"
            boxShadow="sm"
            borderLeft="4px solid"
            borderColor="yellow.400"
            spacing={3}
            alignItems="center"
          >
            <BiEditAlt size={16} color="orange" />
            <Box flex="1">
              <Text fontWeight="bold" fontSize="xs" color="yellow.700">
                Editing message
              </Text>
              <Text fontSize="sm" noOfLines={1}>
                {editingMessage.text}
              </Text>
            </Box>
            <IconButton
              icon={<FaTimes />}
              size="sm"
              variant="ghost"
              colorScheme="yellow"
              aria-label="Cancel edit"
              onClick={() => setEditingMessage(null)}
            />
          </HStack>
        </Fade>
      )}

      {/* Image Preview */}
      {imgUrl && (
        <Box
          position="absolute"
          bottom="70px"
          right="10px"
          boxShadow="lg"
          borderRadius="md"
          overflow="hidden"
          border="1px solid"
          borderColor={borderColor}
        >
          <IconButton
            icon={<FaTimes />}
            size="xs"
            isRound
            colorScheme="red"
            aria-label="Remove image"
            onClick={() => setImgUrl("")}
            position="absolute"
            top={1}
            right={1}
            zIndex={5}
          />
          <Image
            src={imgUrl}
            alt="Preview"
            maxHeight="150px"
            maxWidth="150px"
            objectFit="contain"
          />
        </Box>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSendMessage}>
        <InputGroup size="md">
          <Input
            ref={textInputRef}
            placeholder="Type your message here..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            bg={inputBg}
            borderColor={borderColor}
            borderWidth="1.5px"
            _focus={{ borderColor: iconActiveColor }}
            paddingRight="140px"
          />
          <InputRightElement width="140px" display="flex" gap={2} pr={2} alignItems="center">
            <Tooltip label="Add Emoji (Ctrl+E)" openDelay={500}>
              <IconButton
                aria-label="Toggle emoji picker"
                icon={<FaSmile />}
                size="sm"
                color={showEmojiPicker ? iconActiveColor : iconDefaultColor}
                onClick={() => {
                  setShowEmojiPicker((prev) => !prev);
                  setShowGifPicker(false);
                }}
                variant="ghost"
              />
            </Tooltip>

            <Tooltip label="Add GIF" openDelay={500}>
              <IconButton
                aria-label="Toggle GIF picker"
                icon={<MdGif />}
                size="sm"
                color={showGifPicker ? iconActiveColor : iconDefaultColor}
                onClick={() => {
                  setShowGifPicker((prev) => !prev);
                  setShowEmojiPicker(false);
                }}
                variant="ghost"
              />
            </Tooltip>

            <Tooltip label="Upload Image" openDelay={500}>
              <IconButton
                aria-label="Upload image"
                icon={<BsFillImageFill />}
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                variant="ghost"
              />
            </Tooltip>

            <IconButton
              type="submit"
              aria-label="Send message"
              icon={isSending ? <Spinner size="sm" /> : <IoSendSharp />}
              size="sm"
              colorScheme="blue"
              isLoading={isSending}
            />
          </InputRightElement>
        </InputGroup>

        {/* Hidden file input for image upload */}
        <input
          type="file"
          ref={imageInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleImageChange}
        />
      </form>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <Box
          position="absolute"
          bottom="55px"
          left={2}
          zIndex={10}
          boxShadow="md"
          borderRadius="md"
          bg={bgColor}
          overflow="hidden"
        >
          <Picker
            data={emojiData}
            onEmojiSelect={(emoji) => setMessageText((prev) => prev + emoji.native)}
            theme={useColorModeValue("light", "dark")}
          />
        </Box>
      )}

      {/* GIF Picker */}
      {showGifPicker && (
        <Box
          position="absolute"
          bottom="55px"
          left={2}
          width="300px"
          maxHeight="300px"
          overflowY="auto"
          bg={bgColor}
          borderRadius="md"
          boxShadow="md"
          p={2}
          zIndex={10}
        >
          <Input
            placeholder="Search GIFs..."
            size="sm"
            mb={2}
            onChange={(e) => handleGifSearch(e.target.value)}
            autoFocus
          />
          {isLoadingGifs ? (
            <Flex justify="center" align="center" height="100px">
              <Spinner />
            </Flex>
          ) : (
            <Flex wrap="wrap" gap={2} justify="center">
              {gifResults.map((gif) => (
                <Image
                  key={gif.id}
                  src={gif.images.fixed_height_small.url}
                  alt={gif.title}
                  cursor="pointer"
                  borderRadius="md"
                  onClick={() => {
                    setImgUrl(gif.images.original.url);
                    setShowGifPicker(false);
                  }}
                  _hover={{ opacity: 0.8 }}
                  maxHeight="80px"
                />
              ))}
            </Flex>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MessageInput;
