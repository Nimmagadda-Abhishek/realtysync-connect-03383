import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { InquiryFormData } from "@/types/property";

interface InquiryModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: number;
  propertyTitle: string;
}

export const InquiryModal = ({ open, onClose, propertyId, propertyTitle }: InquiryModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called");

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setIsSubmitting(true);
    console.log("Form validated, submitting");

    const inquiryData = {
      fullName: formData.name.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phone.trim(),
      message: formData.message.trim() || undefined,
      inquiryType: "VIEWING_REQUEST",
      propertyId: propertyId,
      userId: null,
    };
    console.log("Inquiry data:", inquiryData);

    try {
      console.log("Calling apiClient.post");
      await apiClient.post("/inquiries", inquiryData);
      console.log("API call successful");
      toast.success("Inquiry sent successfully! The owner will contact you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
      onClose();
    } catch (error) {
      console.error("API call failed:", error);
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Inquiry</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Get in touch about {propertyTitle}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
              placeholder="10-digit mobile number"
              maxLength={10}
              className={errors.phoneNumber ? "border-error" : ""}
            />
            {errors.phoneNumber && <p className="text-sm text-error mt-1">{errors.phoneNumber}</p>}
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="I'm interested in this property. Please provide more details..."
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Sending..." : "Send Inquiry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
