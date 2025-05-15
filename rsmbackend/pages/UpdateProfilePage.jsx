import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom"; // Use `useNavigate` from `react-router-dom`
import userAtom from "../atoms/userAtom";
import usePreviewImg from "../hooks/usePreviewImg";
import useShowToast from "../hooks/useShowToast";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

export default function UpdateProfilePage() {
  const [user, setUser] = useRecoilState(userAtom);
  const [inputs, setInputs] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    password: "",
  });
  const fileRef = useRef(null);
  const [updating, setUpdating] = useState(false);
  const showToast = useShowToast();
  const { handleImageChange, imgUrl } = usePreviewImg();
  const navigate = useNavigate(); // Use navigate instead of router

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/users/update/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inputs, profilePic: imgUrl }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showToast("Success", "Profile updated successfully", "success");
      setUser(data);
      localStorage.setItem("user-threads", JSON.stringify(data));
      navigate("/profile"); // Navigate instead of using router.push
    } catch (error) {
      showToast("Error", error.message || error, "error");
    } finally {
      setUpdating(false);
    }
  };

  const bgGradient = useColorModeValue(
    "linear(to-r, teal.100, blue.100)",
    "linear(to-r, teal.700, blue.900)"
  );

  const inputBg = useColorModeValue("whiteAlpha.800", "whiteAlpha.100");
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      bgGradient={bgGradient}
      p={4}
    >
      <MotionBox
        as="form"
        onSubmit={handleSubmit}
        bg={cardBg}
        rounded="2xl"
        boxShadow="2xl"
        p={8}
        w={{ base: "full", md: "lg" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <VStack spacing={6} align="stretch">
          <MotionButton
            variant="ghost"
            alignSelf="flex-start"
            onClick={() => navigate(-1)} // Use navigate for going back
            whileHover={{ x: -5 }}
          >
            ← Back
          </MotionButton>

          <Heading textAlign="center" fontSize={{ base: "2xl", sm: "3xl" }}>
            Edit Your Profile
          </Heading>

          <Center>
            <Box
              rounded="full"
              p={1}
              bgGradient={useColorModeValue(
                "linear(to-tr, teal.400, blue.400)",
                "linear(to-tr, teal.200, blue.200)"
              )}
            >
              <Avatar size="2xl" src={imgUrl || user.profilePic} />
            </Box>
          </Center>

          <Button
            variant="outline"
            onClick={() => fileRef.current.click()}
            alignSelf="center"
            rounded="full"
            _hover={{ bg: useColorModeValue("blue.50", "blue.700") }}
          >
            Change Avatar
          </Button>
          <Input type="file" hidden ref={fileRef} onChange={handleImageChange} />

          {[{ label: "Full name", key: "name" }, { label: "User name", key: "username" }, { label: "Email address", key: "email" }, { label: "Bio", key: "bio" }, { label: "Password", key: "password", type: "password" }]
            .map(({ label, key, type }) => (
              <FormControl key={key}>
                <FormLabel>{label}</FormLabel>
                <Input
                  bg={inputBg}
                  placeholder={label}
                  type={type || "text"}
                  value={inputs[key]}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  rounded="lg"
                  boxShadow="inner"
                  _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal" }}
                />
              </FormControl>
            ))}

          <Stack direction={["column", "row"]} spacing={4} pt={4}>
            <MotionButton
              flex={1}
              bg="red.400"
              color="white"
              rounded="full"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(-1)} // Use navigate to go back
              _hover={{ bg: "red.500" }}
            >
              Cancel
            </MotionButton>
            <MotionButton
              type="submit"
              flex={1}
              bg="blue.400"
              color="white"
              rounded="full"
              isLoading={updating}
              whileHover={{ scale: 1.05 }}
              _hover={{ bg: "blue.500" }}
            >
              Save Changes
            </MotionButton>
          </Stack>
        </VStack>
      </MotionBox>
    </Flex>
  );
}
