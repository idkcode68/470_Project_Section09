import {
  Flex, Box, FormControl, FormLabel, Input, InputGroup,
  HStack, InputRightElement, Stack, Button, Heading, Text, useColorModeValue, Link
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";

export default function SignupCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [inputs, setInputs] = useState({ name: "", username: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    if (!inputs.name || !inputs.username || !inputs.email || !inputs.password) {
      showToast("Error", "Please fill all required fields", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("user-threads", JSON.stringify(data));
      setUser(data);
    } catch (error) {
      showToast("Error", error.message || "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex align={"center"} justify={"center"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign up
          </Heading>
        </Stack>
        <Box rounded={"lg"} bg={useColorModeValue("white", "gray.800")} boxShadow={"lg"} p={8}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
          >
            <Stack spacing={4}>
              <HStack>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Full name</FormLabel>
                    <Input
                      type="text"
                      name="name"
                      value={inputs.name}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input
                      type="text"
                      name="username"
                      value={inputs.username}
                      onChange={handleChange}
                      autoComplete="username"
                    />
                  </FormControl>
                </Box>
              </HStack>
              <FormControl isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={inputs.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <InputRightElement h={"full"}>
                    <Button
                      variant={"ghost"}
                      onClick={() => setShowPassword((show) => !show)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Stack spacing={10} pt={2}>
                <Button
                  type="submit"
                  size="lg"
                  bg={useColorModeValue("gray.600", "gray.700")}
                  color={"white"}
                  _hover={{ bg: useColorModeValue("gray.700", "gray.800") }}
                  isLoading={isLoading}
                  loadingText="Submitting"
                >
                  Sign up
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align={"center"}>
                  Already a user?{" "}
                  <Link color={"blue.400"} onClick={() => setAuthScreen("login")}>
                    Login
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}
