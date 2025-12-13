import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useArcCaffeine } from "./useArcCaffeine";

/**
 * Custom hook for handling user registration form logic
 */
export function useRegisterForm() {
  const { register, loading } = useArcCaffeine();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username) return;

    try {
      await register(username, bio);
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Check console.");
    }
  };

  const resetForm = () => {
    setUsername("");
    setBio("");
  };

  return {
    username,
    setUsername,
    bio,
    setBio,
    loading,
    handleSubmit,
    resetForm,
  };
}
