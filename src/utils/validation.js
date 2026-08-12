export function validateField(type, value) {
  const v = value?.toString() || "";
  
  switch (type) {
    case "name":
    case "fullName": {
      if (!v.trim()) return "Name is required.";
      if (v.trim().length < 2) return "Name must be at least 2 characters.";
      if (v.trim().length > 80) return "Name cannot exceed 80 characters.";
      if (!/^[A-Za-z\s]+$/.test(v)) return "Name can only contain letters and spaces.";
      return "";
    }
    case "mobileNumber":
    case "phone": {
      if (!v.trim()) return "Mobile number is required.";
      if (!/^[6-9]/.test(v)) return "Mobile number must start with 6-9.";
      if (!/^\d{10}$/.test(v)) return "Mobile number must be exactly 10 digits.";
      return "";
    }
    case "aadhaar": {
      if (v && !/^\d{12}$/.test(v)) return "Please enter a valid 12-digit Aadhaar number.";
      return "";
    }
    case "pan": {
      if (v && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v)) return "Please enter a valid 10-character PAN number.";
      return "";
    }
    case "gst": {
      if (v && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v)) return "Please enter a valid 15-character GST number.";
      return "";
    }
    case "email": {
      if (!v.trim()) return "Email is required.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(v)) return "Please enter a valid email address.";
      return "";
    }
    case "pincode": {
      if (!v.trim()) return "Pincode is required.";
      if (!/^\d{6}$/.test(v)) return "Pincode must be exactly 6 digits.";
      return "";
    }
    case "ifsc": {
      if (v && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v)) return "Please enter a valid 11-character IFSC code.";
      return "";
    }
    case "accountNumber": {
      if (v && !/^\d{9,18}$/.test(v)) return "Account number must be between 9 to 18 digits.";
      return "";
    }
    case "price": {
      if (v && (isNaN(Number(v)) || Number(v) < 0)) return "Price must be a positive number.";
      if (v && !/^\d+(\.\d{1,2})?$/.test(v)) return "Price can have at most 2 decimal places.";
      return "";
    }
    case "quantity": {
      if (v && (isNaN(Number(v)) || !Number.isInteger(Number(v)) || Number(v) <= 0)) return "Quantity must be a positive integer.";
      return "";
    }
    case "address":
    case "addressLine1":
    case "city":
    case "state": {
      if (!v.trim()) {
        const label = type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1').trim();
        return `${label} is required.`;
      }
      if (v.trim().length > 200) return "Cannot exceed 200 characters.";
      return "";
    }
    case "addressLine2": {
      if (v.trim().length > 200) return "Cannot exceed 200 characters.";
      return "";
    }
    case "description":
    case "message":
    case "question": {
      if (!v.trim()) return "This field is required.";
      if (v.trim().length > 500) return "Cannot exceed 500 characters.";
      return "";
    }
    case "otp": {
      if (!v.trim()) return "OTP is required.";
      if (!/^\d{6}$/.test(v)) return "OTP must be exactly 6 digits.";
      return "";
    }
    case "password": {
      if (!v.trim()) return "Password is required.";
      if (v.length < 6) return "Password must be at least 6 characters.";
      return "";
    }
    default:
      return ""; // No validation if type not matched
  }
}

export function sanitizeInput(type, value) {
  let v = value || "";
  
  // Prevent multiple spaces globally for all inputs
  v = v.replace(/\s{2,}/g, ' ');

  switch (type) {
    case "name":
    case "fullName":
      // Only letters and spaces
      return v.replace(/[^A-Za-z\s]/g, "");
    case "mobileNumber":
    case "phone":
      return v.replace(/\D/g, "").slice(0, 10);
    case "aadhaar":
      return v.replace(/\D/g, "").slice(0, 12);
    case "pan":
      return v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    case "gst":
      return v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    case "pincode":
      return v.replace(/\D/g, "").slice(0, 6);
    case "ifsc":
      return v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    case "accountNumber":
      return v.replace(/\D/g, "").slice(0, 18);
    case "price":
      v = v.replace(/[^0-9.]/g, "");
      const parts = v.split('.');
      if (parts.length > 2) {
        return parts[0] + '.' + parts.slice(1).join('');
      }
      return v;
    case "quantity":
    case "otp":
      return v.replace(/\D/g, "");
    default:
      return v;
  }
}

export function trimInput(value) {
  return value ? value.toString().trim() : "";
}
