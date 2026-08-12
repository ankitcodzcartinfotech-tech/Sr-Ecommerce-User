"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import Button from "../Button";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  description = "Are you sure you want to do this?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "primary",
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-not-allowed">
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "outline" : "primary"}
            onClick={handleConfirm}
            isLoading={isLoading}
            className="cursor-pointer">
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
