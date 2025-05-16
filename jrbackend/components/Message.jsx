import React, { useState } from "react";
import {
  Flex,
  Text,
  IconButton,
  Avatar,
  Box,
  Tooltip,
  HStack,
  useColorModeValue,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Image,
  Input,
  ButtonGroup,
  Button,
  useToast,
  Link,
} from "@chakra-ui/react";
import {
  FaReply,
  FaEdit,
  FaEllipsisH,
  FaRegSmile,
  FaThumbsUp,
  FaThumbsDown,
  FaRegCopy,
  FaRegBookmark,
  FaRegTrashAlt,
  FaCheck,
  FaTimes,
  FaDownload,
} from "react-icons/fa";

const MessageTime = ({ timestamp }) => {
  const timeColor = useColorModeValue("gray.500", "gray.400");
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <Text fontSize="xs" color={timeColor} fontWeight="normal" ml={1}>
      {formattedTime}
    </Text>
  );
};

const ReactionBadge = ({ emoji, count, isSelected, onClick }) => {
  const bgColor = useColorModeValue(
    isSelected ? "blue.100" : "gray.100",
    isSelected ? "blue.700" : "gray.700"
  );
  const textColor = useColorModeValue(
    isSelected ? "blue.700" : "gray.700",
    isSelected ? "blue.200" : "gray.200"
  );
  return (
    <Badge
      display="flex"
      alignItems="center"
      px={2}
      py={1}
      borderRadius="full"
      bg={bgColor}
      color={textColor}
      cursor="pointer"
      _hover={{ opacity: 0.8 }}
      onClick={onClick}
      transition="all 0.2s"
      userSelect="none"
    >
      <Text mr={1}>{emoji}</Text>
      {count > 0 && <Text fontSize="xs">{count}</Text>}
    </Badge>
  );
};

const Message = ({
  message,
  ownMessage,
  onReply,
  onEdit,
  onReact,
  onDelete,
  onBookmark,
}) => {
  const toast = useToast();
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message?.text || "");

  const messageBg = useColorModeValue(
    ownMessage ? "blue.50" : "gray.50",
    ownMessage ? "blue.900" : "gray.700"
  );
  const messageText = useColorModeValue(
    ownMessage ? "blue.800" : "gray.800",
    ownMessage ? "blue.100" : "gray.100"
  );
  const messageBorder = useColorModeValue(
    ownMessage ? "blue.200" : "gray.200",
    ownMessage ? "blue.700" : "gray.600"
  );
  const hoverBg = useColorModeValue(
    ownMessage ? "blue.100" : "gray.100",
    ownMessage ? "blue.800" : "gray.600"
  );

  const reactions = [
    { emoji: "👍", count: message.reactions?.like || 0 },
    { emoji: "👎", count: message.reactions?.dislike || 0 },
    { emoji: "❤️", count: message.reactions?.heart || 0 },
    { emoji: "😄", count: message.reactions?.laugh || 0 },
    { emoji: "😮", count: message.reactions?.wow || 0 },
  ];

  const handleReactionClick = (emoji) => {
    onReact(message._id, emoji);
    setShowReactions(false);
  };

  const handleEditSubmit = () => {
    if (editedText.trim() !== "") {
      onEdit({ ...message, text: editedText });
      setIsEditing(false);
      toast({ title: "Message edited", status: "success", duration: 2000 });
    }
  };

  const handleEditCancel = () => {
    setEditedText(message.text || "");
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(message);
    toast({ title: "Message deleted", status: "info", duration: 2000 });
  };

  const handleCopy = async () => {
    if (message.text) {
      await navigator.clipboard.writeText(message.text);
      toast({ title: "Message copied", status: "success", duration: 2000 });
    }
  };

  const handleBookmark = () => {
    onBookmark?.(message);
    toast({ title: "Message saved", status: "success", duration: 2000 });
  };

  const defaultMessage = {
    senderName: "User",
    timestamp: new Date(),
    status: "delivered",
    ...message,
  };

  return (
    <Flex w="100%" justify={ownMessage ? "flex-end" : "flex-start"} mb={6}>
      <Flex direction="column" maxW="75%" align={ownMessage ? "flex-end" : "flex-start"}>
        <Flex align="center" mb={1} justify={ownMessage ? "flex-end" : "flex-start"} gap={2}>
          {!ownMessage && (
            <Avatar
              src={defaultMessage.senderProfilePic}
              size="sm"
              border="2px solid"
              borderColor={messageBorder}
            />
          )}

          <Box maxW="100%" position="relative">
            <Flex align="baseline" justify={ownMessage ? "flex-end" : "flex-start"} gap={2}>
              <Text fontWeight="medium" fontSize="sm" color={messageText}>
                {defaultMessage.senderName}
              </Text>
              <MessageTime timestamp={defaultMessage.timestamp} />
            </Flex>

            {message.replyTo && (
              <Box
                bg={useColorModeValue("gray.100", "gray.600")}
                borderLeft="4px solid"
                borderColor={messageBorder}
                px={2}
                py={1}
                mt={2}
                borderRadius="md"
              >
                <Text fontSize="xs" color="gray.500">
                  Replying to {message.replyTo.senderName}:
                </Text>
                <Text fontSize="sm" noOfLines={2}>
                  {message.replyTo.text || "[Image]"}
                </Text>
              </Box>
            )}

            <Box
              bg={messageBg}
              p={4}
              borderRadius="lg"
              borderTopLeftRadius={ownMessage ? "lg" : "sm"}
              borderTopRightRadius={ownMessage ? "sm" : "lg"}
              color={messageText}
              boxShadow="sm"
              borderWidth="1px"
              borderColor={messageBorder}
              position="relative"
              _hover={{ boxShadow: "md" }}
              transition="all 0.2s"
              mt={2}
            >
              {isEditing ? (
                <Flex direction="column" gap={2}>
                  <Input
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleEditSubmit();
                      } else if (e.key === "Escape") {
                        handleEditCancel();
                      }
                    }}
                  />
                  <ButtonGroup size="sm" alignSelf="flex-end">
                    <Button leftIcon={<FaCheck />} colorScheme="green" onClick={handleEditSubmit}>
                      Save
                    </Button>
                    <Button leftIcon={<FaTimes />} onClick={handleEditCancel}>
                      Cancel
                    </Button>
                  </ButtonGroup>
                </Flex>
              ) : (
                <>
                  {defaultMessage.imageUrl && (
                    <Box mb={2}>
                      <Image
                        src={defaultMessage.imageUrl}
                        alt="Image"
                        borderRadius="md"
                        maxHeight="300px"
                        objectFit="contain"
                        fallbackSrc="/post3.png"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/post3.png";
                        }}
                      />
                      <Button
                        as={Link}
                        href={defaultMessage.imageUrl}
                        download
                        size="sm"
                        leftIcon={<FaDownload />}
                        variant="outline"
                        colorScheme="blue"
                        isExternal
                        mt={2}
                      >
                        Download Image
                      </Button>
                    </Box>
                  )}
                  {defaultMessage.gifUrl && (
                    <Image
                      src={defaultMessage.gifUrl}
                      alt="GIF"
                      borderRadius="md"
                      maxHeight="300px"
                      objectFit="contain"
                      fallbackSrc="/post3.png"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/post3.png";
                      }}
                      mb={2}
                    />
                  )}
                  {defaultMessage.text && (
                    <Text whiteSpace="pre-wrap" fontSize="md">
                      {defaultMessage.text}
                    </Text>
                  )}
                  {!defaultMessage.text && !defaultMessage.imageUrl && !defaultMessage.gifUrl && (
                    <Text fontSize="sm" color="gray.400" fontStyle="italic">
                      (No content)
                    </Text>
                  )}
                  {ownMessage && (
                    <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                      {defaultMessage.status}
                    </Text>
                  )}
                </>
              )}
            </Box>
          </Box>

          {ownMessage && (
            <Avatar
              src={defaultMessage.senderProfilePic}
              size="sm"
              border="2px solid"
              borderColor={messageBorder}
            />
          )}
        </Flex>

        {!isEditing && (
          <HStack mt={2} spacing={1} justify={ownMessage ? "flex-end" : "flex-start"}>
            <Tooltip label="Reply">
              <IconButton
                icon={<FaReply />}
                size="sm"
                variant="ghost"
                colorScheme={ownMessage ? "blue" : "gray"}
                onClick={() => onReply(message)}
                aria-label="Reply"
              />
            </Tooltip>
            <Tooltip label="React">
              <IconButton
                icon={<FaRegSmile />}
                size="sm"
                variant="ghost"
                onClick={() => setShowReactions(!showReactions)}
                aria-label="React"
              />
            </Tooltip>
            {ownMessage && (
              <Tooltip label="Edit">
                <IconButton
                  icon={<FaEdit />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit"
                />
              </Tooltip>
            )}
            <Menu>
              <Tooltip label="More options">
                <MenuButton
                  as={IconButton}
                  icon={<FaEllipsisH />}
                  size="sm"
                  variant="ghost"
                  aria-label="More options"
                />
              </Tooltip>
              <MenuList minW="150px" shadow="lg" borderColor={messageBorder}>
                <MenuItem icon={<FaRegCopy />} isDisabled={!message.text} onClick={handleCopy}>
                  Copy text
                </MenuItem>
                <MenuItem icon={<FaRegBookmark />} onClick={handleBookmark}>
                  Save message
                </MenuItem>
                <Divider />
                {ownMessage && (
                  <MenuItem icon={<FaRegTrashAlt />} color="red.500" onClick={handleDelete}>
                    Delete
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </HStack>
        )}

        {showReactions && (
          <Box mt={2} display="flex" justifyContent={ownMessage ? "flex-end" : "flex-start"}>
            <Flex
              bg={useColorModeValue("white", "gray.800")}
              boxShadow="md"
              borderRadius="lg"
              p={2}
              borderWidth="1px"
              borderColor={messageBorder}
            >
              <HStack spacing={1}>
                {["👍", "👎", "❤️", "😄", "😮", "👏", "🎉"].map((emoji) => (
                  <Box
                    key={emoji}
                    cursor="pointer"
                    p={2}
                    borderRadius="md"
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleReactionClick(emoji)}
                    transition="all 0.2s"
                    userSelect="none"
                  >
                    <Text fontSize="lg">{emoji}</Text>
                  </Box>
                ))}
              </HStack>
            </Flex>
          </Box>
        )}

        {reactions.some((r) => r.count > 0) && (
          <Flex mt={1} gap={1} justify={ownMessage ? "flex-end" : "flex-start"} flexWrap="wrap">
            {reactions
              .filter((r) => r.count > 0)
              .map(({ emoji, count }) => (
                <ReactionBadge
                  key={emoji}
                  emoji={emoji}
                  count={count}
                  isSelected={message.userReaction === emoji}
                  onClick={() => handleReactionClick(emoji)}
                />
              ))}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default Message;
