// src/components/common/ErrorMessage.jsx
export function ErrorMessage({ message }) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-xl text-red-600">{message}</div>
      </div>
    );
  }