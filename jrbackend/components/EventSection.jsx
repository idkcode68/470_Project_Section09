import {
  Box,
  Button,
  Input,
  Textarea,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";

const EventSection = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
  });

  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const inputBg = useColorModeValue("gray.50", "gray.600");
  const inputColor = useColorModeValue("black", "white");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location || !form.date) {
      return toast({
        title: "All fields are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Event creation failed");
      }

      toast({
        title: "Event created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setForm({ title: "", description: "", location: "", date: "" });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={4}
      mb={4}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      bg={bgColor}
    >
      <Input
        placeholder="Event Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        mb={2}
        bg={inputBg}
        color={inputColor}
      />
      <Textarea
        placeholder="Event Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        mb={2}
        bg={inputBg}
        color={inputColor}
      />
      <Input
        placeholder="Location"
        name="location"
        value={form.location}
        onChange={handleChange}
        mb={2}
        bg={inputBg}
        color={inputColor}
      />
      <Input
        type="datetime-local"
        name="date"
        value={form.date}
        onChange={handleChange}
        mb={2}
        bg={inputBg}
        color={inputColor}
      />
      <Button colorScheme="blue" onClick={handleSubmit}>
        Create Event
      </Button>
    </Box>
  );
};

export default EventSection;
