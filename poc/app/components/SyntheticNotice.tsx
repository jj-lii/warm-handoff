"use client";

import { useEffect, useRef } from "react";

// Shown on every visit (each full page load), in place of per-page "synthetic" tags.
export function SyntheticNotice() {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);
  const close = () => ref.current?.close();
  return (
    <dialog ref={ref} className="modal" aria-labelledby="synthetic-title">
      <div className="modal-head">
        <h2 id="synthetic-title">All data here is synthetic</h2>
        <button type="button" className="modal-x" onClick={close} aria-label="Close">
          ×
        </button>
      </div>
      <p>Every resident, letter, plan and chart fact is invented. Names are basketball players. No real patient information is used.</p>
      <div className="modal-actions">
        <button type="button" className="btn-primary" onClick={close} autoFocus>
          Got it
        </button>
      </div>
    </dialog>
  );
}
