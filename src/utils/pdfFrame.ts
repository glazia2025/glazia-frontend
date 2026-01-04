export type PdfFrameHandle = {
  body: HTMLBodyElement;
  cleanup: () => void;
};

export const createPdfFrame = async (html: string): Promise<PdfFrameHandle> => {
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position: fixed; left: -10000px; top: 0; width: 0; height: 0; border: 0; visibility: hidden; pointer-events: none;";
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.parentNode?.removeChild(iframe);
    throw new Error("PDF iframe document is not available.");
  }

  doc.open();
  doc.write(html);
  doc.close();

  await new Promise<void>((resolve) => {
    if (doc.readyState === "complete") {
      resolve();
      return;
    }
    iframe.onload = () => resolve();
  });

  if (!doc.body) {
    iframe.parentNode?.removeChild(iframe);
    throw new Error("PDF iframe body is not available.");
  }

  return {
    body: doc.body,
    cleanup: () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    },
  };
};
