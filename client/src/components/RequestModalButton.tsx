import { useState } from "react";
import { Button } from "@/components/ui/button";

type RequestModalComponent = typeof import("./RequestModal")["RequestModal"];

type RequestModalButtonProps = {
  productId?: number;
  productName?: string;
  className?: string;
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
};

export function RequestModalButton({
  productId,
  productName,
  className,
  label = "Запросить стоимость",
  size = "default",
}: RequestModalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [RequestModal, setRequestModal] = useState<RequestModalComponent | null>(null);

  const handleOpen = async () => {
    if (RequestModal) {
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const module = await import("./RequestModal");
      setRequestModal(() => module.RequestModal);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleOpen}
        disabled={isLoading}
        className={className}
        size={size}
      >
        {isLoading ? "Загрузка..." : label}
      </Button>
      {RequestModal ? (
        <RequestModal
          productId={productId}
          productName={productName}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      ) : null}
    </>
  );
}

