"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogStackContext = React.createContext<{
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  totalSteps: number;
}>({
  currentIndex: 0,
  setCurrentIndex: () => {},
  totalSteps: 0,
});

const DialogStack = DialogPrimitive.Root;

const DialogStackTrigger = DialogPrimitive.Trigger;

const DialogStackPortal = DialogPrimitive.Portal;

const DialogStackClose = DialogPrimitive.Close;

const DialogStackOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogStackOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogStackBody = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const childArray = React.Children.toArray(children);
  const totalSteps = childArray.length;

  return (
    <DialogStackContext.Provider
      value={{ currentIndex, setCurrentIndex, totalSteps }}
    >
      <div {...props}>{childArray[currentIndex]}</div>
    </DialogStackContext.Provider>
  );
};

const DialogStackContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogStackPortal>
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogStackPortal>
));
DialogStackContent.displayName = DialogPrimitive.Content.displayName;

const DialogStackHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogStackHeader.displayName = "DialogStackHeader";

const DialogStackFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogStackFooter.displayName = "DialogStackFooter";

const DialogStackTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogStackTitle.displayName = DialogPrimitive.Title.displayName;

const DialogStackDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogStackDescription.displayName = DialogPrimitive.Description.displayName;

const DialogStackNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ onClick, asChild, ...props }, ref) => {
  const { currentIndex, setCurrentIndex, totalSteps } =
    React.useContext(DialogStackContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    onClick?.(e);
  };

  if (asChild) {
    return React.cloneElement(
      props.children as React.ReactElement,
      {
        ref,
        onClick: handleClick,
      }
    );
  }

  return <button ref={ref} onClick={handleClick} {...props} />;
});
DialogStackNext.displayName = "DialogStackNext";

const DialogStackPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ onClick, asChild, ...props }, ref) => {
  const { currentIndex, setCurrentIndex } =
    React.useContext(DialogStackContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    onClick?.(e);
  };

  if (asChild) {
    return React.cloneElement(
      props.children as React.ReactElement,
      {
        ref,
        onClick: handleClick,
      }
    );
  }

  return <button ref={ref} onClick={handleClick} {...props} />;
});
DialogStackPrevious.displayName = "DialogStackPrevious";

export {
  DialogStack,
  DialogStackBody,
  DialogStackClose,
  DialogStackContent,
  DialogStackDescription,
  DialogStackFooter,
  DialogStackHeader,
  DialogStackNext,
  DialogStackOverlay,
  DialogStackPrevious,
  DialogStackTitle,
  DialogStackTrigger,
  DialogStackPortal,
};
