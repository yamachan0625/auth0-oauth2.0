import React from "react";
import { Spinner } from "react-bootstrap";

const Loading = () => {
  return (
    <div className="loading-spinner">
      <div className="text-center">
        <Spinner animation="border" role="status" variant="primary" />
        <div className="mt-2">読み込み中...</div>
      </div>
    </div>
  );
};

export default Loading;