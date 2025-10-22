import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const AgentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: "weak", color: "bg-error" };
    if (password.length < 8) return { strength: "medium", color: "bg-warning" };
    return { strength: "strong", color: "bg-success" };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await apiClient.post("/admin/agents", {
        username: formData.username.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      });

      toast.success("Agent account created successfully!");
      navigate("/login");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("Email already exists")) {
        toast.error("Email already exists. Please try a different email.");
      } else if (errorMessage.includes("Username already exists")) {
        toast.error("Username already exists. Please choose a different username.");
      } else {
        toast.error("Failed to create agent account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="bg-card p-8 rounded-lg shadow-card space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Register as Agent</h1>
            <p className="text-muted-foreground">Join our team of property agents</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
                className={errors.username ? "border-error" : ""}
              />
              {errors.username && <p className="text-sm text-error mt-1">{errors.username}</p>}
            </div>

            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                className={errors.fullName ? "border-error" : ""}
              />
              {errors.fullName && <p className="text-sm text-error mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className={errors.email ? "border-error" : ""}
              />
              {errors.email && <p className="text-sm text-error mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "") })}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={errors.phoneNumber ? "border-error" : ""}
              />
              {errors.phoneNumber && <p className="text-sm text-error mt-1">{errors.phoneNumber}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className={errors.password ? "border-error" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength.color}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength.strength !== "weak" ? passwordStrength.color : "bg-muted"}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength.strength === "strong" ? passwordStrength.color : "bg-muted"}`} />
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    Password strength: {passwordStrength.strength}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-sm text-error mt-1">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  className={errors.confirmPassword ? "border-error" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-error mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
              {isSubmitting ? "Creating Account..." : "Register as Agent"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentRegister;
