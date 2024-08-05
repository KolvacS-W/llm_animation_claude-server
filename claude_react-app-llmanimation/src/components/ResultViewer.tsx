import React, { useEffect, useRef } from 'react';

interface ResultViewerProps {
  code: {
    html: string;
    css: string;
    js: string;
  };
}

const ResultViewer: React.FC<ResultViewerProps> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    renderContent();
  }, [code]);

  const renderContent = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const document = iframe.contentDocument;
      if (document) {
        document.open();
        document.write('<!DOCTYPE html><html lang="en"><head></head><body></body></html>');
        document.close();

        const newDocument = iframe.contentDocument;
        if (newDocument) {
          newDocument.open();
          newDocument.write(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <style>
                  html, body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                  }
                  ${code.css}
                </style>
              </head>
              <body>
                ${code.html}
                <script>
                  (function() {
                    ${code.js}
                  })();
                </script>
              </body>
            </html>
          `);
          newDocument.close();
        }
      }
    }
  };

  const handleDrawClick = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const document = iframe.contentDocument;
      if (document) {
        const currentHTML = document.documentElement.outerHTML;
        console.log('Current Frame Code:', currentHTML);

        const canvas = document.createElement('canvas');
        canvas.width = iframe.clientWidth;
        canvas.height = iframe.clientHeight;
        const context = canvas.getContext('2d');

        if (context) {
          const svg = new Blob([document.documentElement.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svg);

          const image = new Image();
          image.onload = () => {
            context.drawImage(image, 0, 0);
            URL.revokeObjectURL(url);
          };
          image.src = url;
        }
      }

      else{
        console.log('empty document')
      }
    }
  };

  return (
    <div className="result-viewer">
      <iframe key={JSON.stringify(code)} ref={iframeRef} title="Result Viewer" />
      <button onClick={handleDrawClick}>Draw</button>
    </div>
  );
};

export default ResultViewer;
