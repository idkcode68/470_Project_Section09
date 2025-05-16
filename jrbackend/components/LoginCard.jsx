import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  useToast,
  Spinner,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import userAtom from "../atoms/userAtom";
import { useForm } from "react-hook-form";

export default function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const setUser = useSetRecoilState(userAtom);
  const toast = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleLogin = async (data) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const response = await res.json();
      if (!res.ok) throw new Error(response.error || "Login failed");

      localStorage.setItem("user-threads", JSON.stringify(response));
      setUser(response);
      toast({
        title: "Welcome back!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Box
        rounded="xl"
        bg={useColorModeValue("white", "gray.700")}
        boxShadow="2xl"
        p={8}
        w="100%"
        maxW="md"
      >
        <Stack spacing={8}>
          <Box textAlign="center">
            <Heading size="xl" fontWeight="extrabold" mb={2}>
              Welcome Back
            </Heading>
            <Text fontSize="lg" color={useColorModeValue("gray.600", "gray.400")}>
              Sign in to continue to Golposphere
            </Text>
          </Box>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(handleLogin)}>
            <Stack spacing={6}>
              <FormControl isInvalid={!!errors.username}>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  autoFocus
                  {...register("username", { required: "Username is required" })}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={loading}
                spinner={<Spinner size="sm" />}
              >
                Sign in
              </Button>
            </Stack>
          </form>

          <Text textAlign="center">
            Don't have an account?{" "}
            <Link
              color="blue.500"
              fontWeight="semibold"
              onClick={() => setAuthScreen("signup")}
              _hover={{ textDecoration: "underline" }}
            >
              Create one
            </Link>
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
}