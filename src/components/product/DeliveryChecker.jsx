"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check } from "lucide-react";
import { validatePincode } from "@/Api/AllApi";
import ValidatedInput from "@/components/common/ValidatedInput";
import { validateField } from "@/utils/validation";

export default function DeliveryChecker({ showToast }) {
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [checking, setChecking] = useState(false);
  const [touched, setTouched] = useState(false);

  const checkDelivery = async () => {
    setTouched(true);
    if (validateField("pincode", pincode)) {
      showToast?.("Please enter valid 6-digit pincode");
      return;
    }

    setChecking(true);
    try {
      const response = await validatePincode(pincode);
      
      if (response && response.success) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 4);

        setDeliveryInfo({
          available: true,
          date: deliveryDate.toLocaleDateString("en-IN", {
            weekday: "long",
            month: "short",
            day: "numeric",
          }),
          codAvailable: true,
          city: response.data?.city,
          state: response.data?.state
        });
      } else {
        setDeliveryInfo({ available: false });
      }
    } catch (_error) {
      setDeliveryInfo({ available: false });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="surface-card rounded-[20px] p-5 border border-stone-200">
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={18} className="text-(--gold)" />
        <h4 className="text-sm font-semibold text-(--text)">Check Delivery</h4>
      </div>
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <ValidatedInput
            validationType="pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            onBlur={() => setTouched(true)}
            touched={touched}
            error={touched ? validateField("pincode", pincode) : ""}
            placeholder="Enter Pincode"
            inputClassName="rounded-full h-[44px]"
          />
        </div>
        <button
          onClick={checkDelivery}
          disabled={validateField("pincode", pincode) !== "" || checking}
          className="rounded-full h-[44px] bg-(--gold) px-5 text-sm font-bold text-white transition-all hover:bg-(--text) disabled:opacity-50 cursor-not-allowed"
        >
          {checking ? "..." : "CHECK"}
        </button>
      </div>
      <AnimatePresence>
        {deliveryInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 space-y-2"
          >
            {deliveryInfo.available ? (
              <>
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <Check size={16} className="shrink-0" />
                  <span>Delivery by {deliveryInfo.date}</span>
                </div>
                {deliveryInfo.city && deliveryInfo.state && (
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <MapPin size={16} className="shrink-0 text-stone-400" />
                    <span>Delivering to {deliveryInfo.city}, {deliveryInfo.state}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <Check size={16} className="shrink-0" />
                  <span>Free Shipping</span>
                </div>
                {deliveryInfo.codAvailable && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <Check size={16} className="shrink-0" />
                    <span>Cash on Delivery Available</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm font-medium text-rose-600">
                Delivery not available for this pincode
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
