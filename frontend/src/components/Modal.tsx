"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  children,
  title,
  close,
}: {
  children: ReactNode;
  title: string;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-white p-0 text-foreground shadow-xl backdrop:bg-[#16291e]/35"
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <h2 id="modal-title" className="text-base font-bold">
          {title}
        </h2>
        <button
          aria-label="Cerrar modal"
          className="rounded p-1 text-muted-foreground hover:bg-muted"
          onClick={close}
        >
          <X size={19} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  );
}
